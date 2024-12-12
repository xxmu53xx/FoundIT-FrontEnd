import { useState, useMemo } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  TextareaAutosize,
  LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import './Signup.css';
import axios from 'axios';

const Signup = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    schoolEmail: '',
    schoolId: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  // Password strength evaluation
  const evaluatePasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      punctuation: /[!"#$%&'()*+,\-./:;<=>?@\[\]^_`{|}~]/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };

    const strengthScore = Object.values(checks).filter(check => check).length;
    
    return {
      checks,
      score: strengthScore,
      strength: strengthScore <= 1 ? 'Very Weak' :
                strengthScore <= 2 ? 'Weak' :
                strengthScore <= 3 ? 'Moderate' :
                strengthScore <= 4 ? 'Strong' : 'Very Strong'
    };
  };

  const passwordStrength = useMemo(() => 
    evaluatePasswordStrength(formData.password), 
    [formData.password]
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[!"#$%&'()*+,\-./:;<=>?@\[\]^_`{|}~]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  const validateSchoolEmail = (email) => {
    return email.endsWith('@cit.edu');
  };

  const validateSchoolId = (schoolId) => {
    const schoolIdRegex = /^\d{2}-\d{4}-\d{3}$/;
    return schoolIdRegex.test(schoolId);
  };

  const postUser = async () => {
    try {
      const response = await axios.post('http://localhost:8083/api/users/postUsers', {
        schoolEmail: formData.schoolEmail,
        schoolId: formData.schoolId,
        password: formData.password,
        bio: formData.bio
      });
      console.log('User registered:', response.data);
      onClose();
    } catch (err) {
      console.error('Error during registration:', err);
      setError('An error occurred during registration. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError('');

    if (formData.schoolEmail === '' || formData.schoolId === '' || formData.password === '') {
      setError('All fields are required.');
      return;
    }

    if (!validateSchoolEmail(formData.schoolEmail)) {
      setError('Please use a valid CIT school email (must end with @cit.edu).');
      return;
    }

    if (!validateSchoolId(formData.schoolId)) {
      setError('School ID must be in the format 00-0000-000.');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and punctuation.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    postUser();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      className="signup-dialog"
    >
      <DialogTitle className="signup-dialog-title">
        <Typography variant="h6" className="signup-title">
          <strong>Student Registration</strong>
        </Typography>
        <IconButton onClick={onClose} className="close-button">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} className="signup-form">
          {error && (
            <Typography color="error" variant="body2" className="error-message">
              {error}
            </Typography>
          )}

          <Box className="input-field">
            <EmailIcon className="field-icon" />
            <TextField
              fullWidth
              label="Email"
              name="schoolEmail"
              type="email"
              required
              value={formData.schoolEmail}
              onChange={handleChange}
              className="text-field"
              placeholder="example@cit.edu"
            />
          </Box>

          <Box className="input-field">
            <BadgeIcon className="field-icon" />
            <TextField
              fullWidth
              label="School ID"
              name="schoolId"
              required
              value={formData.schoolId}
              onChange={handleChange}
              className="text-field"
              placeholder="00-0000-000"
            />
          </Box>

          <Box className="input-field">
            <PersonIcon className="field-icon" />
            <TextareaAutosize
              minRows={3}
              placeholder="Bio (Optional)"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="bio-field"
            />
          </Box>

          <Box className="input-field">
            <LockIcon className="field-icon" />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="text-field"
              helperText={
                <Box>
                  <Typography variant="caption">
                    Password Strength: {passwordStrength.strength}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(passwordStrength.score / 5) * 100}
                    color={
                      passwordStrength.score <= 1 ? 'error' :
                      passwordStrength.score <= 2 ? 'warning' :
                      passwordStrength.score <= 3 ? 'secondary' :
                      'success'
                    }
                  />
                  <Box display="flex" flexDirection="column" mt={1}>
                    <Typography variant="caption" color={passwordStrength.checks.length ? 'success' : 'error'}>
                      {passwordStrength.checks.length ? '✓' : '✗'} At least 8 characters
                    </Typography>
                    <Typography variant="caption" color={passwordStrength.checks.punctuation ? 'success' : 'error'}>
                      {passwordStrength.checks.punctuation ? '✓' : '✗'} Contains punctuation
                    </Typography>
                    <Typography variant="caption" color={passwordStrength.checks.uppercase ? 'success' : 'error'}>
                      {passwordStrength.checks.uppercase ? '✓' : '✗'} Contains uppercase letter
                    </Typography>
                    <Typography variant="caption" color={passwordStrength.checks.lowercase ? 'success' : 'error'}>
                      {passwordStrength.checks.lowercase ? '✓' : '✗'} Contains lowercase letter
                    </Typography>
                    <Typography variant="caption" color={passwordStrength.checks.number ? 'success' : 'error'}>
                      {passwordStrength.checks.number ? '✓' : '✗'} Contains number
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Box>

          <Box className="input-field">
            <LockIcon className="field-icon" />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="text-field"
            />
          </Box>

          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            type="submit"
            className="signup-button"
          >
            Register
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Signup;