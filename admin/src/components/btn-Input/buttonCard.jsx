import React, { Component } from "react";
import { TableCell } from "@mui/material";
import BtnSmallAdd from "../btn-Input/btn-small-add";
import BtnSmallEdit from "../btn-Input/btn-small-edit";
import BtnSmallUp from "../btn-Input/btn-small-up";
import BtnSmallDown from "../btn-Input/btn-small-down";
import BtnSmallRemove from "../btn-Input/btn-small-remove";

export const ButtonCard = (props) => {
	return (
		<>
			<TableCell align="center" className="cellIcon">
				<BtnSmallAdd callback={props.openAddRowCard} index={props.index} />
			</TableCell>

			<TableCell align="center" className="cellIcon">
				<BtnSmallEdit callback={props.editRow} index={props.index} />
			</TableCell>
			<TableCell align="center" className="cellIcon">
				<BtnSmallUp callback={props.moveUp} index={props.index} disabled={props.index == 0 ? "disabled" : null}></BtnSmallUp>
			</TableCell>
			<TableCell align="center" className="cellIcon">
				<BtnSmallDown callback={props.moveDown} index={props.index} disabled={props.index == props.rows.length - 1 ? "disabled" : ""} />
			</TableCell>
			<TableCell align="center" className="cellIcon">
				<BtnSmallRemove callback={props.deleteRow} index={props.index} />
			</TableCell>
		</>
	);
};
