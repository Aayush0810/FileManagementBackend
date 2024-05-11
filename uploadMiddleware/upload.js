const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const util = require("util");
const path = require("path");
const multer = require("multer");

const region = process.env.NEXT_PUBLIC_AWS_REGION;
const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3 = new S3Client({
  credentials: {
  accessKeyId,
  secretAccessKey,
  },
  region: region,
});

const storage = multerS3({
  s3:s3,
  bucket: bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadate: function (req , file , cb){
    cb(null , {fieldName: file.fieldName})
  },
  key:function (req , file , cb){
    cb(null , Date.now().toString());
  }
})

const upload = multer({
    storage: storage,
    
}).array('file' , 5);

const uploadMiddleWare = util.promisify(upload);

module.exports = uploadMiddleWare;