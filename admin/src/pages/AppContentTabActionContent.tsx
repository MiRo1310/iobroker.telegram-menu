import React, { Component } from "react";
import { TableHead, Table, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import { deepCopy } from "@/lib/Utils.js";

import Button from "@/components/btn-Input/Button";
import PopupContainer from "@/components/popupCards/PopupContainer";
import AppContentTabActionContentRowEditor from "@/pages/AppContentTabActionContentRowEditor";
import AppContentTabActionContentTable from "@/pages/AppContentTabActionContentTable";
import HelperCard from "@/components/popupCards/HelperCard";
import helperText from "@/config/helper.js";
import { addNewRow } from "@/lib/actionUtils.js";
import { ActionData, PropsActionCard, StateActionCard } from "admin/app";
import { Data } from "../../app";

class ActionCard extends Component<PropsActionCard, StateActionCard> {
	constructor(props) {
		super(props);
		this.state = {
			rowPopup: false,
			rowIndex: 0,
			editRow: false,
			newRow: {},
			rowsLength: 0,
			newUnUsedTrigger: this.props.data.state.unUsedTrigger,
			helperText: false,
			helperTextFor: "",
			helperTextForInput: "",
			editedValueFromHelperText: null,
			isOK: false,
			valueForSave: null,
			inputValuesAreOK: true,
			disableInput: false,
			nav: "",
			text: "",
		};
	}
	componentDidUpdate(prevProps, prevState) {
		const { native, activeMenu } = this.props.data.state;
		if (prevState.editedValueFromHelperText !== this.state.editedValueFromHelperText) {
			if (this.state.editedValueFromHelperText !== null && this.state.editedValueFromHelperText !== undefined) {
				if (this.state.editedValueFromHelperText !== "") {
					this.setState({ isOK: this.checkNewValueIsOK() });
				}
			}
		}

		if (prevProps.data !== this.props.data || activeMenu !== prevProps.data.state.activeMenu) {
			this.getLengthOfData(native.data.action, activeMenu);
		}

		if (prevProps.newRow !== this.state.newRow) {
			this.disableButtonHandler();
		}
	}
	checkNewValueIsOK = () => {
		if (
			this.state.editedValueFromHelperText &&
			this.state.editedValueFromHelperText !== "" &&
			this.state.editedValueFromHelperText !== this.state[this.state.helperTextFor]
		) {
			return true;
		}
		return false;
	};
	addEditedTrigger = (trigger) => {
		let newTriggerArray: string[] = [];
		const unUsedTrigger: string[] = deepCopy(this.props.data.state.unUsedTrigger);
		if (trigger) {
			newTriggerArray = [...unUsedTrigger, trigger];
		} else {
			newTriggerArray = unUsedTrigger;
		}
		this.setState({ newUnUsedTrigger: newTriggerArray });
	};
	private disableButtonHandler() {
		const { tab } = this.props.data;
		let inputValuesAreOk = true;
		const row = this.state.newRow;

		tab.entries.forEach((entry) => {
			if (!entry.checkbox && entry.required) {
				if (!row[entry.name]) {
					row[entry.name] = [""];
				}
				row[entry.name].forEach((val) => {
					if (inputValuesAreOk && entry.name === "values") {
						if (typeof val !== "string") {
							inputValuesAreOk = false;
						}
						return;
					}
					if (inputValuesAreOk && val == "") {
						inputValuesAreOk = false;
					}
				});
			}
		});

		inputValuesAreOk = inputValuesAreOk;
		if (this.state.inputValuesAreOK !== inputValuesAreOk) {
			this.setState({ inputValuesAreOK: inputValuesAreOk });
		}
	}

	componentDidMount() {
		const { native, activeMenu } = this.props.data.state;
		this.resetNewRow();
		this.getLengthOfData(native.data?.action, activeMenu);
	}

	openAddRowCard = (index) => {
		this.addEditedTrigger(null);
		this.setState({ rowPopup: true });
		this.setState({ rowIndex: index });
	};

	closeAddRowCard = (isOk) => {
		const { native, activeMenu } = this.props.data.state;
		const { value: subCard } = this.props.data.tab;
		if (isOk) {
			const data = deepCopy(native.data);
			if (!data.action[activeMenu][subCard]) {
				data.action[activeMenu][subCard] = [];
			}
			if (this.state.editRow) {
				data.action[activeMenu][subCard].splice(this.state.rowIndex, 1, this.state.newRow);
			} else {
				data.action[activeMenu][subCard].splice(this.state.rowIndex + 1, 0, this.state.newRow);
			}

			this.props.callback.updateNative("data", data);
		}
		this.setState({ newUnUsedTrigger: null });
		this.setState({ rowPopup: false });
		this.setState({ editRow: false });
		this.resetNewRow();
	};

	resetNewRow = () => {
		const newRow = {};
		this.props.data.tab.entries.forEach((entry) => {
			newRow[entry.name] = [entry.val || ""];
		});
		this.setState({ newRow: newRow });
	};

	getLengthOfData = (data: ActionData, activeMenu: string) => {
		const { value: subCard } = this.props.data.tab;

		if (data?.[activeMenu]?.[subCard]?.length) {
			this.setState({ rowsLength: data[activeMenu][subCard].length });
			return;
		}
		this.setState({ rowsLength: 0 });
	};

	openHelperText = (value) => {
		this.setState({ valueForSave: value });
		if (value) {
			this.setState({ editedValueFromHelperText: this.state.newRow[value.entry][value.index] });
			this.setState({ helperTextFor: value.subCard, helperTextForInput: value.entry });
		}

		this.setState({ helperText: true });
	};
	onchangeValueFromHelper = (value) => {
		let newValue;

		if (this.state.editedValueFromHelperText === null) {
			newValue = value;
		} else {
			newValue = this.state.editedValueFromHelperText + " " + value;
		}
		this.setState({ editedValueFromHelperText: newValue });
	};
	popupHelperCard = (isOK) => {
		if (isOK) {
			const row = deepCopy(this.state.newRow);
			row[this.state.valueForSave.entry][this.state.valueForSave.index] = this.state.editedValueFromHelperText;
			this.setState({ newRow: row });
		}
		this.setState({ helperText: false });
		this.setState({ editedValueFromHelperText: null });
	};
	addNewRow = (index) => {
		this.setState({ rowPopup: true });
		addNewRow(index, this.props, this.props.data.tab.entries);
	};

	render() {
		return (
			<>
				{this.state.rowsLength == 0 ? (
					<Button b_color="#96d15a" title="Add new Action" width="50%" margin="0 18px" height="50px" index={null} callback={this.addNewRow}>
						<i className="material-icons translate">add</i>
						{I18n.t("Add new Action")}
					</Button>
				) : (
					<TableContainer component={Paper} className="ActionCard-Container">
						<Table stickyHeader aria-label="sticky table">
							<TableHead>
								<TableRow>
									{this.props.data.tab.entries.map((entry, index) => (
										<TableCell key={index}>
											<span title={entry.title ? I18n.t(entry.title) : undefined}>{I18n.t(entry.headline)}</span>
										</TableCell>
									))}
									{Array(Object.keys(this.props.showButtons).length)
										.fill(undefined)
										.map((_, i) => (
											<TableCell key={i} align="center" className="cellIcon"></TableCell>
										))}
								</TableRow>
							</TableHead>
							<AppContentTabActionContentTable
								activeMenu={this.props.data.state.activeMenu}
								tableData={this.props.data.state.native.data?.action}
								data={this.props.data}
								showButtons={this.props.showButtons}
								card={this.props.card}
								subCard={this.props.data.tab.value}
								setState={this.setState.bind(this)}
								callback={this.props.callback}
								openAddRowCard={this.openAddRowCard}
								entries={this.props.data.tab.entries}
								addEditedTrigger={this.addEditedTrigger}
							/>
						</Table>
					</TableContainer>
				)}
				{this.state.rowPopup ? (
					<PopupContainer
						callback={this.closeAddRowCard}
						width={this.props.data.tab.popupCard.width}
						height={this.props.data.tab.popupCard.height}
						title={this.props.data.tab.label}
						isOK={this.state.inputValuesAreOK}
					>
						<AppContentTabActionContentRowEditor
							data={this.props.data}
							newRow={this.state.newRow}
							callback={{ ...this.props.callback, setStateTabActionContent: this.setState.bind(this) }}
							entries={this.props.data.tab.entries}
							searchRoot={this.props.data.tab.searchRoot}
							newUnUsedTrigger={this.state.newUnUsedTrigger || this.props.data.state.unUsedTrigger}
							subCard={this.props.data.tab.value}
							openHelperText={this.openHelperText}
							buttons={this.props.data.tab.popupCard.buttons}
						/>
					</PopupContainer>
				) : null}
				{this.state.helperText ? (
					<PopupContainer
						callback={this.popupHelperCard}
						width="90%"
						height="80%"
						title="Helper Texte"
						setState={this.setState.bind(this)}
						isOK={this.state.isOK}
						class="HelperText"
					>
						<HelperCard
							data={this.props.data}
							helper={helperText}
							name="action"
							val={this.state.helperTextFor}
							text={this.state.text}
							helperTextForInput={this.state.helperTextForInput}
							callback={this.onchangeValueFromHelper}
							editedValueFromHelperText={this.state.editedValueFromHelperText}
							setState={this.setState.bind(this)}
						/>
					</PopupContainer>
				) : null}
			</>
		);
	}
}

export default ActionCard;
