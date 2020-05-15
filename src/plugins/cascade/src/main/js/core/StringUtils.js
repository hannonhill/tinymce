/**
 * StringUtils.js
 *
 */
define(
  'tinymce.plugins.cascade.core.StringUtils',
  [],
  function () {
    return {
      isEqual: function (value, other) {
        return value === other;
      },

      truncate: function (str, n) {
        return str.length > n ? str.substr(0, n - 1) + '...' : str;
      }
    };
  }
);