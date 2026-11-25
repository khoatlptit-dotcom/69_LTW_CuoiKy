
import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import * as adminBookingApi from '../../api/adminBookingApi';
import Pagination from '../../components/common/Pagination';
import { formatDateTime, formatPrice } from '../../utils/format';
import '../../styles/admin.css';

const STATUS_LABEL = { confirmed: 'Đã xác nhận', cancelled: 'Đã hủy' };

const ManageBookingsPage = () => {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounce(q, 400);

  const { data, loading, error } = useFetch(
    () => adminBookingApi.getAll({ q: debouncedQ, status, page, limit: 10 }),
    [debouncedQ, status, page]
  );

  const handleSearch = (e) => {
    setQ(e.target.value);
    setPage(1);
  };

  const handleStatus = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const bookings = data?.data ?? [];

  return (
    <section className="admin-page">
      <h1>Vé đã đặt</h1>
      <div className="date-filter">
        <div>
          <label htmlFor="q">Email khách</label>
          <input id="q" type="search" value={q} onChange={handleSearch} placeholder="Nhập một phần email" />
        </div>
        <div>
          <label htmlFor="status">Trạng thái</label>
          <select id="status" value={status} onChange={handleStatus}>
            <option value="">Tất cả</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>
      {loading && <p>Đang tải...</p>}
      {error && !data && <p role="alert" className="error-text">{error.message}</p>}
      {data && bookings.length === 0 && <p>Không có vé nào phù hợp</p>}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Khách</th><th>Phim</th><th>Phòng</th><th>Giờ chiếu</th>
              <th>Ghế</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày đặt</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.user?.name}<br />{b.user?.email}</td>
                <td>{b.showtime?.movie?.title}</td>
                <td>{b.showtime?.room?.name}</td>
                <td>{b.showtime ? formatDateTime(b.showtime.startTime) : ''}</td>
                <td>{b.seats.join(', ')}</td>
                <td>{formatPrice(b.totalPrice ?? 0)}</td>
                <td>{STATUS_LABEL[b.status] ?? b.status}</td>
                <td>{formatDateTime(b.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={data?.totalPages || 1} onChange={setPage} />
    </section>
  );
};

export default ManageBookingsPage;