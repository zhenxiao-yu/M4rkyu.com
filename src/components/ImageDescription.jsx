// ImageDescription.jsx
import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const Container = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledImage = styled(motion.img)`
  aspect-ratio: 3 / 2;
  border-radius: 5%;
  padding: 5px;
  object-fit: cover;
  width: 100%;
`;

const StyledDescription = styled.h4`
  font-size: calc(0.75em + 0.3vw);
  font-family: "Karla", sans-serif;
  font-weight: 700;
  max-height: 20vh;
  margin: 10px 3px;
  overflow-y: scroll;
  text-overflow: ellipsis;
  line-height: 1.5rem;
  border-radius: 8px;
  padding: 0.3em 1.3em 0.3em 0.3em;

  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.text};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.body};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #404252;
  }
`;

const ImageDescription = ({ showImage, toggleView, imageUrl, description }) => {
    return (
        <Container onClick={toggleView}>
            {showImage ? (
                <StyledImage
                    src={imageUrl}
                    alt="Related Visual"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                />
            ) : (
                <StyledDescription>{description}</StyledDescription>
            )}
        </Container>
    );
};

export default ImageDescription;
