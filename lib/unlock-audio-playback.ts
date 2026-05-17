/** Call from a user click handler so later ElevenLabs / LiveKit audio can autoplay. */
export function unlockAudioPlayback(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    void ctx.resume();
    void ctx.close();
  } catch {
    /* ignore */
  }
}
