import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {IntlProvider} from "react-intl";
import {Card} from "primereact/card";
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import {Button} from "primereact/button";
import {ManyColumns} from "./ManyColumns";
import {useState} from "react";
import {SWRConfig} from "swr";
import axios from "axios";
import {FakeApi} from "./FakeApi";
import {SimpleDT} from "./SimpleDT";

const App = () => {
    const [selectedTable, setSelectedTable] = useState(<FakeApi />);
  return (
      <div className="App">
          <IntlProvider locale={"bg-BG"} onError={() => 0} messages={{"id" : "ID", "name" : "Name", 'type' : 'Type', 'size' : "Size", title: "Title", body: "Body", balance: 'balance', operations: 'operations', status: 'status', 'company' : 'company', date: 'date'}}>
              <SWRConfig value={{fetcher: (url) => axios(url, {withCredentials: true}).then(res => res.data)}}>
                  <Card>

                      <h1>Select Table</h1>
                      <div className={'p-mb-3'}>
                          <Button className={"p-mr-2"} onClick={() => setSelectedTable(<ManyColumns />)}>Many Columns</Button>
                          <Button className={"p-mr-2"} onClick={() => setSelectedTable(<FakeApi />)}>Fake Api</Button>
                          <Button className={"p-mr-2"} onClick={() => setSelectedTable(<SimpleDT />)}>Simple DT</Button>
                      </div>
                      {selectedTable}
                  </Card>
              </SWRConfig>
          </IntlProvider>
      </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
