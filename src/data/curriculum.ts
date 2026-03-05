import type { CurriculumEntry, WeekTopic, GradingInfo } from "./types";

function makeWeeks(
  raw: Array<{ lecture: string; exercise: string }>
): WeekTopic[] {
  return raw.map((r, i) => ({ week: i + 1, lecture: r.lecture, exercise: r.exercise }));
}

export const curriculum: Record<string, CurriculumEntry> = {
  // ─── MAT2 ────────────────────────────────────────────────────────────
  MAT2: {
    subjectId: "MAT2",
    weeks: makeWeeks([
      { lecture: "Uvod. Realne funkcije realne varijable – osnovni pojmovi i klasifikacija", exercise: "Realne funkcije realne varijable" },
      { lecture: "Graf funkcije. Svojstva realnih funkcija realne varijable", exercise: "Graf funkcije. Svojstva realnih funkcija realne varijable" },
      { lecture: "Elementarne funkcije i njihova uloga u primjenama", exercise: "Elementarne funkcije" },
      { lecture: "Pojam i svojstva nizova realnih brojeva. Gomili\u0161te i limes niza", exercise: "Nizovi realnih brojeva. Limes niza" },
      { lecture: "Svojstva limesa niza. Pojam reda. Geometrijski red. Kriteriji konvergencije", exercise: "Redovi. Kriteriji konvergencije" },
      { lecture: "Uskrsni praznici", exercise: "Uskrsni praznici" },
      { lecture: "Limes funkcije. Svojstva limesa funkcije", exercise: "Limes funkcije" },
      { lecture: "Neprekidnost funkcije", exercise: "Neprekidnost funkcije" },
      { lecture: "Vektori u trodimenzionalnom vektorskom prostoru", exercise: "1. kolokvij (27.04.2026.)" },
      { lecture: "Analiti\u010dka geometrija u trodimenzionalnom prostoru", exercise: "Vektori i analiti\u010dka geometrija" },
      { lecture: "Pojam vektorskog prostora. Baza i dimenzija", exercise: "Vektorski prostori. Linearni operatori" },
      { lecture: "Linearni operatori. Osnovna svojstva", exercise: "Primjena linearne algebre" },
      { lecture: "Primjeri operatora u ravnini i prostoru. Algebra operatora", exercise: "2. kolokvij (25.05.2026.)" },
      { lecture: "Primjena linearne algebre na probleme iz informacijskih znanosti", exercise: "Popravak 1. kolokvija" },
      { lecture: "Zavr\u0161no predavanje", exercise: "Popravak 2. kolokvija" },
    ]),
    grading: [
      { component: "1. kolokvij", maxPoints: 30 },
      { component: "2. kolokvij", maxPoints: 30 },
      { component: "Seminar", maxPoints: 10 },
      { component: "Ispit", maxPoints: 30 },
    ],
    exams: ["22.06.2026.", "06.07.2026.", "07.09.2026."],
  },

  // ─── UASP ────────────────────────────────────────────────────────────
  UASP: {
    subjectId: "UASP",
    weeks: makeWeeks([
      { lecture: "Uvod. Algoritmi sortiranja", exercise: "Rad s datotekama i bibliotekama" },
      { lecture: "Algoritmi pretra\u017eivanja", exercise: "Algoritmi sortiranja" },
      { lecture: "Uvod u pokaziva\u010de", exercise: "Algoritmi pretra\u017eivanja" },
      { lecture: "Dinami\u010dka alokacija memorije", exercise: "1. laboratorijska vje\u017eba" },
      { lecture: "Pokaziva\u010di i dinami\u010dka polja", exercise: "Uvod u pokaziva\u010de" },
      { lecture: "Pokaziva\u010di i povezane liste", exercise: "Dinami\u010dka alokacija memorije" },
      { lecture: "Priprema za kviz", exercise: "Kolokvij (15.04.2026.)" },
      { lecture: "Kru\u017ene liste", exercise: "Kviz (22.04.2026.)" },
      { lecture: "Dvostruko povezane liste", exercise: "Pokaziva\u010di i dinami\u010dka polja" },
      { lecture: "Red", exercise: "Pokaziva\u010di i povezane liste" },
      { lecture: "Stog", exercise: "Kru\u017ene liste i dvostruko povezane liste" },
      { lecture: "Rekurzija", exercise: "2. laboratorijska vje\u017eba" },
      { lecture: "Dinami\u010dko programiranje", exercise: "Red, stog i dvostrani red" },
      { lecture: "Uvod u stabla", exercise: "Rekurzija i dinami\u010dko programiranje" },
      { lecture: "Priprema za ispit", exercise: "Nadoknada kviza i prakti\u010dnog kolokvija" },
    ]),
    grading: [
      { component: "Kolokvij", maxPoints: 30, note: "15.04.2026." },
      { component: "Kviz", maxPoints: 10, note: "22.04.2026." },
      { component: "Laboratorijske vje\u017ebe", maxPoints: 20 },
      { component: "Ispit", maxPoints: 40 },
    ],
    exams: ["18.06.2026.", "02.07.2026.", "10.09.2026."],
  },

  // ─── OS ───────────────────────────────────────────────────────────────
  OS: {
    subjectId: "OS",
    weeks: makeWeeks([
      { lecture: "Uvod u operacijske sustave", exercise: "Uvod u Linux. Osnove ljuske. Naredbe za rad s datote\u010dnim sustavom" },
      { lecture: "Struktura operacijskog sustava", exercise: "Naredbe za rad s tekstualnim datotekama" },
      { lecture: "Procesi \u2013 upravljanje i komunikacija", exercise: "Korisnici i grupe. Dozvole. Preusmjeravanje i cjevovodi" },
      { lecture: "Procesi \u2013 raspoređivanje", exercise: "Varijable ljuske. Programiranje u ljusci: osnove" },
      { lecture: "Dretve", exercise: "Programiranje u ljusci: funkcije i kontrola toka" },
      { lecture: "Uskrsni praznici", exercise: "Uskrsni praznici" },
      { lecture: "Potpuni zastoj", exercise: "Kolokvij (20.04.2026.)" },
      { lecture: "Upravljanje memorijom", exercise: "Regularne ekspresije, grep, sed, awk" },
      { lecture: "Virtualna memorija", exercise: "Kontrolna zada\u0107a 1 (29.04.2026.)" },
      { lecture: "Upravljanje sekundarnom memorijom", exercise: "Procesi i dretve u Linuxu" },
      { lecture: "Datote\u010dni sustav", exercise: "Programiranje u C-u: procesi i signali" },
      { lecture: "Ulazno-izlazni sustav", exercise: "Programiranje u C-u: dretve i sinkronizacija" },
      { lecture: "Za\u0161tita i sigurnost", exercise: "Kontrolna zada\u0107a 2 (03.06.2026.)" },
      { lecture: "Ponavljanje i priprema za ispit", exercise: "Popravna kontrolna zada\u0107a (10.06.2026.)" },
      { lecture: "Zavr\u0161ni pregled", exercise: "Zavr\u0161ni pregled" },
    ]),
    grading: [
      { component: "Kolokvij", maxPoints: 30, note: "20.04.2026." },
      { component: "Kontrolna zada\u0107a 1", maxPoints: 10, note: "29.04.2026." },
      { component: "Kontrolna zada\u0107a 2", maxPoints: 10, note: "03.06.2026." },
      { component: "Ispit", maxPoints: 50 },
    ],
    exams: ["17.06.2026.", "01.07.2026.", "09.09.2026."],
  },

  // ─── MODPOD ──────────────────────────────────────────────────────────
  MODPOD: {
    subjectId: "MODPOD",
    weeks: makeWeeks([
      { lecture: "Uvod u kolegij", exercise: "Uvod u modeliranje podataka, metodologija MIRIS" },
      { lecture: "Koncepti strukture metode entiteti\u2013veze (entitet, atribut, ograni\u010denja)", exercise: "Koncepti strukture metode entiteti\u2013veze (veza, brojnosti, klasifikacija)" },
      { lecture: "Agregacija, Klasifikacija", exercise: "Modeliranje podataka \u2013 osnovni koncepti EV, agregacija" },
      { lecture: "Slabi tip entiteta, E & I zavisnost, Povratna veza", exercise: "Slabi tip entiteta, E & I zavisnost, Povratna veza" },
      { lecture: "Organizacija, Osnovni pojmovi teorije organizacije", exercise: "Analiza podataka i sadr\u017eaja dokumentacije org. sustava" },
      { lecture: "Generalizacija i specijalizacija", exercise: "Modeliranje podataka na primjerima dokumenata" },
      { lecture: "Modeli podataka, Apstrakcija podataka", exercise: "1. kolokvij (17.04.2026.)" },
      { lecture: "Relacijska shema baze podataka, Prevo\u0111enje EV u relacijsku shemu", exercise: "Relacijska shema baze podataka, Prevo\u0111enje EV u relacijsku shemu" },
      { lecture: "Meta modeli", exercise: "Praznik (01.05.)" },
      { lecture: "Normalizacija", exercise: "Modeliranje podataka na primjerima dokumenata" },
      { lecture: "Proces konceptualnog oblikovanja podataka", exercise: "Proces konceptualnog oblikovanja podataka" },
      { lecture: "IE notacija", exercise: "2. kolokvij (22.05.2026.)" },
      { lecture: "Nadoknada kolokvija", exercise: "Modeliranje podataka na slo\u017eenijim primjerima" },
      { lecture: "Praznik", exercise: "UML Dijagram klasa" },
      { lecture: "Popravni kolokvij", exercise: "Konzultacije za ispit" },
    ]),
    grading: [
      { component: "1. kolokvij", maxPoints: 25, note: "17.04.2026." },
      { component: "2. kolokvij", maxPoints: 20, note: "22.05.2026." },
      { component: "Zadaci tijekom nastave", maxPoints: 15 },
      { component: "Ispit (projektni zadatak)", maxPoints: 40 },
    ],
    exams: ["19.06.2026.", "03.07.2026.", "11.09.2026."],
  },

  // ─── AOR ──────────────────────────────────────────────────────────────
  AOR: {
    subjectId: "AOR",
    weeks: makeWeeks([
      { lecture: "Uvod u kolegij. Pregled razvoja ra\u010dunala", exercise: "Pregled ku\u0107i\u0161ta i komponenti osobnog ra\u010dunala" },
      { lecture: "Prikazivanje podataka u ra\u010dunalu. Brojevni sustavi", exercise: "Rad s brojevnim sustavima. Pretvaranje iz sustava u sustav" },
      { lecture: "Logi\u010dki sklopovi. Kombinacijski i sekvencijski sklopovi", exercise: "Rad s logi\u010dkim sklopovima" },
      { lecture: "Gra\u0111a i princip rada procesora", exercise: "1. doma\u0107a zada\u0107a (23.03.2026.)" },
      { lecture: "Skup instrukcija i na\u010dini adresiranja", exercise: "Rad sa skupom instrukcija i na\u010dinima adresiranja" },
      { lecture: "Uskrsni praznici", exercise: "Uskrsni praznici" },
      { lecture: "Proto\u010dna struktura i paralelizam na razini instrukcija", exercise: "Kolokvij (20.04.2026.)" },
      { lecture: "Aritmeti\u010dko-logi\u010dka jedinica", exercise: "2. doma\u0107a zada\u0107a (22.04.2026.)" },
      { lecture: "Memorijski sustav i piru\u010dna memorija", exercise: "Kviz (29.04.2026.)" },
      { lecture: "Glavna memorija, Virtualna memorija", exercise: "3. doma\u0107a zada\u0107a (06.05.2026.)" },
      { lecture: "Sabirni\u010dki sustav", exercise: "Rad sa sabirni\u010dkim sustavima" },
      { lecture: "Ulazno-izlazni sustav", exercise: "4. doma\u0107a zada\u0107a (20.05.2026.)" },
      { lecture: "Vi\u0161eprocesorski sustavi", exercise: "Popravak kolokvija" },
      { lecture: "Trendovi i budu\u0107nost ra\u010dunalne arhitekture", exercise: "5. doma\u0107a zada\u0107a (03.06.2026.)" },
      { lecture: "Ponavljanje i priprema za ispit", exercise: "6. doma\u0107a zada\u0107a (10.06.2026.)" },
    ]),
    grading: [
      { component: "Kolokvij", maxPoints: 30, note: "20.04.2026." },
      { component: "Kviz", maxPoints: 10, note: "29.04.2026." },
      { component: "Doma\u0107e zada\u0107e", maxPoints: 30 },
      { component: "Ispit", maxPoints: 30 },
    ],
    exams: ["16.06.2026.", "30.06.2026.", "08.09.2026."],
  },

  // ─── OVIS ─────────────────────────────────────────────────────────────
  OVIS: {
    subjectId: "OVIS",
    weeks: makeWeeks([
      { lecture: "Uvod u kolegij. Osnove kombinatorike", exercise: "Osnove kombinatorike" },
      { lecture: "Osnove kombinatorike", exercise: "Osnove kombinatorike" },
      { lecture: "Vjerojatnosni prostor. Laplaceov model", exercise: "Vjerojatnosni prostor. Laplaceov model" },
      { lecture: "Uvjetna vjerojatnost. Nezavisnost. Bayesova formula", exercise: "Uvjetna vjerojatnost" },
      { lecture: "Geometrijska vjerojatnost", exercise: "Geometrijska vjerojatnost. Nezavisnost. Bayesova formula" },
      { lecture: "Slu\u010dajne varijable", exercise: "Slu\u010dajne varijable" },
      { lecture: "Radionica. Primjena ste\u010denih znanja", exercise: "Slu\u010dajne varijable" },
      { lecture: "Slu\u010dajne varijable", exercise: "1. kolokvij (21.04.2026.)" },
      { lecture: "Matemati\u010dko o\u010dekivanje i varijanca", exercise: "Matemati\u010dko o\u010dekivanje i varijanca" },
      { lecture: "Funkcija gusto\u0107e i funkcija distribucije", exercise: "Popravak 1. kolokvija" },
      { lecture: "Neprekidne slu\u010dajne varijable. Normalna razdioba", exercise: "Funkcija gusto\u0107e. Neprekidne s.v. Normalna razdioba" },
      { lecture: "Radionica. Primjena ste\u010denih znanja", exercise: "Deskriptivna statistika. Srednje vrijednosti" },
      { lecture: "Deskriptivna statistika. Srednje vrijednosti", exercise: "2. kolokvij (26.05.2026.)" },
      { lecture: "Deskriptivna statistika. Procjena parametara. Pouzdani intervali", exercise: "Procjena parametara. Pouzdani intervali. Testiranje hipoteza" },
      { lecture: "Pregled tema i rasprava", exercise: "Popravak 2. kolokvija" },
    ]),
    grading: [
      { component: "1. kolokvij", maxPoints: 30, note: "21.04.2026." },
      { component: "2. kolokvij", maxPoints: 30, note: "26.05.2026." },
      { component: "Doma\u0107a zada\u0107a", maxPoints: 10 },
      { component: "Ispit", maxPoints: 30 },
    ],
    exams: ["23.06.2026.", "07.07.2026.", "08.09.2026."],
  },

  // ─── OI ───────────────────────────────────────────────────────────────
  OI: {
    subjectId: "OI",
    weeks: makeWeeks([
      { lecture: "Uvod. Pojam i razvoj operacijskih istra\u017eivanja", exercise: "Primjena OI \u2013 nala\u017eenje primjera iz prakse" },
      { lecture: "Definiranje i postavljanje problema linearnog programiranja", exercise: "Postavljanje mat. modela LP. Grafi\u010dka metoda rje\u0161avanja LP" },
      { lecture: "Grafi\u010dka metoda rje\u0161avanja problema LP", exercise: "Rje\u0161avanje problemskih zadataka: grafi\u010dka metoda" },
      { lecture: "Simpleksna metoda: nala\u017eenje maksimuma", exercise: "Rje\u0161avanje problemskih zadataka alatima LPSolve i R" },
      { lecture: "Simpleksna metoda: nala\u017eenje minimuma i alternativnih rje\u0161enja", exercise: "Rje\u0161avanje problemskih zadataka: alternativna rje\u0161enja" },
      { lecture: "Degeneracija", exercise: "1. kolokvij (07.04.2026.)" },
      { lecture: "Modeliranje slo\u017eenijih problema LP", exercise: "Rje\u0161avanje problemskih zadataka: slo\u017eeniji modeli LP" },
      { lecture: "Modeliranje slo\u017eenijih problema LP (nastavak)", exercise: "Rje\u0161avanje problemskih zadataka: slo\u017eeniji modeli LP (nastavak)" },
      { lecture: "Dualnost. Ekonomska interpretacija duala", exercise: "Rje\u0161avanje problemskih zadataka: dualnost" },
      { lecture: "Analiza osjetljivosti", exercise: "Rje\u0161avanje problemskih zadataka: analiza osjetljivosti" },
      { lecture: "Uvod u transportni problem", exercise: "2. kolokvij (12.05.2026.)" },
      { lecture: "Metode za po\u010detno rje\u0161enje TP. Metoda stepping stone", exercise: "Rje\u0161avanje problemskih zadataka: transportni problemi" },
      { lecture: "Metoda MODI. Degeneracija kod transportnog problema", exercise: "Rje\u0161avanje problemskih zadataka: MODI, degeneracija" },
      { lecture: "Posebni slu\u010dajevi TP. Metode za nala\u017eenje maksimalne vrijednosti", exercise: "Rje\u0161avanje problemskih zadataka: maksimizacija i posebni slu\u010dajevi" },
      { lecture: "Metoda raspoređivanja", exercise: "Rje\u0161avanje problemskih zadataka: metoda raspoređivanja" },
    ]),
    grading: [
      { component: "1. kolokvij", maxPoints: 25, note: "07.04.2026." },
      { component: "2. kolokvij", maxPoints: 25, note: "12.05.2026." },
      { component: "Ispit", maxPoints: 50 },
    ],
    exams: ["24.06.2026.", "08.07.2026.", "09.09.2026."],
  },

  // ─── UPW ──────────────────────────────────────────────────────────────
  UPW: {
    subjectId: "UPW",
    weeks: makeWeeks([
      { lecture: "Uvod u kolegij. IDE, softverski razvojni okvir", exercise: "\u2014" },
      { lecture: "Klijent-server, vi\u0161eslojna arhitektura, sustavi za upravljanje verzijama", exercise: "Postavljanje razvojnog okru\u017eenja" },
      { lecture: "Izrada 1. projektnog zadatka", exercise: "Postavljanje razvojnog okru\u017eenja u oblaku (baza, hosting)" },
      { lecture: "Baze podataka u web aplikacijama", exercise: "Obrana 1. projektnog zadatka (23.03.2026.)" },
      { lecture: "Dohva\u0107anje, a\u017euriranje, sortiranje i filtriranje podataka", exercise: "Baze podataka u web aplikacijama" },
      { lecture: "HTML elementi i atributi. CSS osnove", exercise: "Praznik" },
      { lecture: "Izrada 2. projektnog zadatka", exercise: "Dohva\u0107anje, a\u017euriranje, sortiranje podataka" },
      { lecture: "Osnovni koncepti JavaScripta", exercise: "Obrana 2. projektnog zadatka (20.04.2026.)" },
      { lecture: "JavaScript \u2013 funkcije, objekti, polja", exercise: "HTML elementi i atributi. CSS osnove" },
      { lecture: "Događaji i JavaScript na DOM", exercise: "JavaScript \u2013 funkcije, objekti, polja" },
      { lecture: "Quasar razvojni okvir. SFC .vue komponente", exercise: "Događaji i JavaScript na DOM" },
      { lecture: "Aplikativna logika u Script dijelu SFC .vue", exercise: "Quasar razvojni okvir. SFC .vue komponente" },
      { lecture: "Analiza performansi web aplikacija", exercise: "Kolokvij (25.05.2026.)" },
      { lecture: "Izrada 3. projektnog zadatka", exercise: "Aplikativna logika u Script dijelu SFC" },
      { lecture: "Popravni kolokvij", exercise: "Obrana 3. projektnog zadatka (08.06.2026.)" },
    ]),
    grading: [
      { component: "1. projektni zadatak", maxPoints: 10, note: "Obrana: 23.03.2026." },
      { component: "2. projektni zadatak", maxPoints: 15, note: "Obrana: 20.04.2026." },
      { component: "3. projektni zadatak", maxPoints: 20, note: "Obrana: 08.06.2026." },
      { component: "Kolokvij", maxPoints: 25, note: "25.05.2026." },
      { component: "Seminarski rad", maxPoints: 30 },
    ],
    exams: ["15.06.2026.", "29.06.2026.", "07.09.2026."],
  },
};
