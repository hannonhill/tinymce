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
    'tinymce.plugins.link.api.Commands',
    'tinymce.plugins.link.core.Actions',
    'tinymce.plugins.link.core.Keyboard',
    'tinymce.plugins.link.ui.Controls'
  ],
  function (PluginManager, Commands, Actions, Keyboard, Controls) {
    PluginManager.add('link', function (editor) {
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

      Controls.setupButtons(editor);
      Controls.setupMenuItems(editor);
      Controls.setupContextToolbars(editor);
      Actions.setupGotoLinks(editor);
      Commands.register(editor);
      Keyboard.setup(editor);
    });

    return function () { };
  }
);
