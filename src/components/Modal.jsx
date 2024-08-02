import React, { useState, useEffect } from 'react';
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

const ModalContent = styled(motion.div)`
  position: relative;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg,#0000 18.75%,#090a0b 0 31.25%,#0000 0),
      repeating-linear-gradient(45deg,#090a0b -6.25% 6.25%,#ece9e8 0 18.75%);
  background-size: 20px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  overflow: hidden;

  @media (max-width: 768px) {
    width: ${(props) => props.width * 0.9}px;
    height: ${(props) => props.height * 0.9}px;
  }

  @media (max-width: 480px) {
    width: ${(props) => props.width * 0.8}px;
    height: ${(props) => props.height * 0.8}px;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
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
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const handleClick = (e) => {
    if (e.target.classList.contains('backdrop')) {
      setSelectedImg(null);
    }
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const maxModalWidth = window.innerWidth * 0.9;
    const maxModalHeight = window.innerHeight * 0.9;
    let width = naturalWidth;
    let height = naturalHeight;

    if (width > maxModalWidth) {
      const scale = maxModalWidth / width;
      width = maxModalWidth;
      height = height * scale;
    }

    if (height > maxModalHeight) {
      const scale = maxModalHeight / height;
      height = maxModalHeight;
      width = width * scale;
    }

    setImageDimensions({ width, height });
  };

  return (
    <Backdrop
      className="backdrop"
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ModalContent
        width={imageDimensions.width}
        height={imageDimensions.height}
        initial={{ y: '-150vh' }}
        animate={{ y: 0 }}
      >
        <ImageWrapper>
          <ModalImage
            src={selectedImg}
            alt="enlarged pic"
            onLoad={handleImageLoad}
          />
          <Watermark>M4rkyu.com</Watermark>
        </ImageWrapper>
      </ModalContent>
    </Backdrop>
  );
};

export default Modal;
