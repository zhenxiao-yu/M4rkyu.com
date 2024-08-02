import { motion } from "framer-motion";
import styled, { ThemeProvider } from "styled-components";
import { lazy, Suspense } from "react";
import { lightTheme, mediaQueries } from "../../theme/Themes";
import { Design, Develope, Game, Datastore } from "../../assets/svg/AllSvgs";
import Loading from "../../components/Loading";
import SkillsSection from "../../components/Skills";
import { skills1, skills2, skills3, skills4 } from "../../assets/data/SkillsData";
import { Helmet } from "react-helmet";

const SocialIcons = lazy(() => import("../../components/SocialIcons"));
const HomeButton = lazy(() => import("../../components/HomeButton"));
const LogoComponent = lazy(() => import("../../components/LogoComponent"));
const ParticlesComponent = lazy(() => import("../../components/ParticlesComponent"));
const BigTitle = lazy(() => import("../../components/BigTitle"));

const SVG_SIZE = 30;

const Container = styled.div`
  background-color: ${({ theme }) => theme.body};
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-y: auto;
  padding: 4rem 1rem 2rem 1rem;

  ${mediaQueries(50)`
    height: auto;
    padding: 5rem 0;
  `};
`;

const GridBox = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 90%;
  justify-items: center;
  align-items: start;

  ${mediaQueries(70)`
    grid-template-columns: 1fr 1fr;
  `};

  ${mediaQueries(50)`
    grid-template-columns: 1fr;
    width: 90%;
  `};

  ${mediaQueries(30)`
    width: 95%;
  `};
`;

const FixedComponents = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  ${mediaQueries(50)`
    top: 0.5rem;
    left: 0.5rem;
  `};
`;

const Main = styled(motion.div)`
  margin-top: 0.5em;
  border: 2px solid ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.body};
  padding: 1rem;
  width: 93%;
  border-radius: 10px;
  height: auto;
  min-height: 20rem;
  z-index: 3;
  line-height: 1.2;
  font-family: "Poppins", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: 0.3s ease-in-out;

  ${mediaQueries(50)`
    width: 60%;
    line-height: 1.3;
  `};

  &:hover {
    color: ${({ theme }) => theme.body};
    background-color: ${({ theme }) => theme.text};
  }
`;

const Title = styled.h2`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: calc(0.6em + 0.4vw);
  transition: 0.5s ease-in-out;

  ${mediaQueries(60)`
    font-size: calc(0.6em + 0.8vw);
  `};

  ${mediaQueries(50)`
    font-size: calc(0.8em + 1.5vw);
    margin-bottom: 0.5rem;
  `};

  ${mediaQueries(30)`
    font-size: calc(0.8em + 0.8vw);
  `};

  ${mediaQueries(25)`
    font-size: calc(0.6em + 0.8vw);

    svg {
      width: 25px;
      height: 25px;
    }
  `};

  ${Main}:hover & {
    & > * {
      fill: ${({ theme }) => theme.body};
    }
  }

  & > *:first-child {
    margin-right: 0.5rem;
  }
`;

const Description = styled.section`
  color: ${({ theme }) => theme.text};
  font-size: calc(0.5em + 0.3vw);
  padding: 0.3rem 0;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-family: "Karla", sans-serif;
  transition: 0.3s ease-in-out;

  strong {
    font-weight: 700;
    font-family: "Poppins", sans-serif;
  }

  ${Main}:hover & {
    color: ${({ theme }) => theme.body};
  }

  ${mediaQueries(50)`
    font-size: calc(0.6em + 0.8vw);
  `};

  ${mediaQueries(30)`
    font-size: calc(0.55em + 0.8vw);
  `};

  ${mediaQueries(25)`
    font-size: calc(0.4em + 0.8vw);
  `};

  strong {
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  ul,
  p {
    margin-left: 1.5rem;
  }
`;

const MySkillsPage = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <Helmet>
        <title>Mark's Skills and Expertise</title>
        <meta name="description" content="Skills, what I like to work with" />
      </Helmet>
      <Suspense fallback={<Loading />}>
        <Container>
          <FixedComponents>
            <LogoComponent theme="light" />
            <HomeButton />
            <SocialIcons theme="light" />
          </FixedComponents>
          <ParticlesComponent theme="light" />
          <GridBox
            key="skills"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <Main>
              <Title>
                <Develope width={SVG_SIZE} height={SVG_SIZE} /> Frontend
              </Title>
              <Description>
                I specialize in frontend development, transforming brand visions into engaging, responsive user interfaces that feature innovative designs and seamless functionality.
              </Description>
              <Description>
                <strong>Ask me about...</strong> <br />
                <SkillsSection skills={skills1} />
              </Description>
              <Description>
                <strong>Tools</strong> <br />
                <ul>
                  <li><h4>IDE:</h4> WebStorm, VScode</li>
                  <li><h4>Package Managers:</h4> NPM / Yarn</li>
                  <li><h4>Deployment:</h4> Vercel, Google Cloud Platform</li>
                  <li><h4>Testing:</h4> Jest, Cypress</li>
                  <li><h4>Build Tools:</h4> Webpack, Babel</li>
                </ul>
              </Description>
            </Main>

            <Main>
              <Title>
                <Datastore width={SVG_SIZE} height={SVG_SIZE} /> Backend
              </Title>
              <Description>
                I enjoy building scalable and efficient backend systems that power applications with robust, secure solutions, effectively supporting organizational objectives.
              </Description>
              <Description>
                <strong>Ask me about...</strong> <br />
                <SkillsSection skills={skills2} />
              </Description>
              <Description>
                <strong>Tools</strong> <br />
                <ul>
                  <li><h4>IDE:</h4> Intellij, Visual Studio</li>
                  <li><h4>DevOps Tools:</h4> Docker, Jenkins, Kubernetes</li>
                  <li><h4>Testing:</h4> JUnit, Mockito, Postman</li>
                  <li><h4>Database Management:</h4> Navicat, Tableplus, SSMS</li>
                  <li><h4>Version Control:</h4> Git, GitHub, GitLab</li>
                </ul>
              </Description>
            </Main>

            <Main>
              <Title>
                <Game width={35} height={35} /> Game Development
              </Title>
              <Description>
                I create engaging <h4>2D and 3D games</h4> with <h4>innovative mechanics</h4> and <h4>stunning visuals</h4>. My goal is to deliver <h4>captivating and immersive experiences</h4> for both solo and team players. By combining <h4>creativity and technical skills</h4>, I make sure each game looks great and is fun to play. Whether it's through <h4>interesting storylines</h4>, <h4>dynamic gameplay</h4>, or <h4>eye-catching graphics</h4>, I aim to make games that players will enjoy and remember.
              </Description>
              <Description>
                <strong>Ask Me About...</strong> <br />
                <SkillsSection skills={skills3} />
              </Description>
            </Main>

            <Main>
              <Title>
                <Design width={SVG_SIZE} height={SVG_SIZE} /> Design / Art
              </Title>
              <Description>
                I've been drawing since I was six, and now as a <h4>software engineer</h4>, I blend <h4>art and technology</h4> to create designs that really stand out. I focus on <h4>simplicity</h4> and <h4>impactful aesthetics</h4> to make <h4>memorable visual experiences</h4>. By combining my <h4>creative vision</h4> with <h4>technical skills</h4>, I ensure my designs are both visually stunning and effective. Whether it's <h4>digital media</h4>, <h4>graphic design</h4>, or <h4>interactive experiences</h4>, I aim to make work that leaves a lasting impression.
              </Description>
              <Description>
                <strong>Ask Me About...</strong> <br />
                <SkillsSection skills={skills4} />
              </Description>
            </Main>
          </GridBox>
          <BigTitle text="Skills" top="80%" right="30%" />
        </Container>
      </Suspense>
    </ThemeProvider>
  );
};

export default MySkillsPage;
