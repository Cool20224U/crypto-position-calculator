import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Mistral } from '@mistralai/mistralai';

const PORT = process.env.PORT || 3001;
const MODEL = 'mistral-small-latest';

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  console.error('Missing MISTRAL_API_KEY. Copy .env.example to .env and set your key.');
  process.exit(1);
}

const mistral = new Mistral({ apiKey });
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const stream = await mistral.chat.stream({
      model: MODEL,
      messages,
    });

    for await (const event of stream) {
      const delta = event.data?.choices?.[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Mistral API error:', err?.message ?? err);
    res.write(`data: ${JSON.stringify({ error: 'Failed to get response from Mistral API' })}\n\n`);
    res.end();
  }
});

app.use(express.static('client/dist'));
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile('client/dist/index.html', { root: process.cwd() });
});

app.listen(PORT, () => {
  console.log(`Mistral chat server listening on http://localhost:${PORT}`);
});
