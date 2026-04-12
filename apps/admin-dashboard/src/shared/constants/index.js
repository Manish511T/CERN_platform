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
  accident:   { label: 'Accident',   emoji: '🚗', color: 'yellow' },
  cardiac:    { label: 'Cardiac',    emoji: '❤️', color: 'red'    },
  snake_bite: { label: 'Snake Bite', emoji: '🐍', color: 'green'  },
  rabies:     { label: 'Rabies',     emoji: '🐕', color: 'purple' },
  other:      { label: 'Other',      emoji: '🆘', color: 'blue'   },
}