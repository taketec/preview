import express from 'express';
import multer from 'multer';
import { uploadPreview, updatePreview, deletePreview } from '../controllers/admin.js';

const router = express.Router();
// Configure multer to temporarily store files in the "uploads" folder
const upload = multer({ dest: 'uploads/' });

// POST: Upload a new 3D file and create a preview document
router.post('/', upload.single('file'), uploadPreview);

// PUT: Update an existing preview with a new 3D file
router.put('/:id', upload.single('file'), updatePreview);

// DELETE: Delete a preview (and remove its file from S3)
router.delete('/:id', deletePreview);

export default router;
