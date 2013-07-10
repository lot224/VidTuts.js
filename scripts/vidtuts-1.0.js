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

      _settings = $.extend(_settings, getSettings(ol)); // Override the defaults with settings from the OL element
      _settings = $.extend(_settings, options); // Overwrite the settings with any passed options

      // Update the z-index for the silhouette
      _silhouette.css('z-index', _settings.index);

      ol.children().each(function () {
        var child = $(this);
        _items.push(new Video(child, _ctrl));
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

    var _item = '<span class="vidtuts-icon"></span>';
    var _guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    var _settings = {
      'index': 10001,
      'delay': Math.floor((Math.random() * 500) + 1), // Random Value from 1-1000 for show hide purposes.
      'showCSS': 'bounceIn',
      'hideCSS': 'bounceOut',
      'x': "animated bounceIn bounceOut",
      'y': "animated bounceIn"
    };

    $.extend(this, {
      'show': show,
      'hide': hide
    });

    function init(li) {
      _item = $(_item).prependTo($('body'));
      _item.attr('id', _guid);
      _item.addClass('animate');

      if (_item[0].addEventListener) {
        _item[0].addEventListener("animationend", clearClasses, false);
      } else if (_item[0].attachEvent) {
        _item[0].attachEvent("onanimationend", clearClasses);
      }

      //_item[0].addEventListener('animationend', clearClasses);
      //_item[0].attachEvent('animationend', clearClasses);

      _item.css('z-index', _parent.settings().index + 1);
    }

    function show() {
      setTimeout(function (guid, showCSS, hideCSS) {
        $('#' + guid).removeClass(showCSS + " " + hideCSS).addClass(showCSS);
      }, _settings.delay, _guid, _settings.showCSS, _settings.hideCSS);
    }

    function hide() {
      setTimeout(function (guid, showClass, hideClass) {
        $('#' + guid).removeClass("animated bounceIn bounceOut").addClass("animated bounceOut");
      }, _settings.delay, _guid,_settings.showClass, _settings.hideClass);

      //setTimeout(_hide, _settings.delay);
      //_item.removeClass(_settings.showClass).addClass(_settings.hideClass);
      //_item.removeClass('animated bounceIn bounceOut').addClass('animated bounceOut');
    }


    function clearClasses() {
      console.log('clearClasses');
      _item.css('opacity', 1);
      //if (_item.hasClass('hideClass')) {
      //  _item.css('display', 'none');
      //}
      //_item.removeClass(_settings.showClass + " " + _settings.hideClass);
    }

    init(li);
    return this;
  }

})(jQuery);