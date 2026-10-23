import { useState, useEffect, useRef, useCallback } from "react";
import { Book, loadBooks, saveBooks, isDuplicate } from "./storage";

type Status = Book["status"];
type Filter = "all" | Status;

const STATUS_OPTIONS: Status[] = ["want", "reading", "finished"];
const STATUS_LABELS: Record<Status, string> = {
  want: "Want to Read",
  reading: "Reading",
  finished: "Finished",
};

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [titleInput, setTitleInput] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBooks(loadBooks());
  }, []);

  const showMessage = useCallback((text: string, type: "error" | "success") => {
    setMessage({ text, type });
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 4000);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = titleInput.trim();
    if (!trimmedTitle) {
      showMessage("Please enter a book title.", "error");
      return;
    }

    if (trimmedTitle.length > 60) {
      showMessage("Book title must be 60 characters or fewer.", "error");
      return;
    }

    if (isDuplicate(books, trimmedTitle)) {
      showMessage("This book is already in your reading list.", "error");
      return;
    }

    const newBook: Book = {
      id: crypto.randomUUID(),
      title: trimmedTitle.replace(/\s+/g, " "),
      author: authorInput.trim(),
      status: "want",
      addedAt: Date.now(),
    };

    const updated = [...books, newBook];
    setBooks(updated);
    saveBooks(updated);
    setTitleInput("");
    setAuthorInput("");
    showMessage(`"${newBook.title}" added to your list.`, "success");
  };

  const handleStatusChange = (id: string, status: Status) => {
    const updated = books.map((b) => (b.id === id ? { ...b, status } : b));
    setBooks(updated);
    saveBooks(updated);
  };

  const handleDelete = (id: string) => {
    const updated = books.filter((b) => b.id !== id);
    setBooks(updated);
    saveBooks(updated);
  };

  const filtered = filter === "all" ? books : books.filter((b) => b.status === filter);

  const counts = {
    all: books.length,
    want: books.filter((b) => b.status === "want").length,
    reading: books.filter((b) => b.status === "reading").length,
    finished: books.filter((b) => b.status === "finished").length,
  };

  const filterTabs: Filter[] = ["all", "want", "reading", "finished"];

  return (
    <div className="app">
      <header className="header">
        <h1>Reading List</h1>
        <p>Track the books you're reading, want to read, and have finished.</p>
      </header>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Book title"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          aria-label="Book title"
        />
        <input
          type="text"
          className="author-input"
          placeholder="Author (optional)"
          value={authorInput}
          onChange={(e) => setAuthorInput(e.target.value)}
          aria-label="Author"
        />
        <button type="submit">Add Book</button>
      </form>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      {books.length > 0 && (
        <div className="summary">
          <div className="summary-card">
            <span className="summary-value">{books.length}</span>
            <span className="summary-label">Total Books</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">{counts.reading}</span>
            <span className="summary-label">Currently Reading</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">{counts.finished}</span>
            <span className="summary-label">Finished</span>
          </div>
        </div>
      )}

      {books.length > 0 && (
        <div className="filters">
          {filterTabs.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : STATUS_LABELS[f]}
              <span className="filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="book-list">
          {filtered.map((book) => (
            <div key={book.id} className="book-item">
              <div className="book-info">
                <div className="book-title">{book.title}</div>
                {book.author && <div className="book-author">{book.author}</div>}
              </div>
              <div className="book-actions">
                <span className={`status-badge ${book.status}`}>{STATUS_LABELS[book.status]}</span>
                <select
                  className="status-select"
                  value={book.status}
                  onChange={(e) => handleStatusChange(book.id, e.target.value as Status)}
                  aria-label="Change status"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <button className="delete-btn" onClick={() => handleDelete(book.id)} aria-label="Remove book">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>{books.length === 0 ? "Your reading list is empty. Add your first book." : "No books in this category"}</h3>
          <p>{books.length === 0 ? "" : "Try a different filter."}</p>
        </div>
      )}
    </div>
  );
}
