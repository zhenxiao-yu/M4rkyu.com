import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const SkillsSection = ({ skills = [] }) => {
    // Sorting skills by level, highest first
    const sortedSkills = React.useMemo(() => [...skills].sort((a, b) => b.level - a.level), [skills]);

    return (
        <SkillsContainer>
            <SkillsGrid>
                {sortedSkills.map((skill, index) => (
                    <SkillItem
                        key={skill.name || index}
                        whileHover={{ scale: 1.08 }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        onClick={() => skill.link && window.open(skill.link, '_blank')}
                    >
                        <SkillHeader>
                            <SkillIcon>{skill.icon}</SkillIcon>
                            <SkillName>{skill.name}</SkillName>
                        </SkillHeader>
                        <ProgressBar>
                            <Progress style={{ width: `${skill.level}%` }} />
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
    grid-template-columns: repeat(2, 1fr); /* 2 items per row on desktop */
    gap: 0.8em;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Auto-fill for smaller desktops */
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* Responsive for tablets */
    }

    @media (max-width: 480px) {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); /* Responsive for mobile */
    }
`;


const SkillItem = styled(motion.div)`
    text-align: center;
    padding: 0.5em;
    border: 2px solid ${({theme}) => theme.text};
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    background-color: ${({theme}) => theme.body};
    cursor: pointer;
    transition: box-shadow 0.1s ease;

    &:hover {
        box-shadow: 0 6px 10px rgba(0, 0, 0, 0.4);
    }

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
    background-color: rgba(8, 9, 10, 0.2);
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

