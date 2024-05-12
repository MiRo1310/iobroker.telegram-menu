"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendToTelegram = require("./telegram").sendToTelegram;
const utilities = require("./utilities");
const { setDynamicValue } = require("./dynamicValue");
const { decomposeText } = require("./global");
/**
 * Sets the state
 * @param {*} _this
 * @param {object} part Part of the menu
 * @param {string} userToSend User to send the message to
 * @param {*} valueFromSubmenu Value from the submenu
 * @param {boolean} SubmenuValuePriority If true the value from the submenu will be used else the value from the switch
 * @param {string} telegramInstance Instance of telegram
 * @param {boolean} resize_keyboard
 * @param {boolean} one_time_keyboard
 * @param {[]} userListWithChatID
 * @returns Returns an array with the ids to set
 */
async function setstate(_this, part, userToSend, valueFromSubmenu, SubmenuValuePriority, telegramInstance, resize_keyboard, one_time_keyboard, userListWithChatID) {
    try {
        const setStateIds = [];
        part.switch?.forEach((/** @type {{ id: string; value: *; toggle:boolean; confirm:Boolean; returnText: string; parse_mode: string }} */ element) => {
            _this.log.debug("Element to set " + JSON.stringify(element));
            let ack = false;
            let returnText = element.returnText;
            if (element["ack"]) {
                _this.log.debug("Set ack: " + JSON.stringify(element["ack"]));
                if (element.ack === "true")
                    ack = true;
            }
            if (returnText.includes("{setDynamicValue")) {
                const confirmText = setDynamicValue(_this, returnText, ack, element.id, userToSend, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, element.parse_mode, element.confirm);
                if (element.confirm)
                    return setStateIds.push({
                        id: element.id,
                        confirm: element.confirm,
                        returnText: confirmText,
                        userToSend: userToSend,
                    });
            }
            if (!returnText.includes("{'id':'")) {
                setStateIds.push({
                    id: element.id,
                    confirm: element.confirm,
                    returnText: returnText,
                    userToSend: userToSend,
                    parse_mode: element.parse_mode,
                });
                _this.log.debug("setStateIds" + JSON.stringify(setStateIds));
            }
            else {
                try {
                    _this.log.debug("ReturnText " + JSON.stringify(returnText));
                    returnText = returnText.replaceAll("'", '"');
                    const textToSend = returnText.slice(0, returnText.indexOf("{"));
                    const returnObj = JSON.parse(returnText.slice(returnText.indexOf("{"), returnText.indexOf("}") + 1));
                    // Den Rest des Strings wieder anhängen
                    returnObj.text = returnObj.text + returnText.slice(returnText.indexOf("}") + 1);
                    sendToTelegram(_this, userToSend, textToSend, undefined, telegramInstance, one_time_keyboard, resize_keyboard, userListWithChatID, element.parse_mode);
                    _this.log.debug("JSON parse: " + JSON.stringify(returnObj));
                    setStateIds.push({
                        id: returnObj.id,
                        confirm: true,
                        returnText: returnObj.text,
                        userToSend: userToSend,
                    });
                    _this.log.debug("setStateIds" + JSON.stringify(setStateIds));
                }
                catch (e) {
                    _this.log.error("Error parsing returnObj: " + JSON.stringify(e.message));
                    _this.log.error(JSON.stringify(e.stack));
                }
            }
            if (element.toggle) {
                _this.log.debug("Toggle");
                _this
                    .getForeignStateAsync(element.id)
                    .then((val) => {
                    if (val)
                        _this.setForeignStateAsync(element.id, !val.val, ack);
                })
                    .catch((e) => {
                    _this.log.error(JSON.stringify(e.message));
                    _this.log.error(JSON.stringify(e.stack));
                });
            }
            else {
                setValue(_this, element.id, element.value, SubmenuValuePriority, valueFromSubmenu, ack);
            }
        });
        return setStateIds;
    }
    catch (error) {
        _this.log.error("Error Switch" + JSON.stringify(error.message));
        _this.log.error(JSON.stringify(error.stack));
    }
}
const setValue = async (_this, id, value, SubmenuValuePriority, valueFromSubmenu, ack) => {
    let valueToSet;
    SubmenuValuePriority ? (valueToSet = valueFromSubmenu) : (valueToSet = await isDynamicValueToSet(_this, value));
    utilities.checkTypeOfId(_this, id, valueToSet).then((val) => {
        valueToSet = val;
        _this.log.debug("Value to Set: " + JSON.stringify(valueToSet));
        _this.setForeignStateAsync(id, valueToSet, ack);
    });
};
const isDynamicValueToSet = async (_this, value) => {
    console.log("Value to set: " + value);
    if (value.includes("{id:")) {
        const result = decomposeText(value, "{id:", "}");
        const id = result.substring.replace("{id:", "").replace("}", "");
        const textWithoutSubstring = result.textWithoutSubstring;
        const newValue = await _this.getForeignStateAsync(id);
        return textWithoutSubstring + newValue.val;
    }
    return value;
};
module.exports = {
    setstate,
};
//# sourceMappingURL=setstate.js.map