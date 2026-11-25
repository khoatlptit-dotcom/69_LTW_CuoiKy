import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <nav className="admin-nav">
        <NavLink to="/admin" end>Thống kê</NavLink>
        <NavLink to="/admin/movies">Phim</NavLink>
        <NavLink to="/admin/rooms">Phòng chiếu</NavLink>
        <NavLink to="/admin/showtimes">Suất chiếu</NavLink>
        <NavLink to="/admin/users">Tài khoản</NavLink>
        <NavLink to="/admin/bookings">Vé đã đặt</NavLink>
        <span className="nav-spacer" />
        <span>Xin chào, {user?.name}</span>
        <button type="button" className="nav-logout" onClick={handleLogout}>Đăng xuất</button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;