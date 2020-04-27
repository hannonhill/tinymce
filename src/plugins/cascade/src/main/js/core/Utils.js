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
      var getClassesForDropdown = function (editor, defaultClassList, element) {
        var editorSettings = editor.settings;
        var selectedNode = editor.selection.getNode();
        var nodeName = selectedNode.nodeName;

        if (nodeName.toLowerCase() !== element) {
          var elementNode = editor.dom.create(element, {});
         // editor.selection.setNode(elementNode); //adds node to DOM
         // selectedNode.append(elementNode); // definitely adds node
         // var selectedNewNode = editor.selection.select(elementNode); //selecting without inserting/appending causes error
         // selectedNode = editor.selection.getNode();
          selectedNode = elementNode; //doesn't seem to work against editor.dom.is for some reason, maybe because it's not an actual node?
        }

        var classList = [];
        var formatMenuItems = editorSettings.style_formats;
        var customMenu = formatMenuItems.filter(function (format) {
          return format.title === "Custom";
        });

        if (customMenu[0] === null) {
          return defaultClassList;
        }

        Tools.each(customMenu[0].items, function (format) {
          if ((editor.dom.is(selectedNode, format.selector) || matchesSelectorForNewElement(element, editor.selection.getNode(), format.selector, editor)) && format.classes) {
            Tools.each(format.classes, function (formatClass) {
              classList.push(formatClass);
            });
          }
        });

        return hasAdvancedFormatMenu(editor) ? classList : defaultClassList;
      };

      // Attempts to checks the selector up until the element since it hasn't been inserted into the editor yet
      var matchesSelectorForNewElement = function (element, selectedNode, selector, editor) {
        var customFormatSelector = trimmedLowerCased(selector);
        var selectorsInFormat = customFormatSelector.split(","); // account for grouped selectors

        for (var i = 0; i < selectorsInFormat.length; i++) {
          var selectorSpaceDelimitedArray = selectorsInFormat[i].split(" ");

          if (selectorSpaceDelimitedArray.length > 0) {

            var lastSubstringOfSelector = selectorSpaceDelimitedArray[selectorSpaceDelimitedArray.length - 1];

            // If the last substring does not include the element (img or a), continue to the next rule if the selector contains multiple rules
            if (lastSubstringOfSelector.indexOf(element) === -1) {
              continue;
            }

            if (doesNextCharAllowElementInclusion(lastSubstringOfSelector, element)) {
              var selectorWithoutElement = selectorsInFormat[i].replace(element, "");

              if (selectorWithoutElement.length === 0) {
                selectorWithoutElement = "*";
              }

              var matchesForNewElement = editor.dom.is(selectedNode, selectorWithoutElement);
              if (matchesForNewElement) {
                return true;
              }
            }
          }
        }
        return false;
      };

      var trimmedLowerCased = function (stringToConvert) {
        return stringToConvert.trim().toLowerCase();
      };

      // Checks if the element is followed by an "allowable" character :, [, . or #, or nothing. If so, than the element should be considered included in the selector
      var doesNextCharAllowElementInclusion = function (selectorSubstring, element) {
        var characterAfterElementRegex = new RegExp("/(?:^" + element + ")(.)/");
        var characterAfterElement = selectorSubstring.match(characterAfterElementRegex);
        var ELEMENT_IN_SELECTOR_ALLOWABLE_FOLLOWING_CHARACTERS = ["#", ":", ".", "["];

        return characterAfterElement === null || _.includes(ELEMENT_IN_SELECTOR_ALLOWABLE_FOLLOWING_CHARACTERS, characterAfterElement[0]);
      };

      var isInElementClassList = function (className, element, editorSettings) {
        return element === 'img' ? editorSettings.image_class_list.includes(className) : editorSettings.link_class_list.includes(className);
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