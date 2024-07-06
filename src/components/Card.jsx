import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Github } from "../assets/svg/AllSvgs";
import { mediaQueries } from "../theme/Themes";

// project container styling
const Box = styled(motion.li)`
  width: 25rem;
  height: 45vh;
  background-color: ${(props) => props.theme.text};
  color: ${(props) => props.theme.body};
  padding: 1.5rem 2rem;
  margin-right: 8rem;
  border-radius: 0 50px 0 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid ${(props) => props.theme.body};
  transition: all 0.5s ease; // Updated transition time
  background-image: linear-gradient(
    to right, 
    ${(props) => props.theme.body} 50%, 
    ${(props) => props.theme.text} 50%);
  background-size: 200% 100%;
  background-position: right bottom;

  &:hover {
    color: ${(props) => props.theme.text};
    border: 1px solid ${(props) => props.theme.text};
    background-color: ${(props) => props.theme.body};
    background-position: left bottom; // Shifts the gradient to change the background color directionally
  }
  ${mediaQueries(50)`
        width:16rem;
        margin-right:6rem;
        height:38vh;
  `};
  ${mediaQueries(40)`
        width:14rem;
        margin-right:4rem;
        height:38vh;
  `};
  ${mediaQueries(25)`
        width:12rem;
        margin-right:4rem;
        height:35vh;
        padding:1.5rem 1.5rem;
  `};
  ${mediaQueries(20)`
        width:10rem;
        margin-right:4rem;
        height:40vh;
  `};
`;

// Project title styling
const Title = styled.h2`
  font-size: calc(0.8em + 0.5vw);
  overflow: hidden;
  height: 35px;
  text-overflow: ellipsis;
`;


const Description = styled.h4`
  font-size: calc(0.75em + 0.3vw);
  font-family: "Karla", sans-serif;
  font-weight: 500;
  max-height: 15vh;
  overflow-y: scroll;
  text-overflow: ellipsis;
  line-height: 1.3rem;
  border-radius: 10px;
  padding: 0.3em 1.3em 0.3em 0.3em;
  ${mediaQueries(25)`
    font-size:calc(0.6em + 0.3vw);
  `};
  ${mediaQueries(20)`
    font-size:calc(0.5em + 0.3vw);
  `};

  /* Custom scrollbar styles */
  ::-webkit-scrollbar {
    width: 4px; /* width of the scrollbar */
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.text}; /* color of the scrollbar track */
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.body};; /* color of the scrollbar thumb */
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #404252; /* color of the scrollbar thumb on hover */
  }
`;


// tag styling for group of tags
const Tags = styled.div`
  border-top: 3px solid ${(props) => props.theme.body};
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
  display: flex;
  gap: 0.5rem;
  overflow: hidden;
  flex-wrap: wrap;
  ${Box}:hover & {
    border-top: 3px solid ${(props) => props.theme.text};
  }
`;

// tag styling for each single tag
const Tag = styled.span`
  margin-right: 0.1rem;  // Consistent margin for layout spacing
  font-size: calc(0.5em + 0.2vw);  // Dynamic font size based on viewport width
  overflow: hidden;  // Prevents overflow of text outside the tag
  text-overflow: ellipsis;  // Adds ellipsis when text overflows
  white-space: nowrap;  // Keeps the tag text on one line
  background-color: ${(props) => props.theme.body};  // Background color from theme
  color: ${(props) => props.theme.text};  // Text color from theme
  padding: 0.5em 1em;  // Padding around the text for a better visual presentation
  border-radius: 15px;  // Rounded corners for a modern look
  transition: all 0.2s ease;  // Smooth transition for hover effects

  &:hover {
    background-color: ${(props) => props.theme.text};  // Changes background on hover
    color: ${(props) => props.theme.body};  // Changes text color on hover
    transform: scale(1.1);  // Slightly enlarges the tag on hover for emphasis
    cursor: pointer;  // Changes the cursor to indicate interactivity
  }

  ${mediaQueries(25)`  
    font-size:calc(0.7em);
    padding: 0.4em 0.9em;  
  `};
`;

// card footer 
const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
`;


const Link = styled(NavLink)`
  background-color: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  text-decoration: none;
  padding: 0.5rem calc(2rem + 2vw);  // Adjusted to ensure proper vertical alignment
  border-radius: 0 0 0 30px;
  font-family: "Karla", sans-serif;
  font-size: calc(0.85em + 0.5vw);
  text-overflow: ellipsis;  // Adds ellipsis when text overflows
  white-space: nowrap; 
  display: flex;
  font-weight: bold;
  align-items: center;  // Ensures vertical centering of text
  height: 1.8rem  // Fixed height for consistency
  max-width: 15vw; // Fixed width for consistency

  ${Box}:hover & {
    background-color: ${(props) => props.theme.text};
    color: ${(props) => props.theme.body};
    text-decoration: underline;
    transition: 0.3S ease-in-out;
  }
`;

const Git = styled(NavLink)`
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;  // Ensures vertical centering of the icon
  height: 2.8rem;  // Same height as the Visit button to maintain consistency

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
  padding: 0.5rem calc(2rem + 2vw);  // Adjusted to ensure proper vertical alignment
  border-radius: 0 0 0 30px;
  font-family: "Karla", sans-serif;
  font-size: calc(0.7em + 0.5vw);
  font-weight: bold;
  text-overflow: ellipsis;  // Adds ellipsis when text overflows
  white-space: nowrap; 
  display: flex;
  align-items: center;  // Ensures vertical centering of text
  height: 1.8rem;  // Fixed height for consistency
  max-width: 15rem; // Fixed width for consistency
`;

// Function to render the demo link or status text
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

// Function to handle tag click
const handleTagClick = (tag) => {
  const url = `https://www.google.com/search?q=${tag}`;
  window.open(url, "_blank");
};

const item = {
  hidden: { scale: 0 },
  show: { scale: 1, transition: { type: "spring", duration: 0.5 } },
};
//const tags = ["react","gsap","javascript"]
//status = Development / Maintenance / Ready
const Card = (props) => {
  const { id, name, description, tags, demo, github, status } = props.data;
  return (
    <Box key={id} variants={item}>
      <Title>{name}</Title>
      <Description>{description}</Description>
      <Tags>
        {tags.map((t, id) => (
          <Tag key={id} onClick={() => handleTagClick(t)}>#{t}</Tag>
        ))}
      </Tags>
      <Footer>
        {renderDemoLink(status, demo)}
        <Git to={{ pathname: `${github}` }} target="_blank">
           <Github height="100%" />
        </Git>
      </Footer>
    </Box>
  );
};

export default Card;
