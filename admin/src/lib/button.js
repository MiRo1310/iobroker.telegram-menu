/**
 *
 * @param {number} index Position of the element in the array
 * @param {*} props  Props of the component
 * @param {string} action Action of the component
 * @param {string} subData SubData of the Action ("set", "get", "pic")
 * @param {number} upDown Positions to move up or down
 * @param {number} newPositionIndex New position of the element in the array
 */
export const moveItem = (index, props, action, subData, upDown, newPositionIndex) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data.data));
	const activeMenu = props.data.activeMenu;
	let userArray = [];
	if (subData) {
		userArray = dataCopy[action][activeMenu][subData];
	} else userArray = dataCopy[action][activeMenu];
	const element = userArray[index];
	userArray.splice(index, 1);
	if (upDown) userArray.splice(index + upDown, 0, element);
	if (newPositionIndex) userArray.splice(newPositionIndex, 0, element);
	if (subData) dataCopy[action][activeMenu][subData] = userArray;
	else dataCopy[action][activeMenu] = userArray;
	props.callback.updateNative("data", dataCopy);
};
export const moveDown = (index, props, action, subData, upDown) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data.data));
	const activeMenu = props.data.activeMenu;
	let userArray = [];
	if (subData) {
		userArray = dataCopy[action][activeMenu][subData];
	} else userArray = dataCopy[action][activeMenu];
	const element = userArray[index];
	userArray.splice(index, 1);
	userArray.splice(index + upDown, 0, element);
	if (subData) dataCopy[action][activeMenu][subData] = userArray;
	else dataCopy[action][activeMenu] = userArray;
	props.callback.updateNative("data", dataCopy);
};
export const moveUp = (index, props, action, subData) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data.data));
	const activeMenu = props.data.activeMenu;
	let userArray = [];
	if (subData) {
		userArray = dataCopy[action][activeMenu][subData];
	} else userArray = dataCopy[action][activeMenu];
	const element = userArray[index];
	userArray.splice(index, 1);
	userArray.splice(index - 1, 0, element);
	if (subData) dataCopy[action][activeMenu][subData] = userArray;
	else dataCopy[action][activeMenu] = userArray;
	props.callback.updateNative("data", dataCopy);
};
export const deleteRow = (index, props, action, subData) => {
	const dataCopy = JSON.parse(JSON.stringify(props.data.data));
	const activeMenu = props.data.activeMenu;
	let userArray = [];
	if (subData) {
		userArray = dataCopy[action][activeMenu][subData];
	} else userArray = dataCopy[action][activeMenu];
	userArray.splice(index, 1);
	if (subData) dataCopy[action][activeMenu][subData] = userArray;
	else dataCopy[action][activeMenu] = userArray;
	props.callback.updateNative("data", dataCopy);
};
