// components/Signup.jsx
import { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  TextareaAutosize
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import './Signup.css';

const Signup = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    schoolId: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup data:', formData);
    onClose();
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
          <Box className="input-field">
            <EmailIcon className="field-icon" />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="text-field"
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