module.exports = Object.freeze({

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
                         YOUTUBE      : "YT"
                       , JWPLATFORM   : "JW"
                       , VIMEO        : "VIMEO"
                     }

        , status : {
                         READY        : "ready"
                       , QUEUED       : "queued"
                       , PROCESSING   : "processing"
                       , DONE         : "done"
                       , FAIL         : "fail"
                   }

    },

    aws : {

          signatureVersion : 'v4'
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

            GOOGLE : "google"

        }

        , fields : {

             OUTPUT  : "output"
           , S3_LINK : "s3-link"
           , STREAM  : "stream-key"
           , BCAST   : "broadcast-status"
           , EMBED   : "embed-script"
           , PREV    : "broadcast-preview"

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

        absent_gcreds_file   : "No Google Services Account credential file found at: %s.  You may need to create a service account in the Google API console.  Please see this article for more information about Google Service accounts: https://cloud.google.com/iam/docs/understanding-service-accounts"
      , absent_awscreds_file : "No AWS credential file found at: %s.  You need to store your AWS IAM Access Key ID, and Secret Access Key in a file to use this app.  Please see this article retreiving your IAM keys from AWS: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html"
      , absent_jwcreds_file  : "No JWPlatform credential file found at: %s.  You need to store your JW Platform user name, API key, and key secret in a file to use this app.  Refer to your account page on JWPlatform."
      , absent_ytcreds_file  : "No YouTube credential file found at: %s.  You need to download your credential file from the API Console for Google Cloud Platform."
      , json_read_err        : "There was an error reading the JSON from file %s.  It may be malformed, please inspect it and try again."

    }

});