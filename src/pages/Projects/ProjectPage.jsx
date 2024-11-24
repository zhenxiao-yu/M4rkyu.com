import { motion } from "framer-motion";
import { useEffect, useRef, lazy, Suspense } from "react";
import styled, { ThemeProvider, keyframes } from "styled-components";
import { Spinner } from "../../assets/svg/AllSvgs";
import { Project } from "../../assets/data/ProjectData";
import { DarkTheme, mediaQueries } from "../../theme/Themes";
import Card from "../../components/Card";
import Loading from "../../components/Loading";
import { Helmet } from "react-helmet";

// Lazy-loaded components
const SocialIcons = lazy(() => import("../../components/SocialIcons"));
const HomeButton = lazy(() => import("../../components/HomeButton"));
const LogoComponent = lazy(() => import("../../components/LogoComponent"));
const BigTitle = lazy(() => import("../../components/BigTitle"));

const Box = styled(motion.div)`
  background-color: ${(props) => props.theme.body};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 500vh;
  overflow: hidden;
`;

const Main = styled(motion.ul)`
  position: fixed;
  top: 12rem;
  left: calc(10rem + 15vw);
  user-select: none;
  display: flex;
  padding-bottom: 2rem;
  
  ${mediaQueries(50)`
    left: calc(8rem + 15vw);
  `};

  ${mediaQueries(40)`
    top: 24%;
    left: calc(6rem + 15vw);
  `};

  ${mediaQueries(40)`
    left: calc(2rem + 15vw);
  `};

  ${mediaQueries(25)`
    left: calc(1rem + 15vw);
  `};
`;

const Rotate = styled.span`
  display: block;
  position: fixed;
  right: 1rem;
  top: 1rem;
  width: 85px;
  height: 85px;
  z-index: 1;

  ${mediaQueries(40)`
    width: 60px;
    height: 60px;
    svg {
      width: 60px;
      height: 60px;
    }
  `};

  ${mediaQueries(25)`
    width: 50px;
    height: 50px;
    svg {
      width: 50px;
      height: 50px;
    }
  `};
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const Arrow = styled(motion.div)`
  position: fixed;
  bottom: 6rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  cursor: pointer;
  animation: ${bounce} 2s infinite;

  svg {
    width: 30px;
    height: 40px;
    fill: ${(props) => props.theme.text};
  }
`;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      duration: 0.5,
    },
  },
};

// Sorting function
const sortProjects = (projects) => {
  const statusOrder = ["Ready", "Development", "Maintenance"];
  return projects.sort((a, b) => {
    const statusComparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    if (statusComparison !== 0) {
      return statusComparison; // Sort by status first
    }
    return a.id - b.id; // Sort by id as a secondary criterion
  });
};


const ProjectPage = () => {
  const ref = useRef(null);
  const gearlogo = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const element = ref.current;
      const scrollPosition = window.pageYOffset;

      if (element) {
        element.style.transform = `translateX(${-scrollPosition}px)`;
      }

      if (gearlogo.current) {
        gearlogo.current.style.transform = `rotate(${-scrollPosition}deg)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const sortedProjects = sortProjects(Project);

  return (
    <ThemeProvider theme={DarkTheme}>
      <Helmet>
        <title>Projects by Mark Yu</title>
        <meta name="description" content="Projects: Showcasing what I've been working on." />
      </Helmet>
      <Suspense fallback={<Loading />}>
        <Box
          key="project"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 1 } }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <LogoComponent theme="dark" />
          <HomeButton />
          <SocialIcons theme="dark" />

          <Main ref={ref} variants={container} initial="hidden" animate="show">
            {sortedProjects.map((d) => (
              <Card key={d.id} data={d} />
            ))}
          </Main>

          <BigTitle text="PROJECTS" top="10%" right="20%" />

          <Rotate ref={gearlogo}>
            <Spinner width={85} height={85} fill={DarkTheme.text} />
          </Rotate>

          <Arrow>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 21l-12-18h24z" />
            </svg>
          </Arrow>
        </Box>
      </Suspense>
    </ThemeProvider>
  );
};

export default ProjectPage;
