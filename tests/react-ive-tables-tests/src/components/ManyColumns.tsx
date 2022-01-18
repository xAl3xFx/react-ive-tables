import {SimpleDataTable} from "../lib/SimpleDataTable";
import React, { useCallback, useState } from "react";
import * as customers from './../lib/customers.json'
import {Button} from "primereact/button";
import { useEffect } from "react";


export const ManyColumns = () => {
    const [selected, setSelected] = useState();

    const menuModel = [
        {label: "Add", icon: 'pi pi-plus', command: () => 0},
    ]

    const dbClickCb = (e:any) => {
        console.log("DOUBLE CLICKED!", selected);
    }

    return <>
        <SimpleDataTable data={customers.data} contextMenu={menuModel} setSelected={setSelected}
                         columnOrder={['id', 'name', 'company', 'date', 'status', 'verified', 'activity', 'balance']}
                         selectionMode={'single'} doubleClick={dbClickCb} selectionKey="id"
         />
    </>
}