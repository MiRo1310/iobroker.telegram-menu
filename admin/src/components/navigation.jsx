import React, { Component } from "react";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";

import Button from "./Button";
import BtnSmallEdit from "./btn/btn-small-edit";
import BtnSmallRemove from "./btn/btn-small-remove";
import BtnSmallAdd from "./btn/btn-small-add";
import BtnSmallUp from "./btn/btn-small-up";
import BtnSmallDown from "./btn/btn-small-down";

function createData(call, nav, text) {
	const remove = <BtnSmallRemove />;
	const add = <BtnSmallAdd />;
	const edit = <BtnSmallEdit />;
	const up = <BtnSmallUp />;
	const down = <BtnSmallDown />;

	return { call, nav, text, remove, add, edit, up, down };
}
let rows = [];
function getRows(element) {
	rows = [];
	for (let entry of element) {
		rows.push(createData(entry.call, entry.value, entry.text));
	}
}
class MenuNavigation extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		if (this.props.nav) getRows(this.props.nav.Gruppe_1);
		return (
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: "250px", width: "99%", overflow: "hidden" }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell align="left">Call</TableCell>
							<TableCell align="right">Navigation</TableCell>
							<TableCell align="right">Text</TableCell>
							<TableCell align="center" className="cellIcon"></TableCell>
							<TableCell align="center" className="cellIcon"></TableCell>
							<TableCell align="center" className="cellIcon"></TableCell>
							<TableCell align="center" className="cellIcon"></TableCell>
							<TableCell align="center" className="cellIcon"></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row, index) => (
							<TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} className={index % 2 === 0 ? "even" : "odd"}>
								<TableCell component="th" scope="row">
									{row.call}
								</TableCell>
								<TableCell align="right">{row.nav}</TableCell>
								<TableCell align="right">{row.text}</TableCell>

								<TableCell align="center" className="cellIcon">
									{row.add}
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{row.edit}
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{row.up}
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{row.down}
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{row.remove}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		);
	}
}
export default MenuNavigation;
