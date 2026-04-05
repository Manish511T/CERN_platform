import SOS from './sos.model.js'
import User from '../auth/auth.model.js'
import {
  SOS_STATUS,
  ESCALATION_LEVEL,
  ROLES,
  GEO,
} from '../../shared/constants.js'
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../../shared/errors.js'
import { toGeoJSONPoint } from '../../utils/geo.utils.js'
import { scheduleEscalation, cancelEscalation } from '../../queues/escalation.queue.js'
import logger from '../../config/logger.js'

// ─── ROUTING ENGINE ───────────────────────────────────────────────────────────
// Cascade: branch volunteers → nearby volunteers → global volunteers

const findVolunteersForLocation = async (coordinates) => {
  // Step 1: find the branch that owns this location
  // We import Branch lazily here to avoid circular dependency at startup
  const { default: Branch } = await import('../branch/branch.model.js')

  const branch = await Branch.findOne({
    coverageArea: {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: GEO.BRANCH_SEARCH_RADIUS_M,
      },
    },
    isActive: true,
  })

  if (branch) {
    // Step 2: branch volunteers first (highest priority)
    const branchVolunteers = await User.find({
      role: ROLES.VOLUNTEER,
      branchId: branch._id,
      branchVerified: true,
      isOnDuty: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: branch.radiusMeters,
        },
      },
    }).limit(10)

    if (branchVolunteers.length > 0) {
      return {
        volunteers: branchVolunteers,
        source: ESCALATION_LEVEL.BRANCH,
        branch,
      }
    }
  }

  // Step 3: any on-duty volunteer within 5km
  const nearbyVolunteers = await User.find({
    role: ROLES.VOLUNTEER,
    isOnDuty: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: GEO.VOLUNTEER_SEARCH_RADIUS_M,
      },
    },
  }).limit(10)

  if (nearbyVolunteers.length > 0) {
    return {
      volunteers: nearbyVolunteers,
      source: ESCALATION_LEVEL.NEARBY,
      branch: null,
    }
  }

  // Step 4: global fallback — all on-duty volunteers
  const globalVolunteers = await User.find({
    role: ROLES.VOLUNTEER,
    isOnDuty: true,
  }).limit(5)

  return {
    volunteers: globalVolunteers,
    source: ESCALATION_LEVEL.GLOBAL,
    branch: null,
  }
}

// ─── TRIGGER SOS ─────────────────────────────────────────────────────────────

export const triggerSOS = async ({
  userId,
  latitude,
  longitude,
  forSelf,
  emergencyType,
  address,
  photoUrl,
  voiceNoteUrl,
}) => {
  const coordinates = [longitude, latitude] // GeoJSON: [lng, lat]

  // Auto-cancel any previous active SOS from this user
  const cancelled = await SOS.updateMany(
    { triggeredBy: userId, status: SOS_STATUS.ACTIVE },
    { status: SOS_STATUS.CANCELLED }
  )

  if (cancelled.modifiedCount > 0) {
    logger.info({
      event: 'sos_auto_cancelled',
      userId,
      count: cancelled.modifiedCount,
    })
  }

  // Find volunteers using cascade logic
  const { volunteers, source, branch } = await findVolunteersForLocation(coordinates)

  // Find nearby non-volunteer users to alert as bystanders
  const nearbyUsers = await User.find({
    role: ROLES.USER,
    _id: { $ne: userId },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: GEO.USER_ALERT_RADIUS_M,
      },
    },
  }).limit(20)

  // Create SOS record
  const sos = await SOS.create({
    triggeredBy: userId,
    forSelf,
    emergencyType,
    location: {
      type: 'Point',
      coordinates,
      address: address ?? '',
    },
    photoUrl:     photoUrl ?? null,
    voiceNoteUrl: voiceNoteUrl ?? null,
    branchId:     branch?._id ?? null,
    escalationLevel: source,
    escalationHistory: [
      {
        level: source,
        volunteersNotified: volunteers.length,
        reason: 'initial_dispatch',
      },
    ],
  })

  // Schedule escalation — fires in 60s if no volunteer accepts
  await scheduleEscalation(sos._id.toString(), 60)

  logger.info({
    event: 'sos_triggered',
    sosId: sos._id,
    userId,
    source,
    volunteersNotified: volunteers.length,
    nearbyUsers: nearbyUsers.length,
  })

  return { sos, volunteers, nearbyUsers, source }
}

// ─── ACCEPT SOS ──────────────────────────────────────────────────────────────

export const acceptSOS = async ({ sosId, volunteerId }) => {
  // Atomic check-and-set: prevents two volunteers accepting simultaneously
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
    // Could be not found OR already accepted — check which
    const exists = await SOS.exists({ _id: sosId })
    if (!exists) throw new NotFoundError('SOS')
    throw new ConflictError('SOS has already been accepted')
  }

  // Cancel the escalation job — volunteer responded in time
  await cancelEscalation(sosId)

  const victim = sos.triggeredBy

  logger.info({ event: 'sos_accepted', sosId, volunteerId, victimId: victim._id })

  return {
    sos,
    victim: {
      id:       victim._id,
      name:     victim.name,
      phone:    victim.phone,
      location: victim.location,
    },
  }
}

// ─── ESCALATE SOS ────────────────────────────────────────────────────────────
// Called by BullMQ worker when timeout fires

export const escalateSOS = async (sosId) => {
  const sos = await SOS.findById(sosId)

  // Already handled — stale job
  if (!sos || sos.status !== SOS_STATUS.ACTIVE) return null

  const levelOrder = Object.values(ESCALATION_LEVEL)
  const currentIndex = levelOrder.indexOf(sos.escalationLevel)

  // Already at max level
  if (currentIndex === levelOrder.length - 1) {
    await SOS.findByIdAndUpdate(sosId, { status: SOS_STATUS.ESCALATED })
    logger.warn({ event: 'sos_max_escalation', sosId })
    return { escalated: true, nextLevel: null, volunteers: [] }
  }

  const nextLevel = levelOrder[currentIndex + 1]
  const { volunteers } = await findVolunteersForLocation(sos.location.coordinates)

  await SOS.findByIdAndUpdate(sosId, {
    escalationLevel: nextLevel,
    $push: {
      escalationHistory: {
        level: nextLevel,
        volunteersNotified: volunteers.length,
        reason: 'timeout',
        timestamp: new Date(),
      },
    },
  })

  // Reschedule for next level
  await scheduleEscalation(sosId, 90)

  logger.info({
    event: 'sos_escalated',
    sosId,
    from: sos.escalationLevel,
    to: nextLevel,
    volunteersNotified: volunteers.length,
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
  const query =
    role === ROLES.VOLUNTEER
      ? { acceptedBy: userId }
      : { triggeredBy: userId }

  const [records, total] = await Promise.all([
    SOS.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('acceptedBy', 'name phone')
      .populate('triggeredBy', 'name phone')
      .lean(),
    SOS.countDocuments(query),
  ])

  return {
    records,
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

// ─── GET ACTIVE (Admin use) ───────────────────────────────────────────────────

export const getActiveSOSList = async () => {
  return SOS.find({ status: SOS_STATUS.ACTIVE })
    .sort({ createdAt: -1 })
    .populate('triggeredBy', 'name phone')
    .populate('branchId', 'name')
    .lean()
}