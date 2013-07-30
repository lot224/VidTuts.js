
// This is an example of how to create a seperate control for the vidTut to use when displaying a video.
// This control will handle all visual cues from the vidTut.  The Extended properties will be used to show/hide the video.
// Being passed into the constructor is the vidTut object and settings for the video.

;(function ($) {
  $.extend(true, window, {
    vidTutsVideo: videoObject
  });

  function videoObject(parent, settings) {

    var _ctrl = this;
    var _parent = parent;
    var _video = '<span class="vidtuts-video"><span class="vidtuts-video-close"></span><div class="vidtuts-video-content"></div></span>';

    var _quicktime = '<OBJECT id="vidtuts-player" CLASSID="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" CODEBASE="http://www.apple.com/qtactivex/qtplugin.cab" WIDTH="{0}" HEIGHT="{1}"><PARAM NAME="SRC" VALUE="{2}" /><PARAM NAME="autoplay" VALUE="true" /><EMBED SRC="{2}" TYPE="image/x-macpaint" PLUGINSPAGE="http://www.apple.com/quicktime/download" WIDTH="{0}" HEIGHT="{1}" AUTOPLAY="true" SCALE="ToFit"></EMBED></OBJECT>';
    var _mediaPlayer = '<object id="vidtuts-player" width="{0}" height="{1}" type="application/x-mplayer2" standby="Loading Microsoft Windows Media Player components..."><param value="opaque" name="wmode"><param value="{2}" name="filename"><param value="true" name="animationatStart"><param value="true" name="transparentatStart"><param value="true" name="autoStart"><param value="false" name="showControls"><param value="false" name="loop"></object>';
    var _html5 = '<video id="vidtuts-player" autoplay="autoplay" width="{0}" height="{1}" controls><source src="{2}" type="video/mp4"><source src="movie.ogg" type="video/ogg"></video>';

    var _embed;

    var _settings = {
      'width': 720,
      'height': 405
    };

    $.extend(this, {
      'show': show,
      'hide': hide
    });

    function init() {
      // Insert after the vidTuts silhouette so the z-index is maintained correctly in ie7
      _video = $(_video).insertAfter($('.vidtuts-silhouette'));
      _video.attr('id', 'video-' + _parent.guid());
      _video.css('z-index', _parent.settings().index + 1); // 1 less than icon so it stays behind it.
      _video.find('.vidtuts-video-close').on('click', hide);

      _embed = support();

      $(window).on('resize', adjustPosition);
    }
    
    function processSettings(s) {
      var items = s.split(";");

      for (var i = 0; i < items.length; i++) {
        try {
          var index = items[i].indexOf(':');
          var key = items[i].substring(0, index);
          var val = items[i].substr(index + 1);

          if (isNaN(val)) {
            _settings[key] = val;
          } else {
            _settings[key] = Number(val);
          }
        } catch (err) {
          console.error('Can not add property, (' + items[i] + ') has errors\n' + err);
        }
      };
    }
    
    function show() {
      // re-position the video link to match the parent's dimensions.
      _video.css({
        'z-index': _video.css('z-index') + 1,
        'width': _parent.icon().width(),
        'height': _parent.icon().height(),
        'top': _parent.icon().css('top'),
        'left': _parent.icon().css('left'),
        'display': 'inline-block'
      });

      var styles = {};

      styles.width = _settings.width;
      styles.height = _settings.height;

      styles.top = Math.max(0, ($(window).height() - _settings.height) / 2) + "px"
      styles.left = Math.max(0, ($(window).width() - _settings.width) / 2) + "px"

      _video.stop(true, false).animate(styles, 'slow', 'swing', function () {
        displayContent();
      });
    }

    function adjustPosition() {
      if (_video.is(":visible")) {
        var styles = {}
        styles.top = Math.max(0, ($(window).height() - _settings.height) / 2) + "px"
        styles.left = Math.max(0, ($(window).width() - _settings.width) / 2) + "px"

        //styles.top = Math.max(0, (($(window).height() - _settings.height) / 2) + $(window).scrollTop()) + "px";
        //styles.left = Math.max(0, (($(window).width() - _settings.width) / 2) + $(window).scrollLeft()) + "px"
        _video.stop(true, false).animate(styles, 'slow', 'swing');
      }
    }


    function displayContent() {

      var replace = function() {
        for (var i = 1; i < arguments.length; i++) {
          var e = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
          arguments[0] = arguments[0].replace(e, arguments[i]);
        }
        return arguments[0];
      }

      var qt = replace(support(), _settings.width, _settings.height, _settings.url);

      _video.find('.vidtuts-video-content').html(qt);
    };

    function hide() {
      var player = _video.find("#vidtuts-player")[0];

      if (player && typeof(player.pause) === 'function')
        player.pause();

      if (player && typeof(player.stop) === 'function')
        player.stop();

      if (player && typeof (player.object) === 'object')
        player.object.Stop();

      _video.find('.vidtuts-video-content').html();
      $('.vidtuts-video-silhouette').css('display', 'none');
      _video.fadeOut('slow');

    }


    function support() {
      var preCache = $('.vidtuts-video-silhouette').attr('videoSupport');
      switch (preCache) {
        case "qt": return _quicktime;
        case "mp": return _mediaPlayer;
        case "h5": return _html5;
      }

      var html5 = document.createElement("video"), mpeg4, h264, ogg, webm, qt, mp;
      if (html5.canPlayType) {
        // Check for MPEG-4 support
        //mpeg4 = "" !== html5.canPlayType('video/mp4; codecs="mp4v.20.8"');
        // Check for h264 support
        h264 = "" !== (html5.canPlayType('video/mp4; codecs="avc1.42E01E"') || html5.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'));
        // Check for Ogg support
        //ogg = "" !== html5.canPlayType('video/ogg; codecs="theora"');
        // Check for Webm support
        //webm = "" !== html5.canPlayType('video/webm; codecs="vp8, vorbis"');
      }

      if (h264) {
        $('.vidtuts-video-silhouette').attr('videoSupport', "h5");
        return _html5;
      }

      if (navigator.plugins) {
        for (i = 0; i < navigator.plugins.length; i++) {
          if (navigator.plugins[i].name.indexOf("QuickTime") >= 0) qt = true;
        }
      }

      if (qt) {
        $('.vidtuts-video-silhouette').attr('videoSupport', "qt");
        return _quicktime;
      }

      $('.vidtuts-video-silhouette').attr('videoSupport', "mp");
      return _mediaPlayer;
    }

    processSettings(settings);
    init();

 
  }

})(jQuery);