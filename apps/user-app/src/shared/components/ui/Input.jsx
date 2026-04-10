import { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  rightElement,
  className = '',
  required,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center
                          pointer-events-none text-slate-400">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          className={`
            w-full rounded-xl border bg-white px-4 py-2.5 text-sm
            text-slate-900 placeholder-slate-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-slate-200 hover:border-slate-300'
            }
            ${icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input