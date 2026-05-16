'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechTranscriptStatus =
  | 'unsupported'
  | 'idle'
  | 'listening'
  | 'interrupted'
  | 'error'
  | 'stopped';

export interface UseSpeechTranscriptResult {
  supported: boolean;
  status: SpeechTranscriptStatus;
  /** Derived: status === 'listening' */
  isListening: boolean;
  /** Accumulated finalized text */
  transcript: string;
  interimTranscript: string;
  /** History of finalized speech chunks (each is one send candidate) */
  finalSegments: string[];
  error: string | null;
  /** Friendly user-facing message for the current status */
  statusMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: { isFinal: boolean; [index: number]: { transcript: string } };
  };
}

const UNSUPPORTED_MESSAGE =
  'Live browser transcript is unavailable in this browser. Use text input, or run in Chrome with microphone permission.';
const INTERRUPTED_MESSAGE =
  'Speech recognition paused. You can continue with text input.';

/** Cap auto-restarts so a flaky engine cannot loop forever. */
const MAX_AUTO_RESTARTS = 6;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechTranscript(micGranted: boolean): UseSpeechTranscriptResult {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldRunRef = useRef(false);
  const manualStopRef = useRef(false);
  const restartCountRef = useRef(0);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [supported] = useState(() => getSpeechRecognition() !== null);
  const [status, setStatus] = useState<SpeechTranscriptStatus>(() =>
    getSpeechRecognition() ? 'idle' : 'unsupported'
  );
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalSegments, setFinalSegments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const buildRecognition = useCallback((): SpeechRecognitionInstance | null => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return null;
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) finalText += text;
        else interim += text;
      }
      if (finalText.trim()) {
        // Real speech progress — reset the restart guard.
        restartCountRef.current = 0;
        const chunk = finalText.trim();
        setTranscript((prev) => `${prev} ${chunk}`.trim());
        setFinalSegments((prev) => [...prev, chunk]);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        shouldRunRef.current = false;
        setError('Microphone access blocked. Use text input.');
        setStatus('error');
        return;
      }
      // no-speech / aborted / network are recoverable — keep the session usable.
      if (e.error !== 'aborted') {
        setError(INTERRUPTED_MESSAGE);
        setStatus('interrupted');
      }
    };

    recognition.onend = () => {
      if (
        shouldRunRef.current &&
        !manualStopRef.current &&
        restartCountRef.current < MAX_AUTO_RESTARTS
      ) {
        restartCountRef.current += 1;
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
            setStatus('listening');
          } catch {
            setStatus('interrupted');
          }
        }, 600);
        return;
      }
      shouldRunRef.current = false;
      setStatus((prev) => (prev === 'error' ? 'error' : 'stopped'));
    };

    return recognition;
  }, []);

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    shouldRunRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    recognitionRef.current?.stop();
    setStatus((prev) =>
      prev === 'unsupported' || prev === 'error' ? prev : 'stopped'
    );
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalSegments([]);
    setError(null);
  }, []);

  const startListening = useCallback(() => {
    if (!getSpeechRecognition()) {
      setStatus('unsupported');
      setError(UNSUPPORTED_MESSAGE);
      return;
    }
    if (!micGranted) {
      setError('Enable microphone first.');
      setStatus('idle');
      return;
    }

    manualStopRef.current = false;
    shouldRunRef.current = true;
    restartCountRef.current = 0;
    setError(null);

    const recognition = buildRecognition();
    if (!recognition) {
      setStatus('unsupported');
      return;
    }
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setStatus('listening');
    } catch {
      setStatus('interrupted');
      setError(INTERRUPTED_MESSAGE);
    }
  }, [buildRecognition, micGranted]);

  useEffect(() => {
    return () => {
      shouldRunRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  const statusMessage =
    status === 'unsupported'
      ? UNSUPPORTED_MESSAGE
      : status === 'interrupted'
        ? INTERRUPTED_MESSAGE
        : error;

  return {
    supported,
    status,
    isListening: status === 'listening',
    transcript,
    interimTranscript,
    finalSegments,
    error,
    statusMessage,
    startListening,
    stopListening,
    resetTranscript,
  };
}
