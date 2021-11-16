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

function App() {

    const [selectedRow, setSelectedRow] = useState({});

    const data = [
        {
            "id": 1,
            "firstName": "Jefferson",
            "middleName": "Schwartz",
            "isActive": false,
            "balance": "$2,616.22",
            "age": 30,
            "eyeColor": "blue",
            "gender": "male",
            "company": "TOYLETRY",
            "email": "jeffersonschwartz@toyletry.com",
            "phone": "+1 (974) 545-2317"
        },
        {
            "id": 2,
            "firstName": "Ora",
            "middleName": "Vasquez",
            "isActive": false,
            "balance": "$2,625.18",
            "age": 27,
            "eyeColor": "brown",
            "gender": "female",
            "company": "TELLIFLY",
            "email": "oravasquez@tellifly.com",
            "phone": "+1 (850) 408-2834"
        },
        {
            "id": 3,
            "firstName": "Barbra",
            "middleName": "Chavez",
            "isActive": true,
            "balance": "$3,989.94",
            "age": 28,
            "eyeColor": "brown",
            "gender": "female",
            "company": "ROOFORIA",
            "email": "barbrachavez@rooforia.com",
            "phone": "+1 (809) 530-2451"
        },
        {
            "id": 4,
            "firstName": "Ware",
            "middleName": "Valencia",
            "isActive": true,
            "balance": "$1,744.32",
            "age": 25,
            "eyeColor": "brown",
            "gender": "male",
            "company": "ZEROLOGY",
            "email": "warevalencia@zerology.com",
            "phone": "+1 (952) 584-3893"
        },
        {
            "id": 5,
            "firstName": "Potts",
            "middleName": "Mathews",
            "isActive": true,
            "balance": "$3,945.26",
            "age": 20,
            "eyeColor": "green",
            "gender": "male",
            "company": "AQUAFIRE",
            "email": "pottsmathews@aquafire.com",
            "phone": "+1 (826) 424-2472"
        }
    ]

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
        return <Dropdown value={options.value} options={people}
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


    return (
        <div className="App">
            <p>Hello world</p>
            <IntlProvider locale={"bg-BG"} messages={{}}>
                <Card>
                    <SimpleDataTable data={customers.data} selectionKey="id" columnOrder={["id", "name"]}
                                     specialFilters={getSpecialFilters()} showHeader={true}
                                     setSelected={setSelectedRow} showFilters={false}
                                     contextMenu={menuModel}
                                     cellEditHandler={(e: any) => console.log('cellEditHandler', e)}
                                     specialEditors={getSpecialEditors()} xlsx={'asd'}/>
                </Card>
                {/* <LazyDataTable dataUrl={"asd"} columnOrder={[]}/> */}
            </IntlProvider>
        </div>
    );
}

export default App;
