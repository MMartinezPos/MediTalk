import speech_recognition as sr
## Need PyAudio as a dependency for the microphone to work
import pyaudio

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

    print("Listening...")
    try:
        while True:
            # Listens for the user's input 
            audio_data = recognizer.listen(source, timeout=10)
            print("Done recording")
            print("Recognizing...")
            # Recognize audio using Google Speech Recognition
            text = recognizer.recognize_google(audio_data, language="en-US")
            print(f"You said: {text}")
    except KeyboardInterrupt:
        print("Recognition stopped.")
    except sr.RequestError as e:
        print("Could not request results; {0}".format(e))
    except sr.UnknownValueError as e:
        print("Unknown error occurred; {0}".format(e))
