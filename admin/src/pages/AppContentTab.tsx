import React, { Component } from "react";
import TabNavigation from "@/pages/AppContentTabNavigation";
import TabAction from "@/pages/AppContentTabAction";
import Settings from "@/pages/AppContentTabSettings";
import { TabPanel } from "@mui/lab";
import { navEntries } from "@/config/entries";
import { AdditionalStateInfo, CallbackFunctions } from "admin/app";
import { CallbackFunctionsApp } from "../../app";
import { PropsMainTabs } from "../types/props-types";

class Tabs extends Component<PropsMainTabs> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<>
				<TabPanel value="nav">
					<TabNavigation data={{ ...this.props.data, entries: navEntries }} callback={this.props.callback} />
				</TabPanel>
				<TabPanel value="action" className="tabAction">
					<TabAction data={this.props.data} callback={this.props.callback} />
				</TabPanel>
				<TabPanel value="settings">
					<Settings
						data={{
							instances: this.props.data.state.instances,
							state: this.props.data.state,
							checkbox: this.props.data.state.native.checkbox,
						}}
						callback={this.props.callback}
					/>
				</TabPanel>
			</>
		);
	}
}

export default Tabs;
