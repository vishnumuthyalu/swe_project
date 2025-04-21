import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import '../../styles/Auth.css';

const ResetPassword = ({ toggleReset }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Check your email for password reset instructions.');
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-form">
      <h2>Reset Password</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
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
        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Sending...' : 'Reset Password'}
        </button>
      </form>
      <p className="auth-switch">
        Remember your password?{' '}
        <button onClick={toggleReset} className="link-button">
          Log in
        </button>
      </p>
    </div>
  );
};

export default ResetPassword;
