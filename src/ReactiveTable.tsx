import {useIntl} from "react-intl";
import React, {useEffect, useRef, useState} from "react";
import {Column, ColumnBodyOptions, ColumnEventParams} from "primereact/column";
import {
    DataTable,
    DataTableFilterParams,
    DataTableFilterMetaData,
    DataTableProps, DataTableRowEditCompleteParams,
    DataTableSelectionModeType, DataTableFilterMatchModeType, DataTablePFSEvent, DataTableSortMeta,
} from "primereact/datatable";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import "./DataTable.css";
import {ContextMenu} from 'primereact/contextmenu';
import {Tooltip} from 'primereact/tooltip';
import isEqual from 'lodash.isequal';
import cloneDeep from 'lodash.clonedeep';
import {Skeleton} from "primereact/skeleton";
import moment from 'moment';
import {HeaderButton} from "./types";
import {AxiosResponse} from "axios";
import {FilterMatchMode} from "primereact/api";

export type StringKeys<T> = Extract<keyof T, string>;
export type SpecialFilter<K extends string> = { [key in K]?: (options: any, cName: string) => JSX.Element }
export type FiltersMatchMode<K extends string> = { [key in K]?: FilterMatchMode.IN | FilterMatchMode.EQUALS }
export interface FetchDataParams {
    offset: number;
    limit: number;
    filters: any;
    columns?: { [key: string]: string };
    //Add type for this
    sort?: any;
    excelName?: string;
    page? : number;
}

export interface ExportExcelParams {
    filters: any;
    //Add type for this
    sort?: any;
    columns: string[];
    labelsMap: Record<string, string>
}

export interface ExportConfig {
    exportButtonLabel?: string;
    exportButtonIcon?: string;
    onExportExcel: (params: ExportExcelParams) => void;
}

interface Props<T, K extends string> {
    data?: T[] | undefined;                                                      // This property gives all the data for the table when not using lazy fetching or when using SWR
    fetchData?: (params: FetchDataParams)                                        // Function which is responsible for fetching data when using lazy fetching. When 'swr' prop is false it fetches and returns Promise with data. When 'swr' is true it is responsible to trigger SWR refetch which on its hand will refresh 'data' prop.
        => Promise<{ rows: any[], totalRecords: number } | AxiosResponse | void>
    totalRecords?: number;                                                      // When using lazy fetching this prop gives the total count of records in 'data' prop.
    swr?: boolean;                                                              // Defines if SWR will be used or not.
    columnOrder: (K | StringKeys<T>)[];                                         // Defines order for the columns. NB! Only the specified columns here will be rendered.
    ignoreFilters?: K[];                                                        // Defines which filters should be ignored. By default all are shown if `showFilters` is set to true.
    specialFilters?: SpecialFilter<K>;                                          // Used for special filter elements. The key is the cName and the value is a function which handles filtering. For reference : https://primefaces.org/primereact/showcase/#/datatable/filter
    filtersMatchMode?: FiltersMatchMode<K>
    specialLabels?: { [key in K]?: string; };                                   // Used for special labels. By default the table is trying to use intl for translation of each label. If specialLabels is used it overrides the column name for translation. The key is the cName and the value is the translation string used in text properties for intl.
    showFilters?: boolean;                                                      // Should filters be rendered.
    showHeader?: boolean;                                                       // Should header be rendered.
    setSelected?: (value: any,                                                  // Callback for selection. Provides the selected row/rows.
                   contextMenuClick: boolean) => void,
    contextMenu?: Object[],                                                     // Context menu model. For reference : https://primefaces.org/primereact/showcase/#/datatable/contextmenu
    rowEditHandler?: (event: DataTableRowEditCompleteParams)
        => void,                                                                // Handler for row editing. NB! Even if a specific handler is not required, this property must be provided in order to trigger row editing. The function is invoked after saving the row. The event containing newData, rowIndex and other metadata is returned.
    specialEditors?: { [key in K]?: any },                                      // Just like specialFilters, specialEditors is used when specific editor element is needed. Reference:  https://primefaces.org/primereact/showcase/#/datatable/edit
    cellEditHandler?: (element: Object) => void,                                // Same as rowEditHandler.
    selectionHandler?: (e: any) => void,                                        // Pretty much like setSelected. Not sure why it is needed, but it is used in some projects.
    selectionMode?: DataTableSelectionModeType | undefined,                     // Selection mode.
    selectionKey?: string,                                                      // Key used for selection. Default value is 'id'. Important for proper selection.
    onRowUnselect?: (e: any) => void,                                           // Callback invoked when row is unselected.
    selectedIds?: string[] | number[],                                          // Used for external selection. When such array is passed, items are filtered so that all items matching those ids are set in selectedRow.
    specialColumns?: {                                                          // Used for special columns that are not included in the `data` prop. The key is string used as 'cName' and the value is the JSX.Element, click handler and boolean specifying
        [key in K]?:                                                            // if the column should be put at the beginning or at the end.
        {
            element: JSX.Element,
            handler: (rowData: T) => void,
            atStart: boolean
        }
    };
    columnTemplate?: {
        [key in K]?:
        (rowData: T, options: ColumnBodyOptions) => any
    };        // Used for special template for columns. The key is the cName corresponding in the `data` prop and the value is the template itself. Reference : https://primefaces.org/primereact/showcase/#/datatable/templating
    // xlsx?: string;                                                // If present, an excel icon is added to the header which when clicked downloads an excel file. The value of the prop is used for fileName and is translated using intl.
    // excelUrl?: string;                                            // The url of the endpoint for excel
    // exportExcel?: (params: ExportExcelParams) => void;

    exportConfig?: ExportConfig;                                    //Configuration for excel export. If this property is present an export button is added to the table's header.
    formatDateToLocal?: boolean;                                  // Specifies whether dates should be formatted to local or not.
    // toggleSelect?: { toggle: boolean, handler: () => void };      // Toggles checkbox column used for excel. Not very template prop.
    headerButtons?: HeaderButton[];                               // Array with buttons to be shown in the header.
    rightHeaderButtons?: HeaderButton[];                          // Array with buttons to be shown in the header (from the right side).
    sortableColumns?: K[];                                        // Array of columns which should be sortable.
    virtualScroll?: boolean;                                      // When true virtual scroller is enabled and paginator is hidden
    scrollHeight?: string;                                        // Height for the scroll
    dtProps?: Partial<DataTableProps>;                            // Additional properties to be passed directly to the datatable.
    doubleClick?: (e: any) => void;                               // Double click handler function. !!! SHOULD BE DEPRECATED !!! the datatable support onRowDoubleClick!
    showSkeleton?: boolean;                                       // Used to indicate whether a skeleton should be shown or not *defaults to true*
    selectionResetter?: number;                                   // Used to reset selected items in the state of the datatable. It works similarly `refresh` prop of LazyDT.
    disableArrowKeys?: boolean;                                   // When true arrow keys will not select rows above or below
    tableHeight?: string;                                         // Specify custom height for the table.
    forOverlay?: boolean;                                         // Specifies if the datatable will be shown in an overlay pane
    editableColumns?: K[]                                         // Specifies which columns are editable
    externalFilters?: {                                           // Object with key - name of a column and value - filter function which decides whether the row should be included or not.
        [key in K]?:
        (rowData: T, filterValue: string) => boolean
    }
    onFilterCb?: (filteredData: T[],                              // Function to be called when there is filtering in the table -> the function gets the filtered data and passes it to the parent component
                  filters: { [key in keyof T]: DataTableFilterMetaData })
        => void
    columnStyle?: { [key in K]?: { header: any, body: any } }     // Object to specify the style of the columns. It is split into header and body, corresponding to styling the column header and body
    showPaginator?: boolean                                       // Whether to show to paginator or no
    footerTemplate?: () => JSX.Element                            // A function that returns a template for the footer of the table
    initialFilters?: { [key in keyof T]?: string | number | Date | boolean | string[] | number[] | Date[] | boolean[] },
    frozenColumns?: K[]                                           // Specify which columns should be frozen (default right aligned)
    expandable?: boolean                                          // When true expander column is added at the beginning
    rebuildColumns?: number;
    refresher?: number;                                           // Used to manually refresh the table from parent component
    textAlign?: 'left' | 'center' | 'right'                       // Used to override columns body text align which defaults to 'center'
    setDtRef?: (ref: DataTable) => void;                          // Used to pass the table's ref back to parent
    resetFilters?: number;
    paginatorOptions?: number[];                                  // Used to overwrite the default paginator options, which are [20, 30, 50]
    wrapperClassName?: string;
    defaultFilterPlaceholder?: string;                            // Set placeholder for default (text) filters
}

export const ReactiveTable = <T, K extends string>(
    props: Props<T, K>
) => {
    const {formatMessage: f} = useIntl();

    const [items, setItems] = useState<T[]>([]);
    const [originalItems, setOriginalItems] = useState<any>([]);
    const [filters, setFilters] = useState<any>(null);
    const [prevFilters, setPrevFilters] = useState<any>(null);
    const [columns, setColumns] = useState<any>([]);
    const [rows, setRows] = useState(20);
    const [first, setFirst] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0); //Used for handling arrowUp and arrowDown. This is the index of the current selected row.
    const [selectedRow, setSelectedRow] = useState<any>();
    const [selectedRowsPerPage, setSelectedRowPerPage] = useState<any>({});
    const [selectionResetter, setSelectionResetter] = useState<number>(props.selectionResetter || 0);
    const [rebuildColumns, setRebuildColumns] = useState<number>(props.rebuildColumns || 0);
    const [selectedElement, setSelectedElement] = useState(null);
    const [prevInitialFilters, setPrevInitialFilters] = useState<any>(); //Used for comparison with props.initialFilters to escape inifinite loop
    const [excelFilters, setExcelFilters] = useState({});
    const [areFiltersInited, setAreFiltersInited] = useState(false);
    const [paginatorOptions, setPaginatorOptions] = useState([20,30,50]);
    const editMode = props.cellEditHandler === undefined ? (props.rowEditHandler === undefined ? undefined : "row") : "cell";
    const [refresher, setRefresher] = useState<number>();
    const cm = useRef<any>();
    const dt = useRef<any>();
    const skeletonDtRef = useRef<any>();
    const filterRef = useRef<any>();
    const [multiSortMeta, setMultiSortMeta] = useState<DataTableSortMeta[]>([]);

    // const doubleClickHandler = useCallback((e:any) => {
    //     props.doubleClick!(selectedElement);
    // }, [selectedElement])

    useEffect(() => {
        if(props.paginatorOptions && props.paginatorOptions.length > 0 && !isEqual(props.paginatorOptions, paginatorOptions)){
            setRows(props.paginatorOptions[0]);
            setPaginatorOptions(props.paginatorOptions);
        }
    }, [props.paginatorOptions])

    const refreshTable = (sort?: any) => {
        //Not lazy
        if (!props.fetchData) {
            setLoading(false);
            return;
        }


        if (props.swr) {
            props.fetchData({offset: first, limit: rows, filters, sort}).then(() => {
                setLoading(false);
            });
        } else {
            //@ts-ignore
            props.fetchData({offset: first, limit: rows, filters, sort}).then((response) => {
                //@ts-ignore
                setItems(response.rows);
                //@ts-ignore
                setTotalRecords(response.totalRecords);
                setLoading(false);
                setShowTable(true);
            });
        }

    }

    useEffect(() => {
        if(props.resetFilters === undefined) return;
        const newFilters = initFilters();
        handleFilter({filters: newFilters});
        setTimeout(() => {
            Object.keys(filters).forEach(key => {
                const filter = document.querySelector("#filter-" + key);
                if (filter) {
                    //@ts-ignore
                    filter.value = "";
                }
            })
        },  100);

    }, [props.resetFilters]);


    useEffect(() => {
        if (props.totalRecords && props.totalRecords !== totalRecords)
            setTotalRecords(props.totalRecords);
    }, [props.totalRecords]);


    useEffect(() => {
        if (props.refresher !== refresher) {
            setRefresher(props.refresher);
            refreshTable();
        }
    }, [props.refresher]);

    useEffect(() => {
        if (filters && Object.keys(filters).length > 0 && !isEqual(filters, prevFilters)) {
            //Da ne refreshva kogato sme na purvo vlizane toest prevFilters === null i v sushtoto vreme nqmame nikakvi filtri
            if(props.swr && prevFilters === null && Object.values(filters).every((filter: any) => filter.value === null)){
                //Do nothing
            }else{
                setLoading(true);
                refreshTable();
            }

            setPrevFilters(filters);
        }
    }, [filters]);

    useEffect(() => {
        if (props.doubleClick && showTable && filters && items.length > 0) {
            const body = document.getElementsByClassName("p-datatable-tbody");
            //@ts-ignore
            body[0].addEventListener('dblclick', props.doubleClick);
        }

        return () => {
            if (props.doubleClick) {
                const body = document.getElementsByClassName("p-datatable-tbody");
                //@ts-ignore
                if (body && body[0])
                    body[0].removeEventListener('dblclick', props.doubleClick);
            }
        }
    }, [showTable, filters, items, props.doubleClick])

    useEffect(() => {
        if (props.initialFilters && areFiltersInited) {
            Object.keys(props.initialFilters).forEach(key => {
                const filter = document.querySelector("#filter-" + key);
                if (filter && props.initialFilters[key] !== undefined && props.initialFilters[key] !== null) {
                    //@ts-ignore
                    filter.value = props.initialFilters[key];
                }
            })
        }
    }, [props.initialFilters, areFiltersInited]);


    useEffect(() => {

        //Check if props.initialFilters and prevInitialFilters are equal in order to avoid infinite loop.
        const equal = isEqual(props.initialFilters, prevInitialFilters);
        if (equal && props.initialFilters !== undefined) return;

        let newFilters = cloneDeep(filters);
        if(newFilters == null)
            newFilters = initFilters();

        if (props.initialFilters) {
            const tempFilters = Object.keys(props.initialFilters).reduce((acc, key) => {
                let matchMode = "contains";
                if (props.filtersMatchMode && props.filtersMatchMode[key]) matchMode = props.filtersMatchMode[key];
                return {
                    ...acc, [key]: {
                        value: props.initialFilters![key],
                        matchMode
                    }
                }
            }, {...newFilters});
            newFilters = tempFilters;

            //@ts-ignore
            setPrevInitialFilters(props.initialFilters);
        }
        handleFilter({filters: newFilters});
        if(!props.fetchData)
            setFilters(newFilters);
    }, [props.initialFilters]);


    useEffect(() => {
        // if (filters === null)
        //     initFilters();
        if(props.swr && props.data !== undefined){
            setItems(props.data);
            setShowTable(true);
            setLoading(false);
        }
        else if (props.data !== undefined || !props.showSkeleton) {
            setItems(props.data);
            setOriginalItems(props.data);
            setShowTable(true);
            setLoading(false);
        }
    }, [props.data])

    useEffect(() => {
        if (filterRef.current)
            handleFilter(filterRef.current);
    }, [originalItems])

    useEffect(() => {
        if (columns.length)
            initFilters();
            // setFilters(initFilters());
    }, [columns])

    // useEffect(() => {
    //     if (props.toggleSelect)
    //         generateColumns();
    // }, [props.toggleSelect])

    useEffect(() => {
        if (showTable) {
            generateColumns();
        }
    }, [showTable]);

    useEffect(() => {
        if (items && items.length > 0)
            generateColumns();
    }, [items]);


    useEffect(() => {
        if (filters && Object.keys(filters).length > 0) setAreFiltersInited(true);
    }, [filters])


    const listener = (event: any) => {
        if(props.selectionMode !== 'single') return;
        if (event.code === "ArrowUp") {
            if (selectedRowIndex - 1 >= 0) {
                const newSelectedElement = items[selectedRowIndex - 1];
                if(selectedRowIndex % rows === 0){
                    focusRow(false);
                }
                setSelectedRowIndex(selectedRowIndex - 1);
                // if (props.selectionMode === "multiple" || props.selectionMode === "checkbox") {
                //     setSelectedRow([newSelectedElement]);
                // } else {
                //     setSelectedRow(newSelectedElement);
                // }
            }
        } else if (event.code === "ArrowDown") {
            if (selectedRowIndex + 1 < items.length) {
                const newSelectedElement = items[selectedRowIndex + 1];
                if((selectedRowIndex + 1) % rows === 0){
                    focusRow(true);
                }
                setSelectedRowIndex(selectedRowIndex + 1);
                // if (props.selectionMode === "multiple" || props.selectionMode === "checkbox") {
                //     setSelectedRow([newSelectedElement]);
                // } else {
                //     setSelectedRow(newSelectedElement);
                // }
            }
        } else if (event.code === "ArrowRight") {
            // if(first + rows < items.length)
            //     setFirst(first + rows);
        } else if (event.code === "ArrowLeft") {
            // if(first - rows >= 0)
            //     setFirst(first - rows);
        }
    }

    useEffect(() => {
        handleExternalSelection();
    }, [props.selectedIds]);

    useEffect(() => {
        if (props.selectionResetter && props.selectionResetter !== selectionResetter) {
            setSelectedRow(null);
            setSelectedRowPerPage({});
            setSelectedElement(null);
            setSelectionResetter(props.selectionResetter);
        }
    }, [props.selectionResetter]);

    useEffect(() => {
        if (props.rebuildColumns && props.rebuildColumns !== rebuildColumns) {
            generateColumns();
        }
    }, [props.rebuildColumns]);

    useEffect(() => {
        if (items && items.length > 0 && columns.length === 0 && filters && filters.length) {
            generateColumns();
        }
    }, [items, columns, filters]);

    const initFilters = () => {
        const initialFilters = props.columnOrder.reduce((acc: any, el) => {
            let matchMode = "contains";
            //@ts-ignore
            if (props.filtersMatchMode) matchMode = props.filtersMatchMode[el];
            return {...acc, [el]: {value: null, matchMode: matchMode || "contains"}}
        }, {});

        // setFilters(initialFilters);
        return initialFilters;
    }

    const handleExternalSelection = () => {
        // if (selectedRow !== undefined) {
        if (props.selectionMode === "multiple" || props.selectionMode === "checkbox") {
            const elements: typeof items = [];
            let selectedRowIndex = undefined;
            for (let i = 0; i < items.length; i++) {
                //@ts-ignore
                if (props.selectedIds!.includes(items[i][props.selectionKey!])) {
                    if (!selectedRowIndex) {
                        selectedRowIndex = i;
                    }
                    elements.push({...items[i]});
                }
            }
            if (selectedRow)
                setSelectedRow([...selectedRow, ...elements]);
            else
                setSelectedRow([...elements]);
            if (selectedRowIndex !== undefined)
                setSelectedRowIndex(selectedRowIndex);
        } else {
            let element: any = undefined;
            for (let i = 0; i < items.length; i++) {
                //@ts-ignore
                if (props.selectedIds!.includes(items[i][props.selectionKey!])) {
                    element = {...items[i]};
                    setSelectedRowIndex(i);
                    break;
                }
            }
            setSelectedRow(element);
        }
    };

    useEffect(() => {
        const newPage = Math.floor(selectedRowIndex / rows) + 1;
        setFirst((newPage - 1) * rows);
    }, [selectedRowIndex]);

    //TODO: Check if this works properly with arrow selection
    // useEffect(() => {
    //     if (dt.current && dt.current.getTable && dt.current.getTable()) {
    //         const trs = dt.current.getTable().querySelectorAll('tr');
    //         if(props.showFilters === false && trs.length >= 2)
    //             trs[1].focus();
    //         else if(trs.length >= 3)
    //                 trs[2].focus();
    //     }
    // }, [first]);

    const focusRow = (focusFirstRow: boolean) => {
        setTimeout(() => {
            if (dt.current && dt.current.getTable && dt.current.getTable()) {
                const trs = dt.current.getTable().querySelectorAll('tr');
                if(focusFirstRow){
                    if(props.showFilters === false && trs.length >= 2)
                        trs[1].focus();
                    else if(trs.length >= 3){
                        trs[2].focus();
                    }
                }else{
                    if(trs.length >= 2){
                        trs[trs.length - 1].focus();
                    }
                }

            }
        }, 100);

    }

    const exportExcel = () => {
        if (props.exportConfig === undefined || props.exportConfig.onExportExcel === undefined) {
            console.error("'onExportExcel' function is not provided. Could not export DT to excel.");
            return;
        }
        const labelsMap = props.columnOrder.reduce((acc, el) => {
            //@ts-ignore
            acc[el] = getColumnHeaderTranslated(el);
            return acc;
        }, {})

        // const formattedFilters = Object.keys(excelFilters).reduce((acc, el) => {
        //     if (excelFilters[el].value !== null && excelFilters[el].value !== undefined)
        //         acc[el] = String(excelFilters[el].value || '');
        //     return acc;
        // }, {})
        // props.exportConfig.onExportExcel({sort: multiSortMeta, filters: excelFilters, columns: props.columnOrder, labelsMap});
        props.exportConfig.onExportExcel({sort: multiSortMeta, filters: filters, columns: props.columnOrder, labelsMap});

    }

    const parseNestedObject = (object: any, key: string | number | symbol) => {
        let res = object;
        for (let currentKey of key.toString().split('.')) {
            if (res[currentKey] !== undefined && res[currentKey] !== null)
                res = res[currentKey]
            else
                return undefined
        }
        return res;
    }

    const handleFilter = (e: DataTableFilterParams) => {
        let result;
        filterRef.current = {...filterRef.current, ...e ?? {}};
        const actualFilters = Object.keys(e.filters).reduce((acc: any, key: string) => {
            //@ts-ignore
            if (e.filters[key].value === null || e.filters[key].value === '' || e.filters[key].value === undefined)
                return acc;
            acc[key] = {...e.filters[key]};
            return acc;
        }, {});

        if (props.fetchData) {
            e['first'] = 0;
            setFirst(0);
            setFilters(e.filters);
            setExcelFilters(actualFilters);
            if (props.onFilterCb) props.onFilterCb(undefined, actualFilters);
            return;
        }

        //@ts-ignore
        if (Object.keys(actualFilters).length === 0) {
            result = cloneDeep(originalItems);
            setItems(result);
        } else {
            result = originalItems.filter((el: any) => {
                // @ts-ignore
                return Object.keys(actualFilters).reduce((acc, filterKey) => {
                    if (props.externalFilters && props.externalFilters[filterKey] !== undefined) {
                        return acc && props.externalFilters[filterKey](el, actualFilters[filterKey].value);
                    } else if (actualFilters[filterKey].value instanceof Date) {
                        const moment1 = moment(parseNestedObject(el, filterKey));
                        const moment2 = moment(actualFilters[filterKey].value);
                        return acc && moment1.isSame(moment2, 'day');
                    } else if (props.filtersMatchMode && props.filtersMatchMode[filterKey] !== undefined) {
                        const matchMode = props.filtersMatchMode[filterKey];
                        if (matchMode === FilterMatchMode.IN && actualFilters[filterKey].value.length > 0) return acc && actualFilters[filterKey].value.includes(parseNestedObject(el, filterKey));
                        if (matchMode === FilterMatchMode.EQUALS) {
                            return acc && String(actualFilters[filterKey].value) === String(parseNestedObject(el, filterKey));
                        }
                        return acc;
                    } else {
                        //@ts-ignore
                        return acc && String(parseNestedObject(el, filterKey)).toLowerCase().indexOf(String(actualFilters[filterKey].value).toLowerCase()) !== -1;
                    }
                }, true)
            });
            setItems(result);
        }
        setExcelFilters(actualFilters);
        if (props.onFilterCb) props.onFilterCb(result, actualFilters);
    }

    const textEditor = (options: any, cName: string) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)}/>;
    }

    const defaultFilter = (options: any, cName: string) => {
        return <InputText id={'filter-' + cName} type="text" value={options.value} style={{minWidth: '100px'}} placeholder={props.defaultFilterPlaceholder}
                          onChange={(e) => options.filterApplyCallback(e.target.value)}/>;
    }

    const generateColumns = () => {
        if (columns.length === 0 || (props.rebuildColumns && props.rebuildColumns !== rebuildColumns)) {
            if (props.rebuildColumns)
                setRebuildColumns(props.rebuildColumns);
            const tempColumns = props.columnOrder.map((cName: any) => {
                let columnHeader = getColumnHeaderTranslated(cName);
                const columnHeaderStyle = {textAlign: 'center', ...(props.columnStyle && props.columnStyle[cName]) ? props.columnStyle[cName].header : {textAlign: 'center'}};
                const columnBodyStyle = (props.columnStyle && props.columnStyle[cName]) ? props.columnStyle[cName].body : {textAlign: props.textAlign || 'center'};
                //TO BE TESTED
                // If there are specialColumns passed, for each of them we create a column with a body, generated from the templating function, which copies the element sent from the parent as prop
                return <Column
                    body={props.columnTemplate![cName] ? (rowData: T, columnOptions) => props.columnTemplate![cName](rowData, columnOptions) : undefined}
                    editor={props.specialEditors![cName] || (editMode && props.editableColumns!.includes(cName) ? textEditor : undefined)}
                    filterFunction={handleFilter}
                    frozen={props.frozenColumns?.includes(cName)}
                    alignFrozen={"right"}
                    rowEditor={cName === 'operations' && props.rowEditHandler !== undefined}
                    sortable={props.sortableColumns?.includes(cName)}
                    filterElement={options => props.specialFilters[cName] ? props.specialFilters[cName](options, cName) : defaultFilter(options, cName)}
                    showClearButton={false}
                    bodyStyle={columnBodyStyle} showFilterMenu={false} filterField={cName}
                    onCellEditComplete={props.cellEditHandler ? onCellEditComplete : undefined}
                    filter={props.showFilters && !props.ignoreFilters!.includes(cName)}
                    filterHeaderStyle={{textAlign: 'center'}}
                    key={cName} field={cName} header={columnHeader} headerStyle={columnHeaderStyle}/>
            });
            //@ts-ignore
            if (props.rowEditHandler !== undefined && !props.columnOrder.includes('operations'))
                tempColumns.push(<Column rowEditor headerStyle={{width: '7rem'}}
                                         bodyStyle={{textAlign: 'center'}}/>);
            if (props.expandable)
                tempColumns.unshift(<Column expander headerStyle={{width: '3em'}}/>)
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
        }
    };

    //TO BE TESTED
    const generateColumnBodyTemplate = (column: string, rowData: any) => {
        return React.cloneElement(props.specialColumns![column].element, {
            onClick: (e: any) => props.specialColumns![column].handler(rowData)
        })
    }

    const onPage = (event: DataTablePFSEvent) => {
        setSelectedRowIndex(event.first)
        focusRow(true);
        if (props.fetchData) {
            if (event.first === first && event.rows === rows) return;
            setLoading(true);
            setFirst(event.first);
            setRows(event.rows);
            //Parent responsible to pass new 'data' prop
            if (props.swr) {
                props.fetchData({offset: event.first, limit: event.rows, filters, page: event.page}).then(() => {
                    setLoading(false)
                });
            } else {
                //'fetchData' should return new items.
                //@ts-ignore
                props.fetchData({offset: event.first, limit: event.rows, filters}).then((response) => {
                    //@ts-ignore
                    setItems(response.rows);
                    //@ts-ignore
                    setTotalRecords(response.totalRecords);
                    setLoading(false);
                });
            }

        } else {
            setRows(event.rows);
            setFirst(event.first);
        }
    }

    const getHeader = () => {
        return <div className="export-buttons" style={{display: "flex", justifyContent: "space-between"}}>
            <div>
                {props.exportConfig ?
                    <Button type="button" icon={props.exportConfig.exportButtonIcon || ''} onClick={exportExcel}
                            className="p-button-success p-mr-2" data-pr-tooltip="XLS">{props.exportConfig.exportButtonLabel || ''}</Button>
                    : null
                }
                {/*{props.toggleSelect ?*/}
                {/*    <Button type="button" icon="fas fa-check-square" onClick={props.toggleSelect.handler}*/}
                {/*            className="p-button-success p-mr-2" data-pr-tooltip="XLS"/>*/}
                {/*    : null*/}
                {/*}*/}
                {
                    props.headerButtons!.map((el, index) => <Button key={index} type="button" icon={el.icon} onClick={el.onClick}
                                                           tooltip={el.tooltipLabel} label={el.label}
                                                           ref={el.ref}
                                                           tooltipOptions={{position: 'top'}}
                                                           className={`${el.className} table-header-left-align-buttons p-mr-2`}/>)
                }
            </div>
            <div>
                {
                    props.rightHeaderButtons!.map((el, index) => <Button key={index} type="button" icon={el.icon} onClick={el.onClick}
                                                                tooltip={el.tooltipLabel} label={el.label}
                                                                ref={el.ref}
                                                                tooltipOptions={{position: 'top'}}
                                                                className={`${el.className} table-header-left-align-buttons p-mr-2`}/>)
                }
            </div>
        </div>
    };

    const handleSort = (event: any) => {
        setMultiSortMeta(event.multiSortMeta);
        refreshTable(event);
    }

    const handleSelection = (e: any) => {
        if (cm.current) {
            cm.current.hide(e.originalEvent);
        }

        if(!e.value) return;

        const page = Math.floor(first / rows) + 1;

        let newSelectedRowsPerPage = cloneDeep(selectedRowsPerPage);
        let itemUnselected = false;

        //Handle selection of all/none of the records
        if(e.type === "all" || e.type === "checkbox") {
            //Handle unselecting all records
            if(e.value.length === 0) {
                newSelectedRowsPerPage = [];
            }
            //Handle selecting all records
            else {
                let numberOfRecords = e.value.length;
                let currentPage = 1;
                do {
                    newSelectedRowsPerPage[currentPage] = e.value.splice(0, rows);
                    numberOfRecords -= rows;
                    currentPage++;
                }
                while(numberOfRecords > 0)
            }
        } else if (Array.isArray(e.value)) {
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
            const currPageElements = newSelectedRowsPerPage[page] || [];
            const newElementsForPage = [];
            for (let row of currPageElements) {
                if (e.value.find((el: any) => el[props.selectionKey!] === row[props.selectionKey!]) !== undefined)
                    newElementsForPage.push(row)
            }

            if(newSelectedRowsPerPage[page] !== undefined && newSelectedRowsPerPage[page].length !== newElementsForPage.length)
                itemUnselected = true;

            newSelectedRowsPerPage[page] = newElementsForPage;
        } else if (!Array.isArray(e.value)) {
            if (props.setSelected) props.setSelected(e.value, false)
            if (props.selectionHandler) props.selectionHandler(e);
            if(Array.isArray(multiSortMeta) && multiSortMeta.length === 0) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i][props.selectionKey!] === e.value[props.selectionKey!]) {
                        setSelectedRowIndex((props.fetchData !== undefined && props.fetchData !== null) ? first + i : i);
                        break;
                    }
                }
            }
            setSelectedRow(e.value);
            return;
        } else {
            //In order to prevent switching page to the page that corresponds to the last selected row when using multiple select
            //We only will set selectedRowIndex if we do not unselect item
            if(!itemUnselected && Array.isArray(multiSortMeta) && multiSortMeta.length === 0){
                for (let i = 0; i < items.length; i++) {
                    if (e.value.length === 0) {
                        setSelectedRowIndex(0);
                        break;
                    }
                    if (items[i][props.selectionKey!] === e.value.slice(-1)[0][props.selectionKey!]) {
                        setSelectedRowIndex(props.fetchData ? first + i : i);
                        break;
                    }
                }
            }

        }

        //@ts-ignore
        const newSelectedRow = Object.values(newSelectedRowsPerPage).flat();

        setSelectedRowPerPage(newSelectedRowsPerPage)
        setSelectedRow(newSelectedRow);

        if (props.selectionHandler) props.selectionHandler({value: newSelectedRow});
        //@ts-ignore
        if (props.setSelected) props.setSelected(Object.values(newSelectedRowsPerPage).flat());
    };

    const onRowEditComplete = (e: DataTableRowEditCompleteParams) => {
        let newItems = [...items];
        let {newData, index} = e;

        newItems[index] = newData;

        setItems(newItems);
        props.rowEditHandler!(e);
    }

    const onCellEditComplete = (e: any) => {
        const {rowData, newRowData, rowIndex} = e;

        setItems((prevState) => {
            let newItems = JSON.parse(JSON.stringify(items));
            if(props.selectionKey) {
                const selectionKeyOfRowData = rowData[props.selectionKey];
                const index = items.findIndex(el => el[props.selectionKey] === selectionKeyOfRowData);
                newItems[index] = newRowData;
                return newItems
            }else {
                newItems[rowIndex] = newRowData;
                return newItems
            }

        });
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

    const setRef = (ref: DataTable) => {
        if(props.setDtRef)
            props.setDtRef(ref);
        dt.current = ref;
        if (ref && ref.getTable && ref.getTable() && props.tableHeight) {
            ref.getTable().parentElement.style.height = props.tableHeight;
        }
    }

    const setSkeletonDtRef = (ref: any) => {
        skeletonDtRef.current = ref;
        if (ref && ref.getTable && ref.getTable() && props.tableHeight) {
            ref.getTable().parentElement.style.height = props.tableHeight;
        }
    }

    return <>
        {props.forOverlay || (showTable && ((filters && items) || !props.showSkeleton)) ?
            <>
                <div onKeyDown={props.disableArrowKeys ? () => 0 : listener} className={"datatable-responsive-demo " + props.wrapperClassName || ""}>
                    {props.contextMenu ?
                        <ContextMenu model={props.contextMenu} ref={cm} onHide={() => setSelectedElement(null)}
                                     appendTo={document.body}/> : null}
                    <Tooltip target=".export-buttons>button" position="bottom"/>

                    <DataTable
                        rowHover
                        //editMode={"row"} rowEditorValidator={props.onRowEditorValidator} onRowEditInit={props.onRowEditInit} onRowEditSave={props.onRowEditSave} onRowEditCancel={props.onRowEditCancel}
                        //footerColumnGroup={props.subTotals ? buildSubTotals() : null}
                        ref={setRef}
                        value={items}
                        filters={filters}
                        first={first}
                        rows={rows}
                        totalRecords={totalRecords}
                        lazy={props.fetchData !== undefined}
                        paginator={props.showPaginator && !props.virtualScroll}
                        footer={props.footerTemplate || null}
                        onFilter={handleFilter}
                        onSort={handleSort}
                        responsiveLayout={'stack'}
                        dataKey={props.selectionKey || "id"}
                        className="p-datatable-sm p-datatable-striped"
                        filterDisplay={props.showFilters ? 'row' : undefined}
                        // sortField={sortField} sortOrder={sortOrder} onSort={ (e : any) => {setLoading(true); setTimeout(() => {setSortField(e.sortField); setSortOrder(e.sortOrder)}, 0)}}
                        multiSortMeta={multiSortMeta}
                        sortMode={'multiple'}
                        //@ts-ignore
                        selectionMode={["single", "multiple", 'checkbox'].includes(props.selectionMode!) ? props.selectionMode : undefined}
                        selection={selectedRow}
                        onSelectionChange={handleSelection}
                        tableStyle={{tableLayout: "auto"}}
                        header={props.showHeader ? getHeader() : null}
                        rowsPerPageOptions={paginatorOptions}
                        editMode={editMode}
                        onRowEditComplete={onRowEditComplete}
                        scrollable={props.virtualScroll || props.frozenColumns !== undefined}
                        scrollHeight={props.scrollHeight ? props.scrollHeight : undefined}
                        virtualScrollerOptions={props.scrollHeight ? {itemSize: 32} : undefined}
                        onPage={(e) => onPage(e)}
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
                                            setSelectedRowIndex(props.fetchData ? first + i : i);
                                            break;
                                        }
                                    }
                                } else {
                                    props.setSelected(e.value, true);
                                    setSelectedRow(e.value);
                                    for (let i = 0; i < items.length; i++) {
                                        if (items[i][props.selectionKey!] === e.value[props.selectionKey!]) {
                                            setSelectedRowIndex(props.fetchData ? first + i : i);
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
                        {...props.dtProps}
                    >
                        {columns}

                    </DataTable>

                </div>
            </>
            :
            <DataTable ref={setSkeletonDtRef} value={getFakeData()} rows={5} paginator={true}
                       className="p-datatable-striped">
                {
                    props.columnOrder.map(column => <Column field={column} header={getColumnHeaderTranslated(column)}
                                                            style={{width: `${100 / props.columnOrder.length}%`}}
                                                            body={skeletonTemplate} key={column}/>)
                }
            </DataTable>
        }
    </>
};

ReactiveTable.defaultProps = {
    showFilters: true,
    ignoreFilters: [],
    showHeader: false,
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
    initialFilters: {},
    swr: false,
}
