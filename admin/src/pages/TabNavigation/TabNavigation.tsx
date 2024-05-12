import React, { Component } from "react";
import { TableHead, Table, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";

import PopupContainer from "../../components/popupCards/PopupContainer";
import RowNavCard from "../../components/popupCards/RowNavCard";
import TableDndNav from "./TableDND/TableDndNav";
import HelperCard from "../../components/popupCards/HelperCard";

import helperText from "../../lib/helper.js";
import { deepCopy } from "../../lib/Utils.js";

class TabNavigation extends Component<PropsTabNavigation,StateTabNavigation> {
	constructor(props) {
		super(props);
		this.state = {
			rowPopup: false,
			rowIndex: 0,
			editRow: false,
			valuesAreOk: false,
			callInUse: false,
			helperTextFor: "",
			editedValueFromHelperText: null,
			isOK: false,
			helperText: false,
			newRow: {},
			nav: "",
			call: "",
			text: "",
		};
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevState.editedValueFromHelperText !== this.state.editedValueFromHelperText) {
			if (this.state.editedValueFromHelperText !== null && this.state.editedValueFromHelperText !== undefined) {
				if (this.state.editedValueFromHelperText !== "") {
					this.setState({ isOK: this.checkNewValueIsOK() });
				}
			}
		}
		if (prevState.newRow !== this.state.newRow) {
			this.checkValueAlreadyUsed();
		}
	}
	checkValueAlreadyUsed = () => {
		// Row.call darf ab jetzt leer oder auch nur ein - sein um es zu deaktivieren. Das Value darf ab jetzt auch leer sein.
		if (this.state.newRow.text !== "") {
			if (this.state.editRow) {
				this.setState({ valuesAreOk: true });
			} else if (this.props.data.state.usedTrigger.includes(this.state.newRow.call) || this.state.newRow.call.startsWith("menu")) {
				this.setState({ valuesAreOk: false });
			} else this.setState({ valuesAreOk: true });
		} else {
			this.setState({ valuesAreOk: false });
		}
		if (this.state.newRow.call !== "") {
			if (this.state.editRow) {
				this.setState({ callInUse: false });
			} else if (this.props.data.state.usedTrigger.includes(this.state.newRow.call) || this.state.newRow.call.startsWith("menu")) {
				this.setState({ callInUse: true });
			} else this.setState({ callInUse: false });
		}
	};

	checkNewValueIsOK = () => {
		if (
			this.state.editedValueFromHelperText !== null &&
			this.state.editedValueFromHelperText !== undefined &&
			this.state.editedValueFromHelperText !== "" &&
			this.state.editedValueFromHelperText !== this.state[this.state.helperTextFor]
		)
			return true;
		else return false;
	};

	changeInput = (data) => {		
		const copyNewRow = deepCopy(this.state.newRow);
		if (data.id) {
			copyNewRow[data.id] = data.val.toString();
		} else
			Object.keys(data).forEach((key) => {
				copyNewRow[key] = data[key];
			});
		this.setState({ newRow: copyNewRow });
	};
	popupRowCard = (isOK) => {
		if (!isOK) {
			this.setState({ rowPopup: false });
			this.setState({ editRow: false });
			return;
		}
		const dataCopy = JSON.parse(JSON.stringify(this.props.data.data));
		const navUserArray = dataCopy.nav[this.props.activeMenu];
		if (this.state.editRow) {
			navUserArray.splice(this.state.rowIndex, 1, this.state.newRow);
		} else navUserArray.splice(this.state.rowIndex + 1, 0, this.state.newRow);
		dataCopy.nav[this.props.activeMenu] = navUserArray;
		this.props.callback.updateNative("data", dataCopy);
		this.setState({ rowPopup: false });
		this.setState({ editRow: false });
	};
	openAddRowCard = (value) => {		
		if (value) {
			this.setState({ rowIndex: value });
		}
		const obj = {};
		this.props.entrys.forEach((entry) => {
			obj[entry.name] = entry.val;
		});
		this.setState({ newRow: obj, rowPopup: true });
	};

	openHelperText = (value) => {
		if (value) {
			this.setState({ editedValueFromHelperText: this.state.newRow[value] });
			this.setState({ helperTextFor: value });
		}

		this.setState({ helperText: true });
	};
	onchangeValueFromHelper = (value) => {
		let newValue;

		if (this.state.editedValueFromHelperText === null) newValue = value;
		else newValue = this.state.editedValueFromHelperText + " " + value;
		this.setState({ editedValueFromHelperText: newValue });
	};
	popupHelperCard = (isOK) => {
		if (isOK) {
			const copyNewRow = deepCopy(this.state.newRow);
			let name = this.state.helperTextFor;
			copyNewRow[name] = this.state.editedValueFromHelperText;
			this.setState({ newRow: copyNewRow });
		}
		this.setState({ helperText: false });
		this.setState({ editedValueFromHelperText: null });
	};

	render() {
		return (
			<>
				<TableContainer component={Paper} className="MenuNavigation-Container">
					<Table stickyHeader aria-label="sticky table">
						<TableHead>
							<TableRow>
								{this.props.entrys.map((entry, index) => (
									<TableCell key={index} align="left">
										<span title={entry.title ? I18n.t(entry.title) : undefined}>{I18n.t(entry.headline)}</span>
									</TableCell>
								))}

								<TableCell align="center" className="cellIcon"></TableCell>
								<TableCell align="center" className="cellIcon"></TableCell>
								<TableCell align="center" className="cellIcon"></TableCell>
							</TableRow>
						</TableHead>
						<TableDndNav
							tableData={this.props.data.nav}
							data={this.props.data}
							callback={this.props.callback}
							card={"nav"}
							showButtons={{ add: true, remove: true, edit: true }}
							openAddRowCard={this.openAddRowCard}
							setState={this.setState.bind(this)}
							activeMenu={this.props.activeMenu}
							entrys={this.props.entrys}
						></TableDndNav>
					</Table>
				</TableContainer>
				{this.state.rowPopup ? (
					<PopupContainer
						callback={this.popupRowCard}
						call={this.state.call}
						nav={this.state.nav}
						text={this.state.text}
						usedTrigger={this.props.data.state.usedTrigger}
						width="99%"
						height="40%"
						title="Navigation"
						setState={this.setState.bind(this)}
						isOK={this.state.valuesAreOk}
					>
						<RowNavCard
							callback={{ onchange: this.changeInput }}
							inUse={this.state.callInUse}
							openHelperText={this.openHelperText}
							entrys={this.props.entrys}
							newRow={this.state.newRow}
						></RowNavCard>
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
							name="nav"
							val="nav"
							helperTextForInput={this.state.helperTextFor}
							text={this.state.newRow.text}
							callback={this.onchangeValueFromHelper}
							editedValueFromHelperText={this.state.editedValueFromHelperText||""}
							setState={this.setState.bind(this)}
						></HelperCard>
					</PopupContainer>
				) : null}
			</>
		);
	}
}
export default TabNavigation;
