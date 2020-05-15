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
    'tinymce.plugins.cascade.core.StringUtils',
    'tinymce.plugins.cascade.core.ObjectUtils',
    'tinymce.plugins.cascade.core.InlineStylesUtils'
  ],
    function (Tools, JSON, CascadeUtils, StringUtils, ObjectUtils, InlineStylesUtils) {
      var buildOptionGroup = function (optionList) {
        if (!Tools.isArray(optionList) || !optionList.length) {
          return '';
        }
        var optionLabel = 'Custom Formats';

        if (optionList[0].type === 'class') {
          optionLabel = 'CSS Classes';
        }

        var result = '<optgroup label="' + optionLabel + '">';
        result += buildSelectionOptions(ObjectUtils.sortByProperty(optionList, 'name'));
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
        var formatLabel = StringUtils.truncate(item.text || item.title, 50);
        return '<option value="' + item.name + '"' + (item.selected ? ' selected' : '') + ' data-item=\'' + JSON.serialize(item) + '\'>' + formatLabel + '</option>';
      };

      var determineClassNamesFromFormat = function (format) {
        if (format.type === 'class') {
          return [format.name];
        } else if (format.type === 'format' && Tools.isArray(format.classes)) {
          return format.classes;
        }

        return [];
      };

      var determineFormatFromOptionElement = function (optionElement) {
        return JSON.parse(optionElement.getAttribute('data-item'));
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

      var getUniqueNonFormatClassesForSelect = function (formatsForSelect, classList, itemModifyCallback) {
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
            if (itemModifyCallback) {
              itemModifyCallback(item);
            }

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
          classList = classList.concat(existingClasses.trim().split(' '));
        }

        return CascadeUtils.buildListItems(classList, function (item) {
          item.type = 'class';
        });
      };

      var getHtmlForMultiSelect = function (formatsForSelect, classesForSelect) {
        if (!formatsForSelect.length && !classesForSelect.length) {
          return '';
        }

        var listHtml = '<select id="formatSelect" multiple>';

        listHtml += buildOptionGroup(formatsForSelect);
        listHtml += buildOptionGroup(classesForSelect);

        listHtml += '</select>';

        return listHtml;
      };

      var mergeInlineStylesFromFormats = function (formats) {
        var mergedStyles = {};

        Tools.each(formats, function (option) {
          var format = determineFormatFromOptionElement(option);
          if (format.type === 'format' && format.styles) {
            Tools.each(format.styles, function (style, key) {
              mergedStyles[key] = style;
            });
          }
        });

        return mergedStyles;
      };

      return {
        getCustomStyleFormats: getCustomStyleFormats,
        generateFormatMultiSelectHtml: function (customStyleFormatsList, existingClasses, element, editor) {
          var formatsForSelect = [];
          var classList = [];
          var classesForSelect = [];

          if (customStyleFormatsList.length) {
            formatsForSelect = getApplicableFormatsForElement(editor, element);
          }

          classList = populateClassList(existingClasses);

          if (classList.length) {
            classesForSelect = getUniqueNonFormatClassesForSelect(formatsForSelect, classList, function (item) {
              item.selected = true;
            });
          }

          return getHtmlForMultiSelect(formatsForSelect, classesForSelect);
        },

        generateClassNamesFromSelectedFormatOptions: function (selectedOptions) {
          var newClasses = [];

          // Iterate over selected options and append their associated classes.
          Tools.each(selectedOptions, function (option) {
            var format = determineFormatFromOptionElement(option);
            var formatClassNames = determineClassNamesFromFormat(format);

            Tools.each(formatClassNames, function (className) {
              if (!newClasses.includes(className)) {
                newClasses.push(className);
              }
            });
          });

          return newClasses;
        },

        generateClassMultiSelectHtml: function (formatClassList, existingClasses) {
          var populatedExistingClassList = populateClassList(existingClasses);
          var populatedFormatClassList = populateClassList(formatClassList);
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

          return getHtmlForMultiSelect(classesForSelect);
        },
        mergeSelectedFormatStylesWithExistingStyles: function (options, existingStyles) {
          var selectedOptions = getSelectedFormatOptions(options);
          var mergedSelectedStyles = mergeInlineStylesFromFormats(selectedOptions);

          if (existingStyles && Tools.trim(existingStyles).length) {
            var unselectedOptions = getUnselectedFormatOptions(options);
            var mergedUnselectedStyles = mergeInlineStylesFromFormats(unselectedOptions);
            var parsedExistingStyles = InlineStylesUtils.parse(Tools.trim(existingStyles));

            Tools.each(parsedExistingStyles, function (style, key) {
              var isUnselectedFormatStyle = StringUtils.isEqual(style, mergedUnselectedStyles[key]);
              if (isUnselectedFormatStyle || mergedSelectedStyles[key]) {
                return;
              }

              mergedSelectedStyles[key] = style;
            });
          }

          return InlineStylesUtils.serialize(mergedSelectedStyles);
        },
        getFormatHelpText: function () {
          return '<span class="help-block">Ctrl/Cmd + click to select multiple formats</span>';
        },
        getSelectedFormatOptions: getSelectedFormatOptions
      };
    }
);