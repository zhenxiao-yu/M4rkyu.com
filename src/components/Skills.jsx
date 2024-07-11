import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const SkillsSection = ({skills}) => {

  let sortedSkills = skills?.sort((a, b) => b.level - a.level);
  return (
    <SkillsContainer>
      <SkillsGrid>
        {sortedSkills.map((skill, index) => (
          <SkillItem
            key={index}
            whileHover={{ scale: 1.08 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => window.open(skill.link, '_blank')}
          >
            <SkillHeader className="hvr-icon-spin">
              <SkillIcon className="hvr-icon">{skill.icon}</SkillIcon>
              <SkillName>{skill.name}</SkillName>
            </SkillHeader>
            <ProgressBar>
              <Progress style={{ width: `${skill.level}%` }}></Progress>
            </ProgressBar>
          </SkillItem>
        ))}
      </SkillsGrid>
    </SkillsContainer>
  );
};

export default SkillsSection;

// Styled Components
const SkillsContainer = styled.div`
  padding: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.8em;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
`;

const SkillItem = styled(motion.div)`
  text-align: center;
  padding: 0.5em;
  border: 2px solid rgb(8,9,10);
  border-radius: 7.5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  background-color: ${({ theme }) => theme.body};;
  overflow: hidden;
  cursor: pointer;

  @media (max-width: 768px) {
    padding: 12px;
  }

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const SkillHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    margin-bottom: 6px;
  }

  @media (max-width: 480px) {
    margin-bottom: 5px;
  }
`;

const SkillIcon = styled.div`
  font-size: 25px;
  color: #3f51b5;
  margin-right: 8px;
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    font-size: 20px;
    margin-right: 6px;
  }

  @media (max-width: 480px) {
    font-size: 15px;
    margin-right: 4px;
  }
`;

const SkillName = styled.span`
  font-size: 0.9rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    font-size: 0.6rem;
  }
`;

const ProgressBar = styled.div`
  background-color: rgba(8,9,10, 0.2);
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
  margin-top: 0.5rem;
  height: 8px;

  @media (max-width: 768px) {
    margin-top: 0.4rem;
    height: 7px;
  }

  @media (max-width: 480px) {
    margin-top: 0.3rem;
    height: 6px;
  }
`;

const Progress = styled.div`
  background-color: ${({ theme }) => theme.text};
  height: 100%;
`;


