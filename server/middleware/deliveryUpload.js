import fs from 'fs'
import path from 'path'
import multer from 'multer'


const uploadDirectory = path.resolve(
  process.cwd(),
  'server',
  'uploads',
  'deliveries',
)


fs.mkdirSync(uploadDirectory, {
  recursive: true,
})


const storage = multer.diskStorage({
  destination(request, file, callback) {
    callback(null, uploadDirectory)
  },

  filename(request, file, callback) {
    const extension = path.extname(
      file.originalname,
    )

    const baseName = path
      .basename(
        file.originalname,
        extension,
      )
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase()

    callback(
      null,
      `${Date.now()}-${baseName}${extension}`,
    )
  },
})


function fileFilter(request, file, callback) {
  const extension = path
    .extname(file.originalname)
    .toLowerCase()

  const allowedMimeTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream',
  ]

  if (
    extension !== '.zip' ||
    !allowedMimeTypes.includes(file.mimetype)
  ) {
    return callback(
      new Error(
        'Only ZIP files are allowed for website delivery.',
      ),
    )
  }

  callback(null, true)
}


export const creatorDeliveryUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: 1,
    fileSize: 500 * 1024 * 1024,
  },
})