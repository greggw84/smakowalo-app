import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Logo from "@/components/Logo"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Polityka Prywatności - Smakowało | Ochrona danych osobowych",
  description: "Polityka prywatności Smakowało - jak przetwarzamy i chronimy Twoje dane osobowe zgodnie z RODO. Poznaj swoje prawa.",
  keywords: "polityka prywatności, RODO, ochrona danych, Smakowało, dane osobowe, prywatność",
  openGraph: {
    title: "Polityka Prywatności - Smakowało",
    description: "Polityka prywatności Smakowało - ochrona danych osobowych",
    type: "website",
  },
}

export default function PolitykaPrywatnosciPage() {
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
            Polityka Prywatności
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Jak chronimy i przetwarzamy Twoje dane osobowe
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
                  1. Administrator danych
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Administratorem Twoich danych osobowych jest <strong>Smakowało Sp. z o.o.</strong>
                  z siedzibą w Warszawie, ul. Przykładowa 123, 00-001 Warszawa,
                  NIP: 1234567890, REGON: 123456789.
                </p>
                <p className="text-gray-700">
                  Kontakt z administratorem: czesc@smakowalo.pl lub +48 999 999 999.
                </p>
                <p className="text-gray-700">
                  W sprawach związanych z ochroną danych osobowych można się kontaktować
                  pod adresem: dane@smakowalo.pl
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  2. Jakie dane zbieramy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Dane tożsamości:</strong> imię, nazwisko, adres e-mail, numer telefonu
                </p>
                <p className="text-gray-700">
                  <strong>Dane adresowe:</strong> adres dostawy, kod pocztowy, miasto
                </p>
                <p className="text-gray-700">
                  <strong>Dane płatności:</strong> informacje o płatnościach (bez numeru karty)
                </p>
                <p className="text-gray-700">
                  <strong>Dane techniczne:</strong> adres IP, typ przeglądarki, preferencje
                </p>
                <p className="text-gray-700">
                  <strong>Dane behawioralne:</strong> historia zamówień, preferencje dietetyczne
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  3. Cele przetwarzania danych
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Realizacja zamówień:</strong> przetwarzanie i dostawa zamówień,
                  kontakt w sprawie dostawy (podstawa prawna: wykonanie umowy)
                </p>
                <p className="text-gray-700">
                  <strong>Prowadzenie konta klienta:</strong> zarządzanie kontem, historia zamówień
                  (podstawa prawna: wykonanie umowy)
                </p>
                <p className="text-gray-700">
                  <strong>Marketing:</strong> newsletter, oferty specjalne, badania satysfakcji
                  (podstawa prawna: uzasadniony interes lub zgoda)
                </p>
                <p className="text-gray-700">
                  <strong>Obsługa reklamacji:</strong> rozpatrywanie reklamacji i zwrotów
                  (podstawa prawna: uzasadniony interes)
                </p>
                <p className="text-gray-700">
                  <strong>Analityka:</strong> analiza ruchu na stronie, optymalizacja usług
                  (podstawa prawna: uzasadniony interes)
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  4. Podstawy prawne przetwarzania
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Wykonanie umowy (art. 6 ust. 1 lit. b RODO):</strong>
                  przetwarzanie niezbędne do realizacji zamówień i świadczenia usług
                </p>
                <p className="text-gray-700">
                  <strong>Uzasadniony interes (art. 6 ust. 1 lit. f RODO):</strong>
                  marketing, analityka, bezpieczeństwo, obsługa reklamacji
                </p>
                <p className="text-gray-700">
                  <strong>Zgoda (art. 6 ust. 1 lit. a RODO):</strong>
                  newsletter, cookies marketingowe, profilowanie
                </p>
                <p className="text-gray-700">
                  <strong>Obowiązek prawny (art. 6 ust. 1 lit. c RODO):</strong>
                  prowadzenie dokumentacji podatkowej, księgowej
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  5. Udostępnianie danych
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Firmy kurierskie:</strong> DPD Food (do realizacji dostaw)
                </p>
                <p className="text-gray-700">
                  <strong>Operatorzy płatności:</strong> Stripe, PayU (do obsługi płatności)
                </p>
                <p className="text-gray-700">
                  <strong>Dostawcy usług IT:</strong> hosting, analytics, email marketing
                </p>
                <p className="text-gray-700">
                  <strong>Doradcy prawni i księgowi:</strong> w zakresie wymaganym prawem
                </p>
                <p className="text-gray-700">
                  Wszystkie podmioty przetwarzają dane na podstawie umów powierzenia
                  i zgodnie z instrukcjami administratora.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  6. Okres przechowywania danych
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Dane zamówień:</strong> 5 lat od ostatniego zamówienia (obowiązki podatkowe)
                </p>
                <p className="text-gray-700">
                  <strong>Konto klienta:</strong> do momentu usunięcia konta przez klienta
                </p>
                <p className="text-gray-700">
                  <strong>Marketing:</strong> do odwołania zgody lub zgłoszenia sprzeciwu
                </p>
                <p className="text-gray-700">
                  <strong>Cookies:</strong> zgodnie z ustawieniami przeglądarki, maksymalnie 2 lata
                </p>
                <p className="text-gray-700">
                  <strong>Reklamacje:</strong> 3 lata od zamknięcia sprawy
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  7. Twoje prawa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Prawo dostępu:</strong> możesz uzyskać informacje o przetwarzaniu Twoich danych
                </p>
                <p className="text-gray-700">
                  <strong>Prawo sprostowania:</strong> możesz poprawić nieprawidłowe dane
                </p>
                <p className="text-gray-700">
                  <strong>Prawo usunięcia:</strong> możesz żądać usunięcia danych
                </p>
                <p className="text-gray-700">
                  <strong>Prawo ograniczenia:</strong> możesz ograniczyć przetwarzanie danych
                </p>
                <p className="text-gray-700">
                  <strong>Prawo przenoszenia:</strong> możesz otrzymać dane w formacie strukturalnym
                </p>
                <p className="text-gray-700">
                  <strong>Prawo sprzeciwu:</strong> możesz sprzeciwić się przetwarzaniu
                </p>
                <p className="text-gray-700">
                  <strong>Prawo odwołania zgody:</strong> w każdej chwili bez wpływu na zgodność z prawem
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  8. Cookies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Cookies niezbędne:</strong> umożliwiają podstawowe funkcjonowanie strony
                </p>
                <p className="text-gray-700">
                  <strong>Cookies funkcjonalne:</strong> zapamiętują Twoje preferencje
                </p>
                <p className="text-gray-700">
                  <strong>Cookies analityczne:</strong> Google Analytics (za zgodą)
                </p>
                <p className="text-gray-700">
                  <strong>Cookies marketingowe:</strong> personalizacja reklam (za zgodą)
                </p>
                <p className="text-gray-700">
                  Możesz zarządzać cookies w ustawieniach przeglądarki lub przez panel preferencji na stronie.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  9. Bezpieczeństwo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Stosujemy odpowiednie środki techniczne i organizacyjne:
                </p>
                <p className="text-gray-700">
                  • Szyfrowanie danych (SSL/TLS)<br/>
                  • Kontrola dostępu do danych<br/>
                  • Regularne kopie zapasowe<br/>
                  • Monitoring bezpieczeństwa<br/>
                  • Szkolenia pracowników<br/>
                  • Audyty bezpieczeństwa
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  10. Skarga do organu nadzorczego
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Masz prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych:
                </p>
                <p className="text-gray-700">
                  <strong>Urząd Ochrony Danych Osobowych</strong><br/>
                  ul. Stawki 2, 00-193 Warszawa<br/>
                  tel. +48 22 531 03 00<br/>
                  e-mail: kancelaria@uodo.gov.pl
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  11. Zmiany polityki
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Możemy aktualizować niniejszą Politykę Prywatności.
                  O istotnych zmianach poinformujemy e-mailem lub przez komunikat na stronie.
                </p>
                <p className="text-gray-700">
                  Aktualna wersja jest zawsze dostępna na naszej stronie internetowej.
                </p>
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <p className="text-gray-500 text-sm">
                Polityka Prywatności obowiązuje od dnia 1 stycznia 2024 roku
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
            Masz pytania o prywatność?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Skontaktuj się z nami w sprawach związanych z ochroną danych osobowych
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[var(--smakowalo-green-primary)] hover:bg-gray-100 text-lg px-8 py-3 rounded-lg"
            >
              <a href="mailto:dane@smakowalo.pl">Napisz do nas</a>
            </Button>
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
                <li><Link href="/regulamin" className="hover:text-white">Regulamin</Link></li>
                <li><Link href="/polityka-prywatnosci" className="hover:text-white text-[var(--smakowalo-green-primary)]">Polityka prywatności</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-gray-300">
                <li>+48 999 999 999</li>
                <li>czesc@smakowalo.pl</li>
                <li>dane@smakowalo.pl</li>
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
