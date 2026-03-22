'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { Search, Scan, ShoppingCart, CreditCard, Trash2, Plus, Minus, LogOut, User, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';


const ReceiptDownloader = dynamic(() => import('./ReceiptDownloader'), { ssr: false });

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CashierPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [completedSaleData, setCompletedSaleData] = useState<any>(null);
  const { data: session, isPending } = useSession();

  // Route protection
  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.replace('/');
      } else if ((session.user as any).status === 'PENDING') {
        router.replace('/account/pending');
      }
    }
  }, [session, isPending, router]);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      alert('Product out of stock');
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        alert('Not enough stock available');
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  // Search by barcode
  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setBarcode('');
    } else {
      alert('Product not found');
    }
  };

  // Update quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        if (newQuantity > item.product.quantity) {
          alert('Not enough stock available');
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.125; // 12.5% tax
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length > 0) {
      setCompletedSaleData(null);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = async () => {
    try {
      // Create sale in database
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          subtotal,
          tax,
          total,
          paymentMethod,
        }),
      });

      if (res.ok) {
        // Cache the sale configuration to generate the receipt PDF visually
        setCompletedSaleData({
          items: [...cart],
          subtotal,
          tax,
          total,
          paymentMethod,
          date: new Date().toLocaleString()
        });
        
        // Empty ongoing cart but leave Modal open for Receipt Download Stage
        setCart([]);
        
        // Refresh products to update quantities
        const productsRes = await fetch('/api/products');
        if (productsRes.ok) {
          setProducts(await productsRes.json());
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment');
    }
  };



  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });
  };

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6" />
          <h1 className="text-xl font-bold">Yenpoobi POS - Cashier</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-lg">
            <User className="w-4 h-4" />
            <span>Cashier Mode</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Search and Barcode */}
          <div className="mb-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Barcode Scanner */}
            <form onSubmit={handleBarcodeSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or enter barcode..."
                  className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Add
              </button>
            </form>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.quantity <= 0}
                    className="bg-card border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate mb-1 font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-primary">GH₵ {product.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Stock: {product.quantity}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="w-105 bg-card border-l border-border flex flex-col">
          {/* Cart Header */}
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold text-lg">Current Order</h2>
            <p className="text-sm text-muted-foreground">{cart.length} item(s)</p>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Cart is empty</p>
                <p className="text-sm text-muted-foreground">Add products to start a sale</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="bg-background border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <h4 className="truncate font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">GH₵ {item.product.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-semibold">GH₵ {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-t border-border px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>GH₵ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (12.5%)</span>
              <span>GH₵ {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-primary text-lg">GH₵ {total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              <CreditCard className="w-5 h-5" />
              <span>Checkout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg w-96">
            {!completedSaleData ? (
              <>
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-xl font-bold">Payment Method</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'mobile')}
                      />
                      <span className="font-medium">Cash</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'mobile')}
                      />
                      <span className="font-medium">Card</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary">
                      <input
                        type="radio"
                        name="payment"
                        value="mobile"
                        checked={paymentMethod === 'mobile'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'mobile')}
                      />
                      <span className="font-medium">Mobile Money</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2 font-semibold">Total Amount</p>
                    <p className="text-3xl font-bold text-primary">GH₵ {total.toFixed(2)}</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-2 px-4 border border-border rounded-lg hover:bg-secondary transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePaymentComplete}
                      className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-semibold"
                    >
                      Complete Payment
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
                  <p className="text-muted-foreground font-medium">The transaction has been safely recorded in the live database.</p>
                </div>
                <ReceiptDownloader 
                  completedSaleData={completedSaleData} 
                  onDone={() => setShowPaymentModal(false)} 
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

 
