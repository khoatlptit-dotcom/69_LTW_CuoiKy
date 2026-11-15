const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div>
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Trước
      </button>
      <span> Trang {page} / {totalPages} </span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Sau
      </button>
    </div>
  );
};

export default Pagination;