"use client";

import { useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import { Card, CardHeading, PageHeader, PageShell } from "@/components/layout";
import { SECTIONS } from "@/lib/sections";
import { useStoreValue } from "@/lib/use-store";
import { STORE_KEYS } from "@/lib/local-store";
import {
  addContact,
  challengeProgress,
  countPerContact,
  engagedDays,
  last14Days,
  loadContacts,
  loadLog,
  logInteraction,
  removeContact,
  saveContacts,
  saveLog,
  todayISO,
  type Contact,
  type Interaction,
} from "@/lib/outreach";

export default function OutreachPage() {
  const contacts = useStoreValue<Contact[]>(STORE_KEYS.outreach, []);
  const log = useStoreValue<Interaction[]>(STORE_KEYS.outreachLog, []);
  const progress = challengeProgress(log);
  const counts = countPerContact(log);
  const days = engagedDays(log);
  const strip = last14Days(log);
  const loggedToday = days.includes(todayISO());

  const [name, setName] = useState("");
  const [channel, setChannel] = useState("LinkedIn");
  const [note, setNote] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    saveContacts(addContact(loadContacts(), name, channel, note));
    setName("");
    setNote("");
  }

  return (
    <PageShell>
      <PageHeader
        icon={SECTIONS.outreach.icon}
        title={SECTIONS.outreach.label}
        description={SECTIONS.outreach.description}
      />

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-bold text-accent">
              {progress.days} <span className="text-lg font-normal text-muted">/ {progress.goal} days</span>
            </div>
            <div className="mt-1 text-xs text-muted">
              {progress.days === 0
                ? "Engage with one person to start the challenge."
                : progress.remaining === 0
                  ? "Challenge complete. Powerful stuff."
                  : `${progress.remaining} days to go — consistency beats intensity.`}
            </div>
          </div>
          <button
            onClick={() => {
              if (contacts.length === 0) return;
              saveLog(logInteraction(loadLog(), contacts[0].id, todayISO(), "Quick daily touch"));
            }}
            disabled={contacts.length === 0 || loggedToday}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            <Send size={15} /> {loggedToday ? "Today logged" : "Log today"}
          </button>
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-surface-border">
          <div
            className="h-2.5 rounded-full bg-accent transition-all"
            style={{ width: `${Math.max(2, progress.ratio * 100)}%` }}
          />
        </div>
        <div className="mt-4 flex gap-1.5">
          {strip.map(({ date, done }) => (
            <div
              key={date}
              title={date}
              className={`h-6 flex-1 rounded-md ${done ? "bg-accent" : "bg-surface-border"}`}
            />
          ))}
        </div>
        <div className="mt-1.5 text-[11px] text-muted">last 14 days</div>
      </Card>

      <Card>
        <CardHeading icon={Plus}>Add a contact</CardHeading>
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            className="min-w-36 flex-1 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            required
          />
          <input
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            placeholder="Channel (LinkedIn, Email…)"
            className="w-44 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Why them? (optional)"
            className="w-56 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Add
          </button>
        </form>
      </Card>

      {contacts.length === 0 ? (
        <Card className="text-center text-sm text-muted">
          No contacts yet. Add people you want to stay systematically visible to.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <Card key={contact.id} className="flex flex-wrap items-center gap-3 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                {contact.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{contact.name}</div>
                <div className="truncate text-xs text-muted">
                  {contact.channel || "No channel"}
                  {contact.note ? ` · ${contact.note}` : ""} · {counts[contact.id] ?? 0} interactions
                </div>
              </div>
              <button
                onClick={() => saveLog(logInteraction(loadLog(), contact.id, todayISO(), "Logged from list"))}
                className="shrink-0 rounded-md border border-surface-border px-2.5 py-1 text-xs transition hover:border-accent hover:text-accent"
              >
                Log today
              </button>
              <button
                onClick={() => {
                  const next = removeContact(loadContacts(), loadLog(), contact.id);
                  saveContacts(next.contacts);
                  saveLog(next.log);
                }}
                aria-label={`Delete contact ${contact.name}`}
                className="shrink-0 text-muted transition hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
