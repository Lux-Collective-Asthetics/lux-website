"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Mail, X } from "lucide-react";

import { SubscribeForm } from "@/components/subscribe-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NewsletterDialogTriggerProps = {
  className?: string;
  children?: ReactNode;
  showIcon?: boolean;
};

export function NewsletterDialogTrigger({
  className,
  children = "Newsletter",
  showIcon = false,
}: NewsletterDialogTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      closeButtonRef.current?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn("transition-colors hover:text-foreground", className)}
      >
        {children}
        {showIcon ? <Mail className="size-3.5" /> : null}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-x-3 top-24 z-[100] mx-auto max-h-[calc(100dvh-7rem)] w-auto max-w-lg overflow-y-auto rounded-lg border border-border bg-background text-foreground shadow-2xl sm:inset-x-auto sm:right-6 sm:mx-0 sm:w-full"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-dialog-title"
            className="relative"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
                  Subscribe
                </p>
                <h2 id="newsletter-dialog-title" className="mt-2 text-4xl text-primary">
                  Stay in the loop.
                </h2>
              </div>
              <Button
                ref={closeButtonRef}
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close newsletter dialog"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="p-5">
              <p className="mb-5 text-sm text-muted-foreground">
                New services, seasonal specials, and wellness notes from The Lux. Turnstile confirms this is a real visitor before the email is saved.
              </p>
              <SubscribeForm />
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
