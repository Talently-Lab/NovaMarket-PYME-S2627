export default function Pagination({
  page,
  totalPages,
  onChange,
  totalItems,
  pageSize,
}) {

  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="pagination">
      <span className="pagination__info">
        Mostrando {from}–{to} de {totalItems}
      </span>

      <div className="pagination__controls">
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
        >
          Anterior
        </button>

        <span className="pagination__page">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}