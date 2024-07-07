import { motion } from "framer-motion";
import styled, { ThemeProvider } from "styled-components";
import { lazy, Suspense } from "react";
import { lightTheme, mediaQueries } from "../../theme/Themes";

import { Design, Develope, Game, Datastore} from "../../assets/svg/AllSvgs";
import Loading from "../../components/Loading"; // Loading component

// Lazy-loaded components
const SocialIcons = lazy(() => import("../../components/SocialIcons"));
const HomeButton = lazy(() => import("../../components/HomeButton"));
const LogoComponent = lazy(() => import("../../components/LogoComponent"));
const ParticlesComponent = lazy(() => import("../../components/ParticlesComponent"));
const BigTitle = lazy(() => import("../../components/BigTitle"));

// Constants for SVG dimensions
const SVG_SIZE = 40;

const Container = styled.div`
  background-color: ${({ theme }) => theme.body};
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow-y: auto;
  padding: 2rem 1rem 3rem 1rem;

  ${mediaQueries(50)`
    height: auto;
    padding: 4rem 0;
  `};
`;

const GridBox = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  width: 80%;
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
  top: 2rem;
  left: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  ${mediaQueries(50)`
    top: 1rem;
    left: 1rem;
  `};
`;

const Main = styled(motion.div)`
  border: 2px solid ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.body};
  padding: 2rem;
  width: 100%;
  height: auto;
  min-height: 20rem;

  z-index: 3;
  line-height: 1.5;
  font-family: "Poppins", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${mediaQueries(50)`
    width: 60%;
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
  font-size: calc(1em + 1vw);

  ${mediaQueries(60)`
    font-size: calc(0.8em + 1vw);
  `};

  ${mediaQueries(50)`
    font-size: calc(1em + 2vw);
    margin-bottom: 1rem;
  `};

  ${mediaQueries(30)`
    font-size: calc(1em + 1vw);
  `};

  ${mediaQueries(25)`
    font-size: calc(0.8em + 1vw);

    svg {
      width: 30px;
      height: 30px;
    }
  `};

  ${Main}:hover & {
    & > * {
      fill: ${({ theme }) => theme.body};
    }
  }

  & > *:first-child {
    margin-right: 1rem;
  }
`;

const Description = styled.div`
  color: ${({ theme }) => theme.text};
  font-size: calc(0.4em + 0.6vw);
  padding: 0.3rem 0;

  ${Main}:hover & {
    color: ${({ theme }) => theme.body};
  }

  ${mediaQueries(50)`
    font-size: calc(0.7em + 1vw);
  `};

  ${mediaQueries(30)`
    font-size: calc(0.65em + 1vw);
  `};

  ${mediaQueries(25)`
    font-size: calc(0.5em + 1vw);
  `};

  strong {
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  ul,
  p {
    margin-left: 2rem;
  }
`;

const MySkillsPage = () => {
  return (
    <ThemeProvider theme={lightTheme}>
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
                I value the business or brand for which I'm creating, thus I enjoy bringing new ideas to life.
              </Description>
              <Description>
                <strong>Skills</strong> <br />
                <p>
                  HTML, CSS, JS, React, Redux, Sass, Bootstrap, Tailwind, Firebase, etc.
                </p>
              </Description>
              <Description>
                <strong>Tools</strong> <br />
                <p>VSCode, GitHub, CodePen, etc.</p>
              </Description>
            </Main>

            <Main>
              <Title>
                <Datastore width={SVG_SIZE} height={SVG_SIZE} /> Backend
              </Title>
              <Description>
                I enjoy building scalable and efficient backend systems that support business objectives.
              </Description>
              <Description>
                <strong>Skills</strong> <br />
                <p>
                  Node.js, Express, MongoDB, SQL, REST APIs, GraphQL, etc.
                </p>
              </Description>
              <Description>
                <strong>Tools</strong> <br />
                <p>Postman, Docker, Kubernetes, etc.</p>
              </Description>
            </Main>

            <Main>
              <Title>
                <Game width={SVG_SIZE} height={SVG_SIZE}/> Game Dev
              </Title>
              <Description>
                I create engaging and interactive games that provide a captivating user experience.
              </Description>
              <Description>
                <strong>Skills</strong> <br />
                <p>
                  Unity, C#, Unreal Engine, 3D Modeling, etc.
                </p>
              </Description>
              <Description>
                <strong>Tools</strong> <br />
                <p>Blender, Visual Studio, GitHub, etc.</p>
              </Description>
            </Main>

            <Main>
              <Title>
                <Design width={SVG_SIZE} height={SVG_SIZE} /> Design
              </Title>
              <Description>
                I love to create designs that speak, keeping them clean, minimal, and simple.
              </Description>
              <Description>
                <strong>I like to Design</strong> <br />
                <ul>
                  <li>Web Design</li>
                  <li>Mobile Apps</li>
                </ul>
              </Description>
              <Description>
                <strong>Tools</strong> <br />
                <ul>
                  <li>Figma</li>
                </ul>
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
