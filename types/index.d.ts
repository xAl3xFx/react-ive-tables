export interface HeaderButton {
    onClick : ((e : any) => void) | undefined,
    icon?: string,
    className: string,
    tooltipLabel?: string,
    label?: string
}
