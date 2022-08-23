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

const App = () => {
    const [selectedTable, setSelectedTable] = useState(<ManyColumns />);
  return (
      <div className="App">
          <IntlProvider locale={"bg-BG"} messages={{"id" : "ID", "name" : "Name", 'type' : 'Type', 'size' : "Size", title: "Title", body: "Body", balance: 'balance'}}>
              <Card>

                  <h1>Select Table</h1>
                  <div className={'p-mb-3'}>
                      <Button className={"p-mr-2"} onClick={() => setSelectedTable(<ManyColumns />)}>Many Columns</Button>

                  </div>
                  {selectedTable}
              </Card>
          </IntlProvider>
      </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));