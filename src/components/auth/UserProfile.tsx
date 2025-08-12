import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [error, setError] = useState('');
  
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      setSignOutLoading(true);
      setError('');
      await signOut();
      handleClose();
    } catch (err) {
      setError('Failed to sign out. Please try again.');
      console.error('Sign out error:', err);
    } finally {
      setSignOutLoading(false);
    }
  };

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          src={avatarUrl}
          alt={displayName}
          sx={{ width: 32, height: 32 }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleClose} sx={{ cursor: 'default' }}>
          <Avatar src={avatarUrl} alt={displayName} />
          <Box>
            <Typography variant="subtitle2">{displayName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleSignOut} disabled={signOutLoading}>
          <Typography variant="body2">
            {signOutLoading ? 'Signing out...' : 'Sign out'}
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};