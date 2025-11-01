"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { Footer } from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <CartProvider>
        <FavoritesProvider>
          <div className="antialiased">
            <Navigation />
            {children}
            <Footer />
          </div>
        </FavoritesProvider>
      </CartProvider>
    </SessionProvider>
  );
}
