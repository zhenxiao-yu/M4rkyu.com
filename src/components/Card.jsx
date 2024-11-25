import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Github } from "../assets/svg/AllSvgs";
import { mediaQueries } from "../theme/Themes";
import {useState} from "react";

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
  font-size: calc(0.6em + 0.2vw);
  font-weight: 400;
  margin: 0.5rem 0;
`;

const Description = styled.h4`
  font-size: calc(0.75em + 0.3vw); /* Normal font size for larger screens */
  font-family: "Karla", sans-serif;
  font-weight: 700;
  max-height: 20vh;
  margin: 10px 3px;
  overflow-y: scroll;
  text-overflow: ellipsis;
  line-height: 1.5rem; /* Standard line-height for larger screens */
  border-radius: 8px;
  padding: 0.3em 1.3em 0.3em 0.3em; /* Normal padding for larger screens */

  /* Large tablets or small desktops */
  ${mediaQueries(40)`  
    font-size: calc(0.7em + 0.3vw);
    line-height: 1.4rem;
    padding: 0.3em 1.1em;
  `};

  /* Tablets */
  ${mediaQueries(30)`  
    font-size: calc(0.65em + 0.3vw);
    line-height: 1.3rem;
    padding: 0.25em 1em;
  `};

  /* Large phones */
  ${mediaQueries(25)`  
    font-size: calc(0.6em + 0.2vw); /* Smaller font size for phones */
    line-height: 1.2rem;
    padding: 0.2em 0.8em;
  `};

  /* Small phones */
  ${mediaQueries(20)`  
    font-size: calc(0.5em + 0.2vw); /* More compact for small phones */
    line-height: 1.1rem;
    padding: 0.2em 0.6em;
    margin: 8px 2px; /* Smaller margin */
  `};

  /* Scrollbar styling */
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
  gap: 0.5rem;
  overflow: hidden;
  flex-wrap: wrap;
  margin-bottom: 10px;
  justify-content: center;

  /* Large tablets or small desktops */
  @media (max-width: 1024px) {
    padding: 0.7rem 1.2rem;
    gap: 0.45rem;
  }

  /* Tablets */
  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    gap: 0.4rem;
  }

  /* Large phones */
  @media (max-width: 600px) {
    padding: 0.5rem 0.9rem;
    gap: 0.35rem;
  }

  /* Small phones */
  @media (max-width: 480px) {
    padding: 0.4rem 0.8rem;
    gap: 0.3rem;
    justify-content: flex-start;
  }

  /* Very small screens */
  @media (max-width: 360px) {
    padding: 0.3rem 0.6rem;
    gap: 0.25rem;
  }

  /* Smallest screens */
  @media (max-width: 320px) {
    padding: 0.2rem 0.5rem;
    gap: 0.2rem;
  }

  ${Box}:hover & {
    border-top: 4px solid ${(props) => props.theme.text};
  }
`;

const Tag = styled.span`
  margin-right: 0.1rem;
  font-size: calc(0.5em + 0.2vw); /* Responsive font-size */
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

  /* Large tablets or small desktops */
  @media (max-width: 1024px) {
    font-size: calc(0.45em + 0.2vw);
  }

  /* Tablets */
  @media (max-width: 768px) {
    font-size: calc(0.4em + 0.2vw);
  }

  /* Large phones */
  @media (max-width: 600px) {
    font-size: calc(0.38em + 0.2vw);
  }

  /* Small phones */
  @media (max-width: 480px) {
    font-size: calc(0.35em + 0.2vw);
  }

  /* Very small screens */
  @media (max-width: 360px) {
    font-size: calc(0.32em + 0.2vw);
    padding: 0.3em 0.4em;
  }

  /* Smallest screens */
  @media (max-width: 320px) {
    font-size: calc(0.3em + 0.2vw);
    padding: 0.2em 0.3em;
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
  justify-content: space-between; /* Align link and Git icon at the ends */
  width: 100%; /* Full width for flexibility */

  @media (max-width: 768px) {
    width: 100%; /* Ensure the container takes up full width on smaller screens */
  }
`;

const Link = styled(NavLink)`
  background-color: ${(props) => props.theme.body};
  color: ${(props) => props.theme.text};
  text-decoration: none;
  padding: 0.3rem calc(2rem + 2vw);
  border-radius: 0 0 0 30px;
  font-size: calc(0.65em + 0.5vw);
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  font-weight: bold;
  align-items: center;
  height: 1.8rem;
  max-width: 50%; /* Adjust width to ensure it doesn't overlap with Git icon */

  @media (max-width: 768px) {
    padding: 0.3rem 1.5rem;
    font-size: calc(0.6em + 0.4vw);
    max-width: 70%; /* Allow more width for smaller screens */
  }

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

  @media (max-width: 768px) {
    height: 2.4rem;
  }

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
  padding: 0.3rem calc(2rem + 2vw);
  border-radius: 0 0 0 30px;
  font-size: calc(0.65em + 0.5vw);
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  font-weight: bold;
  align-items: center;
  height: 1.8rem;
  max-width: 50%; /* Adjust width to ensure it doesn't overlap with Git icon */

  @media (max-width: 768px) {
    padding: 0.3rem 1.5rem;
    font-size: calc(0.6em + 0.4vw);
    max-width: 70%; /* Allow more width for smaller screens */
  }
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
    return <Link style={{ border: `3px solid ${borderColor}` }} to={{ pathname: `${demo}` }} target="_blank">PROJECT LINK</Link>;
  } else if (status === "Development") {
    return <Link2 style={{ border: `3px solid ${borderColor}` }}>Coming Soon</Link2>;
  } else if (status === "Maintenance") {
    return <Link2 style={{ border: `3px solid ${borderColor}` }}>UNAVAILABLE</Link2>;
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
  const { id, name, subtitle, description, tags, demo, github, status, imageUrl, date } = props.data;

  const [showImage, setShowImage] = useState(true);

  // Toggle state function
  const toggleView = () => {
    setShowImage((prev) => !prev);
  };

  return (
      <Box key={id} variants={item}>
        <Title className="animate__animated animate__flipInX animate__delay-1s">
          {name}
          <Subtitle>{subtitle}</Subtitle>
        </Title>
        <span className="tag">{date}</span>
        {/* Toggle between description and image */}
        {!showImage ? (
            <Description
                className="animate__animated animate__flipInX"
                onClick={toggleView} // Click to show image
            >
              {description}
            </Description>
        ) : (
            <>
              <motion.img
                  src={imageUrl}
                  className="animate__animated animate__flipX"
                  alt="Related Visual"
                  onClick={toggleView} // Click to show description
                  initial={{opacity: 0, scale: 0.8}}
                  animate={{opacity: 1, scale: 1}}
                  transition={{duration: 0.5}}
                  style={{
                    // width: "100%",
                    aspectRatio: "3/2", // Maintain a 16:9 aspect ratio
                    borderRadius: "8px",
                    padding: "3px",
                    cursor: "pointer",
                    objectFit: "cover", // Ensures the image fills the container while maintaining aspect ratio
                  }}
              />
            </>
        )}

        <Tags className="animate__animated animate__fadeInUp animate__delay-1s">
          {tags.map((t, id) => (
              <Tag key={id} onClick={() => handleTagClick(t)}>
                #{t}
              </Tag>
          ))}
        </Tags>

        <Footer className="animate__animated animate__fadeInUp animate__delay-1s">
          <FooterLinkContainer>
            {renderDemoLink(status, demo)}
            <Git to={{pathname: `${github}`}} className="hvr-grow" target="_blank">
              <Github height="100%"/>
            </Git>
          </FooterLinkContainer>
        </Footer>
      </Box>
  );
};

export default Card;
