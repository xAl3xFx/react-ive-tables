import 'react-app-polyfill/ie11';
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import {Card} from "primereact/card";
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import {Button} from "primereact/button";
import {IntlProvider} from 'react-intl';
// @ts-ignore
import {ManyColumns} from "/src/ManyColumns";
import {useState} from "react";
// import {SWRConfig} from "swr";
import axios from "axios";
// @ts-ignore
import {FakeApi} from "/src/FakeApi";
// @ts-ignore
import {SimpleDT} from "/src//SimpleDT";
// @ts-ignore
import {TreeTableExample} from "/src/TreeTableExample";
import {ReactiveTable} from "react-ive-tables/src";
import {SWRConfig} from "swr";

const App = () => {
    const [selectedTable, setSelectedTable] = useState(<TreeTableExample />);

    return (
      <div className="App">
          <IntlProvider locale={"bg-BG"} onError={() => 0} messages={{"id" : "ID", "name" : "Name", 'type' : 'Type', 'size' : "Size", title: "Title", body: "Body", balance: 'balance', operations: 'operations', status: 'status', 'company' : 'company', date: 'date'}}>
              {/*<ReactiveTable columnOrder={["test"]} data={[{test: 2222}, {test: 12893}]} />*/}
              <SWRConfig value={{fetcher: (url) => axios(url, {withCredentials: true}).then(res => res.data)}}>
                  <Card>

                      <h1>Select Table</h1>
                      <div className={'p-mb-3'}>
                          <Button className={"p-mr-2"} onClick={() => setSelectedTable(<ManyColumns />)}>Many Columns</Button>
                          <Button className={"p-mr-2"} onClick={() => setSelectedTable(<FakeApi />)}>Fake Api</Button>
                          <Button className={"p-mr-2"} onClick={() => setSelectedTable(<SimpleDT />)}>Simple DT</Button>
                          <Button className={"p-mr-2"} onClick={() => setSelectedTable(<TreeTableExample />)}>TreeTable Example</Button>
                      </div>
                      {selectedTable}
                  </Card>
              </SWRConfig>
          </IntlProvider>
      </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
