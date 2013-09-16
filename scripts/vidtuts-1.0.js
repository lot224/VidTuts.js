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
          for (var i = 0; i < _items.length; i++) {
            var vid = _items[i].video();
            if (vid)
              vid.hide();
          }
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

        /* Place the decision on the video control, anchors may be dynamic and could be added later.
        var anchor = $(child.data('anchor'));
        if (anchor.length > 0) {
          _items.push(new Video(child, _ctrl));
        } else {
          console.warn('No anchor found for vidtut, ignoring node.');
        }
        */
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
    var _videoObj;
    var _tooltip;
    var _li;

    var _guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    var _settings = {
      'index': 10001,
      'delay': Math.floor((Math.random() * 1000) + 1) // Random Value from 1-1000 for show hide purposes.
    };

    $.extend(this, {
      'show': show,
      'hide': hide,
      'position': position,
      'settings': function () { return _settings; },
      'guid': function () { return _guid; },
      'icon': function () { return _item; },
      'toolTip': function () { return _tooltip; },
      'video': function () { return _videoObj; },
      'element': function () { return _li; }
    });

    function init(li) {
      _li = $(li);

      _item = $(_item).prependTo($('body'));
      _item.attr('id', _guid);
      _item.css('z-index', _parent.settings().index + 2);
      _item.on('click', onClick);

      if (_li.data('parentclass'))
        _item.addClass(_li.data('parentclass'));     

      videoInit();

      _tooltip = _item.find(".vidtuts-tooltip");

      _tooltip.html(_li.html());
      _tooltip.addClass(_li.attr('class'));
      alignToolTip();

      position();
    };

    function videoInit() {

      var videoType = _li.data("videotype");
      var videoParams = _li.data("videoparams");

      if (videoType && typeof (window[videoType]) === 'function') {
        _videoObj = new window[videoType](_ctrl, videoParams ? videoParams : "");
      } else {
        if (!videoType) {
          console.warn('No videoType attribute found on vidTut li element.');
        } else {
          if (typeof (window[videoType]) != 'function')
            console.warn('No videoType object of type (window.' + videoType + ') found.');
        }
      }

    }

    function anchor() {
      return _li.data('anchor') ? $(_li.data('anchor')).filter(":visible") : null;
    }

    function IsActive() {
      var _anchor = anchor();
      if (_anchor == null) return false;
      if (!_anchor.is(':visible')) return false;

      var ctrlVisibleElement = _li.data('hideifvisible') ? $(_li.data('hideifvisible')) : null;
      if (ctrlVisibleElement && ctrlVisibleElement.is(':visible')) return false;

      return true;
    }

    function show() {
      if (!IsActive()) return;

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
      if (!IsActive()) return;

      setTimeout(function () {
        $('#' + _guid).stop(true, true).fadeOut('slow', function () {
          $(this).hide();
        });
      }, _settings.delay);
    }

    function position() {
      if (!IsActive()) return;

      var _anchor = anchor();
      var p = _anchor.offset();
      var styles = {};
      styles.top = p.top + "px";
      styles.left = p.left + "px";
      _item.stop(true, false).animate(styles, 'slow', 'swing');
    };

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
      if (_videoObj) {
        $('.vidtuts-video-silhouette').css('display', 'inline-block');
        if (typeof (_videoObj.show) === 'function')
          _videoObj.show();
      } else {
        console.warn('no video object found to display, ignoring request.');
      }
    }

    init(li);
    return this;
  }

})(jQuery);