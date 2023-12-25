export class Templator{
    #templatingBasicMethods
    constructor(TemplatingBasicMethods){
        this.#templatingBasicMethods = TemplatingBasicMethods
    }
    parseOnEveryRow(Template,Data){
        const placeholderRegex = /{%([^%}]*?)<*>%}/g;
        let renderedTemplate = Template.replace(placeholderRegex,(match,placeholder)=>{
            let returnValue = match;
            let [type,more,value,operationByColumn] = placeholder.split(":")
            if (type!="column") {return match}
            let [column,others] = more.split("|")
            let formate,operation;
            if (others==undefined) {
                [column,operation] = column.split("<");
            }else{
                [formate,operation] = others.split("<");
            }
            if (Data[column]==undefined) {return;}
            const data = parseInt(Data[column].replace(",",''));
            if (value=="column") {value = Data[operationByColumn]}
            switch (operation) {
                case 'add':
                    let addBy = parseInt(value);
                    if (value.endsWith("%")) {
                        addBy = (addBy / 100) * data
                    }
                    returnValue= data + addBy
                    break;
                case 'sub':
                    let subBy = parseInt(value);
                    if (value.endsWith("%")) {
                        subBy = (subBy / 100) * data
                    }
                    returnValue= data - subBy
                    break;
                case 'mult':
                    let multBy = parseInt(value);
                    if (value.endsWith("%")) {
                        multBy = (multBy / 100) * data
                    }
                    returnValue= data * multBy
                    break;
                case 'div':
                    let divBy = parseInt(value);
                    if (value.endsWith("%")) {
                        divBy = (divBy / 100) * data
                    }
                    returnValue= data / divBy
                    break;
            }
            if (formate=="formateNum") {
                returnValue = this.#templatingBasicMethods.formateNum(returnValue)                    
            }
            return returnValue
        });
        return renderedTemplate
    }
}