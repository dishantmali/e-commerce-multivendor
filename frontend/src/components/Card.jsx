export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`card-glass rounded-2xl p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const ProductCard = ({ product, onBuyClick }) => {
  return (
    <Card className="flex flex-col h-full cursor-pointer card-hover border border-gray-100 overflow-hidden !p-0">
      <div className="w-full h-56 bg-gray-100 overflow-hidden relative group">
        <img
          src={product.image || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-dark font-display leading-tight">{product.name}</h3>
        </div>
        <p className="text-sm text-primary font-medium mb-3">By {product.vendorName}</p>
        <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
          <span className="text-2xl font-black text-dark tracking-tight">₹{product.price}</span>
          <button
            onClick={() => onBuyClick(product.id)}
            className="w-full sm:w-auto bg-dark text-white px-5 py-2.5 rounded-xl hover:bg-primary transition-colors font-semibold shadow-md active:scale-95 text-center"
          >
            Buy Now
          </button>
        </div>
      </div>
    </Card>
  )
}
