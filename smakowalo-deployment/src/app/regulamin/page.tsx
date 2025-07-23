import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Logo from "@/components/Logo"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Regulamin - Smakowało | Warunki korzystania z serwisu",
  description: "Regulamin serwisu Smakowało - warunki korzystania, zamówień i dostaw zestawów posiłków. Poznaj swoje prawa i obowiązki.",
  keywords: "regulamin, warunki korzystania, Smakowało, zestawy posiłków, dostawa, zamówienia",
  openGraph: {
    title: "Regulamin - Smakowało",
    description: "Regulamin serwisu Smakowało - warunki korzystania z serwisu",
    type: "website",
  },
}

export default function RegulaminPage() {
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
                  Aktualne Menu
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Dlaczego My?
                </Link>
                <Link href="/jak-to-dziala" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Jak to działa?
                </Link>
                <Link href="/dostawa" className="text-gray-700 hover:text-[var(--smakowalo-green-primary)] px-3 py-2 rounded-md text-sm font-medium">
                  Dostawa
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-[var(--smakowalo-green-primary)] text-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-primary)] hover:text-white">
                  Zaloguj
                </Button>
              </Link>
              <Link href="/cart">
                <Button className="smakowalo-green">
                  Koszyk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--smakowalo-green-dark)] mb-6">
            Regulamin
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Warunki korzystania z serwisu Smakowało
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  § 1. Postanowienia ogólne
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  1. Niniejszy Regulamin określa zasady korzystania ze sklepu internetowego Smakowało
                  dostępnego pod adresem www.smakowalo.pl.
                </p>
                <p className="text-gray-700">
                  2. Sklep internetowy prowadzony jest przez Smakowało Sp. z o.o. z siedzibą w Warszawie.
                </p>
                <p className="text-gray-700">
                  3. Regulamin określa w szczególności zasady zawierania umów sprzedaży,
                  warunki dostawy oraz prawa i obowiązki Stron.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  § 2. Definicje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Sklep</strong> - sklep internetowy Smakowało dostępny pod adresem www.smakowalo.pl
                </p>
                <p className="text-gray-700">
                  <strong>Klient</strong> - osoba fizyczna, prawna lub jednostka organizacyjna
                  nieposiadająca osobowości prawnej korzystająca ze Sklepu
                </p>
                <p className="text-gray-700">
                  <strong>Konsument</strong> - Klient będący osobą fizyczną dokonującą czynności prawnej
                  niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową
                </p>
                <p className="text-gray-700">
                  <strong>Box</strong> - zestaw składników wraz z przepisami dostarczany przez Smakowało
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  § 3. Zawieranie umowy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  1. Prezentacja produktów w Sklepie nie stanowi oferty w rozumieniu Kodeksu Cywilnego,
                  lecz zaproszenie do zawarcia umowy.
                </p>
                <p className="text-gray-700">
                  2. Klient składa zamówienie poprzez formularz zamówienia dostępny w Sklepie.
                </p>
                <p className="text-gray-700">
                  3. Umowa zostaje zawarta z chwilą otrzymania przez Klienta potwierdzenia przyjęcia zamówienia.
                </p>
                <p className="text-gray-700">
                  4. Warunkiem złożenia zamówienia jest akceptacja niniejszego Regulaminu.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  § 4. Dostawa i płatność
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  1. Dostawa realizowana jest na terenie Polski przez firmę kurierską DPD Food.
                </p>
                <p className="text-gray-700">
                  2. Koszt dostawy zależy od strefy geograficznej i wynosi od 9,99 zł do 15,99 zł.
                </p>
                <p className="text-gray-700">
                  3. Dostawa jest bezpłatna przy zamówieniach powyżej 150 zł.
                </p>
                <p className="text-gray-700">
                  4. Płatność może być dokonana online kartą płatniczą, przelewem lub BLIK.
                </p>
                <p className="text-gray-700">
                  5. Czas dostawy wynosi 1-3 dni robocze od daty złożenia zamówienia.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  § 5. Prawo odstąpienia od umowy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  1. Konsument ma prawo odstąpić od umowy w terminie 14 dni bez podania przyczyny.
                </p>
                <p className="text-gray-700">
                  2. Ze względu na specyfikę produktów (świeże składniki), prawo odstąpienia nie przysługuje
                  w przypadku produktów szybko psujących się.
                </p>
                <p className="text-gray-700">
                  3. Odstąpienie od umowy subskrypcji może nastąpić do 5 dni przed kolejną dostawą.
                </p>
                <p className="text-gray-700">
                  4. W przypadku produktów wadliwych lub uszkodzonych podczas transportu,
                  Klient ma prawo do zwrotu pieniędzy lub wymiany produktu.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  § 6. Reklamacje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  1. Reklamację można złożyć drogą elektroniczną na adres: reklamacje@smakowalo.pl
                </p>
                <p className="text-gray-700">
                  2. Reklamacja powinna zawierać opis problemu oraz numer zamówienia.
                </p>
                <p className="text-gray-700">
                  3. Odpowiedź na reklamację zostanie udzielona w terminie 14 dni roboczych.
                </p>
                <p className="text-gray-700">
                  4. W przypadku uzasadnionej reklamacji, Klient otrzyma zwrot pieniędzy
                  lub nową dostawę bez dodatkowych kosztów.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  § 7. Ochrona danych osobowych
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  1. Dane osobowe Klientów są przetwarzane zgodnie z RODO i Polityką Prywatności.
                </p>
                <p className="text-gray-700">
                  2. Dane są przetwarzane w celu realizacji zamówień, świadczenia usług i komunikacji.
                </p>
                <p className="text-gray-700">
                  3. Klient ma prawo dostępu do swoich danych, ich poprawiania oraz usunięcia.
                </p>
                <p className="text-gray-700">
                  4. Szczegółowe informacje zawarte są w
                  <Link href="/polityka-prywatnosci" className="text-[var(--smakowalo-green-primary)] hover:underline">
                    {" "}Polityce Prywatności
                  </Link>.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  § 8. Postanowienia końcowe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  1. Regulamin wchodzi w życie z dniem publikacji w Sklepie.
                </p>
                <p className="text-gray-700">
                  2. Smakowało zastrzega sobie prawo do zmiany Regulaminu z ważnych przyczyn.
                </p>
                <p className="text-gray-700">
                  3. W sprawach nieuregulowanych Regulaminem stosuje się przepisy prawa polskiego.
                </p>
                <p className="text-gray-700">
                  4. Ewentualne spory rozstrzygane będą przez sąd właściwy dla siedziby Smakowało.
                </p>
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <p className="text-gray-500 text-sm">
                Regulamin obowiązuje od dnia 1 stycznia 2024 roku
              </p>
              <p className="text-gray-500 text-sm">
                Ostatnia aktualizacja: 1 stycznia 2024 roku
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--smakowalo-green-primary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Masz pytania?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Skontaktuj się z nami, jeśli potrzebujesz wyjaśnień dotyczących regulaminu
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-white text-[var(--smakowalo-green-primary)] hover:bg-gray-100 text-lg px-8 py-3 rounded-lg"
              >
                Skontaktuj się z nami
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[var(--smakowalo-green-primary)] text-lg px-8 py-3 rounded-lg"
              >
                Wróć do strony głównej
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--smakowalo-green-dark)] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Smakowało</h3>
              <p className="text-gray-300">
                Zestawy posiłków dla zapracowanych
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Menu</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/menu" className="hover:text-white">Aktualne menu</Link></li>
                <li><Link href="/jak-to-dziala" className="hover:text-white">Jak to działa</Link></li>
                <li><Link href="/dostawa" className="hover:text-white">Dostawa</Link></li>
                <li><Link href="/regulamin" className="hover:text-white text-[var(--smakowalo-green-primary)]">Regulamin</Link></li>
                <li><Link href="/polityka-prywatnosci" className="hover:text-white">Polityka prywatności</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-gray-300">
                <li>+48 999 999 999</li>
                <li>czesc@smakowalo.pl</li>
                <li>reklamacje@smakowalo.pl</li>
                <li>Pn-Pt: 8:00-18:00</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Śledź nas</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://www.instagram.com/smakowalo.pl" className="hover:text-white">Instagram</a></li>
                <li><a href="https://www.facebook.com/smakowalo" className="hover:text-white">Facebook</a></li>
                <li><a href="https://www.tiktok.com/@smakowalo" className="hover:text-white">TikTok</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
