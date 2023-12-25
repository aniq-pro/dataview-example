const properties =  {
    viewContainer:null,
    data:[{}],
    templator:null,
    container:null,
    gridGap:null,
    gridItemWidth:null,
    gridItemMinWidth:null,
    gridContainer:null,
    tableContainer:null,
    firstRenderRow:0,
    lastRenderRow:0,
    listItemHtml:null,
    gridItemHtml:null,
    gridItemTagName:null,
    perPage:null,
    currentPage:1,
    totalPages:null,
    animation:null,
    animationOn:null,
    position:null,
    errors:[],
}
export class DataView {
    #render
    constructor(Data, Container) {
        console.log(properties);
        properties.container = Container
        properties.container.style.overflow = "hidden"
        if (!Array.isArray(Data)) {
            properties.errors.push("Invalid Data | Data is Not An Array | Data must be Array Object")
        } else if (Object.prototype.toString.call(Data[0]) !== '[object Object]') {
            properties.errors.push("Invalid Data | Data is Not An Array Object | Data must be Array Object")
        } else {
            properties.data = Data
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
        // Set Options
        properties.perPage = Options.perPage || 20;
        properties.gridGap = Options.gridGap || "10px";
        properties.gridItemMinWidth = Options.gridItemMinWidth || 200;
        properties.gridItemWidth = Options.gridItemWidth || 'fit';
        properties.animation = Options.animation || false
        properties.position = Options.position || this.POSITIONS.LEFT

        this.tableContainerClass = 'view-table';
        this.listContainerClass = 'view-list';
        this.gridContainerClass = 'view-grid';

        properties.gridContainer = document.createElement('div');
        properties.gridContainer.id = 'ViewGridContainer'
        properties.gridContainer.className = this.gridContainerClass;
        properties.gridContainer.style.display = "grid"
        properties.gridContainer.style.gap = properties.gridGap
        properties.gridContainer.style.position = "relative"

        properties.tableContainer = document.createElement('div');
        properties.tableContainer.id = 'ViewTableContainer'
        properties.tableContainer.style.position = "relative"
        properties.tableContainer.classname = this.tableContainerClass;
        properties.totalPages = this.#calculateTotalPages()
        this.columns = Object.keys(properties.data[0])
        // 
        properties.templator = new Templator(this.columns);
        // 
        window.addEventListener("resize", () => {
            this.#gridItemStyle();
        })
    }
    get totalPages() {
        return properties.totalPages
    }
    get currentPage() {
        return properties.currentPage
    }
    get errors() {
        return properties.errors;
    }
    get register() {
        const _this = this;
        return {
            templator(Templator) {
                properties.templator.register(Templator)
            }
        }
    }
    /**
     * @param {null} Html
     */
    set listItemTemplate(Html) {
        properties.listItemHtml = Html
    }
    /**
     * @param {string} Html
     */
    set gridItemTemplate(Html) {
        if (!Html.startsWith("<")) { properties.errors.push("Invalid Grid Item Template Format"); return "" }
        properties.gridItemHtml = properties.templator.oneTimeParse(Html);
        properties.gridItemTagName = properties.gridItemHtml.slice(1, properties.gridItemHtml.search(/<* /));
        this.#gridItemStyle();
    }
    /**
     * @param {string} Value
     */
    set perPage(Value) {
        properties.perPage = parseInt(Value)
        properties.totalPages = this.#calculateTotalPages()
        if (properties.firstRenderRow + properties.perPage > properties.data.length || properties.firstRenderRow < properties.perPage) {
            properties.firstRenderRow = 0
            properties.currentPage = 1
        } else {
            properties.currentPage = 1
            for (let index = 0; index < properties.firstRenderRow; index += properties.perPage) {
                if (index + properties.perPage > properties.firstRenderRow) {
                    properties.firstRenderRow = index
                } else {
                    properties.currentPage++;
                }
            }
        }
        properties.lastRenderRow = properties.firstRenderRow
        this.#render()
    }
    renderGrid() {
        if (properties.gridItemHtml == null) { properties.errors.push("Please Set Grid Item Template"); return null; }
        let html = ''
        let numberOfRows = properties.perPage + properties.lastRenderRow;
        for (let index = properties.firstRenderRow; index < numberOfRows; index++) {
            if (properties.data[index] == undefined) { break; }
            html += properties.templator.ParseOnEveryRow(properties.gridItemHtml, properties.data[index], index);
            properties.lastRenderRow = index;
        }
        if (properties.animation != false && properties.animationOn != null) {
            this.#animation(() => {
                properties.gridContainer.innerHTML = html;
                properties.container.append(properties.gridContainer);
            })
        } else {
            properties.gridContainer.innerHTML = html;
            properties.container.append(properties.gridContainer);
        }
        properties.viewContainer = properties.gridContainer
        this.#render = this.renderGrid
    }
    jumpToPage(PageNumber) {
        properties.currentPage = PageNumber;
        properties.firstRenderRow=0
        for (let index = 1; index < PageNumber; index++) {
            properties.firstRenderRow += properties.perPage
        }
        properties.lastRenderRow = properties.firstRenderRow
        this.#render()
    }
    nextPage() {
        if (properties.currentPage < properties.totalPages) {
            properties.currentPage += 1
            properties.firstRenderRow = ++properties.lastRenderRow
            properties.animationOn = "nextPage"
            this.#render() 
        }
    }
    previousPage() {
        if (properties.currentPage > 1) {
            properties.currentPage -= 1
            properties.lastRenderRow = properties.firstRenderRow - properties.perPage
            properties.firstRenderRow -= properties.perPage
            properties.animationOn = "previousPage"
            this.#render();
        }
    }
    #animation(callback) {
        switch (properties.animation) {
            case "move":
                switch (properties.animationOn) {
                    case 'nextPage':
                        properties.viewContainer.animate([
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
                            callback()
                            properties.viewContainer.animate([
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
                        properties.viewContainer.animate([
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
                            callback()
                            properties.viewContainer.animate([
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
                properties.viewContainer.animate([
                    { opacity: 1 },
                    { opacity: 0 },
                ], {
                    duration: 400,
                    iterations: 1,
                    fill: "forwards"
                });

                setTimeout(() => {
                    callback()
                    properties.viewContainer.animate([
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
    #gridItemStyle() {
        let style = ''
        if (properties.gridItemWidth == "fit") {
            style = `
                #${properties.gridContainer.id} > ${properties.gridItemTagName}{
                    min-width:${properties.gridItemMinWidth};
                }
                `;
            let numberOfRows = Math.floor(properties.container.offsetWidth / (parseInt(properties.gridItemMinWidth.match(/\d*/)[0]) + parseInt(properties.gridGap.match(/\d*/)[0])))
            properties.gridContainer.style.gridTemplateColumns = `repeat(${numberOfRows},1fr)`
        } else {
            style = `
                #${properties.gridContainer.id}{
                    ${properties.position}
                }
                #${properties.gridContainer.id} > ${properties.gridItemTagName}{
                    min-width:${properties.gridItemMinWidth};
                    width:100%;
                    max:width:${properties.gridItemWidth};
                }
                `;
            let numberOfRows = Math.floor(properties.container.offsetWidth / parseInt(properties.gridItemWidth.match(/\d*/)[0]))
            properties.gridContainer.style.gridTemplateColumns = `repeat(${numberOfRows},${properties.gridItemWidth})`
        }
        // 
        if (document.getElementById("ViewStyle") == null) {
            const styleTag = document.createElement("style");
            styleTag.id = 'ViewStyle';
            styleTag.textContent = style
            properties.container.append(styleTag);

        } else {
            document.getElementById("ViewStyle").textContent = style
        }
    }
    #calculateTotalPages() {
        return Math.ceil(properties.data.length / properties.perPage);
    }
}
class Templator {
    #columns;
    #templatingBasicMethods;
    // templating Vars
    #templatingAllCap = []
    #templatingAllSmall = []
    #templatingFirstCap = []
    #templatingFormateNum = []
    templator = null
    constructor(Columns) {
        this.#columns = Columns
        this.#templatingBasicMethods = {
            formateNum: this.formateNum
        }
    }
    register(Templator) {
        this.templator = new Templator(this.#templatingBasicMethods);
    }
    oneTimeParse(Template) {
        for (let index = 0; index < this.#columns.length; index++) {
            const column = this.#columns[index];
            this.#templatingAllCap[index] = false;
            this.#templatingAllSmall[index] = false;
            this.#templatingFirstCap[index] = false;
            this.#templatingFormateNum[index] = false;
            // Uppercase :allCap
            let uppercasePettern = `{{column:${column}:allCap}}`;
            let uppercasePetternRegex = new RegExp(uppercasePettern)
            if (Template.match(uppercasePetternRegex) != null) {
                Template = Template.replace(uppercasePetternRegex, `{{column:${column}}}`)
                this.#templatingAllCap[index] = true;
            }
            // Lowercase :allSmall
            let lowercasePettern = `{{column:${column}:allSmall}}`;
            let lowercasePetternRegex = new RegExp(lowercasePettern)
            if (Template.match(lowercasePetternRegex) != null) {
                Template = Template.replace(lowercasePetternRegex, `{{column:${column}}}`)
                this.#templatingAllSmall[index] = true;
            }
            // First Cap :firstCap
            let firstCapPettern = `{{column:${column}:firstCap}}`;
            let firstCapPetternRegex = new RegExp(firstCapPettern)
            if (Template.match(firstCapPetternRegex) != null) {
                Template = Template.replace(firstCapPetternRegex, `{{column:${column}}}`)
                this.#templatingFirstCap[index] = true;
            }
            // Formate Number
            let formateNumPettern = `{{column:${column}:formate}}`;
            let formateNumPetternRegex = new RegExp(formateNumPettern)
            if (Template.match(formateNumPetternRegex) != null) {
                Template = Template.replace(formateNumPetternRegex, `{{column:${column}}}`)
                this.#templatingFormateNum[index] = true;
            }
            if (this.templator != null && this.templator.oneTimeParseEveryColumn != undefined) {
                Template = this.templator.oneTimeParseEveryColumn(Template, column, index);
            }

        }
        if (this.templator != null && this.templator.oneTimeParse) {
            Template = this.templator.oneTimeParse(Template);
        }
        let dateObj = new Date()
        // Dates 
        Template = Template.replace(/{{date:m}}/g, dateObj.getMonth() + 1)
        Template = Template.replace(/{{date:y}}/g, dateObj.getFullYear())
        Template = Template.replace(/{{date:d}}/g, dateObj.getDate())
        // Times
        Template = Template.replace(/{{time:h}}/g, dateObj.getHours())
        Template = Template.replace(/{{time:m}}/g, dateObj.getMinutes())
        Template = Template.replace(/{{time:s}}/g, dateObj.getSeconds())
        return Template
    }
    ParseOnEveryRow(Template, Data, NumberOfRow) {
        // this.#columns.forEach((Value)=>{
        //     let columnPettern = `{{column:${Value}}}`;
        //     let columnPetternRegex = new RegExp(columnPettern,'g')
        //     Template = Template.replace(columnPetternRegex,Data[Value])
        // })
        for (let index = 0; index < this.#columns.length; index++) {
            const column = this.#columns[index];
            let columnPettern = `{{column:${column}}}`;
            let columnPetternRegex = new RegExp(columnPettern, 'g')
            let value = Data[column];
            if (this.#templatingAllCap[index]) { value = value.toUpperCase() } // Modify To Uppercase 
            if (this.#templatingAllSmall[index]) { value = value.toLowerCase() } // Modify To Lowercase
            if (this.#templatingFirstCap[index]) { value = value.replace(/^\w/, c => c.toUpperCase()); } // Modify To First Letter into Capital
            if (this.#templatingFormateNum[index]) { value = this.formateNum(value); } // Formate Number like 100000 into 100,000

            if (this.templator != null && this.templator.parseOnEveryColumn != undefined) {
                Template = this.templator.parseOnEveryColumn(Template, Data, index, column, value);
            }
            Template = Template.replace(columnPetternRegex, value);
            Template = Template.replace(/{{counter}}/, NumberOfRow + 1);
        }
        if (this.templator != null && this.templator.parseOnEveryRow != undefined) {
            Template = this.templator.parseOnEveryRow(Template, Data, NumberOfRow);
        }
        return Template;
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
        return array.join('')
    }
}