import {useIntl} from 'react-intl';
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import {FetchDataParams, ReactiveTable} from "react-ive-tables";
import axios from "axios";
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";

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


export const FakeApi: React.FC<Props> = props => {
    const {formatMessage: f} = useIntl();
    const didMountRef = useRef(false);
    const [contextMenu, setContextMenu] = useState<any>([]);
    const [selection, setSelection] = useState<'checkbox'>('checkbox');
    const [rebuildColumns, setRebuildColumns] = useState<number>();
    const [resetFilters, setResetFilters] = useState<number>();
    const [products, setProducts] = useState<Product[]>();

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
        }
    }, []);

    const test = () => {
        if (contextMenu === undefined) {
            setContextMenu([]);
            // setSelection('single');
        } else {
            setContextMenu(undefined);
            setSelection('checkbox');
        }

        setRebuildColumns(new Date().getTime())
    }

    const fetcher = ({offset, limit, filters, columns, excelName}: FetchDataParams): Promise<LazyResponse<Product>> => {
        const parsedFilters = Object.keys(filters).reduce((acc, key) => {
            //Handle multiselect with empty array.
            if (Array.isArray(filters[key].value) && filters[key].value.length === 0) return acc;

            if (filters[key].value !== null && filters[key].value !== '' && filters[key].value !== undefined)
                return {...acc, [key]: String(filters[key].value)}
            return acc
        }, {});

        return new Promise(resolve => {
            axios.get<FakeApiResponse>("https://dummyjson.com/products", {
                params: {
                    skip: offset,
                    limit: limit
                }
            }).then(res => {
                console.log('aaa')
                setProducts(res.data.products);
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

    const brandOptions = (products || []).map((el) => {
        return {
            id: el.brand,
            key: el.brand,
            description: el.brand
        }
    })

    const getSpecialFilters = () => {
        console.log(brandOptions)
        return {
            brand: (options: any) => <Dropdown filter={true} showClear value={options.value}
                                               resetFilterOnHide
                                               options={brandOptions}
                                               optionValue={'id'} optionLabel={'description'}
                                               placeholder={f({id: 'chooseLabel'})}
                                               onChange={(e) => options.filterApplyCallback(e.value)}
                                               style={{textAlign: "left"}}/>,
        }
    }

    useEffect(() => {
        setRebuildColumns(Date.now())
    }, [products]);


    const getColumnTemplate = () => {
        return {
            'operations' : (rowData: any) => <><Button icon={'pi pi-plus'} className={'p-mr-3'}/><Button icon={'pi pi-minus'} /></>
        }
    }

    return <>
        <Button onClick={() => test()}>Trigger multiple selection</Button>
        <Button onClick={() => setResetFilters(new Date().getTime())}>Reset Filters</Button>
        <ReactiveTable fetchData={fetcher}
                        frozenColumns={['title', 'operations']}
                        columnOrder={['title', 'description', 'price', 'rating', 'brand', 'operations']}
                        setSelected={() => 0}
                        selectionMode={selection}
                        doubleClick={console.log}
                        contextMenu={contextMenu}
                        columnTemplate={getColumnTemplate()}
                        specialFilters={getSpecialFilters()}
                        resetFilters={resetFilters}
                        rebuildColumns={rebuildColumns}
                        selectionResetter={rebuildColumns}
                        paginatorOptions={[5, 10, 20]}
        />
    </>
};
