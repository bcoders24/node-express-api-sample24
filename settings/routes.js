'use strict';
module.exports.configure = (app, endpoints) => {
    app.get('/', (req, res) => {
        return res.send('boilerplate-node-server');
    }).descriptor({
        name: 'Root API',
    });

    app.get('/api', (req, res) => {
        return res.send(endpoints.listAllEndpoints(app));
    }).descriptor({
        name: 'Root API',
    });
};
