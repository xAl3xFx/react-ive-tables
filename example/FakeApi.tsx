import {useIntl} from 'react-intl';
import * as React from 'react';
import {ReactElement, useEffect, useRef, useState} from 'react';
import {ReactiveTable} from "../src/ReactiveTable";
import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";
import useSWR from "swr";
import {LazyFetchingService} from "./lib/lazy-fetching-service";
import {Tag} from "primereact/tag";
import {HeaderButton} from "../src";

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

export interface LazyResponse<T> {
    rows: T[];
    totalRecords: number;
}

const lazyFetchingService = new LazyFetchingService();

export const FakeApi: React.FC<Props> = props => {
        const {formatMessage: f} = useIntl();
        const didMountRef = useRef(false);
        const [contextMenu, setContextMenu] = useState<any>([]);
        const [selection, setSelection] = useState<'single' | 'checkbox'>('single');
        const [rebuildColumns, setRebuildColumns] = useState<number>();
        const [resetFilters, setResetFilters] = useState<number>();
        const [isMobile, setIsMobile] = useState(false);

        const fetcher = lazyFetchingService.getLazyFetcher;
        const fetchData = lazyFetchingService.getDataFetcher;

        const {data: allRecords} = useSWR<Awaited<ReturnType<typeof fetcher>>, Error>("https://dummyjson.com/products", {fetcher: fetcher});

        useEffect(() => {
            if (!didMountRef.current) {
                didMountRef.current = true;
            }
        }, []);

        const test = () => {
            if (contextMenu === undefined) {
                setContextMenu([]);
                setSelection('single');
            } else {
                setContextMenu(undefined);
                setSelection('checkbox');
            }

            setRebuildColumns(new Date().getTime())
        }

        useEffect(() => {
            if (allRecords && allRecords.rows) setRebuildColumns(Date.now());
        }, [allRecords])

        const brandOptions = allRecords?.rows?.map(product => {
            return {
                id: product.brand,
                key: product.brand,
                description: product.brand
            }

        })


        const getSpecialFilters = () => {
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


        const getColumnTemplate = () => {
            return {
                'operations': (rowData: any) => <><Button icon={'pi pi-plus'} className={'p-mr-3'}/><Button
                    icon={'pi pi-minus'}/></>
            }
        }

        const getMobileTemplate = (rowData: Product): ReactElement => {
            console.log("THE ROWDATA IS: ", rowData);
            return <div className="col-12" key={rowData.id}>
                <div
                    className={'flex flex-column xl:flex-row xl:align-items-start p-4 gap-4'}>
                    <div
                        className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div className="text-2xl font-bold text-900">{rowData.title}</div>
                            <div className="flex align-items-center gap-3">
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-tag"></i>
                                    <span className="font-semibold">{rowData.description}</span>
                                </span>
                                <Tag value={rowData.rating} severity={"info"}></Tag>
                            </div>
                        </div>
                        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                            <span className="text-2xl font-semibold">${rowData.price}</span>
                            <Button icon="pi pi-shopping-cart" className="p-button-rounded"
                            />
                        </div>
                    </div>
                </div>
            </div>
        }


        useEffect(() => {
            setIsMobile(window.innerWidth <= 1920);
            const onResize = () => {
                setIsMobile(window.innerWidth <= 1920);
            }
            window.addEventListener("resize", (onResize));

            return () => window.removeEventListener('resize', onResize);
        }, []);

    const headerButtons: HeaderButton[] = [
        {
            onClick: () => 0,
            icon: 'pi pi-plus',
            className: 'p-button-success',
            label: f({id: "create"})
        }
        ]


        return <>
            <Button onClick={() => test()}>Trigger multiple selection</Button>
            <Button onClick={() => setResetFilters(new Date().getTime())}>Reset Filters</Button>
            {/*<ReactiveTable data={allRecords?.rows || []} swr*/}
            {/*               totalRecords={allRecords?.totalRecords || 0}*/}
            {/*               fetchData={fetchData}*/}
            {/*               frozenColumns={['title', 'operations']}*/}
            {/*               columnOrder={['title', 'description', 'price', 'rating', 'brand', 'operations']}*/}
            {/*               setSelected={() => 0}*/}
            {/*               selectionMode={selection}*/}
            {/*               doubleClick={console.log}*/}
            {/*               contextMenu={contextMenu}*/}
            {/*               columnTemplate={getColumnTemplate()}*/}
            {/*               specialFilters={getSpecialFilters()}*/}
            {/*               resetFilters={resetFilters}*/}
            {/*               rebuildColumns={rebuildColumns}*/}
            {/*               selectionResetter={rebuildColumns}*/}
            {/*               paginatorOptions={[5, 10, 20]}*/}
            {/*/>*/}

            <ReactiveTable fetchData={fetchData} swr
                           showSkeleton={false}
                           totalRecords={allRecords?.totalRecords || 0}
                           data={allRecords?.rows || []}
                           mobileDataTemplate={getMobileTemplate}
                           isMobile={isMobile}
                           showHeader={true}
                           headerButtons={headerButtons}
                           columnOrder={['title', 'description', 'price', 'rating', 'brand', 'operations']}
                           rebuildColumns={rebuildColumns}
                           ignoreFilters={isMobile ? ["description"] : []}
                           specialFilters={getSpecialFilters()}
                           specialLabels={{
                               title: "TEST"
                           }}

            />
        </>
    }
;
