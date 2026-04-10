const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-4',
  xl: 'w-12 h-12 border-4',
}

const colors = {
  blue:  'border-blue-500',
  white: 'border-white',
  gray:  'border-slate-400',
}

const Spinner = ({ size = 'md', color = 'blue', className = '' }) => {
  return (
    <div className={`
      ${sizes[size]} ${colors[color]}
      border-t-transparent rounded-full animate-spin
      ${className}
    `} />
  )
}

export default Spinner