import { createRng, custom, defineFixture, sheet } from "../src/index";
import type { CellValue } from "../src/index";

type Account = {
  code: string;
  name: string;
};

const ACCOUNTS: Account[] = [
  { code: "1010", name: "Cash and cash equivalents:Operating account" },
  { code: "1020", name: "Cash and cash equivalents:Payroll account" },
  { code: "1200", name: "Accounts receivable" },
  { code: "1400", name: "Prepaid expenses:Insurance" },
  { code: "1410", name: "Prepaid expenses:Software subscriptions" },
  { code: "1500", name: "Inventory" },
  { code: "1700", name: "Fixed assets:Office equipment" },
  { code: "1710", name: "Fixed assets:Leasehold improvements" },
  { code: "1790", name: "Accumulated depreciation" },
  { code: "2010", name: "Accounts payable" },
  { code: "2050", name: "Accrued liabilities" },
  { code: "2100", name: "Sales tax payable" },
  { code: "2150", name: "Payroll liabilities:Withholding" },
  { code: "2160", name: "Payroll liabilities:Pension" },
  { code: "2400", name: "Deferred revenue" },
  { code: "2700", name: "Long-term debt" },
  { code: "4010", name: "Revenue:Product" },
  { code: "4020", name: "Revenue:Services" },
  { code: "4090", name: "Sales discounts" },
  { code: "5010", name: "Cost of sales:Materials" },
  { code: "5020", name: "Cost of sales:Freight" },
  { code: "6010", name: "Salaries and wages" },
  { code: "6020", name: "Employee benefits" },
  { code: "6100", name: "Rent" },
  { code: "6110", name: "Utilities" },
  { code: "6200", name: "Professional fees" },
  { code: "6250", name: "Software subscriptions" },
  { code: "6300", name: "Marketing" },
  { code: "6400", name: "Travel and entertainment" },
  { code: "6500", name: "Bank charges" },
  { code: "6600", name: "Depreciation" },
  { code: "6900", name: "Foreign exchange gain or loss" },
  { code: "7100", name: "Interest expense" },
];

const OFF_CHART: Account[] = [
  { code: "4030", name: "Revenue:Support" },
  { code: "6260", name: "Software subscriptions:AI tools" },
  { code: "6420", name: "Travel and entertainment:Conferences" },
];

const byCode = new Map<string, Account>(
  [...ACCOUNTS, ...OFF_CHART].map((account) => {
    return [account.code, account];
  }),
);

const EXPENSE_CODES = [
  "6100",
  "6110",
  "6200",
  "6250",
  "6300",
  "6400",
  "6500",
  "5010",
  "5020",
];

const USERS = [
  "d.okonkwo",
  "m.laurent",
  "s.pettersen",
  "a.varga",
  "System Administrator",
];

const MEMOS_SALE = [
  "Invoice 2025-{n}",
  "Progress billing {n}",
  "Retainer {n}",
  "Licence renewal {n}",
];

const MEMOS_PURCHASE = [
  "Supplier invoice {n}",
  "Monthly service {n}",
  "Purchase order {n}",
  "Reimbursement {n}",
];

const MEMOS_JOURNAL = [
  "Depreciation for the period",
  "Accrual reversal",
  "Payroll journal",
  "Revaluation of foreign balances",
  "Prepaid release",
  "Deferred revenue release",
  "Reclassification",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type Row = {
  Date: string;
  "Transaction Type": string;
  "No.": string;
  "Memo/Description": string;
  "Account No.": string;
  Account: string;
  Debit: string;
  Credit: string;
  "Created By": string;
  Created: string;
};

type Line = {
  code: string;
  memo: string;
  debit: number | null;
  credit: number | null;
};

const rng = createRng(41);

const money = (amount: number, trailingMinus: boolean): string => {
  const grouped = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (amount < 0 && trailingMinus) {
    return `${grouped}-`;
  }
  return grouped;
};

const pad2 = (value: number): string => {
  return String(value).padStart(2, "0");
};

const usDate = (month: number, day: number): string => {
  return `${pad2(month)}/${pad2(day)}/2025`;
};

const stamp = (month: number, day: number): string => {
  const hour = rng.int(1, 12);
  const minute = rng.int(0, 59);
  const second = rng.int(0, 59);
  const half = rng.bool(0.42) ? "AM" : "PM";
  return `${pad2(month)}/${pad2(day)}/2025 ${hour}:${pad2(minute)}:${pad2(second)} ${half}`;
};

const numbered = (template: string, n: number): string => {
  return template.replace("{n}", String(n).padStart(4, "0"));
};

const round2 = (value: number): number => {
  return Math.round(value * 100) / 100;
};

type Entry = {
  month: number;
  day: number;
  type: string;
  no: string;
  user: string;
  lines: Line[];
};

const buildEntries = (): Entry[] => {
  const entries: Entry[] = [];
  let sequence = 1000;
  let document = 4200;

  for (let month = 1; month <= 12; month++) {
    const perMonth = rng.int(58, 78);
    const days = month === 2 ? 28 : [4, 6, 9, 11].includes(month) ? 30 : 31;

    for (let index = 0; index < perMonth; index++) {
      const day = rng.int(1, days);
      const kind = rng.pick(
        [
          "Invoice",
          "Sales Receipt",
          "Payment",
          "Deposit",
          "Credit Memo",
          "Bill",
          "Bill Payment (Check)",
          "Expense",
          "Vendor Credit",
          "Transfer",
          "Journal Entry",
        ],
        [0.19, 0.06, 0.15, 0.04, 0.03, 0.16, 0.11, 0.09, 0.02, 0.03, 0.12],
      );

      sequence += 1;
      document += rng.int(1, 3);
      const lines: Line[] = [];

      if (kind === "Invoice") {
        const net = round2(rng.float(420, 18400));
        const tax = round2(net * 0.2);
        const memo = numbered(rng.pick(MEMOS_SALE), document);
        const revenue = rng.pick(["4010", "4020", "4030"], [0.5, 0.44, 0.06]);
        lines.push({
          code: "1200",
          memo,
          debit: round2(net + tax),
          credit: null,
        });
        lines.push({ code: revenue, memo, debit: null, credit: net });
        lines.push({ code: "2100", memo, debit: null, credit: tax });
      } else if (kind === "Sales Receipt") {
        const net = round2(rng.float(120, 3400));
        const tax = round2(net * 0.2);
        const memo = numbered(rng.pick(MEMOS_SALE), document);
        lines.push({
          code: "1010",
          memo,
          debit: round2(net + tax),
          credit: null,
        });
        lines.push({ code: "4010", memo, debit: null, credit: net });
        lines.push({ code: "2100", memo, debit: null, credit: tax });
      } else if (kind === "Payment") {
        const amount = round2(rng.float(300, 21000));
        const memo = numbered("Customer payment {n}", document);
        lines.push({ code: "1010", memo, debit: amount, credit: null });
        lines.push({ code: "1200", memo, debit: null, credit: amount });
      } else if (kind === "Deposit") {
        const amount = round2(rng.float(500, 9000));
        const memo = numbered("Bank deposit {n}", document);
        lines.push({ code: "1010", memo, debit: amount, credit: null });
        lines.push({ code: "2400", memo, debit: null, credit: amount });
      } else if (kind === "Credit Memo") {
        const amount = round2(rng.float(60, 1900));
        const memo = numbered("Credit note {n}", document);
        lines.push({ code: "4090", memo, debit: amount, credit: null });
        lines.push({ code: "1200", memo, debit: null, credit: amount });
      } else if (kind === "Bill") {
        const amount = round2(rng.float(90, 12600));
        const memo = numbered(rng.pick(MEMOS_PURCHASE), document);
        const expense = rng.bool(0.07)
          ? rng.pick(["6260", "6420"])
          : rng.pick(EXPENSE_CODES);
        lines.push({ code: expense, memo, debit: amount, credit: null });
        lines.push({ code: "2010", memo, debit: null, credit: amount });
      } else if (kind === "Bill Payment (Check)") {
        const amount = round2(rng.float(90, 14200));
        const memo = numbered("Payment to supplier {n}", document);
        lines.push({ code: "2010", memo, debit: amount, credit: null });
        lines.push({ code: "1010", memo, debit: null, credit: amount });
      } else if (kind === "Expense") {
        const amount = round2(rng.float(18, 2400));
        const memo = numbered(rng.pick(MEMOS_PURCHASE), document);
        lines.push({
          code: rng.pick(EXPENSE_CODES),
          memo,
          debit: amount,
          credit: null,
        });
        lines.push({ code: "1010", memo, debit: null, credit: amount });
      } else if (kind === "Vendor Credit") {
        const amount = round2(rng.float(40, 2100));
        const memo = numbered("Supplier credit {n}", document);
        lines.push({ code: "2010", memo, debit: amount, credit: null });
        lines.push({
          code: rng.pick(EXPENSE_CODES),
          memo,
          debit: null,
          credit: amount,
        });
      } else if (kind === "Transfer") {
        const amount = round2(rng.float(4000, 48000));
        const memo = "Transfer between bank accounts";
        lines.push({ code: "1020", memo, debit: amount, credit: null });
        lines.push({ code: "1010", memo, debit: null, credit: amount });
      } else {
        const memo = rng.pick(MEMOS_JOURNAL);
        if (memo === "Payroll journal") {
          const gross = round2(rng.float(28000, 61000));
          const benefits = round2(gross * 0.09);
          const withholding = round2(gross * 0.24);
          const pension = round2(gross * 0.05);
          const net = round2(gross + benefits - withholding - pension);
          lines.push({ code: "6010", memo, debit: gross, credit: null });
          lines.push({ code: "6020", memo, debit: benefits, credit: null });
          lines.push({ code: "2150", memo, debit: null, credit: withholding });
          lines.push({ code: "2160", memo, debit: null, credit: pension });
          lines.push({ code: "1020", memo, debit: null, credit: net });
        } else if (memo === "Depreciation for the period") {
          const amount = round2(rng.float(900, 4200));
          lines.push({ code: "6600", memo, debit: amount, credit: null });
          lines.push({ code: "1790", memo, debit: null, credit: amount });
        } else if (memo === "Revaluation of foreign balances") {
          const amount = round2(rng.float(40, 1800));
          lines.push({ code: "6900", memo, debit: amount, credit: null });
          lines.push({ code: "1200", memo, debit: null, credit: amount });
        } else if (memo === "Prepaid release") {
          const amount = round2(rng.float(200, 2600));
          const prepaid = rng.pick(["1400", "1410"]);
          lines.push({ code: "6200", memo, debit: amount, credit: null });
          lines.push({ code: prepaid, memo, debit: null, credit: amount });
        } else if (memo === "Deferred revenue release") {
          const amount = round2(rng.float(500, 7400));
          lines.push({ code: "2400", memo, debit: amount, credit: null });
          lines.push({ code: "4020", memo, debit: null, credit: amount });
        } else if (memo === "Accrual reversal") {
          const amount = round2(rng.float(300, 5200));
          lines.push({ code: "2050", memo, debit: amount, credit: null });
          lines.push({
            code: rng.pick(EXPENSE_CODES),
            memo,
            debit: null,
            credit: amount,
          });
        } else {
          const amount = round2(rng.float(150, 6300));
          const from = rng.pick(EXPENSE_CODES);
          let to = rng.pick(EXPENSE_CODES);
          while (to === from) {
            to = rng.pick(EXPENSE_CODES);
          }
          lines.push({ code: to, memo, debit: amount, credit: null });
          lines.push({ code: from, memo, debit: null, credit: amount });
        }
      }

      entries.push({
        month,
        day,
        type: kind,
        no: String(sequence),
        user: rng.pick(USERS, [0.24, 0.21, 0.19, 0.16, 0.2]),
        lines,
      });
    }
  }

  return entries;
};

const ENTRIES = buildEntries();

const claim = (count: number, used: Set<number>): number[] => {
  const picked: number[] = [];
  let guard = 0;
  while (picked.length < count && guard < count * 200) {
    guard++;
    const index = rng.int(0, ENTRIES.length - 1);
    if (used.has(index)) continue;
    used.add(index);
    picked.push(index);
  }
  return picked;
};

const damaged = new Set<number>();

for (const index of claim(23, damaged)) {
  const entry = ENTRIES[index] as Entry;
  for (const line of entry.lines) {
    if (line.debit !== null) line.debit = -line.debit;
    if (line.credit !== null) line.credit = -line.credit;
  }
}

const REPORTED = new Map<number, { debit: number; credit: number }>();
let reportedDebit = 0;
let reportedCredit = 0;
for (const entry of ENTRIES) {
  const running = REPORTED.get(entry.month) ?? { debit: 0, credit: 0 };
  for (const line of entry.lines) {
    running.debit += line.debit ?? 0;
    running.credit += line.credit ?? 0;
    reportedDebit += line.debit ?? 0;
    reportedCredit += line.credit ?? 0;
  }
  REPORTED.set(entry.month, running);
}

for (const index of claim(9, damaged)) {
  const entry = ENTRIES[index] as Entry;
  const line = entry.lines[entry.lines.length - 1] as Line;
  line.debit = null;
  line.credit = null;
}

for (const index of claim(5, damaged)) {
  const entry = ENTRIES[index] as Entry;
  const line = entry.lines[0] as Line;
  line.credit = round2(Math.abs(line.debit ?? 0) / 3);
}

for (const index of claim(17, damaged)) {
  const entry = ENTRIES[index] as Entry;
  const line = entry.lines[entry.lines.length - 1] as Line;
  if (line.credit !== null) {
    line.credit = round2(line.credit - 0.01);
  } else if (line.debit !== null) {
    line.debit = round2(line.debit - 0.01);
  }
}

const buildRows = (): Row[] => {
  const rows: Row[] = [];
  let month = 0;

  const closeMonth = (): void => {
    if (month === 0) return;
    const reported = REPORTED.get(month) ?? { debit: 0, credit: 0 };
    rows.push({
      Date: "",
      "Transaction Type": "",
      "No.": "",
      "Memo/Description": `Total for ${MONTHS[month - 1]} 2025`,
      "Account No.": "",
      Account: "",
      Debit: money(round2(reported.debit), false),
      Credit: money(round2(reported.credit), false),
      "Created By": "",
      Created: "",
    });
  };

  const ordered = [...ENTRIES].sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    if (a.day !== b.day) return a.day - b.day;
    return Number(a.no) - Number(b.no);
  });

  for (const entry of ordered) {
    if (entry.month !== month) {
      closeMonth();
      month = entry.month;
    }

    entry.lines.forEach((line, index) => {
      const account = byCode.get(line.code) as Account;
      const padded = rng.bool(0.06);
      rows.push({
        Date: index === 0 ? usDate(entry.month, entry.day) : "",
        "Transaction Type": index === 0 ? entry.type : "",
        "No.": index === 0 ? entry.no : "",
        "Memo/Description": line.memo,
        "Account No.": padded ? `0${account.code}` : account.code,
        Account: account.name,
        Debit: line.debit === null ? "" : money(line.debit, true),
        Credit: line.credit === null ? "" : money(line.credit, true),
        "Created By": index === 0 ? entry.user : "",
        Created: index === 0 ? stamp(entry.month, entry.day) : "",
      });
    });
  }

  closeMonth();

  rows.push({
    Date: "",
    "Transaction Type": "",
    "No.": "",
    "Memo/Description": "TOTAL",
    "Account No.": "",
    Account: "",
    Debit: money(round2(reportedDebit), false),
    Credit: money(round2(reportedCredit), false),
    "Created By": "",
    Created: "",
  });

  return rows;
};

const PLAN = buildRows();

const column = (key: keyof Row) => {
  return custom((_rng, rowIndex) => {
    return (PLAN[rowIndex]?.[key] ?? null) as CellValue;
  });
};

export default defineFixture({
  name: "ashcombe-journal",
  sheets: [
    sheet("Journal", {
      rows: PLAN.length,
      seed: 41,
      columns: {
        Date: column("Date"),
        "Transaction Type": column("Transaction Type"),
        "No.": column("No."),
        "Memo/Description": column("Memo/Description"),
        "Account No.": column("Account No."),
        Account: column("Account"),
        Debit: column("Debit"),
        Credit: column("Credit"),
        "Created By": column("Created By"),
        Created: column("Created"),
      },
    }),
  ],
  outputs: ["csv"],
});
