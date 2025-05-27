import openai
import os
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_response(prompt):
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions="Help gebruikers op een vriendelijke en empathische manier. Stel vragen om hen beter te begrijpen, zoals hun leeftijd, hoe ze zich voelen, en wat ze zoeken. Antwoord standaard in het Nederlands, tenzij de gebruiker in een andere taal met je praat. Als je in een andere taal wordt aangesproken, reageer in die taal.",
        input=prompt
    )
    return response.output_text
