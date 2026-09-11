import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// WebRTC signaling channel helper
export const subscribeToWebRtcSignals = (teamId: number, callback: (payload: any) => void) => {
  return supabase
    .channel(`webrtc-signals:${teamId}`)
    .on("broadcast", { event: "webrtc-signal" }, callback)
    .subscribe();
};

// Get current user session
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};