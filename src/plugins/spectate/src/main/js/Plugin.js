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
  'tinymce.plugins.spectate.Plugin',
  [
    'tinymce.core.html.Node',
    'tinymce.core.PluginManager',
    'tinymce.plugins.spectate.core.Nodes',
    'tinymce.plugins.spectate.ui.Dialog'
  ],
  function (Node, PluginManager, Nodes, Dialog) {
    var Plugin = function (editor) {
      editor.on('preInit', function () {
        // Converts div into placeholder images
        editor.parser.addNodeFilter('div', Nodes.placeHolderConverter(editor));

        // Replaces placeholder images with Spectate form's embed code.
        editor.serializer.addAttributeFilter('data-mce-spectate-form', function (nodes, name) {
          var i = nodes.length, node, realElm, fScriptElm, innerFScriptNode;
          var spectateDomain, spectateForm, spectateFScript, spectatePath;

          while (i--) {
            node = nodes[i];
            if (!node.parent) {
              continue;
            }

            // Make sure the required attributes are not empty.
            spectateDomain = node.attr('data-mce-spectate-domain') || '';
            spectateForm = node.attr('data-mce-spectate-form') || '';
            spectateFScript = node.attr('data-mce-spectate-fscript') || '';
            spectatePath = node.attr('data-mce-spectate-path') || '';
            if (spectateDomain === '' || spectateForm === '' || spectateFScript === '' || spectatePath === '') {
              continue;
            }

            // Create the div tag for the embed code.
            realElm = new Node('div', 1);
            realElm.attr({
              'class': node.attr('data-mce-object-class') || 'spectate-form',
              style: node.attr('data-mce-object-style') || null,
              'data-spectate-domain': spectateDomain,
              'data-spectate-form': spectateForm,
              'data-spectate-form-height': node.attr('height') || '500',
              'data-spectate-path': spectatePath
            });

            // Create the script tag for the embed code.
            fScriptElm = new Node('script', 1);
            fScriptElm.attr({
              type: 'text/javascript'
            });

            // Create the text node for the script tag's content.
            innerFScriptNode = new Node('#text', 3);
            innerFScriptNode.raw = true;
            innerFScriptNode.value = unescape(spectateFScript);

            // Append the text node and add the script tag after the div.
            fScriptElm.append(innerFScriptNode);

            // Insert the new script tag after the placeholder.
            node.parent.insert(fScriptElm, node);

            // Replace the placeholder with the div tag.
            node.replace(realElm);
          }
        });
      });

      this.showDialog = function () {
        Dialog.buildSpectateFormList(editor, Dialog.showDialog);
      };

      editor.addButton('spectate', {
        tooltip: 'Insert/edit Spectate Form',
        onclick: this.showDialog,
        stateSelector: ['img[data-mce-spectate-form]']
      });

      editor.addMenuItem('spectate', {
        text: 'Insert/edit Spectate Form',
        onclick: this.showDialog,
        context: 'insert',
        stateSelector: ['img[data-mce-spectate-form]']
      });
    };

    PluginManager.add('spectate', Plugin);

    return function () { };
  }
);
