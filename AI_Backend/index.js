const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const axios = require('axios');

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
  "function lastResponse() public view returns (string)"
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



async function pollForChatGptResponse(contract, chatId, expectedMessageCount, maxAttempts = 5, interval = 5000) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, interval));
    try {
      const messages = await contract.getMessageHistory(chatId);
      console.log(`Attempt ${attempts + 1}: Current messages:`, JSON.stringify(messages, null, 2));
      
      if (messages.length >= expectedMessageCount) {
        console.log('New response received');
        const lastMessage = messages[messages.length - 1];
        console.log('Last message:', JSON.stringify(lastMessage, null, 2));
        
        if (lastMessage && lastMessage.content && lastMessage.content.length > 0) {
          return lastMessage.content[0].value;
        } else {
          console.error('Unexpected message format:', lastMessage);
          throw new Error('Unexpected message format');
        }
      }
    } catch (error) {
      console.error(`Error in attempt ${attempts + 1}:`, error);
    }
    attempts++;
    process.stdout.write('.');
  }


  // throw new Error('Timeout waiting for new response');
}


async function pollForDalleResponse(contract, maxAttempts = 120, interval = 5000) {
  let attempts = 0;
  let lastResponse = "";
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, interval));
    try {
      const currentResponse = await contract.lastResponse();
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
app.post('/openai-chat', async (req, res) => {
  try {
    console.log('Received request for OpenAI chat completion');
    const { model, messages } = req.body;
    
    if (!model || !messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request body. Model and non-empty messages array are required.' });
    }

    const openaiApiKey = process.env.OPENAI_KEY;
    if (!openaiApiKey) {
      throw new Error('OPENAI_KEY not set in environment variables.');
    }

    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', 
      {
        model,
        messages
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        }
      }
    );

    res.json(openaiResponse.data);
  } catch (error) {
    console.error('Error in OpenAI chat completion:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: 'Failed to generate OpenAI chat completion', 
      details: error.response ? error.response.data : error.message 
    });
  }
});
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
    console.log('Chat ID:', chatId);
    
    console.log('Waiting for response...');
    const response = await 

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
    console.log('Current message history:', JSON.stringify(messages, null, 2));
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

const MAX_ATTEMPTS = 5;

app.post('/create-card', async (req, res) => {
  try {
    console.log('Received request to create a card');
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let imageUrl = null;
    let attempts = 0;
    let error = null;

    // Try to generate image using on-chain DALL-E
    while (attempts < MAX_ATTEMPTS && !imageUrl) {
      try {
        console.log(`Attempt ${attempts + 1}: Generating image with on-chain DALL-E`);
        const tx = await dalleContract.initializeDalleCall(prompt);
        const receipt = await tx.wait();
        console.log(`Transaction sent, hash: ${receipt.hash}.\nExplorer: https://explorer.galadriel.com/tx/${receipt.hash}`);
        
        imageUrl = await pollForDalleResponse(dalleContract);
        console.log('Image generated successfully');
      } catch (err) {
        console.error(`Error in attempt ${attempts + 1}:`, err);
        error = err;
        attempts++;
      }
    }

    let cardContent;

    if (imageUrl) {
      // If image generation was successful, use on-chain ChatGPT for text
      try {
        console.log('Generating card content with on-chain ChatGPT');
        const tx = await chatGptContract.startChat(`Create a short description for an image with the following prompt: ${prompt}`);
        const receipt = await tx.wait();
        console.log(`Transaction sent, hash: ${receipt.hash}.\nExplorer: https://explorer.galadriel.com/tx/${receipt.hash}`);
        
        const chatId = ethers.getNumber(receipt.logs.find(log => log.topics[0] === ethers.id("ChatCreated(address,uint256)")).topics[2]);
        cardContent = await pollForChatGptResponse(chatGptContract, chatId, 2);
        console.log('Card content generated successfully');
      } catch (err) {
        console.error('Error generating card content with on-chain ChatGPT:', err);
        error = err;
      }
    }

    // If either image generation or content generation failed, use OpenAI API
    if ( !cardContent) {
      console.log('Falling back to OpenAI API for content generation');
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY not set in environment variables.');
      }

      const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', 
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant. Respond only with valid JSON." },
            { role: "user", content: `Create a Game card with a short description and an image URL for the following prompt: ${prompt}. Respond in JSON format with 'description'` }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          }
        }
      );

      const responseContent = openaiResponse.data.choices[0].message.content;
      console.log('OpenAI API response:', responseContent);

      try {
        // Try to parse the content as JSON
        const generatedContent = JSON.parse(responseContent);
        cardContent = generatedContent.description;
        // imageUrl = imageUrl;
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        
        // If parsing fails, use regex to extract the information
        const descriptionMatch = responseContent.match(/"description"\s*:\s*"([^"]*)"/);
        const imageUrlMatch = responseContent.match(/"imageUrl"\s*:\s*"([^"]*)"/);
        
        if (descriptionMatch && imageUrlMatch) {
          cardContent = descriptionMatch[1];
          imageUrl = imageUrlMatch[1];
        } else {
          throw new Error('Unable to extract description and imageUrl from OpenAI response');
        }
      }
    }

    if (!cardContent || !imageUrl) {
      throw new Error('Failed to generate card content or image URL');
    }

    res.json({
      message: 'Card created successfully',
      cardContent: cardContent,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card', details: error.message });
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