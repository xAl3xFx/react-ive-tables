import {useIntl} from 'react-intl';
import * as React from 'react';
import {ReactElement, useEffect, useState} from 'react';
import {Button} from "primereact/button";
import {DataTableStateEvent, DataTableValue} from "primereact/datatable";
import {SpecialFilter, StringKeys} from "../ReactiveTable";
import {InputText} from "primereact/inputtext";
import {FloatLabel} from "primereact/floatlabel";

export type MobileFilters<T> = { [key in StringKeys<T>]: any };

interface Props<T extends DataTableValue> {
    onFilterApply: (filters: DataTableStateEvent) => void,
    initialFilters: MobileFilters<T>,
    filterColumns: StringKeys<T>[],
    specialFilters?: SpecialFilter<StringKeys<T>>;
    specialLabels?: { [key in StringKeys<T>]?: string; };
}

export const MobileFilters = <T extends DataTableValue>(props: Props<T>): ReactElement => {
    const {formatMessage: f} = useIntl();
    const [filters, setFilters] = useState<MobileFilters<T>>(props.initialFilters);

    const handleFilterForSpecificField = (columnName: StringKeys<T>) => ({
        filterApplyCallback: (value: any) => {
            setFilters(prev => ({
                ...prev,
                [columnName]: { ...prev[columnName], value }
            }));
        },
        value: filters[columnName].value
    });

    const renderFilters = () => {
        return props.filterColumns.map(columnName => {
                const filterOpts = handleFilterForSpecificField(columnName);
                const specialFilter = props.specialFilters?.[columnName];
                const input = specialFilter
                    ? specialFilter(filterOpts, columnName)
                    : (
                        <InputText
                            id={'filter-' + columnName}
                            type="text"
                            value={filters[columnName].value}
                            style={{minWidth: '100px'}}
                            onChange={(e) => filterOpts.filterApplyCallback(e.target.value)}
                        />
                    );

                let label: string = columnName;
                if(props.specialLabels && props.specialLabels[columnName]) {
                    label = props.specialLabels[columnName]
                }


                return (
                    <div key={columnName as string} className="p-field col-12 md:col-6">
                        <FloatLabel>
                            {input}
                            <label>{f({id: label})}</label>
                        </FloatLabel>
                    </div>
                );
            })
    }

    return (
        <>
            <div className="grid justify-content-center p-fluid mt-5">
                {renderFilters()}
            </div>

            <div className="grid justify-content-center p-fluid mt-3">
                <div className="col-12 md:col-3 lg:col-3 xl:col-2">
                    <Button
                        icon="pi pi-check"
                        type="button"
                        onClick={() => props.onFilterApply({ filters } as any)}
                        label={f({id: "applyFilters"})}
                    />
                </div>
                <div className="col-12 md:col-3 lg:col-3 xl:col-2">
                    <Button
                        icon="pi pi-times"
                        type="button"
                        onClick={() => setFilters(props.initialFilters)}
                        label={f({id: "reset"})}
                    />
                </div>
            </div>
        </>
    );
};

