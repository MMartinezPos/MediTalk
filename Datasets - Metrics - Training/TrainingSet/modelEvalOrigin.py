from datasets import load_dataset
from transformers import AutoTokenizer, DataCollatorForSeq2Seq, Seq2SeqTrainingArguments, Seq2SeqTrainer
from transformers import T5ForConditionalGeneration
import torch

# Load the dataset
dataset_dict = load_dataset('csv', data_files='OriginEvalSet.csv')
dataset = dataset_dict['train']

# Split the dataset into 80% train and 20% test
dataset = dataset.train_test_split(test_size=0.2)

# Load the T5 tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("t5-base")
model = T5ForConditionalGeneration.from_pretrained("t5-base")

def preprocess_function(examples):
    inputs = [f'translate English to Spanish: {text}' for text in examples['English']]
    targets = examples['Spanish']
    model_inputs = tokenizer(inputs, max_length=256, truncation=True, padding='max_length', return_tensors='pt')
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(targets, max_length=256, truncation=True, padding='max_length', return_tensors='pt')

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs


# Preprocess the datasets
encoded_dataset = dataset.map(preprocess_function, batched=True)

# Define the training arguments
training_args = Seq2SeqTrainingArguments(
    output_dir='./results',
    num_train_epochs=3,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir='./logs',
)

# Define the data collator
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

# Create the trainer for the training set
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=encoded_dataset["train"],
    eval_dataset=encoded_dataset["test"],
    data_collator=data_collator,
    tokenizer=tokenizer,
)

# this allows you to clear the GPU memory cache before training
torch.cuda.empty_cache()

# Train the model
trainer.train()

# Evaluate the model
eval_results = trainer.evaluate()

print(eval_results)