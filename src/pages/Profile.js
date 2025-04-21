import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import ResetPassword from '../components/auth/ResetPassword';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const [authView, setAuthView] = useState('login'); // 'login', 'register', or 'reset'
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  if (currentUser) {
    return (
      <div className="page-container">
        <h1>USER PROFILE</h1>
        <div className="profile-content">
          <h2>Welcome, {currentUser.email}</h2>
          <div className="profile-info">
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Account created:</strong> {currentUser.metadata.creationTime}</p>
            <p><strong>Last sign in:</strong> {currentUser.metadata.lastSignInTime}</p>
          </div>
          <button onClick={handleLogout} className="auth-button">
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>USER PROFILE</h1>
      {authView === 'login' && (
        <Login 
          toggleForm={() => setAuthView('register')} 
          toggleReset={() => setAuthView('reset')} 
        />
      )}
      {authView === 'register' && (
        <Register toggleForm={() => setAuthView('login')} />
      )}
      {authView === 'reset' && (
        <ResetPassword toggleReset={() => setAuthView('login')} />
      )}
    </div>
  );
};

export default Profile;
