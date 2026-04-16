// export const Button = ({
//   children,
//   variant = 'primary',
//   size = 'md',
//   className = '',
//   disabled = false,
//   fullWidth = false,
//   ...props
// }) => {
//   const baseStyles = 'font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100 shadow-sm'

//   const variants = {
//     primary: 'bg-[#185546] text-white hover:bg-[#124236] disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none',
//     secondary: 'bg-[#ef6b4c] text-white hover:bg-[#d65a3d] disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none',
//     outline: 'border border-[#185546] text-[#185546] hover:bg-[#eef7f4] disabled:border-gray-200 disabled:text-gray-400 disabled:bg-transparent disabled:shadow-none shadow-none',
//     ghost: 'text-gray-500 hover:text-[#185546] hover:bg-gray-50 disabled:text-gray-400 disabled:bg-transparent shadow-none',
//   }

//   const sizes = {
//     sm: 'px-4 py-2.5 text-[13px]',
//     md: 'px-6 py-3 text-[15px]',
//     lg: 'px-8 py-4 text-[16px]',
//   }

//   const widthClass = fullWidth ? 'w-full' : ''

//   return (
//     <button
//       className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
//       disabled={disabled}
//       {...props}
//     >
//       {children}
//     </button>
//   )
// }
/* src/components/Button.jsx */
export const Button = ({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  fullWidth = false,
  ...props
}) => {
  const baseStyles = 'font-medium uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-40 text-[11px] py-5 px-10'

  const variants = {
    // Solid Black - Primary Action
    primary: 'bg-[#111111] text-[#F8F6F0] hover:bg-[#8E7A60] shadow-sm',
    
    // Minimalist Outline
    outline: 'border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F8F6F0]',
    
    // Underlined Link Style
    ghost: 'text-[#111111]/60 hover:text-[#111111] border-b border-transparent hover:border-[#111111] px-0 py-1 rounded-none shadow-none',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}