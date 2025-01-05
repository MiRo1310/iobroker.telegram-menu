import React, {Component} from 'react';
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';

import {deepCopy} from '@/lib/Utils.js';
import {CallbackFunctionsApp, DataMainContent, PropsTabNavigation} from '@/types/app';
import type {EventButton, EventInput} from '@/types/event';
import {I18n} from "@iobroker/adapter-react-v5";
import {ButtonCard} from "@components/popupCards/buttonCard";
import {moveRows} from "@/lib/button";
import Input from "@/components/btn-Input/input"

interface DescriptionRow {
    description: string
    call: string
}

interface State {
    rows: DescriptionRow[]
}

class TabNavigation extends Component<{ data: DataMainContent, callback: CallbackFunctionsApp }, State> {
    constructor(props: PropsTabNavigation) {
        super(props);
        this.state = {
            rows: [{description: "", call: ""}],
        };
    }

    componentDidMount() {
        if (this.props.data.state.native.description) {
            this.setState({rows: this.props.data.state.native.description})
        }
    }

    handleUpdateInput = (event: EventInput) => {
        const rows = deepCopy(this.state.rows)
        if (rows && typeof event?.index === "number") {
            rows[event.index][event.id] = event.val
            this.updateRows(rows)
        }

    }
    updateRows = (rows: DescriptionRow[]) => {
        this.setState({rows: rows})
        this.props.callback.updateNative("description", rows)
    }

    addRow = ({index}: EventButton): void => {
        const row = {description: "", call: ""}
        const rowsCopy = deepCopy(this.state.rows)
        if (!rowsCopy) return
        rowsCopy.splice(index + 1, 0, row)
        this.updateRows(rowsCopy)
    };

    modifyRows = (direction: "up" | "down" | "delete", index: number) => {
        const rows = moveRows(direction, index, this.state.rows)
        if (!rows) return
        this.setState({rows: rows})
        this.props.callback.updateNative("description", rows)
    }

    render(): React.ReactNode {
        return (
            <>
                <p>{I18n.t("descriptionInfo")}</p>
                <TableContainer
                    component={Paper}
                    className="table__container_description"
                >
                    <Table
                        stickyHeader
                        aria-label="sticky table"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>{I18n.t("call")}</TableCell>
                                <TableCell>{I18n.t("description")}</TableCell>
                                <TableCell
                                    align="center"
                                    className="cellIcon"
                                />
                                <TableCell
                                    align="center"
                                    className="cellIcon"
                                />
                                <TableCell
                                    align="center"
                                    className="cellIcon"
                                />
                                <TableCell
                                    align="center"
                                    className="cellIcon"
                                />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.rows.map((row, indexRow) => (
                                <TableRow
                                    key={indexRow}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    className={`no-select`}
                                >
                                    <TableCell component="td">
                                        <Input value={row.call} callback={this.handleUpdateInput} index={indexRow}
                                               id={"call"}/>
                                    </TableCell>
                                    <TableCell component="td">
                                        <Input value={row.description} callback={this.handleUpdateInput}
                                               index={indexRow}
                                               id={"description"}/>
                                    </TableCell>
                                    <ButtonCard
                                        openAddRowCard={this.addRow}
                                        editRow={() => {
                                        }}
                                        moveDown={() => this.modifyRows("down", indexRow)}
                                        moveUp={() => this.modifyRows("up", indexRow)}
                                        deleteRow={() => this.modifyRows("delete", indexRow)
                                        }
                                        rows={this.state.rows}
                                        index={indexRow}
                                        showButtons={{
                                            edit: false,
                                            add: true,
                                            remove: true,
                                            moveUp: true,
                                            moveDown: true
                                        }}
                                        notShowDelete={indexRow == 0}
                                    />
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            </>
        );
    }
}

export default TabNavigation;
