import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import request from "../api/client";

const AuthContext = createContext(null);

// client.js đọc token ở localStorage khóa "token"; thông tin người dùng lưu ở khóa "user"
const readStoredUser = () => {
  try {
    return localStorage.getItem("token")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Khôi phục phiên ngay khi tải trang để ProtectedRoute không đá về /login khi F5
  const [user, setUser] = useState(readStoredUser);

  const saveSession = useCallback(({ token, user: nextUser }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const login = useCallback(
    async (email, password) =>
      saveSession(
        await request("/auth/login", {
          method: "POST",
          body: { email, password },
        }),
      ),
    [saveSession],
  );

  const register = useCallback(
    async (name, email, password) =>
      saveSession(
        await request("/auth/register", {
          method: "POST",
          body: { name, email, password },
        }),
      ),
    [saveSession],
  );

  // Có token cũ: hỏi server xem còn hợp lệ không; hết hạn hoặc không hợp lệ thì đăng xuất
  useEffect(() => {
    if (!localStorage.getItem("token")) return undefined;
    let active = true;
    request("/auth/me")
      .then(({ user: current }) => {
        if (!active) return;
        localStorage.setItem("user", JSON.stringify(current));
        setUser(current);
      })
      .catch((err) => {
        if (active && err.status === 401) logout();
      });
    return () => {
      active = false;
    };
  }, [logout]);

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === "admin", login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
