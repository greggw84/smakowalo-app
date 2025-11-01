'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, Clock, Heart, Truck, Leaf, Scale, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">

      {/* 🎬 Hero Section */}
      <section className="relative min-h-[600px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--smakowalo-green-dark)] leading-tight">
                ZDROWE JEDZENIE,<br />
                <span className="text-[var(--smakowalo-green-primary)]">TWÓJ SPOSÓB</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Zestawy posiłków dla zapracowanych z 8 opcjami diet do wyboru każdego tygodnia.
                Wybierz spośród wysokobiałkowych, niskokalorycznych, wegańskich, wegetariańskich,
                niskowęglowodanowych, elastycznych, keto i pescetariańskich opcji.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/kreator">
                  <Button size="lg" className="smakowalo-green text-lg px-8 py-3 rounded-lg">
                    Zacznij gotować
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button variant="outline" size="lg" className="border-[var(--smakowalo-brown)] text-[var(--smakowalo-brown)] hover:bg-[var(--smakowalo-brown)] hover:text-white text-lg px-8 py-3 rounded-lg">
                    Zobacz menu
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="https://ext.same-assets.com/290874832/189435024.jpeg"
                  alt="Smakowało - Świeże składniki"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔒 Old "3 Steps" (hidden) */}
      <div className="hidden" aria-hidden="true">
        <section className="py-16 bg-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">Przejmij kontrolę nad posiłkami w 3 krokach</h2>
          </div>
        </section>
      </div>

      {/* 🌿 NEW SECTION: Świeże składniki. Idealne porcje. Zero odpadów. */}
      <section className="py-16 bg-[var(--smakowalo-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[var(--smakowalo-green-primary)] mb-4">
              Świeże składniki. Idealne porcje. Zero odpadów.
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Dostarczymy pod Twoje drzwi wszystko, czego potrzebujesz do ugotowania pysznego posiłku.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-none shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg rounded-2xl bg-white">
                  <Leaf className="w-10 h-10 text-[var(--smakowalo-green-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">Świeże z farm</h3>
                <p className="text-gray-600">Współpracujemy z lokalnymi dostawcami, by zapewnić najwyższą jakość.</p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg rounded-2xl bg-white">
                  <Scale className="w-10 h-10 text-[var(--smakowalo-green-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">Idealne porcje</h3>
                <p className="text-gray-600">Odmierzone składniki dla 2 lub 4 osób. Koniec z resztkami i marnowaniem!</p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg rounded-2xl bg-white">
                  <Package className="w-10 h-10 text-[var(--smakowalo-green-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--smakowalo-green-dark)] mb-4">Stylowe pudełko</h3>
                <p className="text-gray-600">Bezpiecznie zapakowane i gotowe do gotowania od razu po otwarciu.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 💚 Dlaczego my */}
      <section className="py-16 bg-gradient-to-r from-smakowalo-cream to-smakowalo-light-beige">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">Dlaczego my?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Oszczędzasz czas, stres, pieniądze i przyczyniasz się do dbania o planetę</p>
        </div>
        {/* cztery karty jak w oryginale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center border-none shadow-lg bg-white"><CardContent className="p-6"><div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)] rounded-xl flex items-center justify-center shadow-lg"><Clock className="w-8 h-8 text-white" /></div><h3 className="font-bold text-[var(--smakowalo-green-dark)] mb-2">Czas</h3><p className="text-sm text-gray-600">Nie musisz planować posiłków ani chodzić na zakupy</p></CardContent></Card>
          <Card className="text-center border-none shadow-lg bg-white"><CardContent className="p-6"><div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"><Heart className="w-8 h-8 text-white" /></div><h3 className="font-bold text-[var(--smakowalo-green-dark)] mb-2">Stres</h3><p className="text-sm text-gray-600">Wszystko dostarczymy prosto pod Twoje drzwi</p></CardContent></Card>
          <Card className="text-center border-none shadow-lg bg-white"><CardContent className="p-6"><div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Truck className="w-8 h-8 text-white" /></div><h3 className="font-bold text-[var(--smakowalo-green-dark)] mb-2">Pieniądze</h3><p className="text-sm text-gray-600">Brak marnowania jedzenia dzięki odmierzonym składnikom</p></CardContent></Card>
          <Card className="text-center border-none shadow-lg bg-white"><CardContent className="p-6"><div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"><ChefHat className="w-8 h-8 text-white" /></div><h3 className="font-bold text-[var(--smakowalo-green-dark)] mb-2">Jakość</h3><p className="text-sm text-gray-600">Składniki najlepszej jakości prosto od rolnika</p></CardContent></Card>
        </div>
      </section>

 {/* 🍅 Świeże składniki tygodnia (Auto Carousel) */}
<section className="py-20 bg-white overflow-hidden">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
      Świeże składniki tego tygodnia
    </h2>
    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
      Poznaj najlepsze sezonowe składniki, które znajdziesz w naszych przepisach
    </p>

    {/* Animated Carousel */}
    <div className="relative overflow-hidden">
      <div className="flex gap-8 animate-carousel">
        {[
          {
            title: "Zioła aromatyczne",
            desc: "Świeży bazylia, rozmaryn i tymianek prosto z polskich upraw ekologicznych",
            img: "https://ugc.same-assets.com/6uEsIpTxMuSmhjFwIPSFPGzwjcRh2vqD.jpeg",
            gradient: "from-green-500/70 to-green-800/50",
          },
          {
            title: "Warzywa korzeniowe",
            desc: "Marchew, pietruszka i seler - pełne witamin i naturalnego smaku",
            img: "https://ugc.same-assets.com/Muz6SglCbUo0_90djilEkRKchPrx2Eu1.jpeg",
            gradient: "from-orange-500/70 to-orange-800/50",
          },
          {
            title: "Pomidory sezonowe",
            desc: "Słodkie pomidory koktajlowe i malinowe z lokalnych szklarni",
            img: "https://ugc.same-assets.com/S9kpT-NHTMMPq9-IzhEiZ0V0gHlOcoyX.jpeg",
            gradient: "from-red-500/70 to-red-800/50",
          },
          {
            title: "Czosnek młody",
            desc: "Delikatny młody czosnek o łagodnym smaku, idealny do sałatek",
            img: "https://ugc.same-assets.com/MC_XLvO1SXms579hLjizXQiMm0L7jnOV.jpeg",
            gradient: "from-purple-500/70 to-purple-800/50",
          },
        ]
          // Duplicate list to make infinite loop
          .concat([
            {
              title: "Zioła aromatyczne",
              desc: "Świeży bazylia, rozmaryn i tymianek prosto z polskich upraw ekologicznych",
              img: "https://ugc.same-assets.com/6uEsIpTxMuSmhjFwIPSFPGzwjcRh2vqD.jpeg",
              gradient: "from-green-500/70 to-green-800/50",
            },
            {
              title: "Warzywa korzeniowe",
              desc: "Marchew, pietruszka i seler - pełne witamin i naturalnego smaku",
              img: "https://ugc.same-assets.com/Muz6SglCbUo0_90djilEkRKchPrx2Eu1.jpeg",
              gradient: "from-orange-500/70 to-orange-800/50",
            },
            {
              title: "Pomidory sezonowe",
              desc: "Słodkie pomidory koktajlowe i malinowe z lokalnych szklarni",
              img: "https://ugc.same-assets.com/S9kpT-NHTMMPq9-IzhEiZ0V0gHlOcoyX.jpeg",
              gradient: "from-red-500/70 to-red-800/50",
            },
            {
              title: "Czosnek młody",
              desc: "Delikatny młody czosnek o łagodnym smaku, idealny do sałatek",
              img: "https://ugc.same-assets.com/MC_XLvO1SXms579hLjizXQiMm0L7jnOV.jpeg",
              gradient: "from-purple-500/70 to-purple-800/50",
            },
          ])
          .map((item, idx) => (
            <div
              key={idx}
              className="min-w-[280px] sm:min-w-[320px] h-[220px] rounded-2xl overflow-hidden relative shadow-lg hover:scale-105 transition-transform duration-500"
            >
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white text-left">
                <h3 className="text-xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                  {item.title}
                </h3>
                <p className="text-sm opacity-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  </div>

  {/* Carousel Animation */}
  <style jsx>{`
    @keyframes carousel {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }
    .animate-carousel {
      animation: carousel 30s linear infinite;
      width: max-content;
    }
  `}</style>
</section>

      {/* 📦 CTA */}
      <section className="py-16 bg-[var(--smakowalo-green-primary)] text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Nie czekaj! Zamów już dziś!</h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">Dołącz do tysięcy zadowolonych klientów i zacznij swoją przygodę ze zdrowymi posiłkami</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/get-started"><Button size="lg" className="bg-white text-[var(--smakowalo-green-primary)] hover:bg-gray-100">Rozpocznij teraz</Button></Link>
          <Link href="/menu"><Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[var(--smakowalo-green-primary)]">Zobacz nasze plany</Button></Link>
        </div>
      </section>

      {/* 🍽️ Zacznij gotować */}
      <section className="py-16 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--smakowalo-green-dark)] mb-4">Zacznij gotować</h2>
          <p className="text-gray-600">Wybieraj spośród różnorodnych nowych przepisów zatwierdzonych przez dietetyków każdego tygodnia</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="group rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
              <div className="relative w-full h-40 overflow-hidden">
                <Image src={`https://picsum.photos/seed/recipe${idx}/400/300`} alt="Recipe" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4 bg-white"><h3 className="text-sm font-semibold text-gray-800 truncate">Przepis {idx + 1}</h3><span className="text-xs text-gray-500">25 min</span></div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/menu"><Button className="smakowalo-green">Zobacz pełne menu</Button></Link>
        </div>
      </section>

          {/* 🌍 Footer band */}
      <section className="py-12 bg-[var(--smakowalo-green-primary)] text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Jedzenie, z którym możesz się dobrze czuć</h2>
        <p className="text-white/90 max-w-2xl mx-auto">
          Smakowało kładzie nacisk na używanie zrównoważonych składników i kompensuje 100% emisji CO2
          związanych z działalnością operacyjną i dystrybucją.
        </p>
      </section>
    </div>
  )
}
