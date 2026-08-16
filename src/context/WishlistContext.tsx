
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { Product } from "../types/Product";

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;

  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({
  children,
}: WishlistProviderProps) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // =====================================
  // LOAD WISHLIST
  // =====================================

  useEffect(() => {
    const savedWishlist =
      localStorage.getItem("wishlist");

    if (!savedWishlist) {
      return;
    }

    try {
      const parsedWishlist =
        JSON.parse(savedWishlist);

      if (Array.isArray(parsedWishlist)) {
        setWishlist(parsedWishlist);
      }
    } catch (error) {
      console.error(
        "Failed to load wishlist:",
        error
      );

      localStorage.removeItem("wishlist");
    }
  }, []);

  // =====================================
  // SAVE WISHLIST
  // =====================================

  useEffect(() => {
    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  // =====================================
  // CHECK
  // =====================================

  const isInWishlist = (productId: string) => {
    return wishlist.some(
      (product) => product._id === productId
    );
  };

  // =====================================
  // TOGGLE
  // =====================================

  const toggleWishlist = (product: Product) => {
    setWishlist((currentWishlist) => {
      const exists = currentWishlist.some(
        (item) => item._id === product._id
      );

      if (exists) {
        return currentWishlist.filter(
          (item) => item._id !== product._id
        );
      }

      return [...currentWishlist, product];
    });
  };

  // =====================================
  // REMOVE
  // =====================================

  const removeFromWishlist = (
    productId: string
  ) => {
    setWishlist((currentWishlist) =>
      currentWishlist.filter(
        (product) => product._id !== productId
      )
    );
  };

  // =====================================
  // CLEAR
  // =====================================

  const clearWishlist = () => {
    setWishlist([]);
  };

  // =====================================
  // COUNT
  // =====================================

  const wishlistCount = useMemo(
    () => wishlist.length,
    [wishlist]
  );

  const value = {
    wishlist,
    wishlistCount,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// =====================================
// HOOK
// =====================================

export function useWishlist() {
  const context =
    useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}

