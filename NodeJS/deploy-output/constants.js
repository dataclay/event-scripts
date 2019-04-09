module.exports = Object.freeze({

    defaults : {

        VIDEO_TITLE    : "Templater Video"
      , STORAGE_FOLDER : "Uncategorized"

    },

    jw : { 

        status : {
                     CREATED     : "created"
                   , PROCESSING  : "processing"
                   , UPDATING    : "updating"
                   , READY       : "ready"
                   , FAILED      : "failed"
                 }

      , playback : {
        
      }
      
    },

    video : {

          services : {
                         YOUTUBE      : "YouTube"
                       , JWPLATFORM   : "JW Platform"
                       , VIMEO        : "Vimeo"
                     }

        , status : {
                         READY        : "ready"
                       , QUEUED       : "queued"
                       , PROCESSING   : "processing"
                       , DONE         : "done"
                       , FAIL         : "fail"
                   }

    },

    stream : {

          status : {
                        CREATED       : "created"
                   }

    },

    aws : {

          signatureVersion : 'v4'
        , s3_default_url   : 's3.amazonaws.com'
        , regions          : {
                                  "us-east-1"      : { name: "US East",       location: "N. Virgina",    endpoint: "s3.us-east-1.amazonaws.com"         }
                                , "us-east-2"      : { name: "US East",       location: "Ohio",          endpoint: "s3.us-east-2.amazonaws.com"         }
                                , "us-west-1"      : { name: "US West",       location: "N. California", endpoint: "s3.us-west-1.amazonaws.com"         }
                                , "us-west-2"      : { name: "US West",       location: "Oregon",        endpoint: "s3.us-west-2.amazonaws.com"         }
                                , "ca-central-1"   : { name: "Canada",        location: "Central",       endpoint: "s3.ca-central-1.amazonaws.com"      }
                                , "ap-south-1"     : { name: "Asia Pacific",  location: "Mumbai",        endpoint: "s3.ap-south-1.amazonaws.com"        }
                                , "ap-northeast-1" : { name: "Asia Pacific",  location: "Tokyo",         endpoint: "s3.ap-northeast-1.amazonaws.com"    }
                                , "ap-northeast-2" : { name: "Asia Pacific",  location: "Seoul",         endpoint: "s3.ap-northeast-2.amazonaws.com"    }
                                , "ap-northeast-3" : { name: "Asia Pacific",  location: "Osaka",         endpoint: "s3.ap-northeast-3.amazonaws.com"    }
                                , "ap-southeast-1" : { name: "Asia Pacific",  location: "Singapore",     endpoint: "s3.ap-southeast-1.amazonaws.com"    }
                                , "ap-southeast-2" : { name: "Asia Pacific",  location: "Sydney",        endpoint: "s3.ap-southeast-2.amazonaws.com"    }
                                , "cn-northwest-1" : { name: "China",         location: "Ningxia",       endpoint: "s3.cn-northwest-1.amazonaws.com.cn" }
                                , "cn-north-1"     : { name: "China",         location: "Beijing",       endpoint: "s3.cn-north-1.amazonaws.com.cn"     }
                                , "eu-central-1"   : { name: "EU Central",    location: "Frankfurt",     endpoint: "s3.eu-central-1.amazonaws.com"      }
                                , "eu-west-1"      : { name: "EU West",       location: "Ireland",       endpoint: "s3.eu-west-1.amazonaws.com"         }
                                , "eu-west-2"      : { name: "EU West",       location: "London",        endpoint: "s3.eu-west-2.amazonaws.com"         }
                                , "eu-west-3"      : { name: "EU West",       location: "Paris",         endpoint: "s3.eu-west-3.amazonaws.com"         }
                                , "sa-east-1"      : { name: "South America", location: "São Paulo",     endpoint: "s3.sa-east-1.amazonaws.com"         }
                             }

    },

    data : {

        types  : {

              GOOGLE    : "google"
            , JSON_FILE : "json_file"
            , JSON_URL  : "json_url"

        }

        , fields : {

             OUTPUT     : "output"
           , S3_LINK    : "s3-link-video"
           , S3_POSTER  : "s3-link-poster"
           , S3_PREVIEW : "s3-link-preview"
           , STREAM     : "stream-key"
           , BCAST      : "broadcast-status"
           , EMBED      : "embed-script"
           , PREV       : "broadcast-preview"
           , URL        : "stream-url"

        }

        , tokens : {

          GSHEET_DOMAIN : "docs.google.com"


        }

    },

    storage : {

      types : {

          NONE    : null
        , S3      : "S3"
        , DROPBOX : "Dropbox"
        , GDRIVE  : "GDrive"

      }

    },

    errors : {

        absent_gcreds_file    : "No Google Services Account credential file found at: %s.  You may need to create a service account in the Google API console.  Please see this article for more information about Google Service accounts: https://cloud.google.com/iam/docs/understanding-service-accounts"
      , absent_awscreds_file  : "No AWS credential file found at: %s.  You need to store your AWS IAM Access Key ID, and Secret Access Key in a file to use this app.  Please see this article retreiving your IAM keys from AWS: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html"
      , absent_jwcreds_file   : "No JWPlatform credential file found at: %s.  You need to store your JW Platform user name, API key, and key secret in a file to use this app.  Refer to your account page on JWPlatform."
      , absent_ytcreds_file   : "No YouTube credential file found at: %s.  You need to download your credential file from the API Console for Google Cloud Platform."
      , absent_vmocreds_file  : "No Vimeo credential file found at: %s.  You need to create your Vimeo credential file based on authentication data supplied by Vimeo."
      , absent_stream_service : "It appears no video streaming service was selected.  Please specify one using the --stream_service argument and try again."
      , incorrect_vmo_state   : "There was a problem authorizing this application to use your Vimeo account.  Please try again."
      , json_read_err         : "There was an error reading the JSON from file %s.  It may be malformed, please inspect it and try again."
      , absent_collection     : "There was no data collection, or worksheet, found.  Please use the --worksheet argument to specify which collection of data you want project to read and write to."

    }

});