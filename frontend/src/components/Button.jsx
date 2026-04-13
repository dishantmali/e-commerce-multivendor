export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95'

  const variants = {
    primary: 'bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-primary-hover disabled:bg-gray-300 disabled:shadow-none',
    secondary: 'bg-secondary text-white shadow-lg shadow-secondary/30 hover:shadow-secondary/50 disabled:bg-gray-300 disabled:shadow-none',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5 disabled:border-gray-300 disabled:text-gray-300',
    ghost: 'text-primary hover:bg-primary/10 disabled:text-gray-300',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
