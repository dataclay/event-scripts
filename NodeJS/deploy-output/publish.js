
/*
+--------------------------------------------------------------------+
|               ____        __             __                        |
|              / __ \____ _/ /_____ ______/ /___ ___  __             |
|             / / / / __ `/ __/ __ `/ ___/ / __ `/ / / /             |
|            / /_/ / /_/ / /_/ /_/ / /__/ / /_/ / /_/ /              |
|           /_____/\__,_/\__/\__,_/\___/_/\__,_/\__, /               |
|           Automating Digital Production      /____/                |
|                                                                    |
|                                                                    |
|   We believe that leveraging data in the design process should     |
|   be a playful and rewarding art. Our products make this           |
|   possible for digital content creators.                           |
|                                                                    |
|   |email                      |web                  |twitter       |
|   |support@dataclay.com       |dataclay.com         |@dataclay     |
|                                                                    |
|   This code is provided to you for your personal or commercial     |
|   use.  However, you must abide by the terms of the MIT            |
|   License: https://opensource.org/licenses/MIT                     |
|                                                                    |
|                                                                    |
|                Copyright 2013-2018 Dataclay, LLC                   |
|                  Licensed under the MIT License                    |
|                                                                    |
+--------------------------------------------------------------------+

|||||||| Description

This application transcodes output created by Templater and then
deploys that output to a video streaming platform.  It does this using
child processes that are the `transcode-after-job.js` and the
`deploy-output/app.js` scripts.  A single interface is here for making
use of both scripts in one call.

*/

var log               = require('./logger'),
    enums             = require('./constants'),
    async             = require('async'),
    fs                = require('fs'),
    path              = require('path'),
    nuuid             = require('node-uuid'),
    nopen             = require('open'),
    nurl              = require('url'),
    nutil             = require('util'),
    moment            = require('moment'),
    emoji             = require('node-emoji'),
    config            = require('./config'),
    pad               = require('pad'),
    argv              = require('minimist')(process.argv.slice(2));

const { spawnSync } = require('child_process');

log.info("\n\n------- Publishing After Effects output on [ " + moment().format('MMMM Do YYYY, h:mm:ss A') + " ] ----------------")

var user_conf = {};

try {

  async.series([

    (step) => {

        user_conf = {

                      gcreds           : argv.gcreds_file
                    , jwcreds          : argv.jwcreds_file
                    , awscreds         : argv.awscreds_file
                    , ytcreds          : argv.ytcreds_file
                    , vmocreds         : argv.vmocreds_file
                    , stream_service   : argv.stream_service
                    , stream_authorize : argv.stream_authorize
                    , stream_group     : argv.stream_group
                    , stream_privacy   : argv.stream_privacy
                    , stream_comments  : argv.stream_comments
                    , stream_download  : argv.stream_download
                    , stream_overwrite : argv.stream_overwrite
                    , data_type        : argv.data_type                                              || enums.data.types.GOOGLE
                    , user             : argv.author
                    , data_collection  : argv.worksheet
                    , sheet_key        : argv.sheet_key
                    , data_uri         : argv.data_uri
                    , dclay_user       : argv.dclay_user
                    , dclay_pass       : argv.dclay_pass
                    , data_index       : argv.data_index
                    , data_key         : argv.data_key
                    , start_row        : argv.start_row
                    , end_row          : argv.end_row
                    , asset_loc        : argv.asset_loc
                    , poster_frame     : argv.poster_frame
                    , poster_archive   : argv.poster_archive
                    , poster_ext       : argv.poster_ext                                             || "png"
                    , skip_clip_archive : ((argv.skip_clip_archive ? JSON.parse(argv.skip_clip_archive) : null) || false )
                    , asset_name       : argv.asset_name                                             || null
                    , asset_ext        : argv.asset_ext
                    , preview_info     : { domain : argv.domain_cell, route : argv.route_cell, player_key : argv.player_cell }
                    , player_key       : argv.player_key                                             || null
                    , storage_type     : (argv.storage_service                                       || enums.storage.types.NONE)
                    , storage_region   : argv.s3_region
                    , storage_bucket   : argv.s3_bucket
                    , storage_folder   : argv.s3_folder
                    , broadcast        : argv.broadcast
                    , title            : argv.title
                    , desc             : argv.desc                                                   || "null"
                    , bot_enabled      : argv.bot_enabled
                    , stream_url       : argv.stream_url

                    , input_file       : path.resolve(argv.input)
                    , outputdir        : path.resolve(argv.outdir)
                    , output           : path.resolve(path.join(argv.outdir, argv.outname))
                    , outname          : argv.outname
                    , dest_loc         : path.resolve(argv.dest)
                    , remove_orig      : ((argv.cleanup ? JSON.parse(argv.cleanup) : null)           || false     )
                    , vcodec           : (argv.vcodec                                                || 'libx264' )
                    , vbit             : (parseInt(argv.vbit)                                        || 2048      )
                    , acodec           : (argv.acodec                                                || 'ac3'     )
                    , abit             : (argv.abit                                                  || '128k'    )
                    , file_ext         : (argv.file_ext                                              || '.mp4'    )
                    , vcontainer       : (argv.container                                             || 'mp4'     )
                    , pixformat        : (argv.pixformat                                             || 'yuv420p' )
                    , dimensions       : (argv.dimensions                                            || undefined )
                    , skip_preview     : ((argv.skip_preview ? JSON.parse(argv.skip_preview) : null) || false     )
              
                    , poster_time      : (parseFloat(argv.poster)                                    || 0         )
                    , poster_format    : (argv.poster_format                                         || 'png'     )
                    , poster_quality   : (String(argv.poster_quality)                                || '100'     )
                    , poster_scale     : (parseInt(argv.poster_scale)                                || null      )
                                           
                    , gif_start        : (argv.gif_start                                             || 0         )
                    , gif_duration     : (argv.gif_duration                                          || 3         )
                    , gif_fps          : (argv.gif_fps                                               || 30        )
                    , gif_scale        : (argv.gif_scale                                             || 480       )
      
                }

                log.info('\n\tPublishing Configuration\n\n%o', user_conf);

                step();   
      
    }, 

    (step) => {

        //function to spawn `transcode-after-job.js` using captured settings above
      var transcode = spawnSync('/Users/arie/.nvm/versions/node/v12.13.1/bin/node'
                              , [
                                    '/Users/arie/Dev/event-scripts/NodeJS/transcode-after-job.js',
                                    '--input'           , user_conf.input_file,
                                    '--outdir'          , user_conf.outputdir,
                                    '--outname'         , user_conf.outname,
                                    '--dest'            , user_conf.dest_loc,
                                    '--dimensions'      , user_conf.dimensions,
                                    '--skip_preview'    , user_conf.skip_preview,
                                    '--poster'          , user_conf.poster_time
                                ]
                              , {
                                      cwd      : process.cwd()
                                    , env      : process.env
                                    , stdio    : ['inherit', 'inherit', 'pipe']
                                    , encoding : 'utf-8'

                                }
                            );

        step();
        
    },

    (step) => {

        //function to call on deployment app with setting from interface
        var publish = spawnSync('/Users/arie/.nvm/versions/node/v12.13.1/bin/node'
                              , [
                                    '/Users/arie/Dev/event-scripts/NodeJS/deploy-output/app.js'
                                    , '--data_uri'          , user_conf.data_uri
                                    , '--vmocreds_file'     , user_conf.vmocreds
                                    , '--awscreds_file'     , user_conf.awscreds
                                    , '--gcreds_file'       , user_conf.gcreds
                                    , '--stream_service'    , user_conf.stream_service
                                    , '--storage_service'   , user_conf.storage_type
                                    , '--s3_region'         , user_conf.storage_region
                                    , '--s3_bucket'         , user_conf.storage_bucket
                                    , '--s3_folder'         , user_conf.storage_folder
                                    , '--worksheet'         , user_conf.data_collection
                                    , '--data_index'        , user_conf.data_index
                                    , '--data_key'          , user_conf.data_key
                                    , '--asset_loc'         , user_conf.dest_loc
                                    , '--asset_ext'         , user_conf.asset_ext
                                    , '--stream_privacy'    , user_conf.stream_privacy
                                    , '--stream_group'      , user_conf.stream_group
                                    , '--title'             , user_conf.title
                                    , '--desc'              , user_conf.desc
                                    , '--stream_url'        , user_conf.stream_url
                                    , '--domain_cell'       , user_conf.preview_info.domain
                                    , '--skip_clip_archive'
                                ]
                              , {
                                      cwd      : process.cwd()
                                    , env      : process.env
                                    , stdio    : ['inherit', 'inherit', 'pipe']
                                    , encoding : 'utf-8'

                                }
                            );

        step();

    }

  ], (err) => {

    log.info('\n\t[ FINISHED PUBLISHING! ]');
    process.exit();
    
    if (err) 
        log.error(err);

  }) //END PUBLISHING APP ENTRY

} catch (err) {

    log.error(err.message);

}

