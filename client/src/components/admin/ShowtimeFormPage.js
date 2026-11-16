import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import * as showtimeApi from '../../api/showtimeApi';
import ShowtimeForm from '../../components/admin/ShowtimeForm';

const toList = (res) => (Array.isArray(res) ? res : res?.data ?? []);

const ShowtimeFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const { data, loading, error } = useFetch(async () => {
    const [movies, rooms, showtime] = await Promise.all([
      showtimeApi.getMovieOptions(),
      showtimeApi.getRoomOptions(),
      id ? showtimeApi.getById(id) : null,
    ]);
    return { movies: toList(movies), rooms: toList(rooms), showtime };
  }, [id]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerError('');
    try {
      if (id) await showtimeApi.update(id, payload);
      else await showtimeApi.create(payload);
      navigate('/admin/showtimes');
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error || !data) return <p role="alert">{error?.message || 'Không tải được dữ liệu'}</p>;

  return (
    <section>
      <h1>{id ? 'Sửa' : 'Thêm'} suất chiếu</h1>
      <ShowtimeForm
        movies={data.movies}
        rooms={data.rooms}
        initial={data.showtime}
        onSubmit={handleSubmit}
        submitting={submitting}
        serverError={serverError}
      />
    </section>
  );
};

export default ShowtimeFormPage;