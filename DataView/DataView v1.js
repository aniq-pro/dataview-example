"use strict";
export class DataView {
    #data = [{}]
    #renderData
    #templator = null
    #mainContainer
    #viewContainer
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
    #tableColumns = null;
    #tableRowHtml = null;
    #tableHeadings = null;
    // list
    #listContainer
    #listGap
    #listItemWidth
    #listItemMinWidth
    #listItemHtml = null;
    #listItemTagName = null;
    // Search
    #searchContainer
    #searchContainerReConfig = true
    #searchPage = 0
    //
    #renderState = "main" // search
    #firstRenderRow = 0
    #lastRenderRow = 0
    #searchFirstRenderRow = 0
    #searchLastRenderRow = 0
    #searchLastRenderRowForNext = 0
    #currentPage = 1;
    #searchCurrentPage = 1;
    #perPage
    #totalPages
    #searchTotalPages
    #reRenderGrid = true
    #reRenderList = true
    #reRenderTable = true
    // animations
    #animation
    #animationOn = null
    #animationDuration
    // 
    #rootStyle
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
        if (this.#errors.length > 0) { return }
        this.#renderData = this.#data
        const root = document.querySelector(":root");
        this.#rootStyle = getComputedStyle(root);
        this.#perPage = Options.perPage || 20;
        this.#autoload = Options.autoload || false
        this.#view = Options.view || "grid";
        // grid
        this.#gridGap = Options.gridGap || "10px";
        this.#gridItemMinWidth = Options.gridItemMinWidth || '200px';
        this.#gridItemWidth = Options.gridItemWidth || 'fit';
        // list
        this.#listGap = Options.listGap || "10px";
        this.#listItemMinWidth = Options.listItemMinWidth || '500px';
        this.#listItemWidth = Options.listItemWidth || 'fit';
        // search
        this.searchIn = Options.searchIn || "all";
        this.searchCaseSensitive = Options.searchCaseSensitive || true;
        // 
        this.#animation = Options.animation || false
        if (Options.animationDuration) {
            root.style.setProperty("--animation-duration", Options.animationDuration)
        }
        this.#animationDuration = Options.animationDuration?.slice(0, -1) || this.#rootStyle.getPropertyValue("--animation-duration").slice(0, -1) || 1
        this.#position = Options.position || this.POSITIONS.LEFT
        // 
        this.tableContainerClass = 'data-view-table';
        this.listContainerClass = 'data-view-list';
        this.gridContainerClass = 'data-view-grid';
        this.tableClass = 'table';

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
        this.#listContainer.style.gap = this.#listGap
        this.#listContainer.style.position = "relative"
        this.#mainContainer.append(this.#listContainer);
        // Table
        this.#tableContainer = document.createElement('div');
        this.#tableContainer.id = 'ViewTableContainer'
        this.#tableContainer.style.position = "relative"
        this.#tableContainer.className = this.tableContainerClass;
        this.#mainContainer.append(this.#tableContainer);
        // Search
        this.#searchContainer = document.createElement('div');
        this.#searchContainer.id = 'ViewSearchContainer'
        this.#searchContainer.style.display = "grid"
        this.#searchContainer.style.position = "relative"
        this.#mainContainer.append(this.#searchContainer);
        // 
        this.#totalPages = this.#calculateTotalPages()
        this.columns = Object.keys(this.#data[0])
        // 
        this.#templator = new Templator();
        // Image Observer for lazy load images
        this.#imgObserver = new IntersectionObserver((images) => {
            for (const image of images) {
                if (image.isIntersecting) {
                    image.target.src = image.target.dataset.viewLoadimg
                    image.target.style.visibility = "visible"
                }
            }
        }, { rootMargin: "300px" });
        // AutoLoad Observer
        if (this.#autoload) {
            this.#autoloadObserver = new IntersectionObserver((entries) => {

            }, { rootMargin: "100px" });
        }
        // 
        window.addEventListener("resize", () => {
            this.#gridStyle();
        })
    }
    get totalPages() {
        let totalPages;
        if (this.#renderState == "main") {
            totalPages = this.#totalPages;
        } else if (this.#renderState == "search") {
            totalPages = this.#searchTotalPages;
        }
        return totalPages;
    }
    get currentPage() {
        let current;
        if (this.#renderState == "main") {
            current = this.#currentPage;

        }else if (this.#renderState == "search") {
            current = this.#searchCurrentPage;
        }
        return current
    }
    get errors() {
        return this.#errors;
    }
    get register() {
        if (this.#errors.length > 0) { return }
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
        if (this.#errors.length > 0) { return }
        if (!Html.startsWith("<")) { this.#errors.push("Invalid List Item Template"); return "" }
        let tagname = Html.slice(1, Html.search(/<* /));
        if (!Html.endsWith(`</${tagname}>`)) { this.#errors.push("Invalid List Item Template"); return "" }
        this.#listItemTagName = tagname;
        this.#listItemHtml = this.#templator.oneTimeParse(Html);
        this.#listStyle();
    }
    /**
     * @param {string} Html
     */
    set gridItemTemplate(Html) {
        if (this.#errors.length > 0) { return }
        if (!Html.startsWith("<")) { this.#errors.push("Invalid Grid Item Template"); return "" }
        let tagname = Html.slice(1, Html.search(/<* /));
        if (!Html.endsWith(`</${tagname}>`)) { this.#errors.push("Invalid Grid Item Template"); return "" }
        this.#gridItemTagName = tagname;
        this.#gridItemHtml = this.#templator.oneTimeParse(Html);
        this.#gridStyle();
    }
    /**
     * @param {string} Html
     */
    set tableRowHtml(Html) {
        if (this.#errors.length > 0) { return }
        if (!Html.startsWith("<")) { this.#errors.push("Invalid Table Row Template"); return "" }
        this.#tableRowHtml = this.#templator.oneTimeParse(Html);
        this.#gridStyle();
    }
    /**
     * @param {array} Array
     */
    set tableColumns(Array) {
        this.#tableColumns = Array
        this.#tableHeadings = "<thead><tr>"
        for (let index = 0; index < this.#tableColumns.length; index++) {
            this.#tableHeadings += `<th>${this.#tableColumns[index]}</th>`;
        }
        this.#tableHeadings += "</tr></thead>"
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
        this.#reRenderTable = true;
        this.#render()
    }
    /**
     * @param {string} View
     */
    set view(View) {
        this.#view = View;
        if (this.#viewContainer == this.#searchContainer) {
            this.#searchContainerConfig(View);
            this.#render();
            return;
        }
        switch (View) {
            case "grid":
                this.#listContainer.style.display = "none"
                this.#tableContainer.style.display = "none"
                this.#gridContainer.style.display = "grid";
                this.#viewContainer = this.#gridContainer

                if (this.#reRenderGrid) {
                    this.#lastRenderRow = this.#firstRenderRow
                    this.#render()
                }
                break;
            case "list":
                this.#gridContainer.style.display = "none"
                this.#tableContainer.style.display = "none"
                this.#listContainer.style.display = "grid";
                this.#viewContainer = this.#listContainer;

                if (this.#reRenderList) {
                    this.#lastRenderRow = this.#firstRenderRow
                    this.#render()
                }
                break;
            case "table":
                this.#gridContainer.style.display = "none"
                this.#listContainer.style.display = "none";
                this.#tableContainer.style.display = "block"
                this.#viewContainer = this.#tableContainer;

                if (this.#reRenderTable) {
                    this.#lastRenderRow = this.#firstRenderRow
                    this.#render()
                }
                break;
        }
    }
    search(Query) {
        if (Query == "") {
            if (this.#view == "grid") { this.#viewContainer = this.#gridContainer; this.#gridContainer.style.display = "grid" }
            else if (this.#view == "list") { this.#viewContainer = this.#listContainer; this.#listContainer.style.display = "grid" }
            else if (this.#view == "table") { this.#viewContainer = this.#tableContainer; this.#tableContainer.style.display = "block" }
            this.#searchContainer.style.display = "none";
            this.#renderData = this.#data;
            this.#currentPage = 1
            for (let index = 0; index < this.#firstRenderRow; index += this.#perPage) {
                if (index + this.#perPage > this.#firstRenderRow) {
                    this.#firstRenderRow = index
                } else {
                    this.#currentPage++;
                }
            }
            this.#lastRenderRow = this.#firstRenderRow + this.#perPage - 1
            this.#searchCurrentPage = 1;
            this.#renderState = "main";
            return
        }
        if (this.#searchContainerReConfig) {
            this.#searchContainerReConfig = false
            this.#searchContainerConfig()
        }
        this.#renderData = this.#data.filter((Value) => {
            if (this.searchIn == "all") {
                return JSON.stringify(Value).toLowerCase().includes(Query);
            }else{
                return String(Value[this.searchIn]).toLowerCase().includes(Query);
            }
        });
        if (this.#viewContainer != this.#searchContainer) {
            if (this.#view == "grid") { this.#gridContainer.style.display = "none" }
            else if (this.#view == "list") { this.#listContainer.style.display = "none" }
            else if (this.#view == "table") { this.#tableContainer.style.display = "none" }

            this.#viewContainer = this.#searchContainer;
            this.#viewContainer.style.display = "grid";
        }
        this.#searchFirstRenderRow = 0
        this.#searchLastRenderRow = 0
        this.#searchCurrentPage = 1
        this.#searchTotalPages = this.#calculateTotalPages()
        this.#renderState = "search";
      
        this.#render();
    }
    
        #render() {
        let itemHtml;
        let firstRow;
        let lastRow;
        if (this.#renderState == "main") {
            firstRow = this.#firstRenderRow;
            lastRow = this.#lastRenderRow;
        } else if (this.#renderState == "search") {
            firstRow = this.#searchFirstRenderRow;
            lastRow = this.#searchLastRenderRow;
        }
        if (this.#view == "grid") {
            if (this.#gridItemHtml == null) { this.#errors.push("Please Set Grid Item Template"); return null; }
            this.#reRenderGrid = false;
            itemHtml = this.#gridItemHtml;
        } else if (this.#view == "list") {
            if (this.#listItemHtml == null) { this.#errors.push("Please Set List Item Template"); return null; }
            this.#reRenderList = false;
            itemHtml = this.#listItemHtml;
        } else if (this.#view == "table") {
            if (this.#tableRowHtml == null) { this.#errors.push("Please Set Table Row Template"); return null; }
            this.#reRenderTable = false;
            itemHtml = this.#tableRowHtml;
        }
        let html = ''
        let numberOfRows = this.#perPage + lastRow;
        
        for (let index = firstRow; index < numberOfRows; index++) {
            if (this.#renderData[index] == undefined) { break; }
            html += this.#templator.ParseOnEveryRow(itemHtml, this.#renderData[index], index);
            this.#lastRenderRow = index;
        }
        if (this.#view == "table"){
            html = `<table class="${this.tableClass}">${this.#tableHeadings}${html}</table>`;
        }
        
        if (this.#renderState == "search" && this.#currentPage > this.#searchPage) {
            this.#searchLastRenderRowForNext = this.#lastRenderRow;
            this.#searchPage++
        }
        if (this.#animation != false && this.#animationOn != null) {
            this.#animator(() => {
                this.#viewContainer.innerHTML = html
                setTimeout(() => {
                    const images = document.querySelectorAll(`#${this.#viewContainer.id} img[data-view-loadimg]`);
                    for (const image of images) {
                        this.#imgObserver.observe(image)
                    }
                }, 0.5);
            }, this.#viewContainer)
        } else {
            this.#viewContainer.innerHTML = html
            setTimeout(() => {
                const images = document.querySelectorAll(`#${this.#viewContainer.id} img[data-view-loadimg]`);
                for (const image of images) {
                    this.#imgObserver.observe(image)
                }
            }, 0.5);
        }
    }

    jumpToPage(PageNumber) {
        if (this.#renderState == "main") {
            this.#currentPage = PageNumber;
            this.#firstRenderRow = 0
            for (let index = 1; index < PageNumber; index++) {
                this.#firstRenderRow += this.#perPage
            }
            this.#lastRenderRow = this.#firstRenderRow
        } else if (this.#renderState == "search") {
            this.#searchCurrentPage = PageNumber;
            this.#searchFirstRenderRow = 0
            for (let index = 1; index < PageNumber; index++) {
                this.#searchFirstRenderRow += this.#perPage
            }
            this.#searchLastRenderRow = this.#searchFirstRenderRow
        }
        this.#reRenderGrid = true;
        this.#reRenderList = true;
        this.#reRenderTable = true;
        this.#render()
    }
    nextPage() {
        this.#currentPage += 1
        if (this.#renderState == "main") {
            if (this.#currentPage < this.#totalPages) {
                this.#firstRenderRow = ++this.#lastRenderRow
                this.#reRenderGrid = true;
                this.#reRenderList = true;
                this.#reRenderTable = true;
            }
        } else if (this.#renderState == "search") {
            if (this.#searchCurrentPage < this.#searchTotalPages) {
                this.#searchCurrentPage += 1;
                this.#searchLastRenderRow = ++this.#searchLastRenderRowForNext;
                this.#searchFirstRenderRow = this.#searchLastRenderRowForNext;
            }
        }

        this.#animationOn = "nextPage"
        console.log(this.#reRenderGrid);
        this.#render()
    }
    previousPage() {
        if (this.#currentPage > 1) {
            if (this.#renderState == "main") {
                this.#lastRenderRow = this.#firstRenderRow - this.#perPage
                this.#firstRenderRow -= this.#perPage
                this.#reRenderGrid = true;
                this.#reRenderList = true;
                this.#reRenderTable = true;
            this.#currentPage -= 1
            } else if (this.#renderState == "search") {
                this.#searchLastRenderRow = this.#searchFirstRenderRow - this.#perPage
                this.#searchFirstRenderRow -= this.#perPage
                this.#searchPage--;
            }
            this.#animationOn = "previousPage"
            this.#render();
        }
    }
    #searchContainerConfig(View = null) {
        if (this.#viewContainer.id == this.#gridContainer.id || View == "grid") {
            this.#searchContainer.style.gap = this.#gridGap
            this.#gridStyle(this.#searchContainer);
        } else if (this.#viewContainer.id == this.#listContainer.id || View == "list") {
            this.#searchContainer.style.gap = this.#listGap
            this.#listStyle(this.#searchContainer);
        }else{
            this.#searchContainer.style.gridTemplateColumns = `repeat(1,1fr)`

        }
    }
    #animator(Callback, Container) {
        switch (this.#animation) {
            case "slide":
                switch (this.#animationOn) {
                    case 'nextPage':
                        Container.classList.remove("slide-left-out");
                        Container.classList.remove("slide-left-in");
                        Container.classList.add("slide-left-out");
                        setTimeout(() => {
                            Callback();
                            Container.classList.add("slide-left-in");
                        }, this.#animationDuration * 1000);
                        setTimeout(() => {
                            Container.classList.remove("slide-left-out");
                            Container.classList.remove("slide-left-in");
                        }, this.#animationDuration * 1000 + this.#animationDuration * 1000);
                        break;
                    case 'previousPage':
                        Container.classList.remove("slide-right-out");
                        Container.classList.remove("slide-right-in");
                        Container.classList.add("slide-right-out");
                        setTimeout(() => {
                            Callback();
                            Container.classList.add("slide-right-in");
                        }, this.#animationDuration * 1000);
                        setTimeout(() => {
                            Container.classList.remove("slide-right-out");
                            Container.classList.remove("slide-right-in");
                        }, this.#animationDuration * 1000 + this.#animationDuration * 1000);
                        break;
                }
                break;
            case "fade":
                Container.classList.remove("fade-in");
                Container.classList.add("fade-out");
                setTimeout(() => {
                    Callback();
                    Container.classList.add("fade-in");
                    Container.classList.remove("fade-out");
                }, this.#animationDuration * 1000);
                setTimeout(() => {
                    Container.classList.remove("fade-in");
                }, this.#animationDuration * 1000 + this.#animationDuration * 1000);
                break
        }
    }
    #gridStyle(Container = this.#gridContainer) {
        let style = ''
        if (this.#gridItemWidth == "fit") {
            style = `
                #${Container.id} > ${this.#gridItemTagName}{
                    min-width:${this.#gridItemMinWidth};
                }
                `;
            let numberOfRows = Math.floor(this.#mainContainer.offsetWidth / (parseInt(this.#gridItemMinWidth.match(/\d*/)[0]) + parseInt(this.#gridGap.match(/\d*/)[0])))
            Container.style.gridTemplateColumns = `repeat(${numberOfRows},1fr)`
        } else {
            style = `
                #${Container.id}{
                    ${this.#position}
                }
                #${Container.id} > ${this.#gridItemTagName}{
                    min-width:${this.#gridItemMinWidth};
                    width:100%;
                    max:width:${this.#gridItemWidth};
                }
                `;
            let numberOfRows = Math.floor(this.#mainContainer.offsetWidth / parseInt(this.#gridItemWidth.match(/\d*/)[0]))
            Container.style.gridTemplateColumns = `repeat(${numberOfRows},${this.#gridItemWidth})`
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
    #listStyle(Container = this.#listContainer) {
        let style = ''
        if (this.#listItemWidth == "fit") {
            style = `
                #${Container.id} > ${this.#listItemTagName}{
                    min-width:${this.#listItemMinWidth};
                }
                `;
            let numberOfRows = Math.floor(this.#mainContainer.offsetWidth / (parseInt(this.#listItemMinWidth.match(/\d*/)[0]) + parseInt(this.#listGap.match(/\d*/)[0])))
            Container.style.gridTemplateColumns = `repeat(${numberOfRows},1fr)`
        } else {
            style = `
                #${Container.id}{
                    ${this.#position}
                }
                #${Container.id} > ${this.#listItemTagName}{
                    min-width:${this.#listItemMinWidth};
                    width:100%;
                    max:width:${this.#listItemWidth};
                }
                `;
            let numberOfRows = Math.floor(this.#mainContainer.offsetWidth / parseInt(this.#listItemWidth.match(/\d*/)[0]))
            Container.style.gridTemplateColumns = `repeat(${numberOfRows},${this.#listItemWidth})`
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
        return Math.ceil(this.#renderData.length / this.#perPage);
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
        if (this.templator != null && this.templator.oneTimeParse != undefined) {
            renderedTemplate = this.templator.oneTimeParse(renderedTemplate)
        }
        renderedTemplate = Template.replace(placeholderRegex, (match, placeholders) => {
            const [type, name] = placeholders.split(":")
            const [, ...formatters] = name != undefined ? name.split("|") : ""
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
                            returnValue = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
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
        if (this.templator != null && this.templator.parseOnEveryRow != undefined) {
            renderedTemplate = this.templator.parseOnEveryRow(renderedTemplate, Data, NumberOfRow)
        }
        //  
        const placeholderRegex = /{%(.[^{%]*?)%}/g;
        renderedTemplate = renderedTemplate.replace(placeholderRegex, (match, placeholders) => {
            const [type, others] = placeholders.split(":")
            const [name, formatter] = others != undefined ? others.split("|") : ""
            let returnValue = match;
            switch (type) {
                case "counter":
                    returnValue = NumberOfRow + 1
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
                            returnValue = returnValue[0].toUpperCase() + returnValue.slice(1).toLowerCase()
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
        renderedTemplate = renderedTemplate.replace(tagPlaceholderRegex, (match, placeholders) => {
            let [height, element] = placeholders.split("|");
            let width = '';
            if (!element.startsWith("<img")) {
                width = `width:${element};`
                element = placeholders.split("|")[2]
            }
            if (element.match(/style=('|")(.*?)/)) {
                element = `${element.slice(0, element.match(/style="?'?(.*?)/).index + 7)}widht:100%;height:100%;visibility:hidden;${element.slice(element.match(/style="?'?(.*?)/).index + 7)}>`
            } else {
                element += ` style="widht:100%;height:100%;visibility:hidden;">`
            }
            element = element.replace(/src=('|")(.*?)('|")/, (Match, Extra, Value) => {
                return `data-view-loadimg="${Value}"`
            })
            let parent = `<div style="${width}height:${height};background:#eee;">${element}</div>`
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
        if (array.indexOf(".") != -1 && array.length > array.indexOf(".") + 2) {
            array.length = array.indexOf(".") + 2
        }
        return array.join('')
    }
}