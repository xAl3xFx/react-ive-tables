import {useIntl} from 'react-intl';
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {LazyDataTableOld} from "../lib/LazyDataTableOld";
import axios from "axios";
import {LazyDataTable} from "../lib/LazyDataTable";
import {Calendar} from "primereact/calendar";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";

interface Props {

}

export const LazyDataTableExample : React.FC<Props> = props => {
    const {formatMessage: f} = useIntl();
    const didMountRef = useRef(false);
    const [companyId, setCompanyId] = useState<any>(1);

    useEffect(() => {
        if(!didMountRef.current) {
            didMountRef.current = true;
        }
    }, []);

    const fetchData = useCallback(async (offset: number, limit: number, filters: any, columns?: {[key: string] : string}, excelName?: string) => {
            const formattedFilters = Object.keys(filters).reduce((acc: any, el) => {
                if(filters[el].value)
                    return {...acc, [el] : filters[el].value}
                return acc;
            }, {});
            const response : any = await axios.post(`http://localhost:31051/api/company/getAllCompanies/${offset}/${limit}`, {filters: formattedFilters, columns, excelName});
            if(response.data.rows){
                if(response.data.rows instanceof Array)
                    return {
                        rows: response.data.rows,
                        totalRecords: response.data.count
                    }
                return {
                    rows: [],
                    totalRecords: 0
                }
            }else{
                return response;
            }

        },
        [companyId],
    );


    const getSpecialFilters = () => {
        return {
            createdAt: (options: any) => <Calendar showButtonBar value={options.value} showTime showSeconds showMillisec
                                                   onChange={(e) => options.filterApplyCallback(e.value, options.index)}
                                                   dateFormat="yy-mm-dd" placeholder={'Choose'}/>,
        }
    }

    return <>
        <InputText value={companyId} onChange={e => setCompanyId(e.target.value)} />
        <LazyDataTable xlsx={'ad'} refreshButton fetchData={fetchData} editableColumns={['CompanyName']} rowEditHandler={e => console.log(e)} columnOrder={['CompanyID', 'CompanyName', 'CompanyDetails', 'createdAt']} specialFilters={getSpecialFilters()} />
    </>
};