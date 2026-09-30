import { useEffect, useState } from 'react';
import { productsAPI } from '../../services/api';

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Estado de edición: { id: categoryName, value: newName, saving: bool, error: str }
  const [editing, setEditing] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    setLoading(true);
    productsAPI.getCategories()
      .then(({ data }) => setCategories(data.categories ?? []))
      .catch(() => setError('No se pudieron cargar las categorías.'))
      .finally(() => setLoading(false));
  };

  const startEdit = (name) => {
    setEditing(prev => ({ ...prev, [name]: { value: name, saving: false, error: '' } }));
  };

  const cancelEdit = (name) => {
    setEditing(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const saveEdit = async (oldName) => {
    const newName = editing[oldName]?.value?.trim();
    if (!newName || newName === oldName) { cancelEdit(oldName); return; }

    setEditing(prev => ({ ...prev, [oldName]: { ...prev[oldName], saving: true, error: '' } }));

    try {
      await productsAPI.renameCategory(oldName, newName);
      // Actualizar lista local
      setCategories(prev => prev.map(c =>
        c.category === oldName ? { ...c, category: newName } : c
      ));
      cancelEdit(oldName);
    } catch (err) {
      setEditing(prev => ({
        ...prev,
        [oldName]: { ...prev[oldName], saving: false, error: 'Error al renombrar.' },
      }));
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Categorías</h1>
        <p className="admin-dashboard__subtitle">
          {loading ? '…' : `${categories.length} categorías activas`}
        </p>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th style={{ textAlign: 'center' }}>Productos totales</th>
              <th style={{ textAlign: 'center' }}>Productos activos</th>
              <th style={{ textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
                  Cargando categorías…
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--color-text-disabled)' }}>
                  No hay categorías aún.
                </td>
              </tr>
            ) : (
              categories.map((cat) => {
                const isEditing = !!editing[cat.category];
                const editState = editing[cat.category];

                return (
                  <tr key={cat.category}>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
                          <input
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: 'var(--text-sm)', maxWidth: 200 }}
                            value={editState.value}
                            onChange={e => setEditing(prev => ({
                              ...prev,
                              [cat.category]: { ...prev[cat.category], value: e.target.value },
                            }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(cat.category);
                              if (e.key === 'Escape') cancelEdit(cat.category);
                            }}
                            autoFocus
                            disabled={editState.saving}
                          />
                          {editState.error && (
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
                              {editState.error}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontWeight: 'var(--weight-medium)', textTransform: 'capitalize' }}>
                          {cat.category}
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      {cat.product_count}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className="admin-badge" style={{
                        '--badge-color': cat.active_count > 0 ? '#22c55e' : '#ef4444',
                      }}>
                        {cat.active_count}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn--primary btn--sm btn--icon"
                            onClick={() => saveEdit(cat.category)}
                            disabled={editState.saving}
                            aria-label="Guardar"
                            title="Guardar"
                          >
                            <CheckIcon />
                          </button>
                          <button
                            className="btn btn--ghost btn--sm btn--icon"
                            onClick={() => cancelEdit(cat.category)}
                            disabled={editState.saving}
                            aria-label="Cancelar"
                            title="Cancelar"
                          >
                            <XIcon />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-1)' }}
                          onClick={() => startEdit(cat.category)}
                          aria-label={`Renombrar ${cat.category}`}
                        >
                          <EditIcon /> Renombrar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
