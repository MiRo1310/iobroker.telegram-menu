import React, { Component } from "react";
import HelperCard from "@/components/popupCards/HelperCard";
import PopupContainer from "@/components/popupCards/PopupContainer";

import helperText from "@/config/helper.js";
import { PropsTableNavHelper } from "admin/app";
import { EventButton } from "@components/btn-Input/button";

class TableNavHelper extends Component<PropsTableNavHelper> {
	constructor(props: PropsTableNavHelper) {
		super(props);
		this.state = {};
	}
	onchangeValueFromHelper = ({ value }: EventButton): void => {
		if (this.props.state.editedValueFromHelperText === null) {
			this.props.setState({ editedValueFromHelperText: value });
		}

		this.props.setState({ editedValueFromHelperText: this.props.state.editedValueFromHelperText + " " + value });
	};

	render(): React.ReactNode {
		return (
			<PopupContainer
				callback={this.props.popupHelperCard}
				width="90%"
				height="80%"
				title="Helper Texte"
				setState={this.setState.bind(this)}
				isOK={this.props.state.isOK}
				class="HelperText"
			>
				<HelperCard
					data={this.props.data}
					helper={helperText}
					name="nav"
					val="nav"
					helperTextForInput={this.props.state.helperTextFor}
					text={this.props.state.newRow.text}
					callback={this.onchangeValueFromHelper}
					editedValueFromHelperText={this.props.state.editedValueFromHelperText || ""}
					setState={this.props.setState.bind(this)}
				/>
			</PopupContainer>
		);
	}
}

export default TableNavHelper;
