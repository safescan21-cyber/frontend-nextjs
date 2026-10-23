'use client';
// Puts back the login and cart saved on this device once the page has loaded, and
// keeps the cart in step with other open windows. (The server renders every page
// logged out with an empty cart; doing this after hydration keeps both renders equal.)
import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { readSavedUser, restoreSession } from '../components/store/authSlice';
import { replaceCart } from '../components/store/cartSlice';
import { CART_KEY, readSavedCart, saveCartOnChange } from '../components/store/store';

export default function SessionRestore() {
  const store = useStore();
  useEffect(() => {
    store.dispatch(replaceCart(readSavedCart()));
    store.dispatch(restoreSession(readSavedUser()));
    const stopSaving = saveCartOnChange(store);
    const onStorage = (e) => {
      if (e.key === CART_KEY) store.dispatch(replaceCart(readSavedCart(e.newValue ?? '[]')));
    };
    window.addEventListener('storage', onStorage);
    return () => {
      stopSaving();
      window.removeEventListener('storage', onStorage);
    };
  }, [store]);
  return null;
}
