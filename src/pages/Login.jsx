import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';
import authService from '../services/authService';
import LoginForm from '../components/LoginForm';
import DisclaimerEULA from '../components/DisclaimerEULA';
import { useUser } from '../contexts/UserContext';

function Login() {
  const [error, setError] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true);
  };

  const handleLogin = async (email, password) => {
    setError('');

    try {
      const userData = await authService.login(email, password);
      if (userData && userData.token) {
        updateUser(userData);
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.message ||
          error.response?.data?.message ||
          'Failed to login. Please check your credentials.'
      );
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {!disclaimerAccepted ? (
          <DisclaimerEULA 
            onAccept={handleDisclaimerAccept} 
            isAccepted={disclaimerAccepted} 
          />
        ) : (
          <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Login
            </Typography>

            <LoginForm onSubmit={handleLogin} error={error} />
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default Login;
