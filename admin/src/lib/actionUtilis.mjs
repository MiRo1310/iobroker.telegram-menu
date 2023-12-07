import { deepCopy, sortArray, deleteDoubleEntrysInArray } from "./Utilis.mjs";

function createData(element, index, rowElements) {
	const obj = {};
	rowElements.forEach((entry) => {
		obj[entry.name] = element[entry.name][index];
	});
	return obj;
}
let rows = [];
function getRows(element, rowElements) {
	if (!element) return;
	rows = [];
	const trigger = element.trigger[0];
	const generateBy = rowElements.find((element) => element.elementGetRows !== undefined)?.elementGetRows;
	if (!generateBy) return;
	for (let index in element[generateBy]) {
		rows.push(createData(element, index, rowElements));
	}
	return { rows: rows, trigger: trigger };
}
export const saveRows = (props, setState, rowElements, newRow) => {
	let data;
	if (newRow && newRow.length == 0) {
		data = getRows(props.newRow, rowElements);
	} else data = getRows(newRow, rowElements);
	if (!data) return;
	const rows = data.rows;
	if (setState) {
		setState({ data: props.newRow });
		setState({ trigger: data.trigger });
		setState({ rows: rows });
	}
};

export const updateData = (obj, props, setState, rowElements) => {
	// console.log(obj);
	const newRow = deepCopy(props.newRow);
	newRow[obj.id][obj.index] = obj.val.toString();
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};
export const updateTrigger = (value, props, setState, rowElements) => {
	const newRow = deepCopy(props.newRow);
	newRow.trigger[0] = value.trigger;
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const addNewRow = (index, props, rowElements, setState) => {
	let newRow;

	if (index >= 0 && index != null) newRow = deepCopy(props.newRow);
	else newRow = {};
	rowElements.forEach((element) => {
		// Trigger wird nicht kopiert, da ja schon ein Trigger vorhanden sein darf, es sei denn es ist der erste Eintrag

		if (!index && index !== 0) {
			newRow[element.name] = [element.val];
		} else if (element.name !== "trigger") newRow[element.name].splice(index + 1, 0, element.val);
	});
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const deleteRow = (index, props, array, setState, rowElements) => {
	const newRow = deepCopy(props.newRow);
	array.forEach((element) => {
		newRow[element.name].splice(index, 1);
	});
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const moveItem = (index, props, array, setState, rowElements, val) => {
	const newRow = deepCopy(props.newRow);
	// console.log(newRow);
	array.forEach((element) => {
		if (element.name !== "trigger") newRow[element.name].splice(index + val, 0, newRow[element.name].splice(index, 1)[0]);
	});
	// console.log(newRow);
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const updateId = (selected, props, indexID, setState, rowElements) => {
	const newRow = deepCopy(props.newRow);
	newRow.IDs[indexID] = selected;
	props.callback.setState({ newRow: newRow });
	saveRows(props, setState, rowElements, newRow);
};

export const updateTriggerForSelect = (data, usersInGroup, activeMenu) => {
	const submenu = ["set", "get", "pic"];
	// Users für die die Trigger gesucht werden sollen

	const users = usersInGroup[activeMenu];

	let menusToSearchIn = [];
	// User durchgehen und schauen in welchen Gruppen sie sind
	if (!users) return;
	users.forEach((user) => {
		Object.keys(usersInGroup).forEach((group) => {
			if (usersInGroup[group].includes(user)) {
				menusToSearchIn.push(group);
			}
		});
	});
	menusToSearchIn = deleteDoubleEntrysInArray(menusToSearchIn);

	// Trigger und Used Trigger finden
	let usedTrigger = [];
	let allTriggers = [];
	menusToSearchIn.forEach((menu) => {
		// usedTriggers und unUsedTrigger in Nav finden
		if (!data.nav[menu]) return;
		data.nav[menu].forEach((element) => {
			usedTrigger.push(element.call);
			allTriggers = allTriggers.concat(disassembleTextToTriggers(element.value));
		});
		// usedTriggers in Action finden
		submenu.forEach((sub) => {
			if (!data.action[menu][sub]) return;
			data.action[menu][sub].forEach((element) => {
				usedTrigger = usedTrigger.concat(element.trigger);
			});
		});
	});

	// Doppelte Einträge in Triggers entfernen
	if (Array.isArray(allTriggers)) allTriggers = deleteDoubleEntrysInArray(allTriggers);
	// usedTrigger entfernen
	let unUsedTrigger = allTriggers.filter((x) => !usedTrigger.includes(x));

	unUsedTrigger = sortArray(unUsedTrigger);
	return { usedTrigger: usedTrigger, unUsedTrigger: unUsedTrigger };
};

const disassembleTextToTriggers = (text) => {
	const triggerArray = [];
	if (text.includes("&&")) text = text.split("&&");
	else text = [text];
	text.forEach((element) => {
		element.split(",").forEach((word) => {
			if (word.includes("menu:")) {
				const array = word.split(":");
				const trigger = array[array.length - 2].trim();
				triggerArray.push(trigger);
			} else if (word.trim() != "-") {
				triggerArray.push(word.trim());
			}
		});
	});

	return triggerArray;
};
export const getElementIcon = (element) => {
	if (!element) return;
	const valtrue = "✔️";
	const valfalse = "❌";
	if (element === "true" || element === true) {
		return valtrue;
	} else if (element === "false" || element === false) {
		return valfalse;
	} else {
		return element.replace(/&amp;/g, "&");
	}
};
