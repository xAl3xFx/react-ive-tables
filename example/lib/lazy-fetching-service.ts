import {mutate} from "swr";
import axios from 'axios'
import {FetchDataParams} from "../../src";
import {Product} from "../FakeApi";

export interface LazyFetchingServiceParams {
    key: string;
}

export type SuccessResult = { rows: Product[], totalRecords: number };

export interface FakeApiResponse {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}

export class LazyFetchingService {
    private key?: string = undefined;
    private limit: number = 20;
    private offset: number = 0;
    private filters: any = {};
    private page: number = 0;
    private isFirstFetch: boolean = true;

    constructor(limit?: number) {
        this.limit = limit || 20;
        this.offset = 0;
        this.page = 0;
        this.getLazyFetcher = this.getLazyFetcher.bind(this);
        this.getDataFetcher = this.getDataFetcher.bind(this);
        this.getServiceFetcher = this.getServiceFetcher.bind(this);
        this.clearState = this.clearState.bind(this);
    }

    clearState = () => {
        this.limit = 20;
        this.offset = 0;
        this.page = 0;
        this.filters = {};
        mutate(this.key);
    }

    async getLazyFetcher(...args: any): Promise<SuccessResult> {
        try {
            const params = args[0];
            this.key = params;
            const res = await axios.get<FakeApiResponse>(`${params}`, {
                data: {isSWR: true},
                params: {limit: this.limit, skip: this.offset, filterQuery: JSON.stringify(this.filters)}
            });

            console.log({rows: res.data.products, totalRecords: res.data.total})
            return {rows: res.data.products, totalRecords: res.data.total};
        } catch (err) {
            console.error(err);
            return {rows: [], totalRecords: 0, };
        }
    }


    async getDataFetcher({limit, offset, page, filters}: FetchDataParams): Promise<void> {
        const parsedFilters = filters ? Object.keys(filters).reduce((acc: any, key: string) => {
            //Handle multiselect with empty array.
            if (Array.isArray(filters[key].value) && filters[key].value.length === 0) return acc;

            if (filters[key].value !== null && filters[key].value !== '' && filters[key].value !== undefined)
                return {...acc, [key]: String(filters[key].value)}
            return acc
        }, {}) : {};
        this.isFirstFetch = false;

        // if (this.key === "/vehicles" && parsedFilters && parsedFilters.vehicleModelName !== undefined)
        //     parsedFilters["vehicleModelId"] = parsedFilters.vehicleModelName;

        this.limit = limit;
        this.offset = offset;
        this.filters = parsedFilters;
        if (page) this.page = page;
        await mutate(this.key);
    }

    async getServiceFetcher<T>(...args: any): Promise<T | undefined> {
        try {
            const params = args[0];
            const res = await axios.get<T>(`${params[0]}`, {data: {isSWR: true}});
            return res.data;
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }
}
