# Description

This application references a Templater Bot data source like a Google Sheet and then deploys Templater output video files.  It can send them to a cloud-based storage service like Amazon S3, and also transfer them to a streaming provider.  After it does these tasks, this app writes back information from these services like URLs, and embed codes to the Google Sheet.

# Requirements

You must have Adobe After Effects and Templater Bot installed to use this application.

As of version 1.2.0 this application supports the following vendor services.
  
|Data Source Types    |Cloud Storage     | Video Streaming       |
|:--------------------|:-----------------|:----------------------|
| Google Sheets       | Amazon S3        | JWPlatform or Vimeo   | 

Of course, we want to support more vendor services, so we would never turn down a contribution or pull request from any of you.  If you are so inclined to help with this, please do not hesitate!

## Security & Authorization
As a matter of security, you must obtain the following security credentials from the vendors services above.

1. 📀 **Datastore** <br/>
At the moment, this application only support Google Sheets as a data store.  It will only read from and write to a single worksheet within a Sheet document.
    + **Google Sheets**
  	  + Read more about [Google Services Accounts](https://cloud.google.com/iam/docs/understanding-service-accounts), [Getting Started with Authentication](https://cloud.google.com/docs/authentication/getting-started) and [Setting Up Authentication for Server to Server Production Applications](https://cloud.google.com/docs/authentication/production#auth-cloud-implicit-nodejs)
	  + Create a new project in the [Google Cloud Platform API Console](https://cloud.google.com/) and a Google Service Account email address 
	  + Download the credential file associated with your Google Service Account
	  + Share any Google Sheet document with the Google Service Account email address
      
2. 📡 **Video Streaming Platform**<br/>
As of version 1.2 only two video streaming platforms are supported: Vimeo, and JWPlatform. YouTube will be coming shortly — but feel free to add suppor and issue a pull request 😄.
  +  **Vimeo**
	  + [Register for a user account on Vimeo](https://developer.jwplayer.com/).  A Vimeo Pro account is recommended.
	  + Find your account's API Key and Secret in your Account dashboard, under the "Account" area
	  + Create a video player on JWPlatform, and note the hash id of the player you created.  

  +  **JWPlatform**
	  + [Register for a user account on JWPlatform](https://developer.jwplayer.com/)
	  + Find your account's API Key and Secret in your Account dashboard, under the "Account" area
	  + Create a video player on JWPlatform, and note the hash id of the player you created.

3.  🗄 **Storage Platform**
  + **Amazon Simple Storage Service**
	  + Create and retrieve your Amazon Web Services IAM user *Access Key ID* and *Secret Access Key*
	  + [Install and configure the AWS SDK](https://docs.aws.amazon.com/cli/latest/userguide/installing.html) on any machine that runs this application
	  + Retrieve your AWS [IAM *Access Key ID* and *Secret Access Key*](https://console.aws.amazon.com/iam/)
	  + [Create an S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/create-bucket.html) and a folder that within that buck both of which have write permissions for your IAM user account.

4.  🎖 **Credential Files**<br/>
Fill in or replace the credential files for specific vendor services *if you need them*.  You can find placeholder files in this repository
	+ `google-service-account-creds.json` which can be downloaded from the Google Cloud Platform Console under your Google Service Accounts.
	+ `aws-credentials.json` which you can modify with your AWS IAM *Access Key ID* and *Secret Access Key*
    + `templater-uploader-vimeo.json` which you can modify with the credentials that you can find in your [Vimeo Developer area](http://developer.vimeo.com) of Vimeo's domain.  The values are generated after you create a Vimeo app.
	+ `jwplatform-credentials.json` which you can modify with your JWPlatform account username, API key, and API secret.

## Datastore Setup
5.  **Google Sheet**
	+ Share the Google Sheet document that Templater will be using as a data source with the Google Service Account email address issued to you when you created the Google Services Account on the Google Cloud Platform API console.  The email account might look like the following `my-video-uploader@mycompany.iam.gserviceaccount.com`
	+ Add the following columns to the Google Sheet worksheet that is mapped to the elements within the After Effects template.

		+ `output` — if you don't already have one, create an output column and populate each cell in this column with the name of the file that you want for each specific video.  This application uses the names in these cells when getting the file on disk. *Each value in this column must be unique!*
		+ `s3-link` — the cells under this column store URLs to the assets uploaded to your S3 bucket if you choose to have the assets stored there.  S3 is great for archival purposes even if you choose a video streaming platform.
		+ `broadcast-status` — the cells under this column store the status of the stream on the video streaming platform.  The only value that this application currently inserts into these cells is `created`.
		+ `stream-key` — the cells under this column store a universally unique identification string generated by the streaming platform when a video asset it uploaded to it.
		+ `broadcast-preview` — the cells under this column will store URLs to a screening page.  You may or may not have a screening page setup, so the values in this column may not be accurate.
		+ `embed-script` — the cells under this column will store HTML `<script>` or `<iframe>` element code that allow you to use in any webpage. For this to work on JWPlatform, you will need to get the key code for a player that you created via the JWPlatform dashboard.  Learn [more about players on JWPlatform](https://support.jwplayer.com/articles/jw8-player-builder-reference), and about [embedding with Vimeo](https://help.vimeo.com/hc/en-us/articles/224969968-Embedding-videos-overview).

	+ Add a new worksheet to the Google Sheet document to store global variables that will be referenced from the cells in the columns you just created.  You need at least three cells to store variables for: (1) the screening page domain, (2) the screening page route, and (3) the JWPlatform player key you want to use.  For example, the worksheet might look like the following:

		|		|A                     |B                 | C                   |
		|:------|:---------------------|:-----------------|:--------------------|
		|1		|Preview Domain        |Preview Route     | Player Key          |
		|2		|playback.dataclay.com |video             | qEngXmKl            | 


	+ Take note as to the cell reference for each of the cells above.  For example, you can refer to the *Preview Domain* value in row 2 of a worksheet named `streaming_globals` is the following `streaming_globals!A2`.  You will use these referents in the command line arguments.


# Usage

1.  Clone this repository, and run `npm install` to install all required code dependencies into your working directory.

2.  Type out the command line incantation that will be inserted into Templater's *After Each Job* event registration field.  Save it somewhere in order to copy and paste it in the next step.  See below for the definitions of each argument that you can pass to this application.

3.  Copy the command line incantation you typed out in the previous step, and register it with the *After Each Job* event.  You do this either inside of Templater's preferences dialog or the `templater-options.json` file if using Templater's command line interface.  See [Registering scripts with events](https://github.com/dataclay/event-scripts#registering-scripts-with-events) for more information about registering scripts with Templater events.

5.  Decide on a batch of rows from your Google Sheet data source that Templater will begin to process.  Then enter the start row and end row into the `Render row _____ through _____` interface fields in Templater's main panel, or in the `row_start` and `row_end` properties in the `templater-options.json` file if using the Templater CLI.

6.  Execute a batch **rendering** process.  This script will only work properly when rendering directly out of After Effects as opposed to using the **replication** method of output.

7.  Watch the magic happen.  Templater will render output then, upload its output asset to S3, call JWPlatform, and then update the Google Spreadsheet with data from both AWS and JWPlatform.

# Command line incantation


### Example Incantation with Sample Arguments
The main application file is `app.js` within the `deploy-output` subfolder found within the `NodeJS` folder of this repository's root.  It takes a number of arguments which are documented in the table below.  An example of the command line incantation might look something like the following:

```
node app.js --gcreds_file '/Users/me/Dev/credentials/google-service-account-creds.json.json'\
            --awscreds_file '/Users/me/Dev/credentials/aws-credentials.json'\
            --jwcreds_file '/Users/me/Dev/credentials/jwplatform-credentials.json'\
            --ytcreds_file '/Users/me/Dev/credentials/templater-uploader-youtube.json'\
            --stream_service "YT"
            --sheet_key '1pITUFgzELVvpA75LXv3QnXpVmIYMyQiVZjdTRjAAgXw'\
            --worksheet 'streaming'\
            --domain_cell 'streaming_globals!B2'\
            --route_cell 'streaming_globals!B3'\
            --player_cell 'streaming_globals!B4'\
            --title_field 'title'\
            --desc_field 'description'\
            --author 'dataclay'\
            --s3_region 'us-east-2'\
            --s3_bucket 'templater-output'\
            --s3_folder 'test'\
            --start_row 2\
            --end_row 2\
            --asset_loc '/Users/me/Dropbox/Dataclay/templater-output'\
            --poster_frame 6\
            --asset_ext 'mov'
```

In the context of Templater's Event Script registration dialog.  You will likely use the argument macros to get values from Templater's data source into the deployment script.  The following is an example:

```
node /Users/arie/Dev/event-scripts/NodeJS/deploy-output/app.js\
        --gcreds_file "/Users/me/Dev/credentials/templater-uploader-0ba4c7b155af.json"\
        --awscreds_file "/Users/me/Dev/credentials/aws-credentials.json"\
        --storage_service "S3"\
        --s3_bucket "templater-output"\
        --s3_region "eu-west-2"\
        --s3_folder "arie-tests"\
        --vmocreds_file "/Users/me/Dev/credentials/templater-uploader-vimeo.json"\
        --stream_service "Vimeo"\
        --data_uri "https://docs.google.com/spreadsheets/d/1lIIUFgzELVvpA75JNv3QnX7VmIYVyPjVZjuTRjAAgXw"\
        --worksheet "streaming"\
        --domain_cell "streaming_globals!B5"\
        --route_cell "streaming_globals!B3"\
        --player_cell "streaming_globals!B4"\
        --asset_loc $out_dir\
        --poster_frame $poster\
        --asset_ext "mp4"\
        --title $title\
        --desc $description\
        --data_index "output"\
        --data_key $output\
        --stream_comments "nobody"\
        --stream_privacy "disable"\
        --stream_group "Output Tests"\
        --stream_url "https://sampledomain.com/video/id?=%s"
```

### Argument Definitions

|Argument Name    |Value Type |Description                                                                                                 |
|:----------------|:----------|:-----------------------------------------------------------------------------------------------------------|
|--gcreds_file    |string     |Absolute path to file holding Google Service Account credentials                                            |
|--awscreds_file  |string     |Absolute path to file holding AWS IAM user credentials                                                      |
|--jwcreds_file   |string     |Absolute path to file holding JWPlatform API Key, Secret, and user                                          |
|--ytcreds_file   |string     |Absolute path to file holding YouTube API credentials                                                       |
|--stream_service |string     |The third-party streaming provider you want to use.  Current supports only JWPlatform and YouTube           |
|--storage_service|string     |The third-part storage provider you want to use.  Currently supports only AWS S3                            |
|--sheet_key      |string     |Unique string ID for the Google Sheet document found in the Sheet's URL as displayed in a browser window    |
|--worksheet      |string     |The name of the tab in the Google Sheet you are using as Templater's data source                            | 
|--domain_cell    |string     |The cell reference for a domain that you are hosting an online video player                                 | 
|--route_cell     |string     |The cell reference for the route on the domain you are hosting an online video player                       |
|--player_cell    |string     |The cell reference containing the player key id given to each created Player on the JWPlatform              | 
|--title_field    |string     |The name of the column that contains the video's title as it will appear on JWPlatform's service            |
|--desc_field     |string     |The name of the column that contains a description of the video as it will appear on the JWPlatform service |
|--author         |string     |The name of the author of each video sent to the JWPlatform                                                 |
|--s3_region      |string     |The AWS region where your S3 bucket exists.  This is used to devise the download link to the S3 asset       |
|--s3_bucket      |string     |The name of the S3 bucket that will hold all uploaded assets                                                |
|--s3_folder      |string     |The name of the folder within the specified S3 bucket that will hold all uploaded assets                    |
|--start_row      |integer    |The ordinal position of the first row in the batch you are processing (use $idx argument macro)             |
|--end_row        |integer    |The ordinal position of the last row in the batch you are processing  (use $idx argument macro)             |
|--poster_frame   |integer    |The frame number of the composition you want to use as the poster frame for the video in the JWPlayer       |
|--asset_loc      |string     |The absolute path to the directory containing all outputs Templater created based on the data source        |
|--asset_ext      |string     |The extension of the output that Templater creates in its output location                                   |

