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
  
    --outname         The name of the output asset that ffmpeg creates
                      Type: String, Default: null
  
    --outdir          A path to where ffmpeg should store its output
                      Type: String, Default: null
  
    --dest            A path to a directory to archive ffmpeg's output
                      Type: String, Default: null
  
    --vcodec          The type of encoder you want to use
                      Type: String, Default: 'libx264'
  
    --vbit            The bitrate for the transcoded output
                      Type: Integer, Default: 2048

    --dimensions      The spatial resolution of the output
                      Type: String, Default: undefined
  
    --acodec          The audio encoder you want to use
                      Type: String, Default: 'ac3'
  
    --abit            The bitrate of the audio 
                      Type: String, Default: '128k'
  
    --file_ext        The file extension for transcoded output
                      Type: String, Default: '.mp4'
  
    --vcontainer      The file format container of transcoded output
                      Type: String, Default: 'mp4'
  
    --pixformat       The pixel format for the transcoded output. 
                      Type: String, Default: 'yuv420p'
                      
                      For a list of pixel formats, visit: 
                      https://ffmpeg.org/doxygen/trunk/pixfmt_8h_source.html
  
    --cleanup         Remove original files after transcode
                      Type: Boolean, Default: true
  
    --poster          Extracts a frame from ffmpeg's input or output
                      Type: Float, Default: null
  
    --poster_format   The still image type for a poster image
                      Type: String, Default: "png"

    --poster_scale    The spatial resolution of the poster image
                      Type: Integer, Default: Spatial resolution of input

    --poster_quality  The quality level for the poster image. Choice is 0-100
                      Type: Integer, Default: 100
  
    --gif_start       Start time of the input for a preview clip
                      Type: Float, Default: 0

    --gif_duration    The duration of a preview clip.
                      Type: Float, Default: 3

    --gif_fps         The frame rate of the preview clip
                      Type: Integer, Default: 30

    --gif_scale       The extension of the file for the clip
                      Type: Integer, Default: 480

*/

//Constants
const ffmpeg_win       = "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
      ffprobe_win      = "C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe",
      ffmpeg_osx       = "/usr/local/bin/ffmpeg",
      ffprobe_osx      = "/usr/local/bin/ffprobe",
      spacer           = 22,
      file_types       = { 'MOVIE' : 'movie', 'STILL' : 'still', 'SEQUENCE' : 'sequence'};

var   async            = require('async'),
      sprintf          = require('sprintf-js').sprintf,
      chalk            = require('chalk'),
      winston          = require('winston'),
      moment           = require('moment'),
      os               = require('os'),
      path             = require('path'),
      fs               = require('fs'),
      glob             = require('glob'),
      pad              = require('pad'),
      ffmpeg           = require('fluent-ffmpeg'),
      ffmpeg_prog      = require('ffmpeg-on-progress'),
      logln            = require('single-line-log').stdout,
      argv             = require('minimist')(process.argv.slice(2));

var   input_file       = path.resolve(argv.input),
      output           = path.resolve(path.join(argv.outdir, argv.outname)),
      dest_loc         = path.resolve(argv.dest),
      remove_orig      = ((argv.cleanup ? JSON.parse(argv.cleanup) : null) || false    ),
      vcodec           = (argv.vcodec                    || 'libx264' ),
      vbit             = (parseInt(argv.vbit)            || 2048      ),
      acodec           = (argv.acodec                    || 'ac3'     ),
      abit             = (argv.abit                      || '128k'    ),
      file_ext         = (argv.file_ext                  || '.mp4'    ),
      vcontainer       = (argv.container                 || 'mp4'     ),
      pixformat        = (argv.pixformat                 || 'yuv420p' ),
      dimensions       = (argv.dimensions                || undefined ),

      poster_time      = (parseFloat(argv.poster)        || 0         ),
      poster_format    = (argv.poster_format             || 'png'     ),
      poster_quality   = (String(argv.poster_quality)    || '100'     ),
      poster_scale     = (parseInt(argv.poster_scale)    || null      ),

      gif_start        = (argv.gif_start                 || 0         ),
      gif_duration     = (argv.gif_duration              || 3         ),
      gif_fps          = (argv.gif_fps                   || 30        ),
      gif_scale        = (argv.gif_scale                 || 480       );

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


/*
 *
 * Transcode Class
 *
 */

 var transcode = {

  cmd    : ffmpeg(),

  done   : null,

  input  : { 
             path        : null, 
             type        : null,
             duration    : null,
             seq_holders : 0,
             format      : null
           },

  output : { 
             path      : null,
             dest      : null,
             framerate : null
           },

  clip :   {
             path      : null,
             dest      : null,
             start     : null,
             duration  : null
           },

  init : (step) => {

    log.info("\n\n" + chalk.bold.cyan("----- ") + chalk.bold.white("[ ") + chalk.bold.magenta(moment().format('MMMM Do YYYY, h:mm:ss A')) + chalk.bold.white(" ]") + chalk.bold.cyan(" ------------------------- ") + "\n")

    // if (!fs.existsSync(input_file)) {      
    //   var err_msg = chalk.bold.white(pad("\n\tInput File Error",spacer) + "=>\t") + chalk.green("[ " + chalk.bold.green("%s") + " ] does not exist in the file system.");       
    //   log.error(err_msg , path.parse(input_file).base);
    // }

    var input_props = utils.inspect_file(input_file);

    transcode.input.path        = input_props.path;
    transcode.input.type        = input_props.type;
    transcode.input.seq_holders = input_props.seq_holders;
    transcode.input.ext         = input_props.extension;

    async.series([(next) => {

      ffmpeg.ffprobe(transcode.input.path, (err, metadata) => {
        transcode.input.format = metadata.format.format_name.split(',');
        next();

      });

    }], (err, results) => {

      log.info("\n\t" + chalk.bold.white(pad("Input File",spacer) + "=>\t") + chalk.green(transcode.input.path));

      transcode.output.path = utils.devise_output(transcode, output) + file_ext;
      transcode.output.dest = path.resolve(dest_loc, (utils.devise_output(transcode, argv.outname) + file_ext));
      
      step();

    })


  },

  setup  : (step) => {

      transcode.cmd.input(transcode.input.path)
                   // set target bitrate
                   .videoBitrate(vbit)
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
                   //setup error behavior
                   .on('err', transcode.on_error)
                   //setup start behavior
                   .on('start', transcode.on_start)
                   //setup progress behavior
                   .on('progress',ffmpeg_prog(transcode.progress_readout, transcode.input_duration))
                   //setup completion behavior
                   .on('end', transcode.on_complete)

      if (dimensions)
        transcode.cmd.size(dimensions);
      
      if (transcode.input.type === file_types.SEQUENCE) {
        transcode.cmd.inputOption("-framerate 30");
        transcode.cmd.inputOption("-pattern_type glob");
      }

      step();

  },

  get : (step) => {

      //if a still image, then skip transcoding
      if (transcode.input.type === file_types.STILL) {

        log.info("\n\t" + chalk.bold.white(pad("Skipping Transcode", spacer)) + "=>\t" + chalk.green("Still image needs no transcoding"));
        step();

      } else if (transcode.input.format.includes(vcontainer) &&
                (transcode.input.ext == vcontainer)) {

        log.info("\n\t" + chalk.bold.white(pad("Skipping Transcode", spacer)) + "=>\t" + chalk.green("Transcode format is same as input format.  No need to transcode."));
        step();

      } else {

        transcode.done = step;
        transcode.cmd.save(transcode.output.path);

      }

  },

  on_start : (cmd) => {

      
      if (transcode.input.type === file_types.MOVIE ) {

        ffmpeg.ffprobe(transcode.input.path, function(err, metadata) {

            if (err) {
              log.error(err.message)
              process.exit(0);
            }

            transcode.input.duration = metadata.format.duration * 1000;
            log.info("\n\t" + chalk.bold.white(pad("Input Runtime",spacer)        + "=>\t") + chalk.green((transcode.input.duration/1000) + " seconds"));
            log.info("\n\t" + chalk.bold.white(pad("Transcode Command",spacer)    + "=>\t") + chalk.green(cmd));
            log.info("\n\t" + chalk.bold.white(pad("Initiating Transcode",spacer) + "=>\t") + chalk.green("Please wait..."));

        });

      } else {

        log.info("\n\t" + chalk.bold.white(pad("Transcode Sequence",spacer) + "=>\t") + chalk.green(cmd))

      } 

  },

  on_error : (err, stdout, stderr) => {

      if (err) log.error("\n\t" + pad("Error", spacer) + "=>\t" + err.message);

  },

  progress_readout : (prog, evt) => {

      var msg  = '\n\t'   + chalk.bold.white(pad("Target Size" ,spacer) + '=>\t')     + chalk.green((evt.targetSize/1000) + ' MB');
          msg += '\n\n\t' + chalk.bold.white(pad("Input Frame" ,spacer) + '=>\t')     + chalk.green(evt.frames);
          msg += '\n\n\t' + chalk.bold.white(pad("Percent Complete",spacer) + '=>\t') + chalk.green((prog * 100).toFixed() + '%\n');  //This doesn't work and I'm removing it.
      
      logln(msg);

  },

  on_complete   : (stdout, err) => {

      log.info("\n\t" + chalk.bold.white(pad("Transcoded Output",spacer) + "=>\t")    + chalk.green(transcode.output.path));
      transcode.done();

  },

  archive : (step) => {

      var src_file = null,
          copy_file = null;

      if (transcode.input.type !== file_types.STILL) {

        if (transcode.output.path !== transcode.output.dest) {

          if (!fs.existsSync(dest_loc)) 
            fs.mkdirSync(dest_loc);

          utils.copy(transcode.output.path, transcode.output.dest);

          if (remove_orig) {
            utils.delete(transcode.input.path)
            utils.delete(transcode.output.path);
          }

        } else {

          if (remove_orig) utils.delete(transcode.input.path);

        }

      }

      step();

  }

};


/*
 * 
 * Poster frame extraction
 *
 */

var poster = {

  cmd           : ffmpeg(),

  done          : null,

  input         : null,

  output        : null,

  output_dest   : null,

  init : (step) => {

    log.info("\n\t" + chalk.bold.white(pad("Poster Frame",spacer) + "=>\t") + chalk.green("%s")
      , poster_time);

    poster.input        = (transcode.input.type === file_types.SEQUENCE) ? transcode.output.path : transcode.input.path;
    
    if (transcode.input.type === file_types.STILL) {

      poster.output       = transcode.input.path;
      poster.output_dest  = path.resolve(dest_loc, path.parse(utils.devise_output(transcode, output)).base + "." + transcode.input.ext);

    } else {

      poster.output       = utils.devise_output(transcode, output) + '.' + poster_format.toLowerCase();
      poster.output_dest  = path.resolve(dest_loc, path.parse(poster.output).base);  

    }
     
    step();

  },

  setup : (step) => {

      poster.cmd.input(poster.input)
                //seek to time
                .seekInput(poster_time)
                //output framecount
                .outputOption('-vframes 1')
                //initialization function
                .on('start', poster.on_start)
                //when extraction ends
                .on('end', poster.on_end);

      //Option to set quality level if poster format is JPG
      if (poster_format.toLowerCase() === "jpg") 
      {

        let qstart      = 2;
        let qend        = 31;
        let input_start = 100;
        let input_end   = 0;

        //if (!poster_quality) poster_quality = 100;

        var quality;

        if (!poster_quality) 
             poster_quality = 100
        else 
             poster_quality = parseInt(poster_quality);

        //calculate value between 2-32 which corresponds to user input 100-0
        //see the following SO question for more information
        //https://stackoverflow.com/questions/10225403/how-can-i-extract-a-good-quality-jpeg-image-from-an-h264-video-file-with-ffmpeg

        quality = qstart + ((qend - qstart) / (input_end - input_start)) * (poster_quality - input_start)

        //console.log("POSTER QUALITY PERCENTAGE => " + poster_quality);
        //console.log("FFMPEG POSTER QSCALE      => " + quality)

        log.info("\n\t" + chalk.bold.white(pad("Poster Quality", spacer)) + "=>\t" + chalk.green(poster_quality));
        log.info("\n\t" + chalk.bold.white(pad("Poster QScale", spacer))  + "=>\t" + chalk.green(quality));

        poster.cmd.outputOption('-qscale:v ' + quality);

      }

      if (poster_scale) {
        poster.cmd.videoFilter('scale=' + poster_scale +  ":-1");
      }
      

      step();
    
  },

  get : (step) => {

      if (transcode.input.type === file_types.STILL) {

        log.info("\n\t" + chalk.bold.white(pad("Skipping Poster", spacer)) + "=>\t" + chalk.green("Still image is already a poster frame."));
        step();

      } else {

        poster.done = step;
        poster.cmd.save(poster.output);

      }

  },

  on_start : (cmd) => {

    log.info("\n\t" + chalk.bold.white(pad("Extract Poster",spacer) + "=>\t") + chalk.green("%s")
            , cmd);

  },

  on_end : (cmd) => {

    poster.done();

  },

  archive : (step) => {

    if (poster.output !== poster.output_dest) {

      utils.copy(poster.output, poster.output_dest);

      if (remove_orig)
        utils.delete(poster.output);

    }

    step();

  } 

}

/*
 * 
 * Preview Clip 
 *
 */

 var clip = {

  cmd           : ffmpeg(),

  done          : null,

  input         : null,

  output        : null,

  output_dest   : null,

  init : (step) => {

    if (!gif_start && !gif_duration) return;

    log.info("\n\t" + chalk.bold.white(pad("GIF Clip Start", spacer) + "=>\t") + chalk.green("%s")
      , gif_start);

    log.info("\n\t" + chalk.bold.white(pad("GIF Clip Duration", spacer) + "=>\t") + chalk.green("%s")
      , gif_duration);

    clip.input = (transcode.input.type === file_types.SEQUENCE) ? transcode.output.path : transcode.input.path;
    
    if (transcode.input.type === file_types.STILL) {

      //clip.output       = clip.prefix + path.resolve(transcode.input.path).base;
      //clip.output_dest  = path.resolve(dest_loc, path.parse(utils.devise_output(transcode, output)).base + "." + transcode.input.ext);
      log.info("\n\t" + chalk.bold.white(pad("Input was a still image, no need to setup a clip.")))

    } else {

      let clip_out_file = path.resolve(path.dirname(output), path.parse(output).base);

      clip.output       = utils.devise_output(transcode, clip_out_file) + '.gif';
      clip.output_dest  = path.resolve(dest_loc, path.parse(clip.output).base);

    }
    
    step();

  },

  setup : (step) => {

    //Get video clip
    clip.cmd.input(clip.input)
            //seek to clip start
            .seekInput(gif_start)
            //set duration of clip
            .outputOption('-t ' + gif_duration)
            //setup filter complex for gif conversion
            .complexFilter('[0:v] fps=' + gif_fps + ',scale=' + gif_scale + ':-1,split [a][b];[a] palettegen [p];[b][p] paletteuse')
            //register start function
            .on('start', clip.on_start)
            //register completion function
            .on('end', clip.on_end)
            //register error function
            .on('err', clip.on_err)

    step();

  },

  on_start : (cmd) => {

    log.info("\n\t" + chalk.bold.white(pad("GIF Clip Extraction",spacer) + "=>\t") + chalk.green("%s")
            , cmd);

  },

  on_end : (cmd) => {

    clip.done();

  },

  on_err : (cmd) => {

    console.log("There was an error extracting a clip");

  },

  get : (step) => {

    if (transcode.input.type === file_types.STILL) {

        log.info("\n\t" + chalk.bold.white(pad("Skipping Clip", spacer)) + "=>\t" + chalk.green("Cannot get a clip from a still image."));
        step();

    } else {

        clip.done = step;
        clip.cmd.save(clip.output);

    }

  },

  archive : (step) => {

    if (clip.output !== clip.output_dest) {

      utils.copy(clip.output, clip.output_dest);

      if (remove_orig) 
        utils.delete(clip.output);

    }

    step();

  }

 }


/*
 * 
 * Re-usable Utilities
 *
 */

var utils = {

  inspect_file : (f) => {

    var props = {},
        f_dir = path.dirname(f),
        f_ext = f.substring(f.lastIndexOf('.')+1, f.length);

    if (path.parse(f).base.indexOf("[#") > -1) {
      
      var glob_query = path.parse(f).base.split("[#")[0],
          glob_files = glob.sync(glob_query + "*", {
                cwd      : f_dir
              , absolute : true
          });

      var placeholder_start = path.parse(f).base.indexOf('['),
          placeholder_end   = path.parse(f).base.indexOf(']');
      
      props.seq_holders = placeholder_end - placeholder_start - 1;

      if (glob_files.length > 1) {

        props.path = path.resolve(f_dir, glob_query + "*." + f_ext);
        props.type = file_types.SEQUENCE;

      } else if (glob_files.length === 1) {

        props.path  = path.resolve(f_dir, glob_files[0]);
        props.type  = file_types.STILL;

      }

    } else {

        props.seq_holders = 0;
        props.path        = f;
        props.type        = file_types.MOVIE;

    }

    props.extension = f_ext;
    props.format      = '';

    //props.format = metadata.format.format_name.split(',');
    return props;

  },

  devise_output : (trans, out) => {

    if (trans.input.type === file_types.SEQUENCE || 
        trans.input.type === file_types.STILL)
    {

      if (out.indexOf('_[#') > -1)
        return (out.split('_[#'))[0];
      else
        return (out.split('[#'))[0];

    } else {

      return out;

    }

  },

  delete : (f) => {  

    
    if (transcode.input.type === file_types.SEQUENCE) {

      glob.sync(f, { absolute : true }).forEach((image) => { fs.unlinkSync(image) });

    } else {

      fs.unlinkSync(f)  

    }
    

    log.info("\n\t" + chalk.bold.white(pad("Deleted",spacer) + "=>\t") + chalk.green(f)
            , path.parse(f).base);
  
  },

  delete_async : (f, callback) => {

    fs.unlinkSync(f, (err) => {

      if (err) {
        log.error(err);
        throw err;
      } 

      log.info("\n\t" + chalk.bold.white(pad("Deleted",spacer) + "=>\t") + chalk.green(f)
                , path.parse(f).base);

      if (callback) callback();

    });

  },

  copy : (f, f_copy) => {

    fs.copyFileSync(f, f_copy);

    log.info("\n\t" + chalk.bold.white(pad("Copied", spacer) + "=>\t") + chalk.green(f_copy)
            , path.parse(f_copy).base);

  },

  copy_async : (f, f_copy, callback) => {

    fs.copyFile(f, f_copy, (err) => {

      if (err) {

          log.error("\n\tAn error ocurred when copying [ %s ] to archive destination."
                    , path.parse(f).base);
          throw err;

        } else {

          log.info("\n\t" + chalk.bold.white(pad("Copied",spacer) + "=>\t") + chalk.green(f_copy)
                  , path.parse(f_copy).base);
          
          if (callback) callback();
          
        }

    })

  }

}


/*
 * 
 * Main Entry 
 *
 */

async.series([
      transcode.init
    , transcode.setup
    , transcode.get
    , poster.init
    , poster.setup
    , poster.get
    , clip.init
    , clip.setup
    , clip.get
    , transcode.archive
    , poster.archive
    , clip.archive
  ], (err) => {

    log.info("\n\t" + chalk.bold.white(pad("Completed",spacer) + "=>\t") + chalk.bold.red("Exiting!"));

    if (err) {
      log.error(err.message);
      throw err;
    }

});
