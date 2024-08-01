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
  display: flex;
  justify-content: center;
  align-items: center;
  background:
      linear-gradient(135deg,#0000 18.75%,#090a0b 0 31.25%,#0000 0),
      repeating-linear-gradient(45deg,#090a0b -6.25% 6.25%,#ece9e8 0 18.75%);
  background-size: 20px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  overflow: hidden;

  @media (max-width: 768px) {
    width: 90%;
    height: 80%;
  }

  @media (max-width: 480px) {
    width: 90%;
    height: 70%;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalImage = styled(motion.img)`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 5px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
`;

const Watermark = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 1.1rem;
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
        <ImageWrapper>
          <ModalImage
            src={selectedImg}
            alt="enlarged pic"
            initial={{ y: '-150vh' }}
            animate={{ y: 0 }}
          />
          <Watermark>M4rkyu.com</Watermark>
        </ImageWrapper>
      </ModalContent>
    </Backdrop>
  );
};

export default Modal;
