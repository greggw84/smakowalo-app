"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface RecipeData {
  product: {
    id: number;
    name: string;
    description: string;
    image: string;
    active: boolean;
  };
  recipe: {
    id: string;
    name: string;
    servings: number;
    created_at: string;
  } | null;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    salt: number;
    allergens: string[];
    score: number;
  } | null;
  ingredients: Array<{
    id: string;
    ingredient_name: string;
    amount_grams: number;
  }>;
  steps: Array<{
    id: string;
    order: number;
    title: string;
    description: string;
  }>;
  generatedText: {
    short_description: string;
    long_description: string;
    health_benefits: string;
    substitutions: string;
  } | null;
}

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.productId;
  
  const [data, setData] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/nutrichef/products/${productId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Błąd podczas pobierania danych");
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nieznany błąd");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Ładowanie danych przepisu...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error || "Nie znaleziono danych"}</p>
          <Link
            href="/nutrichef"
            className="text-blue-600 hover:underline"
          >
            ← Powrót do listy
          </Link>
        </div>
      </div>
    );
  }

  const { product, recipe, nutrition, ingredients, steps, generatedText } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/nutrichef"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Powrót do listy produktów
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-6">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 mb-3">{product.description}</p>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    product.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {product.active ? "Aktywne" : "Nieaktywne"}
                </span>
                {recipe && (
                  <span className="px-3 py-1 text-sm font-medium rounded bg-blue-100 text-blue-800">
                    Przepis: {recipe.servings} porcji
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {!recipe ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <p className="text-amber-800 font-medium">
              ⚠️ Brak wygenerowanego przepisu dla tego produktu
            </p>
            <p className="text-amber-600 mt-2 text-sm">
              Wróć do listy i kliknij &quot;Wygeneruj&quot; przy tym produkcie.
            </p>
          </div>
        ) : (
          <>
            {/* Short & Long Description */}
            {generatedText && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  📝 Opis
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Krótki opis
                    </h3>
                    <p className="text-gray-800">{generatedText.short_description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Pełny opis
                    </h3>
                    <p className="text-gray-800">{generatedText.long_description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nutrition */}
            {nutrition && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  🥗 Wartości odżywcze
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {nutrition.calories}
                    </p>
                    <p className="text-sm text-gray-600">kcal</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {nutrition.protein}g
                    </p>
                    <p className="text-sm text-gray-600">Białko</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {nutrition.fat}g
                    </p>
                    <p className="text-sm text-gray-600">Tłuszcz</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {nutrition.carbs}g
                    </p>
                    <p className="text-sm text-gray-600">Węglowodany</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {nutrition.fiber}g
                    </p>
                    <p className="text-sm text-gray-600">Błonnik</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {nutrition.salt}g
                    </p>
                    <p className="text-sm text-gray-600">Sól</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 text-center col-span-2">
                    <p className="text-2xl font-bold text-emerald-600">
                      {nutrition.score}/100
                    </p>
                    <p className="text-sm text-gray-600">Wynik zdrowotny</p>
                  </div>
                </div>

                {/* Allergens */}
                {nutrition.allergens && nutrition.allergens.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      ⚠️ Alergeny
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {nutrition.allergens.map((allergen, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  📦 Składniki w pudełku
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <span className="text-gray-800">{ingredient.ingredient_name}</span>
                      <span className="font-medium text-gray-600">
                        {ingredient.amount_grams}g
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preparation Steps */}
            {steps.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  👨‍🍳 Instrukcje przygotowania
                </h2>
                <div className="space-y-4">
                  {steps
                    .sort((a, b) => a.order - b.order)
                    .map((step) => (
                      <div
                        key={step.id}
                        className="flex gap-4 items-start"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                          {step.order}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{step.title}</h3>
                          <p className="text-gray-600 mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Health Benefits & Substitutions */}
            {generatedText && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    💪 Korzyści zdrowotne
                  </h2>
                  <p className="text-gray-700">{generatedText.health_benefits}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    🔄 Możliwe zamienniki
                  </h2>
                  <p className="text-gray-700">{generatedText.substitutions}</p>
                </div>
              </div>
            )}

            {/* Recipe Metadata */}
            <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-500">
              <p>
                ID przepisu: <code className="bg-white px-2 py-0.5 rounded">{recipe.id}</code>
              </p>
              <p className="mt-1">
                Data utworzenia: {new Date(recipe.created_at).toLocaleDateString("pl-PL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
