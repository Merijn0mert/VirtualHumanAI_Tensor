from utils.speech_to_text import transcribe_audio
from utils.chat import get_response
from utils.text_to_speech import speak
import sounddevice as sd
from scipy.io.wavfile import write

def record_audio(filename="input.wav", duration=5, fs=44100):
    print("Recording...")
    audio = sd.rec(int(duration * fs), samplerate=fs, channels=1)
    sd.wait()
    write(filename, fs, audio)
    print("Done.")
    return filename

if __name__ == "__main__":
    audio_file = record_audio()
    text = transcribe_audio(audio_file)
    print("You said:", text)

    reply = get_response(text)
    print("GPT-4o-mini:", reply)

    speak(reply)
