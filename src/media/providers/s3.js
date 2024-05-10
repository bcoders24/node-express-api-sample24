"use strict";
import AWS from 'aws-sdk';


AWS.MaintenanceModeMessage.suppress = true;

const awsConfig = getConfig('aws');
const s3bucket = new AWS.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    Bucket: process.env.AWS_BUCKET,
});

export const deleteImage = async (url) => {
    try {
        const params = {
            Bucket: `${process.env.AWS_SECRET}/${process.env.AWS_FOLDER}`,
            Key: `${url.substring(url.lastIndexOf('/') + 1)}`,
        };
        const data = await s3bucket.deleteObject(params).promise();
        return data;
    } catch (error) {
        throw error;
    }
};

export const uploadToS3 = async (file, id) => {
    try {
        const params = {
            Bucket: `${process.env.AWS_SECRET}/${process.env.AWS_FOLDER}`,
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
