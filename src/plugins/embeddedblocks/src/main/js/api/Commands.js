/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.embeddedblocks.api.Commands',
  [
    'tinymce.plugins.embeddedblocks.ui.Dialog'
  ],
  function (Dialog) {
    var register = function (editor) {
      editor.addCommand('mceEmbedBlock', Dialog(editor).open);
    };

    return {
      register: register
    };
  }
);
