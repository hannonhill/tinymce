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
        return getClassesForDropdown(editor, defaultClassList, "img");
      };
      var getLinkClassesForDropdown = function (editor, defaultClassList) {
        return getClassesForDropdown(editor, defaultClassList, "a");
      };
      var getClassesForDropdown = function (editor, element) {
        var editorSettings = editor.settings;
        var customStyleFormats = editorSettings.custom_style_formats;
        var customFormatList = [];
        var selectedNode = editor.selection.getNode();
        var creatingNewElement = isCreatingNewElement(element, editor);

        if (creatingNewElement) {
          selectedNode = createTemporaryElement(editor, element);
        }

        Tools.each(customStyleFormats, function (customFormat) {
          var formatName = customFormat.name;
          // matchNode returns the object or undefined if there's no match
          var selected = editor.formatter.matchNode(selectedNode, formatName, true) ? true : false;

          if (editor.dom.is(selectedNode, customFormat.selector)) {
            customFormat.selected = selected;
            customFormatList.push(customFormat);
          }
        });

        if (creatingNewElement) {
          editor.dom.remove(selectedNode);
        }

        return customFormatList.sort();
      };

      var isCreatingNewElement = function (element, editor) {
        var selectedNode = editor.selection.getNode();
        return selectedNode.nodeName.toLowerCase() !== element;
      };

      var createTemporaryElement = function (editor, element) {
        var addedElement = editor.dom.create(element, {});
        editor.selection.getNode().append(addedElement);
        return addedElement;
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
        buildCustomFormatsList: buildCustomFormatsList,
        getImageClassesForDropdown: getImageClassesForDropdown,
        getLinkClassesForDropdown: getLinkClassesForDropdown
      };
    }
);