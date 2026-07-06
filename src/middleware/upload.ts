import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

const storage = multer.memoryStorage();

// API4: resume uploads are constrained to a single PDF within the MAX_RESUME_MB size cap.
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    cb(new AppError(422, 'INVALID_FILE_TYPE', 'Only PDF files are accepted'));
    return;
  }
  cb(null, true);
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_RESUME_MB * 1024 * 1024,
    files: 1,
  },
}).single('resume');
