var enums = require('./constants'),
    config = require('./config');

var stream = {

      upload    : null
    , key       : null
    , preview   : null
    , embed     : null
    , download  : null

    , info      : {

    }

    , create    : function(service, row, step) {

        switch (service) {

          case enums.video.services.VIMEO : vmo.video.create(row, step);    break;
          case enums.video.services.JW    : jw.video.create(row, step);     break;

          default                         : throw new Error(enums.errors.absent_stream_service);

        }

        return;

    }

    , embed     : function(row) {

        var p       = config.params,
            service = p.video.service,
            formula = null;

        if (config.is_batch()) {

            switch (service) {
                case enums.video.services.VIMEO      : formula = '=CONCATENATE("<iframe width=\'650\' height=\'564\' src=\'https://player.vimeo.com/video/", ' + p.fields.stream.letter + row.row_idx + ', "\' frameborder=\'0\' allowFullScreen mozallowfullscreen webkitAllowFullScreen></iframe>")';
                                                       break;
                case enums.video.services.JWPLATFORM : formula = '=CONCATENATE("<script src=\'//content.jwplatform.com/players/", ' + p.fields.stream.letter + row.row_idx + ', "-", ' + p.video.preview.player_key + ', "\'></script>")';
                                                       break;
                case enums.video.services.YOUTUBE    : formula = null
                                                       break;
            }

        } else {

            switch (service) {
                case enums.video.services.VIMEO      : formula = '=CONCATENATE("<iframe width=\'650\' height=\'564\' src=\'https://player.vimeo.com/video/", "' + stream.key + '", "\' frameborder=\'0\' allowFullScreen mozallowfullscreen webkitAllowFullScreen></iframe>")';
                                                       break;
                case enums.video.services.JWPLATFORM : formula = '=CONCATENATE("<script src=\'//content.jwplatform.com/players/", "' + stream.key + '", "-", "' + p.video.preview.player_key + '", "\'></script>")';
                                                       break;
                case enums.video.services.YOUTUBE    : formula = null
                                                       break;
            }

        }

        return formula;

    }

    , preview   : function(row) {

        var p       = config.params,
            service = p.video.service,
            formula = null;

        if (config.is_batch()) {

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
                case enums.video.services.VIMEO      : formula = '=CONCATENATE("https://",' + p.video.preview.domain + ', "/", "' + stream.key + '")';
                                                       break;
                case enums.video.services.JWPLATFORM : formula = '=CONCATENATE("http://",' + p.video.preview.domain + ', "#",'  + p.video.preview.route + ', "=", "' + stream.key + '")';
                                                       break;
                case enums.video.services.YOUTUBE    : formula = null
                                                       break;
            }

        }

        return formula;

    }
}

module.exports = stream;