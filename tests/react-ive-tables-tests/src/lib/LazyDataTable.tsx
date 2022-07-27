import {useIntl} from 'react-intl';
import React, {useEffect, useState, useRef} from 'react';
import {
    DataTable,
    DataTableFilterParams,
    DataTablePFSEvent,
    DataTableProps,
    DataTableSelectionModeType
} from "primereact/datatable";
import {HeaderButton} from "../types";
import axios, {AxiosResponse} from "axios";
import {SimpleDataTable} from "./SimpleDataTable";
import {ContextMenu} from "primereact/contextmenu";
import {Tooltip} from "primereact/tooltip";
import clone from "lodash.clone";
import {Button} from "primereact/button";
import {Column} from "primereact/column";
import {InputText} from "primereact/inputtext";

interface Props {
    fetchData: (offset: number, limit: number, filters: any)            // Function which is responsible for fetching data
        => Promise<{ rows: any[], totalRecords: number }>
    columnOrder: string[];                                              // Defines order for the columns. NB! Only the specified columns here will be rendered.
    ignoreFilters?: string[];                                           // Defines which filters should be ignored. By default all are shown if `showFilters` is set to true.
    specialFilters?: { [key: string]: any };                            // Used for special filter elements. The key is the cName and the value is a function which handles filtering. For reference : https://primefaces.org/primereact/showcase/#/datatable/filter
    specialLabels?: { [key: string]: string; };                         // Used for special labels. By default the table is trying to use intl for translation of each label. If specialLabels is used it overrides the column name for translation. The key is the cName and the value is the translation string used in text properties for intl.
    showFilters?: boolean;                                              // Should filters be rendered.
    showHeader?: boolean;                                               // Should header be rendered.
    setSelected?: (value: any,                                          // Callback for selection. Provides the selected row/rows.
                   contextMenuClick: boolean) => void,
    contextMenu?: Object[],                                             // Context menu model. For reference : https://primefaces.org/primereact/showcase/#/datatable/contextmenu
    rowEditHandler?: (element: Object) => void,                         // Handler for row editing. NB! Even if a specific handler is not required, this property must be provided in order to trigger row editing. The function is invoked after saving the row. The event containing newData, rowIndex and other metadata is returned.
    specialEditors?: { [key: string]: any },                            // Just like specialFilters, specialEditors is used when specific editor element is needed. Reference:  https://primefaces.org/primereact/showcase/#/datatable/edit
    cellEditHandler?: (element: Object) => void,                        // Same as rowEditHandler.
    selectionHandler?: (e: any) => void,                                // Pretty much like setSelected. Not sure why it is needed, but it is used in some projects.
    selectionMode?: DataTableSelectionModeType | undefined,             // Selection mode.
    selectionKey?: string,                                              // Key used for selection. Default value is 'id'. Important for proper selection.
    onRowUnselect?: (e: any) => void,                                   // Callback invoked when row is unselected.
    selectedIds?: string[] | number[],                                  // Used for external selection. When such array is passed, items are filtered so that all items matching those ids are set in selectedRow.
    specialColumns?: {                                                  // Used for special columns that are not included in the `data` prop. The key is string used as 'cName' and the value is the JSX.Element, click handler and boolean specifying
        [key: string]:                                                  // if the column should be put at the beginning or at the end.
            {
                element: JSX.Element,
                handler: (rowData: any) => void,
                atStart: boolean
            }
    };
    columnTemplate?: { [key: string]: (rowData: any) => any };          // Used for special template for columns. The key is the cName corresponding in the `data` prop and the value is the template itself. Reference : https://primefaces.org/primereact/showcase/#/datatable/templating
    xlsx?: string;                                                      // If present, an excel icon is added to the header which when clicked downloads an excel file. The value of the prop is used for fileName and is translated using intl.
    formatDateToLocal?: boolean;                                        // Specifies whether dates should be formatted to local or not.
    toggleSelect?: { toggle: boolean, handler: () => void };            // Toggles checkbox column used for excel. Not very template prop.
    headerButtons?: HeaderButton[];                                     // Array with buttons to be shown in the header.
    rightHeaderButtons?: HeaderButton[];                                // Array with buttons to be shown in the header (from the right side).
    sortableColumns?: string[];                                         // Array of columns which should be sortable.
    virtualScroll?: boolean;                                            // When true virtual scroller is enabled and paginator is hidden
    scrollHeight?: string;                                              // Height for the scroll
    dtProps?: Partial<DataTableProps>;                                  // Additional properties to be passed directly to the datatable.
    doubleClick?: (e: any) => void;                                     // Double click handler function
    showSkeleton?: boolean;                                             // Used to indicate whether a skeleton should be shown or not *defaults to true*
    selectionResetter?: number;                                         // Used to reset selected items in the state of the datatable. It works similarly `refresh` prop of LazyDT.
    disableArrowKeys?: boolean;                                         // When true arrow keys will not select rows above or below
    tableHeight?: string;                                               // Specify custom height for the table.
    forOverlay?: boolean;                                               // Specifies if the datatable will be shown in an overlay pane
    editableColumns?: string[];                                         // Specifies which columns are editable
    externalFilters?: {                                                 // Object with key - name of a column and value - filter function which decides whether the row should be included or not.
        [key: string]:
            (rowData: any, filterValue: string) => boolean
    };
    onFilterCb?: (filteredData: any) => void;                           // Function to be called when there is filtering in the table -> the function gets the filtered data and passes it to the parent component
    columnStyle?: { [key: string]: { header: any, body: any } };        // Object to specify the style of the columns. It is split into header and body, corresponding to styling the column header and body
    showPaginator?: boolean;                                            // Whether to show to paginator or no
    footerTemplate?: () => JSX.Element;                                 // A function that returns a template for the footer of the table
    additionalFilters?: { [key: string]:
            { matchMode: 'contains' | string, value: any } };           // Additional filters for the table
    frozenColumns?: string[];                                           // Specify which columns should be frozen (default right aligned)
    refreshButton?: boolean;                                            // Should the table have refresh button in the header
    refreshButtonCallback?: () => void;                                 // Callback when refreshButton is clicked
    refresher?: number;                                                 // Used to manually refresh the table from parent component
}

export const LazyDataTable: React.FC<Props> = props => {
    const {formatMessage: f} = useIntl();

    const [items, setItems] = useState<any>([]);
    const [filters, setFilters] = useState<any>({});
    const [columns, setColumns] = useState<any>([]);
    const [rows, setRows] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>();
    const [selectedRowsPerPage, setSelectedRowPerPage] = useState<any>({});
    const editMode = props.cellEditHandler === undefined ? (props.rowEditHandler === undefined ? undefined : "row") : "cell";
    const cm = useRef<any>();
    const dt = useRef<any>();
    const [refresher, setRefresher] = useState<number>();
    const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
    const [selectedElement, setSelectedElement] = useState(null);

    const refreshTable = () => {
        props.fetchData(first, rows, filters).then((response) => {
            setItems(response.rows);
            setTotalRecords(response.totalRecords);
            setLoading(false);
        });
    }

    useEffect(() => {
        if (props.columnOrder.length > 0 && Object.keys(filters).length === 0) {
            const initialFilters: any = {};
            props.columnOrder.forEach(key => {
                if (!props.ignoreFilters?.includes(key) && props.columnOrder.includes(key)) {
                    initialFilters[key] = {value: '', matchMode: 'contains'};
                }
            })
            setFilters(initialFilters);
        }
    }, [props.columnOrder]);

    useEffect(() => {
        if (props.additionalFilters !== undefined && Object.keys(props.additionalFilters).length > 0) {
            const newFilters = {...filters, ...props.additionalFilters}
            setFilters(newFilters);
        }
    }, [props.additionalFilters]);

    useEffect(() => {
        if (props.refresher !== refresher) {
            setRefresher(props.refresher);
            refreshTable();
        }
    }, [props.refresher]);

    useEffect(() => {
        if (items && items.length > 0 && columns.length === 0) {
            generateColumns();
        }
    }, [items]);

    useEffect(() => {
        if (Object.keys(filters).length > 0) {
            setLoading(true);
            refreshTable();
        }
    }, [filters]);

    const onPage = (e: DataTablePFSEvent) => {
        setLoading(true);
        setFirst(e.first);
        setRows(e.rows);
        props.fetchData(e.first, e.rows, filters).then((response) => {
            setItems(response.rows);
            setTotalRecords(response.totalRecords);
            setLoading(false);
        });
    };

    const handleSelection = (e: any) => {
        if (!Array.isArray(e.value)) {
            if (props.setSelected) props.setSelected(e.value, true)
            if (props.selectionHandler) props.selectionHandler(e);
            return;
        }
        const page = Math.floor(first / rows) + 1;
        const newSelectedRowsPerPage = clone(selectedRowsPerPage);
        //Add elems
        for (let row of e.value) {
            //@ts-ignore
            if (Object.values(newSelectedRowsPerPage).flat().find((el: any) => el[props.selectionKey!] === row[props.selectionKey!]) === undefined) {
                if (newSelectedRowsPerPage[page] === undefined)
                    newSelectedRowsPerPage[page] = [];
                newSelectedRowsPerPage[page].push(row);
            }
        }

        //Remove elems
        const currPageElements = newSelectedRowsPerPage[page];
        const newElementsForPage = [];
        for (let row of currPageElements) {
            if (e.value.find((el: any) => el[props.selectionKey!] === row[props.selectionKey!]) !== undefined)
                newElementsForPage.push(row)
        }
        newSelectedRowsPerPage[page] = newElementsForPage;


        //@ts-ignore
        const newSelectedRow = Object.values(newSelectedRowsPerPage).flat();

        setSelectedRowPerPage(newSelectedRowsPerPage)
        setSelectedRow(newElementsForPage);

        if (props.selectionHandler) props.selectionHandler({value: newSelectedRow});
        //@ts-ignore
        if (props.setSelected) props.setSelected(Object.values(newSelectedRowsPerPage).flat());

    };

    const setRef = (ref: any) => {
        dt.current = ref;
        if (ref && props.tableHeight) {
            ref.table.parentElement.style.height = props.tableHeight;
        }
    }

    const getColumnHeaderTranslated = (cName: string) => {
        if (props.specialLabels && props.specialLabels[cName])
            return f({id: props.specialLabels[cName]})
        return f({id: cName});
    }

    //TODO
    const textEditor = (options: any) => {
        // return <InputText type="text" value={options.value} onChange={(e) => console.log(e.target.value)}/>;
        return null;
    }

    const onCellEditComplete = (e: any) => {
        let {rowData, newValue, field, originalEvent: event} = e;
        rowData[field] = newValue;
        props.cellEditHandler!(e);
    }

    const generateColumns = () => {
        if ((items.length > 0 && items[0]) || props.columnOrder) {
            if (columns.length === 0 || (props.toggleSelect && props.toggleSelect.toggle)) {
                const tempColumns = (props.columnOrder ? props.columnOrder : Object.keys(items[0])).map((cName: string) => {
                    let columnHeader = getColumnHeaderTranslated(cName);
                    const columnHeaderStyle = {textAlign: 'center', ...(props.columnStyle && props.columnStyle[cName]) ? props.columnStyle[cName].header : {textAlign: 'center'}};
                    const columnBodyStyle = (props.columnStyle && props.columnStyle[cName]) ? props.columnStyle[cName].body : {textAlign: "center"};

                    //TO BE TESTED
                    // If there are specialColumns passed, for each of them we create a column with a body, generated from the templating function, which copies the element sent from the parent as prop
                    return <Column
                        body={props.columnTemplate![cName] ? (rowData: any) => props.columnTemplate![cName](rowData) : undefined}
                        editor={props.specialEditors![cName] || (editMode && props.editableColumns!.includes(cName) ? textEditor : undefined)}
                        // filterFunction={handleFilter}
                        frozen={props.frozenColumns?.includes(cName)}
                        alignFrozen={"right"}
                        sortable={props.sortableColumns?.includes(cName)}
                        filterElement={props.specialFilters![cName]} showClearButton={false}
                        bodyStyle={columnBodyStyle} showFilterMenu={false} filterField={cName}
                        onCellEditComplete={props.cellEditHandler ? onCellEditComplete : undefined}
                        filter={props.showFilters && !props.ignoreFilters!.includes(cName)}
                        filterHeaderStyle={{textAlign: 'center'}}
                        key={cName} field={cName} header={columnHeader} headerStyle={columnHeaderStyle}/>
                });
                if (props.rowEditHandler !== undefined)
                    tempColumns.push(<Column rowEditor headerStyle={{width: '7rem'}}
                                             bodyStyle={{textAlign: 'center'}}/>);
                if (props.selectionMode === "checkbox")
                    tempColumns.unshift(<Column key="checkbox" selectionMode="multiple" headerStyle={{width: '3em'}}/>);
                //Put specialColumns in columns
                Object.keys(props.specialColumns || []).forEach(cName => {
                    const col = <Column field={cName} header={f({id: cName})}
                                        body={(rowData: any) => generateColumnBodyTemplate(cName, rowData)}/>
                    if (props.specialColumns![cName].atStart) {
                        tempColumns.unshift(col);
                    } else {
                        tempColumns.push(col);
                    }
                })

                setColumns(tempColumns);
            } else if (props.toggleSelect) {
                const firstColumn = columns[0];
                if (firstColumn.key && firstColumn.key === "checkbox") {
                    setColumns(columns.splice(1));
                }
            }
        }
    };

    //TO BE TESTED
    const generateColumnBodyTemplate = (column: string, rowData: any) => {
        return React.cloneElement(props.specialColumns![column].element, {
            onClick: (e: any) => props.specialColumns![column].handler(rowData)
        })
    }

    const getHeader = () => {
        return <div className="export-buttons" style={{display: "flex", justifyContent: "space-between"}}>
            <div>
                {/*{props.xlsx ?*/}
                {/*    <Button type="button" icon="pi pi-file-excel" onClick={exportExcel}*/}
                {/*            className="p-button-success p-mr-2" data-pr-tooltip="XLS"/>*/}
                {/*    : null*/}
                {/*}*/}
                {props.toggleSelect ?
                    <Button type="button" icon="fas fa-check-square" onClick={props.toggleSelect.handler}
                            className="p-button-success p-mr-2" data-pr-tooltip="XLS"/>
                    : null
                }
                {
                    props.headerButtons!.map(el => <Button type="button" icon={el.icon} onClick={el.onClick}
                                                           tooltip={el.tooltipLabel} label={el.label}
                                                           tooltipOptions={{position: 'top'}}
                                                           className={`${el.className} table-header-left-align-buttons p-mr-2`}/>)
                }
            </div>
            <div>
                {
                    props.rightHeaderButtons!.map(el => <Button type="button" icon={el.icon} onClick={el.onClick}
                                                                tooltip={el.tooltipLabel} label={el.label}
                                                                tooltipOptions={{position: 'top'}}
                                                                className={`${el.className} table-header-left-align-buttons p-mr-2`}/>)
                }
                {props.refreshButton ?
                    <Button type="button" icon="pi pi-refresh" onClick={() => {
                        refreshTable();
                        if (props.refreshButtonCallback) props.refreshButtonCallback()
                    }}/>
                    : null
                }
            </div>
        </div>
    };

    const onRowEditComplete = (e: any) => {
        let newItems = [...items];
        let {newData, index} = e;

        newItems[index] = newData;

        setItems(newItems);
        props.rowEditHandler!(e);
    }

    const onFilter = (event: DataTablePFSEvent) => {
        event['first'] = 0;
        setFirst(0);
        setFilters(event.filters);
    }


    return <>
        <div className="datatable-responsive-demo">
            {props.contextMenu ?
                <ContextMenu model={props.contextMenu} ref={cm} onHide={() => setSelectedElement(null)}
                             appendTo={document.body}/> : null}
            <Tooltip target=".export-buttons>button" position="bottom"/>

            <DataTable
                rowHover
                {...props.dtProps}
                //editMode={"row"} rowEditorValidator={props.onRowEditorValidator} onRowEditInit={props.onRowEditInit} onRowEditSave={props.onRowEditSave} onRowEditCancel={props.onRowEditCancel}
                //footerColumnGroup={props.subTotals ? buildSubTotals() : null}
                ref={setRef}
                value={items}
                filters={filters}
                lazy
                first={first}
                totalRecords={totalRecords}
                rows={rows}
                onFilter={onFilter}
                onPage={onPage}
                paginator={props.showPaginator && !props.virtualScroll}
                footer={props.footerTemplate || null}
                responsiveLayout={'stack'}
                dataKey={props.selectionKey}
                className="p-datatable-sm p-datatable-striped"
                filterDisplay={props.showFilters ? 'row' : undefined}
                // sortField={sortField} sortOrder={sortOrder} onSort={ (e : any) => {setLoading(true); setTimeout(() => {setSortField(e.sortField); setSortOrder(e.sortOrder)}, 0)}}
                sortMode={'multiple'}
                //@ts-ignore
                selectionMode={["single", "multiple", 'checkbox'].includes(props.selectionMode!) ? props.selectionMode : undefined}
                selection={selectedRow}
                onSelectionChange={handleSelection}
                emptyMessage="No records found"
                tableStyle={{tableLayout: "auto"}}
                header={props.showHeader ? getHeader() : null}
                rowsPerPageOptions={[20, 30, 50]}
                editMode={editMode}
                onRowEditComplete={onRowEditComplete}
                scrollable={props.virtualScroll || props.frozenColumns !== undefined}
                scrollHeight={props.scrollHeight ? props.scrollHeight : undefined}
                virtualScrollerOptions={props.scrollHeight ? {itemSize: 32} : undefined}
                loading={loading}
                onRowUnselect={props.onRowUnselect}
                onContextMenuSelectionChange={(e: any) => {
                    //set{selectedRow: e.value});
                    if (props.setSelected !== undefined && props.contextMenu) {
                        if (["multiple", 'checkbox'].includes(props.selectionMode!)) {
                            props.setSelected([e.value], true);
                            setSelectedRow([e.value]);
                            const page = Math.floor(first / rows) + 1;
                            setSelectedRowPerPage({[page]: [e.value]});
                            for (let i = 0; i < items.length; i++) {
                                if (items[i][props.selectionKey!] === e.value[props.selectionKey!]) {
                                    setSelectedRowIndex(i);
                                    break;
                                }
                            }
                        } else {
                            props.setSelected(e.value, true);
                            setSelectedRow(e.value);
                            for (let i = 0; i < items.length; i++) {
                                if (items[i][props.selectionKey!] === e.value[props.selectionKey!]) {
                                    setSelectedRowIndex(i);
                                    break;
                                }
                            }
                        }
                    }
                }}
                onContextMenu={e => {
                    //if(items[0].id !== null)
                    if (props.contextMenu)
                        cm.current!.show(e.originalEvent)
                }}
            >
                {columns}

            </DataTable>

        </div>
    </>
};

LazyDataTable.defaultProps = {
    showFilters: true,
    ignoreFilters: [],
    showHeader: true,
    selectionMode: undefined,
    selectionHandler: () => 0,
    onRowUnselect: undefined,
    selectedIds: [],
    columnTemplate: {},
    columnOrder: undefined,
    selectionKey: "id",
    formatDateToLocal: true,
    // refreshButton: true,
    headerButtons: [],
    rightHeaderButtons: [],
    sortableColumns: [],
    specialEditors: {},
    specialColumns: {},
    specialFilters: {},
    virtualScroll: false,
    scrollHeight: undefined,
    showSkeleton: true,
    disableArrowKeys: false,
    forOverlay: false,
    editableColumns: [],
    showPaginator: true,
    refreshButton: true
}