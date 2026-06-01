import { Box, Typography } from '@mui/material';
const currentYear = new Date().getFullYear();

function Footer({ isExpanded }) {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: isExpanded ? '240px' : '64px',
        height: '56px',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        transition: theme => theme.transitions.create('left', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.standard,
        })
      }}
    >
      

      <Typography variant="body2" color="text.secondary">
        © {currentYear} Catastrophe & National Claims. All Rights Reserved.
      </Typography>

    </Box>
  );
}

export default Footer; 