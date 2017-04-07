# Event Scripts for Templater

#### What are Event Scripts?
Event scripts are scripts that are listening for events that Templater broadcasts while it executes.  These scripts, or any command for that matter, "hook" into Templater's processes allowing you to extend its automation capability.  This repository contains sample scripts intended to be executed when Templater broadcasts specific events.
>**NOTE** </br>Templater Bot must be installed and activated to make use of event scripts.

</br>
#### Why use them?

Use event scripts when you want to seamlessly integrate Templater into your existing application.  For example, in a production scenario, you can [merge](http://github.com/dataclay/event-scripts/), transcode, or compress Templater's output—all of which can be accomplished calling a command line application like [ffmpeg](https://www.ffmpeg.org) within a script.  You can also automate publishing output to a specific destination like an FTP site, or your [YouTube](https://developers.google.com/youtube/v3/docs/), [Vimeo](https://developer.vimeo.com/api/upload/videos), or [JWPlatform](https://developer.jwplayer.com/jw-platform/reference/v1/#) account.  In addition you can send out various notifications when a batch of renders completes—email, text message, etc.  Ultimately, you gain a great deal of flexibility with Templater by having the ability to hook into its processes.

</br>
#### How do I use event scripts?
Register script files or commands to listen for specific events that are broadcast by Templater.  You can do this within the `Templater Preferences` dialog or the `templater-options.json` file if using the command line interface.

</br>
>###### Registering scripts within the preferences dialog
Find three fields under the `Bot Settings` group listed under the title `Shell command for bot events`.  Click the `...` button to open a file picker and choose a file that you want to run for that particular event, or simply type an absolute path to the script.  Alternatively, you can input any command as you would if you were in a terminal session.

>![Register scripts in Templater Preferences dialog](http://dataclay.com/images/screenshots/event-scripts-prefs.png)

<br>
>###### Registering scripts within the [`templater-options.json`](https://github.com/dataclay/cli-tools/blob/master/Windows/templater-options.json) file
Set the `post_cmd_job`, `post_cmd_batch`, and `shutdown_cmd` properties within the `bot` object to the absolute path of the file you want to run for that particular event.  Alternatively, you can input any command line incantation as you would if you were in a terminal session.

>![Register scripts in templater-options.json](http://dataclay.com/images/screenshots/event-scripts-opts.png)

</br>
#### Which events does Templater broadcast?
The following table lists event names and when they are broadcast

>Events as of Templater version 2.0.0
>
>| Event Name                 |             Broadcast when...              |
|:--------------------------------|:-------------------------------------|
| Post Job                        | After Effects completes rendering a queue item that was added by Templater, or Templater completes a single replication of a target composition. |
| Post Batch                     | After Effects completes rendering a batch of queue items added by Templater, or Templater completes a batch replication process. |
| On Bot Disable              | The Bot is disabled for any reason other than a hard crash.  |
>

</br>
#### How to get started with the sample event scripts?

To get started with the Windows or OSX sample scripts, follow these steps:

1.  Clone or download the *event-scripts* repository to a working directory on your local machine.  
2.  In After Effects, in the *Templater Preferences* panel, in the *Shell commands for bot events* section, use the file selector *...* to choose the file location for a sample event script. For a script that should run after each individual job, input the file location into the *After each job* field. For a script that should run after a batch, input the file location into the *After all jobs* field.  For a script that should run when The Bot has been disabled for some reason, input the file location into the *On disable* field.
3.  Tick the *For all commands, use job details as arguments* check box to pass job information to the script. Click *OK*.
4.  You can now render or replicate and ensure that the event script executes as intended.

To get started with the **NodeJS** example event scripts, follow these steps:

1.  Clone or download the *event-scripts* repository to a working directory on your local machine.  
2.  In a new terminal or command line session, change into your newly created working directory.
3.  Enter `npm install` and wait for all dependencies to install into your working directory.
4.  Change any absolute paths within the sample code to fit your system environment.
5.  Open the script you want to run and find the complete command line to use for registering with Templater's event.  Copy the command line incantation, and paste it into the appropriate field 
6.  You can now render or replicate and ensure that the event script executes as intended.

</br>
## Passing job details to event scripts
When Templater broadcasts events, you can pass versioning data to a registered event script or command by using variables with names prefixed with the dollar symbol `$`.  

For example, consider that `C:\compress.bat` is registered with Templater's Post Job event, and that Templater processed a job with the following versioning data.

	[
		{
			"ID": "json_target",
			"title": "Create Targeted Video Ads",
			"caption-1": "Deliver sets of renders",
			"caption-2": "for agencies",
			"album-cover": "yes-oceans.jpg",
			"disc-face": "discs/yes-oceans.png",
			"tint": "2D3A1D"
		}
	]
	
In this case, you can register the following command with Templater's Post Job event to send the `title` property value, *Create Targeted Video Ads*, to the Batch file as an argument in the following manner.

	C:\compress.bat $title
	
You can also use as many arguments as needed
	
	C:\compress.bat $title $caption-1 $caption-2 $tint
	
Additionally, you can use predefined variables to pass information about a processed job.  For example, if your script needs the path to the file that After Effects rendered, the job's id, and the path to the processed After Effects file, you can use

	C:\compress.bat $id $out_file $aep
	
The following lists show variables that can be used as arguments for your event scripts or commands.

> Available arguments for **Post Job** event script or command
>
>| Argument | Expands To |
|:----------------------|:------------|
| `${data label}`               | The value of the column or property key specified by {data label} for the most recently processed job. For example, the variable `$headline` expands to the value of the `headline` column header for the most recently processed job              |
| `$aep`               | Path to the processed AE project file            |
| `$aep_dir`         | Path to the directory containing the processed AE project file           |
| `$data_job`       | Path to a json formatted text file file containing job's versioning data            |
| `$id`                  | The value of the job's `id` column or property, if defined           |
| `$idx`                | The job's ordinal position within a batch; `null` if a batch operation is initiated by The Bot.           |
| `$out_name`     | The job's devised output name            |
| `$out_dir`          | Path to the job's output directory |
| `$out_file`         | Path to the final rendered output if it was rendered successfully; `null` if the target composition was replicated.           |

</br>
> Available arguments for **Post Batch** event script or command
>
>| Argument | Expands To |
|:----------------------|:------------|
| `${data label}`    | The first value of the column or property within a batch of jobs specified by {data label}.  For example, `$headline` expands to the first value of the `headline` column in the most recently processed batch of jobs.               |
| `$aep`                | Path to the processed AE project file           |
| `$aep_dir`          | Path to the directory containing the processed AE project file            |
| `$data_batch`    | Path to a json formatted text file file containing versioning data for all jobs within batch           |
| `$out_dir`           | Path to the job's output directory            |

</br>
> Available arguments for **On Bot Disable** event script or command
>
>| Argument | Expands To |
|:----------------------|:------------|
| `$bot_name`      | The name of the Bot as found in the Templater Preferences dialog or the `name` property in the`bot` object in `templater-options.json`          |
| `$aep`                | Path to the processed AE project file           |
| `$aep_dir`          | Path to the directory containing the processed AE project file            |

</br>
You can register any command line incantation as if you were entering it in a terminal session like so

	node C:\dev\event-scripts-master\OSX\concatenate.js $aep $out_dir $id $title

In the above example, `concatenate.js` will be executed via the `node` interpreter when the Post Batch event is broadcast, and it will have access to the values of the arguments.

If you choose to register a script file to listen to an event without appending any arguments, you can easily send all available, predefined variables by enabling the *For all commands, use job details as arguments* checkbox within the Templater Preferences dialog, or by setting the `job_details_args` property key in the `templater-options.json` file to `true`.  For example, if `C:\compress.bat` is registered with the Post Job event, then checking the the *For all commands, use job details as arguments* checkbox effectively appends the predefined variables as arguments in the following order:

	C:\compress.bat $id $rowidx $out_name $out_file $out_dir $aep $aep_dir $data_job

Here is the order of the arguments for the **Post Batch** event:

	C:\concatenate.bat $data_batch $aep $aep_dir $out_dir
	
Here is the order of the arguments for the **On Bot Disable** event:

	C:\notify.bat $bot_name $aep $aep_dir

## Troubleshooting Event Scripts
Use the following suggestions to help you troubleshoot your event scripts if they do not execute as expected.  

#### Log script output to a file
1. Inside your script file, log output messages to a text file.
2. After Templater finishes its tasks, inspect the log file to see if your script generated expected results.

#### Verify the full command line incantation that Templater uses
1.  Open the `templater.log` file and search the text file for the phrases `POST JOB SCRIPT`, `POST BATCH SCRIPT`, or `BOT SHUTDOWN` depending on which event script you are troubleshooting.  
2.  Locate the log line that shows a statement starting with "Full command line ... ", highlight only the full command line as reported by Templater, and copy it to the system clipboard.
3.  Start a new command line session and paste the full command line at the prompt.  Press enter.
4.  Verify that your script executes as expected.

#### Verify permissions of script files
1.  Verify the script file is executable by the user who is running After Effects.  
2.  If the user does not have permission to execute the script file, a user with administrator privileges should set them for the script file.  For example, on OSX, you can enter `chmod u+x myPostJob.sh` to make it executable for the current user.  On Windows, use the "Security" tab in the script file's "Properties" dialog.

