import * as React from 'react';
import { DataTableSelectionModeType } from "primereact/datatable";
import "./DataTable.css";
import { HeaderButton } from "../types";
interface Props {
    dataUrl: string;
    ignoreFilters?: string[];
    specialFilters?: {
        [key: string]: {
            element: JSX.Element;
            type: string;
        };
    };
    specialLabels?: {
        [key: string]: string;
    };
    additionalFilters?: {
        [key: string]: any;
    };
    showFilters?: boolean;
    showHeader?: boolean;
    setSelected?: (e: any) => void;
    contextMenu?: Object[];
    refresher?: number;
    rowEditHandler?: (element: Object) => void;
    cellEditHandler?: () => void;
    customEditors?: {
        [key: string]: JSX.Element;
    };
    selectionHandler?: (e: any) => void;
    selectionMode?: DataTableSelectionModeType | undefined;
    selectionKey?: string;
    onRowUnselect?: (e: any) => void;
    selectedIds?: string[];
    specialColumn?: {
        [key: string]: {
            element: JSX.Element;
            handler: (rowData: any) => void;
        };
    };
    columnTemplate?: {
        [key: string]: (rowData: any) => any;
    };
    columnOrder: string[];
    xlsx?: string;
    refreshButton?: boolean;
    refreshButtonCallback?: () => void;
    formatDateToLocal?: boolean;
    toggleSelect?: {
        toggle: boolean;
        handler: () => void;
    };
    xlsxAdditionalFilters?: () => Object[];
    onFiltersUpdated?: any;
    headerButtons?: HeaderButton[];
}
export declare const LazyDataTable: React.FC<Props>;
export {};
