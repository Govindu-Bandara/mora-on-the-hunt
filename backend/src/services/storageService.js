const crypto = require('crypto');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const env = require('../config/env');

let client;
function getClient() {
  if (!client) {
    client = new S3Client({
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
      },
    });
  }
  return client;
}

async function uploadFile(buffer, originalName, mimetype, folder = 'payment-slips') {
  const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '';
  const key = `${folder}/${crypto.randomUUID()}${ext}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: env.aws.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );

  return key;
}

async function getFileStream(key) {
  const result = await getClient().send(
    new GetObjectCommand({ Bucket: env.aws.s3Bucket, Key: key })
  );
  return result.Body;
}

async function deleteFile(key) {
  await getClient().send(new DeleteObjectCommand({ Bucket: env.aws.s3Bucket, Key: key }));
}

module.exports = { uploadFile, getFileStream, deleteFile };
