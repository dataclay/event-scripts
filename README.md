# Event Scripts for Templater

#### What are they?
Scripts or terminal commands that "hook" into Templater's processes.  Such scripts and commands allow you to extend automation capabilities of Templater.  This repository contains sample scripts intended to be executed when Templater broadcasts specific events.  
>**NOTE** </br>Templater Bot must be installed and activated to make use of event scripts.

#### Why use them?
Because you want to seamlessly integrate Templater into your application.  For example, in a production scenario, you might want to [merge](http://github.com/dataclay/event-scripts/), transcode, or compress Templater's output—all of which can be accomplished calling a command line application like [ffmpeg](https://www.ffmpeg.org) within a script.  You also might want to automate publishing output to a specific destination like an FTP site, your [YouTube](https://developers.google.com/youtube/v3/docs/), [Vimeo](https://developer.vimeo.com/api/upload/videos), or [JWPlatform](https://developer.jwplayer.com/jw-platform/reference/v1/#) account.  In addition you could send out various notifications when a batch of renders completes—email, text message, etc.  Ultimately, you gain a great deal of flexibility with Templater by having the ability to hook into its processes.

#### How to use them?
By registering script files or commands to listen for specific events that are broadcast by Templater.  You can do this within the `Templater Preferences` dialog, or the `templater-options.json` file if using the command line interface.  

>###### Registering scripts within the preferences dialog
Find three fields under the `Bot Settings` group listed under the title `Shell command for bot events`.  Click the `...` button to open a file picker and choose a file that you want to run for that particular event, or simply type an absolute path to the script.  Alternatively, you can input any command as you would if you were in a terminal session.

>![Register scripts in Templater Preferences dialog](http://dataclay.com/images/screenshots/event-scripts-prefs.png)

<br>
>###### Registering scripts within the cli options file
Set the `post_cmd_job`, `post_cmd_batch`, and `shutdown_cmd` properties within the `bot` object to the absolute path of the file you want to run for that particular event.  Alternatively, you can input any command line incantation as you would if you were in a terminal session.

>![Register scripts in templater-options.json](http://dataclay.com/images/screenshots/event-scripts-opts.png)

#### Which events are broadcast?
The following table lists event names and when they are broadcast

>Events as of Templater version 2.0.0
>
>| Event Name                 |             Broadcast when...              |
|:--------------------------------|:-------------------------------------|
| Post Job                        | After Effects completes rendering a queue item that was added by Templater, or when Templater completes a single replication of a target composition. |
| Post Batch                     | After Effects completes rendering a batch of queue items added by Templater, or when Templater completes a batch replication process. |
| On Bot Disable              | The Bot is disabled for any reason other than a hard crash.  |
>

</br>
## Passing job details to event scripts
When events are broadcast, you can pass versioning data to a registered event script or command by using variables whose names are prefixed with the dollar symbol `$`.  

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
	
In this case, you can register the following command with Templater's Post Job event to send the `title` property value, *Create Targeted Video Ads*, to the Batch file as an argument in the following manner

	C:\compress.bat $title
	
You can also use as many arguments as needed, as shown in the following
	
	C:\compress.bat $title $caption-1 $caption-2 $tint
	
Additionally, you can use pre-defined variables for passing information about the processed job.  For example, if your script needs the path to the file that After Effects rendered, the job's id, and the path to the processed After Effects file, you can use

	C:\compress.bat $id $out_file $aep
	
The following lists shows variables that can be used as arguments for your event scripts or commands.

> Available arguments for **Post Job** event script or command
>
>| Argument | Expands To |
|:----------------------|:------------|
| `${data label}`               | The value of the column or property key specified by {data label} for the currently processed job. For example, the variable `$headline` expands to the value of the `headline` column header for the most recently processed job              |
| `$aep`               | Path to the processed AE project file            |
| `$aep_dir`         | Path to the directory containing the processed AE project file           |
| `$data_job`       | Path to a json formatted text file file containing job's versioning data            |
| `$id`                  | The value of the job's `id` column or property, if defined.           |
| `$idx`                | The job's ordinal position within a batch.  This is `null` if a batch operation is initiated by The Bot           |
| `$out_name`     | The job's devised output name            |
| `$out_dir`          | Path to the job's output directory |
| `$out_file`         | Path to the final rendered output if it was rendered successfully. This is `null` if the target composition was replicated           |

</br>
> Available arguments for **Post Batch** event script or command
>
>| Argument | Expands To |
|:----------------------|:------------|
| `${data label}`    | The first value of the property or column within a batch of jobs specified by {data label}.  For example, `$headline` expands to the first value of the `headline` column in the most recently processed batch of jobs               |
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
Finally, note that you can register any command line incantation just as if you were entering it in a terminal session like so

	node C:\dev\event-scripts-master\OSX\concatenate.js $aep $out_dir $id $title

In the above example, `concatenate.js` will be executed via the `node` interpreter when the Post Job event is broadcast, and will have access to the values of the arguments.

If you choose to register a script file to listen to an event without appending any arguments, you can easily send all available, pre-defined, variables by enabling the *For all commands, use job details as arguments* checkbox within the Templater Preferences dialog, or by setting the `job_details_args` property key in the `templater-options.json` file to `true`.  For example, if `C:\compress.bat` is registered with the Post Job event, then checking the the *For all commands, use job details as arguments* checkbox effectively appends the pre-defined variables as arguments in the following order:

	C:\compress.bat $id $rowidx $out_name $out_file $out_dir $aep $aep_dir $data_job

Here is the order of the arguments for the **Post Batch** event:

	C:\concatenate.bat $data_batch $aep $aep_dir $out_dir
	
And is the order of the arguments for the **On Bot Disable** event:

	C:\notify.bat $bot_name $aep $aep_dir

## Troubleshooting Event Scripts
Use the following suggestions to help you troubleshoot your event scripts if they do not seem to execute.  

#### Verify the full command line incantation that Templater uses
1.  Open the `templater.log` file and search the text file for the phrases `POST JOB SCRIPT`, `POST BATCH SCRIPT`, or `BOT SHUTDOWN` depending on which event script you are troubleshooting.  
2.  Look for the log line that shows a statement starting with "Full command line ... ", highlight only the full command line as reported by Templater, and copy it to the clipboard.
3.  Start a new command line session and paste the full command line at the prompt.  Press enter.
4.  Verify that your script executes as expected.

#### Log script output to a file
1. Inside your script file, send output messages to a text file that will be a log file.
2. After Templater finishes its tasks, inspect that log file to see if your script generated expected results.

#### Verify permissions of script files
1.  Verify the file is executable by the user who is running After Effects.  
2.  If the user does not have permission to execute the file, have a user with administrator privileges  them for the file using OS specific guidelines for adjusting a file's permissions.

