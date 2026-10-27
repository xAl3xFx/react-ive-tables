import {useIntl} from "react-intl";
import React, {ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {Column, ColumnBodyOptions, ColumnEvent, ColumnHeaderOptions} from "primereact/column";
import {
    DataTable,
    DataTableFilterMetaData,
    DataTableSortMeta,
    DataTableFooterTemplateOptions,
    DataTableStateEvent,
    DataTableValueArray,
    DataTableRowEditCompleteEvent,
    DataTableFilterEvent, DataTableBaseProps, DataTableValue,
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
import {FilterMatchMode} from "primereact/api";
import {DataViewProps} from "primereact/dataview";
import {Dialog} from "primereact/dialog";
import {MobileFilters} from "./mobile/MobileFilters";
import {MobileDataView} from "./mobile/MobileDataView";

export type StringKeys<T> = Extract<keyof T, string>;
export type SpecialFilter<K extends string> = { [key in K]?: (options: any, cName: string) => React.ReactNode }
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

interface Props<T extends DataTableValue, K extends string> {
    data?: T[] | undefined;                                                      // This property gives all the data for the table when not using lazy fetching or when using SWR
    fetchData?: (params: FetchDataParams)                                        // Function which is responsible for fetching data when using lazy fetching. When 'swr' prop is false it fetches and returns Promise with data. When 'swr' is true it is responsible to trigger SWR refetch which on its hand will refresh 'data' prop.
        => Promise<{ rows: any[], totalRecords: number } >
    totalRecords?: number;                                                      // When using lazy fetching this prop gives the total count of records in 'data' prop.
    swr?: boolean;                                                              // Defines if SWR will be used or not.
    columnOrder: (K | StringKeys<T>)[];                                         // Defines order for the columns. NB! Only the specified columns here will be rendered.
    ignoreFilters?: (K | StringKeys<T>)[];                                                        // Defines which filters should be ignored. By default all are shown if `showFilters` is set to true.
    specialFilters?: SpecialFilter<K>;                                          // Used for special filter elements. The key is the cName and the value is a function which handles filtering. For reference : https://primefaces.org/primereact/showcase/#/datatable/filter
    filtersMatchMode?: FiltersMatchMode<K>
    specialLabels?: { [key in K]?: string; };                                   // Used for special labels. By default the table is trying to use intl for translation of each label. If specialLabels is used it overrides the column name for translation. The key is the cName and the value is the translation string used in text properties for intl.
    showFilters?: boolean;                                                      // Should filters be rendered.
    showHeader?: boolean;                                                       // Should header be rendered.
    setSelected?: (value: any,                                                  // Callback for selection. Provides the selected row/rows.
                   contextMenuClick: boolean) => void,
    contextMenu?: Object[],                                                     // Context menu model. For reference : https://primefaces.org/primereact/showcase/#/datatable/contextmenu
    rowEditHandler?: (event: DataTableRowEditCompleteEvent)
        => void,                                                                // Handler for row editing. NB! Even if a specific handler is not required, this property must be provided in order to trigger row editing. The function is invoked after saving the row. The event containing newData, rowIndex and other metadata is returned.
    specialEditors?: { [key in K]?: any },                                      // Just like specialFilters, specialEditors is used when specific editor element is needed. Reference:  https://primefaces.org/primereact/showcase/#/datatable/edit
    cellEditHandler?: (element: ColumnEvent) => void,                           // Same as rowEditHandler.
    selectionHandler?: (e: any) => void,                                        // Pretty much like setSelected. Not sure why it is needed, but it is used in some projects.
    selectionMode?: "multiple" | "checkbox"                                     // Selection mode.
    selectionKey?: keyof T,                                                     // Key used for selection. Default value is 'id'. Important for proper selection.
    onRowUnselect?: (e: any) => void,                                           // Callback invoked when row is unselected.
    selectedIds?: string[] | number[],                                          // Used for external selection. When such array is passed, items are filtered so that all items matching those ids are set in selectedRow.
    specialColumns?: {                                                          // Used for special columns that are not included in the `data` prop. The key is string used as 'cName' and the value is the JSX.Element, click handler and boolean specifying
        [key in K]?:                                                            // if the column should be put at the beginning or at the end.
        {
            element: React.ReactElement<any>,
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
    dtProps?: Partial<DataTableBaseProps<T[]>>;                   // Additional properties to be passed directly to the datatable.
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
    footerTemplate?: (options: DataTableFooterTemplateOptions<T[]>) => ReactNode                           // A function that returns a template for the footer of the table
    initialFilters?: { [key in keyof T]?: string | number | Date | boolean | string[] | number[] | Date[] | boolean[] },
    frozenColumns?: K[]                                           // Specify which columns should be frozen (default right aligned)
    expandable?: boolean                                          // When true expander column is added at the beginning
    rebuildColumns?: number;
    refresher?: number;                                           // Used to manually refresh the table from parent component
    textAlign?: 'left' | 'center' | 'right'                       // Used to override columns body text align which defaults to 'center'
    setDtRef?: (ref: DataTable<T[]>) => void;                          // Used to pass the table's ref back to parent
    resetFilters?: number;
    paginatorOptions?: number[];                                  // Used to overwrite the default paginator options, which are [20, 30, 50]
    wrapperClassName?: string;
    defaultFilterPlaceholder?: string;                            // Set placeholder for default (text) filters
    columnHeaderTemplate?: {
        [key in K]?:
        React.ReactNode | ((options: ColumnHeaderOptions) => React.ReactNode)
    };
    isMobile?: boolean;                                           // Used to determine when to render the mobile (responsive) view
    mobileDataTemplate?: (rowData: T) => any                      // Specifies what to render in the mobile view
    dataViewProps?: DataViewProps
}
function useDeepCompareMemoize<T>(value: T, propName: string): T {
    const ref = useRef<T>(value);

    if (!isEqual(value, ref.current)) {
        ref.current = value;
    } else if (value !== ref.current) {
    }

    return ref.current;
}


const defaultProps = {
    showFilters: true,
    ignoreFilters: [],
    showHeader: false,
    selectionHandler: () => 0,
    columnTemplate: {},
    selectionKey: "id",
    formatDateToLocal: true,
    headerButtons: [],
    rightHeaderButtons: [],
    sortableColumns: [],
    specialEditors: {},
    specialColumns: {},
    specialFilters: {},
    virtualScroll: false,
    showSkeleton: true,
    disableArrowKeys: false,
    forOverlay: false,
    editableColumns: [],
    showPaginator: true,
    initialFilters: {},
    swr: false,
};

export const ReactiveTable = <T extends DataTableValue, K extends string>(rawProps: Props<T, K>) => {
    // Explicit `undefined` props must not override defaults (same as destructuring defaults did).
    const props = {...defaultProps, ...Object.fromEntries(Object.entries(rawProps).filter(([, v]) => v !== undefined))} as typeof defaultProps & Props<T, K>;
    const {showFilters, ignoreFilters, showHeader, selectionMode, selectionHandler, onRowUnselect, columnTemplate, columnOrder, selectionKey, formatDateToLocal, headerButtons, rightHeaderButtons, sortableColumns, specialEditors, specialColumns, specialFilters, virtualScroll, scrollHeight, showSkeleton, disableArrowKeys, forOverlay, editableColumns, showPaginator, initialFilters, swr} = props;
    const getDefaultFilters = () => {
        if (!columnOrder) return {};
        return columnOrder.reduce((acc: any, el) => {
            let matchMode = "contains";
            //@ts-ignore
            if (props.filtersMatchMode && props.filtersMatchMode[el]) matchMode = props.filtersMatchMode[el];
            return {...acc, [el]: {value: null, matchMode: matchMode || "contains"}}
        }, {});
    }

    const {formatMessage: f} = useIntl();

    const [items, setItems] = useState<T[]>([]);
    const [originalItems, setOriginalItems] = useState<any>([]);
    const [filters, setFilters] = useState<any>(() => {
        const defaults = getDefaultFilters();
        if (initialFilters) {
            Object.keys(initialFilters).forEach(key => {
                if (defaults[key]) {
                    //@ts-ignore
                    defaults[key].value = props.initialFilters[key];
                }
            });
        }
        return defaults;
    });
    // FIX: was useState<any>({}) — the guard below (`prevFilters === null`) could never
    // become true, so the very first fill of `filters` (all values null, from initFilters())
    // always fell through to refreshTable(), causing a duplicate fetch on every mount.
    const [prevFilters, setPrevFilters] = useState<any>(null);
    const [rows, setRows] = useState(20);
    const [first, setFirst] = useState(0);
    const [page, setPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0); //Used for handling arrowUp and arrowDown. This is the index of the current selected row.
    const [selectedRow, setSelectedRow] = useState<T | T[]>();
    const [selectedRowsPerPage, setSelectedRowPerPage] = useState<any>({});
    const [selectionResetter, setSelectionResetter] = useState<number>(props.selectionResetter || 0);
    const [selectedElement, setSelectedElement] = useState(null);
    const [prevInitialFilters, setPrevInitialFilters] = useState<any>(); //Used for comparison with props.initialFilters to escape inifinite loop
    const [excelFilters, setExcelFilters] = useState({});
    const [areFiltersInited, setAreFiltersInited] = useState(false);
    const [paginatorOptions, setPaginatorOptions] = useState([20, 30, 50]);
    const [refresher, setRefresher] = useState<number>();

    const [multiSortMeta, setMultiSortMeta] = useState<DataTableSortMeta[]>([]);
    const [mobileFiltersDialogShown, setMobileFiltersDialogShown] = useState(false);

    ///!!!
    const latestProps = useRef(props);
    latestProps.current = props;


    const cm = useRef<any>(null);
    const dt = useRef<any>(null);
    const skeletonDtRef = useRef<any>(null);
    const filterRef = useRef<any>(null);
    const editMode = props.cellEditHandler === undefined ? (props.rowEditHandler === undefined ? undefined : "row") : "cell";

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


        if (swr) {
            props.fetchData({offset: first, limit: rows, filters, sort}).then(() => {
                setLoading(false);
            });
        } else {
            props.fetchData({offset: first, limit: rows, filters, sort}).then((response) => {
                setItems(response.rows as T[]);
                setTotalRecords(response.totalRecords);
                setLoading(false);
                setShowTable(true);
            });
        }

    }

    useEffect(() => {
        if (props.resetFilters === undefined) return;
        const newFilters = getDefaultFilters();
        handleFilter({filters: newFilters});
        setTimeout(() => {
            Object.keys(filters).forEach(key => {
                const filter = document.querySelector("#filter-" + key);
                if (filter) {
                    //@ts-ignore
                    filter.value = "";
                }
            })
        }, 100);

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
            if (swr && prevFilters === null && Object.values(filters).every((filter: any) => filter.value === null)) {
                //Do nothing
            } else {
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
        if (initialFilters && areFiltersInited) {
            Object.keys(initialFilters).forEach(key => {
                const filter = document.querySelector("#filter-" + key);
                if (filter && initialFilters[key] !== undefined && initialFilters[key] !== null) {
                    //@ts-ignore
                    filter.value = initialFilters[key];
                }
            })
        }
    }, [initialFilters, areFiltersInited]);




    useEffect(() => {
        // if (filters === null)
        //     initFilters();
        if (swr && props.data !== undefined) {
            setItems(props.data);
            setShowTable(true);
            setLoading(false);
        } else if (props.data !== undefined || !showSkeleton) {
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
        if (filters && Object.keys(filters).length > 0) {
            setAreFiltersInited(true);
        }
    }, [filters])


    const listener = (event: any) => {
        if (selectionMode !== 'checkbox') return;
        if (event.code === "ArrowUp") {
            if (selectedRowIndex - 1 >= 0) {
                const newSelectedElement = items[selectedRowIndex - 1];
                if (selectedRowIndex % rows === 0) {
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
                if ((selectedRowIndex + 1) % rows === 0) {
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



    const handleExternalSelection = () => {
        if (selectionMode === "multiple" || selectionMode === "checkbox") {
            const elements: typeof items = [];
            let selectedRowIndex = undefined;
            for (let i = 0; i < items.length; i++) {
                if (props.selectedIds?.includes(items[i][selectionKey] as never)) {
                    if (!selectedRowIndex) {
                        selectedRowIndex = i;
                    }
                    elements.push({...items[i]});
                }
            }
            if (selectedRow)
                setSelectedRow([...(selectedRow as T[]), ...elements]);
            else
                setSelectedRow([...elements]);
            if (selectedRowIndex !== undefined)
                setSelectedRowIndex(selectedRowIndex);
        } else {
            let element: any = undefined;
            for (let i = 0; i < items.length; i++) {
                if (props.selectedIds?.includes(items[i][selectionKey] as never)) {
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
                if (focusFirstRow) {
                    if (showFilters === false && trs.length >= 2)
                        trs[1].focus();
                    else if (trs.length >= 3) {
                        trs[2].focus();
                    }
                } else {
                    if (trs.length >= 2) {
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
        const labelsMap = columnOrder.reduce((acc, el) => {
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
        props.exportConfig.onExportExcel({
            sort: multiSortMeta,
            filters: filters,
            columns: columnOrder,
            labelsMap
        });

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

    const handleFilter = (e: DataTableFilterEvent) => {
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
            setMobileFiltersDialogShown(false);
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
        setMobileFiltersDialogShown(false)
    }

    const textEditor = (options: any, cName: string) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)}/>;
    }

    const defaultFilter = (options: any, cName: string) => {
        return <InputText id={'filter-' + cName} type="text" value={options.value} style={{minWidth: '100px'}}
                          placeholder={props.defaultFilterPlaceholder}
                          onChange={(e) => options.filterApplyCallback(e.target.value)}/>;
    }

    const getColumnHeaderTranslated = (cName: string) => {
        if (props.specialLabels && props.specialLabels[cName])
            return f({id: props.specialLabels[cName]})
        return f({id: cName});
    }


    const onCellEditComplete = (e: ColumnEvent) => {
        const {rowData, newRowData, rowIndex} = e;

        setItems((prevState) => {
            const newItems = cloneDeep(prevState);
            if (selectionKey) {
                const selectionKeyOfRowData = rowData[selectionKey];
                // @ts-ignore
                const index = items.findIndex(el => el[selectionKey] === selectionKeyOfRowData);
                newItems[index] = newRowData;
                return newItems
            } else {
                newItems[rowIndex] = newRowData;
                return newItems
            }

        });
        props.cellEditHandler!(e);
    }

    const stableColumnOrder = useDeepCompareMemoize(columnOrder, 'columnOrder');
    const stableColumnStyle = useDeepCompareMemoize(props.columnStyle, 'columnStyle');
    const stableEditableColumns = useDeepCompareMemoize(editableColumns, 'editableColumns');
    const stableFrozenColumns = useDeepCompareMemoize(props.frozenColumns, 'frozenColumns');
    const stableSortableColumns = useDeepCompareMemoize(sortableColumns, 'sortableColumns');
    const stableIgnoreFilters = useDeepCompareMemoize(ignoreFilters, 'ignoreFilters');

    const specialColumnKeys = useDeepCompareMemoize(Object.keys(specialColumns || {}), 'specialColumnKeys');

    const columns = useMemo(() => {
        if (!stableColumnOrder) return [];

        const tempColumns = stableColumnOrder.map((cName: any) => {
            const columnHeaderStyle = {
                textAlign: 'center',
                //@ts-ignore
                ...(stableColumnStyle && stableColumnStyle[cName] ? stableColumnStyle[cName].header : {})
            };
            //@ts-ignore
            const columnBodyStyle = stableColumnStyle && stableColumnStyle[cName]
                //@ts-ignore
                ? stableColumnStyle[cName].body
                : {textAlign: props.textAlign || 'center'};

            return (
                <Column
                    key={cName}
                    field={cName}
                    headerStyle={columnHeaderStyle}
                    bodyStyle={columnBodyStyle}
                    frozen={stableFrozenColumns?.includes(cName)}
                    alignFrozen="right"
                    rowEditor={cName === 'operations' && props.rowEditHandler !== undefined}
                    sortable={stableSortableColumns?.includes(cName)}
                    showClearButton={false}
                    showFilterMenu={false}
                    filterField={cName}
                    filter={showFilters && !stableIgnoreFilters?.includes(cName)}
                    filterHeaderStyle={{textAlign: 'center'}}
                    onCellEditComplete={props.cellEditHandler ? onCellEditComplete : undefined}
                    header={(options) => {
                        //@ts-ignore
                        const customHeader: any = latestProps.current.columnHeaderTemplate?.[cName];
                        if (customHeader) {
                            return typeof customHeader === 'function' ? customHeader(options) : customHeader;
                        }
                        return getColumnHeaderTranslated(cName);
                    }}
                    body={(rowData: T, columnOptions) => {
                        //@ts-ignore
                        const template: any = latestProps.current.columnTemplate?.[cName];
                        return template ? template(rowData, columnOptions) : undefined;
                    }}
                    editor={(options) => {
                        //@ts-ignore
                        const customEditor: any = latestProps.current.specialEditors?.[cName];
                        if (customEditor) return customEditor(options);
                        return (editMode && stableEditableColumns?.includes(cName)) ? textEditor(options, cName) : undefined;
                    }}
                    filterElement={(options) => {
                        //@ts-ignore
                        const customFilter: any = latestProps.current.specialFilters?.[cName];
                        return customFilter ? customFilter(options, cName) : defaultFilter(options, cName);
                    }}
                />
            );
        });
        // @ts-ignore
        if (props.rowEditHandler !== undefined && !stableColumnOrder.includes('operations')) {
            tempColumns.push(
                <Column key="rowEditor" rowEditor headerStyle={{width: '7rem'}} bodyStyle={{textAlign: 'center'}}/>
            );
        }

        if (props.expandable) {
            tempColumns.unshift(<Column key="expander" expander headerStyle={{width: '3em'}}/>);
        }

        if (selectionMode === "checkbox") {
            tempColumns.unshift(<Column key="checkbox" selectionMode="multiple" headerStyle={{width: '3em'}}/>);
        }

        specialColumnKeys.forEach(cName => {
            const col = (
                <Column
                    key={cName}
                    field={cName}
                    header={f({id: cName})}
                    body={(rowData: any) => {
                        // Отново четем директно от latestProps в момента на рендиране на клетката
                        const specialColDef = latestProps.current.specialColumns![cName as K];
                        if (!specialColDef) return null;
                        return React.cloneElement(specialColDef.element, {
                            onClick: () => specialColDef.handler(rowData)
                        });
                    }}
                />
            );

            if (latestProps.current.specialColumns![cName as K]?.atStart) {
                tempColumns.unshift(col);
            } else {
                tempColumns.push(col);
            }
        });

        return tempColumns;

    }, [
        stableColumnOrder,
        stableColumnStyle,
        stableEditableColumns,
        stableFrozenColumns,
        stableSortableColumns,
        stableIgnoreFilters,
        specialColumnKeys,
        props.showFilters,
        props.expandable,
        props.selectionMode,
        props.textAlign,
        props.rebuildColumns,
        editMode
    ]);

    const onPage = (event: DataTableStateEvent) => {
        setSelectedRowIndex(event.first)
        setPage(event.page);
        focusRow(true);
        if (props.fetchData) {
            if (event.first === first && event.rows === rows) return;
            setLoading(true);
            setFirst(event.first);
            setRows(event.rows);
            //Parent responsible to pass new 'data' prop
            if (swr) {
                props.fetchData({offset: event.first, limit: event.rows, filters, page: event.page}).then(() => {
                    setLoading(false)
                });
            } else {
                //'fetchData' should return new items.
                props.fetchData({offset: event.first, limit: event.rows, filters}).then((response) => {
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
        return <div className="export-buttons" style={{display: "flex", gap: "0.5rem", flexWrap: "wrap"}}>
            {(props.isMobile !== undefined && props.isMobile && props.mobileDataTemplate) ?
                <Button icon={'pi pi-filter'} label={f({id: 'filters'})} className={"mb-3"}
                        onClick={() => setMobileFiltersDialogShown(true)}/> :
                null
            }
            <div>
                {props.exportConfig ?
                    <Button type="button" icon={props.exportConfig.exportButtonIcon || ''} onClick={exportExcel}
                            className="p-button-success p-mr-2"
                            data-pr-tooltip="XLS">{props.exportConfig.exportButtonLabel || ''}</Button>
                    : null
                }
                {/*{props.toggleSelect ?*/}
                {/*    <Button type="button" icon="fas fa-check-square" onClick={props.toggleSelect.handler}*/}
                {/*            className="p-button-success p-mr-2" data-pr-tooltip="XLS"/>*/}
                {/*    : null*/}
                {/*}*/}
                {
                    headerButtons?.map((el, index) => <Button key={index} type="button" icon={el.icon}
                                                                    onClick={el.onClick}
                                                                    tooltip={el.tooltipLabel} label={el.label}
                                                                    ref={el.ref}
                                                                    tooltipOptions={{position: 'top'}}
                                                                    className={`${el.className} table-header-left-align-buttons p-mr-2`}/>)
                }
            </div>
            <div>
                {
                    rightHeaderButtons?.map((el, index) => <Button key={index} type="button" icon={el.icon}
                                                                         onClick={el.onClick}
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
        let newSelectedRowsPerPage = cloneDeep(selectedRowsPerPage) || {};
        let itemUnselected = false;

        // Handle all array-based selections (Select All, Checkbox, Multiple Row Select)
        if (Array.isArray(e.value)) {

            // INTERSECTION LOGIC: Isolate the update entirely to the current page.
            // We filter the current page's `items` to see exactly which ones are present in `e.value`.
            // This ensures we never accidentally touch or overwrite other pages.
            const newElementsForPage = [];
            for (let item of items) {
                const isSelected = e.value.some(
                    (el: any) => el[props.selectionKey!] === item[props.selectionKey!]
                );

                if (isSelected) {
                    newElementsForPage.push(item);
                }
            }

            const currPageElements = newSelectedRowsPerPage[page] || [];

            // If the current page previously had more elements selected, an item was unselected
            if (currPageElements.length > newElementsForPage.length) {
                itemUnselected = true;
            }

            // Strictly update ONLY the current page's slot in the dictionary
            newSelectedRowsPerPage[page] = newElementsForPage;

        } else {
            // Handle single (non-array) selection (e.g., single row click without multiple mode)
            if (props.setSelected) props.setSelected(e.value, false);
            if (props.selectionHandler) props.selectionHandler(e);

            if (Array.isArray(multiSortMeta) && multiSortMeta.length === 0) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i][props.selectionKey!] === e.value[props.selectionKey!]) {
                        setSelectedRowIndex(props.fetchData ? first + i : i);
                        break;
                    }
                }
            }
            setSelectedRow(e.value);
            return; // Exit early for single selections
        }

        // Multiple Selection index post-processing
        if (!itemUnselected && Array.isArray(multiSortMeta) && multiSortMeta.length === 0) {
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

        // Flatten dictionary and update states
        const newSelectedRow = Object.values(newSelectedRowsPerPage as T[]).flat() as T[];

        setSelectedRowPerPage(newSelectedRowsPerPage);
        setSelectedRow(newSelectedRow);

        if (selectionHandler) selectionHandler({ value: newSelectedRow });
        if (props.setSelected) props.setSelected(newSelectedRow, false);
    };



    const onRowEditComplete = (e: DataTableRowEditCompleteEvent) => {
        let newItems: T[] = [...items];
        let {newData, index} = e;

        newItems[index] = newData as T;

        setItems(newItems);
        props.rowEditHandler!(e);
    }



    const skeletonTemplate = () => {
        return <Skeleton></Skeleton>
    }

    const getFakeData = () => {
        let res = [];
        for (let i = 0; i < rows; i++) {
            const row = columnOrder.reduce((acc, elem) => {
                return {...acc, [elem]: ''}
            }, {});
            res.push(row);
        }
        return res;
    }


    const setRef = (ref: DataTable<T[]>) => {
        if (props.setDtRef)
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
        {forOverlay || (showTable && ((filters && items) || !showSkeleton)) ?
            (props.isMobile !== undefined && props.isMobile && props.mobileDataTemplate) ?
                <div>
                    <Dialog header={f({id: 'filters'})} position={"top"}
                            onHide={() => setMobileFiltersDialogShown(false)}
                            visible={mobileFiltersDialogShown} breakpoints={{'960px': '75vw', '640px': '100vw'}}
                            style={{width: '50vw'}}>
                        <MobileFilters
                            onFilterApply={handleFilter}
                            initialFilters={filters}
                            filterColumns={columnOrder.filter(column => !ignoreFilters?.includes(column))}
                            specialFilters={specialFilters}
                            specialLabels={props.specialLabels}
                        />
                    </Dialog>

                    {showHeader ? getHeader() : null}

                    <MobileDataView
                        dataViewProps={props.dataViewProps}
                        data={items}
                        totalRecords={totalRecords}
                        first={first}
                        lazy={props.fetchData !== undefined}
                        rows={rows}
                        paginator={showPaginator}
                        rowTemplate={props.mobileDataTemplate}
                        filters={filters}
                        filtersMatchMode={props.filtersMatchMode}
                        onPage={onPage}
                    />
                </div>
                :
                <>
                    <div onKeyDown={disableArrowKeys ? () => 0 : listener}
                         className={"datatable-responsive-demo " + props.wrapperClassName || ""}>
                        {props.contextMenu ?
                            <ContextMenu model={props.contextMenu} ref={cm} onHide={() => setSelectedElement(null)}
                                         appendTo={document.body}/> : null}
                        <Tooltip target=".export-buttons>button" position="bottom"/>

                        <DataTable<T[]>
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
                            paginator={showPaginator && !virtualScroll}
                            footer={props.footerTemplate || null}
                            onFilter={handleFilter}
                            onSort={handleSort}
                            responsiveLayout={'stack'}
                            dataKey={props.selectionKey || "id"}
                            className="p-datatable-sm p-datatable-striped"
                            filterDisplay={props.showFilters ? 'row' : undefined}
                            filterDelay={props.swr ? 700 : 300}
                            // sortField={sortField} sortOrder={sortOrder} onSort={ (e : any) => {setLoading(true); setTimeout(() => {setSortField(e.sortField); setSortOrder(e.sortOrder)}, 0)}}
                            multiSortMeta={multiSortMeta}
                            sortMode={'multiple'}
                            cellSelection={undefined} // ✅ makes TS pick row-selection overload
                            selectionMode={["single", 'checkbox'].includes(props.selectionMode!) ? props.selectionMode : undefined}
                            selection={selectedRow as any} // selectionMode is dynamic, PrimeReact typings only accept one fixed mode
                            onSelectionChange={handleSelection}
                            tableStyle={{tableLayout: "auto"}}
                            header={showHeader ? getHeader() : null}
                            rowsPerPageOptions={paginatorOptions}
                            editMode={editMode}
                            onRowEditComplete={onRowEditComplete}
                            scrollable={virtualScroll || props.frozenColumns !== undefined}
                            scrollHeight={scrollHeight ? scrollHeight : undefined}
                            virtualScrollerOptions={scrollHeight ? {itemSize: 32} : undefined}
                            onPage={(e) => onPage(e)}
                            loading={loading}
                            onRowUnselect={onRowUnselect}
                            onContextMenuSelectionChange={(e: any) => {
                                //set{selectedRow: e.value});
                                if (props.setSelected !== undefined && props.contextMenu) {
                                    if (['checkbox'].includes(selectionMode!)) {
                                        props.setSelected([e.value], true);
                                        setSelectedRow([e.value]);
                                        const page = Math.floor(first / rows) + 1;
                                        setSelectedRowPerPage({[page]: [e.value]});
                                        for (let i = 0; i < items.length; i++) {
                                            if (items[i][selectionKey!] === e.value[selectionKey!]) {
                                                setSelectedRowIndex(props.fetchData ? first + i : i);
                                                break;
                                            }
                                        }
                                    } else {
                                        props.setSelected(e.value, true);
                                        setSelectedRow(e.value);
                                        for (let i = 0; i < items.length; i++) {
                                            if (items[i][selectionKey!] === e.value[selectionKey!]) {
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
            <DataTable ref={setSkeletonDtRef} value={getFakeData()} rows={5} paginator={showPaginator}
                       className="p-datatable-striped">
                {
                    columnOrder.map(column => <Column field={column} header={getColumnHeaderTranslated(column)}
                                                            style={{width: `${100 / columnOrder.length}%`}}
                                                            body={skeletonTemplate} key={column}/>)
                }
            </DataTable>
        }
    </>
};
