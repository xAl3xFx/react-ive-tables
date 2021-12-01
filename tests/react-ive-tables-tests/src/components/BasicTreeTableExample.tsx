import {SimpleDataTable} from "../lib/SimpleDataTable";
import React from "react";
import * as data from '../lib/treeTableData.json'
import {SimpleTreeTable} from "../lib/SimpleTreeTable";


export const BasicTreeTableExample = () => {


    return <>
        <SimpleTreeTable data={data.root}
                         showHeader={false}
                         columnOrder={['name', 'size', 'type']}
        />
    </>
}