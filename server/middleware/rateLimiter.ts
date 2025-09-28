import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { AuthRequest } from "middleware/auth";
import { Request } from "express";

export function getIpKey(req: Request): string {
   return ipKeyGenerator(req as any);
}

export const commentLimiter = rateLimit({
   windowMs: 60 * 1000, // 1 minute
   max: 5, // allow max 5 requests per window per user/IP
   message: "Too many comments, please try again later.",
   keyGenerator: (req: AuthRequest) => {
      if (req.user?.id) {
         return req.user.id;
      }
      return getIpKey(req);
   },
});
