import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi, AuthUser } from "../api/authApi";
import { resetRefreshState, tokenStorage } from "@/lib/axiosBaseQuery";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: (() => {
    if (typeof window === "undefined") return null;
    try {
      const s = localStorage.getItem("adminUser");
      return s ? (JSON.parse(s) as AuthUser) : null;
    } catch {
      return null;
    }
  })(),
  accessToken: tokenStorage.getAccess(),
  isAuthenticated: !!tokenStorage.getAccess(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user?: AuthUser;
        accessToken: string;
        refreshToken?: string;
      }>,
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      if (user) {
        state.user = user;
        try {
          localStorage.setItem("adminUser", JSON.stringify(user));
        } catch {}
      }
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.error = null;
      tokenStorage.setAccess(accessToken);
      if (refreshToken) tokenStorage.setRefresh(refreshToken);
    },

    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      tokenStorage.clear();
      try {
        localStorage.removeItem("adminUser");
      } catch {}
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        resetRefreshState();
        const payload = action.payload.data as {
          user: AuthUser;
          accessToken: string;
          refreshToken: string;
        };
        const { user, accessToken, refreshToken } = payload;
        if (user) {
          state.user = user;
          try {
            localStorage.setItem("adminUser", JSON.stringify(user));
          } catch {}
        }
        if (accessToken) {
          state.accessToken = accessToken;
          tokenStorage.setAccess(accessToken);
        }
        if (refreshToken) tokenStorage.setRefresh(refreshToken);
        state.isAuthenticated = true;
        state.error = null;
        state.isLoading = false;
      },
    );
    builder.addMatcher(authApi.endpoints.login.matchPending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addMatcher(
      authApi.endpoints.login.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as { data?: { message?: string } })?.data?.message ||
          "Login failed";
      },
    );

    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      tokenStorage.clear();
      try {
        localStorage.removeItem("adminUser");
      } catch {}
    });

    builder.addMatcher(
      authApi.endpoints.refreshToken.matchFulfilled,
      (state, action) => {
        const { accessToken, refreshToken } = action.payload.data;
        if (accessToken) {
          state.accessToken = accessToken;
          state.isAuthenticated = true;
          tokenStorage.setAccess(accessToken);
        }
        if (refreshToken) {
          tokenStorage.setRefresh(refreshToken);
        }
      },
    );
  },
});

export const { setCredentials, setUser, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) =>
  state.auth.accessToken;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
