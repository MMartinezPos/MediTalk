import React, { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Session() {
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
        //create new Media recorder instance using the stream
        const media = new MediaRecorder(stream, { type: 'audio/webm' });
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder = media;
        //invokes the start method to start the recording process
        mediaRecorder.start();
        
        mediaRecorder.ondataavailable = (event) => {
           if (typeof event.data === "undefined") return;
           if (event.data.size > 0) {
             setAudioChunks((prevChunks) => [...prevChunks, event.data]);
           }
        };
    };


    const stopRecording = async () => {
        //stops the recording instance
        await mediaRecorder.current.stop();
        mediaRecorder.onstop = async () => {
            //creates a blob file from the audiochunks data
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            //creates a playable URL from the blob file.
            const audioUrl = URL.createObjectURL(audioBlob);


            // Client-side code (e.g., running in a browser)
            try {
                // Create an instanceof FormData
                // Send binary data directly to backend by using a FormData
                const formData = new FormData();
                // Append the data to it
                formData.append('file', audioBlob);
        
                // Make a POST request to the server for speech-to-text conversion
                const response = await fetch('http://127.0.0.1:5000/speech-to-text', {
                    method: 'POST',
                    body: formData,
                    // DO NOT SET THE CONTENT-TYPE HEADERS HERE MANUALLY! LET BROWSER DO IT AUTOMATICALLY
                    // Source: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects
                });
                console.log(response);

                // Check if the request was successful (status code 2xx)
                if (response.ok) {
                    // JSON TESTING
                    // const result = await response.json();
                    // console.log(result);

                    // BLOB TESTING
                    const newBlob = await response.blob();

                    // Create a blob URL for the audio file
                    const newBlobUrl = URL.createObjectURL(newBlob);

                    // Set the blob URL as the source for the audio element
                    setAudioSource(newBlobUrl);

                    // Auto-play the audio IN BROWSER
                    if (audioRef.current) {
                        audioRef.current.play();
                    }


                } else {
                    // Handle error if the server returns an error status code
                    console.error('Speech-to-text conversion failed:', response.statusText);
                }
            } catch (error) {
                // Handle network or other errors
                console.error('Error during fetch:', error.message);
            }


             // Clear chunks for future recordings
             setAudioChunks([]);
        };
    };







    // React state update are asynchronous
    // Need to use callback form
    const toggleMic = () => {
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