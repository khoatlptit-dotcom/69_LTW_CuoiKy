import { useEffect, useState } from 'react';
import { getAll } from '../api/movieApi';
import MovieCard from '../components/common/MovieCard';
import Pagination from '../components/common/Pagination';

const GENRES = [
  'Hành động', 'Phiêu lưu', 'Kinh dị', 'Tình cảm', 'Hài',
  'Gia đình', 'Khoa học viễn tưởng', 'Hoạt hình', 'Chính kịch',
];

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState(''); // chữ đang gõ trong ô tìm kiếm
  const [q, setQ] = useState(''); // chữ đã bấm Tìm
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState(''); // '' = tất cả
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAll({ page, limit: 8, q, genre, status });
        if (!ignore) {
          setMovies(res.data);
          setTotalPages(res.totalPages || 1);
        }
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
  }, [page, q, genre, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(keyword.trim());
  };

  const handleGenre = (e) => {
    setPage(1);
    setGenre(e.target.value);
  };

  const handleStatus = (value) => {
    setPage(1);
    setStatus(value);
  };

  return (
    <div>
      <h2>Danh sách phim</h2>

      <form onSubmit={handleSearch}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên phim..."
        />
        <button type="submit">Tìm</button>
      </form>

      <div>
        <button onClick={() => handleStatus('')}>Tất cả</button>
        <button onClick={() => handleStatus('now')}>Đang chiếu</button>
        <button onClick={() => handleStatus('upcoming')}>Sắp chiếu</button>

        <select value={genre} onChange={handleGenre}>
          <option value="">Tất cả thể loại</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p>Lỗi: {error}</p>}
      {!loading && !error && movies.length === 0 && <p>Không tìm thấy phim nào.</p>}

      <div>
        {movies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default HomePage;