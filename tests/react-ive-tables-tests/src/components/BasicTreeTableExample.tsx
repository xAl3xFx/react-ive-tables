import {SimpleDataTable} from "../lib/SimpleDataTable";
import React from "react";
import * as data from '../lib/treeTableData.json'
import {SimpleTreeTable} from "../lib/SimpleTreeTable";
import {Button} from "primereact/button";


export const BasicTreeTableExample = () => {

    const getColumnsTemplate = () => {
        return {
            test: (node : any, column : any) => {
                return node.key.indexOf('-') === -1 ? null : <div>
                    <Button onClick={e => e.stopPropagation()} type="button" icon="pi pi-search" className="p-button-success" style={{ marginRight: '.5em' }}></Button>
                </div>;
            }
        }
    }

    return <>
        <SimpleTreeTable data={data.root}
                         columnsTemplate={getColumnsTemplate()}
                         showHeader={false}
                         columnOrder={['name', 'size', 'type', 'test']}
        />
    </>
}