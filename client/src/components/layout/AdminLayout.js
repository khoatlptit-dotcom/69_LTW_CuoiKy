import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = () => (
  <div>
    <nav>
      <NavLink to="/admin" end>Thống kê</NavLink>
      <NavLink to="/admin/movies">Phim</NavLink>
      <NavLink to="/admin/rooms">Phòng chiếu</NavLink>
      <NavLink to="/admin/showtimes">Suất chiếu</NavLink>
    </nav>
    <main>
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
