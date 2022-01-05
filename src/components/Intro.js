import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Me from "../assets/Images/sus.png";
import { mediaQueries } from "./Themes";

// outer box
const Box = styled(motion.div)`
  /* width: 50vw;
height:50vh;
 */
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
  border-left: 5px groove ${(props) => props.theme.body};
  border-right: 5px groove ${(props) => props.theme.text};
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
    width: 50vw;
    background-size: 100% 2px;
    flex-direction:column;
    justify-content:space-between;
  `};

  ${mediaQueries(40)`
    width: 60vw;
  `};

  ${mediaQueries(30)`
    width: 70vw;
  `};
  ${mediaQueries(20)`
    width: 60vw;
  `};

  @media only screen and (max-width: 50em) {
    background: none;
    border: none;
    border-top: 5px groove ${(props) => props.theme.body};
    border-bottom: 5px groove ${(props) => props.theme.text};
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

  //height:55vh;
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
    transform: translate(-50%, 0%);
    width: 100%;
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
    width: 90%;
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
  padding: 2rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  user-select: none;
  & > *:last-child {
    color: ${(props) => `rgba(${props.theme.bodyRgba},0.6)`};
    font-size: calc(0.5rem + 1.5vw);
    font-weight: 300;
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

const Intro = () => {
  // inner box height
  const [height, setHeight] = useState("55vh");
  // change width based on platform
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
          <h1>Howdy,</h1>

          <h3>My name is <br/> Mark Yu.</h3>

          <h5>I'm an artist and a software engineer based in Ontario, CA. </h5>

          <h6>
            Feel free to explore my portfolio website using the links around the
            edges...
          </h6>
        </Text>
      </SubBox>
      <SubBox>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 3 }}
        >
          <img className="pic" src={Me} alt="My Pic" />
        </motion.div>
      </SubBox>
    </Box>
  );
};

export default Intro;
