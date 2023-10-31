import React from "react";
import GenericApp from "@iobroker/adapter-react-v5/GenericApp";
import { TabList, TabPanel, TabContext } from "@mui/lab";
import { Menu, Paper, styled, Grid, Tab, Box } from "@mui/material";
import { withStyles } from "@mui/styles";
import { I18n } from "@iobroker/adapter-react-v5";
import { AdminConnection } from "@iobroker/adapter-react-v5";

import HeaderIconBar from "./components/HeaderIconBar";
import Settings from "./components/settings";
import HeaderMenu from "./components/HeaderMenu";
import MenuNavigation from "./components/navigation";

/**
 * @type {(_theme: import("@material-ui/core/styles").Theme) => import("@material-ui/styles").StyleRules}
 */
const styles = (_theme) => ({
	root: {},
	tab: {
		height: "calc(100vh - 355px)",
		overflow: "auto",
	},
});
const Item = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: "left",
	color: theme.palette.text.secondary,
}));

class App extends GenericApp {
	constructor(props) {
		const extendedProps = {
			...props,
			encryptedFields: [],
			Connection: AdminConnection,
			translations: {
				en: require("../../admin/i18n/en/translations.json"),
				de: require("../../admin/i18n/de/translations.json"),
				ru: require("../../admin/i18n/ru/translations.json"),
				pt: require("../../admin/i18n/pt/translations.json"),
				nl: require("../../admin/i18n/nl/translations.json"),
				fr: require("../../admin/i18n/fr/translations.json"),
				it: require("../../admin/i18n/it/translations.json"),
				es: require("../../admin/i18n/es/translations.json"),
				pl: require("../../admin/i18n/pl/translations.json"),
				uk: require("../../admin/i18n/uk/translations.json"),
				"zh-cn": require("../../admin/i18n/zh-cn/translations.json"),
			},
		};
		super(props, extendedProps);
		this.state = {
			...this.state,
			native: {},
			data: {},
			tab: "1",
			activeMenu: "",
			showMenu: false,
		};
		this.handleChange = this.handleChange.bind(this);
		this.setState = this.setState.bind(this);
	}

	onConnectionReady() {
		// executed when connection is ready
		try {
			this.socket.getObjectViewCustom("custom", "telegram", "", "\u9999").then((objects) => {
				console.log(objects);
				Object.keys(objects).forEach((obj) => console.log(obj._id));
			});
		} catch (err) {
			console.log(err);
		}

		if (this.state.native.data) {
			const newData = JSON.parse(JSON.stringify(this.state.native.data));
			this.setState({ data: newData }, () => {
				console.log(this.state.native);
				const firstKey = Object.keys(this.state.data.nav)[0];
				this.setState({ activeMenu: firstKey });
			});
		}
	}

	handleChange(event, val) {
		this.setState({ tab: val });
	}

	render() {
		if (!this.state.loaded) {
			return super.render();
		}

		return (
			<div className="App row">
				<Grid container spacing={1}>
					<Grid item xs={12}>
						<Item className="iconBar">
							<HeaderIconBar
								key="options"
								common={this.common}
								socket={this.socket}
								native={this.state.native}
								onError={(text) => this.setState({ errorText: (text || text === 0) && typeof text !== "string" ? text.toString() : text })}
								onLoad={(native) => this.onLoadConfig(native)}
								instance={this.instance}
								adapterName={this.adapterName}
								changed={this.state.changed}
								onChange={(attr, value, cb) => this.updateNativeValue(attr, value, cb)}
							></HeaderIconBar>
						</Item>
					</Grid>
					<Grid item xs={12}>
						<Grid item xs={12}>
							{/* <button onClick={() => this.updateNativeValue("instance", "telegram.1")}>Klick mich</button> */}
							<HeaderMenu
								active={this.state.activeMenu}
								showCard={this.state.showMenu}
								callback={{ setState: this.setState, state: this.state }}
								usersInGroup={this.state.native.usersInGroup}
							></HeaderMenu>
						</Grid>
						<Item>
							<Box sx={{ width: "100%", typography: "body1" }}>
								<TabContext value={this.state.tab}>
									<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
										<TabList onChange={this.handleChange} aria-label="lab API tabs example">
											<Tab label="Navigation" value="1" />
											<Tab label="Action" value="2" />
											<Tab label="Settings" value="3" />
										</TabList>
									</Box>
									<TabPanel value="1" className={this.props.classes.tab}>
										<MenuNavigation nav={this.state.data.nav}></MenuNavigation>
									</TabPanel>
									<TabPanel value="2" className={this.props.classes.tab}></TabPanel>
									<TabPanel value="3" className={this.props.classes.tab}>
										<Settings></Settings>
									</TabPanel>
								</TabContext>
							</Box>
						</Item>
					</Grid>
				</Grid>

				{/* <Settings native={this.state.native} onChange={(attr, value) => this.updateNativeValue(attr, value)} /> */}
				{this.renderError()}
				{this.renderToast()}
				{this.renderSaveCloseButtons()}
			</div>
		);
	}
}

export default withStyles(styles)(App);
export { App };
