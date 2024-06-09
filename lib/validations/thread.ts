import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z.string().nonempty().min(3, {
    message: "Minimum 2 characters",
  }),
  accountId: z.string(),
});
