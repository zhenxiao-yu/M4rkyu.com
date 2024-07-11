import React, { lazy, Suspense, useState, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CgMail } from 'react-icons/cg';
import { Helmet } from 'react-helmet';
import './Main.css';

// Components
import { CodeCircle } from '../../assets/svg/AllSvgs';
import Intro from '../Intro/Intro';
import Loading from '../../components/Loading';
import Greeting from '../../components/Greeting';
import { mediaQueries } from '../../theme/Themes';
import videoBg from '../../assets/Images/videobg.webm';
import videoBg2 from '../../assets/Images/videobg2.webm';

const SocialIcons = lazy(() => import('../../components/SocialIcons'));
const LogoComponent = lazy(() => import('../../components/LogoComponent'));

const MainContainer = styled(motion.div)`
  background: ${(props) => props.theme.body};
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  user-select: none;

  h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
  }

  h2 {
    ${mediaQueries(40)`
      font-size: 1.2em;
    `};

    ${mediaQueries(30)`
      font-size: 1em;
    `};
  }
`;

const Container = styled.div`
  padding: 2rem;
`;

const rotate = keyframes`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Center = styled.button`
  position: absolute;
  top: ${(props) => (props.click ? '85%' : '50%')};
  left: ${(props) => (props.click ? '90%' : '50%')};
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
    display: ${(props) => (props.click ? 'none' : 'inline-block')};
  }

  @media only screen and (max-width: 50em) {
    top: ${(props) => (props.click ? '90%' : '50%')};
    left: ${(props) => (props.click ? '90%' : '50%')};
    width: ${(props) => (props.click ? '100px' : '150px')};
    height: ${(props) => (props.click ? '100px' : '150px')};
  }

  @media only screen and (max-width: 30em) {
    width: ${(props) => (props.click ? '80px' : '150px')};
    height: ${(props) => (props.click ? '80px' : '150px')};
  }
`;

const Contact = styled(NavLink)`
  color: ${(props) => (props.click || props.mq ? props.theme.body : props.theme.text)};
  position: absolute;
  top: 2rem;
  right: calc(1rem + 2vw);
  text-decoration: none;
  z-index: 1;
`;

const BLOG = styled(NavLink)`
  color: ${(props) => (props.click || props.mq ? props.theme.body : props.theme.text)};
  position: absolute;
  top: 46%;
  right: calc(-0.6rem + 2vw);
  transform: rotate(90deg) translate(-50%, -80%);
  z-index: 1;
  text-decoration: none;

  @media only screen and (max-width: 50em) {
    text-shadow: ${(props) => (props.click ? '0 0 3px #101010, 1px 1px 5px #000' : 'none')};
  }
`;

const PROJECT = styled(NavLink)`
  color: ${(props) => (props.click ? props.theme.body : props.theme.text)};
  position: absolute;
  top: 42%;
  left: calc(1.5rem + 2vw);
  transform: translate(-50%, -50%) rotate(-90deg);
  z-index: 1;
  text-decoration: none;

  @media only screen and (max-width: 50em) {
    text-shadow: ${(props) => (props.click ? '0 0 3px #101010, 1px 1px 5px #000' : 'none')};
  }
`;

const BottomBar = styled.div`
  position: absolute;
  bottom: 2rem;
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
  bottom: 1.5rem;
`;

const SKILLS = styled(NavLink)`
  color: ${(props) => props.theme.text};
  text-decoration: none;
  bottom: 1.5rem;
`;

const DarkDiv = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 50%;
  width: ${(props) => (props.click ? '50%' : '0%')};
  background-color: rgb(8,9,10);
  height: ${(props) => (props.click ? '100%' : '0%')};
  transition: height 0.5s ease, width 1s ease 0.5s;
  z-index: 1;

  ${(props) =>
    props.click
      ? mediaQueries(50)`
          height: 50%;
          right: 0;
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
  const [path, setPath] = useState('');

  const handleClick = useCallback(() => {
    setClick((prevClick) => !prevClick);
  }, []);

  const moveY = useMemo(() => ({ y: '-100%' }), []);
  const moveX = useMemo(() => ({ x: `${path === 'project' ? '100%' : '-100%'}` }), [path]);
  const mq = useMemo(() => window.matchMedia('(max-width: 50em)').matches, []);

  return (
    <>
      <Helmet>
        <title>My Portfolio</title>
        <meta name="description" content="Welcome to my portfolio website." />
      </Helmet>
      <Suspense fallback={<Loading />}>
        <MainContainer
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={path === 'about' || path === 'skills' ? moveY : moveX}
          transition={{ duration: 0.5 }}
        >
          {!click ? (
            <video
              src={videoBg}
              autoPlay
              loop
              playsInline
              muted
              className="video-background"
              loading="lazy"
            />
          ) : 
            <video
              src={videoBg2}
              autoPlay
              loop
              playsInline
              muted
              playbackRate={0.5}
              className="video-background"
              loading="lazy"
            />
          }
          <DarkDiv click={click} />
          <Container>
            <LogoComponent theme={click ? 'dark' : 'light'} />
            {mq ? (
              <SocialIcons theme="light" />
            ) : (
              <SocialIcons theme={click ? 'dark' : 'light'} />
            )}
            <Center click={click}>
              {mq ? (
                <CodeCircle
                  onClick={handleClick}
                  width={click ? 100 : 150}
                  height={click ? 100 : 150}
                  fill="#101010"
                />
              ) : (
                <CodeCircle
                  onClick={handleClick}
                  width={click ? 120 : 200}
                  height={click ? 120 : 200}
                  fill="#101010"
                />
              )}
              <Greeting />
            </Center>

            <Contact
              click={click && mq}
              target="_blank"
              to={{ pathname: 'mailto:zyu347@uwo.ca' }}
            >
              <motion.h2
                initial={{
                  y: -200,
                  transition: { type: 'spring', duration: 1.5, delay: 1 },
                }}
                animate={{
                  y: 0,
                  transition: { type: 'spring', duration: 1.5, delay: 1 },
                }}
                whileHover={{ scale: 1.2, fontWeight: 'bold' }}
                whileTap={{ scale: 0.85 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CgMail style={{ marginRight: '2px' }} size="1.3em" /> EMAIL ME
                </div>
              </motion.h2>
            </Contact>

            <BLOG click={click && mq} onClick={() => setPath('blog')} to="/post">
              <motion.h2
                initial={{
                  y: -200,
                  transition: { type: 'spring', duration: 1.5, delay: 1 },
                }}
                animate={{
                  y: 0,
                  transition: { type: 'spring', duration: 1.5, delay: 1 },
                }}
                whileHover={{ scale: 1.3, fontWeight: 'bold' }}
                whileTap={{ scale: 0.85 }}
              >
                MY POSTS
              </motion.h2>
            </BLOG>

            <PROJECT click={+click} to="/project">
              <motion.h2
                onClick={() => setPath('project')}
                initial={{
                  y: -200,
                  transition: { type: 'spring', duration: 1.5, delay: 1 },
                }}
                animate={{
                  y: 0,
                  transition: { type: 'spring', duration: 1.5, delay: 1 },
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
              >
                MY PROJECTS
              </motion.h2>
            </PROJECT>

            <BottomBar>
              <ABOUT onClick={() => setClick(false)} click={mq ? +false : +click} to="/about">
                <motion.h2
                  onClick={() => setPath('about')}
                  initial={{
                    y: 200,
                    transition: { type: 'spring', duration: 1.5, delay: 1 },
                  }}
                  animate={{
                    y: 0,
                    transition: { type: 'spring', duration: 1.5, delay: 1 },
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                >
                  ABOUT ME
                </motion.h2>
              </ABOUT>

              <SKILLS to="/skills">
                <motion.h2
                  onClick={() => setPath('skills')}
                  initial={{
                    y: 200,
                    transition: { type: 'spring', duration: 1.5, delay: 1 },
                  }}
                  animate={{
                    y: 0,
                    transition: { type: 'spring', duration: 1.5, delay: 1 },
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                >
                  WHAT I DO
                </motion.h2>
              </SKILLS>
            </BottomBar>
          </Container>

          {click ? <Intro click={click} /> : null}
        </MainContainer>
      </Suspense>
    </>
  );
};

export default Main;
