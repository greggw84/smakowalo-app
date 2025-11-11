import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontakt - Smakowało",
  description:
    "Skontaktuj się z nami. Masz pytania o nasze zestawy posiłków? Potrzebujesz pomocy z zamówieniem? Jesteśmy tutaj dla Ciebie!",
  openGraph: {
    title: "Kontakt - Smakowało",
    description:
      "Skontaktuj się z nami. Masz pytania o nasze zestawy posiłków? Potrzebujesz pomocy z zamówieniem?",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--smakowalo-cream)]">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link
              href="/"
              className="hover:text-[var(--smakowalo-green-primary)]"
            >
              Strona główna
            </Link>
            <span>/</span>
            <span className="text-[var(--smakowalo-green-dark)] font-medium">
              Kontakt
            </span>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <ContactForm />
    </div>
  );
}
