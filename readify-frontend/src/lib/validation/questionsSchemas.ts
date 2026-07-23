import { z } from 'zod';

export const questionsSchema = z.object({
  booksRead: z.string().trim().max(1000, 'Keep it under 1000 characters').optional(),
  genres: z.array(z.string()),
  readerStatus: z.enum(['starting', 'active', 'returning'], {
    required_error: 'Please select one option',
  }),
  recentBookDuration: z
    .string()
    .trim()
    .max(100, 'Keep it under 100 characters')
    .optional(),
  recentBookPace: z.enum(['on_time', 'faster', 'slower'], {
    required_error: 'Please select one option',
  }).optional(),
  favoriteAuthors: z.string().trim().max(300, 'Keep it under 300 characters').optional(),
}).superRefine((values, context) => {
  if (values.readerStatus !== 'starting' && !values.recentBookDuration) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['recentBookDuration'],
      message: 'Let us know roughly how long it took',
    });
  }

  if (values.readerStatus !== 'starting' && !values.recentBookPace) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['recentBookPace'],
      message: 'Please select one option',
    });
  }
});

export type QuestionsSchema = z.infer<typeof questionsSchema>;