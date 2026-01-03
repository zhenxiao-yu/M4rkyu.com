import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/skills", label: "Skills" },
  { to: "/gallery", label: "Gallery" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
  { to: "/sitemap", label: "Sitemap" }
];

const SkipLink = styled.a`
  position: absolute;
  left: -999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: -1;

  &:focus {
    left: 1rem;
    top: 1rem;
    width: auto;
    height: auto;
    background: #ffffff;
    color: #000;
    padding: 0.5rem 1rem;
    z-index: 30;
    border-radius: 0.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const NavBar = styled.nav`
  position: fixed;
  inset: 0 0 auto 0;
  height: 4.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 1.5rem;
  background: rgba(9, 10, 11, 0.78);
  backdrop-filter: blur(12px);
  z-index: 25;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  gap: 1rem;
  margin: 0;
  padding: 0;
  align-items: center;
  flex-wrap: wrap;
`;

const StyledLink = styled(NavLink)`
  color: #f2f2f2;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  transition: background 0.3s ease, color 0.3s ease;

  &.active,
  &:hover,
  &:focus-visible {
    background: #ffffff;
    color: #090a0b;
    outline: none;
  }
`;

const SiteNavigation = () => (
  <>
    <SkipLink href="#main-content">Skip to main content</SkipLink>
    <NavBar aria-label="Primary">
      <NavList>
        {navLinks.map((link) => (
          <li key={link.to}>
            <StyledLink exact to={link.to} activeClassName="active">
              {link.label}
            </StyledLink>
          </li>
        ))}
      </NavList>
    </NavBar>
  </>
);

export default SiteNavigation;
