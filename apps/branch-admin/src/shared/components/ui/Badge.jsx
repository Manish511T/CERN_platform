const variants = {
  teal:   'bg-teal-50 text-teal-700 border border-teal-100',
  green:  'bg-green-50 text-green-700 border border-green-100',
  red:    'bg-red-50 text-red-700 border border-red-100',
  yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  blue:   'bg-blue-50 text-blue-700 border border-blue-100',
  gray:   'bg-slate-100 text-slate-600',
}

const Badge = ({ children, variant = 'teal', dot = false }) => (
  <span className={`
    inline-flex items-center gap-1.5 px-2.5 py-0.5
    text-xs font-medium rounded-full ${variants[variant]}
  `}>
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
    {children}
  </span>
)

export default Badge