import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Preview } from '../models/preview.js';
import fs from 'fs/promises';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

export const uploadPreview = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    // Create a unique key for the file
    const key = `${Date.now()}-${file.originalname}`;
    const fileBuffer = await fs.readFile(file.path);

    // Upload file to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: file.mimetype
    };
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate a public URL (assuming your bucket is public)
    const s3Url = `https://${bucketName}.s3.amazonaws.com/${key}`;

    // Create a new Preview document
    const preview = new Preview({
      s3Url,
      key,
      comments: []
    });
    await preview.save();

    // Remove the temporary file
    await fs.unlink(file.path);

    res.status(201).json({ message: 'File uploaded successfully', preview });
  } catch (error) {
    console.error('Error in uploadPreview:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
};

export const updatePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided for update' });
    }

    const preview = await Preview.findById(id);
    if (!preview) {
      return res.status(404).json({ error: 'Preview not found' });
    }

    // Delete the existing file from S3
    const deleteParams = {
      Bucket: bucketName,
      Key: preview.key
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    // Upload the new file to S3
    const newKey = `${Date.now()}-${file.originalname}`;
    const fileBuffer = await fs.readFile(file.path);
    const uploadParams = {
      Bucket: bucketName,
      Key: newKey,
      Body: fileBuffer,
      ContentType: file.mimetype
    };
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate new public URL
    const newS3Url = `https://${bucketName}.s3.amazonaws.com/${newKey}`;

    // Update the preview document
    preview.s3Url = newS3Url;
    preview.key = newKey;
    await preview.save();

    // Remove the temporary file
    await fs.unlink(file.path);

    res.json({ message: 'Preview updated successfully', preview });
  } catch (error) {
    console.error('Error in updatePreview:', error);
    res.status(500).json({ error: 'Error updating preview' });
  }
};

export const deletePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const preview = await Preview.findById(id);
    if (!preview) {
      return res.status(404).json({ error: 'Preview not found' });
    }

    // Delete the file from S3
    const deleteParams = {
      Bucket: bucketName,
      Key: preview.key
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    // Remove the document from MongoDB
    await Preview.findByIdAndDelete(id);

    res.json({ message: 'Preview deleted successfully' });
  } catch (error) {
    console.error('Error in deletePreview:', error);
    res.status(500).json({ error: 'Error deleting preview' });
  }
};