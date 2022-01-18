import * as React from 'react';
import {useIntl} from "react-intl";
import axios from 'axios'
import {FormEvent, useEffect, useRef, useState} from "react";
import {Column} from "primereact/column";
import {DataTable, DataTableProps, DataTableSelectionModeType, DataTableSortOrderType} from "primereact/datatable";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import "../tests/react-ive-tables-tests/src/lib/DataTable.css";
import {ContextMenu} from 'primereact/contextmenu';
import {Tooltip} from 'primereact/tooltip';
import moment from 'moment'
import {saveAs} from 'file-saver'
import {HeaderButton} from "../tests/react-ive-tables-tests/src/types";
import clone from 'lodash.clone';
import PrimeReact from 'primereact/api'
import {Skeleton} from "primereact/skeleton";
import { useCallback } from 'react';

interface Props {
    data: any[];
    columnOrder: string[];                                      // Defines order for the columns. NB! Only the specified columns here will be rendered.
    ignoreFilters?: string[];                                   // Defines which filters should be ignored. By default all are shown if `showFilters` is set to true.
    specialFilters?: { [key: string]: any };                    // Used for special filter elements. The key is the cName and the value is a function which handles filtering. For reference : https://primefaces.org/primereact/showcase/#/datatable/filter
    specialLabels?: { [key: string]: string; };                 // Used for special labels. By default the table is trying to use intl for translation of each label. If specialLabels is used it overrides the column name for translation. The key is the cName and the value is the translation string used in text properties for intl.
    showFilters?: boolean;                                      // Should filters be rendered.
    showHeader?: boolean;                                       // Should header be rendered.
    setSelected?: (value: any,                                  // Callback for selection. Provides the selected row/rows.
                   contextMenuClick: boolean) => void;
    contextMenu?: Object[];                                     // Context menu model. For reference : https://primefaces.org/primereact/showcase/#/datatable/contextmenu
    rowEditHandler?: (element: Object) => void;                 // Handler for row editing. NB! Even if a specific handler is not required, this property must be provided in order to trigger row editing. The function is invoked after saving the row. The event containing newData, rowIndex and other metadata is returned.
    specialEditors?: { [key: string]: any };                    // Just like specialFilters, specialEditors is used when specific editor element is needed. Reference:  https://primefaces.org/primereact/showcase/#/datatable/edit
    cellEditHandler?: (element: Object) => void;                // Same as rowEditHandler.
    selectionHandler?: (e: any) => void;                        // Pretty much like setSelected. Not sure why it is needed, but it is used in some projects.
    selectionMode?: DataTableSelectionModeType | undefined;     // Selection mode.
    selectionKey?: string;                                      // Key used for selection. Default value is 'id'. Important for proper selection.
    onRowUnselect?: (e: any) => void;                           // Callback invoked when row is unselected.
    selectedIds?: string[];                                     // Used for external selection. When such array is passed, items are filtered so that all items matching those ids are set in selectedRow.
    specialColumns?: {                                          // Used for special columns that are not included in the `data` prop. The key is string used as 'cName' and the value is the JSX.Element, click handler and boolean specifying
        [key: string]:                                          // if the column should be put at the beginning or at the end.
            {
                element: JSX.Element,
                handler: (rowData: any) => void,
                atStart: boolean
            }
    };
    columnTemplate?: { [key: string]: (rowData: any) => any };  // Used for special template for columns. The key is the cName corresponding in the `data` prop and the value is the template itself. Reference : https://primefaces.org/primereact/showcase/#/datatable/templating
    xlsx?: string;                                              // If present, an excel icon is added to the header which when clicked downloads an excel file. The value of the prop is used for fileName and is translated using intl.
    formatDateToLocal?: boolean;                                // Specifies whether dates should be formatted to local or not.
    toggleSelect?: { toggle: boolean, handler: () => void };    // Toggles checkbox column used for excel. Not very template prop.
    headerButtons?: HeaderButton[];                             // Array with buttons to be shown in the header.
    rightHeaderButtons?: HeaderButton[];                        // Array with buttons to be shown in the header (from the right side).
    sortableColumns?: string[];                                 // Array of columns which should be sortable.
    virtualScroll?: boolean;                                    // When true virtual scroller is enabled and paginator is hidden
    scrollHeight?: string;                                      // Height for the scroll
    dtProps?: Partial<DataTableProps>;                          // Additional properties to be passed directly to the datatable.
    doubleClick? : (e:any) => void;                             // Double click handler function
    showSkeleton?: boolean;                                     // Used to indicate whether a skeleton should be shown or not *defaults to true*
}

export const SimpleDataTable: React.FC<Props> = (props) => {
    const {formatMessage: f} = useIntl();

    const [items, setItems] = useState<any>([]);
    const [filters, setFilters] = useState<any>(null);
    const [columns, setColumns] = useState<any>([]);
    const [rows, setRows] = useState(20);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>();
    const [selectedRowsPerPage, setSelectedRowPerPage] = useState<any>({});
    const [refresher, setRefresher] = useState<number>();
    const [selectedElement, setSelectedElement] = useState(null);
    const editMode = props.cellEditHandler === undefined ? (props.rowEditHandler === undefined ? undefined : "row") : "cell";
    const cm = useRef<any>();
    const dt = useRef<any>();

    // const doubleClickHandler = useCallback((e:any) => {
    //     props.doubleClick!(selectedElement);
    // }, [selectedElement])


 useEffect(() => {
        if(props.doubleClick && showTable && filters && props.data.length > 0) {
            const body = document.getElementsByClassName("p-datatable-tbody");
            //@ts-ignore
            body[0].addEventListener('dblclick', props.doubleClick);
        }

        return () => {
            const body = document.getElementsByClassName("p-datatable-tbody");
            //@ts-ignore
            body[0].removeEventListener('dblclick', props.doubleClick);
        }
    }, [showTable,filters,props.data.length, props.doubleClick])

    useEffect(() => {
        // initFilters();
        if (props.data && props.data.length > 0) {
            setItems(props.data);
            setShowTable(true);
        }
    }, [props.data])

    useEffect(() => {
        if (columns.length)
            initFilters();
    }, [columns])

    useEffect(() => {
        if (props.toggleSelect)
            generateColumns();
    }, [props.toggleSelect])

    useEffect(() => {
        if (showTable)
            generateColumns();
    }, [showTable]);

    useEffect(() => {
        handleExternalSelection();
    }, [props.selectedIds]);

    const initFilters = () => {
        const initialFilters = Object.keys(props.data[0]).reduce((acc: any, el: string) => {
            return {...acc, [el]: {value: null, matchMode: "contains"}}
        }, {})
        setFilters(initialFilters);
    }


    const handleExternalSelection = () => {
        if (selectedRow !== undefined) {
            if (props.selectionMode === "multiple" || props.selectionMode === "checkbox") {
                //@ts-ignore
                const elements = items.filter((s: any) => props.selectedIds!.includes(s[props.selectionKey]));
                const copy = clone(elements);
                setSelectedRow(copy);
            } else {
                //TODO implement logic for external management of selectedRow when single selection mode is being used
            }
        } else {
            if (props.selectionMode === "multiple" || props.selectionMode === "checkbox") {
                //@ts-ignore
                const elements = items.filter((s: any) => props.selectedIds!.includes(s[props.selectionKey]));
                const copy = clone(elements);
                setSelectedRow(copy);
            } else {
                //TODO implement logic for external management of selectedRow when single selection mode is being used
            }
        }
    };

    const exportExcel = () => {
        import('xlsx').then(xlsx => {
            const itemsToExport = items.map((row: any) => {
                return Object.keys(row).reduce((acc, el) => {
                    if (props.columnOrder.includes(el)) {
                        return {...acc, [el]: row[el]}
                    }
                    return acc;
                }, {});
            })
            const worksheet = xlsx.utils.json_to_sheet(itemsToExport);
            const workbook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
            const excelBuffer = xlsx.write(workbook, {bookType: 'xlsx', type: 'array'});
            saveAsExcelFile(excelBuffer, f({id: props.xlsx}));
        });
    }

    const saveAsExcelFile = (buffer: any, fileName: any) => {
        import('file-saver').then(FileSaver => {
            let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let EXCEL_EXTENSION = '.xlsx';
            const data = new Blob([buffer], {
                type: EXCEL_TYPE
            });
            FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
        });
    }


    const textEditor = (options: any) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)}/>;
    }

    const generateColumns = () => {
        if (items.length > 0 && items[0] || props.columnOrder) {
            if (columns.length === 0 || (props.toggleSelect && props.toggleSelect.toggle)) {
                const tempColumns = (props.columnOrder ? props.columnOrder : Object.keys(items[0])).map((cName: string) => {
                    let columnHeader = getColumnHeaderTranslated(cName);

                    //TO BE TESTED
                    // If there are specialColumns passed, for each of them we create a column with a body, generated from the templating function, which copies the element sent from the parent as prop
                    if (props.columnTemplate && props.columnTemplate[cName] !== undefined) {
                        return <Column body={(rowData: any) => props.columnTemplate![cName](rowData)}
                                       editor={editMode ? textEditor : undefined}
                                       sortable={props.sortableColumns?.includes(cName)}
                                       filterElement={props.specialFilters![cName]} showClearButton={false}
                                       style={{textAlign: "center"}} showFilterMenu={false} filterField={cName}
                                       onCellEditComplete={props.cellEditHandler ? onCellEditComplete : undefined}
                                       filter={props.specialFilters && props.specialFilters[cName]}
                                       key={cName} field={cName} header={columnHeader}/>
                    }
                    //@ts-ignore
                    return <Column style={{textAlign: "center"}} key={cName} field={cName}
                                   editor={props.specialEditors![cName] || editMode ? textEditor : undefined}
                                   header={columnHeader} showFilterMenu={false}
                                   sortable={props.sortableColumns?.includes(cName)}
                                   filterElement={props.specialFilters![cName]} showClearButton={false}
                                   onCellEditComplete={props.cellEditHandler ? onCellEditComplete : undefined}
                                   filter={props.showFilters ? (!props.ignoreFilters!.includes(cName)) : false}
                                   filterField={cName}/>
                    //return <Column key={cName} field={cName} editor={props.editable ? (props) => editorForRowEditing(props, 'color') : null} filter={props.showFilters ? (!props.ignoreFilters.includes(cName)) : false} filterElement={props.showFilters ? (props.ignoreFilters.includes(cName) ? null : createInputForFilter(cName)) : null} header={columnHeader}/>
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

    const comparator = (e: any, a: any, b: any) => {

        if (!a[e.sortField])
            return -1 * e.sortOrder
        if (!b[e.sortField])
            return e.sortOrder;

        var nameA = a[e.sortField].toUpperCase();
        var nameB = b[e.sortField].toUpperCase();
        if (nameA < nameB) {
            return -1 * e.sortOrder;
        }
        if (nameA > nameB) {
            return e.sortOrder;
        }

        // names must be equal
        return 0;
    };

    const getHeader = () => {
        return <div className="export-buttons" style={{display: "flex", justifyContent: "space-between"}}>
            <div>
                {props.xlsx ?
                    <Button type="button" icon="pi pi-file-excel" onClick={exportExcel}
                            className="p-button-success p-mr-2" data-pr-tooltip="XLS"/>
                    : null
                }
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
            </div>
        </div>
    };

    const handleSelection = (e: any) => {
        if (cm.current) {
            cm.current.hide(e.originalEvent);
        }
        if (!Array.isArray(e.value)) {
            if (props.setSelected) props.setSelected(e.value, false)
            if (props.selectionHandler) props.selectionHandler(e);
            setSelectedRow(e.value);
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

    const onRowEditComplete = (e: any) => {
        let newItems = [...items];
        let {newData, index} = e;

        newItems[index] = newData;

        setItems(newItems);
        props.rowEditHandler!(e);
    }

    const onCellEditComplete = (e: any) => {
        let {rowData, newValue, field, originalEvent: event} = e;
        rowData[field] = newValue;
        props.cellEditHandler!(e);

    }

    const skeletonTemplate = () => {
        return <Skeleton></Skeleton>
    }

    const getFakeData = () => {
        let res = [];
        for (let i = 0; i < rows; i++) {
            const row = props.columnOrder.reduce((acc, elem) => {
                return {...acc, [elem]: ''}
            }, {});
            res.push(row);
        }
        return res;
    }

    const getColumnHeaderTranslated = (cName: string) => {
        if (props.specialLabels && props.specialLabels[cName])
            return f({id: props.specialLabels[cName]})
        return f({id: cName});
    }


    return <>
        {(showTable && filters && props.data.length > 0) || !props.showSkeleton  ?
            <>
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
                        ref={dt}
                        value={items}
                        filters={filters}
                        first={first}
                        rows={rows}
                        paginator={!props.virtualScroll}
                        dataKey={props.selectionKey}
                        className="p-datatable-sm p-datatable-striped p-datatable-responsive-demo"
                        filterDisplay={props.showFilters ? 'row' : undefined}
                        // sortField={sortField} sortOrder={sortOrder} onSort={ (e : any) => {setLoading(true); setTimeout(() => {setSortField(e.sortField); setSortOrder(e.sortOrder)}, 0)}}
                        sortMode={'multiple'}
                        //@ts-ignore
                        selectionMode={["single", "multiple", 'checkbox'].includes(props.selectionMode!) ? props.selectionMode : undefined}
                        selection={selectedRow}
                        onSelectionChange={handleSelection}
                        style={{marginBottom: "40px"}}
                        emptyMessage="No records found"
                        tableStyle={{tableLayout: "auto"}}
                        header={props.showHeader ? getHeader() : null}
                        rowsPerPageOptions={[20, 30, 50]}
                        editMode={editMode}
                        onRowEditComplete={onRowEditComplete}
                        scrollable={props.virtualScroll} scrollHeight={props.scrollHeight}
                        virtualScrollerOptions={{itemSize: 40}}
                        // onPage={onPage}
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
                                } else {
                                    props.setSelected(e.value, true);
                                    setSelectedRow(e.value);
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
            :
            <DataTable value={getFakeData()} rows={rows} paginator={true} className="p-datatable-striped">
                {
                    props.columnOrder.map(column => <Column field={column} header={getColumnHeaderTranslated(column)}
                                                            style={{width: `${100 / props.columnOrder.length}%`}}
                                                            body={skeletonTemplate} key={column}/>)
                }
            </DataTable>
        }
    </>
};

SimpleDataTable.defaultProps = {
    showFilters: true,
    ignoreFilters: [],
    showHeader: true,
    selectionMode: undefined,
    selectionHandler: () => 0,
    onRowUnselect: undefined,
    selectedIds: [],
    columnTemplate: undefined,
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
    showSkeleton: true
}




