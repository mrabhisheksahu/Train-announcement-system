const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from current directory
app.use(express.static('.'));

// Handle POST /save to save data to file
app.post('/save', (req, res) => {
    const { file, data } = req.body;
    const filePath = path.join(__dirname, file);
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Error saving file:', err);
            res.status(500).send('Error saving file');
        } else {
            res.send('File saved successfully');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
