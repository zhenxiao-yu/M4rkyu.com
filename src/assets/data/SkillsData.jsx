import { FaHtml5, FaCss3Alt, FaJsSquare, FaReact, FaVuejs, FaSass, FaJava, FaPython   } from 'react-icons/fa';
import { TbBrandRedux, TbBrandTailwind, TbBrandBulma, TbBrandNextjs } from 'react-icons/tb';
import { BiLogoJquery, BiLogoSpringBoot  } from 'react-icons/bi';
import { SiTypescript, SiRedis, SiExpress, SiCanva, SiAffinitydesigner, SiSketchup , SiAdobephotoshop , SiAdobepremierepro, SiAdobeillustrator,SiMaterialdesignicons , SiMongodb, SiGit, SiApachestorm, SiUnrealengine, SiCsharp, SiCplusplus, SiBlender, SiApachekafka, SiSolidity , SiMysql, SiMicrosoftsqlserver   } from 'react-icons/si';
import { GiCamel } from "react-icons/gi";
import { FaUnity, FaFigma  } from "react-icons/fa";
import { MdZoomOutMap } from "react-icons/md";
import { PiVirtualReality } from "react-icons/pi";
// Correctly create the array of skills
export const skills1 = [
  { name: 'HTML5', level: 100, icon: <FaHtml5 />, link: 'https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5' },
  { name: 'CSS3', level: 95, icon: <FaCss3Alt />, link: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
  { name: 'JavaScript', level: 90, icon: <FaJsSquare />, link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { name: 'React', level: 85, icon: <FaReact />, link: 'https://reactjs.org/' },
  { name: 'Vue', level: 60, icon: <FaVuejs />, link: 'https://vuejs.org/' },
  { name: 'Redux', level: 80, icon: <TbBrandRedux />, link: 'https://redux.js.org/' },
  { name: 'Tailwind', level: 80, icon: <TbBrandTailwind />, link: 'https://tailwindcss.com/' },
  { name: 'jQuery', level: 70, icon: <BiLogoJquery />, link: 'https://jquery.com/' },
  { name: 'Typescript', level: 70, icon: <SiTypescript />, link: 'https://www.typescriptlang.org/' },
  { name: 'Sass', level: 90, icon: <FaSass />, link: 'https://sass-lang.com/' },
  { name: 'Bulma', level: 95, icon: <TbBrandBulma />, link: 'https://bulma.io/' },
  { name: 'Next.js', level: 80, icon: <TbBrandNextjs />, link: 'https://nextjs.org/' },
];

export const skills2 = [
  { name: 'Java', level: 90, icon: <FaJava />, link: 'https://www.java.com/en/' },
  { name: 'SpringBoot', level: 90, icon: <BiLogoSpringBoot />, link: 'https://spring.io/projects/spring-boot' },
  { name: 'Redis', level: 70, icon: <SiRedis />, link: 'https://redis.io/documentation' },
  { name: 'Express', level: 95, icon: <SiExpress />, link: 'https://expressjs.com/' },
  { name: 'Storm', level: 85, icon: <SiApachestorm />, link: 'https://storm.apache.org/documentation/Home.html' },
  { name: 'Camel', level: 65, icon: <GiCamel />, link: 'https://camel.apache.org/manual/latest/index.html' },
  { name: 'Python', level: 70, icon: <FaPython />, link: 'https://www.python.org/doc/' },
  { name: 'Kafka', level: 85, icon: <SiApachekafka />, link: 'https://kafka.apache.org/documentation/' },
  { name: 'MySQL', level: 85, icon: <SiMysql />, link: 'https://dev.mysql.com/doc/' },
  { name: 'SQL Server', level: 70, icon: <SiMicrosoftsqlserver />, link: 'https://docs.microsoft.com/en-us/sql/sql-server/' },
  { name: 'Solidity', level: 60, icon: <SiSolidity />, link: 'https://docs.soliditylang.org/' },
  { name: 'MongoDB', level: 80, icon: <SiMongodb />, link: 'https://docs.mongodb.com/' },
];


export const skills3 = [
  { name: 'Unity', level: 80, icon: <FaUnity />, link: 'https://unity.com/' },
  { name: 'UE 4', level: 70, icon: <SiUnrealengine />, link: 'https://www.unrealengine.com/' },
  { name: 'Blender', level: 70, icon: <SiBlender />, link: 'https://www.blender.org/' },
  { name: 'C#', level: 85, icon: <SiCsharp />, link: 'https://docs.microsoft.com/en-us/dotnet/csharp/' },
  { name: 'C++', level: 70, icon: <SiCplusplus />, link: 'https://isocpp.org/' },
  { name: 'Procedural Generation', level: 75, icon: <MdZoomOutMap />, link: 'https://en.wikipedia.org/wiki/Procedural_generation' },
  { name: 'Git', level: 100, icon: <SiGit />, link: 'https://git-scm.com/' },
  { name: 'VR/AR', level: 75, icon: <PiVirtualReality />, link: 'https://en.wikipedia.org/wiki/Virtual_reality' }
];

export const skills4 = [
  { name: 'Photoshop', level: 80, icon: <SiAdobephotoshop />, link: 'https://www.adobe.com/products/photoshop.html' },
  { name: 'Figma', level: 70, icon: <FaFigma />, link: 'https://www.figma.com/' },
  { name: 'Illustrator', level: 90, icon: <SiAdobeillustrator />, link: 'https://www.adobe.com/products/illustrator.html' },
  { name: 'SketchUp', level: 90, icon: <SiSketchup />, link: 'https://www.sketchup.com/' },
  { name: 'Premiere Pro', level: 80, icon: <SiAdobepremierepro />, link: 'https://www.adobe.com/products/premiere.html' },
  { name: 'Graphic Design', level: 90, icon: <SiAffinitydesigner />, link: 'https://affinity.serif.com/en-us/designer/' },
  { name: 'UI/UX', level: 85, icon: <SiMaterialdesignicons />, link: 'https://www.coursera.org/articles/ui-vs-ux-design' },
  { name: 'Canva', level: 100, icon: <SiCanva />, link: 'https://www.canva.com/' }
];




