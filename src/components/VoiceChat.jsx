import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Transcription from './Transcription';
import SpeechControls from './SpeechControls';
import geminiService from '../services/geminiService';
import { speak, stop as stopSpeaking } from '../services/voiceService';
import TextInput from './TextInput';

const PageContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background: #0a0a0f;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  @media (max-width: 480px) {
    padding: 0;
    height: 100%;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 800px;
  height: 90vh;
  background: #151520;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  border-radius: 20px;

  @media (max-width: 500px) {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    border: none;
  }

  @media (min-width: 500px) and (max-width: 839px) {
    width: 500px;
    height: 95vh;
    border-radius: 20px;
  }
    
`;

const Header = styled.header`
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px 20px 0 0;

  @media (max-width: 840px) {
    border-radius: 0;
  }
`;

const Title = styled.h1`
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
`;

const StatusBadge = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ $isActive }) => 
    $isActive ? 'rgba(52, 199, 89, 0.1)' : 'rgba(142, 142, 147, 0.1)'};
  color: ${({ $isActive }) => 
    $isActive ? '#34C759' : 'rgba(255, 255, 255, 0.6)'};
  border: 1px solid ${({ $isActive }) => 
    $isActive ? 'rgba(52, 199, 89, 0.2)' : 'rgba(142, 142, 147, 0.1)'};
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  min-height: 0;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ControlsArea = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0 0 20px 20px;

  @media (max-width: 840px) {
    border-radius: 0;
    padding: 0.75rem;
  }
`;

const ModeToggle = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const VoiceChat = () => {
  const [conversation, setConversation] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [isVoiceMode, setIsVoiceMode] = useState(true);

  useEffect(() => {
    if (isSpeaking && listening) {
      handleStopListening();
    }
  }, [isSpeaking]);

  useEffect(() => {
    return () => {
      if (listening) handleStopListening();
      if (isSpeaking) handleStopSpeaking();
    };
  }, []);

  const handleUserInput = async (input) => {
    if (!input.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setIsGenerating(true);
    stopSpeaking();
    
    try {
      if (listening) {
        SpeechRecognition.stopListening();
      }
      setConversation(prev => [...prev, { type: 'user', text: input }]);
      const response = await geminiService.getResponse(input);
      setConversation(prev => [...prev, { type: 'ai', text: response }]);
      await handleFirstWord(response);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error processing input:', error);
      setIsGenerating(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFirstWord = async (fullText) => {
    if (!fullText || isSpeaking) return;
    
    try {
      // Stop listening while speaking
      if (listening) {
        SpeechRecognition.stopListening();
      }
      
      setIsSpeaking(true);

      // Split text into sentences and speak once
      const sentences = fullText.split(/[.!?]+/).filter(Boolean);
      
      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (trimmedSentence) {
          try {
            await speak(trimmedSentence);
          } catch (error) {
            if (error?.error !== 'interrupted') {
              console.error('Error speaking sentence:', error);
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error('Voice service error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStartListening = () => {
    if (!browserSupportsSpeechRecognition) {
      console.error('Browser does not support speech recognition');
      return;
    }
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
    if (transcript) {
      handleUserInput(transcript);
      resetTranscript();
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const toggleInputMode = () => {
    if (listening) handleStopListening();
    if (isSpeaking) handleStopSpeaking();
    setIsVoiceMode(!isVoiceMode);
  };

  return (
    <PageContainer>
      <MainContent>
        <Header>
          <Title>Voice Assistant</Title>
          <StatusBadge $isActive={listening || isSpeaking}>
            {listening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
          </StatusBadge>
        </Header>

        <ChatArea>
          <Transcription 
            conversation={conversation} 
            isGenerating={isGenerating}
            onFirstWord={handleFirstWord}
          />
        </ChatArea>

        <ControlsArea>
          <ModeToggle onClick={toggleInputMode}>
            {isVoiceMode ? 'Switch to Text' : 'Switch to Voice'}
          </ModeToggle>
          
          {isVoiceMode ? (
            <SpeechControls 
              isListening={listening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onStopSpeaking={handleStopSpeaking}
            />
          ) : (
            <TextInput onSubmit={handleUserInput} />
          )}
        </ControlsArea>
      </MainContent>
    </PageContainer>
  );
};

export default VoiceChat;