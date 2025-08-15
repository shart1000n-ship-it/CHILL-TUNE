"use client";


import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Room, RoomEvent, createLocalAudioTrack, createLocalVideoTrack, ConnectionState } from "livekit-client";
// If Socket.IO is disabled (e.g., on Vercel), we will use Supabase Realtime for chat
import io, { Socket } from "socket.io-client";
import { createClient } from "@supabase/supabase-js";
import { useSession, signIn, signOut } from "next-auth/react";
import { isAdminEmail } from "@/lib/admin";

type ChatMessage = {
  id: string;
  userName: string;
  userImage?: string | null;
  text?: string;
  emoji?: string;
  createdAt: number;
};

declare global { var __socket: Socket | undefined }

function getSocket(baseUrl: string): Socket {
  if (process.env.NEXT_PUBLIC_DISABLE_SOCKET_IO === "true") {
    throw new Error("Socket.IO disabled");
  }
  if (!globalThis.__socket) {
    globalThis.__socket = io(baseUrl, {
      autoConnect: true,
      path: "/api/socket-io",
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });
  }
  return globalThis.__socket;
}

export default function RadioClient() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Supabase Realtime client (fallback when Socket.IO is disabled)
  const supabase = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
    try {
      return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    } catch {
      return null;
    }
  }, []);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem("chatUsername") || "";
    } catch {
      return "";
    }
  });
  const [crossfader, setCrossfader] = useState<number>(50);
  const [micVolume, setMicVolume] = useState<number>(60);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [needUserGesture, setNeedUserGesture] = useState<boolean>(false);
  // Default to an R&B stream
  const [currentStreamIdx, setCurrentStreamIdx] = useState<number>(0);


  const [midiEnabled, setMidiEnabled] = useState<boolean>(false);
  const [midiStatus, setMidiStatus] = useState<string>("MIDI not enabled");
  const [midiInputs, setMidiInputs] = useState<any[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string>("");
  const selectedInputRef = useRef<any | null>(null);
  const [learnMode, setLearnMode] = useState<null | "crossfader" | "mic">(null);
  const [mapping, setMapping] = useState<{ crossfaderCC?: number; micCC?: number }>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem("djMidiMapping");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const isAdmin = useMemo(() => {
    const email = session?.user?.email ?? null;
    if (!email) return false;
    const lower = email.toLowerCase();
    if (lower === "admin@chillandtune.fm") return true; // hardcoded fallback
    const clientList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (clientList.length && clientList.includes(lower)) return true;
    return isAdminEmail(email);
  }, [session?.user?.email]);

  // Local live preview state (placeholders, not broadcasting to listeners yet)
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [exclusiveStream, setExclusiveStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const exclusiveAudioRef = useRef<HTMLAudioElement | null>(null);
  const exclusiveFileInputRef = useRef<HTMLInputElement | null>(null);
  const [podcastRecording, setPodcastRecording] = useState<boolean>(false);
  const podcastRecorderRef = useRef<MediaRecorder | null>(null);
  const podcastChunksRef = useRef<Blob[]>([]);
  const [podcastDownloadUrl, setPodcastDownloadUrl] = useState<string>("");
  const exclusiveTrackRef = useRef<MediaStreamTrack | null>(null);
  const [exclusiveTitle, setExclusiveTitle] = useState<string>("");
  const [exclusiveDurationSec, setExclusiveDurationSec] = useState<number | null>(null);
  const [exclusiveElapsedSec, setExclusiveElapsedSec] = useState<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const exclusiveBufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const exclusiveDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const exclusiveStartCtxTimeRef = useRef<number | null>(null);
  const exclusiveTickRef = useRef<number | null>(null);
  const [lkRoom, setLkRoom] = useState<Room | null>(null);
  const [lkState, setLkState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [lkListenRoom, setLkListenRoom] = useState<Room | null>(null);
  const [lkListenState, setLkListenState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [remoteAudioCount, setRemoteAudioCount] = useState<number>(0);
  const livekitHlsUrl = (process.env.NEXT_PUBLIC_LIVEKIT_HLS_URL || "").trim();
  const [onAirStartedAt, setOnAirStartedAt] = useState<number | null>(null);
  const [onAirElapsed, setOnAirElapsed] = useState<number>(0);
  const [hlsRequested, setHlsRequested] = useState<boolean>(false);

  // Optionally kick off HLS egress (stubbed API). If NEXT_PUBLIC_LIVEKIT_HLS_URL is set,
  // we simply rely on it; otherwise this call is a no-op with the current stub.
  async function startHlsIfConfigured() {
    if (hlsRequested) return;
    setHlsRequested(true);
    try {
      if (livekitHlsUrl) return; // already configured
      await fetch("/api/livekit-egress/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: "chillandtune" }),
      });
    } catch {}
  }

  useEffect(() => {
    const el = videoRef.current as (HTMLVideoElement & { srcObject?: MediaStream }) | null;
    if (!el) return;
    if (videoStream) {
      el.srcObject = videoStream as any;
    } else {
      el.srcObject = null as any;
    }
  }, [videoStream]);

  // Air time tracker
  useEffect(() => {
    const anyLive = !!micStream || !!videoStream || !!exclusiveStream;
    if (anyLive && !onAirStartedAt) setOnAirStartedAt(Date.now());
    if (!anyLive && onAirStartedAt) {
      setOnAirStartedAt(null);
      setOnAirElapsed(0);
    }
  }, [micStream, videoStream, exclusiveStream]);

  useEffect(() => {
    if (!onAirStartedAt) return;
    const id = setInterval(() => {
      setOnAirElapsed(Math.max(0, Math.floor((Date.now() - onAirStartedAt) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [onAirStartedAt]);

  async function startLiveAudio() {
    if (!isAdmin) return;
    await ensureLivekitRoom(true);
    try {
      const track = await createLocalAudioTrack();
      await lkRoom?.localParticipant.publishTrack(track);
      const stream = new MediaStream([track.mediaStreamTrack]);
      setMicStream(stream);
      void startHlsIfConfigured();
    } catch {}
  }

  function stopLiveAudio() {
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      setMicStream(null);
    }
    try { lkRoom?.localParticipant.setMicrophoneEnabled(false); } catch {}
  }

  async function startLiveVideo() {
    if (!isAdmin) return;
    await ensureLivekitRoom(true);
    try {
      const vtrack = await createLocalVideoTrack();
      await lkRoom?.localParticipant.publishTrack(vtrack);
      const stream = new MediaStream([vtrack.mediaStreamTrack]);
      setVideoStream(stream);
      void startHlsIfConfigured();
    } catch {}
  }

  function stopLiveVideo() {
    if (videoStream) {
      videoStream.getTracks().forEach((t) => t.stop());
      setVideoStream(null);
    }
    try { lkRoom?.localParticipant.setCameraEnabled(false); } catch {}
  }

  // Exclusive audio (upload and publish)
  async function startExclusiveFromFile(file: File) {
    if (!isAdmin) return;
    await ensureLivekitRoom(true);
    let usedFallback = false;
    try {
      const el = exclusiveAudioRef.current;
      if (!el) return;
      const url = URL.createObjectURL(file);
      el.src = url;
      try { el.load(); } catch {}
      // Capture duration from metadata
      const setFromMeta = () => {
        const d = Number.isFinite(el.duration) ? Math.round(el.duration) : NaN;
        if (!Number.isNaN(d)) setExclusiveDurationSec(d);
        el.onloadedmetadata = null;
      };
      if ((el as HTMLMediaElement).readyState >= 1) setFromMeta();
      else el.onloadedmetadata = setFromMeta;
      el.ontimeupdate = () => setExclusiveElapsedSec(Math.max(0, Math.floor(el.currentTime)));
      el.onended = () => {
        setExclusiveElapsedSec(exclusiveDurationSec ?? 0);
      };
      setExclusiveElapsedSec(0);
      await el.play();
      const stream: MediaStream | any = (el as any).captureStream ? (el as any).captureStream() : (el as any).mozCaptureStream?.();
      if (stream) {
        const [track] = stream.getAudioTracks();
        if (track) {
          try { await (lkRoom?.localParticipant as any)?.publishTrack(track); } catch {}
          exclusiveTrackRef.current = track;
          setExclusiveStream(stream);
          setExclusiveTitle(file.name);
          void startHlsIfConfigured();
          return;
        }
      }
      usedFallback = true;
    } catch {
      usedFallback = true;
    }
    if (usedFallback) {
      try {
        const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        try { await ctx.resume(); } catch {}
        const arr = await file.arrayBuffer();
        const buffer: AudioBuffer = await new Promise((resolve, reject) => {
          ctx.decodeAudioData(arr.slice(0), resolve, reject);
        });
        setExclusiveDurationSec(Math.round(buffer.duration));
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const dest = ctx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(ctx.destination);
        exclusiveStartCtxTimeRef.current = ctx.currentTime;
        setExclusiveElapsedSec(0);
        source.start(0);
        exclusiveBufferSourceRef.current = source;
        exclusiveDestRef.current = dest;
        const track = dest.stream.getAudioTracks()[0];
        if (track) {
          try { await (lkRoom?.localParticipant as any)?.publishTrack(track); } catch {}
          exclusiveTrackRef.current = track;
        }
        setExclusiveStream(dest.stream);
        setExclusiveTitle(file.name);
        void startHlsIfConfigured();
        if (exclusiveTickRef.current) {
          window.clearInterval(exclusiveTickRef.current);
          exclusiveTickRef.current = null;
        }
        exclusiveTickRef.current = window.setInterval(() => {
          if (!audioCtxRef.current || exclusiveStartCtxTimeRef.current == null) return;
          const elapsed = Math.max(0, Math.floor(audioCtxRef.current.currentTime - exclusiveStartCtxTimeRef.current));
          setExclusiveElapsedSec(elapsed);
        }, 250) as unknown as number;
        source.onended = () => {
          if (exclusiveTickRef.current) {
            window.clearInterval(exclusiveTickRef.current);
            exclusiveTickRef.current = null;
          }
          setExclusiveElapsedSec(exclusiveDurationSec ?? 0);
        };
      } catch {}
    }
  }

  function stopExclusive() {
    const el = exclusiveAudioRef.current;
    try { if (el) { el.pause(); el.src = ""; } } catch {}
    if (exclusiveAudioRef.current) {
      exclusiveAudioRef.current.ontimeupdate = null;
      exclusiveAudioRef.current.onended = null;
    }
    if (exclusiveStream) {
      exclusiveStream.getTracks().forEach((t) => t.stop());
      setExclusiveStream(null);
    }
    if (exclusiveTrackRef.current) {
      try { (lkRoom?.localParticipant as any)?.unpublishTrack(exclusiveTrackRef.current); } catch {}
      exclusiveTrackRef.current = null;
    }
    try { exclusiveBufferSourceRef.current?.stop(); } catch {}
    exclusiveBufferSourceRef.current = null;
    exclusiveDestRef.current = null;
    if (exclusiveTickRef.current) {
      window.clearInterval(exclusiveTickRef.current);
      exclusiveTickRef.current = null;
    }
    setExclusiveTitle("");
    setExclusiveDurationSec(null);
    setExclusiveElapsedSec(0);
  }

  function onChooseExclusive() {
    if (!isAdmin) return;
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch {}
    }
    try { audioCtxRef.current?.resume(); } catch {}
    exclusiveFileInputRef.current?.click();
  }

  function formatHMS(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function togglePodcast() {
    if (!isAdmin) return;
    if (!podcastRecording) {
      const tracks: MediaStreamTrack[] = [];
      if (micStream) tracks.push(...micStream.getAudioTracks());
      if (exclusiveStream) tracks.push(...exclusiveStream.getAudioTracks());
      if (videoStream) tracks.push(...videoStream.getVideoTracks());
      if (tracks.length === 0) return;
      const combined = new MediaStream(tracks);
      const hasVideo = combined.getVideoTracks().length > 0;
      const mime = hasVideo ? "video/webm;codecs=vp9,opus" : "audio/webm;codecs=opus";
      let rec: MediaRecorder;
      try {
        rec = new MediaRecorder(combined, { mimeType: mime });
      } catch {
        rec = new MediaRecorder(combined);
      }
      podcastChunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) podcastChunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(podcastChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setPodcastDownloadUrl(url);
        setPodcastRecording(false);
      };
      podcastRecorderRef.current = rec;
      rec.start(1000);
      setPodcastRecording(true);
    } else {
      try { podcastRecorderRef.current?.stop(); } catch {}
    }
  }

  async function ensureLivekitRoom(publish: boolean) {
    if (lkRoom && lkState === ConnectionState.Connected) return;
    const identity = session?.user?.email || "dj";
    try {
      const res = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: "chillandtune", identity, publish })
      });
      if (!res.ok) return;
      const { token, url } = await res.json();
      const room = new Room();
      room.on(RoomEvent.ConnectionStateChanged, (s: ConnectionState) => setLkState(s));
      await room.connect(url, token);
      setLkRoom(room);
    } catch {}
  }

  // Listener room: subscribe-only connection for all users
  async function ensureListenerRoom() {
    if (lkListenRoom && lkListenState === ConnectionState.Connected) return;
    try {
      const identity = session?.user?.email || `listener-${Math.random().toString(36).slice(2, 8)}`;
      const res = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: "chillandtune", identity, publish: false })
      });
      if (!res.ok) return;
      const { token, url } = await res.json();
      const room = new Room();
      room.on(RoomEvent.ConnectionStateChanged, (s: ConnectionState) => setLkListenState(s));

      // Track events: auto-switch main player to remote audio when available
      const onTrackSubscribed = (track: any) => {
        if (!audioRef.current) return;
        if (track?.kind === "audio") {
          try {
            const el = audioRef.current;
            try { el.pause(); } catch {}
            try { (el as any).srcObject = null; } catch {}
            if (livekitHlsUrl) {
              // Prefer HLS if provided
              try { el.src = livekitHlsUrl; } catch {}
            } else {
              // Fallback to direct WebRTC track
              try { el.src = ""; } catch {}
              try { track.attach(el); } catch {}
            }
            setRemoteAudioCount((c) => c + 1);
            el.muted = false;
            el.play().catch(() => setNeedUserGesture(true));
          } catch {}
        }
      };
      const onTrackUnsubscribed = (track: any) => {
        if (!audioRef.current) return;
        if (track?.kind === "audio") {
          try {
            track.detach(audioRef.current);
          } catch {}
          setRemoteAudioCount((c) => Math.max(0, c - 1));
        }
      };

      room.on(RoomEvent.TrackSubscribed, onTrackSubscribed as any);
      room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed as any);

      await room.connect(url, token);
      setLkListenRoom(room);
    } catch {}
  }

  useEffect(() => {
    return () => {
      try { lkRoom?.disconnect(); } catch {}
    };
  }, [lkRoom]);

  useEffect(() => {
    // Connect listener room on mount
    void ensureListenerRoom();
    return () => {
      try { lkListenRoom?.disconnect(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When no remote audio remains, restore PowerHitz stream
  useEffect(() => {
    if (remoteAudioCount > 0) return;
    const el = audioRef.current;
    if (!el) return;
    try {
      // Detach any previous srcObject and re-apply station URL
      (el as any).srcObject = null;
      try { el.src = ""; } catch {}
      setStreamByIndex(currentStreamIdx);
      el.play().catch(() => setNeedUserGesture(true));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteAudioCount]);

  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  
  // Simple weekly schedule (local times)
  const schedule = useMemo(
    () => [
      { title: "Midnight Vibes", days: "Daily", time: "12:00 AM – 3:00 AM" },
      { title: "Early Grind", days: "Daily", time: "3:00 AM – 6:00 AM" },
      { title: "Morning Flow", days: "Mon–Fri", time: "6:00 AM – 10:00 AM" },
      { title: "Midday Mix", days: "Daily", time: "10:00 AM – 2:00 PM" },
      { title: "Afternoon Chill", days: "Daily", time: "2:00 PM – 4:00 PM" },
      { title: "Drive‑Time Heat", days: "Daily", time: "4:00 PM – 7:00 PM" },
      { title: "Evening Blend", days: "Daily", time: "7:00 PM – 10:00 PM" },
      { title: "Late Night R&B", days: "Daily", time: "10:00 PM – 1:00 AM" },
      { title: "After Hours", days: "Daily", time: "1:00 AM – 3:00 AM" },
    ],
    []
  );

  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const streamCandidates = useMemo(
    () => [
      { label: "PowerHitz (Pure R&B)", url: "https://ais-sa2.cdnstream1.com/1984_128.mp3" },
    ],
    []
  );

  const setStreamByIndex = useCallback((nextIndex: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const idx = ((nextIndex % streamCandidates.length) + streamCandidates.length) % streamCandidates.length;
    const chosen = streamCandidates[idx];
    audio.src = chosen.url;
    setCurrentStreamIdx(idx);
  }, [streamCandidates]);

  useEffect(() => {
    if (!baseUrl) return;
    if (process.env.NEXT_PUBLIC_DISABLE_SOCKET_IO === "true" && supabase) {
      const channel = supabase.channel("radio_chat");
      channel.on("broadcast", { event: "chat:message" }, (payload) => {
        const m = payload.payload as ChatMessage;
        setMessages((prev) => [...prev, m]);
      }).subscribe((status) => { setConnected(status === "SUBSCRIBED"); });
      return () => { try { supabase.removeChannel(channel); } catch {} };
    } else {
      // Ensure the server-side Socket.IO instance is initialized
      fetch("/api/socket-io").catch(() => {});
      const socket = getSocket(baseUrl);
      const onConnect = () => setConnected(true);
      const onDisconnect = () => setConnected(false);
      const onMessage = (m: ChatMessage) => setMessages((prev) => [...prev, m]);
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("chat:message", onMessage);
      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("chat:message", onMessage);
      };
    }
  }, [baseUrl, supabase]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    const onError = () => {
      // Try next candidate stream
      setStreamByIndex(currentStreamIdx + 1);
      audio.play().catch(() => setNeedUserGesture(true));
    };
    audio.addEventListener("error", onError as any);
    const tryPlay = async () => {
      try {
        await audio.play();
        setNeedUserGesture(false);
      } catch {
        setNeedUserGesture(true);
      }
    };
    // Initialize source and try autoplay
    setStreamByIndex(currentStreamIdx);
    void tryPlay();
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError as any);
    };
  }, [currentStreamIdx, setStreamByIndex]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setNeedUserGesture(true));
    } else {
      audio.pause();
    }
  }

  async function handleAdminSignIn() {
    try {
      setAuthError("");
      setAuthLoading(true);
      const res = await signIn("credentials", {
        redirect: false,
        email: adminEmail.trim(),
        password: adminPassword,
      });
      if (res?.error) setAuthError("Invalid email or password");
    } catch {
      setAuthError("Login failed");
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (username) window.localStorage.setItem("chatUsername", username);
    } catch {}
  }, [username]);

  // Persist mapping locally
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("djMidiMapping", JSON.stringify(mapping));
    } catch {}
  }, [mapping]);

  // MIDI setup and listeners
  async function enableMIDI() {
    try {
      if (!("requestMIDIAccess" in navigator)) {
        setMidiStatus("Web MIDI not supported in this browser");
        return;
      }
      const access = await (navigator as any).requestMIDIAccess({ sysex: false });
      const inputs = Array.from(access.inputs.values());
      setMidiInputs(inputs);
      setMidiEnabled(true);
      setMidiStatus(inputs.length ? "Choose a MIDI input" : "No MIDI inputs detected");

      access.onstatechange = () => {
        const updated = Array.from(access.inputs.values());
        setMidiInputs(updated);
      };
    } catch {
      setMidiStatus("Failed to enable MIDI");
    }
  }

  useEffect(() => {
    // Attach handler to selected input
    if (!midiEnabled) return;
    const input = midiInputs.find((i) => i.id === selectedInputId) || null;
    selectedInputRef.current = input || null;
    if (!input) return;

    const onMessage = (e: any) => {
      const data: number[] = Array.from(e.data || []);
      if (data.length < 3) return;
      const [status, controller, value] = data;
      const isCC = (status & 0xf0) === 0xb0; // MIDI Control Change
      if (!isCC) return;

      if (learnMode === "crossfader") {
        setMapping((m) => ({ ...m, crossfaderCC: controller }));
        setLearnMode(null);
      } else if (learnMode === "mic") {
        setMapping((m) => ({ ...m, micCC: controller }));
        setLearnMode(null);
      }

      if (mapping.crossfaderCC === controller) {
        const v = Math.max(0, Math.min(127, value));
        const percent = Math.round((v / 127) * 100);
        setCrossfader(percent);
      } else if (mapping.micCC === controller) {
        const v = Math.max(0, Math.min(127, value));
        const percent = Math.round((v / 127) * 100);
        setMicVolume(percent);
      }
    };

    input.onmidimessage = onMessage;
    return () => {
      if (input) input.onmidimessage = null;
    };
  }, [midiEnabled, midiInputs, selectedInputId, learnMode, mapping.crossfaderCC, mapping.micCC]);

  function sendMessage() {
    if (!input.trim()) return;
    const name = username || session?.user?.name || "Guest";
    if (process.env.NEXT_PUBLIC_DISABLE_SOCKET_IO === "true" && supabase) {
      const m: ChatMessage = { id: `${Date.now()}`, userName: name, text: input.trim(), createdAt: Date.now() };
      supabase.channel("radio_chat").send({ type: "broadcast", event: "chat:message", payload: m });
    } else {
      const socket = getSocket(baseUrl);
      socket.emit("chat:send", { text: input.trim(), name });
    }
    setInput("");
  }

  function sendEmoji(emoji: string) {
    const name = username || session?.user?.name || "Guest";
    if (process.env.NEXT_PUBLIC_DISABLE_SOCKET_IO === "true" && supabase) {
      const m: ChatMessage = { id: `${Date.now()}`, userName: name, emoji, createdAt: Date.now() } as any;
      supabase.channel("radio_chat").send({ type: "broadcast", event: "chat:message", payload: m });
    } else {
      const socket = getSocket(baseUrl);
      socket.emit("chat:send", { emoji, name });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
      <div className="lg:col-span-2 space-y-4">
        <div className="w-full rounded-md overflow-hidden border border-white/20 p-4 bg-purple-800/60">
          <div className="flex flex-wrap items-center gap-4">
            <button className="px-4 py-2 border border-white/40 rounded text-white hover:bg-white/10" onClick={togglePlay}>
              {isPlaying ? "Pause" : "Play"}
            </button>
            <label className="text-sm text-white">Volume</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              defaultValue={1}
              onChange={(e) => {
                if (audioRef.current) audioRef.current.volume = Number(e.target.value);
              }}
            />
            <span className="text-xs text-white/80">24/7 Hip-Hop & R&B</span>
            {/* Now playing text removed per request */}
          </div>
          {needUserGesture ? (
            <div className="mt-2 text-xs text-yellow-200">Autoplay blocked by browser. Click Play to start.</div>
          ) : null}
          <audio ref={audioRef} preload="none" />
        </div>

        {
          <div className="border border-white/20 rounded-md p-4 bg-purple-800/60">
            <h2 className="font-semibold mb-2 text-white">DJ Console</h2>
            {isAdmin ? (
              <div className="text-xs text-white/90 mb-2">On Air: {onAirStartedAt ? formatHMS(onAirElapsed) : "Off Air"}</div>
            ) : null}
            <p className="text-sm text-white/90 mb-4">
              Mic volume and crossfader controls are placeholders. Wire to your live encoder/SDK.
            </p>
            <div className="mb-4 border border-white/20 rounded p-3 bg-purple-900/40">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button className="px-3 py-1 border border-white/40 rounded text-white hover:bg-white/10" onClick={enableMIDI} disabled={midiEnabled}>
                  {midiEnabled ? "MIDI Enabled" : "Enable MIDI"}
                </button>
                <select
                  className="border border-white/40 rounded px-2 py-1 bg-transparent text-white"
                  value={selectedInputId}
                  onChange={(e) => setSelectedInputId(e.target.value)}
                  disabled={!midiEnabled}
                >
                  <option value="">Select MIDI input…</option>
                  {midiInputs.map((inp) => (
                    <option key={inp.id} value={inp.id}>
                      {inp.name || inp.manufacturer || inp.id}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-white/80">{midiStatus}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="px-2 py-1 border border-white/40 rounded text-white hover:bg-white/10" onClick={() => setLearnMode("crossfader")} disabled={!midiEnabled || !isAdmin}>
                  {learnMode === "crossfader" ? "Move a control…" : `MIDI Learn: Crossfader${mapping.crossfaderCC !== undefined ? ` (CC ${mapping.crossfaderCC})` : ""}`}
                </button>
                <button className="px-2 py-1 border border-white/40 rounded text-white hover:bg-white/10" onClick={() => setLearnMode("mic")} disabled={!midiEnabled || !isAdmin}>
                  {learnMode === "mic" ? "Move a control…" : `MIDI Learn: Mic Volume${mapping.micCC !== undefined ? ` (CC ${mapping.micCC})` : ""}`}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white">Mic Volume</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={micVolume}
                  onChange={(e) => setMicVolume(Number(e.target.value))}
                  className="w-full"
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">Crossfader</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={crossfader}
                  onChange={(e) => setCrossfader(Number(e.target.value))}
                  className="w-full"
                  disabled={!isAdmin}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 items-center flex-wrap">
              <button
                className="px-3 py-2 border border-white/40 rounded text-white hover:bg-white/10 disabled:opacity-50"
                onClick={() => (micStream ? stopLiveAudio() : startLiveAudio())}
                disabled={!isAdmin}
              >
                {micStream ? "Audio Live (ON)" : "Go Live (Audio)"}
              </button>
              <button
                className="px-3 py-2 border border-white/40 rounded text-white hover:bg-white/10 disabled:opacity-50"
                onClick={() => (videoStream ? stopLiveVideo() : startLiveVideo())}
                disabled={!isAdmin}
              >
                {videoStream ? "Video Live (ON)" : "Go Live (Video)"}
              </button>
              <button
                className="px-3 py-2 border border-white/40 rounded text-white hover:bg-white/10 disabled:opacity-50"
                onClick={() => {
                  stopLiveAudio();
                  stopLiveVideo();
                }}
                disabled={!isAdmin || (!micStream && !videoStream)}
              >
                Stop
              </button>
              <button className="px-3 py-2 border border-white/40 rounded text-white hover:bg-white/10 disabled:opacity-50" onClick={() => (exclusiveStream ? stopExclusive() : onChooseExclusive())} disabled={!isAdmin}>
                {exclusiveStream ? "Stop Exclusive" : "Play Exclusive"}
              </button>
              <button className="px-3 py-2 border border-white/40 rounded text-white hover:bg-white/10 disabled:opacity-50" onClick={togglePodcast} disabled={!isAdmin}>
                {podcastRecording ? "Stop Podcast" : "Start Podcast"}
              </button>
            </div>
            {/* Removed local-only notice; listeners auto-switch to On Air via LiveKit */}
            {exclusiveStream && exclusiveTitle ? (
              <div className="mt-2 text-xs text-white/90">
                Exclusive playing: <span className="font-medium">{exclusiveTitle}</span>
                <span className="ml-2 text-white/70">
                  ({formatHMS(exclusiveElapsedSec)}
                  {exclusiveDurationSec != null ? ` / ${formatHMS(exclusiveDurationSec)}` : ""})
                </span>
              </div>
            ) : null}
            {podcastDownloadUrl ? (
              <div className="mt-2 text-xs">
                <a href={podcastDownloadUrl} download={videoStream ? "podcast.webm" : "podcast_audio.webm"} className="underline">Download podcast recording</a>
              </div>
            ) : null}
            {videoStream ? (
              <div className="mt-3">
                <video ref={videoRef} className="w-full max-w-sm rounded border border-white/20" autoPlay playsInline muted />
              </div>
            ) : null}
            {/* Hidden elements for exclusive playback */}
            <audio ref={exclusiveAudioRef} hidden />
            <input ref={exclusiveFileInputRef} type="file" accept="audio/*" hidden onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void startExclusiveFromFile(f);
              // reset input for subsequent selections
              if (exclusiveFileInputRef.current) exclusiveFileInputRef.current.value = "";
            }} />
            {!isAdmin ? (
              <div className="text-xs text-white/90 mt-2">Controls are view-only. Add your email to <code>ADMIN_EMAILS</code> or <code>NEXT_PUBLIC_ADMIN_EMAILS</code> and sign in to enable.</div>
            ) : null}

            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-white mb-2">Admin Login</h3>
              {session?.user ? (
                <div className="flex items-center justify-between text-sm text-white/90">
                  <span>Signed in as {session.user.email}</span>
                  <button className="px-3 py-2 border border-white/40 rounded text-white hover:bg-white/10" onClick={() => signOut({ redirect: false })}>Sign out</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                  <input
                    type="email"
                    placeholder="Admin email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="border border-white/40 rounded px-2 py-2 bg-transparent text-white placeholder:text-white/60"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="border border-white/40 rounded px-2 py-2 bg-transparent text-white placeholder:text-white/60"
                  />
                  <button className="px-3 py-2 border border-white/40 rounded text-white hover:bg-white/10" onClick={handleAdminSignIn} disabled={authLoading}>
                    {authLoading ? "Signing in…" : "Sign in"}
                  </button>
                  {authError ? <div className="sm:col-span-3 text-xs text-yellow-200">{authError}</div> : null}
                </div>
              )}
            </div>
          </div>
        }
      </div>

      <div className="border border-white/20 rounded-md p-4 bg-purple-800/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Live Chat</h2>
          <span className={`text-xs ${connected ? "text-green-300" : "text-white/60"}`}>
            {connected ? "Connected" : "Offline"}
          </span>
        </div>
        <div className="h-80 overflow-y-auto space-y-2 mb-3 border border-white/20 rounded p-2 bg-purple-900/40 text-white">
          {messages.map((m) => (
            <div key={m.id} className="text-sm text-white">
              <span className="font-medium">{m.userName}</span>: {m.text}
              {m.emoji ? <span className="ml-2 text-xl">{m.emoji}</span> : null}
            </div>
          ))}
        </div>
        {!username ? (
          <div className="flex gap-2 mb-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 border border-white/40 rounded px-2 py-2 bg-transparent text-white placeholder:text-white/60"
              placeholder="Choose a username to join chat"
            />
            <button className="px-3 py-2 border border-white/40 rounded text-white hover:bg-white/10" onClick={() => setUsername(username.trim())}>
              Join
            </button>
          </div>
        ) : (
          <div className="text-xs text-white/80 mb-2">Chatting as <span className="font-medium">{username}</span></div>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-white/40 rounded px-2 py-2 bg-transparent text-white placeholder:text-white/60"
            placeholder="Type a message..."
          />
          <button className="px-3 py-2 border border-white/40 rounded text-white hover:bg-white/10" onClick={sendMessage}>
            Send
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          {["😀","😎","🔥","💯","🎶","❤️","🙌","🎧","✨","🥳"].map((e) => (
            <button key={e} className="px-2 py-1 border border-white/40 rounded text-white hover:bg-white/10" onClick={() => sendEmoji(e)}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-white/20 rounded-md p-4 bg-purple-800/60">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-white">Station Schedule</h2>
          <span className="text-xs text-white/70">All times local</span>
        </div>
        <div className="divide-y divide-white/10">
          {schedule.map((slot, idx) => (
            <div key={`${slot.title}-${idx}`} className="py-2 flex items-center justify-between">
              <div>
                <div className="text-sm text-white">{slot.title}</div>
                <div className="text-xs text-white/70">{slot.days}</div>
              </div>
              <div className="text-sm text-white/90">{slot.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


