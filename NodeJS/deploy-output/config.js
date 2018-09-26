
//Building Blocks — Legos
var log       = require('./logger'),
    enums     = require('./constants'),
    Q         = require('q'),
    extend    = require('extend'),
    readjson  = require('r-json'),
    writejson = require('write-json'),
    rline     = require('readline'),
    rl        = rline.createInterface({
                  input   : process.stdin,
                  output  : process.stdout
                }),
    fs        = require('fs'),
    path      = require('path'),
    sprintf   = require('sprintf-js').sprintf,
    pad       = require('pad');


//Configuration
var configuration = {

    params : { 

          prefs  : null,

          auth   : {
                          google : {   
                                          creds             : null
                                   }
                        , jw     : {   
                                          key               : null
                                        , secret            : null 
                                   }
                        , aws    : {
                                          accessKeyId       : null
                                        , secretAccessKey   : null
                                   }
                        , yt     : {
                                          creds             : null
                                        , oauth_access_tk   : null
                                        , oauth_refresh_tk  : null
                                   }
                        , vmo    : {
                                          creds             : null
                                        , oauth_access_tk   : null
                                        , oauth_refresh_tk  : null
                                   }
                   },

          user   : { 
                        name : null 
                   },

          data   : {
                          type       : null
                        , url        : null
                        , sheet_key  : null
                        , collection : null
                   },

          fields : {
                          output      : { name : null, pos : null, letter : null }
                        , download    : { name : null, pos : null, letter : null }
                        , stream      : { name : null, pos : null, letter : null }
                        , bcast       : { name : null, pos : null, letter : null }
                        , embed       : { name : null, pos : null, letter : null }
                        , preview     : { name : null, pos : null, letter : null }
                   },

          batch   : {
                          start   : null
                        , end     : null
                        , assets  : null
                    },

          video   : {
                          thumb   : null
                        , ext     : null
                        , player  : null
                        , preview : { }
                        , service : null
                    },

          storage : {
                          type     : null
                        , region   : null
                        , bucket   : null
                        , folder   : null
                        , accessID : null
                    }
    },

    read : {

        gsheet_url : function() {

            var deferred  = Q.defer();

            rl.question("Enter the URL of the Google Sheet:  ", function(gsheet_url) {
                config.data_url = gsheet_url;
                deferred.resolve();
            }, function(err) {
                debug.log("There was an error reading your input.  Please try again");
                deferred.reject(new Error("There was an error reading the URL.  Please try again."));
            });

            return deferred.promise;

        },

        index_col : function () {

            var deferred = Q.defer();

            rl.question("Enter the name of the index column:  ", function(idx_col){
                config.index_col = idx_col;
                deferred.resolve();
            }, function(err) {
                debug.log("There was an error reading your input.  Please try again");
                deferred.reject(new Error("There was an error reading the index column.  Please try again."));
            });

            return deferred.promise;

        },

        dir_path : function () {

            var deferred = Q.defer();

            rl.question("Enter the path to rendered output:  ", function(assets){
                config.asset_path = assets;
                deferred.resolve();
            }, function(err) {
                debug.log("There was an error reading your input.  Please try again.");
                deferred.reject(new Error("Ther was an error reading the path.  Please try again."));
            });

            return deferred.promise;

        },

        range_start : function () {

            var deferred = Q.defer();

            rl.question("Enter the row number to begin uploading:  ", function(row){
                config.row_start = row;
                deferred.resolve();
            }, function(err) {
                debug.log("There was an error reading your input.  Please try again.");
                deferred.reject(new Error("Ther was an error reading the start row.  Please try again."));
            });

            return deferred.promise;

        },

        range_end : function () {

            var deferred = Q.defer();

            rl.question("Enter the row number to end uploading:  ", function(row){
                config.row_end = row;
                deferred.resolve();
            }, function(err) {
                debug.log("There was an error reading your input.  Please try again.");
                deferred.reject(new Error("There was an error reading the row.  Please try again."));
            });

            return deferred.promise;

        }

    },

    display : function() {

            var p = configuration.params;

            log.info("\n\t[ CONFIGURATION ]\n");
            log.info("\t\t" + pad("Data",  25)                    + " : " + p.data.url                   );
            log.info("\t\t" + pad("Google Credentials", 25)       + " : " + p.auth.google.creds          );
            log.info("\t\t" + pad("Storage Credentials", 25)      + " : " + p.storage.creds              );
            log.info("\t\t" + pad("Storage Service", 25)          + " : " + p.storage.type               );
            log.info("\t\t" + pad("Storage Access ID", 25)        + " : " + p.storage.accessID           );
            log.info("\t\t" + pad("Storage Secret", 25)           + " : " + p.storage.secret             );
            log.info("\t\t" + pad("Stream Credentials", 25)       + " : " + p.video.creds                );
            log.info("\t\t" + pad("Stream Service", 25)           + " : " + p.video.service              );
            log.info("\t\t" + pad("Stream Authorize", 25)         + " : " + p.video.authorize            );
            log.info("\t\t" + pad("Stream Group", 25)             + " : " + p.video.group                );
            log.info("\t\t" + pad("Stream Privacy", 25)           + " : " + p.video.privacy              );
            log.info("\t\t" + pad("Stream Commenting", 25)        + " : " + p.video.comments             );
            log.info("\t\t" + pad("Stream Downloadable", 25)      + " : " + p.video.downloadable         );
            log.info("\t\t" + pad("Stream API Key", 25)           + " : " + p.video.key                  );
            log.info("\t\t" + pad("Stream API Secret", 25)        + " : " + p.video.secret               );
            log.info("\t\t" + pad("Stream API user", 25)          + " : " + p.video.user                 );
            log.info("\t\t" + pad("Stream URL format", 25)        + " : " + p.video.stream_url           );
            log.info("\t\t" + pad("Data Collection", 25)          + " : " + p.data.collection            );
            log.info("\t\t" + pad("Data Index", 25)               + " : " + (p.fields.index || "default"));
            log.info("\t\t" + pad("Data Key", 25)                 + " : " + p.data.key                   );
            log.info("\t\t" + pad("Data Domain Reference", 25)    + " : " + p.video.preview.domain       );
            log.info("\t\t" + pad("Data Route Reference", 25)     + " : " + p.video.preview.route        );
            log.info("\t\t" + pad("Data Player Reference", 25)    + " : " + p.video.preview.player_key   );
            log.info("\t\t" + pad("Video Title", 25)              + " : " + p.video.title                );
            log.info("\t\t" + pad("Video Description", 25)        + " : " + p.video.desc                 );
            log.info("\t\t" + pad("Video Poster", 25)             + " : " + p.video.thumb                );
            log.info("\t\t" + pad("Assets", 25)                   + " : " + p.batch.assets               );
            log.info("\t\t" + pad("Start", 25)                    + " : " + p.batch.start                );
            log.info("\t\t" + pad("End", 25)                      + " : " + p.batch.end                  );
            log.info("\t\t" + pad("Bot Enabled", 25)              + " : " + p.data.bot_enabled           );
            rl.close();

    },

    read_prefs : function(step) {

        let prefs_file = `${__dirname}/prefs.json`;
        let prefs      = readjson(prefs_file); 

        configuration.params.prefs = prefs;

        step();

    },

    write_prefs : function(prefs) {

        //First read the file and place into memory
        let prefs_file = `${__dirname}/prefs.json`;
        writejson.sync(prefs_file, prefs, null, 4)

    },

    where_prefs : function(prefs) {
        return `${__dirname}/prefs.json`;
    },

    get : function(args) {

        var p                 = configuration.params,
            awscreds_contents = null,
            awscreds          = null,
            jwcreds_contents  = null,
            jwcreds           = null,
            ytcreds_contents  = null,
            ytcreds           = null,
            vmocreds_contents = null,
            vmocreds          = null;
        
        //Required for Google Sheet data sources
        //Get Google Service Account credentials
        if (configuration.detect_datasource(args.data_uri) === enums.data.types.GOOGLE) {

            if (!fs.existsSync(args.gcreds)) {
                log.error(enums.errors.absent_gcreds_file, args.gcreds);
                throw new Error(sprintf(enums.errors.absent_gcreds_file, args.gcreds));
            } else {
                p.auth.google.creds = args.gcreds;    
            }

        }

        //Get AWS credentials
        //Optional if user wants to use S3
        if (args.storage_service && (args.storage_service == enums.storage.types.S3)) {

            if (!fs.existsSync(args.awscreds)) {
                log.error(enums.errors.absent_awscreds_file, args.awscreds)
                throw new Error(sprintf(enums.errors.absent_awscreds_file, args.awscreds));
            } else {

                try {
                    awscreds_contents  = fs.readFileSync(args.awscreds);
                    awscreds           = JSON.parse(awscreds_contents);
                    p.storage.creds    = args.awscreds;
                    p.storage.accessID = awscreds.accessKeyID;
                    p.storage.secret   = awscreds.secretAccessKey;
                } catch (e) {
                    log.error(enums.errors.json_read_err, args.awscreds);
                    throw new Error(sprintf(enums.errors.json_read_err, args.awscreds));
                }

            }

        }

        //Get JWPlatform credentials
        //Optional if user wants to use JWPlatform
        if (args.stream_service && (args.stream_service == enums.video.services.JWPLATFORM)) {

            if (!fs.existsSync(args.jwcreds)) {
                log.error(enums.errors.absent_jwcreds_file, args.jwcreds);
                throw new Error(sprintf(enums.errors.absent_jwcreds_file, args.jwcreds));
            } else {
                jwcreds_contents = fs.readFileSync(args.jwcreds);

                try {
                    jwcreds            = JSON.parse(jwcreds_contents);
                    p.video.creds      = args.jwcreds;
                    p.video.user       = jwcreds.user;
                    p.video.key        = jwcreds.key;
                    p.video.secret     = jwcreds.secret;    
                } catch(e) {
                    log.error(enums.errors.json_read_err, args.jwcreds);
                    throw new Error(sprintf(enums.errors.json_read_err, args.jwcreds));
                }
                
            }

        }

        //Get YouTube credentials
        if (args.stream_service && (args.stream_service == enums.video.services.YOUTUBE)) {

            if (!fs.existsSync(args.ytcreds)) {
                log.error(enums.errors.absent_ytcreds_file, args.ytcreds)
                throw new Error(sprintf(enums.errors.absent_ytcreds_file, args.ytcreds));
            } else {
                ytcreds_contents = fs.readFileSync(args.ytcreds);

                try {
                    ytcreds            = JSON.parse(ytcreds_contents);
                    p.auth.yt.creds    = ytcreds;
                    p.video.creds      = args.ytcreds;
                    p.video.user       = ytcreds.installed.project_id;
                    p.video.key        = ytcreds.installed.client_id;
                    p.video.secret     = ytcreds.installed.client_secret;
                } catch(e) {
                    log.error(enums.errors.json_read_err, args.ytcreds);
                    throw new Error(sprintf(enums.errors.json_read_err, args.ytcreds));
                }
                
            }

        }

        //Get Vimeo credentials
        if (args.stream_service && (args.stream_service == enums.video.services.VIMEO)) {

            if (!fs.existsSync(args.vmocreds)) {
                log.error(enums.errors.absent_vmocreds_file, args.vmocreds)
                throw new Error(sprintf(enums.errors.absent_vmocreds_file, args.vmocreds));
            } else {
                vmocreds_contents = fs.readFileSync(args.vmocreds);

                try {
                    vmocreds           = JSON.parse(vmocreds_contents);
                    p.auth.vmo.creds   = vmocreds;
                    p.video.creds      = args.vmocreds;
                    p.video.user       = vmocreds.user;
                    p.video.key        = vmocreds.client_id;
                    p.video.secret     = vmocreds.client_secret;
                    p.video.redirect   = vmocreds.redirect_url;
                } catch(e) {
                    log.error(enums.errors.json_read_err, args.vmocreds);
                    throw new Error(sprintf(enums.errors.json_read_err, args.vmocreds));
                }
                
            }

        }

        p.user.name          = args.user || "Unknown";

        p.data.type          = args.data_type || enums.data.types.GOOGLE;
        p.data.url           = args.data_uri;
        p.data.collection    = args.data_collection;
        p.data.sheet_key     = args.sheet_key;
        p.data.bot_enabled   = args.bot_enabled;
        p.data.key           = args.data_key;
        
        p.fields.index       = args.data_index || null;
        p.fields.output      = { name : enums.data.fields.OUTPUT,  pos : null, letter: null };
        p.fields.download    = { name : enums.data.fields.S3_LINK, pos : null, letter: null };
        p.fields.stream      = { name : enums.data.fields.STREAM,  pos : null, letter: null };
        p.fields.bcast       = { name : enums.data.fields.BCAST,   pos : null, letter: null };
        p.fields.embed       = { name : enums.data.fields.EMBED,   pos : null, letter: null };
        p.fields.preview     = { name : enums.data.fields.PREV,    pos : null, letter: null };
        p.fields.url         = { name : enums.data.fields.URL,     pos : null, letter: null };
        
        p.batch.start        = args.start_row;
        p.batch.end          = args.end_row;
        p.batch.assets       = args.asset_loc;

        p.video.service      = args.stream_service;
        p.video.authorize    = args.stream_authorize;
        p.video.group        = args.stream_group;
        p.video.privacy      = args.stream_privacy;
        p.video.comments     = args.stream_comments;
        p.video.downloadable = args.stream_download;
        p.video.title        = args.title;
        p.video.desc         = args.desc;
        p.video.broadcast    = args.broadcast;
        p.video.stream_url   = args.stream_url;
        p.video.thumb        = args.poster_frame;
        p.video.ext          = args.asset_ext;
        p.video.preview      = args.preview_info;

        p.storage.type       = args.storage_type;
        p.storage.region     = args.storage_region;
        p.storage.bucket     = args.storage_bucket;
        p.storage.folder     = args.storage_folder;

        extend(true, configuration.params, p);

        return configuration.params;

    },

    detect_datasource : function(uri) {

        if (!uri) {
            return null;
        }

        if (uri.indexOf(enums.data.tokens.GSHEET_DOMAIN) > -1) {

            return enums.data.types.GOOGLE;

        } else {

            if (fs.openSync(uri)) {

                fs.closeSync(uri);
                return enums.data.types.JSON_FILE;

            } else {

                return enums.data.types.JSON_URL;

            }

        }

    },

    is_batch : function() {

        var p = configuration.params;

        if (p.fields.index   &&
            p.data.key       &&
            !(p.batch.start) &&
            !(p.batch.end))
        {
            return false;
        } else {
            return true;
        }
    }

}

module.exports = configuration;
