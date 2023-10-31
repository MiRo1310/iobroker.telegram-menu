import React, { Component } from "react";
import Input from "./btn-Input/input";
import Grid from "@material-ui/core/Grid";
import Button from "./btn-Input/Button";
class BtnCard extends Component {
	render() {
		return (
			<Grid container spacing={0} className="MenuCard">
				<Grid item xs={4}>
					<Input label="Add new Menu Name" width="80%"></Input>
				</Grid>
				<Grid item xs={2}>
					<Button b_color="#ddd" margin="10px">
						<i className="material-icons">group_add</i>Add
					</Button>
				</Grid>
				<Grid item xs={2}>
					<Button b_color="red" color="white" margin="10px">
						<i className="material-icons">delete</i>Delete
					</Button>
				</Grid>
				<Grid item xs={2}>
					<Button b_color="blue" color="white" margin="10px">
						<i className="material-icons">edit</i>Edit
					</Button>
				</Grid>
				<Grid item xs={2}>
					<Button b_color="green" color="white" margin="10px">
						<i className="material-icons translate ">content_copy</i>Copy
					</Button>
				</Grid>
			</Grid>
		);
	}
}

export default BtnCard;
