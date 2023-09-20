import * as z from "zod";

// ? membuat validasi untuk thread
export const ThreadValidation = z.object({
  // ? thread berupa string
  // ? nonempety() = memastikan bahwa sebuah larik berisi setidaknya satu elemen
  // ? min(3) = minimal 3 karakter
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thread: z.string().nonempty().min(3, { message: "Minimum 3 characters." }),
});
