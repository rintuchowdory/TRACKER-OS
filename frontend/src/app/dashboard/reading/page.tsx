"use client";

import { useState } from "react";
import { BookOpen, Check, Plus, Trash2 } from "lucide-react";
import { Card, CardHeading, PageHeader, PageShell } from "@/components/layout";
import { SECTIONS } from "@/lib/sections";
import { useStoreValue } from "@/lib/use-store";
import { STORE_KEYS } from "@/lib/local-store";
import {
  addBook,
  bookProgress,
  finishBook,
  loadBooks,
  readingStats,
  removeBook,
  saveBooks,
  setProgress,
  startBook,
  type Book,
} from "@/lib/reading";

export default function ReadingPage() {
  const books = useStoreValue<Book[]>(STORE_KEYS.reading, []);
  const stats = readingStats(books);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    saveBooks(addBook(loadBooks(), title, author, parseInt(pages, 10)));
    setTitle("");
    setAuthor("");
    setPages("");
  }

  return (
    <PageShell>
      <PageHeader
        icon={SECTIONS.reading.icon}
        title={SECTIONS.reading.label}
        description={SECTIONS.reading.description}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent">{stats.finished}</div>
          <div className="mt-1 text-xs text-muted">finished</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent">{stats.reading}</div>
          <div className="mt-1 text-xs text-muted">reading now</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent">{stats.backlog}</div>
          <div className="mt-1 text-xs text-muted">on the shelf</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent">{stats.pagesRead.toLocaleString("de-DE")}</div>
          <div className="mt-1 text-xs text-muted">pages read</div>
        </Card>
      </div>

      <Card>
        <CardHeading icon={Plus}>Add a book</CardHeading>
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="min-w-40 flex-1 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            required
          />
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Author"
            className="w-40 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            value={pages}
            onChange={(event) => setPages(event.target.value)}
            type="number"
            min="1"
            placeholder="Pages"
            className="w-24 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Add
          </button>
        </form>
      </Card>

      {books.length === 0 ? (
        <Card className="text-center text-sm text-muted">
          Your shelf is empty. Add the book you keep meaning to start.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {books.map((book) => {
            const progress = bookProgress(book);
            return (
              <Card key={book.id}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-border text-accent">
                    <BookOpen size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      <span className="truncate">{book.title}</span>
                      {book.author && <span className="font-normal text-muted">· {book.author}</span>}
                      <span className="rounded-full bg-surface-border px-2 py-0.5 text-[11px] font-medium uppercase text-muted">
                        {book.status}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-surface-border">
                      <div className="h-2 rounded-full bg-accent" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs text-muted">
                      <span>
                        {book.pagesRead} / {book.pages} pages · {progress}%
                      </span>
                      <span className="flex items-center gap-2">
                        <label className="sr-only" htmlFor={`progress-${book.id}`}>
                          Pages read for {book.title}
                        </label>
                        <input
                          id={`progress-${book.id}`}
                          type="number"
                          min={book.pagesRead}
                          max={book.pages}
                          defaultValue=""
                          placeholder="p. read"
                          onBlur={(event) => {
                            const value = parseInt(event.target.value, 10);
                            if (!Number.isNaN(value)) {
                              saveBooks(setProgress(loadBooks(), book.id, value));
                              event.target.value = "";
                            }
                          }}
                          className="w-20 rounded-md border border-surface-border bg-background px-2 py-1 outline-none focus:border-accent"
                        />
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {book.status !== "finished" && (
                      <>
                        {book.status === "backlog" && (
                          <button
                            onClick={() => saveBooks(startBook(loadBooks(), book.id))}
                            className="rounded-md border border-surface-border px-2 py-1 text-xs transition hover:border-accent hover:text-accent"
                          >
                            Start
                          </button>
                        )}
                        <button
                          onClick={() => saveBooks(finishBook(loadBooks(), book.id))}
                          aria-label={`Mark ${book.title} as finished`}
                          className="rounded-md border border-surface-border p-1.5 transition hover:border-accent hover:text-accent"
                        >
                          <Check size={14} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => saveBooks(removeBook(loadBooks(), book.id))}
                      aria-label={`Delete book ${book.title}`}
                      className="text-muted transition hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
