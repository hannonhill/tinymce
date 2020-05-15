/**
 * ObjectUtils.js
 *
 */
define(
  'tinymce.plugins.cascade.core.ObjectUtils',
  [],
  function () {
    return {
      sortByProperty: function (object, property) {
        var sortCallback = function (a, b) {
          var nameA = (a[property] || '').toUpperCase();
          var nameB = (b[property] || '').toUpperCase();

          if (nameA < nameB) {
            return -1;
          } else if (nameA > nameB) {
            return 1;
          }

          // names must be equal
          return 0;
        };

        return object.sort(sortCallback);
      }
    };
  }
);