// API utilities for your hackathon platform
import { supabase } from "./supabase";

export const api = {
  // Hackathon API
  getHackathons: async () => {
    const { data, error } = await supabase
      .from("hackathons")
      .select("*")
      .order("submission_deadline", { ascending: true });
    return { data, error };
  },

  getHackathonById: async (id: string) => {
    const { data, error } = await supabase
      .from("hackathons")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // Team API
  getTeamById: async (teamId: string) => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();
    return { data, error };
  },

  getTeamMembers: async (teamId: string) => {
    const { data, error } = await supabase
      .from("team_members")
      .select("*, users(email, name, avatar_url)")
      .eq("team_id", teamId);
    return { data, error };
  },

  // Call API
  startCall: async (teamId: string) => {
    const { data, error } = await supabase
      .from("calls")
      .insert({ team_id: teamId })
      .select()
      .single();
    return { data, error };
  },

  endCall: async (callId: string) => {
    const { data, error } = await supabase
      .from("calls")
      .update({ 
        ended_at: new Date().toISOString(),
        duration_seconds: "EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER"
      })
      .eq("id", callId)
      .select()
      .single();
    return { data, error };
  },

  // Notification API
  getNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return { data, error };
  },

  markNotificationAsRead: async (notificationId: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .select()
      .single();
    return { data, error };
  },

  markAllNotificationsAsRead: async (userId: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);
    return { data, error };
  }
};