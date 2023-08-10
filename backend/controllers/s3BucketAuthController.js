const aws = require("aws-sdk");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");
const { promisify } = require("util");

const randomBytes = promisify(crypto.randomBytes);

exports.connectToAwsBucket = catchAsync(async (req, res) => {
  const region = process.env.REGION;
  const bucketName = process.env.BUCKET_NAME;
  const bucket_access_key = process.env.BUCKET_ACCESS_KEY;
  const bucket_secret_key = process.env.BUCKET_SECRET_KEY;

  const s3 = new aws.S3({
    region,
    accessKeyId: bucket_access_key,
    secretAccessKey: bucket_secret_key,
    signatureVersion: "v4",
  });

  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString("hex");
  const params = {
    Bucket: bucketName, // Set the S3 bucket name here
    Key: imageName,
    Expires: 60,
  };

  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

  res.status(200).json({
    status: "success",
    uploadUrl,
  });
});
