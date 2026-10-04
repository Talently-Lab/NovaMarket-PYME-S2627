import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

// Clave de storage por usuario — carrito aislado por cuenta
const storageKey = (userId) =>
  userId ? `nm-cart-${userId}` : 'nm-cart-guest';

export function CartProvider({ children, userId }) {
  const key = storageKey(userId);

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cuando cambia el usuario (login / logout) — carga el carrito del nuevo usuario
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(userId));
      setItems(saved ? JSON.parse(saved) : []);
    } catch {
      setItems([]);
    }
  }, [userId]);

  // Persistir carrito en localStorage con la clave del usuario actual
  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(items));
  }, [items, userId]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const maxStock = product.stock ?? Infinity;
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: newQty } : i
        );
      }
      if (maxStock === 0) return prev;
      return [...prev, { ...product, quantity: Math.min(quantity, maxStock) }];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeItem(productId);
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== productId) return i;
        const maxStock = i.stock ?? Infinity;
        return { ...i, quantity: Math.min(quantity, maxStock) };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(storageKey(userId));
  };

  const total     = items.reduce((acc, i) => acc + Number(i.price) * i.quantity, 0);
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
