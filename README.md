# Table of Contents

+ [Event scripts for Templater](#event-scripts-for-templater)
+ [FAQs about event scripts](#faqs-about-event-scripts)
+ [Events broadcast by Templater](#events-broadcast-by-templater)
+ [Registering scripts with events](#registering-scripts-with-events)
  + [Registering shell scripts](#reg-shell-scripts)
  + [Registering ExtendScripts](#reg-extend-scripts)
+ [Using job details in event scripts](#use-details-in-scripts)
  + [Shell scripts using job details](#shell-scripts-job-details)
  + [Pre-defined argument macros](#argument-macros)
  + [Accessing argument values within shell scripts](#accessing-argument-values)
  + [ExtendScripts using job details](#extendscripts-job-details)
+ [Troubleshooting event scripts](#troubleshooting)

<a name="event-scripts-for-templater"></a>
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
<a name="faqs-about-event-scripts"></a>
# FAQs about event scripts

### Why register scripts with Templater events?
**Shell scripts** are useful when you want to seamlessly integrate Templater into your existing application. For example, in a production scenario, you can [merge](https://github.com/dataclay/event-scripts/blob/master/NodeJS/concatenate.js), transcode, or compress Templater's output—all of which can be accomplished calling a command line application like [ffmpeg](https://www.ffmpeg.org) within a script.  You can also automate publishing output to a specific destination like an FTP site, or your [YouTube](https://developers.google.com/youtube/v3/docs/), [Vimeo](https://developer.vimeo.com/api/upload/videos), or [JWPlatform](https://developer.jwplayer.com/jw-platform/reference/v1/#) account.  You could also script notifications for when a batch of renders completes—email, text message, etc.

With **ExtendScripts**, you can manipulate objects within the project file, enabling you to extend Templater's functionality with features that you need and want.  Ultimately, you gain a great deal of flexibility with Templater by having the ability to hook into its processes.

### When should I register scripts with Templater events? 
You should use **shell scripts** when you need to do something with Templater's output or have Templater's functions integrate with an existing automated workflow. You should use **ExtendScripts** when you want to extend Templater’s feature set to meet your business needs or workflow goals.

### What information from Templater can my scripts make use of? 
You can pass information from Templater and After Effects to event scripts. To pass information to **shell scripts**, you append arguments when you register the script with a Templater event.  Read [Pre-defined argument macros](#argument-macros) and [Using job details to event scripts](#use-details-in-scripts) to learn more.

Use [Templater’s ExtendScript API](http://support.dataclay.com/content/how_to/cli/templater_extendscript_api_reference.htm) to pass information to **ExtendScripts**.  Read about [Using job details to event scripts](#use-details-in-scripts) learn more.

### What languages can I write event scripts in? 
You can write **shell scripts** in any language available in your system's environment. You must write **ExtendScripts** using [the ExendScript scripting language](https://www.adobe.com/devnet/scripting/estk.html) and toolkit, and you have the option of using the [Templater ExtendScript API](http://support.dataclay.com/content/how_to/cli/templater_extendscript_api_reference.htm).

### Can I use event scripts with Templater Rig or Pro editions? 
Event scripts are only supported in Templater Bot.

### Do event scripts write to log files? 
**Shell scripts** do not log to a file by default, but from within the script, you can write code to redirect the standard output (stdout) and standard error (stderr) to a log file. Within **ExtendScripts**, use the `$D.log()` method in [Templater’s ExtendScript API](http://support.dataclay.com/content/how_to/cli/templater_extendscript_api_reference.htm) to log messages and errors to Templater’s log files including `templater.log` and `templater.err`.

<a name="events-broadcast-by-templater"></a>
# Events Broadcast by Templater
The following table lists event names and a short description of each event.  See [Templater Events](http://support.dataclay.com/content/concepts/bot/templater_events.htm) in Dataclay's knowledge base for more detailed information

>***Events broadcast by Templater in version 2.7.0 and later***
>
>| Event Name    | Broadcast...                              |
>|:--------------|:------------------------------------------|
>| Before Data   | ...before Templater retrieves data        |
>| After Data    | ...after Templater retrieves data         |
>| Before Batch  | ...before Templater's main iteration loop |
>| After Batch   | ...after Templater's main iteration loop  |
>| Before Job    | ...before processing a single job         |
>| After Job     | ...after processing a single job          |
>| Before Update | ...before updating any layers             |
>| After Update  | ...after updating any layers              |
>| Before Output | ...before rendering any output            |
>| After Output  | ...after rendering any output             |
>| Bot Enabled   | ...when Bot is enabled                    |
>| Bot Disabled  | ...when Bot is disabled                   |

&nbsp;<br/>
The following illustration shows when each event is broadcast in the context of Templater iterative algorithm
&nbsp;<br/>

> ![Templater's iterative re-versioning process flow](http://support.dataclay.com/content/resources/images/templater-reversioning-flow.png)

&nbsp;
<a name="registering-scripts-with-events"></a>
# Registering scripts with events
Register script files or commands to listen for specific events that are broadcast by Templater.  Read below to learn the the methods for [registering Shell Scripts](#reg-shell-scripts) and [for registering ExtendScripts](#reg-extend-scripts) to specific events that Templater broadcasts.
<a name="reg-shell-scripts"></a>
### Registering Shell Scripts
+ [Register shell scripts within the *Templater Preferences* dialog](#reg-shell-scripts-dialog)
+ [Register shell scripts within the CLI options file](#reg-shell-scripts-cli)

<a name="reg-shell-scripts-dialog"></a>
##### Registering shell scripts within the *Templater Preferences* dialog
> 1. In the *Templater Preferences* dialog, in the *Bot Settings* group, click **Setup Shell Commands**.
> 2. In the *Register Shell Scripts with Events* dialog that opens, select a Templater event group to show available events associated with that group.
><br><br>
![Register Shell Scripts with Events dialog ](http://support.dataclay.com/content/resources/images/register-shell-scripts-closed.png)
>
> 3. Select either a Before event or After event. To enable a script to execute when a specific event is broadcast, you must select the event checkbox. If the checkbox is deselected, the script is disabled, and the event field is disabled from editing.
> 4. In the event field, enter the absolute path to the script or a full command.
>  + For a script executable by the operating system, such as a Bash script (macOS) or Batch script (Windows), simply enter the absolute path to the script.
>  + As a shortcut to enter the absolute path to the script, click **Choose script...** and navigate to the location of the script.  The path appears in the event field.
>  + For a script requiring an interpreter such as *node*, *python*, or *php*, use the full command syntax appropriate to the language used to write the script.  For example, for a script created in NodeJS, enter
>  ```
>  node /Users/home/event-scripts/my-node-script.js
>  ```
> ![Append arguments when registering shell scripts](http://support.dataclay.com/content/resources/images/register-shell-scripts-open.png)
>
> 5. If passing arguments to the script is required, do one or more of the following.
>  + For passing explicit values, enter each value, separated by spaces, after the path or command within the event field. The following example, shows how you would pass Integer **512** and String **08-24-2018** as arguments to the registered Windows Batch script `timestamp.bat`.
>  ```
> C:\Users\dev\event-scripts\timestamp.bat 512 '08-24-2018'
>  ```
>  + For passing pre-existing information, select a different item from the Append drop down menu, then click **Append**.  Templater appends a corresponding, pre-existing, argument macro to the contents within the event field.  Refer to the table under [Pre-defined argument macros](#argument-macros) for a listing of all available pre-existing argument macros.  The following example shows how you would pass three pre-existing pieces of information as arguments to the registered NodeJS script `update-job.js`: (1) `$aep` — the path to the currently processed After Effect project file, (2) `$data_uri` — the full URL or absolute path to Templater's connected data source, and (3) `$now` — a timestamp derived from the host machine's internal clock.
>  ```
>  node C:\Users\dev\event-scripts\update-job.js $aep $data_uri $now
>  ```
>  + For passing values from Templater's data source, create custom argument macros by prefixing column names or property keys with the `$` symbol, and append those macros to the script path or full command within the event field.  Learn more about [Pre-defined argument macros](#argument-macros) and [Using job details to event scripts](#use-details-in-scripts) below.  The following example shows how you would pass the values of the `album-name` and `release-date` columns from Templater's connected spreadsheet to the registered Windows Batch script `setup-folder.bat`.
>  ```
>  C:\Users\dev\event-scripts\setup-folder.bat $album-name $release-date
>  ```
> 6. To add additional shell scripts for other Templater events, repeat steps 2 through 6.
> 7. When you are finished adding script information, click **OK**.  The scripts or commands are registered to Templater events.

&nbsp;
<a name="reg-shell-scripts-cli"></a>
##### Registering shell scripts within the CLI options file
> 1. In the [`templater-options.json`](https://github.com/dataclay/cli-tools/blob/master/Windows/templater-options.json) file, in the `bot` object, set the value of a specific event property to the absolute path of an executable script file or enter a full command as you would within a terminal session or command prompt.  The following table shows the event property keys that shell scripts can be registered to.  For detailed descriptions of each event, see [Templater Events](http://support.dataclay.com/content/concepts/bot/templater_events.htm) in Dataclay's knowledge base.
>
>  ***Event property keys for registering _shell scripts_ in Templater 2.7.0 and later***
>
>  | Property in `bot` object    | Event Name    | Broadcast...                           |
>  |:----------------------------|:--------------|:---------------------------------------|
>  | `"pre_cmd_data"`            | Before Data   | ...before data is retrieved            |
>  | `"post_cmd_data"`           | After Data    | ...after data is retrieved             |
>  | `"pre_cmd_batch"`           | Before Batch  | ...before main iteration loop starts   |
>  | `"post_cmd_batch"`          | After Batch   | ...after main iteration loop completes |
>  | `"pre_cmd_job"`             | Before Job    | ...before job processing starts        |
>  | `"post_cmd_job"`            | After Job     | ...after job processing completes      |
>  | `"pre_cmd_update"`          | Before Update | ...before layer updating starts        |
>  | `"post_cmd_update"`         | After Update  | ...after layer updating completes      |
>  | `"pre_cmd_output"`          | Before Output | ...before rendering process starts     |
>  | `"post_cmd_output"`         | After Output  | ...after rendering process completes   |
>  | `"enable_cmd"`              | Bot Enabled   | ...when Bot is enabled                 |
>  | `"shutdown_cmd"`            | Bot Disabled  | ...when Bot is disabled                |
>
> 2. To pass arguments to registered shell scripts in the `templater-options.json` file, do one or more of the following.
>  + For passing explicit values, append each value, separated by spaces, to the script's absolute path or full command. The following example shows how you would pass Integer **512** and String **08-24-2018** as arguments to the registered Windows Batch script `timestamp.bat`.  Note that within the `templater-options.json` file on Windows backslashes and other special characters must be escaped with a backslash.
>  ```
> { 
>    "prefs" : {
>                 "bot" : { "pre_cmd_data" : "C:\\Users\\dev\\event-scripts\\setup-folder.bat 512 '08-24-2018'" }
>              }
>  }
>  ```
>  + For passing pre-existing information to the script, refer to the table under [Pre-defined argument macros](#argument-macros) and append the corresponding arguments to script's absolute path or full command.  Appended argument macros should be separated with spaces. The following example shows how you would pass three pre-existing pieces of information as arguments to the registered NodeJS script `update-job.js`: (1) `$aep` — the path to the currently processed After Effect project file, (2) `$data_uri` — the full URL or absolute path to Templater's connected data source, and (3) `$now` — a timestamp derived from the host machine's internal clock. 
>  ```
> { 
>    "prefs" : {
>                 "bot" : { "post_cmd_job" : "node C:\\Users\\dev\\event-scripts\\update-job.js $aep $data_uri $now" }
>              }
>  }
>  ```
>  + For passing information from Templater's data source, enter a custom argument macro by prefixing a column name or property key with a `$` symbol, and append that macro to the script's absolute path or full command.  See [Using job details to event scripts]() below for more information. The following example shows how you would pass the values of the `album-name` and `release-date` columns from Templater's connected spreadsheet to the registered Windows Batch script `setup-folder.bat`.
>  ```
> { 
>    "prefs" : {
>                 "bot" : { "pre_cmd_batch" : "C:\\Users\\dev\\event-scripts\\setup-folder.bat $album-name $release-date" }
>              }
>  }
>  ```

&nbsp;
<a name="reg-extend-scripts"></a>
### Registering ExtendScripts
+ [Register ExtendScripts within the *Templater Preferences* dialog](#reg-extend-scripts-dialog")
+ [Register ExtendScripts within the CLI options file](#reg-extend-scripts-cli)

<a name="reg-extend-scripts-dialog"></a>
##### Registering ExtendScripts within the *Templater Preferences* dialog
> 1. In the *Templater Preferences* dialog, in the *Bot Settings* group, click **Setup ExtendScripts**.
> 2. In the *Register ExtendScripts with Events* dialog that opens, select a Templater event group to show available events associated with that group.
><br><br>
![Register ExtendScripts with Events dialog ](http://support.dataclay.com/content/resources/images/register-extendscripts.png)
>
> 3. Select either a Before event or After event. To enable a script to execute when a specific event is broadcast, you must select the event checkbox. If the checkbox is deselected, the script is disabled, and the event field is disabled from editing.
> 4. Click **Choose Script...** and select an ExtendScript file that you want to run for that particular event. Alternatively, enter an absolute path to the script into the event field.
> 5. To add additional shell scripts for other Templater events, repeat steps 2 through 4.
> 6. When you are finished adding script information, click **OK**.  The scripts or commands are registered to Templater events.

&nbsp;
<a name="reg-extend-scripts-cli"></a>
##### Registering ExtendScripts within the CLI options file
>In the [`templater-options.json`](https://github.com/dataclay/cli-tools/blob/master/Windows/templater-options.json) file, in the `bot` object, set the value of a specific event property to the absolute path of an ExtendScript file.  The following table shows the event property keys that ExtendScripts can be registered to.  For detailed descriptions of each event, see [Templater Events](http://support.dataclay.com/content/concepts/bot/templater_events.htm) in Dataclay's knowledge base.
>
>The following example shows the `set-workarea.jsx` ExtendScript registered to the *Before Output* event.
>  ```
> { 
>    "prefs" : {
>                 "bot" : { "pre_jsx_output" : "C:\\Users\\dev\\event-scripts\\set-workarea.jsx" }
>              }
>  }
>  ```
>
>***Event property keys for registering _ExtendScripts_ in Templater 2.7.0 and later***
>
>| Property in `bot` object    | Event Name    | Broadcast...                           |
>|:----------------------------|:--------------|:---------------------------------------|
>| `"pre_jsx_data"`            | Before Data   | ...before data is retrieved            |
>| `"post_jsx_data"`           | After Data    | ...after data is retrieved             |
>| `"pre_jsx_batch"`           | Before Batch  | ...before main iteration loop starts   |
>| `"post_jsx_batch"`          | After Batch   | ...after main iteration loop completes |
>| `"pre_jsx_job"`             | Before Job    | ...before job processing starts        |
>| `"post_jsx_job"`            | After Job     | ...after job processing completes      |
>| `"pre_jsx_update"`          | Before Update | ...before layer updating starts        |
>| `"post_jsx_update"`         | After Update  | ...after layer updating completes      |
>| `"pre_jsx_output"`          | Before Output | ...before rendering process starts     |
>| `"post_jsx_output"`         | After Output  | ...after rendering process completes   |
>| `"enable_jsx"`              | Bot Enabled   | ...when Bot is enabled                 |
>| `"shutdown_jsx"`            | Bot Disabled  | ...when Bot is disabled                |



&nbsp;
<a name="use-details-in-scripts"></a>
# Using job details in event scripts

<a name="shell-scripts-job-details"></a>
### Shell scripts using job details
You can pass versioning data to a registered **shell script** by making use of **argument macros**.  An argument macro is essentially a word, prefixed with a `$` symbol that is substituted by another string of text when Templater broadcasts an event. Templater ships with a pre-defined set of argument macros, but you can create your own custom macros.

For example, consider that `C:\compress.bat` is registered with Templater's *After Job* event, and that Templater processed a job with the following versioning data.

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
	
In this case, you can register the following command with Templater's *After Job* event to send the `title` property value, *Create Targeted Video Ads*, to the Batch file as an argument in the following manner.

	C:\compress.bat $title
	
You can also use as many arguments as needed
	
	C:\compress.bat $title $caption-1 $caption-2 $tint
	
Additionally, you can use pre-defined argument macros to pass information about a processed job.  For example, if your script needs the path to the file that After Effects rendered, the job's id, and the path to the processed After Effects file, you can use

	C:\compress.bat $id $out_file $aep

<a name="argument-macros"></a>
### Pre-defined argument macros
Templater ships with a number of pre-defined argument macros that you can pass as arguments into your registered shell scripts.  The following table lists available argument macros for shell scripts.

>**NOTE**<br>
> Some argument macros are not available to scripts registered to specific events and might cause Templater to error.  For example, if you pass the `$id` argument macro into a script registered to the *Before Data* event Templater will log an error.

&nbsp;
>***Pre-defined argument macros available in Templater 2.7.0 and later***
>
>| Argument macro  | Description                                                    |
>|:----------------|:---------------------------------------------------------------|
>| `$log`          | Path to the `templater.log` file                               |
>| `$log_dir`      | Path to where the `templater.log` file exists                  |
>| `$aep`          | Path to the processed template file                            |
>| `$aep_dir`      | Path to where the processed template file exists               |
>| `$sources`      | Path to the footage source directory                           |
>| `$out_dir`      | Path to the output directory                                   |
>| `$data_uri`     | Path or URL to the versioning data                             |
>| `$data_start`   | Start index used in data retrieval                             |
>| `$data_end`     | End index used in data retrieval                               |
>| `$data_batch`   | Path to a JSON file with versioning data for the batch process |
>| `$data_job`     | Path to a JSON file with versioning data for the job process   |
>| `$id`           | Value of the 'id' column or property for the job               |
>| `$idx`          | Ordinal position of the job within the batch                   |
>| `$out_name`     | Name of the job's output                                       |
>| `$out_file`     | Path to the job's output file                                  |
>| `$bot_name`     | Name of the Bot                                                |
>| `$machine_name` | Name of the host machine                                       |
>| `$user_name`    | Name of the user running After Effects                         |
>| `$now`          | Current time as on the machine's clock                         |
>| `$event`        | String identifier of the most recently broadcast event         |

&nbsp;
<a name="accessing-argument-values"></a>
### Accessing argument values within shell scripts
When passing arguments to your registered scripts, your code will need to access their values.  The way you access an argument's value within a script depends on the language you are coding in.  In general, however, you always use the ordinal position of the argument to access its value in the script it is passed to.

##### Accessing arguments in Bash on macOS
Assume the following is registered to an event in Templater: `/Users/me/Dev/upload.sh $aep $data_uri $now $out_file`

>To access the any of the argument values within the `upload.sh` script, use the ordinal position of the argument like with a `$` sign like so:
> 
> ```
> ae_project_file="$1"
> templater_data_source="$2"
> current_timestamp="$3"
> templater_output="$4"
> ```
>
> If you have more than nine arguments in a Bash script, you need to enclose its position number within braces like so
>
> ```
> tenth_arg_val="${10}"
> eleventh_arg_val="${11}"
> twelfth_arg_val="${12}"
> ```

&nbsp;
##### Accessing argument values in Batch Script on Windows
Assume the following is registered to an event in Templater: `C:\Users\me\Dev\upload.bat $aep $data_uri $now $out_file`

> To access any of the argument values within the `upload.bat` script, use the ordinal position of the argument like so:
> 
> ```
> ae_project_file=%1
> templater_data_source=%2
> current_timestamp=%3
> templater_output=%4
> ```

If you have more than nine arguments passed to a Batch script, it becomes more involved to access them.  Refer to [this documentation](https://ss64.com/nt/syntax-args.html) on the topic of passing arguments to Batch scripts.  Using Batch scripts for complex scripting tasks is not recommended.

&nbsp;
##### Access argument value in NodeJS
Assume the following is registered to an event in Templater: `node /Users/me/Dev/upload.js $aep $data_uri $now $out_file`

>To access any of the argument values within the `upload.js` script use the ordinal position of the argument ***plus two*** in the index of `process.argv` array like so:
> 
> ```
> var ae_project_file = process.argv[3],
>     templater_data_source=process.argv[4],
>     current_timestamp=process.argv[5],
>     templater_output=process.argv[6]
> ```

The reason you add one to the argument's position is that the `process.argv` array holds the term `node` in position `0` and the script name `upload.js` in position `1`.  Therefore, it's recommended to use [the minimist pacakge](https://www.npmjs.com/package/minimist) in your own scripts to read arguments.

##### Access argument values in PHP
Assume the following is registered to an even in Templater: `php C:\Users\me\Dev\upload.php $aep $data_uri $now $out_file`

To access any of the argument values within the `upload.php` script use the ordinal position of the argument the index of the `$argv` array like so:
>
> ```
> $ae_project_file = $argv[1]
> $templater_data_source = $argv[2]
> $current_timestamp = $argv[3]
> $templater_output = $argv[4]
> ```
>

&nbsp;
<a name="extendscripts-job-details"></a>
### ExtendScripts using job details
Use the [Templater ExtendScript API](http://support.dataclay.com/content/how_to/cli/templater_extendscript_api_reference.htm) to use job details within ExtendScript code.  When creating a script using the Templater ExtendScript API, use the `$D` object to access and manipulate Templater’s internal memory.  

>**NOTE**<br>
> Some of the `$D` object methods may return unexpected values or errors depending on which event the ExtendScript is registered to.

For example, assume you want to change the target composition's work area for each job that Templater will process in a batch.  You would make use of the `$D.target()` method to access the target composition and manipulate the start and work area.  Follow the steps below to accomplish this:

>1.  Add two columns or properties to your data source named `workarea-start` and `workarea-end`.
>2. In your data source, for each job's `workarea-start` value, enter the frame number where you want the work area in the target composition to begin.  Then, for each job's `workarea-end` value, enter the frame number where you want the work area in the target composition to end.
>3. Create a new ExtendScript file and save it as `adjust-target-workarea.jsx`.
>4. Enter the following code into the `adjust-target-workarea.jsx` file and save it:
>
>  ```
>  var targetComp = $D.target(),
>      comp_fps   = targetComp.frameRate,
>      f_start    = parseInt($D.job.get("workarea-start")),
>      f_end      = parseInt($D.job.get("workarea-end"));
>
>  targetComp.workAreaStart    = (f_start / comp_fps);
>  targetComp.workAreaDuration = (f_end / comp_fps) - targetComp.workAreaStart;
>  ```
>
>5. Register the `adjust-target-workarea.jsx` file with the ***After Update*** event.
>6. Run a batch render job with Templater with rows or objects that have different `workarea-start` and `workarea-end` values.  The output corresponding to each row or object has a different work area.

As another example, you might want to truncate a text string and append it with an ellipsis before it is injected into a dynamic layer.  To do this, follow these steps:

>1. Add a column or property to your data source named `headline`.  Map the `headline` values to a Text Layer within an After Effects composition using the Templater Settings effect.
>2. In your data source, for each job's `headline` value, enter a text string that contains more than ten characters.  You can enter strings less than ten characters long, but these will not be truncated as per the following ExtendScript code.
>3. Create a new ExtendScript file and save it as `truncate-long-string.jsx`.
>4. Enter the following code into the `truncate-long-string.jsx` file and save it:
>
>  ```
>  function truncate(word){
>
>    var truncated_word;
>    var max_characters = 10;
>
>    truncated_word = (word.length > max_characters) ? word.slice(0, max_characters) + '...' : word;
>
>    return truncated_word;
>
>  }
>  
>  $D.job.set("headline", truncate($D.job.get("headline")));
>  ```
>
>5. Register the `truncate-long-string.jsx` file with the ***Before Update*** event.
>6. Using Templater, iterate through a set of rows or objects that have different `headline` values — some shorter than ten characters, and some longer.  Notice that long text strings within the `headline` layer are post-fixed with `...`.

&nbsp;
<a name="troubleshooting"></a>
# Troubleshooting Event Scripts
Use the following suggestions to help you troubleshoot your event scripts if Templater hangs during operation, or if they do not execute as expected.

### Log script output to a file
1. Inside your script file, log output messages to a text file.  The code to log to a file differs depending on the language you are writing your script in.  For example take a look at the following code for various scripting languages:
  + Logging to file `debug.txt` on the user's desktop in a Bash script on macOS:

    ```
    printf "Troubleshooting my event script" >> ~/Desktop/debug.txt
    ```

  + Logging to file `debug.txt` on the user's desktop in a Batch Script on Windows:

    ```
	echo Troubleshooting my event script >> %USERPROFILE%\Desktop\debug.txt
    ```

  + Logging to Templater's own `templater.log` file in ExtendScript:

    ```
    $D.log.msg('EVENT SCRIPT DEBUG', "Troubleshooting my event script");
    ```

2. After Templater finishes its tasks, inspect the log file to see if your script generated expected results.

### Verify the full command line incantation that Templater uses
1.  Open the `templater.log` file and search the text file for the phrases `EVENT SCRIPT ERROR `, `EXEC SHELL SCRIPT`, or the string used in the first parameter of [the `$D.log.msg()` method](http://support.dataclay.com/content/how_to/cli/templater_extendscript_api_reference.htm).  
2.  Locate the log line that shows a statement starting with "Full command line ... ", highlight only the full command line as reported by Templater, and copy it to the system clipboard.
3.  Start a new command line session and paste the full command line at the prompt.  Press enter.
4.  Verify that your script executes as expected.

### Verify permissions of script files
1.  Verify the script file is executable by the user who is running After Effects.  
2.  If the user does not have permission to execute the script file, a user with administrator privileges should set them for the script file.  For example, on macOS, you can enter `chmod u+x myPostJob.sh` to make it executable for the current user.  On Windows, use the "Security" tab in the script file's "Properties" dialog.

