import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const noop = { limit: async () => ({ success: true }) };

const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = process.env;

function makeRatelimit(opts: { limiter: ReturnType<typeof Ratelimit.slidingWindow>; prefix: string }) {
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UPSTASH_REDIS_REST_URL is required in production");
    }
    return noop;
  }
  if (!token) throw new Error("UPSTASH_REDIS_REST_TOKEN is required when UPSTASH_REDIS_REST_URL is set");
  return new Ratelimit({ redis: new Redis({ url, token }), ...opts });
}

// 5 submissions per IP per hour
export const contactRateLimit = makeRatelimit({
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl:contact",
});

// 3 submissions per IP per hour
export const newsletterRateLimit = makeRatelimit({
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "rl:newsletter",
});
