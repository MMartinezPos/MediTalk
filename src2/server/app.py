# Combine all three together
from dotenv import load_dotenv
from openai import OpenAI
import speech_recognition as sr
from gtts import gTTS
import sounddevice as sd
import soundfile as sf

from pydub import AudioSegment
from pydub.playback import play

import numpy as np
from io import BytesIO
import os
import time
## Need PyAudio as a dependency for the microphone to work
import pyaudio
#import whisper
# Need to import PyTorch for Whisper
import torch
import json

# FLASK!!!
from flask import Flask, session, Response, jsonify, request, after_this_request, send_file, redirect, url_for
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename


app = Flask(__name__)
cors = CORS(app)


upload_directory = "/uploads"

if not os.path.exists(upload_directory):
    os.mkdir(upload_directory)


# Set secret key in Flask
app.config['SECRET_KEY'] = 'x8D13XJ5+FTGNh5agRU7nF0B'    

# Max content length
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024 # 64 MB

app.config['UPLOAD_FOLDER'] = upload_directory

# Load the stored environment variables environment variables from the .env file
load_dotenv()

# Now, you can access the environment variables using the `os` module
import os

# Get the varable
the_api_key = os.getenv("API_KEY")





# Initialize the OpenAI client with the API key
client = OpenAI(api_key=the_api_key)

# ChatGPT Wrapper Method with optional parameters (ones with default values)
def chatgpt_call(prompt, model="gpt-3.5-turbo", temperature=0, n=1, max_tokens=256):
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You will be provided with a sentence in English, and your task is to translate it into Spanish."},
            {"role": "user", "content": prompt}
        ],
        temperature=temperature,
        n=n,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content

# Initialize the recognizer
recognizer = sr.Recognizer()



# Testing function
def play_audio(file_path):
    try:
        # Read the audio file
        data, samplerate = sf.read(file_path)

        # Play the audio file
        sd.play(data, samplerate)
        sd.wait()

    except Exception as e:
        print(f"Error playing audio: {e}")



def delete_file(file_path):
    """
    Deletes a file at the specified path.

    Args:
        file_path (str): The path of the file to be deleted.
        
    Returns:
        bool: True if the file was successfully deleted, False otherwise.
    """
    if os.path.exists(file_path):
        os.remove(file_path)
        #print(f"The file at {file_path} has been successfully deleted.")
        return True
    else:
        #print(f"The file at {file_path} does not exist.")
        return False
    



@app.route('/speech-to-text', methods=['POST'])
@cross_origin()
def speech_to_text():
   
    #print(request.content_type)
    #print(request.content_length)
    #print(request.data)

    # Wrapper
    # Returns a FileStorage class which is a wrapper over incoming files
    the_file = request.files['file']

    # Get the current working directory
    current_dir = os.getcwd()

    # Get the current epoch time in milliseconds
    current_time = int(time.time() * 1000)

    save_path = os.path.join(current_dir + "\\uploads", f"temp_{current_time}.webm")
    # Before saving
    the_file.seek(0)
    the_file.save(save_path)
    # IMPORTANT
    # If the destination is a file object you have to close it yourself after the call. 
    the_file.close()

    #print(save_path)

    # Load the WebM audio file
    audio = AudioSegment.from_file(save_path, format="webm")

     # Export the audio to WAV format
    out_path = os.path.join(current_dir + "\\uploads", f"temp_{current_time}.wav")
    audio.export(out_path, format="wav")

    # Play the audio file
    # play_audio(out_path)


    # Debugging
    # print(the_file)
    # print(type(the_file))
    # print(file_content[:1000])
    # print(type(file_content))
    
    # Check if the file is empty
    if the_file.filename == '':
        return "No selected file", 400
    
   

    # Source: https://gist.github.com/mjul/32d697b734e7e9171cdb
    # Create a BytesIO object from the provided byte data
    # expects binary-like objects and produces bytes objects
    # BytesIO For Managing Data As File Object in Python
    # Yes, BytesIO (and StringIO) are in-memory buffers that behave like files.
   # in_memory_file = BytesIO(file_content)

    # the_file.save(in_memory_file)

   # print(in_memory_file)
   # print(in_memory_file.getvalue())
    
    print("GOT IT")

    #  # In this example, let's just echo back the original file
    # return send_file(file_contents, download_name='converted_audio.mp3', as_attachment=True)
    
    # Convert BytesIO object to AudioSegment
    # audio_segment = AudioSegment.from_file(in_memory_file, format="wav")

    
    
   # IMPORTANT PART
    
   # https://www.nickmccullum.com/python-speech-recognition/
   # The following file formats are supported by SpeechRecognition:

    # wav
    # aiff
    # aiff-c
    # flac


    # https://github.com/Uberi/speech_recognition/blob/master/examples/audio_transcribe.py    
    with sr.AudioFile(out_path) as source:
        #recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.record(source)  # read the entire audio file
        
    print("Recognizing...")
    # Recognize audio using Google Speech Recognition
    text = recognizer.recognize_google(audio, language="en-US")
    english_text = text
    print(f"You said: {text}")

    prompt = text
    response = chatgpt_call(prompt, model="gpt-4")
    print(response)
    text = response
    spanish_text = text

    # Initialize the gTTS object
    # tts = gTTS(text=text, lang='es', tld='com.mx')
    tts = gTTS(text=text, lang='es', tld='com.mx')

    # Source: https://blog.furas.pl/python-how-to-play-mp3-from-gtts-as-bytes-without-saving-on-disk-gb.html

    # Save the speech as an in-memory BytesIO object
    audio_data = BytesIO()
    # Write bytes to a file-like object
    tts.write_to_fp(audio_data)

    # Rewind the audio data
    audio_data.seek(0)

    # Read the audio data as a NumPy array using soundfile
    # IMPORTANT, need both the audio and the sample rate
    audio_array, sample_rate = sf.read(BytesIO(audio_data.read()))

    # Play the audio
    sd.play(audio_array, sample_rate * 0.95)
    sd.wait()
    
    # return text

    # Delete temp files once done
    delete_file(save_path)
    delete_file(out_path)

    return json.dumps({"English": english_text,
                       "Spanish": spanish_text
                     })


# FOR SECURITY
# Remove the "Server" response header for all routes
@app.after_request
def remove_server_header(response):
    response.headers.pop('Server', None)
    return response

if __name__ == '__main__':
    app.run(debug=True, port="5000")
    