import React, { useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const SpeechRecognitionTest = () => {
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error('Browser does not support speech recognition.');
    }
  }, [browserSupportsSpeechRecognition]);

  return (
    <div>
      <button onClick={startListening}>Start Listening</button>
      <button onClick={stopListening}>Stop Listening</button>
      <p>Microphone: {isListening ? 'on' : 'off'}</p>
      <p>Transcript: {transcript}</p>
    </div>
  );
};

export default SpeechRecognitionTest; 