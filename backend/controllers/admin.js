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

function generateRandomCode() {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  // Format as 3-4-3
  return result.slice(0, 3) + '-' + result.slice(3, 7) + '-' + result.slice(7);
}


export const uploadPreview = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    // Generate a random code for the S3 key
    const randomCode = generateRandomCode();
    // Extract the file extension (including the dot), if any
    const extension = file.originalname.includes('.') ? file.originalname.substring(file.originalname.lastIndexOf('.')) : '';
    // Create the S3 key using the random code and the file extension
    const filename = file.originalname.includes('.') 
  ? file.originalname.substring(0, file.originalname.lastIndexOf('.')) 
  : file.originalname;


    const key = `${randomCode}-${filename}`;

    // Read the file from the temporary uploads folder
    const fileBuffer = await fs.readFile(file.path);

    // Upload the file to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: key+extension,
      Body: fileBuffer,
      ContentType: file.mimetype
    };
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate a public URL for the uploaded file
    const s3Url = `https://${bucketName}.s3.amazonaws.com/${key+extension}`;

    // Create a new Preview document in MongoDB
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
}


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
    const { key } = req.params;
    // Find the preview document by the S3 key instead of MongoDB _id
    const preview = await Preview.findOne({ key });
    if (!preview) {
      return res.status(404).json({ error: 'Preview not found' });
    }

    // Delete the file from S3
    const deleteParams = {
      Bucket: bucketName,
      Key: key
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));

    // Remove the document from MongoDB using the key
    await Preview.findOneAndDelete({ key });

    res.json({ message: 'Preview deleted successfully' });
  } catch (error) {
    console.error('Error in deletePreview:', error);
    res.status(500).json({ error: 'Error deleting preview' });
  }
};


export const getAllPreviews = async (req, res) => {
  try {
    // Retrieve all preview documents from MongoDB
    const previews = await Preview.find();
    res.status(200).json({ previews });
  } catch (error) {
    console.error('Error in getAllPreviews:', error);
    res.status(500).json({ error: 'Error retrieving previews' });
  }
};

export const getPreviewByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const preview = await Preview.findOne({ key });
    if (!preview) {
      return res.status(404).json({ error: 'Preview not found' });
    }
    res.status(200).json({ preview });
  } catch (error) {
    console.error('Error in getPreviewByKey:', error);
    res.status(500).json({ error: 'Error fetching preview' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { key } = req.params;
    const { name, comment } = req.body;

    if (!name || !comment) {
      return res.status(400).json({ error: 'Missing required fields: name and comment' });
    }

    // Find the preview document by the key
    const preview = await Preview.findOne({ key });
    if (!preview) {
      return res.status(404).json({ error: 'Preview not found' });
    }

    // Add the comment to the preview's comments array
    preview.comments.push({ name, comment });
    await preview.save();

    res.json({ message: 'Comment added successfully', preview });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Error adding comment' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { key } = req.params;
    // Find the preview document by the S3 key
    const preview = await Preview.findOne({ key });
    if (!preview) {
      return res.status(404).json({ error: 'Preview not found' });
    }
    // Return the comments array from the preview document
    res.status(200).json({ comments: preview.comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Error fetching comments' });
  }
};