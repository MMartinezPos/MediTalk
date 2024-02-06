import pandas as pd
from nltk.translate import bleu_score
from bert_score import score as bert_score
from nltk.translate.meteor_score import meteor_score
import nltk
import ssl
import torch

# Suppress SSL warnings
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Download NLTK data (if not already downloaded)
nltk.download('punkt')
nltk.download('wordnet')

# Assuming 'llamaTranslations.csv' is the name of your CSV file
input_file_path = 'llamaTranslations.csv'

df = pd.read_csv(input_file_path)

# Assuming column 1 contains English and column 2 contains Spanish
english_phrases = df.iloc[:, 0].astype(str).tolist()
spanish_translations = df.iloc[:, 1].astype(str).tolist()

 # Compute BERTScore
_, _, bert_scores = bert_score(spanish_translations, english_phrases, lang='en', rescale_with_baseline=True)

# Tokenize the English phrases and Spanish translations
english_tokenized = [nltk.word_tokenize(phrase.lower()) for phrase in english_phrases]
spanish_tokenized = [nltk.word_tokenize(translation.lower()) for translation in spanish_translations]

# Compute BLEU score
bleu_scores = [bleu_score.sentence_bleu([ref], trans) for ref, trans in zip(english_tokenized, spanish_tokenized)]
overall_bleu = sum(bleu_scores) / len(bleu_scores)

# Compute METEOR score
meteor_scores = [meteor_score([ref], trans) for ref, trans in zip(english_tokenized, spanish_tokenized)]
overall_meteor = sum(meteor_scores) / len(meteor_scores)

# Print the scores
print(f'Overall BLEU Score: {overall_bleu}')
print(f'Overall BERTScore: {bert_scores.mean().item()}')
print(f'Overall METEOR Score: {overall_meteor}')
