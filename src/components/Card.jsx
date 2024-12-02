import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Github } from "../assets/svg/AllSvgs";
import ImageDescription from './ImageDescription';
import { mediaQueries } from "../theme/Themes";
import { useState } from "react";

// Project container styling
const Box = styled(motion.li)`
  width: 30rem;
  height: 50vh;
  background-color: ${(props) => props.theme.text};
  color: ${(props) => props.theme.body};
  padding: 1.5rem 2rem;
  margin-right: 5rem;
  border-radius: 0 50px 0 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid ${(props) => props.theme.body};
  transition: all 0.5s ease;
  background-image: linear-gradient(
      to right,
      ${(props) => props.theme.body} 50%,
      ${(props) => props.theme.text} 50%
  );
  background-size: 200% 100%;
  background-position: right bottom;

  &:hover {
    color: ${(props) => props.theme.text};
    border: 1px solid ${(props) => props.theme.text};
    background-color: ${(props) => props.theme.body};
    background-position: left bottom;
  }

  ${mediaQueries(50)`width: 16rem; margin-right: 5rem; height: 50vh;`};
  ${mediaQueries(40)`width: 14rem; margin-right: 3rem; height: 45vh;`};
  ${mediaQueries(25)`width: 12rem; margin-right: 2rem; height: 45vh; padding: 1.5rem 1.5rem;`};
  ${mediaQueries(20)`width: 10rem; margin-right: 1rem; height: 40vh;`};
`;

const Title = styled.h2`
  font-size: calc(1em + 0.5vw);
  overflow: hidden;
  height: auto;
  text-overflow: ellipsis;
  margin: 0;
`;

const Subtitle = styled.div`
  font-size: calc(0.6em + 0.2vw);
  font-weight: 400;
  margin: 0.5rem 0;
`;

const Tags = styled.div`
  border-top: 4px solid ${(props) => props.theme.body};
  padding: 0.8rem 1.3rem;
  display: flex;
  gap: 0.5rem;
  overflow: hidden;
  flex-wrap: wrap;
  margin-bottom: 10px;
  justify-content: center;

  ${Box}:hover & {
    border-top: 4px solid ${(props) => props.theme.text};
  }
`;

const Tag = styled.span`
  margin-right: 0.1rem;
  font-size: calc(0.5em + 0.2vw);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  padding: 0.5em 0.5em;
  border-radius: 15px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.text};
    color: ${(props) => props.theme.body};
    transform: scale(1.1);
    cursor: pointer;
  }
`;

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const FooterLinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Link = styled(NavLink)`
  background-color: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  text-decoration: none;
  padding: 0.3rem calc(2rem + 2vw);
  border-radius: 0 0 0 30px;
  font-size: calc(0.65em + 0.5vw);
  white-space: nowrap;
  display: flex;
  font-weight: bold;
  align-items: center;
  height: 1.8rem;

  ${Box}:hover & {
    background-color: ${(props) => props.theme.text};
    color: ${(props) => props.theme.body};
    text-decoration: underline;
    transition: 0.3s ease-in-out;
  }
`;

const Git = styled(NavLink)`
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  height: 2.8rem;

  ${Box}:hover & {
    & > * {
      fill: ${(props) => props.theme.text};
    }
  }
`;

const Card = (props) => {
  const { id, name, subtitle, description, tags, demo, github, status, imageUrl } = props.data;
  const [showImage, setShowImage] = useState(true);

  const toggleView = () => setShowImage((prev) => !prev);

  const renderDemoLink = (status, demo) => {
    let borderColor = "";
    if (status === "Ready") borderColor = "#74febd";
    else if (status === "Development") borderColor = "#64e9ff";
    else if (status === "Maintenance") borderColor = "#ff4066";

    if (status === "Ready") {
      return (
          <Link
              style={{ border: `3px solid ${borderColor}` }}
              to={{ pathname: demo }}
              target="_blank"
          >
            PROJECT LINK
          </Link>
      );
    }
    return (
        <Link
            style={{ border: `3px solid ${borderColor}` }}
            to={{ pathname: "/project" }}
        >
          {status === "Development" ? "Coming Soon" : "UNAVAILABLE"}
        </Link>
    );
  };

  const handleTagClick = (tag) =>
      window.open(`https://www.google.com/search?q=${tag}`, "_blank");

  return (
      <Box
          key={id}
          variants={{
            hidden: { scale: 0 },
            show: { scale: 1, transition: { type: "spring", duration: 0.5 } },
          }}
      >
        <Title>
          {name}
          <Subtitle>{subtitle}</Subtitle>
        </Title>
        <ImageDescription
            showImage={showImage}
            toggleView={toggleView}
            imageUrl={imageUrl}
            description={description}
        />
        <Tags>
          {tags.map((t, id) => (
              <Tag key={id} onClick={() => handleTagClick(t)}>
                #{t}
              </Tag>
          ))}
        </Tags>
        <Footer>
          <FooterLinkContainer>
            {renderDemoLink(status, demo)}
            <Git to={{ pathname: github }} target="_blank">
              <Github height="100%" />
            </Git>
          </FooterLinkContainer>
        </Footer>
      </Box>
  );
};

export default Card;
