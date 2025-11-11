"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calculator,
  Clock,
  CreditCard,
  HelpCircle,
  MapPin,
  Package,
  Recycle,
  Shield,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const deliveryAreas = [
  { city: "Warszawa", zone: "A", price: 9.99, coordinates: [52.2297, 21.0122] },
  { city: "Kraków", zone: "A", price: 9.99, coordinates: [50.0647, 19.945] },
  { city: "Gdańsk", zone: "B", price: 12.99, coordinates: [54.352, 18.6466] },
  { city: "Wrocław", zone: "A", price: 9.99, coordinates: [51.1079, 17.0385] },
  { city: "Poznań", zone: "A", price: 9.99, coordinates: [52.4064, 16.9252] },
  { city: "Łódź", zone: "B", price: 12.99, coordinates: [51.7592, 19.456] },
  { city: "Katowice", zone: "A", price: 9.99, coordinates: [50.2649, 19.0238] },
  { city: "Lublin", zone: "C", price: 15.99, coordinates: [51.2465, 22.5684] },
];

function DeliveryCostCalculator() {
  const [selectedCity, setSelectedCity] = useState("");
  const [orderValue, setOrderValue] = useState("");
  const [isSubscription, setIsSubscription] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState<number | null>(null);

  const calculateCost = () => {
    const city = deliveryAreas.find((area) => area.city === selectedCity);
    if (!city || !orderValue) return;

    const value = Number.parseFloat(orderValue);
    let cost = city.price;

    // Darmowa dostawa od 150 zł
    if (value >= 150) {
      cost = 0;
    }
    // Zniżka dla subskrypcji
    else if (isSubscription) {
      cost = 4.99;
    }

    setDeliveryCost(cost);
  };

  return (
    <Card className="border-2 hover:border-[var(--smakowalo-brown)] transition-colors">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-[var(--smakowalo-light-beige)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-[var(--smakowalo-brown)]" />
        </div>
        <CardTitle className="text-xl text-[var(--smakowalo-green-dark)]">
          Kalkulator kosztów dostawy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wybierz miasto:
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Wybierz miasto</option>
            {deliveryAreas.map((area) => (
              <option key={area.city} value={area.city}>
                {area.city} (Strefa {area.zone})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wartość zamówienia (zł):
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={orderValue}
            onChange={(e) => setOrderValue(e.target.value)}
            placeholder="np. 120"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="subscription"
            checked={isSubscription}
            onChange={(e) => setIsSubscription(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="subscription" className="text-sm text-gray-700">
            Mam aktywną subskrypcję
          </label>
        </div>

        <Button
          onClick={calculateCost}
          className="w-full smakowalo-green"
          disabled={!selectedCity || !orderValue}
        >
          Oblicz koszt dostawy
        </Button>

        {deliveryCost !== null && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-bold text-[var(--smakowalo-green-dark)] mb-2">
              Koszt dostawy:{" "}
              {deliveryCost === 0 ? "DARMOWA!" : `${deliveryCost} zł`}
            </h4>
            {deliveryCost === 0 && (
              <p className="text-sm text-green-600">
                🎉 Gratulacje! Twoje zamówienie kwalifikuje się do darmowej
                dostawy!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InteractiveMap() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <Card className="border-2 hover:border-[var(--smakowalo-brown)] transition-colors">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-[var(--smakowalo-light-beige)] rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-[var(--smakowalo-brown)]" />
        </div>
        <CardTitle className="text-xl text-[var(--smakowalo-green-dark)]">
          Interaktywna mapa dostaw
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 h-64 overflow-hidden">
          {/* Mapa Polski (uproszczona) */}
          <div className="relative w-full h-full">
            {deliveryAreas.map((area, index) => (
              <button
                key={area.city}
                className={`absolute w-3 h-3 rounded-full transition-all duration-300 hover:scale-150 ${
                  area.zone === "A"
                    ? "bg-green-500"
                    : area.zone === "B"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                } ${selectedCity === area.city ? "scale-150 ring-2 ring-white" : ""}`}
                style={{
                  left: `${(area.coordinates[1] - 14) * 12}%`,
                  top: `${(55 - area.coordinates[0]) * 8}%`,
                }}
                onClick={() =>
                  setSelectedCity(selectedCity === area.city ? null : area.city)
                }
                title={`${area.city} - Strefa ${area.zone} - ${area.price} zł`}
              />
            ))}
          </div>

          {selectedCity && (
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg max-w-xs">
              {(() => {
                const city = deliveryAreas.find((a) => a.city === selectedCity);
                return city ? (
                  <div>
                    <h4 className="font-bold text-[var(--smakowalo-green-dark)]">
                      {city.city}
                    </h4>
                    <p className="text-sm text-gray-600">Strefa {city.zone}</p>
                    <p className="text-sm font-medium">
                      Koszt dostawy: {city.price} zł
                    </p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span>Strefa A (9.99 zł)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
            <span>Strefa B (12.99 zł)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <span>Strefa C (15.99 zł)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DostavaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--smakowalo-green-dark)] mb-6">
            Dostawa
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Dostarczamy świeże składniki bezpośrednio pod Twoje drzwi w całej
            Polsce. Sprawdź, gdzie dowozimy i jak działają nasze dostawy.
          </p>
        </div>
      </section>

      {/* Interactive Tools Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Sprawdź dostawę w swojej okolicy
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <InteractiveMap />
            <DeliveryCostCalculator />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--smakowalo-green-primary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Gotowy na pierwszą dostawę?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Sprawdź obszar dostawy i zacznij swoją przygodę ze zdrowymi
            posiłkami!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kreator">
              <Button
                size="lg"
                className="bg-white text-[var(--smakowalo-green-primary)] hover:bg-gray-100 text-lg px-8 py-3 rounded-lg"
              >
                Rozpocznij teraz
              </Button>
            </Link>
            <Link href="/menu">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[var(--smakowalo-green-primary)] text-lg px-8 py-3 rounded-lg"
              >
                Zobacz menu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
