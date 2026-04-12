export const API_BASE_URL = import.meta.env.VITE_API_URL    || 'http://localhost:5000'
export const SOCKET_URL   = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const ROLES = Object.freeze({
  USER:         'user',
  VOLUNTEER:    'volunteer',
  BRANCH_ADMIN: 'branch_admin',
  SUPER_ADMIN:  'super_admin',
})

export const SOS_STATUS = Object.freeze({
  ACTIVE:    'active',
  ACCEPTED:  'accepted',
  RESOLVED:  'resolved',
  CANCELLED: 'cancelled',
  ESCALATED: 'escalated',
})

export const EMERGENCY_LABELS = {
  accident:   { label: 'Accident',   emoji: '🚗' },
  cardiac:    { label: 'Cardiac',    emoji: '❤️' },
  snake_bite: { label: 'Snake Bite', emoji: '🐍' },
  rabies:     { label: 'Rabies',     emoji: '🐕' },
  other:      { label: 'Other',      emoji: '🆘' },
}

export const SOCKET_EVENTS = Object.freeze({
  SOS_ALERT:       'sos:alert',
  SOS_ACCEPTED:    'sos:accepted',
  LOCATION_UPDATE: 'location:update',
})