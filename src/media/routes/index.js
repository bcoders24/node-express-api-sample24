'use strict';
const apiRoutes = require('../../../middlewares/apiRoutes');
const path = require('path');
const imageRoute = require('./image');

module.exports.configure = (app, endpoints) => {

     app.get('/api', (req, res) => {
          return res.send(endpoints.listAllEndpoints(app));
     }).descriptor({
          name: 'Retrieve APIs documentation',
     });

     const root = path.normalize(__dirname + './../');
     let api = apiRoutes(root, app);

     api.model(imageRoute.apiType).register(imageRoute.routes);


};
