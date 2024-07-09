import styled from "styled-components";
import { BallTriangle } from 'react-loader-spinner';

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
        <BallTriangle
          height={120}
          width={120}
          radius={5}
          color="#ece9e8"
          ariaLabel="ball-triangle-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
          />
       <br/>
       <br/>
      <h2>Loading...</h2>
    </Box>
  );
};

export default Loading;
