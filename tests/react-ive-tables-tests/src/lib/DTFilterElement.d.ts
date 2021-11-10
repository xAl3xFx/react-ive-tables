import * as React from 'react';
interface Props {
    element: JSX.Element;
    onChange: (e: any) => void;
    cName: string;
    isDefault: boolean;
    type: string;
}
export declare const DTFilterElement: React.FC<Props>;
export {};
