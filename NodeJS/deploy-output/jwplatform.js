var log             = require('./logger'),
    enums           = require('./constants'),
    path            = require('path'),
    config          = require('./config'),
    moment          = require('moment'),
    request         = require('request'),
    jwPlatform      = require('jwplatform-api'),
    stream          = require('./stream')
    fs              = require('fs'),
    emoji           = require('node-emoji'),
    aws             = require('./aws'), 
    jwLogger        = null,
    api             = null;

jwLogger = {

    debug : function(info) { }, 
    error : function(err)  { }

}
    
var jw = {

    get : function(step) {

        api = new jwPlatform({
                                key : config.params.video.key //enums.jw.auth.key
                              , secret : config.params.video.secret//enums.jw.auth.secret
                             }, jwLogger);

        log.info("\n\t\tJW Platform ready for asset uploads");

        step();

    },

    video : {

        key    : null,

        asset  : null,

        upload_obj : null,

        sanitize_user_readable : function(token) {

            return 

        },

        generate_upload_object : function(step) {

            api.getUploadUrl('v1', (err, result) => {
                jw.video.upload_obj = result
                step();
            })

        },

        create : function(row, step) {

            var vid_options = {
                  title        : config.params.video.title
                , description  : config.params.video.desc
                , author       : config.params.user.name
                , expires_date : moment().add(1, 'years').unix()
            }

            var after_create = step;

            if (config.params.storage.type == enums.storage.types.S3) {
                
                vid_options.download_url = aws.S3_URL['video'];

                api.post('/v1/videos/create', vid_options, null, function(err, results){

                    if (err) {
                        log.error(err);
                    } else {
                        stream.key = results.video.key;
                        step();
                    }

                });

            } else if (config.params.storage.type == enums.storage.types.NONE) {

                var form_data  = { file : fs.createReadStream(stream.upload) };

                async.series([

                    jw.video.generate_upload_object,

                    function(step) {

                        console.log("\n\t" + emoji.get('clapper') + "\tSending [ " + path.parse(stream.upload).base + " ] to JWPlatform...  " + emoji.get('rocket'));

                        request.post({uri: jw.video.upload_obj.uploadUrl, formData: form_data}, function(err, resp, body){
                            if (err) return console.error('Upload failed', err);

                            //The upload finished, but now we have to set that video's attributes.
                            stream.key = JSON.parse(body).media.key;
                            vid_options.video_key = stream.key;
                            api.post('/v1/videos/update', vid_options, null, function(err, results) {
                               console.log("\n\t" + emoji.get('memo') + "\tFinished updating the video's properties.");
                               after_create();
                            });

                        });

                    }

                ], function(err, result) {
                    after_create();
                })

            }

        }

    }

}

module.exports = jw;