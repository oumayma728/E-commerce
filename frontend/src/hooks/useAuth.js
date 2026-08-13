import useAuthStore from "../store/authStore";
import {
  login as loginService,
  getCurrentUser,
} from "../services/authService";

const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore(
    (state) => state.isInitialized
  );

  const setAuth = useAuthStore((state) => state.setAuth);
  const restoreUser = useAuthStore((state) => state.restoreUser);
  const logout = useAuthStore((state) => state.logout);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore(
    (state) => state.setInitialized
  );

  const login = async (email, password) => {
    setLoading(true);

    try {
      const result = await loginService(email, password);

      setAuth(result.user, result.token);

      return result;
    } finally {
      setLoading(false);
    }
  };

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setInitialized(true);
      return;
    }

    try {
      const result = await getCurrentUser(storedToken);

      restoreUser(result.user);
    } catch (error) {
      console.error("Impossible de restaurer la session :", error);

      logout();
    } finally {
      setInitialized(true);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    initializeAuth,
  };
};

export default useAuth;