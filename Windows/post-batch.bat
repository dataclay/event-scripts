:: Sample bash script for Post-Batch Bot Event
::   If you enable 'For all commands, use job details as arguments'
::   some details about the just-finished batch will be appended to the
::   command as arguments.
::
::   Argument order is as follows for render operations after each job completes
::       %1 => Absolute path to that JSON file containing jobs in most recently completed batch.
::       %2 => Absolute path to the processed AE project file.
::       %3 => Absolute path to the folder containing the processed AE project file.
::       %4 => Absolute path to the root of the specified output location
::
::  Provided for your personal or commercial use by Dataclay, LLC

@ECHO ON

SET log=%3\post-batch.log
For /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
For /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)

echo -------- [TEMPLATER BATCH] -------- >> %log%
echo    Batch completed on %mydate% @ %mytime% >> %log%
echo    Batch details as JSON are found in file %1 >> %log%
echo    Output files in batch operation exist in %4 >> %log%
