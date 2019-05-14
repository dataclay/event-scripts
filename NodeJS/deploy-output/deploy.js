var async    = require('async'),
    fs       = require('fs'),
    aws      = require('./aws'),
    dcQ      = require('./api'),
    vmo      = require('./vimeo'),
    jw       = require('./jwplatform'),
    enums    = require('./constants'),
    emoji    = require('node-emoji'),
    config   = require('./config'),
    gsheet   = require('./gsheet'),
    stream   = require('./stream'),
    path     = require('path'),
    log      = require('./logger');

var deploy = {

  is_batch   : false,

  video_file : null,

  poster_file : null,

  batch : function(rows, step) {

    var p = config.params,
        row_count = (p.batch.start-1);

    log.info("\n\t[ DEPLOYMENT %s ]"
            , emoji.get('airplane_departure'));

    log.info("\n\t\t%s\tDeploying [ %s ] videos to [ %s ] ..."
            , emoji.get('airplane_departure')
            , rows.length
            , p.video.service)

    async.eachOfSeries(rows, 
      
      function(row, key, step) {

        row_count++;
        row.row_idx = row_count;
        gsheet.row = row;

        log.info("\n\n\t\t--------------------------------------------------\n\n\t\t%s\tOpened Row [ %s ] in Worksheet [ %s ]"
                , emoji.get('eyes')
                , row.row_idx 
                , gsheet.worksheet.title);
        
        deploy.video_file = path.resolve(p.batch.assets, (row[p.fields.output.name] + "." + p.video.ext));
        stream.upload = deploy.video_file;

        if (!p.video.overwrite && row[enums.data.fields.STREAM]) {
          
          log.info("\n\t\t%s\tRow [ %s ] already has a stream key.  Skipping."
                  , emoji.get('ok_hand')
                  , row.row_idx);

          step();

        } else {

          log.info("\n\t\t%s\tSearching for [ %s ] ..."
                  , emoji.get('mag_right')
                  , (row[p.fields.output.name] + "." + p.video.ext));

              async.series([

                  //Transport file to storage provider
                  function(step) {

                    let video = {

                        file : video_file
                      , step : step

                    }

                    deploy.archive_asset(video);

                  },

                  function(step) {
                    gsheet.store_url(step)
                  },

                  function(step) {
                    gsheet.store_stream_key(step)
                  },

                  function(step) {
                    gsheet.store_embed_script(step)
                  },

                  function(step) {
                    gsheet.store_bcast_preview(step)
                  },

                  function(step) {
                    gsheet.store_stream_url(step)
                  }

              ], function(){
                
                log.info("\n\t\t%s\tWrote to row [ %s ] in worksheet [ %s ]"
                        , emoji.get('pencil2')
                        , row.row_idx
                        , gsheet.worksheet.title);

                step();

              });

          }

      },

      function(err){

        if (!err) {
          log.info("\n\t[ COMPLETE ]\n\n\t\t%s\tDone processing [ %s ] rows"
              , emoji.get('thumbsup')
              , rows.length);
        } else {
          log.error("\n\n\t%sThere was an error during batch upload:\n\t\t%s"
              , emoji.get('x')
              , err.message)
        } 

        step();

      });

  },

  single : function(row, step) {

    log.info("\n\t[ DEPLOYMENT %s ]"
            , emoji.get('airplane_departure'));

    var p = config.params;

    if (config.detect_datasource(p.data.url) === enums.data.types.GOOGLE)
    {
      gsheet.row = row;

      log.info("\n\t\t%s\tOpened row with [ %s ] key of [ %s ] in Worksheet [ %s ]"
                , emoji.get('eyes')
                , p.fields.index
                , row[p.fields.index]
                , gsheet.worksheet.title);
    } else {

      log.info("\n\t\t%s\tDeploying assets created from job with key [ %s ]"
                , emoji.get('eyes')
                , dcQ.job._id);

    }
    

    async.series([

      function(step) {

        if (config.detect_datasource(p.data.url) === enums.data.types.GOOGLE) {
          deploy.video_file    = path.resolve(p.batch.assets, config.sanitize(row[p.fields.output.name]) + '.' + p.video.ext        );
          deploy.poster_file   = path.resolve(p.batch.assets, config.sanitize(row[p.fields.output.name]) + '.' + p.video.thumb_ext  );
          deploy.preview_file  = path.resolve(p.batch.assets, config.sanitize(row[p.fields.output.name]) + '.' + 'gif'              );
        } else {
          deploy.video_file    = path.resolve(p.batch.assets, config.sanitize(row["_id"]) + '.' + p.video.ext        );
          deploy.poster_file   = path.resolve(p.batch.assets, config.sanitize(row["_id"]) + '.' + p.video.thumb_ext  );
          deploy.preview_file  = path.resolve(p.batch.assets, config.sanitize(row["_id"]) + '.' + 'gif'              );
        }
        

        stream.upload = deploy.video_file;
        stream.thumb  = deploy.poster_file;
        stream.clip   = deploy.preview_file;

        if (!p.video.overwrite && row[p.fields.stream.name]) {
          
          log.info("\n\t\t%s\tRow with key [ %s ] already has a stream key.  Skipping."
                    , emoji.get('ok_hand')
                    , row[p.fields.index]);
          step();

        } else {

              async.series([

                  //Transport video asset file to storage provider
                  (step) => deploy.archive_asset({
                                  name: 'video'
                                , file: deploy.video_file
                                , step: step}),

                  //Transport poster to storage provider
                  (step) => deploy.archive_asset({
                                  name: 'poster'
                                , file: deploy.poster_file
                                , step: step}),

                  (step) => deploy.archive_asset({
                                  name: 'preview'
                                , file: deploy.preview_file
                                , step: step}),

                  (step) => {

                    if (p.video.service) {

                      switch (config.params.video.service) {
                        case enums.video.services.VIMEO         : vmo.video.create(gsheet.row, step);    break;
                        case enums.video.services.JWPLATFORM    : jw.video.create(gsheet.row, step);     break;
                        default                                 : log.error(enums.errors.absent_stream_service);
                      }

                    } else {

                      step();

                    }

                  },

                  function (step) {

                    //update the single row with all relevant data
                    if (config.detect_datasource(p.data.url) === enums.data.types.GOOGLE) {
                      gsheet.update_single_row(step)
                    } else {
                      dcQ.update_job(step)
                    }

                  }

                ], function(err) {

                    if (config.detect_datasource(p.data.url) === enums.data.types.GOOGLE) {
                      
                      log.info("\n\t\t%s\tWrote to Row [ %s ] in Worksheet [ %s ]"
                              , emoji.get('pencil2')
                              , row[p.fields.index]
                              , gsheet.worksheet.title);  

                    } else {

                      log.info("\n\t\t%s\tSaved distribution details for job [ %s ] details"
                              , emoji.get('cd')
                              , config.params.data.key);

                    }
                    
                    step();
              })

          }
        
      }

    ], function(err) {

      if (err) {
        log.error(err);
        throw err;
      }

      if (config.detect_datasource(p.data.url) === enums.data.types.GOOGLE) {

        log.info("\n\t[ COMPLETE ]\n\n\t\t%s\tDone processing row with [ %s ] key of [ %s ]"
              , emoji.get('thumbsup')
              , config.params.fields.index
              , gsheet.row[p.fields.index]);
      
      } else {

        log.info("\n\t[ COMPLETE ]\n\n\t\t%s\tDone processing job with key [ %s ]"
              , emoji.get('thumbsup')
              , config.params.data.key);

      }

      step();

    })

  },

  archive_asset : function(options) {

    //if the file exists
    if (fs.existsSync(options.file)) {

      let file_data = fs.readFileSync(options.file);

      if (!file_data) { 
        log.error(err);
        throw err; 
      }

      let base64data = new Buffer(file_data, 'binary');

      //invoke the AWS S3 actions if the storage type is S3
      if (config.params.storage.type == enums.storage.types.S3) {

        log.info("\n\t\t%s\tSending [ %s ] to Amazon S3 ..."
                 , emoji.get('rocket')
                 , path.parse(options.file).base);

        aws.asset = options.file;
        aws.put_obj(base64data, options.step);
        aws.S3_URL[options.name] = aws.download_url(options.file);

      }

    } else {

      log.error("\n\t\t%s\tCould not find file [ %s ].  Skipping archival process."
                , emoji.get('x')
                , options.file);

      step();

    }
    

  } 

}

module.exports = deploy;