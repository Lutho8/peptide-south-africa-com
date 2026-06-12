import { z } from "zod";

export const INTEREST_OPTIONS = [
  { value: "weight-loss", label: "Weight Loss" },
  { value: "peptide-stacks", label: "Peptide Stacks" },
  { value: "biohacking", label: "Biohacking" },
  { value: "recovery", label: "Recovery" },
  { value: "longevity", label: "Longevity" },
  { value: "other", label: "Other" },
] as const;

export const INTEREST_VALUES = INTEREST_OPTIONS.map((o) => o.value) as [string, ...string[]];

export const communityJoinSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name too long"),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid WhatsApp number")
    .max(20, "Enter a valid WhatsApp number")
    .regex(/^\+[1-9]\d{6,18}$/, "Use international format, e.g. +27821234567"),
  country: z.string().trim().length(2).optional(),
  interest: z.enum(INTEREST_VALUES),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent is required to receive messages" }),
  }),
});

export type CommunityJoinPayload = z.infer<typeof communityJoinSchema>;
