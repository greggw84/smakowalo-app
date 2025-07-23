import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']

// OpenCart product interface
interface OpenCartProduct {
  product_id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category_id?: number;
  cook_time?: number;
  difficulty?: string;
  calories?: number;
  protein?: number;
  ingredients?: string[];
  diets?: string[];
  rating?: number;
  category?: {
    name: string;
    slug: string;
  };
}

// Mock data for when Supabase is not configured
const mockProducts = [
  {
    id: 61,
    name: "Kurczak Tikka Masala z Curry z ryżem z kalafiora i kolendrą",
    slug: "kurczak-tikka-masala-curry-ryz-kalafior-kolendra",
    description: "Soczyste kawałki kurczaka w aromatycznym sosie tikka masala z ryżem z kalafiora i świeżą kolendrą",
    image: "https://ext.same-assets.com/3234956792/2143887936.png",
    price: 35.00,
    old_price: null,
    category_id: 1,
    cook_time: 30,
    servings: 2,
    difficulty: "Średni",
    calories: 398,
    protein: 19,
    carbs: 12,
    fat: 6,
    fiber: 3,
    rating: 4.8,
    reviews_count: 24,
    ingredients: ["Kurczak", "Pasta tikka", "Kalafior", "Kolendra", "Pomidory", "Cebula czerwona", "Śmietana kwaszona", "Czosnek", "Imbir"],
    allergens: [],
    equipment: ["Patelnia", "Nóż", "Deska do krojenia"],
    instructions: [
      { step: 1, title: "Przygotowanie składników", description: "Pokrój kurczaka na kawałki i przygotuj wszystkie składniki." },
      { step: 2, title: "Marinata", description: "Zamarynuj kurczaka w paście tikka na 15 minut." },
      { step: 3, title: "Smażenie", description: "Usmaż kurczaka na patelni do złotego koloru." },
      { step: 4, title: "Sos", description: "Dodaj sos pomidorowy i śmietanę, gotuj 10 minut." },
      { step: 5, title: "Podawanie", description: "Podawaj z ryżem z kalafiora i kolendrą." }
    ],
    nutrition_per_100g: {
      energy: "97.7 kcal",
      fat: "3.2 g",
      saturated_fat: "1.5 g",
      carbs: "6 g",
      sugar: "1.2 g",
      protein: "9.5 g",
      salt: "0.6 g"
    },
    tags: ["Kurczak", "Indyjskie", "Keto"],
    diets: ["keto", "niskowęglowodanowa"],
    active: true,
    featured: true,
    stock_quantity: 50,
    sku: "SMAKOWALO-61",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 1,
      name: "Kurczak",
      slug: "kurczak"
    }
  },
  {
    id: 58,
    name: "Krewetki z Harissą i Miodem z Ryżem z Kalafiora i Greckim Jogurtem",
    slug: "krewetki-harissa-miod-ryz-kalafior-jogurt-grecki",
    description: "Pikantne krewetki w sosie harissa z miodem, podawane z ryżem z kalafiora i chłodzącym greckim jogurtem",
    image: "https://ext.same-assets.com/3234956792/1990706172.png",
    price: 35.00,
    old_price: null,
    category_id: 2,
    cook_time: 25,
    servings: 2,
    difficulty: "Średni",
    calories: 420,
    protein: 25,
    carbs: 16,
    fat: 8,
    fiber: 4,
    rating: 4.7,
    reviews_count: 18,
    ingredients: ["Krewetki", "Harissa", "Miód", "Kalafior", "Jogurt grecki", "Czosnek", "Oliwa z oliwek", "Cytryna", "Pietruszka"],
    allergens: ["Skorupiaki"],
    equipment: ["Patelnia", "Nóż", "Deska do krojenia"],
    instructions: [
      { step: 1, title: "Przygotowanie", description: "Oczyść krewetki i przygotuj kalafior." },
      { step: 2, title: "Sos harissa", description: "Wymieszaj harissę z miodem i oliwą." },
      { step: 3, title: "Smażenie krewetek", description: "Smaż krewetki w sosie harissa 3-4 minuty." },
      { step: 4, title: "Ryż z kalafiora", description: "Przygotuj ryż z kalafiora na parze." },
      { step: 5, title: "Podawanie", description: "Podawaj z jogurtem greckim i pietruszką." }
    ],
    nutrition_per_100g: {
      energy: "105 kcal",
      fat: "4.2 g",
      saturated_fat: "1.1 g",
      carbs: "8 g",
      sugar: "6.2 g",
      protein: "12.5 g",
      salt: "0.8 g"
    },
    tags: ["Krewetki", "Morska", "Keto"],
    diets: ["keto", "niskowęglowodanowa"],
    active: true,
    featured: true,
    stock_quantity: 30,
    sku: "SMAKOWALO-58",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 2,
      name: "Krewetki",
      slug: "krewetki"
    }
  },
  {
    id: 70,
    name: "Świeży łosoś na łóżku cytrynowego risotto z dodatkiem tenderstem i groszku",
    slug: "swiezy-losos-cytrynowe-risotto-tenderstem-groszek",
    description: "Pieczony łosoś na kremowym cytrynowym risotto z tenderstem broccoli i świeżym groszkiem",
    image: "https://ext.same-assets.com/3234956792/2644930272.png",
    price: 42.00,
    old_price: null,
    category_id: 3,
    cook_time: 35,
    servings: 2,
    difficulty: "Trudny",
    calories: 520,
    protein: 30,
    carbs: 24,
    fat: 17,
    fiber: 5,
    rating: 4.9,
    reviews_count: 31,
    ingredients: ["Łosoś", "Ryż risotto", "Cytryna", "Tenderstem broccoli", "Groszek", "Parmezan", "Białe wino", "Cebula", "Czosnek"],
    allergens: ["Ryby", "Produkty mleczne"],
    equipment: ["Patelnia", "Rondelek", "Nóż", "Deska do krojenia"],
    instructions: [
      { step: 1, title: "Przygotowanie łososia", description: "Przypraw łososia i odstaw na 10 minut." },
      { step: 2, title: "Risotto", description: "Przygotuj risotto dodając bulion po trochu." },
      { step: 3, title: "Pieczenie łososia", description: "Piecz łososia na patelni 4-5 minut z każdej strony." },
      { step: 4, title: "Warzywa", description: "Blanszuj tenderstem i groszek." },
      { step: 5, title: "Finalizacja", description: "Dodaj cytrynę do risotto i podawaj z łososiem." }
    ],
    nutrition_per_100g: {
      energy: "160 kcal",
      fat: "8.5 g",
      saturated_fat: "2.8 g",
      carbs: "12 g",
      sugar: "2.1 g",
      protein: "15.2 g",
      salt: "0.9 g"
    },
    tags: ["Łosoś", "Risotto", "Zdrowa"],
    diets: ["zdrowa"],
    active: true,
    featured: false,
    stock_quantity: 25,
    sku: "SMAKOWALO-70",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 3,
      name: "Ryby",
      slug: "ryby"
    }
  },
  // Dodatkowe dania
  {
    id: 72,
    name: "Słoneczne kuleczki mięsne z wołowiny w sosie pomidorowym z warzywami pieczonymi z pesto i sałatką z rukolą",
    slug: "sloneczne-kuleczki-miesne-wolowina-sos-pomidorowy-warzywa",
    description: "Soczyste kuleczki mięsne z wołowiny w aromatycznym sosie pomidorowym, podawane z pieczonymi warzywami z pesto i świeżą sałatką z rukoli",
    image: "https://ext.same-assets.com/817389662/1242765842.jpeg",
    price: 38.00,
    old_price: null,
    category_id: 4,
    cook_time: 40,
    servings: 2,
    difficulty: "Średni",
    calories: 520,
    protein: 32,
    carbs: 18,
    fat: 14,
    fiber: 6,
    rating: 4.7,
    reviews_count: 22,
    ingredients: ["Mielona wołowina", "Pomidory", "Cukinia", "Papryka", "Rukola", "Pesto bazyliowe", "Czosnek", "Cebula", "Oregano"],
    allergens: ["Produkty mleczne", "Orzechy"],
    equipment: ["Piekarnik", "Patelnia", "Miska", "Blacha do pieczenia"],
    instructions: [
      { step: 1, title: "Przygotowanie mięsa", description: "Wymieszaj mięso mielone z przyprawami i uformuj kulki." },
      { step: 2, title: "Pieczenie", description: "Piecz kulki mięsne w piekarniku przez 15-20 minut." },
      { step: 3, title: "Sos pomidorowy", description: "Przygotuj sos z pomidorów, czosnku i ziół." },
      { step: 4, title: "Warzywa", description: "Upiecz warzywa skropione oliwą i przyprawami." },
      { step: 5, title: "Podawanie", description: "Ułóż kulki z sosem, warzywa z pesto i sałatkę z rukoli." }
    ],
    nutrition_per_100g: {
      energy: "130 kcal",
      fat: "7.5 g",
      saturated_fat: "2.8 g",
      carbs: "9 g",
      sugar: "3.5 g",
      protein: "15.5 g",
      salt: "0.7 g"
    },
    tags: ["Wołowina", "Włoskie", "Wysokobiałkowe"],
    diets: ["wysokobiałkowa"],
    active: true,
    featured: true,
    stock_quantity: 28,
    sku: "SMAKOWALO-72",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 4,
      name: "Wołowina",
      slug: "wolowina"
    }
  },
  {
    id: 75,
    name: "Rozdrobniona kaczka w sosie hoisin i imbirze w sałatkowych miseczkach z sałatą, ogórkiem, marchewką i ostrym chili",
    slug: "rozdrobniona-kaczka-hoisin-imbir-salatka",
    description: "Aromatyczna rozdrobniona kaczka w sosie hoisin z imbirem, podawana w sałatkowych miseczkach z chrupiącymi warzywami i ostrym chili",
    image: "https://ext.same-assets.com/817389662/1876542390.jpeg",
    price: 40.00,
    old_price: null,
    category_id: 5,
    cook_time: 30,
    servings: 2,
    difficulty: "Średni",
    calories: 420,
    protein: 26,
    carbs: 32,
    fat: 18,
    fiber: 4,
    rating: 4.5,
    reviews_count: 16,
    ingredients: ["Pierś z kaczki", "Sos hoisin", "Imbir", "Liście sałaty", "Ogórek", "Marchewka", "Chili", "Kolendra", "Limonka"],
    allergens: ["Soja", "Gluten"],
    equipment: ["Wok", "Nóż", "Deska do krojenia", "Tarka"],
    instructions: [
      { step: 1, title: "Przygotowanie kaczki", description: "Upiecz kaczkę i rozdrobnij mięso widelcem." },
      { step: 2, title: "Marynata", description: "Wymieszaj mięso z sosem hoisin i startym imbirem." },
      { step: 3, title: "Warzywa", description: "Pokrój warzywa w cienkie paseczki." },
      { step: 4, title: "Miseczki", description: "Przygotuj liście sałaty jako miseczki." },
      { step: 5, title: "Podawanie", description: "Nałóż kaczkę i warzywa do miseczek, posyp kolendrą i chili." }
    ],
    nutrition_per_100g: {
      energy: "120 kcal",
      fat: "9.5 g",
      saturated_fat: "3.2 g",
      carbs: "12 g",
      sugar: "6.2 g",
      protein: "13.5 g",
      salt: "0.8 g"
    },
    tags: ["Kaczka", "Azjatyckie", "Ostre"],
    diets: ["keto", "niskokaloryczna"],
    active: true,
    featured: true,
    stock_quantity: 20,
    sku: "SMAKOWALO-75",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 5,
      name: "Kaczka",
      slug: "kaczka"
    }
  },
  {
    id: 80,
    name: "Makaron Linguine z krewetkami w maśle cytrynowo-czosnkowym z serem i płatkami chili",
    slug: "makaron-linguine-krewetki-maslo-cytrynowe-czosnek",
    description: "Makaron linguine z soczyściymi krewetkami w aromatycznym maśle cytrynowo-czosnkowym, posypany parmezanem i płatkami chili",
    image: "https://ext.same-assets.com/817389662/2087654321.jpeg",
    price: 36.00,
    old_price: null,
    category_id: 2,
    cook_time: 20,
    servings: 2,
    difficulty: "Średni",
    calories: 520,
    protein: 24,
    carbs: 65,
    fat: 14,
    fiber: 2,
    rating: 4.6,
    reviews_count: 28,
    ingredients: ["Makaron linguine", "Krewetki", "Masło", "Cytryna", "Czosnek", "Parmezan", "Płatki chili", "Natka pietruszki", "Oliwa z oliwek"],
    allergens: ["Skorupiaki", "Gluten", "Produkty mleczne"],
    equipment: ["Garnek", "Patelnia", "Durszlak", "Tarka do sera"],
    instructions: [
      { step: 1, title: "Gotowanie makaronu", description: "Ugotuj makaron al dente w osolonej wodzie." },
      { step: 2, title: "Przygotowanie krewetek", description: "Oczyść krewetki i osusz je papierem." },
      { step: 3, title: "Masło aromatyczne", description: "Rozpuść masło z czosnkiem i sokiem z cytryny." },
      { step: 4, title: "Smażenie krewetek", description: "Smaż krewetki na maśle 2-3 minuty z każdej strony." },
      { step: 5, title: "Podawanie", description: "Wymieszaj makaron z krewetkami, posyp serem i chili." }
    ],
    nutrition_per_100g: {
      energy: "130 kcal",
      fat: "5.5 g",
      saturated_fat: "2.8 g",
      carbs: "25 g",
      sugar: "0.8 g",
      protein: "12 g",
      salt: "0.6 g"
    },
    tags: ["Makaron", "Krewetki", "Włoskie"],
    diets: ["pescetariańska"],
    active: true,
    featured: false,
    stock_quantity: 32,
    sku: "SMAKOWALO-80",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 2,
      name: "Krewetki",
      slug: "krewetki"
    }
  },
  {
    id: 83,
    name: "Miód i ser Halloumi w tortillach z sosem z awokado i pomidorów oraz jogurtem limonkowym",
    slug: "miod-ser-halloumi-tortille-awokado-pomidory",
    description: "Słodko-słone tortille z grillowanym serem halloumi, miodem, sosem z awokado i pomidorów, podawane z orzeźwiającym jogurtem limonkowym",
    image: "https://ext.same-assets.com/817389662/1265438790.jpeg",
    price: 34.00,
    old_price: null,
    category_id: 6,
    cook_time: 25,
    servings: 2,
    difficulty: "Średni",
    calories: 450,
    protein: 18,
    carbs: 42,
    fat: 22,
    fiber: 5,
    rating: 4.5,
    reviews_count: 14,
    ingredients: ["Tortille pszenne", "Ser halloumi", "Miód", "Awokado", "Pomidory", "Jogurt grecki", "Limonka", "Kolendra", "Czerwona cebula"],
    allergens: ["Gluten", "Produkty mleczne"],
    equipment: ["Patelnia grillowa", "Blender", "Nóż", "Deska do krojenia"],
    instructions: [
      { step: 1, title: "Grillowanie sera", description: "Pokrój ser halloumi w plastry i grilluj na patelni." },
      { step: 2, title: "Sos z awokado", description: "Zblenduj awokado z sokiem z limonki i kolendrą." },
      { step: 3, title: "Sos pomidorowy", description: "Pokrój pomidory w kostkę i wymieszaj z cebulą i przyprawami." },
      { step: 4, title: "Jogurt limonkowy", description: "Wymieszaj jogurt z sokiem i skórką z limonki." },
      { step: 5, title: "Składanie", description: "Ułóż wszystkie składniki na tortilli, polej miodem i zwiń." }
    ],
    nutrition_per_100g: {
      energy: "110 kcal",
      fat: "6.2 g",
      saturated_fat: "3.1 g",
      carbs: "12 g",
      sugar: "4.5 g",
      protein: "9 g",
      salt: "0.7 g"
    },
    tags: ["Wegetariańskie", "Meksykańskie", "Ser"],
    diets: ["wegetariańska"],
    active: true,
    featured: false,
    stock_quantity: 26,
    sku: "SMAKOWALO-83",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 6,
      name: "Wegetariańskie",
      slug: "wegetarianskie"
    }
  },
  {
    id: 85,
    name: "Upieczona cukinia i pomidory Linguine z serem w stylu greckim, orzechami pinowymi i szczypiorkiem",
    slug: "upieczona-cukinia-pomidory-linguine-ser-grecki",
    description: "Lekki makaron z upieczoną cukinią i pomidorami, serem w stylu greckim, orzechami pinowymi i świeżym szczypiorkiem",
    image: "https://ext.same-assets.com/817389662/1356478921.jpeg",
    price: 32.00,
    old_price: null,
    category_id: 6,
    cook_time: 30,
    servings: 2,
    difficulty: "Łatwy",
    calories: 380,
    protein: 14,
    carbs: 48,
    fat: 16,
    fiber: 6,
    rating: 4.4,
    reviews_count: 20,
    ingredients: ["Makaron linguine", "Cukinia", "Pomidory koktajlowe", "Ser feta", "Orzechy pinowe", "Szczypiorek", "Czosnek", "Oliwa z oliwek", "Oregano"],
    allergens: ["Gluten", "Produkty mleczne", "Orzechy"],
    equipment: ["Piekarnik", "Garnek", "Blacha do pieczenia", "Durszlak"],
    instructions: [
      { step: 1, title: "Pieczenie warzyw", description: "Pokrój cukinię i pomidory, skrop oliwą i piecz 15 minut." },
      { step: 2, title: "Prażenie orzechów", description: "Praż orzechy pinowe na suchej patelni." },
      { step: 3, title: "Gotowanie makaronu", description: "Ugotuj makaron al dente w osolonej wodzie." },
      { step: 4, title: "Przygotowanie sosu", description: "Wymieszaj upieczone warzywa z czosnkiem i przyprawami." },
      { step: 5, title: "Podawanie", description: "Wymieszaj makaron z warzywami, posyp serem, orzechami i szczypiorkiem." }
    ],
    nutrition_per_100g: {
      energy: "90 kcal",
      fat: "4.5 g",
      saturated_fat: "1.5 g",
      carbs: "14 g",
      sugar: "2.2 g",
      protein: "8 g",
      salt: "0.5 g"
    },
    tags: ["Makaron", "Wegetariańskie", "Greckie"],
    diets: ["wegetariańska", "niskokaloryczna"],
    active: true,
    featured: false,
    stock_quantity: 30,
    sku: "SMAKOWALO-85",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 6,
      name: "Wegetariańskie",
      slug: "wegetarianskie"
    }
  },
  {
    id: 87,
    name: "Słodkie ziemniaki z fasolą szparagową z przecierem z avocado i wegańskim serem Sheese",
    slug: "slodkie-ziemniaki-fasola-szparagowa-avocado-ser-weganski",
    description: "Pieczone słodkie ziemniaki z fasolą szparagową, podawane z kremowym przecierem z awokado i wegańskim serem Sheese",
    image: "https://ext.same-assets.com/817389662/1987324560.jpeg",
    price: 31.00,
    old_price: null,
    category_id: 7,
    cook_time: 35,
    servings: 2,
    difficulty: "Łatwy",
    calories: 340,
    protein: 12,
    carbs: 38,
    fat: 14,
    fiber: 9,
    rating: 4.6,
    reviews_count: 12,
    ingredients: ["Słodkie ziemniaki", "Fasola szparagowa", "Awokado", "Wegański ser Sheese", "Sok z limonki", "Kolendra", "Czosnek", "Oliwa z oliwek", "Chili"],
    allergens: [],
    equipment: ["Piekarnik", "Blender", "Garnek", "Blacha do pieczenia"],
    instructions: [
      { step: 1, title: "Pieczenie ziemniaków", description: "Pokrój słodkie ziemniaki i piecz 25-30 minut." },
      { step: 2, title: "Gotowanie fasoli", description: "Ugotuj fasolę szparagową w osolonej wodzie." },
      { step: 3, title: "Sos z awokado", description: "Zblenduj awokado z sokiem z limonki, kolendrą i czosnkiem." },
      { step: 4, title: "Przygotowanie sera", description: "Pokrój ser wegański w kostkę lub zetrzyj." },
      { step: 5, title: "Podawanie", description: "Ułóż ziemniaki i fasolę na talerzu, dodaj sos z awokado i posyp serem." }
    ],
    nutrition_per_100g: {
      energy: "85 kcal",
      fat: "4.2 g",
      saturated_fat: "0.5 g",
      carbs: "12 g",
      sugar: "3.5 g",
      protein: "6 g",
      salt: "0.3 g"
    },
    tags: ["Wegańskie", "Bezglutenowe", "Słodkie ziemniaki"],
    diets: ["wegańska", "bezglutenowa"],
    active: true,
    featured: false,
    stock_quantity: 24,
    sku: "SMAKOWALO-87",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 7,
      name: "Wegańskie",
      slug: "weganskie"
    }
  },
  {
    id: 90,
    name: "Risotto z dynią piżmową i tymiankiem z prażonymi kiełkami groszku i pestkami dyni",
    slug: "risotto-dynia-pizmowa-tymianek-kielki-groszku-pestki-dyni",
    description: "Kremowe risotto z dynią piżmową i aromatycznym tymiankiem, podawane z prażonymi kiełkami groszku i pestkami dyni",
    image: "https://ext.same-assets.com/817389662/1798345610.jpeg",
    price: 33.00,
    old_price: null,
    category_id: 6,
    cook_time: 45,
    servings: 2,
    difficulty: "Średni",
    calories: 420,
    protein: 14,
    carbs: 58,
    fat: 12,
    fiber: 6,
    rating: 4.8,
    reviews_count: 22,
    ingredients: ["Ryż arborio", "Dynia piżmowa", "Tymianek", "Kiełki groszku", "Pestki dyni", "Cebula", "Bulion warzywny", "Białe wino", "Parmezan"],
    allergens: ["Produkty mleczne"],
    equipment: ["Garnek", "Patelnia", "Nóż", "Deska do krojenia"],
    instructions: [
      { step: 1, title: "Przygotowanie dyni", description: "Obierz i pokrój dynię w kostkę." },
      { step: 2, title: "Przygotowanie risotto", description: "Podsmaż cebulę, dodaj ryż i wino." },
      { step: 3, title: "Gotowanie", description: "Dodawaj stopniowo bulion, mieszając regularnie." },
      { step: 4, title: "Dodatki", description: "Upiecz dynię, praż kiełki groszku i pestki dyni." },
      { step: 5, title: "Finalizacja", description: "Dodaj dynię do risotta, posyp kiełkami, pestkami i tymiankiem." }
    ],
    nutrition_per_100g: {
      energy: "110 kcal",
      fat: "3.5 g",
      saturated_fat: "1.2 g",
      carbs: "19 g",
      sugar: "2.5 g",
      protein: "7 g",
      salt: "0.5 g"
    },
    tags: ["Risotto", "Wegetariańskie", "Dynia"],
    diets: ["wegetariańska"],
    active: true,
    featured: false,
    stock_quantity: 28,
    sku: "SMAKOWALO-90",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 6,
      name: "Wegetariańskie",
      slug: "wegetarianskie"
    }
  },
  {
    id: 93,
    name: "Udko z kurczaka peri peri z cytrynowo-ziołowym purée z dyni muszkatołowej i czosnkowym jogurtem",
    slug: "udko-kurczaka-peri-peri-purre-dynia-jogurt-czosnkowy",
    description: "Pikantne udko z kurczaka w marynacie peri peri, podawane z kremowym purée z dyni muszkatołowej i czosnkowym jogurtem",
    image: "https://ext.same-assets.com/817389662/1432786509.jpeg",
    price: 36.00,
    old_price: null,
    category_id: 1,
    cook_time: 50,
    servings: 2,
    difficulty: "Średni",
    calories: 480,
    protein: 28,
    carbs: 24,
    fat: 16,
    fiber: 4,
    rating: 4.8,
    reviews_count: 26,
    ingredients: ["Udka z kurczaka", "Marynata peri peri", "Dynia muszkatołowa", "Jogurt grecki", "Czosnek", "Cytryna", "Tymianek", "Rozmaryn", "Masło"],
    allergens: ["Produkty mleczne"],
    equipment: ["Piekarnik", "Garnek", "Blender", "Blacha do pieczenia"],
    instructions: [
      { step: 1, title: "Marynowanie kurczaka", description: "Natrzyj udka marynatą peri peri i odstaw na 1 godzinę." },
      { step: 2, title: "Pieczenie kurczaka", description: "Piecz udka w piekarniku przez 35-40 minut." },
      { step: 3, title: "Purée z dyni", description: "Ugotuj dynię, zblenduj z masłem i sokiem z cytryny." },
      { step: 4, title: "Jogurt czosnkowy", description: "Wymieszaj jogurt z czosnkiem i ziołami." },
      { step: 5, title: "Podawanie", description: "Ułóż purée na talerzu, na nim udko, obok sos jogurtowy." }
    ],
    nutrition_per_100g: {
      energy: "120 kcal",
      fat: "6.5 g",
      saturated_fat: "2.2 g",
      carbs: "8 g",
      sugar: "3.5 g",
      protein: "14 g",
      salt: "0.6 g"
    },
    tags: ["Kurczak", "Peri peri", "Dynia"],
    diets: ["wysokobiałkowa"],
    active: true,
    featured: true,
    stock_quantity: 32,
    sku: "SMAKOWALO-93",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 1,
      name: "Kurczak",
      slug: "kurczak"
    }
  },
  {
    id: 95,
    name: "Kremowa zupa z pieczonej dyni z grzankami czosnkowymi i prażonymi nasionami",
    slug: "kremowa-zupa-pieczona-dynia-grzanki-czosnkowe-prazone-nasiona",
    description: "Aksamitna zupa krem z pieczonej dyni, podawana z chrupiącymi grzankami czosnkowymi i prażonymi nasionami",
    image: "https://ext.same-assets.com/817389662/1654328790.jpeg",
    price: 28.00,
    old_price: null,
    category_id: 8,
    cook_time: 35,
    servings: 2,
    difficulty: "Łatwy",
    calories: 320,
    protein: 8,
    carbs: 36,
    fat: 10,
    fiber: 5,
    rating: 4.8,
    reviews_count: 18,
    ingredients: ["Dynia", "Cebula", "Czosnek", "Bulion warzywny", "Śmietanka kremówka", "Chleb", "Nasiona dyni", "Nasiona słonecznika", "Oliwa z oliwek"],
    allergens: ["Gluten", "Produkty mleczne"],
    equipment: ["Piekarnik", "Garnek", "Blender", "Blacha do pieczenia"],
    instructions: [
      { step: 1, title: "Pieczenie dyni", description: "Pokrój dynię i piecz 25 minut z czosnkiem." },
      { step: 2, title: "Przygotowanie bazy", description: "Podsmaż cebulę, dodaj upieczoną dynię." },
      { step: 3, title: "Blendowanie", description: "Dodaj bulion i zblenduj na gładki krem." },
      { step: 4, title: "Grzanki", description: "Pokrój chleb w kostkę, natrzyj czosnkiem i upiecz." },
      { step: 5, title: "Podawanie", description: "Podawaj zupę ze śmietanką, grzankami i prażonymi nasionami." }
    ],
    nutrition_per_100g: {
      energy: "80 kcal",
      fat: "3.5 g",
      saturated_fat: "1.8 g",
      carbs: "12 g",
      sugar: "4.5 g",
      protein: "4 g",
      salt: "0.5 g"
    },
    tags: ["Zupa", "Wegetariańskie", "Dynia"],
    diets: ["wegetariańska", "niskokaloryczna"],
    active: true,
    featured: true,
    stock_quantity: 40,
    sku: "SMAKOWALO-95",
    created_at: "2024-06-21T10:00:00Z",
    updated_at: "2024-06-21T10:00:00Z",
    categories: {
      id: 8,
      name: "Zupy",
      slug: "zupy"
    }
  }
]

// GET /api/products - Get all products with filters
export async function GET(request: NextRequest) {
  try {
    const opencartUrl = process.env.OPENCART_URL
    if (!opencartUrl) {
      // No OpenCart URL configured - return mock data early
      console.log('ℹ️ No OpenCart URL set - returning mock products')
      const filteredProducts = mockProducts
      return NextResponse.json({ success: true, products: filteredProducts, total: filteredProducts.length, source: 'mock' })
    }

    // Fetch from OpenCart API
    if (opencartUrl) {
      const ocRes = await fetch(`${opencartUrl}/api/products`)
      if (ocRes.ok) {
        const ocData = await ocRes.json()
        // Map OpenCart products to our format
        const products = ocData.products.map((p: OpenCartProduct) => ({
          id: p.product_id,
          name: p.name,
          description: p.description,
          image: p.image,
          price: p.price,
          category_id: p.category_id || null,
          cook_time: p.cook_time || 0,
          difficulty: p.difficulty || 'Średni',
          calories: p.calories || 0,
          protein: p.protein || 0,
          ingredients: p.ingredients || [],
          diets: p.diets || [],
          rating: p.rating || 0,
          categories: p.category ? { name: p.category.name, slug: p.category.slug } : undefined
        }))
        return NextResponse.json({ success: true, products, total: products.length, source: 'opencart' })
      }
    }

    const supabase = createSupabaseClient()

    if (!supabase) {
      console.log('❌ Supabase not configured, returning mock data')

      const { searchParams } = new URL(request.url)
      const categoryId = searchParams.get('category')
      const diet = searchParams.get('diet')
      const search = searchParams.get('search')
      const featured = searchParams.get('featured')

      let filteredProducts = [...mockProducts]

      if (categoryId) {
        filteredProducts = filteredProducts.filter(p => p.category_id === Number.parseInt(categoryId))
      }

      if (diet) {
        filteredProducts = filteredProducts.filter(p => p.diets.includes(diet))
      }

      if (search) {
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        )
      }

      if (featured === 'true') {
        filteredProducts = filteredProducts.filter(p => p.featured)
      }

      return NextResponse.json({
        success: true,
        products: filteredProducts,
        total: filteredProducts.length,
        source: 'mock'
      })
    }

    console.log('✅ Using Supabase for products data')

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    const diet = searchParams.get('diet')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const limit = Number.parseInt(searchParams.get('limit') || '50')
    const offset = Number.parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('active', true)
      .range(offset, offset + limit - 1)

    if (categoryId) {
      query = query.eq('category_id', Number.parseInt(categoryId))
    }

    if (diet) {
      query = query.contains('diets', [diet])
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    const { data: products, error, count } = await query

    if (error) {
      console.error('❌ Supabase query error:', error)
      throw error
    }

    console.log(`✅ Retrieved ${products?.length || 0} products from Supabase`)

    return NextResponse.json({
      success: true,
      products: products || [],
      total: count || products?.length || 0,
      source: 'supabase'
    })

  } catch (error) {
    console.error('❌ Products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'description', 'image', 'price', 'category_id', 'cook_time', 'servings', 'difficulty', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'ingredients', 'allergens', 'instructions', 'tags', 'diets']

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    const productData: ProductInsert = {
      name: body.name,
      slug,
      description: body.description,
      image: body.image,
      price: Number.parseFloat(body.price),
      old_price: body.old_price ? Number.parseFloat(body.old_price) : null,
      category_id: Number.parseInt(body.category_id),
      cook_time: Number.parseInt(body.cook_time),
      servings: Number.parseInt(body.servings),
      difficulty: body.difficulty,
      calories: Number.parseInt(body.calories),
      protein: Number.parseFloat(body.protein),
      carbs: Number.parseFloat(body.carbs),
      fat: Number.parseFloat(body.fat),
      fiber: Number.parseFloat(body.fiber),
      ingredients: body.ingredients,
      allergens: body.allergens,
      equipment: body.equipment || null,
      instructions: body.instructions,
      nutrition_per_100g: body.nutrition_per_100g || null,
      tags: body.tags,
      diets: body.diets,
      featured: body.featured || false,
      stock_quantity: Number.parseInt(body.stock_quantity || '0'),
      sku: body.sku || null
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    return NextResponse.json({
      product,
      success: true,
      message: 'Product created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
