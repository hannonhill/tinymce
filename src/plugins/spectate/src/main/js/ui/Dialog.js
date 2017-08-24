/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.spectate.ui.Dialog',
  [
    'tinymce.plugins.spectate.core.HtmlToData',
    'tinymce.core.util.JSON',
    'tinymce.core.util.Tools',
    'tinymce.core.util.XHR'
  ],
  function (HtmlToData, JSON, Tools, XHR) {
    /**
     * Loads the available forms and replaces the listbox's preloading
     * text with a menu containing a placeholder and new form list.
     *
     * @param {function} callback - The callback to execute
     */
    var buildSpectateFormList = function (editor, callback) {
      var cascadeFormListUrl = 'CONTEXT_PATH/ajax/getSpectateFormNames.act?api_key=';
      var formList = [];
      XHR.send({
        url: cascadeFormListUrl + editor.settings.spectate_key,
        error: function () {
          editor.windowManager.close();
          handleError('Unable to load available Spectate forms.', editor);
        },
        success: function (text) {
          var formsData = JSON.parse(text) || { errors: { error: text } };

          if (formsData.errors) {
            editor.windowManager.close();
            handleError('Unable to load available Spectate Forms: ' + formsData.errors.error, editor);
          }

          // Add an initial placeholder for new form embeds.
          formList.push({
            text: 'Select a Spectate form',
            value: ''
          });

          Tools.each(formsData.forms, function (formObj) {
            formList.push({
              text: formObj.form.name,
              value: formObj.form.id
            });
          });

          callback(editor, formList);
        }
      });
    };

    var handleError = function (errorMessage, editor) {
      editor.notificationManager.open({ type: 'error', text: errorMessage });
    };

    var getData = function (editor) {
      var element = editor.selection.getNode();

      return element.getAttribute('data-mce-spectate-form') ?
        HtmlToData.htmlToData(editor.serializer.serialize(element, { selection: true })) :
        {};
    };

    var selectPlaceholder = function (editor, beforeObjects) {
      var i;
      var y;
      var afterObjects = editor.dom.select('img[data-mce-spectate-form]');

      // Find new image placeholder so we can select it
      for (i = 0; i < beforeObjects.length; i++) {
        for (y = afterObjects.length - 1; y >= 0; y--) {
          if (beforeObjects[i] === afterObjects[y]) {
            afterObjects.splice(y, 1);
          }
        }
      }

      editor.selection.select(afterObjects[0]);
    };

    var handleInsert = function (editor, html) {
      var beforeObjects = editor.dom.select('img[data-mce-spectate-form]');

      editor.insertContent(html);
      selectPlaceholder(editor, beforeObjects);
      editor.nodeChanged();
    };

    var showDialog = function (editor, formList) {
      var win, data;

      /**
       * Retrieves the embed code for the selected Spectate form to insert, or
       * alerts the user if no form was selected.
       */
      var loadSpectateFormEmbed = function (callback) {
        var cascadeFormRenderUrl = 'CONTEXT_PATH/ajax/getSpectateFormCode.act?form_id=<FORM_ID>&api_key=';
        return function () {
          var selectedSpectateForm = win.find('#spectateform').value();

          if (selectedSpectateForm === '') {
            handleError('Please choose a Spectate form to insert.', editor);
          }

          XHR.send({
            url: cascadeFormRenderUrl.replace('<FORM_ID>', selectedSpectateForm) + editor.settings.spectate_key,
            error: function () {
              handleError('Could not load Spectate Form.', editor);
              callback(editor, '');
            },
            success: function (text) {
              var formData = JSON.parse(text) || { errors: { error: text } };

              if (formData.errors) {
                handleError('Spectate Form cannot be inserted: ' + formData.errors.error, editor);
                callback(editor, '');
              }

              // Attempt to insert the embed code.
              callback(editor, formData.form.embed_code_v2);
            }
          });
        };
      };

      data = getData(editor);

      win = editor.windowManager.open({
        title: 'Insert/edit Spectate Form',
        data: data,
        body: [
          {
            name: 'spectateform',
            label: 'Spectate Form',
            type: 'listbox',
            values: formList,
            minWidth: '325',
            onPostRender: function () {
              var selectedForm;

              Tools.each(formList, function (form) {
                if (form.value === parseInt(data.spectateform, 10)) {
                  selectedForm = form;
                }
              });

              // Preselect a form if found.
              this.value(selectedForm ? selectedForm.value : '');
            }
          }
        ],
        onSubmit: loadSpectateFormEmbed(handleInsert)
      });
    };

    return {
      buildSpectateFormList: buildSpectateFormList,
      showDialog: showDialog
    };
  }
);
