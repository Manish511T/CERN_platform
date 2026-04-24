export const ROLES = Object.freeze({
    USER: 'user',
    VOLUNTEER: 'volunteer',
    BRANCH_ADMIN: 'branch_admin',
    SUPER_ADMIN: 'super_admin',
});

export const SOS_STATUS = Object.freeze({
  ACTIVE: 'active',
  ACCEPTED: 'accepted',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
  ESCALATED: 'escalated',
})


export const ESCALATION_LEVEL = Object.freeze({
  BRANCH: 'branch',
  NEARBY: 'nearby',
  GLOBAL: 'global',
  AUTHORITIES: 'authorities',
})


export const EMERGENCY_TYPE = Object.freeze({
  ACCIDENT: 'accident',
  CARDIAC: 'cardiac',
  SNAKE_BITE: 'snake_bite',
  RABIES: 'rabies',
  OTHER: 'other',
})



export const SOCKET_EVENTS = Object.freeze({
  // Client → Server
  VOLUNTEER_LOCATION: 'volunteer:location',

  // Server → Client
  SOS_ALERT:               'sos:alert',
  SOS_ACCEPTED:            'sos:accepted',
  SOS_ESCALATED:           'sos:escalated',
  SOS_VOLUNTEER_ASSIGNED:  'sos:volunteer_assigned',  // ← new
  VOLUNTEER_OFFLINE:       'volunteer:offline',
  LOCATION_UPDATE:         'location:update',
})


export const GEO = Object.freeze({
  BRANCH_SEARCH_RADIUS_M: 50_000,
  VOLUNTEER_SEARCH_RADIUS_M: 5_000,
  USER_ALERT_RADIUS_M: 500,
})