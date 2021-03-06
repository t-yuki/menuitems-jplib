/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict'

const windowUtils = require("window-utils");
const menuitems = require("menuitems");
const { Cc, Ci } = require("chrome");

const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let window = windowUtils.activeBrowserWindow;
let document = window.document;
function $(id) document.getElementById(id);

function createMI(options, test) {
  test.assertEqual(!$(options.id), true);
  var mi = new menuitems.Menuitem(options);
  return mi;
}

exports.testMIDoesNotExist = function(test) {
  var options = {
    id: "test-mi-dne",
    label: "test"
  };
  createMI(options, test);
  test.assertEqual(!!$(options.id), false, 'menuitem does not exists');
};

exports.testMIDoesExist = function(test) {
  var options = {
    id: "test-mi-exists",
    label: "test",
    menuid: 'menu_FilePopup'
  };
  let mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');
  test.assertEqual(menuitem.id, options.id, 'menuitem id is ok');
  test.assertEqual(menuitem.getAttribute('label'), options.label, 'menuitem label is ok');
  test.assertEqual(menuitem.parentNode.id, options.menuid, 'in the file menu');
  test.assertEqual(menuitem.getAttribute('disabled'), 'false', 'menuitem not disabled');
  test.assertEqual(menuitem.getAttribute('accesskey'), '', 'menuitem accesskey is ok');
  test.assertEqual(menuitem.getAttribute('class'), '', 'menuitem class is ok');
  test.assertEqual(menuitem.nextSibling, undefined, 'menuitem is last');
  test.assertEqual(menuitem.getAttribute("checked"), 'false', 'menuitem not checked');
  test.assertEqual(menuitem.getAttribute('autocheck'), 'false', 'menuitem autocheck is false');
  test.assertEqual(menuitem.hasAttribute('type'), false, 'menuitem hasn\'t explicit type');
  test.assertEqual(menuitem.hasAttribute('observes'), false, 'menuitem don\'t observe anything');
  mi.destroy();
  test.assert(!$(options.id), 'menuitem is gone');
  test.assertEqual(menuitem.parentNode, null, 'menuitem has no parent');
};

exports.testMIOnClick = function(test) {
  test.waitUntilDone();

  let options = {
    id: "test-mi-onclick",
    label: "test",
    menuid: 'menu_FilePopup',
    onCommand: function() {
      mi.destroy();
      test.pass('onCommand worked!');
      test.done();
    }
  };

  let e = document.createEvent("UIEvents");
  e.initUIEvent("command", true, true, window, 1);

  var mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');
  menuitem.dispatchEvent(e);
};

exports.testMIDisabled = function(test) {
  test.waitUntilDone();

  let commandIsOK = false;
  let count = 0;
  let options = {
    id: "test-mi-disabled",
    label: "test",
    disabled: true,
    menuid: 'menu_FilePopup',
    onCommand: function() {
      count++;
      if (!commandIsOK) {
        test.fail('onCommand was called, that is not ok');
        return;
      }

      mi.destroy();
      test.assertEqual(count, 1, 'onCommand was called the correct number of times!');
      test.done();
    }
  };

  let e = document.createEvent("UIEvents");
  e.initUIEvent("command", true, true, window, 1);

  var mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');
  test.assertEqual(menuitem.getAttribute('disabled'), 'true', 'menuitem disabled');
  menuitem.dispatchEvent(e);
  mi.disabled = false;
  test.assertEqual(menuitem.getAttribute('disabled'), 'false', 'menuitem not disabled');
  commandIsOK = true;
  menuitem.dispatchEvent(e);
};

exports.testMIChecked = function(test) {
  let options = {
    id: "test-mi-checked",
    label: "test",
    disabled: true,
    menuid: 'menu_FilePopup',
    checked: true
  };

  let mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');
  test.assertEqual(menuitem.getAttribute("checked"), "true", 'menuitem checked');
  mi.checked = false;
  test.assertEqual(menuitem.getAttribute("checked"), "false", 'menuitem checked');
  mi.destroy();
};

exports.testMIClass = function(test) {
  let options = {
    id: "test-mi-class",
    label: "pizazz",
    className: "pizazz",
    menuid: 'menu_FilePopup',
  };

  var mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');
  test.assertEqual(menuitem.getAttribute('class'), 'pizazz', 'menuitem not disabled');
  mi.destroy();
};

exports.testInsertBeforeExists = function(test) {
  let options = {
    id: 'test-mi-insertbefore',
    label: 'insertbefore',
    insertbefore:'menu_FileQuitItem',
    menuid: 'menu_FilePopup',
  };

  var mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');
  test.assertEqual(menuitem.nextSibling, $('menu_FileQuitItem'), 'menuitem not disabled');
  mi.destroy();
};

exports.testInsertBeforeDoesNotExist = function(test) {
  let options = {
    id: 'test-mi-insertbefore',
    label: 'insertbefore',
    insertbefore:'menu_ZZZDNE',
    menuid: 'menu_FilePopup',
  };

  var mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');
  test.assertEqual(menuitem.nextSibling, null, 'menuitem not disabled');
  mi.destroy();
};

exports.testMICheckboxOnClick = function(test) {
  test.waitUntilDone();

  let options = {
    id: "test-mi-checkbox-onclick",
    label: "test",
    menuid: 'menu_FilePopup',
    type: "checkbox",
    autocheck: false,
    checked: false,
    accesskey: 'z',
    onCommand: function() {
      test.assertEqual(menuitem.getAttribute("checked"), 'false', 'menuitem has not been checked automatically');
      test.assertEqual(mi.checked, false, 'menuitem has not been checked automatically');
      mi.destroy();
      test.pass('onclick worked!');
      test.done();
    }
  };

  var mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');

  var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  var win = wm.getMostRecentWindow(null);
  $(options.menuid).openPopupAtScreen(0, 0, false);
  var utils = win.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
  utils.sendKeyEvent("keypress", Ci.nsIDOMKeyEvent.DOM_VK_Z, Ci.nsIDOMKeyEvent.DOM_VK_Z, null);
};

exports.testMICheckboxOnClickWithAutoCheck = function(test) {
  test.waitUntilDone();

  let options = {
    id: "test-mi-checkbox-onclick-autocheck",
    label: "test",
    menuid: 'menu_FilePopup',
    type: "checkbox",
    autocheck: true,
    checked: false,
    accesskey: 'z',
    onCommand: function() {
      test.assertEqual(menuitem.getAttribute("checked"), 'true', 'menuitem has been checked automatically');
      test.assertEqual(mi.checked, true, 'menuitem has been checked automatically');
      mi.destroy();
      test.pass('autocheck worked!');
      test.done();
    }
  };

  var mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');

  var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  var win = wm.getMostRecentWindow(null);
  $(options.menuid).openPopupAtScreen(0, 0, false);
  var utils = win.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
  utils.sendKeyEvent("keypress", Ci.nsIDOMKeyEvent.DOM_VK_Z, Ci.nsIDOMKeyEvent.DOM_VK_Z, null);
};

exports.testMICheckboxObserves = function(test) {
  var broadcaster = window.document.createElementNS(NS_XUL, "broadcaster");
  broadcaster.setAttribute("id", "menuitemObservesTestBroadcaster");
  broadcaster.setAttribute("label", "MenuitemObservesTest");
  var parent = window.document.getElementById("mainBroadcasterSet");
  parent.insertBefore(broadcaster, null)

  let options = {
    id: "test-mi-checkbox-onclick-observes",
    observes: "menuitemObservesTestBroadcaster",
    menuid: 'menu_FilePopup'
  };

  var mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');

  test.assertEqual(menuitem.getAttribute("label"), "MenuitemObservesTest")
  broadcaster.setAttribute("label", "MenuitemObservesTest2");
  test.assertEqual(menuitem.getAttribute("label"), "MenuitemObservesTest2")

  parent.removeChild(broadcaster);
};
