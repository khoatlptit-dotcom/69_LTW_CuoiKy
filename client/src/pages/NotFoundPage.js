import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div>
      <h1>404</h1>
      <p>Không tìm thấy trang bạn cần.</p>
      <Link to="/">Về trang chủ</Link>
    </div>
  );
};

export default NotFoundPage;