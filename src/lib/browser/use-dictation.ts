"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal structural types for the Web Speech API — it isn't in the standard
// DOM lib in every TS config, and we only touch this slice of it.
interface SpeechResultAlternative {
  transcript: string;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechResultAlternative>>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Browser-native speech-to-text via the Web Speech API. Streams the live
 * transcript to `onTranscript` (interim + final). `supported` is false on
 * browsers without it (e.g. Firefox) so the caller can hide the mic.
 */
export function useDictation(options: {
  lang?: string;
  onTranscript: (text: string) => void;
}) {
  const { lang = "en-US", onTranscript } = options;
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  // Keep the latest callback without re-creating start().
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    // Client-only capability probe (window isn't available during SSR), so a
    // one-shot setState on mount is the correct pattern here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(getRecognitionCtor() !== null);
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0]?.transcript ?? "";
      }
      onTranscriptRef.current(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [lang]);

  // Stop a live session if the component unmounts mid-dictation.
  useEffect(() => () => recRef.current?.stop(), []);

  return { supported, listening, start, stop };
}
