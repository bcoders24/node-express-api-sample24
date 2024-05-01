'use strict';
const apiRoutes = require('../../../middlewares/apiRoutes');
const path = require('path');
const authRoute = require('./auth');
const userRoute = require('./user');



module.exports.configure = (app, endpoints) => {

     app.get('/api/onboarding', (req, res) => {
          return res.send(endpoints.listAllEndpoints(app));
     }).descriptor({
          name: 'Retrieve APIs documentation',
     });

     const root = path.normalize(__dirname + './../');
     let api = apiRoutes(root, app);

     api.model(authRoute.apiType).register(authRoute.routes);
     api.model(userRoute.apiType).register(userRoute.routes);

};

