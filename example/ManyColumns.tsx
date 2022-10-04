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


export const ManyColumns = () => {
    const [selected, setSelected] = useState();
    const [resetter, setResetter] = useState(0);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filters, setFilters] = useState<any>({activity: '80'});
    const [data, setData] = useState<Customer[]>(customers.data.slice(0, 10))
    const [companyFilter, setCompanyFilter] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const dtRef = useRef(null);

    const menuModel = [
        {label: "Add", icon: 'pi pi-plus', command: () => 0},
    ]

    const dbClickCb = (e: any) => {
        console.log("DOUBLE CLICKED!", selected);
    }

    const addSelectedIds = () => setSelectedIds([1000, 1001])

    const handleSelection = (e: any) => {

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
            roro: (options: any) => <Dropdown showClear options={statuses} value={options.value}
                                                onChange={(e) => options.filterApplyCallback(e.value)}/>,
            balance: (options: any) => <Calendar showButtonBar value={options.value}
                                              onChange={(e) => options.filterApplyCallback(e.value, options.index)}
                                              dateFormat="yy-mm-dd" placeholder={'Choose'}/>

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


    return <>
        <Button label={"Reset selection"} onClick={() => setResetter(new Date().getTime())}/>
        <Button label={"Add selectedIDs"} onClick={addSelectedIds}/>
        <Button label={"Add records"} onClick={addToTable}/>
        <Button label={"Filter"} onClick={() => setFilters({})}/>
        <InputText value={nameFilter} onChange={e => setNameFilter(e.target.value)} />
        <SimpleDataTable data={data} contextMenu={menuModel} setSelected={setSelected}
                         expandable
                         columnOrder={['balance', 'name']}
                         xlsx={"doo"}
                         selectedIds={selectedIds} selectionHandler={handleSelection}
                         ignoreFilters={['name', '']}
                         initialFilters={{name: nameFilter}}
                         // externalFilters={getExternalFilters()}

                         specialLabels={{balance: 'asd'}}
            // columnStyle={{balance: {header: {display: 'flex', justifyContent : "flex-start"}, body: {width: "20%"}}}}
                         specialFilters={getSpecialFilters()}
            // initialFilters={{id: 5, test: 'qu'}}
                         showPaginator={false}
                         editableColumns={['name']}
                         doubleClick={dbClickCb} selectionKey={"id"}
                         footerTemplate={footerTemplate}
        />
    </>
}
