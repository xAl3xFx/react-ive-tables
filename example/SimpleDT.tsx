import {useIntl} from 'react-intl';
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import {ReactiveTable} from "../src";
import data from './lib/customers.json';

interface Props {

}

export const SimpleDT: React.FC<Props> = props => {
    const didMountRef = useRef(false);

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
        }
    }, []);

    return <>
        <ReactiveTable data={data.data} totalRecords={data.data.length}
                       sortableColumns={['id', 'name']}
                       showHeader={false}
                       showSkeleton={false}
                       columnTemplate={{}}
                       columnStyle={{operations: {body: {width: "15%"}, header: {}}}}
                       specialFilters={{}}
                       selectionKey={'id'}
                       ignoreFilters={['operations']}
                       selectionMode="single"
                       columnOrder={['id', 'name', 'country.name', 'date', 'status', 'operations']}
                       selectedIds={[]}
        />
    </>
};
