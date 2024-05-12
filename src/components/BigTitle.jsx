import styled from "styled-components";

// Big title style
const Text = styled.h1`
  position: fixed;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  right: ${(props) => props.right};
  color: ${(props) => `${props.theme.text}`};
  opacity: 0.15;
  font-size: calc(5rem + 5vw);
  user-select: none;
  z-index: 0;
`;

// background text component
const BigTitle = (props) => {
  return (
    <Text top={props.top} left={props.left} right={props.right}>
      {props.text}
    </Text>
  );
};

export default BigTitle;
