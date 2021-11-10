import React from 'react';
import {IntlProvider} from 'react-intl';
import './App.css';
import { LazyDataTable, SimpleDataTable } from './react-ive-tables'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import { Card } from 'primereact/card'
import {injectIntl, useIntl } from "react-intl";
import {DataTable, DataTableSelectionModeType, DataTableSortOrderType} from "primereact/datatable";
import {useEffect, useRef, useState} from "react";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {FormEvent} from "react";
import {InputText} from "primereact/inputtext";
import { ContextMenu } from 'primereact/contextmenu';
import "./DataTable.css"
import {useContext} from "react";
import { MenuItem } from 'primereact/menuitem/menuitem';
import { Tooltip } from 'primereact/tooltip';
import moment from "moment";

function App() {

  const data = [
    {
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



  return (
    <div className="App">
      <p>Hello world</p>
      <IntlProvider locale={"bg-BG"} messages={{}}>

        
    
        <Card>
          <SimpleDataTable data={data} setSelected={() => {}}/> 
        

        </Card>
        {/* <LazyDataTable dataUrl={"asd"} columnOrder={[]}/> */}
      </IntlProvider>
    </div>
  );
}

export default App;
