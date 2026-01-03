import React, { lazy, Suspense, useState, useCallback, useMemo, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import './Main.css';
// Components
import { CodeCircle } from '../../assets/svg/AllSvgs';
import Intro from '../Intro/Intro';
import Loading from '../../components/Loading';
import Greeting from '../../components/Greeting';
import { mediaQueries } from '../../theme/Themes';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import useAssetPreloader from '../../hooks/useAssetPreloader';
import videoBg from '../../assets/Images/videobg.webm';
import videoBg2 from '../../assets/Images/videobg2.webm';
import mePortrait from '../../assets/Images/me-pic.jpg';
import Seo from '../../components/Seo';
import AccessibleHeading from '../../components/AccessibleHeading';

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

const Gallery = styled(NavLink)`
  color: ${(props) => (props.click || props.isMobile ? props.theme.body : props.theme.text)};
  position: absolute;
  top: 2rem;
  right: calc(1rem + 2vw);
  text-decoration: none;
  z-index: 1;
`;

const BLOG = styled(NavLink)`
  color: ${(props) => (props.click || props.isMobile ? props.theme.body : props.theme.text)};
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
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const assetPreloadList = useMemo(
    () => [
      { type: 'video', src: videoBg },
      { type: 'video', src: videoBg2 },
      { type: 'image', src: mePortrait },
    ],
    []
  );

  useAssetPreloader(assetPreloadList);

  const handleClick = useCallback(() => {
    setClick((prevClick) => !prevClick);
  }, []);

  useEffect(() => {
    setIsVideoReady(false);
  }, [click]);

  const handleVideoReady = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const breadcrumbs = [
    { name: 'Home', path: '/' }
  ];

  const homepageDescription =
    "Portfolio of ZhenXiao (Mark) Yu: software engineer, creative technologist, and game developer based in Canada.";

  const moveY = useMemo(() => ({ y: '-100%' }), []);
  const moveX = useMemo(() => ({ x: `${path === 'project' ? '100%' : '-100%'}` }), [path]);
  const exitAnimation = useMemo(() => (path === 'about' || path === 'skills' ? moveY : moveX), [moveX, moveY, path]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia('(max-width: 50em)');
    const updateMatch = (event) => setIsMobile(event.matches);

    // Initialize state on mount
    updateMatch(mediaQuery);

    mediaQuery.addEventListener('change', updateMatch);
    return () => mediaQuery.removeEventListener('change', updateMatch);
  }, []);

  return (
    <>
      <AccessibleHeading>Home | ZhenXiao (Mark) Yu portfolio</AccessibleHeading>
      <Seo
        title="Mark Yu | Software Engineer & Creative Technologist"
        description={homepageDescription}
        path="/"
        breadcrumbs={breadcrumbs}
        includePerson
        keywords="Mark Yu portfolio, Zhenxiao Yu software engineer, creative technologist, game developer"
      />
      <Helmet>
        <link rel="preload" href={videoBg} as="video" type="video/webm" />
        <link rel="preload" href={videoBg2} as="video" type="video/webm" />
        <link rel="preload" href={mePortrait} as="image" fetchpriority="high" />
      </Helmet>
      <Suspense fallback={<Loading />}>
        <MainContainer
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={exitAnimation}
          transition={{ duration: 0.5 }}
        >
          {prefersReducedMotion || !isVideoReady ? (
            <div className="video-placeholder" aria-hidden="true" />
          ) : null}
          {!prefersReducedMotion && (
            !click ? (
              <video
                src={videoBg}
                autoPlay
                loop
                playsInline
                muted
                preload="auto"
                className={`video-background ${isVideoReady ? 'is-visible' : ''}`}
                aria-hidden="true"
                onLoadedData={handleVideoReady}
              />
            ) : (
              <video
                src={videoBg2}
                autoPlay
                loop
                playsInline
                muted
                preload="auto"
                playbackRate={0.5}
                className={`video-background ${isVideoReady ? 'is-visible' : ''}`}
                aria-hidden="true"
                onLoadedData={handleVideoReady}
              />
            )
          )}
          <DarkDiv click={click} />
          <Container>
            <LogoComponent theme={click ? 'dark' : 'light'} />
            <SocialIcons theme={click ? (isMobile ? 'light' : 'dark') : 'light'} />
            <Center click={click} type="button" aria-label={click ? 'Pause background animation' : 'Activate interactive mode'}>
              <CodeCircle
                onClick={handleClick}
                width={click ? (isMobile ? 100 : 120) : (isMobile ? 150 : 200)}
                height={click ? (isMobile ? 100 : 120) : (isMobile ? 150 : 200)}
                fill="#101010"
              />
              <Greeting />
            </Center>
            <Gallery
              click={click && isMobile}
              isMobile={isMobile}
              onClick={() => setPath('gallery')}
              to="/gallery"
              aria-label="View photography gallery"
            >
              <motion.h2
                initial={{ y: -200, transition: { type: 'spring', duration: 1.5, delay: 1 } }}
                animate={{ y: 0, transition: { type: 'spring', duration: 1.5, delay: 1 } }}
                whileHover={{ scale: 1.2, fontWeight: 'bold' }}
                whileTap={{ scale: 0.85 }}
              >
                MY PHOTOS
              </motion.h2>
            </Gallery>
            <BLOG
              click={click && isMobile}
              isMobile={isMobile}
              onClick={() => setPath('blog')}
              to="/post"
              aria-label="Read recent posts"
            >
              <motion.h2
                initial={{ y: -200, transition: { type: 'spring', duration: 1.5, delay: 1 } }}
                animate={{ y: 0, transition: { type: 'spring', duration: 1.5, delay: 1 } }}
                whileHover={{ scale: 1.3, fontWeight: 'bold' }}
                whileTap={{ scale: 0.85 }}
              >
                MY POSTS
              </motion.h2>
            </BLOG>
            <PROJECT click={+click} to="/project">
              <motion.h2
                onClick={() => setPath('project')}
                initial={{ y: -200, transition: { type: 'spring', duration: 1.5, delay: 1 } }}
                animate={{ y: 0, transition: { type: 'spring', duration: 1.5, delay: 1 } }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
              >
                MY PROJECTS
              </motion.h2>
            </PROJECT>
            <BottomBar>
              <ABOUT
                onClick={() => setClick(false)}
                click={isMobile ? +false : +click}
                to="/about"
                aria-label="Learn more about Mark"
              >
                <motion.h2
                  onClick={() => setPath('about')}
                  initial={{ y: 200, transition: { type: 'spring', duration: 1.5, delay: 1 } }}
                  animate={{ y: 0, transition: { type: 'spring', duration: 1.5, delay: 1 } }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                >
                  ABOUT ME
                </motion.h2>
              </ABOUT>
              <SKILLS onClick={() => setPath('skills')} to="/skills" aria-label="See skills and services">
                <motion.h2
                  initial={{ y: 200, transition: { type: 'spring', duration: 1.5, delay: 1 } }}
                  animate={{ y: 0, transition: { type: 'spring', duration: 1.5, delay: 1 } }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                >
                  WHAT I DO
                </motion.h2>
              </SKILLS>
            </BottomBar>
          </Container>
          {click && <Intro click={click} />}
        </MainContainer>
      </Suspense>
    </>
  );
};

export default Main;
