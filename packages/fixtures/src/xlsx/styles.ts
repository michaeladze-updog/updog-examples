export const STYLE_GENERAL = 0;
export const STYLE_DATE = 1;

const DATE_FORMAT_ID = 164;
const FIRST_CUSTOM_FORMAT_ID = 165;
const FIRST_CUSTOM_STYLE = 2;

export class FormatTable {
  private readonly index = new Map<string, number>();
  private readonly order: string[] = [];

  styleFor(formatCode: string): number {
    const existing = this.index.get(formatCode);
    if (existing !== undefined) {
      return existing;
    }
    const style = FIRST_CUSTOM_STYLE + this.order.length;
    this.index.set(formatCode, style);
    this.order.push(formatCode);
    return style;
  }

  codes(): string[] {
    return [...this.order];
  }
}

export function stylesXml(formats: FormatTable = new FormatTable()): string {
  const codes = formats.codes();
  const numFmts = [
    `<numFmt numFmtId="${DATE_FORMAT_ID}" formatCode="yyyy-mm-dd"/>`,
    ...codes.map((code, offset) => {
      return `<numFmt numFmtId="${FIRST_CUSTOM_FORMAT_ID + offset}" formatCode="${code}"/>`;
    }),
  ];
  const cellXfs = [
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
    `<xf numFmtId="${DATE_FORMAT_ID}" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>`,
    ...codes.map((_code, offset) => {
      return `<xf numFmtId="${FIRST_CUSTOM_FORMAT_ID + offset}" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>`;
    }),
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    `<numFmts count="${numFmts.length}">${numFmts.join("")}</numFmts>`,
    '<fonts count="1"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>',
    '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>',
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>',
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>',
    `<cellXfs count="${cellXfs.length}">`,
    cellXfs.join(""),
    "</cellXfs>",
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>',
    "</styleSheet>",
  ].join("");
}
