import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';

const Login = ({ toggleForm, toggleReset }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/'); // Redirect to home after successful login
    } catch (error) {
      setError('Failed to log in: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-form">
      <h2>Log In</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="button" onClick={toggleReset} className="forgot-password">
            Forgot password?
          </button>
        </div>
        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <p className="auth-switch">
        Don't have an account?{' '}
        <button onClick={toggleForm} className="link-button">
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;
