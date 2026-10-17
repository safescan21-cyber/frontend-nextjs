// store/cartSlice.js
// Lines are machines, or pharma APIs ({ kind: 'api', unit: 'kg', minQty }):
// an API line never goes below its minimum order quantity.
import { createSlice } from '@reduxjs/toolkit';

const minOf = (item) => Math.max(1, Number(item?.minQty) || 1);

const initialState = {
  products: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existing = state.products.find((item) => item._id === newItem._id);
      if (existing) {
        existing.quantity = Math.max(minOf(existing), existing.quantity + (newItem.quantity || 1));
      } else {
        state.products.push({ ...newItem, quantity: Math.max(minOf(newItem), newItem.quantity || 1) });
      }
    },
    increaseQuantity: (state, action) => {
      const item = state.products.find((p) => p._id === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQuantity: (state, action) => {
      const item = state.products.find((p) => p._id === action.payload);
      if (!item) return;
      if (item.quantity > minOf(item)) {
        item.quantity -= 1;
      } else if (item.kind === 'api') {
        // stays at the minimum order; use Remove to take it out
      } else {
        state.products = state.products.filter((p) => p._id !== action.payload);
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.products.find((p) => p._id === id);
      if (!item) return;
      if (quantity > 0) {
        item.quantity = Math.max(minOf(item), quantity);
      } else {
        state.products = state.products.filter((p) => p._id !== id);
      }
    },
    removeFromCart: (state, action) => {
      state.products = state.products.filter((p) => p._id !== action.payload);
    },
    clearCart: (state) => {
      state.products = [];
    },
    // The cart saved on this device, or changed in another open window
    replaceCart: (state, action) => {
      state.products = Array.isArray(action.payload) ? action.payload : [];
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  updateQuantity,
  removeFromCart,
  clearCart,
  replaceCart,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.products;
// Badge count: machines by quantity, each pharma API line counts once (25 kg is one item)
export const selectCartTotalQuantity = (state) =>
  state.cart.products.reduce((sum, item) => sum + (item.kind === 'api' ? 1 : item.quantity), 0);
export const selectCartTotalPrice = (state) =>
  state.cart.products.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default cartSlice.reducer;