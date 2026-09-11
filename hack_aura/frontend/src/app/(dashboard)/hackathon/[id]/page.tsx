"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CallManager from "@/components/CallManager";
import { FlameArrowLeft, FlameArrowRight } from "@/components/icons";
import { Video, Mic, X, Share2, Trophy, Link as LinkIcon, Clock, AlertCircle, Users } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

interface Hackathon {
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
}

export default function HackathonDetail() {
  const params = useParams();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callState, setCallState] = useState({
    isCallActive: false,
    isScreenSharing: false,
    activeSpeakers: [] as number[],
    error: null as string | null
  });
  const [countdown, setCountdown] = useState<string>("");
  const callManagerRef = useRef<any>(null);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const { data, error } = await supabase
          .from("hackathons")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setHackathon(data);
        updateCountdown(data.submission_deadline);
      } catch (err) {
        console.error("Failed to load hackathon:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHackathon();
  }, [params.id]);

  // Update countdown every second
  useEffect(() => {
    if (!hackathon?.submission_deadline) return;

    const interval = setInterval(() => {
      updateCountdown(hackathon.submission_deadline);
    }, 1000);

    return () => clearInterval(interval);
  }, [hackathon?.submission_deadline]);

  const updateCountdown = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) {
      setCountdown("Deadline passed");
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      setCountdown(`${days}d ${hours}h ${minutes}m remaining`);
    } else if (hours > 0) {
      setCountdown(`${hours}h ${minutes}m ${seconds}s remaining`);
    } else if (minutes > 0) {
      setCountdown(`${minutes}m ${seconds}s remaining`);
    } else {
      setCountdown(`${seconds}s remaining`);
    }
  };

  const getDeadlineStatus = () => {
    if (!hackathon?.submission_deadline) return "text-gray-400";
    const deadline = new Date(hackathon.submission_deadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return "text-red-500";
    if (diff <= 3600000) return "text-red-500 animate-pulse"; // 1 hour or less
    if (diff <= 86400000) return "text-yellow-500"; // 24 hours or less
    return "text-green-400";
  };

  const handleStartCall = async (options: { video: boolean; audio: boolean; screen: boolean }) => {
    try {
      if (!callManagerRef.current) return;
      await callManagerRef.current.startCall(options);
      setCallState(prev => ({ ...prev, isCallActive: true, error: null }));
    } catch (err: any) {
      setCallState(prev => ({ ...prev, error: err.message || "Failed to start call" }));
    }
  };

  const handleEndCall = () => {
    if (callManagerRef.current) {
      callManagerRef.current.endCall();
      setCallState(prev => ({ 
        ...prev, 
        isCallActive: false, 
        isScreenSharing: false,
        error: null 
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-300">Hackathon not found</h2>
          <p className="text-gray-500 mt-2">The hackathon you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {hackathon.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span className={getDeadlineStatus()}>{countdown}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {hackathon.name}
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
            {hackathon.description}
          </p>
          <a 
            href={hackathon.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg shadow-purple-500/20"
          >
            <LinkIcon className="h-4 w-4" />
            View Official Page
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Information */}
          <div className="space-y-6">
            {/* Deadline Card */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${new Date(hackathon.submission_deadline).getTime() - new Date().getTime() < 3600000 ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                  <Clock className={`h-6 w-6 ${getDeadlineStatus().replace('text-', 'text-')}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Submission Deadline</h2>
                  <p className="text-sm text-gray-400">Final countdown</p>
                </div>
              </div>
              <p className="text-2xl font-mono font-bold mb-2">
                {new Date(hackathon.submission_deadline).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
              <p className="text-lg text-gray-400 mb-4">
                {new Date(hackathon.submission_deadline).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
              <div className={`bg-gray-900/50 p-4 rounded-lg border-l-4 ${new Date(hackathon.submission_deadline).getTime() - new Date().getTime() < 3600000 ? 'border-red-500' : 'border-blue-500'}`}>
                <p className="text-center text-xl font-semibold animate-pulse">
                  {countdown}
                </p>
              </div>
            </div>

            {/* Themes */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-xl backdrop-blur">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">#</span>
                </div>
                Themes
              </h2>
              <div className="flex flex-wrap gap-2">
                {hackathon.themes.map((theme) => (
                  <span 
                    key={theme} 
                    className="px-3 py-1.5 rounded-full text-sm bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Tracks */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-xl backdrop-blur">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-3 w-3 text-blue-400" />
                </div>
                Tracks
              </h2>
              <div className="space-y-2.5">
                {hackathon.tracks.map((track) => (
                  <div key={track} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-gray-200">{track}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prizes */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-xl backdrop-blur">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Prizes
              </h2>
              <div className="space-y-3">
                {hackathon.prizes.map((prize, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg">
                    <div className="flex flex-col items-center min-w-[24px]">
                      <span className="text-sm font-mono text-yellow-500 font-bold">#{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-200 font-medium">{prize}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Prize pool allocation</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call Status (if active) */}
            {callState.isCallActive && (
              <div className="bg-gray-800/50 p-4 rounded-xl border border-green-500/30 shadow-lg">
                <div className="flex items-center gap-2 text-green-400 mb-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium text-sm">Call active</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{activeSpeakers.length} video feeds</span>
                  <span>6 participant capacity</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - PPT Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-xl overflow-hidden backdrop-blur">
              {/* Viewer Header */}
              <div className="p-4 border-b border-gray-700/50 bg-gray-900/50 flex flex-wrap items-center gap-4 justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="h-5 w-5 rounded bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 text-xs font-bold">PPT</span>
                  </span>
                  Presentation Viewer
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {/* prev slide */}} 
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Previous Slide"
                    >
                      <FlameArrowLeft className="h-5 w-5 text-gray-300 hover:text-white" />
                    </button>
                    <span className="text-gray-400 font-mono text-sm w-16 text-center">1 / 15</span>
                    <button 
                      onClick={() => {/* next slide */}} 
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Next Slide"
                    >
                      <FlameArrowRight className="h-5 w-5 text-gray-300 hover:text-white" />
                    </button>
                  </button>
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-2">
                  {!callState.isCallActive ? (
                    <button 
                      onClick={() => handleStartCall({ video: true, audio: true, screen: false })}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all font-medium"
                    >
                      <Video className="h-4 w-4" />
                      <span className="text-sm">Join Call</span>
                    </button>
                  ) : (
                    <>
                      {!callState.isScreenSharing ? (
                        <button 
                          onClick={() => handleStartCall({ video: false, audio: true, screen: true })}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all"
                        >
                          <Share2 className="h-4 w-4" />
                          <span className="text-xs">Share Screen</span>
                        </button>
                      ) : null}
                      <button 
                        onClick={handleEndCall}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all font-medium"
                      >
                        <X className="h-4 w-4" />
                        <span className="text-sm">End Call</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Video Grid Area */}
              <div className="p-6 min-h-[450px] bg-gray-900/30">
                {callState.isScreenSharing ? (
                  <div className="w-full aspect-video bg-black/50 rounded-lg flex flex-col items-center justify-center border-2 border-gray-700/50">
                    <Share2 className="h-16 w-16 text-gray-600 mb-3" />
                    <p className="text-gray-400 font-medium">Screen sharing active</p>
                    <p className="text-gray-500 text-sm mt-1">Everyone can see your screen</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {Array.from({ length: 4 }, (_, i) => i + 1).map((position) => {
                        const speakerId = activeSpeakers[position - 1];
                        return (
                          <div 
                            key={position} 
                            className="aspect-video bg-gray-800/50 rounded-lg overflow-hidden relative group"
                          >
                            {speakerId ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800/30 to-gray-900/80">
                                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                  <span className="text-lg font-bold">{speakerId}</span>
                                </div>
                                <p className="text-sm text-gray-300 font-medium">Speaker {speakerId}</p>
                                <div className="flex gap-1 mt-2">
                                  <div className="h-1.5 w-8 bg-green-500/50 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-green-400 animate-sound-bar" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-gray-600 text-sm">
                                <Users className="h-6 w-6 mb-2 opacity-50" />
                                <p>Waiting for speaker</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Audio-only participants indicator */}
                    {callState.isCallActive && !callState.isScreenSharing && (
                      <div className="flex items-center justify-center gap-3 text-sm text-gray-400 bg-gray-800/30 py-3 rounded-lg border border-gray-700/30">
                        <div className="flex items-center gap-1.5">
                          <Mic className="h-3 w-3" />
                          <span className="text-xs">Audio-only participants:</span>
                        </div>
                        <span className="text-green-400 font-medium">2 active</span>
                      </div>
                    )}
                  </>
                )}

                {/* Error Message */}
                {callState.error && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-300 font-medium">Call Error</p>
                      <p className="text-sm text-red-400/70 mt-1">{callState.error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Manager Component */}
              <div className="hidden">
                {callState.isCallActive && (
                  <CallManager
                    teamId={1}
                    isInitiator={true}
                    onUserJoined={(id) => console.log(`User ${id} joined`)}
                    onUserLeft={(id) => console.log(`User ${id} left`)}
                    onActiveSpeakersChange={(speakers) => setCallState(prev => ({ ...prev, activeSpeakers: speakers }))}
                    onScreenShareStart={() => setCallState(prev => ({ ...prev, isScreenSharing: true }))}
                    onScreenShareStop={() => setCallState(prev => ({ ...prev, isScreenSharing: false }))}
                  />
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 text-center">
                <div className="text-2xl font-bold text-blue-400">2.5K+</div>
                <div className="text-xs text-gray-500 mt-1">Total Participants</div>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 text-center">
                <div className="text-2xl font-bold text-green-400">156</div>
                <div className="text-xs text-gray-500 mt-1">Active Teams</div>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 text-center">
                <div className="text-2xl font-bold text-purple-400">48h</div>
                <div className="text-xs text-gray-500 mt-1">Duration</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}