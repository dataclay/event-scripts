# Event Scripts for Templater

### What are Event Scripts?
A script is a file consisting of commands, written in a scripting language, to be performed by a computer. In the context of Templater, "event scripts" are scripts that are executed when Templater broadcasts an event. These scripts hook into Templater's processes allowing you to extend its automation capability. Templater supports two types of event scripts.

**Shell Scripts** — These scripts allow you to interact with assets such as files and perform tasks like moving or transferring files, sending notifications, updating databases, transcoding output files, and sending emails. You can write shell scripts in any language available in your system's environment. See Using Shell Scripts for more information.

**ExtendScripts** — These scripts allow you to interact with objects within the After Effects project file, such as project assets, compositions, layers, key frames, and effect parameters. You must write these scripts using the ExendScript scripting language and toolkit. See Using ExtendScripts for more information.

&nbsp;
![Templater event with registered scripts](http://support.dataclay.com/content/resources/images/event-legend.png)

 A Shell Script and an ExtendScript can be simultaneously registered to listen for a single event. In this case, the registered Shell Script will always execute before the registered ExtendScript.

&nbsp;
>**NOTE** <br>Templater Bot edition must be installed and activated to make use of event scripts.

&nbsp;
>**WARNING** Possible breaking changes!<br>
As of Templater 2.7 the **"For all commands, use job details as arguments"** preference found in earlier versions is deprecated. If your application currently makes use of that preference, your registered event scripts will fail when you upgrade Templater to version 2.7. _You must now explicitly append arguments to shell scripts if they are necessary_. Verify that you are explicitly passing arguments to your scripts, especially if you are using Templater’s command line interface. In the `templater-options.json` file, you can no longer use the `“job_detail_args”` property inside the `“bot”` object within the `“prefs”` object.

&nbsp;
# FAQs about Event Scripts

### Why register scripts with Templater events?
**Shell scripts** are useful when you want to seamlessly integrate Templater into your existing application. For example, in a production scenario, you can [merge](http://github.com/dataclay/event-scripts/), transcode, or compress Templater's output—all of which can be accomplished calling a command line application like [ffmpeg](https://www.ffmpeg.org) within a script.  You can also automate publishing output to a specific destination like an FTP site, or your [YouTube](https://developers.google.com/youtube/v3/docs/), [Vimeo](https://developer.vimeo.com/api/upload/videos), or [JWPlatform](https://developer.jwplayer.com/jw-platform/reference/v1/#) account.  You could also script notifications for when a batch of renders completes—email, text message, etc.

With **ExtendScripts**, you can manipulate objects within the project file, enabling you to extend Templater's functionality with features that you need and want.  Ultimately, you gain a great deal of flexibility with Templater by having the ability to hook into its processes.

### When should I register scripts with Templater events? 
You should use **shell scripts** when you need to do something with Templater's output or have Templater's functions integrate with an existing automated workflow. You should use **ExtendScripts** when you want to extend Templater’s feature set to meet your business needs or workflow goals.

### What information from Templater can my scripts make use of? 
You can pass information from Templater and After Effects to event scripts. To pass information to **shell scripts**, you append arguments when you register the script with a Templater event. Use [Templater’s ExtendScript API](http://support.dataclay.com/content/how_to/cli/templater_extendscript_api_reference.htm) to pass information to **ExtendScripts**.

### What languages can I write event scripts in? 
You can write shell scripts in any language available in your system's environment. You must write ExtendScripts using [the ExendScript scripting language](https://www.adobe.com/devnet/scripting/estk.html) and toolkit along with the [Templater ExtendScript API](http://support.dataclay.com/content/how_to/cli/templater_extendscript_api_reference.htm).

### Can I use event scripts with Templater Rig or Pro editions? 
Event scripts are only supported in Templater Bot.

### Do event scripts write to log files? 
Shell scripts do not log to a file by default, but from within the script, you can write code to redirect the standard output (stdout) and standard error (stderr) to a log file. Use the $D.log() method in [Templater’s ExtendScript API](http://support.dataclay.com/content/how_to/cli/templater_extendscript_api_reference.htm) to log messages and errors to Templater’s log files including `templater.log` and `templater.err`.

# Events Broadcast by Templater
The following table lists event names and a short description of each event.  See [Templater Events](http://support.dataclay.com/content/concepts/bot/templater_events.htm) in Dataclay's knowledge base for more detailed information

>*Tempalter Events as of Templater version 2.7.0*
>
>| Event Name    | Description                                      |
>|:--------------|:-------------------------------------------------|
>| Before Data   | Broadcast before Templater retrieves data        |
>| After Data    | Broadcast after Templater retrieves data         |
>| Before Batch  | Broadcast before Templater's main iteration loop |
>| After Batch   | Broadcast after Templater's main iteration loop  |
>| Before Job    | Broadcast before processing a single job         |
>| After Job     | Broadcast after processing a single job          |
>| Before Update | Broadcast before updating any layers             |
>| After Update  | Broadcast after updating any layers              |
>| Before Output | Broadcast before rendering any output            |
>| After Output  | Broadcast after rendering any output             |
>| Bot Enabled   | Broadcast when Bot is enabled                    |
>| Bot Disabled  | Broadcast when Bot is disabled                   |



# Registering scripts with events
Register script files or commands to listen for specific events that are broadcast by Templater.  You can do this within the *Templater Preferences* dialog or the `templater-options.json` file if using the command line interface.


### Registering Shell Scripts
##### Registering scripts within the *Templater Preferences* dialog
> 1. In the *Templater Preferences* dialog, in the *Bot Settings* group, click **Setup Shell Commands**.
> 2. In the *Register Shell Scripts with Events* dialog that opens, select a Templater event group to show available events associated with that group.
><br><br>
![Register Shell Scripts with Events dialog ](http://support.dataclay.com/content/resources/images/register-shell-scripts-closed.png)
>
> 3. Select either a Before event or After event. To enable an script to execute when a specific event is broadcast, you must select the event checkbox. If the checkbox is deselected, the script is disabled.
> 4. In the event field, enter the absolute path to the script or a full command.
>  + For a script executable by the operating system, such as a Bash script (macOS) or Batch script (Windows), simply enter the absolute path to the script.
>  + As a shortcut to enter the absolute path to the script, click **Choose script...** and navigate to the location of the script.  The path appears in the event field.
>  + For a script requiring an interpreter such as *node*, *python*, or *php*, use the full command syntax appropriate to the language used to write the script.  For example, for a script created in NodeJS, enter
>  ```
>  node /Users/home/event-scripts/my-node-script.js
>  ```
> ![Append arguments when registering shell scripts](http://support.dataclay.com/content/resources/images/register-shell-scripts-open.png)
>
> 5. If passing arguments to the script is required, do one or more of the following
>  + For passing explicit values, enter each value, separated by spaces, after the path or command within the event field. The following example, shows how you would pass Integer **512** and String **08-24-2018** as arguments to the registered Windows Batch script `timestamp.bat`.
>  ```
> C:\Users\dev\event-scripts\timestamp.bat 512 '08-24-2018'
>  ```
>  + For passing pre-existing information, select a different item from the Append drop down menu, then click **Append**.  Templater appends a corresponding, pre-existing, argument macro to the contents within the event field.  Refer to the table under Argument Macros for a listing of all available pre-existing argument macros.  The following example shows how you would pass three pre-existing pieces of information to a registered NodeJS script `update-job.js`: (1) `$aep` — the path to the currently processed After Effect project file, (2) `$data_uri` — the full URL or absolute path to Templater's connected data source, and (3) `$now` — a timestamp derived from the host machine's internal clock.
>  ```
>  node C:\Users\dev\event-scripts\update-job.js $aep $data_uri $now
>  ```
>  + For passing values from Templater's data source, create custom argument macros by prefixing column names or property keys with the `$` symbol, and append those macros to the script path or full command within the event field.  Learn more about Argument Macros below.  The following example shows how you would pass the values of the `album-name` and `release-date` columns from Templater's connected spreadsheet to the registered Windows Batch script `setup-folder.bat`.
>  ```
>  C:\Users\dev\event-scripts\setup-folder.bat $album-name $release-date
>  ```
> 6. To add additional shell scripts for other Templater events, repeat steps 2 through 6.
> 7. When you are finished adding script information, click **OK**.  The scripts or commands are registered to Templater events.

&nbsp;
##### Registering scripts within the CLI options file
> 1. In the [`templater-options.json`](https://github.com/dataclay/cli-tools/blob/master/Windows/templater-options.json) file, in the `bot` object, set the value of a specific event property to the absolute path of an executable script file or a full command as you would enter it in a terminal session or command prompt.  Refer to the following table of property keys, found within the `bot` object, of which you can register shell scripts or commands.  For detailed descriptions of each event, see [Templater Events](http://support.dataclay.com/content/concepts/bot/templater_events.htm) in Dataclay's knowledge base.
>
>  | Property in `bot` object  |  Description                        |
>  |:----------------------------|:------------------------------------|
>  | `"pre_cmd_data"`            | Before data is retrieved            |
>  | `"post_cmd_data"`           | After data is retrieved             |
>  | `"pre_cmd_batch"`           | Before main iteration loop starts   |
>  | `"post_cmd_batch"`          | After main iteration loop completes |
>  | `"pre_cmd_job"`             | Before job processing starts        |
>  | `"post_cmd_job"`            | After job processing completes      |
>  | `"pre_cmd_update"`          | Before layer updating starts        |
>  | `"post_cmd_update"`         | After layer updating completes      |
>  | `"pre_cmd_output"`          | Before rendering process starts     |
>  | `"post_cmd_output"`         | After rendering process completes   |
>  | `"enable_cmd"`              | When Bot is enabled                 |
>  | `"shutdown_cmd"`            | When Bot is disabled                |
>&nbsp;
> 2. To pass arguments to the registered shell scripts, do one of the following
>  + For passing an explicit values, enter each value, separated by spaces, after the full command in the event field. The following example, shows the Integer **512** and String **08-24-2018** passed as arguments to the `setup-folder.bat` Windows Batch script.
>  ```
> { "bot" : { "pre_cmd_data" : "C:\\Users\dev\event-scripts\\setup-folder.bat 512 '08-24-2018'"} }
>  ```
>  + For passing information from Templater's data source, enter a custom argument macro by prefixing a column name or property key with a `$` symbol, and append that macro to the script path or full command.  See Argument Macros below for more information.
>  ```
>  { "bot" : { "pre_cmd_data" : "C:\\Users\dev\event-scripts\\setup-folder.bat $album-name $release-date"} }
>  ```
>  + For passing pre-existing information to the script, refer to the table under Argument Macros and append that as an argument to the path to the script select a different item from the Append drop down menu.  Click **Append**.  Templater will append a corresponding macro to the entire command in the event field.
>  ```
>  { "bot" : { "pre_cmd_data" : "C:\\Users\dev\event-scripts\\setup-folder.bat $album-name $release-date"} }
>  ```







### Registering ExtendScripts
&nbsp;

&nbsp;
### How to get started with the sample event scripts?

>#### To get started with the Windows or OSX sample scripts, follow these steps:
>
>1.  Clone or download the *event-scripts* repository to a working directory on your local machine.  
>2.  In After Effects, in the *Templater Preferences* panel, in the *Shell commands for bot events* section, use the file selector *...* to choose the file location for a sample event script. For a script that should run after each individual job, input the file location into the *After each job* field. For a script that should run after a batch, input the file location into the *After all jobs* field.  For a script that should run when The Bot has been disabled for some reason, input the file location into the *On disable* field.
>3.  Tick the *For all commands, use job details as arguments* check box to pass job information to the script. Click *OK*.
>4.  You can now render or replicate and ensure that the event script executes as intended.

&nbsp;
>#### To get started with the **NodeJS** example event scripts, follow these steps:
>
>1.  Clone or download the *event-scripts* repository to a working directory on your local machine.  
>2.  In a new terminal or command line session, change into your newly created working directory.
>3.  Enter `npm install` and wait for all dependencies to install into your working directory.
>4.  Change any absolute paths within the sample code to fit your system environment.
>5.  Open the script you want to run and find the complete command line to use for registering with Templater's event.  Copy the command line incantation, and paste it into the appropriate field 
>6.  You can now render or replicate and ensure that the event script executes as intended.

&nbsp;
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
>|:----------------------|:------------|
>| `${data label}`               | The value of the column or property key specified by {data label} for the most recently processed job. For example, the variable `$headline` expands to the value of the `headline` column header for the most recently processed job              |
>| `$aep`               | Path to the processed AE project file            |
>| `$aep_dir`         | Path to the directory containing the processed AE project file           |
>| `$data_job`       | Path to a json formatted text file file containing job's versioning data            |
>| `$id`                  | The value of the job's `id` column or property, if defined           |
>| `$idx`                | The job's ordinal position within a batch; `null` if a batch operation is initiated by The Bot.           |
>| `$out_name`     | The job's devised output name            |
>| `$out_dir`          | Path to the job's output directory |
>| `$out_file`         | Path to the final rendered output if it was rendered successfully; `null` if the target composition was replicated.           |

&nbsp;
> Available arguments for **Post Batch** event script or command
>
>| Argument | Expands To |
>|:----------------------|:------------|
>| `${data label}`    | The first value of the column or property within a batch of jobs specified by {data label}.  For example, `$headline` expands to the first value of the `headline` column in the most recently processed batch of jobs.               |
>| `$aep`                | Path to the processed AE project file           |
>| `$aep_dir`          | Path to the directory containing the processed AE project file            |
>| `$data_batch`    | Path to a json formatted text file file containing versioning data for all jobs within batch           |
>| `$out_dir`           | Path to the job's output directory            |

&nbsp;
> Available arguments for **On Bot Disable** event script or command
>
>| Argument | Expands To |
>|:----------------------|:------------|
>| `$bot_name`      | The name of the Bot as found in the Templater Preferences dialog or the `name` property in the`bot` object in `templater-options.json`          |
>| `$aep`                | Path to the processed AE project file           |
>| `$aep_dir`          | Path to the directory containing the processed AE project file            |

&nbsp;
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

### Log script output to a file
1. Inside your script file, log output messages to a text file.
2. After Templater finishes its tasks, inspect the log file to see if your script generated expected results.

### Verify the full command line incantation that Templater uses
1.  Open the `templater.log` file and search the text file for the phrases `POST JOB SCRIPT`, `POST BATCH SCRIPT`, or `BOT SHUTDOWN` depending on which event script you are troubleshooting.  
2.  Locate the log line that shows a statement starting with "Full command line ... ", highlight only the full command line as reported by Templater, and copy it to the system clipboard.
3.  Start a new command line session and paste the full command line at the prompt.  Press enter.
4.  Verify that your script executes as expected.

### Verify permissions of script files
1.  Verify the script file is executable by the user who is running After Effects.  
2.  If the user does not have permission to execute the script file, a user with administrator privileges should set them for the script file.  For example, on OSX, you can enter `chmod u+x myPostJob.sh` to make it executable for the current user.  On Windows, use the "Security" tab in the script file's "Properties" dialog.

