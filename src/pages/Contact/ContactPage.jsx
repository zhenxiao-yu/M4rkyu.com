import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import Seo, { SITE_URL } from "../../components/Seo";
import AccessibleHeading from "../../components/AccessibleHeading";

const PageWrapper = styled.section`
  min-height: 75vh;
  width: min(960px, 90vw);
  margin: 0 auto;
  color: ${(props) => props.theme.text};
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 2rem 2.5rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
`;

const Heading = styled.h2`
  font-size: clamp(1.75rem, 2.5vw, 2.25rem);
  margin-bottom: 0.25rem;
`;

const SubHeading = styled.p`
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.82);
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
`;

const Card = styled.article`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  background: rgba(9, 10, 11, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.span`
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
`;

const Value = styled.a`
  color: ${(props) => props.theme.text};
  text-decoration: none;
  font-weight: 700;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
`;

const List = styled.ul`
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
  line-height: 1.6;
`;

const ContactPage = () => {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" }
  ];

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE_URL}/contact`,
    description: "Contact page for ZhenXiao (Mark) Yu including email and professional profiles.",
    mainEntity: {
      "@type": "Person",
      name: "ZhenXiao (Mark) Yu",
      email: "mailto:markyu0615@gmail.com",
      sameAs: breadcrumbs.map((crumb) => `${SITE_URL}${crumb.path}`)
    }
  };

  return (
    <PageWrapper>
      <AccessibleHeading>Contact ZhenXiao (Mark) Yu</AccessibleHeading>
      <Seo
        title="Contact Mark Yu | M4rkyu.com"
        description="Reach ZhenXiao (Mark) Yu for software engineering collaborations, speaking, or consulting."
        path="/contact"
        breadcrumbs={breadcrumbs}
        includePerson
        additionalSchemas={[contactSchema]}
      />
      <Heading>Contact</Heading>
      <SubHeading>
        I respond fastest via email and LinkedIn. Feel free to mention your project scope, timeline, and how I can help.
      </SubHeading>

      <ContactGrid>
        <Card>
          <Label>Email</Label>
          <Value href="mailto:markyu0615@gmail.com">markyu0615@gmail.com</Value>
          <p>Preferred for engineering collaborations and speaking requests.</p>
        </Card>

        <Card>
          <Label>LinkedIn</Label>
          <Value href="https://www.linkedin.com/in/zhenxiao-yu-a586a2211/" target="_blank" rel="noreferrer">
            linkedin.com/in/zhenxiao-yu-a586a2211
          </Value>
          <p>Professional updates, availability, and recommendations.</p>
        </Card>

        <Card>
          <Label>GitHub</Label>
          <Value href="https://github.com/zhenxiao-yu" target="_blank" rel="noreferrer">
            github.com/zhenxiao-yu
          </Value>
          <p>Open-source and portfolio code samples.</p>
        </Card>

        <Card>
          <Label>Location</Label>
          <p>Based in Ontario, Canada. Available for remote and hybrid engagements.</p>
          <List>
            <li>Time zone: Eastern Time (ET)</li>
            <li>Languages: English, Mandarin</li>
          </List>
        </Card>
      </ContactGrid>

      <Heading as="h2" style={{ marginTop: "2rem" }}>
        Collaboration fit
      </Heading>
      <List>
        <li>Full-stack engineering for web platforms, 3D/interactive experiences, and performance tuning.</li>
        <li>Technical art and gameplay prototyping using JavaScript and three.js.</li>
        <li>Mentorship for students and early-career engineers.</li>
      </List>

      <Heading as="h2" style={{ marginTop: "2rem" }}>
        Quick links
      </Heading>
      <List>
        <li>
          <NavLink to="/projects">Projects and case studies</NavLink>
        </li>
        <li>
          <NavLink to="/about">About Mark Yu</NavLink>
        </li>
        <li>
          <NavLink to="/sitemap">HTML sitemap</NavLink>
        </li>
      </List>
    </PageWrapper>
  );
};

export default ContactPage;
