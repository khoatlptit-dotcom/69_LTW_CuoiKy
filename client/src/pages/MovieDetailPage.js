import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getById } from '../api/movieApi';

// Đổi link YouTube bất kỳ (watch?v=, youtu.be/, embed/) thành link nhúng
const getYoutubeEmbed = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getById(id);
        if (!ignore) setMovie(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (error) {
    return (
      <div>
        <p>Lỗi: {error}</p>
        <Link to="/">Về trang chủ</Link>
      </div>
    );
  }
  if (!movie) return null;

  const embedUrl = getYoutubeEmbed(movie.trailerUrl);

  return (
    <div>
      <Link to="/">← Quay lại danh sách</Link>

      <h2>{movie.title}</h2>
      <img src={movie.poster} alt={movie.title} width="250" />

      <p>Thể loại: {(movie.genres || []).join(', ')}</p>
      <p>Thời lượng: {movie.duration} phút</p>
      <p>Trạng thái: {movie.status === 'now' ? 'Đang chiếu' : 'Sắp chiếu'}</p>
      <p>{movie.description}</p>

      <h3>Trailer</h3>
      {embedUrl ? (
        <iframe
          width="560"
          height="315"
          src={embedUrl}
          title={`Trailer ${movie.title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <p>Chưa có trailer.</p>
      )}

      {/* TODO: danh sách suất chiếu và nút Đặt vé (phụ thuộc API suất chiếu của Tuấn) */}
    </div>
  );
};

export default MovieDetailPage;