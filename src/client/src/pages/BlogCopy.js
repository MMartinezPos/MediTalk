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
    // const [englishText, setEnglishText] = useState('');
    // const [spanishText, setSpanishText] = useState('');
    const [promptText, setPromptText] = useState('');
    const [baseTranslation, setBaseTranslation] = useState('');
    const [trainedTranslation, setTrainedTranslation] = useState('');
    const [englishBoxFirst, setEnglishBoxFirst] = useState(true); // Track if English box should be first

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
          console.log("Permission is already granted.");
        }
    };
    
    useEffect(() => {
        getMicrophonePermission();
    }, []);

    const startRecording = async () => {
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
    
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('language', audioSource);
    
            // Add source_lang and target_lang to the formData
            let source_lang, target_lang;
            if (audioSource === 'English') {
                source_lang = 'en';
                target_lang = 'es';
                setEnglishBoxFirst(true); // English box should be first
            } else if (audioSource === 'Spanish') {
                source_lang = 'es';
                target_lang = 'en';
                setEnglishBoxFirst(false); // Spanish box should be first
            }
    
            console.log(`source_lang: ${source_lang}, target_lang: ${target_lang}`);
            
            // Fetch the translation data from the backend
            fetchTranslation(formData, source_lang, target_lang);
    
            setAudioChunks([]);
        }
    }, [audioChunks, audioSource]);
    
    const fetchTranslation = async (formData, source_lang, target_lang) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/speech-to-text', {
                method: 'POST',
                body: formData,
            });
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioSrc(audioUrl);
            const audio = new Audio(audioUrl);
            audio.play();
    
            const translationResponse = await fetch('http://127.0.0.1:5000/get_translation', {
                method: 'GET',
            });
            const translationData = await translationResponse.json();
            console.log(translationData);
        
            setPromptText(translationData.PromptText);
            setBaseTranslation(translationData.BaseText);
            setTrainedTranslation(translationData.TrainedText);

        } catch (error) {
            console.error('Error fetching translation:', error);
        }
    };

    const stopRecording = () => {
        mediaRecorder.current.stop();
        setIsRecording(false);
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
        setLanguageOptionsVisible(false);
        setAudioSource(language);
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
                        {englishBoxFirst ? (
                            <>
                                <Box sx={{ border: '1px solid black', padding: '1rem', width: '40%', minHeight: '200px', marginRight: '1rem', marginLeft: '1rem', flexGrow: 1 }}>
                                    <Typography variant="h4">English</Typography>
                                    <Typography id="englishText">{promptText}</Typography>
                                </Box>
                                <Box sx={{ border: '1px solid black', padding: '1rem', width: '50%', minHeight: '200px', marginRight: '1rem', marginLeft: '1rem', flexGrow: 1 }}>
                                    <Typography variant="h4">Spanish</Typography>
                                    <Typography variant="h5">Base Model:</Typography>
                                    <Typography>{baseTranslation}</Typography>
                                    <Typography variant="h5">Trained Model:</Typography>
                                    <Typography>{trainedTranslation}</Typography>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box sx={{ border: '1px solid black', padding: '1rem', width: '50%', minHeight: '200px', marginRight: '1rem', marginLeft: '1rem', flexGrow: 1 }}>
                                    {/*this is intentional as it ahderes to the logic in the backend */}
                                    {/* hopefully a neater way to accomplish this will be done in the future*/}
                                    <Typography variant="h4">Spanish</Typography>
                                    <Typography id="englishText">{promptText}</Typography>
                                </Box>
                                <Box sx={{ border: '1px solid black', padding: '1rem', width: '50%', minHeight: '200px', marginRight: '1rem', marginLeft: '1rem', flexGrow: 1 }}>
                                    <Typography variant="h4">Translations</Typography>
                                    <Typography variant="h5">Base Model:</Typography>
                                    <Typography>{baseTranslation}</Typography>
                                    <Typography variant="h5">Trained Model:</Typography>
                                    <Typography>{trainedTranslation}</Typography>
                                </Box>
                            </>
                        )}
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
