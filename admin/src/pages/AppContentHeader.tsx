import React, { Component } from "react";
import { Grid } from "@mui/material";
import HeaderMenu from "@/pages/AppContentHeaderMenu";
import HeaderTelegramUsers from "@/pages/AppContentHeaderTelegramUsers";
import { PropsMainActions } from "admin/app";

class MainActions extends Component<PropsMainActions> {
	constructor(props: PropsMainActions) {
		super(props);
		this.state = {};
	}

	render(): React.ReactNode {
		return (
			<Grid container spacing={1} className="Grid-HeaderMenu ">
				<Grid item xs={12}>
					{this.props.data.state.tab != "settings" ? <HeaderMenu data={this.props.data} callback={this.props.callback} /> : null}
				</Grid>
				<Grid item xs={12}>
					{this.props.data.state.tab != "settings" ? (
						<HeaderTelegramUsers
							data={{
								state: this.props.data.state,
								usersInGroup: this.props.data.state.native.usersInGroup,
								userActiveCheckbox: this.props.data.state.native.userActiveCheckbox,
								activeMenu: this.props.data.state.activeMenu,
							}}
							callback={this.props.callback}
						/>
					) : null}
				</Grid>
			</Grid>
		);
	}
}

export default MainActions;
