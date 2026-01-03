import React from "react";
import styled from "styled-components";

const SrOnlyHeading = styled.h1`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`;

const AccessibleHeading = ({ children }) => {
  return <SrOnlyHeading>{children}</SrOnlyHeading>;
};

export default AccessibleHeading;
