/**
 * InlineStylesUtils.js
 *
 */
define(
  'tinymce.plugins.cascade.core.InlineStylesUtils',
  [
    'tinymce.core.util.Tools'
  ],
  function (Tools) {
    return {
      parse: function (stylesString) {
        var stylesObject = {};

        stylesString = Tools.trim(stylesString);

        if (!stylesString || !stylesString.length) {
          return stylesObject;
        }

        var splitStyles = stylesString.split(';');
        Tools.each(splitStyles, function (style) {
          var styleParts = style.split(':');
          if (styleParts.length === 2) {
            stylesObject[Tools.trim(styleParts[0])] = Tools.trim(styleParts[1]);
          }
        });

        return stylesObject;
      },

      serialize: function (stylesObject) {
        var result = [];
        Tools.each(stylesObject, function (value, key) {
          result.push(key + ': ' + value);
        });
        return result.join('; ');
      }
    };
  }
);