"use strict";

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const { exec } = require("child_process");
const sendToTelegram = require("./lib/js/telegram").sendToTelegram;
const editArrayButtons = require("./lib/js/action").editArrayButtons;
const generateNewObjectStructure = require("./lib/js/action").generateNewObjectStructure;
const generateActions = require("./lib/js/action").generateActions;
const setstate = require("./lib/js/setstate").setstate;
const getstate = require("./lib/js/getstate").getstate;
const subMenu = require("./lib/js/subMenu").subMenu;
const sendToTelegramSubmenu = require("./lib/js/telegram").sendToTelegramSubmenu;
// const lichtAn = require("./lib/js/action").lichtAn;
// const wertUebermitteln = require("./lib/js/action").wertUebermitteln;

let timeouts = [];
let timeoutKey = 0;
let setStateIds;
let setStateIdsToListenTo;
let restartAdapter = false;

// Load your modules here, e.g.:
// const fs = require("fs");

class TelegramMenu extends utils.Adapter {
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "telegram-menu",
		});
		this.on("ready", this.onReady.bind(this));
		// this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}
	async onReady() {
		this.setState("info.connection", false, true);
		let instanceTelegram = this.config.instance;
		const telegramID = `${instanceTelegram}.communicate.request`;
		if (instanceTelegram.length == 0) instanceTelegram = "telegram.0";
		const datapoint = `${instanceTelegram}.info.connection`;
		this.log.debug("Instance " + JSON.stringify(instanceTelegram));
		this.log.debug("Datapoint " + JSON.stringify(datapoint));
		let telegramAktiv, telegramState;

		/**
		 * @type {{}}
		 */
		const checkbox = this.config.checkbox;
		const one_time_keyboard = checkbox["oneTiKey"];
		const resize_keyboard = checkbox["resKey"];
		const userList = this.config.users;
		const startsides = this.config.startsides;
		let token = this.config.tokenGrafana;
		const directoryPicture = this.config.directory;
		const userActiveCheckbox = this.config.userActiveCheckbox;
		const usersInGroup = this.config.usersInGroup;
		const textNoEntryFound = this.config.textNoEntry;
		const menu = {
			data: {},
		};
		const _this = this;
		this.getForeignObject(datapoint, async (err, obj) => {
			if (err || obj == null) {
				// Error
				this.log.error(JSON.stringify(err));
				this.log.error(`The State ${datapoint} was not found!`);
			} else {
				// Datenpunkt wurde gefunden
				try {
					telegramState = await this.getForeignStateAsync(datapoint);
				} catch (e) {
					this.log.debug("Error " + JSON.stringify(e));
				}
				telegramAktiv = telegramState?.val;
				if (!telegramAktiv) {
					this.log.info("Telegram was found, but is not runnig. Please start!");
				}
				if (telegramAktiv) {
					this.log.info("Telegram was found");
					this.setState("info.connection", true, true);

					const data = this.config.data;
					const nav = data["nav"];
					const action = data["action"];
					this.log.debug("Navigation " + JSON.stringify(nav));
					this.log.debug("Action " + JSON.stringify(action));
					try {
						for (const name in nav) {
							const value = await editArrayButtons(nav[name], this);
							menu.data[name] = await generateNewObjectStructure(_this, value);
							this.log.debug("New Structure: " + JSON.stringify(menu.data[name]));
							const returnValue = generateActions(_this, action[name], menu.data[name]);
							menu.data[name] = returnValue?.obj;
							setStateIds = returnValue?.ids;
							if (setStateIds && setStateIds?.length > 0) _setForeignStatesAsync(setStateIds, _this);
							this.log.debug("SetForeignStates: " + JSON.stringify(setStateIds));
							this.log.debug("Name " + JSON.stringify(name));
							this.log.debug("Array Buttons: " + JSON.stringify(value));
							this.log.debug("Gen. Actions: " + JSON.stringify(menu.data[name]));
						}
					} catch (err) {
						this.log.error("Error generateNav: " + JSON.stringify(err));
					}
					this.log.debug("Checkbox " + JSON.stringify(checkbox));

					if (!restartAdapter) {
						try {
							this.log.debug("GroupList " + JSON.stringify(userList));
							userList.forEach((group) => {
								this.log.debug("Group " + JSON.stringify(group));
								const startside = [startsides[group]].toString();
								if (userActiveCheckbox[group])
									usersInGroup[group].forEach((user) => {
										sendToTelegram(
											_this,
											user,
											menu.data[group][startside].text,
											menu.data[group][startside].nav,
											instanceTelegram,
											resize_keyboard,
											one_time_keyboard,
										);
									});
							});
						} catch (error) {
							console.log("Error read UserList" + error);
						}
						restartAdapter = false;
					}
				}
				let oldValue, lastDeviceCalled;
				this.on("stateChange", async (id, state) => {
					try {
						let userToSend;
						if (telegramAktiv && state?.ack) {
							if (state && typeof state.val === "string" && state.val != "" && id == telegramID) {
								const value = state.val;
								const user = value.slice(1, value.indexOf("]"));
								const calledValue = value.slice(value.indexOf("]") + 1, value.length);
								this.log.debug("Value: " + JSON.stringify(value));
								this.log.debug("User: " + JSON.stringify(user));
								this.log.debug("Todo: " + JSON.stringify(calledValue));

								userToSend = null;

								this.log.debug("user in group" + JSON.stringify(usersInGroup));
								const groupWithUser = Object.keys(usersInGroup).find((key) =>
									usersInGroup[key].includes(user),
								);
								this.log.debug("Group with User " + JSON.stringify(groupWithUser));
								const groupData = menu.data[groupWithUser];
								userToSend = user;

								this.log.debug("Nav " + JSON.stringify(groupData));
								this.log.debug("Menu " + JSON.stringify(menu.data));
								if (
									groupData[calledValue] &&
									userToSend &&
									groupWithUser &&
									userActiveCheckbox[groupWithUser]
								) {
									const part = groupData[calledValue];
									this.log.debug("Part " + JSON.stringify(part));
									// Navigation
									if (part.nav) {
										this.log.debug("User to send: " + JSON.stringify(userToSend));
										this.log.debug("Todo " + JSON.stringify(calledValue));
										this.log.debug("Part.nav: " + JSON.stringify(part.nav));
										//TODO -
										if (JSON.stringify(part.nav).includes("menu")) {
											callSubMenu(this, part.nav, groupData, userToSend);
										} else {
											if (userToSend)
												sendToTelegram(
													this,
													userToSend,
													part.text,
													part.nav,
													instanceTelegram,
													resize_keyboard,
													one_time_keyboard,
												);
										}
									}
									// Schalten
									else if (part.switch) {
										setStateIdsToListenTo = setstate(_this, part, userToSend);
									} else if (part.getData) {
										getstate(_this, part, userToSend);
									} else if (part.sendPic) {
										try {
											this.log.debug("Send Picture");

											part.sendPic.forEach((element) => {
												// this.log.debug("Element " + JSON.stringify(element));
												token = token.trim();
												const url = element.id;
												const newUrl = url.replace(/&amp;/g, "&");
												exec(
													`curl -H "Authorisation: Bearer ${token}" "${newUrl}" > ${directoryPicture}${element.fileName}`,
												);
												this.log.debug(
													"url " +
														`curl -H "Authorisation: Bearer ${token}" "${newUrl}" > ${directoryPicture}${element.fileName}`,
												);
												timeoutKey += 1;
												const path = `${directoryPicture}${element.fileName}`;
												const timeout = this.setTimeout(async () => {
													sendToTelegram(_this, userToSend, path);

													let timeoutToClear = {};
													timeoutToClear = timeouts.filter((item) => item.key == timeoutKey);
													clearTimeout(timeoutToClear.timeout);
													timeouts = timeouts.filter((item) => item.key !== timeoutKey);
												}, element.delay);
												timeouts.push({ key: timeoutKey, timeout: timeout });
											});
										} catch (e) {
											this.log.error("Error :" + JSON.stringify(e));
										}
									}
								} else if (calledValue.startsWith("menu") || calledValue.startsWith("submenu")) {
									callSubMenu(this, calledValue, groupData, userToSend);
								} else {
									if (typeof userToSend == "string")
										sendToTelegram(this, userToSend, textNoEntryFound);
								}
								// Auf Setstate reagieren und Wert schicken
							} else if (
								state &&
								setStateIdsToListenTo &&
								setStateIdsToListenTo.find((element) => element.id == id)
							) {
								this.log.debug("State, which is listen to was changed " + JSON.stringify(id));
								setStateIdsToListenTo.forEach((element, key) => {
									if (element.id == id) {
										this.log.debug("Send Value " + JSON.stringify(element));
										if (element.confirm != "false") {
											this.log.debug("User " + JSON.stringify(element.userToSend));
											let textToSend = element.returnText;
											// Wenn eine Rückkgabe des Value an den User nicht gewünscht ist soll value durch einen leeren String ersetzt werden
											let value;
											// Change set value in another Value, like true => on, false => off
											let objChangeValue = {};
											let valueChange = "";
											if (textToSend.toString().includes("change{")) {
												const startindex = textToSend.indexOf("change{");
												const match = textToSend.substring(
													startindex + "change".length + 1,
													textToSend.indexOf("}", startindex),
												);
												objChangeValue = JSON.parse("{" + match + "}");
												valueChange = objChangeValue[String(state.val)];
												textToSend = textToSend.substring(0, startindex);
											}
											textToSend?.toString().includes("{novalue}")
												? (value = "")
												: (value = state.val);
											textToSend = textToSend.replace("{novalue}", "");
											valueChange ? (value = valueChange) : value;
											textToSend.indexOf("&amp;&amp;") != -1
												? (textToSend = textToSend.replace("&amp;&amp;", value))
												: (textToSend += " " + value);
											sendToTelegram(this, element.userToSend, textToSend);
											// Die Elemente auf die Reagiert wurde entfernen
											setStateIdsToListenTo.splice(key, 1);
										}
									}
								});
							}
						}

						if (state && id == `${instanceTelegram}.info.connection`) {
							this.log.debug("Oldvalue " + JSON.stringify(oldValue));
							if (!oldValue) {
								this.log.debug("Restart Adapter Telegram Menu");
								restartAdapter = true;
								this.restart();
							}
							oldValue = state.val;
							if (!state.val) telegramAktiv = false;
						}
					} catch (e) {
						this.log.debug("Error " + JSON.stringify(e));
					}
				});
			}
		});
		/**
		 *
		 * @param {*} _this
		 * @param {*} part
		 * @param {*} groupData
		 * @param {string} userToSend
		 */
		function callSubMenu(_this, part, groupData, userToSend) {
			let subMenuData = subMenu(_this, part, groupData, userToSend);
			_this.log.debug("SubMenuData " + JSON.stringify(subMenuData));
			if (subMenuData && subMenuData[0]) sendToTelegramSubmenu(_this, userToSend, subMenuData[0], subMenuData[1]);
		}

		/**
		 *
		 * @param {Array} array
		 * @param {*} _this
		 */
		function _setForeignStatesAsync(array, _this) {
			array.forEach((element) => {
				_this.subscribeForeignStatesAsync(element);
			});
		}
		this.subscribeForeignStatesAsync("telegram.0.info.connection");
		this.subscribeForeignStatesAsync("telegram.0.communicate.request");
		this.subscribeForeignStatesAsync(telegramID);
		this.subscribeForeignStatesAsync(`${instanceTelegram}.info.connection`);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			timeouts.forEach((element) => {
				clearTimeout(element.timeout);
			});

			callback();
		} catch (e) {
			callback();
		}
	}

	onMessage(obj) {
		this.log.debug(obj);
		if (typeof obj === "object" && obj.message) {
			if (obj.command === "send") {
				// e.g. send email or pushover or whatever
				this.log.info("send command");

				// Send response in callback if required
				if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
			}
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new TelegramMenu(options);
} else {
	// otherwise start the instance directly
	new TelegramMenu();
}
