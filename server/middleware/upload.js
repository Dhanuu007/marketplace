import fs from 'fs'
import path from 'path'
import multer from 'multer'


// ============================================================
// UPLOAD DIRECTORIES
// ============================================================

const screenshotUploadDirectory = path.resolve(
  process.cwd(),
  'server',
  'uploads',
  'screenshots',
)


const websiteUploadDirectory = path.resolve(
  process.cwd(),
  'server',
  'uploads',
  'websites',
)


fs.mkdirSync(screenshotUploadDirectory, {
  recursive: true,
})


fs.mkdirSync(websiteUploadDirectory, {
  recursive: true,
})


// ============================================================
// CREATOR LISTING STORAGE
// ============================================================

const creatorListingStorage = multer.diskStorage({
  destination(request, file, callback) {
    if (file.fieldname === 'websiteZip') {
      return callback(
        null,
        websiteUploadDirectory,
      )
    }

    return callback(
      null,
      screenshotUploadDirectory,
    )
  },

  filename(request, file, callback) {
    const extension = path
      .extname(file.originalname)
      .toLowerCase()

    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase()

    callback(
      null,
      `${Date.now()}-${baseName}${extension}`,
    )
  },
})


// ============================================================
// CREATOR LISTING FILE FILTER
// ============================================================

function creatorListingFileFilter(
  request,
  file,
  callback,
) {
  // Website ZIP
  if (file.fieldname === 'websiteZip') {
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
          'Only ZIP files are allowed for website uploads.',
        ),
      )
    }

    return callback(null, true)
  }


  // Website screenshots
  if (file.fieldname === 'screenshots') {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error(
          'Only JPG, PNG, and WebP images are allowed.',
        ),
      )
    }

    return callback(null, true)
  }


  return callback(
    new Error(
      'Unexpected file field.',
    ),
  )
}


// ============================================================
// CREATOR LISTING UPLOAD
// ============================================================

const creatorListingMulter = multer({
  storage: creatorListingStorage,
  fileFilter: creatorListingFileFilter,

  limits: {
    files: 6,
    fileSize: 500 * 1024 * 1024,
  },
}).fields([
  {
    name: 'screenshots',
    maxCount: 5,
  },
  {
    name: 'websiteZip',
    maxCount: 1,
  },
])


// ============================================================
// CREATOR LISTING UPLOAD MIDDLEWARE
// ============================================================

export function creatorListingUpload(
  request,
  response,
  next,
) {
  creatorListingMulter(
    request,
    response,
    (error) => {
      if (error) {
        return next(error)
      }


      const screenshotFiles =
        request.files?.screenshots ?? []


      // Screenshots must be 5 MB or smaller.
      const oversizedScreenshot =
        screenshotFiles.find(
          (file) =>
            file.size > 5 * 1024 * 1024,
        )


      if (oversizedScreenshot) {
        for (const file of screenshotFiles) {
          try {
            fs.unlinkSync(file.path)
          } catch {
            // Ignore cleanup errors.
          }
        }


        const websiteZipFile =
          request.files?.websiteZip?.[0]


        if (websiteZipFile) {
          try {
            fs.unlinkSync(
              websiteZipFile.path,
            )
          } catch {
            // Ignore cleanup errors.
          }
        }


        const sizeError = new Error(
          'Each website screenshot must be 5 MB or smaller.',
        )

        sizeError.statusCode = 400

        return next(sizeError)
      }


      next()
    },
  )
}


// ============================================================
// LEGACY SCREENSHOT UPLOAD
// ============================================================

const screenshotStorage = multer.diskStorage({
  destination(request, file, callback) {
    callback(
      null,
      screenshotUploadDirectory,
    )
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
      .replace(
        /[^a-zA-Z0-9-_]/g,
        '-',
      )
      .toLowerCase()

    callback(
      null,
      `${Date.now()}-${baseName}${extension}`,
    )
  },
})


function screenshotFileFilter(
  request,
  file,
  callback,
) {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(
      new Error(
        'Only JPG, PNG, and WebP images are allowed.',
      ),
    )
  }

  callback(null, true)
}


export const creatorScreenshotUpload =
  multer({
    storage: screenshotStorage,
    fileFilter: screenshotFileFilter,

    limits: {
      files: 5,
      fileSize: 5 * 1024 * 1024,
    },
  })


// ============================================================
// LEGACY WEBSITE ZIP UPLOAD
// ============================================================

const websiteStorage = multer.diskStorage({
  destination(request, file, callback) {
    callback(
      null,
      websiteUploadDirectory,
    )
  },

  filename(request, file, callback) {
    const extension = path
      .extname(file.originalname)
      .toLowerCase()

    const baseName = path
      .basename(
        file.originalname,
        extension,
      )
      .replace(
        /[^a-zA-Z0-9-_]/g,
        '-',
      )
      .toLowerCase()

    callback(
      null,
      `${Date.now()}-${baseName}${extension}`,
    )
  },
})


function websiteZipFileFilter(
  request,
  file,
  callback,
) {
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
    !allowedMimeTypes.includes(
      file.mimetype,
    )
  ) {
    return callback(
      new Error(
        'Only ZIP files are allowed for website uploads.',
      ),
    )
  }

  callback(null, true)
}


export const creatorWebsiteZipUpload =
  multer({
    storage: websiteStorage,
    fileFilter: websiteZipFileFilter,

    limits: {
      files: 1,
      fileSize: 500 * 1024 * 1024,
    },
  })