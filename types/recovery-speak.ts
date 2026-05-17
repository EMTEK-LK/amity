/** Bumped on every assistant reply so LiveKit publish always runs (even if text repeats). */
export interface RecoverySpeakRequest {
  id: number;
  text: string;
}
