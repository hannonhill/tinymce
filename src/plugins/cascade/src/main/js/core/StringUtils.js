/**
 * StringUtils.js
 *
 */
define(
  'tinymce.plugins.cascade.core.StringUtils',
  [],
  function () {
    var truncateListItemText = function (str, n) {
      return str.length > n ? str.substr(0, n - 1) + '...' : str;
    };

    return {
      truncateListItemText: truncateListItemText
    };
  }
);