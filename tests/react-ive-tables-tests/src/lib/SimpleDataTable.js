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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleDataTable = void 0;
const React = __importStar(require("react"));
const react_intl_1 = require("react-intl");
const datatable_1 = require("primereact/datatable");
const react_1 = require("react");
const column_1 = require("primereact/column");
const button_1 = require("primereact/button");
const inputtext_1 = require("primereact/inputtext");
const contextmenu_1 = require("primereact/contextmenu");
require("./DataTable.css");
const tooltip_1 = require("primereact/tooltip");
const SimpleDataTable = (props) => {
    const { formatMessage: f } = (0, react_intl_1.useIntl)();
    const [sortField, setSortField] = (0, react_1.useState)();
    const [sortOrder, setSortOrder] = (0, react_1.useState)();
    const [items, setItems] = (0, react_1.useState)([]);
    const [rows, setRows] = (0, react_1.useState)(5);
    const [first, setFirst] = (0, react_1.useState)(0);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [columns, setColumns] = (0, react_1.useState)([]);
    const [selectedRow, setSelectedRow] = (0, react_1.useState)(null);
    const [originalItemCopy, setOriginalItemCopy] = (0, react_1.useState)([]);
    const [editElement, setEditElement] = (0, react_1.useState)([]);
    const [editingCellRows, setEditingCellRows] = (0, react_1.useState)([]);
    const [selectedElement, setSelectedElement] = (0, react_1.useState)(null);
    const cm = (0, react_1.useRef)();
    const onPage = (event) => {
        setFirst(event.first);
        setRows(event.rows);
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
    (0, react_1.useEffect)(() => {
        setItems(props.data);
    }, [props.data]);
    const sort = (e) => {
        const tempItems = JSON.parse(JSON.stringify(items));
        tempItems.sort((a, b) => comparator(e, a, b));
        props.externalDataHandler ? props.externalDataHandler(tempItems) : setItems(tempItems);
        setSortField(e.sortField);
        setSortOrder(e.sortOrder);
    };
    const onEditorValueChange = (event, eventProps) => {
        const tempObject = JSON.parse(JSON.stringify(eventProps.value[eventProps.rowIndex]));
        tempObject[eventProps.field] = event.value;
        if (event.value instanceof Date) {
            eventProps.rowData[eventProps.field] = event.value.toLocaleDateString();
        }
        else {
            eventProps.rowData[eventProps.field] = event.target.value;
        }
        setEditElement(tempObject);
        props.cellEditHandler(eventProps.field);
    };
    const createEditor = (cName, columnProps) => {
        if (props.customEditors !== undefined) {
            if (Object.keys(props.customEditors).includes(cName)) {
                return React.cloneElement(props.customEditors[cName], {
                    onChange: (e) => onEditorValueChange(e, columnProps),
                    value: columnProps.rowData[cName],
                    id: cName
                });
            }
        }
        return React.createElement(inputtext_1.InputText, { value: columnProps.rowData[columnProps.field], onChange: (e) => { onEditorValueChange(e, columnProps); }, id: cName });
    };
    const onCellEditorInit = (props) => {
        const { rowIndex: index, field, rowData, value: tableItems } = props.columnProps;
        const rowsCopy = JSON.parse(JSON.stringify(editingCellRows));
        if (editingCellRows[index] === undefined) {
            rowsCopy[index] = Object.assign({}, rowData);
        }
        rowsCopy[index][field] = tableItems[index][field];
        setEditingCellRows(rowsCopy);
    };
    const generateColumns = () => {
        let edit = props.cellEditHandler !== undefined || props.rowEditHandler !== undefined;
        if (props.data.length > 0 && props.data[0]) {
            if (columns.length === 0) {
                const tempColumns = Object.keys(props.data[0]).filter(cName => !props.ignoreColumns.includes(cName)).map((cName) => {
                    if (cName !== "id") {
                        let columnHeader;
                        columnHeader = f({ id: cName });
                        if (props.specialColumn && props.specialColumn[cName] !== undefined) {
                            return React.createElement(column_1.Column, { body: (rowData) => generateColumnBodyTemplate(cName, rowData), style: { textAlign: "center" }, key: cName, field: cName, header: columnHeader });
                        }
                        if (props.columnTemplate && props.columnTemplate[cName] !== undefined) {
                            return React.createElement(column_1.Column, { body: (rowData) => props.columnTemplate[cName](rowData), style: { textAlign: "center" }, key: cName, field: cName, header: columnHeader });
                        }
                        return React.createElement(column_1.Column, { style: { textAlign: "center" }, onEditorInit: props.cellEditHandler !== undefined && !props.ignoreEditableColumns.includes(cName) ? onCellEditorInit : undefined, editor: edit && !props.ignoreEditableColumns.includes(cName) ? (props) => createEditor(cName, props) : undefined, key: cName, field: cName, filter: props.showFilters, filterMatchMode: "contains", header: columnHeader });
                    }
                });
                if (props.selectionMode === "checkbox")
                    tempColumns.unshift(React.createElement(column_1.Column, { key: "1", selectionMode: "multiple", headerStyle: { width: '3em' } }));
                setColumns(tempColumns);
            }
        }
    };
    const generateColumnBodyTemplate = (column, rowData) => {
        return React.cloneElement(props.specialColumn[column].element, {
            onClick: (e) => props.specialColumn[column].handler(rowData)
        });
    };
    (0, react_1.useEffect)(() => {
        setItems(props.data);
    }, [props.data]);
    (0, react_1.useEffect)(() => {
        generateColumns();
    }, [props.data]);
    (0, react_1.useEffect)(() => {
        handleExternalSelection();
    }, [props.selectedIds]);
    const handleExternalSelection = () => {
        if (selectedRow !== undefined) {
            if (props.selectionMode === "multiple" || props.selectionMode === "checkbox") {
                const elements = items.filter((s) => props.selectedIds.includes(s.id));
                const copy = JSON.parse(JSON.stringify(elements));
                setSelectedRow(copy);
            }
            else {
            }
        }
        else {
            if (props.selectionMode === "multiple" || props.selectionMode === "checkbox") {
                const elements = items.filter((s) => props.selectedIds.includes(s.id));
                const copy = JSON.parse(JSON.stringify(elements));
                setSelectedRow(copy);
            }
            else {
            }
        }
    };
    const onRowEditInit = (event) => {
    };
    const handleSelection = (e) => {
        setSelectedRow(e.value);
        props.selectionHandler(e);
    };
    const exportXLSX = () => {
    };
    const header = React.createElement(React.Fragment, null,
        React.createElement("div", { className: "p-d-flex export-buttons" },
            props.xlsx ?
                React.createElement(button_1.Button, { type: "button", icon: "pi pi-file-excel", onClick: exportXLSX, className: "p-button-success p-mr-2", "data-pr-tooltip": "XLS" })
                : null,
            props.create ?
                React.createElement(button_1.Button, { type: "button", icon: "pi pi-plus", onClick: props.create, className: "p-button-primary p-mr-2", "data-pr-tooltip": f({ id: "create" }) })
                : null));
    return React.createElement(React.Fragment, null,
        props.contextMenu ? React.createElement(contextmenu_1.ContextMenu, { model: props.contextMenu, ref: cm, onHide: () => setSelectedElement(null), appendTo: document.body }) : null,
        React.createElement(tooltip_1.Tooltip, { target: ".export-buttons>button", position: "bottom" }),
        React.createElement(datatable_1.DataTable, { header: props.xlsx ? header : null, onPage: onPage, first: first, rowHover: true, value: items, selection: selectedRow, onSelectionChange: handleSelection, dataKey: "id", metaKeySelection: false, selectionMode: ["single", "multiple"].includes(props.selectionMode) ? props.selectionMode : undefined, className: "p-datatable-sm p-datatable-striped", sortField: props.sort ? sortField : undefined, sortOrder: props.sort ? sortOrder : undefined, onSort: props.sort ? sort : undefined, paginator: true, rows: rows, editMode: props.cellEditHandler === undefined ? (props.rowEditHandler === undefined ? undefined : "row") : "cell", emptyMessage: "No records found", tableStyle: { tableLayout: "auto" }, rowsPerPageOptions: [5, 10, 20], loading: loading, onRowUnselect: props.onRowUnselect, totalRecords: items.length, contextMenuSelection: selectedRow, onContextMenuSelectionChange: (e) => {
                setSelectedRow(e.value);
                if (props.setSelected !== undefined)
                    props.setSelected(e.value);
            }, onContextMenu: e => {
                if (props.contextMenu)
                    cm.current.show(e.originalEvent);
            } }, columns));
};
exports.SimpleDataTable = SimpleDataTable;
exports.SimpleDataTable.defaultProps = {
    selectionHandler: () => 0,
    selectionMode: undefined,
    onRowUnselect: undefined,
    selectedIds: [],
    ignoreEditableColumns: [],
    ignoreColumns: [],
    specialColumn: {},
    columnTemplate: undefined,
    showFilters: true,
    sort: false
};
