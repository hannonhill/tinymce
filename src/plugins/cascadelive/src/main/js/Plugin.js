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
  'tinymce.plugins.cascadelive.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.cascadelive.core.Nodes',
    'tinymce.plugins.cascadelive.core.Utils'
  ],
  function (PluginManager, Nodes, Utils) {

    var Plugin = function (editor) {
      editor.on('preInit', function () {
        // Converts applicable script tags into placeholder images.
        editor.parser.addNodeFilter('script', Nodes.embedToPlaceHolderConverter(editor));

        // Replaces placeholder images with Cascade Live's embed code.
        editor.serializer.addAttributeFilter('data-mce-cascadelive-src', Nodes.placeHolderToEmbedConverter(editor));
      });

      this.registerChooserEvent = function () {
        var $cascadeLiveChooserButton = Utils.convertTinyMCEFieldToJqueryObject(this);
        $cascadeLiveChooserButton
          .off('cascadeliveembed.cs.chooser.panel.tab')
          .on('cascadeliveembed.cs.chooser.panel.tab', function (e, item) {
            // Insert the item's embed code
            if (item && item.embed) {
              Nodes.handleInsertCascadeLiveEmbedHtml(editor, item.embed);
            }
          });
      };

      editor.addButton('cascadelive', {
        tooltip: 'Browse Cascade Live',
        onclick: this.registerChooserEvent,
        stateSelector: ['img[data-mce-cascadelive-src]']
      });

      editor.addMenuItem('cascadelive', {
        text: 'Browse Cascade Live',
        onclick: this.registerChooserEvent,
        context: 'insert',
        stateSelector: ['img[data-mce-cascadelive-src]']
      });
    };

    PluginManager.add('cascadelive', Plugin);

    return function () { };
  }
);
