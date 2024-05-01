const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('config');
const morgan = require('./helpers/morgan');
const { errorConverter, errorHandler } = require('./middlewares/error');
const endpoints = require('express-list-endpoints-descriptor')(express);
const routes = require('./settings/routes');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const onboardingApp = require('./src/auth/app');
const mediaModule = require('./src/media/app');

const http = require('http');

const app = express();
const server = http.createServer(app);
app.use(function (err, req, res, next) {
    if (err) {
        (res.log || log).error(err.stack);
        if (req.xhr) {
            res.send(500, { error: 'Something went wrong!' });
        } else {
            next(err);
        }

        return;
    }
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

if (config.env !== 'dev') {
    // app.use(morgan.successHandler);
    // app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

//media Uploads
app.use(upload.any());

// parse json request body
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// enable cors
app.use(cors());
app.options('*', cors());

// cookie parser
app.use(cookieParser());

//routes
routes.configure(app, endpoints);
onboardingApp.configure(app, endpoints);
mediaModule.configure(app, endpoints);



// convert error to CustomError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);



module.exports = { app ,server};
