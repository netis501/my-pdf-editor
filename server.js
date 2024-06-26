const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');

const app = express();
const upload = multer({ dest: 'uploads/' });

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileContent = fs.readFileSync(file.path);
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: file.originalname,
        Body: fileContent
    };

    s3.upload(params, (err, data) => {
        fs.unlinkSync(file.path);
        if (err) {
            return res.status(500).json({ success: false, message: 'File upload failed.' });
        }
        res.json({ success: true, message: 'File uploaded successfully.', fileUrl: data.Location });
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running');
});
