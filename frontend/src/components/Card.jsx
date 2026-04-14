export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white border border-gray-100 shadow-sm rounded-[24px] p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const ProductCard = ({ product, onBuyClick }) => {
  return (
    <div className="flex flex-col h-full bg-white border border-gray-100 rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer group">
      <div className="w-full h-56 bg-[#fafbfb] overflow-hidden relative border-b border-gray-50 flex items-center justify-center p-4">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <span className="text-6xl opacity-20">🏷️</span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[20px] font-bold text-[#1a1f1d] leading-tight line-clamp-1">{product.name}</h3>
        </div>
        <p className="text-[13px] text-gray-500 font-medium mb-3">Verified Vendor: <span className="text-[#185546] font-semibold">{product.vendorName}</span></p>
        <p className="text-gray-500 text-[14.5px] mb-6 flex-grow line-clamp-2 leading-relaxed">{product.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-gray-50">
          <span className="text-[24px] font-bold text-[#185546] tracking-tight">₹{parseFloat(product.price).toFixed(2)}</span>
          <button
            onClick={() => onBuyClick(product.id)}
            className="w-full sm:w-auto bg-[#ef6b4c] text-white px-6 py-2.5 rounded-xl hover:bg-[#d65a3d] transition-colors font-semibold shadow-sm active:scale-95 text-[14.5px]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}
