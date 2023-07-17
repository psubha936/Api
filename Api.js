const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');



const app = express();
app.use(bodyParser.json());

app.use(cors());

function saveBase64ImageToPDF(base64Data, pdfFileName, callback) {
  // Remove data URI prefix from base64Data
  const dataPrefix = 'data:image/png;base64,';
  if (base64Data.startsWith(dataPrefix)) {
    base64Data = base64Data.slice(dataPrefix.length);
  }

  // Convert base64 to a binary Buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // Create a PDF document
  const doc = new PDFDocument();

  // Add an image to the PDF
  doc.image(buffer);

  // Finalize the PDF and create a writable stream
  const outputPath = path.join(__dirname, pdfFileName || 'image.pdf');
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Close the stream when the PDF is finished writing
  doc.end();

  writeStream.on('finish', () => {
    callback(outputPath);
  });
}

app.post('/convertToPDF', (req, res) => {
  const { base64Data, pdfFileName } = req.body;

  if (!base64Data || !pdfFileName) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  saveBase64ImageToPDF(base64Data, pdfFileName, (pdfPath) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${pdfFileName}`);
    fs.createReadStream(pdfPath).pipe(res);
  });
});

const port = 3000; // Replace this with your desired port number
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
