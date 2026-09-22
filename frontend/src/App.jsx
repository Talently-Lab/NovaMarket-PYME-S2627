import { useEffect, useState } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState('Conectando con el backend...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setBackendStatus(data.message);
      })
      .catch((err) => {
        console.error('Error al consultar backend:', err);
        setError('No se pudo conectar con el backend');
      });
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>NovaMarket - PYME</h1>
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Estado de la conexión:</h3>
        {error ? (
          <p style={{ color: 'red', fontWeight: 'bold' }}>❌ {error}</p>
        ) : (
          <p style={{ color: 'green', fontWeight: 'bold' }}>✅ {backendStatus}</p>
        )}
      </div>
    </div>
  );
}

export default App;