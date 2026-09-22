const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Error al conectar con la API:', error);
    throw error;
  }
};