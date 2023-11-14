import React, { Component } from "react";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";
import Button from "./btn-Input/Button";
import PopupContainer from "./popupCards/PopupContainer";
import RowGetCard from "./popupCards/RowGetCard";
import SubTable from "./subTable";
import ButtonCard from "./btn-Input/buttonCard";

import { deepCopy } from "../lib/Utilis";

import { moveUp, moveDown, deleteRow } from "../lib/button";

function createData(trigger, id, text, newline) {
	return { trigger, id, text, newline };
}

let rows = [];
function getRows(action, activeMenu) {
	if (!action) return;
	let elemente = action[activeMenu].get;
	rows = [];
	if (elemente === undefined) return;
	for (let entry of elemente) {
		rows.push(createData(entry.trigger, entry.IDs, entry.text, entry.newline_checkbox));
	}
}

class SetState extends Component {
	constructor(props) {
		super(props);
		this.state = {
			rowPopup: false,
			rowIndex: 0,
			editRow: false,
			newRow: {},
		};
	}
	componentDidMount() {
		this.resetNewRow();
	}

	moveDown = (index) => {
		moveDown(index, this.props, "action", "get");
	};
	moveUp = (index) => {
		moveUp(index, this.props, "action", "get");
	};
	deleteRow = (index) => {
		deleteRow(index, this.props, "action", "get");
	};
	editRow = (index) => {
		const data = deepCopy(this.props.data.data);
		const newRow = data.action[this.props.data.activeMenu].get[index];
		this.setState({ newRow: newRow });
		this.setState({ editRow: true });
		this.setState({ rowPopup: true });
		this.setState({ rowIndex: index });
	};
	openAddRowCard = (index) => {
		this.setState({ rowPopup: true });
		this.setState({ rowIndex: index });
	};

	closeAddRowCard = (isOk) => {
		if (isOk) {
			const data = deepCopy(this.props.data.data);
			if (this.state.editRow) {
				data.action[this.props.data.activeMenu].get.splice(this.state.rowIndex, 1, this.state.newRow);
			} else {
				data.action[this.props.data.activeMenu].get.splice(this.state.rowIndex + 1, 0, this.state.newRow);
			}
			this.props.callback.updateNative("data", data);
		}

		this.setState({ rowPopup: false });
		this.setState({ editRow: false });
		this.resetNewRow();
	};
	resetNewRow = () => {
		this.setState({ newRow: this.newRow });
	};
	newRow = { trigger: [""], IDs: [""], text: [""], newline_checkbox: [""] };
	render() {
		if (this.props.data.data.action) getRows(this.props.data.data.action, this.props.data.activeMenu);
		return (
			<div>
				{rows.length == 0 ? (
					<Button b_color="#96d15a" title="Add new Action" width="50%" margin="0 18px" height="50px" index={0}>
						<i className="material-icons translate">add</i>
						{I18n.t("Add new Action")}
					</Button>
				) : (
					<TableContainer component={Paper}>
						<Table sx={{ minWidth: 650 }} aria-label="simple table">
							<TableHead>
								<TableRow>
									<TableCell>{I18n.t("Trigger")}</TableCell>
									<TableCell align="left">ID</TableCell>
									<TableCell align="left">{I18n.t("Text")}</TableCell>
									<TableCell align="left"> {I18n.t("Newline")} </TableCell>
									<TableCell align="center" className="cellIcon"></TableCell>
									<TableCell align="center" className="cellIcon"></TableCell>
									<TableCell align="center" className="cellIcon"></TableCell>
									<TableCell align="center" className="cellIcon"></TableCell>
									<TableCell align="center" className="cellIcon"></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row, index) => (
									<TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
										<TableCell component="th" scope="row">
											{row.trigger}
										</TableCell>
										<TableCell align="left">
											<SubTable data={row.id} />
										</TableCell>
										<TableCell align="left">
											<SubTable data={row.text}></SubTable>
										</TableCell>
										<TableCell align="left">
											<SubTable data={row.newline}></SubTable>
										</TableCell>
										<ButtonCard
											openAddRowCard={this.openAddRowCard}
											editRow={this.editRow}
											moveDown={this.moveDown}
											moveUp={this.moveUp}
											deleteRow={this.deleteRow}
											rows={rows}
											index={index}
										></ButtonCard>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}
				{this.state.rowPopup ? (
					<PopupContainer callback={this.closeAddRowCard} width="99%" height="70%">
						<RowGetCard data={this.state.newRow} callback={{ setState: this.setState.bind(this) }}></RowGetCard>
					</PopupContainer>
				) : null}
			</div>
		);
	}
}

export default SetState;
