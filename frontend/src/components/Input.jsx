// export const Input = ({
//   label,
//   error,
//   type = 'text',
//   className = '',
//   ...props
// }) => {
//   return (
//     <div className="w-full">
//       {label && (
//         <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">
//           {label}
//         </label>
//       )}
//       <input
//         type={type}
//         className={`w-full px-4 py-3.5 rounded-xl border border-gray-200 text-[#1a1f1d] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#185546]/10 focus:border-[#185546] transition-all font-medium bg-[#fafbfb] focus:bg-white text-[15px] ${className}`}
//         {...props}
//       />
//       {error && <p className="text-red-500 text-[13px] mt-1 font-medium">{error}</p>}
//     </div>
//   )
// }
/* src/components/Input.jsx */
export const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-[10px] font-bold text-[#111111]/40 uppercase tracking-[0.3em] ml-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full bg-transparent border-b border-[#111111]/10 py-4 px-1 text-[#111111] placeholder:text-[#111111]/20 focus:outline-none focus:border-[#8E7A60] transition-all duration-500 text-[14px] font-medium tracking-wide ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-600 text-[10px] mt-2 font-bold uppercase tracking-widest animate-pulse">
          {error}
        </p>
      )}
    </div>
  )
}

// Minimalist Textarea for larger inputs
export const Textarea = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-[10px] font-bold text-[#111111]/40 uppercase tracking-[0.3em] ml-1">
          {label}
        </label>
      )}
      <textarea
        className={`w-full bg-transparent border-b border-[#111111]/10 py-4 px-1 text-[#111111] placeholder:text-[#111111]/20 focus:outline-none focus:border-[#8E7A60] transition-all duration-500 text-[14px] font-medium tracking-wide resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-red-600 text-[10px] mt-2 font-bold uppercase tracking-widest">{error}</p>}
    </div>
  )
}
