import { motion } from "framer-motion";
import { useEffect, useRef, lazy, Suspense } from "react";
import styled, { ThemeProvider } from "styled-components";
import { Spinner } from "../../assets/svg/AllSvgs";
import { Project } from "../../assets/data/ProjectData";
import { DarkTheme, mediaQueries } from "../../theme/Themes";
import Card from "../../components/Card";
import Loading from "../../components/Loading";

const SocialIcons = lazy(() => import("../../components/SocialIcons"));
const HomeButton = lazy(() => import("../../components/HomeButton"));
const LogoComponent = lazy(() => import("../../components/LogoComponent"));
const BigTitle = lazy(() => import("../../components/BigTitle"));

const Box = styled(motion.div)`
  background-color: ${(props) => props.theme.body};
  position: relative;
  display: flex;
  height: 400vh;
`;

const Main = styled(motion.ul)`
  position: fixed;
  top: 12rem;
  left: calc(10rem + 15vw);
  user-select: none;
  height: 40vh;
  display: flex;

  ${mediaQueries(50)`
        left:calc(8rem + 15vw);
  `};

  ${mediaQueries(40)`
        top: 30%;
        left:calc(6rem + 15vw);
  `};

  ${mediaQueries(40)`
        left:calc(2rem + 15vw);
  `};
  ${mediaQueries(25)`
        left:calc(1rem + 15vw);
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
     width:60px;
     height:60px;   
     svg{
       width:60px;
       height:60px;
     }
  `};
  ${mediaQueries(25)`
    width:50px;
    height:50px;
    svg{
      width:50px;
      height:50px;
    }
  `};
`;

const Arrow = styled(motion.div)`
  position: fixed;
  bottom: 7rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  cursor: pointer;

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
      staggerChildren: 0.5,
      duration: 0.5,
    },
  },
};

// Sorting function
const sortProjects = (projects) => {
  const statusOrder = ["Ready", "Development", "Maintenance"];
  return projects.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
};

const ProjectPage = () => {
  const ref = useRef(null);
  const gearlogo = useRef(null);

  useEffect(() => {
    let element = ref.current;

    const rotate = () => {
      element.style.transform = `translateX(${-window.pageYOffset}px)`;
      return (gearlogo.current.style.transform = "rotate(" + -window.pageYOffset + "deg)");
    };

    window.addEventListener("scroll", rotate);
    return () => {
      window.removeEventListener("scroll", rotate);
    };
  }, []);

  const sortedProjects = sortProjects(Project);

  return (
    <ThemeProvider theme={DarkTheme}>
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

          <Arrow
            initial={{ y: 0 }}
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
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
