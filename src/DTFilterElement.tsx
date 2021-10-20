import * as React from 'react';
import { useIntl } from "react-intl";
import { useRef, useState} from "react";
import {Dropdown} from "primereact/dropdown";
import {Calendar} from "primereact/calendar";
import {InputText} from "primereact/inputtext";

interface Props {
    element : JSX.Element,
    onChange : (e: any) => void,
    cName: string,
    isDefault: boolean,
    type: string
}

export const DTFilterElement :  React.FC<Props> = (props) => {
    const {formatMessage : f} = useIntl();
    const [value, setValue] = useState();
    const [inputTimeout, setInputTimeout] = useState<any>(null);
    const options = [{value: 1, key: 1, label: "True"}, {value: 0, key:0, label: "False"}];
    const elRef = useRef<any>();

    const onChange = (e : any) => {
        if(inputTimeout)
            clearTimeout(inputTimeout);

        const timeout = setTimeout(() => {
            e.target.name = props.cName;
            setValue(e.value);
            props.onChange(e);
    
            //If trash button is clicked
            if(e.value === ""){
                //If the filter is a Calendar then manually remove the inner text of the input
    
                // @ts-ignore
                if(!elRef.current instanceof Calendar)
                    return;
                elRef.current.container.childNodes[0].value = ""
            }    
        }, 200);
        setInputTimeout(timeout);
    };

    const renderElement = () => {
        //TODO : Implement for other elements
        if(props.type === "dropdown"){
            if(props.element.props.itemTemplate) 
                return <Dropdown showClear placeholder={f({id: "chooseLabel"})} appendTo={document.getElementById("safe-dropdown")} options={props.element.props.options} itemTemplate={(option: any) => props.element.props.itemTemplate(option)} onChange={onChange} value={value} />
            else
                return <Dropdown showClear placeholder={f({id: "chooseLabel"})} appendTo={document.getElementById("safe-dropdown")} options={props.element.props.options} onChange={onChange} value={value} />                
        } else if(props.type === 'calendar'){
             return <Calendar onChange={onChange} placeholder={f({id: "chooseDate"})} value={value} showButtonBar readOnlyInput />
        } else {
            return <InputText onChange={onChange} value={value}/>
        }
    };

    const onDataTableFocus = () => {
        //If the filter is a Calendar then set the style of the datepicker to fix its width
        // @ts-ignore
        if(!elRef.current instanceof Calendar)
            return;
        if(elRef.current.container.querySelector(".p-datepicker") !== undefined && elRef.current.container.querySelector(".p-datepicker") !== null)
            elRef.current.container.querySelector(".p-datepicker").classList.add("datatableCalendar");
    };

    return <>
        {renderElement()}
        </>

    // return <>
    // {props.isDefault ?
    //     React.cloneElement(props.element, {onChange: onChange, value: value})
    //     :
    //     React.cloneElement(props.element, {onChange: onChange, ref : elRef, value : value, onFocus : onDataTableFocus})
    //
    //  }
    //  </>
};

// const DTFilterElement = forwardRef((props : Props, ref) => {
//
//     // The component instance will be extended
//     // with whatever you return from the callback passed
//     // as the second argument
//
//
//     const {formatMessage : f} = useIntl();
//     const [value, setValue] = useState("");
//     const options = [{value: 1, key: 1, label: "True"}, {value: 0, key:0, label: "False"}];
//
//     const onChange = (e : any) => {
//         e.target.name = props.cName;
//         setValue(e.value);
//         props.onChange(e);
//     };
//
//     useImperativeHandle(ref, () => ({
//
//         clearFilter() {
//             setValue("");
//         }
//     }));
//
//     const clearFilter = () => {
//
//     }
//
//     return <>
//     {props.isDefault ?
//         React.cloneElement(props.element, {onChange: onChange, value: value, style: {width: "80%"}})
//         :
//         // React.cloneElement(props.element, {onChange: onChange, value: value, style: {width: "80%"}})
//         <div style = {{display:"inline-flex"}}>
//             <InputGroup.Prepend>
//                 <InputGroup.Text id="inputGroupPrepend"><i className="pi pi-trash" style={{cursor: "pointer"}} onClick={() => clearFilter()} /></InputGroup.Text>
//             </InputGroup.Prepend>
//             {React.cloneElement(props.element, {onChange: onChange, value : value, style : {width: "80%"}, onFocus : () => alert(35) })}
//             {console.log(props.element)}
//         </div>
//             // <div className="p-inputgroup">
//             //      <Button  icon="pi pi-trash" onClick={() => setValue("")}/>
//             //     {React.cloneElement(props.element, {onChange: onChange, value : value, style : {width: "80%"}})}
//             //  </div>
//          }
//
//
//     </>
// });
//
// export default DTFilterElement
