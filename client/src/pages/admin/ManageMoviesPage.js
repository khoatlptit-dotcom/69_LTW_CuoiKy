import { useCallback, useEffect, useState } from 'react';
import { getAll, create, update, remove } from '../../api/movieApi';
import Pagination from '../../components/common/Pagination';

const emptyForm = {
  title: '',
  genres: '',
  duration: '',
  poster: '',
  trailerUrl: '',
  description: '',
  status: 'now',
};

const ManageMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAll({ page, limit: 8, q });
      setMovies(res.data);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const payload = {
      title: form.title.trim(),
      genres: form.genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
      duration: Number(form.duration),
      poster: form.poster.trim(),
      trailerUrl: form.trailerUrl.trim(),
      description: form.description.trim(),
      status: form.status,
    };

    if (!payload.title) return setError('Vui lòng nhập tên phim');
    if (!payload.duration || payload.duration <= 0) {
      return setError('Thời lượng phải là số lớn hơn 0');
    }

    try {
      if (editingId) {
        await update(editingId, payload);
        setNotice('Đã cập nhật phim');
      } else {
        await create(payload);
        setNotice('Đã thêm phim');
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (movie) => {
    setEditingId(movie._id);
    setForm({
      title: movie.title || '',
      genres: (movie.genres || []).join(', '),
      duration: String(movie.duration || ''),
      poster: movie.poster || '',
      trailerUrl: movie.trailerUrl || '',
      description: movie.description || '',
      status: movie.status || 'now',
    });
    setError('');
    setNotice('');
    window.scrollTo(0, 0);
  };

  const handleDelete = async (movie) => {
    if (!window.confirm(`Xóa phim "${movie.title}"?`)) return;
    setError('');
    setNotice('');
    try {
      await remove(movie._id);
      setNotice('Đã xóa phim');
      // xóa phim cuối cùng của trang thì lùi về trang trước
      if (movies.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(keyword.trim());
  };

  return (
    <div>
      <h2>Quản lý phim</h2>

      {error && <p>Lỗi: {error}</p>}
      {notice && <p>{notice}</p>}

      <form onSubmit={handleSubmit}>
        <h3>{editingId ? 'Sửa phim' : 'Thêm phim mới'}</h3>
        <div>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Tên phim *" />
        </div>
        <div>
          <input
            name="genres"
            value={form.genres}
            onChange={handleChange}
            placeholder="Thể loại, cách nhau bằng dấu phẩy (VD: Hành động, Hài)"
          />
        </div>
        <div>
          <input
            name="duration"
            type="number"
            min="1"
            value={form.duration}
            onChange={handleChange}
            placeholder="Thời lượng (phút) *"
          />
        </div>
        <div>
          <input name="poster" value={form.poster} onChange={handleChange} placeholder="Link ảnh poster" />
        </div>
        <div>
          <input name="trailerUrl" value={form.trailerUrl} onChange={handleChange} placeholder="Link trailer YouTube" />
        </div>
        <div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả"
            rows="3"
          />
        </div>
        <div>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="now">Đang chiếu</option>
            <option value="upcoming">Sắp chiếu</option>
          </select>
        </div>
        <button type="submit">{editingId ? 'Lưu thay đổi' : 'Thêm phim'}</button>
        {editingId && (
          <button type="button" onClick={resetForm}>
            Hủy sửa
          </button>
        )}
      </form>

      <hr />

      <form onSubmit={handleSearch}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên phim..."
        />
        <button type="submit">Tìm</button>
      </form>

      {loading && <p>Đang tải...</p>}

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Tên phim</th>
            <th>Thể loại</th>
            <th>Thời lượng</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((m) => (
            <tr key={m._id}>
              <td>{m.title}</td>
              <td>{(m.genres || []).join(', ')}</td>
              <td>{m.duration} phút</td>
              <td>{m.status === 'now' ? 'Đang chiếu' : 'Sắp chiếu'}</td>
              <td>
                <button onClick={() => handleEdit(m)}>Sửa</button>
                <button onClick={() => handleDelete(m)}>Xóa</button>
              </td>
            </tr>
          ))}
          {!loading && movies.length === 0 && (
            <tr>
              <td colSpan="5">Không có phim nào.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default ManageMoviesPage;