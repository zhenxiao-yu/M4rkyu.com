import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useMemo, useState } from "react";
import { loadSlim } from "@tsparticles/slim"; 



const ParticlesComponent = (props) => {

  const [init, setInit] = useState(false);
  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    console.log(container);
  };

  console.log(props.theme)
  const options_dark = useMemo(
    () => ({
      fpsLimit: 120,
      interactivity: {
        detect_on: "canvas",
        events: {
          onClick: {
            enable: true,
            mode: "repulse",
          },
          onHover: {
            enable: true,
            mode: 'grab',
          },
          
        },
        modes: {
          push: {
            distance: 250,
            duration: 2,
          },
          grab: {
            distance: 250,
            duration: 0.2
          },
          "repulse": {
          "distance": 300,
          "duration": 0.4
          },
        },
      },
      particles: {
  color: {
    value: "rgb(40, 119, 80)", // Color of the particles
  },
  links: {
    color: "rgb(40, 119, 80)", // Color of the lines between particles
    distance: 150, // Maximum distance between linked particles
    enable: true, // Enable linking between particles
    opacity: 0.2, // Opacity of the links
    width: 1, // Width of the links
  },
  move: {
    direction: "none", // Direction particles move (none, top, top-right, etc.)
    enable: true, // Enable movement
    outModes: {
      default: "bounce", // Behavior when particles reach canvas edge
    },
    random: true, // Movement randomness
    speed: 3, // Speed of particle movement
    straight: false, // Movement in a straight line
  },
  number: {
    density: {
      enable: true, // Enable a density area for particle distribution
    },
    value: 222, // Number of particles
  },
  opacity: {
    value: 0.5, // Opacity of the particles
  },
  shape: {
    type: "star", // Shape of the particles (circle, edge, triangle, polygon, star, image)
  },
  size: {
    value: { min: 0.5, max: 0.7 }, // Size range of particles
  },
},
      detectRetina: true,
    }),
    [],
  );
  const options_light = useMemo(
    () => ({
      fpsLimit: 120,
      interactivity: {
        detect_on: "canvas",
        events: {
          onClick: {
            enable: true,
            mode: "repulse",
          },
          onHover: {
            enable: true,
            mode: 'grab',
          },
          
        },
        modes: {
          push: {
            distance: 250,
            duration: 2,
          },
          grab: {
            distance: 250,
            duration: 0.2
          },
          "repulse": {
          "distance": 300,
          "duration": 0.4
          },
        },
      },
      particles: {
      color: {
          value: "rgb(16, 16, 16)", // Color of the particles
        },
        links: {
          color: "rgb(16, 16, 16)", // Color of the lines between particles
          distance: 350, // Maximum distance between linked particles
          enable: true, // Enable linking between particles
          opacity: 0.2, // Opacity of the links
          width: 1, // Width of the links
        },
        move: {
          direction: "none", // Direction particles move (none, top, top-right, etc.)
          enable: true, // Enable movement
          outModes: {
            default: "bounce", // Behavior when particles reach canvas edge
          },
          random: true, // Movement randomness
          speed: 3, // Speed of particle movement
          straight: false, // Movement in a straight line
        },
        number: {
          density: {
            enable: true, // Enable a density area for particle distribution
          },
          value: 222, // Number of particles
        },
        opacity: {
          value: 0.5, // Opacity of the particles
        },
        shape: {
          type: "star", // Shape of the particles (circle, edge, triangle, polygon, star, image)
        },
        size: {
          value: { min: 1, max: 1.3 }, // Size range of particles
        },
      },
      detectRetina: true,
    }),
    [],
  );

  return <Particles id={props.id} init={particlesLoaded} options={props.theme === "dark" ? options_dark : options_light} />; 
};

export default ParticlesComponent;