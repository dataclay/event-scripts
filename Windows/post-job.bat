:: Sample batch script for Post-Job Bot Event
::   If you enable 'For all commands, use job details as arguments'
::   some details about the just-finished job will be appended to the
::   command as arguments.
::
::   Argument order is as follows for render operations after each job completes
::       %1 => The row index in the spreadsheet.  This is always `null` when Bot is enabled.
::       %2 => The value of the job's ID column if it has one, `null` if no ID value.
::       %3 => The value of the job's devised output name.
::       %4 => Absolute path to the final rendered file if it was rendered.
::       %5 => Absolute path to the folder containing the rendered file.
::       %6 => Absolute path to the processed AE project file.
::       %7 => Absolute path to the folder containing the processed AE project file.
::       %8 => Absolute path to a .json file containing all job's column values
::
::   Provided for your personal or commercial use by Dataclay, LLC

@ECHO OFF

SET log=%7\post-job.log
For /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
For /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)

echo -------- [TEMPLATER JOB] -------- >> %log%
echo    Job completed on %mydate% @ %mytime% >> %log%
echo    Rendered job with ID %2 to %4 >> %log%
echo    Job details as JSON are found in file %8 >> %log%
echo( >> %log%
