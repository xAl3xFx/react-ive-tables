import {SimpleDataTable} from "../lib/SimpleDataTable";
import React, {useCallback, useRef, useState} from "react";
import * as customers from './../lib/customers.json'
import {Button} from "primereact/button";
import { useEffect } from "react";
import {Checkbox} from "primereact/checkbox";


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

    return <>
        <Button label={"Reset selection"} onClick={() => setResetter(new Date().getTime())} />
        <Button label={"Add selectedIDs"} onClick={addSelectedIds} />
        <SimpleDataTable data={customers.data.slice(0,10)} contextMenu={menuModel} setSelected={setSelected}
                         columnOrder={['id', 'name', 'company', 'date', 'status', 'verified', 'activity', 'balance']}
                         selectedIds={selectedIds} selectionHandler={handleSelection}
                         selectionMode={'checkbox'} doubleClick={dbClickCb} selectionKey={"id"}
         />
    </>
}