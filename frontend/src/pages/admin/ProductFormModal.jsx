import { useEffect, useRef, useState } from 'react';
import { productsAPI } from '../../services/api';

const EMPTY = { name: '', description: '', price: '', stock: '0', category: '', image_url: '' };

const toForm = (p) => ({
  name:        p.name ?? '',
  description: p.description ?? '',
  price:       p.price != null ? String(p.price) : '',
  stock:       p.stock != null ? String(p.stock) : '0',
  category:    p.category ?? '',
  image_url:   p.image_url ?? '',
});

/**
 * Modal para crear o editar un producto (panel admin).
 * - product: si viene, edita ese producto; si es null, crea uno nuevo.
 * - categories: sugerencias para el campo categoría.
 * - onSaved(product): se llama con el producto guardado.
 * - onClose(): cierra el modal sin guardar.
 */
export default function ProductFormModal({ product, categories = [], onSaved, onClose }) {
  const isEdit = Boolean(product);
  const [form, setForm]     = useState(() => (product ? toForm(product) : EMPTY));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const firstField = useRef(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const category = form.category.trim();
    if (!name) return setError('El nombre es obligatorio.');
    if (!category) return setError('La categoría es obligatoria.');
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      return setError('El precio debe ser un número igual o mayor a 0.');
    }
    if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      return setError('El stock debe ser un número entero igual o mayor a 0.');
    }

    const payload = {
      name,
      description: form.description.trim(),
      price:       Number(form.price),
      stock:       Number(form.stock),
      category,
      image_url:   form.image_url.trim() || undefined,
    };

    setSaving(true);
    try {
      const { data } = isEdit
        ? await productsAPI.update(product.id, payload)
        : await productsAPI.create(payload);
      onSaved(data.product);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el producto. Intentá de nuevo.');
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <h2 id="product-modal-title" className="admin-modal__title">
          {isEdit ? `Editar producto #${product.id}` : 'Nuevo producto'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-name">Nombre</label>
            <input ref={firstField} className="form-input" id="pf-name" name="name"
              value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pf-description">Descripción</label>
            <textarea className="form-input" id="pf-description" name="description" rows={3}
              value={form.description} onChange={handleChange} />
          </div>

          <div className="admin-modal__row">
            <div className="form-group">
              <label className="form-label" htmlFor="pf-price">Precio ($)</label>
              <input className="form-input" id="pf-price" name="price" type="number" min="0" step="0.01"
                value={form.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pf-stock">Stock</label>
              <input className="form-input" id="pf-stock" name="stock" type="number" min="0" step="1"
                value={form.stock} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pf-category">Categoría</label>
            <input className="form-input" id="pf-category" name="category" list="pf-categories"
              value={form.category} onChange={handleChange} required />
            <datalist id="pf-categories">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pf-image">URL de la imagen (opcional)</label>
            <input className="form-input" id="pf-image" name="image_url" type="url" placeholder="https://…"
              value={form.image_url} onChange={handleChange} />
          </div>

          {error && <p className="form-error" role="alert">⚠ {error}</p>}

          <div className="admin-modal__actions">
            <button type="button" className="btn btn--secondary btn--sm" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
