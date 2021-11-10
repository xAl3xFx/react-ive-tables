import * as React from 'react';
import { DataTableSelectionModeType } from "primereact/datatable";
import "./DataTable.css";
import { MenuItem } from 'primereact/menuitem/menuitem';
interface Props {
    data: any;
    setSelected: (e: any) => void;
    rowEditHandler?: (element: Object) => void;
    cellEditHandler?: (e: any) => void;
    customEditors?: {
        [key: string]: JSX.Element;
    };
    selectionHandler?: (e: any) => void;
    selectionMode?: DataTableSelectionModeType | undefined;
    showFilters?: boolean;
    onRowUnselect?: (e: any) => void;
    selectedIds?: string[];
    specialColumn?: {
        [key: string]: {
            element: JSX.Element;
            handler: (rowData: any) => void;
        };
    };
    ignoreEditableColumns?: string[];
    externalDataHandler?: (e: any[]) => void;
    contextMenu?: MenuItem[];
    xlsx?: string;
    ignoreColumns?: string[];
    columnTemplate?: {
        [key: string]: (rowData: any) => any;
    };
    create?: () => void;
    sort?: boolean;
}
export declare const SimpleDataTable: React.FC<Props>;
export {};
