import React, { useState } from 'react';
import useStorage from '../../hooks/useStorage';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f9f9f9;
  height: 100vh;
`;

const FormContainer = styled.div`
  background-color: #fefefe;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  display: block;
  margin: 10px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const Output = styled.div`
  margin-top: 10px;
`;

const Error = styled.div`
  color: red;
`;

const ProgressBar = styled.div`
  margin-top: 10px;
  background: #f3f3f3;
  border-radius: 4px;
  overflow: hidden;
  height: 20px;
`;

const Progress = styled.div`
  height: 100%;
  background: #007bff;
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
`;

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [section, setSection] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const { progress, url } = useStorage(file, { section, title, date, description });

  const types = ['image/png', 'image/jpeg'];

  const handleChange = (e) => {
    let selected = e.target.files[0];

    if (selected && types.includes(selected.type)) {
      setFile(selected);
      setError('');
    } else {
      setFile(null);
      setError('Please select an image file (png or jpeg)');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <Label>
            Section:
            <Input type="text" value={section} onChange={(e) => setSection(e.target.value)} required />
          </Label>
          <Label>
            Title:
            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Label>
          <Label>
            Date:
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Label>
          <Label>
            Description:
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required></Textarea>
          </Label>
          <Label>
            Upload Image:
            <Input type="file" onChange={handleChange} />
          </Label>
          <Output>
            {error && <Error>{error}</Error>}
            {file && <div>{file.name}</div>}
            {progress > 0 && (
              <ProgressBar>
                <Progress progress={progress} />
              </ProgressBar>
            )}
            {url && <div>Uploaded successfully!</div>}
          </Output>
          <Button type="submit">Upload</Button>
        </Form>
      </FormContainer>
    </PageContainer>
  );
};

export default UploadForm;
