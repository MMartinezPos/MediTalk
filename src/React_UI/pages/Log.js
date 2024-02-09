import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function PostSession() {
    const navigate = useNavigate();

    const viewTranscript = () => {
        alert("Implement the view transcript action.");
    };

    const downloadTranscript = () => {
        alert("Implement the download transcript action.");
    };

    const beginNewSession = () => {
        navigate('/blog');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '93vh' }}>
            <header>
                <Typography variant="h1" align="center">Post-Interpretation Page</Typography>
            </header>

            <main>
                <Typography variant="body1" align="center">placeholder for future content.</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <Button variant="contained" color="primary" onClick={viewTranscript} sx={{ maxWidth: '300px', width: '100%' }}>
                        View Transcript
                    </Button>
                    <Button variant="contained" color="primary" onClick={downloadTranscript} sx={{ maxWidth: '300px', width: '100%' }}>
                        Download Transcript
                    </Button>
                    <Button variant="contained" color="primary" onClick={beginNewSession} sx={{ maxWidth: '300px', width: '100%' }}>
                        Begin New Session
                    </Button>
                </Box>
            </main>

            <footer style={{ marginTop: 'auto', textAlign: 'center' }}>
                <Typography variant="body2">&copy; 2024 Meditalk Web App</Typography>
            </footer>
        </Box>
    );
}


export default function Log() {
    return (
      <>
        <PostSession />
        {/* <HomepageImage />
        <h2>Blog</h2> */}
      </>
    );
  }
