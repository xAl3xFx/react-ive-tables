import {SimpleDataTable} from "../lib/SimpleDataTable";
import React, {useCallback, useRef, useState} from "react";
import * as customers from './../lib/customers.json'
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import { FilterMatchMode, FilterOperator } from 'primereact/api';

export const ManyColumns = () => {
    const [selected, setSelected] = useState();
    const [resetter, setResetter] = useState(0);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const menuModel = [
        {label: "Add", icon: 'pi pi-plus', command: () => 0},
    ]

    const dbClickCb = (e:any) => {
        console.log("DOUBLE CLICKED!", selected);
    }

    const addSelectedIds = () => setSelectedIds([1000,1001])

    const handleSelection = (e: any ) => {

    }

    const statuses = ['unqualified' , 'proposal']

    return <>
        <Button label={"Reset selection"} onClick={() => setResetter(new Date().getTime())} />
        <Button label={"Add selectedIDs"} onClick={addSelectedIds} />
        <SimpleDataTable data={customers.data.slice(0,10)} contextMenu={menuModel} setSelected={setSelected}
                             columnOrder={['id', 'name', 'company', 'date', 'status', 'verified', 'activity', 'balance']}
                         selectedIds={selectedIds} selectionHandler={handleSelection}
                         columnTemplate={{
                             name: ({name}) => name
                         }}
                         specialFilters={{
                             status : (options : any) => <Dropdown showClear options={statuses} value={options.value} onChange={(e) => options.filterApplyCallback(e.value)} />
                         }}
                         selectionMode={'checkbox'} doubleClick={dbClickCb} selectionKey={"id"}
         />
    </>
}