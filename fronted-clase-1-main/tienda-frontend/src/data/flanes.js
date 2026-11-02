export const FLANES_DATA = [
  {
    id: 1,
    nombre: "Flan Clásico",
    slug: "flan-clasico",
    subtitulo: "El clásico porteño irresistible con huevo, leche entera y abundante caramelo líquido dorado casero",
    precio: 8500,
    precio_final: 8500,
    precio_anterior: 9500,
    en_stock: true,
    stock_disponible: 15,
    categoria: "Clásicos",
    categoria_id: 1,
    badge: "Más Vendido ⭐",
    rating: 4.9,
    reviews_count: 142,
    porciones: "6 - 8 porciones (1.2 kg)",
    tiempo_elaboracion: "Horneado lento a baño María (4 horas)",
    garantia_meses: 0,
    garantia_texto: "Garantía de Frescura 100%: Elaborado el mismo día con huevos de campo y leche entera fresca.",
    cuotas_cantidad: 3,
    cuotas_valor: 2833.33,
    imagen: "/flan_clasico.jpg",
    imagenes_galeria: [
      "/flan_clasico.jpg"
    ],
    descripcion_corta: "Suave, cremoso y con abundante caramelo líquido dorado. La receta casera tradicional que nunca falla.",
    descripcion_larga: "Nuestra receta clásica elaborada pacientemente a fuego lento a baño María con huevos frescos de campo, leche de tambo seleccionada e infusionada con vainilla. Bañado en caramelo líquido dorado artesanal.",
    ingredientes: [
      "Leche entera de tambo seleccionada",
      "Huevos de campo frescos",
      "Azúcar para caramelo dorado casero",
      "Esencia y vaina natural de vainilla"
    ],
    maridaje_sugerido: "Café espresso de especialidad o dulce de leche artesanal."
  },
  {
    id: 2,
    nombre: "Flan Chocolate",
    slug: "flan-chocolate",
    subtitulo: "Exquisito flan de chocolate intenso con baño de caramelo oscuro y cacao seleccionado",
    precio: 9800,
    precio_final: 9800,
    precio_anterior: 11000,
    en_stock: true,
    stock_disponible: 12,
    categoria: "Especiales",
    categoria_id: 2,
    badge: "Favorito del Chef 🍫",
    rating: 5.0,
    reviews_count: 98,
    porciones: "6 - 8 porciones (1.25 kg)",
    tiempo_elaboracion: "Horneado lento a baño María y maduración en frío",
    garantia_meses: 0,
    garantia_texto: "Garantía de Calidad: Elaborado con cacao y chocolate puro de máxima pureza.",
    cuotas_cantidad: 3,
    cuotas_valor: 3266.66,
    imagen: "/flan_chocolate.jpg",
    imagenes_galeria: [
      "/flan_chocolate.jpg"
    ],
    descripcion_corta: "Intenso, suntuoso y elegante. El flan ideal para los fanáticos del chocolate y el caramelo oscuro.",
    descripcion_larga: "Una combinación perfecta de la sedosidad del flan casero con la intensidad del chocolate seleccionado. Cocido lentamente a baño María y cubierto con una capa profunda de caramelo fundente.",
    ingredientes: [
      "Chocolate puro y cacao seleccionado",
      "Leche entera fresca",
      "Huevos de campo",
      "Caramelo de azúcar tostado artesanal"
    ],
    maridaje_sugerido: "Café cortado, crema chantilly o licor de café."
  }
];

export const CATEGORIAS_LIST = [
  { id: "todos", nombre: "Todos los Flanes", icono: "🍮" },
  { id: "Clásicos", nombre: "Clásicos Porteños", icono: "🥄" },
  { id: "Especiales", nombre: "Ediciones Especiales", icono: "🍫" }
];
