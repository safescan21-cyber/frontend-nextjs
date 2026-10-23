import LocalPrice from '../../i18n/LocalPrice';
import { useLocale } from '../../i18n/LocaleContext';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from '../../shell/router';
import toast from 'react-hot-toast';
import {
  selectCartItems,
  selectCartTotalPrice,
  selectCartTotalQuantity,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  updateQuantity,
} from '../store/cartSlice';

const CartPage = () => {
  const { t } = useLocale();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotalPrice);
  const totalQuantity = useSelector(selectCartTotalQuantity);

  // ── 🔐 Login guard: same source of truth as the rest of the app (Redux auth.user) ──
  const authUser = useSelector((state) => state.auth?.user);
  const isLoggedIn = !!authUser;
  const authReady = useSelector((state) => state.auth?.ready); // saved login read (SessionRestore.jsx)

  useEffect(() => {
    if (authReady && !isLoggedIn) {
      navigate('/login', { state: { from: '/cart' } });
    }
  }, [authReady, isLoggedIn, navigate]);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [shippingCost] = useState(99);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // ── Welcome toast with total items ──
  useEffect(() => {
    if (cartItems.length > 0) {
      toast.success(`🛒 You have ${totalQuantity} item${totalQuantity > 1 ? 's' : ''} in your cart`);
    }
  }, []);

  // Safe to return early now: every hook above has already run
  if (!isLoggedIn) {
    return null;
  }

  const handleIncreaseQuantity = (productId) => {
    dispatch(increaseQuantity(productId));
  };

  const handleDecreaseQuantity = (productId) => {
    dispatch(decreaseQuantity(productId));
  };

  const handleRemoveItem = (productId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      dispatch(removeFromCart(productId));
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    const newQuantity = parseInt(quantity);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      dispatch(updateQuantity({ id: productId, quantity: newQuantity }));
    }
  };

  const handleApplyCoupon = () => {
    const coupons = {
      'SAVE10': { discount: 0.10, minAmount: 1000 },
      'SAVE20': { discount: 0.20, minAmount: 5000 },
      'FREESHIP': { discount: 0, freeShipping: true },
    };

    const coupon = coupons[couponCode.toUpperCase()];
    if (coupon) {
      if (coupon.minAmount && totalPrice < coupon.minAmount) {
        alert(`Minimum order amount of ₹${coupon.minAmount} required for this coupon`);
        return;
      }
      
      let discountAmount = 0;
      if (coupon.discount) {
        discountAmount = totalPrice * coupon.discount;
      }
      
      setDiscount(discountAmount);
      setAppliedCoupon(couponCode.toUpperCase());
      alert(`Coupon ${couponCode.toUpperCase()} applied successfully!`);
    } else {
      alert('Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  const getSubtotal = () => totalPrice;
  const getTotal = () => {
    let total = getSubtotal() - discount + shippingCost;
    return total > 0 ? total : 0;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gray-50 py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-32 w-32 text-gray-400 mb-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6"
              />
            </svg>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {t("Your Cart is Empty")}
            </h2>
            <p className="text-gray-600 mb-8">
              {t("Looks like you haven't added any items to your cart yet.")}
            </p>
            <Link
              to="/shop"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {t("Continue Shopping")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            {t("Shopping Cart")}
          </h1>
          <p className="text-gray-600">
            You have {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 border-b">
                <div className="col-span-6">{t("Product")}</div>
                <div className="col-span-2 text-center">{t("Price")}</div>
                <div className="col-span-2 text-center">{t("Quantity")}</div>
                <div className="col-span-1 text-center">{t("Total")}</div>
                <div className="col-span-1"></div>
              </div>

              {/* Cart Items */}
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => {
                  const productImage = item.image || 'https://picsum.photos/id/20/400/300';

                  return (
                    <div key={item._id} className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Product Image & Info */}
                        <div className="flex flex-1 gap-4">
                          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={productImage}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://picsum.photos/id/20/400/300';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <Link
                              to={item.kind === 'api' ? `/pharma-api/${item.slug}` : `/shop/${item._id}`}
                              className="text-base md:text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1 capitalize">
                              {item.category?.replace('-', ' ')}
                            </p>
                            {item.kind === 'api' && (
                              <p className="mt-1 text-xs font-medium text-blue-700">
                                Pharma API · ₹{item.price.toLocaleString('en-IN')} per {item.unit} · minimum {item.minQty} {item.unit}
                              </p>
                            )}
                            {item.color && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">{t("Color:")}</span>
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.color.toLowerCase() }}
                                />
                                <span className="text-xs text-gray-600 capitalize">{item.color}</span>
                              </div>
                            )}
                            <div className="md:hidden mt-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm text-gray-500">{t("Price:")} </span>
                                  <span className="font-semibold text-blue-600">
                                    ₹{item.price.toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">{t("Total:")} </span>
                                  <span className="font-semibold text-blue-600">
                                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price - Desktop */}
                        <div className="hidden md:block col-span-2 text-center">
                          <span className="font-medium text-gray-800">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between md:justify-center gap-2">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleDecreaseQuantity(item._id)}
                              className="px-2 md:px-3 py-1 hover:bg-gray-100 transition-colors"
                              aria-label={t("Decrease quantity")}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                              className="w-12 md:w-16 text-center py-1 border-x border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              min={item.minQty || 1}
                              max={item.kind === 'api' ? 100000 : 99}
                              aria-label={item.kind === 'api' ? `Quantity in ${item.unit}` : 'Quantity'}
                            />
                            {item.kind === 'api' && <span className="px-1.5 text-xs text-gray-500">{item.unit}</span>}
                            <button
                              onClick={() => handleIncreaseQuantity(item._id)}
                              className="px-2 md:px-3 py-1 hover:bg-gray-100 transition-colors"
                              aria-label={t("Increase quantity")}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          {/* Remove Button - Mobile */}
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="md:hidden text-red-500 hover:text-red-700 transition-colors p-2"
                            aria-label={t("Remove item")}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Total Price - Desktop */}
                        <div className="hidden md:block col-span-1 text-center">
                          <span className="font-bold text-blue-600">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Remove Button - Desktop */}
                        <div className="hidden md:block col-span-1 text-center">
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label={t("Remove item")}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Actions */}
              <div className="bg-gray-50 px-4 md:px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Link
                    to="/shop"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t("Continue Shopping")}
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your cart?')) {
                        dispatch(clearCart());
                      }
                    }}
                    className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t("Clear Cart")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t("Order Summary")}</h2>
              
              {/* Coupon Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Coupon Code")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t("Enter coupon code")}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                  >
                    {t("Apply")}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-green-600 text-sm mt-2">
                    Coupon {appliedCoupon} applied! You saved ₹{discount.toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalQuantity} items)</span>
                  <span>₹{getSubtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t("Shipping")}</span>
                  <span>₹{shippingCost.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t("Discount")}</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-200">
                  <span>{t("Total")}</span>
                  <span className="text-blue-600">₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right"><LocalPrice inr={getTotal()} /></div>
              </div>

              {/* Checkout Button (already guarded in handleCheckout) */}
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                {t("Proceed to Checkout")}
              </button>
              <Link
                to="/bulk-quote?source=cart"
                className="mt-3 block text-center text-sm font-medium text-amber-700 hover:underline"
              >
                {t("Ordering in bulk? Get a custom quote with volume pricing →")}
              </Link>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center mb-3">{t("Secure Payment Methods")}</p>
                <div className="flex justify-center gap-4">
                  <span className="text-xs text-gray-500">{t("Visa")}</span>
                  <span className="text-xs text-gray-500">{t("Mastercard")}</span>
                  <span className="text-xs text-gray-500">{t("Amex")}</span>
                  <span className="text-xs text-gray-500">{t("Cash on Delivery")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;