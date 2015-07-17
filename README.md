# Sample Event Scripts for Templater 2
Events make it easy for you to write shell scripts that can be "hooked" into Templater's processes.  These are some sample scripts that can be executed while Templater runs a batch process.  Pro or Bot features must be available to Templater 2 in order to make use of event scripts.

In a production scenario, you might want to process a rendered video out of AE with [FFmpeg](https://www.ffmpeg.org) and then upload that file to a streaming server.  To do that, you could have Templater execute a script after each job.  You might also want to send out an email after a batch of renders completes.  In that case, you could have Templater execute a script after it processes an entire batch of jobs.  Ultimately, you gain a great deal of flexibility with Templater by having the ability to hook into its processes.

##Using scripts for Bot Events
Inside of Templater's preferences dialog, you will find three fields under the `Bot Settings` group listed under the title `Shell command for bot events`.  Click the `...` button to open a file picker and choose a shell script file that you want to run for that particular event, or simply type an absolute path to the script.  Three event types are supported for version.

* **After each job** Broadcast after each render or replication that AE performs as initiated Templater.
* **After all jobs** Broadcast after a batch of render or replication jobs AE performs as initiated by Templater.
* **On disable** Broadcast when The Bot is disabled for any reason other than a hard crash.

##Passing job details to event scripts

You can pass versioning information to your event scripts by ticking the `For all commands use job details as arguments` checkbox.  Our sample scripts show how the arguments can be used for bash scripts and Batch scripts, but you can use a script written in any language available to your machine's environment.  For example, you could write a python or a NodeJS script and pass information to those as well.  However, it is best practice to simply use a shell script to take in these arguments and call other scripts from that shell script.

Job details get sent to event scripts in a particular order.  The following lists show what details are sent and what position they are in for each type of event.

###After each job
See comment header in the [`post-job.sh`](https://github.com/dataclay/event-scripts/blob/master/OSX/post-job.sh) or [`post-job.bat`](https://github.com/dataclay/event-scripts/blob/master/Windows/post-job.bat) example scripts for more information.

1.  The value of the job's ID column if it has one, `null` if no ID value exists
2.  The row index in the spreadsheet.  This is always `null` if the job was initiated by The Bot
3.  The value of the job's devised output name
4.  The absolute path to the final rendered file if it was rendered, `null` if the target composition was replicated
5.  Absolute path to the processed AE project file
6.  Absolute path to the folder containing the processed AE project file
7.  Absolute path the a JSON file containing all job's column values

###After all jobs
See comment header in the [`post-batch.sh`](https://github.com/dataclay/event-scripts/blob/master/OSX/post-batch.sh) or [`post-batch.bat`](https://github.com/dataclay/event-scripts/blob/master/Windows/post-batch.bat) example scripts for more information.

1. Absolute path to a JSON file containing jobs in most recently completed batch.
2. Absolute path to the processed AE project file
3. Absolute path to the folder containing the processed AE project file
4. Absolute path to the root of the specified output location

###On disable
See comment header in the [`on-bot-disable.sh`](https://github.com/dataclay/event-scripts/blob/master/OSX/on-bot-disable.sh) or [`on-bot-disable.bat`](https://github.com/dataclay/event-scripts/blob/master/Windows/on-bot-disable.bat) for more information.  In this example, you can see how the shell scripts call a php script to send out a mail notification if the Bot becomes disabled.

1. The given name of the Bot as found in Templater's preferences dialog
2. Absolute path to the AE project file being processed at the time of The Bot becoming disabled
3. Absolute path to the folder containing the AE project file being processed