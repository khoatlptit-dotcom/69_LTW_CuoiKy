import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <Link to="/">Cinema</Link>
      <nav>
        <Link to="/">Trang chủ</Link>
        {user && <Link to="/my-tickets">Vé của tôi</Link>}
        {isAdmin && <Link to="/admin">Quản trị</Link>}
        {user ? (
          <>
            <span>Xin chào, {user.name}</span>
            <button type="button" onClick={handleLogout}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;