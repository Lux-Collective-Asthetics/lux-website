import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 5 submissions per IP per hour
export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl:contact",
});

// 3 submissions per IP per hour
export const newsletterRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "rl:newsletter",
});
