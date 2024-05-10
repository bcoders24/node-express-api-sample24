"use strict";
import s3 from '../providers/s3';
import crypto from "crypto";
import { isEmpty } from "underscore";

// Single image Upload;
/**
 * Uploads a single image to Amazon S3.
 * @param {Object} req - The request object containing uploaded files.
 * @param {Object} res - The response object to send back a response.
 * @throws {ApiError} - Throws an error if no image is provided in the request.
 */
export const imageUpload = async (req, res) => {
    let uploadData = req.files;

    if (isEmpty(uploadData)) {
        throw new ApiError("image required");
    }

    let data = await s3.uploadToS3(uploadData[0], crypto.randomBytes(20).toString('hex'));
    if (data) {
        return res.data({ url: data.Location });
    }
};


/**
 * Uploads multiple images to Amazon S3 in bulk.
 * @param {Object} req - The request object containing multiple uploaded files.
 * @param {Object} res - The response object to send back a response.
 * @throws {ApiError} - Throws an error if no images are provided in the request.
 */
export const bulkUpload = async (req, res) => {
    let uploadData = req.files;

    if (isEmpty(uploadData)) {
        throw new ApiError("Images required");
    }

    const uploadPromises = uploadData.map(async (image) => {
        const data = await s3.uploadToS3(image, crypto.randomBytes(20).toString('hex'));
        if (data) {
            return data.Location;
        }
    });
    const results = await Promise.allSettled(uploadPromises);
    const output = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
    return res.data({ urls: output });
};


/**
 * Deletes an image from Amazon S3 bucket.
 * @param {Object} req - The request object containing the URL of the image to delete.
 * @param {Object} res - The response object to send back a success message.
 * @throws {Error} - Throws an error if the image deletion process fails.
 */

export const deleteImage = async (req, res) => {
    await s3.deleteImage(req.body.url);
    return res.success("image deleted from s3 bucket successfully");
};
