import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserAlt, FaLock } from "react-icons/fa";
import Form from 'react-bootstrap/Form';
import './App.css';
import axios from 'axios';

export function App() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    error: ''
  });
  const navigate = useNavigate();

  const updateFormData = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };
  
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: '',
    error: ''
  });

  const validateForm = () => {
    let valid = true;
    const newFormErrors = { ...formErrors };

    if (formData.username.trim() === '') {
      newFormErrors.username = 'Username is required';
      valid = false;
    } 

    if (formData.password.trim() === '') {
      newFormErrors.password = 'Password is required';
      valid = false;
    }

    setFormErrors(newFormErrors);
    return valid;
  };
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    if (validateForm()) { 
      if (formData.username === 'user' && formData.password === '1234') {
        navigate('/Te');
      } else if (formData.username === 'admin' && formData.password === '1234') {
        navigate('/admin');
      } else {
        try{
            const response = await axios.post('https://token-based-authentication.onrender.com/login',{
              username: formData.username,
              password: formData.password});
              console.log(response);
            const token = response.data.token;
            if (token) {
              localStorage.setItem('token', token);
              navigate('/protected');
            } else {
              setFormErrors({ ...formErrors, error: 'Invalid Credentials' });
            }
        }
        catch(err){
          setFormErrors('Invalid Credentials')
        }
      }
    }
  };

  return (
    <div className="App">
      <h2 style={{ color: "blue" }}>Login page</h2><br /><br />
      
      <div className="container">
        <h5>Username <FaUserAlt className='icon' /> 
          <Form.Control 
            id="username" 
            type="text"  
            value={formData.username}  
            onChange={(e) => updateFormData('username', e.target.value)} 
            placeholder="Enter username" 
          />
        </h5>  
        <span style={{ color: 'red' }}> {formErrors.username}</span>
      </div>
     
      <br />
      <div className="container">
        <h5>Password <FaLock /> 
          <Form.Control 
            id="password" 
            type="password"
            value={formData.password} 
            onChange={(e) => updateFormData('password', e.target.value)} 
            placeholder="Enter Password" 
          />
        </h5>
        <span style={{ color: 'red' }}> {formErrors.password}</span>
      </div>
    
      <br />
      <div>
        <button
          className="btn btn-success"
          onClick={handleSubmit}
        >
          Login
        </button>
        
        <button
          style={{ marginLeft: '3em' }}
          className="btn btn-success"
          onClick={() => navigate('/register')}
        >
          Register
        </button>
      </div><br />
      <span style={{ color: 'red' }}>{formData.error}</span>
    </div>
  );
}
