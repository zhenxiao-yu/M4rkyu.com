import React, { useEffect } from 'react';
import useStorage from '../hooks/useStorage';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  height: 5px;
  width: 100%;
  background: #f3f3f3;
  border-radius: 5px;
  margin-top: 20px;
`;

const MotionProgressBar = styled(motion.div)`
  height: 100%;
  background: #3b5998;
  border-radius: 5px;
`;

const ProgressBar = ({ file, setFile }) => {
  const { progress, url } = useStorage(file);

  useEffect(() => {
    console.log('Progress:', progress, 'URL:', url);
    if (url) {
      setFile(null);
    }
  }, [url, setFile]);

  return (
    <ProgressContainer>
      <MotionProgressBar
        initial={{ width: 0 }}
        animate={{ width: progress + '%' }}
      />
    </ProgressContainer>
  );
};

export default ProgressBar;
