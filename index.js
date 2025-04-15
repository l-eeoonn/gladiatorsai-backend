import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase init
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// OpenAI init
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// AI provocation endpoint
app.post('/api/provocation', async (req, res) => {
  const { multiplier } = req.body;
  let prompt = '';

  if (multiplier <= 1.5) prompt = 'Mock the player for being too cautious.';
  else if (multiplier <= 2.5) prompt = 'Push the player to take more risks.';
  else prompt = 'Make the player afraid of losing everything.';

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices[0].message.content;
    res.json({ provocation: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI Error' });
  }
});

// Payment test
app.post('/api/verify-payment', async (req, res) => {
  const { txHash, user } = req.body;
  if (txHash && txHash.startsWith("T")) {
    await supabase.from("payments").insert([{ user, txHash }]);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid txHash" });
  }
});

app.get('/', (req, res) => {
  res.send("GladiatorsAI backend is live.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
