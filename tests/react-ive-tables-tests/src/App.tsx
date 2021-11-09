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

  const data = [{ "deviceId": 22, "deviceNumber": 6, "simCardId": 163248, "simCardNumber": "637266265456051130", "deviceModelId": 5, "deviceModelName": "FMB640", "deviceManufacturerName": "Teltonika", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 23, "deviceNumber": 8, "simCardId": 163306, "simCardNumber": "637266265456051149", "deviceModelId": 2, "deviceModelName": "FMB920", "deviceManufacturerName": "Teltonika", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 28, "deviceNumber": 1242, "simCardId": null, "simCardNumber": null, "deviceModelId": 9, "deviceModelName": "Разходомер", "deviceManufacturerName": "Nipo", "deviceTypeId": 7, "deviceTypeName": "Flowmeter" }, { "deviceId": 29, "deviceNumber": 2145, "simCardId": null, "simCardNumber": null, "deviceModelId": 9, "deviceModelName": "Разходомер", "deviceManufacturerName": "Nipo", "deviceTypeId": 7, "deviceTypeName": "Flowmeter" }, { "deviceId": 30, "deviceNumber": 213, "simCardId": null, "simCardNumber": null, "deviceModelId": 10, "deviceModelName": "Сонда", "deviceManufacturerName": "Nipo", "deviceTypeId": 9, "deviceTypeName": "Probe" }, { "deviceId": 31, "deviceNumber": 132, "simCardId": null, "simCardNumber": null, "deviceModelId": 10, "deviceModelName": "Сонда", "deviceManufacturerName": "Nipo", "deviceTypeId": 9, "deviceTypeName": "Probe" }, { "deviceId": 33, "deviceNumber": 13512, "simCardId": 163244, "simCardNumber": "637266265456044464", "deviceModelId": 3, "deviceModelName": "Nipo33", "deviceManufacturerName": "Nipo", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 34, "deviceNumber": 1241, "simCardId": 163245, "simCardNumber": "637266265456051127", "deviceModelId": 4, "deviceModelName": "Nipo1ER1", "deviceManufacturerName": "Nipo", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 37, "deviceNumber": 999999999, "simCardId": 163247, "simCardNumber": "637266265456051129", "deviceModelId": 2, "deviceModelName": "FMB920", "deviceManufacturerName": "Teltonika", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 38, "deviceNumber": 14, "simCardId": null, "simCardNumber": null, "deviceModelId": 11, "deviceModelName": "iDrive 14", "deviceManufacturerName": "iDrive", "deviceTypeId": 6, "deviceTypeName": "Kamera" }, { "deviceId": 42, "deviceNumber": 552211, "simCardId": 1, "simCardNumber": "undefined", "deviceModelId": 3, "deviceModelName": "Nipo33", "deviceManufacturerName": "Nipo", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 43, "deviceNumber": 2255431, "simCardId": 2, "simCardNumber": "0879804203", "deviceModelId": 5, "deviceModelName": "FMB640", "deviceManufacturerName": "Teltonika", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 44, "deviceNumber": 42145, "simCardId": 163255, "simCardNumber": "637266265456051137", "deviceModelId": 3, "deviceModelName": "Nipo33", "deviceManufacturerName": "Nipo", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 45, "deviceNumber": 125, "simCardId": null, "simCardNumber": null, "deviceModelId": 7, "deviceModelName": "E39", "deviceManufacturerName": "Nipo", "deviceTypeId": 9, "deviceTypeName": "Probe" }, { "deviceId": 46, "deviceNumber": 444, "simCardId": null, "simCardNumber": null, "deviceModelId": 7, "deviceModelName": "E39", "deviceManufacturerName": "Nipo", "deviceTypeId": 9, "deviceTypeName": "Probe" }, { "deviceId": 47, "deviceNumber": 545, "simCardId": null, "simCardNumber": null, "deviceModelId": 7, "deviceModelName": "E39", "deviceManufacturerName": "Nipo", "deviceTypeId": 9, "deviceTypeName": "Probe" }, { "deviceId": 48, "deviceNumber": 544, "simCardId": null, "simCardNumber": null, "deviceModelId": 7, "deviceModelName": "E39", "deviceManufacturerName": "Nipo", "deviceTypeId": 9, "deviceTypeName": "Probe" }, { "deviceId": 49, "deviceNumber": 3234, "simCardId": null, "simCardNumber": null, "deviceModelId": 2, "deviceModelName": "FMB920", "deviceManufacturerName": "Teltonika", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 50, "deviceNumber": 1111, "simCardId": null, "simCardNumber": null, "deviceModelId": 7, "deviceModelName": "E39", "deviceManufacturerName": "Nipo", "deviceTypeId": 9, "deviceTypeName": "Probe" }, { "deviceId": 51, "deviceNumber": 1212, "simCardId": null, "simCardNumber": null, "deviceModelId": 7, "deviceModelName": "E39", "deviceManufacturerName": "Nipo", "deviceTypeId": 9, "deviceTypeName": "Probe" }, { "deviceId": 52, "deviceNumber": 987, "simCardId": null, "simCardNumber": null, "deviceModelId": 7, "deviceModelName": "E39", "deviceManufacturerName": "Nipo", "deviceTypeId": 9, "deviceTypeName": "Probe" }, { "deviceId": 54, "deviceNumber": 10125, "simCardId": 163313, "simCardNumber": "637266265456051156", "deviceModelId": 12, "deviceModelName": "32", "deviceManufacturerName": "Nipo", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 55, "deviceNumber": 35963, "simCardId": 163254, "simCardNumber": "637266265456051136", "deviceModelId": 5, "deviceModelName": "FMB640", "deviceManufacturerName": "Teltonika", "deviceTypeId": 2, "deviceTypeName": "GPS" }, { "deviceId": 56, "deviceNumber": 5379, "simCardId": 163253, "simCardNumber": "637266265456051135", "deviceModelId": 13, "deviceModelName": "2", "deviceManufacturerName": "Nipo", "deviceTypeId": 2, "deviceTypeName": "GPS" }]



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
