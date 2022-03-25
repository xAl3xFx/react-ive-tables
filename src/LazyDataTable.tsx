import * as React from 'react';
import { useIntl } from "react-intl";
import axios from 'axios'
import {FormEvent, useEffect, useRef, useState} from "react";
import {Column} from "primereact/column";
import {DataTable, DataTableSelectionModeType, DataTableSortOrderType} from "primereact/datatable";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import "./DataTable.css";
import { DTFilterElement } from "./DTFilterElement"
import { ContextMenu } from 'primereact/contextmenu';
import { Tooltip } from 'primereact/tooltip';
import moment from 'moment'
import {saveAs} from 'file-saver'
import {HeaderButton} from "../types";
import clone from 'lodash.clone';

interface Props {
    dataUrl : string,
    ignoreFilters? : string[],
    specialFilters? :  {[key: string]: {element: JSX.Element, type: string}},
    specialLabels? : {[key: string]: string;},
    additionalFilters? : {[key: string]: any;},
    showFilters? : boolean,
    showHeader? : boolean,
    setSelected? : (e : any) => void,
    contextMenu? : Object[],
    refresher? : number,
    rowEditHandler? : (element: Object) => void,
    cellEditHandler? : () => void,
    customEditors? : {[key: string] : JSX.Element},
    selectionHandler?: (e: any) => void,
    selectionMode?: DataTableSelectionModeType | undefined,
    selectionKey?: string,
    onRowUnselect?: (e:any) => void,
    selectedIds?: string[],
    specialColumn? : {[key:string]: {element: JSX.Element, handler: (rowData: any) => void}},
    columnTemplate? : {[key:string]: (rowData:any) => any},
    columnOrder : string[],
    xlsx? : string,
    refreshButton?: boolean,
    refreshButtonCallback? : () => void,
    formatDateToLocal?: boolean,
    toggleSelect? :{toggle: boolean, handler: () => void},
    xlsxAdditionalFilters? : () => Object[],
    onFiltersUpdated?: any,
    headerButtons? : HeaderButton[]
}

export const LazyDataTable :  React.FC<Props> = (props) => {
    const {formatMessage : f} = useIntl();

    const [items, setItems] = useState<any>([]);
    const [filters, setFilters] = useState<any>({});
    const [filterElements, setFilterElements] = useState<any>([]);
    const [columns, setColumns] = useState<any>([]);
    const [rows, setRows] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currRecord, setCurrRecord] = useState(0);
    const [originalItemCopy, setOriginalItemCopy] = useState<Object[]>([]);
    const [editElement, setEditElement] = useState<{[key:string]: string|number}>({});
    const [sortField, setSortField] = useState<string>();
    const [sortOrder, setSortOrder] = useState<DataTableSortOrderType>();
    const [showTable, setShowTable] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>();
    const [selectedRowsPerPage, setSelectedRowPerPage] = useState<any>({});
    const [refresher, setRefresher] = useState<number>();
    const [selectedElement, setSelectedElement] = useState(null);
    // const [selectionMode, setSelectionMode] = useState<any>();
    const cm = useRef<any>();
    const dt = useRef<any>();

    const onPage = (e: {first: number, rows: number}) => {
        setLoading(true);
        axios.post(props.dataUrl + e.first + '/' + e.rows, {filters}).then((response : any) => {
            setFirst(e.first);
            setRows(e.rows);
            const page = Math.floor(e.first / e.rows) + 1;
            setSelectedRow(selectedRowsPerPage[page] || []);
            const newData = parseDates(response.data.rows);
            setItems(newData);
            setLoading(false);
            setCurrRecord(e.first);
        })
    };

    const parseDates = (data:any) => {
        return data.map((row:any) => {
            Object.keys(row).map(key => {
                if(key.indexOf("date") !== -1 || key.toLocaleLowerCase().indexOf("period") !== -1 || key.toLocaleLowerCase().indexOf("timestamp") !== -1 || key.toLowerCase().indexOf("valor") !== -1 || key.toLowerCase().indexOf("createdat") !== -1){
                    if(props.formatDateToLocal){
                        row[key] = moment(row[key]).local().format('YYYY-MM-DD HH:mm:ss');
                    }else{
                        row[key] = moment.utc(row[key]).format('YYYY-MM-DD HH:mm:ss');
                    }
                }
            });
            return row;
        })
    };

    const loadData = () => {
        axios.post(props.dataUrl + currRecord + '/' + rows, {filters}).then((response : any) => {
            const newData = parseDates(response.data.rows);
            setItems(newData);
            setTotalRecords(response.data.count);
            setShowTable(response.data.count > 0 || props.columnOrder !== undefined);
            setLoading(false);
        }).catch(err => 0)
    };

    const refreshTable = () => {
        setLoading(true);
        loadData();
    }

    useEffect(() => {
        const tempFilters = { ...filters, ...props.additionalFilters};
        //Update filters only if the additional filters differ from the previous filters
        if(props.additionalFilters !== undefined)
            if(JSON.stringify(tempFilters) !== JSON.stringify(filters))
                setFilters({ ...filters, ...props.additionalFilters});
        // else if(props.refresher)¡
        //     loadData();
    }, [props.additionalFilters]);

    useEffect(() => {
        if(props.refresher !== refresher)
            setRefresher(props.refresher);
    }, [props.refresher]);
    //, filters, props.refresher]);

    useEffect(() => {
        if(props.additionalFilters && Object.keys(filters).length === 0)
            return
        loadData();
        if(props.onFiltersUpdated) props.onFiltersUpdated(filters);
    }, [filters, refresher]);

    const onModelFilterChange = (event: {target: {value: string, name: string}}) => {
        // const newFilters = {...filters};
        // newFilters[event.target.name] = event.target.value;
        setFilters((prevFilters : any) => ({...prevFilters, [event.target.name]: event.target.value}));
    };

    useEffect(() => {
        generateColumns();
    }, [props.toggleSelect])


    const generateFilterElement = (cName : string, isSpecial : boolean) => {
        if(isSpecial){
            const element = <DTFilterElement isDefault={!isSpecial} cName={cName} element={props.specialFilters![cName].element} type={props.specialFilters![cName].type} onChange={onModelFilterChange} />;
            const filterElementsTemp = [...filterElements];
            filterElementsTemp.push(element);
            setFilterElements(filterElementsTemp);
            return element;
        } else{
            const input = <InputText />;
            const element = <DTFilterElement isDefault={!isSpecial} cName={cName} type={"input"} element={input} onChange={onModelFilterChange} />;
            const filterElementsTemp = [...filterElements];
            filterElementsTemp.push(element);
            setFilterElements(filterElementsTemp);
            return element;
        }
    };

    const createEditor = (cName : string, columnProps: any) : any => {
        if(props.customEditors !== undefined) {
            //@ts-ignore
            if (Object.keys(props.customEditors!).includes(cName)) {
                return React.cloneElement(props.customEditors![cName], {
                    onChange: (e: FormEvent) => onEditorValueChange(e, columnProps),
                    value: columnProps.rowData[columnProps.field],
                    id: cName
                })
            }
        }
        return <InputText value={columnProps.rowData[columnProps.field]} onChange={(e) => {onEditorValueChange(e, columnProps)}} id={cName}/>
    };

    const onEditorValueChange = (event : any, eventProps: any) => {
        let tempObject = {...eventProps.value[eventProps.rowIndex]};
        tempObject[eventProps.field] = event.target.value;
        eventProps.rowData[eventProps.field] = event.target.value;

        setEditElement(tempObject);
    };

    const createInputForFilter = (cName: string) => {
        if(props.specialFilters !== undefined){
            //@ts-ignore
            if(Object.keys(props.specialFilters).includes(cName)){
                return <React.Fragment>
                    {generateFilterElement(cName, true)}
                </React.Fragment>
            }else{
                return generateFilterElement(cName, false);
            }
        }else{
            // DTFiltersManager.helper1();
            // return <Dropdown options={[{key: 1, value:1, label: "True"},{key: 0 , value: 0, label: "False"}]} style={{ width: '100%' }} value={value} id={cName} onChange={onModelFilterChange} />;
            // return <DTFilterElement />
            return generateFilterElement(cName, false);
        }
    };

    // useEffect( () => {
    //     if(showTable)
    //         generateColumns();
    // }, [items]);

    useEffect( () => {
        if(showTable)
            generateColumns();
    }, [showTable]);


    useEffect(() => {
        handleExternalSelection();
    }, [props.selectedIds]);

    const handleExternalSelection = () => {
        if(selectedRow !== undefined){
            if(props.selectionMode === "multiple" || props.selectionMode === "checkbox"){
                //@ts-ignore
                const elements = items.filter((s:any) => props.selectedIds!.includes(s.id));
                const copy = clone(elements);
                setSelectedRow(copy);
            }else{
                //TODO implement logic for external management of selectedRow when single selection mode is being used
            }
        }else{
            if(props.selectionMode === "multiple" || props.selectionMode === "checkbox"){
                //@ts-ignore
                const elements = items.filter((s:any) => props.selectedIds!.includes(s.id));
                const copy = clone(elements);
                setSelectedRow(copy);
            }else{
                //TODO implement logic for external management of selectedRow when single selection mode is being used
            }
        }
    };

    const onRowEditInit = (event : { originalEvent: Event; data: any; index: number; }) => {
        let temp = JSON.stringify(items[event.index]);
        setOriginalItemCopy(JSON.parse(temp));
        // let tempObject : {[key:string] : string|number} = {};
        // Object.keys(event.data).forEach(key => {
        //     tempObject[key] = "";
        // })
        setEditElement(items[event.index]);
    };

    const onRowEditCancel = (event : { originalEvent: Event; data: any; index: number; }) => {
        let tempItems = clone(items);
        tempItems[event.index] = originalItemCopy;
        setItems(tempItems);
    };

    const generateColumns = () => {
        let edit = props.cellEditHandler !== undefined || props.rowEditHandler !== undefined;
        if (items.length > 0 && items[0] || props.columnOrder) {
            if (columns.length === 0 || (props.toggleSelect && props.toggleSelect.toggle)) {
                let filterValues = {...filters};

                const tempColumns = (props.columnOrder ? props.columnOrder : Object.keys(items[0])).map((cName : string) => {
                    filterValues = {...filterValues, ...{[cName]: ''}};

                    let columnHeader;
                    if (props.specialLabels !== undefined) {
                        //@ts-ignore
                        if (Object.keys(props.specialLabels).includes(cName)) {
                            columnHeader =  f({id: props.specialLabels[cName]});
                        } else {
                            columnHeader = f({id: cName});
                        }
                    } else {
                        columnHeader = f({id: cName});
                    }
                    //TO BE TESTED
                    // If there are specialColumns passed, for each of them we create a column with a body, generated from the templating function, which copies the element sent from the parent as prop
                    if(props.specialColumn && props.specialColumn[cName] !== undefined) {
                        return <Column body={(rowData: any) => generateColumnBodyTemplate(cName, rowData)} style={{textAlign: "center"}} key={cName} field={cName}  header={columnHeader} />
                    }
                    if(props.columnTemplate && props.columnTemplate[cName] !== undefined) {
                        return <Column body={(rowData:any) => props.columnTemplate![cName](rowData)} style={{textAlign: "center"}} filter={(props.specialFilters && props.specialFilters[cName]) ? true : false} filterElement={(props.specialFilters && props.specialFilters[cName]) ? createInputForFilter(cName) : undefined} key={cName} field={cName}  header={columnHeader} />
                    }
                    //@ts-ignore
                    return <Column style={{textAlign: "center"}} key={cName} field={cName} editor={edit ? (props) => createEditor(cName, props) : undefined} header={columnHeader} filter={props.showFilters ? (!props.ignoreFilters!.includes(cName)) : false} filterElement={props.showFilters ? (props.ignoreFilters!.includes(cName) ? undefined : createInputForFilter(cName)) : undefined} />
                    //return <Column key={cName} field={cName} editor={props.editable ? (props) => editorForRowEditing(props, 'color') : null} filter={props.showFilters ? (!props.ignoreFilters.includes(cName)) : false} filterElement={props.showFilters ? (props.ignoreFilters.includes(cName) ? null : createInputForFilter(cName)) : null} header={columnHeader}/>
                });
                if(props.rowEditHandler !== undefined)
                    tempColumns.push(<Column rowEditor headerStyle={{width: '7rem'}} bodyStyle={{textAlign: 'center'}}/>);
                if(props.selectionMode === "checkbox")
                    tempColumns.unshift(<Column key="checkbox" selectionMode="multiple" headerStyle={{width: '3em'}} />);
                setColumns(tempColumns);
            } else if(props.toggleSelect) {
                const firstColumn = columns[0];
                if(firstColumn.key && firstColumn.key === "checkbox") {        
                    setColumns(columns.splice(1));
                }
            }
        }
    };

    const clearAllFilters = () => {
        if(document.getElementsByClassName("p-datatable-thead")[0] !== undefined){
            let columnsCount = document.getElementsByClassName("p-datatable-thead")[0].querySelector("tr")!.cells.length;
            for(let i=0; i < columnsCount; i++){
                if(document.getElementsByClassName("p-datatable-thead")[0].querySelector("tr")!.cells[i].childNodes[1] !== undefined)
                    document.getElementsByClassName("p-datatable-thead")[0].querySelector("tr")!.cells[i].childNodes[1].nodeValue = "";
            }
        }
    };

    //TO BE TESTED
    const generateColumnBodyTemplate = (column: string , rowData: any) => {
        return React.cloneElement(props.specialColumn![column].element, {
            onClick: (e: any) => props.specialColumn![column].handler(rowData)
        })
    }

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

    const sort = (e: any) =>{

        const tempItems = clone(items);
        tempItems.sort((a:string, b:string) => comparator(e,a,b));

        setItems(tempItems);
        setSortField(e.sortField);
        setSortOrder(e.sortOrder);
    };

    const resetFilters = () => {
        let newFilters = {};
        if(props.additionalFilters !== undefined){
            newFilters = {...props.additionalFilters};
        }
        setFilters(newFilters);
        // childRef.current!.clearFilter();
        clearAllFilters();
    };

    const generateExcel = () => {
        const cols = props.columnOrder.reduce((acc, column) => {
            let columnName;
            if(props.specialLabels)
                columnName = props.specialLabels[column] ? f({id: props.specialLabels[column]}) : f({id: column});
            else
                columnName = f({id: column});
            return {...acc, [column] : columnName}
        }, {});

        let addFilters = {};
        if(props.xlsxAdditionalFilters) {
            let additionalFilters = props.xlsxAdditionalFilters();
            addFilters = additionalFilters.length > 0 ? {ids: additionalFilters} : {};
        }

        axios.post(props.dataUrl + currRecord + '/' + rows, {filters: {...filters, ...addFilters}, columns: cols, excelName : props.xlsx}, {responseType: "arraybuffer"}).then((response : any) => {
            const blob = new Blob([response.data], {type:  response.headers["content-type"]});
            saveAs(blob, props.xlsx + ".xlsx");
        });
    };

    const getHeader = () => {
        return <div className="export-buttons" style={{display: "flex", justifyContent: "space-between"}}>
            <div>
                {props.xlsx ?
                    <Button type="button" icon="pi pi-file-excel" onClick={generateExcel} className="p-button-success p-mr-2" data-pr-tooltip="XLS" />
                    : null
                }
                {props.toggleSelect ?
                    <Button type="button" icon="fas fa-check-square" onClick={props.toggleSelect.handler} className="p-button-success p-mr-2" data-pr-tooltip="XLS" />
                    : null
                }
                {
                    props.headerButtons!.map(el => <Button type="button" icon={el.icon} onClick={el.onClick} className={`${el.className} table-header-left-align-buttons p-mr-2`} />)
                }
            </div>
            <div>
                {props.refreshButton ?
                    <Button type="button" icon="pi pi-refresh" onClick={() => {refreshTable(); if(props.refreshButtonCallback) props.refreshButtonCallback()}}/>
                    : null
                }
            </div>
        </div>
        // return props.showHeader ? <Button type="button" style={{marginLeft: "15px"}} icon="pi pi-external-link" iconPos="left" label={f({id: "clearFilters"})} onClick={resetFilters} /> : null;
    };

    const handleSelection = (e: any) => {
        if(!Array.isArray(e.value)){
            if(props.setSelected) props.setSelected(e.value)
            if(props.selectionHandler) props.selectionHandler(e);
            return;
        }
        const page = Math.floor(first / rows) + 1;
        const newSelectedRowsPerPage = clone(selectedRowsPerPage);
        //Add elems
        for(let row of e.value){
            //@ts-ignore
            if(Object.values(newSelectedRowsPerPage).flat().find((el : any) => el[props.selectionKey!] === row[props.selectionKey!]) === undefined){
                if(newSelectedRowsPerPage[page] === undefined)
                    newSelectedRowsPerPage[page] = [];
                newSelectedRowsPerPage[page].push(row);
            }
        }

        //Remove elems
        const currPageElements = newSelectedRowsPerPage[page];
        const newElementsForPage = [];
        for(let row of currPageElements){
            if(e.value.find((el : any) => el[props.selectionKey!] === row[props.selectionKey!]) !== undefined)
                newElementsForPage.push(row)
        }
        newSelectedRowsPerPage[page] = newElementsForPage;


        //@ts-ignore
        const newSelectedRow = Object.values(newSelectedRowsPerPage).flat();

        setSelectedRowPerPage(newSelectedRowsPerPage)
        setSelectedRow(newElementsForPage);

        if(props.selectionHandler) props.selectionHandler({value : newSelectedRow});
        //@ts-ignore
        if(props.setSelected) props.setSelected(Object.values(newSelectedRowsPerPage).flat());

    };

    return <>
        {showTable ?
            <>
                <div className="datatable-responsive-demo">
                    {props.contextMenu ? <ContextMenu model={props.contextMenu} ref={cm} onHide={() => setSelectedElement(null)} appendTo={document.body} /> : null}
                    <Tooltip target=".export-buttons>button" position="bottom" />

                    <DataTable
                        rowHover

                        //editMode={"row"} rowEditorValidator={props.onRowEditorValidator} onRowEditInit={props.onRowEditInit} onRowEditSave={props.onRowEditSave} onRowEditCancel={props.onRowEditCancel}
                        //footerColumnGroup={props.subTotals ? buildSubTotals() : null}
                        ref={dt}
                        value={items}
                        className="p-datatable-sm p-datatable-striped p-datatable-responsive-demo"
                        // sortField={sortField} sortOrder={sortOrder} onSort={ (e : any) => {setLoading(true); setTimeout(() => {setSortField(e.sortField); setSortOrder(e.sortOrder)}, 0)}}
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={sort}
                        paginator={true}
                        rows={rows}
                        //@ts-ignore
                        selectionMode={["single", "multiple"].includes(props.selectionMode!) ? props.selectionMode : undefined}
                        // selectionMode={undefined}
                        selection={selectedRow}
                        onSelectionChange={handleSelection}
                        dataKey={props.selectionKey}
                        style={{marginBottom: "40px"}}
                        emptyMessage="No records found"
                        tableStyle={{tableLayout: "auto"}}
                        header={props.showHeader ? getHeader() : null}
                        lazy={true}
                        rowsPerPageOptions={[20, 30, 50]}
                        //onLazyLoad={onLazyLoad}
                        first={first}
                        editMode={props.cellEditHandler === undefined ? (props.rowEditHandler === undefined ? undefined : "row") : "cell"}
                        onRowEditInit={(e:any) => onRowEditInit(e)}
                        onRowEditCancel={(e:any) => onRowEditCancel(e)}
                        onRowEditSave={(e) => props.rowEditHandler!(editElement!)}
                        onPage={onPage}
                        loading={loading}
                        // lazy={true}
                        onRowUnselect={props.onRowUnselect}
                        totalRecords={totalRecords}
                        onContextMenuSelectionChange={(e:any) => {
                            //set{selectedRow: e.value});

                            if (props.setSelected !== undefined && props.contextMenu){
                                props.setSelected(e.value);
                            }
                        }}
                        onContextMenu={e => {
                            //if(items[0].id !== null)
                            if(props.contextMenu)
                                cm.current!.show(e.originalEvent)
                        }}>
                        {columns}

                    </DataTable>
                </div>
            </>
            :
            null
        }

    </>
};

LazyDataTable.defaultProps = {
    showFilters: true,
    ignoreFilters: [],
    showHeader: true,
    selectionMode: undefined,
    selectionHandler: () => 0,
    onRowUnselect : undefined,
    selectedIds: [],
    columnTemplate: undefined,
    columnOrder: undefined,
    selectionKey: "id",
    formatDateToLocal: true,
    refreshButton: true,
    headerButtons: []
}




