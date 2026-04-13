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
        <label className="block text-sm font-bold text-dark mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-5 py-4 rounded-xl border-2 border-gray-100 text-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium bg-gray-50/50 ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
