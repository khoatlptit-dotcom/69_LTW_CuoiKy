import request from "./client";

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const getAll = (params) => request(`/auth/users${buildQuery(params)}`);

export const updateRole = (id, role) =>
  request(`/auth/users/${id}/role`, { method: "PATCH", body: { role } });
