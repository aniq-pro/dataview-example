export class DataView {
    #render
    #viewContainer
    #data = [{}]
    #templator = null
    #container
    #gridGap
    #gridItemWidth
    #gridItemMinWidth
    #gridContainer
    #tableContainer
    #firstRenderRow = 0
    #lastRenderRow = 0
    #listItemHtml = null;
    #gridItemHtml = null;
    #gridItemTagName = null;
    #perPage
    #currentPage = 1;
    #totalPages
    #animation
    #animationOn = null
    #position
    #errors = []
    constructor(Data, Container) {
        this.#container = Container
        this.#container.style.overflow = "hidden"
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
        // Set Options
        this.#perPage = Options.perPage || 20;
        this.#gridGap = Options.gridGap || "10px";
        this.#gridItemMinWidth = Options.gridItemMinWidth || 200;
        this.#gridItemWidth = Options.gridItemWidth || 'fit';
        this.#animation = Options.animation || false
        this.#position = Options.position || this.POSITIONS.LEFT

        this.tableContainerClass = 'view-table';
        this.listContainerClass = 'view-list';
        this.gridContainerClass = 'view-grid';

        this.#gridContainer = document.createElement('div');
        this.#gridContainer.id = 'ViewGridContainer'
        this.#gridContainer.className = this.gridContainerClass;
        this.#gridContainer.style.display = "grid"
        this.#gridContainer.style.gap = this.#gridGap
        this.#gridContainer.style.position = "relative"

        this.#tableContainer = document.createElement('div');
        this.#tableContainer.id = 'ViewTableContainer'
        this.#tableContainer.style.position = "relative"
        this.#tableContainer.classname = this.tableContainerClass;
        this.#totalPages = this.#calculateTotalPages()
        this.columns = Object.keys(this.#data[0])
        // 
        this.#templator = new Templator(this.columns);
        // 
        window.addEventListener("resize", () => {
            this.#gridItemStyle();
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
        this.#listItemHtml = Html
    }
    /**
     * @param {string} Html
     */
    set gridItemTemplate(Html) {
        if (!Html.startsWith("<")) { this.#errors.push("Invalid Grid Item Template Format"); return "" }
        this.#gridItemHtml = this.#templator.oneTimeParse(Html);
        this.#gridItemTagName = this.#gridItemHtml.slice(1, this.#gridItemHtml.search(/<* /));
        this.#gridItemStyle();
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
        this.#render()
    }
    renderGrid() {
        if (this.#gridItemHtml == null) { this.#errors.push("Please Set Grid Item Template"); return null; }
        let html = ''
        let numberOfRows = this.#perPage + this.#lastRenderRow;
        for (let index = this.#firstRenderRow; index < numberOfRows; index++) {
            if (this.#data[index] == undefined) { break; }
            html += this.#templator.ParseOnEveryRow(this.#gridItemHtml, this.#data[index], index);
            this.#lastRenderRow = index;
        }
        if (this.#animation != false && this.#animationOn != null) {
            this.#animatator(() => {
                this.#gridContainer.innerHTML = html;
                this.#container.append(this.#gridContainer);
            })
        } else {
            this.#gridContainer.innerHTML = html;
            this.#container.append(this.#gridContainer);
        }
        this.#viewContainer = this.#gridContainer
        this.#render = this.renderGrid
    }
    jumpToPage(PageNumber) {
        this.#currentPage = PageNumber;
        this.#firstRenderRow=0
        for (let index = 1; index < PageNumber; index++) {
            this.#firstRenderRow += this.#perPage
        }
        this.#lastRenderRow = this.#firstRenderRow
        this.#render()
    }
    nextPage() {
        if (this.#currentPage < this.#totalPages) {
            this.#currentPage += 1
            this.#firstRenderRow = ++this.#lastRenderRow
            this.#animationOn = "nextPage"
            this.#render() 
        }
    }
    previousPage() {
        if (this.#currentPage > 1) {
            this.#currentPage -= 1
            this.#lastRenderRow = this.#firstRenderRow - this.#perPage
            this.#firstRenderRow -= this.#perPage
            this.#animationOn = "previousPage"
            this.#render();
        }
    }
    #animatator(callback) {
        switch (this.#animation) {
            case "move":
                switch (this.#animationOn) {
                    case 'nextPage':
                        this.#viewContainer.animate([
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
                            this.#viewContainer.animate([
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
                        this.#viewContainer.animate([
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
                            this.#viewContainer.animate([
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
                this.#viewContainer.animate([
                    { opacity: 1 },
                    { opacity: 0 },
                ], {
                    duration: 400,
                    iterations: 1,
                    fill: "forwards"
                });

                setTimeout(() => {
                    callback()
                    this.#viewContainer.animate([
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
        if (this.#gridItemWidth == "fit") {
            style = `
                #${this.#gridContainer.id} > ${this.#gridItemTagName}{
                    min-width:${this.#gridItemMinWidth};
                }
                `;
            let numberOfRows = Math.floor(this.#container.offsetWidth / (parseInt(this.#gridItemMinWidth.match(/\d*/)[0]) + parseInt(this.#gridGap.match(/\d*/)[0])))
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
            let numberOfRows = Math.floor(this.#container.offsetWidth / parseInt(this.#gridItemWidth.match(/\d*/)[0]))
            this.#gridContainer.style.gridTemplateColumns = `repeat(${numberOfRows},${this.#gridItemWidth})`
        }
        // 
        if (document.getElementById("ViewStyle") == null) {
            const styleTag = document.createElement("style");
            styleTag.id = 'ViewStyle';
            styleTag.textContent = style
            this.#container.append(styleTag);

        } else {
            document.getElementById("ViewStyle").textContent = style
        }
    }
    #calculateTotalPages() {
        return Math.ceil(this.#data.length / this.#perPage);
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