/**
 * Utils.js
 *
 */
define(
  'tinymce.plugins.cascade.core.Utils',
  [
    'tinymce.core.util.Tools'
  ],
    function (Tools) {
      var getClassesForDropdown = function (editor, defaultClassList) {
        var editorSettings = editor.settings;
        var classList = [];

        var formatMenuItems = editorSettings.style_formats;
        Tools.each(formatMenuItems, function (formatMenuItem) {
          if (formatMenuItem.title === "Custom") {
            Tools.each(formatMenuItem.items, function (format) {
              var formatName = format.name;
              if (editor.formatter.canApply(formatName) && format.classes) {
                Tools.each(format.classes, function (formatClass) {
                  classList.push(formatClass);
                });
              }
            });
          }
        });
       // return hasAdvancedFormatMenu(editor) ? classList : editorSettings.link_class_list;
        return hasAdvancedFormatMenu(editor) ? classList : defaultClassList;
      };
      var hasAdvancedFormatMenu = function (editor) {
        var formatMenuItems = editor.settings.style_formats;

        if (formatMenuItems === undefined) {
          return false;
        }

        var customFormatMenu = formatMenuItems.filter(function (formatMenuItem) {
          return formatMenuItem.title === "Custom";
        });

        return customFormatMenu.length > 0;
      };

      var appendOptionsToDropDown = function (classList, data) {
        if (typeof classList[0] !== 'object') {
          // Using an object as opposed to a string so we can use an empty value.
          classList.unshift({
            text: 'None',
            value: ''
          });
        }

        if (data['class'] && classList.indexOf(data['class']) === -1) {
          classList.push(data['class']);
        }

        return classList;
      };

      return {
        getClassesForDropdown: getClassesForDropdown,
        hasAdvancedFormatMenu: hasAdvancedFormatMenu,
        appendOptionsToDropDown: appendOptionsToDropDown
      };
    }
);