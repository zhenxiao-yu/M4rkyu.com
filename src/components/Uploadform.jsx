import React, { useState } from 'react';
import styled from 'styled-components';
import ProgressBar from './ProgressBar';

const Form = styled.form`
  margin: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  margin-bottom: 20px;
`;

const Input = styled.input`
  display: none;
`;

const Span = styled.span`
  display: inline-block;
  padding: 10px 20px;
  border: 2px dashed #ccc;
  border-radius: 5px;
  background: #fff;
  transition: background 0.3s ease;
  &:hover {
    background: #f0f0f0;
  }
`;

const Output = styled.div`
  margin-top: 20px;
  .error {
    color: red;
    margin-bottom: 10px;
  }
`;

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const types = ['image/png', 'image/jpeg'];

  const handleChange = (e) => {
    let selected = e.target.files[0];
    console.log('File selected:', selected);

    if (selected && types.includes(selected.type)) {
      setFile(selected);
      setError('');
      console.log('File set:', selected);
    } else {
      setFile(null);
      setError('Please select an image file (png or jpg)');
    }
  };

  return (
    <Form>
      <Label>
        <Input type="file" onChange={handleChange} />
        <Span>+</Span>
      </Label>
      <Output>
        {error && <div className="error">{error}</div>}
        {file && <div>{file.name}</div>}
        {file && <ProgressBar file={file} setFile={setFile} />}
      </Output>
    </Form>
  );
};

export default UploadForm;
