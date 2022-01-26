import {SimpleDataTable} from "../lib/SimpleDataTable";
import React, { useCallback, useState } from "react";
import * as customers from './../lib/customers.json'
import {Button} from "primereact/button";
import { useEffect } from "react";


export const ManyColumns = () => {
    const [selected, setSelected] = useState();
    const [resetter, setResetter] = useState(0);

    const menuModel = [
        {label: "Add", icon: 'pi pi-plus', command: () => 0},
    ]

    const dbClickCb = (e:any) => {
        console.log("DOUBLE CLICKED!", selected);
    }

    return <>
        <Button label={"Reset selection"} onClick={() => setResetter(new Date().getTime())} />
        <SimpleDataTable data={customers.data} contextMenu={menuModel} setSelected={setSelected} showSkeleton={false} selectionResetter={resetter}
                         columnOrder={['id', 'name', 'company', 'date', 'status', 'verified', 'activity', 'balance']} disableArrowKeys
                         selectionMode={'multiple'} doubleClick={dbClickCb} selectionKey={"id"} dtProps={{style: {height: '100vh'}}}
         />
    </>
}