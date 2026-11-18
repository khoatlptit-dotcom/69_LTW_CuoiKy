import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import * as showtimeApi from '../../api/showtimeApi';
import Pagination from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/format';
import '../../styles/admin.css';

const ManageShowtimesPage = () => {
  const [filters, setFilters] = useState({ date: '', page: 1 });
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState('');

  const { data, loading, error } = useFetch(
    () => showtimeApi.getAll({ ...filters, limit: 10 }),
    [filters, reloadKey]
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa suất chiếu này?')) return;
    try {
      await showtimeApi.remove(id);
      setMessage('');
      setReloadKey((k) => k + 1);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="admin-page">
      <h1>Quản lý suất chiếu</h1>
      <p><Link to="new">+ Thêm suất chiếu</Link></p>
      <div className="date-filter">
        <div>
          <label htmlFor="date">Ngày chiếu</label>
          <input
            id="date"
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ date: e.target.value, page: 1 })}
          />
        </div>
      </div>
      {message && <p role="alert" className="error-text">{message}</p>}
      {loading && <p>Đang tải...</p>}
      {error && !data && <p role="alert" className="error-text">{error.message}</p>}
      <div className="table-scroll">
        <table>
          <thead>
            <tr><th>Phim</th><th>Phòng</th><th>Giờ chiếu</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {(data?.data ?? []).map((s) => (
              <tr key={s._id}>
                <td>{s.movie?.title}</td>
                <td>{s.room?.name}</td>
                <td>{formatDateTime(s.startTime)}</td>
                <td>
                  <Link to={`${s._id}/edit`}>Sửa</Link>
                  <button type="button" className="btn-danger" onClick={() => handleDelete(s._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={filters.page}
        totalPages={data?.totalPages || 1}
        onChange={(page) => setFilters((f) => ({ ...f, page }))}
      />
    </section>
  );
};

export default ManageShowtimesPage;