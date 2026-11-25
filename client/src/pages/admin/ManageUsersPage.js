import { useCallback, useEffect, useState } from "react";
import { getAll, updateRole } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import Pagination from "../../components/common/Pagination";

const ROLE_LABEL = { admin: "Quản trị viên", member: "Thành viên" };

const ManageUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const currentId = currentUser?._id || currentUser?.id;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAll({ page, limit: 10 });
      setUsers(res.items || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleChange = async (u, role) => {
    if (role === u.role) return;
    if (!window.confirm(`Đổi quyền của "${u.name}" thành ${ROLE_LABEL[role]}?`))
      return;

    setError("");
    setNotice("");
    setSavingId(u._id);
    try {
      await updateRole(u._id, role);
      setNotice(`Đã đổi quyền của ${u.name}`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <h2>Quản lý tài khoản</h2>

      {error && <p>Lỗi: {error}</p>}
      {notice && <p>{notice}</p>}
      {loading && <p>Đang tải...</p>}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Quyền</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u._id === currentId;
              return (
                <tr key={u._id}>
                  <td>
                    {u.name}
                    {isSelf && " (bạn)"}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      disabled={isSelf || savingId === u._id}
                      title={
                        isSelf ? "Không thể tự đổi quyền của chính mình" : ""
                      }
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                    >
                      <option value="member">{ROLE_LABEL.member}</option>
                      <option value="admin">{ROLE_LABEL.admin}</option>
                    </select>
                  </td>
                </tr>
              );
            })}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="3">Chưa có tài khoản nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default ManageUsersPage;
