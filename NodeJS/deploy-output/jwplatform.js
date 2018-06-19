var enums           = require('./constants'),
    config          = require('./config'),
    moment          = require('moment'),
    jwPlatform      = require('jwplatform-api'),
    jwLogger        = null,
    api             = null;

jwLogger = {

    debug : function(info) {  }, 
    error : function(err)  {  }

}
    
var jw = {

    get : function(step) {

        api = new jwPlatform({
                                key : config.params.video.key //enums.jw.auth.key
                              , secret : config.params.video.secret//enums.jw.auth.secret
                             }, jwLogger);

        step();

    },

    video : {

        key    : null,

        create : function(row, step) {

            var vid = {
                  download_url : row.s3_url
                , title        : config.params.video.title
                , description  : config.params.video.desc
                , author       : config.params.user.name
                , expires_date : moment().add(1, 'years').unix()
            }

            api.post('/v1/videos/create', vid, null, function(err, results){

                if (err) {
                    console.log(err) 
                } else {
                    jw.video.key = results.video.key;    
                }
                
                step();

            });

        }

    }

}

module.exports = jw;