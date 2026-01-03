import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FaHandPointer } from 'react-icons/fa';

const GreetingContainer = styled.div`
  text-align: center;
  margin-top: 2.8em;
  position: relative;
  padding: 0 1em; /* Added for better responsiveness */
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const handWave = keyframes`
  0%, 100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
  25% { transform: translateX(-50%) translateY(-10px) rotate(-20deg); }
  75% { transform: translateX(-50%) translateY(10px) rotate(20deg); }
`;

const GreetingText = styled(motion.h2)`
  color: rgb(8, 9, 10);
  animation: ${fadeIn} 2s ease-in;
   margin-top: 0.5em;
`;

const HandIconRight = styled(FaHandPointer)`
  position: absolute;
  top: -30px; /* Adjust as needed to position above the greeting text */
  left: 50%;
  font-size: 30px;
  transform: translateX(-50%) rotate(0deg); /* Center horizontally and rotate */
  animation: ${handWave} 2s infinite;
  color: rgb(8, 9, 10);

  @media (max-width: 768px) {
    top: -40px;
    size: 1.5em;
  }

  @media (max-width: 480px) {
    top: -35px;
    size: 1.2em;
  }
`;

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const Greeting = () => {
  const [greeting, setGreeting] = useState('Nice to meet you...');

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const hasVisited = window.localStorage.getItem('hasVisited');

    if (hasVisited) {
      setGreeting('m4rkyu.com');
    } else {
      setGreeting('Nice to meet you...');
      window.localStorage.setItem('hasVisited', 'true');
    }

    return undefined;
  }, []);

  return (
    <GreetingContainer>
      <GreetingText
        aria-live="polite"
        className="fadeIn"
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        {greeting}
      </GreetingText>
      <HandIconRight />
    </GreetingContainer>
  );
};

export default Greeting;
