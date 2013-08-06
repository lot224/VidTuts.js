
// This is an example of how to create a seperate control for the vidTut to use when displaying a video.
// This control will handle all visual cues from the vidTut.  The Extended properties will be used to show/hide the video.
// Being passed into the constructor is the vidTut object and settings for the video.

;(function ($) {
  $.extend(true, window, {
    JWVideo: videoObject
  });

  $(function () {
    jwplayer.key = ""; // Enter JWPlayer Key Here
  });

  function videoObject(parent, settings) {
    var _ctrl = this;
    var _parent = parent;
    var _video = '<span class="vidtuts-video"><span class="vidtuts-video-close"></span><div class="vidtuts-video-content"></div></span>';

    var _player = null;

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
      _video.find('.vidtuts-video-content').attr('id', 'player-' + _parent.guid());

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

        _video.stop(true, false).animate(styles, 'slow', 'swing');
      }
    }


    function displayContent() {
      if (_player == null) {
        var id = _video.find('.vidtuts-video-content').attr('id');
        _player = jwplayer(id).setup({
          file: _settings.url,
          width: _settings.width,
          height: _settings.height,
          autostart: true
        });
      } else {
        _player.play(true);
      }
    };

    function hide() {
      if (_player != null) {
        _player.stop();
      };
      $('.vidtuts-video-silhouette').css('display', 'none');
      _video.fadeOut('slow');
    }


    processSettings(settings);
    init();

 
  }

})(jQuery);