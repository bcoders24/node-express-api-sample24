'use strict';
const awsConfig = require('config').get('aws');
const AWS = require('aws-sdk');
const fs = require('fs');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const s3bucket = new AWS.S3({
    accessKeyId: awsConfig.key,
    secretAccessKey: awsConfig.secret,
    Bucket: awsConfig.bucket,
});

exports.deleteImage = async (url) => {
    try {
        const params = {
            Bucket: `${awsConfig.bucket}/${awsConfig.folder}`,
            Key: `${url.substring(url.lastIndexOf('/') + 1)}`,
        };
        const data = await s3bucket.deleteObject(params).promise();
        return data;
    } catch (error) {
        throw error;
    }
};

exports.uploadToS3 = async (file, id) => {
    try {
        const params = {
            Bucket: `${awsConfig.bucket}/${awsConfig.folder}`,
            Key: `${id}${file.originalname.substr(file.originalname.lastIndexOf("."))}`,
            Body: file.buffer,
            ContentType: file.type,
        };
        const data = await s3bucket.upload(params).promise();
        return data;
    } catch (error) {
        throw error;
    }
};


