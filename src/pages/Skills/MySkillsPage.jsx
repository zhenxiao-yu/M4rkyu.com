import { motion } from "framer-motion";
import styled, { ThemeProvider } from "styled-components";
import { lazy, Suspense } from "react";
import { lightTheme, mediaQueries } from "../../theme/Themes";
import { Design, Develope, Game, Datastore } from "../../assets/svg/AllSvgs";
import Loading from "../../components/Loading";
import SkillsSection from "../../components/Skills";
import { skills1, skills2, skills3, skills4 } from "../../assets/data/SkillsData";
import Seo from "../../components/Seo";
import AccessibleHeading from "../../components/AccessibleHeading";

// Lazy-loaded components for better performance
const SocialIcons = lazy(() => import("../../components/SocialIcons"));
const HomeButton = lazy(() => import("../../components/HomeButton"));
const LogoComponent = lazy(() => import("../../components/LogoComponent"));
const ParticlesComponent = lazy(() => import("../../components/ParticlesComponent"));
const BigTitle = lazy(() => import("../../components/BigTitle"));

const SVG_SIZE = 30;

// Styled Components
const Container = styled.div`
  background-color: ${({ theme }) => theme.body};
  width: 100vw;
  height: 120vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-y: auto;              

  ${mediaQueries(90)`height: auto; padding: 8rem 0;`};
  ${mediaQueries(70)`padding: 6rem 0;`};
  ${mediaQueries(50)`padding: 5rem 0;`};
  ${mediaQueries(30)`padding: 4rem 0;`};
`;

const GridBox = styled(motion.div)`
  margin-top: 10rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: 80%;
  justify-items: center;

  ${mediaQueries(90)`grid-template-columns: repeat(4, 1fr);`};
  ${mediaQueries(70)`grid-template-columns: repeat(2, 1fr);`};
  ${mediaQueries(50)`grid-template-columns: 1fr; width: 100%;`};
  ${mediaQueries(30)`width: 95%; gap: 0.5rem;`};
`;

const FixedComponents = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;

  ${mediaQueries(50)`top: 0.5rem; left: 0.5rem;`};
`;

const Main = styled(motion.div)`
  margin-top: 1em;
  border: 2px solid ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.body};
  padding: 1rem;
  width: 85%;
  border-radius: 10px;
  min-height: 20rem;
  z-index: 3;
  line-height: 1.4;
  font-family: "Poppins", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: 0.3s ease-in-out;

  ${mediaQueries(70)`width: 75%; padding: 1rem; line-height: 1.4;`};
  ${mediaQueries(50)`width: 70%; padding: 1rem;`};
  ${mediaQueries(30)`width: 90%; padding: 0.8rem; line-height: 1.3;`};

  &:hover {
    color: ${({ theme }) => theme.body};
    background-color: ${({ theme }) => theme.text};
  }
`;

const Title = styled.h2`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: calc(1.1em + 0.4vw);
  transition: 0.5s ease-in-out;
  margin-top: 1rem;
  margin-bottom: 3rem;
  

  ${mediaQueries(90)`font-size: calc(1em + 0.3vw); margin-bottom: 2rem;`};
  ${mediaQueries(70)`font-size: calc(0.9em + 0.2vw); margin-bottom: 1.5rem;`};
  ${mediaQueries(50)`font-size: calc(0.8em + 0.2vw); margin-bottom: 1rem;`};
`;

const Description = styled.section`
  color: ${({theme}) => theme.text};
  font-size: calc(1em + 0.3vw);
  padding: 0.3rem 0;
  font-weight: 500;
  font-family: "Karla", sans-serif;
  transition: 0.3s ease-in-out;

  strong {
    font-weight: 700;
    font-family: "Poppins", sans-serif;
  }

  ${Main}:hover & {
    color: ${({theme}) => theme.body};
  }

  ${mediaQueries(90)`font-size: calc(0.9em + 0.2vw);`};
  ${mediaQueries(70)`font-size: calc(0.8em + 0.2vw);`};
  ${mediaQueries(50)`font-size: calc(0.7em + 0.2vw);`};
  ${mediaQueries(30)`font-size: calc(0.6em + 0.1vw);`};

  ul, p {
    margin-left: 1.5rem;
  }
`;

const MySkillsPage = () => {
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Skills', path: '/skills' }
  ];
  const description =
    "Explore Mark Yu's skills in frontend, backend, creative technology, and art with the tools and frameworks he uses.";
  return (
      <ThemeProvider theme={lightTheme}>
        <AccessibleHeading>Skills and expertise of ZhenXiao (Mark) Yu</AccessibleHeading>
        <Seo
          title="Skills | Mark Yu"
          description={description}
          path="/skills"
          breadcrumbs={breadcrumbs}
          includePerson
          keywords="Mark Yu skills, Zhenxiao Yu engineering, frontend backend creative technology"
        />
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
              {/* Frontend Section */}
              <Main>
                <Title>
                  <Develope width={SVG_SIZE} height={SVG_SIZE} /> Frontend Development
                </Title>
                <Description>
                  Crafting visually stunning, responsive, and user-friendly interfaces that bring ideas to life. I focus on creating seamless interactions and beautiful designs.
                </Description>
                <Description>
                  <strong>Skills:</strong> <br />
                  <SkillsSection skills={skills1} />
                </Description>
              </Main>

              {/* Backend Section */}
              <Main>
                <Title>
                  <Datastore width={SVG_SIZE} height={SVG_SIZE} /> Backend Development
                </Title>
                <Description>
                  Building robust and scalable backend systems that ensure smooth application performance and secure data management.
                </Description>
                <Description>
                  <strong>Skills:</strong> <br />
                  <SkillsSection skills={skills2} />
                </Description>
              </Main>

              {/* Game Development Section */}
              <Main>
                <Title>
                  <Game width={35} height={35} /> Game Development
                </Title>
                <Description>
                  Creating immersive 2D and 3D games with innovative mechanics and captivating visuals. My work combines storytelling, dynamic gameplay, and artistic design.
                </Description>
                <Description>
                  <strong>Skills:</strong> <br />
                  <SkillsSection skills={skills3} />
                </Description>
              </Main>

              {/* Design and Art Section */}
              <Main>
                <Title>
                  <Design width={SVG_SIZE} height={SVG_SIZE} /> Design & Art
                </Title>
                <Description>
                  Merging artistic vision with technical expertise to deliver impactful designs. From digital art to interactive media, I aim to create unforgettable visual experiences.
                </Description>
                <Description>
                  <strong>Skills:</strong> <br />
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
