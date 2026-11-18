import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <Link to="/">Cinema</Link>
      <nav>
        <Link to="/">Trang chủ</Link>
        <Link to="/my-tickets">Vé của tôi</Link>
        <Link to="/login">Đăng nhập</Link>
        <Link to="/register">Đăng ký</Link>
      </nav>
    </header>
  );
};

export default Header;