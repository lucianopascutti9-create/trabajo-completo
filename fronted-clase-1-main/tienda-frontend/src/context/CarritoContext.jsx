import React, { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  // 1 & 2. Inicializar leyendo de localStorage con useState y función try/catch
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem('carrito');
      return guardado ? JSON.parse(guardado) : [];
    } catch (error) {
      console.error('Error al leer carrito de localStorage:', error);
      return [];
    }
  });

  // 3. Guardar en localStorage cada vez que items cambie
  useEffect(() => {
    try {
      localStorage.setItem('carrito', JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar carrito en localStorage:', error);
    }
  }, [items]);

  // 4. Escribir agregar(producto, cantidad)
  const agregar = (producto, cantidad = 1, dedicatoria = '') => {
    const cantNum = Number(cantidad) > 0 ? Number(cantidad) : 1;
    setItems((prevItems) => {
      const index = prevItems.findIndex(
        (it) => it.producto.id === producto.id || it.producto.nombre === producto.nombre
      );

      if (index > -1) {
        // Sumar cantidad sin repetir fila
        const actualizados = [...prevItems];
        actualizados[index] = {
          ...actualizados[index],
          cantidad: actualizados[index].cantidad + cantNum,
          dedicatoria: dedicatoria || actualizados[index].dedicatoria || '',
        };
        return actualizados;
      } else {
        return [...prevItems, { producto, cantidad: cantNum, dedicatoria }];
      }
    });
  };

  // 5. Escribir quitar(producto_id), vaciar() y total con reduce
  const quitar = (producto_id) => {
    setItems((prevItems) =>
      prevItems.filter(
        (it) => it.producto.id !== producto_id && it.producto.nombre !== producto_id
      )
    );
  };

  const actualizarCantidad = (producto_id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      quitar(producto_id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((it) => {
        if (it.producto.id === producto_id || it.producto.nombre === producto_id) {
          return { ...it, cantidad: Number(nuevaCantidad) };
        }
        return it;
      })
    );
  };

  const vaciar = () => {
    setItems([]);
  };

  // Total calculado con reduce
  const total = items.reduce((acc, item) => {
    const precio = item.producto.precio_final ?? item.producto.precio ?? 0;
    return acc + precio * item.cantidad;
  }, 0);

  const totalCount = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregar,
        quitar,
        actualizarCantidad,
        vaciar,
        total,
        totalCount,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return context;
}

export default CarritoContext;
