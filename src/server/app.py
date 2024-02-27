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
from flask import Flask, jsonify, send_file, session, Response, jsonify, request, after_this_request, send_file, redirect, url_for
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename

# get current directory of script
# Define current working directory
current_dir = os.getcwd()


app = Flask(__name__)
# Enable CORS
cors = CORS(app)

def delete_file(file_path):
    if os.path.exists(file_path):
        os.remove(file_path)
    else:
        print("The file does not exist")


upload_directory = "/uploads"

if not os.path.exists(upload_directory):
    os.mkdir(upload_directory)


# Initial Delete
for f in os.listdir(upload_directory):
    os.remove(os.path.join(upload_directory, f))

# Set secret key in Flask
app.config['SECRET_KEY'] = 'x8D13XJ5+FTGNh5agRU7nF0B'    

# Max content length (64 MB)
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024

app.config['UPLOAD_FOLDER'] = upload_directory

# Load the stored environment variables environment variables from the .env file
load_dotenv()

# Now, you can access the environment variables using the `os` module
import os
from speech_recognition import UnknownValueError
from speech_recognition import RequestError

# Get the variable
the_api_key = os.getenv("API_KEY")




# CHATGPT SETUP

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




# PYTHON AUDIO SETUP

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


# Helper Method to delete files
# def delete_file(file_path):
#     """
#     Deletes a file at the specified path.

#     Args:
#         file_path (str): The path of the file to be deleted.
        
#     Returns:
#         bool: True if the file was successfully deleted, False otherwise.
#     """
#     if os.path.exists(file_path):
#         os.remove(file_path)
#         #print(f"The file at {file_path} has been successfully deleted.")
#         return True
#     else:
#         #print(f"The file at {file_path} does not exist.")
#         return False
    


# REST API ENDPOINT
@app.route('/speech-to-text', methods=['POST'])
@cross_origin()
def speech_to_text():
    # MOVED in order to define before use
    current_time = int(time.time() * 1000)
    #### RECEIVE AND PROCESS REQUEST
   
    #print(request.content_type)
    #print(request.content_length)
    #print(request.data)

    # Wrapper
    # Returns a FileStorage class which is a wrapper over incoming files
    # Assuming you're receiving the file in a form field called 'file'
    the_file = request.files['file']

    # Use a relative path for the uploads directory
    save_path = os.path.join('uploads', the_file.filename)

    # Ensure the directory exists before saving the file
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    the_file.save(save_path)

    # IMPORTANT
    # If the destination is a file object you have to close it yourself after the call. 
    the_file.close()






    #### SPEECH TO TEXT

    # Load the WebM audio file
    audio = AudioSegment.from_file(save_path, format="webm")

     # Export the audio to WAV format for audio purposes
    out_path = os.path.join(current_dir + "\\uploads", f"temp_{current_time}.wav")
    audio.export(out_path, format="wav")


    # Source: https://gist.github.com/mjul/32d697b734e7e9171cdb
    # Create a BytesIO object from the provided byte data
    # expects binary-like objects and produces bytes objects
    # BytesIO For Managing Data As File Object in Python
    # Yes, BytesIO (and StringIO) are in-memory buffers that behave like files.
    # in_memory_file = BytesIO(file_content)

    # the_file.save(in_memory_file)

    # print(in_memory_file)
    # print(in_memory_file.getvalue())
    
    # Debugging
    print("GOT REQUEST FROM BROWSER")

    
   # PAY ATTENTION HERE
   # https://www.nickmccullum.com/python-speech-recognition/
   # The following file formats are supported by SpeechRecognition:

    # wav
    # aiff
    # aiff-c
    # flac

    # https://github.com/Uberi/speech_recognition/blob/master/examples/audio_transcribe.py    
    with sr.AudioFile(out_path) as source:
        audio = recognizer.record(source)  # read the entire audio file
        
    print("Recognizing...")
    # Recognize audio using Google Speech Recognition
    try:
        # Recognize audio using Google Speech Recognition
        text = recognizer.recognize_google(audio, language="en-US")
        print("Recognized text:", text)

    except UnknownValueError:
        print("Google Speech Recognition could not understand audio")

    except RequestError as e:
        print("Could not request results from Google Speech Recognition service; {0}".format(e))

    except TimeoutError:
        print("Google Speech Recognition request timed out")
    print(text)
    english_text = text
    print(f"You said: {text}")






    #### IMPORTANT PART: Translating/Interpreting Step here

    prompt = text
    # THE FUNCTION CALL THAT DOES THE TRANSLATING/INTERPRETING
    response = chatgpt_call(prompt, model="gpt-4")
    print(f"The model says: {response}")
    text = response
    spanish_text = text






    #### TEXT-TO-SPEECH

    # Initialize the gTTS object
    # AND DO THE TEXT TO SPEECH PROCESSING
    tts = gTTS(text=text, lang='es', tld='com.mx')

    # Source: https://blog.furas.pl/python-how-to-play-mp3-from-gtts-as-bytes-without-saving-on-disk-gb.html

    # Save the speech as an in-memory BytesIO object
    audio_data = BytesIO()

    # Write bytes to a file-like object
    tts.write_to_fp(audio_data)

    # Write to an actual file
    # Get the current epoch time in milliseconds
    # current_time = int(time.time() * 1000)
    new_filename = os.path.join(current_dir + "\\uploads", f"new_{current_time}.wav")
    tts.save(new_filename)

    # Rewind the audio data
    audio_data.seek(0)

    # FOR PLAYING OUT LOUD IN PYTHON
    # Read the audio data as a NumPy array using soundfile
    # IMPORTANT, need both the audio and the sample rate
    audio_array, sample_rate = sf.read(BytesIO(audio_data.read()))

    # Play the audio IN PYTHON HERE, NOT THE BROWSER
    # sd.play(audio_array, sample_rate * 0.95)
    # sd.wait()
    



    #### RETURN THE AUDIO FILE & JSON

    # Delete temp files once done
    delete_file(save_path)
    delete_file(out_path)

    # RETURN JSON WITH NO AUDIO FILE
    # In Flask, use jsonify() instead of json.dumps() in Flask
    # return jsonify({"English": english_text,
    #                    "Spanish": spanish_text
    #                  }), 200

    # Exits the Flask REST METHOD
    # Return actual AUDIO FILE ITSELF WITHOUT JSON
    # In HTTP Response -> Content-Disposition
    return send_file(
       new_filename, 
       mimetype="audio/wav", 
       as_attachment=False)




# FOR SECURITY
# Remove the "Server" response header for all routes
@app.after_request
def remove_server_header(response):
    response.headers.pop('Server', None)
    return response



# For it to actually run
if __name__ == '__main__':
    app.run(debug=True)
    