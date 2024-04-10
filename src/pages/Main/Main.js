import styled, { keyframes } from "styled-components";
import { NavLink } from "react-router-dom";
import { lazy, Suspense, useState, useEffect} from "react";
import { motion } from "framer-motion";

//Components
import { CodeCircle } from "../../assets/svg/AllSvgs";
import Intro from "../Intro/Intro";
import Loading from "../../components/Loading";
import { mediaQueries } from "../../theme/Themes";

const SocialIcons = lazy(() => import("../../components/SocialIcons"));
const LogoComponent = lazy(() => import("../../components/LogoComponent"));

const MainContainer = styled(motion.div)`
  background: ${(props) => props.theme.body};
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  user-select: none;

  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: "Karla", sans-serif;
    font-weight: 500;
  }

  h2 {
    ${mediaQueries(40)`
      font-size:1.2em;
  `};

    ${mediaQueries(30)`
      font-size:1em;
  `};
  }
`;

const Container = styled.div`
  padding: 2rem;
`;

const rotate = keyframes`
from {
    transform: rotate(0) ;
  }
  to {
    transform: rotate(360deg) ;
  }
`;

const Center = styled.button`
  position: absolute;
  top: ${(props) => (props.click ? "85%" : "50%")};
  left: ${(props) => (props.click ? "92%" : "50%")};
  transform: translate(-50%, -50%);
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 1s ease;
  & > *:first-child {
    animation: ${rotate} infinite 8s linear;
  }
  & > *:last-child {
    display: ${(props) => (props.click ? "none" : "inline-block")};
    padding-top: 1rem;
  }

  @media only screen and (max-width: 50em) {
    top: ${(props) => (props.click ? "90%" : "50%")};
    left: ${(props) => (props.click ? "90%" : "50%")};
    width: ${(props) => (props.click ? "80px" : "150px")};
    height: ${(props) => (props.click ? "80px" : "150px")};
  }
  @media only screen and (max-width: 30em) {
    width: ${(props) => (props.click ? "40px" : "150px")};
    height: ${(props) => (props.click ? "40px" : "150px")};
  }
`;

const Contact = styled(NavLink)`
  color: ${(props) => (props.click ? props.theme.body : props.theme.text)};
  position: absolute;
  top: 2rem;
  right: calc(1rem + 2vw);
  text-decoration: none;
  z-index: 1;
`;

const BLOG = styled(NavLink)`
  color: ${(props) => (props.click ? props.theme.body : props.theme.text)};
  position: absolute;
  top: 48%;
  right: calc(1rem + 2vw);
  transform: rotate(90deg) translate(-50%, -50%);
  z-index: 1;
  text-decoration: none;
  @media only screen and (max-width: 50em) {
    text-shadow: ${(props) => (props.click ? "0 0 3px #101010, 1px 1px 5px #000" : "none")};
  }
`;

const PROJECT = styled(NavLink)`
  color: ${(props) => (props.click ? props.theme.body : props.theme.text)};
  position: absolute;
  top: 47%;
  left: calc(1rem + 2vw);
  transform: translate(-50%, -50%) rotate(-90deg);
  z-index: 1;
  text-decoration: none;
  @media only screen and (max-width: 50em) {
    text-shadow: ${(props) => (props.click ? "0 0 3px #101010, 1px 1px 5px #000" : "none")};
  }
`;

const BottomBar = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: space-evenly;
`;

const ABOUT = styled(NavLink)`
  color: ${(props) => (props.click ? props.theme.body : props.theme.text)};
  text-decoration: none;
  z-index: 1;
  bottom: 1.2rem;
`;

const SKILLS = styled(NavLink)`
  color: ${(props) => props.theme.text};
  text-decoration: none;
  bottom: 1.2rem;
`;

const DarkDiv = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 50%;
  width: ${(props) => (props.click ? "50%" : "0%")};
  background-color: #101010;
  height: ${(props) => (props.click ? "100%" : "0%")};
  transition: height 0.5s ease, width 1s ease 0.5s;
  z-index: 1;
  ${(props) =>
    props.click
      ? mediaQueries(50)`
       height: 50%;
  right:0;
  width: 100%;
  transition: width 0.5s ease, height 1s ease 0.5s;
  `
      : mediaQueries(50)`
       height: 0;
  
  width: 0;
  `};
`;


const Main = () => {
  const [click, setClick] = useState(false);
  const [path, setpath] = useState("");
  const handleClick = () => setClick(!click);
  const moveY = {
    y: "-100%",
  };
  const moveX = {
    x: `${path === "project" ? "100%" : "-100%"}`,
  };
  const mq = window.matchMedia("(max-width: 50em)").matches;


  useEffect(() => {
    const handleResize = () => {
      window.location.reload();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);



  return (
    <Suspense fallback={<Loading />}>
      <MainContainer
        key="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={path === "about" || path === "skills" ? moveY : moveX}
        transition={{ duration: 0.5 }}
      >
        <DarkDiv click={click} />
        <Container>
          <LogoComponent theme={click ? "dark" : "light"} />
          {mq ? (
            <SocialIcons theme="light" />
          ) : (
            <SocialIcons theme={click ? "dark" : "light"} />
          )}
          <Center click={click}>
            {mq ? (
              <CodeCircle
                onClick={() => handleClick()}
                width={click ? 80 : 150}
                height={click ? 80 : 150}
                fill="#101010"
              />
            ) : (
              <CodeCircle
                onClick={() => handleClick()}
                width={click ? 120 : 200}
                height={click ? 120 : 200}
                fill="#101010"
              />
            )}
            <h2>
              <i className="far fa-arrow-alt-circle-up"></i> start here{" "}
              <i className="far fa-arrow-alt-circle-up"></i>
            </h2>
          </Center>

          {/* Contact Link */}
          {mq ? (
            <Contact
              click={+click}
              target="_blank"
              to={{ pathname: "mailto:zyu347@uwo.ca" }}
            >
              <motion.h2
                initial={{
                  y: -200,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                animate={{
                  y: 0,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.85 }}
              >
                Contact
              </motion.h2>
            </Contact>
          ) : (
            <Contact
              click={+false}
              target="_blank"
              to={{ pathname: "mailto:zyu347@uwo.ca" }}
            >
              <motion.h2
                initial={{
                  y: -200,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                animate={{
                  y: 0,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.85 }}
              >
                Email Me
              </motion.h2>
            </Contact>
          )}

          {/* Blog Link */}
          {mq ? (
            <BLOG click={+click} onClick={() => setpath("blog")} to="/post">
              <motion.h2
                initial={{
                  y: -200,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                animate={{
                  y: 0,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                whileHover={{ rotate: -90, scale: 1.3 }}
                whileTap={{ rotate: -90, scale: 0.85 }}
              >
                Blog
              </motion.h2>
            </BLOG>
          ) : (
            <BLOG click={+false} onClick={() => setpath("blog")} to="/post">
              <motion.h2
                initial={{
                  y: -200,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                animate={{
                  y: 0,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                whileHover={{ rotate: -90, scale: 1.3 }}
                whileTap={{ rotate: -90, scale: 0.85 }}
              >
                Blog
              </motion.h2>
            </BLOG>
          )}

          {/* Project Link */}
          <PROJECT click={+click} to="/project">
            <motion.h2
              onClick={() => setpath("project")}
              initial={{
                y: -200,
                transition: { type: "spring", duration: 1.5, delay: 1 },
              }}
              animate={{
                y: 0,
                transition: { type: "spring", duration: 1.5, delay: 1 },
              }}
              whileHover={{ translateY: 25, rotate: 90, scale: 1.3 }}
              whileTap={{ translateY: 25, rotate: 90, scale: 0.85 }}
            >
              Projects
            </motion.h2>
          </PROJECT>

          {/* About Link */}
          <BottomBar>
            <ABOUT
              onClick={() => setClick(false)}
              click={mq ? +false : +click}
              to="/about"
            >
              <motion.h2
                onClick={() => setpath("about")}
                initial={{
                  y: 200,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                animate={{
                  y: 0,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.85 }}
              >
                About
              </motion.h2>
            </ABOUT>


            {/* Skills Link */}
            <SKILLS to="/skills">
              <motion.h2
                onClick={() => setpath("skills")}
                initial={{
                  y: 200,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                animate={{
                  y: 0,
                  transition: { type: "spring", duration: 1.5, delay: 1 },
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.85 }}
              >
                Skills
              </motion.h2>
            </SKILLS>
          </BottomBar>
        </Container>

        {click ? <Intro click={click} /> : null}
      </MainContainer>
    </Suspense>
  );
};

export default Main;
