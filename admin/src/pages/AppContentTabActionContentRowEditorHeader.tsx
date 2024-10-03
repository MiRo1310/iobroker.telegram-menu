import Select from "@/components/btn-Input/select";
import { updateTrigger } from "@/lib/actionUtils.js";
import { isChecked } from "@/lib/Utils.js";
import Button from "@components/btn-Input/Button";
import Checkbox from "@components/btn-Input/checkbox_legacy";
import React, { Component } from "react";
import {
	CallbackFunctionsApp,
	CallbackTabActionContent,
	DataMainContent,
	DataTabActionContent,
	EventCheckbox,
	TabActionContentTableProps,
} from "../../app";
import { EventButton } from "../components/btn-Input/Button";

export interface AppContentTabActionContentRowEditorInputAboveTableProps {
	data: DataMainContent & TabActionContentTableProps & DataTabActionContent & { isMinOneCheckboxChecked: boolean };
	callback: CallbackFunctionsApp &
		CallbackTabActionContent & { openHelperText: (value: any) => void } & {
			updateData: (obj: EventCheckbox) => void;
			openCopyModal: (obj: EventButton) => void;
		};
}

class AppContentTabActionContentRowEditorInputAboveTable extends Component<AppContentTabActionContentRowEditorInputAboveTableProps> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { newRow, newUnUsedTrigger } = this.props.data;
		return (
			<div className="editor__header">
				<Button
					id="showDropBox"
					callbackValue={true}
					callback={this.props.callback.openCopyModal}
					className={`${!this.props.data.isMinOneCheckboxChecked ? "button--disabled" : "button--hover"} button button__copy`}
					disabled={!this.props.data.isMinOneCheckboxChecked}
				>
					<i className="material-icons translate">content_copy</i>Copy
				</Button>
				{newRow.trigger ? (
					<div className="editor__header_trigger">
						<Select
							width="10%"
							selected={newRow.trigger[0]}
							options={newUnUsedTrigger}
							id="trigger"
							callback={(value: { trigger: string }) => updateTrigger(value, this.props, this.setState.bind(this))}
							callbackValue="event.target.value"
							label="Trigger"
							placeholder="Select a Trigger"
						/>
					</div>
				) : null}
				{newRow.parse_mode ? (
					<div className="editor__header_parseMode">
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
			</div>
		);
	}
}

export default AppContentTabActionContentRowEditorInputAboveTable;
