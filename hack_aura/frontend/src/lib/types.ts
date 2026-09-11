// TypeScript types for your hackathon platform

export interface Hackathon {
  id: string;
  name: string;
  description: string;
  organizer: string;
  website: string;
  submission_deadline: string;
  themes: string[];
  tracks: string[];
  prizes: string[];
  logo?: string;
  status: "upcoming" | "active" | "completed";
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  hackathon_id: string;
  created_by: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "leader" | "member";
  joined_at: string;
  users: {
    email: string;
    name: string;
    avatar_url?: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "deadline" | "update" | "general";
  read: boolean;
  created_at: string;
}

export interface CallSession {
  id: string;
  team_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  participants: number[];
}