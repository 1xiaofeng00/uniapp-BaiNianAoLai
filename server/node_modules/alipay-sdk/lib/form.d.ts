export interface IFile {
    name: string;
    path: string;
    fieldName: string;
}
export interface IField {
    name: string;
    value: string | Object;
}
declare class AliPayForm {
    private method;
    files: IFile[];
    fields: IField[];
    constructor();
    getFields(): IField[];
    getFiles(): IFile[];
    getMethod(): "get" | "post";
    /**
     * 设置 method
     * post、get 的区别在于 post 会返回 form 表单，get 返回 url
     */
    setMethod(method: 'get' | 'post'): void;
    addField(fieldName: string, fieldValue: any | Object): void;
    addFile(fieldName: string, fileName: string, filePath: string): void;
}
export default AliPayForm;
