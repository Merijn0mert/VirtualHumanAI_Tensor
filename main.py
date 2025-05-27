from utils.speech_to_text import transcribe_audio
from utils.chat import get_response
from utils.text_to_speech import speak
import sounddevice as sd
from scipy.io.wavfile import write
import time

conversation_history = ""

def record_audio(filename="input.wav", duration=5, fs=44100):
    print("Recording...")
    audio = sd.rec(int(duration * fs), samplerate=fs, channels=1)
    sd.wait()
    write(filename, fs, audio)
    print("Done.")
    return filename

def add_to_memory(user="None", text=""):
    global conversation_history
    conversation_history += f"{user}: {text}\n"

def start_conversation():
    global conversation_history
    print("Press Ctrl+C to exit the conversation.")
    try:
        while True:
            audio_file = record_audio()
            text = transcribe_audio(audio_file)
            print("You said:", text)
            add_to_memory(user="User", text=text)

            reply = get_response(conversation_history)
            print("GPT-4o-mini:", reply)
            speak(reply)
            add_to_memory(user="User", text=reply)

            # Add a short delay to avoid overlapping conversations
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nConversation ended.")

if __name__ == "__main__":
    start_conversation()

