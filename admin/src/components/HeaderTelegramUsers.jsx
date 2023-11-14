import React, { Component } from "react";
import TelegramUserCard from "./TelegramUserCard";
import Button from "./btn-Input/Button";
import { Grid } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import { withStyles } from "@mui/styles";
import Checkbox from "./btn-Input/checkbox";

const styles = () => ({
	btnExpand: {
		position: "absolute",
		top: "-35px",
		left: "-55px",
	},
	container: {
		position: "relative",
	},
});

class HeaderTelegramUsers extends Component {
	constructor(props) {
		super(props);
		this.state = {
			menuOpen: true,
		};
	}

	updateMenuOpen = () => {
		this.setState({ menuOpen: !this.state.menuOpen });
	};
	menuActiveChecked = () => {
		if (this.props.data.userActiveCheckbox[this.props.data.activeMenu]) {
			return true;
		} else {
			return false;
		}
	};
	clickCheckbox = (event, name) => {
		this.props.callback.updateNative("userActiveCheckbox." + this.props.data.activeMenu, event.target.checked);
	};

	render() {
		return (
			<Grid container spacing={2}>
				<Grid item lg={2} md={2} xs={2}></Grid>
				<Grid item lg={8} md={8} xs={8}>
					<div className={this.props.classes.container}>
						<div className={this.props.classes.btnExpand}>
							<Button b_color="#fff" small="true" margin="0 5px 0 20px" border="1px solid black" round="4px" id="expandTelegramusers" callback={this.updateMenuOpen}>
								{this.state.menuOpen ? <i className="material-icons">expand_more</i> : <i className="material-icons">chevron_right</i>}
							</Button>
							<span>{I18n.t("Expand Telegram Users")}</span>
						</div>
						{this.state.menuOpen ? (
							<div className="HeaderTelegramUsers-TelegramUserCard">
								<p className="TelegramUserCard-description">{I18n.t("Users from Telegram")}</p>
								{this.props.data.state.native.userListWithChatID.map((user, key) => {
									return (
										<TelegramUserCard name={user.name} chatID={user.chatID} key={key} callback={this.props.callback} data={this.props.data}></TelegramUserCard>
									);
								})}
							</div>
						) : null}
					</div>
				</Grid>

				<Grid item lg={1} md={1} xs={1}>
					{this.state.menuOpen && this.props.data.state.activeMenu != undefined ? (
						<Checkbox
							label={this.props.data.state.activeMenu + " " + I18n.t("active")}
							id="checkboxActiveMenu"
							isChecked={this.menuActiveChecked()}
							callbackValue="event"
							callback={this.clickCheckbox}
						/>
					) : null}
				</Grid>
			</Grid>
		);
	}
}

export default withStyles(styles)(HeaderTelegramUsers);
