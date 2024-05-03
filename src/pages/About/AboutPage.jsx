import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import styled, { keyframes, ThemeProvider } from 'styled-components'

import { DarkTheme, mediaQueries } from '../../theme/Themes'
import astronaut from "../../assets/Images/spaceman.png";
import Loading from '../../components/Loading';
 import { Canvas } from "@react-three/fiber";
import { Experience } from '../../components/Experience';
//Components
const SocialIcons = lazy(() => import('../../components/SocialIcons'))
const HomeButton = lazy(() => import('../../components/HomeButton'))
const LogoComponent = lazy(() => import('../../components/LogoComponent'))
const ParticlesComponent = lazy(() =>import('../../components/ParticlesComponent'))
const BigTitle = lazy(() => import('../../components/BigTitle'))


const Box = styled(motion.div)`
  background-color: ${(props) => props.theme.body};
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`

const float = keyframes`
0% { transform: translateY(-10px)         }
    50% { transform: translateY(15px) translateX(15px)        }
    100% { transform: translateY(-10px)         }
`

const SpaceMan = styled(motion.div)`
  position: absolute;
  top: 10%;
  right: 5%;
  animation: ${float} 4s ease infinite;
  width:20vw;
  img{
    width:100%;
    height:auto;
  }
`
const Main = styled(motion.div)`
  border: 2px solid ${(props) => props.theme.text};
  color: ${(props) => props.theme.text};
  padding: 3rem;
  border-radius: 0.5rem;
  width: 50vw;
  max-height: 55vh;
  overflow-y: auto;
  z-index: 3;
  line-height: 2;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align items to the top */
  font-size: calc(0.75rem + 0.5vw);
  backdrop-filter: blur(6px);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: "Poppins", sans-serif;
  font-style: italic;
  font-weight: 400; /* Use bold font weight */

  &::-webkit-scrollbar {
    width: 0.4rem; /* Width of the scrollbar */
    background: transparent;
  }


  &::-webkit-scrollbar-thumb {
    background-image: linear-gradient(180deg, #733bdb 0%, #5ac6a5 52%, #ffffff 100%);
    border-radius: 2rem; /* Rounded corners */
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--body-color-light); /* Hover color */
  }

  ${mediaQueries(40)`
    width: 60vw;
    max-height: 70vh;
    font-size: calc(0.95rem + 0.4vw);
    backdrop-filter: blur(3px);
  `};

  ${mediaQueries(30)`
    width: 53vw;
    max-height: 70vh;
    backdrop-filter: none;
    font-size: calc(0.95rem + 0vw);
    padding: 1.5rem;
    backdrop-filter: blur(3px);
  `};

  ${mediaQueries(20)`
    padding: 1rem;
    font-size: calc(0.8rem + 0.8vw);
    backdrop-filter: blur(3px);
  `};
`;



const AboutPage = () => {
  return (
    <ThemeProvider theme={DarkTheme}>
      <Suspense fallback={<Loading/>}>
        <Box
          key='skills'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}>
          <LogoComponent theme='dark' />
          <HomeButton />
          <SocialIcons theme='dark' />
          <ParticlesComponent theme='dark' />

          <SpaceMan
            initial={{ right: '-20%', top: '100%' }}
            animate={{
              right: '5%',
              top: '10%',
              transition: { duration: 2, delay: 0.5 },
            }}>
              <img src={astronaut}  alt="spaceman" />
          </SpaceMan>
          <Main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1, delay: 1 } }}>
            Thanks for visiting! My name is Mark Yu. As an artist and software engineer based in Ontario, Canada,
            I enjoy combining my technical expertise with artistic flair to create cutting-edge digital solutions. Originally from China, my journey brought me to Saskatchewan, where my fascination with computer science began in high school and has shaped my path ever since.
            <br />
            <br />
            I earned a degree in software engineering from Western University in 2024. My time there, filled with research and internships, laid the foundation for my career.
            Throughout my journey, I’ve consistently developed resilient systems that prioritize performance, user-friendliness, and aesthetic appeal.
            <br />
            <br />
            Currently, I’m taking a break from traditional employment to explore new technologies, travel, and work on personal projects that fuel my creativity.
            I focus on crafting intuitive and visually captivating digital experiences that redefine user interaction with technology.
            <br />
            <br />
            I’m passionate about leveraging my skills and creativity to address real-world challenges through innovative solutions.
            My experience spans managing complex data systems, designing 2D/3D games, developing full-stack web applications, and enhancing user interfaces. If you’re interested in collaboration and exchanging ideas,
            let’s connect and explore the potential of technology together. Reach out, and let’s create something remarkable!

          </Main>
          <BigTitle text='ABOUT' top='10%' left='5%' />
        </Box>
      </Suspense>
    </ThemeProvider>
  )
}

export default AboutPage
