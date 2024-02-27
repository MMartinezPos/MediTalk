import React, { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Session() {
    const [audioSrc, setAudioSrc] = useState(null);
    const [permission, setPermission] = useState(false);
    let mediaRecorder = useRef(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [stream, setStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [languageOptionsVisible, setLanguageOptionsVisible] = useState(false);
    const [audioSource, setAudioSource] = useState(null);
    let audioRef = useRef(null);

    

    const constraints = {
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
        video: false,
    };
    const options = { mimeType: 'audio/webm' };




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
          // You can add a message or handle it differently if permission is already set
          console.log("Permission is already granted.");
        }
    };
    
    useEffect(() => {
        // Run the function when the component is mounted
        getMicrophonePermission();
    }, []); // Empty dependency array means this effect will run once after the initial render




    const startRecording = async () => {
        console.log('startRecording called')
        if (!(stream instanceof MediaStream)) {
            console.error('stream is not a MediaStream');
            return;
        }
    
        const media = new MediaRecorder(stream, options);
        mediaRecorder.current = media;
    
        mediaRecorder.current.ondataavailable = (event) => {
           if (typeof event.data === "undefined") return;
           if (event.data.size > 0) {
             setAudioChunks((prevChunks) => [...prevChunks, event.data]);
           }
        };
    
        mediaRecorder.current.start();
    };

    useEffect(() => {
        if (audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            // Create a FormData object
            const formData = new FormData();

            // Append the audio Blob as a file to the FormData object
            formData.append('file', audioBlob, 'audio.webm');

            // Send the FormData object to the server
            fetch('http://127.0.0.1:5000/speech-to-text', {
                method: 'POST',
                body: formData,
            })
            .then((response) => response.blob())
            .then((audioBlob) => {
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioSrc(audioUrl);
                const audio = new Audio(audioUrl);
                audio.play();
            });

            // Clear the audio chunks after processing
            setAudioChunks([]);
        }
    }, [audioChunks]);

    const stopRecording = () => {
        mediaRecorder.current.stop();
        setIsRecording(false);
    };







    // React state update are asynchronous
    // Need to use callback form
    const toggleMic = () => {
        console.log('stopRecording called')
        console.log(isRecording);
        setIsRecording(prevIsRecording => {
            // Flip it
            const newIsRecording = !prevIsRecording;
    
            if (newIsRecording) {
                // alert("Mic is active. Begin speaking.");
                startRecording();
            } else {
                // alert("Mic is now inactive. Toggle again to begin medical interpretation.");
                stopRecording();
            }
    
            // Return it to state variable
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            console.log('Button clicked');
                            toggleMic();
                        }}
                    >
                        {isRecording ? 'Mic is On' : 'Mic is Off'}
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

export default function BlogCopy() {
    return (
        <Session />
    );
}