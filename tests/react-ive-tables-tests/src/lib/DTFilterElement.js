"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DTFilterElement = void 0;
const React = __importStar(require("react"));
const react_intl_1 = require("react-intl");
const react_1 = require("react");
const dropdown_1 = require("primereact/dropdown");
const calendar_1 = require("primereact/calendar");
const inputtext_1 = require("primereact/inputtext");
const DTFilterElement = (props) => {
    const { formatMessage: f } = (0, react_intl_1.useIntl)();
    const [value, setValue] = (0, react_1.useState)();
    const [inputTimeout, setInputTimeout] = (0, react_1.useState)(null);
    const options = [{ value: 1, key: 1, label: "True" }, { value: 0, key: 0, label: "False" }];
    const elRef = (0, react_1.useRef)();
    const onChange = (e) => {
        if (inputTimeout)
            clearTimeout(inputTimeout);
        const timeout = setTimeout(() => {
            e.target.name = props.cName;
            setValue(e.value);
            props.onChange(e);
            if (e.value === "") {
                if (!elRef.current instanceof calendar_1.Calendar)
                    return;
                elRef.current.container.childNodes[0].value = "";
            }
        }, 200);
        setInputTimeout(timeout);
    };
    const renderElement = () => {
        if (props.type === "dropdown") {
            if (props.element.props.itemTemplate)
                return React.createElement(dropdown_1.Dropdown, { showClear: true, placeholder: f({ id: "chooseLabel" }), appendTo: document.getElementById("safe-dropdown"), options: props.element.props.options, itemTemplate: (option) => props.element.props.itemTemplate(option), onChange: onChange, value: value });
            else
                return React.createElement(dropdown_1.Dropdown, { showClear: true, placeholder: f({ id: "chooseLabel" }), appendTo: document.getElementById("safe-dropdown"), options: props.element.props.options, onChange: onChange, value: value });
        }
        else if (props.type === 'calendar') {
            return React.createElement(calendar_1.Calendar, { onChange: onChange, placeholder: f({ id: "chooseDate" }), value: value, showButtonBar: true, readOnlyInput: true });
        }
        else {
            return React.createElement(inputtext_1.InputText, { onChange: onChange, value: value });
        }
    };
    const onDataTableFocus = () => {
        if (!elRef.current instanceof calendar_1.Calendar)
            return;
        if (elRef.current.container.querySelector(".p-datepicker") !== undefined && elRef.current.container.querySelector(".p-datepicker") !== null)
            elRef.current.container.querySelector(".p-datepicker").classList.add("datatableCalendar");
    };
    return React.createElement(React.Fragment, null, renderElement());
};
exports.DTFilterElement = DTFilterElement;
