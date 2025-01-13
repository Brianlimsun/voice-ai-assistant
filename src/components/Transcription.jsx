import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const TranscriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

// Animation for the typing indicator
const blink = keyframes`
  0% { opacity: .2; }
  20% { opacity: 1; }
  100% { opacity: .2; }
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: ${({ $type }) => $type === 'user' ? 'transparent' : '#151520'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const MessageContent = styled.div`
  color: ${({ $type }) => $type === 'user' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  font-size: 0.9375rem;
  line-height: 1.5;
  max-width: 750px;
  margin: 0 auto;
  width: 100%;
`;

const MessageLabel = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
  font-weight: 500;
  max-width: 750px;
  margin: 0 auto;
  width: 100%;
  margin-bottom: 0.5rem;
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 1rem 1.25rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  width: fit-content;
  margin-right: auto;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  span {
    width: 4px;
    height: 4px;
    background: ${({ theme }) => theme.colors.text.secondary};
    border-radius: 50%;
    animation: ${blink} 1.4s infinite;
    
    &:nth-child(2) { animation-delay: .2s; }
    &:nth-child(3) { animation-delay: .4s; }
  }
`;

const LoadingIndicator = styled.div`
  padding: 1.5rem;
  background: #151520;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .dots {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.5rem;
    letter-spacing: 2px;
  }
`;

const TypewriterText = ({ text, onFirstWord }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasSpokeOnce, setHasSpokeOnce] = useState(false);

  useEffect(() => {
    // Only speak once when the text first arrives
    if (!hasSpokeOnce) {
      onFirstWord(text);
      setHasSpokeOnce(true);
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 15);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, onFirstWord, hasSpokeOnce]);

  return <>{displayedText}</>;
};

const Transcription = ({ conversation, isGenerating, onFirstWord }) => {
  return (
    <TranscriptionContainer>
      {conversation.map((message, index) => (
        <MessageGroup key={index} $type={message.type}>
          <MessageLabel>
            {message.type === 'user' ? 'You' : 'Assistant'}
          </MessageLabel>
          <MessageContent $type={message.type}>
            {message.type === 'ai' && index === conversation.length - 1 ? (
              <TypewriterText text={message.text} onFirstWord={onFirstWord} />
            ) : (
              message.text
            )}
          </MessageContent>
        </MessageGroup>
      ))}
      
      {isGenerating && !conversation.some(msg => msg.type === 'ai') && (
        <LoadingIndicator>
          <MessageLabel>Assistant</MessageLabel>
          <div className="dots">...</div>
        </LoadingIndicator>
      )}
    </TranscriptionContainer>
  );
};

export default Transcription;