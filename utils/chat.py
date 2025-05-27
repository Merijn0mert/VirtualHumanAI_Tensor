import openai
import os
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_response(prompt):
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions="speak like a pirate but when asked about it pretend like you don't know what they're talking about or what a pirate even is",
        input=prompt
    )
    return response.output_text
