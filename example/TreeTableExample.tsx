import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {SimpleTreeTable} from "../src";
import {NodeService} from "./node-service";
import {MenuItem} from "primereact/menuitem";
import data from "./testData.json";

interface Props {

}

export const TreeTableExample: React.FC<Props> = props => {
    const didMountRef = useRef(false);

    const [nodes, setNodes] = useState([]);

    const treeTableData = {root: []};
    treeTableData.root = data.map((el: any, index: number) => {
        return {
            key: String(index),
            data: {
                firmname: el.firmname,
                password: el.password,
                attachedToBilling: el.attachedToBilling,
                clientFirmName: el.clientFirmName
            },
            children: el.gpsAccounts.map((acc, index2) => {
                return {
                    key: String(index) + "-" + index2,
                    data: {
                        firmname: acc.username,
                        password: acc.password,
                        attachedToBilling: acc.attachedToBilling,
                        administratedVehicles: acc.totalVehicles - acc.unattachedVehicles,
                        totalVehicles: acc.totalVehicles
                    }
                }
            })
        }
    });

    console.log("TreeTableData is: ", treeTableData);


    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            NodeService.getTreeTableNodes().then(data => {
                console.log('setting nodes', data);
                setNodes(data)
            })
        }
    }, []);

    console.log(data)

    const menuModel: MenuItem[] = [{label: 'rumaqmi'}]

    return <>
        <SimpleTreeTable data={treeTableData.root} columnOrder={['firmname', 'administratedVehicles', 'attachedToBilling', 'info']}
                         showGlobalFilter={true} showHeader={true}/>
    </>
};
