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
  'tinymce.plugins.link.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.link.core.Actions',
    'tinymce.plugins.link.ui.Controls'
  ],
  function (PluginManager, Actions, Controls) {
    PluginManager.add('link', function (editor) {
      Controls.setupButtons(editor);
      Controls.setupMenuItems(editor);
      Controls.setupContextToolbars(editor);
      Actions.setupGotoLinks(editor);

      // Hook into the editor's preInit callback to add some custom parser filters.
      editor.on('preInit', function () {
        // Removes data atributes added for internal links when the editor's source code is requested.
        editor.serializer.addAttributeFilter('data-mce-asset-id', function (nodes, name) {
          var i = nodes.length, node;
          while (i--) {
            node = nodes[i];
            node.attr('data-mce-asset-id', null);
            node.attr('data-mce-asset-type', null);
          }
        });
      });

      editor.addShortcut('Meta+K', '', Actions.openDialog(editor));
      editor.addCommand('mceLink', Actions.openDialog(editor));
    });

    return function () { };
  }
);
