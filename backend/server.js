const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Load from environment variable
});

app.use(cors());
app.use(bodyParser.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Endpoint para generar mensajes con AI
app.post('/api/ai-message', async (req, res) => {
  console.log('Received AI message request:', req.body);
  try {
    const { prompt } = req.body;
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "Eres un asistente amigable en una hackerhouse que ayuda a crear mensajes memorables y positivos." 
        },
        { 
          role: "user", 
          content: prompt || "Genera un mensaje memorable para la hackerhouse" 
        }
      ],
      model: "gpt-3.5-turbo",
    });

    console.log('OpenAI response:', completion.choices[0].message);
    res.json({ 
      success: true, 
      message: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para generar resumen de memorias
app.post('/api/ai-summary', async (req, res) => {
  console.log('Received AI summary request:', req.body);
  try {
    const { memories } = req.body;
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un asistente que genera resúmenes emotivos y significativos de las memorias compartidas en una hackerhouse."
        },
        {
          role: "user",
          content: `Genera un resumen significativo y emotivo de estas memorias: ${JSON.stringify(memories)}`
        }
      ],
      model: "gpt-3.5-turbo",
    });

    console.log('OpenAI summary response:', completion.choices[0].message);
    res.json({
      success: true,
      summary: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para subir memorias
app.post('/api/memories', async (req, res) => {
  console.log('Received memory:', req.body);
  try {
    const { memoryType, data } = req.body;
    // TODO: Implementar almacenamiento de memorias
    res.json({ success: true, message: 'Memory stored successfully' });
  } catch (error) {
    console.error('Memory storage error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Firesides backend running on port ${port}`);
  console.log(`Test the API at http://localhost:${port}/api/test`);
}); 