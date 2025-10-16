import { type NextRequest, NextResponse } from 'next/server'
import { withCache, cacheKeys } from '@/lib/cache'

// Enhanced mock data with detailed instructions for real OpenCart products
// IDs match actual products from shop.smakowalo.pl (50-74)
const getDetailedProductData = (id: string) => {
  const productData: { [key: string]: any } = {
    "50": {
      product_id: "50",
      name: "Kremowe linguine z harissą i oliwkami z jędrnymi łodygami Tenderstem® Broccoli i cytrynową panierką",
      description: "Wegański makaron linguine w kremowym sosie harissa z oliwkami, podany z brokułami tenderstem i chrupiącą cytrynową panierką",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Gotowanie makaronu",
          description: "Ugotuj linguine w osolonej wodzie według instrukcji na opakowaniu, al dente.",
          time: "10 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Przygotowanie sosu harissa",
          description: "Na patelni rozgrzej oliwę, dodaj pastę harissa, śmietanę roślinną i oliwki. Gotuj 5 minut.",
          time: "5 minut",
          difficulty: "Łatwe"
        },
        {
          step: 3,
          title: "Tenderstem broccoli",
          description: "Ugotuj tenderstem broccoli we wrzącej wodzie przez 3-4 minuty, aż będzie al dente.",
          time: "4 minuty",
          difficulty: "Łatwe"
        },
        {
          step: 4,
          title: "Cytrynowa panierka",
          description: "Wymieszaj bułkę tartą ze skórką cytryny i podpraż na patelni na złoto.",
          time: "3 minuty",
          difficulty: "Łatwe"
        },
        {
          step: 5,
          title: "Podanie",
          description: "Wymieszaj makaron z sosem, dodaj brokuły, posyp cytrynową panierką.",
          time: "2 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Makaron linguine", amount: "300g", category: "Makaron" },
        { name: "Pasta harissa", amount: "2 łyżki", category: "Przyprawy" },
        { name: "Oliwki", amount: "100g", category: "Dodatki" },
        { name: "Tenderstem broccoli", amount: "200g", category: "Warzywa" },
        { name: "Bułka tarta", amount: "50g", category: "Panierka" },
        { name: "Cytryna", amount: "1 sztuka", category: "Owoce" }
      ],
      nutrition_info: {
        calories: 450,
        protein: "15g",
        carbs: "58g",
        fat: "18g",
        fiber: "8g"
      }
    },
    "51": {
      product_id: "51",
      name: "Risotto z dynią piżmową i tymiankiem z przesmażonymi kiełkami groszku i pestkami dyni",
      description: "Kremowe risotto z pieczoną dynią piżmową i aromatycznym tymiankiem, podane z chrupiacymi kiełkami groszku i pestkami dyni",
      main_image: "https://ext.same-assets.com/290874832/189435024.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Pieczenie dyni",
          description: "Pokrój dynię w kostki, skrop oliwą, posyp tymiankiem i piecz w 200°C przez 25 minut.",
          time: "25 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Przygotowanie risotto",
          description: "Podsmaż cebulę na maśle, dodaj ryż arborio i smaż 2 minuty mieszając.",
          time: "5 minut",
          difficulty: "Średnie"
        },
        {
          step: 3,
          title: "Gotowanie risotto",
          description: "Dodawaj gorący bulion łyżka po łyżce, ciągle mieszając, przez 20 minut.",
          time: "20 minut",
          difficulty: "Trudne"
        },
        {
          step: 4,
          title: "Wykończenie",
          description: "Wmieszaj upieczoną dynię, tymianek, parmezan i masło. Dopraw solą i pieprzem.",
          time: "3 minuty",
          difficulty: "Średnie"
        },
        {
          step: 5,
          title: "Kiełki groszku",
          description: "Podsmaż kiełki groszku i pestki dyni na patelni przez 2-3 minuty.",
          time: "3 minuty",
          difficulty: "Łatwe"
        },
        {
          step: 6,
          title: "Podanie",
          description: "Podaj risotto udekorowane kiełkami groszku i pestkami dyni.",
          time: "2 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Ryż arborio", amount: "300g", category: "Zboża" },
        { name: "Dynia piżmowa", amount: "400g", category: "Warzywa" },
        { name: "Tymianek", amount: "świeży", category: "Zioła" },
        { name: "Parmezan", amount: "80g", category: "Ser" },
        { name: "Kiełki groszku", amount: "50g", category: "Mikrozielenie" },
        { name: "Pestki dyni", amount: "30g", category: "Nasiona" }
      ],
      nutrition_info: {
        calories: 490,
        protein: "18g",
        carbs: "68g",
        fat: "12g",
        fiber: "6g"
      }
    },
    "52": {
      product_id: "52",
      name: "Słodkie ziemniaki z fasolą szparagową z przecierem z awokado i wegańskim serem Sheese",
      description: "Pieczone słodkie ziemniaki z chrupiącą fasolką szparagową, kremowym przecierem z awokado i wegańskim serem",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Pieczenie słodkich ziemniaków",
          description: "Pokrój słodkie ziemniaki w kliny, skrop oliwą i piecz w 200°C przez 30 minut.",
          time: "30 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Przygotowanie fasoli",
          description: "Ugotuj fasolę szparagową we wrzącej wodzie przez 5 minut, następnie podsmaż na patelni.",
          time: "7 minut",
          difficulty: "Łatwe"
        },
        {
          step: 3,
          title: "Przecier z awokado",
          description: "Zblenduj awokado z sokiem z limonki, czosnkiem, kolendrą i solą na gładką masę.",
          time: "5 minut",
          difficulty: "Łatwe"
        },
        {
          step: 4,
          title: "Podanie",
          description: "Ułóż pieczone ziemniaki, dodaj fasolę, przecier z awokado i pokruszonego wegańskiego sera.",
          time: "3 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Słodkie ziemniaki", amount: "500g", category: "Warzywa" },
        { name: "Fasola szparagowa", amount: "200g", category: "Warzywa" },
        { name: "Awokado", amount: "2 sztuki", category: "Warzywa" },
        { name: "Wegański ser Sheese", amount: "100g", category: "Ser wegański" },
        { name: "Limonka", amount: "1 sztuka", category: "Owoce" }
      ],
      nutrition_info: {
        calories: 420,
        protein: "12g",
        carbs: "58g",
        fat: "16g",
        fiber: "14g"
      }
    },
    "53": {
      product_id: "53",
      name: "Upieczona cukinia i pomidory Linguine z serem w stylu greckim, orzechami piniowymi i szczypiorkiem",
      description: "Wegański makaron linguine z pieczoną cukinią i pomidorami, wegańskim serem w stylu feta, prażonymi orzechami i świeżym szczypiorkiem",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Pieczenie warzyw",
          description: "Pokrój cukinię i pomidory, skrop oliwą z ziołami i piecz w 200°C przez 20 minut.",
          time: "20 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Gotowanie makaronu",
          description: "Ugotuj linguine w osolonej wodzie według instrukcji na opakowaniu.",
          time: "10 minut",
          difficulty: "Łatwe"
        },
        {
          step: 3,
          title: "Prażenie orzechów",
          description: "Podsmaż orzechy piniowe na suchej patelni przez 2-3 minuty.",
          time: "3 minuty",
          difficulty: "Łatwe"
        },
        {
          step: 4,
          title: "Łączenie składników",
          description: "Wymieszaj makaron z pieczonymi warzywami, dodaj pokruszony ser, orzechy i szczypiorek.",
          time: "3 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Makaron linguine", amount: "300g", category: "Makaron" },
        { name: "Cukinia", amount: "2 sztuki", category: "Warzywa" },
        { name: "Pomidory koktajlowe", amount: "300g", category: "Warzywa" },
        { name: "Wegański ser w stylu feta", amount: "150g", category: "Ser wegański" },
        { name: "Orzechy piniowe", amount: "50g", category: "Orzechy" },
        { name: "Szczypiorek", amount: "pęczek", category: "Zioła" }
      ],
      nutrition_info: {
        calories: 480,
        protein: "16g",
        carbs: "62g",
        fat: "20g",
        fiber: "8g"
      }
    },
    "54": {
      product_id: "54",
      name: "Słodka i lepka drobiowa miseczka z prażonymi warzywami sezamowym",
      description: "Kurczak w słodko-lepkim sosie teriyaki z prażonymi warzywami, podany z ryżem i posypany sezamem",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Marynowanie kurczaka",
          description: "Pokrój kurczaka w paski, wymieszaj z sosem teriyaki i marynuj 15 minut.",
          time: "15 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Smażenie kurczaka",
          description: "Smaż kurczaka na rozgrzanej patelni przez 8-10 minut, aż będzie złoty i glazurowany.",
          time: "10 minut",
          difficulty: "Średnie"
        },
        {
          step: 3,
          title: "Prażenie warzyw",
          description: "Na tej samej patelni podsmaż pokrojone warzywa (papryka, brokuły, marchew) przez 5 minut.",
          time: "5 minut",
          difficulty: "Łatwe"
        },
        {
          step: 4,
          title: "Podanie",
          description: "Podaj kurczaka i warzywa na ryżu, posyp sezamem i szczypiorkiem.",
          time: "3 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Pierś z kurczaka", amount: "400g", category: "Białko" },
        { name: "Sos teriyaki", amount: "100ml", category: "Sosy" },
        { name: "Papryka", amount: "2 sztuki", category: "Warzywa" },
        { name: "Brokuły", amount: "200g", category: "Warzywa" },
        { name: "Marchew", amount: "2 sztuki", category: "Warzywa" },
        { name: "Sezam", amount: "2 łyżki", category: "Nasiona" },
        { name: "Ryż", amount: "200g", category: "Zboża" }
      ],
      nutrition_info: {
        calories: 520,
        protein: "35g",
        carbs: "58g",
        fat: "12g",
        fiber: "6g"
      }
    },
    "55": {
      product_id: "55",
      name: "Udko z kurczaka peri peri z cytrynowo-ziołowym purée z dyni muszkatołowej i czosnkowym jogurtem",
      description: "Pikantne udko z kurczaka w przyprawie peri peri, podane z kremowym purée z dyni i chłodzącym czosnkowym jogurtem",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Marynowanie kurczaka",
          description: "Natrzyj udka przyprawą peri peri, solą i oliwą. Marynuj minimum 30 minut.",
          time: "30 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Pieczenie kurczaka",
          description: "Piecz udka w 200°C przez 35-40 minut, aż będą chrupiące i przepieczone.",
          time: "40 minut",
          difficulty: "Średnie"
        },
        {
          step: 3,
          title: "Purée z dyni",
          description: "Ugotuj dynię, zblenduj z masłem, skórką z cytryny, tymiankiem i rozmarynem.",
          time: "25 minut",
          difficulty: "Średnie"
        },
        {
          step: 4,
          title: "Czosnkowy jogurt",
          description: "Wymieszaj jogurt grecki z przeciśniętym czosnkiem, solą i pieprzem.",
          time: "3 minuty",
          difficulty: "Łatwe"
        },
        {
          step: 5,
          title: "Podanie",
          description: "Podaj udka z purée z dyni i łyżką czosnkowego jogurtu.",
          time: "3 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Udka z kurczaka", amount: "4 sztuki", category: "Białko" },
        { name: "Przyprawa peri peri", amount: "2 łyżki", category: "Przyprawy" },
        { name: "Dynia muszkatołowa", amount: "500g", category: "Warzywa" },
        { name: "Cytryna", amount: "1 sztuka", category: "Owoce" },
        { name: "Jogurt grecki", amount: "200g", category: "Nabiał" },
        { name: "Czosnek", amount: "3 ząbki", category: "Warzywa" }
      ],
      nutrition_info: {
        calories: 480,
        protein: "38g",
        carbs: "28g",
        fat: "22g",
        fiber: "6g"
      }
    },
    "56": {
      product_id: "56",
      name: "Słoneczne kuleczki mięsne z wołowiny w sosie pomidorowym z warzywami pieczonymi z pesto i sałatką z rukolą",
      description: "Soczyste kuleczki mięsne z wołowiny w bogatym sosie pomidorowym, podane z warzywami pieczonymi z pesto i świeżą sałatką z rukolą",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Przygotowanie kuleczek",
          description: "Wymieszaj mięso wołowe z bułką tartą, jajkiem, czosnkiem i przyprawami. Uformuj kuleczki.",
          time: "10 minut",
          difficulty: "Średnie"
        },
        {
          step: 2,
          title: "Smażenie kuleczek",
          description: "Smaż kuleczki na patelni na złoty kolor ze wszystkich stron, około 8-10 minut.",
          time: "10 minut",
          difficulty: "Średnie"
        },
        {
          step: 3,
          title: "Przygotowanie sosu",
          description: "Dodaj sos pomidorowy, bazylię i przyprawy do patelni. Gotuj z kuleczkami przez 15 minut.",
          time: "15 minut",
          difficulty: "Łatwe"
        },
        {
          step: 4,
          title: "Pieczenie warzyw",
          description: "Pokrój warzywa (cukinia, papryka, bakłażan), skrop pesto i oliwą. Piecz w 200°C przez 20 minut.",
          time: "20 minut",
          difficulty: "Łatwe"
        },
        {
          step: 5,
          title: "Podanie",
          description: "Podawaj kuleczki w sosie z pieczonymi warzywami i świeżą rukolą.",
          time: "3 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Mięso wołowe", amount: "500g", category: "Białko" },
        { name: "Sos pomidorowy", amount: "400ml", category: "Sosy" },
        { name: "Warzywa mix", amount: "400g", category: "Warzywa" },
        { name: "Pesto", amount: "3 łyżki", category: "Sosy" },
        { name: "Rukola", amount: "100g", category: "Warzywa" },
        { name: "Bułka tarta", amount: "50g", category: "Dodatki" }
      ],
      nutrition_info: {
        calories: 580,
        protein: "32g",
        carbs: "28g",
        fat: "24g",
        fiber: "6g"
      }
    },
    "58": {
      product_id: "58",
      name: "Krewetki z Harissą i Miodem z Ryżem z Kalafiora i Greckim Jogurtem",
      description: "Pikantne krewetki w sosie harissa z miodem, podawane z ryżem z kalafiora i chłodzącym greckim jogurtem",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Przygotowanie składników",
          description: "Oczyść krewetki, zetrzyj kalafior na tarce grubooczowej. Przygotuj mieszankę harissa z miodem w małej misce.",
          time: "5 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Marynowanie krewetek",
          description: "Polej krewetki mieszanką harissa-miód i zostaw na 10 minut do zamarynowania.",
          time: "10 minut",
          difficulty: "Łatwe"
        },
        {
          step: 3,
          title: "Smażenie krewetek",
          description: "Rozgrzej patelnię z oliwą na średnio-wysokim ogniu. Smaż krewetki przez 2-3 minuty z każdej strony, aż będą różowe.",
          time: "6 minut",
          difficulty: "Średnie"
        },
        {
          step: 4,
          title: "Ryż z kalafiora",
          description: "Na drugiej patelni podsmaż ryż z kalafiora przez 4-5 minut, aż będzie miękki.",
          time: "5 minut",
          difficulty: "Łatwe"
        },
        {
          step: 5,
          title: "Podanie",
          description: "Podaj krewetki na ryżu z kalafiora, udekoruj jogurtem greckim i świeżymi ziołami.",
          time: "2 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Krewetki", amount: "300g", category: "Białko" },
        { name: "Pasta harissa", amount: "2 łyżki", category: "Przyprawy" },
        { name: "Miód", amount: "1 łyżka", category: "Słodzik" },
        { name: "Kalafior", amount: "400g", category: "Warzywa" },
        { name: "Jogurt grecki", amount: "150g", category: "Nabiał" },
        { name: "Świeże zioła", amount: "garść", category: "Zioła" }
      ],
      nutrition_info: {
        calories: 420,
        protein: "35g",
        carbs: "32g",
        fat: "12g",
        fiber: "6g"
      }
    },
    "59": {
      product_id: "59",
      name: "Rozdrobniona kaczka w sosie hoisin i imbirze w sałatkowych miseczkach z sałatą, ogórkiem, marchewką i ostrym chili",
      description: "Aromatyczna rozdrobniona kaczka w sosie hoisin z imbirem, podana w chrupkich miseczkach z sałaty ze świeżymi warzywami",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Przygotowanie kaczki",
          description: "Pokrój kaczkę w drobne kawałki, wymieszaj z sosem hoisin, tartym imbirem i czosnkiem.",
          time: "10 minut",
          difficulty: "Średnie"
        },
        {
          step: 2,
          title: "Smażenie kaczki",
          description: "Smaż kaczkę na wysokim ogniu przez 10-12 minut, aż będzie chrupiąca i karmelizowana.",
          time: "12 minut",
          difficulty: "Średnie"
        },
        {
          step: 3,
          title: "Przygotowanie warzyw",
          description: "Pokrój ogórek i marchew w cienkie słupki, posiekaj chili.",
          time: "5 minut",
          difficulty: "Łatwe"
        },
        {
          step: 4,
          title: "Składanie miseczek",
          description: "W liściach sałaty ułóż kaczkę, ogórek, marchew i chili. Skrop sosem hoisin.",
          time: "5 minut",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "pierś z kaczki", amount: "400g", category: "Białko" },
        { name: "Sos hoisin", amount: "100ml", category: "Sosy" },
        { name: "Imbir", amount: "30g", category: "Przyprawy" },
        { name: "Sałata masłowa", amount: "1 główka", category: "Warzywa" },
        { name: "Ogórek", amount: "1 sztuka", category: "Warzywa" },
        { name: "Marchew", amount: "2 sztuki", category: "Warzywa" },
        { name: "Chili", amount: "1 papryczka", category: "Przyprawy" }
      ],
      nutrition_info: {
        calories: 480,
        protein: "32g",
        carbs: "24g",
        fat: "28g",
        fiber: "4g"
      }
    },
    "60": {
      product_id: "60",
      name: "Miód i ser Halloumi w tortillach z sosem z awokado i pomidorów oraz jogurtem limonkowym",
      description: "Grillowany ser halloumi z miodem w tortilli z kremowym sosem z awokado, pomidorami i orzeźwiającym jogurtem limonkowym",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Grillowanie halloumi",
          description: "Pokrój ser halloumi w grube plastry i grilluj na patelni po 2-3 minuty z każdej strony. Polej miodem.",
          time: "6 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Sos z awokado",
          description: "Zblenduj awokado z sokiem z limonki, kolendrą, czosnkiem i solą na gładką masę.",
          time: "5 minut",
          difficulty: "Łatwe"
        },
        {
          step: 3,
          title: "Jogurt limonkowy",
          description: "Wymieszaj jogurt grecki z sokiem i skórką z limonki.",
          time: "2 minuty",
          difficulty: "Łatwe"
        },
        {
          step: 4,
          title: "Składanie wrapy",
          description: "Na podgrzanej tortilli ułóż sos z awokado, grillowany halloumi, pomidory i jogurt limonkowy. Zwiń.",
          time: "4 minuty",
          difficulty: "Średnie"
        }
      ],
      ingredients: [
        { name: "Ser halloumi", amount: "250g", category: "Ser" },
        { name: "Miód", amount: "2 łyżki", category: "Słodzik" },
        { name: "Tortilla", amount: "4 sztuki", category: "Podstawa" },
        { name: "Awokado", amount: "2 sztuki", category: "Warzywa" },
        { name: "Pomidory", amount: "200g", category: "Warzywa" },
        { name: "Jogurt grecki", amount: "150g", category: "Nabiał" },
        { name: "Limonka", amount: "2 sztuki", category: "Owoce" }
      ],
      nutrition_info: {
        calories: 520,
        protein: "24g",
        carbs: "42g",
        fat: "28g",
        fiber: "8g"
      }
    },
    "61": {
      product_id: "61",
      name: "Kurczak Tikka Masala z Curry z ryżem z kalafiora i kolendrą",
      description: "Aromatyczny kurczak tikka masala w kremowym sosie curry, podany z ryżem z kalafiora i świeżą kolendrą",
      main_image: "https://ext.same-assets.com/817389662/2623479817.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Marynowanie kurczaka",
          description: "Pokrój kurczaka w kostki. Wymieszaj z jogurtem, curry i przyprawami tikka masala. Marynuj 20 minut.",
          time: "20 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Smażenie kurczaka",
          description: "Rozgrzej patelnię z olejem. Smaż kawałki kurczaka przez 8-10 minut na złoto.",
          time: "10 minut",
          difficulty: "Średnie"
        },
        {
          step: 3,
          title: "Sos tikka masala",
          description: "Dodaj śmietanę, koncentrat pomidorowy, pastę curry i przyprawy. Gotuj 8 minut na małym ogniu.",
          time: "8 minut",
          difficulty: "Średnie"
        },
        {
          step: 4,
          title: "Ryż z kalafiora",
          description: "Zetrzyj kalafior, podsmaż na patelni przez 4 minuty. Posyp kolendrą.",
          time: "4 minuty",
          difficulty: "Łatwe"
        },
        {
          step: 5,
          title: "Podanie",
          description: "Podaj kurczaka tikka masala z ryżem z kalafiora, udekoruj świeżą kolendrą.",
          time: "2 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Pierś z kurczaka", amount: "500g", category: "Białko" },
        { name: "Pasta tikka masala", amount: "3 łyżki", category: "Przyprawy" },
        { name: "Pasta curry", amount: "2 łyżki", category: "Przyprawy" },
        { name: "Kalafior", amount: "400g", category: "Warzywa" },
        { name: "Śmietana", amount: "200ml", category: "Nabiał" },
        { name: "Koncentrat pomidorowy", amount: "2 łyżki", category: "Sosy" },
        { name: "Kolendra", amount: "świeża", category: "Zioła" }
      ],
      nutrition_info: {
        calories: 560,
        protein: "42g",
        carbs: "32g",
        fat: "28g",
        fiber: "6g"
      }
    },
    "62": {
      product_id: "62",
      name: "Udko z kaczki w sosie z czerwonego wina grzybowego",
      description: "Soczyste udko z kaczki w aromatycznym sosie z czerwonego wina z grzybami leśnymi",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Przygotowanie kaczki",
          description: "Natnij skórkę udek w kratkę, dopraw solą i pieprzem. Podsmaż skórką w dół przez 10 minut.",
          time: "10 minut",
          difficulty: "Średnie"
        },
        {
          step: 2,
          title: "Pieczenie kaczki",
          description: "Obróć udka i piecz w 180°C przez 45 minut, aż będą miękkie i chrupiące.",
          time: "45 minut",
          difficulty: "Średnie"
        },
        {
          step: 3,
          title: "Sos grzybowy",
          description: "Podsmaż grzyby z czosnkiem, dodaj czerwone wino i zredukuj o połowę. Dodaj bulion i gotuj 10 minut.",
          time: "15 minut",
          difficulty: "Średnie"
        },
        {
          step: 4,
          title: "Podanie",
          description: "Podaj udka z sosem grzybowym i pieczonymi warzywami.",
          time: "3 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Udka z kaczki", amount: "4 sztuki", category: "Białko" },
        { name: "Grzyby leśne", amount: "300g", category: "Warzywa" },
        { name: "Czerwone wino", amount: "200ml", category: "Alkohole" },
        { name: "Bulion warzywny", amount: "200ml", category: "Sosy" },
        { name: "Czosnek", amount: "3 ząbki", category: "Warzywa" }
      ],
      nutrition_info: {
        calories: 620,
        protein: "38g",
        carbs: "12g",
        fat: "42g",
        fiber: "3g"
      }
    },
    "63": {
      product_id: "63",
      name: "Dorada w ostrej harissie",
      description: "Świeża dorada w pikantnej harissie - danie o intensywnym smaku inspirowane kuchnią północnoafrykańską",
      main_image: "https://ext.same-assets.com/817389662/2623479817.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Przygotowanie ryby",
          description: "Oczyść doradę, osusz papierem kuchennym. Zrób nacięcia po obu stronach ryby.",
          time: "5 minut",
          difficulty: "Średnie"
        },
        {
          step: 2,
          title: "Marynowanie",
          description: "Posmaruj doradę pastą harissa z obu stron i wewnątrz. Marynuj 15 minut.",
          time: "15 minut",
          difficulty: "Łatwe"
        },
        {
          step: 3,
          title: "Pieczenie ryby",
          description: "Rozgrzej piekarnik do 200°C. Piecz doradę przez 20-25 minut, aż będzie chrupiąca i przepieczona.",
          time: "25 minut",
          difficulty: "Średnie"
        },
        {
          step: 4,
          title: "Podanie",
          description: "Podawaj gorącą z cytryną, świeżymi ziołami i pieczonymi warzywami.",
          time: "3 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Dorada", amount: "2 sztuki", category: "Ryby" },
        { name: "Pasta harissa", amount: "4 łyżki", category: "Przyprawy" },
        { name: "Oliwa z oliwek", amount: "3 łyżki", category: "Tłuszcze" },
        { name: "Cytryna", amount: "2 sztuki", category: "Owoce" },
        { name: "Świeże zioła", amount: "garść", category: "Zioła" }
      ],
      nutrition_info: {
        calories: 480,
        protein: "42g",
        carbs: "8g",
        fat: "28g",
        fiber: "2g"
      }
    },
    "64": {
      product_id: "64",
      name: "Wieprzowina w miodowo-sambalowej marynacie i smażone warzywa z ryżem brokułowym z chilli oraz cukinią cukrową",
      description: "Pikantna wieprzowina w słodko-ostrej marynacie z miodem i sambal oelek, podana ze smażonymi warzywami i ryżem brokułowym",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Marynowanie wieprzowiny",
          description: "Pokrój wieprzowiną w paski, wymieszaj z miodem, sambal oelek, sosem sojowym. Marynuj 30 minut.",
          time: "30 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Smażenie mięsa",
          description: "Smaż wieprzowiną na wysokim ogniu przez 6-8 minut, aż będzie karmelizowana.",
          time: "8 minut",
          difficulty: "Średnie"
        },
        {
          step: 3,
          title: "Smażone warzywa",
          description: "Podsmaż pokrojone warzywa (papryka, cukinia, brokuły) z chilli przez 5 minut.",
          time: "5 minut",
          difficulty: "Łatwe"
        },
        {
          step: 4,
          title: "Ryż brokułowy",
          description: "Zetrzyj brokuły na grubooczowej tarce i podsmaż przez 4 minuty.",
          time: "4 minuty",
          difficulty: "Łatwe"
        },
        {
          step: 5,
          title: "Podanie",
          description: "Podaj wieprzowiną na ryżu brokułowym ze smażonymi warzywami.",
          time: "2 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Schab wieprzowy", amount: "400g", category: "Białko" },
        { name: "Miód", amount: "2 łyżki", category: "Słodzik" },
        { name: "Sambal oelek", amount: "2 łyżki", category: "Przyprawy" },
        { name: "Brokuły", amount: "400g", category: "Warzywa" },
        { name: "Warzywa mix", amount: "300g", category: "Warzywa" },
        { name: "Chilli", amount: "1 papryczka", category: "Przyprawy" }
      ],
      nutrition_info: {
        calories: 540,
        protein: "38g",
        carbs: "42g",
        fat: "22g",
        fiber: "8g"
      }
    },
    "66": {
      product_id: "66",
      name: "Zielone curry z kurczakiem i pieczonym imbirem",
      description: "Aromatyczne tajskie zielone curry z kurczakiem, warzywami i pieczonym imbirem w mleku kokosowym",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Pieczenie imbiru",
          description: "Pokrój imbir w plastry i piecz w 180°C przez 10 minut, aż będzie aromatyczny.",
          time: "10 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Przygotowanie kurczaka",
          description: "Pokrój kurczaka w kostki, dopraw solą i pieprzem. Podsmaż na patelni przez 5 minut.",
          time: "5 minut",
          difficulty: "Łatwe"
        },
        {
          step: 3,
          title: "Sos curry",
          description: "Dodaj pastę zielonego curry, mleko kokosowe, bulion i pieczony imbir. Gotuj 15 minut.",
          time: "15 minut",
          difficulty: "Średnie"
        },
        {
          step: 4,
          title: "Warzywa",
          description: "Dodaj pokrojone warzywa (papryka, cukinia, bakłażan) i gotuj przez 8 minut.",
          time: "8 minut",
          difficulty: "Łatwe"
        },
        {
          step: 5,
          title: "Podanie",
          description: "Podaj curry z ryżem jaśminowym, posyp świeżą bazylią tajską.",
          time: "2 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Pierś z kurczaka", amount: "400g", category: "Białko" },
        { name: "Pasta zielonego curry", amount: "3 łyżki", category: "Przyprawy" },
        { name: "Mleko kokosowe", amount: "400ml", category: "Nabiał roślinny" },
        { name: "Imbir", amount: "50g", category: "Przyprawy" },
        { name: "Warzywa mix", amount: "300g", category: "Warzywa" },
        { name: "Bazylia tajska", amount: "garść", category: "Zioła" }
      ],
      nutrition_info: {
        calories: 520,
        protein: "35g",
        carbs: "32g",
        fat: "28g",
        fiber: "6g"
      }
    },
    "70": {
      product_id: "70",
      name: "Świeży łosoś na łóżku cytrynowego risotto z dodatkiem tenderstem i groszku",
      description: "Pieczony łosoś na kremowym cytrynowym risotto z tenderstem broccoli i świeżym groszkiem",
      main_image: "https://ext.same-assets.com/290874832/1351291427.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Przygotowanie risotto",
          description: "Pokrój drobno cebulę. W patelni rozgrzej masło i podsmaż cebulę przez 2 minuty. Dodaj ryż i smaż przez minutę, mieszając.",
          time: "5 minut",
          difficulty: "Średnie"
        },
        {
          step: 2,
          title: "Gotowanie risotto",
          description: "Dodaj białe wino i mieszaj, aż się wchłonie. Dodawaj ciepły bulion łyżka po łyżce, ciągle mieszając, przez około 18-20 minut.",
          time: "20 minut",
          difficulty: "Trudne"
        },
        {
          step: 3,
          title: "Cytrynowe wykończenie",
          description: "Pod koniec gotowania dodaj skórkę z cytryny, sok z cytryny i tarty parmezan. Dopraw solą i pieprzem.",
          time: "3 minut",
          difficulty: "Średnie"
        },
        {
          step: 4,
          title: "Przygotowanie łososia",
          description: "Dopraw łosoś solą i pieprzem. Smaż na rozgrzanej patelni z oliwą po 4-5 minut z każdej strony.",
          time: "10 minut",
          difficulty: "Średnie"
        },
        {
          step: 5,
          title: "Warzywa",
          description: "Ugotuj tenderstem broccoli i groszek we wrzącej, osolonej wodzie przez 3-4 minuty.",
          time: "4 minuty",
          difficulty: "Łatwe"
        },
        {
          step: 6,
          title: "Podanie",
          description: "Podawaj łosoś na risotto z warzywami. Udekoruj plasterkami cytryny.",
          time: "2 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Stek z łososia", amount: "300g", category: "Białko" },
        { name: "Ryż arborio", amount: "200g", category: "Zboża" },
        { name: "Tenderstem broccoli", amount: "200g", category: "Warzywa" },
        { name: "Groszek zielony", amount: "150g", category: "Warzywa" },
        { name: "Cytryna", amount: "2 sztuki", category: "Owoce" },
        { name: "Parmezan", amount: "50g", category: "Ser" },
        { name: "Białe wino", amount: "100ml", category: "Alkohole" }
      ],
      nutrition_info: {
        calories: 650,
        protein: "45g",
        carbs: "52g",
        fat: "28g",
        fiber: "6g"
      }
    },
    "72": {
      product_id: "72",
      name: "Makaron Linguine z krewetkami w maśle cytrynowo-czosnkowym z serem i płatkami chili",
      description: "Aromatyczny makaron linguine z krewetkami w delikatnym maśle cytrynowo-czosnkowym, serem i lekko ostrymi płatkami chili",
      main_image: "https://ext.same-assets.com/290874832/189435024.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Gotowanie makaronu",
          description: "Ugotuj linguine w osolonej wodzie według instrukcji na opakowaniu, al dente.",
          time: "10 minut",
          difficulty: "Łatwe"
        },
        {
          step: 2,
          title: "Przygotowanie krewetek",
          description: "Oczyść krewetki, dopraw solą i pieprzem. Smaż na rozgrzanej patelni z masłem i czosnkiem przez 2-3 minuty z każdej strony.",
          time: "6 minut",
          difficulty: "Średnie"
        },
        {
          step: 3,
          title: "Przygotowanie sosu",
          description: "Dodaj sok z cytryny, płatki chili i odrobinę wody z gotowania makaronu. Wymieszaj.",
          time: "3 minuty",
          difficulty: "Łatwe"
        },
        {
          step: 4,
          title: "Łączenie składników",
          description: "Dodaj odcedzony makaron do krewetek, wymieszaj. Podawaj posypane tartym serem i świeżą pietruszką.",
          time: "3 minuty",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Linguine", amount: "300g", category: "Makaron" },
        { name: "Krewetki", amount: "400g", category: "Białko" },
        { name: "Masło", amount: "80g", category: "Tłuszcze" },
        { name: "Cytryna", amount: "2 sztuki", category: "Owoce" },
        { name: "Czosnek", amount: "4 ząbki", category: "Warzywa" },
        { name: "Ser parmezan", amount: "60g", category: "Ser" },
        { name: "Płatki chili", amount: "1 łyżeczka", category: "Przyprawy" }
      ],
      nutrition_info: {
        calories: 580,
        protein: "38g",
        carbs: "48g",
        fat: "24g",
        fiber: "3g"
      }
    },
    "74": {
      product_id: "74",
      name: "Łopatka wieprzowa i grzyby w sosie truflowym z pieczonymi warzywami czosnkowymi i fasolą Cannellini",
      description: "Delikatna łopatka wieprzowa z grzybami w aromatycznym sosie truflowym, podana z czosnkowymi warzywami i fasolą Cannellini",
      main_image: "https://ext.same-assets.com/817389662/206723592.jpeg",
      preparation_instructions: [
        {
          step: 1,
          title: "Przygotowanie łopatki",
          description: "Dopraw łopatkę wieprzową solą i pieprzem. Podsmaż na patelni ze wszystkich stron przez 8 minut.",
          time: "8 minut",
          difficulty: "Średnie"
        },
        {
          step: 2,
          title: "Pieczenie łopatki",
          description: "Przenieś mięso do piekarnika i piecz w 160°C przez 2 godziny, aż będzie miękkie.",
          time: "120 minut",
          difficulty: "Łatwe"
        },
        {
          step: 3,
          title: "Sos truflowy",
          description: "Podsmaż pokrojone grzyby z czosnkiem, dodaj śmietanę i olej truflowy. Gotuj 10 minut.",
          time: "15 minut",
          difficulty: "Średnie"
        },
        {
          step: 4,
          title: "Pieczone warzywa",
          description: "Pokrój warzywa (marchew, pasternak, ziemniaki), skrop oliwą czosnkową i piecz przez 35 minut.",
          time: "35 minut",
          difficulty: "Łatwe"
        },
        {
          step: 5,
          title: "Fasola",
          description: "Podgrzej fasolę Cannellini z czosnkiem i rozmarynem.",
          time: "5 minut",
          difficulty: "Łatwe"
        },
        {
          step: 6,
          title: "Podanie",
          description: "Pokrój łopatkę, podaj z sosem truflowym, warzywami i fasolą.",
          time: "5 minut",
          difficulty: "Łatwe"
        }
      ],
      ingredients: [
        { name: "Łopatka wieprzowa", amount: "800g", category: "Białko" },
        { name: "Grzyby leśne", amount: "300g", category: "Warzywa" },
        { name: "Olej truflowy", amount: "2 łyżki", category: "Tłuszcze" },
        { name: "Warzywa mix", amount: "500g", category: "Warzywa" },
        { name: "Fasola Cannellini", amount: "400g", category: "Rośliny strączkowe" },
        { name: "Czosnek", amount: "6 ząbków", category: "Warzywa" },
        { name: "Rozmaryn", amount: "gałązki", category: "Zioła" }
      ],
      nutrition_info: {
        calories: 680,
        protein: "48g",
        carbs: "42g",
        fat: "32g",
        fiber: "12g"
      }
    }
  };

  // Return specific product or null if not found
  if (productData[id]) {
    return productData[id];
  }

  // No generic fallback - return null for products not in our database
  console.warn(`⚠️ Product ${id} not found in detailed product data`);
  return null;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cacheKey = cacheKeys.product(id)
    const productData = await withCache(cacheKey, async () => {
        const opencartUrl = process.env.OPENCART_URL
        if (!opencartUrl || opencartUrl.includes('demo.opencart.com')) {
          return getDetailedProductData(id)
        }
        return getDetailedProductData(id)
      }, 1800000)
    if (!productData) {
      return NextResponse.json({ success: false, error: `Product ${id} not found`, product: null }, { status: 404 })
    }
    return NextResponse.json({ success: true, product: productData, source: 'enhanced-mock', cached: true })
  } catch (error) {
    const mockData = getDetailedProductData((await params).id)
    if (!mockData) {
      return NextResponse.json({ success: false, error: `Product ${(await params).id} not found`, product: null }, { status: 404 })
    }
    return NextResponse.json({ success: true, product: mockData, source: 'fallback-mock' })
  }
}
