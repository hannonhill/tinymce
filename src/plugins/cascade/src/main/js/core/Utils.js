/**
 * Utils.js
 *
 */
define(
  'tinymce.plugins.cascade.core.Utils',
  [
    'tinymce.core.util.Tools',
    'tinymce.plugins.cascade.core.StringUtils'
  ],
  function (Tools, StringUtils) {
    var isCreatingNewElement = function (element, editor) {
      var selectedNode = editor.selection.getNode();
      return selectedNode.nodeName.toLowerCase() !== element;
    };

    var createTemporaryElement = function (editor, element) {
      var addedElement = editor.dom.create(element, {});
      editor.selection.getNode().append(addedElement);
      return addedElement;
    };

    var prepareClassListForListItems = function (classList, data) {
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

    var buildListItems = function (inputList, itemCallback, startItems) {
      var appendItems = function (values, output) {
        var menuItem;
        output = output || [];

        Tools.each(values, function (item) {
          if (typeof item === 'string') {
            item = {
              text: item,
              name: item,
              value: item,
              type: 'class'
            };
          }

          menuItem = {
            name: item.name,
            type: item.type || '',
            text: item.text || item.title
          };

          menuItem.text = StringUtils.truncateListItemText(menuItem.text, 50);

          if (item.menu) {
            menuItem.menu = appendItems(item.menu);
          } else {
            menuItem.value = item.value;

            if (itemCallback) {
              itemCallback(menuItem);
            }
          }

          output.push(menuItem);
        });

        return output;
      };

      return appendItems(inputList, startItems || []);
    };

    /**
     * Helper method that converts the provided TinyMCE field into a jQuery object.
     * If the field passed does not exist, an empty jQuery object will be returned.
     *
     * @param {tinymce.ui.Control} tinymceField
     * @return {jQuery}
     */
     /* global $ */
    var convertTinyMCEFieldToJqueryObject = function (tinymceField) {
      var element = tinymceField ? tinymceField.getEl() : null;
      return $(element);
    };

    /**
     * Helper method that returns the global Cascade variable.
     *
     * @return {object}
     */
     /* global Cascade */
    var getGlobalCascadeVariable = function () {
      return Cascade;
    };

    return {
      isCreatingNewElement: isCreatingNewElement,
      createTemporaryElement: createTemporaryElement,
      buildListItems: buildListItems,
      prepareClassListForListItems: prepareClassListForListItems,
      convertTinyMCEFieldToJqueryObject: convertTinyMCEFieldToJqueryObject,
      getGlobalCascadeVariable: getGlobalCascadeVariable
    };
  }
);