import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Slider } from 'primereact/slider';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import './DataTableDemo.css';

export const DataTableFilterDemo = (props : any) => {
    const [customers2, setCustomers2] = useState([]);
    const [filters2, setFilters2] = useState<any>({
        'name': { value: null, matchMode: "contains" },
        'country.name': { value: null, matchMode: "contains" },
        'representative': { value: null, matchMode: "contains" },
        'status': { value: null, matchMode: "contains" },
        'verified': { value: null, matchMode: "contains" }
    });
    useEffect(() => {
        setCustomers2(props.data);
    
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="datatable-filter-demo">
            <div className="card">
                <h5>Filter Row</h5>
                <p>Filters are displayed inline within a separate row.</p>
                <DataTable value={customers2} paginator className="p-datatable-customers" rows={10}
                    dataKey="id" filters={filters2} filterDisplay="row"  responsiveLayout="scroll"
                    emptyMessage="No customers found." >
                    <Column field="name" header="Name" filter style={{ minWidth: '12rem' }} />
                    

                    
                </DataTable>
            </div>
        </div>
    );
}
           