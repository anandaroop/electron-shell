const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.listen(3001, () => {
  console.log('Express server listening on http://localhost:3001');
});
