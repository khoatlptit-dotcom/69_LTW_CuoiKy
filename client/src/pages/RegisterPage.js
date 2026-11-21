import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const pageStyle = {
  maxWidth: 420,
  width: "100%",
  margin: "2rem auto",
  padding: "0 1rem",
  boxSizing: "border-box",
};
const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  marginBottom: 12,
};

const validate = ({ name, email, password, confirm }) => {
  const errors = {};
  if (!name.trim()) errors.name = "Vui lòng nhập họ tên";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Email không hợp lệ";
  if (password.length < 6) errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  if (confirm !== password) errors.confirm = "Mật khẩu nhập lại không khớp";
  return errors;
};

const Field = ({ id, label, error, ...inputProps }) => (
  <div style={fieldStyle}>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      name={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      {...inputProps}
    />
    {error && (
      <p id={`${id}-error`} role="alert" style={{ margin: 0 }}>
        {error}
      </p>
    )}
  </div>
);

const RegisterPage = () => {
  const { user, register } = useAuth();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user)
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;

  const handleChange = ({ target: { name, value } }) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      await register(values.name.trim(), values.email.trim(), values.password);
    } catch (err) {
      setServerError(
        err.status
          ? err.message || "Không thể đăng ký"
          : "Không kết nối được tới máy chủ",
      );
      setSubmitting(false);
    }
  };

  return (
    <main style={pageStyle}>
      <h1>Đăng ký</h1>
      <form onSubmit={handleSubmit} noValidate>
        <Field
          id="name"
          label="Họ tên"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Field
          id="password"
          label="Mật khẩu"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Field
          id="confirm"
          label="Nhập lại mật khẩu"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={handleChange}
          error={errors.confirm}
        />
        {serverError && (
          <p role="alert" style={{ margin: "0 0 12px" }}>
            {serverError}
          </p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
      <p>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </main>
  );
};

export default RegisterPage;
