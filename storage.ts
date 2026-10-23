export interface Book {
  id: string;
  title: string;
  author: string;
  status: "reading" | "finished" | "want";
  addedAt: number;
}

const STORAGE_KEY = "reading-list-books";

export function normalizeTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Book[];
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function isDuplicate(books: Book[], title: string): boolean {
  const normalized = normalizeTitle(title);
  return books.some((b) => normalizeTitle(b.title) === normalized);
}
