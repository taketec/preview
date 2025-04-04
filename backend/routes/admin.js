import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { uploadPreview, updatePreview, deletePreview, getAllPreviews, getPreviewByKey, addComment, getComments } from '../controllers/admin.js';
import { Auth } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const ADMIN_PASSWORD = "abhishekCreations4912";
const SECRET_KEY = "process.env.SECRET";
const TOKEN_EXPIRY = '3d'; // Token valid for 3 days

// Endpoint to issue JWT token
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = jwt.sign({}, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });
    res.json({ token });
});

// Protected routes
router.post('/upload', Auth, upload.single('file'), uploadPreview);
router.delete('/:key', Auth, deletePreview);

// Public routes
router.get('/all', getAllPreviews);
router.put('/:id', upload.single('file'), updatePreview);
router.get('/preview/:key', getPreviewByKey);
router.post('/comment/:key', addComment);
router.get('/comments/:key', getComments);

export default router;
