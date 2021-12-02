import {SimpleDataTable} from "../lib/SimpleDataTable";
import React from "react";
import * as data from '../lib/treeTableData.json'
import {SimpleTreeTable} from "../lib/SimpleTreeTable";
import {Button} from "primereact/button";


export const BasicTreeTableExample = () => {

    const getSpecialColumns = () => {
        return {
            'copy' : {
                handler: () => console.log("asd"),
                element: <Button icon={'pi pi-copy'} />,
                atStart: false
            }
        }
    }

    return <>
        <SimpleTreeTable data={data.root}
                         showHeader={false}
                         specialColumns={getSpecialColumns()}
                         columnOrder={['name', 'size', 'type']}
        />
    </>
}