import { useIntl } from 'react-intl';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { LazyDataTableOld } from "../lib/LazyDataTableOld";
import axios from "axios";
import { LazyDataTable } from "../lib/LazyDataTable";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

interface Props {

}

export const LazyDataTableExample: React.FC<Props> = props => {
    const { formatMessage: f } = useIntl();
    const didMountRef = useRef(false);
    const [range, setRange] = useState<any>();
    const [companyId, setCompanyId] = useState<any>(1);

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
        }
    }, []);

    const fetchData = useCallback(async (offset: number, limit: number, filters: any, columns?: { [key: string]: string }, excelName?: string) => {
        // const formattedFilters = Object.keys(filters).reduce((acc: any, el) => {
        //     if (filters[el].value)
        //         return { ...acc, [el]: filters[el].value }
        //     return acc;
        // }, {});
        // const response: any = await axios.post(`http://localhost:31050/api/company/getAllCompanies/${offset}/${limit}`, { filters: formattedFilters, columns, excelName });
        // if (response.data.rows) {
        //     if (response.data.rows instanceof Array)
        //         return {
        //             rows: response.data.rows,
        //             totalRecords: response.data.count
        //         }
        //     return {
        //         rows: [],
        //         totalRecords: 0
        //     }
        // } else {
        //     return response;
        // }


        const parsedFilters = Object.keys(filters).reduce((acc: any, key: string) => {
            if (filters[key].value !== "")
                return { ...acc, [key]: filters[key].value }
            return acc
        }, {})
        parsedFilters.companyId = companyId;
        return new Promise<{ rows: any; totalRecords: number; }>((resolve, reject) => {
            axios.post(`http://localhost:31050/api/transactions/getAllTransactions/${offset}/${limit}`, { filters: parsedFilters })
                .then(response => {
                    //@ts-ignore
                    const totalRecords = response.data.count;
                    //@ts-ignore
                    resolve({ totalRecords, rows: response.data.rows })
                })
                .catch(reject)
        });


    },
        [companyId],
    );


    const getSpecialFilters = () => {
        return {
            createdAt: (options: any) => <Calendar showButtonBar value={options.value} showTime showSeconds showMillisec
                onChange={(e) => options.filterApplyCallback(e.value, options.index)}
                dateFormat="yy-mm-dd" placeholder={'Choose'} />,
        }
    }

    const handleRangeChange = (value: Date[] | Date | undefined) => {
        if (value && Array.isArray(value)) {
            value[0].setHours(0);
            value[0].setMinutes(0);
            value[0].setSeconds(0);
            value[0].setMilliseconds(0);
        }
        if (value && Array.isArray(value) && value.length === 2 && value[1] !== null) {
            value[1].setHours(23);
            value[1].setMinutes(59);
            value[1].setSeconds(59);
            value[1].setMilliseconds(999);
        }

        setRange(value);
    };

    return <>
        {/* <InputText value={companyId} onChange={e => setCompanyId(e.target.value)} /> */}

        <div className={"p-grid p-fluid p-justify-center p-mt-5"}>
            <div className="p-field p-col-3">
                <span className="p-float-label">
                    <Calendar value={range} onChange={e => handleRangeChange(e.value)} selectionMode={'range'} showButtonBar readOnlyInput />
                    <label>{f({ id: "period" })}</label>
                </span>
            </div>
        </div>

        <LazyDataTable columnOrder={['typeName', 'amount', 'dateAndTime', 'description']}
            specialLabels={{ typeName: 'type' }}
            additionalFilters={{ period: { value: range ? range.map((el: any) => el ? el.getTime() : null) : null, matchMode: 'contains' } }}
            fetchData={fetchData} selectionMode={"single"} selectionKey="CompanyName" />
    </>
};