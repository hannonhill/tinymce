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
          // matchNode returns the object or undefined if there's no match
          var selected = editor.formatter.matchNode(selectedNode, formatName, true) ? true : false;

          if (editor.dom.is(selectedNode, customFormat.selector)) {
            customFormat.selected = selected;
            customFormatList.push(customFormat);
          }
        });

        if (isCreatingNewElement) {
          editor.dom.remove(selectedNode);
        }

        return customFormatList.sort();
      };

      var generateFormatMultiSelectHtml = function (customStyleFormatsList, classList, editor) {
        var formatsForSelect = [];
        if (customStyleFormatsList.length) {
          formatsForSelect = getApplicableFormatsForElement(editor, 'img');
        }

        if (classList.length) {
          if (formatsForSelect.length) {
            formatsForSelect.push({ title: 'Other classes', isoptgroup: true });
          }

          formatsForSelect = formatsForSelect.concat(CascadeUtils.buildListItems(classList));
        }
        
        var listHtml = '<select id="customStyleFormatsSelect" multiple>';

        Tools.each(formatsForSelect, function (item) {
          var formatLabel = StringUtils.truncateListItemText(item.text || item.title, 50);
          if (item.isoptgroup) {
            listHtml += '<optgroup>' + formatLabel + '</optgroup>';
          } else {
            listHtml += '<option value="' + item.name + '"' + (item.selected ? ' selected' : '') + '>' + formatLabel + '</option>';
          }
        });

        listHtml += "</select>";

        return listHtml;
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

      return {
        getCustomStyleFormats: getCustomStyleFormats,
        getApplicableFormatsForElement: getApplicableFormatsForElement,
        generateFormatMultiSelectHtml: generateFormatMultiSelectHtml,
        mergeExistingClassesWithSelectedCustomFormats: mergeExistingClassesWithSelectedCustomFormats
      };
    }
);