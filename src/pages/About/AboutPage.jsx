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
  font-size: calc(0.6rem + 0.5vw);
  backdrop-filter: blur(6px);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: "karla", sans-serif;
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
    font-size: calc(0.7rem + 0.4vw);
    backdrop-filter: blur(3px);
  `};

  ${mediaQueries(30)`
    width: 55vw;
    max-height: 70vh;
    backdrop-filter: none;
    font-size: calc(0.8rem + 0vw);
    padding: 1.5rem;
    backdrop-filter: blur(3px);
  `};

  ${mediaQueries(20)`
    padding: 1rem;
    font-size: calc(0.7rem + 0.8vw);
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
            Welcome! I'm Mark Yu, a passionate software engineer known for blending technical prowess with artistic flair to create cutting-edge digital solutions. My journey began in China and led me to Saskatchewan, Canada,
            where my fascination with computer science ignited during my high school years, shaping my path ever since.
            <br />
            <br />
            I pursued my academic dreams at Western University, graduating in 2024 with a degree in software engineering. During my time there, I immersed myself in meaningful research and internships,
            establishing a strong foundation for my professional path.
            I've consistently focused on building resilient systems that excel in performance while emphasizing user-friendliness and aesthetic elegance.
            <br />
            <br />
            Currently, I'm taking a break from conventional employment to explore the world, delve into emerging technologies, and work on personal projects that reignite my innovative spirit.
            My goal is to craft digital experiences that are both intuitive and visually captivating, redefining how users interact with technology.
            <br />
            <br />
            With a proven track record in managing intricate data systems, developing full-stack web applications, and enhancing user interfaces,
            I'm eager to leverage my skills and creativity to address real-world challenges with innovative solutions. If you're passionate about collaboration and idea exchange,
            let's join forces to push the boundaries of technology. Reach out, and let's explore the possibilities together!
          </Main>
          <BigTitle text='ABOUT' top='10%' left='5%' />
        </Box>
      </Suspense>
    </ThemeProvider>
  )
}

export default AboutPage
