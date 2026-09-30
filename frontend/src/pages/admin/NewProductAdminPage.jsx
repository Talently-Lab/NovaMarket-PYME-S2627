import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import { CATEGORIES } from '../../constants/categories';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  image_url: '',
};

export default function NewProductAdminPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const productData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        image_url: form.image_url,
      };

      await productsAPI.create(productData);

      navigate('/admin/productos');
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.error ||
        'No se pudo crear el producto.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/productos');
  };

  return (
    <div className="admin-products">

      <div className="admin-products__header">
        <h1>Nuevo producto</h1>
      </div>

      {error && (
        <p className="admin-error">
          {error}
        </p>
      )}

      <div className="admin-product-form">

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="name">
              Nombre
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Descripción
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">
              Precio
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">
              Stock
            </label>

            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>

 <div className="form-group">
  <label htmlFor="category">Categoría</label>

  <select
    id="category"
    name="category"
    value={form.category}
    onChange={handleChange}
    required
  >
    <option value="" disabled>
      Seleccioná una categoría
    </option>

    {CATEGORIES.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>
</div>
          <div className="form-group">
            <label htmlFor="image_url">
              URL de la imagen
            </label>

            <input
              id="image_url"
              name="image_url"
              type="text"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="admin-product-form__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : 'Crear producto'}
            </button>
            
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}