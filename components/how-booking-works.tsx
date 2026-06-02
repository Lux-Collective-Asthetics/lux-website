import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Submit a Request",
    body: "Fill out our quick contact form with your name, preferred service, and a few available times.",
  },
  {
    number: "2",
    title: "We'll Confirm",
    body: "A member of our team will reach out within 24 hours to confirm your appointment details.",
  },
  {
    number: "3",
    title: "You're All Set",
    body: "You'll receive a confirmation and can manage future appointments through your FollowMyHealth patient portal.",
  },
];

export function HowBookingWorks({ bookingUrl }: { bookingUrl: string | null }) {
  const portalHref = bookingUrl ?? "/contact";
  const isExternal = Boolean(bookingUrl);

  return (
    <section aria-labelledby="how-booking-heading" className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <h2
          id="how-booking-heading"
          className="text-center text-3xl text-primary sm:text-4xl"
        >
          How Booking Works
        </h2>
        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blush">
                <span className="text-base font-bold text-accent">{step.number}</span>
              </div>
              <h3 className="mt-4 text-xl text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Already a patient with a FollowMyHealth account?{" "}
          <Link
            href={portalHref}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
          >
            Self-schedule directly from the portal
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
