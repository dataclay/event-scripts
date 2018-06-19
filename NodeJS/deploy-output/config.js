
//Building Blocks — Legos
var enums   = require('./constants'),
    Q       = require('q'),
    extend  = require('extend'),
    rline   = require('readline'),
    rl      = rline.createInterface({
                 input   : process.stdin,
                 output  : process.stdout
              }),
    fs      = require('fs'),
    path    = require('path'),
    sprintf = require('sprintf-js').sprintf;


//Configuration
var configuration = {

    params : { 

          auth   : {
                          google : {   
                                       cred            : null
                                   }
                        , jw     : {   
                                       key             : null
                                     , secret          : null 
                                   }
                        , aws    : {
                                       accessKeyId     : null
                                     , secretAccessKey : null
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
                    },

          storage : {
                          type    : null
                        , region  : null
                        , bucket  : null
                        , folder  : null
                        , accessID : "hello"
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

            console.log("\n\nGathered user data...\n");
            console.log(pad("Data",  25)                    + " : " + p.data.url                   );
            console.log(pad("Google Credentials", 25)       + " : " + p.auth.google.cred           );
            console.log(pad("Storage Credentials", 25)      + " : " + p.storage.creds              );
            console.log(pad("Streaming Credentials", 25)    + " : " + p.video.creds                );
            console.log(pad("Storage Access ID", 25)        + " : " + p.storage.accessID           );
            console.log(pad("Stoage Secret", 25)            + " : " + p.storage.secret             );
            console.log(pad("Streaming API Key", 25)        + " : " + p.video.key                  );
            console.log(pad("Streaming API Secret", 25)     + " : " + p.video.secret               );
            console.log(pad("Streaming API user", 25)       + " : " + p.video.user                 );
            console.log(pad("Data Collection", 25)          + " : " + p.data.collection            );
            console.log(pad("Data Index", 25)               + " : " + (p.fields.index || "default"));
            console.log(pad("Data Domain Reference", 25)    + " : " + p.video.preview.domain       );
            console.log(pad("Data Route Reference", 25)     + " : " + p.video.preview.route        );
            console.log(pad("Data Player Reference", 25)    + " : " + p.video.preview.player_key   );
            console.log(pad("Assets", 25)                   + " : " + p.batch.assets               );
            console.log(pad("Start", 25)                    + " : " + p.batch.start                );
            console.log(pad("End", 25)                      + " : " + p.batch.end                  );
            rl.close();

    },

    get : function(args, step) {

        var p                 = configuration.params,
            awscreds_contents = null,
            awscreds          = null,
            jwcreds_contents  = null,
            jwcreds           = null;
        
        //Get Google Service Account credentials
        if (!fs.existsSync(args.gcreds)) {
            throw new Error(sprintf(enums.errors.absent_gcreds_file, args.gcreds));
        } else {
            p.auth.google.cred = args.gcreds;    
        }

        //Get AWS credentials
        if (!fs.existsSync(args.awscreds)) {
            throw new Error(sprintf(enums.errors.absent_awscreds_file, args.awscreds));
        } else {

            try {
                awscreds_contents  = fs.readFileSync(args.awscreds);
                awscreds           = JSON.parse(awscreds_contents);
                p.storage.creds    = args.awscreds;
                p.storage.accessID = awscreds.accessKeyID;
                p.storage.secret   = awscreds.secretAccessKey;
            } catch (e) {
                throw new Error(sprintf(enums.errors.json_read_err, args.awscreds));
            }

        }

        //Get JWPlatform credentials
        if (!fs.existsSync(args.jwcreds)) {
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
                throw new Error(sprintf(enums.errors.json_read_err, args.jwcreds));
            }
            
        }

        p.user.name        = args.user;

        p.data.type        = enums.data.types.GOOGLE;
        p.data.url         = (p.data.type == enums.data.types.GOOGLE) ? "https://docs.google.com/spreadsheets/d/" + args.data_key + "/" : args.data_uri;
        p.data.collection  = args.data_collection;
        p.data.sheet_key   = args.data_key;
        
        p.fields.index     = args.data_index || null;
        p.fields.output    = { name : enums.data.fields.OUTPUT,  pos : null, letter: null };
        p.fields.download  = { name : enums.data.fields.S3_LINK, pos : null, letter: null };
        p.fields.stream    = { name : enums.data.fields.STREAM,  pos : null, letter: null };
        p.fields.bcast     = { name : enums.data.fields.BCAST,   pos : null, letter: null };
        p.fields.embed     = { name : enums.data.fields.EMBED,   pos : null, letter: null };
        p.fields.preview   = { name : enums.data.fields.PREV,    pos : null, letter: null };
        
        p.batch.start      = args.start_row;
        p.batch.end        = args.end_row;
        p.batch.assets     = args.asset_loc;

        p.video.title      = args.title;
        p.video.desc       = args.desc;
        p.video.broadcast  = args.broadcast;
        p.video.thumb      = args.poster_frame;
        p.video.ext        = args.asset_ext;
        p.video.preview    = args.preview_info;

        p.storage.type     = args.storage_type;
        p.storage.region   = args.storage_region;
        p.storage.bucket   = args.storage_bucket;
        p.storage.folder   = args.storage_folder;

        extend(true, configuration.params, p);

        return configuration.params;

    }

}

module.exports = configuration;
