import {RefObject} from "react";

export interface HeaderButton {
    onClick : ((e : any) => void) | undefined;
    icon?: string;
    className: string;
    tooltipLabel?: string;
    label?: string;
    ref?: RefObject<any>
}
