var log               = require('./logger'),
    enums             = require('./constants'),
    stream            = require('./stream'),
    async             = require('async'),
    URL               = require('url'),
    emoji             = require('node-emoji'),
    path              = require('path'),
    GoogleSpreadsheet = require('google-spreadsheet'),
    Q                 = require('q'),
    config            = require('./config'),
    pad               = require('pad'),
    jw                = require('./jwplatform'),
    vmo               = require('./vimeo'),
    aws               = require('./aws'),
    axios             = require('axios');

var queue = {

    job     : {},

    get_api_domain : () => {

        var endpoint = config.params.data.url,
            endpoint_parts = endpoint.split('/'),
            endpoint_protocol = endpoint_parts[0],
            endpoint_host     = endpoint_parts[2],
            api_domain        = endpoint_protocol + '//' + endpoint_host;

        return api_domain;

    },

    get_job : (next, complete) => {

        var req = { auth: {} }

        req.auth.username = config.params.user.dclay_user;
        req.auth.password = config.params.user.dclay_pass;

        //log.info("\nGET'ing job with `_id` [ %s ] from Dataclay Queue", config.params.data.key);

        axios.get(queue.get_api_domain() + '/jobs/' + config.params.data.key, req)
             .then(response => {
                queue.job = response.data;
                next(queue.job, complete);
             })
             .catch(error => {
                log.error("Error getting information about the current job.");
             })

    },

    update_job : (next) => {

        var p   = config.params,
            req_opts = { auth: {} },
            req  = {};

        req_opts.auth.username = config.params.user.dclay_user;
        req_opts.auth.password = config.params.user.dclay_pass;

        req[enums.data.dist] = {};

        req[enums.data.dist][p.fields.download.name   ] = aws.S3_URL.video   || 'Unavailable';
        req[enums.data.dist][p.fields.dl_poster.name  ] = aws.S3_URL.poster  || 'Unavailable';
        req[enums.data.dist][p.fields.dl_preview.name ] = aws.S3_URL.preview || 'Unavailable';
        req[enums.data.dist][p.fields.bcast.name      ] = enums.stream.status.CREATED;
        req[enums.data.dist][p.fields.stream.name     ] = stream.key;
        req[enums.data.dist][p.fields.preview.name    ] = stream.preview(); 
        req[enums.data.dist][p.fields.embed.name      ] = stream.embed();
        req[enums.data.dist][p.fields.url.name        ] = stream.url();

        log.info("\n\t\t%s\tUpdating job [ %s ] with distribution details"
                , emoji.get('telephone_receiver')
                , config.params.data.key);

        //PATCH existing job object with data
        axios.patch(queue.get_api_domain() + '/jobs/' + config.params.data.key, req, req_opts)
          .then(response => {
            next();
          })
          .catch(error => {
            log.error(error);
          });

    }

}

module.exports = queue;