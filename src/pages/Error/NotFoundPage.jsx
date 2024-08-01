import React from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const NotFoundWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  // opacity:0.4;
  background-size: 58px 58px;
  animation: ${fadeIn} 1s ease-in-out;
`;

const MessageContainer = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  margin: 1rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: rgb(8,9,10);
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.25rem;
  color: #6c757d;
  margin-bottom: 2rem;
`;

const StyledNavLink = styled(NavLink)`
  font-size: 1rem;
  color: #007bff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const NotFoundPage = () => {
  return (
    <NotFoundWrapper>
      <MessageContainer
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Title>404 Not Found</Title>
        <Description>Sorry, the page you are looking for does not exist.</Description>
        <StyledNavLink to="/">Go back to Home</StyledNavLink>
      </MessageContainer>
    </NotFoundWrapper>
  );
};

export default NotFoundPage;
