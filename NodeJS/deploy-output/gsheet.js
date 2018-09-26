var log               = require('./logger'),
    enums             = require('./constants'),
    stream            = require('./stream'),
    async             = require('async'),
    URL               = require('url'),
    emoji             = require('node-emoji'),
    path              = require('path'),
    GoogleSpreadsheet = require('google-spreadsheet'),
    Q                 = require('q'),
    config            = require('./config'),
    pad               = require('pad'),
    jw                = require('./jwplatform'),
    vmo               = require('./vimeo'),
    aws               = require('./aws');

var gsheet = {

  doc       :  null,

  worksheet :  {},

  row : {},

  parse_key : function(uri) {

    return uri.substring(uri.indexOf("/d/") + 3, uri.length);

  },

  auth      :  function(step) {
      var creds = require(config.params.auth.google.creds);
          gsheet.doc.useServiceAccountAuth(creds, step);
  },  

  store_url : function(step) {

    var p = config.params;

      gsheet.worksheet.getCells({
         'min-row' : gsheet.row.row_idx
        ,'max-row' : gsheet.row.row_idx 
        ,'min-col' : p.fields.download.pos
        ,'max-col' : p.fields.download.pos
        ,'return-empty' : true
      }, function(err, cells){

        var dl_link = null,
            c       = cells[0];

        if (p.storage.type == enums.storage.types.S3) {

          var dl_link  = 'https://' + (enums.aws.regions[p.storage.region]).endpoint + '/' + p.storage.bucket + '/' + p.storage.folder + '/' + path.parse(aws.asset).base;
          log.info("\n\t\t%s\tDownload @ %s"
                  , emoji.get('floppy_disk')
                  , dl_link);
            
        } else {

          dl_link = "Unavailable";

        }
            
        gsheet.row.s3_url = dl_link;

        c.setValue(dl_link, step);
        
      });

  },

  select_sheet : function(step) {

    gsheet.doc.getInfo(function(err, info) {

            var sheet;

            log.info("\t\t" + pad('Google Document',25) + ' : [ ' + info.title + ' ] by ' + info.author.email);
            
            if (!config.params.data.collection) {
              log.error(enums.errors.absent_collection);
              throw new Error(enums.errors.absent_collection);
            }

            for (var i=0; i < info.worksheets.length; i++) {

              if (info.worksheets[i].title == config.params.data.collection) {
                sheet = info.worksheets[i];
                break;  
              }
              
            }
            
            log.info("\t\t" + pad('Worksheet', 25) + ' : [ ' + sheet.title + ' ] | ' + sheet.rowCount + ' Rows, ' + sheet.colCount + ' Columns');
            
            gsheet.worksheet = sheet;

            step();

    });

  },

  column_to_letter : function(col) {

    var temp, letter = '';

    while (col > 0)
    {
      temp = (col - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      col = (col - temp - 1) / 26;
    }

    return letter;

  },

  store_stream_key : function(step) {

    gsheet.worksheet.getCells({
       'min-row' : gsheet.row.row_idx
      ,'max-row' : gsheet.row.row_idx
      ,'min-col' : config.params.fields.stream.pos
      ,'max-col' : config.params.fields.stream.pos
      ,'return-empty' : true
    }, (err, cells) => {

          async.series([

              function(step) {

                switch (config.params.video.service) {
                  case enums.video.services.VIMEO : vmo.video.create(gsheet.row, step); break;
                  case enums.video.services.JW    : jw.video.create(gsheet.row, step ); break;
                  default                         : log.error(enums.errors.absent_stream_service); throw new Error(enums.errors.absent_stream_service);

                }

              },

              function (step) {

                gsheet.worksheet.getCells({
                   'min-row' : gsheet.row.row_idx
                  ,'max-row' : gsheet.row.row_idx
                  ,'min-col' : config.params.fields.stream.pos
                  ,'max-col' : config.params.fields.stream.pos
                  ,'return-empty' : true 
                }, function(err, cells) {
                      
                      var c = cells[0],
                          stream_key = null;

                      c.setValue(stream.key, function(err, results) {

                        gsheet.worksheet.getCells({
                           'min-row' : gsheet.row.row_idx
                          ,'max-row' : gsheet.row.row_idx
                          ,'min-col' : config.params.fields.bcast.pos
                          ,'max-col' : config.params.fields.bcast.pos
                          ,'return-empty' : true
                        }, function(err, cells) {

                          var c = cells[0];

                          c.setValue(enums.stream.status.CREATED, function() {

                            log.info("\n\t\t%s\t[ %s ] stream key [ %s ]"
                                    , emoji.get('key')
                                    , config.params.video.service
                                    , stream.key);

                            log.info("\n\t\t%s\tBroadcast status [ %s ]"
                                    , emoji.get('studio_microphone')
                                    , enums.stream.status.CREATED);
                            
                            log.info("\n\t\t%s\t[ %s ] staged to [ %s ]"
                                    , emoji.get('timer_clock')
                                    , gsheet.row[config.params.fields.output.name]
                                    , config.params.video.service);
                            
                            step();

                          });

                        })
                      
                      });

                });

              }

          ], (err, results) => {

            step();  

          });

    })
  
  },

  print_col : function(col) {
    log.info("\t\t" + pad(("  [ " + col.name + " ]"), 25) + " : " + col.pos + " (" + col.letter + ")");
    return;
  
  },

  get_col_positions : function(step) {

    var deferred = Q.defer();

    gsheet.worksheet.getCells({
      'min-row': 1,
      'max-row': 1,
      'min-col': 1,
      'max-col': gsheet.worksheet.colCount,
      'return-empty': true
    }, function(err, cells) {

      if (err) {
        deferred.reject();
      }

      log.info("\t\t" + pad("Column Positions", 25));

      var f = config.params.fields;

      for (var cell in cells) {

        var c = cells[cell];

        if (f.index && (c.value == f.index.name)) {
          f.index.pos = c.col;
          f.index.letter = gsheet.column_to_letter(c.col);
          gsheet.print_col(f.index);
        }

        if (c.value == f.download.name) {
          f.download.pos    = c.col;
          f.download.letter = gsheet.column_to_letter(c.col);
          gsheet.print_col(f.download);
        }

        if (c.value == f.stream.name) {
          f.stream.pos = c.col;
          f.stream.letter = gsheet.column_to_letter(c.col);
          gsheet.print_col(f.stream);
        }

        if (c.value == f.bcast.name) {
          f.bcast.pos = c.col;
          f.bcast.letter = gsheet.column_to_letter(c.col);
          gsheet.print_col(f.bcast)
        }

        if (c.value == f.embed.name) {
          f.embed.pos = c.col;
          f.embed.letter = gsheet.column_to_letter(c.col);
          gsheet.print_col(f.embed);
        }

        if (c.value == f.preview.name) {
          f.preview.pos = c.col;
          f.preview.letter = gsheet.column_to_letter(c.col);
          gsheet.print_col(f.preview);
        }

        if (c.value == f.url.name) {
          f.url.pos = c.col;
          f.url.letter = gsheet.column_to_letter(c.col);
          gsheet.print_col(f.url);
        }

      }

      deferred.resolve();
      step();

    });

    return deferred.promise;
  
  },

  store_embed_script : function(step) {

    //Forumulate the embed script
    var p      = config.params,
        key    = jw.video.key,
        player = config.params.video.preview.player_key

    gsheet.worksheet.getCells({
       'min-row' : gsheet.row.row_idx
      ,'max-row' : gsheet.row.row_idx
      ,'min-col' : config.params.fields.embed.pos
      ,'max-col' : config.params.fields.embed.pos
      ,'return-empty' : true
    }, (err, cells) => {

        if (err) { log.error(err); throw err }
        
        var c = cells[0];

        c.setValue(stream.embed(gsheet.row), step);

    });

  },

  store_bcast_preview : function(step) {

    var p = config.params;

    gsheet.worksheet.getCells({
       'min-row' : gsheet.row.row_idx
      ,'max-row' : gsheet.row.row_idx
      ,'min-col' : config.params.fields.preview.pos
      ,'max-col' : config.params.fields.preview.pos
      ,'return-empty' : true
    }, (err, cells) => {

        if (err) { log.error(err); throw err }
        
        var c = cells[0];

        c.setValue(stream.preview(gsheet.row), step);

    });

  },

  store_stream_url : function(step) {

    var p = config.params;

    gsheet.worksheet.getCells({
       'min-row' : gsheet.row.row_idx
      ,'max-row' : gsheet.row.row_idx
      ,'min-col' : config.params.fields.url.pos
      ,'max-col' : config.params.fields.url.pos
      ,'return-empty' : true
    }, (err, cells) => {

        if (err) { log.error(err); throw err }
        
        var c = cells[0];

        c.setValue(stream.url(), step);

    });

  },

  update_single_row : function(step) {

    var p = config.params;

    gsheet.row[p.fields.download.name ] = aws.S3_download_url || 'Unavailable';
    gsheet.row[p.fields.bcast.name    ] = enums.stream.status.CREATED;
    gsheet.row[p.fields.stream.name   ] = stream.key;
    gsheet.row[p.fields.preview.name  ] = stream.preview(); 
    gsheet.row[p.fields.embed.name    ] = stream.embed();
    gsheet.row[p.fields.url.name      ] = stream.url();
    
    gsheet.row.save(step);

  },

  get : function(step) {

    //BEGIN MAIN ENTRY
    log.info("\n\t[ DATASTORE ]\n");

    async.series([
      
        //Create Google Spreadsheet object
        function (step) {
          gsheet.doc = new GoogleSpreadsheet(gsheet.parse_key(config.params.data.url));
          step();
        },

        //Authorize application to manipulate doc
        gsheet.auth,

        //Select the sheet given a key
        gsheet.select_sheet,

        //Determine position of important columns
        gsheet.get_col_positions

    ], function(err, result) {

      if (err) {
        deferred.reject();
      }

      step();

    });

  }

}

module.exports = gsheet