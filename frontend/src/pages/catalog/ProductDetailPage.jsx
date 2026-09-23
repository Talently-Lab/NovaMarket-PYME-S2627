import { useParams } from 'react-router-dom';

export default function ProductDetailPage() {
  const { id } = useParams();

  return (
    <div className="product-detail">
      {/* Detalle del producto {id} — pendiente de conectar con API */}
      <p>Cargando producto #{id}...</p>
    </div>
  );
}
