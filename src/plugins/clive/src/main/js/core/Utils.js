/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * @class tinymce.image.core.Utils
 * @private
 */
define(
  'tinymce.plugins.clive.core.Utils',
  [
    'global!$'
  ],
  function ($) {

    /**
     * Helper method that converts the provided TinyMCE field into a jQuery object.
     * If the field passed does not exist, an empty jQuery object will be returned.
     *
     * @param {tinymce.ui.Control} tinymceField
     * @return {jQuery}
     */
    var convertTinyMCEFieldToJqueryObject = function (tinymceField) {
      var element = tinymceField ? tinymceField.getEl() : null;
      return $(element);
    };

    return {
      convertTinyMCEFieldToJqueryObject: convertTinyMCEFieldToJqueryObject
    };
  }
);
