from dotenv import load_dotenv
from openai import OpenAI


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
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You will be provided with a sentence in English, and your task is to translate it into Spanish."},
            {"role": "user", "content": prompt}
        ],
        temperature=temperature,
        n=n,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content


prompt = "The baby's heartbeats dropped below 45 beats per minute."

response = chatgpt_call(prompt)
print(response)
