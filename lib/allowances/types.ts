export type AllowanceId = string;

export type AllowanceListItem = {
  id: AllowanceId;
  name: string;
  target: string;
  note?: string;
};

export type AllowanceGroup = {
  title: string;
  items: AllowanceListItem[];
};

export type AllowanceTableColumn = {
  key: string;
  header: string;
  widthClassName?: string;
};

export type AllowanceTableRow = Record<string, string | number | null | undefined>;

export type AllowanceDefinition = {
  id: AllowanceId;
  title: string;
  summary?: string;
  lawRefs?: string[];
  columns: AllowanceTableColumn[];
  rows: AllowanceTableRow[];
  footnotes?: string[];
};