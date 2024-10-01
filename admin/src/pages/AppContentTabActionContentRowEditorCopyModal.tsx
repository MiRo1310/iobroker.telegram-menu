import Select from "@/components/btn-Input/select";
import { Echart, Events, Get, HttpRequest, Pic, Set } from "../../app";
import {
	CallbackFunctionsApp,
	CallbackTabActionContent,
	DataMainContent,
	DataTabActionContent,
	RowsSetState,
	SetStateFunction,
	TabActionContentTableProps,
} from "admin/app";
import React, { Component } from "react";
import AppContentTabActionContentRowEditorCopyModalSelectedValues from "./AppContentTabActionContentRowEditorCopyModalSelectedValues";

export interface PropsRowEditorCopyModal {
	data: DataMainContent & TabActionContentTableProps & DataTabActionContent;
	callback: CallbackFunctionsApp & CallbackTabActionContent & { openHelperText: (value: any) => void };
	checkboxes: boolean[];
}
interface State {
	selectedMenu: string;
	selectedAction: string;
}

class AppContentTabActionContentRowEditorCopyModal extends Component<PropsRowEditorCopyModal, State> {
	constructor(props) {
		super(props);
		this.state = {
			selectedMenu: "",
			selectedAction: "",
		};
	}

	getAllAvailableActionsFromSelectedMenu() {
		return Object.keys(this.props.data.state.native.data.action[this.state.selectedMenu]);
	}

	getAllMenusWithoutActiveMenu() {
		return Object.keys(this.props.data.state.native.usersInGroup).filter((menu) => menu !== this.props.data.state.activeMenu);
	}
	getValuesInSelectedAction(): Get[] | Set[] | Pic[] | HttpRequest[] | Echart[] | Events[] {
		return this.props.data.state.native.data.action?.[this.state.selectedMenu]?.[this.state.selectedAction] || [];
	}

	render() {
		return (
			<div className="editor__modal_container">
				<div className="editor__modal_inputs">
					Active Menu: {this.props.data.state.activeMenu}
					<p>Menu to copy to</p>
					<Select
						options={this.getAllMenusWithoutActiveMenu()}
						id="selectedMenu"
						selected={this.state.selectedMenu}
						placeholder="Select a menu"
						callback={this.setState.bind(this)}
					/>
					{this.state.selectedMenu !== "" ? (
						<Select
							options={this.getAllAvailableActionsFromSelectedMenu()}
							id="selectedAction"
							selected={this.state.selectedAction}
							placeholder="Select a menu"
							callback={this.setState.bind(this)}
						/>
					) : null}
				</div>
				{this.state.selectedAction !== "" ? (
					<AppContentTabActionContentRowEditorCopyModalSelectedValues value={this.getValuesInSelectedAction()} />
				) : null}
			</div>
		);
	}
}

export default AppContentTabActionContentRowEditorCopyModal;
