import { z } from "zod";

export const feedbackSchema = z.object({
  rating: z
    .number()
    .min(1, "Please select a rating")
    .max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;
