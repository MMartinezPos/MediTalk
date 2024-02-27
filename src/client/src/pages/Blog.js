import React, { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Session() {
    const [permission, setPermission] = useState(false);
    const [audioChunks, setAudioChunks] = useState([]);
    const [stream, setStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [languageOptionsVisible, setLanguageOptionsVisible] = useState(false);
    const [audioSource, setAudioSource] = useState(null);
    const audioRef = useRef(null);
    let media;

    const constraints = {
        audio: {
            noiseSuppression: true,
            echoCancellation: true,
        },
        video: false,
    };

    useEffect(() => {
        const getMicrophonePermission = async () => {
            if (!permission && "MediaRecorder" in window) {
                try {
                    const streamData = await navigator.mediaDevices.getUserMedia(constraints);
                    setPermission(true);
                    setStream(streamData);
                } catch (err) {
                    alert(err.message);
                }
            } else {
                console.log("Permission is already granted.");
            }
        };

        getMicrophonePermission();
    }, [permission, constraints]);

    const startRecording = () => {
        setAudioChunks([]);
        media = new MediaRecorder(stream, { type: 'audio/webm' });

        media.ondataavailable = (event) => {
            if (event.data.size > 0) {
                setAudioChunks((prevChunks) => {
                    return [...prevChunks, event.data]
                });
            }
        };

        media.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log(audioUrl);

            try {
                const formData = new FormData();
                formData.append('file', audioBlob);

                const response = await fetch('http://127.0.0.1:5000/speech-to-text', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const newBlob = await response.blob();
                    const newBlobUrl = URL.createObjectURL(newBlob);
                    setAudioSource(newBlobUrl);

                    if (audioRef.current) {
                        audioRef.current.play();
                    }
                } else {
                    console.error('Speech-to-text conversion failed:', response.statusText);
                }
            } catch (error) {
                console.error('Error during fetch:', error.message);
            }

            setAudioChunks([]);
        };

        media.start();
    };

    const stopRecording = async () => {
        await media.stop();
    };

    const toggleMic = () => {
        setIsRecording(prevIsRecording => {
            const newIsRecording = !prevIsRecording;

            if (newIsRecording) {
                startRecording();
            } else {
                stopRecording();
            }

            return newIsRecording;
        });
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
                            {isRecording ? "Mic is ON" : "Mic is OFF"}
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
                        <audio id="hiddenAudio" controls style={{ display: 'none' }} src={audioSource} ref={audioRef}></audio>
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
