"use client";

import { useState } from "react";
import { Plus, X, Mail, MousePointerClick, Users, Send } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { cn } from "@/lib/utils";
import type { NewsletterSend } from "@/lib/types/db";

type Props = {
  initialSends: NewsletterSend[];
  onCreate: (data: {
    campaign_name: string;
    subject: string;
    resend_broadcast_id: string;
    sent_at: string;
    recipient_count: number;
  }) => Promise<void>;
  onSend: (data: {
    subject: string;
    bodyHtml: string;
    scheduledAt?: string;
  }) => Promise<void>;
};

function TiptapToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  function setLink() {
    const prev = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor!.chain().focus().unsetLink().run();
      return;
    }
    editor!.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-border p-2">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
        className={cn("rounded px-2 py-1 text-sm font-bold", editor.isActive("bold") ? "bg-[#c9a96e] text-white" : "hover:bg-muted")}
      >B</button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
        className={cn("rounded px-2 py-1 text-sm italic", editor.isActive("italic") ? "bg-[#c9a96e] text-white" : "hover:bg-muted")}
      >I</button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); setLink(); }}
        className={cn("rounded px-2 py-1 text-sm", editor.isActive("link") ? "bg-[#c9a96e] text-white" : "hover:bg-muted")}
      >Link</button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
        className={cn("rounded px-2 py-1 text-sm", editor.isActive("bulletList") ? "bg-[#c9a96e] text-white" : "hover:bg-muted")}
      >• List</button>
    </div>
  );
}

export function NewslettersClient({ initialSends, onCreate, onSend }: Props) {
  const [sends, setSends] = useState(initialSends);

  // "Log Campaign" modal state (existing)
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [broadcastId, setBroadcastId] = useState("");
  const [sentAt, setSentAt] = useState("");
  const [recipients, setRecipients] = useState("");

  // "Send Newsletter" modal state (new)
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendSubject, setSendSubject] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "min-h-[200px] p-3 text-sm focus:outline-none prose prose-sm max-w-none",
      },
    },
  });

  function openRate(s: NewsletterSend) {
    if (!s.recipient_count) return "—";
    return `${((s.open_count / s.recipient_count) * 100).toFixed(1)}%`;
  }

  function clickRate(s: NewsletterSend) {
    if (!s.recipient_count) return "—";
    return `${((s.click_count / s.recipient_count) * 100).toFixed(1)}%`;
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !subject || !broadcastId) return;
    setSubmitting(true);
    setError(null);
    try {
      const recipientCount = parseInt(recipients, 10) || 0;
      await onCreate({
        campaign_name: name,
        subject,
        resend_broadcast_id: broadcastId,
        sent_at: sentAt,
        recipient_count: recipientCount,
      });
      setSends((prev) => [
        {
          id: crypto.randomUUID(),
          campaign_name: name,
          subject,
          resend_broadcast_id: broadcastId,
          sent_at: sentAt || null,
          recipient_count: recipientCount,
          open_count: 0,
          click_count: 0,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setShowForm(false);
      setName(""); setSubject(""); setBroadcastId(""); setSentAt(""); setRecipients("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const bodyHtml = editor?.getHTML() ?? "";
    if (!sendSubject.trim() || !bodyHtml.trim() || bodyHtml === "<p></p>") return;
    setSending(true);
    setSendError(null);
    try {
      const isoScheduled = scheduledAt
        ? new Date(scheduledAt).toISOString()
        : undefined;
      await onSend({ subject: sendSubject, bodyHtml, scheduledAt: isoScheduled });
      setSendSuccess(true);
      setSends((prev) => [
        {
          id: crypto.randomUUID(),
          campaign_name: sendSubject,
          subject: sendSubject,
          resend_broadcast_id: "pending",
          sent_at: isoScheduled ?? new Date().toISOString(),
          recipient_count: 0,
          open_count: 0,
          click_count: 0,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  function closeSendModal() {
    setShowSendModal(false);
    setSendSubject("");
    setScheduledAt("");
    setSendError(null);
    setSendSuccess(false);
    editor?.commands.clearContent();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Newsletters</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compose and send newsletters. Open/click counts update automatically via Resend webhook.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a]"
          >
            <Send className="size-4" /> Send Newsletter
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Plus className="size-4" /> Log Campaign
          </button>
        </div>
      </div>

      {sends.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <Mail className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-muted-foreground">No campaigns sent yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hit &quot;Send Newsletter&quot; to compose your first email.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campaign</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sent</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Users className="mr-1 inline size-3" />Recipients
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Mail className="mr-1 inline size-3" />Open Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MousePointerClick className="mr-1 inline size-3" />Click Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sends.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{s.campaign_name}</p>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">{s.subject}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.sent_at)}</td>
                  <td className="px-4 py-3 text-right font-medium">{s.recipient_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("font-medium", s.open_count > 0 ? "text-green-600" : "text-muted-foreground")}>
                      {openRate(s)}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">({s.open_count})</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("font-medium", s.click_count > 0 ? "text-blue-600" : "text-muted-foreground")}>
                      {clickRate(s)}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">({s.click_count})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Send Newsletter modal */}
      {showSendModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={closeSendModal}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-border bg-background p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Send Newsletter</h2>
              <button type="button" onClick={closeSendModal}>
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            {sendSuccess ? (
              <div className="py-8 text-center">
                <p className="text-lg font-medium text-green-600">
                  {scheduledAt ? "Newsletter scheduled!" : "Newsletter sent!"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  It will appear in the campaign list above.
                </p>
                <button
                  type="button"
                  onClick={closeSendModal}
                  className="mt-4 rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Subject Line</label>
                  <input
                    value={sendSubject}
                    onChange={(e) => setSendSubject(e.target.value)}
                    required
                    placeholder="Summer skincare tips from Lux..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Body</label>
                  <div className="rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-[#c9a96e]">
                    <TiptapToolbar editor={editor} />
                    <EditorContent editor={editor} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Schedule (optional — leave blank to send immediately)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Time is in your local timezone.</p>
                </div>

                {sendError && <p className="text-sm text-destructive">{sendError}</p>}

                <button
                  type="submit"
                  disabled={!sendSubject.trim() || sending}
                  className="w-full rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a] disabled:opacity-50"
                >
                  {sending ? "Sending..." : scheduledAt ? "Schedule Newsletter" : "Send Now"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Log Campaign modal (existing, unchanged logic) */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Log Campaign</h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Campaign Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="May 2026 Newsletter"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Subject Line</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Summer skincare tips from Lux..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Resend Broadcast ID</label>
                <input
                  value={broadcastId}
                  onChange={(e) => setBroadcastId(e.target.value)}
                  required
                  placeholder="broadcast_abc123..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                />
                <p className="mt-1 text-xs text-muted-foreground">Found in Resend dashboard → Broadcasts</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Sent At</label>
                  <input
                    type="date"
                    value={sentAt}
                    onChange={(e) => setSentAt(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Recipients</label>
                  <input
                    type="number"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={!name || !subject || !broadcastId || submitting}
                className="w-full rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8955a] disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Log Campaign"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
