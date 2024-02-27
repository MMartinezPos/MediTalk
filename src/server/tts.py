from gtts import gTTS
import sounddevice as sd
import soundfile as sf
import numpy as np
import io

# text = "This is a sample text to be converted to speech."
text = "Los latidos del bebé cayeron por debajo de 45 latidos por minuto."

# Initialize the gTTS object
# tts = gTTS(text=text, lang='es', tld='com.mx')
tts = gTTS(text=text, lang='en', tld='com')

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