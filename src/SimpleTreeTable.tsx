import {useState, useEffect, useRef} from 'react';
import { useIntl } from "react-intl";
import {TreeTable} from "primereact/treetable";
import {Column} from "primereact/column";
import "./DataTable.css";
import axios from 'axios';
import moment from 'moment';
import { DTFilterElement } from './DTFilterElement';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';
import React from 'react';

interface Props {
    data: any[],
    columnOrder : string[],
    specialLabels? : {[key: string]: string;},
    extraButton? : {[key: number] : JSX.Element},
    ignoreFilters? : string[],
    specialFilters? :  {[key: string]: {element: JSX.Element, type: string}},
    setSelected? : (e : Event) => void,
    showFilters? : boolean,
    additionalFilters? : {[key: string]: any;},
    showHeader? : boolean,
    contextMenu? : Object[],
    sortableColumns?: string[],                                  // Array of columns which should be sortable.
    scrollable?: boolean                                        // When true scrolling is enabled and paginator is hidden
    scrollHeight?: string                                       // Height for the scroll
    columnsTemplate? : any
}

export const SimpleTreeTable :  React.FC<Props> = (props) => {
    const {formatMessage : f} = useIntl();
    const [columns, setColumns] = useState<JSX.Element[]>([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(20);
    const [items, setItems] = useState<any>();
    const [showTable, setShowTable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);
    const [expandedKeys, setExpandedKeys] = useState<any>({});
    const [selectedElementIndex, setSelectedElementIndex] = useState<string | null>(null);
    const cm = useRef<any>();

    const generateColumns = () => {
        let columns: any[] = [];
        if (items && items.length > 0 && items[0] || props.columnOrder) {

            columns = (props.columnOrder.map((cName:any, index) => {
                let label = f({id: cName});
                if(props.specialLabels) 
                    if(props.specialLabels[cName])
                        label = f({id: props.specialLabels[cName]});

                    if(props.columnOrder.includes(cName)){
                        return <Column expander={index===0} body={props.columnsTemplate[cName]}
                                       sortable={props.sortableColumns?.includes(cName)}
                                       filterElement={props.specialFilters![cName]} showClearButton={false}
                                       showFilterMenu={false} filterField={cName}
                                       filter={props.showFilters && !props.ignoreFilters?.includes(cName)}
                                       key={cName} field={cName} header={label}/>
                    }
            }));
        }

        setColumns(columns);
    };

    useEffect(() => {
        // initFilters();
        if (props.data && props.data.length > 0) {
            setItems(props.data);
            setShowTable(true);
        }
    }, [props.data]);


    useEffect(() => {
        generateColumns();
    }, [items])


    const getHeader = () => {
        return <div className="export-buttons" style={{display: "flex", justifyContent: "space-between"}}>
            <div>

            </div>
        </div>
    };

    const handleSelection = (e: any) => {
        const currentSelectedElementIndex = e.value;
        if(!isNaN(+currentSelectedElementIndex)){
            const newExpandedKeys = {...expandedKeys};
            if(newExpandedKeys[currentSelectedElementIndex]){
                delete newExpandedKeys[currentSelectedElementIndex];
            }else{
                newExpandedKeys[currentSelectedElementIndex] = true
            }
            setExpandedKeys(newExpandedKeys);
        }
        setSelectedElementIndex(e.value);

        if(props.setSelected) props.setSelected(e.value);
    };

    return <>
    {showTable ?
        <div className="treatable-responsive-demo">
            {props.contextMenu ? <ContextMenu model={props.contextMenu} ref={cm} onHide={() => setSelectedElement(null)} appendTo={document.body} /> : null}
            <TreeTable
                onToggle={e => setExpandedKeys(e.value)}
                tableStyle={{tableLayout: "auto"}} 
                // @ts-ignore
                value={items} 
                paginator={!props.scrollable}
                loading={loading}
                first={first}
                rowsPerPageOptions={[20, 30, 50]}
                header={props.showHeader ? getHeader() : null}
                expandedKeys={expandedKeys}
                rows={rows}
                emptyMessage="No records found"
                onSelectionChange={handleSelection}
                selectionKeys={selectedElementIndex}
                selectionMode={'single'}
                scrollable={props.scrollable} scrollHeight={props.scrollHeight}
                onContextMenuSelectionChange={(e:any) => {
                    //set{selectedRow: e.value});

                    if (props.setSelected !== undefined && props.contextMenu) {
                        const index = e.value.split("-")[0];
                        const key = e.value.split("-")[1];
                        const selectedItem = key ? items[index].children[key].data : items[index].data
                        props.setSelected(selectedItem);   
                    }
                }}
                onContextMenu={e => {
                    //if(items[0].id !== null)
                    if(props.contextMenu)
                        cm.current!.show(e.originalEvent)
                }}
            >
                {columns}
            </TreeTable>
        </div>
        : null }
    </>
};

SimpleTreeTable.defaultProps = {
    ignoreFilters: [],
    showFilters: true,
    columnOrder: [],
    showHeader: true,
    sortableColumns: [],
    specialFilters: {},
    scrollable: false,
    scrollHeight: undefined,
    columnsTemplate: {}
};
