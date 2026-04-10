import { motion } from 'framer-motion'

const variants = {
  primary: `
    bg-blue-600 hover:bg-blue-700 active:bg-blue-800
    text-white shadow-sm hover:shadow-md
    disabled:bg-blue-300 disabled:cursor-not-allowed
  `,
  secondary: `
    bg-white hover:bg-slate-50 active:bg-slate-100
    text-slate-700 border border-slate-200
    shadow-sm hover:shadow-md
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  danger: `
    bg-red-600 hover:bg-red-700 active:bg-red-800
    text-white shadow-sm hover:shadow-md
    disabled:bg-red-300 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent hover:bg-slate-100 active:bg-slate-200
    text-slate-600
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  success: `
    bg-green-600 hover:bg-green-700 active:bg-green-800
    text-white shadow-sm
    disabled:bg-green-300 disabled:cursor-not-allowed
  `,
}

const sizes = {
  sm:   'px-3 py-1.5 text-sm rounded-lg',
  md:   'px-4 py-2.5 text-sm rounded-xl',
  lg:   'px-6 py-3 text-base rounded-xl',
  xl:   'px-8 py-4 text-lg rounded-2xl',
  full: 'w-full px-4 py-3 text-base rounded-xl',
}

const Button = ({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  onClick,
  type     = 'button',
  className = '',
  icon,
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent
                         rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}

export default Button