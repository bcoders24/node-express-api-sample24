import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from 'config';
import morgan from './helpers/morgan';
import { errorConverter, errorHandler } from './middlewares/error';
import expressListEndpoints from 'express-list-endpoints-descriptor';
import routes from './settings/routes';
import multer from "multer";

import onboardingApp from './src/auth/app';
import mediaModule from './src/media/app';
import http from 'http';

const upload = multer({ storage: multer.memoryStorage() });
const { createServer } = http;

const app = express();
const server = createServer(app);

app.use((err, req, res, next) => {
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
routes.configure(app, expressListEndpoints(express));
onboardingApp.configure(app, expressListEndpoints(express));
mediaModule.configure(app, expressListEndpoints(express));

// convert error to CustomError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export { app, server };
