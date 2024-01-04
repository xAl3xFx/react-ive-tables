import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {SimpleTreeTable} from "../src";
import {NodeService} from "./node-service";
import {MenuItem} from "primereact/menuitem";

interface Props {

}

export const TreeTableExample: React.FC<Props> = props => {
    const didMountRef = useRef(false);

    const [nodes, setNodes] = useState([]);

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            NodeService.getTreeTableNodes().then(data => {
                console.log('setting nodes', data);
                setNodes(data)
            })
        }
    }, []);

    const menuModel: MenuItem[] = [{label: 'rumaqmi'}]

    return <>
        <SimpleTreeTable data={nodes} columnOrder={['name', 'size', 'type']}
                         showGlobalFilter={true} showHeader={true}/>
    </>
};
