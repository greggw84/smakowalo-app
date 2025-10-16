'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ChefHat, Clock, Heart, Loader, ShoppingCart, User, AlertCircle, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from '@/components/ui/badge'
import Logo from '@/components/Logo'
import { useCart } from '@/contexts/CartContext'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const dietTypes = [
  { id: 1, name: "Wegetariańska", description: "Dania bez mięsa, z nabiałem i jajami", code: "wegetariańska" },
  { id: 2, name: "Wegańska", description: "Dania bez produktów odzwierzęcych", code: "wegańska" },
  { id: 3, name: "Keto", description: "Niska zawartość węglowodanów, wysoka tłuszczu", code: "keto" },
  { id: 4, name: "Wysokobiałkowa", description: "Zwiększona zawartość białka", code: "wysokobiałkowa" },
  { id: 5, name: "Niskokaloryczna", description: "Dania o niskiej kaloryczności", code: "niskokaloryczna" },
  { id: 6, name: "Bezglutenowa", description: "Bez składników zawierających gluten", code: "bezglutenowa" },
  { id: 7, name: "Pescetariańska", description: "Bez mięsa, ale z rybami i owocami morza", code: "pescetariańska" },
  { id: 8, name: "Paleo", description: "Bazująca na naturalnych, nieprzetworzonych produktach", code: "paleo" },
];

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  calories: number;
  cook_time: number;
  price: number;
  diets: string[];
  servings?: number;
  difficulty?: string;
}

export default function KreatorPage() {
  const { data: session, status } = useSession()
  const { totalItems, addItem } = useCart()
  const router = useRouter()

  const [selectedDiets, setSelectedDiets] = useState<number[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [selectedDishes, setSelectedDishes] = useState<Product[]>([]);
  const [step, setStep] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch real OpenCart products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        console.log('🔄 Fetching products from API...');
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          console.log('📥 API Response:', {
            success: data.success,
            count: data.products?.length,
            source: data.source
          });

          if (data.success && data.products) {
            // Convert API products to kreator format
            const products = data.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              image: p.image,
              calories: p.calories || 400,
              cook_time: p.cook_time || 30,
              price: p.price || 35,
              diets: p.diets || []
            }));

            console.log('✅ Loaded products:', products.length);
            console.log('🍽️ Sample product diets:', products.slice(0, 5).map(p => ({
              name: p.name.substring(0, 30),
              diets: p.diets
            })));

            setAvailableProducts(products);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Price per portion is 30 PLN as requested
  const pricePerPortion = 30;
  const totalPortions = numberOfPeople * numberOfDays;
  const totalCost = totalPortions * pricePerPortion;

  // Filter products based on selected diets
  const getFilteredProducts = () => {
    if (selectedDiets.length === 0) {
      // If no diets selected, show all products
      return availableProducts;
    }

    // Get selected diet codes
    const selectedDietCodes = selectedDiets.map(dietId => {
      const diet = dietTypes.find(d => d.id === dietId);
      return diet?.code;
    }).filter(Boolean) as string[];

    console.log('🔍 Selected diet codes:', selectedDietCodes);
    console.log('📦 Available products:', availableProducts.length);
    console.log('🍽️ Products with diets:', availableProducts.map(p => ({
      name: p.name.substring(0, 30),
      diets: p.diets
    })));

    // Filter products that match any of the selected diets
    const filtered = availableProducts.filter(product => {
      // If product has no diet info, exclude it (we want to match specific diets)
      if (!product.diets || product.diets.length === 0) {
        return false;
      }

      // Convert product diets to lowercase for case-insensitive comparison
      const productDietsLower = product.diets.map(d => d.toLowerCase());

      // Check if product has any of the selected diets (case-insensitive)
      const hasMatch = selectedDietCodes.some(selectedCode =>
        productDietsLower.includes(selectedCode.toLowerCase())
      );

      if (hasMatch) {
        console.log(`✅ Match found: ${product.name.substring(0, 30)} - ${product.diets.join(', ')}`);
      }

      return hasMatch;
    });

    console.log('✨ Filtered products count:', filtered.length);
    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const toggleDiet = (dietId: number) => {
    setSelectedDiets(prev => {
      if (prev.includes(dietId)) {
        return prev.filter(id => id !== dietId);
      }

      if (prev.length < 3) {
        return [...prev, dietId];
      }

      return prev;
    });
  };

  const toggleDish = (dish: Product) => {
    setSelectedDishes(prev => {
      const isSelected = prev.find(d => d.id === dish.id);

      if (isSelected) {
        return prev.filter(d => d.id !== dish.id);
      }

      if (prev.length < numberOfDays) {
        return [...prev, dish];
      }

      return prev;
    });
  };

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!session) {
      router.push('/login?callbackUrl=/kreator');
      return;
    }

    setIsAddingToCart(true);

    try {
      // Create a meal plan item for the cart
      const mealPlanItem = {
        id: Date.now(), // Generate unique ID
        name: `Plan posiłków na ${numberOfDays} dni (${numberOfPeople} ${numberOfPeople === 1 ? 'osoba' : numberOfPeople <= 4 ? 'osoby' : 'osób'})`,
        image: '/api/placeholder/300/200',
        price: totalCost,
        selectedMeals: selectedDishes.map(dish => dish.name),
        dietPreferences: selectedDiets.map(id => dietTypes.find(d => d.id === id)?.name).filter(Boolean),
        numberOfPeople,
        numberOfDays,
        pricePerPortion,
        totalPortions,
      };

      addItem(mealPlanItem, 1);

      // Redirect to cart
      router.push('/cart');
    } catch (error) {
      console.error('Error adding meal plan to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold text-[var(--smakowalo-green-dark)] mb-6 text-center">
              Krok 1: Wybierz preferencje dietetyczne (maksymalnie 3)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dietTypes.map((diet) => (
                <Card
                  key={diet.id}
                  className={`cursor-pointer transition-all ${
                    selectedDiets.includes(diet.id)
                      ? 'ring-2 ring-[var(--smakowalo-green-primary)] bg-green-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleDiet(diet.id)}
                >
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      selectedDiets.includes(diet.id)
                        ? 'bg-[var(--smakowalo-green-primary)] border-[var(--smakowalo-green-primary)]'
                        : 'border-gray-300'
                    }`}>
                      {selectedDiets.includes(diet.id) && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--smakowalo-green-dark)]">{diet.name}</h3>
                      <p className="text-sm text-gray-500">{diet.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button
                size="lg"
                className="smakowalo-green"
                onClick={() => setStep(2)}
              >
                Dalej
              </Button>
            </div>
          </>
        );

      case 2:
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[var(--smakowalo-green-dark)] mb-6 text-center">
              Krok 2: Wybierz liczbę osób i dni
            </h2>

            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="mb-8">
                <p className="text-lg font-medium mb-4">Liczba osób:</p>
                <div className="flex space-x-4">
                  <Button
                    variant={numberOfPeople === 2 ? "default" : "outline"}
                    className={numberOfPeople === 2 ? "bg-[var(--smakowalo-green-primary)]" : ""}
                    onClick={() => setNumberOfPeople(2)}
                  >
                    2 osoby
                  </Button>
                  <Button
                    variant={numberOfPeople === 4 ? "default" : "outline"}
                    className={numberOfPeople === 4 ? "bg-[var(--smakowalo-green-primary)]" : ""}
                    onClick={() => setNumberOfPeople(4)}
                  >
                    4 osoby
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-lg font-medium mb-4">Dni w tygodniu:</p>
                <div className="flex space-x-4">
                  <Button
                    variant={numberOfDays === 3 ? "default" : "outline"}
                    className={numberOfDays === 3 ? "bg-[var(--smakowalo-green-primary)]" : ""}
                    onClick={() => setNumberOfDays(3)}
                  >
                    3 dni
                  </Button>
                  <Button
                    variant={numberOfDays === 4 ? "default" : "outline"}
                    className={numberOfDays === 4 ? "bg-[var(--smakowalo-green-primary)]" : ""}
                    onClick={() => setNumberOfDays(4)}
                  >
                    4 dni
                  </Button>
                  <Button
                    variant={numberOfDays === 5 ? "default" : "outline"}
                    className={numberOfDays === 5 ? "bg-[var(--smakowalo-green-primary)]" : ""}
                    onClick={() => setNumberOfDays(5)}
                  >
                    5 dni
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-[var(--smakowalo-cream)] p-6 rounded-lg mb-8">
              <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-2">
                Koszt całkowity: <span className="text-[var(--smakowalo-green-primary)]">{totalCost} zł</span>
              </h3>
              <p className="text-gray-600 mb-2">
                {numberOfPeople} {numberOfPeople === 1 ? 'osoba' : numberOfPeople <= 4 ? 'osoby' : 'osób'} × {numberOfDays} {numberOfDays === 1 ? 'dzień' : 'dni'} × {pricePerPortion} zł za porcję
              </p>
              <p className="text-sm text-gray-500">
                Łącznie: {totalPortions} porcji = {totalCost} zł
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
              >
                Wstecz
              </Button>
              <Button
                size="lg"
                className="smakowalo-green"
                onClick={() => setStep(3)}
              >
                Dalej
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-[var(--smakowalo-green-dark)] mb-6 text-center">
              Krok 3: Wybierz {numberOfDays} dania
            </h2>
            <p className="text-center mb-6">Wybrano: {selectedDishes.length} z {numberOfDays}</p>

            {selectedDiets.length > 0 && (
              <div className="bg-[var(--smakowalo-cream)] p-4 rounded-lg mb-6">
                <p className="text-center text-sm text-gray-600">
                  Pokazuje produkty pasujące do wybranych diet: {selectedDiets.map(id => dietTypes.find(d => d.id === id)?.name).join(', ')}
                </p>
                <p className="text-center text-sm text-gray-500 mt-1">
                  Dostępnych produktów: {filteredProducts.length}
                </p>
              </div>
            )}

            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin text-[var(--smakowalo-green-primary)] mx-auto mb-4" />
                  <p className="text-gray-600">Ładowanie produktów z OpenCart...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Brak produktów dla wybranych diet</h3>
                <p className="text-gray-500 mb-6">
                  Spróbuj wybrać inne preferencje dietetyczne lub wróć do kroku 1
                </p>
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="mx-auto"
                >
                  Wróć do wyboru diet
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredProducts.map((dish) => (
                <Card
                  key={dish.id}
                  className={`cursor-pointer transition-all ${
                    selectedDishes.find(d => d.id === dish.id)
                      ? 'ring-2 ring-[var(--smakowalo-green-primary)] bg-green-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleDish(dish)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className={`absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        selectedDishes.find(d => d.id === dish.id)
                          ? 'bg-[var(--smakowalo-green-primary)] border-[var(--smakowalo-green-primary)]'
                          : 'bg-white border-gray-300'
                      }`}>
                        {selectedDishes.find(d => d.id === dish.id) && (
                          <Check className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[var(--smakowalo-green-dark)] mb-2">{dish.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{dish.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {dish.cook_time || 30} min
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-1" />
                          {dish.calories} kcal
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-lg font-bold text-[var(--smakowalo-green-primary)]">
                          {pricePerPortion} zł/porcja
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
                Podsumowanie zamówienia
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Preferencje dietetyczne:</span>
                  <span className="font-medium">
                    {selectedDiets.length > 0
                      ? selectedDiets.map(id => dietTypes.find(d => d.id === id)?.name).join(', ')
                      : 'Nie wybrano'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Liczba osób:</span>
                  <span className="font-medium">{numberOfPeople}</span>
                </div>
                <div className="flex justify-between">
                  <span>Liczba dni:</span>
                  <span className="font-medium">{numberOfDays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wybrane dania:</span>
                  <span className="font-medium">{selectedDishes.length}/{numberOfDays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Łączna liczba porcji:</span>
                  <span className="font-medium">{totalPortions}</span>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Łączna cena:</span>
                  <span className="text-[var(--smakowalo-green-primary)]">{totalCost} zł</span>
                </div>
              </div>
            </div>

            {!session && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                  <p className="text-amber-800">
                    Aby kontynuować, musisz się zalogować. Po kliknięciu "Dodaj do koszyka" zostaniesz przekierowany na stronę logowania.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(2)}
              >
                Wstecz
              </Button>
              <Button
                size="lg"
                className="smakowalo-green"
                disabled={selectedDishes.length < numberOfDays || isAddingToCart}
                onClick={handleAddToCart}
              >
                {isAddingToCart ? (
                  <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Dodawanie...
                  </>
                ) : (
                  <>
                    {!session ? 'Zaloguj się i dodaj do koszyka' : 'Dodaj do koszyka'}
                    <ShoppingCart className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Logo width={120} height={32} />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/menu" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Menu
                </Link>
                <Link href="/dlaczego-my" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Dlaczego my
                </Link>
                <Link href="/jak-to-dziala" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Jak to działa
                </Link>
                <Link href="/faq" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  FAQ
                </Link>
                <Link href="/dostawa" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Dostawa
                </Link>
                <Link href="/kreator" className="text-[var(--smakowalo-green-primary)] hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium border-b-2 border-[var(--smakowalo-green-primary)]">
                  Kreator
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!session ? (
                <Link href="/login">
                  <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-primary)] hover:text-white">
                    Zaloguj
                  </Button>
                </Link>
              ) : (
                <Link href="/panel">
                  <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-primary)] hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    Panel
                  </Button>
                </Link>
              )}

              {/* Only show basket button if user is logged in */}
              {session && (
                <Link href="/cart">
                  <Button className="smakowalo-green relative">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Koszyk
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
            Stwórz swój plan posiłków
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Wybierz swoje preferencje dietetyczne i zaplanuj tygodniowe menu. Cena: {pricePerPortion} zł za porcję.
          </p>
        </div>

        {renderStepContent()}
      </div>
    </div>
  )
}
