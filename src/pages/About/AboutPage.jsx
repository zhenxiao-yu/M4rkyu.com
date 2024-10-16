import { motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useRef } from 'react';
import styled, { keyframes, ThemeProvider } from 'styled-components';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { MdOutlineWorkOutline, MdOutlineMail, MdOutlineLocalPhone, MdOutlineHouse } from "react-icons/md";
import { FaDiscord } from "react-icons/fa6";
import { BsArrowReturnRight } from "react-icons/bs";
import Me2 from "../../assets/Images/pfp2.png";
import { DarkTheme, mediaQueries } from '../../theme/Themes';
import astronaut from '../../assets/Images/spaceman.png';
import Loading from '../../components/Loading';
import { Helmet } from 'react-helmet';

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
  padding: 5rem;
  border-radius: 0.5rem;
  width: 65vw;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
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
  font-weight: 400;

  & h2 {
    font-size: 1.4em;
    margin-bottom: 1rem;
    color: ${(props) => props.theme.text};
  }

  & p {
    margin-bottom: 1.5rem;
  }

  & a {
    color: ${(props) => props.theme.text};
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
    width: 66vw;
    max-height: 70vh;
    font-size: calc(0.80rem + 0.4vw);
  `};

  ${mediaQueries(30)`
    width: 60vw;
    max-height: 75vh;
    font-size: calc(0.75rem + 0vw);
    padding: 1rem;
  `};

  ${mediaQueries(20)`
    padding: 1rem;
    font-size: calc(0.7rem + 0.8vw);
  `};
`;

const ContactSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 2rem;

  ${mediaQueries(40)`
    flex-direction: column;
    align-items: center;
  `};
`;

const ContactDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  & p {
    display: flex;
    align-items: center;
    margin: 0.2rem 0;
    font-size: 0.65rem;
  }

  a{
    text-decoration: none;
  }

  & svg {
    margin-right: 0.5rem;
  }
`;

const ProfilePicture = styled.img`
  width: 17vw;
  height: auto;
  margin-left: 2rem;
  border-radius: 50%;
  filter: grayscale(100%);
  border: 10px solid ${(props) => props.theme.text};

  ${mediaQueries(40)`
    width: 40vw;
    margin-left: 0;
    margin-top: 1rem;
  `};
`;

const ExperienceCardContainer = styled.div`
  background: ${(props) => props.theme.text};
  color: ${(props) => props.theme.body};
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
  line-height: 0.9rem;

  ${mediaQueries(40)`
    font-size: 16px;
    line-height: 0.9rem;
  `};

  ${mediaQueries(30)`
    font-size: 14px;
    line-height: 0.9rem;
  `};
`;

const ExperienceCardDate = styled.h3`
  color: ${(props) => props.theme.body};
  font-size: 1.1rem;
  margin-top: 0.9rem;
  font-weight: 400;
  line-height: 1.3rem;

  ${mediaQueries(40)`
   font-size: 0.8rem;
    line-height: 1.1rem;
  `};

  ${mediaQueries(30)`
    font-size: 0.75rem;
    line-height: 0.95rem;
  `};
`;

const ExperienceCardCompany = styled.p`
  color: ${(props) => props.theme.body};
  font-size: 1.5rem;
  font-weight: semi-bold;
  margin: 0;
`;

const ExperienceCardList = styled.ul`
  margin-top: 1rem;
  list-style-type: disc;
  margin-left: 1.25rem;

  ${mediaQueries(30)`
    margin-left: 1rem;
    margin-top: 0.5rem;
  `};
`;

const ExperienceCardListItem = styled.li`
  color: ${(props) => props.theme.body};
  font-size: 15px;
  padding-left: 0.25rem;
  letter-spacing: wider;

  ${mediaQueries(40)`
    font-size: 12px;
    line-height: 0.9rem;
  `};

  ${mediaQueries(30)`
    font-size: 10px;
  `};
`;

const ExperienceCard = ({ experience }) => {
  return (
    <VerticalTimelineElement
      contentStyle={{
        background: 'rgb(236, 233, 232)',
        color: 'rgb(8, 9, 10)',
      }}
      contentArrowStyle={{ borderRight: '15px solid rgb(236, 233, 232)' }}
      date={""}
      iconStyle={{ background: experience.iconBg }}
      icon={<MdOutlineWorkOutline size={24} />}
    >
      <ExperienceCardContainer>
        <ExperienceCardHeader>
          <ExperienceCardTitle>{experience.title}</ExperienceCardTitle>
          <ExperienceCardDate>{experience.date}</ExperienceCardDate>
          <ExperienceCardCompany>{experience.company_name}</ExperienceCardCompany>
        </ExperienceCardHeader>
        <ExperienceCardList>
          {experience.points.map((point, index) => (
            <ExperienceCardListItem key={`experience-point-${index}` }>
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
      "Designed and developed full-stack systems, specializing in backend data processing using Java, MySQL, Spring Boot, Apache Storm, and Apache Camel.",
      "Managed and optimized complex data systems, created robust full-stack web applications, and improved user interfaces for enhanced user experience.",
    ],
  },
  {
    title: "Undergrad Research Assistant",
    company_name: "Western University",
    iconBg: "rgb(8, 9, 10)",
    date: "May 2021 - August 2021",
    points: [
      "Contributed to the development of Augmented Reality environments for neurosurgical simulation applications using Vuforia and Unity3D.",
      "Assisted in preparing a grant proposal to re-implement surgical training systems using Unreal Engine for deployment on Magic Leap headsets.",
      "Developed a software toolkit for creating virtual worlds on the Magic Leap One AR headset, utilizing patient datasets from CT and MRI scans.",
    ],
  },
];

const AboutPage = () => {
  return (
    <ThemeProvider theme={DarkTheme}>
      <Helmet>
        <title>About Me - Mark Yu</title>
        <meta name="description" content="Learn more about Mark Yu, a full-stack web developer and artist based in Ontario, Canada." />
      </Helmet>
      <Suspense fallback={<Loading />}>
        <Box
          key="about"
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
            <img src={astronaut} alt="Spaceman floating" />
          </SpaceMan>

          <Main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1, delay: 1 } }}
          >
            <ContactSection>
              <ContactDetails className="animate__animated animate__zoomInDown animate__delay-1s">
                <p className="hvr-icon-forward">
                  <FaDiscord className="hvr-icon" size="1.3em" />
                  <a href="https://discordapp.com/users/m4rkyu" target="_blank" rel="noopener noreferrer">
                    DISCORD: m4rkyu
                  </a>
                </p>
                <p className="hvr-icon-forward">
                    <MdOutlineMail size="1.3em" /> 
                    <a href="mailto:zyu347@uwo.ca">
                        EMAIL: zyu347@uwo.ca
                    </a>
                </p>
                <p className="hvr-icon-forward"><MdOutlineLocalPhone className="hvr-icon" size="1.3em" /> CELL: +1 306 581-5556</p>
                <p className="hvr-icon-forward"><MdOutlineHouse className="hvr-icon" size="1.3em" /> MAIL: 2382 Brairgrove Cir</p>
                <p className="hvr-icon-forward"><BsArrowReturnRight className="hvr-icon" size="1.3em" /> Oakville, ON L6M 5A3</p>
              </ContactDetails>
              <ProfilePicture src={Me2} alt="Mark Yu" />
            </ContactSection>

            <div>
              <h2 className='hvr-skew-forward'>Overview</h2>
              <p>Welcome to my website! I'm <strong>Mark Yu</strong>, an artist and full-stack web developer based in <u>Ontario, Canada</u>. I am passionate about combining design and engineering to create software that is both visually captivating and functional, focusing on delivering engaging user experiences.</p>

              <p>Born in <strong>ChangChun, China</strong> in 2001, I moved to <u><a className="hvr-sweep-to-top" href="https://en.wikipedia.org/wiki/Saskatchewan" target="_blank" rel="noopener noreferrer">Saskatchewan, Canada</a></u> in 2013. During high school, a computer science elective sparked my interest in coding, which led me to study software engineering at <u><a className="hvr-sweep-to-top" href="https://www.uwo.ca/" target="_blank" rel="noopener noreferrer">Western University</a></u>. This journey laid a strong foundation for my career in software development.</p>

              <p>On this site, you'll find a blend of my artwork, software projects, and blog posts that explore my creative process at the intersection of art and technology.</p>



              <h2 className='hvr-skew-forward'>Professional Skills</h2>
            <p>As a full-stack developer, I build robust, user-friendly applications that solve real-world problems. My expertise spans technologies like <strong><a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a></strong>, <strong><a href="https://www.mysql.com/" target="_blank" rel="noopener noreferrer">MySQL</a></strong>, <strong><a href="https://spring.io/projects/spring-boot" target="_blank" rel="noopener noreferrer">Spring Boot</a></strong>, <strong><a href="https://storm.apache.org/" target="_blank" rel="noopener noreferrer">Apache Storm</a></strong>, and <strong><a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js</a></strong>. I have experience creating interactive user interfaces, managing complex data systems, and integrating APIs to deliver seamless experiences. Beyond web development, I enjoy creating games and pursuing creative projects that blend art with technology.</p>

              <h2 className='hvr-skew-forward'>Work Experience</h2>
              <VerticalTimeline>
                {experiences.map((experience, index) => (
                  <ExperienceCard key={`experience-${index}`} experience={experience} />
                ))}
              </VerticalTimeline>
              <br />

              <h2 className='hvr-skew-forward'>Personal Interests</h2>
              <p>Outside of coding, I love traveling and capturing the beauty around me through painting. Travel and art are major sources of inspiration that fuel my creativity and influence my work. Whether hiking through landscapes or experimenting with different mediums, these experiences enhance my perspective as both a developer and an artist.</p>

              <h2 className='hvr-skew-forward'>Current Focus</h2>
              <p>I am currently taking a break from traditional work to explore emerging technologies, travel, and work on projects that spark my creativity. This period allows me to experiment and push boundaries. If you're interested in collaborating, I'd love to connect—let's create something extraordinary together!</p>
            </div>
    

          </Main>
          <BigTitle text="ABOUT" top="10%" left="5%" />
        </Box>
      </Suspense>
    </ThemeProvider>
  );
};

export default AboutPage;
