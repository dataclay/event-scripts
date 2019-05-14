var log     = require('./logger'),
    enums   = require('./constants'),
    config  = require('./config'),
    sprintf = require('sprintf-js').sprintf;

var stream = {

      upload          : null
    , thumb           : null
    , clip            : null
    , key             : null
    , preview         : null
    , embed_code      : null
    , source_asset    : null

    , info      : {

    }

    , embed     : function(row) {

        var p       = config.params,
            service = p.video.service,
            formula = null;

        if (config.is_batch()) {

            if (config.detect_datasource(p.data.url) === enums.data.types.GOOGLE) {
                
                switch (service) {
                    case enums.video.services.VIMEO      : formula = stream.embed_code;
                                                           break;
                    case enums.video.services.JWPLATFORM : formula = '=CONCATENATE("<script src=\'https://cdn.jwplatform.com/players/", ' + p.fields.stream.letter + row.row_idx + ', "-", ' + p.video.preview.player_key + ', "\'></script>")';
                                                           break;
                    case enums.video.services.YOUTUBE    : formula = null
                                                           break;
                }

            } else {

                switch (service) {
                    case enums.video.services.VIMEO      : formula = stream.embed_code;
                                                           break;
                    case enums.video.services.JWPLATFORM : formula = "<script src=\"https://" + enums.jw.playback.EMBED_CDN + stream.key + "-" + p.video.player_key + ".js\"></script>";
                                                           break;
                    case enums.video.services.YOUTUBE    : formula = null
                                                           break;
                }

            }

        } else {

            if (config.detect_datasource(p.data.url) === enums.data.types.GOOGLE) {
                
                switch (service) {
                    case enums.video.services.VIMEO      : formula = stream.embed_code;
                                                           break;
                    case enums.video.services.JWPLATFORM : formula = '=CONCATENATE("<script src=\'https://cdn.jwplatform.com/players/", "' + stream.key + '", "-", "' + p.video.preview.player_key + '", "\'></script>")';
                                                           break;
                    case enums.video.services.YOUTUBE    : formula = null
                                                           break;
                }

            } else {

                switch (service) {
                    case enums.video.services.VIMEO      : formula = stream.embed_code;
                                                           break;
                    case enums.video.services.JWPLATFORM : formula = "<script src=\"https://" + enums.jw.playback.EMBED_CDN + stream.key + "-" + p.video.player_key + ".js\"></script>";
                                                           break;
                    case enums.video.services.YOUTUBE    : formula = null
                                                           break;
                }

            }

        }

        return formula;

    }

    , preview   : function(row) {

        var p       = config.params,
            service = p.video.service,
            formula = null;

        if (config.is_batch()) {

            if (config.detect_datasource(p.data.url) === enums.data.types.GOOGLE) {
                
                switch (service) {
                    case enums.video.services.VIMEO      : formula = '=CONCATENATE("https://",' + p.video.preview.domain + ', "/",' + p.fields.stream.letter + row.row_idx + ')';
                                                           break;
                    case enums.video.services.JWPLATFORM : formula = '=CONCATENATE("http://",' + p.video.preview.domain + ', "#",'  + p.video.preview.route + ', "=", ' + p.fields.stream.letter + row.row_idx + ')';
                                                           break;
                    case enums.video.services.YOUTUBE    : formula = null
                                                           break;
                }

            } else {

                switch (service) {
                    case enums.video.services.VIMEO      : formula = "https://" + enums.vimeo.playback.DOMAIN  + "/" + stream.key;
                                                           break;
                    case enums.video.services.JWPLATFORM : formula = "https://"  + enums.jw.playback.PREVIEW   + stream.key + "-" + p.video.player_key;
                                                           break;
                    case enums.video.services.YOUTUBE    : formula = null
                                                           break;
                }

            }

        } else {

            if (config.detect_datasource(p.data.url) === enums.data.types.GOOGLE) {

                switch (service) {
                    case enums.video.services.VIMEO      : formula = '=CONCATENATE("https://",' + p.video.preview.domain + ', "/", "' + stream.key + '")';
                                                           break;
                    case enums.video.services.JWPLATFORM : formula = '=CONCATENATE("http://",' + p.video.preview.domain + ', "#",'  + p.video.preview.route + ', "=", "' + stream.key + '")';
                                                           break;
                    case enums.video.services.YOUTUBE    : formula = null;
                                                           break;
                }

            } else {

                switch (service) {
                    case enums.video.services.VIMEO      : formula = "https://" + enums.vimeo.playback.DOMAIN  + "/" + stream.key;
                                                           break;
                    case enums.video.services.JWPLATFORM : formula = "https://"  + enums.jw.playback.PREVIEW   + stream.key + "-" + p.video.player_key;
                                                           break;
                    case enums.video.services.YOUTUBE    : formula = null;
                                                           break;

                }

            }

        }

        return formula;

    }

    , url       : function(row) {

        var p = config.params;

        return sprintf(p.video.stream_url, stream.key);

    }
}

module.exports = stream;