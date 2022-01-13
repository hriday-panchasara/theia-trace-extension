import * as React from 'react';
import { inject, injectable, postConstruct } from 'inversify';
import { Dialog, DialogProps } from '@theia/core/lib/browser/dialogs';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { Message } from '@theia/core/lib/browser/widgets/widget';

@injectable()
export class ChartShortcutsDialogProps extends DialogProps {
}

@injectable()
export class ChartShortcutsDialog extends ReactDialog<void> {

    constructor(
        @inject(ChartShortcutsDialogProps) protected readonly props: ChartShortcutsDialogProps
    ) {
        super({
            title: 'Trace Viewer Keyboard and Mouse Shortcuts',
        });
        this.appendAcceptButton(Dialog.OK);
    }

    @postConstruct()
    protected async init(): Promise<void> {
        this.title.label = 'Trace Viewer Keyboard and Mouse Shortcuts';
        this.update();
    }

    protected render(): React.ReactNode {
        return (
            <div className="shortcuts-table">
                <span className='shortcuts-table-header'>ESSENTIAL</span>
                <div className='shortcuts-table-row'>
                    <div className='shortcuts-table-column'>
                        <table>
                            <tbody>
                                <tr>
                                    <td><i className='fa fa-question-circle fa-lg' /> Display This Menu</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'>CTRL / command</span>
                                        <span className='monaco-keybinding-key'>F1</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='shortcuts-table-column'>
                        <table></table>
                    </div>
                </div>
                <span className='shortcuts-table-header'>ZOOM AND PAN</span>
                <div className='shortcuts-table-row'>
                    <div className='shortcuts-table-column'>
                        <table>
                            <tbody>
                                <tr>
                                    <td><i className='fa fa-plus-square-o fa-lg' /> Zoom in</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'>W</span>
                                        <span className='monaco-keybinding-seperator'>or</span>
                                        <span className='monaco-keybinding-key'>I</span>
                                        <span className='monaco-keybinding-seperator'>or</span>
                                        <span className='monaco-keybinding-key'>CTRL</span>
                                        <span className='monaco-keybinding-key'>Scroll</span>
                                        <span className='monaco-keybinding-seperator'>or</span>
                                        <span className='monaco-keybinding-key'>+</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><i className='fa fa-minus-square-o fa-lg' /> Zoom out</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'>S</span>
                                        <span className='monaco-keybinding-seperator'>or</span>
                                        <span className='monaco-keybinding-key'>K</span>
                                        <span className='monaco-keybinding-seperator'>or</span>
                                        <span className='monaco-keybinding-key'>CTRL</span>
                                        <span className='monaco-keybinding-key'>Scroll</span>
                                        <span className='monaco-keybinding-seperator'>or</span>
                                        <span className='monaco-keybinding-key'>-</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><i className='fa fa-hand-paper-o fa-lg' /> Pan</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'>A</span>
                                        <span className='monaco-keybinding-seperator'>&</span>
                                        <span className='monaco-keybinding-key'>D</span>
                                        <span className='monaco-keybinding-seperator'>or</span>
                                        <span className='monaco-keybinding-key'>J</span>
                                        <span className='monaco-keybinding-seperator'>&</span>
                                        <span className='monaco-keybinding-key'>L</span>
                                        <span className='monaco-keybinding-seperator'>or</span>
                                        <span className='monaco-keybinding-key'>CTRL</span>
                                        <span className='monaco-keybinding-key'>Drag</span>
                                        <span className='monaco-keybinding-seperator'>or</span>
                                        <span className='monaco-keybinding-key'>Middle-Drag</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='shortcuts-table-column'>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Zoom to selected range</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'>Right-Click</span>
                                        <span className='monaco-keybinding-key'>Drag</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Zoom to state&apos;s range</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span>Double-click state</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <span className='shortcuts-table-header'>NAVIGATE</span>
                <div className='shortcuts-table-row'>
                    <div className='shortcuts-table-column'>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Next state</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'><i className='fa fa-arrow-right' /></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Previous state</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'><i className='fa fa-arrow-left' /></span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='shortcuts-table-column'>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Move up a row</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'><i className='fa fa-arrow-up' /></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Move down a row</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'><i className='fa fa-arrow-down' /></span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <span className='shortcuts-table-header'>SELECT</span>
                <div className='shortcuts-table-row'>
                    <div className='shortcuts-table-column'>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Select element</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span>Click element</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Select point in time</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span>Click anywhere in chart</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='shortcuts-table-column'>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Extend time range</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'>Shift</span>
                                        <span className='monaco-keybinding-key'>Click</span>
                                        <span className='monaco-keybinding-seperator'>or</span>
                                        <span className='monaco-keybinding-key'>Shift</span>
                                        <span className='monaco-keybinding-key'><i className='fa fa-arrow-left' /></span>
                                        <span className='monaco-keybinding-key'><i className='fa fa-arrow-right' /></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Select time range</td>
                                    <td className='monaco-keybinding shortcuts-table-keybinding'>
                                        <span className='monaco-keybinding-key'>Drag</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        this.update();
    }

    get value(): undefined { return undefined; }
}
