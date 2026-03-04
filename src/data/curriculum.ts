import type { CurriculumEntry, WeekTopic, GradingInfo } from "./types";

// ---------------------------------------------------------------------------
// Helper type alias kept local — the satisfies operator validates the shape
// against CurriculumEntry at each declaration site.
// ---------------------------------------------------------------------------

type RawWeek = Omit<WeekTopic, "week">;

function makeWeeks(topics: RawWeek[]): WeekTopic[] {
  return topics.map((t, i) => ({ week: i + 1, ...t }));
}

// ---------------------------------------------------------------------------
// Course data
// ---------------------------------------------------------------------------

const os = {
  subjectId: "os",
  weeks: makeWeeks([
    { lecture: "Uvod u operacijske sustave",            exercise: "Uvod u laboratorij i alate" },
    { lecture: "Struktura operacijskog sustava",        exercise: "Pregled strukture OS-a" },
    { lecture: "Procesi",                               exercise: "Upravljanje procesima u Linuxu" },
    { lecture: "Dretve",                                exercise: "POSIX dretve" },
    { lecture: "Raspoređivanje CPU-a",                  exercise: "Algoritmi raspoređivanja" },
    { lecture: "Sinkronizacija procesa",                exercise: "Muteksi i semafori" },
    { lecture: "Zastoji (deadlock)",                    exercise: "Detekcija i prevencija zastoja" },
    { lecture: "Upravljanje memorijom",                 exercise: "Segmentacija i straničenje" },
    { lecture: "Virtualna memorija",                    exercise: "Page fault i zamjena stranica" },
    { lecture: "Datotečni sustavi",                     exercise: "Datotečni sustav ext4 i NTFS" },
    { lecture: "Ulazno-izlazni sustavi",                exercise: "Upravljački programi uređaja" },
    { lecture: "Zaštita i sigurnost OS-a",              exercise: "Prava pristupa i ACL" },
    { lecture: "Linux: naredbe i ljuska",               exercise: "Bash skripte — osnove" },
    { lecture: "Linux: procesi i napredne skripte",     exercise: "Bash skripte — napredne tehnike" },
    { lecture: "Ponavljanje i priprema za ispit",       exercise: "Rješavanje zadataka s prošlih ispita" },
  ]),
  grading: [
    { component: "Kolokvij",             maxPoints: 30 },
    { component: "Kontrolna zadaća 1",   maxPoints: 20 },
    { component: "Kontrolna zadaća 2",   maxPoints: 20 },
    { component: "Ispit",                maxPoints: 30 },
  ] satisfies GradingInfo[],
  exams: ["16.06.2026.", "30.06.2026.", "25.08.2026.", "10.09.2026."],
} satisfies CurriculumEntry;

const mat2 = {
  subjectId: "mat2",
  weeks: makeWeeks([
    { lecture: "Funkcije više varijabli",               exercise: "Domene i grafovi funkcija" },
    { lecture: "Parcijalne derivacije",                 exercise: "Računanje parcijalnih derivacija" },
    { lecture: "Ekstremi funkcija više varijabli",      exercise: "Lokalni i globalni ekstremi" },
    { lecture: "Dvostruki integrali",                   exercise: "Dvostruki integral nad pravokutnikom" },
    { lecture: "Trostruki integrali",                   exercise: "Trostruki integral — primjeri" },
    { lecture: "Krivuljni integrali",                   exercise: "Krivuljni integral 1. i 2. vrste" },
    { lecture: "Plošni integrali",                      exercise: "Plošni integral — primjeri" },
    { lecture: "Diferencijalne jednadžbe 1. reda",      exercise: "Separabilne i linearne DJ" },
    { lecture: "1. kolokvij (27.04.2026.)",              exercise: "1. kolokvij" },
    { lecture: "Diferencijalne jednadžbe 2. reda",      exercise: "Linearni sustavi DJ" },
    { lecture: "Laplaceova transformacija",             exercise: "Primjena Laplaceove transformacije" },
    { lecture: "Fourierovi redovi",                     exercise: "Razvoj u Fourierov red" },
    { lecture: "2. kolokvij (25.05.2026.)",              exercise: "2. kolokvij" },
    { lecture: "Numeričke metode",                      exercise: "Numerička integracija i DJ" },
    { lecture: "Ponavljanje i priprema za ispit",       exercise: "Rješavanje zadataka s prošlih ispita" },
  ]),
  grading: [
    { component: "1. kolokvij", maxPoints: 35 },
    { component: "2. kolokvij", maxPoints: 35 },
    { component: "Seminar",     maxPoints: 15 },
    { component: "Aktivnost",   maxPoints: 15 },
  ] satisfies GradingInfo[],
  exams: ["23.06.2026.", "07.07.2026.", "27.08.2026.", "10.09.2026."],
} satisfies CurriculumEntry;

const modpod = {
  subjectId: "modpod",
  weeks: makeWeeks([
    { lecture: "Uvod u baze podataka",                  exercise: "Pregled DBMS sustava" },
    { lecture: "ER model",                              exercise: "Modeliranje ER dijagramima" },
    { lecture: "Relacijski model",                      exercise: "Pretvorba ER u relacijski model" },
    { lecture: "Normalizacija",                         exercise: "1NF, 2NF, 3NF — primjeri" },
    { lecture: "SQL — osnove",                          exercise: "SELECT, INSERT, UPDATE, DELETE" },
    { lecture: "SQL — napredne operacije",              exercise: "JOIN operacije i podupiti" },
    { lecture: "SQL — agregatne funkcije",              exercise: "GROUP BY, HAVING, prozorske funkcije" },
    { lecture: "Transakcije i integritet",              exercise: "ACID svojstva i transakcije u SQL-u" },
    { lecture: "Indeksiranje",                          exercise: "Kreiranje i analiza indeksa" },
    { lecture: "Fizički dizajn baze podataka",          exercise: "Particioniranje i optimizacija upita" },
    { lecture: "NoSQL baze podataka",                   exercise: "MongoDB — osnove" },
    { lecture: "Modeliranje — projektni zadatak",       exercise: "Rad na projektnom zadatku" },
    { lecture: "Rad na projektu",                       exercise: "Konzultacije i izrada projekta" },
    { lecture: "Prezentacije projekata",                exercise: "Prezentacije projekata" },
    { lecture: "Ponavljanje i priprema za ispit",       exercise: "Rješavanje zadataka s prošlih ispita" },
  ]),
  grading: [
    { component: "Kolokvij",                maxPoints: 30 },
    { component: "Projekt",                 maxPoints: 40 },
    { component: "Aktivnost na vježbama",   maxPoints: 30 },
  ] satisfies GradingInfo[],
  exams: ["22.06.2026.", "06.07.2026.", "01.09.2026.", "08.09.2026."],
} satisfies CurriculumEntry;

const ovis = {
  subjectId: "ovis",
  weeks: makeWeeks([
    { lecture: "Kombinatorika",                         exercise: "Permutacije, kombinacije, varijacije" },
    { lecture: "Uvjetna vjerojatnost",                  exercise: "Primjeri uvjetne vjerojatnosti" },
    { lecture: "Bayesov teorem",                        exercise: "Primjena Bayesovog teorema" },
    { lecture: "Slučajne varijable",                    exercise: "Diskretne i neprekidne s.v." },
    { lecture: "Diskretne distribucije",                exercise: "Binomna i Poissonova distribucija" },
    { lecture: "Neprekidne distribucije",               exercise: "Normalna i eksponencijalna distribucija" },
    { lecture: "Matematičko očekivanje i varijanca",    exercise: "Računanje karakteristika distribucija" },
    { lecture: "1. kolokvij (21.04.2026.)",              exercise: "1. kolokvij" },
    { lecture: "Uzorak i procjena parametara",          exercise: "Točkasta i intervalna procjena" },
    { lecture: "Intervali pouzdanosti",                 exercise: "Konstrukcija intervala pouzdanosti" },
    { lecture: "Testiranje statističkih hipoteza",      exercise: "Z-test i t-test" },
    { lecture: "Hi-kvadrat test",                       exercise: "Test homogenosti i neovisnosti" },
    { lecture: "2. kolokvij (26.05.2026.)",              exercise: "2. kolokvij" },
    { lecture: "Regresija i korelacija",                exercise: "Linearna regresija — primjeri" },
    { lecture: "Ponavljanje i priprema za ispit",       exercise: "Rješavanje zadataka s prošlih ispita" },
  ]),
  grading: [
    { component: "1. kolokvij", maxPoints: 40 },
    { component: "2. kolokvij", maxPoints: 40 },
    { component: "Aktivnost",   maxPoints: 20 },
  ] satisfies GradingInfo[],
  exams: ["24.06.2026.", "08.07.2026.", "02.09.2026.", "08.09.2026."],
} satisfies CurriculumEntry;

const uasp = {
  subjectId: "uasp",
  weeks: makeWeeks([
    { lecture: "Uvod. Algoritmi sortiranja",            exercise: "Implementacija algoritama sortiranja" },
    { lecture: "Analiza složenosti algoritama",         exercise: "Analiza složenosti — primjeri" },
    { lecture: "Rekurzija",                             exercise: "Rekurzivni algoritmi" },
    { lecture: "Stogovi i redovi",                      exercise: "Implementacija stoga i reda" },
    { lecture: "Povezane liste",                        exercise: "Jednostruko i dvostruko povezane liste" },
    { lecture: "Stabla i BST",                          exercise: "Binarno stablo i operacije" },
    { lecture: "1. kolokvij (15.04.2026.)",              exercise: "1. kolokvij" },
    { lecture: "Kviz (22.04.2026.)",                    exercise: "Kviz" },
    { lecture: "Grafovi — osnove",                      exercise: "Reprezentacija grafova" },
    { lecture: "Grafovi — obilazak",                    exercise: "BFS i DFS obilazak" },
    { lecture: "Hash tablice",                          exercise: "Implementacija hash tablice" },
    { lecture: "Prioritetni redovi i hrpe",             exercise: "Heap sort i prioritetni red" },
    { lecture: "Napredni algoritmi",                    exercise: "Pohlepni algoritmi i dinamičko programiranje" },
    { lecture: "Ponavljanje i priprema za ispit",       exercise: "Rješavanje zadataka s prošlih ispita" },
    { lecture: "Završni pregled gradiva",               exercise: "Završni pregled" },
  ]),
  grading: [
    { component: "Kolokvij",                  maxPoints: 30 },
    { component: "Kviz",                      maxPoints: 10 },
    { component: "Laboratorijske vježbe 1",   maxPoints: 15 },
    { component: "Laboratorijske vježbe 2",   maxPoints: 15 },
    { component: "Ispit",                     maxPoints: 30 },
  ] satisfies GradingInfo[],
  exams: ["18.06.2026.", "02.07.2026.", "01.09.2026.", "08.09.2026."],
} satisfies CurriculumEntry;

const aor = {
  subjectId: "aor",
  weeks: makeWeeks([
    { lecture: "Uvod u arhitekturu i organizaciju računala", exercise: "Pregled temeljnih pojmova" },
    { lecture: "Brojevni sustavi i kodiranje",          exercise: "Konverzije i aritmetika u raznim bazama" },
    { lecture: "Booleova algebra i logički sklopovi",   exercise: "Minimizacija logičkih funkcija" },
    { lecture: "Kombinacijski sklopovi",                exercise: "Multipleksori, dekoderi, zbrojnici" },
    { lecture: "Sekvencijalni sklopovi",                exercise: "Bistabili, registri, brojači" },
    { lecture: "Kviz (09.04.2026.)",                     exercise: "Kviz" },
    { lecture: "Mikrooperacije i putovi podataka",      exercise: "RTL opis mikrooperacija" },
    { lecture: "Organizacija procesora",                exercise: "Jednoadresni i višeadresni procesori" },
    { lecture: "Skup instrukcija (ISA)",                exercise: "Analiza RISC i CISC arhitektura" },
    { lecture: "Cjevovod (pipeline)",                   exercise: "Hazardi i prosljeđivanje podataka" },
    { lecture: "Praktični kolokvij (14.05.2026.)",       exercise: "Praktični kolokvij" },
    { lecture: "Memorijski sustav",                     exercise: "Hijerarhija memorije" },
    { lecture: "Cache memorija",                        exercise: "Strategije zamjene i pisanja u cache" },
    { lecture: "Ulazno-izlazni sustav",                 exercise: "Sabirnice i upravljanje U/I" },
    { lecture: "Ponavljanje i priprema za ispit",       exercise: "Rješavanje zadataka s prošlih ispita" },
  ]),
  grading: [
    { component: "Kviz",              maxPoints: 20 },
    { component: "Praktični kolokvij", maxPoints: 30 },
    { component: "Aktivnost",         maxPoints: 20 },
    { component: "Ispit",             maxPoints: 30 },
  ] satisfies GradingInfo[],
  exams: ["19.06.2026.", "03.07.2026.", "04.09.2026.", "11.09.2026."],
} satisfies CurriculumEntry;

const oi = {
  subjectId: "oi",
  weeks: makeWeeks([
    { lecture: "Uvod u operacijska istraživanja",       exercise: "Formulacija LP problema" },
    { lecture: "Linearno programiranje",                exercise: "Grafička metoda rješavanja LP-a" },
    { lecture: "Simpleks metoda",                       exercise: "Simpleks algoritam — primjeri" },
    { lecture: "Dualnost u LP-u",                       exercise: "Dualni simplex i ekonomska interpretacija" },
    { lecture: "Analiza osjetljivosti",                 exercise: "Analiza osjetljivosti — primjeri" },
    { lecture: "1. kolokvij (07.04.2026.)",             exercise: "1. kolokvij" },
    { lecture: "Transportni problemi",                  exercise: "Sjeverozapadni kut i MODI metoda" },
    { lecture: "Mrežno programiranje",                  exercise: "Najkraći put i maksimalni tok" },
    { lecture: "Teorija igara",                         exercise: "Matrične igre i ravnotežne strategije" },
    { lecture: "Cjelobrojno programiranje",             exercise: "Metoda grana i ograde" },
    { lecture: "2. kolokvij (12.05.2026.)",             exercise: "2. kolokvij" },
    { lecture: "Dinamičko programiranje",               exercise: "Bellman-Fordov princip — primjeri" },
    { lecture: "Višekriterijsko odlučivanje",           exercise: "AHP metoda" },
    { lecture: "Stohastički modeli",                    exercise: "Modeli čekanja u redu" },
    { lecture: "Ponavljanje i priprema za ispit",       exercise: "Rješavanje zadataka s prošlih ispita" },
  ]),
  grading: [
    { component: "1. kolokvij",    maxPoints: 25, note: "07.04.2026." },
    { component: "2. kolokvij",    maxPoints: 25, note: "12.05.2026." },
    { component: "Domaća zadaća",  maxPoints: 20 },
    { component: "Ispit",          maxPoints: 30 },
  ] satisfies GradingInfo[],
  exams: ["26.06.2026.", "10.07.2026.", "04.09.2026.", "11.09.2026."],
} satisfies CurriculumEntry;

const upw = {
  subjectId: "upw",
  weeks: makeWeeks([
    { lecture: "Uvod u web tehnologije",                exercise: "Postavljanje razvojnog okruženja" },
    { lecture: "HTML — osnove",                         exercise: "Struktura HTML dokumenta" },
    { lecture: "HTML — semantika i forme",              exercise: "Semantički elementi i forme" },
    { lecture: "CSS — osnove",                          exercise: "Selektori, boje, tipografija" },
    { lecture: "1. projekt (obrana: 23.03.2026.)",      exercise: "Obrana 1. projekta" },
    { lecture: "CSS — Layout (Flexbox / Grid)",         exercise: "Flexbox i CSS Grid — vježbe" },
    { lecture: "Responzivni dizajn",                    exercise: "Media queries i mobilni dizajn" },
    { lecture: "JavaScript — osnove",                   exercise: "Varijable, funkcije, kontrolni tok" },
    { lecture: "2. projekt (obrana: 20.04.2026.)",      exercise: "Obrana 2. projekta" },
    { lecture: "JavaScript — DOM manipulacija",         exercise: "Odabir i mijenjanje DOM elemenata" },
    { lecture: "JavaScript — događaji",                 exercise: "Event listeners i obrasci" },
    { lecture: "Asinkrono programiranje",               exercise: "Fetch API i Promise" },
    { lecture: "Kolokvij (25.05.2026.)",                exercise: "Kolokvij" },
    { lecture: "Rad na 3. projektu (obrana: 08.06.2026.)", exercise: "Konzultacije i izrada 3. projekta" },
    { lecture: "Ponavljanje i priprema za ispit",       exercise: "Rješavanje zadataka s prošlih ispita" },
  ]),
  grading: [
    { component: "1. projekt", maxPoints: 15, note: "Obrana: 23.03.2026." },
    { component: "2. projekt", maxPoints: 20, note: "Obrana: 20.04.2026." },
    { component: "3. projekt", maxPoints: 30, note: "Obrana: 08.06.2026." },
    { component: "Kolokvij",   maxPoints: 35, note: "25.05.2026." },
  ] satisfies GradingInfo[],
  exams: ["16.06.2026.", "07.07.2026.", "03.09.2026.", "10.09.2026."],
} satisfies CurriculumEntry;

// ---------------------------------------------------------------------------
// Aggregated export
// ---------------------------------------------------------------------------

export const curriculum: Record<string, CurriculumEntry> = {
  os,
  mat2,
  modpod,
  ovis,
  uasp,
  aor,
  oi,
  upw,
};
