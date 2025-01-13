let currentUtterance = null;
let speechQueue = [];
let isSpeaking = false;

const getVoices = () => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
};

const speakText = async (text) => {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    // Get available voices
    const voices = await getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('English')
    ) || voices[0];
    
    utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        currentUtterance = null;
        isSpeaking = false;
        resolve();
        
        // Process next in queue
        if (speechQueue.length > 0) {
          const nextText = speechQueue.shift();
          speakText(nextText);
        }
      };

      utterance.onerror = (event) => {
        if (event.error !== 'interrupted') {
          console.error('Speech synthesis error:', event);
        }
        currentUtterance = null;
        isSpeaking = false;
        reject(event);
      };

      window.speechSynthesis.speak(utterance);
      isSpeaking = true;
    });
  } catch (error) {
    console.error('Speech synthesis failed:', error);
    throw error;
  }
};

export const speak = async (text) => {
  if (isSpeaking) {
    // Add to queue instead of speaking immediately
    speechQueue.push(text);
    return;
  }

  // Cancel any ongoing speech and wait a moment
  stop();
  await new Promise(resolve => setTimeout(resolve, 100));

  return speakText(text);
};

export const stop = () => {
  speechQueue = []; // Clear the queue
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
  isSpeaking = false;
};

export default {
  speak,
  stop
}; 