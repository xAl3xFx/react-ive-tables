import {SimpleDataTable} from "../lib/SimpleDataTable";
import React from "react";
import * as customers from './../lib/customers.json'
import {Button} from "primereact/button";


export const ManyColumns = () => {

    const menuModel = [
        {label: "Add", icon: 'pi pi-plus', command: () => 0},
    ]

    const dbClickCb = (e:any) => {
        alert("DOUBLE CLICKED!");
    }

    return <>
        <SimpleDataTable data={customers.data} contextMenu={menuModel} setSelected={e => console.log(e)}
                         columnOrder={['id', 'name', 'company', 'date', 'status', 'verified', 'activity', 'balance']}
                         selectionMode={'single'} doubleClick={dbClickCb}
         />
    </>
}