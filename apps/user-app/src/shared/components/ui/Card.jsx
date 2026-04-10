import { motion } from 'framer-motion'

const Card = ({
  children,
  className = '',
  hover     = false,
  padding   = 'md',
  onClick,
}) => {
  const paddings = {
    none: '',
    sm:   'p-3',
    md:   'p-5',
    lg:   'p-6',
    xl:   'p-8',
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2, shadow: 'lg' } : {}}
      className={`
        bg-white rounded-2xl border border-slate-100 shadow-sm
        ${hover ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

export default Card