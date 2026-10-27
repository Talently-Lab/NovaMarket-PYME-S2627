import { useEffect, useRef, useState } from 'react';
import { productsAPI } from '../../services/api';
import { uploadImage, validateImageFile, ACCEPTED_TYPES, MAX_IMAGES } from '../../services/supabaseStorage';

const EMPTY = { name: '', description: '', price: '', stock: '0', category: '', image_url: '' };

const toForm = (p) => ({
  name:        p.name ?? '',
  description: p.description ?? '',
  price:       p.price != null ? String(p.price) : '',
  stock:       p.stock != null ? String(p.stock) : '0',
  category:    p.category ?? '',
  image_url:   p.image_url ?? '',
});

export default function ProductFormModal({ product, categories = [], onSaved, onClose }) {
  const isEdit  = Boolean(product);
  const [form, setForm]       = useState(() => (product ? toForm(product) : EMPTY));
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const firstField            = useRef(null);

  // Imágenes: array de { file?, preview, url, uploading, error }
  const [images, setImages]   = useState(() => {
    if (product?.image_url) return [{ url: product.image_url, preview: product.image_url }];
    return [];
  });
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

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

  // ── Manejo de imágenes ────────────────────────────────────
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadError('');

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setUploadError(`Máximo ${MAX_IMAGES} imágenes por producto.`);
      return;
    }

    const toAdd = files.slice(0, remaining);
    const newImages = [];

    for (const file of toAdd) {
      const err = validateImageFile(file);
      if (err) { setUploadError(err); continue; }
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        url: null,
        uploading: false,
        error: null,
      });
    }

    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImages(prev => {
      const img = prev[idx];
      if (img.preview && img.file) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const moveImage = (idx, dir) => {
    setImages(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // ── Upload y submit ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name     = form.name.trim();
    const category = form.category.trim();
    if (!name)     return setError('El nombre es obligatorio.');
    if (!category) return setError('La categoría es obligatoria.');
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
      return setError('El precio debe ser un número igual o mayor a 0.');
    if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)
      return setError('El stock debe ser un número entero igual o mayor a 0.');

    setSaving(true);
    setError('');
    setUploadError('');

    try {
      // Subir imágenes pendientes
      const uploadedImages = [...images];
      for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i];
        if (img.file && !img.url) {
          setImages(prev => prev.map((m, j) => j === i ? { ...m, uploading: true } : m));
          const url = await uploadImage(img.file);
          uploadedImages[i] = { ...img, url, uploading: false };
          setImages(prev => prev.map((m, j) => j === i ? uploadedImages[i] : m));
        }
      }

      // La primera imagen es la principal
      const image_url = uploadedImages[0]?.url || uploadedImages[0]?.preview || form.image_url || '';

      const payload = {
        name,
        description: form.description.trim(),
        price:       Number(form.price),
        stock:       Number(form.stock),
        category,
        image_url,
      };

      const { data } = isEdit
        ? await productsAPI.update(product.id, payload)
        : await productsAPI.create(payload);

      onSaved(data.product);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'No se pudo guardar el producto.');
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal admin-modal--wide" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
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

          {/* ── Imágenes ── */}
          <div className="form-group">
            <label className="form-label">
              Imágenes del producto
              <span className="form-label__hint"> — PNG, JPG, WebP, GIF · Máx. 5MB c/u · Hasta {MAX_IMAGES} imágenes</span>
            </label>

            {/* Previews */}
            {images.length > 0 && (
              <div className="img-upload__grid">
                {images.map((img, idx) => (
                  <div key={idx} className={`img-upload__item${idx === 0 ? ' img-upload__item--main' : ''}`}>
                    <img src={img.preview || img.url} alt={`Imagen ${idx + 1}`} className="img-upload__preview" />
                    {idx === 0 && <span className="img-upload__main-badge">Principal</span>}
                    {img.uploading && <div className="img-upload__overlay">Subiendo…</div>}
                    <div className="img-upload__actions">
                      {idx > 0 && (
                        <button type="button" className="img-upload__btn" onClick={() => moveImage(idx, -1)} title="Mover izquierda">←</button>
                      )}
                      {idx < images.length - 1 && (
                        <button type="button" className="img-upload__btn" onClick={() => moveImage(idx, 1)} title="Mover derecha">→</button>
                      )}
                      <button type="button" className="img-upload__btn img-upload__btn--remove" onClick={() => removeImage(idx)} title="Eliminar">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botón agregar */}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                className="img-upload__add-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {images.length === 0 ? 'Agregar imágenes' : `Agregar más (${images.length}/${MAX_IMAGES})`}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              style={{ display: 'none' }}
              onChange={handleFilesChange}
            />
            {uploadError && <p className="form-error" role="alert">⚠ {uploadError}</p>}
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
