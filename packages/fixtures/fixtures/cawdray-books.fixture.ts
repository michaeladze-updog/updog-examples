import { custom, defineFixture, sheet } from "../src/index";

/**
 * An antiquarian bookshop's stock, exported twice. The old till writes
 * Windows-1252, so `Ōe, Kenzaburō` left it as `?e, Kenzabur?` before any file
 * existed, and `Čapek` could not have left it at all. The new system writes
 * UTF-8 and Excel re-saved it with a byte order mark. The merged file is the
 * two exports concatenated, which is the file a person actually uploads: a
 * UTF-8 mark in front of a body that stops being UTF-8 halfway down.
 *
 * The same Till sheet ships three times — UTF-8, UTF-8 with a mark, and
 * Windows-1252 — as the corpus the encoding article compares byte for byte.
 */
const TILL = [
  ["CB-0104", "Böll, Heinrich", "Ansichten eines Clowns", "de", "€18.50", "A3"],
  [
    "CB-0107",
    "Márquez, Gabriel García",
    "El coronel no tiene quien le escriba",
    "es",
    "€22.00",
    "B1",
  ],
  ["CB-0112", "Colette", "Le Blé en herbe", "fr", "€14.75", "B2"],
  [
    "CB-0118",
    "Hašek, Jaroslav",
    "Osudy dobrého vojáka Švejka",
    "cs",
    "€26.40",
    "A1",
  ],
  ["CB-0121", "O’Brien, Flann", "The Third Policeman", "en", "€19.00", "C2"],
  ["CB-0126", "Ibáñez, Vicente Blasco", "Cañas y barro", "es", "€16.20", "B1"],
  ["CB-0130", "?e, Kenzabur?", "A Personal Matter", "en", "€31.00", "C4"],
  ["CB-0134", "Strindberg, August", "Fröken Julie", "sv", "€12.90", "D2"],
  ["CB-0139", "Éluard, Paul", "Capitale de la douleur", "fr", "€28.00", "B2"],
  ["CB-0142", "Süskind, Patrick", "Das Parfum", "de", "€11.50", "A3"],
  ["CB-0147", "Zweig, Stefan", "Die Welt von Gestern", "de", "€24.00", "A4"],
  ["CB-0151", "Undset, Sigrid", "Kransen", "no", "€17.30", "D1"],
];

const SYSTEM = [
  [
    "CB-0208",
    "Достоевский, Фёдор",
    "Записки из подполья",
    "ru",
    "€27.00",
    "D1",
  ],
  ["CB-0211", "Ōe, Kenzaburō", "The Silent Cry", "en", "€33.00", "C4"],
  ["CB-0215", "Čapek, Karel", "Válka s mloky", "cs", "€21.80", "A1"],
  ["CB-0219", "Woolf, Virginia", "The Waves", "en", "€15.00", "C1"],
  [
    "CB-0223",
    "Faure\u0301, Gabriel",
    "Lettres à ses éditeurs",
    "fr",
    "€45.00",
    "B4",
  ],
  ["CB-0227", "Calvino, Italo", "Le città invisibili", "it", "€19.90", "C3"],
  ["CB-0231", "Sebald, W. G.", "Die Ausgewanderten", "de", "€23.50", "A4"],
  ["CB-0236", "JosÃ© Ãlvarez", "Cartas de invierno", "es", "€13.40", "B1"],
  ["CB-0240", "Akhmatova, Anna", "Реквием", "ru", "€29.00", "D1"],
  [
    "CB-0244",
    "Szymborska, Wisława",
    "Widok z ziarnkiem piasku",
    "pl",
    "€20.00",
    "D3",
  ],
  ["CB-0249", "Ferrante, Elena", "L’amica geniale", "it", "€16.80", "C3"],
  ["CB-0253", "Krúdy, Gyula", "Szindbád ifjúsága", "hu", "€25.60", "D4"],
  ["CB-0257", "Bâ, Mariama", "Une si longue lettre", "fr", "€18.00", "B2"],
  [
    "CB-0261",
    "Tanizaki, Jun’ichirō",
    "In Praise of Shadows",
    "en",
    "€22.50",
    "C4",
  ],
];

const at = (rows: string[][], column: number) => {
  return custom((_rng, index) => {
    return rows[index][column];
  });
};

const columns = (rows: string[][]) => {
  return {
    "Cat. no.": at(rows, 0),
    Author: at(rows, 1),
    Title: at(rows, 2),
    Lang: at(rows, 3),
    "Price (EUR)": at(rows, 4),
    Shelf: at(rows, 5),
  };
};

export default defineFixture({
  name: "cawdray-books",
  sheets: [
    sheet("Till", { rows: TILL.length, seed: 52, columns: columns(TILL) }),
    sheet("System", {
      rows: SYSTEM.length,
      seed: 52,
      columns: columns(SYSTEM),
    }),
  ],
  outputs: ["csv"],
  csvFiles: [
    { suffix: "till-utf8", parts: [{ sheet: "Till" }] },
    { suffix: "till-utf8-bom", parts: [{ sheet: "Till", bom: true }] },
    {
      suffix: "till-cp1252",
      parts: [{ sheet: "Till", encoding: "windows-1252" }],
    },
    { suffix: "system", parts: [{ sheet: "System", bom: true }] },
    {
      suffix: "merged",
      parts: [
        { sheet: "System", bom: true },
        { sheet: "Till", encoding: "windows-1252", header: false },
      ],
    },
  ],
});
