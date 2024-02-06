# evaluate_model.py
from datasets import load_dataset
from transformers import AutoTokenizer, DataCollatorForSeq2Seq, Seq2SeqTrainingArguments, Seq2SeqTrainer
from transformers import T5ForConditionalGeneration
import torch

# Load the dataset
dataset_dict = load_dataset('csv', data_files='OriginEvalSet.csv')
dataset = dataset_dict['train']

# Load the T5 tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("t5-base")
model = T5ForConditionalGeneration.from_pretrained("t5-base")

# Define the preprocess function
# This function preprocesses the general evaluation dataset
def preprocess_function(examples):
    inputs = [f'translate English to Spanish: {text}' for text in examples['English']]
    targets = examples['Spanish']
    model_inputs = tokenizer(inputs, max_length=256, truncation=True, padding='max_length', return_tensors='pt')
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(targets, max_length=256, truncation=True, padding='max_length', return_tensors='pt')

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

# Preprocess the general evaluation dataset
encoded_dataset = dataset.map(preprocess_function, batched=True)

# Define the training arguments for evaluation
training_args = Seq2SeqTrainingArguments(
        output_dir='./results_evaluation',
        per_device_eval_batch_size=4,
        logging_dir='./logs_evaluation',
)

# Define the data collator for evaluation
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

# Create the trainer for evaluation
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    eval_dataset=encoded_dataset,
    data_collator=data_collator,
    tokenizer=tokenizer,
)

# Evaluate the model on general evaluation texts
eval_results = trainer.evaluate()

# Print the evaluation results
print("Evaluation Results on General Texts:", eval_results)

