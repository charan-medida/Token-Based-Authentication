import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import './App.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

export function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        conformPassword: ''
    });
    const [formErrors, setFormErrors] = useState({
        username: '',
        email: '',
        password: '',
        conformPassword: '',
        error: ''
    });
    const navigate = useNavigate();

    const updateFormData = (field, value) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    const validateForm = () => {
        let valid = true;
        const newFormErrors = { ...formErrors };

        if (formData.username.trim() === '') {
            newFormErrors.username = 'Username is required';
            valid = false;
        } else if (formData.username.trim().length < 5) {
            newFormErrors.username = 'Username must have 5 or more characters';
            valid = false;
        }

        if (formData.email.trim() === '') {
            newFormErrors.email = 'Email is required';
            valid = false;
        }

        if (formData.password.trim() === '') {
            newFormErrors.password = 'Password is required';
            valid = false;
        } else if (formData.password.trim().length < 5) {
            newFormErrors.password = 'Password must have 5 or more characters';
            valid = false;
        }

        if (formData.conformPassword.trim() === '') {
            newFormErrors.conformPassword = 'Confirm password is required';
            valid = false;
        } else if (formData.conformPassword !== formData.password) {
            newFormErrors.conformPassword = 'Confirm password does not match with password';
            valid = false;
        }

        setFormErrors(newFormErrors);
        return valid;
    };

    const handleRegister = async () => {
        if (validateForm()) {
            try {
                 await axios.post('http://localhost:5002/register', {
                    username: formData.username,
                    password: formData.password ,
                   email:formData.email
                    
                });
                
               
                    navigate('/');
                
            } catch (err) {
                setFormErrors(prevErrors => ({
                    ...prevErrors,
                    error: 'This username is already registered'
                }));
            }
        }
    };

    return (
        <div className="App">
            <h2 style={{ color: 'blue' }}>Register Page</h2><br /><br />

            <div className="container">
                <h6>Username
                    <Form.Control 
                        id="username" 
                        type="text" 
                        value={formData.username}
                        onChange={(e) => updateFormData('username', e.target.value)} 
                        placeholder="Enter username"  className="input-field"
                    />
                </h6>
                <span style={{ color: 'red' }}>{formErrors.username}</span>
            </div>
            

            <div className="container">
                <h6>Email
                    <Form.Control 
                        id="email" 
                        type="text" 
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)} 
                        placeholder="Enter email"  className="input-field"
                    />
                </h6>
                <span style={{ color: 'red' }}>{formErrors.email}</span>
            </div>

            <div className="container">
                <h6>Password
                    <Form.Control 
                        id="password" 
                        type="password" 
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)} 
                        placeholder="Enter password"  className="input-field"
                    />
                </h6>
                <span style={{ color: 'red' }}>{formErrors.password}</span>
            </div>

            <div className="container">
                <h6>Confirm Password
                    <Form.Control 
                        id="conformPassword" 
                        type="password" 
                        value={formData.conformPassword}
                        onChange={(e) => updateFormData('conformPassword', e.target.value)} 
                        placeholder="Enter confirm password"  className="input-field"
                    />
                </h6>
                <span style={{ color: 'red' }}>{formErrors.conformPassword}</span>
            </div>

            <div>
                <button 
                    className="btn btn-success"
                    onClick={handleRegister}
                >
                    Register
                </button><br />
                <Link to="/" style={{color:"red"}}>{formErrors.error}</Link>
            </div>
        </div>
    );
}
