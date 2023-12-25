"use strict";
export class DataView {
    #data = [{}]
    #templator = null
    #mainContainer
    #view
    // grid
    #gridContainer
    #gridGap
    #gridItemWidth
    #gridItemMinWidth
    #gridItemHtml = null;
    #gridItemTagName = null;
    // table
    #tableContainer
    // list
    #listContainer
    #listGap
    #listItemWidth
    #listItemMinWidth
    #listItemHtml = null;
    #listItemTagName = null;
    // 
    #firstRenderRow = 0
    #lastRenderRow = 0
    #perPage
    #currentPage = 1;
    #totalPages
    #reRenderGrid = true
    #reRenderList = true
    #animation
    #animationOn = null
    #position
    // observers
    #imgObserver
    #autoloadObserver
    #autoload
    #errors = []
    constructor(Data, Container) {
        this.#mainContainer = Container
        this.#mainContainer.style.overflow = "hidden"
        if (!Array.isArray(Data)) {
            this.#errors.push("Invalid Data | Data is Not An Array | Data must be Array Object")
        } else if (Object.prototype.toString.call(Data[0]) !== '[object Object]') {
            this.#errors.push("Invalid Data | Data is Not An Array Object | Data must be Array Object")
        } else {
            this.#data = Data
        }
        // positions 
        this.POSITIONS = {
            LEFT: "justify-content: flex-start;",
            RIGHT: "justify-content: flex-end;",
            CENTER: "justify-content: center;",
            BETWEEN: "justify-content: space-between;",
            AROUND: "justify-content: space-around;",
            EVENLY: "justify-content: space-evenly;"
        }
    }
    Config(Options = {}) {
        if (this.#errors.length >0) {return}
        // Set Options
        this.#perPage = Options.perPage || 20;
        this.#autoload = Options.autoload || false
        this.#view = Options.view || "grid";
        // grid
        this.#gridGap = Options.gridGap || "10px";
        this.#gridItemMinWidth = Options.gridItemMinWidth || '200px';
        this.#gridItemWidth = Options.gridItemWidth || 'fit';
        // list
        this.#listGap = Options.listGap || "10px";
        this.#listItemMinWidth = Options.listItemMinWidth || '400px';
        this.#listItemWidth = Options.listItemWidth || 'fit';
        // 
        this.#animation = Options.animation || false
        this.#position = Options.position || this.POSITIONS.LEFT
        // 
        this.tableContainerClass = 'data-view-table';
        this.listContainerClass = 'data-view-list';
        this.gridContainerClass = 'data-view-grid';

        this.#gridContainer = document.createElement('div');
        this.#gridContainer.id = 'ViewGridContainer'
        this.#gridContainer.className = this.gridContainerClass;
        this.#gridContainer.style.display = "grid"
        this.#gridContainer.style.gap = this.#gridGap
        this.#gridContainer.style.position = "relative"
        this.#mainContainer.append(this.#gridContainer);
        // list
        this.#listContainer = document.createElement('div');
        this.#listContainer.id = 'ViewListContainer'
        this.#listContainer.className = this.listContainerClass;
        this.#listContainer.style.display = "grid"
        this.#listContainer.style.gap = this.#gridGap
        this.#listContainer.style.position = "relative"
        this.#mainContainer.append(this.#listContainer);
        // 
        this.#tableContainer = document.createElement('div');
        this.#tableContainer.id = 'ViewTableContainer'
        this.#tableContainer.style.position = "relative"
        this.#tableContainer.classname = this.tableContainerClass;
        // 
        this.#totalPages = this.#calculateTotalPages()
        this.columns = Object.keys(this.#data[0])
        // 
        this.#templator = new Templator();
        // Image Observer
        this.#imgObserver = new IntersectionObserver((images)=>{
            for (const image of images) {
                if(image.isIntersecting){
                    image.target.src = image.target.dataset.viewLoadimg
                    image.target.style.visibility = "visible"
                }
            }
        },{rootMargin:"300px"});
        // AutoLoad Observer
        if (this.#autoload) {
            this.#autoloadObserver = new IntersectionObserver((entries)=>{

            },{rootMargin:"100px"});
        }
        // 
        window.addEventListener("resize", () => {
            this.#gridStyle();
        })
    }
    get totalPages() {
        return this.#totalPages
    }
    get currentPage() {
        return this.#currentPage
    }
    get errors() {
        return this.#errors;
    }
    get register() {
        if (this.#errors.length >0) {return}
        const _this = this;
        return {
            templator(Templator) {
                _this.#templator.register(Templator)
            }
        }
    }
    /**
     * @param {null} Html
     */
    set listItemTemplate(Html) {
        if (this.#errors.length >0) {return}
        if (!Html.startsWith("<")) { this.#errors.push("Invalid List Item Template"); return "" }
        let tagname =  Html.slice(1, Html.search(/<* /));
        if (!Html.endsWith(`</${tagname}>`)) { this.#errors.push("Invalid List Item Template"); return ""}
        this.#listItemTagName = tagname;
        this.#listItemHtml = this.#templator.oneTimeParse(Html);
        this.#listStyle();
    }
    /**
     * @param {string} Html
     */
    set gridItemTemplate(Html) {
        if (this.#errors.length >0) {return}
        if (!Html.startsWith("<")) { this.#errors.push("Invalid Grid Item Template"); return "" }
        let tagname =  Html.slice(1, Html.search(/<* /));
        if (!Html.endsWith(`</${tagname}>`)) { this.#errors.push("Invalid Grid Item Template"); return ""}
        this.#gridItemTagName = tagname;
        this.#gridItemHtml = this.#templator.oneTimeParse(Html);
        this.#gridStyle();
    }
    /**
     * @param {string} Value
     */
    set perPage(Value) {
        this.#perPage = parseInt(Value)
        this.#totalPages = this.#calculateTotalPages()
        if (this.#firstRenderRow + this.#perPage > this.#data.length || this.#firstRenderRow < this.#perPage) {
            this.#firstRenderRow = 0
            this.#currentPage = 1
        } else {
            this.#currentPage = 1
            for (let index = 0; index < this.#firstRenderRow; index += this.#perPage) {
                if (index + this.#perPage > this.#firstRenderRow) {
                    this.#firstRenderRow = index
                } else {
                    this.#currentPage++;
                }
            }
        }
        this.#lastRenderRow = this.#firstRenderRow
        this.#reRenderGrid = true;
        this.#reRenderList = true;
        this.render()
    }
    /**
     * @param {string} View
     */
    set view(View){
        this.#view = View
        switch (View) {
            case "grid":
                this.#listContainer.style.display="none"
                this.#gridContainer.style.display = "grid";

                if (this.#reRenderGrid) {
                    this.#lastRenderRow = this.#firstRenderRow
                    this.render()
                }
                break;
            case "list":
                this.#gridContainer.style.display="none"
                this.#listContainer.style.display = "grid";
                if (this.#reRenderList) {
                    this.#lastRenderRow = this.#firstRenderRow
                    this.render()
                }
                break;
        }
       
    }
    render() {
        let itemHtml;
        let container;
        if (this.#view == "grid") {
            if (this.#gridItemHtml == null) { this.#errors.push("Please Set Grid Item Template"); return null; }
            this.#reRenderGrid = false;
            itemHtml = this.#gridItemHtml;
            container = this.#gridContainer
        }else if(this.#view == "list"){
            if (this.#listItemHtml == null) { this.#errors.push("Please Set List Item Template"); return null; }
            this.#reRenderList = false;
            itemHtml = this.#listItemHtml;
            container = this.#listContainer;
        }
        let html = ''
        let numberOfRows = this.#perPage + this.#lastRenderRow;
        for (let index = this.#firstRenderRow; index < numberOfRows; index++) {
            if (this.#data[index] == undefined) { break; }
            html += this.#templator.ParseOnEveryRow(itemHtml, this.#data[index], index);
            this.#lastRenderRow = index;
        }
        if (this.#animation != false && this.#animationOn != null) {
            this.#animatator(() => {
                container.innerHTML=html
                setTimeout(() => {
                    const images = document.querySelectorAll(`#${container.id} img[data-view-loadimg]`);
                    for (const image of images) {
                        this.#imgObserver.observe(image)
                    }
                }, 0.5);
            },container)
        } else {
            container.innerHTML=html
            setTimeout(() => {
                const images = document.querySelectorAll(`#${container.id} img[data-view-loadimg]`);
                for (const image of images) {
                    this.#imgObserver.observe(image)
                }
            }, 0.5);
        }
    }
    
    jumpToPage(PageNumber) {
        this.#currentPage = PageNumber;
        this.#firstRenderRow=0
        for (let index = 1; index < PageNumber; index++) {
            this.#firstRenderRow += this.#perPage
        }
        this.#lastRenderRow = this.#firstRenderRow
        this.#reRenderGrid = true;
        this.#reRenderList = true;
        this.render()
    }
    nextPage() {
        if (this.#currentPage < this.#totalPages) {
            this.#currentPage += 1
            this.#firstRenderRow = ++this.#lastRenderRow
            this.#animationOn = "nextPage"
            this.#reRenderGrid = true;
            this.#reRenderList = true;
            this.render() 
        }
    }
    previousPage() {
        if (this.#currentPage > 1) {
            this.#currentPage -= 1
            this.#lastRenderRow = this.#firstRenderRow - this.#perPage
            this.#firstRenderRow -= this.#perPage
            this.#animationOn = "previousPage"
            this.#reRenderGrid = true;
            this.#reRenderList = true;
            this.render();
        }
    }
    #animatator(Callback,Container) {
        switch (this.#animation) {
            case "move":
                switch (this.#animationOn) {
                    case 'nextPage':
                        Container.animate([
                            { left: "0", opacity: 1 },
                            { left: "50%", opacity: 1 },
                            { left: "150%", opacity: 1 },
                            { left: "120%", opacity: 0 },
                            { left: "-120%", opacity: 0 },
                            { left: "-120%", opacity: 1 },
                        ], {
                            duration: 800,
                            iterations: 1,
                            fill: "forwards"
                        })
                        setTimeout(() => {
                            Callback()
                            Container.animate([
                                { left: "-150%", opacity: 1 },
                                { left: "-50%", opacity: 1 },
                                { left: "0", opacity: 1 },
                            ], {
                                duration: 400,
                                iterations: 1,
                                fill: "forwards"
                            })
                        }, 250);
                        break;
                    case 'previousPage':
                        Container.animate([
                            { left: "0", opacity: 1 },
                            { left: "-50%", opacity: 1 },
                            { left: "-150%", opacity: 1 },
                            { left: "-120%", opacity: 0 },
                            { left: "120%", opacity: 0 },
                            { left: "150%", opacity: 1 },
                        ], {
                            duration: 800,
                            iterations: 1,
                            fill: "forwards"
                        })
                        setTimeout(() => {
                            Callback()
                            Container.animate([
                                { left: "150%", opacity: 1 },
                                { left: "50%", opacity: 1 },
                                { left: "0", opacity: 1 },
                            ], {
                                duration: 400,
                                iterations: 1,
                                fill: "forwards"
                            })
                        }, 250);
                        break;
                }
                break;
            case "fade":
                Container.animate([
                    { opacity: 1 },
                    { opacity: 0 },
                ], {
                    duration: 400,
                    iterations: 1,
                    fill: "forwards"
                });

                setTimeout(() => {
                    Callback()
                    Container.animate([
                        { opacity: 0 },
                        { opacity: 1 },
                    ], {
                        duration: 400,
                        iterations: 1,
                        fill: "forwards"
                    });
                }, 500);
                break
        }
    }
    #gridStyle() {
        let style = ''
        if (this.#gridItemWidth == "fit") {
            style = `
                #${this.#gridContainer.id} > ${this.#gridItemTagName}{
                    min-width:${this.#gridItemMinWidth};
                }
                `;
            let numberOfRows = Math.floor(this.#mainContainer.offsetWidth / (parseInt(this.#gridItemMinWidth.match(/\d*/)[0]) + parseInt(this.#gridGap.match(/\d*/)[0])))
            this.#gridContainer.style.gridTemplateColumns = `repeat(${numberOfRows},1fr)`
        } else {
            style = `
                #${this.#gridContainer.id}{
                    ${this.#position}
                }
                #${this.#gridContainer.id} > ${this.#gridItemTagName}{
                    min-width:${this.#gridItemMinWidth};
                    width:100%;
                    max:width:${this.#gridItemWidth};
                }
                `;
            let numberOfRows = Math.floor(this.#mainContainer.offsetWidth / parseInt(this.#gridItemWidth.match(/\d*/)[0]))
            this.#gridContainer.style.gridTemplateColumns = `repeat(${numberOfRows},${this.#gridItemWidth})`
        }
        // 
        if (document.getElementById("DataViewStyle") == null) {
            const styleTag = document.createElement("style");
            styleTag.id = 'DataViewStyle';
            styleTag.textContent += style
            this.#mainContainer.append(styleTag);

        } else {
            document.getElementById("DataViewStyle").textContent += style
        }
    }
    #listStyle() {
        let style = ''
        if (this.#listItemWidth == "fit") {
            style = `
                #${this.#listContainer.id} > ${this.#listItemTagName}{
                    min-width:${this.#listItemMinWidth};
                }
                `;
            let numberOfRows = Math.floor(this.#mainContainer.offsetWidth / (parseInt(this.#listItemMinWidth.match(/\d*/)[0]) + parseInt(this.#listGap.match(/\d*/)[0])))
            this.#listContainer.style.gridTemplateColumns = `repeat(${numberOfRows},1fr)`
        } else {
            style = `
                #${this.#listContainer.id}{
                    ${this.#position}
                }
                #${this.#listContainer.id} > ${this.#listItemTagName}{
                    min-width:${this.#listItemMinWidth};
                    width:100%;
                    max:width:${this.#listItemWidth};
                }
                `;
            let numberOfRows = Math.floor(this.#mainContainer.offsetWidth / parseInt(this.#listItemWidth.match(/\d*/)[0]))
            this.#listContainer.style.gridTemplateColumns = `repeat(${numberOfRows},${this.#listItemWidth})`
        }
        // 
        if (document.getElementById("DataViewStyle") == null) {
            const styleTag = document.createElement("style");
            styleTag.id = 'DataViewStyle';
            styleTag.textContent += style
            this.#mainContainer.append(styleTag);

        } else {
            document.getElementById("DataViewStyle").textContent += style
        }
    }
    #calculateTotalPages() {
        return Math.ceil(this.#data.length / this.#perPage);
    }
}
class Templator {
    #templatingBasicMethods;
    templator = null
    constructor() {
        this.#templatingBasicMethods = {
            formateNum: this.formateNum
        }
    }
    register(Templator) {
        this.templator = new Templator(this.#templatingBasicMethods);
    }
    oneTimeParse(Template) {
        const placeholderRegex = /{{(.*?)}}/g;
        let renderedTemplate = Template;
        if (this.templator!=null && this.templator.oneTimeParse!=undefined) {
            renderedTemplate = this.templator.oneTimeParse(renderedTemplate)
        }
        renderedTemplate = Template.replace(placeholderRegex,(match,placeholders)=>{
            const [type,name] = placeholders.split(":")
            const [,...formatters] = name!=undefined?name.split("|"):""
            let returnValue = match;
            switch (type) {
                case 'date':
                    const date = new Date()
                    switch (name) {
                        case "y":
                            returnValue = date.getFullYear()
                            break;
                        case "m":
                            returnValue = date.getMonth() + 1
                            break;
                        case "d":
                            returnValue = date.getDate()
                            break;
                        default:
                            returnValue = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`
                            break;
                    }
                    break;
                case 'time':
                    const time = new Date()
                    switch (name) {
                        case "h":
                            returnValue = time.getHours()
                            break;
                        case "m":
                            returnValue = time.getMinutes()
                            break;
                        case "s":
                            returnValue = time.getSeconds()
                            break;
                        default:
                            returnValue = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
                            break;
                    }
                    break;
            }
            return returnValue
        });
        return renderedTemplate
    }
    ParseOnEveryRow(Template, Data, NumberOfRow) {
        let renderedTemplate = Template;
        if (this.templator!=null && this.templator.parseOnEveryRow!=undefined) {
            renderedTemplate = this.templator.parseOnEveryRow(renderedTemplate, Data, NumberOfRow)
        }
        //  
        const placeholderRegex = /{%(.[^{%]*?)%}/g;
        renderedTemplate = renderedTemplate.replace(placeholderRegex,(match,placeholders)=>{
            const [type,others] = placeholders.split(":")
            const [name,formatter] = others!=undefined?others.split("|"):""
            let returnValue = match;
            switch (type) {
                case "counter":
                    returnValue = NumberOfRow+1
                    break;
                case "column":
                    returnValue = Data[name]
                        switch (formatter) {
                            case "allCap":
                                returnValue = returnValue.toUpperCase()
                                break;
                            case "allSmall":
                                returnValue = returnValue.toLowerCase()
                                break;  
                            case "firstCap":
                                returnValue = returnValue[0].toUpperCase()+returnValue.slice(1).toLowerCase()
                                break;   
                            case "formateNum":
                                returnValue = this.formateNum(returnValue)
                                break;  
                        }
                    break;
            }
            return returnValue
        });
       // Load Image
       const tagPlaceholderRegex = /{%loadimage\|(.*?)>%}/g;
       renderedTemplate = renderedTemplate.replace(tagPlaceholderRegex,(match,placeholders)=>{
           let [height,element] = placeholders.split("|");
           if (element.match(/style=('|")(.*?)/)) {
               element = `${element.slice(0,element.match(/style="?'?(.*?)/).index+7)}height:100%;visibility:hidden;${element.slice(element.match(/style="?'?(.*?)/).index+7)}>`
           }else{
               element += ` style="height:100%;visibility:hidden;">`
           }
           element = element.replace(/src=('|")(.*?)('|")/,(Match,Extra,Value)=>{
              return `data-view-loadimg="${Value}"`
           })
           let parent = `<div style="height:${height};background:#eee;">${element}</div>`
           return parent;
       });
        return renderedTemplate;
    }
    formateNum(Value) {
        let array = Value.toString().split('');
        if (array.length == 5 && array[2] != '.') {
            array.splice(2, 0, ",");
        } else {
            if (array[3] != '.' && array.length > 3) {
                array.splice(3, 0, ",");
            }
        }
        if (array.indexOf(".")!=-1 && array.length > array.indexOf(".")+2  ) {
            array.length = array.indexOf(".")+2
        }
        return array.join('')
    }
}