'use client'

import type React from 'react'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ChefHat, Clock, Heart, Loader, AlertCircle, Zap, CreditCard, Crown, Package, ShoppingCart, User, Truck, Home } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, storageKey: 'smakowalo_auth' },
}) : null

// Default/fallback pricing table for each combination (in PLN per week)
// These are fallback values in case Stripe prices fail to load
// The actual prices will be fetched from Stripe API
const DEFAULT_PRICING: Record<string, number> = {
  '2-2': 180,
  '2-3': 270,
  '2-4': 360,
  '2-5': 449,
  '3-2': 270,
  '3-3': 405,
  '3-4': 540,
  '3-5': 675,
  '4-2': 360,
  '4-3': 540,
  '4-4': 720,
  '4-5': 900,
};

// Updated diet types with icons/emojis
const dietTypes = [
  { id: 1, name: "Wysokobiałkowa", description: "Zwiększona zawartość białka", code: "wysokobiałkowa", icon: "💪", color: "pink" },
  { id: 2, name: "Niskokaloryczna", description: "Dania o niskiej kaloryczności", code: "niskokaloryczna", icon: "⚖️", color: "blue" },
  { id: 3, name: "Keto", description: "Niska zawartość węglowodanów", code: "keto", icon: "🥑", color: "purple" },
  { id: 4, name: "Wegetariańska", description: "Bez mięsa, z nabiałem", code: "wegetariańska", icon: "🌱", color: "green" },
  { id: 5, name: "Wegańska", description: "Bez produktów odzwierzęcych", code: "wegańska", icon: "🌿", color: "emerald" },
  { id: 6, name: "Niskowęglowodanowa", description: "Ograniczone węglowodany", code: "niskowęglowodanowa", icon: "🧀", color: "yellow" },
  { id: 7, name: "Pescetariańska", description: "Z rybami i owocami morza", code: "pescetariańska", icon: "🐟", color: "cyan" },
  { id: 8, name: "Elastyczna", description: "Różnorodne opcje", code: "elastyczna", icon: "🍽️", color: "gray" },
];

// Additional allergy options
const allergyOptions = [
  { id: 'gluten', name: 'Gluten' },
  { id: 'mleko', name: 'Mleko/Laktoza' },
  { id: 'orzechy', name: 'Orzechy' },
  { id: 'soja', name: 'Soja' },
  { id: 'jaja', name: 'Jaja' },
  { id: 'ryby', name: 'Ryby' },
  { id: 'skorupiaki', name: 'Skorupiaki' },
  { id: 'sezam', name: 'Sezam' },
];

const DRAFT_KEY = 'kreator_draft_v1';
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface KreatorDraft {
  v: number;
  ts: number;
  mode: 'subscription' | 'onetime';
  step: number;
  numberOfPeople: number;
  numberOfDays: number;
  selectedDiets: number[];
  selectedAllergies: string[];
  selectedDishes: number[];
  selectedDishesSub: number[];
}

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
  allergens?: string[];
}

// Steps configuration
const STEPS = [
  { id: 1, name: 'Wybierz Plan', icon: Package },
  { id: 2, name: 'Dzień Dostawy', icon: Truck },
  { id: 3, name: 'Preferencje', icon: Heart },
  { id: 4, name: 'Wybierz Dania', icon: ShoppingCart },
  { id: 5, name: 'Zarejestruj się', icon: User },
  { id: 6, name: 'Adres', icon: Home },
  { id: 7, name: 'Płatność', icon: CreditCard },
];

function KreatorPageComponent() {
  const { totalItems, addItem } = useCart()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Auth useEffect
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)

      // Auto-fill email from session
      if (session?.user?.email && !email) {
        setEmail(session.user.email)
      }

      // Auto-fill user details if available
      if (session?.user?.user_metadata) {
        const metadata = session.user.user_metadata
        if (metadata.full_name) {
          const nameParts = metadata.full_name.split(' ')
          if (nameParts.length > 0 && !firstName) setFirstName(nameParts[0])
          if (nameParts.length > 1 && !lastName) setLastName(nameParts.slice(1).join(' '))
        }
      }
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setAuthLoading(false)

      // Auto-fill email from session
      if (session?.user?.email && !email) {
        setEmail(session.user.email)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // State
  const [mode, setMode] = useState<'subscription' | 'onetime'>('subscription');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedDishesSub, setSelectedDishesSub] = useState<Product[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<number[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [selectedDishes, setSelectedDishes] = useState<Product[]>([]);
  const [step, setStep] = useState(1);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  // Stripe pricing state
  const [stripePrices, setStripePrices] = useState<Record<string, number>>(DEFAULT_PRICING);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  // Delivery day selection
  const [deliveryDay, setDeliveryDay] = useState<'tuesday' | 'thursday'>('tuesday');

  // Form state for steps 3-5
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('+48 ');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Zostaw przy drzwiach');

  // Save draft to localStorage
  const saveDraft = () => {
    try {
      const draft: KreatorDraft = {
        v: 1,
        ts: Date.now(),
        mode,
        step,
        numberOfPeople,
        numberOfDays,
        selectedDiets,
        selectedAllergies,
        selectedDishes: selectedDishes.map(d => d.id),
        selectedDishesSub: selectedDishesSub.map(d => d.id),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // Load draft from localStorage
  const loadDraft = () => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (!stored) return false;

      const draft: KreatorDraft = JSON.parse(stored);

      // Check expiry
      if (Date.now() - draft.ts > DRAFT_EXPIRY_MS) {
        localStorage.removeItem(DRAFT_KEY);
        return false;
      }

      // Restore state
      setMode(draft.mode);
      setStep(draft.step);
      setNumberOfPeople(draft.numberOfPeople);
      setNumberOfDays(draft.numberOfDays);
      setSelectedDiets(draft.selectedDiets);
      setSelectedAllergies(draft.selectedAllergies);

      return true;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return false;
    }
  };

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Fetch Stripe prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoadingPrices(true);
        const response = await fetch('/api/stripe/prices');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.prices) {
            setStripePrices(data.prices);
          }
        }
      } catch (error) {
        // Keep using default prices on error
      } finally {
        setIsLoadingPrices(false);
      }
    };
    fetchPrices();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.products) {
            const products = data.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              image: p.image,
              calories: p.calories || 400,
              cook_time: p.cook_time || 30,
              price: p.price || 35,
              diets: p.diets || [],
              allergens: p.allergens || []
            }));
            setAvailableProducts(products);
          }
        }
      } catch (error) {
        // ignore
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Get price from Stripe (with fallback to defaults)
  const getPrice = (people: number, days: number): number => {
    const key = `${people}-${days}`;
    return stripePrices[key] || DEFAULT_PRICING[key] || 0;
  };

  // Calculate price
  const currentPrice = getPrice(numberOfPeople, numberOfDays);
  const discountPercentage = 0.25; // 25% discount
  const discountedPrice = currentPrice * (1 - discountPercentage);
  const discount = currentPrice - discountedPrice;
  const totalServings = numberOfPeople * numberOfDays;
  const pricePerServing = totalServings ? currentPrice / totalServings : 0;
  const discountedPricePerServing = totalServings ? discountedPrice / totalServings : 0;

  // Render top navigation with step indicator
  const renderTopNavigation = (): React.ReactElement => {
    return (
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo and close */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            SMAKOWAŁO
          </Link>
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            ✕
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Krok {step} z {STEPS.length}
            </span>
            <span className="text-sm font-medium text-[var(--smakowalo-green-primary)]">
              {Math.round((step / STEPS.length) * 100)}% ukończone
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[var(--smakowalo-green-primary)] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step indicators - hidden on mobile, shown on tablet+ */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  step === s.id
                    ? 'bg-[var(--smakowalo-green-primary)] text-white'
                    : step > s.id
                    ? 'bg-green-100 text-[var(--smakowalo-green-primary)]'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <s.icon className="w-4 h-4" />
                  <span className="text-xs font-medium hidden lg:inline">{s.name}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 transition-all duration-300 ${
                    step > s.id ? 'bg-[var(--smakowalo-green-primary)]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile step indicator */}
        <div className="md:hidden">
          {(() => {
            const currentStep = STEPS[step - 1];
            const StepIcon = currentStep.icon;
            return (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                <StepIcon className="w-5 h-5 text-[var(--smakowalo-green-primary)]" />
                <span className="font-medium">{currentStep.name}</span>
              </div>
            );
          })()}
        </div>
      </div>
      </div>
    );
  };

  // Render order summary (sticky right panel)
  const renderOrderSummary = () => (
    <div className="sticky top-24 h-fit">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Podsumowanie zamówienia</h3>

          <div className="flex items-start space-x-4 mb-6 pb-6 border-b">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-12 h-12 text-[var(--smakowalo-green-primary)]" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">
                {numberOfDays} posiłk{numberOfDays === 1 ? '' : numberOfDays < 5 ? 'i' : 'ów'} dla {numberOfPeople} osób tygodniowo
              </h4>
              <p className="text-sm text-gray-600">
                {totalServings} porcj{totalServings === 1 ? 'a' : totalServings < 5 ? 'e' : 'i'} po{' '}
                <span className="font-semibold text-[var(--smakowalo-green-primary)]">{discountedPricePerServing.toFixed(2)} zł</span> za porcję
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-700">
              <span>Cena pudełka</span>
              <span className="font-medium">{currentPrice.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Wysyłka</span>
              <span className="text-green-600 font-semibold">GRATIS</span>
            </div>
            <div className="flex justify-between text-red-600 font-semibold">
              <span>Rabat</span>
              <span>-{discount.toFixed(2)} zł</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-lg font-bold text-gray-900">Pierwsze pudełko razem</span>
              <div className="text-right">
                <div className="line-through text-gray-400 text-sm">{currentPrice.toFixed(2)} zł</div>
                <div className="text-2xl font-bold text-[var(--smakowalo-green-primary)]">
                  {discountedPrice.toFixed(2)} zł
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-pink-50 border border-pink-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Truck className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                Możesz <strong>pominąć tydzień lub anulować</strong> w dowolnym momencie.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2DeliveryDay();
      case 3:
        return renderStep3Preferences();
      case 4:
        return renderStep4Dishes();
      case 5:
        return renderStep5Register();
      case 6:
        return renderStep6Address();
      case 7:
        return renderStep7Payment();
      default:
        return null;
    }
  };

  // Step 1: Select Plan (Box size only)
  const renderStep1 = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 text-center">
        <p className="text-sm md:text-base text-blue-900">
          Ciesz się łączną zniżką <strong>{(discount * 5).toFixed(0)} zł OFF</strong> przez pierwsze 5 pudełek!{' '}
          <button className="underline font-semibold">Pokaż szczegóły</button>
        </p>
      </div>

      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 text-center">
        Stwórz Swoje Pierwsze Pudełko
      </h1>

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Wybierz Rozmiar Pudełka</h2>
        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
          Wybierz spośród różnorodnych nowych przepisów zatwierdzonych przez dietetyków każdego tygodnia
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <label className="block font-bold text-gray-900 mb-3">Liczba osób</label>
            <div className="grid grid-cols-3 gap-4">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                    numberOfPeople === num
                      ? 'bg-[var(--smakowalo-green-primary)] text-white border-[var(--smakowalo-green-primary)]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--smakowalo-green-primary)]'
                  }`}
                  onClick={() => setNumberOfPeople(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-900 mb-3">Posiłków tygodniowo</label>
            <div className="grid grid-cols-4 gap-4">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                    numberOfDays === num
                      ? 'bg-[var(--smakowalo-green-primary)] text-white border-[var(--smakowalo-green-primary)]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--smakowalo-green-primary)]'
                  }`}
                  onClick={() => setNumberOfDays(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-900">
                {selectedDiets.length > 0
                  ? dietTypes.find(d => d.id === selectedDiets[0])?.name
                  : 'Elastyczna'}
              </span>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Najpopularniejsze
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {numberOfDays} posiłk{numberOfDays < 5 ? 'i' : 'ów'} dla {numberOfPeople} osób tygodniowo
            </p>
            <p className="text-sm text-gray-600 mb-3">{totalServings} porcji razem</p>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cena pudełka</span>
                <span className="font-semibold">{currentPrice.toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cena za porcję</span>
                <div>
                  <span className="line-through text-gray-400 mr-2">{pricePerServing.toFixed(2)} zł</span>
                  <span className="font-semibold text-red-600">{discountedPricePerServing.toFixed(2)} zł</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Pierwsze pudełko</span>
                <div className="text-right">
                  <div className="line-through text-gray-400 text-sm">{currentPrice.toFixed(2)} zł</div>
                  <div className="text-xl font-bold text-[var(--smakowalo-green-primary)]">
                    {discountedPrice.toFixed(2)} zł
                  </div>
                </div>
              </div>
              <div className="mt-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold inline-block">
                {((discount / currentPrice) * 100).toFixed(0)}% OFF ({discount.toFixed(2)} zł taniej)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          className="w-full md:w-auto bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white px-8 md:px-16 py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg"
          onClick={() => setStep(2)}
        >
          Dalej
        </Button>
      </div>
    </div>
  );

  // Step 2: Delivery Day Selection
  const renderStep2DeliveryDay = () => (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6 text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
          Wybierz Dzień Dostawy
        </h1>
        <p className="text-gray-700 text-sm md:text-lg">
          Dostawy realizujemy <strong>dwa razy w tygodniu</strong>. Wybierz preferowany dzień.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Dostępne Dni Dostawy</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Tuesday */}
            <button
              onClick={() => setDeliveryDay('tuesday')}
              className={`p-4 md:p-6 rounded-xl border-2 transition-all text-left ${
                deliveryDay === 'tuesday'
                  ? 'bg-[var(--smakowalo-green-primary)] text-white border-[var(--smakowalo-green-primary)] shadow-lg'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--smakowalo-green-primary)]'
              }`}
            >
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Truck className="w-6 h-6 md:w-8 md:h-8" />
                  <h3 className="text-lg md:text-2xl font-bold">Wtorek</h3>
                </div>
                {deliveryDay === 'tuesday' && (
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-[var(--smakowalo-green-primary)]" />
                  </div>
                )}
              </div>
              <p className={`text-sm md:text-base ${deliveryDay === 'tuesday' ? 'text-green-50' : 'text-gray-600'}`}>
                Dostawa we wtorek między 8:00 - 21:00
              </p>
            </button>

            {/* Thursday */}
            <button
              onClick={() => setDeliveryDay('thursday')}
              className={`p-4 md:p-6 rounded-xl border-2 transition-all text-left ${
                deliveryDay === 'thursday'
                  ? 'bg-[var(--smakowalo-green-primary)] text-white border-[var(--smakowalo-green-primary)] shadow-lg'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--smakowalo-green-primary)]'
              }`}
            >
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Truck className="w-6 h-6 md:w-8 md:h-8" />
                  <h3 className="text-lg md:text-2xl font-bold">Czwartek</h3>
                </div>
                {deliveryDay === 'thursday' && (
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-[var(--smakowalo-green-primary)]" />
                  </div>
                )}
              </div>
              <p className={`text-sm md:text-base ${deliveryDay === 'thursday' ? 'text-green-50' : 'text-gray-600'}`}>
                Dostawa w czwartek między 8:00 - 21:00
              </p>
            </button>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Ważne informacje:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Zamów do <strong>niedzieli 23:59</strong>, a box wyślemy w wybrany dzień.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Dostawa <strong>w cenie subskrypcji</strong> - bez dodatkowych opłat.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Możesz zmienić dzień dostawy w panelu klienta przed kolejnym tygodniem.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Jeśli z jakichś powodów nie wybierzesz menu na kolejny tydzień, nasz system zrobi to za Ciebie uwzględniając Twoje preferencje.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse md:flex-row justify-between items-stretch md:items-center gap-3 pt-6">
        <Button
          variant="ghost"
          onClick={() => setStep(1)}
          className="w-full md:w-auto"
        >
          Wstecz
        </Button>

        <Button
          size="lg"
          className="w-full md:w-auto bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white px-8 md:px-16 py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg"
          onClick={() => setStep(3)}
        >
          Dalej
        </Button>
      </div>
    </div>
  );

  // Step 3: Preferences (Diet + Allergies)
  const renderStep3Preferences = () => (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 text-center">
        Stwórz Swoje Pierwsze Pudełko
      </h1>

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">1. Wybierz swoje preferencje</h2>
        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
          Twoje preferencje pomagają nam pokazać Ci najbardziej odpowiednie przepisy. Nadal będziesz mieć dostęp do wszystkich przepisów każdego tygodnia!
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {dietTypes.map((diet) => (
            <Card
              key={diet.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDiets.includes(diet.id)
                  ? 'ring-2 ring-[var(--smakowalo-green-primary)] bg-green-50'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => {
                if (selectedDiets.includes(diet.id)) {
                  setSelectedDiets(prev => prev.filter(id => id !== diet.id));
                } else if (selectedDiets.length < 3) {
                  setSelectedDiets(prev => [...prev, diet.id]);
                }
              }}
            >
              <CardContent className="p-4 text-center relative">
                {selectedDiets.includes(diet.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--smakowalo-green-primary)] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="text-3xl mb-2">{diet.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm leading-tight">{diet.name}</h3>
                <p className="text-xs text-gray-500 leading-tight">{diet.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alergie */}
        <div className="mt-6 md:mt-8">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Alergie i nietolerancje</h3>
          <p className="text-gray-600 mb-3 md:mb-4 text-xs md:text-sm">
            Zaznacz składniki, których chcesz unikać. Będziemy filtrować dla Ciebie przepisy na całej stronie i w menu.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {allergyOptions.map((allergy) => (
              <label
                key={allergy.id}
                className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAllergies.includes(allergy.id)
                    ? 'bg-orange-50 border-orange-500'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAllergies.includes(allergy.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAllergies(prev => [...prev, allergy.id])
                    } else {
                      setSelectedAllergies(prev => prev.filter(id => id !== allergy.id))
                    }
                  }}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-900">{allergy.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row justify-between items-stretch md:items-center gap-3 pt-6">
        <Button
          variant="ghost"
          onClick={() => setStep(2)}
          className="w-full md:w-auto"
        >
          Wstecz
        </Button>

        <Button
          size="lg"
          className="w-full md:w-auto bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white px-8 md:px-16 py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (selectedDiets.length === 0) {
              alert('Wybierz przynajmniej 1 kategorię diety')
              return
            }
            // Skip registration if user is already logged in
            if (session?.user) {
              setStep(5)
            } else {
              setStep(4)
            }
          }}
          disabled={selectedDiets.length === 0}
        >
          Dalej
        </Button>
      </div>
    </div>
  );

  // Step 4: Select Dishes (Meal Selection based on Preferences)
  const renderStep4Dishes = () => {
    // Calculate required dishes: (people × days) ÷ 2
    // Example: 2 people × 3 days = 6 portions = 3 dishes (3 double portions)
    const requiredDishes = (numberOfPeople * numberOfDays) / 2;

    // Filter products based on selected diets and allergies
    const filteredProducts = availableProducts.filter(product => {
      // Check if product matches selected diets
      const matchesDiet = selectedDiets.length === 0 || selectedDiets.some(dietId => {
        const diet = dietTypes.find(d => d.id === dietId);
        return diet && product.diets?.includes(diet.code);
      });

      // Check if product doesn't contain selected allergens
      const hasNoAllergens = selectedAllergies.every(allergyId => {
        return !product.allergens?.includes(allergyId);
      });

      return matchesDiet && hasNoAllergens;
    });

    const toggleDish = (product: Product) => {
      setSelectedDishesSub(prev => {
        const exists = prev.find(d => d.id === product.id);
        if (exists) {
          // Always allow deselecting
          return prev.filter(d => d.id !== product.id);
        }
        // Only allow selecting if under the limit
        if (prev.length < requiredDishes) {
          return [...prev, product];
        }
        return prev;
      });
    };

    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Wybierz {requiredDishes} Dań</h2>
          <p className="text-lg text-gray-600 mb-3">
            Dostosowane do Twoich preferencji żywieniowych
          </p>
          <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
            <p className="text-sm text-gray-700">
              {numberOfPeople} {numberOfPeople === 2 ? 'osoby' : 'osób'} × {numberOfDays} dni = {numberOfPeople * numberOfDays} porcji = <strong>{requiredDishes} {requiredDishes === 1 ? 'podwójna porcja' : 'podwójne porcje'}</strong>
            </p>
            <p className="text-lg font-bold text-[var(--smakowalo-green-primary)] mt-2">
              Wybrano: {selectedDishesSub.length} z {requiredDishes}
            </p>
          </div>
          {selectedDiets.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {selectedDiets.map(dietId => {
                const diet = dietTypes.find(d => d.id === dietId);
                return diet ? (
                  <Badge key={dietId} variant="secondary" className="text-sm">
                    {diet.icon} {diet.name}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        {isLoadingProducts ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-8 h-8 animate-spin text-[var(--smakowalo-green-primary)]" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Brak dostępnych dań dla wybranych preferencji.</p>
            <Button
              onClick={() => setStep(3)}
              variant="outline"
              className="mt-4"
            >
              Wróć do preferencji
            </Button>
          </div>
        ) : filteredProducts.length < requiredDishes ? (
          <div className="text-center py-20">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <p className="text-gray-700 mb-2">
                Dostępnych jest tylko <strong>{filteredProducts.length}</strong> dań, a potrzebujesz wybrać <strong>{requiredDishes}</strong>.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Spróbuj zmienić preferencje dietetyczne lub alergeny.
              </p>
              <Button
                onClick={() => setStep(3)}
                variant="outline"
                className="mt-4"
              >
                Wróć do preferencji
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProducts.map((product) => {
              const isSelected = selectedDishesSub.some(d => d.id === product.id);
              const canSelect = selectedDishesSub.length < requiredDishes || isSelected;

              return (
                <Card
                  key={product.id}
                  className={`transition-all ${
                    isSelected
                      ? 'ring-2 ring-[var(--smakowalo-green-primary)] cursor-pointer hover:shadow-lg'
                      : canSelect
                        ? 'cursor-pointer hover:shadow-lg hover:border-[var(--smakowalo-green-primary)]'
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => canSelect && toggleDish(product)}
                >
                  <CardContent className="p-4">
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={product.image || '/placeholder-dish.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[var(--smakowalo-green-primary)] text-white rounded-full p-2">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                      {!canSelect && !isSelected && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <p className="text-white text-sm font-semibold px-4 text-center">
                            Limit osiągnięty
                          </p>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {product.calories} kcal
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {product.cook_time} min
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex justify-between">
          <Button onClick={() => setStep(3)} variant="outline" size="lg">
            Wstecz
          </Button>
          <Button
            onClick={() => setStep(5)}
            size="lg"
            className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedDishesSub.length !== requiredDishes}
          >
            {selectedDishesSub.length === requiredDishes
              ? 'Kontynuuj'
              : `Wybierz jeszcze ${requiredDishes - selectedDishesSub.length} ${requiredDishes - selectedDishesSub.length === 1 ? 'danie' : 'dań'}`
            }
          </Button>
        </div>
      </div>
    );
  };

  // Step 5: Register
  const renderStep5Register = () => {
    // If user is already logged in, skip to step 6
    if (session?.user) {
      setStep(6)
      return null
    }

    return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
        Zaczynajmy!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Benefits */}
        <div className="bg-green-50 rounded-lg p-8">
          <div className="mb-6">
            <Image
              src="https://ugc.same-assets.com/FK44f03I3gohrH9kV2xljiQWbinpYmGw.jpeg"
              alt="Fresh meal"
              width={400}
              height={300}
              className="rounded-lg"
            />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Co Cię czeka</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-[var(--smakowalo-green-primary)] flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{(discountPercentage * 100)}% zniżki na pierwsze pudełko</span>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-[var(--smakowalo-green-primary)] flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">25% zniżki na kolejne 4 pudełka</span>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-[var(--smakowalo-green-primary)] flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Całkowicie elastycznie. Wstrzymaj lub anuluj w dowolnym momencie.</span>
            </div>
          </div>
        </div>

        {/* Right: Email form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--smakowalo-green-primary)] focus:border-transparent"
            />
          </div>

          <div className="flex items-start space-x-2">
            <input type="checkbox" id="marketing" className="mt-1" />
            <label htmlFor="marketing" className="text-sm text-gray-600">
              Tak, chciałbym otrzymywać marketing bezpośredni (w tym przez email, SMS i telefon).
              Zobacz nasze <Link href="/polityka-prywatnosci" target="_blank" className="underline text-[var(--smakowalo-green-primary)]">Zasady Prywatności</Link>, aby uzyskać więcej informacji.
            </label>
          </div>

          <Button
            size="lg"
            className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white py-6 text-lg font-semibold"
            onClick={() => {
              // Save email to localStorage
              if (email) {
                localStorage.setItem('kreator_email', email)
              }
              // Save kreator state
              saveDraft()
              // Redirect to register page with Google/Facebook options
              router.push(`/register?callbackUrl=/kreator&email=${encodeURIComponent(email)}`)
            }}
            disabled={!email}
          >
            Kontynuuj
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Kontynuując, zgadzasz się otrzymywać emaile marketingowe oraz nasze{' '}
            <Link href="/regulamin" target="_blank" className="underline text-[var(--smakowalo-green-primary)] hover:text-[var(--smakowalo-green-dark)]">Warunki</Link> i{' '}
            <Link href="/polityka-prywatnosci" target="_blank" className="underline text-[var(--smakowalo-green-primary)] hover:text-[var(--smakowalo-green-dark)]">Politykę Prywatności</Link>. Możesz wypisać się w dowolnym momencie.
          </p>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Masz już konto?{' '}
              <button
                onClick={() => {
                  // Save kreator state to localStorage before redirecting to login
                  saveDraft()
                  router.push('/login?callbackUrl=/kreator')
                }}
                className="font-semibold text-[var(--smakowalo-green-primary)] underline cursor-pointer bg-transparent border-0"
              >
                Zaloguj się
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <Button
          variant="outline"
          onClick={() => setStep(3)}
        >
          Wstecz
        </Button>
      </div>
    </div>
    )
  };

  // Step 5: Delivery Address
  const renderStep6Address = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Adres Dostawy</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imię *</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jan"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--smakowalo-green-primary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nazwisko *</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Kowalski"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--smakowalo-green-primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ulica *</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="ul. Główna 123"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--smakowalo-green-primary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Linia adresu 2</label>
          <input
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Mieszkanie, budynek"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--smakowalo-green-primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Miasto *</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Warszawa"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--smakowalo-green-primary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kod pocztowy *</label>
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="00-001"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--smakowalo-green-primary)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Numer telefonu *</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            let value = e.target.value
            // Always keep +48 prefix
            if (!value.startsWith('+48 ')) {
              const numbers = value.replace(/\D/g, '')
              const cleanNumbers = numbers.startsWith('48') ? numbers.slice(2) : numbers
              value = '+48 ' + cleanNumbers
            }
            // Limit to +48 and 9 digits
            const numbers = value.slice(4).replace(/\D/g, '').slice(0, 9)
            setPhone('+48 ' + numbers)
          }}
          placeholder="+48 123 456 789"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--smakowalo-green-primary)]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Instrukcje dostawy</label>
        <div className="relative">
          <select
            value={deliveryInstructions}
            onChange={(e) => setDeliveryInstructions(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--smakowalo-green-primary)] appearance-none bg-white"
          >
            <option>Zostaw przy drzwiach</option>
            <option>Zadzwoń po przyjeździe</option>
            <option>Zostaw u sąsiada</option>
            <option>Zadzwoń domofonem</option>
          </select>
          <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--smakowalo-green-primary)]" />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white py-6 text-lg font-semibold"
        onClick={() => setStep(7)}
        disabled={!firstName || !lastName || !street || !city || !postcode || phone.length < 5}
      >
        Dalej
      </Button>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => setStep(5)}
        >
          Wstecz
        </Button>
      </div>
    </div>
  );

  // Step 6: Payment & Confirmation - Redirect to Stripe
  const renderStep7Payment = () => {
    // Check if user is authenticated before showing payment step
    if (!session?.user) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Wymagane logowanie</h3>
            <p className="text-gray-700 mb-4">
              Aby kontynuować i opłacić subskrypcję, musisz być zalogowany.
            </p>
            <Button
              size="lg"
              className="bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white"
              onClick={() => router.push('/login?callbackUrl=/kreator')}
            >
              Przejdź do logowania
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => setStep(6)}
            >
              Wstecz
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Podsumowanie i Płatność</h2>
          <p className="text-lg text-gray-600">
            Sprawdź swoje zamówienie i przejdź do bezpiecznej płatności przez Stripe
          </p>
        </div>

        {/* Important info banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Elastyczna subskrypcja</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Nie zostaniesz obciążony przez 5 dni przed wybraną datą dostawy</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Możesz wstrzymać, zmienić lub anulować w dowolnym momencie</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Po opłaceniu wybierzesz posiłki na pierwszy tydzień</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stripe payment info */}
        <div className="bg-white border-2 border-blue-200 rounded-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <CreditCard className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-3">
            Bezpieczna płatność przez Stripe
          </h3>
          <p className="text-center text-gray-600 mb-6">
            Zostaniesz przekierowany do Stripe, aby bezpiecznie wprowadzić dane karty płatniczej.
            Stripe to światowy lider w przetwarzaniu płatności online.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Szyfrowanie SSL</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>PCI DSS</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Karty i BLIK</span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Szybko i łatwo</h4>
              <p className="text-sm text-gray-600">
                Cały proces zajmie tylko kilka minut
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Bezpieczeństwo</h4>
              <p className="text-sm text-gray-600">
                Twoje dane są w pełni chronione
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)] text-white py-8 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={handleSubscriptionPayment}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <Loader className="mr-3 h-6 w-6 animate-spin" />
                Przekierowywanie do Stripe...
              </>
            ) : (
              <>
                <CreditCard className="mr-3 h-6 w-6" />
                Przejdź do płatności Stripe
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center px-4">
            Klikając powyższy przycisk, zgadzasz się z naszymi{' '}
            <a href="#" className="underline">warunkami świadczenia usług</a> i{' '}
            <a href="#" className="underline">polityką prywatności</a>.
            Twoja subskrypcja będzie odnawiać się automatycznie co tydzień, a możesz ją anulować w dowolnym momencie
            w panelu klienta przed 23:59 co najmniej 5 dni przed kolejną dostawą.
          </p>
        </div>

        {/* Back button */}
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            onClick={() => setStep(6)}
            disabled={isProcessingPayment}
          >
            Wstecz
          </Button>
        </div>
      </div>
    );
  };

  // Payment handler - FIXED to work with Stripe
  const handleSubscriptionPayment = async () => {
    // Check authentication
    if (!session?.user) {
      alert('Musisz być zalogowany. Przekierowuję do logowania...');
      router.push('/login?callbackUrl=/kreator');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Get user from Supabase
      const { data: { user } } = await supabase!.auth.getUser();

      if (!user) {
        throw new Error('Nie można pobrać danych użytkownika');
      }

      // Prepare payload for Stripe
      const payload = {
        numberOfPeople,
        numberOfDays,
        deliveryDay,
        planType: 'weekly',
        userId: user.id,
        userEmail: user.email || email,
        selectedDiets,
        selectedAllergies,
        selectedMeals: selectedDishesSub.map(d => d.id),
        shippingAddress: {
          firstName,
          lastName,
          street,
          addressLine2,
          city,
          postcode,
          phone,
          deliveryInstructions
        }
      };

      console.log('📦 Creating Stripe Checkout session:', payload);

      // Call API
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.url) {
        console.log('✅ Redirecting to Stripe Checkout...');
        window.location.href = result.url;
      } else {
        throw new Error(result.error || 'Nie udało się utworzyć sesji płatności');
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Wystąpił błąd: ${error.message || 'Spróbuj ponownie.'}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {renderTopNavigation()}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className={`grid grid-cols-1 ${step === 1 ? '' : 'lg:grid-cols-3'} gap-8`}>
          <div
            key={step}
            className={`${step === 1 ? 'max-w-4xl mx-auto' : 'lg:col-span-2'} animate-fadeIn`}
          >
            {renderStepContent()}
          </div>
          {step !== 1 && (
            <div className="lg:col-span-1 hidden lg:block">
              {renderOrderSummary()}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky summary at bottom */}
      {step !== 1 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600">Pierwsze pudełko razem</div>
              <div className="text-xl font-bold text-[var(--smakowalo-green-primary)]">
                {discountedPrice.toFixed(2)} zł
              </div>
            </div>
            <div className="text-right">
              <div className="line-through text-gray-400 text-sm">{currentPrice.toFixed(2)} zł</div>
              <div className="text-xs text-green-600 font-semibold">Oszczędzasz {discount.toFixed(2)} zł</div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

export default function KreatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    }>
      <KreatorPageComponent />
    </Suspense>
  );
}
