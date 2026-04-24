import SOS from './sos.model.js'
import User from '../auth/auth.model.js'
import {
  SOS_STATUS, ESCALATION_LEVEL, ROLES, GEO,
} from '../../shared/constants.js'
import {
  NotFoundError, ConflictError, ForbiddenError,
} from '../../shared/errors.js'
import { toGeoJSONPoint } from '../../utils/geo.utils.js'
import {
  scheduleEscalation, cancelEscalation,
} from '../../queues/escalation.queue.js'
import logger from '../../config/logger.js'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const NEARBY_USER_RADIUS_M     = 500    // users for first aid
const VOLUNTEER_MAX_RADIUS_M   = 5000   // hard cap on volunteer search
const BRANCH_SEARCH_RADIUS_M   = 50000  // how far to look for a branch

// ─── HELPER: valid location check ────────────────────────────────────────────

const hasValidLocation = (user) => {
  const coords = user.location?.coordinates
  return (
    coords &&
    coords.length === 2 &&
    !(coords[0] === 0 && coords[1] === 0)
  )
}

// ─── ROUTING ENGINE ───────────────────────────────────────────────────────────

export const findDispatchTargets = async (coordinates, userId) => {
  const { default: Branch } = await import('../branch/branch.model.js')

  let assignedBranch  = null
  let branchVolunteers = []
  let source          = ESCALATION_LEVEL.GLOBAL

  // ── Step 1: Find which branch owns this location ──────────────────────────
  const branch = await Branch.findOne({
    coverageArea: {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: BRANCH_SEARCH_RADIUS_M,
      },
    },
    isActive: true,
  })

  if (branch) {
    assignedBranch = branch

    // ── Step 2: Branch volunteers within 5km (hard cap) ────────────────────
    // Use min(branch.radiusMeters, 5km) — never exceed 5km
    const searchRadius = Math.min(branch.radiusMeters, VOLUNTEER_MAX_RADIUS_M)

    branchVolunteers = await User.find({
      role:           ROLES.VOLUNTEER,
      branchId:       branch._id,
      branchVerified: true,
      isOnDuty:       true,
      // Exclude volunteers with invalid/unset location
      'location.coordinates': { $exists: true },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: searchRadius,
        },
      },
    }).limit(10)

    logger.info({
      event:          'branch_volunteer_search',
      branchId:       branch._id,
      branchName:     branch.name,
      searchRadiusM:  searchRadius,
      found:          branchVolunteers.length,
    })

    if (branchVolunteers.length > 0) {
      source = ESCALATION_LEVEL.BRANCH
    }
  }

  // ── Step 3: If no branch volunteers found, try nearby verified volunteers ─
  // Still within 5km, but not restricted to a branch
  let nearbyVolunteers = []
  if (branchVolunteers.length === 0) {
    nearbyVolunteers = await User.find({
      role:           ROLES.VOLUNTEER,
      branchVerified: true,
      isOnDuty:       true,
      'location.coordinates': { $exists: true },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: VOLUNTEER_MAX_RADIUS_M,
        },
      },
    }).limit(10)

    if (nearbyVolunteers.length > 0) {
      source = ESCALATION_LEVEL.NEARBY
      logger.info({
        event:  'nearby_volunteer_fallback',
        found:  nearbyVolunteers.length,
      })
    }
  }

  // ── Step 4: Nearby users for first aid (500m) ─────────────────────────────
  // Exclude the victim themselves
  // Exclude volunteers (they get a different alert)
  const nearbyUsers = await User.find({
    role:     ROLES.USER,
    isActive: true,
    _id:      { $ne: userId },
    'location.coordinates': { $exists: true },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: NEARBY_USER_RADIUS_M,
      },
    },
  }).limit(30)

  logger.info({
    event:           'sos_dispatch_targets',
    coordinates,
    branchFound:     !!assignedBranch,
    branchName:      assignedBranch?.name,
    branchVols:      branchVolunteers.length,
    nearbyVols:      nearbyVolunteers.length,
    nearbyUsers:     nearbyUsers.length,
    source,
  })

  return {
    branch:          assignedBranch,
    volunteers:      branchVolunteers.length > 0 ? branchVolunteers : nearbyVolunteers,
    nearbyUsers,
    source,
  }
}

// ─── TRIGGER SOS ─────────────────────────────────────────────────────────────

export const triggerSOS = async ({
  userId, latitude, longitude,
  forSelf, emergencyType, address,
  photoUrl, voiceNoteUrl,
}) => {
  const coordinates = [longitude, latitude]  // GeoJSON [lng, lat]

  // Auto-cancel previous active SOS from this user
  const cancelled = await SOS.updateMany(
    { triggeredBy: userId, status: SOS_STATUS.ACTIVE },
    { status: SOS_STATUS.CANCELLED }
  )

  if (cancelled.modifiedCount > 0) {
    logger.info({ event: 'sos_auto_cancelled', userId, count: cancelled.modifiedCount })
  }

  // Find dispatch targets
  const { branch, volunteers, nearbyUsers, source } =
    await findDispatchTargets(coordinates, userId)

  // Create SOS record
  const sos = await SOS.create({
    triggeredBy:  userId,
    forSelf,
    emergencyType,
    location: {
      type:        'Point',
      coordinates,
      address:     address ?? '',
    },
    photoUrl:     photoUrl  ?? null,
    voiceNoteUrl: voiceNoteUrl ?? null,
    branchId:     branch?._id ?? null,
    escalationLevel:   source,
    escalationHistory: [{
      level:              source,
      volunteersNotified: volunteers.length,
      reason:             'initial_dispatch',
    }],
  })

  // Schedule escalation (fires if no volunteer accepts in 60s)
  await scheduleEscalation(sos._id.toString(), 60)

  logger.info({
    event:              'sos_triggered',
    sosId:              sos._id,
    userId,
    emergencyType,
    branch:             branch?.name ?? 'none',
    source,
    volunteersNotified: volunteers.length,
    nearbyUsers:        nearbyUsers.length,
  })

  return { sos, volunteers, nearbyUsers, source }
}

// ─── ACCEPT SOS ──────────────────────────────────────────────────────────────

export const acceptSOS = async ({ sosId, volunteerId }) => {
  // Atomic — prevents race condition (two volunteers accepting simultaneously)
  const sos = await SOS.findOneAndUpdate(
    { _id: sosId, status: SOS_STATUS.ACTIVE },
    {
      status:     SOS_STATUS.ACCEPTED,
      acceptedBy: volunteerId,
      acceptedAt: new Date(),
    },
    { new: true }
  ).populate('triggeredBy', 'name phone location')

  if (!sos) {
    const exists = await SOS.exists({ _id: sosId })
    if (!exists) throw new NotFoundError('SOS')
    throw new ConflictError('SOS has already been accepted by another volunteer')
  }

  await cancelEscalation(sosId)

  const victim  = sos.triggeredBy
  const sosCoords  = sos.location?.coordinates
  const userCoords = victim.location?.coordinates
  const coords     = (sosCoords && !(sosCoords[0] === 0 && sosCoords[1] === 0))
    ? sosCoords
    : userCoords

  logger.info({ event: 'sos_accepted', sosId, volunteerId, victimId: victim._id })

  return {
    sos,
    victim: {
      id:    victim._id,
      name:  victim.name,
      phone: victim.phone,
      victimLocation: {
        type:        'Point',
        coordinates: coords,
        latitude:    coords?.[1] ?? null,
        longitude:   coords?.[0] ?? null,
      },
    },
  }
}

// ─── ESCALATE SOS ────────────────────────────────────────────────────────────

export const escalateSOS = async (sosId) => {
  const sos = await SOS.findById(sosId)
  if (!sos || sos.status !== SOS_STATUS.ACTIVE) return null

  const levelOrder   = Object.values(ESCALATION_LEVEL)
  const currentIndex = levelOrder.indexOf(sos.escalationLevel)

  if (currentIndex === levelOrder.length - 1) {
    await SOS.findByIdAndUpdate(sosId, { status: SOS_STATUS.ESCALATED })
    logger.warn({ event: 'sos_max_escalation', sosId })
    return { escalated: true, nextLevel: null, volunteers: [] }
  }

  const nextLevel   = levelOrder[currentIndex + 1]
  const coordinates = sos.location.coordinates
  const { volunteers } = await findDispatchTargets(coordinates, sos.triggeredBy)

  await SOS.findByIdAndUpdate(sosId, {
    escalationLevel: nextLevel,
    $push: {
      escalationHistory: {
        level:              nextLevel,
        volunteersNotified: volunteers.length,
        reason:             'timeout',
        timestamp:          new Date(),
      },
    },
  })

  await scheduleEscalation(sosId, 90)

  logger.info({
    event:    'sos_escalated',
    sosId,
    from:     sos.escalationLevel,
    to:       nextLevel,
    found:    volunteers.length,
  })

  return { escalated: true, nextLevel, volunteers }
}

// ─── UPDATE STATUS ───────────────────────────────────────────────────────────

export const updateStatus = async ({ sosId, userId, status }) => {
  const sos = await SOS.findById(sosId)
  if (!sos) throw new NotFoundError('SOS')

  if (sos.triggeredBy.toString() !== userId.toString()) {
    throw new ForbiddenError('You can only update your own SOS')
  }

  const update = { status }
  if (status === SOS_STATUS.RESOLVED) update.resolvedAt = new Date()

  return SOS.findByIdAndUpdate(sosId, update, { new: true })
}

// ─── GET HISTORY ─────────────────────────────────────────────────────────────

export const getHistory = async ({ userId, role, page, limit }) => {
  const query = role === ROLES.VOLUNTEER
    ? { acceptedBy: userId }
    : { triggeredBy: userId }

  const [records, total] = await Promise.all([
    SOS.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('acceptedBy',  'name phone')
      .populate('triggeredBy', 'name phone')
      .lean(),
    SOS.countDocuments(query),
  ])

  return { records, total, page, pages: Math.ceil(total / limit) }
}

// ─── GET ACTIVE LIST ─────────────────────────────────────────────────────────

export const getActiveSOSList = async (branchId = null) => {
  const query = { status: SOS_STATUS.ACTIVE }
  if (branchId) query.branchId = branchId

  return SOS.find(query)
    .sort({ createdAt: -1 })
    .populate('triggeredBy', 'name phone')
    .populate('branchId',    'name code')
    .lean()
}