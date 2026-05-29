import { z } from "zod";

const nullableOptionalString = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    if (value === undefined || value === null) return null;

    const cleaned = value.trim();

    return cleaned.length > 0 ? cleaned : null;
  });

const optionalDateString = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    if (value === undefined || value === null) return null;

    const cleaned = value.trim();

    return cleaned.length > 0 ? cleaned : null;
  });

const numericOrder = z.coerce.number().int().default(0);

export const createElectionSchema = z.object({
  title: z.string().trim().min(2, "Election title is required"),
  description: nullableOptionalString,
  status: z.enum(["draft", "active", "closed"]).default("draft"),
  startsAt: optionalDateString,
  endsAt: optionalDateString,
  showResultsPublicly: z.boolean().default(false),
});

export const updateElectionSchema = createElectionSchema.partial().extend({
  id: z.string().uuid("Valid election id is required"),
});

export const createPositionSchema = z.object({
  electionId: z.string().uuid("Valid election id is required"),
  title: z.string().trim().min(2, "Position title is required"),
  description: nullableOptionalString,
  sortOrder: numericOrder,
});

export const updatePositionSchema = createPositionSchema.partial().extend({
  id: z.string().uuid("Valid position id is required"),
});

export const createCandidateSchema = z.object({
  electionId: z.string().uuid("Valid election id is required"),
  positionId: z.string().uuid("Valid position id is required"),
  name: z.string().trim().min(2, "Candidate name is required"),
  className: nullableOptionalString,
  photoUrl: nullableOptionalString,
  slogan: nullableOptionalString,
  manifesto: nullableOptionalString,
  isActive: z.boolean().default(true),
  sortOrder: numericOrder,
});

export const updateCandidateSchema = createCandidateSchema.partial().extend({
  id: z.string().uuid("Valid candidate id is required"),
});

export const createVoterSchema = z.object({
  electionId: z.string().uuid("Valid election id is required"),
  fullName: z.string().trim().min(2, "Full name is required"),
  admissionNumber: z
    .string()
    .trim()
    .min(1, "Admission number is required")
    .transform((value) => value.toUpperCase()),
  className: nullableOptionalString,
  voterCode: z
    .string()
    .trim()
    .min(2, "Voter code is required")
    .transform((value) => value.toUpperCase()),
  isActive: z.boolean().default(true),
});

export const updateVoterSchema = createVoterSchema.partial().extend({
  id: z.string().uuid("Valid voter id is required"),
});

export const verifyVoterSchema = z
  .object({
    electionId: z.string().uuid("Valid election id is required"),
    identifier: z
      .string()
      .optional()
      .transform((value) => value?.trim().toUpperCase()),
    voterCode: z
      .string()
      .optional()
      .transform((value) => value?.trim().toUpperCase()),
    admissionNumber: z
      .string()
      .optional()
      .transform((value) => value?.trim().toUpperCase()),
  })
  .refine(
    (data) =>
      Boolean(
        data.identifier?.trim() ||
          data.voterCode?.trim() ||
          data.admissionNumber?.trim()
      ),
    {
      message: "Admission number or voter code is required",
      path: ["identifier"],
    }
  );

export const submitVoteSchema = z
  .object({
    electionId: z.string().uuid("Valid election id is required"),
    identifier: z
      .string()
      .optional()
      .transform((value) => value?.trim().toUpperCase()),
    voterCode: z
      .string()
      .optional()
      .transform((value) => value?.trim().toUpperCase()),
    admissionNumber: z
      .string()
      .optional()
      .transform((value) => value?.trim().toUpperCase()),
    votes: z
      .array(
        z.object({
          positionId: z.string().uuid("Valid position id is required"),
          candidateId: z.string().uuid("Valid candidate id is required"),
        })
      )
      .min(1, "At least one vote is required"),
  })
  .refine(
    (data) =>
      Boolean(
        data.identifier?.trim() ||
          data.voterCode?.trim() ||
          data.admissionNumber?.trim()
      ),
    {
      message: "Admission number or voter code is required",
      path: ["identifier"],
    }
  );

export type CreateElectionInput = z.infer<typeof createElectionSchema>;
export type UpdateElectionInput = z.infer<typeof updateElectionSchema>;

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;

export type CreateVoterInput = z.infer<typeof createVoterSchema>;
export type UpdateVoterInput = z.infer<typeof updateVoterSchema>;

export type VerifyVoterInput = z.infer<typeof verifyVoterSchema>;
export type SubmitVoteInput = z.infer<typeof submitVoteSchema>;