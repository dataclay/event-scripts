var async    = require('async'),
    fs       = require('fs'),
    aws      = require('./aws'),
    enums    = require('./constants'),
    emoji    = require('node-emoji'),
    config   = require('./config'),
    gsheet   = require('./gsheet'),
    path     = require('path');

var deploy = {

  is_batch   : false,

  video_file : null,

  batch : function(rows, step) {

    console.log("\n\nNow deploying " + (rows.length) + " videos...  " + emoji.get('airplane_departure'));

    var p = config.params,
        row_count = (p.batch.start-1);

    async.eachOfSeries(rows, 
      
      function(row, key, step) {

        row_count++;
        row.row_idx = row_count;
        gsheet.row = row;

        console.log("\n\n\t--------------------------------------------------\n\n\t" + emoji.get('eyes') + "\tOpened Row " + row.row_idx + " in Worksheet \"" + gsheet.worksheet.title + "\"");
        
        deploy.video_file = path.resolve(p.batch.assets, (row[p.fields.output.name] + "." + p.video.ext));
        jw.video.asset = deploy.video_file;

        if (row[enums.data.fields.STREAM]) {
          
          console.log("\n\t" + emoji.get('ok_hand') + "\tRow " + row.row_idx + " already has a stream key.  Skipping.");
          step();

        } else {

          console.log("\n\t" + emoji.get('mag_right') + "\tSearching for [ " + row[p.fields.output.name] + "." + p.video.ext + " ]...");
          
          if (fs.existsSync(deploy.video_file)) {

              //read the video file to send to S3
              file_data = fs.readFileSync(deploy.video_file)

              if (!file_data) { throw err; }

              var base64data = new Buffer(file_data, 'binary');

              async.series([

                  //Transport file to storage provider
                  function(step) {

                    if (config.params.storage.type == enums.storage.types.S3) {

                      console.log("\n\t" + emoji.get('clapper') + "\tSending [ " + path.parse(deploy.video_file).base + " ] to Amazon S3...  " + emoji.get('rocket'));
                      aws.asset = deploy.video_file;
                      aws.put_obj(base64data, step);

                    } else {

                      step();
                      
                    }
                    
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
                  }

              ], function(){
                console.log("\n\t" + emoji.get('pencil2') + "\tWrote to Row " + row.row_idx + " in Worksheet \"" + gsheet.worksheet.title + "\"");
                step();
              });

          } else { //video file doesn't exist

            console.log("\n\tCouldn't find [" + path.parse(deploy.video_file).base + "] in the file system");

          }

        }
          
      },

      function(err){

        if (!err) {
          console.log("\n\n# # # # # # # # # # # # # # # # # # # # # #\n\nDone Processing!  " + emoji.emojify(':thumbsup:  :thumbsup:  :v:') + "\n\n\n");
        } else {
          console.log("\n\nThere was an error during batch upload =>\n\t" + err);
        } 

        step();

      });

  },

  single : function(row, step) {

    console.log("\n\nNow deploying single video...  " + emoji.get('airplane_departure'));

    var p = config.params;

    gsheet.row = row;

    console.log("\n\n\t--------------------------------------------------\n\n\t" + emoji.get('eyes') + "\tOpened row with `"+ p.fields.index +"` key of `" + row[p.fields.index] + "` in Worksheet \"" + gsheet.worksheet.title + "\"");

    async.series([

      function(step) {

        deploy.video_file = path.resolve(p.batch.assets, row[p.fields.output.name] + '.' + p.video.ext);
        jw.video.asset = deploy.video_file;

        if (row[p.fields.stream.name]) {
          
          console.log("\n\t" + emoji.get('ok_hand') + "\tRow with key `" + row[p.fields.index] + "` already has a stream key.  Skipping.");
          step();

        } else {

          console.log("\n\t" + emoji.get('mag_right') + "\tSearching for [ " + row[p.fields.output.name] + "." + p.video.ext + " ]...");

          if (fs.existsSync(deploy.video_file)) {

            //read the video file to send to S3
              file_data = fs.readFileSync(deploy.video_file)

              if (!file_data) { throw err; }

              var base64data = new Buffer(file_data, 'binary');

              async.series([

                  //Transport file to storage provider
                  function(step) {

                      if (config.params.storage.type == enums.storage.types.S3) {
                        console.log("\n\t" + emoji.get('clapper') + "\tSending [ " + path.parse(deploy.video_file).base + " ] to Amazon S3...  " + emoji.get('rocket'));
                        aws.asset = deploy.video_file;
                        aws.put_obj(base64data, step);
                      } else {
                        step();
                      }
                      
                  },

                  function(step) {

                    //send to streaming service.
                    if (config.params.video.service == enums.video.services.JWPLATFORM) {
                      jw.video.create(gsheet.row, step);
                    }

                  },

                  //update the single row with all relevant data
                  gsheet.update_single_row

                ], function(err) {
                    console.log("\n\t" + emoji.get('pencil2') + "\tWrote to Row " + row[p.fields.index] + " in Worksheet \"" + gsheet.worksheet.title + "\"");
                    step();
              })

          } else {

            console.log("\n\tCouldn't find [" + path.parse(deploy.video_file).base + "] in the file system");

          }

        }
        
      }

    ], function(err) {

      if (err) throw err;

      console.log("\n\n# # # # # # # # # # # # # # # # # # # # # #\n\nDone processing row with key `" + gsheet.row[p.fields.index] + "`!   " + emoji.emojify(':thumbsup:  :thumbsup:  :v:') + "\n\n\n");
      step();

    })

  }

}

module.exports = deploy;