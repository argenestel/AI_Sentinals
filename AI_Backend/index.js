const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// ChatGpt Contract ABI
const chatGptABI = [
  "function startChat(string memory message) public returns (uint)",
  "function addMessage(string memory message, uint runId) public",
  "function getMessageHistory(uint chatId) public view returns (tuple(string role, tuple(string contentType, string value)[] content)[])"
];

// DALL-E Contract ABI
const dalleABI = [
  "function initializeDalleCall(string memory message) public returns (uint)",
  "function response() public view returns (string)"
];

// Contract addresses
const chatGptAddress = process.env.CHAT_GPT_ADDRESS;
const dalleAddress = process.env.DALLE_ADDRESS;

if (!chatGptAddress || !dalleAddress) {
  throw new Error("Contract addresses not set in environment variables.");
}

const provider = new ethers.JsonRpcProvider('https://devnet.galadriel.com');
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

const chatGptContract = new ethers.Contract(chatGptAddress, chatGptABI, wallet);
const dalleContract = new ethers.Contract(dalleAddress, dalleABI, wallet);

async function pollForChatGptResponse(contract, chatId, expectedMessageCount, maxAttempts = 120, interval = 5000) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, interval));
    try {
      const messages = await contract.getMessageHistory(chatId);
      console.log(`Attempt ${attempts + 1}: Current message count: ${messages.length}`);
      if (messages.length >= expectedMessageCount) {
        console.log('New response received');
        return messages[messages.length - 1].content[0].value;
      }
    } catch (error) {
      console.error(`Error in attempt ${attempts + 1}:`, error);
    }
    attempts++;
    process.stdout.write('.');
  }
  throw new Error('Timeout waiting for new response');
}

async function pollForDalleResponse(contract, maxAttempts = 120, interval = 5000) {
  let attempts = 0;
  let lastResponse = "";
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, interval));
    try {
      const currentResponse = await contract.response();
      console.log(`Attempt ${attempts + 1}: Current response: ${currentResponse}`);
      if (currentResponse !== lastResponse && currentResponse !== "") {
        console.log('New response received');
        return currentResponse;
      }
      lastResponse = currentResponse;
    } catch (error) {
      console.error(`Error in attempt ${attempts + 1}:`, error);
    }
    attempts++;
    process.stdout.write('.');
  }
  throw new Error('Timeout waiting for new response');
}

app.post('/start-chat', async (req, res) => {
  try {
    console.log('Received request to start a chat');
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Starting chat...');
    const tx = await chatGptContract.startChat(message);
    const receipt = await tx.wait();
    console.log(`Transaction sent, hash: ${receipt.hash}.\nExplorer: https://explorer.galadriel.com/tx/${receipt.hash}`);
    
    // Find the ChatCreated event in the receipt logs
    const chatCreatedEvent = receipt.logs.find(log => log.topics[0] === ethers.id("ChatCreated(address,uint256)"));
    if (!chatCreatedEvent) {
      throw new Error('ChatCreated event not found in transaction receipt');
    }
    const chatId = ethers.getNumber(chatCreatedEvent.topics[2]);
    
    console.log('Waiting for response...');
    const response = await pollForChatGptResponse(chatGptContract, chatId, 2);

    res.json({
      message: 'Chat started successfully',
      chatId: chatId,
      initialResponse: response
    });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Failed to start chat', details: error.message });
  }
});

app.post('/add-message', async (req, res) => {
  try {
    console.log('Received request to add a message');
    const { message, chatId } = req.body;
    if (!message || !chatId) {
      return res.status(400).json({ error: 'Message and chatId are required' });
    }

    console.log('Adding message to chat...');
    const tx = await chatGptContract.addMessage(message, chatId);
    const receipt = await tx.wait();
    console.log(`Transaction sent, hash: ${receipt.hash}.\nExplorer: https://explorer.galadriel.com/tx/${receipt.hash}`);
    
    console.log('Waiting for response...');
    const messages = await chatGptContract.getMessageHistory(chatId);
    const response = await pollForChatGptResponse(chatGptContract, chatId, messages.length + 1);

    res.json({
      message: 'Message added successfully',
      response: response
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message', details: error.message });
  }
});

app.post('/generate-image', async (req, res) => {
  try {
    console.log('Received request to generate image');
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Initializing DALL-E call...');
    const tx = await dalleContract.initializeDalleCall(message);
    const receipt = await tx.wait();
    console.log(`Transaction sent, hash: ${receipt.hash}.\nExplorer: https://explorer.galadriel.com/tx/${receipt.hash}`);
    
    console.log('Waiting for response...');
    const newResponse = await pollForDalleResponse(dalleContract);

    res.json({
      message: 'Image generation completed',
      imageUrl: newResponse
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});