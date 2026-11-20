import { useState } from 'react';
import FormField from './FormField';

const pad = (n) => String(n).padStart(2, '0');

const toInputValue = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const validate = ({ movie, room, startTime, priceNormal, priceVip }) => {
  const errors = {};
  if (!movie) errors.movie = 'Vui lòng chọn phim';
  if (!room) errors.room = 'Vui lòng chọn phòng';
  if (!startTime) errors.startTime = 'Vui lòng chọn giờ chiếu';
  if (!(Number(priceNormal) > 0)) errors.priceNormal = 'Giá ghế thường phải lớn hơn 0';
  if (!(Number(priceVip) >= Number(priceNormal))) errors.priceVip = 'Giá VIP phải lớn hơn hoặc bằng giá thường';
  return errors;
};

const ShowtimeForm = ({ movies, rooms, initial, onSubmit, submitting, serverError }) => {
  const [values, setValues] = useState({
    movie: initial?.movie?._id ?? '',
    room: initial?.room?._id ?? '',
    startTime: toInputValue(initial?.startTime),
    priceNormal: initial?.priceNormal ?? 80000,
    priceVip: initial?.priceVip ?? 120000,
  });
  const [errors, setErrors] = useState({});

  const handleChange = ({ target: { name, value } }) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({ ...values, startTime: new Date(values.startTime).toISOString() });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="admin-form">
      {serverError && <p role="alert" className="error-text">{serverError}</p>}
      <FormField name="movie" label="Phim" error={errors.movie}>
        <select id="movie" name="movie" value={values.movie} onChange={handleChange}>
          <option value="">-- Chọn phim --</option>
          {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
        </select>
      </FormField>
      <FormField name="room" label="Phòng chiếu" error={errors.room}>
        <select id="room" name="room" value={values.room} onChange={handleChange}>
          <option value="">-- Chọn phòng --</option>
          {rooms.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
      </FormField>
      <FormField name="startTime" label="Giờ chiếu" error={errors.startTime}>
        <input id="startTime" name="startTime" type="datetime-local" value={values.startTime} onChange={handleChange} />
      </FormField>
      <FormField name="priceNormal" label="Giá ghế thường (đ)" error={errors.priceNormal}>
        <input id="priceNormal" name="priceNormal" type="number" value={values.priceNormal} onChange={handleChange} />
      </FormField>
      <FormField name="priceVip" label="Giá ghế VIP (đ)" error={errors.priceVip}>
        <input id="priceVip" name="priceVip" type="number" value={values.priceVip} onChange={handleChange} />
      </FormField>
      <button type="submit" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu suất chiếu'}</button>
    </form>
  );
};

export default ShowtimeForm;