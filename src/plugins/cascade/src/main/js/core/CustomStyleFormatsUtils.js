/**
 * CustomStyleFormatsUtils.js
 *
 */
define(
  'tinymce.plugins.cascade.core.CustomStyleFormatsUtils',
  [
    'tinymce.core.util.Tools',
    'tinymce.core.util.JSON',
    'tinymce.plugins.cascade.core.Utils',
    'tinymce.plugins.cascade.core.StringUtils'
  ],
    function (Tools, JSON, CascadeUtils, StringUtils) {
      var buildOptionGroup = function (optionLabel, optionList) {
        if (!Tools.isArray(optionList) || !optionList.length) {
          return '';
        }

        var result = '<optgroup label="' + optionLabel + '">';
        result += buildSelectionOptions(optionList);
        result += '</optgroup>';

        return result;
      };

      var buildSelectionOptions = function (items) {
        var result = '';
        Tools.each(items, function (item) {
          result += buildSelectionOption(item);
        });
        return result;
      };

      var buildSelectionOption = function (item) {
        var formatLabel = StringUtils.truncateListItemText(item.text || item.title, 50);
        return '<option value="' + item.name + '"' + (item.selected ? ' selected' : '') + ' data-item=\'' + JSON.serialize(item) + '\'>' + formatLabel + '</option>';
      };

      var getCustomStyleFormats = function (editor) {
        return editor.getParam('custom_style_formats', []);
      };

      var getApplicableFormatsForElement = function (editor, element) {
        var customStyleFormats = getCustomStyleFormats(editor);
        var customFormatList = [];
        var selectedNode = editor.selection.getNode();
        var isCreatingNewElement = CascadeUtils.isCreatingNewElement(element, editor);

        if (isCreatingNewElement) {
          selectedNode = CascadeUtils.createTemporaryElement(editor, element);
        }

        Tools.each(customStyleFormats, function (customFormat) {
          var formatName = customFormat.name;
          var selected = editor.formatter.matchNode(selectedNode, formatName, false) ? true : false;

          if (editor.dom.is(selectedNode, customFormat.selector)) {
            customFormat.selected = selected;
            customFormat.type = "format";
            customFormatList.push(customFormat);
          }
        });

        if (isCreatingNewElement) {
          editor.dom.remove(selectedNode);
        }

        return customFormatList.sort();
      };

      var generateClassMultiSelectHtml = function (classList, existingClasses) {
        var classesForSelect = CascadeUtils.buildListItems(classList);

        Tools.each(classesForSelect, function (item) {
          item.selected = existingClasses.includes(item.value);
        });

        return getHtmlForMultiSelect("formatSelect", [], classesForSelect);
      };

      var generateFormatMultiSelectHtml = function (customStyleFormatsList, existingClasses, element, editor) {
        var formatsForSelect = [];
        var classList = [];
        var classesForSelect = [];

        if (customStyleFormatsList.length) {
          formatsForSelect = getApplicableFormatsForElement(editor, element);
        }

        classList = populateExistingClassList(existingClasses);

        if (classList.length) {
          classesForSelect = getUniqueNonFormatClassesForSelect(formatsForSelect, classList);

          // These are existing classes applied to the element, so default them to selected.
          Tools.each(classesForSelect, function (item) {
            item.selected = true;
          });
        }

        return getHtmlForMultiSelect("formatSelect", formatsForSelect, classesForSelect);
      };

      var getUniqueNonFormatClassesForSelect = function (formatsForSelect, classList) {
        var uniqueClassList = [];
        var possibleFormatClassNames = {};

        Tools.each(formatsForSelect, function (format) {
          if (format.classes) {
            Tools.each(format.classes, function (className) {
              possibleFormatClassNames[className] = true;
            });
          }
        });

        Tools.each(classList, function (className) {
          if (!possibleFormatClassNames[className]) {
            uniqueClassList.push(className);
          }
        });

        return CascadeUtils.buildListItems(uniqueClassList);
      };

      var populateExistingClassList = function (existingClasses) {
        var classList = [];

        if (!existingClasses) {
          return classList;
        }

        if (Array.isArray(existingClasses)) {
          classList = classList.concat(existingClasses);
        } else if (existingClasses.length) {
          var existingClassesArray = existingClasses.split(' ');
          classList = classList.concat(existingClassesArray);
        }

        return classList;
      };

      var getHtmlForMultiSelect = function (selectFieldId, formatsForSelect, classesForSelect) {
        if (!formatsForSelect.length && !classesForSelect.length) {
          return '';
        }

        var listHtml = '<select id="' + selectFieldId + '" multiple>';
        var addOptGroups = classesForSelect.length && formatsForSelect.length;

        if (addOptGroups) {
          listHtml += buildOptionGroup("Formats", formatsForSelect);
          listHtml += buildOptionGroup("Other Classes", classesForSelect);
        } else {
          listHtml += buildSelectionOptions(formatsForSelect);
          listHtml += buildSelectionOptions(classesForSelect);
        }

        listHtml += '</select>';

        return listHtml;
      };

      var generateClassNamesFromSelectedFormatOptions = function (selectedOptions) {
        var newImageClasses = [];

        // Iterate over selected options and append their associated classes.
        Tools.each(selectedOptions, function (option) {
          var itemData = JSON.parse(option.getAttribute('data-item'));
          if (itemData.type === 'class' && !newImageClasses.includes(itemData.name)) {
            newImageClasses.push(itemData.name);
          } else if (itemData.type === 'format' && itemData.classes) {
            Tools.each(itemData.classes, function (className) {
              if (!newImageClasses.includes(className)) {
                newImageClasses.push(className);
              }
            });
          }
        });

        return newImageClasses;
      };

      var getFormatInlineStyles = function (selectedOptions) {
        var newInlineStyles = [];

        // Iterate over selected formats and append their associated styles.
        Tools.each(selectedOptions, function (option) {
          var itemData = JSON.parse(option.getAttribute('data-item'));
          if (itemData.styles) {
            // Styles are stored as objects, with the CSS property as a key
            var inlineStylesForFormat = itemData.styles;
            Tools.each(Object.keys(inlineStylesForFormat), function (stylePropertyKey) {
              var inlineStyle = stylePropertyKey + ": " + inlineStylesForFormat[stylePropertyKey];
              if (!newInlineStyles.includes(inlineStyle)) {
                newInlineStyles.push(inlineStyle);
              }
            });
          }
        });

        return newInlineStyles;
      };

      return {
        getCustomStyleFormats: getCustomStyleFormats,
        getApplicableFormatsForElement: getApplicableFormatsForElement,
        generateFormatMultiSelectHtml: generateFormatMultiSelectHtml,
        generateClassNamesFromSelectedFormatOptions: generateClassNamesFromSelectedFormatOptions,
        getFormatInlineStyles: getFormatInlineStyles,
        generateClassMultiSelectHtml: generateClassMultiSelectHtml
      };
    }
);