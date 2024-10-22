// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
  },
  reducers: {
    login(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    register(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { login, register, logout } = authSlice.actions;
export default authSlice.reducer;
