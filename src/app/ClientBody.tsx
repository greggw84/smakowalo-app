"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { Footer } from "@/components/Footer";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";

    // Fix Google Auth redirect - remove hash and refresh page
    if (window.location.hash === '#') {
      window.history.replaceState(null, '', window.location.pathname);
      // Force session refetch after Google Auth
      window.dispatchEvent(new Event('focus'));
    }
  }, []);

  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gets focus (IMPORTANT for Google Auth redirect!)
    >
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <div className="antialiased">
              {children}
              <Footer />
            </div>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
