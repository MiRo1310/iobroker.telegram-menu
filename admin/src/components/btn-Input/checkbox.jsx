import React, { Component } from "react";

class Checkbox extends Component {
	onChangeHandler = (event) => {
		if (!(this.props.callbackValue === "event")) {
			if (this.props.setNative) {
				this.props.callback(this.props.id, event.target.checked);
			} else {
				this.props.callback({ [this.props.id]: event.target.checked });
			}
		} else {
			if (this.props.obj) {
				this.props.callback({ val: event.target.checked, id: this.props.id, index: this.props.index });
			} else this.props.callback(event, this.props.id);
		}
	};

	render() {
		return (
			<div className="Checkbox" style={{ display: "inline" }}>
				<label>
					<input type="checkbox" checked={this.props.isChecked} onChange={this.onChangeHandler} />
					<p>{this.props.label}</p>
				</label>
			</div>
		);
	}
}

export default Checkbox;
