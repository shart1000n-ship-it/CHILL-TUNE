import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  rating: number;
  reviews: number;
  sold: number;
  tags: string[];
  isNew?: boolean;
  isHot?: boolean;
  discount?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest'>('popular');

  const categories = [
    { id: 'all', name: 'All', icon: '🛍️' },
    { id: 'fashion', name: 'Fashion', icon: '👗' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'home', name: 'Home & Garden', icon: '🏠' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'toys', name: 'Toys & Games', icon: '🎮' },
  ];

  useEffect(() => {
    // Mock products data
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium sound quality with noise cancellation',
        price: 89.99,
        originalPrice: 129.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
        category: 'electronics',
        seller: {
          id: '1',
          name: 'TechStore',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techstore',
          rating: 4.8,
        },
        rating: 4.7,
        reviews: 1247,
        sold: 8923,
        tags: ['wireless', 'bluetooth', 'noise-cancelling'],
        isHot: true,
        discount: 31,
      },
      {
        id: '2',
        name: 'Vintage Denim Jacket',
        description: 'Classic style with modern comfort',
        price: 45.99,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
        category: 'fashion',
        seller: {
          id: '2',
          name: 'VintageVibes',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vintagevibes',
          rating: 4.9,
        },
        rating: 4.8,
        reviews: 892,
        sold: 3456,
        tags: ['vintage', 'denim', 'jacket'],
        isNew: true,
      },
      {
        id: '3',
        name: 'Smart Home Security Camera',
        description: '1080p HD with night vision and motion detection',
        price: 129.99,
        originalPrice: 199.99,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
        category: 'electronics',
        seller: {
          id: '3',
          name: 'SmartHome',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=smarthome',
          rating: 4.6,
        },
        rating: 4.5,
        reviews: 567,
        sold: 2341,
        tags: ['security', 'camera', 'smart-home'],
        discount: 35,
      },
      {
        id: '4',
        name: 'Organic Face Serum',
        description: 'Natural ingredients for glowing skin',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
        category: 'beauty',
        seller: {
          id: '4',
          name: 'NaturalGlow',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=naturalglow',
          rating: 4.7,
        },
        rating: 4.6,
        reviews: 1234,
        sold: 5678,
        tags: ['organic', 'skincare', 'serum'],
        isHot: true,
      },
      {
        id: '5',
        name: 'Yoga Mat Premium',
        description: 'Non-slip, eco-friendly yoga mat',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop',
        category: 'sports',
        seller: {
          id: '5',
          name: 'FitLife',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitlife',
          rating: 4.8,
        },
        rating: 4.7,
        reviews: 789,
        sold: 3456,
        tags: ['yoga', 'fitness', 'eco-friendly'],
      },
      {
        id: '6',
        name: 'Modern Coffee Table',
        description: 'Minimalist design with storage',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
        category: 'home',
        seller: {
          id: '6',
          name: 'ModernLiving',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=modernliving',
          rating: 4.9,
        },
        rating: 4.8,
        reviews: 456,
        sold: 1234,
        tags: ['furniture', 'modern', 'storage'],
        isNew: true,
      },
    ];

    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered = [...filtered].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'popular':
      default:
        filtered = [...filtered].sort((a, b) => b.sold - a.sold);
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortBy]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🛍️</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Star Shop</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute right-3 top-2.5 text-white/60">🔍</span>
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🛒 Cart
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card hover:scale-105 transition-transform duration-300 group">
              {/* Product Image */}
              <div className="relative mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex space-x-2">
                  {product.isNew && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
                  )}
                  {product.isHot && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">HOT</span>
                  )}
                  {product.discount && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">-{product.discount}%</span>
                  )}
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={() => addToCart(product)}
                  className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Add to cart"
                >
                  🛒
                </button>
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-white text-lg line-clamp-2">{product.name}</h3>
                <p className="text-white/70 text-sm line-clamp-2">{product.description}</p>
                
                {/* Price */}
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-white">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-white/60 line-through">${product.originalPrice}</span>
                  )}
                </div>

                {/* Seller Info */}
                <div className="flex items-center space-x-2">
                  <img
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-white/60 text-sm">{product.seller.name}</span>
                  <span className="text-yellow-400 text-sm">⭐ {product.seller.rating}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>⭐ {product.rating} ({product.reviews})</span>
                  <span>Sold: {product.sold}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-white/60">Try adjusting your search or category filters</p>
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="absolute right-0 top-0 h-full w-96 bg-gray-900 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-white/60">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">{item.product.name}</h4>
                          <p className="text-white/60 text-sm">${item.product.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20"
                          >
                            -
                          </button>
                          <span className="text-white w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-white font-bold text-xl">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors">
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
