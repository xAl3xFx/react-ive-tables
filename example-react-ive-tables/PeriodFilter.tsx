import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {useIntl} from "react-intl";
import {Calendar} from "primereact/calendar";
import {ListBox} from "primereact/listbox";
import moment from "moment";
import {Button} from "primereact/button";
import {ColumnFilterElementTemplateOptions} from "primereact/column";

interface Props {
    filterOptions: ColumnFilterElementTemplateOptions;
    maxToday?: boolean;
    initialValue?: SupportedPeriods;
    showSelectedPeriod?: boolean;
}

type SupportedPeriods = 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'thisWeek' | 'thisMonth';

export const PeriodFilter: React.FC<Props> = props => {
    const {formatMessage: f} = useIntl();
    const [selectedPeriod, setSelectedPeriod] = useState<SupportedPeriods>();

    const calendarRef = useRef<Calendar | null>(null);

    const periodOptions: { name: string, value: SupportedPeriods }[] = [
        {name: f({id: 'today'}), value: 'today'},
        {name: f({id: 'yesterday'}), value: 'yesterday'},
        {name: f({id: 'last7Days'}), value: 'last7Days'},
        {name: f({id: 'last30Days'}), value: 'last30Days'},
        {name: f({id: 'thisWeek'}), value: 'thisWeek'},
        {name: f({id: 'thisMonth'}), value: 'thisMonth'}
    ];

    useEffect(() => {
        if (props.initialValue) {
            setSelectedPeriod(props.initialValue);
        }
    }, [props.initialValue]);

    useEffect(() => {
        if (selectedPeriod && calendarRef.current && props.showSelectedPeriod) {
            setTimeout(() => {
                if (calendarRef.current) {
                    const value = periodOptions.find(el => el.value === selectedPeriod)?.name;
                    const input = calendarRef.current?.getInput();
                    if (value && input) {
                        input.value = value;
                    }
                }
            }, 100)
        }
    }, [selectedPeriod, props.showSelectedPeriod]);

    useEffect(() => {
        console.log(props.filterOptions)
    }, [props.filterOptions])

    useEffect(() => {
        if (!props.filterOptions.filterApplyCallback) return;

        const today = moment();
        switch (selectedPeriod) {
            case "today": {
                props.filterOptions.filterApplyCallback([today.toDate(), today.toDate()]);
                break;
            }
            case "yesterday": {
                const yesterday = today.add(-1, 'day');
                props.filterOptions.filterApplyCallback([yesterday.toDate(), yesterday.toDate()]);
                break;
            }
            case "last7Days": {
                const sevenDaysAgo = today.clone().add(-7, 'days');
                props.filterOptions.filterApplyCallback([sevenDaysAgo.toDate(), today.toDate()]);
                break;
            }
            case "last30Days": {
                const thirtyDaysAgo = today.clone().add(-1, 'month');
                props.filterOptions.filterApplyCallback([thirtyDaysAgo.toDate(), today.toDate()]);
                break;
            }
            case "thisWeek": {
                const startOfWeek = today.clone().startOf('week');
                props.filterOptions.filterApplyCallback([startOfWeek.toDate(), today.toDate()]);
                break;
            }
            case "thisMonth": {
                const startOfMonth = today.clone().startOf('month');
                props.filterOptions.filterApplyCallback([startOfMonth.toDate(), today.toDate()]);
                break;
            }
            default: {
                // props.filterOptions?.filterApplyCallback(null);
                break;
            }
        }
        calendarRef.current?.hide();
    }, [selectedPeriod]);

    const handleClear = () => {
        setSelectedPeriod(undefined);
        props.filterOptions.filterApplyCallback(null);
        calendarRef.current?.hide();
    }

    const footerTemplate = () => {
        return <div className={'flex flex-column justify-content-between h-full'}>
            <ListBox options={periodOptions} optionLabel="name" optionValue={'value'} value={selectedPeriod}
                     onChange={e => setSelectedPeriod(e.value)}/>
            <Button label={f({id: 'reset'})} type={'button'} onClick={handleClear}/>
        </div>
    }

    return <>
        <div>

            <Calendar
                ref={calendarRef}
                value={props.filterOptions.value}
                pt={{
                    panel: {className: 'w-auto p-0 min-w-min flex flex-row-reverse'},
                    day: {className: 'p-1 w-1rem'},
                    dayLabel: {className: 'w-1rem h-2rem px-3 m-0 border-none'},
                    buttonbar: {className: 'p-1'},
                    table: {className: 'm-0'},
                    header: {className: 'p-1'},
                    groupContainer: {children: <h1>asd</h1>}
                }}
                showIcon={true}
                selectionMode={'range'}
                placeholder={f({id: 'chooseLabel'})}
                readOnlyInput
                hideOnRangeSelection={true}
                showOtherMonths={false}
                footerTemplate={footerTemplate}

                // showButtonBar
                maxDate={props.maxToday ? new Date(new Date().setHours(23, 59, 59)) : undefined}
                onChange={(e) => props.filterOptions.filterApplyCallback(e.value)}
            />

        </div>
    </>
};

