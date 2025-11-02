import z from "zod";
export const PayloadImageSchema = z.object({
    width: z.number(),
    height: z.number(),
    source: z.string().url()
});

export type PayloadImage = z.infer<typeof PayloadImageSchema>;

export const ContentUrlsSchema = z.object({
  desktop: z.object({
    page: z.string(),
  }),
  mobile: z.object({
    page: z.string(),
  }),
});

export type ContentUrls = z.infer<typeof ContentUrlsSchema>;