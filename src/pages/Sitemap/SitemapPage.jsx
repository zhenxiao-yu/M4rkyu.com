import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import Seo from "../../components/Seo";
import AccessibleHeading from "../../components/AccessibleHeading";

const Wrapper = styled.section`
  max-width: 960px;
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
  margin-bottom: 0.75rem;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.82);
  margin-bottom: 1.5rem;
`;

const Section = styled.section`
  margin-bottom: 1.5rem;
`;

const List = styled.ul`
  list-style: none;
  padding-left: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
`;

const StyledLink = styled(NavLink)`
  color: ${(props) => props.theme.text};
  text-decoration: none;
  font-weight: 700;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
`;

const SitemapPage = () => {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Sitemap", path: "/sitemap" }
  ];

  const pages = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/projects", label: "Projects" },
    { path: "/skills", label: "Skills" },
    { path: "/gallery", label: "Gallery" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Contact" }
  ];

  const secondaryLinks = [
    { path: "/post", label: "Legacy Blog" },
    { path: "/project", label: "Legacy Projects" },
    { path: "/sitemap.xml", label: "XML sitemap" },
    { path: "/robots.txt", label: "robots.txt" },
    { path: "/humans.txt", label: "humans.txt" }
  ];

  return (
    <Wrapper>
      <AccessibleHeading>HTML sitemap for M4rkyu.com</AccessibleHeading>
      <Seo
        title="Sitemap | M4rkyu.com"
        description="Explore every important page on M4rkyu.com including projects, about, blog, and contact sections."
        path="/sitemap"
        breadcrumbs={breadcrumbs}
      />
      <Heading>Sitemap</Heading>
      <Description>
        Quick access to the most important sections of m4rkyu.com to help visitors and search engines navigate.
      </Description>

      <Section>
        <h3>Main pages</h3>
        <List>
          {pages.map((page) => (
            <li key={page.path}>
              <StyledLink exact to={page.path}>
                {page.label}
              </StyledLink>
            </li>
          ))}
        </List>
      </Section>

      <Section>
        <h3>Auxiliary & feeds</h3>
        <List>
          {secondaryLinks.map((page) => (
            <li key={page.path}>
              {page.path.endsWith(".xml") || page.path.endsWith(".txt") ? (
                <a href={page.path}>{page.label}</a>
              ) : (
                <StyledLink exact to={page.path}>
                  {page.label}
                </StyledLink>
              )}
            </li>
          ))}
        </List>
      </Section>
    </Wrapper>
  );
};

export default SitemapPage;
