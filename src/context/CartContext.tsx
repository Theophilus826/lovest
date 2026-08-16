
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Product } from "../types/Product";

// =====================================
// TYPES
// =====================================

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  subtotal: number;

  addToCart: (product: Product, qty?: number) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

interface CartProviderProps {
  children: ReactNode;
}

// =====================================
// CONTEXT
// =====================================

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

// =====================================
// STORAGE KEY
// =====================================

const CART_STORAGE_KEY = "cart";

// =====================================
// CART PROVIDER
// =====================================

export function CartProvider({
  children,
}: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // =====================================
  // LOAD CART
  // =====================================

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(
        CART_STORAGE_KEY
      );

      if (!savedCart) {
        setCart([]);
        return;
      }

      const parsedCart = JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        setCart([]);
        localStorage.removeItem(
          CART_STORAGE_KEY
        );
        return;
      }

      const validCart = parsedCart.filter(
        (item): item is CartItem =>
          item &&
          item.product &&
          typeof item.product._id === "string" &&
          typeof item.quantity === "number" &&
          item.quantity > 0
      );

      setCart(validCart);
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );

      setCart([]);
      localStorage.removeItem(
        CART_STORAGE_KEY
      );
    }
  }, []);

  // =====================================
  // SAVE CART
  // =====================================

  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  }, [cart]);

  // =====================================
  // ADD TO CART
  // =====================================

  const addToCart = (product: Product, qty = 1) => {
    if (product.stock <= 0) {
      return;
    }

    const quantityToAdd = Math.max(1, Math.floor(qty));

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product._id === product._id
      );

      // Product already exists
      if (existingItem) {
        // Already at or above stock limit
        if (existingItem.quantity >= product.stock) {
          return currentCart;
        }

        const newQuantity = Math.min(
          existingItem.quantity + quantityToAdd,
          product.stock
        );

        return currentCart.map((item) =>
          item.product._id === product._id
            ? {
                ...item,
                product,
                quantity: newQuantity,
              }
            : item
        );
      }

      // New product
      const initialQty = Math.min(quantityToAdd, product.stock);

      return [
        ...currentCart,
        {
          product,
          quantity: initialQty,
        },
      ];
    });
  };

  // =====================================
  // INCREASE QUANTITY
  // =====================================

  const increaseQuantity = (
    productId: string
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (
          item.product._id !== productId
        ) {
          return item;
        }

        if (
          item.quantity >=
          item.product.stock
        ) {
          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity + 1,
        };
      })
    );
  };

  // =====================================
  // DECREASE QUANTITY
  // =====================================

  const decreaseQuantity = (
    productId: string
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (
          item.product._id !== productId
        ) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(
            1,
            item.quantity - 1
          ),
        };
      })
    );
  };

  // =====================================
  // REMOVE ITEM
  // =====================================

  const removeItem = (
    productId: string
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.product._id !== productId
      )
    );
  };

  // =====================================
  // CLEAR CART
  // =====================================

  const clearCart = () => {
    setCart([]);
  };

  // =====================================
  // TOTAL ITEMS
  // =====================================

  const totalItems = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [cart]
  );

  // =====================================
  // SUBTOTAL
  // =====================================

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(item.product.price) *
            item.quantity,
        0
      ),
    [cart]
  );

  // =====================================
  // CONTEXT VALUE
  // =====================================

  const value: CartContextType = {
    cart,
    totalItems,
    subtotal,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// =====================================
// useCart HOOK
// =====================================

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider. Make sure CartProvider wraps your App."
    );
  }

  return context;
}

