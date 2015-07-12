#
# Sample bash script for Post-Batch Bot Event
#   If you enable 'For all commands, use job details as arguments'
#   some details about the just-finished batch will be appended to the
#   command as arguments.
#
#   Argument order is as follows for render operations after each job completes
#       $1 => Absolute path to that JSON file containing jobs in most recently completed batch.
#       $2 => Absolute path to the processed AE proejct file.
#       $3 => Absolute path to the folder containing the processed AE project file.
#       $4 => Absolute path to the root of the specified output location.
#
#   Provided for your personal or commercial use by Dataclay, LLC.

log="$3/post-batch.log"
echo "-------- [TEMPLATER BATCH] --------" >> "$log"
echo "" >> "$log"
echo "    Batch completed on $(date)" >> "$log"
echo "" >> "$log"
echo "    Batch details as JSON are found at "$1 >> "$log"
echo "" >> "$log"
echo "    Output files in batch operation exist in "$4 >> "$log"
echo "" >> "$log"
