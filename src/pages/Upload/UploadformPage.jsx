import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { sections } from '../../assets/data/GalleryData';
import useStorage from '../../hooks/useStorage';

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

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [section, setSection] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [startUpload, setStartUpload] = useState(false);
  const { progress, url, uploadFile } = useStorage();
  const history = useHistory();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
    } else if (!section || !title || !date || !description) {
      setError('All fields are required.');
    } else {
      setError('');
      setStartUpload(true);
      try {
        await uploadFile(file, { section, title, date, description });
        history.push('/gallery');
      } catch (err) {
        setError('Upload failed, please try again.');
      } finally {
        setStartUpload(false);
      }
    }
  };

  const clearForm = () => {
    setFile(null);
    setSection('');
    setTitle('');
    setDate('');
    setDescription('');
    setError(null);
    setStartUpload(false);
  };

  return (
    <PageContainer>
      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <Label>
            Section:
            <select value={section} onChange={(e) => setSection(e.target.value)} required>
              <option value="">Select a section</option>
              {sections.map((section) => (
                <option key={section.header} value={section.header}>
                  {section.header}
                </option>
              ))}
            </select>
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
            {startUpload && <div>Uploading: {progress}%</div>}
            {url && <div>Uploaded successfully!</div>}
          </Output>
          <Button type="submit">Upload</Button>
          <Button type="button" onClick={clearForm} style={{ backgroundColor: '#dc3545' }}>
            Clear
          </Button>
        </Form>
      </FormContainer>
    </PageContainer>
  );
};

export default UploadForm;
