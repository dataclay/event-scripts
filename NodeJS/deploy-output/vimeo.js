var log             = require('./logger'),
    enums           = require('./constants'),
    config          = require('./config'),
    stream          = require('./stream'),
    aws             = require('./aws'),
    async           = require('async'),
    moment          = require('moment'),
    ytLogger        = require('bug-killer'),
    fs              = require('fs'),
    readJson        = require('r-json'),
    rline           = require('readline-sync'),
    uuid            = require('uuid'),
    url             = require('url'),
    logln           = require('single-line-log').stdout,
    emoji           = require('node-emoji'),
    path            = require('path'),
    https           = require('https'),
    user            = null,
    api             = null;

const Vimeo         = require("vimeo").Vimeo,
      opn           = require("opn"),
      prettyBytes   = require("pretty-bytes"),
      vmoScopes     = ['public','private','create','edit','delete','interact','upload','video_files'];
    
var vmo = {

    get : function(step, auth_only) {

        let vmoState = uuid.v4(); 

        api = new Vimeo(config.params.video.key, config.params.video.secret);

        if (!config.params.prefs.oauth.vimeo || !config.params.prefs.oauth.vimeo.access_token) {

            opn(api.buildAuthorizationEndpoint(config.params.video.redirect, vmoScopes, vmoState).toString());

            var auth_url = url.parse(rline.question("\n\nFirst authorize this application to access your Vimeo account.\n\nAfter authorizing this application, copy the URL from the browser's window and press the <Enter> key\n"), true);

            if (auth_url.query.state !== vmoState) {

                log.error(enums.errors.incorrect_vmo_state);
                throw new Error(enums.errors.incorrect_vmo_state);

            } else {

                api.accessToken(auth_url.query.code, config.params.video.redirect, (err, response) => {

                    if (err) {
                        log.error(err.message);
                        throw err;
                    }

                    config.params.prefs.oauth.vimeo = response;
                    config.write_prefs(config.params.prefs);

                    api.setAccessToken(response.access_token);
                    user = response.user;

                    if (config.params.video.authorize) {
                        
                        log.info("\n\t\t%s\tYou're in!  This application can now access your Vimeo account."
                                , emoji.get('tada'));

                        log.info("\n\t\t%s\tAuthorization info saved to:\n\t\t\t%s"
                                , emoji.get('clipboard')
                                , config.where_prefs());

                        step(true);
                    } else {
                        step();
                    }

                });

            }

        } else {

            api.setAccessToken(config.params.prefs.oauth.vimeo.access_token);
            log.info("\n\t\tVimeo access token already retrieved!");
            step();

        }

    },

    video : {

        key    : null,

        asset  : null,

        group  : { id: null, name: null, uri: null },

        get_details : function(step) {
                    
                var req_options = {
                      method: "GET"
                    , path: ("/videos/" + vmo.video.key)
                }

                api.request(req_options, function(error, body, status_code, headers) {

                    if (error) {
                        log.error(error)
                        step();
                    }

                    if (body) {
                        
                        stream.key = ((config.params.video.privacy === "unlisted") ? body.link.split('https://vimeo.com/')[1] : vmo.video.key);

                        log.info("\n\t\t%s\tPrivacy for [ %s ] is set to [ %s ]"
                                , emoji.get('see_no_evil')
                                , path.parse(stream.upload).base
                                , config.params.video.privacy);

                        stream.embed_code = body.embed.html;
                       
                        log.info("\n\t\t%s\t Vimeo embed code:\n\t\t\t%s"
                                , emoji.get('man-woman-girl-boy')
                                , stream.embed_code)

                        step();
                    }

                })

        },

        create_group : function(step) {

            //todo add video to an album grouping
            var req_all_albums = {
                  method : "GET"
                , path   : "/me/albums"
                , query  : { per_page: 100 }
            }

            if (config.params.video.group) {

                vmo.video.group.name = config.params.video.group;

                //get all the user's albums
                api.request(req_all_albums, function(error, body, status_code, headers) {

                    for (var i=0; i < body.data.length; i++) {

                        if (body.data[i]['name'] === config.params.video.group) {
                            vmo.video.group.uri = body.data[i]['uri'];
                            break;
                        }

                    }

                    if (!vmo.video.group.uri) {

                        var req_make_album = {
                              method        : "POST"
                            , path          : "/me/albums"
                            , query         : {   name        : config.params.video.group
                                                , description : config.params.video.group 
                                              }
                        };

                        api.request(req_make_album, function(error, body, status_code, headers) {

                            if (error) {
                                log.error(error.message)
                                throw error;
                            }

                            vmo.video.group.uri = body.uri;
                            step();

                        })

                    } else {

                        step();
                    }

                });

            } else {
                step();
            }

        },

        add_to_group : function(step) {

            if (config.params.video.group) {

                var group_id = vmo.video.group.uri.substring(vmo.video.group.uri.lastIndexOf('/') + 1, vmo.video.group.uri.length);

                var req_vid_to_group = {
                                            method : "PUT"
                                          , path   : ("/me/albums/" + group_id + "/videos/" + vmo.video.key)
                                       }

                api.request(req_vid_to_group, function(error, body, status_code, headers) {

                    if (error) {
                        log.error(error);
                        throw error;
                    } else {
                        log.info("\n\t\t%s\tMoved [ %s ] to group [ %s ]"
                                , emoji.get('books')
                                , path.parse(stream.upload).base
                                , vmo.video.group.name);
                    }
                    step();

                });

            } else {

                step();

            }

        },

        set_poster   : function(step) {

            //1.  Get the picture URI for the video
            var   p           = config.params
                , upload_uri  = null
                , upload_link = null
                , poster_stat_uri = null;

            async.series([  (next) => {

                        var req_picture_uri = {
                              method: "GET"
                            , path:   "/videos/" + vmo.video.key
                        }
                        
                        api.request(req_picture_uri, (err, body, status_code, headers) => {
                            if (err) {
                                log.error(err);
                            } else {
                                
                                upload_uri = body.metadata.connections.pictures.uri;

                                log.info("\n\t\t%s\tPoster setup endpoint => %s"
                                            , emoji.get('frame_with_picture')
                                            , upload_uri);
                                
                            }

                            next();

                        })

                     },

                     (next) => {

                        var req_upload_link = {
                              method : "POST"
                            , path   :  upload_uri
                        }

                        api.request(req_upload_link, (err, body, status_code, headers) => {

                            if (err) {
                                log.error(err)
                            } else {
                                upload_link = body.link;
                                //console.log(body);
                                poster_stat_uri = body.uri;
                                log.info("\n\t\t%s\tPoster upload link => %s"
                                            , emoji.get('frame_with_picture')
                                            , upload_link);
                            }

                            next();

                        })

                     },

                     (next) => {

                        var vmoClient = new Vimeo(p.video.key, p.video.secret, p.prefs.oauth.vimeo.access_token);

                        var req_upload_poster = vmoClient._buildRequestOptions({
                                method   : 'PUT',
                                port     : 443,
                                hostname : 'i.cloud.vimeo.com',
                                path     : upload_link.replace('https://i.cloud.vimeo.com', ''),
                                query    : stream.thumb,
                                headers  : {
                                                'Content-Type'   : 'image/png',
                                                'Accept'         : 'application/vnd.vimeo.*+json;version=3.4'
                                           }
                            });

                        let output = '';

                        const req = https.request(req_upload_poster, function(res) {
        
                          // log.info('STATUS: ' + res.statusCode);
                          // log.info('HEADERS: ' + JSON.stringify(res.headers));
                          
                          res.setEncoding('utf8');
                          
                          res.on('end', () => {
                              //log.info(output);
                              log.info("\n\t\t%s\tFinished uploading poster => %s"
                                        , emoji.get('frame_with_picture')
                                        , stream.thumb );

                              next();
                          });

                          res.on('data', function (chunk) {
                            output += chunk;
                          });

                        }); 
                        
                        req.on('error', function(e) {
                            log.error('Error: ' + e.message);
                        });

                        req.on('start', (e) => {
                            log.info("Started request!");
                        });

                        fs.createReadStream(stream.thumb).pipe(req);

                     },

                     (next) => {

                        var req_picture_uri = {
                              method: "PATCH"
                            , path:   poster_stat_uri
                            , query: {
                                "active" : true
                            }
                        }

                        log.info("\n\t\t%s\tPoster activation endpoint => %s"
                                    , emoji.get('frame_with_picture')
                                    , poster_stat_uri);
                        
                        api.request(req_picture_uri, (err, body, status_code, headers) => {
                            if (err) {
                                log.error("Error:\n\n%o", err);
                            } else {
                                log.info("\n\t\t%s\tPoster activated? => %s"
                                            , emoji.get('frame_with_picture')
                                            , body.active);
                            }

                            next();

                        })

                     }

                ], step);

            //make a call to set the poster frame by time - does not currently work in auto-upload context
            /* 
            var p = config.params,
                req_set_poster = {
                                    method : "POST"
                                  , path   : "/videos/" + vmo.video.key + "/pictures"
                                  , query  : { active: true, time: parseFloat(p.video.thumb) }
                                 }

            api.request(req_set_poster, (err, body, status_code, headers) => {

                if (err) {
                    log.error(err);
                } else {
                    log.info("\n\t\t%s\tSet the poster frame for [ %s ] to [ %s ] seconds"
                            , emoji.get('frame_with_picture')
                            , path.parse(stream.upload).base
                            , parseFloat(p.video.thumb))
                }

                step();

            })
            */

        },

        create : function(row, step) {

            var p = config.params,
                vid = {
                          name         : (config.is_batch() ? row[p.video.title] : p.video.title)
                        , description  : (config.is_batch() ? row[p.video.desc]  : p.video.desc)
                        , privacy      : { 
                                              view     : p.video.privacy
                                            , download : p.video.downloadable
                                            , comments : p.video.comments
                                         }
                      };

            //If the AWS is set as storage and a link exists, then use Vimeo's pull method
            if (p.storage.type === enums.storage.types.S3 && aws.S3_URL.video)
            {
                
                log.info("\n\t\t%s\tVimeo pulling video from storage [ %s ] from link\n\t\t\t\t[ %s ]"
                        , emoji.get('telephone_receiver')
                        , p.storage.type
                        , aws.S3_URL.video);

                vid.upload = { approach: "pull", link: aws.S3_URL.video }

                var pull_req = {
                      method  : "POST"
                    , path    : "/me/videos/"
                    , query   : vid
                }

                api.request(pull_req, (error, body, status_code, headers) => {

                    if (error) {
                        log.error("Error with request to pull video from S3 => \n\t%o\n\n\t%s"
                                  , pull_req
                                  , error);
                    }

                    vmo.video.key = body.uri.substring(body.uri.lastIndexOf('/') + 1, body.uri.length);

                    log.info("\n\t\t%s\tFinished uploading [ %s ] to Vimeo!"
                            , emoji.get('clapper')
                            , path.parse(stream.upload).base);

                    async.series([
                        vmo.video.get_details,
                        vmo.video.create_group,
                        vmo.video.add_to_group,
                        vmo.video.set_poster
                    ], step);

                });


            } else {

                log.info("\n\t\t%s\tInitiating upload of [ %s ] to Vimeo ... %s"
                    , emoji.get('boom')
                    , path.parse(stream.upload).base
                    , emoji.get('rocket'))

                api.upload(

                  stream.upload, //path to asset on the filesystem
                  vid, //options to upload

                  function (uri) {

                    vmo.video.key = uri.substring(uri.lastIndexOf('/') + 1, uri.length);

                    log.info("\n\t\t%s\tFinished uploading [ %s ] to Vimeo!"
                            , emoji.get('clapper')
                            , path.parse(stream.upload).base);

                    async.series([
                        vmo.video.get_details,
                        vmo.video.create_group,
                        vmo.video.add_to_group,
                        vmo.video.set_poster
                    ], step);                
                    
                  },

                  function (bytesUploaded, bytesTotal) {
                    var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
                    logln("\n\t\t" + emoji.get('clapper') + "\tSending [ " + path.parse(stream.upload).base + " ] to Vimeo...  " + percentage + "%  "  + emoji.get('rocket') + "\n");
                  },

                  function (error) {
                    log.error('\n\nUpload of video asset failed because: %s'
                              , error)
                    step();

                  }
                )

            }

        }

    }

}

module.exports = vmo;