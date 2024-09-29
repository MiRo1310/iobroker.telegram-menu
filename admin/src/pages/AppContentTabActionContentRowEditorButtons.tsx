import { addNewRow, deleteRow } from "@/lib/actionUtils";
import BtnSmallAdd from "@components/btn-Input/btn-small-add";
import BtnSmallCopy from "@components/btn-Input/btn-small-copy";
import BtnSmallRemove from "@components/btn-Input/btn-small-remove";
import PopupContainer from "@components/popupCards/PopupContainer";
import { TableCell } from "@mui/material";
import React, { Component } from "react";
import { AppContentTabActionContentRowEditorButtonsProps } from "../types/props-types";
import AppContentTabActionContentRowEditorCopyModal from "./AppContentTabActionContentRowEditorCopyModal";

interface AppContentTabActionContentRowEditorButtonsState {
	openCopyPopup: boolean;
	indexOfRowToCopyForModal: number;
}

class AppContentTabActionContentRowEditorButtons extends Component<
	AppContentTabActionContentRowEditorButtonsProps,
	AppContentTabActionContentRowEditorButtonsState
> {
	constructor(props) {
		super(props);
		this.state = {
			openCopyPopup: false,
			indexOfRowToCopyForModal: 0,
		};
	}

	openModal = (index: number) => {
		this.props.callback.setStateEditor({ openCopyPopup: true, indexOfRowToCopyForModal: index });
	};

	render() {
		const { buttons } = this.props.data.tab.popupCard;
		const { indexRow, rows } = this.props.data;
		const { setStateEditor } = this.props.callback;
		return (
			<>
				{buttons.add ? (
					<TableCell align="center" className="cellIcon">
						<BtnSmallAdd // Buttons sind einstellbar in entries.ts
							callback={() => addNewRow(indexRow, this.props, setStateEditor, this.props.callback.setStateTabActionContent)}
							index={indexRow}
						/>
					</TableCell>
				) : null}
				{buttons.remove ? (
					<TableCell align="center" className="cellIcon">
						<BtnSmallRemove
							callback={(index: number) => deleteRow(index, this.props, setStateEditor)}
							index={indexRow}
							disabled={rows.length == 1 ? "disabled" : ""}
						/>
					</TableCell>
				) : null}

				{buttons.copy ? (
					<TableCell align="center" className="cellIcon">
						<BtnSmallCopy index={indexRow} callback={(index: number) => this.openModal(index)} />
					</TableCell>
				) : null}
			</>
		);
	}
}

export default AppContentTabActionContentRowEditorButtons;
