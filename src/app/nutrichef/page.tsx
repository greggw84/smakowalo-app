"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  active: boolean;
  calories: string | null;
  allergens: string[] | null;
  hasRecipe: boolean;
  recipeId?: string;
}

interface BatchResult {
  success: boolean;
  createdCount?: number;
  skippedCount?: number;
  totalProcessed?: number;
  errors?: Array<{
    productId: number;
    productName: string;
    error: string;
  }>;
  error?: string;
}

export default function NutriChefPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<number | null>(null);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

  // Fetch products and check for existing recipes
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/nutrichef/products");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Błąd podczas pobierania produktów");
      }

      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nieznany błąd");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Generate recipe for a single product
  const handleGenerateRecipe = async (product: Product) => {
    if (generating !== null) return;

    setGenerating(product.id);
    try {
      const response = await fetch("/api/generate-recipe-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: product.name,
          servings: 2,
          productId: product.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(`Błąd: ${data.error || "Nieznany błąd"}`);
        return;
      }

      // Refresh product list
      await fetchProducts();
      alert(`✅ Przepis wygenerowany pomyślnie dla: ${product.name}`);
    } catch (err) {
      alert(`Błąd: ${err instanceof Error ? err.message : "Nieznany błąd"}`);
    } finally {
      setGenerating(null);
    }
  };

  // Batch generate recipes for all active products
  const handleBatchGenerate = async () => {
    if (batchGenerating) return;

    const confirmed = window.confirm(
      "Czy na pewno chcesz wygenerować przepisy dla wszystkich aktywnych dań?\n\nTo może potrwać kilka minut."
    );

    if (!confirmed) return;

    setBatchGenerating(true);
    setBatchResult(null);

    try {
      const response = await fetch("/api/generate-recipe-data/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          servings: 2,
        }),
      });

      const data = await response.json();
      setBatchResult(data);

      // Refresh product list
      await fetchProducts();
    } catch (err) {
      setBatchResult({
        success: false,
        error: err instanceof Error ? err.message : "Nieznany błąd",
      });
    } finally {
      setBatchGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍽️ NutriChef - Panel Administracyjny
          </h1>
          <p className="text-gray-600">
            Zarządzanie danymi przepisów i wartościami odżywczymi dla Smakowało
          </p>
        </div>

        {/* Batch generation section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 Auto-generowanie dla całego menu
          </h2>
          <p className="text-gray-600 mb-4">
            Wygeneruj automatycznie dane przepisów dla wszystkich aktywnych dań,
            które jeszcze nie mają przypisanego przepisu.
          </p>

          <button
            onClick={handleBatchGenerate}
            disabled={batchGenerating || loading}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              batchGenerating || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } transition-colors`}
          >
            {batchGenerating
              ? "⏳ Generowanie w toku..."
              : "Wygeneruj przepisy dla wszystkich aktywnych dań"}
          </button>

          {/* Batch result */}
          {batchResult && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                batchResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {batchResult.success ? (
                <div>
                  <p className="font-medium text-green-800">
                    ✅ Generowanie zakończone
                  </p>
                  <ul className="mt-2 text-sm text-green-700">
                    <li>Utworzono: {batchResult.createdCount} przepisów</li>
                    <li>Pominięto: {batchResult.skippedCount} (już istnieją)</li>
                    <li>Przetworzono łącznie: {batchResult.totalProcessed} produktów</li>
                  </ul>
                  {batchResult.errors && batchResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-amber-700">
                        ⚠️ Błędy ({batchResult.errors.length}):
                      </p>
                      <ul className="mt-1 text-sm text-amber-600">
                        {batchResult.errors.map((err, idx) => (
                          <li key={idx}>
                            {err.productName}: {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-800">❌ Błąd: {batchResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Products list */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              📋 Lista produktów
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              ⏳ Ładowanie produktów...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              ❌ {error}
              <button
                onClick={fetchProducts}
                className="ml-4 text-blue-600 hover:underline"
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Brak produktów w bazie danych
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nazwa dania
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktywne
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kalorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alergeny
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Przepis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            product.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.active ? "Tak" : "Nie"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.calories || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.allergens && product.allergens.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.allergens.slice(0, 3).map((allergen, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded"
                              >
                                {allergen}
                              </span>
                            ))}
                            {product.allergens.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{product.allergens.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            product.hasRecipe
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.hasRecipe ? "✓ Tak" : "✗ Brak"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGenerateRecipe(product)}
                            disabled={generating !== null || product.hasRecipe}
                            className={`px-3 py-1.5 rounded text-xs font-medium ${
                              generating === product.id
                                ? "bg-yellow-100 text-yellow-800"
                                : product.hasRecipe
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-100 text-green-800 hover:bg-green-200"
                            } transition-colors`}
                          >
                            {generating === product.id
                              ? "⏳ Generowanie..."
                              : product.hasRecipe
                              ? "Wygenerowano"
                              : "🤖 Wygeneruj"}
                          </button>
                          {product.hasRecipe && (
                            <Link
                              href={`/nutrichef/${product.id}`}
                              className="px-3 py-1.5 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            >
                              👁️ Podgląd
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            NutriChef &copy; {new Date().getFullYear()} Smakowało - Wszystkie
            prawa zastrzeżone
          </p>
        </div>
      </div>
    </div>
  );
}
