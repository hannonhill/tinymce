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
      var sortFormatsByName = function (formatA, formatB) {
        var nameA = formatA.name.toUpperCase();
        var nameB = formatB.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      };

      var buildOptionGroup = function (optionLabel, optionList) {
        if (!Tools.isArray(optionList) || !optionList.length) {
          return '';
        }

        var result = '<optgroup label="' + optionLabel + '">';
        result += buildSelectionOptions(optionList.sort(sortFormatsByName));
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

      var getSelectedFormatOptions = function (options) {
        var result = [];
        if (!options || !options.length) {
          return result;
        }

        for (var i = 0; i < options.length; i++) {
          if (options[i].selected) {
            result.push(options[i]);
          }
        }

        return result;
      };

      var getUnselectedFormatOptions = function (options) {
        var result = [];
        if (!options || !options.length) {
          return result;
        }

        for (var i = 0; i < options.length; i++) {
          if (!options[i].selected) {
            result.push(options[i]);
          }
        }

        return result;
      };

      var serializeFormatStyles = function (formatStyles) {
        var result = [];
        Tools.each(Object.keys(formatStyles), function (key) {
          result.push(key + ': ' + formatStyles[key]);
        });
        return result.join('; ');
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

        return customFormatList;
      };

      var generateClassMultiSelectHtml = function (classList, existingClasses) {
        var populatedExistingClassList = populateClassList(existingClasses);
        var populatedFormatClassList = populateClassList(classList);
        var possibleClassNameMap = {};
        var classesForSelect = [];

        // Pre-select unique existing classes
        Tools.each(populatedExistingClassList, function (item) {
          if (!possibleClassNameMap[item.name]) {
            item.selected = true;
            possibleClassNameMap[item.name] = true;
            classesForSelect.push(item);
          }
        });

        // Add remaining classes available through simple format class list
        Tools.each(populatedFormatClassList, function (item) {
          if (!possibleClassNameMap[item.name]) {
            classesForSelect.push(item);
          }
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

        classList = populateClassList(existingClasses);

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

        Tools.each(classList, function (item) {
          if (!possibleFormatClassNames[item.name]) {
            uniqueClassList.push(item);
          }
        });

        return uniqueClassList;
      };

      var populateClassList = function (existingClasses) {
        var classList = [];

        if (!existingClasses || !existingClasses.length) {
          return classList;
        }

        if (Array.isArray(existingClasses)) {
          classList = classList.concat(existingClasses);
        } else if (existingClasses.length) {
          classList = classList.concat(existingClasses.split(' '));
        }

        return CascadeUtils.buildListItems(classList, function (item) {
          item.type = 'class';
        });
      };

      var getHtmlForMultiSelect = function (selectFieldId, formatsForSelect, classesForSelect) {
        if (!formatsForSelect.length && !classesForSelect.length) {
          return '';
        }

        var listHtml = '<select id="' + selectFieldId + '" multiple>';

        listHtml += buildOptionGroup("Custom Formats", formatsForSelect);
        listHtml += buildOptionGroup("Classes", classesForSelect);

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

      var mergeFormatStyles = function (formats) {
        var mergedStyles = {};

        Tools.each(formats, function (option) {
          var itemData = JSON.parse(option.getAttribute('data-item'));
          if (itemData.type === 'format' && itemData.styles) {
            Tools.each(Object.keys(itemData.styles), function (styleKey) {
              mergedStyles[styleKey] = itemData.styles[styleKey];
            });
          }
        });

        return mergedStyles;
      };

      var parseFormatStylesString = function (stylesString) {
        var stylesObject = {};

        if (!stylesString || !stylesString.length) {
          return stylesObject;
        }

        var splitStyles = stylesString.split(';');
        Tools.each(splitStyles, function (style) {
          var styleParts = style.split(':');
          if (styleParts.length === 2) {
            stylesObject[styleParts[0].trim()] = styleParts[1].trim();
          }
        });

        return stylesObject;
      };

      var mergeSelectedFormatStylesWithExistingStyles = function (options, existingStyles) {
        var selectedOptions = getSelectedFormatOptions(options);
        var mergedSelectedStyles = mergeFormatStyles(selectedOptions);

        if (existingStyles && existingStyles.trim().length) {
          var unselectedOptions = getUnselectedFormatOptions(options);
          var mergedUnselectedStyles = mergeFormatStyles(unselectedOptions);
          var parsedExistingStyles = parseFormatStylesString(existingStyles.trim());

          Tools.each(Object.keys(parsedExistingStyles), function (key) {
            var isUnselectedFormatStyle = mergedUnselectedStyles[key] && parsedExistingStyles[key].toLowerCase() === mergedUnselectedStyles[key].toLowerCase();
            if (isUnselectedFormatStyle || mergedSelectedStyles[key]) {
              return;
            }

            mergedSelectedStyles[key] = parsedExistingStyles[key];
          });
        }

        return serializeFormatStyles(mergedSelectedStyles);
      };

      return {
        getCustomStyleFormats: getCustomStyleFormats,
        getApplicableFormatsForElement: getApplicableFormatsForElement,
        generateFormatMultiSelectHtml: generateFormatMultiSelectHtml,
        generateClassNamesFromSelectedFormatOptions: generateClassNamesFromSelectedFormatOptions,
        generateClassMultiSelectHtml: generateClassMultiSelectHtml,
        mergeSelectedFormatStylesWithExistingStyles: mergeSelectedFormatStylesWithExistingStyles,
        getSelectedFormatOptions: getSelectedFormatOptions
      };
    }
);