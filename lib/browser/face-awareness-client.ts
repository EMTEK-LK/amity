/**
 * Browser-only face-api.js client. Do not import from server routes or RSC.
 */
import type {
  FacialAwarenessSignal,
  FacialExpression,
  FacialSignalQuality,
} from '@/types/facial-awareness';

const MODEL_BASE = '/models';

/** Tunable detection constants */
export const FACE_DETECTION_INPUT_SIZE = 416;
export const FACE_DETECTION_SCORE_THRESHOLD = 0.35;
export const FACE_DETECTION_INTERVAL_MS = 1000;

type FaceApiModule = typeof import('face-api.js');

let faceApiModule: FaceApiModule | null = null;
let modelsLoaded = false;

async function getFaceApi(): Promise<FaceApiModule> {
  if (!faceApiModule) {
    faceApiModule = await import('face-api.js');
  }
  return faceApiModule;
}

export async function loadFaceApiModels(): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'Face API runs in the browser only' };
  }

  try {
    const faceapi = await getFaceApi();
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_BASE),
    ]);
    modelsLoaded = true;
    return { ok: true };
  } catch (err) {
    modelsLoaded = false;
    const message = err instanceof Error ? err.message : 'Failed to load face models';
    return { ok: false, error: message };
  }
}

export function areFaceApiModelsLoaded(): boolean {
  return modelsLoaded;
}

export function isVideoReadyForDetection(video: HTMLVideoElement | null): boolean {
  if (!video) return false;
  return video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
}

type FaceApiExpressionKey =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'fearful'
  | 'disgusted'
  | 'surprised';

export function getDominantExpression(
  expressions: Record<string, number>
): { expression: FacialExpression; confidence: number; raw: FaceApiExpressionKey } {
  const entries = Object.entries(expressions) as [FaceApiExpressionKey, number][];
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const [raw, confidence] = sorted[0] ?? ['neutral', 0];

  const mapped = mapFaceApiExpression(raw);
  return { expression: mapped, confidence, raw };
}

function mapFaceApiExpression(raw: FaceApiExpressionKey): FacialExpression {
  switch (raw) {
    case 'neutral':
    case 'happy':
      return 'neutral';
    case 'sad':
      return 'sad';
    case 'angry':
      return 'angry';
    case 'fearful':
    case 'disgusted':
      return 'stressed';
    case 'surprised':
      return 'uncertain';
    default:
      return 'unknown';
  }
}

function deriveEngagement(
  expression: FacialExpression,
  confidence: number
): FacialAwarenessSignal['engagement'] {
  if (confidence < 0.35) return 'low';
  if (expression === 'sad' || expression === 'stressed' || expression === 'angry') {
    return 'low';
  }
  if (expression === 'tired' || expression === 'uncertain') return 'medium';
  if (confidence >= 0.65) return 'high';
  return 'medium';
}

function deriveAttention(expression: FacialExpression): FacialAwarenessSignal['attention'] {
  if (expression === 'tired') return 'distracted';
  if (expression === 'unknown') return 'unknown';
  return 'focused';
}

function deriveSignalQuality(confidence: number): FacialSignalQuality {
  if (confidence >= 0.6) return 'good';
  if (confidence >= 0.35) return 'fair';
  return 'poor';
}

export function mapExpressionToSignal(
  expressions: Record<string, number>
): FacialAwarenessSignal {
  const { expression, confidence } = getDominantExpression(expressions);
  const now = new Date().toISOString();

  return {
    expression,
    confidence,
    engagement: deriveEngagement(expression, confidence),
    attention: deriveAttention(expression),
    signalQuality: deriveSignalQuality(confidence),
    capturedAt: now,
    simulated: false,
  };
}

export function createNoFaceSignal(): FacialAwarenessSignal {
  const now = new Date().toISOString();
  return {
    expression: 'unknown',
    confidence: 0,
    engagement: 'low',
    attention: 'unknown',
    signalQuality: 'poor',
    capturedAt: now,
    simulated: false,
  };
}

export function createCameraOffSignal(): FacialAwarenessSignal {
  const now = new Date().toISOString();
  return {
    expression: 'unknown',
    confidence: 0,
    engagement: 'low',
    attention: 'unknown',
    signalQuality: 'unavailable',
    capturedAt: now,
    simulated: false,
  };
}

export async function detectExpressionFromVideo(
  video: HTMLVideoElement
): Promise<FacialAwarenessSignal | null> {
  if (!modelsLoaded || !isVideoReadyForDetection(video)) return null;

  try {
    const faceapi = await getFaceApi();
    const detection = await faceapi
      .detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: FACE_DETECTION_INPUT_SIZE,
          scoreThreshold: FACE_DETECTION_SCORE_THRESHOLD,
        })
      )
      .withFaceExpressions();

    if (!detection?.expressions) return null;
    return mapExpressionToSignal(detection.expressions as unknown as Record<string, number>);
  } catch {
    return null;
  }
}
