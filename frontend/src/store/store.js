// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// Load initial state from localStorage
const loadState = () => {
  try {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      return undefined; // Use default state
    }

    return {
      auth: {
        token,
        user,
      },
    };
  } catch (error) {
    console.error("Failed to load state from localStorage", error);
    return undefined;
  }
};

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: loadState(),
});

export default store;