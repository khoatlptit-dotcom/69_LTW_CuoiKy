import { useCallback, useEffect, useState } from 'react';
import { getAll, create, update, remove } from '../../api/roomApi';

const emptyForm = { name: '', rows: '', seatsPerRow: '', vipRows: '' };

const ManageRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRooms(await getAll());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
      name: form.name.trim(),
      rows: Number(form.rows),
      seatsPerRow: Number(form.seatsPerRow),
      vipRows: form.vipRows
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number),
    };

    try {
      if (editingId) {
        await update(editingId, payload);
        setNotice('Đã cập nhật phòng');
      } else {
        await create(payload);
        setNotice('Đã thêm phòng');
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm({
      name: room.name,
      rows: String(room.rows),
      seatsPerRow: String(room.seatsPerRow),
      vipRows: (room.vipRows || []).join(', '),
    });
    setError('');
    setNotice('');
    window.scrollTo(0, 0);
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Xóa "${room.name}"?`)) return;
    setError('');
    setNotice('');
    try {
      await remove(room._id);
      setNotice('Đã xóa phòng');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-page">
      <h2>Quản lý phòng chiếu</h2>

      {error && <p>Lỗi: {error}</p>}
      {notice && <p>{notice}</p>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Sửa phòng' : 'Thêm phòng mới'}</h3>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên phòng *" />
        <input
          name="rows"
          type="number"
          min="1"
          max="26"
          value={form.rows}
          onChange={handleChange}
          placeholder="Số hàng ghế (1-26) *"
        />
        <input
          name="seatsPerRow"
          type="number"
          min="1"
          max="30"
          value={form.seatsPerRow}
          onChange={handleChange}
          placeholder="Số ghế mỗi hàng *"
        />
        <input
          name="vipRows"
          value={form.vipRows}
          onChange={handleChange}
          placeholder="Hàng VIP, cách nhau dấu phẩy (VD: 5, 6)"
        />
        <div>
          <button type="submit">{editingId ? 'Lưu thay đổi' : 'Thêm phòng'}</button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Hủy sửa
            </button>
          )}
        </div>
      </form>

      <hr />

      {loading && <p>Đang tải...</p>}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Tên phòng</th>
              <th>Số hàng</th>
              <th>Ghế mỗi hàng</th>
              <th>Tổng ghế</th>
              <th>Hàng VIP</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r._id}>
                <td>{r.name}</td>
                <td>{r.rows}</td>
                <td>{r.seatsPerRow}</td>
                <td>{r.rows * r.seatsPerRow}</td>
                <td>{(r.vipRows || []).join(', ') || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(r)}>Sửa</button>
                  <button onClick={() => handleDelete(r)}>Xóa</button>
                </td>
              </tr>
            ))}
            {!loading && rooms.length === 0 && (
              <tr>
                <td colSpan="6">Chưa có phòng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRoomsPage;