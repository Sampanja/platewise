import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';

import { intlLocale } from '@/i18n';

export type SpeechProblem = 'unavailable' | 'denied' | 'noSpeech' | 'error';

/**
 * Speech to text on the device, in the app's language. Shows the words live
 * (interim results). No audio is recorded or stored by the app.
 */
export function useSpeechInput(onText: (text: string, final: boolean) => void) {
  const [listening, setListening] = useState(false);
  const [problem, setProblem] = useState<SpeechProblem | null>(null);
  const callback = useRef(onText);
  useEffect(() => {
    callback.current = onText;
  }, [onText]);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    if (text) callback.current(text, event.isFinal);
  });
  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    switch (event.error) {
      case 'not-allowed':
        setProblem('denied');
        break;
      case 'no-speech':
      case 'speech-timeout':
        setProblem('noSpeech');
        break;
      case 'language-not-supported':
      case 'service-not-allowed':
        setProblem('unavailable');
        break;
      case 'aborted':
        break;
      default:
        setProblem('error');
    }
  });

  const start = useCallback(async () => {
    setProblem(null);
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      setProblem('unavailable');
      return;
    }
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setProblem('denied');
      return;
    }
    ExpoSpeechRecognitionModule.start({ lang: intlLocale(), interimResults: true, continuous: false, addsPunctuation: true });
  }, []);

  const stop = useCallback(() => ExpoSpeechRecognitionModule.stop(), []);

  // Leaving the screen ends listening.
  useEffect(() => () => ExpoSpeechRecognitionModule.abort(), []);

  return { listening, problem, start, stop };
}
