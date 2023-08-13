async function getUsersFromTelegram(socket, _this, telegramInstance, usersInGroup) {
	try {
		socket.emit("getState", telegramInstance + ".communicate.users", (err, state) => {
			if (state && !err) {
				const usersInTelegram = JSON.parse(state.val);
				const userListe = [];
				for (const user in usersInTelegram) {
					userListe.push(usersInTelegram[user]["firstName"]);
				}
				const groupList = Object.keys(usersInGroup);
				console.log(groupList);
				console.log(usersInGroup);
				$(groupList).each(function (key, group) {
					$(userListe).each(function (key, user) {
						console.log("hha");
						console.log(group, user);
						// @ts-ignore
						$(`#group_UserInput .${group}`).append(userSelectionTelegram(user));
					});
				});
			} else if (err) _this.log.debug("Error get Users vom Telegram: " + JSON.stringify(err));
		});
	} catch (err) {
		_this.log.debug("Error get Users vom Telegram: " + JSON.stringify(err));
	}
}

/**
 *
 * @param {*} socket
 * @returns
 */
// @ts-ignore
function getAllTelegramInstances(socket, _this) {
	const id = [];
	try {
		socket.emit(
			"getObjectView",
			"system",
			"instance",
			{ startkey: "system.adapter.", endkey: "system.adapter.\u9999" },
			function (err, doc) {
				if (!err && doc.rows.length) {
					for (let i = 0; i < doc.rows.length; i++) {
						if (
							doc.rows[i].value &&
							doc.rows[i].value.common &&
							doc.rows[i].value.common.titleLang &&
							doc.rows[i].value.common.titleLang.en &&
							doc.rows[i].value.common.titleLang.en == "Telegram"
							// doc.rows[i].value.common.title == "Telegram"
						) {
							id.push(doc.rows[i].id.replace(/^system\.adapter\./, ""));
						}
						if (i == doc.rows.length - 1) {
							id.forEach((id) => {
								// @ts-ignore
								$("#select_instance").append(newSelectInstanceRow(id));
							});
						}
					}
				} else if (err) _this.log.debug("Error all Telegram Users: " + JSON.stringify(err));
			},
		);
	} catch (err) {
		_this.log.debug("Error getAllTelegramInstance: " + JSON.stringify(err));
	}
}
