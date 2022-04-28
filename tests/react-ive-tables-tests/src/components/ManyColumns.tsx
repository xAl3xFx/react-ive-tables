import {SimpleDataTable} from "../lib/SimpleDataTable";
import React, {useCallback, useEffect, useRef, useState} from "react";
import * as customers from './../lib/customers.json'
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import {Calendar} from "primereact/calendar";
import {InputText} from "primereact/inputtext";
import {InputNumber} from "primereact/inputnumber";

export const ManyColumns = () => {
    const [selected, setSelected] = useState();
    const [resetter, setResetter] = useState(0);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filters, setFilters] = useState<any>({activity: '80'});
    const [data, setData] = useState<any>(customers.data.slice(0, 10))
    const [companyFilter, setCompanyFilter] = useState('');
    // const [externalFilters, setExternalFilters] = useState({});

    const menuModel = [
        {label: "Add", icon: 'pi pi-plus', command: () => 0},
    ]

    const dbClickCb = (e: any) => {
        console.log("DOUBLE CLICKED!", selected);
    }

    const addSelectedIds = () => setSelectedIds([1000, 1001])

    const handleSelection = (e: any) => {

    }

    const addToTable = () => {
        setData(customers.data.slice(0, 15));
    }

    const onFilterCb = (data: any) => console.log(data);

    const statuses = [{value:1, label: 'unqualified'}, {value: 2, label: 'proposal'}]

    const optionsTemplate = (rowData: any) => {
        return <span>
            <Button className={'p-mr-2'} icon={'pi pi-trash'}/>
        </span>
    }

    const getSpecialFilters = () => {
        return {
            status: (options: any) => <Dropdown showClear options={statuses} value={options.value}
                                                onChange={(e) => options.filterApplyCallback(e.value)}/>,
            date: (options: any) => <Calendar showButtonBar value={options.value}
                                              onChange={(e) => options.filterApplyCallback(e.value, options.index)}
                                              dateFormat="yy-mm-dd" placeholder={'Choose'}/>,
            // test: (options: any) => <InputText value={options.value} onChange={e => options.filterApplyCallback(e.target.value, options.index)}/>
        }
    }

    const getExternalFilters = () => {
        return {
            test: (rowData: any, filterValue: string) => {
                return rowData.company.toLowerCase().includes(filterValue.toLowerCase()) || rowData.status.toLowerCase().includes(filterValue.toLowerCase());
            }
        }
    }

    const footerTemplate = () => {
        return <div className={"p-grid p-fluid p-justify-center"} style={{margin: "2rem"}}>
            <a>{"SHOW MORE!!"}</a>
        </div>
    }

    return <>
        <Button label={"Reset selection"} onClick={() => setResetter(new Date().getTime())}/>
        <Button label={"Add selectedIDs"} onClick={addSelectedIds}/>
        <Button label={"Add records"} onClick={addToTable}/>
        <Button label={"Filter"} onClick={() => setFilters({})}/>
        <SimpleDataTable data={data} contextMenu={menuModel} setSelected={setSelected}
                         columnOrder={['id', 'name', 'test', 'status', 'date', 'verified', 'activity', 'balance']}
                         selectedIds={selectedIds} selectionHandler={handleSelection}
                         ignoreFilters={['name']}
                         externalFilters={getExternalFilters()}
                         columnTemplate={{
                             balance: optionsTemplate,
                             test: (rowData) => rowData.company
                         }}
            // columnStyle={{balance: {header: {display: 'flex', justifyContent: "flex-start"}, body: {width: "20%"}}}}
                         specialFilters={getSpecialFilters()}
                         cellEditHandler={() => 0}
                         showPaginator={false}
                         editableColumns={['name']}
                         selectionMode={'checkbox'} doubleClick={dbClickCb} selectionKey={"id"}
                         footerTemplate={footerTemplate}
        />
    </>
}