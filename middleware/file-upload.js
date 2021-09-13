const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

const MIME_TYPES =  {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const fileUpload = multer({
    limits: 500000,
    storage: multer.diskStorage({
        destination: (req, file, cb)=> {
            const user = req.userData.userId;
            cb(null, "uploads/images")
        },
        filename: (req, file, cb) => {
            const extension = MIME_TYPES[file.mimetype];
            cb(null, uuidv4() + "." + extension);
        },
        fileFilter: (req, file, cb) => {
            const isValid = !!MIME_TYPES[file.mimetype];
            let error = isValid ? null : new Error("Invalid mime type!");
            cb(error, isValid)
        }
    })
});

module.exports = fileUpload;