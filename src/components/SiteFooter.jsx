import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { sameAsProfiles } from "./Seo";

const FooterWrapper = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(9, 10, 11, 0.82);
  color: #e8e8e8;
  padding: 0.75rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 24;
`;

const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FooterNavLink = styled(NavLink)`
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: 0.5rem;
  transition: background 0.3s ease, color 0.3s ease;

  &.active,
  &:hover,
  &:focus-visible {
    background: #ffffff;
    color: #090a0b;
    outline: none;
  }
`;

const ExternalLink = styled.a`
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: 0.5rem;
  transition: background 0.3s ease, color 0.3s ease;

  &:hover,
  &:focus-visible {
    background: #ffffff;
    color: #090a0b;
    outline: none;
  }
`;

const Copyright = styled.span`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const SiteFooter = () => {
  const primaryLinks = [
    { to: "/contact", label: "Contact" },
    { to: "/sitemap", label: "HTML Sitemap" }
  ];

  return (
    <FooterWrapper aria-label="Footer">
      <FooterLinks>
        {primaryLinks.map((link) => (
          <FooterNavLink key={link.to} exact to={link.to} activeClassName="active">
            {link.label}
          </FooterNavLink>
        ))}
      </FooterLinks>

      <FooterLinks>
        {sameAsProfiles.slice(0, 3).map((profile) => (
          <ExternalLink key={profile} href={profile} target="_blank" rel="noreferrer">
            {new URL(profile).hostname.replace("www.", "")}
          </ExternalLink>
        ))}
      </FooterLinks>

      <Copyright>© {new Date().getFullYear()} ZhenXiao (Mark) Yu</Copyright>
    </FooterWrapper>
  );
};

export default SiteFooter;
