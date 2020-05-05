/**
 * CustomStyleFormatsUtils.js
 *
 */
define(
  'tinymce.plugins.cascade.core.CustomStyleFormatsUtils',
  [
    'tinymce.core.util.Tools',
    'tinymce.plugins.cascade.core.Utils',
    'tinymce.plugins.cascade.core.StringUtils'
  ],
    function (Tools, CascadeUtils, StringUtils) {
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
        var listHtml = '<select id="customClassesSelect" multiple>';

        Tools.each(classesForSelect, function (item) {
          item.selected = existingClasses.includes(item.value);
          item.name = item.value;
          listHtml += buildSelectionOption(item);
        });
        listHtml += '</select>';
        return listHtml;
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
          classesForSelect = getUniqueClassesForSelect(formatsForSelect, classList);
        }

        return getHtmlForMultiSelect(formatsForSelect, classesForSelect);
      };

      var getUniqueClassesForSelect = function (formatsForSelect, classList) {
        var uniqueClassList = [];
        var classesForSelect = [];

        Tools.each(classList, function (className) {
          var isUniqueClass = true;

          for (var i = 0; i < formatsForSelect.length; i++) {
            var format = formatsForSelect[i];

            if (format.classes) {
              if (format.classes.indexOf(className) >= 0) {
                isUniqueClass = false;
                break;
              }
            }
          }

          if (isUniqueClass) {
            uniqueClassList.push(className);
          }
        });

        if (uniqueClassList.length) {
          classesForSelect = CascadeUtils.buildListItems(uniqueClassList);
        }

        return classesForSelect;
      };

      var populateExistingClassList = function (existingClasses) {
        var classList = [];

        if (existingClasses !== undefined) {
          if (Array.isArray(existingClasses)) {
            classList = classList.concat(existingClasses);
          } else if (existingClasses.length) {
            var existingClassesArray = existingClasses.split(' ');
            classList = classList.concat(existingClassesArray);
          }
        }

        return classList;
      };

      var getHtmlForMultiSelect = function (formatsForSelect, classesForSelect) {
        var listHtml = '<select id="customStyleFormatsSelect" multiple>';
        var addOptGroups = classesForSelect.length && formatsForSelect.length;

        if (addOptGroups) {
          listHtml += buildOptionGroup("Formats");
        }

        Tools.each(formatsForSelect, function (item) {
          listHtml += buildSelectionOption(item);
        });

        if (addOptGroups) {
          listHtml += '</optgroup>';
        }

        if (addOptGroups) {
          listHtml += buildOptionGroup("Other Classes");
        }

        Tools.each(classesForSelect, function (item) {
          item.selected = true;
          listHtml += buildSelectionOption(item);
        });

        if (addOptGroups) {
          listHtml += closeOptionGroup();
        }
        listHtml += '</select>';

        return listHtml;
      };

      var buildOptionGroup = function (optionLabel) {
        return '<optgroup label="' + optionLabel + '">';
      };

      var closeOptionGroup = function () {
        return '</optgroup>';
      };

      var buildSelectionOption = function (item) {
        var formatLabel = StringUtils.truncateListItemText(item.text || item.title, 50);
        return '<option value="' + item.name + '"' + (item.selected ? ' selected' : '') + '>' + formatLabel + '</option>';
      };

      var mergeExistingClassesWithSimpleFormats = function (existingClasses, selectedClasses, classList) {
        var newClasses = [];

        if (existingClasses !== undefined) {
          var existingClassArray = existingClasses.split(' ');

          Tools.each(existingClassArray, function (existingClass) {
            if (!classList.includes(existingClass)) {
              newClasses.push(existingClass);
            }
          });
        }

        Tools.each(selectedClasses, function (selectedClass) {
          if (!newClasses.includes(selectedClass)) {
            newClasses.push(selectedClass);
          }
        });

        return newClasses;
      };

      var mergeExistingClassesWithSelectedCustomFormats = function (existingClasses, selectedCustomFormatNames, customStyleFormats) {
        var customFormatsByName = {};
        var possibleCustomFormatClassNames = {};

        // Map style formats by name and build a deduped lookup table of possible class names.
        Tools.each(customStyleFormats, function (customFormat) {
          customFormatsByName[customFormat.name] = customFormat;
          Tools.each(customFormat.classes, function (className) {
            possibleCustomFormatClassNames[className] = true;
          });
        });

        var newImageClasses = [];
        var existingClassesArray = Tools.explode(existingClasses, ' ');

        // Remove all classes associated with custom style formats so we're left with ones that were manually added.
        Tools.each(existingClassesArray, function (className) {
          if (!possibleCustomFormatClassNames[className]) {
            newImageClasses.push(className);
          }
        });

        // Iterate over selected formats and append their associated classes.
        Tools.each(selectedCustomFormatNames, function (customFormatName) {
          if (customFormatsByName[customFormatName] && customFormatsByName[customFormatName].classes) {
            newImageClasses = newImageClasses.concat(customFormatsByName[customFormatName].classes);
          }
        });

        // Generate a unique list of classes.
        var uniqueImageClasses = [];
        Tools.each(newImageClasses, function (className) {
          if (!uniqueImageClasses.includes(className)) {
            uniqueImageClasses.push(className);
          }
        });

        return uniqueImageClasses;
      };

      var getFormatInlineStyles = function (selectedCustomFormatNames, customStyleFormats) {
        var newInlineStyles = [];
        var customFormatsByName = {};

        Tools.each(customStyleFormats, function (customFormat) {
          customFormatsByName[customFormat.name] = customFormat;
        });

        // Iterate over selected formats and append their associated styles.
        Tools.each(selectedCustomFormatNames, function (customFormatName) {
          if (customFormatsByName[customFormatName] && customFormatsByName[customFormatName].styles) {
            // Styles are stored as objects, with the CSS property as a key
            var inlineStylesForFormat = customFormatsByName[customFormatName].styles;
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
        mergeExistingClassesWithSelectedCustomFormats: mergeExistingClassesWithSelectedCustomFormats,
        mergeExistingClassesWithSimpleFormats: mergeExistingClassesWithSimpleFormats,
        getFormatInlineStyles: getFormatInlineStyles,
        generateClassMultiSelectHtml: generateClassMultiSelectHtml
      };
    }
);