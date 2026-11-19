const FormField = ({ name, label, error, children }) => (
  <div className="form-field">
    <label htmlFor={name}>{label}</label>
    {children}
    {error && <p role="alert" className="error-text">{error}</p>}
  </div>
);

export default FormField;