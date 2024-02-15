from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch


# Load model directly
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")
# Ensure the model and tokenizer are on the same device (adjust as necessary for GPU use)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Define prompt function
def translate_prompt(prompt):
    # Since you're using a specific Spanish T5 model, ensure your prompt aligns with how the model was trained.
    # The prompt might not need "translate English to Spanish:" if the model is specifically trained for that purpose.
    # However, retaining it doesn't harm if the model understands this instruction.
    input_text = "translate English to Spanish: " + prompt
    input_ids = tokenizer.encode(input_text, return_tensors="pt").to(device)
    outputs = model.generate(input_ids, max_length=100, num_return_sequences=1, early_stopping=True)
    translated_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return translated_response

# Interactive loop for translation
while True:
    user_input = input("You: ")
    if user_input.lower() == 'exit':
        print("Goodbye!")
        break
    translated_response = translate_prompt(user_input)
    print("System:", translated_response)