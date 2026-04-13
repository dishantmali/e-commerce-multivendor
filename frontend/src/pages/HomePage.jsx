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
        // Map backend fields to match what ProductCard expects
        const mapped = res.data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image, // full URL from backend
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
    <div className="min-h-screen bg-light pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-display text-dark mb-4">Discover <span className="gradient-text">Products</span></h1>
          <p className="text-xl text-gray-500 font-light">Find exactly what you're looking for.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-16 max-w-2xl mx-auto">
          <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <input
              type="text"
              placeholder="Search by name or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-6 py-4 rounded-xl text-dark placeholder-gray-400 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="bg-dark text-white px-8 py-4 rounded-xl hover:bg-primary transition-colors font-semibold shadow-md active:scale-95"
            >
              Search
            </button>
          </div>
          <div className="flex justify-end mt-4 px-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 rounded-xl text-dark font-medium border border-gray-200 bg-white focus:outline-none focus:border-primary shadow-sm"
            >
              <option value="newest">Sort by: Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-gray-500 mt-4 font-medium">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="text-6xl mb-6 opacity-80">⚠️</div>
              <p className="text-dark font-display text-2xl font-bold mb-2">Something went wrong</p>
              <p className="text-gray-500">{error}</p>
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
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className="text-8xl mb-6 opacity-80">📦</div>
                  <p className="text-dark font-display text-2xl font-bold mb-2">No products found</p>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
