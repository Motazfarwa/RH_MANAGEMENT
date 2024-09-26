import React, { useState } from 'react';
import { FaReact } from 'react-icons/fa6';
import './UserLogin.css';
import { useAuthContext } from 'contexts/AuthContext'; // Import the AuthContext
import { useNavigate} from 'react-router-dom'
import _ from 'lodash'

const UserLogin = () => {
  const { setUser } = useAuthContext(); // Get setUser from context
  const [fullName, setFullName] = useState(''); // Only full name required
  const [error, setError] = useState(null);
  const navigate= useNavigate()

  const handleUserLogin = () => {
    if (!fullName) {
      setError('Please enter a name');
      return;
    }

    console.log('Login clicked'); // Debugging: Check if button click works
    console.log('FullName:', fullName); // Debugging: Log the fullName value

    // Store FullName in localStorage and set in AuthContext
    localStorage.setItem('FullName', fullName);
    localStorage.setItem('sender', `https://picsum.photos/id/${_.random(1,1000)}/200/300`)
    localStorage.setItem('receiver', `https://picsum.photos/id/${_.random(1,1000)}/200/300`)
    setUser({ FullName: fullName }); // Debugging: Log after setUser
    navigate('/chatcontainer');

    console.log('User set in AuthContext');
  };

  return (
    <div className='login_container'>
      <div className='login_title'>
        <FaReact className='login_icon' />
        <h1>Chat App</h1>
      </div>
      <div className='login_form'>
        <input
          type="text"
          placeholder='Enter your full name'
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        {error && <p className="error_message">{error}</p>}
        <button onClick={handleUserLogin}>Login</button>
      </div>
    </div>
  );
};

export default UserLogin;
