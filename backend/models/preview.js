import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  name: String,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const previewSchema = new mongoose.Schema({
  s3Url: { type: String, required: true },
  key: { type: String, required: true }, // S3 object key for deletion
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

export const Preview = mongoose.model('Preview', previewSchema);
