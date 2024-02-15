// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Recording_a_media_element

document.addEventListener('DOMContentLoaded', () => {
    // Check Browser Compatibility:   
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia is not supported on your browser');
        return;
    }

    // Initialize button and audio elements
    const recordButton = document.getElementById('recordButton');
    const stopButton = document.getElementById('stopButton');
    const downloadButton = document.getElementById('downloadButton');
    const audioPlayer = document.getElementById('audioPlayer');

    // Variables for recording functionality
    let mediaRecorder;
    let audioChunks = [];

    // Specify constraints
    const constraints = {
        audio: {
          noiseSuppression: true,
          echoCancellation: true, // Optional: Enable echo cancellation
        },
        video: false,
    };

    // Specify MIME type
    // By default webm is supported
    var options = { mimeType: 'audio/webm' };

    // Request access to the user's microphone
    // getUserMedia (gUM)
    // navigator.mediaDevices.getUserMedia({ audio: true })
    // Uses Promises   and .then
    // Can also use await here
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {

            // Create a MediaRecorder instance with the microphone stream
            mediaRecorder = new MediaRecorder(stream, options);

            // Event handler for dataavailable event (audio chunks)
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    // Push audio chunks to the array
                    audioChunks.push(event.data);
                }
            };

            // Event handler for stop event (end of recording)
            mediaRecorder.onstop = async () => {
                //console.log(audioChunks);
                // DEFAULT ONE:
                // let blob = new Blob(audioChunks, { 'type': 'audio/webm; codecs=opus' });

                 // Create a Blob from the recorded chunks and generate a download link
                 // The File Format for the Blob is Here
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                // window.open(audioUrl);



                /* SETTING THE HTML ELEMENT */

                // Set the audio player source to the recorded audio
                audioPlayer.src = audioUrl;
                // Set the href attribute to the file URL
                downloadButton.href = audioUrl;
                 // Set the download attribute with the desired file name
                downloadButton.download = 'recorded_audio.webm';
                // Enable the download button
                downloadButton.disabled = false;

                // Client-side code (e.g., running in a browser)
                // FORMS: e.preventDefault();
                try {
                    // Create an instanceof FormData
                    // Send binary data directly to backend by using a FormData
                    const formData = new FormData();
                    // Append the data to it
                    formData.append('file', audioBlob);




                    // const jsonData = {
                    //     user: 'John Doe',
                    //     timestamp: new Date().toISOString(),
                    //     message: 'This is a sample JSON payload along with an audio blob.',
                    //     // You can add more fields as needed
                    // };
                    // formData.append('json', JSON.stringify(jsonData));


            
                    // Make a POST request to the server for speech-to-text conversion
                    const response = await fetch('http://127.0.0.1:5000/speech-to-text', {
                        method: 'POST',
                        body: formData,
                        // DO NOT SET THE CONTENT-TYPE HEADERS HERE MANUALLY! LET BROWSER DO IT AUTOMATICALLY
                        // Source: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects
                    });

                    // Check if the request was successful (status code 2xx)
                    if (response.ok) {
                        const result = await response.json();
                        console.log(result);
                    } else {
                        // Handle error if the server returns an error status code
                        console.error('Speech-to-text conversion failed:', response.statusText);
                    }
                } catch (error) {
                    // Handle network or other errors
                    console.error('Error during fetch:', error.message);
                }

                // Clear the chunks array for future recordings
                audioChunks = [];
            };


            // Event listener for record button click
            recordButton.addEventListener('click', () => {
                // To make audio is not messed up
                audioChunks = [];
                mediaRecorder.start();
                // Disable respective buttons
                recordButton.disabled = true;
                stopButton.disabled = false;
                downloadButton.disabled = true;
            });

            // Event listener for stop button click
            stopButton.addEventListener('click', () => {
                // IMPORTANT: Stops the recording and update button states
                mediaRecorder.stop();
                // Disable respective buttons
                recordButton.disabled = false;
                stopButton.disabled = true;
                downloadButton.disabled = false;
            });

            // Event listener for download button click
            downloadButton.addEventListener('click', () => {
                // The download is handled automatically by the download attribute
            });
        })
        .catch((error) => {
            console.error('Error accessing microphone:', error);
        });
});