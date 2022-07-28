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

    const fetchData = useCallback(async (offset: number, limit: number, filters: any) => {
            const formattedFilters = Object.keys(filters).reduce((acc: any, el) => {
                if(filters[el].value)
                    return {...acc, [el] : filters[el].value}
                return acc;
            }, {});
            formattedFilters.companyId = +companyId;
            const response : any = await axios.post(`http://localhost:31051/api/company/getAllCompanies/${offset}/${limit}`, {filters: formattedFilters});
            console.log(response)
            if(response.data.rows instanceof Array)
                return {
                    rows: response.data.rows,
                    totalRecords: response.data.count
                }
            return {
                rows: [],
                totalRecords: 0
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
        <LazyDataTable refreshButton fetchData={fetchData} columnOrder={['CompanyID', 'CompanyName', 'CompanyDetails', 'createdAt']} specialFilters={getSpecialFilters()} />
    </>
};