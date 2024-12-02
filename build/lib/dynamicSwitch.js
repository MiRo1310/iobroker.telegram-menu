"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var dynamicSwitch_exports = {};
__export(dynamicSwitch_exports, {
  dynamicSwitch: () => dynamicSwitch
});
module.exports = __toCommonJS(dynamicSwitch_exports);
var import_logging = require("./logging");
var import_utilities = require("./utilities");
async function dynamicSwitch(calledValue, device2Switch, text) {
  try {
    const changedCalledValue = await (0, import_utilities.checkStatusInfo)(calledValue);
    const splittedArray = changedCalledValue == null ? void 0 : changedCalledValue.replace(/"/g, "").split(":");
    if (!splittedArray) {
      return;
    }
    device2Switch = splittedArray[2];
    const arrayOfValues = splittedArray[1].replace("dynSwitch", "").replace(/\]/g, "").replace(/\[/g, "").split(",");
    const lengthOfRow = parseInt(splittedArray[3]) || 6;
    const array = [];
    const keyboard = { inline_keyboard: array };
    if (arrayOfValues) {
      let arrayOfEntriesDynamicSwitch = [];
      arrayOfValues.forEach((value, index) => {
        if (value.includes("|")) {
          const splittedValue = value.split("|");
          arrayOfEntriesDynamicSwitch.push({
            text: splittedValue[0],
            callback_data: `menu:dynS:${device2Switch}:${splittedValue[1]}`
          });
        } else {
          arrayOfEntriesDynamicSwitch.push({
            text: value,
            callback_data: `menu:dynS:${device2Switch}:${value}`
          });
        }
        if ((index + 1) % lengthOfRow == 0 && index != 0 && arrayOfValues.length > 0 || index + 1 == arrayOfValues.length) {
          keyboard.inline_keyboard.push(arrayOfEntriesDynamicSwitch);
          arrayOfEntriesDynamicSwitch = [];
        }
      });
      return { text, keyboard: JSON.stringify(keyboard), device: device2Switch };
    }
  } catch (e) {
    (0, import_logging.error)([
      { text: "Error parsing dynSwitch:", val: e.message },
      { text: "Stack:", val: e.stack }
    ]);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dynamicSwitch
});
//# sourceMappingURL=dynamicSwitch.js.map
