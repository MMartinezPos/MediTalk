import sacrebleu

# Example input text in English
input_text = "Translate this English text to Spanish."

# Example reference translation in Spanish
reference_translation = "Traduzca este texto en inglés al español."

# Example model-generated translation in Spanish
model_generated_translation = "Traducir este texto al español."

# Calculate BLEU score
bleu_score = sacrebleu.sentence_bleu(model_generated_translation, [reference_translation])
print("BLEU Score:", bleu_score.score)
