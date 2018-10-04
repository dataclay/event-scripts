var winston           = require('winston'),
    moment            = require('moment');

const { createLogger, format, transports } = require('winston');
const logger = winston.createLogger({

  transports : [
    
    new winston.transports.Console({
        prettyPrint : true
      , format      : format.combine(
                         format.splat(),
                         format.simple(),
                         format.printf(info => `${info.message}`)
                      )
    }),

    new winston.transports.File({ 
        filename    : `${__dirname}/deploy-out.log`
      , level       : 'info'
      , prettyPrint : true
      , format      : format.combine(
                         format.splat(),
                         format.simple(),
                         format.printf(info => `${info.message}`)
                      )
    }),

    new winston.transports.File({ 
        filename : `${__dirname}/deploy-err.log`
      , level    : 'error'
      , prettyPrint : true
      , format      : format.combine(
                         format.splat(),
                         format.simple(),
                         winston.format.printf(info => `${"\n----- Reported on [ " + moment().format('MMMM Do YYYY, h:mm:ss A') + " ] -----------------------\n\n"} \t${info.message}`)
                      )
    })

  ]

})

module.exports = logger;