import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductCard } from '../components/Card'
import api from '../api/axios'

export const HomePage = () => {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/')
        const mapped = res.data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          vendorName: p.vendor_shop,
          description: p.description,
        }))
        setProducts(mapped)
      } catch {
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    let result = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.vendorName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    if (sortOrder === 'price_asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price))
    } else {
      result.sort((a, b) => b.id - a.id)
    }
    
    return result
  }, [searchTerm, products, sortOrder])

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const handleBuyClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  return (
    <div className="min-h-screen bg-white font-sans pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-[40px] md:text-[56px] font-bold text-[#1a1f1d] leading-tight tracking-tight mb-4">
            Discover <span className="text-[#185546]">Products</span>
          </h1>
          <p className="text-[18px] text-gray-500">Find exactly what you're looking for from verified vendors.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-16 max-w-3xl mx-auto">
          <div className="flex gap-3 p-3 bg-[#fafbfb] rounded-[24px] border border-gray-100 shadow-sm focus-within:ring-4 focus-within:ring-[#185546]/10 focus-within:border-[#185546] transition-all">
            <input
              type="text"
              placeholder="Search by product name or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-5 py-3 rounded-xl text-[#1a1f1d] placeholder-gray-400 focus:outline-none bg-transparent font-medium text-[16px]"
            />
            <button
              type="submit"
              className="bg-[#185546] text-white px-8 py-3 rounded-[16px] hover:bg-[#124236] transition-colors font-semibold shadow-sm active:scale-95 text-[15px]"
            >
              Search
            </button>
          </div>
          <div className="flex justify-end mt-4 px-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-5 py-2.5 rounded-xl text-[#1a1f1d] font-semibold border border-gray-100 bg-[#fafbfb] focus:outline-none focus:ring-2 focus:ring-[#185546]/20 transition-all text-[14px] cursor-pointer"
            >
              <option value="newest">Sort by: Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#185546]"></div>
              <p className="text-gray-500 mt-4 font-medium text-[15px]">Loading the latest catalog...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center p-12 border border-gray-100 rounded-[24px] bg-[#fafbfb]">
              <div className="text-5xl mb-4 opacity-50">⚠️</div>
              <p className="text-[#1a1f1d] text-[22px] font-bold mb-2">Wait, something went wrong</p>
              <p className="text-gray-500 text-[15px]">{error}</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onBuyClick={handleBuyClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center p-16 border border-gray-100 rounded-[24px] bg-[#fafbfb] w-full max-w-2xl">
                  <div className="text-6xl mb-6 opacity-30">🔍</div>
                  <p className="text-[#1a1f1d] text-[24px] font-bold mb-2">No products found</p>
                  <p className="text-gray-500 text-[16px]">Try adjusting your search terms or filters.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
