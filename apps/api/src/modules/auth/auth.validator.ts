import { z } from "zod";

export const createSessionBodySchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
});

export type CreateSessionBody = z.infer<typeof createSessionBodySchema>;
