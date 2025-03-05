import express from 'express';
import multer from 'multer';
import { uploadPreview, updatePreview, deletePreview,getAllPreviews,getPreviewByKey,addComment,getComments} from '../controllers/admin.js';

const router = express.Router();
// Configure multer to temporarily store files in the "uploads" folder
const upload = multer({ dest: 'uploads/' });

// POST: Upload a new 3D file and create a preview document
router.post('/upload', upload.single('file'), uploadPreview);
router.get('/all', getAllPreviews);
// PUT: Update an existing preview with a new 3D file
router.put('/:id', upload.single('file'), updatePreview);
router.get('/preview/:key', getPreviewByKey);

// DELETE: Delete a preview (and remove its file from S3)
router.delete('/:key', deletePreview);

router.post('/comment/:key', addComment);
router.get('/comments/:key', getComments);
export default router;
