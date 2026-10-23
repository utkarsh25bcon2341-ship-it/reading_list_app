export type ReadingStatus = "Want to Read" | "Reading" | "Finished";

export type Book = {
  id: string;
  title: string;
  status: ReadingStatus;
};

export const STATUS_OPTIONS: ReadingStatus[] = [
  "Want to Read",
  "Reading",
  "Finished",
];

export const STATUS_FILTERS: ("All" | ReadingStatus)[] = [
  "All",
  "Want to Read",
  "Reading",
  "Finished",
];

export const STATUS_COLORS: Record<ReadingStatus, string> = {
  "Want to Read": "var(--info)",
  Reading: "var(--warning)",
  Finished: "var(--success)",
};
