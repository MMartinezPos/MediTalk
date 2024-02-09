import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Session() {
    const [micActive, setMicActive] = useState(false);
    const [languageOptionsVisible, setLanguageOptionsVisible] = useState(false);

    const toggleMic = () => {
        setMicActive(!micActive);
        if (micActive) {
            alert("Mic is now inactive. Toggle again to begin medical interpretation.");
        } else {
            alert("Mic is active. Begin speaking.");
        }
    };

    const showLanguageOptions = () => {
        setLanguageOptionsVisible(!languageOptionsVisible);
    };

    const selectLanguage = (language) => {
        alert(`Selected language: ${language}`);
        setLanguageOptionsVisible(false);
    };

    const navigate = useNavigate(); 

    const endSessionConfirmation = () => {
        const confirmEnd = window.confirm("Are you sure you wish to end this session?");
        if (confirmEnd) {
            navigate('/log');
        }
    };

    const logout = () => {
        const confirmLogout = window.confirm("Are you sure you wish to log out?");
        if (confirmLogout) {
            navigate('/');
        }
    };

    return (
        <div>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '93vh' }}>
            <header>
                <Typography variant="h1">MediTalk - Medical Translation App</Typography>
            </header>

            <main>
                <section className="translation-section">
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                        <Button variant="contained" color="primary" onClick={toggleMic}>
                            {micActive ? "Mic is ON" : "Mic is OFF"}
                        </Button>
                        <Button variant="contained" color="primary" onClick={showLanguageOptions}>
                            Select Language
                        </Button>
                        <Button variant="contained" color="primary" onClick={logout}>
                            Log Out
                        </Button>
                        <Button variant="contained" color="primary" onClick={endSessionConfirmation}>
                            End Session
                        </Button>
                    </Box>

                    {languageOptionsVisible && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <Button variant="contained" color="primary" onClick={() => selectLanguage('English')}>
                                English
                            </Button>
                            <Button variant="contained" color="primary" onClick={() => selectLanguage('Spanish')}>
                                Spanish
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem' }}>
                        <Box sx={{ border: '1px solid black', padding: '1rem', width: '40%', minHeight: '200px', marginRight: '1rem', marginLeft: '1rem', flexGrow: 1 }}>
                            <Typography variant="h4">English</Typography>
                            <Typography id="englishText"></Typography>
                        </Box>

                        <Box sx={{ border: '1px solid black', padding: '1rem', width: '50%', minHeight: '200px', marginRight: '1rem', marginLeft: '1rem', flexGrow: 1 }}>
                            <Typography variant="h4">Spanish</Typography>
                            <Typography id="spanishText"></Typography>
                        </Box>
                    </Box>
                </section>
            </main>

            <footer style={{ marginTop: 'auto', textAlign: 'center' }}>
                <Typography variant="body2">&copy; 2024 Meditalk Web App</Typography>
            </footer>
            </Box>
        </div>
    );
}

export default function Blog() {
    return (
        <Session />
    );
}