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
["tinymce.plugins.spectate.Plugin","tinymce.core.html.Node","tinymce.core.PluginManager","tinymce.plugins.spectate.core.Nodes","tinymce.plugins.spectate.ui.Dialog","global!tinymce.util.Tools.resolve","tinymce.core.Env","tinymce.plugins.spectate.core.HtmlToData","tinymce.core.util.JSON","tinymce.core.util.Tools","tinymce.core.util.XHR","tinymce.core.html.SaxParser"]
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
  'tinymce.core.html.Node',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.html.Node');
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
  'tinymce.core.Env',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.Env');
  }
);

/**
 * Nodes.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.spectate.core.Nodes',
  [
    'tinymce.core.html.Node',
    'tinymce.core.Env'
  ],
  function (Node, Env) {
    var placeHolderConverter = function (editor) {
      return function (nodes) {
        var i = nodes.length;
        var node, nodeClass, fScriptTextNode, placeHolder;

        while (i--) {
          node = nodes[i];
          if (!node.parent) {
            continue;
          }

          // Make sure we're dealing with a div with the 'spectate-form' class
          nodeClass = node.attr('class') || '';
          if (nodeClass.indexOf('spectate-form') === -1) {
            continue;
          }

          // Get the text contents of script element, which may be wrapped in a p depending on how the embed code was inserted (ie button vs html editor).
          // getAll('#text') will return the text content of the script tag at either level.
          fScriptTextNode = node.next.getAll('#text')[0] || null;

          // Test to see if a text node was returned and the value contains the string "spectate" just to be safe.
          if (!fScriptTextNode || fScriptTextNode.value.indexOf('spectate') === -1) {
            continue;
          }

          // Remove the following node, which should be the script portion of the embed code.
          node.next.remove();

          // Create the placeholder image tag and record the embed code information as data attributes.
          placeHolder = new Node('img', 1);
          placeHolder.shortEnded = true;
          placeHolder.attr({
            width: '100%',
            height: node.attr('data-spectate-form-height') || '500',
            style: 'background-image:url(\'CONTEXT_PATH/assets/img/logo-spectate-dark.svg\');background-size:25%;',
            src: Env.transparentSrc,
            'data-mce-placeholder': '',
            'data-mce-object-class': node.attr('class'),
            'data-mce-object-style': node.attr('style'),
            'data-mce-spectate-domain': node.attr('data-spectate-domain'),
            'data-mce-spectate-form': node.attr('data-spectate-form'),
            'data-mce-spectate-path': node.attr('data-spectate-path'),
            'data-mce-spectate-fscript': escape(fScriptTextNode.value),
            'class': 'mce-object mce-object-spectate'
          });

          // Replace the div tag with the new placeholder.
          node.replace(placeHolder);
        }
      };
    };

    return {
      placeHolderConverter: placeHolderConverter
    };
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
  'tinymce.core.html.SaxParser',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.html.SaxParser');
  }
);

/**
 * HtmlToData.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.spectate.core.HtmlToData',
  [
    'tinymce.core.util.Tools',
    'tinymce.core.html.SaxParser'
  ],
  function (Tools, SaxParser) {
    var htmlToData = function (html) {
      var data = {};

      new SaxParser({
        validate: false,
        start: function (name, attrs) {
          if (name === "div") {
            data = Tools.extend(attrs.map, data);
          }
        }
      }).parse(html);

      data.spectateform = data['data-spectate-form'];

      return data;
    };

    return {
      htmlToData: htmlToData
    };
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
              var self = this;

              Tools.each(formList, function (form) {
                // Preselect a form if found and terminate the loop.
                if (form.value === parseInt(data.spectateform, 10)) {
                  self.value(form.value);
                  return false;
                }
              });
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

dem('tinymce.plugins.spectate.Plugin')();
})();
