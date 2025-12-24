interface TimesheetGridConfig {
    timesheetId: number;
    isEditable: boolean;
    hideEmptyRows: boolean;
    hideEmptyColumns: boolean;
}
export declare class TimesheetGrid {
    private readonly config;
    private columns;
    private rows;
    private cells;
    private readonly containerElement;
    private readonly shiftLog;
    constructor(containerElement: HTMLElement, config: TimesheetGridConfig);
    private getCellKey;
    private getCellHours;
    private setCellHours;
    private getRowTotal;
    private getColumnTotal;
    private shouldShowRow;
    private shouldShowColumn;
    loadData(): Promise<void>;
    private createCellElement;
    private updateCell;
    render(): void;
    private editColumn;
    private deleteColumn;
    private editRow;
    private deleteRow;
    init(): Promise<void>;
    setDisplayOptions(options: {
        hideEmptyRows?: boolean;
        hideEmptyColumns?: boolean;
    }): void;
}
declare global {
    interface Window {
        TimesheetGrid: typeof TimesheetGrid;
    }
}
export {};
