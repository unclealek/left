export type ExperienceReview = {
  id: string;
  host_user_id: string;
  venue_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  capacity: number;
  accessibility_notes: string;
  cost_notes: string;
  status: "pending_review";
  created_at: string;
  venues: { name: string } | null;
};
