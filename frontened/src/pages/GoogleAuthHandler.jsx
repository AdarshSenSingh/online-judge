import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../token/auth';
import toast from 'react-hot-toast';

const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeTokenInLS } = useAuth();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (token) {
      // Store the token and redirect
      storeTokenInLS(token);
      toast.success('Successfully logged in with Google!', { position: 'top-right' });
      navigate('/problems');
    } else if (error) {
      toast.error('Google authentication failed. Please try again.', {
        position: 'top-center',
        className: 'custom-toast',
      });
      navigate('/login');
    } else {
      navigate('/login');
    }
  }, [location, navigate, storeTokenInLS]);
  
  return (
    <div className="google-auth-handler">
      <h2>Processing Google Authentication...</h2>
      <p>Please wait while we complete your login.</p>
    </div>
  );
};

export default GoogleAuthHandler;
