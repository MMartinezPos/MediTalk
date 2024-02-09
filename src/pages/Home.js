// Home.js
import React from 'react';
import HomepageImage from '../components/HomepageImage'
import { styled } from '@mui/system';
import { Grid, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const useStyles = styled((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

function Authentication() {
  const classes = useStyles();
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const authenticate = (event) => {
    event.preventDefault(); // Prevent form submission for now

    // For simplicity, let's assume authentication is successful
    const authenticated = true;

    if (authenticated) {
      navigate('/blog'); // Use navigate to go to the Blog page
    } else {
      alert("Authentication failed. Please check your credentials.");
    }
  };

    return (
      <Grid container direction="column" justifyContent="center" alignItems="center" style={{ minHeight: '75vh' }}>
        <Grid item>
          <h1>Welcome to MediTalk!</h1>
        </Grid>
        <Grid item>
            <h3 style={{ color: '#1976d2' }}>Please sign in to continue</h3>
        </Grid>
        <Grid item>
          <h2>Authentication</h2>
        </Grid>
        <Grid item>
          <div className={classes.root}>
            <form id="authForm" onSubmit={authenticate}>
              <TextField
                id="username"
                name="username"
                label="Username"
                variant="outlined"
                required
                
              />
              <TextField
                id="password"
                name="password"
                label="Password"
                type="password"
                variant="outlined"
                required
                sx={{marginLeft: "30px", marginBottom: "10px"}}
              />
              <Grid item container justifyContent="center">
              <Button type="submit" variant="contained" color="primary">
                Sign In
              </Button>
              </Grid>
            </form>
          </div>
        </Grid>
      </Grid>
    );
}

// export default Authentication;

export default function Home() {
  return (
    <>
      <Authentication />
    </>
  );
}
