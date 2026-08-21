import { createRng, custom, defineFixture, sheet } from "../src/index";
import type { CellValue } from "../src/index";

type Player = {
  jersey: string;
  name: string;
  starter: boolean;
  usage: number;
};

type Season = {
  label: string;
  startYear: number;
  toTheSecond: boolean;
  roster: Player[];
};

const OPPONENTS = [
  "Alderman",
  "Bellcourt",
  "Carrowmore",
  "Delaford",
  "Eastvale",
  "Fenwick",
  "Granholm",
  "Harlowe",
  "Innisfree",
  "Kestrel Bay",
  "Langmere",
  "Marchfield",
  "Northgate",
  "Oakhaven",
  "Pentland",
  "Quarry Ridge",
  "Redhill",
  "Saltmarsh",
  "Thornbury",
  "Underhill",
  "Vantage",
  "Westmere",
];

const FIRST_NAMES = [
  "Amare",
  "Bo",
  "Cormac",
  "Dedrick",
  "Emeka",
  "Finn",
  "Gideon",
  "Hollis",
  "Isaias",
  "Jarrell",
  "Kwame",
  "Lachlan",
  "Malachi",
  "Nikola",
  "Oisin",
  "Priit",
  "Quentin",
  "Rasheed",
  "Solomon",
  "Tavian",
  "Ugo",
  "Vasil",
  "Wendell",
  "Xavier",
  "Yannick",
  "Zeke",
];

const LAST_NAMES = [
  "Abara",
  "Bramwell",
  "Caverly",
  "Doran",
  "Eklund",
  "Farrow",
  "Gillick",
  "Hazlett",
  "Ivory",
  "Janowski",
  "Kealoha",
  "Lomax",
  "Merrick",
  "Nkemelu",
  "Ostrander",
  "Pilkington",
  "Quiroz",
  "Redfern",
  "Stanhope",
  "Tolliver",
  "Ulmer",
  "Vantrease",
  "Whitlock",
  "Yeboah",
  "Zeller",
];

const rng = createRng(73);

const pad2 = (value: number): string => {
  return String(value).padStart(2, "0");
};

const usDate = (year: number, month: number, day: number): string => {
  return `${pad2(month)}/${pad2(day)}/${year}`;
};

const buildName = (used: Set<string>): string => {
  let name = "";
  let guard = 0;
  do {
    guard++;
    name = `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
  } while (used.has(name) && guard < 400);
  used.add(name);
  return name;
};

const SEASON_PLAN: { label: string; startYear: number; zero: string | null }[] =
  [
    { label: "2020-21", startYear: 2020, zero: null },
    { label: "2021-22", startYear: 2021, zero: "00" },
    { label: "2022-23", startYear: 2022, zero: "00" },
    { label: "2023-24", startYear: 2023, zero: null },
    { label: "2024-25", startYear: 2024, zero: "0" },
    { label: "2025-26", startYear: 2025, zero: "0" },
  ];

const SPARE_NUMBERS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "40",
  "42",
  "44",
  "45",
  "50",
  "52",
  "55",
];

const usedNames = new Set<string>();

const buildSeasons = (): Season[] => {
  const seasons: Season[] = [];

  for (let index = 0; index < SEASON_PLAN.length; index++) {
    const plan = SEASON_PLAN[index] as (typeof SEASON_PLAN)[number];
    const pool = [...SPARE_NUMBERS];
    const numbers: string[] = [];
    if (plan.zero) numbers.push(plan.zero);
    while (numbers.length < 13) {
      const at = rng.int(0, pool.length - 1);
      numbers.push(pool.splice(at, 1)[0] as string);
    }

    const roster: Player[] = numbers.map((jersey, slot) => {
      return {
        jersey,
        name: buildName(usedNames),
        starter: slot < 5,
        usage: slot < 5 ? rng.float(0.72, 1) : rng.float(0.16, 0.66),
      };
    });

    seasons.push({
      label: plan.label,
      startYear: plan.startYear,
      toTheSecond: index >= 3,
      roster,
    });
  }

  return seasons;
};

const SEASONS = buildSeasons();

type Line = {
  jersey: string;
  name: string;
  seconds: number | null;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  off: number;
  def: number;
  pf: number;
  points: number;
  ast: number;
  to: number;
  blk: number;
  stl: number;
};

type Game = {
  season: Season;
  date: string;
  opponent: string;
  lines: Line[];
  teamOff: number;
  teamDef: number;
  teamTo: number;
};

const scoreLine = (player: Player, seconds: number): Line => {
  const load = seconds / 2400;

  const fga = Math.round(rng.float(3, 21) * load);
  const fgm = fga === 0 ? 0 : rng.int(0, fga);
  const tpa = Math.min(fga, Math.round(rng.float(0, 11) * load));
  const tpm = tpa === 0 ? 0 : Math.min(fgm, rng.int(0, tpa));
  const fta = Math.round(rng.float(0, 9) * load);
  const ftm = fta === 0 ? 0 : rng.int(0, fta);

  return {
    jersey: player.jersey,
    name: player.name,
    seconds,
    fgm,
    fga,
    tpm,
    tpa,
    ftm,
    fta,
    off: Math.round(rng.float(0, 6) * load),
    def: Math.round(rng.float(0, 11) * load),
    pf: Math.min(5, Math.round(rng.float(0, 7) * load)),
    points: (fgm - tpm) * 2 + tpm * 3 + ftm,
    ast: Math.round(rng.float(0, 10) * load),
    to: Math.round(rng.float(0, 7) * load),
    blk: Math.round(rng.float(0, 4) * load),
    stl: Math.round(rng.float(0, 4) * load),
  };
};

const emptyLine = (player: Player): Line => {
  return {
    jersey: player.jersey,
    name: player.name,
    seconds: null,
    fgm: 0,
    fga: 0,
    tpm: 0,
    tpa: 0,
    ftm: 0,
    fta: 0,
    off: 0,
    def: 0,
    pf: 0,
    points: 0,
    ast: 0,
    to: 0,
    blk: 0,
    stl: 0,
  };
};

const buildGames = (): Game[] => {
  const games: Game[] = [];

  for (const season of SEASONS) {
    let month = 11;
    let day = 6;

    for (let index = 0; index < 29; index++) {
      const step = rng.int(2, 6);
      day += step;
      while (day > 28) {
        day -= 28;
        month += 1;
      }
      const year = month > 12 ? season.startYear + 1 : season.startYear;
      const realMonth = month > 12 ? month - 12 : month;

      const dressed = season.roster.slice(0, rng.int(11, 13));
      const played = dressed.filter((player) => {
        return player.starter || rng.bool(0.78);
      });

      const fixed = new Map<Player, number>();
      const bench = played.filter((player) => {
        return !player.starter;
      });
      if (bench.length > 0 && rng.bool(0.24)) {
        fixed.set(rng.pick(bench), rng.int(1, 29));
      }
      if (bench.length > 1 && rng.bool(0.13)) {
        const spare = bench.filter((player) => {
          return !fixed.has(player);
        });
        if (spare.length > 0) fixed.set(rng.pick(spare), 0);
      }
      if (rng.bool(0.24)) {
        const starters = played.filter((player) => {
          return player.starter && !fixed.has(player);
        });
        if (starters.length > 0)
          fixed.set(rng.pick(starters), rng.int(2371, 2399));
      }

      const shared = played.filter((player) => {
        return !fixed.has(player);
      });
      let budget = 12000;
      for (const seconds of fixed.values()) budget -= seconds;
      const weights = shared.map((player) => {
        return player.usage * rng.float(0.7, 1.3);
      });
      const total = weights.reduce((sum, weight) => {
        return sum + weight;
      }, 0);
      const seconds = new Map<Player, number>(fixed);
      let handed = 0;
      shared.forEach((player, slot) => {
        const value = Math.min(
          2360,
          Math.max(
            35,
            Math.round((budget * (weights[slot] as number)) / total),
          ),
        );
        seconds.set(player, value);
        handed += value;
      });
      const longest = [...shared].sort((a, b) => {
        return (seconds.get(b) ?? 0) - (seconds.get(a) ?? 0);
      })[0];
      if (longest) {
        seconds.set(
          longest,
          Math.max(35, (seconds.get(longest) ?? 0) + (budget - handed)),
        );
      }

      const lines: Line[] = dressed.map((player) => {
        return played.includes(player)
          ? scoreLine(player, seconds.get(player) ?? 0)
          : emptyLine(player);
      });

      games.push({
        season,
        date: usDate(year, realMonth, day),
        opponent: rng.pick(OPPONENTS),
        lines,
        teamOff: rng.int(0, 5),
        teamDef: rng.int(0, 4),
        teamTo: rng.int(0, 3),
      });
    }
  }

  return games;
};

const GAMES = buildGames();

const playedLines = GAMES.flatMap((game) => {
  return game.lines.filter((line) => {
    return line.seconds !== null;
  });
});

const claim = (count: number, pool: Line[], used: Set<Line>): Line[] => {
  const picked: Line[] = [];
  let guard = 0;
  while (picked.length < count && guard < count * 400) {
    guard++;
    const line = pool[rng.int(0, pool.length - 1)] as Line;
    if (used.has(line)) continue;
    used.add(line);
    picked.push(line);
  }
  return picked;
};

const damaged = new Set<Line>();

for (const line of claim(38, playedLines, damaged)) {
  line.points += rng.pick([-3, -2, -1, 1, 2, 3]);
}

const reversedPair = new Set<Line>();
{
  const wideEnough = playedLines.filter((line) => {
    return line.fga - line.fgm >= 2;
  });
  for (const line of claim(14, wideEnough, damaged)) {
    reversedPair.add(line);
  }
}

const writeMinutes = (line: Line, season: Season): string => {
  if (line.seconds === null) return "DNP";
  if (season.toTheSecond) {
    const minutes = Math.floor(line.seconds / 60);
    const seconds = line.seconds % 60;
    return `${minutes}:${pad2(seconds)}`;
  }
  if (line.seconds === 0) return "0";
  if (line.seconds < 30) return "0+";
  if (line.seconds >= 2370) return "40-";
  return String(Math.round(line.seconds / 60));
};

type Row = {
  Date: string;
  Opponent: string;
  "##": string;
  "Player Name": string;
  "TOT-FG": string;
  "3-PT": string;
  FT: string;
  OF: string;
  DE: string;
  TOT: string;
  PF: string;
  TP: string;
  A: string;
  TO: string;
  BLK: string;
  S: string;
  MIN: string;
};

const pair = (made: number, attempted: number): string => {
  return `${made}-${attempted}`;
};

const buildRows = (): Row[] => {
  const rows: Row[] = [];

  for (const game of GAMES) {
    let fgm = 0;
    let fga = 0;
    let tpm = 0;
    let tpa = 0;
    let ftm = 0;
    let fta = 0;
    let off = 0;
    let def = 0;
    let pf = 0;
    let points = 0;
    let ast = 0;
    let to = 0;
    let blk = 0;
    let stl = 0;

    for (const line of game.lines) {
      const dnp = line.seconds === null;
      rows.push({
        Date: game.date,
        Opponent: game.opponent,
        "##": line.jersey,
        "Player Name": line.name,
        "TOT-FG": dnp
          ? ""
          : reversedPair.has(line)
            ? pair(line.fga, line.fgm)
            : pair(line.fgm, line.fga),
        "3-PT": dnp ? "" : pair(line.tpm, line.tpa),
        FT: dnp ? "" : pair(line.ftm, line.fta),
        OF: dnp ? "" : String(line.off),
        DE: dnp ? "" : String(line.def),
        TOT: dnp ? "" : String(line.off + line.def),
        PF: dnp ? "" : String(line.pf),
        TP: dnp ? "" : String(line.points),
        A: dnp ? "" : String(line.ast),
        TO: dnp ? "" : String(line.to),
        BLK: dnp ? "" : String(line.blk),
        S: dnp ? "" : String(line.stl),
        MIN: writeMinutes(line, game.season),
      });

      if (dnp) continue;
      fgm += line.fgm;
      fga += line.fga;
      tpm += line.tpm;
      tpa += line.tpa;
      ftm += line.ftm;
      fta += line.fta;
      off += line.off;
      def += line.def;
      pf += line.pf;
      points += line.points;
      ast += line.ast;
      to += line.to;
      blk += line.blk;
      stl += line.stl;
    }

    rows.push({
      Date: game.date,
      Opponent: game.opponent,
      "##": "",
      "Player Name": "TEAM",
      "TOT-FG": "",
      "3-PT": "",
      FT: "",
      OF: String(game.teamOff),
      DE: String(game.teamDef),
      TOT: String(game.teamOff + game.teamDef),
      PF: "",
      TP: "",
      A: "",
      TO: String(game.teamTo),
      BLK: "",
      S: "",
      MIN: "",
    });

    rows.push({
      Date: game.date,
      Opponent: game.opponent,
      "##": "",
      "Player Name": "Totals",
      "TOT-FG": pair(fgm, fga),
      "3-PT": pair(tpm, tpa),
      FT: pair(ftm, fta),
      OF: String(off + game.teamOff),
      DE: String(def + game.teamDef),
      TOT: String(off + def + game.teamOff + game.teamDef),
      PF: String(pf),
      TP: String(points),
      A: String(ast),
      TO: String(to + game.teamTo),
      BLK: String(blk),
      S: String(stl),
      MIN: "200",
    });
  }

  return rows;
};

const PLAN = buildRows();

const column = (key: keyof Row) => {
  return custom((_rng, rowIndex) => {
    return (PLAN[rowIndex]?.[key] ?? null) as CellValue;
  });
};

export default defineFixture({
  name: "hillcrest-box-scores",
  sheets: [
    sheet("Box scores", {
      rows: PLAN.length,
      seed: 73,
      columns: {
        Date: column("Date"),
        Opponent: column("Opponent"),
        "##": column("##"),
        "Player Name": column("Player Name"),
        "TOT-FG": column("TOT-FG"),
        "3-PT": column("3-PT"),
        FT: column("FT"),
        OF: column("OF"),
        DE: column("DE"),
        TOT: column("TOT"),
        PF: column("PF"),
        TP: column("TP"),
        A: column("A"),
        TO: column("TO"),
        BLK: column("BLK"),
        S: column("S"),
        MIN: column("MIN"),
      },
    }),
  ],
  outputs: ["csv"],
});
