import {useIntl} from 'react-intl';
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import {ReactiveTable} from "../src";
import data from './lib/customers.json';

interface Props {

}

export const SimpleDT: React.FC<Props> = props => {
    const didMountRef = useRef(false);

    const [selectedRow, setSelectedRow] = useState<any>();

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
        }
    }, []);

    const handleSelection = (e:any) => {
        console.log("SELECTING", e);
        setSelectedRow(e);
    }

    return <>
        <ReactiveTable data={data.data}
                       sortableColumns={['id', 'name']}
                       setSelected={handleSelection}
                       selectionMode="single"
                       selectionKey={'id'}
                       ignoreFilters={['operations']}
                       columnOrder={['id', 'name', 'country.name', 'date', 'status', 'operations']}
        />
    </>
};
