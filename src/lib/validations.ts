import { z } from "zod";

export const createElectionSchema = z.object({
  title: z.string().min(2, "Election title is required"),
  description: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "closed"]).default("draft"),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  showResultsPublicly: z.boolean().default(false),
});

export const updateElectionSchema = createElectionSchema.partial().extend({
  id: z.string().uuid(),
});

export const createPositionSchema = z.object({
  electionId: z.string().uuid(),
  title: z.string().min(2, "Position title is required"),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const updatePositionSchema = createPositionSchema.partial().extend({
  id: z.string().uuid(),
});

export const createCandidateSchema = z.object({
  electionId: z.string().uuid(),
  positionId: z.string().uuid(),
  name: z.string().min(2, "Candidate name is required"),
  className: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  slogan: z.string().optional().nullable(),
  manifesto: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateCandidateSchema = createCandidateSchema.partial().extend({
  id: z.string().uuid(),
});

export const createVoterSchema = z.object({
  electionId: z.string().uuid(),
  fullName: z.string().min(2, "Full name is required"),
  admissionNumber: z.string().min(1, "Admission number is required"),
  className: z.string().optional().nullable(),
  voterCode: z.string().min(2, "Voter code is required"),
  isActive: z.boolean().default(true),
});

export const updateVoterSchema = createVoterSchema.partial().extend({
  id: z.string().uuid(),
});

export const verifyVoterSchema = z.object({
  electionId: z.string().uuid(),
  voterCode: z.string().min(2, "Voter code is required"),
});

export const submitVoteSchema = z.object({
  electionId: z.string().uuid(),
  voterCode: z.string().min(2, "Voter code is required"),
  votes: z
    .array(
      z.object({
        positionId: z.string().uuid(),
        candidateId: z.string().uuid(),
      })
    )
    .min(1, "At least one vote is required"),
});