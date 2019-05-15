/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.clive.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.clive.core.Nodes',
    'tinymce.plugins.clive.core.Utils'
  ],
  function (PluginManager, Nodes, Utils) {

    var Plugin = function (editor) {
      editor.on('preInit', function () {
        // Converts applicable script tags into placeholder images.
        editor.parser.addNodeFilter('script', Nodes.embedToPlaceHolderConverter(editor));

        // Replaces placeholder images with Clive's embed code.
        editor.serializer.addAttributeFilter('data-mce-clive-src', Nodes.placeHolderToEmbedConverter(editor));
      });

      this.registerChooserEvent = function () {
        var dom = editor.dom;
        var selection = editor.selection;
        var scriptElm = selection.getNode();
        var $cliveChooserButton = Utils.convertTinyMCEFieldToJqueryObject(this);
        var CliveChooser = $cliveChooserButton.data('cs.chooser') || $cliveChooserButton.cliveChooser().data('cs.chooser');
        var chosenItem = {};

        if (scriptElm) {
          chosenItem = {
            id: dom.getAttrib(scriptElm, 'data-mce-clive-id', ''),
            type: dom.getAttrib(scriptElm, 'data-mce-clive-type', '')
          };
        }

        CliveChooser.setChosen(chosenItem);

        $cliveChooserButton
          .off('cliveembed.cs.chooser.panel.tab')
          .on('cliveembed.cs.chooser.panel.tab', function (e, item) {
            // Attempt to insert the item.
            if (item) {
              Nodes.handleInsertCliveEmbedHtml(editor, item);
            }
          });
      };

      editor.addButton('clive', {
        icon: 'clive',
        tooltip: 'Clive',
        classes: 'clive-chooser',
        onclick: this.registerChooserEvent,
        stateSelector: ['img[data-mce-clive-src]']
      });

      editor.addMenuItem('clive', {
        icon: 'clive',
        text: 'Clive',
        classes: 'clive-chooser',
        onclick: this.registerChooserEvent,
        context: 'insert',
        stateSelector: ['img[data-mce-clive-src]']
      });
    };

    PluginManager.add('clive', Plugin);

    return function () { };
  }
);
