export type ResourceLink = { label: string; url: string };

// Keys: subjectId — matches curriculum.ts
// Values: Record<weekNumber (1-based), ResourceLink[]>
// 2-4 links per week, sparse on kolokvij weeks.
export const resources: Record<string, Record<number, ResourceLink[]>> = {

  // --------------------------------------------------------------------------
  // UPW — Uvod u programiranje za web
  // --------------------------------------------------------------------------
  upw: {
    1: [
      { label: "MDN: Kako radi web",          url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works" },
      { label: "MDN: Postavljanje okruženja",  url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web" },
    ],
    2: [
      { label: "MDN: HTML osnove",             url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML" },
      { label: "W3Schools: HTML tutorial",     url: "https://www.w3schools.com/html/" },
    ],
    3: [
      { label: "MDN: Semantički HTML",         url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html" },
      { label: "MDN: HTML forme",              url: "https://developer.mozilla.org/en-US/docs/Learn/Forms" },
      { label: "W3Schools: HTML forme",        url: "https://www.w3schools.com/html/html_forms.asp" },
    ],
    4: [
      { label: "MDN: CSS osnove",              url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps" },
      { label: "CSS-Tricks: Selektori",        url: "https://css-tricks.com/almanac/selectors/" },
      { label: "W3Schools: CSS tutorial",      url: "https://www.w3schools.com/css/" },
    ],
    // Tjedan 5: obrana 1. projekta — bez resursa
    6: [
      { label: "CSS-Tricks: Flexbox vodič",    url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
      { label: "Flexbox Froggy — igra",        url: "https://flexboxfroggy.com/" },
      { label: "CSS Grid Garden — igra",       url: "https://cssgridgarden.com/" },
    ],
    7: [
      { label: "MDN: Responzivni dizajn",      url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design" },
      { label: "CSS-Tricks: Media queries",    url: "https://css-tricks.com/a-complete-guide-to-css-media-queries/" },
      { label: "W3Schools: Responzivnost",     url: "https://www.w3schools.com/css/css_rwd_intro.asp" },
    ],
    8: [
      { label: "javascript.info: Osnove JS-a", url: "https://javascript.info/first-steps" },
      { label: "MDN: JavaScript vodič",        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
    ],
    // Tjedan 9: obrana 2. projekta — bez resursa
    10: [
      { label: "MDN: DOM uvod",                url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction" },
      { label: "javascript.info: DOM",         url: "https://javascript.info/document" },
    ],
    11: [
      { label: "javascript.info: Događaji",    url: "https://javascript.info/events" },
      { label: "MDN: Event reference",         url: "https://developer.mozilla.org/en-US/docs/Web/Events" },
    ],
    12: [
      { label: "javascript.info: Promise",     url: "https://javascript.info/promise-basics" },
      { label: "MDN: Fetch API",               url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" },
      { label: "javascript.info: Async/await", url: "https://javascript.info/async-await" },
    ],
    // Tjedan 13: kolokvij — bez resursa
    14: [
      { label: "Vue.js: Brzi početak",         url: "https://vuejs.org/guide/quick-start.html" },
      { label: "Vue.js: Reaktivnost",          url: "https://vuejs.org/guide/essentials/reactivity-fundamentals.html" },
    ],
    15: [
      { label: "MDN: Web referenca",           url: "https://developer.mozilla.org/en-US/docs/Web" },
      { label: "javascript.info: Pregled",     url: "https://javascript.info/" },
    ],
  },

  // --------------------------------------------------------------------------
  // UASP — Uvod u algoritme i strukture podataka
  // --------------------------------------------------------------------------
  uasp: {
    1: [
      { label: "Visualgo: Sortiranje",         url: "https://visualgo.net/en/sorting" },
      { label: "GFG: Algoritmi sortiranja",    url: "https://www.geeksforgeeks.org/sorting-algorithms/" },
    ],
    2: [
      { label: "Big-O Cheat Sheet",            url: "https://www.bigocheatsheet.com/" },
      { label: "GFG: Analiza složenosti",      url: "https://www.geeksforgeeks.org/analysis-of-algorithms-set-1-asymptotic-analysis/" },
    ],
    3: [
      { label: "GFG: Rekurzija",               url: "https://www.geeksforgeeks.org/recursion/" },
      { label: "Visualgo: Rekurzijsko stablo", url: "https://visualgo.net/en/recursion" },
    ],
    4: [
      { label: "Visualgo: Stog i red",         url: "https://visualgo.net/en/list" },
      { label: "GFG: Stack i Queue",           url: "https://www.geeksforgeeks.org/stack-data-structure/" },
    ],
    5: [
      { label: "Visualgo: Povezane liste",     url: "https://visualgo.net/en/list" },
      { label: "GFG: Linked List",             url: "https://www.geeksforgeeks.org/data-structures/linked-list/" },
    ],
    6: [
      { label: "Visualgo: BST",                url: "https://visualgo.net/en/bst" },
      { label: "GFG: Binarno stablo pretrage", url: "https://www.geeksforgeeks.org/binary-search-tree-data-structure/" },
    ],
    // Tjedan 7: 1. kolokvij — bez resursa
    // Tjedan 8: kviz — bez resursa
    9: [
      { label: "Visualgo: Grafovi",            url: "https://visualgo.net/en/graphds" },
      { label: "GFG: Graf — osnove",           url: "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/" },
    ],
    10: [
      { label: "Visualgo: BFS i DFS",          url: "https://visualgo.net/en/dfsbfs" },
      { label: "GFG: BFS i DFS",               url: "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/" },
    ],
    11: [
      { label: "Visualgo: Hash tablice",       url: "https://visualgo.net/en/hashtable" },
      { label: "GFG: Hashing",                 url: "https://www.geeksforgeeks.org/hashing-data-structure/" },
    ],
    12: [
      { label: "Visualgo: Heap",               url: "https://visualgo.net/en/heap" },
      { label: "GFG: Prioritetni red",         url: "https://www.geeksforgeeks.org/priority-queue-set-1-introduction/" },
    ],
    13: [
      { label: "GFG: Pohlepni algoritmi",      url: "https://www.geeksforgeeks.org/greedy-algorithms/" },
      { label: "GFG: Dinamičko programiranje", url: "https://www.geeksforgeeks.org/dynamic-programming/" },
    ],
    14: [
      { label: "Big-O Cheat Sheet",            url: "https://www.bigocheatsheet.com/" },
      { label: "Visualgo: Pregled",            url: "https://visualgo.net/en" },
    ],
  },

  // --------------------------------------------------------------------------
  // MAT2 — Matematika 2
  // --------------------------------------------------------------------------
  mat2: {
    1: [
      { label: "Khan: Funkcije više varijabli", url: "https://www.khanacademy.org/math/multivariable-calculus/thinking-about-multivariable-function" },
      { label: "Wolfram Alpha",                 url: "https://www.wolframalpha.com/" },
    ],
    2: [
      { label: "Khan: Parcijalne derivacije",   url: "https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/partial-derivative-and-gradient-articles/a/introduction-to-partial-derivatives" },
      { label: "Symbolab: Parcijalne derivacije", url: "https://www.symbolab.com/solver/partial-derivative-calculator" },
    ],
    3: [
      { label: "Khan: Lokalni ekstremi",        url: "https://www.khanacademy.org/math/multivariable-calculus/applications-of-multivariable-derivatives/optimizing-multivariable-functions/a/second-partial-derivative-test" },
      { label: "Wolfram Alpha",                 url: "https://www.wolframalpha.com/" },
    ],
    4: [
      { label: "Khan: Dvostruki integrali",     url: "https://www.khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/double-integrals-topic/a/double-integrals-articles" },
      { label: "Symbolab: Dvostruki integral",  url: "https://www.symbolab.com/solver/double-integral-calculator" },
    ],
    5: [
      { label: "Khan: Trostruki integrali",     url: "https://www.khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/triple-integrals-a/a/triple-integrals-in-cartesian-coordinates" },
      { label: "Wolfram Alpha",                 url: "https://www.wolframalpha.com/" },
    ],
    6: [
      { label: "Khan: Krivuljni integrali",     url: "https://www.khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/line-integrals-for-scalar-functions-articles/a/line-integrals-in-a-scalar-field" },
      { label: "Symbolab: Krivuljni integral",  url: "https://www.symbolab.com/solver/line-integral-calculator" },
    ],
    7: [
      { label: "Khan: Plošni integrali",        url: "https://www.khanacademy.org/math/multivariable-calculus/integrating-multivariable-functions/surface-integrals-articles/a/surface-integrals" },
      { label: "Wolfram Alpha",                 url: "https://www.wolframalpha.com/" },
    ],
    8: [
      { label: "Khan: Dif. jednadžbe 1. reda",  url: "https://www.khanacademy.org/math/differential-equations/first-order-differential-equations" },
      { label: "Symbolab: DJ rješavač",         url: "https://www.symbolab.com/solver/ordinary-differential-equation-calculator" },
    ],
    // Tjedan 9: 1. kolokvij — bez resursa
    10: [
      { label: "Khan: Dif. jednadžbe 2. reda",  url: "https://www.khanacademy.org/math/differential-equations/second-order-differential-equations" },
      { label: "Symbolab: DJ 2. reda",          url: "https://www.symbolab.com/solver/second-order-differential-equation-calculator" },
    ],
    11: [
      { label: "Khan: Laplaceova transformacija", url: "https://www.khanacademy.org/math/differential-equations/laplace-transform" },
      { label: "Wolfram Alpha: Laplace",        url: "https://www.wolframalpha.com/calculators/laplace-transform-calculator" },
    ],
    12: [
      { label: "Khan: Fourierovi redovi",       url: "https://www.khanacademy.org/math/differential-equations" },
      { label: "Wolfram Alpha: Fourier",        url: "https://www.wolframalpha.com/calculators/fourier-series-calculator" },
    ],
    // Tjedan 13: 2. kolokvij — bez resursa
    14: [
      { label: "Khan: Numeričke metode",        url: "https://www.khanacademy.org/math/ap-calculus-ab/ab-diff-contextual-applications-new/ab-4-1/a/approximation-with-local-linearity" },
      { label: "Wolfram Alpha",                 url: "https://www.wolframalpha.com/" },
    ],
  },

  // --------------------------------------------------------------------------
  // MODPOD — Modeliranje i upravljanje podacima (baze podataka)
  // --------------------------------------------------------------------------
  modpod: {
    1: [
      { label: "W3Schools: SQL uvod",          url: "https://www.w3schools.com/sql/sql_intro.asp" },
      { label: "SQLBolt: Lekcija 1",           url: "https://sqlbolt.com/lesson/introduction" },
    ],
    2: [
      { label: "dbdiagram.io: ER dijagrami",   url: "https://dbdiagram.io/" },
      { label: "GFG: ER model",                url: "https://www.geeksforgeeks.org/introduction-of-er-model/" },
    ],
    3: [
      { label: "GFG: Relacijski model",        url: "https://www.geeksforgeeks.org/relational-model-in-dbms/" },
      { label: "W3Schools: SQL tablice",       url: "https://www.w3schools.com/sql/sql_create_table.asp" },
    ],
    4: [
      { label: "GFG: Normalizacija",           url: "https://www.geeksforgeeks.org/normal-forms-in-dbms/" },
      { label: "W3Schools: DB dizajn",         url: "https://www.w3schools.com/sql/sql_ref_keywords.asp" },
    ],
    5: [
      { label: "SQLBolt: SELECT upiti",        url: "https://sqlbolt.com/lesson/select_queries_introduction" },
      { label: "W3Schools: SQL DML",           url: "https://www.w3schools.com/sql/sql_insert.asp" },
    ],
    6: [
      { label: "SQLBolt: JOIN operacije",      url: "https://sqlbolt.com/lesson/select_queries_with_joins" },
      { label: "W3Schools: SQL JOIN",          url: "https://www.w3schools.com/sql/sql_join.asp" },
    ],
    7: [
      { label: "SQLBolt: Agregatne funkcije",  url: "https://sqlbolt.com/lesson/select_queries_with_aggregates" },
      { label: "W3Schools: GROUP BY",          url: "https://www.w3schools.com/sql/sql_groupby.asp" },
    ],
    8: [
      { label: "GFG: Transakcije i ACID",      url: "https://www.geeksforgeeks.org/acid-properties-in-dbms/" },
      { label: "W3Schools: SQL transakcije",   url: "https://www.w3schools.com/sql/sql_ref_transactions.asp" },
    ],
    9: [
      { label: "GFG: Indeksiranje u DBMS",     url: "https://www.geeksforgeeks.org/indexing-in-databases-set-1/" },
      { label: "SQLBolt: Optimizacija upita",  url: "https://sqlbolt.com/lesson/filtering_sorting_query_results" },
    ],
    10: [
      { label: "GFG: Fizički dizajn BP",       url: "https://www.geeksforgeeks.org/physical-database-design/" },
      { label: "dbdiagram.io: Particioniranje", url: "https://dbdiagram.io/" },
    ],
    11: [
      { label: "GFG: NoSQL uvod",              url: "https://www.geeksforgeeks.org/introduction-to-nosql/" },
      { label: "MongoDB: Brzi početak",        url: "https://www.mongodb.com/docs/manual/tutorial/getting-started/" },
    ],
  },

  // --------------------------------------------------------------------------
  // OVIS — Osnove vjerojatnosti i statistike
  // --------------------------------------------------------------------------
  ovis: {
    1: [
      { label: "Khan: Kombinatorika",          url: "https://www.khanacademy.org/math/statistics-probability/counting-permutations-and-combinations" },
      { label: "StatTrek: Kombinatorika",      url: "https://stattrek.com/statistics/notation.aspx" },
    ],
    2: [
      { label: "Khan: Uvjetna vjerojatnost",   url: "https://www.khanacademy.org/math/statistics-probability/probability-library/conditional-probability-independence/v/conditional-probability-and-independence" },
      { label: "StatTrek: Uvjetna vjerojatn.", url: "https://stattrek.com/probability/conditional-probability.aspx" },
    ],
    3: [
      { label: "Khan: Bayesov teorem",         url: "https://www.khanacademy.org/math/statistics-probability/probability-library/bayes-theorem/v/bayes-theorem-visualized" },
      { label: "StatTrek: Bayesov teorem",     url: "https://stattrek.com/probability/bayes-theorem.aspx" },
    ],
    4: [
      { label: "Khan: Slučajne varijable",     url: "https://www.khanacademy.org/math/statistics-probability/random-variables-stats-library" },
      { label: "StatTrek: Slučajne varijable", url: "https://stattrek.com/random-variable/random-variable.aspx" },
    ],
    5: [
      { label: "Khan: Binomna distribucija",   url: "https://www.khanacademy.org/math/statistics-probability/random-variables-stats-library/binomial-random-variables/v/binomial-distribution" },
      { label: "StatTrek: Poissonova distr.",  url: "https://stattrek.com/probability-distributions/poisson.aspx" },
    ],
    6: [
      { label: "Khan: Normalna distribucija",  url: "https://www.khanacademy.org/math/statistics-probability/modeling-distributions-of-data/normal-distributions-library/v/ck12-org-normal-distribution-problems-qualitative-sense-of-normal-distributions" },
      { label: "StatTrek: Eksponencijalna",    url: "https://stattrek.com/probability-distributions/exponential.aspx" },
    ],
    7: [
      { label: "Khan: Očekivanje i varijanca", url: "https://www.khanacademy.org/math/statistics-probability/random-variables-stats-library/expected-value-lib/v/expected-value-of-a-discrete-random-variable" },
      { label: "StatTrek: Karakteristike",     url: "https://stattrek.com/random-variable/expected-value.aspx" },
    ],
    // Tjedan 8: 1. kolokvij — bez resursa
    9: [
      { label: "Khan: Procjena parametara",    url: "https://www.khanacademy.org/math/statistics-probability/confidence-intervals-one-sample" },
      { label: "StatTrek: Uzorkovanje",        url: "https://stattrek.com/sampling/simple-random-sampling.aspx" },
    ],
    10: [
      { label: "Khan: Intervali pouzdanosti",  url: "https://www.khanacademy.org/math/statistics-probability/confidence-intervals-one-sample/introduction-to-confidence-intervals/v/confidence-intervals-and-margin-of-error" },
      { label: "StatTrek: Intervali pouzdanosti", url: "https://stattrek.com/estimation/confidence-interval.aspx" },
    ],
    11: [
      { label: "Khan: Z-test i t-test",        url: "https://www.khanacademy.org/math/statistics-probability/significance-tests-one-sample" },
      { label: "StatTrek: Testiranje hipoteza", url: "https://stattrek.com/hypothesis-test/hypothesis-testing.aspx" },
    ],
    12: [
      { label: "Khan: Hi-kvadrat test",        url: "https://www.khanacademy.org/math/statistics-probability/inference-categorical-data-chi-square-tests" },
      { label: "StatTrek: Chi-square test",    url: "https://stattrek.com/chi-square-test/goodness-of-fit.aspx" },
    ],
    // Tjedan 13: 2. kolokvij — bez resursa
    14: [
      { label: "Khan: Linearna regresija",     url: "https://www.khanacademy.org/math/statistics-probability/describing-relationships-in-quantitative-data" },
      { label: "StatTrek: Regresija",          url: "https://stattrek.com/regression/regression-intro.aspx" },
    ],
  },

  // --------------------------------------------------------------------------
  // OS — Operacijski sustavi
  // --------------------------------------------------------------------------
  os: {
    1: [
      { label: "linuxcommand.org: Uvod",       url: "https://linuxcommand.org/lc3_learning_the_shell.php" },
      { label: "man7: Naredbe po abecedi",     url: "https://man7.org/linux/man-pages/dir_all_by_section.html" },
    ],
    2: [
      { label: "linuxcommand.org: Datoteke",   url: "https://linuxcommand.org/lc3_lts0020.php" },
      { label: "man7: ls, cp, mv, rm",         url: "https://man7.org/linux/man-pages/man1/ls.1.html" },
    ],
    3: [
      { label: "linuxcommand.org: Glob. izrazi", url: "https://linuxcommand.org/lc3_lts0050.php" },
      { label: "man7: tar, gzip",              url: "https://man7.org/linux/man-pages/man1/tar.1.html" },
    ],
    4: [
      { label: "man7: regex — uvod",           url: "https://man7.org/linux/man-pages/man7/regex.7.html" },
      { label: "linuxcommand.org: grep",       url: "https://linuxcommand.org/lc3_man_pages/grep1.html" },
    ],
    5: [
      { label: "linuxcommand.org: Preusmjeravanje", url: "https://linuxcommand.org/lc3_lts0070.php" },
      { label: "man7: pipe(7)",                url: "https://man7.org/linux/man-pages/man7/pipe.7.html" },
    ],
    6: [
      { label: "linuxcommand.org: Ljuska",     url: "https://linuxcommand.org/lc3_lts0080.php" },
      { label: "man7: bash(1)",                url: "https://man7.org/linux/man-pages/man1/bash.1.html" },
    ],
    7: [
      { label: "linuxcommand.org: Procesi",    url: "https://linuxcommand.org/lc3_lts0090.php" },
      { label: "man7: ps, top, jobs",          url: "https://man7.org/linux/man-pages/man1/ps.1.html" },
    ],
    8: [
      { label: "man7: kill, signal(7)",        url: "https://man7.org/linux/man-pages/man7/signal.7.html" },
      { label: "man7: nice, renice",           url: "https://man7.org/linux/man-pages/man1/nice.1.html" },
    ],
    // Tjedan 9: Kontrolna zadaća 1 — bez resursa
    10: [
      { label: "docs.python.org: os modul",    url: "https://docs.python.org/3/library/os.html" },
      { label: "docs.python.org: pathlib",     url: "https://docs.python.org/3/library/pathlib.html" },
    ],
    11: [
      { label: "docs.python.org: signal",      url: "https://docs.python.org/3/library/signal.html" },
      { label: "docs.python.org: subprocess",  url: "https://docs.python.org/3/library/subprocess.html" },
    ],
    12: [
      { label: "docs.python.org: threading",   url: "https://docs.python.org/3/library/threading.html" },
      { label: "docs.python.org: concurrent",  url: "https://docs.python.org/3/library/concurrent.futures.html" },
    ],
    13: [
      { label: "docs.python.org: Lock, Semaphore", url: "https://docs.python.org/3/library/threading.html#lock-objects" },
      { label: "man7: pthreads(7)",            url: "https://man7.org/linux/man-pages/man7/pthreads.7.html" },
    ],
    // Tjedan 14: Kontrolna zadaća 2 — bez resursa
  },

  // --------------------------------------------------------------------------
  // AOR — Arhitektura i organizacija računala
  // --------------------------------------------------------------------------
  aor: {
    1: [
      { label: "Nand2Tetris: Uvod",            url: "https://www.nand2tetris.org/course" },
      { label: "CircuitVerse: Playground",     url: "https://circuitverse.org/simulator" },
    ],
    2: [
      { label: "CircuitVerse: Brojevni sustavi", url: "https://learn.circuitverse.org/docs/num-system/intro-num-system.html" },
      { label: "GFG: Konverzije baza",         url: "https://www.geeksforgeeks.org/number-system-in-digital-electronics/" },
    ],
    3: [
      { label: "CircuitVerse: Booleova algebra", url: "https://learn.circuitverse.org/docs/boolean-algebra/intro-boolean.html" },
      { label: "Nand2Tetris: Boolean logic",   url: "https://www.nand2tetris.org/project01" },
    ],
    4: [
      { label: "CircuitVerse: Kombinacijski sklopovi", url: "https://learn.circuitverse.org/docs/combinational-ccts/intro-combinational.html" },
      { label: "GFG: Multipleksori i dekoderi", url: "https://www.geeksforgeeks.org/multiplexers-in-digital-logic/" },
    ],
    5: [
      { label: "CircuitVerse: Sekvencijalni sklopovi", url: "https://learn.circuitverse.org/docs/seq-ccts/intro-seq.html" },
      { label: "GFG: Bistabili i registri",    url: "https://www.geeksforgeeks.org/flip-flop-types-their-conversion-and-applications/" },
    ],
    // Tjedan 6: Kviz — bez resursa
    7: [
      { label: "Nand2Tetris: ALU projekt",     url: "https://www.nand2tetris.org/project02" },
      { label: "GFG: RTL mikrooperacije",      url: "https://www.geeksforgeeks.org/register-transfer-language-and-microoperations/" },
    ],
    8: [
      { label: "GFG: Organizacija procesora",  url: "https://www.geeksforgeeks.org/introduction-of-control-unit-and-its-design/" },
      { label: "Nand2Tetris: CPU projekt",     url: "https://www.nand2tetris.org/project05" },
    ],
    9: [
      { label: "GFG: RISC vs CISC",            url: "https://www.geeksforgeeks.org/risc-and-cisc-architecture/" },
      { label: "Nand2Tetris: ISA",             url: "https://www.nand2tetris.org/project04" },
    ],
    10: [
      { label: "GFG: Pipeline i hazardi",      url: "https://www.geeksforgeeks.org/computer-organization-and-architecture-pipelining-set-1-execution-stages-and-throughput/" },
      { label: "CircuitVerse: Simulator",      url: "https://circuitverse.org/simulator" },
    ],
    // Tjedan 11: Praktični kolokvij — bez resursa
    12: [
      { label: "GFG: Hijerarhija memorije",    url: "https://www.geeksforgeeks.org/memory-hierarchy-design-and-its-characteristics/" },
      { label: "Nand2Tetris: Memorija",        url: "https://www.nand2tetris.org/project03" },
    ],
    13: [
      { label: "GFG: Cache memorija",          url: "https://www.geeksforgeeks.org/cache-memory-in-computer-organization/" },
      { label: "GFG: Strategije zamjene",      url: "https://www.geeksforgeeks.org/page-replacement-algorithms-in-operating-systems/" },
    ],
    14: [
      { label: "GFG: U/I sustav i sabirnice",  url: "https://www.geeksforgeeks.org/input-output-organization/" },
      { label: "GFG: DMA i prekidi",           url: "https://www.geeksforgeeks.org/direct-memory-access/" },
    ],
  },

  // --------------------------------------------------------------------------
  // OI — Operacijska istraživanja
  // --------------------------------------------------------------------------
  oi: {
    1: [
      { label: "GFG: Linearno programiranje",  url: "https://www.geeksforgeeks.org/linear-programming/" },
      { label: "GameTheory101: Uvod",          url: "https://gametheory101.com/courses/game-theory-101/" },
    ],
    2: [
      { label: "GFG: LP — grafička metoda",    url: "https://www.geeksforgeeks.org/graphical-method-linear-programming/" },
      { label: "Wolfram Alpha: LP rješavač",   url: "https://www.wolframalpha.com/calculators/linear-programming-solver" },
    ],
    3: [
      { label: "GFG: Simpleks metoda",         url: "https://www.geeksforgeeks.org/simplex-method-for-lpp/" },
      { label: "GFG: Simpleks algoritam",      url: "https://www.geeksforgeeks.org/simplex-algorithm-tabular-form/" },
    ],
    4: [
      { label: "GFG: Dualnost u LP-u",         url: "https://www.geeksforgeeks.org/duality-in-linear-programming/" },
      { label: "GFG: Dualni simpleks",         url: "https://www.geeksforgeeks.org/dual-simplex-method/" },
    ],
    5: [
      { label: "GFG: Analiza osjetljivosti",   url: "https://www.geeksforgeeks.org/sensitivity-analysis-in-linear-programming/" },
      { label: "Wolfram Alpha: LP",            url: "https://www.wolframalpha.com/" },
    ],
    // Tjedan 6: 1. kolokvij — bez resursa
    7: [
      { label: "GFG: Transportni problem",     url: "https://www.geeksforgeeks.org/transportation-problem-set-1-introduction/" },
      { label: "GFG: MODI metoda",             url: "https://www.geeksforgeeks.org/transportation-problem-set-2-modi-method/" },
    ],
    8: [
      { label: "Visualgo: Najkraći put",       url: "https://visualgo.net/en/sssp" },
      { label: "Visualgo: Maksimalni tok",     url: "https://visualgo.net/en/maxflow" },
    ],
    9: [
      { label: "GameTheory101: Matrične igre", url: "https://gametheory101.com/courses/game-theory-101/normal-form-games-and-nash-equilibria/" },
      { label: "GFG: Teorija igara",           url: "https://www.geeksforgeeks.org/game-theory/" },
    ],
    10: [
      { label: "GFG: Cjelobrojno programiranje", url: "https://www.geeksforgeeks.org/integer-linear-programming/" },
      { label: "GFG: Metoda grana i ograde",   url: "https://www.geeksforgeeks.org/branch-and-bound-algorithm/" },
    ],
    // Tjedan 11: 2. kolokvij — bez resursa
    12: [
      { label: "GFG: Dinamičko programiranje", url: "https://www.geeksforgeeks.org/dynamic-programming/" },
      { label: "Visualgo: DP vizualizacija",   url: "https://visualgo.net/en/dp" },
    ],
    13: [
      { label: "GFG: Višekriterijsko odluč.", url: "https://www.geeksforgeeks.org/analytic-hierarchy-process-ahp/" },
      { label: "GameTheory101: Odlučivanje",   url: "https://gametheory101.com/" },
    ],
    14: [
      { label: "GFG: Teorija čekanja u redu",  url: "https://www.geeksforgeeks.org/queuing-theory/" },
      { label: "GFG: Stohastički modeli",      url: "https://www.geeksforgeeks.org/operations-research/" },
    ],
  },
};
