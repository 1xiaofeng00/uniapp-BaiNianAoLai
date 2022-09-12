"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author tudou527
 * @email [tudou527@gmail.com]
*/
const isJSON = require("is-json");
class AliPayForm {
    constructor() {
        this.fields = [];
        this.files = [];
        this.method = 'post';
    }
    getFields() { return this.fields; }
    getFiles() { return this.files; }
    getMethod() { return this.method; }
    /**
     * 设置 method
     * post、get 的区别在于 post 会返回 form 表单，get 返回 url
     */
    setMethod(method) {
        this.method = method;
    }
    /*
     * 增加字段
     * @param fieldName 字段名
     * @param fieldValue 字段值
     */
    addField(fieldName, fieldValue) {
        if (isJSON(fieldValue)) {
            // 当 fieldValue 为 json 字符串时，解析出 json
            this.fields.push({ name: fieldName, value: JSON.parse(fieldValue) });
        }
        else {
            this.fields.push({ name: fieldName, value: fieldValue });
        }
    }
    /*
     * 增加文件
     * @param fieldName 文件字段名
     * @param fileName 文件名
     * @param filePath 文件绝对路径
     */
    addFile(fieldName, fileName, filePath) {
        this.files.push({
            fieldName,
            name: fileName,
            path: filePath,
        });
    }
}
exports.default = AliPayForm;
//# sourceMappingURL=form.js.map