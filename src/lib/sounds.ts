// Premium Sound System using Web Audio API
// Creates beautiful, contextual sounds for app interactions

type SoundType =
  | "messageReceived"
  | "messageSent"
  | "connectionRequest"
  | "connectionAccepted"
  | "achievement"
  | "levelUp"
  | "xpGained"
  | "notification"
  | "success"
  | "like"
  | "comment"
  | "offer"
  | "quizPassed"
  | "applicationAdded";

interface SoundConfig {
  enabled: boolean;
  volume: number;
}

const defaultConfig: SoundConfig = {
  enabled: true,
  volume: 0.3,
};

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Create a premium chime sound
const createChime = (
  ctx: AudioContext,
  frequencies: number[],
  durations: number[],
  volume: number,
  type: OscillatorType = "sine"
): void => {
  frequencies.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

    const startTime = ctx.currentTime + (i * 0.08);
    const duration = durations[i] || 0.3;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  });
};

// Message received - pleasant ascending chime
const playMessageReceived = (volume: number): void => {
  const ctx = getAudioContext();
  createChime(ctx, [523.25, 659.25, 783.99], [0.15, 0.15, 0.25], volume);
};

// Message sent - subtle whoosh with soft confirmation
const playMessageSent = (volume: number): void => {
  const ctx = getAudioContext();

  // Soft swoosh
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1000, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
};

// Connection request - friendly ping
const playConnectionRequest = (volume: number): void => {
  const ctx = getAudioContext();
  createChime(ctx, [587.33, 739.99, 880], [0.12, 0.12, 0.2], volume);
};

// Connection accepted - warm celebratory sound
const playConnectionAccepted = (volume: number): void => {
  const ctx = getAudioContext();
  createChime(ctx, [523.25, 659.25, 783.99, 1046.5], [0.1, 0.1, 0.1, 0.4], volume);
};

// Achievement unlocked - epic fanfare
const playAchievement = (volume: number): void => {
  const ctx = getAudioContext();

  // Main fanfare
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  const durations = [0.12, 0.12, 0.12, 0.15, 0.5];

  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator2.type = "triangle";
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    oscillator2.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);

    const startTime = ctx.currentTime + (i * 0.1);
    const duration = durations[i];

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    oscillator2.start(startTime);
    oscillator2.stop(startTime + duration);
  });
};

// Level up - triumphant ascending arpeggio
const playLevelUp = (volume: number): void => {
  const ctx = getAudioContext();

  // Major chord arpeggio with shimmer
  const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];

  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator2.type = "sine";
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    oscillator2.frequency.setValueAtTime(freq * 2, ctx.currentTime);

    const startTime = ctx.currentTime + (i * 0.07);
    const duration = i === notes.length - 1 ? 0.6 : 0.25;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    oscillator2.start(startTime);
    oscillator2.stop(startTime + duration);
  });
};

// XP gained - quick rewarding ping
const playXpGained = (volume: number): void => {
  const ctx = getAudioContext();
  createChime(ctx, [880, 1108.73], [0.08, 0.15], volume * 0.6);
};

// General notification - soft bell
const playNotification = (volume: number): void => {
  const ctx = getAudioContext();

  const oscillator = ctx.createOscillator();
  const oscillator2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator2.type = "sine";
  oscillator.frequency.setValueAtTime(830.61, ctx.currentTime);
  oscillator2.frequency.setValueAtTime(1244.51, ctx.currentTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.4);
  oscillator2.start(ctx.currentTime);
  oscillator2.stop(ctx.currentTime + 0.4);
};

// Success - satisfying confirmation
const playSuccess = (volume: number): void => {
  const ctx = getAudioContext();
  createChime(ctx, [523.25, 783.99], [0.1, 0.2], volume);
};

// Like - subtle pop
const playLike = (volume: number): void => {
  const ctx = getAudioContext();

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(600, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
  oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.12);
};

// Comment - soft notification
const playComment = (volume: number): void => {
  const ctx = getAudioContext();
  createChime(ctx, [698.46, 880], [0.1, 0.18], volume * 0.5);
};

// Offer received - epic celebration fanfare (big moment!)
const playOffer = (volume: number): void => {
  const ctx = getAudioContext();

  // Triumphant ascending major chord with sparkle
  const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5, 1318.5];

  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const oscillator3 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    oscillator2.connect(gainNode);
    oscillator3.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator2.type = "triangle";
    oscillator3.type = "sine";
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    oscillator2.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);
    oscillator3.frequency.setValueAtTime(freq * 2, ctx.currentTime);

    const startTime = ctx.currentTime + (i * 0.08);
    const duration = i === notes.length - 1 ? 0.8 : 0.2;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    oscillator2.start(startTime);
    oscillator2.stop(startTime + duration);
    oscillator3.start(startTime);
    oscillator3.stop(startTime + duration);
  });
};

// Quiz passed - satisfying triumphant chime
const playQuizPassed = (volume: number): void => {
  const ctx = getAudioContext();

  // Quick ascending victory chime
  const notes = [440, 554.37, 659.25, 880];

  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator2.type = "triangle";
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    oscillator2.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);

    const startTime = ctx.currentTime + (i * 0.1);
    const duration = i === notes.length - 1 ? 0.4 : 0.15;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    oscillator2.start(startTime);
    oscillator2.stop(startTime + duration);
  });
};

// Application added - satisfying pop with confirmation
const playApplicationAdded = (volume: number): void => {
  const ctx = getAudioContext();

  // Quick satisfying pop
  const oscillator = ctx.createOscillator();
  const oscillator2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator2.type = "sine";
  oscillator.frequency.setValueAtTime(500, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
  oscillator2.frequency.setValueAtTime(750, ctx.currentTime + 0.05);
  oscillator2.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.12);

  gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
  oscillator2.start(ctx.currentTime + 0.05);
  oscillator2.stop(ctx.currentTime + 0.18);
};

// Sound player map
const soundPlayers: Record<SoundType, (volume: number) => void> = {
  messageReceived: playMessageReceived,
  messageSent: playMessageSent,
  connectionRequest: playConnectionRequest,
  connectionAccepted: playConnectionAccepted,
  achievement: playAchievement,
  levelUp: playLevelUp,
  xpGained: playXpGained,
  notification: playNotification,
  success: playSuccess,
  like: playLike,
  comment: playComment,
  offer: playOffer,
  quizPassed: playQuizPassed,
  applicationAdded: playApplicationAdded,
};

// Main play function
export const playSound = (type: SoundType, config: Partial<SoundConfig> = {}): void => {
  const finalConfig = { ...defaultConfig, ...config };

  if (!finalConfig.enabled) return;

  try {
    const player = soundPlayers[type];
    if (player) {
      player(finalConfig.volume);
    }
  } catch (error) {
    console.warn("Failed to play sound:", error);
  }
};

// Preload audio context on first user interaction
export const initSoundSystem = (): void => {
  const handleInteraction = () => {
    getAudioContext();
    document.removeEventListener("click", handleInteraction);
    document.removeEventListener("keydown", handleInteraction);
  };

  document.addEventListener("click", handleInteraction);
  document.addEventListener("keydown", handleInteraction);
};

// Check if sounds are supported
export const isSoundSupported = (): boolean => {
  return typeof AudioContext !== "undefined" || typeof (window as any).webkitAudioContext !== "undefined";
};

export type { SoundType, SoundConfig };
