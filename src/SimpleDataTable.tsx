import * as React from 'react';
import {injectIntl, useIntl } from "react-intl";
import {DataTable, DataTableSelectionModeType, DataTableSortOrderType} from "primereact/datatable";
import {useEffect, useRef, useState} from "react";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {FormEvent} from "react";
import {InputText} from "primereact/inputtext";
import { ContextMenu } from 'primereact/contextmenu';
import "./DataTable.css"
import {useContext} from "react";
import { MenuItem } from 'primereact/menuitem/menuitem';
import { Tooltip } from 'primereact/tooltip';
import moment from "moment";

interface Props{
    data: any,
    setSelected :(e:any) => void,
    // checkboxSelect : boolean;
    rowEditHandler? : (element: Object) => void,
    cellEditHandler? : (e : any) => void,
    customEditors? : {[key: string] : JSX.Element},
    selectionHandler?: (e: any) => void,
    selectionMode?: DataTableSelectionModeType | undefined,
    showFilters? : boolean,
    onRowUnselect?: (e:any) => void,
    selectedIds?: string[],
    specialColumn? : {[key:string]: {element: JSX.Element, handler: (rowData: any) => void}},
    ignoreEditableColumns? : string[]
    externalDataHandler? : (e: any[]) => void
    contextMenu? : MenuItem[],
    xlsx? : string,
    ignoreColumns? : string[],
    columnTemplate? : {[key:string]: (rowData:any) => any},
    create? : () => void,
    sort? : boolean
}

export const SimpleDataTable :  React.FC<Props> = (props) => {
    // const toastContext = useContext(ToastContext);
    const {formatMessage : f} = useIntl();

    const [sortField, setSortField] = useState<string>();
    const [sortOrder, setSortOrder] = useState<DataTableSortOrderType>();
    const [items, setItems] = useState([]);
    const [rows, setRows] = useState(5);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState<any>([]);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [originalItemCopy, setOriginalItemCopy] = useState<Object[]>([]);
    const [editElement, setEditElement] = useState<any>([]);
    const [editingCellRows, setEditingCellRows] = useState<any>([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const cm = useRef<any>();

    const onPage = (event : any) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const comparator = (e: any, a: any, b: any) => {

        if(!a[e.sortField])
            return -1*e.sortOrder
        if(!b[e.sortField])
            return e.sortOrder;

        var nameA = a[e.sortField].toUpperCase();
        var nameB = b[e.sortField].toUpperCase();
        if (nameA < nameB) {
            return -1*e.sortOrder;
        }
        if (nameA > nameB) {
            return e.sortOrder;
        }

        // names must be equal
        return 0;
    };

    useEffect(() => {
        setItems(props.data);
    }, [props.data]);

    const sort = (e: any) =>{

        const tempItems = JSON.parse(JSON.stringify(items));
        tempItems.sort((a:string, b:string) => comparator(e,a,b));

        props.externalDataHandler ? props.externalDataHandler(tempItems) : setItems(tempItems);
        setSortField(e.sortField);
        setSortOrder(e.sortOrder);
    };

    const onEditorValueChange = (event : any, eventProps: any) => {
        const tempObject = JSON.parse(JSON.stringify(eventProps.value[eventProps.rowIndex]))
        // let tempObject = {...eventProps.value[eventProps.rowIndex]};
        tempObject[eventProps.field] = event.value;
        if(event.value instanceof Date){
            eventProps.rowData[eventProps.field] = event.value.toLocaleDateString();
        }else{
            eventProps.rowData[eventProps.field] = event.target.value;
        }
        setEditElement(tempObject);

        props.cellEditHandler!(eventProps.field);

    };

    const  createEditor = (cName : string, columnProps: any) : any => {
        if(props.customEditors !== undefined) {
            if (Object.keys(props.customEditors!).includes(cName)) {
                return React.cloneElement(props.customEditors![cName], {
                    onChange: (e: FormEvent) => onEditorValueChange(e, columnProps),
                    value: columnProps.rowData[cName],
                    id: cName
                })
            }
        }

        return <InputText value={columnProps.rowData[columnProps.field]} onChange={(e) => {onEditorValueChange(e, columnProps)}} id={cName}/>
    };

    const onCellEditorInit = (props: any) => {

        const { rowIndex: index, field, rowData, value : tableItems } = props.columnProps;
        const rowsCopy = JSON.parse(JSON.stringify(editingCellRows));
        if (editingCellRows[index] === undefined) {
            rowsCopy[index] = {...rowData};
        }


        rowsCopy[index][field] = tableItems[index][field];
        setEditingCellRows(rowsCopy);
    };

    const generateColumns = () => {


        let edit = props.cellEditHandler !== undefined || props.rowEditHandler !== undefined;

        if (props.data.length > 0 && props.data[0]) {
            if (columns.length === 0) {
                const tempColumns = Object.keys(props.data[0]).filter(cName => !props.ignoreColumns!.includes(cName)).map((cName : string)=> {
                    if(cName !== "id"){
                        let columnHeader;
                        columnHeader = f({id: cName});
                        // If there are specialColumns passed, for each of them we create a column with a body, generated from the templating function, which copies the element sent from the parent as prop
                        if(props.specialColumn && props.specialColumn[cName] !== undefined) {
                            return <Column body={(rowData: any) => generateColumnBodyTemplate(cName, rowData)} style={{textAlign: "center"}} key={cName} field={cName}  header={columnHeader} />
                        }
                        if(props.columnTemplate && props.columnTemplate[cName] !== undefined) {
                            return <Column body={(rowData:any) => props.columnTemplate![cName](rowData)} style={{textAlign: "center"}} key={cName} field={cName}  header={columnHeader} />
                        }
                        //@ts-ignore
                        return <Column style={{textAlign: "center"}} onEditorInit={props.cellEditHandler !== undefined && !props.ignoreEditableColumns!.includes(cName) ? onCellEditorInit : undefined}
                                       editor={edit && !props.ignoreEditableColumns!.includes(cName) ? (props) => createEditor(cName, props) : undefined} key={cName} field={cName} filter={props.showFilters}  filterMatchMode="contains" header={columnHeader} />
                    }
                });
                //Create column if special column prop is passed
                // if(props.specialColumn !== undefined) {
                //     Object.keys(props.specialColumn).forEach((key:string, index: number) => tempColumns.push(<Column key={index + 2} field={key} header={f({id: key})} />))
                //     // tempColumns.unshift(<Column key={"2"} body={generateSpecialColumn} />)
                // }

                //Create first column with checkbox select
                if(props.selectionMode === "checkbox")
                    tempColumns.unshift(<Column key={"1"} selectionMode="multiple" headerStyle={{width: '3em'}}/>);

                setColumns(tempColumns);
            }
        }
    };

    const generateColumnBodyTemplate = (column: string , rowData: any) => {
        return React.cloneElement(props.specialColumn![column].element, {
            onClick: (e: any) => props.specialColumn![column].handler(rowData)
        })
    };

    useEffect(() => {
        setItems(props.data);
    }, [props.data]);

    useEffect(() => {
        generateColumns();
    }, [props.data]);

    useEffect(() => {
        handleExternalSelection();
    }, [props.selectedIds]);

    const handleExternalSelection = () => {
        if(selectedRow !== undefined){
            if(props.selectionMode === "multiple" || props.selectionMode === "checkbox"){
                const elements = items.filter((s:any) => props.selectedIds!.includes(s.id));
                const copy = JSON.parse(JSON.stringify(elements));
                setSelectedRow(copy);
            }else{
                //TODO implement logic for external management of selectedRow when single selection mode is being used
            }
        }else{
            if(props.selectionMode === "multiple" || props.selectionMode === "checkbox"){
                
                const elements = items.filter((s:any) => props.selectedIds!.includes(s.id));
                const copy = JSON.parse(JSON.stringify(elements));
                setSelectedRow(copy);
            }else{
                //TODO implement logic for external management of selectedRow when single selection mode is being used
            }
        }
    };

    const onRowEditInit = (event : { originalEvent: Event; data: any; index: number; }) => {
        // let temp = JSON.stringify(items[event.index]);
        // setOriginalItemCopy(JSON.parse(temp));
        // // let tempObject : {[key:string] : string|number} = {};
        // // Object.keys(event.data).forEach(key => {
        // //     tempObject[key] = "";
        // // })
        // setEditElement(items[event.index]);
    };



    const handleSelection = (e: {value: any}) => {
        setSelectedRow(e.value);
        props.selectionHandler!(e);
    };

    const exportXLSX = () => {
        // if(items.length === 0) return;
        // const columns = Object.keys(items[0]).filter(el => !props.ignoreColumns!.includes(el) && !props.specialColumn![el]).map(el => {
        //     return {"label": f({id: el}), "value" : el}
        // });
        //
        // const dateFormated = moment().format('YYYY-MM-DD HH:mm')
        //
        // var settings = {
        //     sheetName: props.xlsx, // The name of the sheet
        //     fileName: props.xlsx + " " + dateFormated, // The name of the spreadsheet
        //     extraLength: 3, // A bigger number means that columns should be wider
        //     writeOptions: {} // Style options from https://github.com/SheetJS/sheetjs#writing-options
        // };
        // const download = true;
        // xlsx(columns, items, settings, download)
    } ;

    const header = <>
        <div className="p-d-flex export-buttons">
            {props.xlsx ?
                <Button type="button" icon="pi pi-file-excel" onClick={exportXLSX} className="p-button-success p-mr-2" data-pr-tooltip="XLS" />
                : null
            }
            {props.create ?
                <Button type="button" icon="pi pi-plus" onClick={props.create} className="p-button-primary p-mr-2" data-pr-tooltip={f({id: "create"})}/>
                : null
            }
        </div>
    </>

    return <>

        {props.contextMenu ? <ContextMenu model={props.contextMenu} ref={cm} onHide={() => setSelectedElement(null)} appendTo={document.body} /> : null}
        <Tooltip target=".export-buttons>button" position="bottom" />

        <DataTable
            header={props.xlsx ? header : null}
            onPage={onPage}
            first={first}
            rowHover
            value={items}
            selection={selectedRow}
            onSelectionChange={handleSelection}
            dataKey="id"
            metaKeySelection={false}
            selectionMode={["single", "multiple"].includes(props.selectionMode!) ? props.selectionMode : undefined}
            className="p-datatable-sm p-datatable-striped"
            sortField={props.sort ? sortField : undefined}
            sortOrder={props.sort ? sortOrder : undefined}
            onSort={props.sort ? sort : undefined}
            paginator
            rows={rows}
            editMode={props.cellEditHandler === undefined ? (props.rowEditHandler === undefined ? undefined : "row") : "cell"}
            // onRowEditInit={(e) => onRowEditInit(e)}

            emptyMessage="No records found"
            tableStyle={{tableLayout: "auto"}}
            rowsPerPageOptions={[5, 10, 20]}
            loading={loading}
            onRowUnselect={props.onRowUnselect}
            totalRecords={items.length}
            contextMenuSelection={selectedRow}
            //rowClassName={props.rowClassName}
            onContextMenuSelectionChange={(e:any) => {
                //set{selectedRow: e.value});

                setSelectedRow(e.value);
                if (props.setSelected !== undefined)
                    props.setSelected(e.value);
            }}
            onContextMenu={e => {
                if(props.contextMenu)
                    cm.current!.show(e.originalEvent)
                // if(items[0].id !== null)
                // cm.show(e.originalEvent)
            }}>
            {columns}
        </DataTable>
    </>
};

SimpleDataTable.defaultProps = {
    selectionHandler: () => 0,
    selectionMode: undefined,
    onRowUnselect : undefined,
    selectedIds: [],
    ignoreEditableColumns: [],
    ignoreColumns: [],
    specialColumn: {},
    columnTemplate: undefined,
    showFilters: true,
    sort: false
};
