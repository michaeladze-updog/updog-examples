import type { Workbook } from "../model";
import { StringTable } from "./sharedStrings";
import { FormatTable, stylesXml } from "./styles";
import {
  contentTypesXml,
  rootRelsXml,
  sheetName,
  workbookRelsXml,
  workbookXml,
} from "./workbook";
import { worksheetXml } from "./worksheet";
import { zip } from "./zip";

export { sheetName };

export function toXlsx(workbook: Workbook): Uint8Array {
  if (workbook.sheets.length === 0) {
    throw new Error("A workbook needs at least one sheet");
  }

  const strings = new StringTable();
  const formats = new FormatTable();
  const taken = new Set<string>();
  const names: string[] = [];
  const files: Record<string, string> = {};

  workbook.sheets.forEach((sheet, index) => {
    names.push(sheetName(sheet.name, taken));
    files[`xl/worksheets/sheet${index + 1}.xml`] = worksheetXml(
      sheet,
      strings,
      formats,
    );
  });

  files["[Content_Types].xml"] = contentTypesXml(workbook.sheets.length);
  files["_rels/.rels"] = rootRelsXml();
  files["xl/workbook.xml"] = workbookXml(names);
  files["xl/_rels/workbook.xml.rels"] = workbookRelsXml(workbook.sheets.length);
  files["xl/styles.xml"] = stylesXml(formats);
  files["xl/sharedStrings.xml"] = strings.toXml();

  return zip(files);
}
