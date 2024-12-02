import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

const Container = styled.div`
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column; /* Ensures image and description are stacked */
    position: relative; /* Required for overlay positioning */
    width: 85%;
    margin: 0 auto; /* Center the container horizontally */
`;

const StyledImage = styled(motion.img)`
    aspect-ratio: 3 / 2;
    border-radius: 10px;
    padding: 5px;
    object-fit: cover;
    width: 100%;
    max-width: 600px; /* Limits the maximum width for responsiveness */
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.3s ease;

    &:hover {
        box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.3);
    }
`;

const HoverOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
    color: white;
    font-family: "Karla", sans-serif;
    font-weight: bold;
    font-size: calc(0.8em + 0.5vw);
    border-radius: 10px;
    opacity: 0; /* Initially hidden */
    transition: opacity 0.3s ease; /* Smooth fade-in/out */

    &:hover {
        opacity: 1; /* Show overlay on hover */
    }
`;

const StyledDescription = styled(motion.h4)`
    font-size: calc(0.75em + 0.3vw);
    font-family: "Karla", sans-serif;
    font-weight: 700;
    max-height: 20vh;
    margin-top: 20px; /* Adds spacing between the image and description */
    margin-bottom: 10px;
    overflow-y: scroll;
    text-align: center; /* Centers the text horizontally */
    text-overflow: ellipsis;
    line-height: 1.5rem;
    border-radius: 8px;
    padding: 0.3em 1.3em 0.3em 0.3em;
    white-space: pre-line; /* Ensures line breaks in text are respected */
    transition: background-color 0.3s ease, color 0.3s ease;

    ::-webkit-scrollbar {
        width: 6px;
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
                <>
                    <StyledImage
                        src={imageUrl}
                        alt="Related Visual"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                            duration: 0.5,
                            type: "spring",
                            stiffness: 120,
                            damping: 10,
                        }}
                    />
                    <HoverOverlay>View description</HoverOverlay>
                </>
            ) : (
                <StyledDescription
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                        duration: 0.4,
                        ease: "easeOut",
                    }}
                >
                    {description}
                </StyledDescription>
            )}
        </Container>
    );
};

export default ImageDescription;
