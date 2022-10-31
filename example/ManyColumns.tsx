import {SimpleDataTable} from "../src";
import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from "react";
import * as customers from './lib/customers.json'
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {Calendar} from "primereact/calendar";
import {Customer} from "./types";
import {SpecialFilter, StringKeys} from "../src/SimpleDataTable";
import {InputText} from "primereact/inputtext";
import {Column, ColumnBodyOptions} from "primereact/column";
import {ColumnGroup} from "primereact/columngroup";
import {Row} from "primereact/row";
import {act} from "react-dom/test-utils";
import {OverlayPanel} from "primereact/overlaypanel";

interface IDropdownOption {
    key: number;
    id: number;
    description: string;
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
    const dtRef = useRef(null);
    const [filtered, setFiltered] = useState<any>();
    const [activityOptions, setActivityOptions] = useState<IDropdownOption[]>();
    const [rebuildColumns, setRebuildColumns] = useState(0);

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
            const addedOptions : number[] = [];
            const activityOptions = customers.data.slice(0,15).reduce((acc, el : Customer) => {
                if(addedOptions.includes(el.activity)){
                    return acc;
                }else{
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
                setData(customers.data.slice(0, 15))
            }, 1000)
    }, []);


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
                                                  style={{ textAlign: "left" }} />,

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
        console.log('getColumnTemplate')
        return {
            verified : (rowData: any) => rowData.verified ? "Yes" : "No",
            operations: (rowData: any, columnOptions: ColumnBodyOptions) => {
                const editButton = columnOptions.rowEditor && !columnOptions.rowEditor.editing ? <Button icon={'pi pi-pencil'} onClick={columnOptions.rowEditor?.onInitClick}/> : null;
                const saveButton = columnOptions.rowEditor && columnOptions.rowEditor.editing ? <Button icon={'pi pi-check'} onClick={columnOptions.rowEditor?.onSaveClick}/> : null;
                const cancelButton = columnOptions.rowEditor && columnOptions.rowEditor.editing ? <Button icon={'pi pi-times'} onClick={columnOptions.rowEditor?.onCancelClick}/> : null;
                const overlayButton = <Button icon={'pi pi-save'} onClick={(e) => overlayRef.current?.toggle(e)}/>

                return <>
                    {editButton}
                    {saveButton}
                    {cancelButton}
                    {overlayButton}
                </>
            },
            activity: (rowData: any) => activityOptions ? ( activityOptions.find(el => el.id === rowData.activity)?.description || rowData.activity) : rowData.activity
        }
    }

    const handleOnFilterCallback = (rowData : any) => {
        console.log(rowData);
        setFiltered(rowData)
    }

    const footerGroup = <ColumnGroup>
        <Row>
            <Column
                footer={filtered?.reduce((a, b) => a + b.balance, 0).toFixed(2) + '.'}
                footerStyle={{textAlign: 'center', fontWeight: 'bold'}}/>
            <Column colSpan={3}/>
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

    return <>
        <Button label={"Reset selection"} onClick={() => setResetter(new Date().getTime())}/>
        <Button label={"Add selectedIDs"} onClick={addSelectedIds}/>
        <Button label={"Add records"} onClick={addToTable}/>
        <Button label={"Filter"} onClick={() => setFilters({})}/>
        <InputText value={nameFilter} onChange={e => setNameFilter(e.target.value)} placeholder={'name'}/>
        <InputText value={balanceFilter} onChange={e => setBalanceFilter(e.target.value)} placeholder={'balance'}/>
        <SimpleDataTable data={data}
                         contextMenu={menuModel}
                         setSelected={setSelected}
                         selectionMode={'single'}
                         // expandable
                         // forOverlay={true}
                         columnOrder={['balance', 'name', 'verified', 'activity', 'operations']}
                         // xlsx={"doo"}
                         // onFilterCb={handleOnFilterCallback}
                         // selectedIds={selectedIds} selectionHandler={handleSelection}
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


        <OverlayPanel
            ref={overlayRef}
            showCloseIcon
            id="overlay_panel"
            style={{ width: "450px" }}
        >

            <div className="datatable-responsive-demo">
                <SimpleDataTable
                    data={data}
                    columnOrder={['balance', 'name', 'verified', 'activity', 'operations']}
                    forOverlay={true}
                    ignoreFilters={['edit', 'delete']}
                    showHeader={false}
                />
            </div>
            {/*<div className={"p-grid p-jc-center p-fluid"}>*/}
            {/*    <div className={"p-col-6"} >*/}
            {/*        <Button label={f({ id: "add" })} onClick={(e) => selectedAction === "mail" ? createNewMail() : createNewPhone()} />*/}
            {/*    </div>*/}
            {/*</div>*/}

        </OverlayPanel>
    </>
}
