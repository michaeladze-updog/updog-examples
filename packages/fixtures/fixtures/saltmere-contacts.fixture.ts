import { custom, defineFixture, pick, sheet } from "../src/index";
import type { CellValue, PartialRow } from "../src/index";

const FIRST_NAMES = [
  "Aoife",
  "Bilal",
  "Cerys",
  "Dermot",
  "Elif",
  "Fenella",
  "Gustav",
  "Halima",
  "Idris",
  "Joanna",
  "Kamil",
  "Lorcan",
  "Maren",
  "Niamh",
  "Oskar",
  "Perdita",
  "Quentin",
  "Rosalind",
  "Soren",
  "Tabitha",
  "Ugo",
  "Verity",
  "Wilhelmina",
  "Yusuf",
  "Anneka",
  "Bartholomew",
  "Clemency",
  "Dagfinn",
  "Esperanza",
  "Ferdinand",
  "Gwenllian",
  "Hyacinth",
  "Ignatius",
  "Jolanta",
  "Kristoffer",
  "Leontine",
  "Magnus",
  "Nikolaj",
  "Ottoline",
  "Piran",
  "Rafaela",
  "Sindre",
  "Theodora",
  "Valentina",
  "Wolfgang",
  "Xanthe",
  "Zephyrine",
  "Ambrose",
  "Beatrix",
  "Casimir",
  "Delphine",
  "Emrys",
  "Florentyna",
  "Gideon",
];

const SURNAMES = [
  "Achterberg",
  "Barlowe",
  "Castellane",
  "Deverell",
  "Ekwueme",
  "Fairhurst",
  "Grimsdale",
  "Halloran",
  "Isaksen",
  "Jarratt",
  "Kilbride",
  "Lanphier",
  "Mottram",
  "Nadolny",
  "Ozanne",
  "Pennycuick",
  "Quennell",
  "Rackham",
  "Steadman",
  "Thurlby",
  "Umfreville",
  "Vasarhelyi",
  "Wrenshall",
  "Yeardley",
  "Ainscough",
  "Blackstaffe",
  "Cholmondeley",
  "Drinkwater",
  "Ellwood",
  "Fotheringay",
  "Gedge",
  "Hartshorne",
  "Inkpen",
  "Jelbert",
  "Kettlewell",
  "Loveridge",
  "Merriweather",
  "Nettleship",
  "Oglethorpe",
  "Prendergast",
  "Quarterman",
  "Rowbotham",
  "Snelgrove",
  "Trelawney",
  "Underhill",
  "Vanterpool",
  "Wickenden",
  "Yelverton",
  "Ashenden",
  "Braithwaite",
  "Cattermole",
  "Dallimore",
  "Endacott",
  "Fitzsimmons",
  "Goodenough",
  "Hepplewhite",
  "Illingworth",
  "Jephcott",
  "Kirkbride",
  "Ledingham",
  "Musgrave",
  "Naismith",
  "Otterburn",
  "Puddephatt",
  "Ravenscroft",
  "Sillitoe",
  "Tattersall",
  "Verinder",
  "Wolstenholme",
];

const ORGANISATIONS = [
  "Heronwood Care",
  "Vellamore Ltd",
  "Kelsby Works",
  "Ashlyn Group",
  "Marlowe Heath Estates",
  "Pentre Bakeries",
  "Quillon Interiors",
  "Redhaven Logistics",
  "Strathmoor Joinery",
  "Tanfield Plant Hire",
  "Beckwith Dairies",
  "Calderstone Precision",
  "Dunmorrow Roofing",
  "Ferndale Nurseries",
  "Glenbourne Hotels",
  "Haverbrook Metals",
  "Ilderton Coachworks",
  "Jesmond Fabrication",
  "Kirkharle Glazing",
  "Lyneham Foods",
  "Merrivale Textiles",
  "Northgate Scaffolding",
  "Ovingham Print",
  "Padstowe Fisheries",
  "Rosthwaite Timber",
  "Swaledale Haulage",
  "Trenowden Electrical",
  "Wardley Groundworks",
  "Yarnbury Packaging",
  "Zennor Cold Store",
];

const ORG_DOMAINS: Record<string, string> = {
  "Heronwood Care": "heronwood.example",
  "Vellamore Ltd": "vellamore.example",
  "Kelsby Works": "kelsbyworks.example",
  "Ashlyn Group": "ashlyn.example",
  "Marlowe Heath Estates": "marloweheath.example",
  "Pentre Bakeries": "pentrebakeries.example",
  "Quillon Interiors": "quilloninteriors.example",
  "Redhaven Logistics": "redhaven.example",
  "Strathmoor Joinery": "strathmoor.example",
  "Tanfield Plant Hire": "tanfieldplant.example",
  "Beckwith Dairies": "beckwithdairies.example",
  "Calderstone Precision": "calderstone.example",
  "Dunmorrow Roofing": "dunmorrow.example",
  "Ferndale Nurseries": "ferndalenurseries.example",
  "Glenbourne Hotels": "glenbourne.example",
  "Haverbrook Metals": "haverbrook.example",
  "Ilderton Coachworks": "ilderton.example",
  "Jesmond Fabrication": "jesmondfab.example",
  "Kirkharle Glazing": "kirkharle.example",
  "Lyneham Foods": "lynehamfoods.example",
  "Merrivale Textiles": "merrivale.example",
  "Northgate Scaffolding": "northgatescaff.example",
  "Ovingham Print": "ovinghamprint.example",
  "Padstowe Fisheries": "padstowe.example",
  "Rosthwaite Timber": "rosthwaite.example",
  "Swaledale Haulage": "swaledalehaulage.example",
  "Trenowden Electrical": "trenowden.example",
  "Wardley Groundworks": "wardley.example",
  "Yarnbury Packaging": "yarnbury.example",
  "Zennor Cold Store": "zennorcold.example",
};

const OWNERS = [
  "ivy.crane@saltmere.example",
  "dev.oyelaran@saltmere.example",
  "roisin.tuohy@saltmere.example",
];

const COURSES = [
  "Manual Handling",
  "Fire Safety",
  "First Aid",
  "Working at Height",
  "Asbestos Awareness",
];

/**
 * 07700 900000-900999 is the mobile range Ofcom recommends for drama, so every
 * number here is unreachable by design. The five written shapes are the ones a
 * merged contact list actually carries.
 */
const mobile = custom((rng, rowIndex) => {
  const line = String(rowIndex).padStart(3, "0");
  const national = `7700 900${line}`;
  const flat = national.replace(" ", "");
  switch (rng.int(0, 4)) {
    case 0:
      return `+44 ${national}`;
    case 1:
      return `0${national}`;
    case 2:
      return `0044${flat}`;
    case 3:
      return `+44${flat}`;
    default:
      return `(0044) ${national}`;
  }
});

const contactEmail = custom((_rng, _rowIndex, row: PartialRow): CellValue => {
  const first = String(row["First name"] ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const last = String(row.Surname ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const domain = ORG_DOMAINS[String(row.Organisation)] ?? "example.com";
  return `${first.slice(0, 1)}.${last}@${domain}`;
});

/**
 * Two exporters fed this column, so a comma-joined cell and a semicolon-joined
 * cell sit in the same file.
 */
const workEmail = custom((rng, _rowIndex, row: PartialRow): CellValue => {
  if (!rng.bool(0.16)) return "";
  const first = String(row["First name"] ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const last = String(row.Surname ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const domain = ORG_DOMAINS[String(row.Organisation)] ?? "example.com";
  return `${first}.${last}@${domain}`;
});

const interests = custom((rng) => {
  const count = rng.int(1, 3);
  const chosen: string[] = [];
  while (chosen.length < count) {
    const course = rng.pick(COURSES);
    if (!chosen.includes(String(course))) chosen.push(String(course));
  }
  return rng.bool(0.35) ? chosen.join(";") : chosen.join(", ");
});

const contacts = sheet("Contacts", {
  rows: 186,
  seed: 19,
  columns: {
    "First name": pick(FIRST_NAMES),
    Surname: pick(SURNAMES),
    Organisation: pick(ORGANISATIONS),
    "E-mail": contactEmail,
    "Work Email": workEmail,
    Mobile: mobile,
    "Account manager": pick(OWNERS),
    Interests: interests,
  },
  overrides: [
    {
      at: 0,
      "First name": "Nadia",
      Surname: "Brandt",
      "E-mail": "nadia.brandt@heronwood.example",
      Mobile: "+44 7700 900418",
      Organisation: "Heronwood Care",
      "Account manager": "ivy.crane@saltmere.example",
      Interests: "Manual Handling, Fire Safety",
    },
    {
      at: 1,
      "First name": "Tomas",
      Surname: "Vella",
      "E-mail": "office@vellamore.example",
      "Work Email": "t.vella@vellamore.example",
      Mobile: "07700 900731",
      Organisation: "Vellamore Ltd",
      "Account manager": "ivy.crane@saltmere.example",
      Interests: "Fire Safety;First Aid",
    },
    {
      at: 2,
      "First name": "Ines",
      Surname: "Cardoso",
      "E-mail": "office@vellamore.example",
      "Work Email": "",
      Mobile: "07700 900731",
      Organisation: "Vellamore Ltd",
      "Account manager": "ivy.crane@saltmere.example",
      Interests: "First Aid",
    },
    {
      at: 3,
      "First name": "Amrit",
      Surname: "Sandhu",
      "E-mail": "a.sandhu@kelsbyworks.example",
      "Work Email": "",
      Mobile: "00447700900265",
      Organisation: "Kelsby Works",
      "Account manager": "dev.oyelaran@saltmere.example",
      Interests: "Working at Height",
    },
    {
      at: 4,
      "First name": "Amrit",
      Surname: "Sandhu",
      "E-mail": "amrit.sandhu@kelsbyworks.example",
      "Work Email": "",
      Mobile: "+44 7700 900318",
      Organisation: "Kelsby Works",
      "Account manager": "dev.oyelaran@saltmere.example",
      Interests: "Asbestos Awareness",
    },
    {
      at: 5,
      "First name": "Rowan",
      Surname: "Ferrand",
      "E-mail": "R.Ferrand@ashlyn.example",
      "Work Email": "",
      Mobile: "+447700900904",
      Organisation: "Ashlyn Group",
      "Account manager": "ivy.crane@saltmere.example",
      Interests: "Fire safety, manual handling",
    },
    {
      at: 6,
      "First name": "Kofi Adjetey",
      Surname: "",
      "E-mail": "k.adjetey@marloweheath.example",
      "Work Email": "",
      Mobile: "(0044) 7700 900612",
      Organisation: "Marlowe Heath Estates",
      "Account manager": "roisin.tuohy@saltmere.example",
      Interests: "MH; FS",
    },
    {
      at: 7,
      "First name": "Sofia",
      Surname: "Nkemelu",
      "E-mail": "",
      "Work Email": "",
      Mobile: "07700 900947",
      Organisation: "Kelsby Works",
      "Account manager": "dev.oyelaran@saltmere.example",
      Interests: "First Aid",
    },
  ],
});

export default defineFixture({
  name: "saltmere-contacts",
  sheets: [contacts],
  outputs: ["csv", "xlsx"],
});
