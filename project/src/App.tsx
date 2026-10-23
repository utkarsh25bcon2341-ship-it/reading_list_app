import { useCallback, useEffect, useState } from "react";
import type { Book, ReadingStatus } from "./types";
import { STATUS_FILTERS, STATUS_OPTIONS, STATUS_COLORS } from "./types";
import "./App.css";

const STORAGE_KEY = "reading-list-books";

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Book =>
        b &&
        typeof b.id === "string" &&
        typeof b.title === "string" &&
        STATUS_OPTIONS.includes(b.status)
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [books, setBooks] = useState<Book[]>(() => loadBooks());
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<"All" | ReadingStatus>("All");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const addBook = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = title.trim();
      if (!trimmed) return;
      const book: Book = {
        id: crypto.randomUUID(),
        title: trimmed,
        status: "Want to Read",
      };
      setBooks((prev) => [book, ...prev]);
      setTitle("");
    },
    [title]
  );

  const changeStatus = useCallback((id: string, status: ReadingStatus) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  }, []);

  const removeBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const visibleBooks =
    filter === "All" ? books : books.filter((b) => b.status === filter);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <h1 className="app__title">Reading List</h1>
          <p className="app__subtitle">
            Track the books you want to read, are reading, and have finished.
          </p>
        </div>
      </header>

      <main className="app__main">
        <form className="add-form" onSubmit={addBook}>
          <input
            className="add-form__input"
            type="text"
            placeholder="Enter a book title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Book title"
          />
          <button className="add-form__btn" type="submit">
            Add Book
          </button>
        </form>

        <div className="filters" role="tablist" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => {
            const active = filter === f;
            const count =
              f === "All" ? books.length : books.filter((b) => b.status === f).length;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={active}
                className={`filter-chip${active ? " filter-chip--active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
                <span className="filter-chip__count">{count}</span>
              </button>
            );
          })}
        </div>

        {visibleBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden="true">
              <BookIcon />
            </div>
            <p className="empty-state__text">
              Your reading list is empty. Add your first book.
            </p>
          </div>
        ) : (
          <ul className="book-grid">
            {visibleBooks.map((book) => (
              <li key={book.id} className="book-card">
                <div className="book-card__top">
                  <span
                    className="book-card__status-dot"
                    style={{ background: STATUS_COLORS[book.status] }}
                    aria-hidden="true"
                  />
                  <button
                    className="book-card__delete"
                    onClick={() => removeBook(book.id)}
                    aria-label={`Remove ${book.title}`}
                    title="Remove"
                  >
                    <TrashIcon />
                  </button>
                </div>

                <h2 className="book-card__title" title={book.title}>
                  {book.title}
                </h2>

                <div className="book-card__status-pill" style={{ color: STATUS_COLORS[book.status] }}>
                  {book.status}
                </div>

                <div className="book-card__status-buttons">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      className={`status-btn${
                        book.status === opt ? " status-btn--active" : ""
                      }`}
                      style={
                        book.status === opt
                          ? {
                              background: STATUS_COLORS[opt],
                              borderColor: STATUS_COLORS[opt],
                              color: "#fff",
                            }
                          : undefined
                      }
                      onClick={() => changeStatus(book.id, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="app__footer">
        <p>Your list is saved on this device only.</p>
      </footer>
    </div>
  );
}

function BookIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
