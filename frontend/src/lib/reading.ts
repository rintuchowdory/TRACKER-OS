import { loadStore, saveStore, STORE_KEYS } from "./local-store";

export type BookStatus = "backlog" | "reading" | "finished";

export interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
  pagesRead: number;
  status: BookStatus;
  added: string;
}

export function loadBooks(): Book[] {
  return loadStore<Book[]>(STORE_KEYS.reading, []);
}

export function saveBooks(books: Book[]): void {
  saveStore(STORE_KEYS.reading, books);
}

export function addBook(books: Book[], title: string, author: string, pages: number): Book[] {
  const trimmed = title.trim();
  if (!trimmed) return books;
  const safePages = Number.isFinite(pages) && pages > 0 ? Math.floor(pages) : 0;
  return [
    ...books,
    {
      id: crypto.randomUUID(),
      title: trimmed,
      author: author.trim(),
      pages: safePages,
      pagesRead: 0,
      status: "backlog",
      added: new Date().toISOString().slice(0, 10),
    },
  ];
}

export function removeBook(books: Book[], id: string): Book[] {
  return books.filter((book) => book.id !== id);
}

export function startBook(books: Book[], id: string): Book[] {
  return books.map((book) =>
    book.id === id ? { ...book, status: "reading" } : book
  );
}

export function setProgress(books: Book[], id: string, pagesRead: number): Book[] {
  return books.map((book) => {
    if (book.id !== id) return book;
    const safe = Math.max(0, Math.min(book.pages, Math.floor(pagesRead) || 0));
    const finished = book.pages > 0 && safe >= book.pages;
    return {
      ...book,
      pagesRead: safe,
      status: finished ? "finished" : book.status === "backlog" ? "reading" : book.status,
    };
  });
}

export function finishBook(books: Book[], id: string): Book[] {
  return books.map((book) =>
    book.id === id ? { ...book, pagesRead: book.pages, status: "finished" } : book
  );
}

export interface ReadingStats {
  finished: number;
  reading: number;
  backlog: number;
  pagesRead: number;
}

export function readingStats(books: Book[]): ReadingStats {
  return {
    finished: books.filter((b) => b.status === "finished").length,
    reading: books.filter((b) => b.status === "reading").length,
    backlog: books.filter((b) => b.status === "backlog").length,
    pagesRead: books.reduce((sum, b) => sum + b.pagesRead, 0),
  };
}

export function bookProgress(book: Book): number {
  if (book.pages <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((book.pagesRead / book.pages) * 100)));
}
