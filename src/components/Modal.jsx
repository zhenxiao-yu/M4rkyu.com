import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    max-width: 90%;
    max-height: 80%;
    padding: 0.5rem;
  }

  @media (max-width: 480px) {
    max-width: 90%;
    max-height: 70%;
    padding: 0.25rem;
  }
`;

const ModalImage = styled(motion.img)`
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
`;

const Watermark = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  border-radius: 5px;
  pointer-events: none;
`;

const Modal = ({ setSelectedImg, selectedImg }) => {
  const handleClick = (e) => {
    if (e.target.classList.contains('backdrop')) {
      setSelectedImg(null);
    }
  };

  return (
    <Backdrop
      className="backdrop"
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ModalContent>
        <ModalImage
          src={selectedImg}
          alt="enlarged pic"
          initial={{ y: '-100vh' }}
          animate={{ y: 0 }}
        />
        <Watermark>M4rkyu.com</Watermark>
      </ModalContent>
    </Backdrop>
  );
};

export default Modal;
