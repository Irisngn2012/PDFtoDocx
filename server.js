const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 8080;

const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

function sanitizeFilename(filename) {
    // Replace any character NOT in A-Z, a-z, 0-9, underscore, dash, or dot with underscore
    return filename.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

app.post('/upload', upload.single('file'), (req, res) => {
    const pdfPath = req.file.path;

    // Original PDF name, without .pdf extension
    const pdfBase = req.file.originalname.replace(/\.pdf$/i, "");
    // Sanitize the base name, then append _converted.docx
    const safeBase = sanitizeFilename(pdfBase);
    const docxFilename = safeBase + "_converted.docx";
    const docxPath = path.join(__dirname, "downloads", docxFilename);

    // Now run your conversion command with docxPath
    const command = `python3 convert_pdf.py "${pdfPath}" "${docxPath}"`;
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error("Error during conversion:", err);
            console.error("Command Output:", stdout);
            console.error("Command Error:", stderr);
            return res.status(500).send("File transformation failed.");
        }

        // Attempt to download the DOCX
        res.download(docxPath, docxFilename, (downloadErr) => {
            if (downloadErr) {
                console.error("Error during download:", downloadErr);
            }

            // Clean up uploaded PDF if it still exists
            if (fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);
            }

            // Clean up the DOCX if it exists
            if (fs.existsSync(docxPath)) {
                fs.unlinkSync(docxPath);
            } else {
                console.error(`File not found for deletion: ${docxPath}`);
            }
        });
    });
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
