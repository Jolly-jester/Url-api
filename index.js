const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./shortUrl');
const cors = require('cors');
require('dotenv').config();  // Load environment variables

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

app.use(cors());
app.use(express.json());

// POST route to create short URL
app.post('/', async (req, res) => {
  const { Url } = req.body;
  try {
    const shortUrl = await ShortUrl.create({ full: Url });
    res.status(201).json(shortUrl);
  } catch (error) {
    console.error('Error creating short URL:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: 'Invalid URL format' });
    } else {
      res.status(500).json({ error: 'Failed to create short URL' });
    }
  }
});

// GET route to handle redirection
app.get('/:shortUrl', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);

    res.redirect(shortUrl.full);
  } catch (error) {
    console.error('Error handling redirection:', error);
    res.status(500).json({ error: 'Failed to redirect' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
