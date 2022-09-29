import * as React from 'react';
import { TreeNode } from './tree-node';
import { TableHeader } from './table-header';
import { TableBody } from './table-body';
import { SortConfig, sortState, nextSortState, sortNodes } from './sort';
import ColumnHeader from './column-header';
import { signalManager, Signals } from 'traceviewer-base/lib/signals/signal-manager';
import { OutputDescriptor } from 'tsp-typescript-client';

interface TableProps {
    nodes: TreeNode[];
    selectedRow?: number;
    collapsedNodes: number[];
    isCheckable: boolean;
    isClosable: boolean;
    sortConfig: SortConfig[];
    onRowClick: (id: number) => void;
    getCheckedStatus: (id: number) => number;
    onToggleCollapse: (id: number) => void;
    onToggleCheck: (id: number) => void;
    onClose: (id: number) => void;
    onSort: (sortedNodes: TreeNode[]) => void;
    onSortConfigChange: (sortConfig: SortConfig[]) => void;
    showHeader: boolean;
    headers: ColumnHeader[];
    className: string;
    showContextMenu?: boolean;
    outputDescriptor?: OutputDescriptor
}

interface TableState {
    anchorX: number,
    anchorY: number,
    showContextMenu: boolean
}

export class Table extends React.Component<TableProps, TableState> {

    private sortableColumns: string[];
    private _doHandleShowContextMenu = (payload: { xPos: number, yPos: number, nodeId: number, outputId: string}): void => this.showContextMenu(payload);

    constructor(props: TableProps) {
        super(props);
        this.state = {
            anchorX: 0,
            anchorY: 0,
            showContextMenu: false
        }
        signalManager().on(Signals.DATATREE_OUTPUT_OPEN_CONTEXT_MENU, this._doHandleShowContextMenu);
        const sortableCols: string[] = [];
        const config: SortConfig[] = [];
        this.props.headers.forEach((header: ColumnHeader, columnIndex) => {
            if (header.sortable) {
                config.push({ column: header.title, columnIndex: columnIndex, sortState: sortState.default });
                sortableCols.push(header.title);
            }
        });
        this.props.onSortConfigChange(config);
        this.sortableColumns = sortableCols;
        this.closeContextMenu = this.closeContextMenu.bind(this);
    }

    componentWillUnmount(): void {
        signalManager().off(Signals.DATATREE_OUTPUT_OPEN_CONTEXT_MENU, this._doHandleShowContextMenu);
    }

    onSortChange = (sortColumn: string): void => {
        let newSortConfigs: SortConfig[] = [...this.props.sortConfig];
        newSortConfigs = newSortConfigs.map((config: SortConfig) => {
            if (config.column === sortColumn) {
                return { ...config, sortState: nextSortState(config.sortState) };
            } else {
                return { ...config, sortState: sortState.default };
            }
        });
        const newSortedNodes = sortNodes(this.props.nodes, newSortConfigs);
        this.props.onSortConfigChange(newSortConfigs);
        this.props.onSort(newSortedNodes);
    };

    protected renderContextMenu(): React.ReactNode {
        return <React.Fragment>
            <div className='tr-custom-context-menu' style={{top: this.state.anchorY, left: this.state.anchorX}}>
                <ul>
                    <li>First Option</li>
                    <li>Second Option</li>
                </ul>
            </div>
        </React.Fragment>;
    }

    private showContextMenu(payload: { xPos: number, yPos: number, nodeId: number, outputId: string}): void {
        console.log('show Context menu called');
        console.log(payload.outputId);
        console.log(this.props.outputDescriptor?.id ?? "no props outputDescriptor");
        if (payload.outputId === this.props.outputDescriptor?.id) {
            console.log('set show');
            this.setState({
                anchorX: payload.xPos,
                anchorY: payload.yPos,
                showContextMenu: true
            }, () => {
                document.addEventListener('click', this.closeContextMenu);
            });
        }
    }

    private closeContextMenu(): void {
        console.log('close Context menu called');
        this.setState({showContextMenu: false}, () => {
            document.removeEventListener('click', this.closeContextMenu);
        });
    }

    render(): JSX.Element {
        const gridTemplateColumns = this.props.headers.map(() => 'max-content').join(' ').concat(' minmax(0px, 1fr)');
        return (
            <div>
                <table style={{ gridTemplateColumns: gridTemplateColumns }} className={this.props.className}>
                    {this.props.showHeader && <TableHeader
                        columns={this.props.headers}
                        sortableColumns={this.sortableColumns}
                        onSort={this.onSortChange}
                        sortConfig={this.props.sortConfig}
                    />}
                    <TableBody
                        {...this.props}
                        nodes={sortNodes(this.props.nodes, this.props.sortConfig)}
                    />
                </table>
                {this.state.showContextMenu && this.renderContextMenu()}
            </div>
        );
    }
}
