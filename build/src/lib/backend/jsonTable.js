"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTextTableFromJson = exports.createKeyboardFromJson = void 0;
const global_1 = require("./global");
const logging_1 = require("./logging");
const lastText = {};
const createKeyboardFromJson = (val, text, id, user) => {
    try {
        if (text) {
            lastText[user] = text;
        }
        else {
            text = lastText[user];
        }
        const array = (0, global_1.decomposeText)(text, "{json:", "}").substring.split(";");
        const headline = array[2];
        const itemArray = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
        let idShoppingList = false;
        if (array.length > 3 && array[3] == "shoppinglist") {
            idShoppingList = true;
        }
        let valArray = [];
        (0, logging_1.debug)([
            { text: "Val:", val },
            { text: "Type of Val:", val },
        ]);
        if (typeof val == "string") {
            valArray = JSON.parse(val);
        }
        else {
            valArray = val;
        }
        const keyboard = [];
        valArray.forEach((element, index) => {
            const firstRow = [];
            const rowArray = [];
            itemArray.forEach((item) => {
                if (index == 0) {
                    const btnText = item.split(":")[1];
                    if (btnText.length > 0) {
                        firstRow.push({ text: btnText, callback_data: "1" });
                    }
                }
                if (idShoppingList) {
                    const value = element["buttondelete"];
                    const valueDeleteLinkArray = (0, global_1.decomposeText)(value, "('", "')").substring.replace("('", "").replace(",true')", "").split(".");
                    const instanceAlexa = valueDeleteLinkArray[1];
                    const valueDeleteId = valueDeleteLinkArray[5];
                    const instanceShoppingListID = id.split(".")[1] + "." + id.split(".")[2];
                    rowArray.push({
                        text: element[item.split(":")[0]],
                        callback_data: `sList:${instanceShoppingListID}:${instanceAlexa}:${valueDeleteId}:`,
                    });
                }
                else {
                    rowArray.push({ text: element[item.split(":")[0]], callback_data: "1" });
                }
            });
            if (index == 0) {
                keyboard.push(firstRow);
            }
            keyboard.push(rowArray);
        });
        const inline_keyboard = { inline_keyboard: keyboard };
        (0, logging_1.debug)([{ text: "keyboard:", val: inline_keyboard }]);
        return { text: headline, keyboard: JSON.stringify(inline_keyboard) };
    }
    catch (err) {
        (0, logging_1.error)([
            { text: "Error createKeyboardFromJson:", val: err.message },
            { text: "Stack:", val: err.stack },
        ]);
    }
};
exports.createKeyboardFromJson = createKeyboardFromJson;
async function createTextTableFromJson(val, textToSend) {
    try {
        if (!val) {
            return;
        }
        const substring = (0, global_1.decomposeText)(textToSend, "{json:", "}").substring;
        const array = substring.split(";");
        const itemArray = array[1].replace("[", "").replace("]", "").replace(/"/g, "").split(",");
        const valArray = JSON.parse(val);
        // Array für die Größte Länge der Items
        const lengthArray = [];
        // Trägt für jedes Item einen Eintrag im lengthArray ein
        itemArray.forEach((element) => {
            lengthArray.push(element.split(":")[1].length);
        });
        valArray.forEach((element) => {
            itemArray.forEach((item, index) => {
                if (lengthArray[index] < element[item.split(":")[0]].toString().length) {
                    lengthArray[index] = element[item.split(":")[0]].toString().length;
                }
            });
        });
        (0, logging_1.debug)([{ text: "Length of rows", val: lengthArray }]);
        const headline = array[2];
        let textTable = textToSend.replace(substring, "").trim();
        if (textTable != "") {
            textTable += " \n\n";
        }
        textTable += " " + headline + " \n`";
        const enlargeColumn = 1;
        const reduce = lengthArray.length == 1 ? 2 : 0;
        const lineLenght = lengthArray.reduce((a, b) => a + b, 0) + 5 - reduce + enlargeColumn * lengthArray.length;
        // Breakline
        textTable += "-".repeat(lineLenght) + " \n";
        valArray.forEach((element, elementIndex) => {
            itemArray.forEach((item, index) => {
                // TableHead
                if (elementIndex == 0 && index == 0) {
                    textTable += "|";
                    itemArray.forEach((item2, i) => {
                        if (item2.split(":")[1].length > 0) {
                            textTable +=
                                " " +
                                    item2
                                        .split(":")[1]
                                        .toString()
                                        .padEnd(lengthArray[i] + enlargeColumn, " ") +
                                    "|";
                            if (i == itemArray.length - 1) {
                                textTable += "\n";
                                // Breakline
                                textTable += "-".repeat(lineLenght) + " \n";
                            }
                        }
                        else {
                            textTable = textTable.slice(0, -1);
                        }
                    });
                }
                // TableBody
                if (index == 0) {
                    textTable += "|";
                }
                textTable += " " + element[item.split(":")[0]].toString().padEnd(lengthArray[index] + enlargeColumn, " ") + "|";
                if (index == itemArray.length - 1) {
                    textTable += "\n";
                }
            });
        });
        // Breakline
        textTable += "-".repeat(lineLenght);
        textTable += "`";
        return textTable;
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error createTextTableFromJson:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.createTextTableFromJson = createTextTableFromJson;
//# sourceMappingURL=jsonTable.js.map