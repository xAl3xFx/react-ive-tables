export interface HeaderButton {
    onClick : (() => void) | undefined,
    icon: string,
    className: string,
    tooltipLabel? : string
}