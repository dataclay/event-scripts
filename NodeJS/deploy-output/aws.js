var async    = require('async'),
    fs       = require('fs'),
    AWS      = require('aws-sdk'),
    enums    = require('./constants'),
    emoji    = require('node-emoji'),
    config   = require('./config'),
    gsheet   = require('./gsheet'),
    path     = require('path');

//Spawning factories
AWS.config.update({ 
      accessKeyId       : config.params.storage.accessID          //enums.aws.accessKeyId,
    , secretAccessKey   : config.params.storage.secret     //enums.aws.secretAccessKey,
    , signatureVersion  : enums.aws.signatureVersion
});

var aws = {

  asset : null,

  S3_download_url : null,

  put_obj : function(b64, step) {

    var p  = config.params,
        s3 = new AWS.S3();

    if (!(p.storage.accessID)     || 
        !(p.storage.secret) ||
        !(enums.aws.signatureVersion)) {

      console.log("\n\t\t... simulation upload ...")
      step();

    } else {

      s3.putObject({
            Bucket  : p.storage.bucket
          , Key     : (p.storage.folder + "/" + path.parse(aws.asset).base)
          , Body    : b64
          , ACL     : 'public-read'
        }, (err, data) => {

          if (err) { console.log(err, err.stack) }

          aws.S3_download_url = 'https://' + (enums.aws.regions[p.storage.region]).endpoint + '/' + p.storage.bucket + '/' + p.storage.folder + '/' + path.parse(aws.asset).base;
          step();

        });

    }

  }

}

module.exports = aws;   