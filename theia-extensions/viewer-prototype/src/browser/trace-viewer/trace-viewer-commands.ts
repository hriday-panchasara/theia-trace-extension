import { Command, MenuPath } from '@theia/core';

export const OpenTraceCommand: Command = {
    id: 'open-trace',
    label: 'Open Trace'
};

export const TraceViewerCommand: Command = {
    id: 'trace-viewer',
    label: 'Trace Viewer'
};

export const StartServerCommand: Command = {
    id: 'start-trace-server',
    label: 'Start Trace Server'
};

export const StopServerCommand: Command = {
    id: 'stop-trace-server',
    label: 'Stop Trace Server'
};

export const KeyboardShortcutsCommand: Command = {
    id: 'trace-viewer-keyboard-shortcuts',
    label: 'Trace Viewer Keyboard and Mouse Shortcuts'
};

export const OpenTraceWithRootPathCommand: Command = {
    id: 'open-trace-with-root-path',
    label: 'Open Trace With Root Path'
};

export const OpenDataTreeContextMenu: Command = {
    id: 'open-data-tree-context-menu',
    label: 'Open Data Tree Context Menu'
}

export namespace TraceContextComponentMenus {
    export const DATATREE_OUTPUT_CONTEXT_MENU: MenuPath = ['trace-context-component-datatree-context-menu'];
}