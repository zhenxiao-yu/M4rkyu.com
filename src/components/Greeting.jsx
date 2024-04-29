import React, { useEffect, useState } from 'react';

const Greeting = () => {
  const [greeting, setGreeting] = useState('Nice to meet you...');
  let hasVisited = localStorage.getItem('hasVisited');
  
  useEffect(() => {
    if (hasVisited) {
      setGreeting('Welcome back...');
    } else {
      setGreeting('Nice to meet you...');
      localStorage.setItem('hasVisited', 'true');
    }
  }, [greeting]);

  return (
    <h3>{greeting}</h3>
  );
};

export default Greeting;
