
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const fetchProtectedData = async (token) => {
    try {
      const response = await axios.get('https://token-based-authentication.onrender.com/protected', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      throw new Error('Error fetching protected data');
    }
  };
 export function Protected() {
  const [username, setUserName] = useState('');
  const [email,setEmail] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const result = await fetchProtectedData(token);
          setUserName(result.user);
          setEmail(result.useremail);
          console.log(result);
        } catch (err) {
            setUserName('Error fetching protected data');
        }
      } else {
        setUserName('No token found');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h4>Protected Data</h4><br/>
      <h5>Hi {username}</h5><br/>
      <h5>This is your email - {email}</h5>
    </div>
  );
}
