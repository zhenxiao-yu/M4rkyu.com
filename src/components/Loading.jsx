import styled from "styled-components";
import { DNA } from 'react-loader-spinner';

const Box = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${props => props.theme.text};
  color: ${props => props.theme.body};

  display: flex;
  flex-direction: column;  // Set flexbox direction to column
  justify-content: center;
  align-items: center;
`;

// Loading functional component
const Loading = () => {
  return (
    <Box>
        <DNA
          visible={true}
          height="120"
          width="120"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperClass="dna-wrapper"
        />
      <br/>
      <h1>Loading...</h1>
    </Box>
  );
};

export default Loading;
