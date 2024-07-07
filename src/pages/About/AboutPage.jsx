import { motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import styled, { keyframes, ThemeProvider } from 'styled-components';
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { MdOutlineWorkOutline } from "react-icons/md";

import { DarkTheme, mediaQueries } from '../../theme/Themes';
import astronaut from '../../assets/Images/spaceman.png';
import Loading from '../../components/Loading';

// Lazy-loaded Components
const SocialIcons = lazy(() => import('../../components/SocialIcons'));
const HomeButton = lazy(() => import('../../components/HomeButton'));
const LogoComponent = lazy(() => import('../../components/LogoComponent'));
const ParticlesComponent = lazy(() => import('../../components/ParticlesComponent'));
const BigTitle = lazy(() => import('../../components/BigTitle'));

const Box = styled(motion.div)`
  background-color: ${(props) => props.theme.body};
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const float = keyframes`
  0% { transform: translateY(-10px); }
  50% { transform: translateY(15px) translateX(15px); }
  100% { transform: translateY(-10px); }
`;

const SpaceMan = styled(motion.div)`
  position: absolute;
  top: 10%;
  right: 5%;
  animation: ${float} 4s ease infinite;
  width: 20vw;
  img {
    width: 100%;
    height: auto;
  }
`;

const Main = styled(motion.div)`
  border: 2px solid ${(props) => props.theme.text};
  color: ${(props) => props.theme.text};
  padding: 2.4rem;
  border-radius: 0.5rem;
  width: 70vw;
  max-height: 68vh;
  overflow-y: auto;
  z-index: 3;
  line-height: 2.2;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: calc(0.75rem + 0.5vw);
  backdrop-filter: blur(6px);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: "Poppins", sans-serif;
  letter-spacing: 1.2px;
  font-weight: 500;

  & h2 {
    font-size: 1.5em;
    margin-bottom: 1rem;
    color: ${(props) => props.theme.text};
  }

  & p {
    margin-bottom: 1.5rem;
  }

  &::-webkit-scrollbar {
    width: 0.4rem;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-image: linear-gradient(180deg, #733bdb 0%, #5ac6a5 52%, #ffffff 100%);
    border-radius: 2rem;
  }

  ${mediaQueries(40)`
    width: 60vw;
    max-height: 70vh;
    font-size: calc(0.95rem + 0.4vw);
  `};

  ${mediaQueries(30)`
    width: 53vw;
    max-height: 70vh;
    font-size: calc(0.95rem + 0vw);
    padding: 1.5rem;
  `};

  ${mediaQueries(20)`
    padding: 1rem;
    font-size: calc(0.8rem + 0.8vw);
  `};
`;

const ExperienceCardContainer = styled.div`
  background: ${(props) => props.theme.text};
  color: ${(props) => props.theme.text};
`;

const ExperienceCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const ExperienceCardTitle = styled.h3`
  color: ${(props) => props.theme.body};
  font-size: 1.3rem;
  font-weight: bold;
`;

const ExperienceCardCompany = styled.p`
  color: ${(props) => props.theme.body};;
  font-size: 2rem;
  font-weight: semi-bold;
  margin: 0;
`;

const ExperienceCardList = styled.ul`
  margin-top: 1rem;
  list-style-type: disc;
  margin-left: 1.25rem;
`;

const ExperienceCardListItem = styled.li`
  color: ${(props) => props.theme.body};
  font-size: 14px;
  padding-left: 0.25rem;
  letter-spacing: wider;
  e
`;

const ExperienceCard = ({ experience }) => {
  return (
    <VerticalTimelineElement
      contentStyle={{
        background: 'rgb(250, 243, 227)',
        color: 'rgb(8, 9, 10)',
      }}
      contentArrowStyle={{ borderRight: '15px solid rgb(250, 243, 227)' }}
      date={experience.date}
      iconStyle={{ background: experience.iconBg }}
      icon={<MdOutlineWorkOutline size={24} />}
    >
      <ExperienceCardContainer>
        <ExperienceCardHeader>
          <ExperienceCardTitle>{experience.title}</ExperienceCardTitle>
          <ExperienceCardCompany>{experience.company_name}</ExperienceCardCompany>
        </ExperienceCardHeader>
        <ExperienceCardList>
          {experience.points.map((point, index) => (
            <ExperienceCardListItem key={`experience-point-${index}`}>
              {point}
            </ExperienceCardListItem>
          ))}
        </ExperienceCardList>
      </ExperienceCardContainer>
    </VerticalTimelineElement>
  );
};

const experiences = [
  {
    title: "Software Developer Intern",
    company_name: "J.D. Power",
    iconBg: "rgb(8, 9, 10)",
    date: "May 2022 - Aug 2023",
    points: [
      "Developed full-stack systems and gained extensive experience in backend data processing, using tools like Java, MySQL, Spring Boot, Apache Storm, and Apache Camel.",
      "Managed intricate data systems, developed full-stack web applications, and enhanced user interfaces.",
    ],
  },
  {
    title: "Undergrad Research Assistant",
    company_name: "Western University",
    iconBg: "rgb(8, 9, 10)",
    date: "May 2021 - August 2021",
    points: [
      "Working on various projects and gaining valuable industry experience.",
    ],
  },
];

const AboutPage = () => {
  return (
    <ThemeProvider theme={DarkTheme}>
      <Suspense fallback={<Loading />}>
        <Box
          key="skills"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <LogoComponent theme="dark" />
          <HomeButton />
          <SocialIcons theme="dark" />
          <ParticlesComponent theme="dark" />

          <SpaceMan
            initial={{ right: '-20%', top: '100%' }}
            animate={{
              right: '5%',
              top: '10%',
              transition: { duration: 2, delay: 0.5 },
            }}
          >
            <img src={astronaut} alt="spaceman" />
          </SpaceMan>

          <Main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1, delay: 1 } }}
          >
            <div className="textDir">
              <h2>Overview</h2>
              <p>Thanks for visiting! My name is Mark Yu. As an artist and software engineer based in Ontario, Canada, I enjoy combining my technical expertise with artistic flair to create cutting-edge digital solutions. Originally from China, my journey brought me to Saskatchewan, where my fascination with computer science began in high school and has shaped my path ever since.</p>

              <h2>Education</h2>
              <p>I earned a degree in software engineering from Western University in 2024. My time there, filled with research and internships, laid the foundation for my career. Throughout my journey, I’ve consistently developed resilient systems that prioritize performance, user-friendliness, and aesthetic appeal.</p>

              <h2>Work Experience</h2>
              <VerticalTimeline>
                {experiences.map((experience, index) => (
                  <ExperienceCard
                    key={`experience-${index}`}
                    experience={experience}
                  />
                ))}
              </VerticalTimeline>
              <p>Currently, I’m taking a break from traditional employment to explore new technologies, travel, and work on personal projects that fuel my creativity. I focus on crafting intuitive and visually captivating digital experiences that redefine user interaction with technology.</p>
              <p>I’m passionate about leveraging my skills and creativity to address real-world challenges through innovative solutions. My experience spans managing complex data systems, designing 2D/3D games, developing full-stack web applications, and enhancing user interfaces. If you’re interested in collaboration and exchanging ideas, let’s connect and explore the potential of technology together. Reach out, and let’s create something remarkable!</p>
            </div>
          </Main>
          <BigTitle text="ABOUT" top="10%" left="5%" />
        </Box>
      </Suspense>
    </ThemeProvider>
  );
};

export default AboutPage;
