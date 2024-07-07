import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Me from "../../assets/Images/file2.png";
import { mediaQueries } from "../../theme/Themes";
import { Typewriter } from 'react-simple-typewriter';
import { BiUserCircle,  BiSolidMessageAltDetail,  BiSolidBriefcase, BiCheckCircle, BiImageAlt } from "react-icons/bi";

// outer box
const Box = styled(motion.div)`
  width: 55vw;
  display: flex;
  background: linear-gradient(
        to right,
        ${(props) => props.theme.body} 50%,
        ${(props) => props.theme.text} 50%
      )
      bottom,
    linear-gradient(
        to right,
        ${(props) => props.theme.body} 50%,
        ${(props) => props.theme.text} 50%
      )
      top;
  background-repeat: no-repeat;
  background-size: 100% 2px;
  border-left: 5px solid ${(props) => props.theme.body};
  border-right: 5px solid ${(props) => props.theme.text};
  z-index: 1;
  position: absolute;
  left: 50%;
  top: 50%;
  right: 0;
  transform: translate(-50%, -50%);

  ${mediaQueries(1200)`
    width: 65vw;
  `};

  ${mediaQueries(60)`
    width: 70vw;
  `};

  ${mediaQueries(50)`
    width: 70vw;
    background-size: 100% 2px;
    flex-direction:column;
    justify-content:space-between;
  `};

  ${mediaQueries(40)`
    width: 64vw;
  `};

  ${mediaQueries(30)`
     width: 64vw;
  `};
  ${mediaQueries(20)`
    width: 60vw;
  `};

  @media only screen and (max-width: 50em) {
    background: none;
    border: none;
    border-top: 5px solid ${(props) => props.theme.body};
    border-bottom: 5px solid ${(props) => props.theme.text};
    background-image: linear-gradient(
        ${(props) => props.theme.body} 50%,
        ${(props) => props.theme.text} 50%
      ),
      linear-gradient(
        ${(props) => props.theme.body} 50%,
        ${(props) => props.theme.text} 50%
      );
    background-size: 2px 100%;
    background-position: 0 0, 100% 0;
    background-repeat: no-repeat;
  }
`;

// inside box containing text and picture
const SubBox = styled.div`
  width: 50%;
  position: relative;
  display: flex;
  .pic {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 16.2%);
    width: 110%;
    height: auto;
  }
  ${mediaQueries(50)`
    width: 100%;
    height: 50%;
      .pic {
    width: 70%;
  }
  `};

  ${mediaQueries(40)`
    .pic {
      width: 80%;
  }
  `};

  ${mediaQueries(30)`
    .pic {
       width: 95%;
  }

  `};
  ${mediaQueries(20)`
     .pic {
   width: 80%;
 }
 `};
`;

// Text
const Text = styled(motion.div)`
  font-size: calc(1rem + 1.5vw);
  color: ${(props) => props.theme.body};
  padding: 2.5rem;
  cursor: pointer;
  display: flex;
  z-index:2;
  flex-direction: column;
  font-family: "Poppins", sans-serif;
  justify-content: space-evenly;
  letter-spacing: 1px;
  user-select: none;
  & > *:last-child {
    color: ${(props) => `rgba(${props.theme.bodyRgba},0.6)`};
    font-size: calc(0.5rem + 1.5vw);
    font-weight: 600;

    ${mediaQueries(40)`
        font-size: calc(0.5rem + 1vw);
  `};
  }

  ${mediaQueries(40)`
        font-size: calc(1rem + 1.5vw);
  `};
  ${mediaQueries(20)`
         padding: 1rem;
  `};
`;

const Navbar = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: space-evenly;
  justify-content: center;
  gap: 2rem;
  font-size: calc(0.5rem + 0.8vw);
  & > a {
    color: ${(props) => props.theme.body};
    text-decoration: none;
    padding: 0.8rem 1.4rem;
    width: 2.8rem;
    border-radius: 15px;
    transition: background 0.3s ease, color 0.3s ease;
    &:hover {
      background: ${(props) => props.theme.body};
      color: ${(props) => props.theme.text};
    }
  }

  ${mediaQueries(50)`
    flex-direction: row;
    align-items: center;
    gap: 0.2rem;
    & > a {
      padding: 0.5rem;
      width: 100%;
      text-align: center;
      font-size: calc(0.8rem + 0.2vw);
    }
  `};

  ${mediaQueries(30)`
    font-size: calc(0.7rem + 0.2vw);
  `};

  ${mediaQueries(20)`
    font-size: calc(0.7rem + 0.2vw);
  `};
`;

const Intro = () => {
  const [height, setHeight] = useState("55vh");

  useEffect(() => {
    if (window.matchMedia("(max-width: 50em)").matches) {
      setHeight("70vh");
    }
    if (window.matchMedia("(max-width: 20em)").matches) {
      setHeight("60vh");
    }
  }, []);

  return (
    <Box
      initial={{ height: 0 }}
      animate={{ height: height }}
      transition={{ type: "spring", duration: 2, delay: 1 }}
    >
      <SubBox>
        <Text>
          <h2>Hello,</h2>
          <h2>
            I'm
            <Typewriter
              words={[' Mark Yu', ' 于震潇 ']}
              loop={0}
              typeSpeed={100}
              deleteSpeed={80}
              delaySpeed={2000}
              cursor
            />
          </h2>
          <h6>
            &lt;div&gt; Software Engineer from Ontario, Canada &lt;/div&gt;
          </h6>
          <Navbar>
            <a href="/about"><BiUserCircle/></a>
            <a href="/post"><BiSolidMessageAltDetail/></a>
            <a href="/project"><BiSolidBriefcase /></a>
            <a href="/skills"><BiCheckCircle /></a>
            <a href="/gallery"><BiImageAlt /></a>
          </Navbar>
        </Text>
      </SubBox>
      <SubBox>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          min-width={{ minWidth: 100 }}
        >
          <img className="pic" src={Me} alt="My Pic" />
        </motion.div>
      </SubBox>
    </Box>
  );
};

export default Intro;
