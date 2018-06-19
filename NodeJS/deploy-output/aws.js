var async    = require('async'),
    fs       = require('fs'),
    AWS      = require('aws-sdk'),
    enums    = require('./constants'),
    emoji    = require('node-emoji'),
    config   = require('./config'),
    gsheet   = require('./gsheet'),
    path     = require('path');

//Spawning factories
AWS.config.update({ 
      accessKeyId       : config.params.storage.accessID          //enums.aws.accessKeyId,
    , secretAccessKey   : config.params.storage.secret     //enums.aws.secretAccessKey,
    , signatureVersion  : enums.aws.signatureVersion
});

var utils = {

  put_obj : function(b64, step) {

    var p  = config.params,
        s3 = new AWS.S3();

    if (!(p.storage.accessID)     || 
        !(p.storage.secret) ||
        !(enums.aws.signatureVersion)) {

      console.log("\n\t\t... simulation upload ...")
      step();

    } else {

      s3.putObject({
            Bucket  : p.storage.bucket
          , Key     : (p.storage.folder + "/" + path.parse(video_file).base)
          , Body    : b64
          , ACL     : 'public-read'
        }, (err, data) => {

          if (err) { console.log(err, err.stack) }

          step();

        });

    }

  },

  upload_batch : function(rows, step) {

    console.log("\n\nNow processing " + (rows.length) + " videos...  " + emoji.get('airplane_departure'));

    var p = config.params,
        row_count = (p.batch.start-1);

    async.eachOfSeries(rows, 
      
      function(row, key, step) {

        row_count++;
        row.row_idx = row_count;
        gsheet.row = row;

        console.log("\n\n\t--------------------------------------------------\n\n\t" + emoji.get('eyes') + "\tOpened Row " + row.row_idx + " in Worksheet \"" + gsheet.worksheet.title + "\"");
        video_file = path.resolve(p.batch.assets, (row[p.fields.output.name] + "." + p.video.ext));

        if (row[enums.data.fields.STREAM]) {
          
          console.log("\n\t" + emoji.get('ok_hand') + "\tRow " + row.row_idx + " already has a stream key.  Skipping.");
          step();

        } else {

          console.log("\n\t" + emoji.get('mag_right') + "\tSearching for [ " + row[p.fields.output.name] + "." + p.video.ext + " ]...");
          
          if (fs.existsSync(video_file)) {
              
              console.log("\n\t" + emoji.get('clapper') + "\tSending [ " + path.parse(video_file).base + " ] to Amazon S3...  " + emoji.get('rocket'));

              //read the video file to send to S3
              file_data = fs.readFileSync(video_file)

              if (!file_data) { throw err; }

              var base64data = new Buffer(file_data, 'binary');

              async.series([

                  function(step) {
                    utils.put_obj(base64data, step)
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

            console.log("\n\tCouldn't find [" + path.parse(video_file).base + "] in the file system");

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

      }

    );

  }

}

module.exports = utils;