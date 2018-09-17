var enums           = require('./constants'),
    config          = require('./config'),
    moment          = require('moment'),
    ytLogger        = require("bug-killer"),
    fs              = require("fs"),
    readJson        = require("r-json"),
    rline           = require('readline-sync'),
    //rl              = rline.createInterface(process.stdin, process.stdout),
    api             = null;

const Youtube = require("youtube-api"),
      opn = require("opn"),
      prettyBytes = require("pretty-bytes");
    
var yt = {

    get : function(step) {

        let oauth = Youtube.authenticate({
              type           : "oauth"
            , client_id      : config.params.video.key
            , client_secret  : config.params.video.secret
            , redirect_url   : config.params.auth.yt.creds.installed.redirect_uris[0] 
        })

        //TODO:  Check if there is an existing access token saved to file.  If not then open browser and prompt for access code.
        if (!config.params.prefs.oauth.youtube || !config.params.prefs.oauth.youtube.refresh_token) {

            opn(oauth.generateAuthUrl({
              access_type: "offline"
            , scope: ["https://www.googleapis.com/auth/youtube.upload"]
            }));

            var auth_code = rline.question("\n\nFirst grant this application authorization to access your YouTube account.\n\nPlease enter in the authorization code from your browser and press the <Enter> key\n");

            oauth.getToken(auth_code, (err, tokens) => {

                if (err) {
                    throw err;
                }

                config.params.prefs.oauth.youtube = tokens;
                config.write_prefs(config.params.prefs);
                step();

            });

        } else {

            console.log("\nAttempting to retreive access token using refresh token.  Please wait....");
            step();

        }

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

module.exports = yt;