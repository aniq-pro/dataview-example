"use strict";
export default class DataView {
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
    #lazyloadImageColor
    // animations
    #animation
    #animationOn = null
    #animationDuration
    // 
    #rootStyle
    #position
    // 
    #autoFetch
    #autoFetchWhen
    #searchApi
    // observers
    #imgObserver
    #autoloadObserver
    #autoload
    #autoloadWhen
    #errors = []
    constructor(Data, Container) {
        this.#mainContainer = Container
        // this.#mainContainer.style.overflow = "hidden"
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
    config(Options = {}) {
        // if (this.#errors.length > 0) { return }
        this.#renderData = this.#data
        const root = document.querySelector(":root");
        this.#rootStyle = getComputedStyle(root);
        this.#perPage = Options.perPage || 20;
        this.#lazyloadImageColor = Options.lazyloadImageColor || "#eee";
        this.#autoload = Options.autoload || false;
        this.#autoloadWhen = Options.autoloadWhen || 10;
        this.#autoFetch = Options.autoFetch || false;
        this.#autoFetchWhen = Options.autoFetchWhen || 40;
        this.dataApiUrl = Options.dataApiUrl || ""
        if (this.#autoFetch) {
            if (this.dataApiUrl == "") { this.#errors.push("Data API Url not provided for fetching data."); }
            else if (typeof this.dataApiUrl != 'string') { this.#errors.push("Invalid Data API Url"); }
            else if (!this.dataApiUrl.startsWith("http") && !this.dataApiUrl.startsWith("https")) { this.#errors.push("Invalid Data API Url .Protocol not Provided"); }
        }

        this.apiSearching = Options.apiSearching || false;
        this.#searchApi = Options.searchApi || ""
        if (this.apiSearching) {
            if (this.#searchApi == "") { this.#errors.push("Search API Url not provided for fetching data."); }
            else if (typeof this.#searchApi != 'string') { this.#errors.push("Invalid Search API Url"); }
            else if (!this.#searchApi.startsWith("http") && !this.#searchApi.startsWith("https")) { this.#errors.push("Invalid Search API Url .Protocol not Provided"); }
        }
        // grid
        this.#gridGap = Options.gridGap || "10px";
        this.#gridItemMinWidth = Options.gridItemMinWidth || '200px';
        this.#gridItemWidth = Options.gridItemWidth || 'fit';
        if (Options.gridItemMinWidth && Options.gridItemMinWidth.endsWith("%")) { this.errors.push("In gridItemMinWidth % percentage is not allowed") }
        if (Options.gridItemWidth && Options.gridItemWidth.endsWith("%")) { this.errors.push("In gridItemWidth % percentage is not allowed") }
        // list
        this.#listGap = Options.listGap || "10px";
        this.#listItemMinWidth = Options.listItemMinWidth || '500px';
        this.#listItemWidth = Options.listItemWidth || 'fit';
        if (Options.listItemMinWidth && Options.listItemMinWidth.endsWith("%")) { this.errors.push("In listItemMinWidth % percentage is not allowed") }
        if (Options.listItemWidth && Options.listItemWidth.endsWith("%")) { this.errors.push("In listItemWidth % percentage is not allowed") }
        // search
        this.searchIn = Options.searchIn || "all";
        this.searchCaseSensitive = Options.searchCaseSensitive || false;
        // 
        this.#animation = Options.animation || false;
        if (Options.animationDuration) {
            root.style.setProperty("--animation-duration", Options.animationDuration);
        }
        this.#animationDuration = Options.animationDuration?.slice(0, -1) || this.#rootStyle.getPropertyValue("--animation-duration").slice(0, -1) || 1
        this.#position = Options.position || this.POSITIONS.LEFT;
        // 
        this.tableClass = 'data-view-table table';
        this.listContainerClass = 'data-view-list';
        this.gridContainerClass = 'data-view-grid';

        this.#gridContainer = document.createElement('div');
        this.#gridContainer.id = 'ViewGridContainer';
        this.#gridContainer.className = this.gridContainerClass;
        this.#gridContainer.style.display = "grid";
        this.#gridContainer.style.gap = this.#gridGap;
        this.#gridContainer.style.position = "relative";
        this.#mainContainer.append(this.#gridContainer);
        // list
        this.#listContainer = document.createElement('div');
        this.#listContainer.id = 'ViewListContainer';
        this.#listContainer.className = this.listContainerClass;
        this.#listContainer.style.display = "grid";
        this.#listContainer.style.gap = this.#listGap;
        this.#listContainer.style.position = "relative";
        this.#mainContainer.append(this.#listContainer);
        // Table
        this.#tableContainer = document.createElement('table');
        this.#tableContainer.id = 'ViewTableContainer';
        this.#tableContainer.style.position = "relative";
        this.#tableContainer.className = this.tableClass;
        this.#tableContainer.createTBody();
        this.#mainContainer.append(this.#tableContainer);
        // Search
        this.#searchContainer = document.createElement('div');
        this.#searchContainer.id = 'ViewSearchContainer';
        this.#searchContainer.style.display = "grid";
        this.#searchContainer.style.position = "relative";
        this.#mainContainer.append(this.#searchContainer);
        // 
        this.#totalPages = this.#calculateTotalPages();
        this.columns = Object.keys(this.#data[0]);
        this.selected = [];
        this.inSelection = false;
        // 
        this.#templator = new Templator({
            "lazyloadImageColor": this.#lazyloadImageColor
        });
        // Image Observer for lazy load images
        this.#imgObserver = new IntersectionObserver((images) => {
            const length = images.length;
            for (let index = 0; index < length; index++) {
                if (images[index].isIntersecting) {
                    const img = images[index].target;
                    img.src = img.dataset.viewLoadimg
                    img.style.visibility = "visible"
                    // Remove the observer after loading the image
                    this.#imgObserver.unobserve(img);
                }
            }
        }, { rootMargin: "300px" });
        // AutoLoad Observer
        if (this.#autoload) {
            this.#autoloadObserver = new IntersectionObserver((entries) => {
                const length = entries.length;
                for (let index = 0; index < length; index++) {
                    if (entries[index].isIntersecting) {
                        if (this.#currentPage < this.#totalPages) {
                            this.#render(false)
                            this.#currentPage += 1;
                            console.log(this.#currentPage);
                        }

                        this.#autoloadObserver.unobserve(entries[index].target)
                    }
                }
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

        } else if (this.#renderState == "search") {
            current = this.#searchCurrentPage;
        }
        return current
    }
    get errors() {
        return this.#errors;
    }
    get register() {
        // if (this.#errors.length > 0) { return }
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
        Html = Html.trim()
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
        Html = Html.trim()
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
        Html = Html.trim()
        if (!Html.startsWith("<")) { this.#errors.push("Invalid Table Row Template"); return "" }
        this.#tableRowHtml = this.#templator.oneTimeParse(Html);
        this.#gridStyle();
    }
    /**
     * @param {array} Array
     */
    set tableColumns(Array) {
        this.#tableColumns = Array
        let tHead = this.#tableContainer.createTHead();
        let tableHeadings = "<tr>";
        for (let index = 0; index < this.#tableColumns.length; index++) {
            tableHeadings += `<th>${this.#tableColumns[index]}</th>`;
        }
        tableHeadings += "</tr>";
        tHead.innerHTML = tableHeadings
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
        if (this.inSelection) {return "You are in Selection Mode";}
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
                this.#tableContainer.style.display = "table"
                this.#viewContainer = this.#tableContainer;

                if (this.#reRenderTable) {
                    this.#lastRenderRow = this.#firstRenderRow
                    this.#render()
                }
                break;
        }
    }
    async search(Query) {
        if (this.inSelection) {return "You are in Selection Mode";}
        if (Query == "") {
            if (this.#view == "grid") { this.#viewContainer = this.#gridContainer; this.#gridContainer.style.display = "grid" }
            else if (this.#view == "list") { this.#viewContainer = this.#listContainer; this.#listContainer.style.display = "grid" }
            else if (this.#view == "table") { this.#viewContainer = this.#tableContainer; this.#tableContainer.style.display = "block" }
            this.#searchContainer.style.display = "none";
            this.#renderData = this.#data;
            // this.#currentPage = 1
            // for (let index = 0; index < this.#firstRenderRow; index += this.#perPage) {
            //     if (index + this.#perPage > this.#firstRenderRow) {
            //         this.#firstRenderRow = index
            //     } else {
            //         this.#currentPage++;
            //     }
            // }
            // this.#lastRenderRow = this.#firstRenderRow + this.#perPage - 1
            this.#searchCurrentPage = 1;
            this.#renderState = "main";
            return
        }

        if (this.#searchContainerReConfig) {
            this.#searchContainerReConfig = false
            this.#searchContainerConfig()
        }
        if (this.apiSearching) {
            const url = this.#searchApi.replace(/{(.*?)}/g, (match, placeholder) => {
                if (placeholder == "query") {
                    return Query
                } else if (placeholder == "searchCaseSensitive") {
                    return this.searchCaseSensitive
                } else if (placeholder == "column") {
                    return this.searchIn
                }
            });
            console.log(`url : ${url}`); 
            let data = await fetch(url);
            data = await data.json();
            this.#renderData = data;
        } else {
            this.#renderData = this.#data.filter((Value) => {
                if (this.searchIn == "all") {
                    if (this.searchCaseSensitive) {
                        return JSON.stringify(Value).includes(Query);
                    } else {
                        return JSON.stringify(Value).toLowerCase().includes(Query.toLowerCase());
                    }
                } else {
                    if (this.searchCaseSensitive) {
                        return String(Value[this.searchIn]).includes(Query);
                    } else {
                        return String(Value[this.searchIn]).toLowerCase().includes(Query.toLowerCase());
                    }
                }
            });
        }
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

    async #fetchData() {
        // console.log(`this.#data.length ${this.#data.length}`);
        // console.log(`this.#lastRenderRow ${this.#lastRenderRow + 1}`);
        // console.log(`this.#autoFetchWhen ${this.#autoFetchWhen}`);
        // console.log(`subtract ${this.#data.length - (this.#lastRenderRow + 1)}`);
        console.log("___________________________________________________________");
        if (this.#data.length - (this.#lastRenderRow + 1) <= this.#autoFetchWhen) {
            const url = this.dataApiUrl.replace(/{(.*?)}/g, (match, placeholder) => {

                if (placeholder == "last") {
                    return this.#data.length - 1
                }else if (placeholder == "last:index") {
                    return this.#data.length - 1
                }else if (placeholder == "last:counter") {
                    return this.#data.length
                }else if (placeholder.startsWith("last:")) {
                    return this.#data[this.#data.length - 1][placeholder.slice(5)]?.toString().replace(/ /g,"%20"); 
                }
                else if (placeholder == "perPage") {
                    return this.#perPage
                }
            });
            console.log(url);
            let data = await fetch(url);
            try {
                data = await data.json();
                this.#data = this.#data.concat(data);
                this.#renderData = this.#data;
                this.#totalPages = this.#calculateTotalPages()
            } catch (error) {
                console.error(error);
            }
        }
    }
    #render(newInsert = true) {
        if (this.errors.length > 0) { return; }
        let itemHtml;
        let firstRow;
        let lastRow;
        if (this.#renderState == "main") {
            if (newInsert) {
                firstRow = this.#firstRenderRow;
            } else {
                firstRow = ++this.#lastRenderRow;
            }
            lastRow = this.#lastRenderRow;
        } else if (this.#renderState == "search") {
            if (newInsert) {
                firstRow = this.#searchFirstRenderRow;
            } else {
                firstRow = ++this.#searchLastRenderRow;
            }
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
        let numberOfRows = this.#perPage + lastRow;
        let index;
        // with string concatenation -----------------------|
        let html = ''
        for (index = firstRow; index < numberOfRows; index++) {
            if (this.#renderData[index] == undefined) { break; }
            html += this.#templator.parseOnEveryRow(itemHtml, this.#renderData[index], index);
        }
        // with array -----------------------|
        // const htmlArray = [];
        // for (index = firstRow; index < numberOfRows; index++) {
        //     if (this.#renderData[index] == undefined) { break; }
        //     htmlArray.push(this.#templator.parseOnEveryRow(itemHtml, this.#renderData[index], index));
        // }
        // const html = htmlArray.join('');
        // const html = this.#renderData.slice(firstRow, numberOfRows)
        //     .map((data, index) => this.#templator.parseOnEveryRow(itemHtml, data, index))
        //     .join('');

        this.#lastRenderRow = --index;
        // if (this.#renderState == "search" && this.#currentPage > this.#searchPage) {
        if (this.#renderState == "search") {
            this.#searchLastRenderRowForNext = this.#lastRenderRow;
            this.#searchPage++
        }
        if (this.#animation != false && this.#animationOn != null) {
            this.#animator(() => {
                let container = this.#viewContainer
                if (this.#view == "table") {
                    container = container.tBodies[0]
                }
                if (newInsert) {
                    container.innerHTML = html
                } else {
                    container.innerHTML += html
                }

                setTimeout(() => {
                    const images = document.querySelectorAll(`#${this.#viewContainer.id} img[data-view-loadimg]`);
                    const length = images.length;
                    for (let index = 0; index < length; index++) {
                        this.#imgObserver.observe(images[index]);
                    }
                    if (this.#autoload) {
                        if (this.#view == "table") {
                            this.#autoloadObserver.observe(Array.from(this.#viewContainer.rows).at(-this.#autoloadWhen))
                        } else {
                            this.#autoloadObserver.observe(Array.from(this.#viewContainer.children).at(-this.#autoloadWhen))
                        }
                    }
                }, 30);
            }, this.#viewContainer)
        } else {
            let container = this.#viewContainer
            if (this.#view == "table") {
                container = container.tBodies[0]
            }
            if (newInsert) {
                container.innerHTML = html
            } else {
                container.innerHTML += html
            }
            setTimeout(() => {
                const images = document.querySelectorAll(`#${this.#viewContainer.id} img[data-view-loadimg]`);
                const length = images.length;
                for (let index = 0; index < length; index++) {
                    this.#imgObserver.observe(images[index]);
                }
                if (this.#autoload) {
                    if (this.#view == "table") {
                        this.#autoloadObserver.observe(Array.from(this.#viewContainer.rows).at(-this.#autoloadWhen));
                    } else {
                        this.#autoloadObserver.observe(Array.from(this.#viewContainer.children).at(-this.#autoloadWhen))
                    }
                }
            }, 30);
        }
        if (this.#autoFetch) {
            setTimeout(() => {
                this.#fetchData()
            }, 200);
        }
        if (this.inSelection) {
            setTimeout(() => {
                this.#setupSelection(firstRow,this.#lastRenderRow);
            }, 100);
        }
    }
    #setupSelection(start,end){
        const options = this.selectionOptions;
        if (this.#viewContainer == this.#tableContainer) {
            const rows = this.#viewContainer.rows;
            if (start==0) {
                var td = rows[0].insertCell(0);
                td.innerHTML = `<input type="checkbox" class="${options.class}" selection="all">`;
            }
            for (let index = start; index <= end; index++) {
                var td = rows[index+1].insertCell(0);
                td.innerHTML = `<input type="checkbox" class="${options.class}" selection="${index}">`;
            }
        }else{
            const children = this.#viewContainer.children;
            for (let index = start; index <= end; index++) {
                children[index].insertAdjacentHTML("afterbegin",`<input type="checkbox" class="${options.class}" selection="${index}" style="position: absolute;top: ${options.top};right:${options.right};bottom:${options.bottom};left: ${options.left};z-index: 5;">`)
            }
        }
    }
    startSelection(Callback=false,Options={}){
        Options.top = Options?.top || "10px";
        Options.right = Options?.right || "auto";
        Options.bottom = Options?.bottom || "auto";
        Options.left = Options?.left || "10px";
        Options.class = Options?.class || "selection";

        this.selectionOptions = Options;
        this.inSelection = true;
        this.#setupSelection(0,this.#perPage-1);
        // add Event Listener 
        this.#mainContainer.addEventListener("click",(e)=>{
            let element;
            if (this.#viewContainer == this.#gridContainer) {
                element = e.target.closest(`#ViewGridContainer > ${this.#gridItemTagName}`);
                
            }else if(this.#viewContainer == this.#listContainer){
                element = e.target.closest(`#ViewListContainer > ${this.#listItemTagName}`);
            }else{
                element = e.target.closest("tbody tr");
            }
            if (element) {
                const input = element.querySelector("input[selection]");
                if (!input) {return;}
                if(e.target!=input){
                    input.checked = !input.checked;
                }
                const index = Number(input.getAttribute("selection"));
                if (input.checked) {
                    this.selected.push({
                        index,
                        data:this.#renderData[index]
                    });
                    input.setAttribute("checked",true);
                }
                else{
                    input.removeAttribute("checked");
                    this.selected.splice(this.selected.findIndex(element=>element.index==index), 1);
                }
                if (Callback != false) {
                    Callback({
                        index:index,
                        element:element,
                        checked:input.checked
                    })
                }
            }else{
                const input = this.#viewContainer.querySelector("input[selection=all]");
                if (input) {
                    const inputs = this.#viewContainer.querySelectorAll("input[selection]");
                    const length = inputs.length -1;
                    if (input.checked) {
                        for (let index = 0; index < length; index++) {
                            const input = inputs[index+1];
                            this.selected.push({
                                index,
                                data:this.#renderData[index]
                            });
                            input.setAttribute("checked",true);
                        }
                    }else{
                        for (let index = 0; index < length; index++) {
                            const input = inputs[index+1];
                            input.removeAttribute("checked");
                            this.selected.splice(this.selected.findIndex(element=>element.index==index), 1);
                        }
                    }
                    if (Callback != false) {
                        Callback({});
                    }
                }
            }
        });
    }
    stopSelection(){
        this.selected = [];
        this.inSelection = false;
        const inputs = this.#viewContainer.querySelectorAll("input[selection]");
        const length = inputs.length
        for (let index = 0; index < length; index++) {
            inputs[index].remove();
        }
    }
    updateData(Callback){
        this.#data = Callback(this.#data);
    }
    jumpToPage(PageNumber) {
        if (this.inSelection) {return "You are in Selection Mode";}
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
        if (this.inSelection) {return "You are in Selection Mode";}
        if (this.#renderState == "main") {
            if (this.#currentPage < this.#totalPages) {
                this.#firstRenderRow = ++this.#lastRenderRow
                this.#reRenderGrid = true;
                this.#reRenderList = true;
                this.#reRenderTable = true;
                this.#currentPage += 1
                this.#animationOn = "nextPage"
                this.#render()
            }
        } else if (this.#renderState == "search") {
            if (this.#searchCurrentPage < this.#searchTotalPages) {
                this.#searchLastRenderRow = ++this.#searchLastRenderRowForNext;
                this.#searchFirstRenderRow = this.#searchLastRenderRowForNext;
                console.log(`this.#searchLastRenderRow : ${this.#searchLastRenderRow}`);
                console.log(`this.#searchLastRenderRowForNext : ${this.#searchLastRenderRowForNext}`);
                this.#searchCurrentPage += 1;
                this.#animationOn = "nextPage"
                this.#render()
            }
        }

    }
    previousPage() {
        if (this.inSelection) {return "You are in Selection Mode";}
        // if (this.#currentPage > 1) {
        //     if (this.#renderState == "main") {
        //         this.#lastRenderRow = this.#firstRenderRow - this.#perPage
        //         this.#firstRenderRow -= this.#perPage
        //         this.#reRenderGrid = true;
        //         this.#reRenderList = true;
        //         this.#reRenderTable = true;
        //         this.#currentPage -= 1
        //     } else if (this.#renderState == "search") {
        //         this.#searchLastRenderRow = this.#searchFirstRenderRow - this.#perPage
        //         this.#searchFirstRenderRow -= this.#perPage
        //         this.#searchPage--;
        //     }
        //     this.#animationOn = "previousPage"
        //     this.#render();
        // }
        if (this.#renderState == "main") {
            if (this.#currentPage > 1) {
                this.#firstRenderRow -= this.#perPage
                this.#lastRenderRow = this.#firstRenderRow
                this.#reRenderGrid = true;
                this.#reRenderList = true;
                this.#reRenderTable = true;
                this.#currentPage--;
                this.#animationOn = "previousPage"
                this.#render()
            }
        } else if (this.#renderState == "search") {
            if (this.#searchCurrentPage > 1) {
                // this.#searchLastRenderRow = --this.#searchLastRenderRowForNext;
                this.#searchFirstRenderRow -= this.#perPage;
                this.#searchLastRenderRow = this.#searchFirstRenderRow
                console.log(`this.#searchLastRenderRow : ${this.#searchLastRenderRow}`);
                console.log(`this.#searchLastRenderRowForNext : ${this.#searchLastRenderRowForNext}`);
                this.#searchCurrentPage--;
                this.#animationOn = "previousPage"
                this.#render()
            }
        }
    }
    #searchContainerConfig(View = null) {
        if (this.#viewContainer.id == this.#gridContainer.id || View == "grid") {
            this.#searchContainer.style.gap = this.#gridGap;
            this.#gridStyle(this.#searchContainer);
        } else if (this.#viewContainer.id == this.#listContainer.id || View == "list") {
            this.#searchContainer.style.gap = this.#listGap;
            this.#listStyle(this.#searchContainer);
        } else {
            this.#searchContainer.style.gridTemplateColumns = `repeat(1,1fr)`;
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
                        return;
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
                        return;
                }
                return;
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
                return;
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
                    max-width:${this.#gridItemWidth};
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
                    max-width:${this.#listItemWidth};
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
    #lazyloadImageColor;
    templator = null
    constructor(Options) {
        this.#templatingBasicMethods = {
            formatNum: this.formatNum
        }
        this.#lazyloadImageColor = Options.lazyloadImageColor
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
        // Load Image
        const tagPlaceholderRegex = /{{loadimage\|(.*?)>}}/g;
        renderedTemplate = renderedTemplate.replace(tagPlaceholderRegex, (match, placeholders) => {
            let [height, element] = placeholders.split("|");
            let width = '';
            if (!element?.startsWith("<img")) {
                width = `width:${element};`
                element = placeholders.split("|")[2]
            }
            if (element?.match(/style=('|")(.*?)/)) {
                element = `${element.slice(0, element.match(/style="?'?(.*?)/).index + 7)}width:100%;height:100%;visibility:hidden;${element.slice(element.match(/style="?'?(.*?)/).index + 7)}>`
            } else {
                element += ` style="width:100%;height:100%;visibility:hidden;">`
            }
            element = element.replace(/src=('|")(.*?)('|")/, (Match, Extra, Value) => {
                return `data-view-loadimg="${Value}"`
            })
            let parent = `<div style="${width}height:${height};background:${this.#lazyloadImageColor};">${element}</div>`
            return parent;
        });
        return renderedTemplate
    }
    parseOnEveryRow(Template, Data, NumberOfRow) {
        let renderedTemplate = Template;
        if (this.templator != null && this.templator.parseOnEveryRow != undefined) {
            renderedTemplate = this.templator.parseOnEveryRow(renderedTemplate, Data, NumberOfRow)
        }
        //  
        const placeholderRegex = /{%(.[^{%]*?)%}/g;
        renderedTemplate = renderedTemplate.replace(placeholderRegex, (match, placeholders) => {
            const [type, others, formatterDynamic] = placeholders.split(":")
            const [name, formatter] = others != undefined ? others.split("|") : ""
            let returnValue = match;
            switch (type) {
                case "counter":
                    returnValue = NumberOfRow + 1
                    break;
                case "column":
                    const subKey = name.match(/\[([^)]+)\]/)
                    if (subKey) {
                        returnValue = Data[name.slice(0, subKey?.index)][subKey[1]];
                    } else {
                        returnValue = Data[name];
                    }
                    if (Data[name] == undefined) { return; }
                    switch (formatter) {
                        case "upper":
                            returnValue = returnValue.toUpperCase()
                            break;
                        case "lower":
                            returnValue = returnValue.toLowerCase()
                            break;
                        case "firstCap":
                            returnValue = returnValue[0].toUpperCase() + returnValue.slice(1).toLowerCase()
                            break;
                        case "length":
                            returnValue = returnValue.slice(0, Number(formatterDynamic) + 1)
                            break;
                        case "formatNum":
                            returnValue = this.formatNum(returnValue)
                            break;
                    }
                    break;
            }
            return returnValue
        });
        return renderedTemplate;
    }
    formatNum(Value) {
        let array = Value.toString().split('');
        if (array.length == 5 && array[2] != '.') {
            array.splice(2, 0, ",");
        } else {
            if (array[3] != '.' && array.length > 3) {
                array.splice(3, 0, ",");
            }
        }
        if (array.indexOf(".") != -1 && array.length > array.indexOf(".") + 2) {
            array.length = array.indexOf(".") + 2;
        }
        return array.join('');
    }
}