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
      var getImageClassesForDropdown = function (editor, defaultClassList) {
        return getClassesForDropdown(editor, defaultClassList, "image");
      };
      var getLinkClassesForDropdown = function (editor, defaultClassList) {
        return getClassesForDropdown(editor, defaultClassList, "link");
      };
      var getClassesForDropdown = function (editor, defaultClassList, element) {
        var editorSettings = editor.settings;
        var classList = [];

        var formatMenuItems = editorSettings.style_formats;
        Tools.each(formatMenuItems, function (formatMenuItem) {
          if (formatMenuItem.title === "Custom") {
            Tools.each(formatMenuItem.items, function (format) {
              var formatName = format.name;
              if (editor.formatter.canApply(formatName) && format.classes) {
                Tools.each(format.classes, function (formatClass) {
                  if (isInElementClassList(formatClass, element, editorSettings)) {
                    classList.push(formatClass);
                  }
                });
              }
            });
          }
        });

        return hasAdvancedFormatMenu(editor) ? classList : defaultClassList;
      };

      var isInElementClassList = function (className, element, editorSettings) {
        return element === 'image' ? editorSettings.image_class_list.includes(className) : editorSettings.link_class_list.includes(className);
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
        appendOptionsToDropDown: appendOptionsToDropDown,
        isInElementClassList: isInElementClassList,
        getImageClassesForDropdown: getImageClassesForDropdown,
        getLinkClassesForDropdown: getLinkClassesForDropdown
      };
    }
);