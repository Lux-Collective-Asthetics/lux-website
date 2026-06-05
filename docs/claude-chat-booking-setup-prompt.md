# Context for Claude

I run The Lux Collective, a med spa in Newark, Ohio. I need help setting up online booking through FollowMyHealth (FMH) — the patient portal that comes with our Practice Fusion EHR.

---

## Where the website is right now

My developer (Claude Code) just finished updating the booking flow on my Next.js website. Here's what's live:

**Two-path booking component ("BookingCTA") is on every page:**
- **"Request an Appointment"** → sends the user to `/contact` (a form on my site) — works for new patients who don't have an FMH account yet
- **"Log In to Book"** → should open the FollowMyHealth self-scheduling portal — but right now it falls back to `/contact` because I haven't set the env variable yet

**The env variable that needs to be set:**
```
NEXT_PUBLIC_BOOKING_URL=<the FMH self-scheduling URL>
```
Once I set this in my Vercel project, "Log In to Book" will link directly to FMH. Everything else is already built.

**Services page** has a "How Booking Works" section explaining the 3-step flow:
1. Submit a request → 2. We confirm within 24 hrs → 3. You're all set

**The existing patient note** on that section says: *"Already a patient with a FollowMyHealth account? Self-schedule directly from the portal."* — this link also uses that same env variable.

---

## What I need help with

1. **How does a patient actually use FollowMyHealth to self-schedule?**
   Walk me through it step by step from the patient's perspective — what they see, what they need, what happens after they request an appointment.

2. **How do I enable and configure self-scheduling on the Practice Fusion / FMH admin side?**
   What settings do I need to turn on? What do I need to set up (appointment types, provider availability, etc.) before it's usable?

3. **Where do I find the self-scheduling URL to use as my `NEXT_PUBLIC_BOOKING_URL`?**
   Is it a generic FMH portal URL, or is there a practice-specific link I generate from the admin panel?

4. **What's the patient account creation flow?**
   How does a new patient get an FMH account in the first place? Do I invite them, does Practice Fusion do it automatically after their first visit, or can they self-register?

5. **Are there any gotchas or limitations I should know about?**
   E.g. does every provider need to be separately configured, are there appointment types that can't be self-scheduled, is there a confirmation step before it books, etc.

---

## My setup

- EHR: Practice Fusion
- Patient portal: FollowMyHealth (FMH) — confirmed patients must have an FMH account to self-schedule
- Website: hosted on Vercel, env vars set in Vercel project settings
- I am the practice owner / admin — I have full access to Practice Fusion admin settings

Please be specific and practical. I'm technically comfortable but new to the FMH admin side.
