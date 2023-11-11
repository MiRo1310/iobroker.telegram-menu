import React, { Component } from "react";
import { TableHead, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import { I18n } from "@iobroker/adapter-react-v5";

import BtnSmallEdit from "./btn-Input/btn-small-edit";
import BtnSmallRemove from "./btn-Input/btn-small-remove";
import BtnSmallAdd from "./btn-Input/btn-small-add";
import BtnSmallUp from "./btn-Input/btn-small-up";
import BtnSmallDown from "./btn-Input/btn-small-down";

function createData(call, nav, text) {
	return { call, nav, text };
}

let rows = [];
function getRows(nav, activeMenu) {
	let elemente = nav[activeMenu];
	rows = [];
	if (elemente === undefined) return;
	for (let entry of elemente) {
		rows.push(createData(entry.call, entry.value, entry.text));
	}
}
class MenuNavigation extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentDidUpdate(prevProps) {
		if (prevProps.activeMenu !== this.props.activeMenu || prevProps.nav !== this.props.nav) {
			getRows(this.props.nav, this.props.activeMenu);
		}
	}
	render() {
		if (this.props.nav) getRows(this.props.nav, this.props.activeMenu);
		return (
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: "250px", width: "99%", overflow: "hidden" }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell align="left">{I18n.t("Trigger")}</TableCell>
							<TableCell align="right">{I18n.t("Navigation")}</TableCell>
							<TableCell align="right">{I18n.t("Text")}</TableCell>
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
									<BtnSmallAdd />
								</TableCell>
								<TableCell align="center" className="cellIcon">
									<BtnSmallEdit />
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{index != 0 ? <BtnSmallUp disabled={index == 1 ? "disabled" : null}></BtnSmallUp> : null}
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{index != 0 ? <BtnSmallDown disabled={index == rows.length - 1 ? "disabled" : ""} /> : null}
								</TableCell>
								<TableCell align="center" className="cellIcon">
									{index != 0 ? <BtnSmallRemove /> : null}
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
