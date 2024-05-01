"use strict";
const dbConfig = require("config").get("mongodb");
const logger = require('../helpers/logger')();
const camelcase = require("camelcase");
const findOrCreate = require("findorcreate-promise");


const mongoose = require("mongoose");

const [onboardingModels, reknewalModels] = [
    require('../src/auth/models'),
];

module.exports.configure = () => {
    mongoose.Promise = global.Promise;
    mongoose.plugin(findOrCreate);


    const connect = function () {
        let config = JSON.parse(JSON.stringify(dbConfig));

        if (config.options) {
            config.options.promiseLibrary = global.Promise;
        }

        logger.info("connecting to", dbConfig);
        console.log("connecting to", dbConfig);
        mongoose.connect(config.host, config.options);
    };
    connect();

    const db = mongoose.connection;

    db.on("connected", function () {
        logger.info("mongo Connected");
        console.log("mongo Connected");
    });

    db.on("error", function (err) {
        logger.info("connection error: " + err);
        console.log("connection error: " + err);
    });

    db.on("disconnected", function () {
        logger.info("connecting again");
        console.log("connecting again");
        connect();
    });

    const models = [
        ...onboardingModels.retrieveModels()
    ];

    models.forEach((model) => {
        let schema = new mongoose.Schema(model.fileContent.entity, { usePushEach: true, timestamps: true });
        schema.statics = model.fileContent.statics ?? schema.statics;
        // schema.index(model.fileContent.indexes)

        if (model.name == 'chat') {
            schema.index({ members: 1 });
        }

        schema.pre("save", function (next) {
            this.timestamps = true;
            next();
        });

        mongoose.model(camelcase(model.name), schema);
    })
    global.db = mongoose.models;

    return global.db;
};