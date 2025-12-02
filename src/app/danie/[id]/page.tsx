"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Navigation from "@/components/Navigation"
import ProductImage from "@/components/ProductImage"
import { ArrowLeft, Clock, Users, ChefHat, Zap, Flame, AlertTriangle, UtensilsCrossed, Leaf, BarChart2 } from "lucide-react"
import { ProductDetailSkeleton } from "@/components/Loading"
import { ErrorFallback } from "@/components/ErrorBoundary"
import { trackEvent } from "@/components/Analytics"

// Interface for ingredient with quantity
interface IngredientWithQuantity {
  name: string
  grams?: number
}

// Interface for NutriChef generated data
interface NutriChefData {
  recipe: {
    id: string
    name: string
    servings: number
    created_at: string
  } | null
  nutrition: {
    calories: number
    protein: number
    fat: number
    carbs: number
    fiber: number
    salt: number
    allergens: string[]
    score: number
  } | null
  ingredients: Array<{
    id: string
    ingredient_name: string
    amount_grams: number
  }>
  steps: Array<{
    id: string
    order: number
    title: string
    description: string
    // TODO: Add step_image field to Supabase schema for step images
    image?: string
  }>
  generatedText: {
    short_description: string
    long_description: string
    health_benefits: string
    substitutions: string
  } | null
}

// Interface for dish data
interface DishData {
  id: number
  name: string
  description: string
  shortDescription?: string
  image: string
  cookTime: number
  servings: number
  difficulty: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  price: number
  category: string
  diets: string[]
  allergens: string[]
  ingredients: string[]
  ingredientsWithQuantity?: IngredientWithQuantity[]
  // TODO: Add ingredient grouping support (e.g., "included in box", "not included")
  ingredientsInBox?: IngredientWithQuantity[]
  ingredientsNotIncluded?: string[]
  equipment?: string[]
  instructions: Array<{
    step: number
    title?: string
    description: string
    image?: string
  }>
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    salt?: number
  }
  tags: string[]
  rating?: number
  nutritionPer100g?: {
    energy: string
    fat: string
    saturatedFat: string
    carbs: string
    sugar: string
    protein: string
    salt: string
  }
  // TODO: Add these fields to Supabase schema if not present
  badges?: string[] // e.g., ["High Protein", "Flexitarian"]
  // NutriChef-specific fields
  healthScore?: number
  healthBenefits?: string
  substitutions?: string
  hasNutriChefData?: boolean
}

// Difficulty level badge styles
function getDifficultyStyle(difficulty: string) {
  switch (difficulty?.toLowerCase()) {
    case 'łatwy':
    case 'easy':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'średni':
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'trudny':
    case 'hard':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// Diet badge styles
function getDietBadgeStyle(diet: string) {
  switch (diet?.toLowerCase()) {
    case 'keto':
      return 'bg-purple-100 text-purple-700'
    case 'wegetariańska':
    case 'vegetarian':
      return 'bg-green-100 text-green-700'
    case 'wegańska':
    case 'vegan':
      return 'bg-emerald-100 text-emerald-700'
    case 'niskowęglowodanowa':
    case 'low carb':
      return 'bg-blue-100 text-blue-700'
    case 'wysokobiałkowa':
    case 'high protein':
      return 'bg-orange-100 text-orange-700'
    case 'zdrowa':
    case 'healthy':
      return 'bg-teal-100 text-teal-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// Recipe Hero Section Component
function RecipeHero({ dish }: { dish: DishData }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <ProductImage
          src={dish.image}
          alt={dish.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Title overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
            {dish.name}
          </h1>
          {dish.shortDescription && (
            <p className="text-sm md:text-base opacity-90 max-w-2xl">
              {dish.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* Meta Row */}
      <RecipeMeta dish={dish} />
    </div>
  )
}

// Recipe Meta Row Component - displays key stats
function RecipeMeta({ dish }: { dish: DishData }) {
  return (
    <div className="p-4 md:p-6 border-t border-gray-100">
      <div className="flex flex-wrap items-center gap-3 md:gap-6">
        {/* Time */}
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="h-5 w-5 text-[var(--smakowalo-green-primary)]" />
          <div>
            <span className="font-semibold">{dish.cookTime}</span>
            <span className="text-sm text-gray-500 ml-1">min</span>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200 hidden md:block" />

        {/* Calories */}
        <div className="flex items-center gap-2 text-gray-700">
          <Flame className="h-5 w-5 text-orange-500" />
          <div>
            <span className="font-semibold">{dish.calories}</span>
            <span className="text-sm text-gray-500 ml-1">kcal</span>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200 hidden md:block" />

        {/* Protein */}
        <div className="flex items-center gap-2 text-gray-700">
          <BarChart2 className="h-5 w-5 text-blue-500" />
          <div>
            <span className="font-semibold">{dish.protein}</span>
            <span className="text-sm text-gray-500 ml-1">g białka</span>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200 hidden md:block" />

        {/* Difficulty */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyStyle(dish.difficulty)}`}>
          {dish.difficulty || 'Średni'}
        </div>

        {/* Servings */}
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="h-5 w-5 text-[var(--smakowalo-green-primary)]" />
          <div>
            <span className="font-semibold">{dish.servings}</span>
            <span className="text-sm text-gray-500 ml-1">os.</span>
          </div>
        </div>
      </div>

      {/* Diet badges */}
      {dish.diets && dish.diets.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {dish.diets.map((diet, index) => (
            <span
              key={`meta-diet-${diet}-${index}`}
              className={`px-3 py-1 rounded-full text-xs font-medium ${getDietBadgeStyle(diet)}`}
            >
              {diet}
            </span>
          ))}
          {/* Additional badges if available */}
          {dish.badges?.map((badge, index) => (
            <span
              key={`meta-badge-${badge}-${index}`}
              className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Section Header Component for consistent styling
function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-[var(--smakowalo-green-primary)]/10 text-[var(--smakowalo-green-primary)]">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[var(--smakowalo-green-dark)]">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

// Cooking Steps Grid Component
function CookingStepsGrid({ instructions, openCartData }: { 
  instructions: DishData['instructions'], 
  openCartData: any 
}) {
  const steps = openCartData?.preparation_instructions || instructions

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {steps.map((instruction: any, index: number) => (
        <div 
          key={`step-${instruction.step || index}`} 
          className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          {/* Step number header */}
          <div className="bg-gradient-to-r from-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)] px-4 py-2 flex items-center justify-between">
            <span className="text-white font-bold">Krok {instruction.step || index + 1}</span>
            {instruction.time && (
              <span className="text-white/90 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {instruction.time}
              </span>
            )}
          </div>

          <div className="p-4">
            {instruction.title && (
              <h4 className="font-semibold text-[var(--smakowalo-green-dark)] mb-2">
                {instruction.title}
              </h4>
            )}
            
            <p className="text-gray-700 text-sm leading-relaxed">
              {instruction.description}
            </p>

            {/* Step image if available */}
            {instruction.image && (
              <div className="mt-4 relative h-40 rounded-lg overflow-hidden">
                <Image
                  src={instruction.image}
                  alt={`Krok ${instruction.step}: ${instruction.title || ''}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Tips */}
            {instruction.tips && instruction.tips.length > 0 && (
              <div className="mt-4 bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs font-semibold text-amber-800 mb-1">💡 Wskazówka</p>
                <ul className="text-sm text-amber-700 space-y-1">
                  {instruction.tips.map((tip: string, tipIndex: number) => (
                    <li key={`tip-${tipIndex}`}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Dane dań z OpenCart (w prawdziwej aplikacji byłyby pobierane z API)
const dishesData: { [key: string]: DishData } = {
  "61": {
    id: 61,
    name: "Kurczak Tikka Masala z Curry z ryżem z kalafiora i kolendrą",
    description: "Soczyste kawałki kurczaka w aromatycznym sosie tikka masala z ryżem z kalafiora i świeżą kolendrą",
    image: "https://ext.same-assets.com/3234956792/2143887936.png",
    cookTime: 30,
    servings: 2,
    difficulty: "Średni",
    calories: 398,
    price: 35.00,
    rating: 4.8,
    protein: 19,
    carbs: 12,
    fat: 6,
    fiber: 3,
    category: "Kurczak",
    diets: ["Keto", "Niskowęglowodanowa"],
    nutrition: {
      calories: 398,
      protein: 19,
      carbs: 12,
      fat: 6,
      fiber: 3
    },
    tags: ["Kurczak", "Indyjskie", "Keto"],
    nutritionPer100g: {
      energy: "97.7 kcal",
      fat: "3.2 g",
      saturatedFat: "1.5 g",
      carbs: "6 g",
      sugar: "1.2 g",
      protein: "9.5 g",
      salt: "0.6 g"
    },
    ingredients: [
      "Kurczak",
      "Pasta tikka",
      "Kalafior",
      "Kolendra",
      "Pomidory",
      "Cebula czerwona",
      "Śmietana kwaszona",
      "Czosnek",
      "Imbir"
    ],
    allergens: [],
    equipment: [
      "Tarka z grubymi oczkami",
      "Średnia patelnia",
      "Wyciskarka do czosnku",
      "Deska do krojenia",
      "Nóż kuchenny"
    ],
    instructions: [
      {
        step: 1,
        title: "Przygotowanie składników",
        description: "Zetrzyj różyczki kalafiora na grubych oczkach tarki, aby uzyskać \"ryż\" (jeśli masz procesor do żywności, możesz go również użyć). Przekrój na pół, obierz i cienko pokrój czerwoną cebulę. Pokrój pomidora na kawałki o długości 1 cm."
      },
      {
        step: 2,
        title: "Smażenie kurczaka",
        description: "Przekrój kurczaka na grube plasterki o szerokości 2 cm. Rozgrzej średnią patelnię na średnio-wysokim ogniu z odrobiną oleju. Gdy patelnia się rozgrzeje, dodaj kurczaka i cebulę, następnie smaż przez 5-7 minut, aż się zarumienią. Dopraw solą i pieprzem. Okazjonalnie mieszaj. WAŻNE: Umij ręce i sprzęt po kontakcie z surowym kurczakiem i jego opakowaniem."
      },
      {
        step: 3,
        title: "Dodanie past i sosu",
        description: "Gdy kurczak się zarumieni, zmniejsz ogień do średniego, dodaj pastę tikka i gotuj, aż będzie pachnąca, przez 1 minutę. Dodaj przecier pomidorowy, pomidora i wodę (patrz spiżarnia). Doprowadź do wrzenia, wymieszaj, zmniejsz ogień i gotuj na małym ogniu przez 5-6 minut. WAŻNE: Kurczak jest gotowy, gdy nie jest różowy w środku."
      },
      {
        step: 4,
        title: "Przygotowanie kolendry",
        description: "W międzyczasie, grubo posiekaj kolendrę (łącznie z łodygami)."
      },
      {
        step: 5,
        title: "Ryż z kalafiora",
        description: "Podczas gdy curry się gotuje, rozgrzej inną średnią patelnię na średnio-wysokim ogniu z odrobiną oleju. Gdy patelnia się rozgrzeje, dodaj ryż z kalafiora i gotuj, aż będzie lekko miękki, przez 2-3 minuty. Wymieszaj połowę kolendry. Dopraw solą i pieprzem. Wymieszaj śmietanę kwaszoną z sosem tikka, aby się podgrzała, przez 1 minutę. Dopraw solą i pieprzem."
      },
      {
        step: 6,
        title: "Podanie",
        description: "Podać kurczaka tikka masala curry w miseczkach obok ryżu z kalafiora i kolendry. Posypać pozostałą kolendrą."
      }
    ]
  },
  "58": {
    id: 58,
    name: "Krewetki z Harissą i Miodem z Ryżem z Kalafiora i Greckim Jogurtem",
    description: "Pikantne krewetki w sosie harissa z miodem, podawane z ryżem z kalafiora i chłodzącym greckim jogurtem",
    image: "https://ext.same-assets.com/3234956792/1990706172.png",
    cookTime: 25,
    servings: 2,
    difficulty: "Średni",
    calories: 420,
    price: 35.00,
    rating: 4.7,
    protein: 25,
    carbs: 16,
    fat: 8,
    fiber: 4,
    category: "Krewetki",
    diets: ["Keto", "Niskowęglowodanowa"],
    nutrition: {
      calories: 420,
      protein: 25,
      carbs: 16,
      fat: 8,
      fiber: 4
    },
    tags: ["Krewetki", "Morska", "Keto"],
    nutritionPer100g: {
      energy: "105 kcal",
      fat: "4.2 g",
      saturatedFat: "1.1 g",
      carbs: "8 g",
      sugar: "6.2 g",
      protein: "12.5 g",
      salt: "0.8 g"
    },
    ingredients: [
      "Krewetki",
      "Pasta harissa",
      "Miód",
      "Kalafior",
      "Jogurt grecki",
      "Cytryna",
      "Oliwa z oliwek",
      "Kolendra",
      "Czosnek"
    ],
    allergens: ["skorupiaki"],
    equipment: [
      "Tarka z grubymi oczkami",
      "Duża patelnia",
      "Miska do mieszania",
      "Deska do krojenia",
      "Nóż kuchenny"
    ],
    instructions: [
      {
        step: 1,
        title: "Przygotowanie składników",
        description: "Zetrzyj kalafior na grubych oczkach tarki. Oczyść krewetki i osusz je papierem kuchennym. Wymieszaj pastę harissa z miodem w małej misce."
      },
      {
        step: 2,
        title: "Marynowanie krewetek",
        description: "Polej krewetki mieszanką harissa-miód i zostaw na 10 minut do zamarynowania."
      },
      {
        step: 3,
        title: "Smażenie krewetek",
        description: "Rozgrzej patelnię z oliwą na średnio-wysokim ogniu. Smaż krewetki przez 2-3 minuty z każdej strony, aż będą różowe i przepieczone."
      },
      {
        step: 4,
        title: "Ryż z kalafiora",
        description: "Na tej samej patelni dodaj startowany kalafior i smaż przez 3-4 minuty, aż będzie miękki. Dopraw solą i pieprzem."
      },
      {
        step: 5,
        title: "Podanie",
        description: "Podawaj krewetki na ryżu z kalafiora z łyżką greckiego jogurtu i posypaną kolendrą. Polej sokiem z cytryny."
      }
    ]
  },
  "70": {
    id: 70,
    name: "Świeży łosoś na łóżku cytrynowego risotto z dodatkiem tenderstem i groszku",
    description: "Pieczony łosoś na kremowym cytrynowym risotto z tenderstem broccoli i świeżym groszkiem",
    image: "https://ext.same-assets.com/3234956792/2644930272.png",
    cookTime: 35,
    servings: 2,
    difficulty: "Trudny",
    calories: 520,
    price: 42.00,
    rating: 4.9,
    protein: 30,
    carbs: 24,
    fat: 17,
    fiber: 5,
    category: "Ryby",
    diets: ["Zdrowa"],
    nutrition: {
      calories: 520,
      protein: 30,
      carbs: 24,
      fat: 17,
      fiber: 5
    },
    tags: ["Łosoś", "Risotto", "Zdrowa"],
    nutritionPer100g: {
      energy: "160 kcal",
      fat: "8.5 g",
      saturatedFat: "2.8 g",
      carbs: "12 g",
      sugar: "2.1 g",
      protein: "15.2 g",
      salt: "0.9 g"
    },
    ingredients: [
      "Łosoś świeży",
      "Ryż risotto (Arborio)",
      "Cytryna",
      "Tenderstem broccoli",
      "Groszek zielony",
      "Parmezan",
      "Bulion rybny",
      "Białe wino",
      "Masło",
      "Cebula"
    ],
    allergens: ["ryby", "mleko"],
    equipment: [
      "Patelnia do risotto",
      "Patelnia do łososia",
      "Warzącha",
      "Deska do krojenia",
      "Nóż ostry"
    ],
    instructions: [
      {
        step: 1,
        title: "Przygotowanie risotto",
        description: "Pokrój drobno cebulę. W patelni rozgrzej masło i podsmaż cebulę przez 2 minuty. Dodaj ryż i smaż przez minutę, mieszając."
      },
      {
        step: 2,
        title: "Gotowanie risotto",
        description: "Dodaj białe wino i mieszaj, aż się wchłonie. Dodawaj ciepły bulion łyżka po łyżce, ciągle mieszając, przez około 18-20 minut."
      },
      {
        step: 3,
        title: "Cytrynowe wykończenie",
        description: "Pod koniec gotowania dodaj skórkę z cytryny, sok z cytryny i tarty parmezan. Dopraw solą i pieprzem."
      },
      {
        step: 4,
        title: "Przygotowanie łososia",
        description: "Dopraw łosoś solą i pieprzem. Smaż na rozgrzanej patelni z oliwą po 4-5 minut z każdej strony."
      },
      {
        step: 5,
        title: "Warzywa",
        description: "Ugotuj tenderstem broccoli i groszek we wrzącej, osolonej wodzie przez 3-4 minuty."
      },
      {
        step: 6,
        title: "Podanie",
        description: "Podawaj łosoś na risotto z warzywami. Udekoruj plasterkami cytryny."
      }
    ]
  }
}

// Modify the props type to match the PageProps constraint
interface DishPageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DishPage({ params }: DishPageProps) {
  const { id } = await params;

  return <DishPageClient dishId={id} />
}

function DishPageClient({ dishId }: { dishId: string }) {
  const [dish, setDish] = useState<DishData | null>(null);
  const [openCartData, setOpenCartData] = useState<any>(null);
  const [loadingInstructions, setLoadingInstructions] = useState(false);

  useEffect(() => {
    // Fetch the correct product from the products API (same as menu page)
    fetchCorrectProduct(dishId);
  }, [dishId]);

  // Track product view when dish data is loaded
  useEffect(() => {
    if (dish) {
      trackEvent.viewProduct(
        dish.id.toString(),
        dish.name,
        dish.price
      );
    }
  }, [dish]);

  const fetchCorrectProduct = async (productId: string) => {
    try {
      setLoadingInstructions(true);

      // PRIORITY 1: Fetch from products list API (same as menu page) to get base product data
      const productsResponse = await fetch('/api/products');
      let baseProduct = null;

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        if (productsData.success && productsData.products) {
          baseProduct = productsData.products.find((p: any) => p.id === Number.parseInt(productId));
          console.log(`📸 Product ${productId} - Base product data:`, baseProduct?.name);
        }
      }

      // PRIORITY 2: Fetch NutriChef generated data (nutrition with grams, instructions, etc.)
      let nutriChefData: NutriChefData | null = null;
      try {
        const nutriChefResponse = await fetch(`/api/nutrichef/products/${productId}`);
        if (nutriChefResponse.ok) {
          const nutriChefResult = await nutriChefResponse.json();
          if (nutriChefResult.success && nutriChefResult.data?.recipe) {
            nutriChefData = nutriChefResult.data;
            console.log(`🍽️ NutriChef data found for product ${productId}:`, {
              hasNutrition: !!nutriChefData?.nutrition,
              ingredientsCount: nutriChefData?.ingredients?.length || 0,
              stepsCount: nutriChefData?.steps?.length || 0,
            });
          }
        }
      } catch (error) {
        console.log(`⚠️ NutriChef data not available for product ${productId}`);
      }

      // PRIORITY 3: Try to fetch detailed instructions from OpenCart API (legacy fallback)
      const opencartResponse = await fetch(`/api/opencart/product/${productId}`);
      let opencartProduct = null;
      if (opencartResponse.ok) {
        const opencartData = await opencartResponse.json();
        if (opencartData.success && opencartData.product?.preparation_instructions) {
          opencartProduct = opencartData.product;
        }
      }

      // Build dish data with NutriChef data taking priority for nutrition and ingredients
      if (baseProduct || nutriChefData) {
        const dishData: DishData = {
          id: Number.parseInt(productId),
          name: baseProduct?.name || nutriChefData?.recipe?.name || `Przepis ${productId}`,
          description: nutriChefData?.generatedText?.long_description || baseProduct?.description || "Opis dania",
          shortDescription: nutriChefData?.generatedText?.short_description || baseProduct?.short_description,
          image: baseProduct?.image || "https://ext.same-assets.com/817389662/206723592.jpeg",
          cookTime: baseProduct?.cook_time || 30,
          servings: nutriChefData?.recipe?.servings || baseProduct?.servings || 2,
          difficulty: baseProduct?.difficulty || "Średni",
          // Use NutriChef nutrition if available, otherwise fall back to base product
          calories: nutriChefData?.nutrition?.calories || baseProduct?.calories || 400,
          protein: nutriChefData?.nutrition?.protein || baseProduct?.protein || 20,
          carbs: nutriChefData?.nutrition?.carbs || baseProduct?.carbs || 25,
          fat: nutriChefData?.nutrition?.fat || baseProduct?.fat || 15,
          fiber: nutriChefData?.nutrition?.fiber || baseProduct?.fiber || 5,
          price: baseProduct?.price || 35.00,
          rating: baseProduct?.rating || 4.5,
          category: baseProduct?.categories?.name || "Dania",
          diets: baseProduct?.diets || ["Zdrowa"],
          // Use NutriChef allergens if available
          allergens: nutriChefData?.nutrition?.allergens || baseProduct?.allergens || [],
          // Basic ingredient names
          ingredients: nutriChefData?.ingredients?.map(ing => ing.ingredient_name) || 
                       baseProduct?.ingredients || 
                       ["Składniki będą dostępne wkrótce"],
          // Ingredients with quantities from NutriChef
          ingredientsWithQuantity: nutriChefData?.ingredients?.map(ing => ({
            name: ing.ingredient_name,
            grams: ing.amount_grams,
          })),
          equipment: baseProduct?.equipment || opencartProduct?.equipment_needed || ["Podstawowe wyposażenie kuchni"],
          // Use NutriChef steps if available, otherwise OpenCart or base product
          instructions: nutriChefData?.steps?.length ? 
            nutriChefData.steps.map(step => ({
              step: step.order,
              title: step.title,
              description: step.description,
            })) :
            opencartProduct?.preparation_instructions?.map((inst: any) => ({
              step: inst.step,
              title: inst.title,
              description: inst.description,
            })) ||
            baseProduct?.instructions || [
              {
                step: 1,
                title: "Przygotowanie",
                description: "Szczegółowe instrukcje przygotowania będą dostępne wkrótce.",
              },
            ],
          nutrition: {
            calories: nutriChefData?.nutrition?.calories || baseProduct?.calories || 400,
            protein: nutriChefData?.nutrition?.protein || baseProduct?.protein || 20,
            carbs: nutriChefData?.nutrition?.carbs || baseProduct?.carbs || 25,
            fat: nutriChefData?.nutrition?.fat || baseProduct?.fat || 15,
            fiber: nutriChefData?.nutrition?.fiber || baseProduct?.fiber || 5,
            salt: nutriChefData?.nutrition?.salt,
          },
          tags: baseProduct?.tags || [],
          // Convert per-serving values to per-100g estimates (assuming ~400g average serving)
          nutritionPer100g: baseProduct?.nutrition_per_100g || (() => {
            // Approximate divisor to convert per-serving to per-100g (assuming ~400g serving = divisor of 4)
            const SERVING_TO_100G_DIVISOR = 4;
            const cal = nutriChefData?.nutrition?.calories || 400;
            const fat = nutriChefData?.nutrition?.fat || 15;
            const carb = nutriChefData?.nutrition?.carbs || 25;
            const prot = nutriChefData?.nutrition?.protein || 20;
            const slt = nutriChefData?.nutrition?.salt || 1.5;
            return {
              energy: `${Math.round(cal / SERVING_TO_100G_DIVISOR)} kcal`,
              fat: `${(fat / SERVING_TO_100G_DIVISOR).toFixed(1)} g`,
              saturatedFat: "2 g",
              carbs: `${(carb / SERVING_TO_100G_DIVISOR).toFixed(1)} g`,
              sugar: "3 g",
              protein: `${(prot / SERVING_TO_100G_DIVISOR).toFixed(1)} g`,
              salt: `${(slt / SERVING_TO_100G_DIVISOR).toFixed(2)} g`,
            };
          })(),
          // NutriChef-specific fields
          healthScore: nutriChefData?.nutrition?.score,
          healthBenefits: nutriChefData?.generatedText?.health_benefits,
          substitutions: nutriChefData?.generatedText?.substitutions,
          hasNutriChefData: !!nutriChefData?.recipe,
        };

        setDish(dishData);
        return;
      }

      // No product found in any API - use fallback
      setDish(createFallbackDish(productId));
    } catch (error) {
      console.error('Error fetching product:', error);
      setDish(createFallbackDish(productId));
    } finally {
      setLoadingInstructions(false);
    }
  };

  const createFallbackDish = (productId: string): DishData => {
    return {
      id: Number.parseInt(productId),
      name: `Przepis ${productId}`,
      description: "Ten przepis jest aktualnie przygotowywany. Sprawdź ponownie wkrótce!",
      image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      cookTime: 30,
      servings: 2,
      difficulty: "Średni",
      calories: 400,
      protein: 20,
      carbs: 25,
      fat: 15,
      fiber: 5,
      price: 35.00,
      rating: 4.5,
      category: "Przepisy",
      diets: ["Zdrowa"],
      allergens: [],
      ingredients: ["Składniki będą dostępne wkrótce"],
      equipment: ["Podstawowe wyposażenie kuchni"],
      instructions: [
        { step: 1, title: "Przygotowanie", description: "Szczegółowe instrukcje będą dostępne wkrótce." }
      ],
      nutrition: {
        calories: 400,
        protein: 20,
        carbs: 25,
        fat: 15,
        fiber: 5
      },
      tags: ["Wkrótce"],
      nutritionPer100g: {
        energy: "120 kcal",
        fat: "6 g",
        saturatedFat: "2 g",
        carbs: "12 g",
        sugar: "3 g",
        protein: "10 g",
        salt: "0.5 g"
      }
    };
  };

  const fetchOpenCartInstructions = async (productId: string) => {
    try {
      setLoadingInstructions(true);
      const response = await fetch(`/api/opencart/product/${productId}`);
      if (response.ok) {
        const apiData = await response.json();
        setOpenCartData(apiData);

        // Convert OpenCart API data to dish format
        if (apiData.data) {
          const convertedDish: DishData = {
            id: Number.parseInt(productId),
            name: apiData.data.name || `Danie ${productId}`,
            description: apiData.data.description || "Opis niedostępny",
            image: apiData.data.main_image || "https://ext.same-assets.com/817389662/206723592.jpeg",
            cookTime: apiData.data.nutrition_info?.cook_time || 30,
            servings: apiData.data.nutrition_info?.servings || 2,
            difficulty: apiData.data.nutrition_info?.difficulty || "Średni",
            calories: apiData.data.nutrition_info?.calories || 400,
            protein: 20,
            carbs: 25,
            fat: 15,
            fiber: 5,
            price: 35.00,
            rating: 4.5,
            category: "OpenCart",
            diets: ["Zdrowa"],
            allergens: [],
            ingredients: apiData.data.ingredients?.map((ing: any) => ing.name) || ["Składniki z OpenCart"],
            equipment: apiData.data.equipment_needed || ["Podstawowe wyposażenie kuchni"],
            instructions: apiData.data.preparation_instructions?.map((inst: any) => ({
              step: inst.step,
              title: inst.title,
              description: inst.description
            })) || [{ step: 1, title: "Przygotowanie", description: "Instrukcje dostępne w OpenCart" }],
            nutrition: {
              calories: apiData.data.nutrition_info?.calories || 400,
              protein: 20,
              carbs: 25,
              fat: 15,
              fiber: 5
            },
            tags: ["OpenCart"],
            nutritionPer100g: {
              energy: "120 kcal",
              fat: "6 g",
              saturatedFat: "2 g",
              carbs: "12 g",
              sugar: "3 g",
              protein: "10 g",
              salt: "0.5 g"
            }
          };
          setDish(convertedDish);
        }
      }
    } catch (error) {
      console.error('Error fetching OpenCart data:', error);
      // Fallback: create a basic dish object
      const fallbackDish: DishData = {
        id: Number.parseInt(productId),
        name: `Przepis ${productId}`,
        description: "Ten przepis jest aktualnie przygotowywany. Sprawdź ponownie wkrótce!",
        image: "https://ext.same-assets.com/817389662/206723592.jpeg",
        cookTime: 30,
        servings: 2,
        difficulty: "Średni",
        calories: 400,
        protein: 20,
        carbs: 25,
        fat: 15,
        fiber: 5,
        price: 35.00,
        rating: 4.5,
        category: "Przepisy",
        diets: ["Zdrowa"],
        allergens: [],
        ingredients: ["Składniki będą dostępne wkrótce"],
        equipment: ["Podstawowe wyposażenie kuchni"],
        instructions: [
          { step: 1, title: "Przygotowanie", description: "Szczegółowe instrukcje będą dostępne wkrótce." }
        ],
        nutrition: {
          calories: 400,
          protein: 20,
          carbs: 25,
          fat: 15,
          fiber: 5
        },
        tags: ["Wkrótce"],
        nutritionPer100g: {
          energy: "120 kcal",
          fat: "6 g",
          saturatedFat: "2 g",
          carbs: "12 g",
          sugar: "3 g",
          protein: "10 g",
          salt: "0.5 g"
        }
      };
      setDish(fallbackDish);
    } finally {
      setLoadingInstructions(false);
    }
  };

  if (loadingInstructions || !dish) {
    return (
      <div className="min-h-screen bg-[var(--smakowalo-cream)]">
        {/* Navigation skeleton */}
        <div className="h-16 bg-white border-b"></div>
        {/* Breadcrumb skeleton */}
        <div className="h-12 bg-white border-b"></div>
        {/* Content skeleton */}
        <ProductDetailSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--smakowalo-cream)]">
      <Navigation currentPage="/menu" />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[var(--smakowalo-green-primary)]">Strona główna</Link>
            <span>/</span>
            <Link href="/menu" className="hover:text-[var(--smakowalo-green-primary)]">Menu</Link>
            <span>/</span>
            <span className="text-[var(--smakowalo-green-dark)] font-medium truncate max-w-[200px] md:max-w-none">{dish.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Back button */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/menu" className="flex items-center text-[var(--smakowalo-green-primary)] hover:text-[var(--smakowalo-green-dark)] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Powrót do menu
          </Link>
        </div>

        {/* Main Layout - Responsive grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main content - takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section with Image and Meta */}
            <RecipeHero dish={dish} />

            {/* Description Section */}
            {dish.description && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <SectionHeader 
                    icon={<Leaf className="w-5 h-5" />} 
                    title="Opis przepisu" 
                  />
                  <p className="text-gray-700 leading-relaxed">
                    {dish.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Cooking Steps Section */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <SectionHeader 
                  icon={<ChefHat className="w-5 h-5" />} 
                  title="Instrukcje przygotowania" 
                  subtitle={`${dish.instructions.length} kroków`}
                />
                <CookingStepsGrid 
                  instructions={dish.instructions} 
                  openCartData={openCartData} 
                />

                {/* Chef Notes */}
                {openCartData?.chef_notes && (
                  <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      <span className="text-lg">👨‍🍳</span> Notatki szefa kuchni
                    </h4>
                    <ul className="space-y-2">
                      {openCartData.chef_notes.map((note: string, index: number) => (
                        <li key={`chef-note-${index}`} className="text-green-700 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Benefits and Substitutions on mobile - shown below main content */}
            <div className="lg:hidden space-y-6">
              {dish.healthBenefits && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <SectionHeader 
                      icon={<Leaf className="w-5 h-5" />} 
                      title="Korzyści zdrowotne" 
                    />
                    <p className="text-gray-700 leading-relaxed">{dish.healthBenefits}</p>
                  </CardContent>
                </Card>
              )}

              {dish.substitutions && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <SectionHeader 
                      icon={<UtensilsCrossed className="w-5 h-5" />} 
                      title="Możliwe zamienniki" 
                    />
                    <p className="text-gray-700 leading-relaxed">{dish.substitutions}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - stacks below on mobile */}
          <div className="space-y-6">
            {/* Nutrition per serving */}
            <Card className="border-0 shadow-lg sticky top-4">
              <CardContent className="p-6">
                <SectionHeader 
                  icon={<BarChart2 className="w-5 h-5" />} 
                  title="Wartości odżywcze" 
                  subtitle={`Na porcję (${dish.servings} os.)`}
                />
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-orange-600">{dish.nutrition.calories}</p>
                    <p className="text-xs text-gray-600">kcal</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-red-600">{dish.nutrition.protein}g</p>
                    <p className="text-xs text-gray-600">Białko</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-yellow-600">{dish.nutrition.fat}g</p>
                    <p className="text-xs text-gray-600">Tłuszcz</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-blue-600">{dish.nutrition.carbs}g</p>
                    <p className="text-xs text-gray-600">Węglowodany</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-green-600">{dish.nutrition.fiber}g</p>
                    <p className="text-xs text-gray-600">Błonnik</p>
                  </div>
                  {dish.nutrition.salt !== undefined && (
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-purple-600">{dish.nutrition.salt}g</p>
                      <p className="text-xs text-gray-600">Sól</p>
                    </div>
                  )}
                </div>
                
                {/* Health Score */}
                {dish.healthScore !== undefined && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Wynik zdrowotny</span>
                      <span className="text-lg font-bold text-emerald-600">{dish.healthScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all" 
                        style={{ width: `${dish.healthScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {dish.hasNutriChefData && (
                  <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                    <span>✓</span> Dane wygenerowane przez NutriChef
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Nutrition per 100g */}
            {dish.nutritionPer100g && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <SectionHeader 
                    icon={<BarChart2 className="w-5 h-5" />} 
                    title="Wartości na 100g" 
                  />
                  <div className="space-y-2">
                    {Object.entries(dish.nutritionPer100g).map(([key, value]) => {
                      const labels: { [key: string]: string } = {
                        energy: "Energia",
                        fat: "Tłuszcze",
                        saturatedFat: "Tłuszcze nasycone",
                        carbs: "Węglowodany",
                        sugar: "Cukry",
                        protein: "Białko",
                        salt: "Sól"
                      }
                      return (
                        <div key={`nutrition100g-${key}`} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-gray-600 text-sm">{labels[key]}</span>
                          <span className="font-medium text-sm">{value}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Allergens */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <SectionHeader 
                  icon={<AlertTriangle className="w-5 h-5" />} 
                  title="Alergeny" 
                />
                {dish.allergens.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {dish.allergens.map((allergen: string) => (
                      <Badge key={`allergen-${allergen}`} className="bg-red-100 text-red-800 border-red-200">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge className="bg-green-100 text-green-800 border-green-200">Brak alergenów</Badge>
                )}
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <SectionHeader 
                  icon={<Leaf className="w-5 h-5" />} 
                  title="Składniki w pudełku" 
                />
                <ul className="space-y-2">
                  {dish.ingredientsWithQuantity && dish.ingredientsWithQuantity.length > 0 ? (
                    dish.ingredientsWithQuantity.map((ingredient, index) => (
                      <li key={`ingredient-${index}-${ingredient.name}`} className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[var(--smakowalo-green-primary)] rounded-full" />
                          <span className="text-gray-700 text-sm">{ingredient.name}</span>
                        </div>
                        {ingredient.grams && (
                          <span className="text-sm font-medium text-[var(--smakowalo-green-primary)] bg-white px-2 py-0.5 rounded border border-gray-100">
                            {ingredient.grams}g
                          </span>
                        )}
                      </li>
                    ))
                  ) : (
                    dish.ingredients.map((ingredient: string, index: number) => (
                      <li key={`ingredient-list-${index}`} className="flex items-center gap-2 py-1">
                        <div className="w-2 h-2 bg-[var(--smakowalo-green-primary)] rounded-full" />
                        <span className="text-gray-700 text-sm">{ingredient}</span>
                      </li>
                    ))
                  )}
                </ul>
                {dish.hasNutriChefData && dish.ingredientsWithQuantity && (
                  <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                    <span>✓</span> Dokładne gramartury z NutriChef
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Equipment */}
            {dish.equipment && dish.equipment.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <SectionHeader 
                    icon={<UtensilsCrossed className="w-5 h-5" />} 
                    title="Potrzebne przybory" 
                  />
                  <ul className="space-y-2">
                    {dish.equipment.map((item: string, index: number) => (
                      <li key={`equipment-${index}`} className="flex items-center gap-2 py-1">
                        <div className="w-2 h-2 bg-[var(--smakowalo-brown)] rounded-full" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Health Benefits - Desktop only (already shown on mobile above) */}
            {dish.healthBenefits && (
              <Card className="border-0 shadow-lg hidden lg:block">
                <CardContent className="p-6">
                  <SectionHeader 
                    icon={<Leaf className="w-5 h-5" />} 
                    title="Korzyści zdrowotne" 
                  />
                  <p className="text-gray-700 leading-relaxed text-sm">{dish.healthBenefits}</p>
                </CardContent>
              </Card>
            )}

            {/* Substitutions - Desktop only */}
            {dish.substitutions && (
              <Card className="border-0 shadow-lg hidden lg:block">
                <CardContent className="p-6">
                  <SectionHeader 
                    icon={<UtensilsCrossed className="w-5 h-5" />} 
                    title="Możliwe zamienniki" 
                  />
                  <p className="text-gray-700 leading-relaxed text-sm">{dish.substitutions}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
