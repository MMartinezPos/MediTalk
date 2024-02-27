# Combine all three together
from dotenv import load_dotenv
from openai import OpenAI
import speech_recognition as sr
from gtts import gTTS
import sounddevice as sd
import soundfile as sf
import numpy as np
import io
## Need PyAudio as a dependency for the microphone to work
import pyaudio
#import whisper
# Need to import PyTorch for Whisper
import torch

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

# Initialize the microphone
microphone = sr.Microphone()

# use the microphone as source for input
with microphone as source:
    print("Adjusting noise...")
    # wait for a second to let the recognizer
    # adjust the energy threshold based on
    # the surrounding noise level 
    recognizer.adjust_for_ambient_noise(source, duration = 1) 

    try:
        while True:
            print("Listening...")
            # Listens for the user's input 
            audio_data = recognizer.listen(source, timeout=10)
            print("Done recording")
            print("Recognizing...")
            # Recognize audio using Google Speech Recognition
            text = recognizer.recognize_google(audio_data, language="en-US")
            print(f"You said: {text}")

            prompt = text
            response = chatgpt_call(prompt, model="gpt-4")
            print(response)
            text = response

            # Initialize the gTTS object
            # tts = gTTS(text=text, lang='es', tld='com.mx')
            tts = gTTS(text=text, lang='es', tld='com.mx')

            # Save the speech as an in-memory BytesIO object
            audio_data = io.BytesIO()
            # Write bytes to a file-like object
            tts.write_to_fp(audio_data)

            # Rewind the audio data
            audio_data.seek(0)

            # Read the audio data as a NumPy array using soundfile
            # IMPORTANT, need both the audio and the sample rate
            audio_array, sample_rate = sf.read(io.BytesIO(audio_data.read()))

            # Play the audio
            sd.play(audio_array, sample_rate * 0.95)
            sd.wait()


            # # Save the speech as an audio file
            # tts.save("output_audio.mp3")


    except KeyboardInterrupt:
        print("Recognition stopped.")
    except sr.RequestError as e:
        print("Could not request results; {0}".format(e))
    except sr.UnknownValueError as e:
        print("Unknown error occurred; {0}".format(e))
