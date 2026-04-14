export const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-4 py-3.5 rounded-xl border border-gray-200 text-[#1a1f1d] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#185546]/10 focus:border-[#185546] transition-all font-medium bg-[#fafbfb] focus:bg-white text-[15px] ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-[13px] mt-1 font-medium">{error}</p>}
    </div>
  )
}
