import useSWRMutation from "swr/mutation";
import { apiClient } from "@/lib/api";
import { setAuthUser, getAuthUser, clearAuth } from "@/lib/storage";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
  error?: string;
}

interface AuthState {
  user: LoginResponse["user"] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Login mutation function
const loginRequest = async (
  url: string,
  { arg }: { arg: LoginCredentials },
) => {
  const response = await apiClient.postRaw(url, arg);
  return response;
};

// Auth hook that combines SWR mutation with localStorage
export const useAuth = () => {
  // Check for existing auth state on mount
  const getStoredAuth = (): AuthState => {
    try {
      const authUser = getAuthUser();
      if (authUser && authUser.token) {
        return {
          user: authUser.user,
          token: authUser.token,
          isAuthenticated: true,
          isLoading: false,
        };
      }
    } catch (error) {
      console.error("Error checking stored auth:", error);
    }

    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };
  };

  // SWR mutation for login
  const {
    trigger: login,
    isMutating: isLoggingIn,
    error,
    data,
    reset,
  } = useSWRMutation("/auth", loginRequest);

  // Login function
  const performLogin = async (
    credentials: LoginCredentials,
  ): Promise<boolean> => {
    try {
      console.log("Attempting login with SWR:", {
        username: credentials.username,
        password: "***",
      });

      const result = await login(credentials);
      console.log("SWR login response:", result);

      if (result.success && result.token && result.user) {
        // Store authentication data in localStorage
        setAuthUser(result.token, result.user);
        console.log("Auth data stored successfully");
        return true;
      } else {
        console.log("Login failed - invalid response format");
        return false;
      }
    } catch (err: any) {
      console.error("SWR login error:", err);
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    clearAuth();
    reset(); // Reset SWR mutation state
  };

  // Get current auth state
  const authState = getStoredAuth();

  return {
    // Auth state
    ...authState,

    // Actions
    login: performLogin,
    logout,

    // Loading states
    isLoading: isLoggingIn,

    // Error state
    error,

    // Utility to check if user is admin
    isAdmin: authState.user?.role === "admin",

    // Reset error state
    clearError: () => reset(),
  };
};
