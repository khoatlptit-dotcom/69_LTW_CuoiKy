export const validateEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
export const validatePassword = (v) => v.length >= 6;
