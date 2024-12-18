import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import customers from "../lib/customers.json"
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {Customer} from "./types";
import {InputText} from "primereact/inputtext";
import {ColumnGroup} from "primereact/columngroup";
import {Row} from "primereact/row";
import {OverlayPanel} from "primereact/overlaypanel";
import {ReactiveTable} from "react-ive-tables"

interface IDropdownOption {
    key: number;
    id: number;
    description: string;
}

export interface Test {
    verified: boolean
}

export const ManyColumns = () => {
    const [selected, setSelected] = useState();
    const [resetter, setResetter] = useState(0);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filters, setFilters] = useState<any>({activity: '80'});
    const [data, setData] = useState<Customer[]>()
    const [companyFilter, setCompanyFilter] = useState('');
    const [nameFilter, setNameFilter] = useState('J');
    const [balanceFilter, setBalanceFilter] = useState('');
    const dtRef = useRef<any>(null);
    const [filtered, setFiltered] = useState<any>();
    const [activityOptions, setActivityOptions] = useState<IDropdownOption[]>();
    const [rebuildColumns, setRebuildColumns] = useState(0);
    const [resetFilters, setResetFilters] = useState<number>();
    const [selectedOperation, setSelectedOperation] = useState<any>();

    const overlayRef = useRef<OverlayPanel>(null);

    const menuModel = [
        {label: "Add", icon: 'pi pi-plus', command: () => 0},
    ]

    const dbClickCb = (e: any) => {
        console.log("DOUBLE CLICKED!", selected);
    }

    const addSelectedIds = () => setSelectedIds([1000, 1001])

    const handleSelection = (e: any) => {
    }

    useEffect(() => {
        // getData().then(setData);
        const addedOptions: number[] = [];
        const activityOptions = customers.data.slice(0, 30).reduce((acc: any, el: Customer) => {
            if (addedOptions.includes(el.activity)) {
                return acc;
            } else {
                addedOptions.push(el.activity);
                acc.push({
                    id: el.activity,
                    key: el.activity,
                    description: 'Activity ' + el.activity
                })
                return acc;
            }
        }, []);
        setActivityOptions(activityOptions)
        setRebuildColumns(new Date().getTime());
        setTimeout(() => {
            setData(customers.data.slice(0, 30))
        }, 1000)
    }, []);

    useEffect(() => {
        if (!selectedOperation) return;
        handleSelectionFromOperation();
    }, [selectedOperation])

    const handleSelectionFromOperation = () => {
        console.log(selected);
        setSelectedOperation(undefined);
    }


    const addToTable = () => {
        setData(customers.data.slice(0, 15));
    }

    const onFilterCb = (data: any) => console.log(data);

    const statuses = [{value: 1, label: 'unqualified'}, {value: 2, label: 'proposal'}]

    const optionsTemplate = (rowData: any) => {
        return <span>
            <Button className={'p-mr-2'} icon={'pi pi-trash'}/>
        </span>
    }

    const getSpecialFilters = () => {
        return {
            verified: (options: any) => <Dropdown filter={true} showClear value={options.value}
                                                  options={[{value: true, label: "Yes"}]}
                                                  onChange={(e) => options.filterApplyCallback(e.value)}
                                                  style={{textAlign: "left"}}/>,

        }
    }

    const getExternalFilters = () => {
        return {
            test: (rowData: any, filterValue: string) => {
                return rowData.company.toLowerCase().includes(filterValue.toLowerCase()) || rowData.status.toLowerCase().includes(filterValue.toLowerCase());
            }
        }
    }

    const footerTemplate = () => {
        return <div className={"p-grid p-fluid p-justify-center"} style={{margin: "2rem"}}>
            <a>{"SHOW MORE!!"}</a>
        </div>
    }

    const getData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(customers.data.slice(0, 10));
            }, 1000);
        })
    }

    const getColumnTemplate = () => {
        return {
            verified: (rowData: Customer) => (rowData.verified ? "Yes" : "No") as any,
            // operations: (rowData: any, columnOptions: ColumnBodyOptions) => {
            //     const editButton = columnOptions.rowEditor && !columnOptions.rowEditor.editing ?
            //         <Button icon={'pi pi-pencil'} onClick={columnOptions.rowEditor?.onInitClick}/> : null;
            //     const saveButton = columnOptions.rowEditor && columnOptions.rowEditor.editing ?
            //         <Button icon={'pi pi-check'} onClick={columnOptions.rowEditor?.onSaveClick}/> : null;
            //     const cancelButton = columnOptions.rowEditor && columnOptions.rowEditor.editing ?
            //         <Button icon={'pi pi-times'} onClick={columnOptions.rowEditor?.onCancelClick}/> : null;
            //     const overlayButton = <Button icon={'pi pi-save'} onClick={(e) => overlayRef.current?.toggle(e)}/>
            //
            //     return <>
            //         {editButton}
            //         {saveButton}
            //         {cancelButton}
            //         {overlayButton}
            //     </>
            // },
            // activity: (rowData: any, options: ColumnBodyOptions) => activityOptions ? (activityOptions.find(el => el.id === rowData.activity)?.description || rowData.activity) : rowData.activity
        }
    }

    const handleOnFilterCallback = (rowData: any) => {
        console.log(rowData);
        setFiltered(rowData)
    }

    const footerGroup = <ColumnGroup>
        <Row>
            {/*<Column*/}
            {/*    footer={filtered?.reduce((a, b) => a + b.balance, 0).toFixed(2) + '.'}*/}
            {/*    footerStyle={{textAlign: 'center', fontWeight: 'bold'}}/>*/}
            {/*<Column colSpan={3}/>*/}
        </Row>
    </ColumnGroup>;

    const statusOptions = [
        {key: 1, value: true, label: "yes"},
        {key: 2, value: false, label: "no"}
    ]

    const getSpecialEditors = () => {
        return {
            verified: (options: any) => <Dropdown value={options.value} options={statusOptions}
                                                  onChange={(e) => options.editorCallback(e.value)}/>
        }
    }

    const getColumnOrder = () => {
        // 'balance', 'name', 'verified', 'activity', 'operations'
        const ignoreColumns = ["id", "country", "company", "date", "status", "representative"];
        if (data && data.length > 0 && data[0]) {
            console.log(Object.keys(data[0]).filter(el => !ignoreColumns.includes(el)))
            return Object.keys(data[0]).filter(el => !ignoreColumns.includes(el));
        }
        return [];
    }

    return <>
        <Button label={"Reset selection"} onClick={() => setResetter(new Date().getTime())}/>
        <Button label={"Add selectedIDs"} onClick={addSelectedIds}/>
        <Button label={"Add records"} onClick={addToTable}/>
        <Button label={"Filter"} onClick={() => setFilters({})}/>
        <InputText value={nameFilter} onChange={e => setNameFilter(e.target.value)} placeholder={'name'}/>
        <InputText value={balanceFilter} onChange={e => console.log(dtRef.current)} placeholder={'balance'}/>
        <Button onClick={() => setResetFilters(new Date().getTime())}>Reset Filters</Button>
        <ReactiveTable data={data}
                       contextMenu={menuModel}
                       setSelected={setSelected}
                       resetFilters={resetFilters}
                       setDtRef={(ref) => dtRef.current = ref}
            // expandable
            // forOverlay={true}
                       columnOrder={['verified', 'activity', 'operations']}
            // xlsx={"doo"}
            // onFilterCb={handleOnFilterCallback}
            selectedIds={selectedIds} selectionHandler={handleSelection}
            // initialFilters={{name: nameFilter}}
            // externalFilters={getExternalFilters()}
                       columnTemplate={getColumnTemplate()}
            // columnStyle={{balance: {header: {display: 'flex', justifyContent : "flex-start"}, body: {width: "20%"}}}}
            //              specialFilters={getSpecialFilters()}
            // initialFilters={{id: 5, test: 'qu'}}
            //              showPaginator={false}
                       doubleClick={dbClickCb} selectionKey={"id"}
            // footerTemplate={footerTemplate}
            // rebuildColumns={rebuildColumns}
            // dtProps={{footerColumnGroup: footerGroup}}
                       editableColumns={['verified']}
                       cellEditHandler={(result) => 0}
                       specialEditors={getSpecialEditors()}
        />

        {/*{getColumnOrder().length > 0 ?*/}
        {/*    <ReactiveTable*/}
        {/*        data={data}*/}
        {/*        sortableColumns={["balance"]}*/}
        {/*        selectionKey={"balance"}*/}
        {/*        setSelected={setSelected}*/}
        {/*        selectionMode={"checkbox"}*/}
        {/*        specialEditors={getSpecialEditors()}*/}
        {/*        editableColumns={['vehicleStatus']}*/}
        {/*        cellEditHandler={(e) => console.log("CELL EDIT HANDLER", e)}*/}
        {/*        columnOrder={['balance', 'name', 'verified', 'activity', 'operations']}*/}
        {/*        onFilterCb={(data) => console.log("THE DATA IS: ", data)}*/}
        {/*        dtProps={{*/}
        {/*            removableSort: true,*/}
        {/*            onRowDoubleClick: () => setSelectedOperation("firmDetails")*/}
        {/*        }}*/}
        {/*    />*/}
        {/*: null}*/}


        <OverlayPanel
            ref={overlayRef}
            showCloseIcon
            id="overlay_panel"
            style={{width: "450px"}}
        >

            <div className="datatable-responsive-demo">
                {/*<ReactiveTable*/}
                {/*    data={data}*/}
                {/*    selectionMode={"checkbox"}*/}
                {/*    columnOrder={['balance', 'name', 'verified', 'activity', 'operations']}*/}
                {/*    forOverlay={true}*/}
                {/*    ignoreFilters={['edit', 'delete']}*/}
                {/*    showHeader={false}*/}
                {/*    paginatorOptions={[5,10,20]}*/}
                {/*/>*/}
            </div>
            {/*<div className={"p-grid p-jc-center p-fluid"}>*/}
            {/*    <div className={"p-col-6"} >*/}
            {/*        <Button label={f({ id: "add" })} onClick={(e) => selectedAction === "mail" ? createNewMail() : createNewPhone()} />*/}
            {/*    </div>*/}
            {/*</div>*/}

        </OverlayPanel>
    </>
}
