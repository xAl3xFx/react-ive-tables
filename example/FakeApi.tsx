import {useIntl} from 'react-intl';
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import {FetchDataParams, ReactiveTable} from "../src/ReactiveTable";
import axios from "axios";
import {Button} from "primereact/button";
import products from './lib/products.json'

interface Props {

}

export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
    category: string;
    thumbnail: string;
    images: string[];
}

export interface FakeApiResponse {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}

export interface LazyResponse<T> {
    rows: T[];
    totalRecords: number;
}


export const FakeApi : React.FC<Props> = props => {
    const {formatMessage: f} = useIntl();
    const didMountRef = useRef(false);
    const [contextMenu, setContextMenu] = useState<any>([]);
    const [selection, setSelection] = useState<'single' | 'checkbox'>('single');
    const [rebuildColumns, setRebuildColumns] = useState<number>();

    useEffect(() => {
        if(!didMountRef.current) {
            didMountRef.current = true;
        }
    }, []);

    const test = () => {
        if(contextMenu === undefined){
            setContextMenu([]);
            setSelection('single');
        }else {
            setContextMenu(undefined);
            setSelection('checkbox');
        }

        setRebuildColumns(new Date().getTime())
    }

    const fetcher = ({offset, limit, filters, columns, excelName} : FetchDataParams): Promise<LazyResponse<Product>> => {
        const parsedFilters = Object.keys(filters).reduce((acc, key) => {
            //Handle multiselect with empty array.
            if (Array.isArray(filters[key].value) && filters[key].value.length === 0) return acc;

            if (filters[key].value !== null && filters[key].value !== '' && filters[key].value !== undefined)
                return {...acc, [key]: String(filters[key].value)}
            return acc
        }, {});

        return new Promise(resolve => {
            axios.get<FakeApiResponse>("https://dummyjson.com/products", {params: {skip: offset, limit: limit}}).then(res => {
                resolve({
                    rows: res.data.products,
                    totalRecords: res.data.total
                });
            }).catch(err => {
                console.error(err);
                resolve({totalRecords: 0, rows: []});
            })
        })
    }


    return <>
        <Button onClick={() => test()} >Trigger multiple selection</Button>
        <ReactiveTable fetchData={fetcher} columnOrder={['title', 'description', 'price', 'rating', 'brand']} setSelected={() => 0} selectionMode={selection} contextMenu={contextMenu} rebuildColumns={rebuildColumns} selectionResetter={rebuildColumns} />
    </>
};
