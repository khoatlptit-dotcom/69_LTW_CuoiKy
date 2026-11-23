import { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import * as statsApi from '../../api/statsApi';
import RevenueChart from '../../components/admin/RevenueChart';
import StatCard from '../../components/admin/StatCard';
import { formatPrice } from '../../utils/format';
import '../../styles/admin.css';

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('sv-SE');
};

const DashboardPage = () => {
  const [range, setRange] = useState({ from: daysAgo(29), to: daysAgo(0) });
  const byMovie = useFetch(() => statsApi.revenueByMovie(range), [range]);
  const byDay = useFetch(() => statsApi.revenueByDay(range), [range]);
  const overview = useFetch(() => statsApi.overview(), []);

  const totals = useMemo(
    () =>
      (byDay.data ?? []).reduce(
        (acc, d) => ({
          revenue: acc.revenue + d.revenue,
          seats: acc.seats + d.seats,
          bookings: acc.bookings + d.bookings,
        }),
        { revenue: 0, seats: 0, bookings: 0 }
      ),
    [byDay.data]
  );

  const handleRange = ({ target: { name, value } }) => {
    setRange((prev) => ({ ...prev, [name]: value }));
  };

  const failed = [byMovie, byDay, overview].find((r) => r.error && !r.data);
  const loading = byMovie.loading || byDay.loading;

  return (
    <section className="admin-page">
      <h1>Thống kê doanh thu</h1>
      <form className="date-filter" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="from">Từ ngày</label>
          <input id="from" name="from" type="date" value={range.from} max={range.to} onChange={handleRange} />
        </div>
        <div>
          <label htmlFor="to">Đến ngày</label>
          <input id="to" name="to" type="date" value={range.to} min={range.from} onChange={handleRange} />
        </div>
      </form>
      {failed && <p role="alert" className="error-text">{failed.error.message}</p>}
      {loading && <p>Đang tải...</p>}
      <div className="stat-grid">
        <StatCard label="Tổng số phim" value={overview.data?.movies ?? '...'} />
<StatCard label="Tổng thành viên" value={overview.data?.members ?? '...'} />
        <StatCard label="Tổng doanh thu" value={formatPrice(totals.revenue)} />
        <StatCard label="Số ghế đã bán" value={totals.seats} />
        <StatCard label="Lượt đặt vé" value={totals.bookings} />
      </div>
      <h2>Doanh thu theo phim</h2>
      <RevenueChart data={byMovie.data} xKey="title" />
      <h2>Doanh thu theo ngày</h2>
      <RevenueChart data={byDay.data} xKey="date" type="line" />
    </section>
  );
};

export default DashboardPage;