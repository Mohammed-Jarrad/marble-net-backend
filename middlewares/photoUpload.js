const multer = require('multer')

const storage = multer.memoryStorage()

const photoUpload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        if(file.mimetype.startsWith('image')) {
            cb(null, true)
        } else {
            cb({ message: "ملف غير مدعوم." }, false)
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5,
    }
})

module.exports = photoUpload