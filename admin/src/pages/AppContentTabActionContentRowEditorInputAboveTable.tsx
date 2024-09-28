import Checkbox from "@/components/btn-Input/checkbox";
import Select from "@/components/btn-Input/select";
import { updateTrigger } from "@/lib/actionUtils.js";
import { isChecked } from "@/lib/Utils.js";
import React, { Component } from "react";
import { DataMainContent, DataTabActionContent, TabActionContentTableProps } from "../../app";

export interface AppContentTabActionContentRowEditorInputAboveTableProps {
	data: DataMainContent & TabActionContentTableProps & DataTabActionContent;
	callback: { updateData: (obj) => void };
}

class AppContentTabActionContentRowEditorInputAboveTable extends Component<AppContentTabActionContentRowEditorInputAboveTableProps> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { newRow, newUnUsedTrigger, tab } = this.props.data;
		return (
			<template>
				{this.props.data.newRow.trigger ? (
					<div className="Edit-Container-Trigger">
						<Select
							width="10%"
							selected={newRow.trigger[0]}
							options={newUnUsedTrigger}
							id="trigger"
							callback={(value) => updateTrigger(value, this.props, this.setState.bind(this), tab.entries)}
							callbackValue="event.target.value"
							label="Trigger"
							placeholder="Select a Trigger"
						/>
					</div>
				) : null}
				{newRow.parse_mode ? (
					<div className="Edit-Container-ParseMode">
						<Checkbox
							id="parse_mode"
							index={0}
							callback={this.props.callback.updateData}
							callbackValue="event"
							isChecked={isChecked(newRow.parse_mode[0])}
							obj={true}
							label="Parse Mode"
						/>
					</div>
				) : null}
			</template>
		);
	}
}

export default AppContentTabActionContentRowEditorInputAboveTable;
