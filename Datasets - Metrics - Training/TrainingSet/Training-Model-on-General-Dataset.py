from datasets import load_dataset, concatenate_datasets
from transformers import AutoTokenizer, DataCollatorForSeq2Seq, Seq2SeqTrainingArguments, Seq2SeqTrainer
from transformers import T5ForConditionalGeneration
import torch

# Load the dataset
dataset_dict = load_dataset('csv', data_files='GeneralEvalSet.csv')
dataset = dataset_dict['train']

# Split the dataset into training, validation, and test sets using a more standard approach
train_test_split = dataset.train_test_split(test_size=0.3)  # 70% training, 30% for test+validation
validation_test_split = train_test_split['test'].train_test_split(test_size=0.5)  # Split the 30% into 15% validation and 15% test

train_dataset = train_test_split['train']
validation_dataset = validation_test_split['train']
test_dataset = validation_test_split['test']

# Load the T5 tokenizer, model, and data collator
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")
data_collator = DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model)

# Define the preprocess function
def preprocess_function(examples):
    inputs = [f'translate English to Spanish: {text}' for text in examples['English']]
    targets = examples['Spanish']
    model_inputs = tokenizer(inputs, max_length=256, truncation=True, padding='max_length')
    labels = tokenizer(targets, max_length=256, truncation=True, padding='max_length').input_ids
    model_inputs["labels"] = labels
    return model_inputs

# Preprocess the datasets
train_encoded_dataset = train_dataset.map(preprocess_function, batched=True)
validation_encoded_dataset = validation_dataset.map(preprocess_function, batched=True)
test_encoded_dataset = test_dataset.map(preprocess_function, batched=True)

# Define the training arguments
training_args = Seq2SeqTrainingArguments(
    output_dir='./results_evaluation',
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    logging_dir='./logs_evaluation',
    num_train_epochs=3,  # Adjust as needed
    learning_rate=5e-5,  # Adjust as needed
    save_steps=100,      # Adjust as needed
)

# Initialize the trainer
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=train_encoded_dataset,
    eval_dataset=validation_encoded_dataset,
    data_collator=data_collator,
    tokenizer=tokenizer,
)

# Optionally, evaluate the model on the validation dataset before training to have a baseline
eval_results_before_training = trainer.evaluate(eval_dataset=validation_encoded_dataset)
print("Evaluation Results on Validation Set Before Training:", eval_results_before_training)

# Train the model
trainer.train()

# Evaluate the trained model on the test set
test_eval_results = trainer.evaluate(eval_dataset=test_encoded_dataset)
print("Evaluation Results on Test Set:", test_eval_results)
