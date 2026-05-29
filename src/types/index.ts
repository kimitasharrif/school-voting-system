export type ElectionStatus = "draft" | "active" | "closed";

export type Election = {
  id: string;
  title: string;
  description: string | null;
  status: ElectionStatus;
  starts_at: string | null;
  ends_at: string | null;
  show_results_publicly: boolean;
  created_at: string;
  updated_at: string;
};

export type Position = {
  id: string;
  election_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type Candidate = {
  id: string;
  election_id: string;
  position_id: string;
  name: string;
  class_name: string | null;
  photo_url: string | null;
  slogan: string | null;
  manifesto: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Voter = {
  id: string;
  election_id: string;
  full_name: string;
  admission_number: string;
  class_name: string | null;
  voter_code: string;
  is_active: boolean;
  created_at: string;
};

export type VoteRecord = {
  id: string;
  election_id: string;
  position_id: string;
  candidate_id: string;
  voter_id: string;
  created_at: string;
};