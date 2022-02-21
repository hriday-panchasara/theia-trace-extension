/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractOutputComponent, AbstractOutputProps, AbstractOutputState } from './abstract-output-component';
import * as React from 'react';
import { QueryHelper } from 'tsp-typescript-client/lib/models/query/query-helper';
import { Entry } from 'tsp-typescript-client/lib/models/entry';
import { ResponseStatus } from 'tsp-typescript-client/lib/models/response/responses';
import { EntryTree } from './utils/filter-tree/entry-tree';
import { getAllExpandedNodeIds } from './utils/filter-tree/utils';
import { TreeNode } from './utils/filter-tree/tree-node';
import ColumnHeader from './utils/filter-tree/column-header';
import { cloneDeep } from 'lodash';
import debounce from 'lodash.debounce';

type DataTreeOutputProps = AbstractOutputProps & {
};

type DataTreeOuputState = AbstractOutputState & {
    selectedSeriesId: number[];
    xyTree: Entry[];
    selectedTree: Entry[];
    collapsedNodes: number[];
    orderedNodes: number[];
    columns: ColumnHeader[];
};

export class DataTreeOutputComponent extends AbstractOutputComponent<AbstractOutputProps, DataTreeOuputState> {
    treeRef: React.RefObject<HTMLDivElement> = React.createRef();

    private _debouncedFetchSelectionData = debounce(() => this.fetchSelectionData(), 500);

    constructor(props: AbstractOutputProps) {
        super(props);
        this.state = {
            outputStatus: ResponseStatus.RUNNING,
            selectedSeriesId: [],
            xyTree: [],
            selectedTree: [],
            collapsedNodes: [],
            orderedNodes: [],
            columns: [{title: 'Name', sortable: true}],
        };
    }

    componentDidMount(): void {
        this.waitAnalysisCompletion();
    }

    async fetchTree(): Promise<ResponseStatus> {
        const parameters = QueryHelper.timeQuery([this.props.range.getStart(), this.props.range.getEnd()]);
        // TODO: use the data tree endpoint instead of the xy tree endpoint
        const tspClientResponse = await this.props.tspClient.fetchXYTree(this.props.traceId, this.props.outputDescriptor.id, parameters);
        const treeResponse = tspClientResponse.getModel();
        if (tspClientResponse.isOk() && treeResponse) {
            if (treeResponse.model) {
                const headers = treeResponse.model.headers;
                const columns = [];
                if (headers && headers.length > 0) {
                    headers.forEach(header => {
                        columns.push({title: header.name, sortable: true, resizable: true, tooltip: header.tooltip});
                    });
                } else {
                    columns.push({title: 'Name', sortable: true});
                }
                this.setState({
                    outputStatus: treeResponse.status,
                    xyTree: treeResponse.model.entries,
                    columns
                });
            } else {
                this.setState({
                    outputStatus: treeResponse.status
                });
            }
            return treeResponse.status;
        }
        this.setState({
            outputStatus: ResponseStatus.FAILED
        });
        return ResponseStatus.FAILED;
    }

    resultsAreEmpty(): boolean {
        return this.state.xyTree.length === 0;
    }

    renderTree(): React.ReactNode | undefined {
        this.onToggleCollapse = this.onToggleCollapse.bind(this);
        this.onOrderChange = this.onOrderChange.bind(this);
        const totalEntries = this.state.xyTree.concat(this.state.selectedTree);
        return totalEntries.length
            ?   <div
                    tabIndex={0}
                    id={this.props.traceId + this.props.outputDescriptor.id + 'focusContainer'}
                    className='scrollable' style={{ height: this.props.style.height, width: this.getMainAreaWidth() }}
                >
                <EntryTree
                    entries={totalEntries}
                    showCheckboxes={false}
                    collapsedNodes={this.state.collapsedNodes}
                    onToggleCollapse={this.onToggleCollapse}
                    onOrderChange={this.onOrderChange}
                    headers={this.state.columns}
                />
            </div>
            : undefined
            ;
    }

    renderMainArea(): React.ReactNode {
        return <React.Fragment>
            {this.state.outputStatus === ResponseStatus.COMPLETED ?
                <div ref={this.treeRef} className='output-component-tree disable-select'
                    style={{ height: this.props.style.height, width: this.props.outputWidth }}
                >
                    {this.renderTree()}
                </div> :
                <div tabIndex={0} id={this.props.traceId + this.props.outputDescriptor.id + 'focusContainer'} className='analysis-running-main-area'>
                    <i className='fa fa-refresh fa-spin' style={{ marginRight: '5px' }} />
                    <span>Analysis running</span>
                </div>
            }
        </React.Fragment>;
    }

    setFocus(): void {
        if (document.getElementById(this.props.traceId + this.props.outputDescriptor.id + 'focusContainer')) {
            document.getElementById(this.props.traceId + this.props.outputDescriptor.id + 'focusContainer')?.focus();
        } else {
            document.getElementById(this.props.traceId + this.props.outputDescriptor.id)?.focus();
        }
    }

    private onToggleCollapse(id: number, nodes: TreeNode[]) {
        let newList = [...this.state.collapsedNodes];

        const exist = this.state.collapsedNodes.find(expandId => expandId === id);

        if (exist !== undefined) {
            newList = newList.filter(collapsed => id !== collapsed);
        } else {
            newList = newList.concat(id);
        }
        const orderedIds = getAllExpandedNodeIds(nodes, newList);
        this.setState({collapsedNodes: newList, orderedNodes: orderedIds});
    }

    private onOrderChange(ids: number[]) {
        this.setState({orderedNodes: ids});
    }

    protected async waitAnalysisCompletion(): Promise<void> {
        let outputStatus = this.state.outputStatus;
        const timeout = 500;
        while (this.state && outputStatus === ResponseStatus.RUNNING) {
            outputStatus = await this.fetchTree();
            await new Promise(resolve => setTimeout(resolve, timeout));
        }
    }

    componentWillUnmount(): void {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (_state, _callback) => undefined;
    }

    protected async fetchSelectionData(): Promise<void> {
        if (this.props.selectionRange) {
            const origXYTree = cloneDeep(this.state.xyTree);
            origXYTree.sort((a,b)=> (a.id > b.id) ? 1 : -1);

            const parameters = QueryHelper.timeQuery([this.props.selectionRange.getStart(), this.props.selectionRange.getEnd()]);
            // TODO: use the data tree endpoint instead of the xy tree endpoint
            const tspClientResponse = await this.props.tspClient.fetchXYTree(this.props.traceId, this.props.outputDescriptor.id, parameters);
            const treeResponse = tspClientResponse.getModel();
            if (tspClientResponse.isOk() && treeResponse) {
                if (treeResponse.model) {
                    let newEntries = treeResponse.model.entries;
                    newEntries = newEntries.filter(obj => obj.parentId !== -1);

                    for (let i=0;i<newEntries.length;i++) {
                        let prevTargetId = -1;
                        let curTargetId = -1;

                        if (newEntries[i].labels.length > 0 && newEntries[i].labels.includes('Total')) {
                            const index = newEntries[i].labels.indexOf('Total');
                            newEntries[i].labels[index] = 'Selection';
                            prevTargetId = newEntries[i].id;
                            curTargetId = newEntries[i].id + origXYTree[origXYTree.length-1].id;
                            newEntries[i].id = curTargetId;

                            // selection root found
                            for (let j=0;j<newEntries.length;j++) {
                                if (newEntries[j].parentId === prevTargetId) {
                                    newEntries[j].parentId = curTargetId;
                                    newEntries[j].id = newEntries[j].id + origXYTree[origXYTree.length-1].id;
                                }
                            }
                        }
                    }

                    const testTree = cloneDeep(this.state.xyTree);

                    this.setState({
                        xyTree: testTree,
                        selectedTree: newEntries
                    });
                }
            }
        }
    }

    async componentDidUpdate(prevProps: DataTreeOutputProps): Promise<void> {
        if (this.props.selectionRange && this.props.selectionRange !== prevProps.selectionRange) {
            if (Number(this.props.selectionRange.getDuration()) > 0) {
                this._debouncedFetchSelectionData();
            }
            else {
                this.setState({
                    selectedTree: []
                });
            }
        }
    }
}
