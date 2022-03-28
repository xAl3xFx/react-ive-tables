import {SimpleDataTable} from "../lib/SimpleDataTable";
import React, {useCallback, useRef, useState} from "react";
import * as customers from './../lib/customers.json'
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import {Calendar} from "primereact/calendar";

export const ManyColumns = () => {
    const [selected, setSelected] = useState();
    const [resetter, setResetter] = useState(0);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [data, setData] = useState<any>(customers.data.slice(0,10))

    const menuModel = [
        {label: "Add", icon: 'pi pi-plus', command: () => 0},
    ]

    const dbClickCb = (e:any) => {
        console.log("DOUBLE CLICKED!", selected);
    }

    const addSelectedIds = () => setSelectedIds([1000,1001])

    const handleSelection = (e: any ) => {

    }

    const addToTable = () => {
        setData(customers.data.slice(0,15));
    }

    const statuses = ['unqualified' , 'proposal']

    return <>
        <Button label={"Reset selection"} onClick={() => setResetter(new Date().getTime())} />
        <Button label={"Add selectedIDs"} onClick={addSelectedIds} />
        <Button label={"Filter"} onClick={addToTable} />
        <SimpleDataTable data={data} contextMenu={menuModel} setSelected={setSelected} externalFilters={{activity: '80'}}
                             columnOrder={['id', 'name', 'company', 'date', 'status', 'verified', 'activity', 'balance']}
                         selectedIds={selectedIds} selectionHandler={handleSelection}
                         ignoreFilters={['name']}
                         columnTemplate={{
                             name: ({name}) => name
                         }}
                         specialFilters={{
                             status : (options : any) => <Dropdown showClear options={statuses} value={options.value} onChange={(e) => options.filterApplyCallback(e.value)} />,
                             date: (options : any) => <Calendar showButtonBar value={options.value} onChange={(e) => options.filterApplyCallback(e.value, options.index)} dateFormat="yy-mm-dd" placeholder={'Choose'} />
                         }}
                         cellEditHandler={() => 0}
                         editableColumns={['name']}
                         selectionMode={'checkbox'} doubleClick={dbClickCb} selectionKey={"id"}
         />
    </>
}