import * as React from "react";
import {useEffect, useState} from "react";
import {DataView, DataViewPageEvent} from "primereact/dataview";
import {FilterMatchMode} from "primereact/api";
import {FiltersMatchMode} from "../ReactiveTable";
import {DataTableStateEvent} from "primereact/datatable";

interface Props<T, K extends string> {
    data: T[];
    totalRecords: number;
    paginator: boolean;
    rows: number;
    first: number;
    lazy: boolean;
    rowTemplate: (rowData: T) => any;
    filters: Filters<T>;
    filtersMatchMode: FiltersMatchMode<K>;
    onPage: (event: DataTableStateEvent) => void;
    selectionMode?: boolean;
    selectedRecords?: (record: T[]) => void;
    selectionKey?: keyof T;
    splitButtonItems?: any[];
}

type Filters<T> = {
    [key in keyof Partial<T>]: (string | number | boolean)[] | string | number | boolean
}

export const MobileDataView = <T, K extends string>(props: Props<T, K>) => {
    const [data, setData] = useState<T[]>();
    const [filteredData, setFilteredData] = useState<T[]>();
    const [selectedItems, setSelectedItems] = useState<T[]>([]);

    useEffect(() => {
        if (props.data) {
            setData(props.data);
        }
    }, [props.data])

    useEffect(() => {
        if (props.filters && Object.values(props.filters).some((filter: any) => filter.value !== null) && data) {
            const filteredDataTemp = handleFilter({...props.filters}, [...data]);
            setFilteredData(filteredDataTemp);
        } else {
            setFilteredData(data);
        }
    }, [props.filters, data]);

    useEffect(() => {
        console.log("filtered data changed", filteredData)
    }, [filteredData])

    useEffect(() => {
        if (!props.selectionMode) setSelectedItems([]);
    }, [props.selectionMode])

    const handleFilter = (filters: Filters<T>, data: T[]) => {
        let filteredDataTemp = [...data];
        (Object.keys(filters)).forEach((key) => {
            if (filters[key]) {
                let currentMatchMode: FilterMatchMode | undefined = undefined;
                if (props.filtersMatchMode && props.filtersMatchMode[key]) {
                    currentMatchMode = props.filtersMatchMode[key]
                } else {
                    currentMatchMode = FilterMatchMode.CONTAINS;
                }
                filteredDataTemp = filteredDataTemp.filter((el: T) => {
                    switch (currentMatchMode) {
                        case FilterMatchMode.IN || FilterMatchMode.CONTAINS:
                            //@ts-ignore
                            return filters[key].includes(el[key]);
                        case FilterMatchMode.EQUALS:
                            return filters[key] === el[key];
                        default :
                            return true;
                    }
                })
            }
        })
        return filteredDataTemp;
    }

    return <>
        <DataView value={data}
                  first={props.first}
                  onPage={(e: DataViewPageEvent) => props.onPage(e as DataTableStateEvent)}
                  itemTemplate={props.rowTemplate}
                  layout={"list"}
                  lazy={props.lazy}
                  totalRecords={props.totalRecords}
                  rows={props.rows}
                  paginator={true}
        />
    </>
}
