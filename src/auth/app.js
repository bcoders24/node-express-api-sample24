const logger = require('../../helpers/logger')();

exports.configure = (app, endpoints) => {
     try {
          require('./routes').configure(app, endpoints);
     } catch (err) {
          logger.debug(err);
          console.log(err)
     }
};
