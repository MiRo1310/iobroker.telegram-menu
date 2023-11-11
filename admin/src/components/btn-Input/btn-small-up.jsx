import React, { Component } from "react";
import Button from "./Button";

class BtnSmallUp extends Component {
	render() {
		return (
			<Button b_color="blue" color="white" title="Move up" small="true" round="true" classname={this.props.disabled}>
				<i className="material-icons">arrow_upward</i>
			</Button>
		);
	}
}

export default BtnSmallUp;
