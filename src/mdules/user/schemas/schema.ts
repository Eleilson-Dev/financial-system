import { z } from "zod";

export const userSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const userLoginSchema = userSchema.pick({ email: true, password: true });

export const userLoginResult = userSchema.omit({
  password: true,
});

export type TUserLoginResult = z.infer<typeof userLoginResult>;
