/*
jQuery Tuts.js plug-in.
Copyright 2012 David Gardyasz
http://www.lot224.net
Version 1.0
*/


; // Ensure valid addon

(function ($) {
  $.fn.VidTuts = function (options) {
    return new Manager(this, options);
  }

  function Manager(ol, options) {
    var _silhouette = '<span class="vidtuts-silhouette"></span>';
    var _video_silhouette = '<span class="vidtuts-video-silhouette"></span>';
    var _ctrl = this;
    var _items = [];
    var _settings = {
      'index':10000
    }

    $.extend(this, {
      'show': show,
      'hide': hide,
      'toggle': toggle,
      'settings': settings
    });

    // Options Overwrite element options
    function init(ol, options) {
      // Check for a container object for the silhouette, if not found add it
      if ($(".vidtuts-silhouette").length == 0) {
        _silhouette = $(_silhouette).prependTo($("body"));
        _silhouette.on('click', hide);
      } else {
        _silhouette = $(".vidtuts-silhouette");
      }

      if ($(".vidtuts-video-silhouette").length == 0) {
        _video_silhouette = $(_video_silhouette).prependTo($("body"));
        _video_silhouette.on('click', function () {
          _video_silhouette.css('display', 'none');
          $(".vidtuts-video").fadeOut('slow');
          
        });
      } else {
        _video_silhouette = $(".vidtuts-video-silhouettee");
      }

      _settings = $.extend(_settings, getSettings(ol)); // Override the defaults with settings from the OL element
      _settings = $.extend(_settings, options); // Overwrite the settings with any passed options

      // Update the z-index for the silhouette
      _silhouette.css('z-index', _settings.index);

      ol.children().each(function () {
        var child = $(this);
        _items.push(new Video(child, _ctrl));
      });

      $(window).on('resize', function () {
        for (var i = 0; i < _items.length; i++) {
          _items[i].position();
        };
      });
    }

    function show() {
      _silhouette.fadeIn('fast');
      for (var i = 0; i < _items.length; i++) {
        _items[i].show();
      }
    }

    function hide() {
      for (var i = 0; i < _items.length; i++) {
        _items[i].hide();
      }
      _silhouette.fadeOut('fast');
    }

    function toggle() {
      if (_silhouette.is(":visible"))
        hide();
      else
        show();
    }

     function getSettings(element) {
      return {
        'index': element.data('index') ? element.data('index') : _settings.index
      };
    }

    // Only allow an object to update the settings object.
    function settings(settings) {
      if (settings != undefined && settings instanceof Object && !(settings instanceof Array))
        _settings = $.extend(_settings, settings);
      return _settings;
    }

    init(ol, options);

    return _ctrl;
  }

  function Video(li, parent) {
    var _ctrl = this;
    var _parent = parent;

    var _item = '<span class="vidtuts-icon"><span class="vidtuts-tooltip"></span></span>';
    var _video = '<span class="vidtuts-video"><button>asdfgasdfg</button></span>';
    var _tooltip = null;

    var _li = null;

    var _guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    var _anchor = null;

    var _settings = {
      'index': 10001,
      'delay': Math.floor((Math.random() * 1000) + 1) // Random Value from 1-1000 for show hide purposes.
    };

    $.extend(this, {
      'show': show,
      'hide': hide,
      'position': position
    });

    function init(li) {
      _li = $(li);

      _item = $(_item).prependTo($('body'));
      _item.attr('id', _guid);
      _item.css('z-index', _parent.settings().index + 2);
      _item.on('click', onClick);

      _video = $(_video).insertAfter($('.vidtuts-silhouette'));
      _video.attr('id', 'video-' + _guid);
      _video.css('z-index', _parent.settings().index + 1); // 1 less than icon so it stays behind it.

      _tooltip = _item.find(".vidtuts-tooltip");

      _tooltip.html(_li.html());
      _tooltip.addClass(_li.attr('class'));
      alignToolTip();

      _anchor = _li.data('anchor') ? $(_li.data('anchor')) : null;
      position();
    };

    function show() {
      _video.css('z-index', _parent.settings().index + 1);

      setTimeout(function () {
        position();
        _tooltip.attr('style', '');
        $('#' + _guid).stop(true, true).fadeIn('slow', function () {
          $(this).show();
          alignToolTip();
        });
      }, _settings.delay);
    }

    function hide() {
      _video.fadeOut('fast');
      
      setTimeout(function () {
        $('#' + _guid).stop(true, true).fadeOut('slow', function () {
          $(this).hide();
        });
      }, _settings.delay);
    }

    function position() {
      // just set the left/top for now.
      if (_anchor) {
        var p = _anchor.offset();
        _item.css({ 'top': p.top, 'left': p.left });
      }
    }

    function alignToolTip() {

      var styles = {};

      if (_tooltip.hasClass('top')) {
        styles.top = ((_tooltip.outerHeight() + 8) * -1) + "px";
      }

      if (_tooltip.hasClass('bottom')) {
        styles.top = '32px';
      }

      if (_tooltip.hasClass('left')) {
        styles.left = '0px';
      }  

      if (_tooltip.hasClass('right')) {
        styles.left = ((_tooltip.outerWidth() - _item.outerWidth()) * -1) + 'px';
      }

      if (_tooltip.hasClass('center')) {

        if (_tooltip.hasClass('top') || _tooltip.hasClass('bottom')) {
          // center the tooltip horizontally
          var newWidth = (_tooltip.outerWidth() - _item.outerWidth()) / 2;

          styles.left = newWidth * -1;

          if (_tooltip.hasClass('top')) {
            styles.top = ((_tooltip.outerHeight() + 8) * -1) + "px";
          }

          if (_tooltip.hasClass('bottom')) {
            styles.top = "32px";
          }
        }

        if (_tooltip.hasClass('left') || _tooltip.hasClass('right')) {
          // center the tooltip vertically
          var newHeight = (_tooltip.outerHeight() - _item.outerHeight()) / 2;

          styles.top = newHeight * -1;

          if (_tooltip.hasClass('left')) {
            styles.left = ((_tooltip.outerWidth() + 8) * -1) + "px";
          }

          if (_tooltip.hasClass('right')) {
            styles.left = "40px";
          }
        }
      }

      _tooltip.stop(true, false).animate(styles, _settings.delay, 'swing', function () {
        $(this).css('zoom', 1);
      });

    }


    function onClick(e) {
      $('.vidtuts-video-silhouette').css('display','inline-block');

      var w = _item.width();
      var h = _item.height();

      _video.css({
        'z-index': _video.css('z-index') + 1,
        'width': _item.width(),
        'height': _item.height(),
        'top': _item.css('top'),
        'left': _item.css('left'),
        'display': 'inline-block'
      });

      var styles = {};

      styles.width = '720px';
      styles.height = '480px';
      styles.top = Math.max(0, (($(window).height() - 480) / 2) + $(window).scrollTop()) + "px";
      styles.left = Math.max(0, (($(window).width() - 720) / 2) + $(window).scrollLeft()) + "px"

      _video.stop(true, false).animate(styles, 'slow', 'swing', function () {
        
      });
      

    }

    init(li);
    return this;
  }

})(jQuery);