import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

/**
 * Multer configuration for resume uploads.
 *
 * - Single file field named "resume"
 * - PDF only (application/pdf)
 * - Size limit from MAX_RESUME_MB env var (default 10MB)
 */
const storage = multer.memoryStorage();

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
