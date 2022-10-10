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
        getData().then(setData);
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
            operations: (rowData: any, columnOptions: ColumnBodyOptions) => {
                const editButton = columnOptions.rowEditor && !columnOptions.rowEditor.editing ? <Button icon={'pi pi-pencil'} onClick={columnOptions.rowEditor?.onInitClick}/> : null;
                const saveButton = columnOptions.rowEditor && columnOptions.rowEditor.editing ? <Button icon={'pi pi-check'} onClick={columnOptions.rowEditor?.onSaveClick}/> : null;
                const cancelButton = columnOptions.rowEditor && columnOptions.rowEditor.editing ? <Button icon={'pi pi-times'} onClick={columnOptions.rowEditor?.onCancelClick}/> : null;

                return <>
                    {editButton}
                    {saveButton}
                    {cancelButton}
                </>
            }
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

    return <>
        <Button label={"Reset selection"} onClick={() => setResetter(new Date().getTime())}/>
        <Button label={"Add selectedIDs"} onClick={addSelectedIds}/>
        <Button label={"Add records"} onClick={addToTable}/>
        <Button label={"Filter"} onClick={() => setFilters({})}/>
        <InputText value={nameFilter} onChange={e => setNameFilter(e.target.value)} placeholder={'name'}/>
        <InputText value={balanceFilter} onChange={e => setBalanceFilter(e.target.value)} placeholder={'balance'}/>
        <SimpleDataTable data={data} contextMenu={menuModel} setSelected={setSelected}
                         expandable
                         columnOrder={['balance', 'name', 'operations']}
                         xlsx={"doo"}
                         onFilterCb={handleOnFilterCallback}
                         // selectedIds={selectedIds} selectionHandler={handleSelection}
                         // initialFilters={{name: nameFilter}}
                         rowEditHandler={() => 0}
            // externalFilters={getExternalFilters()}
                         columnTemplate={getColumnTemplate()}
            // columnStyle={{balance: {header: {display: 'flex', justifyContent : "flex-start"}, body: {width: "20%"}}}}
                         specialFilters={getSpecialFilters()}
            // initialFilters={{id: 5, test: 'qu'}}
                         showPaginator={false}
                         editableColumns={['name']}
                         doubleClick={dbClickCb} selectionKey={"id"}
                         footerTemplate={footerTemplate}
                         dtProps={{footerColumnGroup: footerGroup}}
        />
    </>
}
