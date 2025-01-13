import React from 'react';
import styled from 'styled-components';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { FiSquare, FiMic } from 'react-icons/fi';

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const MicButton = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$isListening ? '#ff4444' : '#4444ff'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 24px;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SpeechControls = ({ 
  isListening, 
  isProcessing,
  onStartListening, 
  onStopListening
}) => {
  return (
    <ControlsContainer>
      <MicButton 
        onClick={isListening ? onStopListening : onStartListening}
        $isListening={isListening}
        disabled={isProcessing}
      >
        {isListening ? <FiSquare /> : <FiMic />}
      </MicButton>
    </ControlsContainer>
  );
};

export default SpeechControls;