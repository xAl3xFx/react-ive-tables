import React, {useEffect, useState} from 'react';
import {IntlProvider} from 'react-intl';
import './App.css';
import {SimpleDataTable} from './lib/SimpleDataTable'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import {Card} from 'primereact/card'
import "./DataTable.css"
import customers from './lib/customers.json'
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import {ManyColumns} from "./components/ManyColumns";
import {BasicTreeTableExample} from "./components/BasicTreeTableExample";
import {LazyDataTableExample} from "./components/LazyDataTableExample";

function App() {

    const [selectedRow, setSelectedRow] = useState(null);
    const [data, setData] = useState<any>([]);
    const [selectedTable, setSelectedTable] = useState(<LazyDataTableExample />);

    useEffect(() => {
        setData(customers.data);
    }, []);


    const menuModel = [
        {
            label: "Update",
            icon: 'pi pi-fw pi-search',
            command: (e: any) => {
                alert("Item ready to be updated")
            }
        },
        {
            label: "Delete",
            icon: 'pi pi-fw pi-trash',
            command: (e: any) => {
                alert("Item deleted")
            }
        }
    ];

    useEffect(() => {
        console.log(selectedRow);
    }, [selectedRow]);

    const people = [
        {label: 'James Butt', value: 'James Butt'},
        {label: 'Josephine Darakjy', value: 'Josephine Darakjy'},
    ];

    const nameTemplate = (options: any) => {
        return <Dropdown value={options.value} options={people} placeholder={'Choose'} style={{textAlign : "left"}}
                         onChange={(e) => options.filterApplyCallback(e.value)}/>;
    }

    const nameEditor = (options: any) => {
        return (
            <Dropdown value={options.value} options={people} optionLabel="label" optionValue="value"
                      onChange={(e) => options.editorCallback(e.value)} placeholder="Select a person"/>
        );
    }

    const getSpecialFilters = () => {
        return {
            'name': nameTemplate
        }
    }

    const getSpecialEditors = () => {
        return {
            'name': nameEditor
        }
    }

    const getHeaderButtons = () => {
            return [{
                onClick: () => 0,
                icon: 'pi pi-plus',
                className: '',
                tooltipLabel: 'asd'
            }]
    }

    const getRightHeaderButtons = () => {
        return [{
            onClick: () => 0,
            icon: 'pi pi-plus',
            className: '',
            tooltipLabel: 'asd'
        },{
            onClick: () => 0,
            className: '',
            label: "asd"
        }]
    }
    return (
        <div className="App">
            <IntlProvider locale={"bg-BG"} messages={{"id" : "ID", "name" : "Name", 'type' : 'Type', 'size' : "Size", title: "Title", body: "Body"}}>
                <Card>

                    <h1>Select Table</h1>
                    <div className={'p-mb-3'}>
                        <Button className={"p-mr-2"} onClick={() => setSelectedTable(<ManyColumns />)}>Many Columns</Button>
                        <Button className={"p-mr-2"} onClick={() => setSelectedTable(<BasicTreeTableExample />)}>Tree Table</Button>
                        <Button className={"p-mr-2"} onClick={() => setSelectedTable(<LazyDataTableExample />)}>Lazy Table</Button>

                    </div>
                    {selectedTable}
                    {/*<SimpleDataTable data={data} selectionKey="id" columnOrder={["id", "name"]}*/}
                    {/*                 specialFilters={getSpecialFilters()} showHeader={true}*/}
                    {/*                 setSelected={setSelectedRow}*/}
                    {/*                 contextMenu={menuModel}*/}
                    {/*                 selectionMode={'single'}*/}
                    {/*                 headerButtons={getHeaderButtons()}*/}
                    {/*                 rightHeaderButtons={getRightHeaderButtons()}*/}
                    {/*                 // cellEditHandler={(e: any) => console.log('cellEditHandler', e)} specialEditors={getSpecialEditors()}*/}
                    {/*                  xlsx={'asd'}/>*/}
                </Card>
                {/* <LazyDataTableOld dataUrl={"asd"} columnOrder={[]}/> */}
            </IntlProvider>
        </div>
    );
}

export default App;
