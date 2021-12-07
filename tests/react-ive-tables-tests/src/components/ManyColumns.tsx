import {SimpleDataTable} from "../lib/SimpleDataTable";
import React from "react";
import * as customers from './../lib/customers.json'


export const ManyColumns = () => {


    return <>
        <SimpleDataTable data={customers.data}
                         columnOrder={['id', 'name', 'company', 'date', 'status', 'verified', 'activity', 'balance', 'id', 'name', 'company', 'date', 'status', 'verified', 'activity', 'balance']}
                         selectionMode={'single'}
         />
    </>
}