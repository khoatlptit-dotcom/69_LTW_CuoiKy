import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import useFetch from '../../hooks/useFetch';
import * as showtimeApi from '../../api/showtimeApi';
import { formatPrice } from '../../utils/format';
import '../../styles/showtime-list.css';

const ShowtimeList = ({ movieId }) => {
  const { data, loading, error } = useFetch(
    () => showtimeApi.getAll({ movieId, limit: 50 }),
    [movieId]
  );

  // Chỉ lấy suất chưa chiếu, nhóm theo ngày.
  const days = useMemo(() => {
    const now = Date.now();
    const upcoming = (data?.data ?? []).filter((item) => new Date(item.startTime).getTime() > now);
    const byDay = new Map();
    upcoming.forEach((item) => {
      const key = dayjs(item.startTime).format('YYYY-MM-DD');
      byDay.set(key, [...(byDay.get(key) || []), item]);
    });
    return [...byDay.entries()];
  }, [data]);

  if (loading) return <p>Đang tải lịch chiếu...</p>;
  if (error && !data) {
    return (
      <p role="alert" className="showtime-list__error">
        {error.message || 'Không tải được lịch chiếu'}
      </p>
    );
  }
  if (days.length === 0) return <p>Chưa có suất chiếu sắp tới.</p>;

  return (
    <section className="showtime-list" aria-label="Lịch chiếu">
      {days.map(([day, items]) => (
        <div key={day} className="showtime-list__day">
          <h3 className="showtime-list__date">
            {new Date(`${day}T00:00:00`).toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
            })}
          </h3>
          <ul className="showtime-list__items">
            {items.map((item) => (
              <li key={item._id}>
                <Link to={`/showtimes/${item._id}/seats`} className="showtime-list__item">
                  <strong>
                    {dayjs(item.startTime).format('HH:mm')} - {dayjs(item.endTime).format('HH:mm')}
                  </strong>
                  <span>{item.room?.name}</span>
                  <span className="showtime-list__price">
                    {formatPrice(item.priceNormal)} · VIP {formatPrice(item.priceVip)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};

export default ShowtimeList;