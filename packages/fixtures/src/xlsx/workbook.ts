import { escapeAttr } from "./xml";

const FORBIDDEN = /[[\]:*?/\\]/g;

export function sheetName(raw: string, taken: Set<string>): string {
  const cleaned = raw.replace(FORBIDDEN, "_").slice(0, 31) || "Sheet";
  if (!taken.has(cleaned)) {
    taken.add(cleaned);
    return cleaned;
  }
  for (let suffix = 2; suffix < 1000; suffix++) {
    const marker = `~${suffix}`;
    const candidate = `${cleaned.slice(0, 31 - marker.length)}${marker}`;
    if (!taken.has(candidate)) {
      taken.add(candidate);
      return candidate;
    }
  }
  throw new Error(`Cannot find a free sheet name for "${raw}"`);
}

export function contentTypesXml(sheetCount: number): string {
  const overrides: string[] = [
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
    '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>',
  ];
  for (let index = 1; index <= sheetCount; index++) {
    overrides.push(
      `<Override PartName="/xl/worksheets/sheet${index}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    );
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${overrides.join("")}</Types>`;
}

export function rootRelsXml(): string {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
}

export function workbookXml(names: string[]): string {
  const sheets = names
    .map((name, index) => {
      return `<sheet name="${escapeAttr(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets}</sheets></workbook>`;
}

export function workbookRelsXml(sheetCount: number): string {
  const relationships: string[] = [];
  for (let index = 1; index <= sheetCount; index++) {
    relationships.push(
      `<Relationship Id="rId${index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index}.xml"/>`,
    );
  }
  relationships.push(
    `<Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`,
  );
  relationships.push(
    `<Relationship Id="rId${sheetCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>`,
  );
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationships.join("")}</Relationships>`;
}
