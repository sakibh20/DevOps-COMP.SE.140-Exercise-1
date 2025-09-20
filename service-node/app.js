const express = require('express');
const axios = require('axios');
const app = express();

app.get('/call-python', async (req, res) => {
  try {
    const response = await axios.get('http://service-python:5000/ping');
    res.send(`Node got response: ${response.data}`);
  } catch (error) {
    res.status(500).send('Error calling Python service');
  }
});

app.listen(3000, () => {
  console.log('Node service running on port 3000');
});
