"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
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
  }, []);

  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>
          <div className="antialiased">
            {children}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
