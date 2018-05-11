/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

Concatenate Templater batch output with ffmpeg.
Copyright (c) Dataclay LLC 2016
MIT License

You must enter `npm install` to install all dependency modules used in
this script.  All modules are listed in the package.json file in the
root of this repository.

To use this script.  Make sure to have ffmpeg installed and point to
both the ffmpeg and ffprobe binaries in the code below.  Then, make
sure that the script's dependencies are installed by entering `npm
install` in the root of your working directory.

Enter the following command within the "After all jobs" field found
within the Templater Preferences dialog.  If using the Templater CLI,
enter the following command in the "post_cmd_batch" property found
within the templater-options.json file.

     node /path/to/event-scripts/NodeJS/transcode-after-job.js --input $out_file --outdir $out_dir --outname $out_name

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//Constants
var ffmpeg_win  = "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
    ffprobe_win = "C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe",
    ffmpeg_osx  = "/usr/local/bin/ffmpeg",
    ffprobe_osx = "/usr/local/bin/ffprobe";

//Required Node Modules
var os     = require('os'),
    path   = require('path'),
    fs     = require('fs'),
    glob   = require('glob'),
    ffmpeg = require('fluent-ffmpeg'),
    argv   = require('minimist')(process.argv.slice(2));

var ffmpeg_cmd  = ffmpeg(),
    input_file  = path.resolve(argv.input),
    output      = path.resolve(path.join(argv.outdir, argv.outname));

if (process.platform == 'win32') {
    ffmpeg.setFfmpegPath(ffmpeg_win);
    ffmpeg.setFfprobePath(ffprobe_win);
} else {
    ffmpeg.setFfmpegPath(ffmpeg_osx);
    ffmpeg.setFfprobePath(ffprobe_osx);
}

console.log("\n\nSetting input file to " + input_file);
ffmpeg_cmd.input(input_file);

ffmpeg_cmd.on('start', (command) => {
  console.log('\n\nStarting transcode process:\n\n\t' + command);
});

ffmpeg_cmd.on('error', (err, stdout, stderr) => {
    console.log("\nError: " + err.message);
    console.log(err.stack);
});

ffmpeg_cmd.on('end', (stdout, err) => {
    console.log("\n\nFinal transcoded output");
    console.log("\n\t" + output);
    //possibly delete input to save space.  or run as a service / cron job?
});

ffmpeg_cmd.videoBitrate(8000)
          // set target codec
          .videoCodec('libx264')
          // set audio bitrate
          .audioBitrate('128k')
          // set audio codec
          .audioCodec('ac3')
          // set pixel format
          .outputOption('-pix_fmt yuv420p')
          // set output format to force
          //.format('mp4');
          .save(output);