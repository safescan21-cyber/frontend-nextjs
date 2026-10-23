import { createSlice } from "@reduxjs/toolkit";

// The saved login, read in the browser after the page has loaded (SessionRestore.jsx).
// `ready` stays false until then, so private pages wait instead of sending people to /login.
export const readSavedUser = () => {
    try {
        const serializedState = localStorage.getItem('user');
        if (serializedState == null || serializedState === 'undefined') return null;
        return JSON.parse(serializedState);
    } catch (error) {
        return null;
    }
};

const initialState = { user: null, ready: false };

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        restoreSession: (state, action) => {
            state.user = action.payload || null;
            state.ready = true;
        },
        setUser: (state, action) => {
            state.user = action.payload; // ✅ payload IS the user object directly
            localStorage.setItem('user', JSON.stringify(state.user));
        },
        logout: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token'); // the Bearer token saved at login
        }
    }
});

export const { setUser, logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;