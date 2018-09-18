var enums           = require('./constants'),
    config          = require('./config'),
    stream          = require('./stream'),
    async           = require('async'),
    moment          = require('moment'),
    ytLogger        = require('bug-killer'),
    fs              = require('fs'),
    readJson        = require("r-json"),
    rline           = require('readline-sync'),
    uuid            = require('uuid'),
    url             = require('url'),
    logln           = require('single-line-log').stdout,
    emoji           = require('node-emoji'),
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

                throw new Error(enums.errors.incorrect_vmo_state);

            } else {

                api.accessToken(auth_url.query.code, config.params.video.redirect, (err, response) => {

                    if (err) {
                        throw err;
                    }

                    config.params.prefs.oauth.vimeo = response;
                    config.write_prefs(config.params.prefs);

                    api.setAccessToken(response.access_token);
                    user = response.user;

                    if (config.params.video.authorize) {
                        console.log("\n\t" + emoji.get('tada') + "\tYou're in!  This application can now access your Vimeo account.");
                        console.log("\n\t" + emoji.get('clipboard') + "\tAuthorization info saved to:\n\t\t\t" + config.where_prefs());
                        step(true);
                    } else {
                        step();
                    }

                });

            }

        } else {

            api.setAccessToken(config.params.prefs.oauth.vimeo.access_token);
            console.log("\nVimeo access token already retrieved!");
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
                        console.log(error)
                        step();
                    }

                    if (body) {
                        
                        stream.key = ((config.params.video.privacy === "unlisted") ? body.link.split('https://vimeo.com/')[1] : vmo.video.key);
                        console.log("\n\t" + emoji.get('see_no_evil') + "\t[ " + path.parse(stream.upload).base + " ] is [ " + config.params.video.privacy + " ]");

                        stream.embed_code = body.embed.html;
                        console.log("\n\t" + emoji.get('man-woman-girl-boy') + "\t Vimeo embed code:\n\t\t\t" + stream.embed_code);

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
                                throw new Error(error);
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

                    if (error) 
                        throw new Error(error);
                    else 
                        console.log("\n\t" + emoji.get('books') + "\tMoved [ " + path.parse(stream.upload).base + " ] to group [ " + vmo.video.group.name + " ]");

                    step();

                });

            } else {

                step();

            }

        },

        create : function(row, step) {

            var p = config.params,
                vid = {
                          name         : p.video.title
                        , description  : p.video.desc
                        , privacy      : { view : p.video.privacy, download: p.video.downloadable, comments: p.video.comments }
                      }

            api.upload(

              stream.upload, //path to asset on the filesystem
              vid, //options to upload

              function (uri) {

                vmo.video.key = uri.substring(uri.lastIndexOf('/') + 1, uri.length);

                async.series([
                    vmo.video.get_details,
                    vmo.video.create_group,
                    vmo.video.add_to_group
                ], step);                
                
              },

              function (bytesUploaded, bytesTotal) {
                var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
                logln("\n\t" + emoji.get('clapper') + "\tSending [ " + path.parse(stream.upload).base + " ] to Vimeo...  " + percentage + "%  "  + emoji.get('rocket') + "\n");
              },

              function (error) {
                console.log('\n\nUpload of video asset failed because: ' + error)
                step();
              }
            )

        }

    }

}

module.exports = vmo;