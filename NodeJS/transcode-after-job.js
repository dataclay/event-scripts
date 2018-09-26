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

Transcode render output from After Effects after a Templater job
completes.

|||||||| Requirements

FFmpeg must be installed on the machine running this code. Point the
code below to the appropriate ffmpeg and ffprobe binaries, then
install the script's dependencies by entering `npm install` in the root
of your working directory for this code repository.

|||||||| Usage

1.  Enter the following command within the "After Job" field of the
    "Register Shell Scripts with Events" dialog that opens when the
    "Setup Shell Commands" button is clicked from within the "Templater
    Preferences"dialog. If using Templater's command line interface, set
    the value of the "post_cmd_job" property key within the
    `templater-options.json` file to the command below:

      node transcode-after-job.js --input $out_file --outdir $out_dir --outname $out_name --dest "C:\final\destination\folder"

2.  Start a batch render operation.  Each output is transcoded according
    to the argument settings or its defaults.

3.  To modify the transcode settings, you can set some argument values. 
    Below is a list of arguments and their defaults

    --vcodec        The type of encoder you want to use
                    Type: String, Default: 'libx264'

    --vbit          The bitrate for the transcoded output
                    Type: Integer, Default: 2048

    --acodec        The audio encoder you want to use
                    Type: String, Default: 'ac3'

    --abit          The bitrate of the audio 
                    Type: String, Default: '128k'

    --file_ext      The file extension to be used for transcoded output
                    Type: String, Default: '.mp4'

    --vcontainer    The file format container of transcoded output
                    Type: String, Default: 'mp4'

    --pixformat     The pixel format for the transcoded output. 
                    Type: String, Default: 'yuv420p'
                    
                    For a list of pixel formats, visit the following URL: 
                    https://ffmpeg.org/doxygen/trunk/pixfmt_8h_source.html

    --cleanup       Remove original files after transcode
                    Type: Boolean, Default: true

*/

//Constants
const ffmpeg_win  = "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
      ffprobe_win = "C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe",
      ffmpeg_osx  = "/usr/local/bin/ffmpeg",
      ffprobe_osx = "/usr/local/bin/ffprobe",
      spacer      = 18;;

var winston     = require('winston'),
    moment      = require('moment'),
    os          = require('os'),
    path        = require('path'),
    fs          = require('fs'),
    glob        = require('glob'),
    pad         = require('pad'),
    ffmpeg      = require('fluent-ffmpeg'),
    ffmpeg_prog = require('ffmpeg-on-progress'),
    logln       = require('single-line-log').stdout,
    argv        = require('minimist')(process.argv.slice(2));

var ffmpeg_cmd     = ffmpeg(),
    input_file     = path.resolve(argv.input),
    output         = path.resolve(path.join(argv.outdir, argv.outname)),
    dest_loc       = path.resolve(argv.dest),
    remove_orig    = ((argv.cleanup ? JSON.parse(argv.cleanup) : null) || false    ),
    vcodec         = (argv.vcodec              || 'libx264'),
    vbit           = (parseInt(argv.vbit)      || 2048     ),
    acodec         = (argv.acodec              || 'ac3'    ),
    abit           = (argv.abit                || '128k'   ),
    file_ext       = (argv.file_ext            || '.mp4'   ),
    vcontainer     = (argv.container           || 'mp4'    ),
    pixformat      = (argv.pixformat           || 'yuv420p'),
    input_duration = null,
    output_path    = null
    dest_path      = null;

if (process.platform == 'win32') {
    ffmpeg.setFfmpegPath(ffmpeg_win);
    ffmpeg.setFfprobePath(ffprobe_win);
} else {
    ffmpeg.setFfmpegPath(ffmpeg_osx);
    ffmpeg.setFfprobePath(ffprobe_osx);
}

const { createLogger, format, transports } = require('winston');
const log = winston.createLogger({

  format : format.combine(
    format.splat(),
    format.simple(),
    format.printf(info => `${info.message}`)
  ),

  transports : [
    new winston.transports.Console(),
    new winston.transports.File({ filename : `${__dirname}/transcode_out.log`, level : 'info'  }),
    new winston.transports.File({ filename : `${__dirname}/transcode_err.log`, level : 'error' })
  ]

})

const log_progress = (progress, event) => {

  var prog_msg  = '\n\t'   + pad("Target Size" ,spacer)     + '=>\t' + (event.targetSize/1000) + ' MB';
      prog_msg += '\n\n\t' + pad("Input Frame",spacer)      + '=>\t' + (event.frames);
      prog_msg += '\n\n\t' + pad("Percent Complete",spacer) + '=>\t' + (progress * 100).toFixed() + '%\n';
  
  logln(prog_msg);
  
}

//console.log("\n\nSetting input file to " + input_file);
log.info("\n----- [ " + moment().format('MMMM Do YYYY, h:mm:ss A') + " ] ------------------------- " + "\n")
log.info("\n\t" + pad("Input File",spacer) + "=>\t" + input_file);

ffmpeg_cmd.input(input_file);

//FFmpeg parameters
ffmpeg_cmd.videoBitrate(vbit)
          // set target codec
          .videoCodec(vcodec)
          // set audio bitrate
          .audioBitrate(abit)
          // set audio codec
          .audioCodec(acodec)
          // set pixel format
          .outputOption('-pix_fmt ' + pixformat)
          // set output format to force
          .outputFormat(vcontainer)
          // save to output
          .save(output + file_ext);

ffmpeg_cmd.on('start', (command) => {

  ffmpeg.ffprobe(input_file, function(err, metadata) {

      if (err) {
        log.error(err.message)
        process.exit(0);
      }

      input_duration = metadata.format.duration * 1000;
      log.info("\n\t" + pad("Input Runtime",spacer)     + "=>\t" + (input_duration/1000) + " seconds");
      log.info("\n\t" + pad("Transcode Command",spacer) + "=>\t" + command);

  });

});

ffmpeg_cmd.on('error', (err, stdout, stderr) => {
  if (err) {
    log.error("\n\t" + pad("Error",spacer) + "=>\t" + err.message);
  }
});

ffmpeg_cmd.on('progress', ffmpeg_prog(log_progress, input_duration));

ffmpeg_cmd.on('end', (stdout, err) => {

    output_path = output + file_ext;
    dest_path   = path.resolve(dest_loc, (argv.outname + file_ext));

    log.info("\n\t" + pad("Transcoded Output",spacer) + "=>\t" + output_path);

    if (output_path !== dest_path) {

      if (!fs.existsSync(dest_loc)) fs.mkdirSync(dest_loc);

      fs.copyFile(output_path, dest_path, (err) => {
      
        if (err) {
          log.error("\n\tAn error ocurred when moving the output file to final destination.");
          throw err;
        } else {

          log.info("\n\t" + pad("Saved Destination",spacer) + "=>\t" + dest_path);
        
          if (remove_orig) {
          
            fs.unlink(input_file, (err) => {
              if (err) {
                log.error(err);
                throw err;
              } 
              log.info("\n\t" + pad("Deleted Input",spacer) + "=>\t" + input_file);  
            });

            fs.unlink(output_path, (err) => {
              if (err) {
                log.error(err)
                throw err;
              }
              log.info("\n\t" + pad("Deleted Output",spacer) + "=>\t" + output_path);
            });

          }
          
        }
        
      });

    } else {

      if (remove_orig) {

        fs.unlink(input_file, (err) => {
          if (err) {
            log.error(err);
            throw err;
          } 
          log.info("\n\t" + pad("Deleted Input",spacer) + "=>\t" + input_file);  
        });

      }

    } 

});