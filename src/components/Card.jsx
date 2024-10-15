import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Github } from "../assets/svg/AllSvgs";
import { mediaQueries } from "../theme/Themes";

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

  ${mediaQueries(50)`
    width: 16rem;
    margin-right: 5rem;
    height: 50vh;
  `};
  ${mediaQueries(40)`
    width: 14rem;
    margin-right: 3rem;
    height: 45vh;
  `};
  ${mediaQueries(25)`
    width: 12rem;
    margin-right: 2rem;
    height: 45vh;
    padding: 1.5rem 1.5rem;
  `};
  ${mediaQueries(20)`
    width: 10rem;
    margin-right: 1rem;
    height: 40vh;
  `};
`;

const Title = styled.h2`
  font-size: calc(1em + 0.5vw);
  overflow: hidden;
  height: auto;
  text-overflow: ellipsis;
  margin: 0;
`;

const Subtitle = styled.div`
  font-size: calc(0.7em + 0.2vw);
  font-weight: 400;
  margin-top: 5px;
  margin-bottom: 10px;
`;

const Description = styled.h4`
  font-size: calc(0.75em + 0.3vw);
  font-family: "Karla", sans-serif;
  font-weight: 700;
  max-height: 20vh;
  margin: 10px 3px;
  overflow-y: scroll;
  text-overflow: ellipsis;
  line-height: 1.5rem;
  border-radius: 10px;
  padding: 0.3em 1.3em 0.3em 0.3em;

  ${mediaQueries(25)`
    font-size: calc(0.6em + 0.3vw);
  `};
  ${mediaQueries(20)`
    font-size: calc(0.5em + 0.3vw);
  `};

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

const Tags = styled.div`
  border-top: 4px solid ${(props) => props.theme.body};
  padding: 0.8rem 1.3rem;
  display: flex;
  gap: 0.5rem; /* Adjusted gap for better spacing */
  overflow: hidden;
  flex-wrap: wrap;
  margin-bottom:10px;
  justify-content: center; /* Center align the tags */

  @media (max-width: 768px) {
    padding: 0.6rem 1rem; /* Adjust padding for smaller screens */
    gap: 0.4rem; /* Adjust gap for smaller screens */
  }

  @media (max-width: 480px) {
    padding: 0.4rem 0.8rem; /* Adjust padding for very small screens */
    gap: 0.3rem; /* Adjust gap for very small screens */
  }

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

  ${mediaQueries(25)`  
    font-size: calc(0.7em);
    padding: 0.4em 0.9em;  
  `};
`;

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
`;

const Link = styled(NavLink)`
  background-color: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  text-decoration: none;
  padding: 0.3rem calc(2rem + 2vw);
  border-radius: 0 0 0 30px;
  // font-family: "Karla", sans-serif;
  font-size: calc(0.65em + 0.5vw);
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  font-weight: bold;
  align-items: center;
  height: 1.8rem;
  max-width: 15vw;

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

const Link2 = styled.span`
  background-color: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  text-decoration: none;
  padding: 0.5rem calc(2rem + 2vw);
  border-radius: 0 0 0 30px;
  font-family: "Karla", sans-serif;
  font-size: calc(0.7em + 0.5vw);
  font-weight: bold;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  height: 1.8rem;
  max-width: 15rem;
`;

const renderDemoLink = (status, demo) => {
  let borderColor = "";

  if (status === "Ready") {
    borderColor = "#74febd";
  } else if (status === "Development") {
    borderColor = "#64e9ff";
  } else if (status === "Maintenance") {
    borderColor = "#ff4066";
  }

  if (status === "Ready") {
    return <Link style={{ border: `3px solid ${borderColor}` }} to={{ pathname: `${demo}` }} target="_blank">View Demo</Link>;
  } else if (status === "Development") {
    return <Link2 style={{ border: `3px solid ${borderColor}` }}>Coming Soon</Link2>;
  } else if (status === "Maintenance") {
    return <Link2 style={{ border: `3px solid ${borderColor}` }}>Unavailable</Link2>;
  }
  return null;
};

const handleTagClick = (tag) => {
  const url = `https://www.google.com/search?q=${tag}`;
  window.open(url, "_blank");
};

const item = {
  hidden: { scale: 0 },
  show: { scale: 1, transition: { type: "spring", duration: 0.5 } },
};

const Card = (props) => {
  const { id, name, subtitle, description, tags, demo, github, status } = props.data;
  return (
    <Box key={id} variants={item}>
      <Title className="animate__animated animate__flipInX animate__delay-1s">{name}
        <Subtitle>{subtitle}</Subtitle>
      </Title>
      <Description className="animate__animated animate__zoomIn animate__delay-1s">{description}</Description>
      <Tags className="animate__animated animate__fadeInUp animate__delay-1s">
        {tags.map((t, id) => (
          <Tag key={id} onClick={() => handleTagClick(t)}>#{t}</Tag>
        ))}
      </Tags>
      <Footer className="animate__animated animate__fadeInUp animate__delay-1s">
        {renderDemoLink(status, demo)}
        <Git to={{ pathname: `${github}` }} className="hvr-grow" target="_blank">
          <Github height="100%" />
        </Git>
      </Footer>
    </Box>
  );
};

export default Card;
