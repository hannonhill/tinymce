(function () {

var defs = {}; // id -> {dependencies, definition, instance (possibly undefined)}

// Used when there is no 'main' module.
// The name is probably (hopefully) unique so minification removes for releases.
var register_3795 = function (id) {
  var module = dem(id);
  var fragments = id.split('.');
  var target = Function('return this;')();
  for (var i = 0; i < fragments.length - 1; ++i) {
    if (target[fragments[i]] === undefined)
      target[fragments[i]] = {};
    target = target[fragments[i]];
  }
  target[fragments[fragments.length - 1]] = module;
};

var instantiate = function (id) {
  var actual = defs[id];
  var dependencies = actual.deps;
  var definition = actual.defn;
  var len = dependencies.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances[i] = dem(dependencies[i]);
  var defResult = definition.apply(null, instances);
  if (defResult === undefined)
     throw 'module [' + id + '] returned undefined';
  actual.instance = defResult;
};

var def = function (id, dependencies, definition) {
  if (typeof id !== 'string')
    throw 'module id must be a string';
  else if (dependencies === undefined)
    throw 'no dependencies for ' + id;
  else if (definition === undefined)
    throw 'no definition function for ' + id;
  defs[id] = {
    deps: dependencies,
    defn: definition,
    instance: undefined
  };
};

var dem = function (id) {
  var actual = defs[id];
  if (actual === undefined)
    throw 'module [' + id + '] was undefined';
  else if (actual.instance === undefined)
    instantiate(id);
  return actual.instance;
};

var req = function (ids, callback) {
  var len = ids.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances.push(dem(ids[i]));
  callback.apply(null, callback);
};

var ephox = {};

ephox.bolt = {
  module: {
    api: {
      define: def,
      require: req,
      demand: dem
    }
  }
};

var define = def;
var require = req;
var demand = dem;
// this helps with minificiation when using a lot of global references
var defineGlobal = function (id, ref) {
  define(id, [], function () { return ref; });
};
/*jsc
["tinymce.plugins.image.Plugin","tinymce.core.PluginManager","tinymce.core.util.Tools","tinymce.plugins.image.ui.Dialog","global!tinymce.util.Tools.resolve","tinymce.core.Env","tinymce.core.util.JSON","tinymce.core.util.XHR","tinymce.core.ui.Throbber","tinymce.plugins.image.core.Uploader","tinymce.plugins.image.core.Utils","global!Math","global!RegExp","global!document","tinymce.core.util.Promise"]
jsc*/
defineGlobal("global!tinymce.util.Tools.resolve", tinymce.util.Tools.resolve);
/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.PluginManager',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.PluginManager');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.Tools',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.Tools');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.Env',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.Env');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.JSON',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.JSON');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.XHR',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.XHR');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.ui.Throbber',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.ui.Throbber');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.Promise',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.Promise');
  }
);

defineGlobal("global!document", document);
/**
 * Uploader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This is basically cut down version of tinymce.core.file.Uploader, which we could use directly
 * if it wasn't marked as private.
 *
 * @class tinymce.image.core.Uploader
 * @private
 */
define(
  'tinymce.plugins.image.core.Uploader',
  [
    'tinymce.core.util.Promise',
    'tinymce.core.util.Tools',
    'global!document'
  ],
  function (Promise, Tools, document) {
    return function (settings) {
      var noop = function () {};

      function pathJoin(path1, path2) {
        if (path1) {
          return path1.replace(/\/$/, '') + '/' + path2.replace(/^\//, '');
        }

        return path2;
      }

      function defaultHandler(blobInfo, success, failure, progress) {
        var xhr, formData;

        xhr = new XMLHttpRequest();
        xhr.open('POST', settings.url);
        xhr.withCredentials = settings.credentials;

        xhr.upload.onprogress = function (e) {
          progress(e.loaded / e.total * 100);
        };

        xhr.onerror = function () {
          failure("Image upload failed due to a XHR Transport error. Code: " + xhr.status);
        };

        xhr.onload = function () {
          var json;

          if (xhr.status < 200 || xhr.status >= 300) {
            failure("HTTP Error: " + xhr.status);
            return;
          }

          json = JSON.parse(xhr.responseText);

          if (!json || typeof json.location != "string") {
            failure("Invalid JSON: " + xhr.responseText);
            return;
          }

          success(pathJoin(settings.basePath, json.location));
        };

        formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        xhr.send(formData);
      }

      function uploadBlob(blobInfo, handler) {
        return new Promise(function (resolve, reject) {
          try {
            handler(blobInfo, resolve, reject, noop);
          } catch (ex) {
            reject(ex.message);
          }
        });
      }

      function isDefaultHandler(handler) {
        return handler === defaultHandler;
      }

      function upload(blobInfo) {
        return (!settings.url && isDefaultHandler(settings.handler)) ? Promise.reject("Upload url missng from the settings.") : uploadBlob(blobInfo, settings.handler);
      }

      settings = Tools.extend({
        credentials: false,
        handler: defaultHandler
      }, settings);

      return {
        upload: upload
      };
    };
  }
);
defineGlobal("global!Math", Math);
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
  'tinymce.plugins.image.core.Utils',
  [
    'tinymce.core.util.Tools',
    'global!Math',
    'global!document'
  ],
  function (Tools, Math, document) {

    var getImageSize = function (url, callback) {
      var img = document.createElement('img');

      function done(width, height) {
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }

        callback({ width: width, height: height });
      }

      img.onload = function () {
        done(Math.max(img.width, img.clientWidth), Math.max(img.height, img.clientHeight));
      };

      img.onerror = function () {
        done();
      };

      var style = img.style;
      style.visibility = 'hidden';
      style.position = 'fixed';
      style.bottom = style.left = 0;
      style.width = style.height = 'auto';

      document.body.appendChild(img);
      img.src = url;
    };


    var buildListItems = function (inputList, itemCallback, startItems) {
      var truncateListItemText = function (str, n) {
        return str.length > n ? str.substr(0, n - 1) + '...' : str;
      };

      var appendItems = function (values, output) {
        var menuItem;
        output = output || [];

        Tools.each(values, function (item) {
          if (typeof item === 'string') {
            item = {
              text: item,
              value: item
            };
          }

          menuItem = {
            text: item.text || item.title
          };

          menuItem.text = truncateListItemText(menuItem.text, 50);

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

    var removePixelSuffix = function (value) {
      if (value) {
        value = value.replace(/px$/, '');
      }
      return value;
    };

    var addPixelSuffix = function (value) {
      if (value.length > 0 && /^[0-9]+$/.test(value)) {
        value += 'px';
      }
      return value;
    };

    var mergeMargins = function (css) {
      if (css.margin) {

        var splitMargin = css.margin.split(" ");

        switch (splitMargin.length) {
          case 1: //margin: toprightbottomleft;
            css['margin-top'] = css['margin-top'] || splitMargin[0];
            css['margin-right'] = css['margin-right'] || splitMargin[0];
            css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
            css['margin-left'] = css['margin-left'] || splitMargin[0];
            break;
          case 2: //margin: topbottom rightleft;
            css['margin-top'] = css['margin-top'] || splitMargin[0];
            css['margin-right'] = css['margin-right'] || splitMargin[1];
            css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
            css['margin-left'] = css['margin-left'] || splitMargin[1];
            break;
          case 3: //margin: top rightleft bottom;
            css['margin-top'] = css['margin-top'] || splitMargin[0];
            css['margin-right'] = css['margin-right'] || splitMargin[1];
            css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
            css['margin-left'] = css['margin-left'] || splitMargin[1];
            break;
          case 4: //margin: top right bottom left;
            css['margin-top'] = css['margin-top'] || splitMargin[0];
            css['margin-right'] = css['margin-right'] || splitMargin[1];
            css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
            css['margin-left'] = css['margin-left'] || splitMargin[3];
        }
        delete css.margin;
      }
      return css;
    };

    /**
     * Gets the AssetChooser property from the provided editor.
     *
     * @param {object} editor - The context editor
     * @return {object}
     */
    var getAssetChooser = function (editor) {
      return editor.ImageAssetChooser;
    };


    /**
     * Gets the chosen asset property from the provided editor's AssetChooser.
     *
     * @param {object} editor - The context editor
     * @return {object}
     */
    var getChosenFromAssetChooser = function (editor) {
      return getAssetChooser(editor).getAssetFromChosen();
    };


    /**
     * Adds the provided AssetChooser property to the provided editor.
     *
     * @param {object} assetChooser - The AssetChooser to set
     * @param {object} editor - The context editor
     * @return {object}
     */
    var setAssetChooser = function (assetChooser, editor) {
      editor.ImageAssetChooser = assetChooser;
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

    /**
     * Helper method that returns the chooser field itself.
     *
     * @return {jQuery}
     */
     /* global $ */
    var getInternalLinkChooser = function () {
      return $(document.getElementById('chooser-imageId'));
    };


    /**
     * Helper method that returns the hidden input containing the internally
     * chosen asset's path.
     *
     * @return {DOMElement}
     */
    var getInternalLinkChooserPathFieldElement = function () {
      return document.getElementById('imagePath');
    };

    /**
     * Turns an internal cache path into a render file path.
     *
     * Example: "/path/to/image.jpg" => "/render/file.act?path=/path/to/image.jpg"
     *
     * @param {string} path Path to convert to a render URL
     * @return {string}
     */
    var internalPathToRenderFileURL = function (path) {
      return path ? 'CONTEXT_PATH/render/file.act?path=' + encodeURI(path) : '';
    };

    /**
     * Helper method that determines if a URL is internal (ie Cascade trackable) or external.
     * A URL is internal if one of the following conditions is true:
     * - starts with a leading slash (/)
     * - starts with the site:// prefix
     *
     * @param {string} url URL to analyze
     * @return {boolean}
     */
    var isInternalUrl = function (url) {
      return url.match(/^(?:site:\/\/|\/)\w/) !== null;
    };

    return {
      getImageSize: getImageSize,
      buildListItems: buildListItems,
      removePixelSuffix: removePixelSuffix,
      addPixelSuffix: addPixelSuffix,
      mergeMargins: mergeMargins,
      getAssetChooser: getAssetChooser,
      getChosenFromAssetChooser: getChosenFromAssetChooser,
      setAssetChooser: setAssetChooser,
      getGlobalCascadeVariable: getGlobalCascadeVariable,
      getInternalLinkChooser: getInternalLinkChooser,
      getInternalLinkChooserPathFieldElement: getInternalLinkChooserPathFieldElement,
      internalPathToRenderFileURL: internalPathToRenderFileURL,
      isInternalUrl: isInternalUrl
    };
  }
);

defineGlobal("global!RegExp", RegExp);
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
  'tinymce.plugins.image.ui.Dialog',
  [
    'tinymce.core.Env',
    'tinymce.core.util.JSON',
    'tinymce.core.util.Tools',
    'tinymce.core.util.XHR',
    'tinymce.core.ui.Throbber',
    'tinymce.plugins.image.core.Uploader',
    'tinymce.plugins.image.core.Utils',
    'global!Math',
    'global!RegExp',
    'global!document'
  ],
  function (Env, JSON, Tools, XHR, Throbber, Uploader, Utils, Math, RegExp, document) {

    return function (editor) {
      /*
       * Retrieves the HTML markup for the internal file chooser and calls the provided
       * callback function.
       *
       * The callback is necessary to create a synchronous method call which ensures
       * the AJAX completes before the image dialog is shown.
       *
       * @param callback method to call on AJAX success/error.
       * @return function
       */
      function getTypeAheadFieldHtml(callback) {
        var cascadeImageChooserUrl = 'CONTEXT_PATH/imagepopup.act?src=<IMG_SRC>&currentSiteId=' + Utils.getGlobalCascadeVariable().Variables.get('currentSiteId');
        var selection = editor.selection, dom = editor.dom, imgElm, figureElm, src;

        imgElm = selection.getNode();

        // If the image is surrounded by a figure element, we need to get the image element within.
        figureElm = dom.getParent(imgElm, 'figure.image');
        if (figureElm) {
          imgElm = dom.select('img', figureElm)[0];
        }

        src = imgElm ? dom.getAttrib(imgElm, 'src') : '';

        // Leave the chooser empty if the URL is external (ie doesn't start with site:// or /).
        if (!Utils.isInternalUrl(src)) {
          src = '';
        }

        XHR.send({
          url: cascadeImageChooserUrl.replace('<IMG_SRC>', encodeURIComponent(src)),
          error: function () {
            // In the event of an error, just return an empty string.
            callback('');
          },
          success: function (text) {
            callback(text);
          }
        });
      }

      /**
       * Retrieves Title or Display Name for the provided image path and passes
       * it to the provided callback.
       *
       * @param {string} path - The path of the image
       * @param {function} callback - The callback to execute
       *
       */
      function getImageTitleOrDisplayName(path, callback) {
        XHR.send({
          url: 'CONTEXT_PATH/ajax/getAssetInfo.act?type=file&path=' + path,
          error: function () {
            // In the event of an error, just return an empty string.
            callback('');
          },
          success: function (data) {
            callback(data.dom ? data.dom.tOrDN : '');
          }
        });
      }

      function showDialog(typeAheadFieldHtml) {
        var win, data = {}, imgElm, figureElm, dom = editor.dom, settings = editor.settings;
        var width, height, classListCtrl, imageDimensions = settings.image_dimensions !== false;
        var chooserElm, srcCtrl;
        var isAltTextManuallyUpdated = false;

        /**
         * Toggles the disabled state of the alt control and description based on the state of the decorative
         * image checkbox.
         *
         * @param {boolean} focusDecorativeField - Whether or not the decorative field should be focused.
         */
        function toggleAltState(focusDecorativeField) {
          var altCtrl = win.find("#altContainer")[0];
          var altCtrlParent = altCtrl._parent;
          var altHelpTextParent = win.find("#altHelpText")[0]._parent;
          var decorativeCtrl = win.find("#decorative")[0];
          var isDecorative = decorativeCtrl.checked();

          focusDecorativeField = focusDecorativeField !== false;

          altCtrlParent[isDecorative ? 'hide' : 'show']();
          altHelpTextParent[isDecorative ? 'hide' : 'show']();

          if (focusDecorativeField) {
            decorativeCtrl.focus();
          }
        }

        /**
         * Toggles the visibility of the internal and external link controls
         * based on which checkbox is being clicked.
         */
        function toggleLinkFields() {
          var isTargetChecked = this.checked();
          var otherCheckbox = win.find('#' + (this.name() === 'source_type_internal' ? 'source_type_external' : 'source_type_internal'));

          // If clicking the same checkbox as the current source type, keep it checked and return.
          if (this.name() === 'source_type_' + data.source_type) {
            this.checked(true);
            return;
          }

          // Toggle the checked state of the two checkboxes.
          this.checked(isTargetChecked);
          otherCheckbox.checked(!isTargetChecked);

          // Toggle the visibility of the two fields and update the source type value.
          if (this.name() === 'source_type_internal' && this.checked()) {
            win.find('#internalSrc').show();
            win.find('#externalSrc').hide();
            data.source_type = 'internal';
          } else {
            win.find('#internalSrc').hide();
            win.find('#externalSrc').show();
            data.source_type = 'external';
          }

          onSrcChange();
        }

        function isTextBlock(node) {
          return editor.schema.getTextBlockElements()[node.nodeName];
        }

        function recalcSize() {
          var widthCtrl, heightCtrl, newWidth, newHeight;

          widthCtrl = win.find('#width')[0];
          heightCtrl = win.find('#height')[0];

          if (!widthCtrl || !heightCtrl) {
            return;
          }

          newWidth = widthCtrl.value();
          newHeight = heightCtrl.value();

          if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
            if (width != newWidth) {
              newHeight = Math.round((newWidth / width) * newHeight);

              if (!isNaN(newHeight)) {
                heightCtrl.value(newHeight);
              }
            } else {
              newWidth = Math.round((newHeight / height) * newWidth);

              if (!isNaN(newWidth)) {
                widthCtrl.value(newWidth);
              }
            }
          }

          width = newWidth;
          height = newHeight;
        }

        function updateStyle() {
          if (!editor.settings.image_advtab) {
            return;
          }

          var data = win.toJSON(),
            css = dom.parseStyle(data.style);

          css = Utils.mergeMargins(css);

          if (data.vspace) {
            css['margin-top'] = css['margin-bottom'] = Utils.addPixelSuffix(data.vspace);
          }
          if (data.hspace) {
            css['margin-left'] = css['margin-right'] = Utils.addPixelSuffix(data.hspace);
          }
          if (data.border) {
            css['border-width'] = Utils.addPixelSuffix(data.border);
          }

          win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
        }

        function updateVSpaceHSpaceBorder() {
          if (!editor.settings.image_advtab) {
            return;
          }

          var data = win.toJSON(),
            css = dom.parseStyle(data.style);

          win.find('#vspace').value("");
          win.find('#hspace').value("");

          css = Utils.mergeMargins(css);

          //Move opposite equal margins to vspace/hspace field
          if ((css['margin-top'] && css['margin-bottom']) || (css['margin-right'] && css['margin-left'])) {
            if (css['margin-top'] === css['margin-bottom']) {
              win.find('#vspace').value(Utils.removePixelSuffix(css['margin-top']));
            } else {
              win.find('#vspace').value('');
            }
            if (css['margin-right'] === css['margin-left']) {
              win.find('#hspace').value(Utils.removePixelSuffix(css['margin-right']));
            } else {
              win.find('#hspace').value('');
            }
          }

          //Move border-width
          if (css['border-width']) {
            win.find('#border').value(Utils.removePixelSuffix(css['border-width']));
          }

          win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
        }

        function waitLoad(imgElm) {
          function selectImage() {
            imgElm.onload = imgElm.onerror = null;

            if (editor.selection) {
              editor.selection.select(imgElm);
              editor.nodeChanged();
            }
          }

          imgElm.onload = function () {
            if (!data.width && !data.height && imageDimensions) {
              dom.setAttribs(imgElm, {
                width: imgElm.clientWidth,
                height: imgElm.clientHeight
              });
            }

            selectImage();
          };

          imgElm.onerror = selectImage;
        }

        function onSubmitForm() {
          var figureElm, oldImg;

          updateStyle();
          recalcSize();

          data = Tools.extend(data, win.toJSON());

          if (data.source_type_internal) {
            var internalSrcValue = Utils.getChosenFromAssetChooser(editor).path;
            var crossSite = internalSrcValue.match(/(.*):([^\/].*)/);

            if (internalSrcValue === '' || internalSrcValue === '/') {
              editor.windowManager.alert("Please choose an image asset to insert.");
              return false;
            }

            // If the source is cross-site, append the site:// prefix.
            data.src = crossSite ? 'site://' + crossSite[1] + '/' + crossSite[2] : internalSrcValue;

            // Add render file path to the source and encode the path.
            data.src = Utils.internalPathToRenderFileURL(data.src);
          } else {
            data.src = data.externalSrc;

            if (data.src === '' || data.src === 'http://') {
              editor.windowManager.alert("Please fill in the image URL.");
              return false;
            }
          }

          if (!data.alt) {
            data.alt = '';
          }

          if (!data.title) {
            data.title = '';
          }

          if (!data.decorative) {
            data.decorative = false;
          }

          if (data.width === '') {
            data.width = null;
          }

          if (data.height === '') {
            data.height = null;
          }

          if (!data.style) {
            data.style = null;
          }

          if (!data.decorative && !data.alt.length) {
            editor.windowManager.alert("Please provide an Image Description to ensure that your content is accessible. If this is a decorative image, please mark it as decorative.");
            return false;
          } else if (data.decorative) {
            data.alt = '';
          }

          // Setup new data excluding style properties
          /*eslint dot-notation: 0*/
          data = {
            src: data.src,
            alt: data.alt,
            title: data.title,
            width: data.width,
            height: data.height,
            style: data.style,
            caption: data.caption,
            "class": data["class"]
          };

          editor.undoManager.transact(function () {
            if (!data.src) {
              if (imgElm) {
                dom.remove(imgElm);
                editor.focus();
                editor.nodeChanged();
              }

              return;
            }

            if (data.title === "") {
              data.title = null;
            }

            if (!imgElm) {
              data.id = '__mcenew';
              editor.focus();
              editor.selection.setContent(dom.createHTML('img', data));
              imgElm = dom.get('__mcenew');
              dom.setAttrib(imgElm, 'id', null);
            } else {
              dom.setAttribs(imgElm, data);

              // setAttribs will remove the empty alt attribute, so we need to re-add it.
              if (!data.alt.length) {
                imgElm.setAttribute('alt', '');
              }
            }

            editor.editorUpload.uploadImagesAuto();

            if (data.caption === false) {
              if (dom.is(imgElm.parentNode, 'figure.image')) {
                figureElm = imgElm.parentNode;
                dom.insertAfter(imgElm, figureElm);
                dom.remove(figureElm);
              }
            }

            if (data.caption === true) {
              if (!dom.is(imgElm.parentNode, 'figure.image')) {
                oldImg = imgElm;
                imgElm = imgElm.cloneNode(true);
                figureElm = dom.create('figure', { 'class': 'image' });
                figureElm.appendChild(imgElm);
                figureElm.appendChild(dom.create('figcaption', { contentEditable: true }, 'Caption'));
                figureElm.contentEditable = false;

                var textBlock = dom.getParent(oldImg, isTextBlock);
                if (textBlock) {
                  dom.split(textBlock, oldImg, figureElm);
                } else {
                  dom.replace(figureElm, oldImg);
                }

                editor.selection.select(figureElm);
              }

              return;
            }

            waitLoad(imgElm);
          });
        }

        function onSrcChange(e) {
          // The value differs if the acting element is a TinyMCE control or a DOM Element.
          // A DOM Element is an internal path and needs to be converted to a render URL.
          //var value = e && e.control ? this.value() : UrlUtil.internalPathToRenderFileURL(this.value);
          var path = Utils.getChosenFromAssetChooser(editor).path;
          var value = data.source_type === 'external' ? win.find('#externalSrc')[0].value() : Utils.internalPathToRenderFileURL(path);

          Utils.getImageSize(value, function (data) {
            if (imageDimensions) {
              if (data.width && data.height) {
                width = data.width;
                height = data.height;
              } else {
                width = '';
                height = '';
              }

              win.find('#width').value(width);
              win.find('#height').value(height);
            }
          });

          if (!isAltTextManuallyUpdated && data.source_type === 'internal') {
            getImageTitleOrDisplayName(path, function (tOrDN) {
              if (tOrDN) {
                win.find('#alt').value(tOrDN);
              }
            });
          }
        }

        function altTextManuallyUpdated() {
          isAltTextManuallyUpdated = true;
        }

        imgElm = editor.selection.getNode();
        figureElm = dom.getParent(imgElm, 'figure.image');
        if (figureElm) {
          imgElm = dom.select('img', figureElm)[0];
        }

        if (imgElm &&
          (imgElm.nodeName != 'IMG' ||
            imgElm.getAttribute('data-mce-object') ||
            imgElm.getAttribute('data-mce-placeholder'))) {
          imgElm = null;
        }

        if (imgElm) {
          width = dom.getAttrib(imgElm, 'width');
          height = dom.getAttrib(imgElm, 'height');

          data = {
            src: dom.getAttrib(imgElm, 'src'),
            alt: dom.getAttrib(imgElm, 'alt'),
            title: dom.getAttrib(imgElm, 'title'),
            "class": dom.getAttrib(imgElm, 'class'),
            width: width,
            height: height,
            caption: !!figureElm
          };

          data.decorative = !data.alt.length;
        }

        if (editor.settings.image_class_list) {
          // Add a 'None' option to the beginning if it is not already present.
          if (typeof editor.settings.image_class_list[0] !== 'object') {
            // Using an object as opposed to a string so we can use an empty value.
            editor.settings.image_class_list.unshift({
              text: 'None',
              value: ''
            });
          }

          // If the images's initial class is not empty and not in the pre-defined list, add it so the user can retained the value.
          if (data['class'] && editor.settings.image_class_list.indexOf(data['class']) === -1) {
            editor.settings.image_class_list.push(data['class']);
          }

          classListCtrl = {
            name: 'class',
            type: 'listbox',
            label: 'Class',
            style: 'max-width:100%;', // Make sure the width of the listbox never extends past the width of the dialog.
            values: Utils.buildListItems(
              editor.settings.image_class_list,
              function (item) {
                if (item.value) {
                  item.textStyle = function () {
                    return editor.formatter.getCssText({ inline: 'img', classes: [item.value] });
                  };
                }
              }
            )
          };
        }

        data.source_type = imgElm === null || Utils.isInternalUrl(data.src) ? 'internal' : 'external';

        // General settings shared between simple and advanced dialogs
        var generalFormItems = [];

        // Initialize the external source control
        srcCtrl = {
          name: 'externalSrc',
          type: 'textbox',
          size: 40,
          label: 'Image',
          value: data.source_type === 'external' ? data.src : 'http://',
          onchange: onSrcChange
        };

        // If the type-ahead HTML generation didn't fail, create the internal/external toggler and separate source controls.
        if (typeAheadFieldHtml.length) {
          generalFormItems.push({
            type: 'container',
            label: 'Image Source',
            layout: 'flex',
            direction: 'row',
            align: 'center',
            spacing: 5,
            items: [
              {
                name: 'source_type_internal',
                type: 'checkbox',
                checked: data.source_type === 'internal',
                onclick: toggleLinkFields,
                text: 'Internal'
              },
              {
                name: 'source_type_external',
                type: 'checkbox',
                checked: data.source_type === 'external',
                onclick: toggleLinkFields,
                text: 'External'
              }
            ]
          });

          // Set the default visibility of the external source control.
          srcCtrl.hidden = data.source_type !== 'external';

          // Turn the control into a container, with the original added as one of the items.
          srcCtrl = {
            type: 'container',
            name: 'sourceContainer',
            label: 'Image',
            minHeight: 55,
            items: [
              srcCtrl,
              {
                name: 'internalSrc',
                type: 'container',
                hidden: data.source_type !== 'internal',
                html: typeAheadFieldHtml
              }
            ]
          };
        }

        generalFormItems.push(srcCtrl);

        if (editor.settings.image_description !== false) {
          generalFormItems.push({
            type: 'container',
            label: 'Decorative',
            layout: 'flex',
            direction: 'column',
            align: 'left',
            spacing: 5,
            items: [
              {
                name: 'decorative',
                type: 'checkbox',
                checked: data.decorative,
                onclick: toggleAltState,
                text: 'This is a decorative image, no description needed.'
              }
            ]
          });

          generalFormItems.push({
            type: 'container',
            label: 'Image description',
            name: 'altContainer',
            layout: 'flex',
            direction: 'column',
            align: 'left',
            spacing: 5,
            items: [
              {
                name: 'alt',
                type: 'textbox',
                size: 25,
                onchange: altTextManuallyUpdated
              }
            ]
          });

          generalFormItems.push({
            type: 'container',
            label: '',
            layout: 'flex',
            direction: 'column',
            align: 'center',
            spacing: 5,
            items: [
              {
                name: 'altHelpText',
                type: 'label',
                text: 'Image\'s title, display name or custom text',
                classes: 'image-decoration-help-block'
              }
            ]
          });
        }

        if (editor.settings.image_title) {
          generalFormItems.push({ name: 'title', type: 'textbox', label: 'Image Title' });
        }

        if (imageDimensions) {
          generalFormItems.push({
            type: 'container',
            label: 'Dimensions',
            layout: 'flex',
            direction: 'row',
            align: 'center',
            spacing: 5,
            items: [
              { name: 'width', type: 'textbox', maxLength: 5, size: 3, onchange: recalcSize, ariaLabel: 'Width' },
              { type: 'label', text: 'x' },
              { name: 'height', type: 'textbox', maxLength: 5, size: 3, onchange: recalcSize, ariaLabel: 'Height' },
              { name: 'constrain', type: 'checkbox', checked: true, text: 'Constrain proportions' }
            ]
          });
        }

        generalFormItems.push(classListCtrl);

        if (editor.settings.image_advtab || editor.settings.images_upload_url) {
          var advTabItems = [];

          if (editor.settings.image_caption && Env.ceFalse) {
            advTabItems.push({
              name: 'caption',
              type: 'checkbox',
              label: 'Figure/Caption',
              text: 'Use figure and figcaption for this image'
            });
          }

          var body = [
            {
              title: 'General',
              type: 'form',
              items: generalFormItems
            }
          ];

          if (editor.settings.image_advtab) {
            // Parse styles from img
            if (imgElm) {
              if (imgElm.style.marginLeft && imgElm.style.marginRight && imgElm.style.marginLeft === imgElm.style.marginRight) {
                data.hspace = Utils.removePixelSuffix(imgElm.style.marginLeft);
              }
              if (imgElm.style.marginTop && imgElm.style.marginBottom && imgElm.style.marginTop === imgElm.style.marginBottom) {
                data.vspace = Utils.removePixelSuffix(imgElm.style.marginTop);
              }
              if (imgElm.style.borderWidth) {
                data.border = Utils.removePixelSuffix(imgElm.style.borderWidth);
              }

              data.style = editor.dom.serializeStyle(editor.dom.parseStyle(editor.dom.getAttrib(imgElm, 'style')));
            }

            advTabItems.push({
              label: 'Style',
              name: 'style',
              type: 'textbox',
              onchange: updateVSpaceHSpaceBorder
            });

            advTabItems.push({
              type: 'form',
              layout: 'grid',
              packV: 'start',
              columns: 2,
              padding: 0,
              alignH: ['left', 'right'],
              defaults: {
                type: 'textbox',
                maxWidth: 50,
                onchange: updateStyle
              },
              items: [
                { label: 'Vertical space', name: 'vspace' },
                { label: 'Horizontal space', name: 'hspace' },
                { label: 'Border', name: 'border' }
              ]
            });

            body.push({
              title: 'Advanced',
              type: 'form',
              pack: 'start',
              items: advTabItems
            });
          }

          // Advanced dialog shows general+advanced tabs
          win = editor.windowManager.open({
            title: 'Insert/edit image',
            data: data,
            bodyType: 'tabpanel',
            body: body,
            onSubmit: onSubmitForm
          });
        } else {
          // Simple default dialog
          win = editor.windowManager.open({
            title: 'Insert/edit image',
            data: data,
            body: generalFormItems,
            onSubmit: onSubmitForm
          });
        }

        toggleAltState(false);

        chooserElm = Utils.getInternalLinkChooser();
        Utils.setAssetChooser(chooserElm.assetChooser().data('cs.chooser'), editor);

        // Call srcChange on chooser clear and submission.
        chooserElm.on('clear.cs.chooser submit.cs.chooser.panel', onSrcChange);
      }

      function open() {
        getTypeAheadFieldHtml(showDialog);
      }

      return {
        open: open
      };
    };
  }
);

/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the image plugin.
 *
 * @class tinymce.image.Plugin
 * @private
 */
define(
  'tinymce.plugins.image.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.core.util.Tools',
    'tinymce.plugins.image.ui.Dialog'
  ],
  function (PluginManager, Tools, Dialog) {
    PluginManager.add('image', function (editor) {

      editor.on('preInit', function () {
        function hasImageClass(node) {
          var className = node.attr('class');
          return className && /\bimage\b/.test(className);
        }

        function toggleContentEditableState(state) {
          return function (nodes) {
            var i = nodes.length, node;

            function toggleContentEditable(node) {
              node.attr('contenteditable', state ? 'true' : null);
            }

            while (i--) {
              node = nodes[i];

              if (hasImageClass(node)) {
                node.attr('contenteditable', state ? 'false' : null);
                Tools.each(node.getAll('figcaption'), toggleContentEditable);
              }
            }
          };
        }

        editor.parser.addNodeFilter('figure', toggleContentEditableState(true));
        editor.serializer.addNodeFilter('figure', toggleContentEditableState(false));
      });

      editor.addButton('image', {
        icon: 'image',
        tooltip: 'Insert/edit image',
        onclick: Dialog(editor).open,
        stateSelector: 'img:not([data-mce-object],[data-mce-placeholder]),figure.image'
      });

      editor.addMenuItem('image', {
        icon: 'image',
        text: 'Image',
        onclick: Dialog(editor).open,
        context: 'insert',
        prependToContext: true
      });

      editor.addCommand('mceImage', Dialog(editor).open);
    });

    return function () { };
  }
);
dem('tinymce.plugins.image.Plugin')();
})();
