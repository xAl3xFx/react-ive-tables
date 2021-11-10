"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyDataTable = void 0;
const React = __importStar(require("react"));
const react_intl_1 = require("react-intl");
const axios_1 = __importDefault(require("axios"));
const react_1 = require("react");
const column_1 = require("primereact/column");
const datatable_1 = require("primereact/datatable");
const inputtext_1 = require("primereact/inputtext");
const button_1 = require("primereact/button");
require("./DataTable.css");
const DTFilterElement_1 = require("./DTFilterElement");
const contextmenu_1 = require("primereact/contextmenu");
const tooltip_1 = require("primereact/tooltip");
const moment_1 = __importDefault(require("moment"));
const file_saver_1 = require("file-saver");
const lodash_clone_1 = __importDefault(require("lodash.clone"));
const LazyDataTable = (props) => {
    const { formatMessage: f } = (0, react_intl_1.useIntl)();
    const [items, setItems] = (0, react_1.useState)([]);
    const [filters, setFilters] = (0, react_1.useState)({});
    const [filterElements, setFilterElements] = (0, react_1.useState)([]);
    const [columns, setColumns] = (0, react_1.useState)([]);
    const [rows, setRows] = (0, react_1.useState)(20);
    const [totalRecords, setTotalRecords] = (0, react_1.useState)(0);
    const [first, setFirst] = (0, react_1.useState)(0);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [currRecord, setCurrRecord] = (0, react_1.useState)(0);
    const [originalItemCopy, setOriginalItemCopy] = (0, react_1.useState)([]);
    const [editElement, setEditElement] = (0, react_1.useState)({});
    const [sortField, setSortField] = (0, react_1.useState)();
    const [sortOrder, setSortOrder] = (0, react_1.useState)();
    const [showTable, setShowTable] = (0, react_1.useState)(false);
    const [selectedRow, setSelectedRow] = (0, react_1.useState)();
    const [selectedRowsPerPage, setSelectedRowPerPage] = (0, react_1.useState)({});
    const [refresher, setRefresher] = (0, react_1.useState)();
    const [selectedElement, setSelectedElement] = (0, react_1.useState)(null);
    const cm = (0, react_1.useRef)();
    const dt = (0, react_1.useRef)();
    const onPage = (e) => {
        setLoading(true);
        axios_1.default.post(props.dataUrl + e.first + '/' + e.rows, { filters }).then((response) => {
            setFirst(e.first);
            setRows(e.rows);
            const page = Math.floor(e.first / e.rows) + 1;
            setSelectedRow(selectedRowsPerPage[page] || []);
            const newData = parseDates(response.data.rows);
            setItems(newData);
            setLoading(false);
            setCurrRecord(e.first);
        });
    };
    const parseDates = (data) => {
        return data.map((row) => {
            Object.keys(row).map(key => {
                if (key.indexOf("date") !== -1 || key.toLocaleLowerCase().indexOf("period") !== -1 || key.toLocaleLowerCase().indexOf("timestamp") !== -1 || key.toLowerCase().indexOf("valor") !== -1 || key.toLowerCase().indexOf("createdat") !== -1) {
                    if (props.formatDateToLocal) {
                        row[key] = (0, moment_1.default)(row[key]).local().format('YYYY-MM-DD HH:mm:ss');
                    }
                    else {
                        row[key] = moment_1.default.utc(row[key]).format('YYYY-MM-DD HH:mm:ss');
                    }
                }
            });
            return row;
        });
    };
    const loadData = () => {
        axios_1.default.post(props.dataUrl + currRecord + '/' + rows, { filters }).then((response) => {
            const newData = parseDates(response.data.rows);
            setItems(newData);
            setTotalRecords(response.data.count);
            setShowTable(response.data.count > 0 || props.columnOrder !== undefined);
            setLoading(false);
        }).catch(err => 0);
    };
    const refreshTable = () => {
        setLoading(true);
        loadData();
    };
    (0, react_1.useEffect)(() => {
        const tempFilters = Object.assign(Object.assign({}, filters), props.additionalFilters);
        if (props.additionalFilters !== undefined)
            if (JSON.stringify(tempFilters) !== JSON.stringify(filters))
                setFilters(Object.assign(Object.assign({}, filters), props.additionalFilters));
    }, [props.additionalFilters]);
    (0, react_1.useEffect)(() => {
        if (props.refresher !== refresher)
            setRefresher(props.refresher);
    }, [props.refresher]);
    (0, react_1.useEffect)(() => {
        if (props.additionalFilters && Object.keys(filters).length === 0)
            return;
        loadData();
        if (props.onFiltersUpdated)
            props.onFiltersUpdated(filters);
    }, [filters, refresher]);
    const onModelFilterChange = (event) => {
        setFilters((prevFilters) => (Object.assign(Object.assign({}, prevFilters), { [event.target.name]: event.target.value })));
    };
    (0, react_1.useEffect)(() => {
        generateColumns();
    }, [props.toggleSelect]);
    const generateFilterElement = (cName, isSpecial) => {
        if (isSpecial) {
            const element = React.createElement(DTFilterElement_1.DTFilterElement, { isDefault: !isSpecial, cName: cName, element: props.specialFilters[cName].element, type: props.specialFilters[cName].type, onChange: onModelFilterChange });
            const filterElementsTemp = [...filterElements];
            filterElementsTemp.push(element);
            setFilterElements(filterElementsTemp);
            return element;
        }
        else {
            const input = React.createElement(inputtext_1.InputText, null);
            const element = React.createElement(DTFilterElement_1.DTFilterElement, { isDefault: !isSpecial, cName: cName, type: "input", element: input, onChange: onModelFilterChange });
            const filterElementsTemp = [...filterElements];
            filterElementsTemp.push(element);
            setFilterElements(filterElementsTemp);
            return element;
        }
    };
    const createEditor = (cName, columnProps) => {
        if (props.customEditors !== undefined) {
            if (Object.keys(props.customEditors).includes(cName)) {
                return React.cloneElement(props.customEditors[cName], {
                    onChange: (e) => onEditorValueChange(e, columnProps),
                    value: columnProps.rowData[columnProps.field],
                    id: cName
                });
            }
        }
        return React.createElement(inputtext_1.InputText, { value: columnProps.rowData[columnProps.field], onChange: (e) => { onEditorValueChange(e, columnProps); }, id: cName });
    };
    const onEditorValueChange = (event, eventProps) => {
        let tempObject = Object.assign({}, eventProps.value[eventProps.rowIndex]);
        tempObject[eventProps.field] = event.target.value;
        eventProps.rowData[eventProps.field] = event.target.value;
        setEditElement(tempObject);
    };
    const createInputForFilter = (cName) => {
        if (props.specialFilters !== undefined) {
            if (Object.keys(props.specialFilters).includes(cName)) {
                return React.createElement(React.Fragment, null, generateFilterElement(cName, true));
            }
            else {
                return generateFilterElement(cName, false);
            }
        }
        else {
            return generateFilterElement(cName, false);
        }
    };
    (0, react_1.useEffect)(() => {
        if (showTable)
            generateColumns();
    }, [showTable]);
    (0, react_1.useEffect)(() => {
        handleExternalSelection();
    }, [props.selectedIds]);
    const handleExternalSelection = () => {
        if (selectedRow !== undefined) {
            if (props.selectionMode === "multiple" || props.selectionMode === "checkbox") {
                const elements = items.filter((s) => props.selectedIds.includes(s.id));
                const copy = (0, lodash_clone_1.default)(elements);
                setSelectedRow(copy);
            }
            else {
            }
        }
        else {
            if (props.selectionMode === "multiple" || props.selectionMode === "checkbox") {
                const elements = items.filter((s) => props.selectedIds.includes(s.id));
                const copy = (0, lodash_clone_1.default)(elements);
                setSelectedRow(copy);
            }
            else {
            }
        }
    };
    const onRowEditInit = (event) => {
        let temp = JSON.stringify(items[event.index]);
        setOriginalItemCopy(JSON.parse(temp));
        setEditElement(items[event.index]);
    };
    const onRowEditCancel = (event) => {
        let tempItems = (0, lodash_clone_1.default)(items);
        tempItems[event.index] = originalItemCopy;
        setItems(tempItems);
    };
    const generateColumns = () => {
        let edit = props.cellEditHandler !== undefined || props.rowEditHandler !== undefined;
        if (items.length > 0 && items[0] || props.columnOrder) {
            if (columns.length === 0 || (props.toggleSelect && props.toggleSelect.toggle)) {
                let filterValues = Object.assign({}, filters);
                const tempColumns = (props.columnOrder ? props.columnOrder : Object.keys(items[0])).map((cName) => {
                    filterValues = Object.assign(Object.assign({}, filterValues), { [cName]: '' });
                    let columnHeader;
                    if (props.specialLabels !== undefined) {
                        if (Object.keys(props.specialLabels).includes(cName)) {
                            columnHeader = f({ id: props.specialLabels[cName] });
                        }
                        else {
                            columnHeader = f({ id: cName });
                        }
                    }
                    else {
                        columnHeader = f({ id: cName });
                    }
                    if (props.specialColumn && props.specialColumn[cName] !== undefined) {
                        return React.createElement(column_1.Column, { body: (rowData) => generateColumnBodyTemplate(cName, rowData), style: { textAlign: "center" }, key: cName, field: cName, header: columnHeader });
                    }
                    if (props.columnTemplate && props.columnTemplate[cName] !== undefined) {
                        return React.createElement(column_1.Column, { body: (rowData) => props.columnTemplate[cName](rowData), style: { textAlign: "center" }, filter: (props.specialFilters && props.specialFilters[cName]) ? true : false, filterElement: (props.specialFilters && props.specialFilters[cName]) ? createInputForFilter(cName) : undefined, key: cName, field: cName, header: columnHeader });
                    }
                    return React.createElement(column_1.Column, { style: { textAlign: "center" }, key: cName, field: cName, editor: edit ? (props) => createEditor(cName, props) : undefined, header: columnHeader, filter: props.showFilters ? (!props.ignoreFilters.includes(cName)) : false, filterElement: props.showFilters ? (props.ignoreFilters.includes(cName) ? undefined : createInputForFilter(cName)) : undefined });
                });
                if (props.rowEditHandler !== undefined)
                    tempColumns.push(React.createElement(column_1.Column, { rowEditor: true, headerStyle: { width: '7rem' }, bodyStyle: { textAlign: 'center' } }));
                if (props.selectionMode === "checkbox")
                    tempColumns.unshift(React.createElement(column_1.Column, { key: "checkbox", selectionMode: "multiple", headerStyle: { width: '3em' } }));
                setColumns(tempColumns);
            }
            else if (props.toggleSelect) {
                const firstColumn = columns[0];
                if (firstColumn.key && firstColumn.key === "checkbox") {
                    setColumns(columns.splice(1));
                }
            }
        }
    };
    const clearAllFilters = () => {
        if (document.getElementsByClassName("p-datatable-thead")[0] !== undefined) {
            let columnsCount = document.getElementsByClassName("p-datatable-thead")[0].querySelector("tr").cells.length;
            for (let i = 0; i < columnsCount; i++) {
                if (document.getElementsByClassName("p-datatable-thead")[0].querySelector("tr").cells[i].childNodes[1] !== undefined)
                    document.getElementsByClassName("p-datatable-thead")[0].querySelector("tr").cells[i].childNodes[1].nodeValue = "";
            }
        }
    };
    const generateColumnBodyTemplate = (column, rowData) => {
        return React.cloneElement(props.specialColumn[column].element, {
            onClick: (e) => props.specialColumn[column].handler(rowData)
        });
    };
    const comparator = (e, a, b) => {
        if (!a[e.sortField])
            return -1 * e.sortOrder;
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
        return 0;
    };
    const sort = (e) => {
        const tempItems = (0, lodash_clone_1.default)(items);
        tempItems.sort((a, b) => comparator(e, a, b));
        setItems(tempItems);
        setSortField(e.sortField);
        setSortOrder(e.sortOrder);
    };
    const resetFilters = () => {
        let newFilters = {};
        if (props.additionalFilters !== undefined) {
            newFilters = Object.assign({}, props.additionalFilters);
        }
        setFilters(newFilters);
        clearAllFilters();
    };
    const generateExcel = () => {
        const cols = props.columnOrder.reduce((acc, column) => {
            let columnName;
            if (props.specialLabels)
                columnName = props.specialLabels[column] ? f({ id: props.specialLabels[column] }) : f({ id: column });
            else
                columnName = f({ id: column });
            return Object.assign(Object.assign({}, acc), { [column]: columnName });
        }, {});
        let addFilters = {};
        if (props.xlsxAdditionalFilters) {
            let additionalFilters = props.xlsxAdditionalFilters();
            addFilters = additionalFilters.length > 0 ? { ids: additionalFilters } : {};
        }
        axios_1.default.post(props.dataUrl + currRecord + '/' + rows, { filters: Object.assign(Object.assign({}, filters), addFilters), columns: cols, excelName: props.xlsx }, { responseType: "arraybuffer" }).then((response) => {
            const blob = new Blob([response.data], { type: response.headers["content-type"] });
            (0, file_saver_1.saveAs)(blob, props.xlsx + ".xlsx");
        });
    };
    const getHeader = () => {
        return React.createElement("div", { className: "export-buttons", style: { display: "flex", justifyContent: "space-between" } },
            React.createElement("div", null,
                props.xlsx ?
                    React.createElement(button_1.Button, { type: "button", icon: "pi pi-file-excel", onClick: generateExcel, className: "p-button-success p-mr-2", "data-pr-tooltip": "XLS" })
                    : null,
                props.toggleSelect ?
                    React.createElement(button_1.Button, { type: "button", icon: "fas fa-check-square", onClick: props.toggleSelect.handler, className: "p-button-success p-mr-2", "data-pr-tooltip": "XLS" })
                    : null,
                props.headerButtons.map(el => React.createElement(button_1.Button, { type: "button", icon: el.icon, onClick: el.onClick, className: `${el.className} table-header-left-align-buttons p-mr-2` }))),
            React.createElement("div", null, props.refreshButton ?
                React.createElement(button_1.Button, { type: "button", icon: "pi pi-refresh", onClick: () => { refreshTable(); if (props.refreshButtonCallback)
                        props.refreshButtonCallback(); } })
                : null));
    };
    const handleSelection = (e) => {
        if (!Array.isArray(e.value)) {
            if (props.setSelected)
                props.setSelected(e.value);
            if (props.selectionHandler)
                props.selectionHandler(e);
            return;
        }
        const page = Math.floor(first / rows) + 1;
        const newSelectedRowsPerPage = (0, lodash_clone_1.default)(selectedRowsPerPage);
        for (let row of e.value) {
            if (Object.values(newSelectedRowsPerPage).flat().find((el) => el[props.selectionKey] === row[props.selectionKey]) === undefined) {
                if (newSelectedRowsPerPage[page] === undefined)
                    newSelectedRowsPerPage[page] = [];
                newSelectedRowsPerPage[page].push(row);
            }
        }
        const currPageElements = newSelectedRowsPerPage[page];
        const newElementsForPage = [];
        for (let row of currPageElements) {
            if (e.value.find((el) => el[props.selectionKey] === row[props.selectionKey]) !== undefined)
                newElementsForPage.push(row);
        }
        newSelectedRowsPerPage[page] = newElementsForPage;
        const newSelectedRow = Object.values(newSelectedRowsPerPage).flat();
        setSelectedRowPerPage(newSelectedRowsPerPage);
        setSelectedRow(newElementsForPage);
        if (props.selectionHandler)
            props.selectionHandler({ value: newSelectedRow });
        if (props.setSelected)
            props.setSelected(Object.values(newSelectedRowsPerPage).flat());
    };
    return React.createElement(React.Fragment, null, showTable ?
        React.createElement(React.Fragment, null,
            React.createElement("div", { className: "datatable-responsive-demo" },
                props.contextMenu ? React.createElement(contextmenu_1.ContextMenu, { model: props.contextMenu, ref: cm, onHide: () => setSelectedElement(null), appendTo: document.body }) : null,
                React.createElement(tooltip_1.Tooltip, { target: ".export-buttons>button", position: "bottom" }),
                React.createElement(datatable_1.DataTable, { rowHover: true, ref: dt, value: items, className: "p-datatable-sm p-datatable-striped p-datatable-responsive-demo", sortField: sortField, sortOrder: sortOrder, onSort: sort, paginator: true, rows: rows, selectionMode: ["single", "multiple"].includes(props.selectionMode) ? props.selectionMode : undefined, selection: selectedRow, onSelectionChange: handleSelection, dataKey: props.selectionKey, style: { marginBottom: "40px" }, emptyMessage: "No records found", tableStyle: { tableLayout: "auto" }, header: props.showHeader ? getHeader() : null, lazy: true, rowsPerPageOptions: [20, 30, 50], first: first, editMode: props.cellEditHandler === undefined ? (props.rowEditHandler === undefined ? undefined : "row") : "cell", onRowEditInit: (e) => onRowEditInit(e), onRowEditCancel: (e) => onRowEditCancel(e), onRowEditSave: (e) => props.rowEditHandler(editElement), onPage: onPage, loading: loading, onRowUnselect: props.onRowUnselect, totalRecords: totalRecords, onContextMenuSelectionChange: (e) => {
                        if (props.setSelected !== undefined && props.contextMenu) {
                            props.setSelected(e.value);
                        }
                    }, onContextMenu: e => {
                        if (props.contextMenu)
                            cm.current.show(e.originalEvent);
                    } }, columns)))
        :
            null);
};
exports.LazyDataTable = LazyDataTable;
exports.LazyDataTable.defaultProps = {
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
    refreshButton: true,
    headerButtons: []
};
