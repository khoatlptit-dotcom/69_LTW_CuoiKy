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

const validate = ({ email, password }) => {
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Email không hợp lệ";
  if (!password) errors.password = "Vui lòng nhập mật khẩu";
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

const LoginPage = () => {
  const { user, login } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Đã đăng nhập thì không cần ở trang này
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
      await login(values.email.trim(), values.password);
    } catch (err) {
      setServerError(
        err.status
          ? err.message || "Không thể đăng nhập"
          : "Không kết nối được tới máy chủ",
      );
      setSubmitting(false);
    }
  };

  return (
    <main style={pageStyle}>
      <h1>Đăng nhập</h1>
      <form onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        {serverError && (
          <p role="alert" style={{ margin: "0 0 12px" }}>
            {serverError}
          </p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <p>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </main>
  );
};

export default LoginPage;
