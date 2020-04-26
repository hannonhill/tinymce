/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * @class tinymce.image.ui.Dialog
 * @private
 */
define(
  'tinymce.plugins.embeddedblocks.ui.Dialog',
  [
    'ephox.sand.api.URL',
    'global!document',
    'tinymce.core.util.JSON',
    'tinymce.core.util.Tools',
    'tinymce.core.util.XHR',
    'tinymce.plugins.embeddedblocks.core.Convert',
    'tinymce.plugins.embeddedblocks.core.Utils'
  ],
  function (URL, document, JSON, Tools, XHR, Convert, Utils) {
    return function (editor) {
      /*
       * Retrieves the HTML markup for the internal block chooser and calls the provided
       * callback function.
       *
       * The callback is necessary to create a synchronous method call which ensures
       * the AJAX completes before the embedded block dialog is shown.
       *
       * @param callback method to call on AJAX success/error.
       * @return function
       */
      function getChooserFieldHtml(callback) {
        var cascadeBlockChooserUrl = 'CONTEXT_PATH/wysiwyg/embeddedblockpopup.act?blockPath=<BLOCK_PATH>&currentSiteId=' + Utils.getGlobalCascadeVariable().Variables.get('currentSiteId');

        var selection = editor.selection, spanElm, blockPath;

        spanElm = selection.getNode();

        blockPath = spanElm ? spanElm.innerText : '';

        // Leave the chooser empty if the URL is external (ie doesn't start with site:// or /).
        if (!Utils.isInternalUrl(blockPath)) {
          blockPath = '';
        }

        XHR.send({
          url: cascadeBlockChooserUrl.replace('<BLOCK_PATH>', encodeURIComponent(blockPath)),
          error: function () {
            // In the event of an error, just return an empty string.
            callback('');
          },
          success: function (text) {
            callback(text);
          }
        });
      }

      function showDialog(blockChoserHtml) {
        var dom = editor.dom;
        var blockPath, chooserElm, spanElm, srcCtrl;

        function onSubmitForm() {
          var spanElmAttrs = {
            'class': 'mce-object-embeddedblock'
          };

          blockPath = Utils.chosenBlockToPseudoTag(editor);

          if (!blockPath) {
            editor.windowManager.alert("Please choose a block asset to insert.");
            return false;
          }

          editor.undoManager.transact(function () {
            if (!blockPath) {
              return;
            }

            if (!spanElm) {
              spanElmAttrs.id = '__mcenew';
              editor.focus();
              editor.selection.setContent(dom.createHTML('span', spanElmAttrs));
              spanElm = dom.get('__mcenew');
              dom.setAttrib(spanElm, 'id', null);
            } else {
              dom.setAttribs(spanElm, spanElmAttrs);
              spanElm.innerText = blockPath;
            }
          });
        }

        spanElm = editor.selection.getNode();

        if (spanElm &&
          (spanElm.nodeName !== 'SPAN' ||
            spanElm.getAttribute('class').indexOf('mce-object-embeddedblock'))) {
          spanElm = null;
        }

        if (spanElm) {
          blockPath = spanElm.innerText || '';
        }

        // General settings shared between simple and advanced dialogs
        var generalFormItems = [];

        // If the type-ahead HTML generation didn't fail, create the internal/external toggler and separate source controls.
        if (blockChoserHtml.length) {
          srcCtrl.label = null;

          // Turn the control into a container, with the original added as one of the items.
          srcCtrl = {
            type: 'container',
            name: 'sourceContainer',
            label: 'Block Path',
            minHeight: 60,
            items: [
              srcCtrl,
              {
                name: 'blockPathChooser',
                type: 'container',
                html: blockChoserHtml
              }
            ]
          };
        } else {
          srcCtrl = {
            name: 'blockPathField',
            type: 'textbox',
            size: 40,
            label: 'Block Path',
            value: blockPath
          };
        }

        generalFormItems.push(srcCtrl);

        // Simple default dialog
        editor.windowManager.open({
          title: 'Embed Block',
          body: generalFormItems,
          onSubmit: onSubmitForm
        });

        chooserElm = Utils.getInternalBlockChooser();
        Utils.setBlockAssetChooser(chooserElm.assetChooser().data('cs.chooser'), editor);
      }

      function open() {
        getChooserFieldHtml(showDialog);
      }

      return {
        open: open
      };
    };
  }
);
