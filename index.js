import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

app.post('/api/provocation', async (req, res) => {
  const { multiplier } = req.body;

  let prompt = '';
  if (multiplier <= 1.5) prompt = 'Mock the player for being too cautious.';
  else if (multiplier <= 2.5) prompt = 'Push the player to take more risks.';
  else prompt = 'Make the player afraid of losing everything.';

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 50,
    });
    const text = completion.data.choices[0].text.trim();
    res.json({ provocation: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI failed' });
  }
});

// TRON payment mock endpoint
app.post('/api/verify-payment', async (req, res) => {
  const { txHash, user } = req.body;

  // Mock check: any txHash starting with "T" is accepted
  if (txHash && txHash.startsWith("T")) {
    await supabase.from("payments").insert([{ user, txHash }]);
    res.json({ success: true, message: "Payment verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid transaction hash" });
  }
});

app.get('/', (req, res) => {
  res.send('GladiatorsAI backend is live');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});