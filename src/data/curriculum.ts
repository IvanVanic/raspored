import type { CurriculumEntry, WeekTopic } from "./types";

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
    exams: ["23.06.2026.", "07.07.2026.", "27.08.2026.", "10.09.2026."],
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
      { component: "Aktivnost na nastavi", maxPoints: 6 },
      { component: "Kviz", maxPoints: 20, note: "22.04.2026." },
      { component: "Prakti\u010dni kolokvij", maxPoints: 20, note: "15.04.2026." },
      { component: "Laboratorijske vje\u017ebe", maxPoints: 24 },
      { component: "Ispit", maxPoints: 30 },
    ],
    exams: ["18.06.2026.", "02.07.2026.", "01.09.2026.", "08.09.2026."],
  },

  // ─── OS ───────────────────────────────────────────────────────────────
  OS: {
    subjectId: "OS",
    weeks: makeWeeks([
      { lecture: "Uvodno predavanje", exercise: "Uvod u rad sa su\u010deljem naredbenog retka. Rad s direktorijima" },
      { lecture: "Razvoj OS, osnovni zadaci OS, struktura OS", exercise: "Osnovni rad s datotekama i ure\u0111iva\u010di tekstualnih datoteka" },
      { lecture: "Interakcija OS i strojne opreme, upravljanje procesima", exercise: "Napredni rad s datotekama: globalni izrazi i arhiviranje sadr\u017eaja" },
      { lecture: "Konkurentnost procesa, sinkronizacija (1)", exercise: "Regularni izrazi. Usporedba sadr\u017eaja datoteka" },
      { lecture: "Konkurentnost procesa, sinkronizacija (2)", exercise: "Preusmjeravanje ulaza i izlaza: cijevi i filteri" },
      { lecture: "Zastoji", exercise: "Rad s ljuskom. Varijable ljuske i okoline" },
      { lecture: "Upravljanje procesorom", exercise: "Upravljanje poslovima. Nadgledanje procesa" },
      { lecture: "Kolokvij (20.04.2026.)", exercise: "Upravljanje procesima: signali i prioritet procesa/posla" },
      { lecture: "Upravljanje memorijom: strani\u010denje (1)", exercise: "Kontrolna zada\u0107a 1 (29.04.2026.)" },
      { lecture: "Upravljanje memorijom: strani\u010denje (2)", exercise: "Python modul OS: osnovne usluge operacijskog sustava" },
      { lecture: "Upravljanje memorijom: segmentacija", exercise: "Python moduli OS i Signal: komunikacija me\u0111u procesima" },
      { lecture: "Upravljanje memorijom: strategije smje\u0161taja, za\u0161tita memorije", exercise: "Python modul Threading: vi\u0161edretvenost" },
      { lecture: "Dodjeljivanje resursa, upravljanje podacima", exercise: "Python modul Threading: uskla\u0111ivanje izvođenja procesa i dretvi" },
      { lecture: "Upravljanje U/I ure\u0111ajima: driver, controller, obrada prekida", exercise: "Kontrolna zada\u0107a 2 (03.06.2026.)" },
      { lecture: "Uloga sigurnosti i za\u0161tite u OS", exercise: "Popravna kontrolna zada\u0107a (10.06.2026.)" },
    ]),
    grading: [
      { component: "Kolokvij", maxPoints: 30, note: "20.04.2026." },
      { component: "Kontrolna zada\u0107a 1", maxPoints: 20, note: "29.04.2026." },
      { component: "Kontrolna zada\u0107a 2", maxPoints: 20, note: "03.06.2026." },
      { component: "Ispit", maxPoints: 30 },
    ],
    exams: ["16.06.2026.", "30.06.2026.", "25.08.2026.", "10.09.2026."],
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
    exams: ["25.06.2026.", "09.07.2026.", "26.08.2026.", "09.09.2026."],
    importantDates: [
      { label: "Nadoknada kolokvija", date: "28.05.2026.", type: "kolokvij", source: "Moodle: Va\u017eniji datumi" },
      { label: "Popravni kolokvij", date: "11.06.2026.", type: "kolokvij", source: "Moodle: Va\u017eniji datumi" },
      { label: "Predrok", date: "11.06.2026.", type: "predrok", source: "Moodle: Va\u017eniji datumi" },
    ],
  },

  // ─── AOR ──────────────────────────────────────────────────────────────
  AOR: {
    subjectId: "AOR",
    weeks: makeWeeks([
      { lecture: "Uvod / Kodiranje informacija u digitalnim sustavima", exercise: "Uvod u vje\u017ebe / Kodiranje informacija u digitalnim sustavima" },
      { lecture: "Booleova algebra", exercise: "Booleova algebra" },
      { lecture: "Logi\u010dke funkcije / Kombinacijski logi\u010dki sklopovi", exercise: "Prikaz logi\u010dkih funkcija. 1. doma\u0107a zada\u0107a (20.03.2026.)" },
      { lecture: "Slijedni logi\u010dki sklopovi", exercise: "Slijedni logi\u010dki sklopovi" },
      { lecture: "Arhitektura jednostavnog procesora. CISC i RISC procesori", exercise: "Arhitektura jednostavnog procesora. 2. doma\u0107a zada\u0107a (03.04.2026.)" },
      { lecture: "Zbirni jezik", exercise: "Provjera znanja — test (10.04.2026.)" },
      { lecture: "Na\u010dini adresiranja MIPS procesora", exercise: "MIPS \u2014 skup instrukcija. 3. doma\u0107a zada\u0107a (17.04.2026.)" },
      { lecture: "Upravlja\u010dki sklop procesora", exercise: "Izvr\u0161avanje instrukcija mikroprocesora MIPS" },
      { lecture: "Aritmeti\u010dko-logi\u010dka jedinica", exercise: "Primjeri programa za MIPS: grananje i petlje. 4. doma\u0107a zada\u0107a (01.05.2026.)" },
      { lecture: "Proto\u010dna arhitektura procesora MIPS", exercise: "Primjeri programa za MIPS: jednostavni pozivi funkcija" },
      { lecture: "Memorijska hijerarhija ra\u010dunala", exercise: "Kolokvij (15.05.2026.) / 5. doma\u0107a zada\u0107a" },
      { lecture: "Memorijska hijerarhija (piru\u010dna memorija)", exercise: "Memorijska hijerarhija" },
      { lecture: "Memorijska hijerarhija (virtualna memorija)", exercise: "Memorijska hijerarhija" },
      { lecture: "Ulazno-izlazni sustav", exercise: "Proto\u010dnost. 6. doma\u0107a zada\u0107a (05.06.2026.)" },
      { lecture: "Vi\u0161eprocesorski sustavi", exercise: "Nadoknade" },
    ]),
    grading: [
      { component: "Kviz", maxPoints: 26, note: "11.04.2026. 11:00-12:00 online" },
      { component: "Kolokvij", maxPoints: 30, note: "15.05.2026." },
      { component: "Doma\u0107e zada\u0107e", maxPoints: 9 },
      { component: "Aktivnost u nastavi", maxPoints: 5 },
      { component: "Ispit", maxPoints: 30 },
    ],
    exams: ["19.06.2026.", "03.07.2026.", "04.09.2026.", "11.09.2026."],
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
    exams: ["24.06.2026.", "08.07.2026.", "02.09.2026.", "08.09.2026."],
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
      { component: "1. kolokvij", maxPoints: 20, note: "07.04.2026." },
      { component: "2. kolokvij", maxPoints: 20, note: "12.05.2026." },
      { component: "Doma\u0107e zada\u0107e i kontinuirani rad", maxPoints: 30 },
      { component: "Ispit", maxPoints: 30 },
    ],
    exams: ["26.06.2026.", "10.07.2026.", "04.09.2026.", "11.09.2026."],
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
    exams: ["16.06.2026.", "07.07.2026.", "03.09.2026.", "10.09.2026."],
  },
};
