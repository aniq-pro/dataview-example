export class View{
    #viewContainer
    #data
    #render
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
    #gridItemTagName=null;
    #perPage
    #currentPage = 1;
    #totalPages
    #animation
    #animationOn = null
    constructor(Data,Container){
        this.#container = Container
        this.#container.style.overflow="hidden"
        this.#data = Data
    }
    Config(Options = {}){
        // Set Options
        this.#perPage = Options.perPage || 20;
        this.#gridGap = Options.gridGap || "10px";
        this.#gridItemMinWidth = Options.gridItemMinWidth || 200;
        this.#gridItemWidth = Options.gridItemWidth || 'fit';
        this.#animation = Options.animation || false
        // 
        this.tableContainerClass = 'view-table';
        this.listContainerClass = 'view-list';
        this.gridContainerClass =  'view-grid';

        this.#gridContainer = document.createElement('div');    
        this.#gridContainer.id = 'ViewGridContainer'
        this.#gridContainer.className = this.gridContainerClass;
        this.#gridContainer.style.display = "flex"
        this.#gridContainer.style.flexWrap = "wrap"
        this.#gridContainer.style.justifyContent = "center"
        this.#gridContainer.style.gap = this.#gridGap
        this.#gridContainer.style.position = "relative"

        this.#tableContainer = document.createElement('div');
        this.#tableContainer.id = 'ViewTableContainer'
        this.#tableContainer.style.position = "relative"
        this.#tableContainer.classname = this.tableContainerClass;

        this.#totalPages = this.#calculateTotalPages()
        this.columns = Object.keys(this.#data[0])
        return this
    }
    get totalPages(){
        return this.#totalPages
    }
    get currentPage(){
        return this.#currentPage
    }
    listItemTemplate(Html){
        this.#listItemHtml = Html
    }
    gridItemTemplate(Html){
        if (!Html.startsWith("<")) {console.warn("Invalid Grid Item Template");return ""}
        this.#gridItemHtml = this.#TemplatingEngine(Html);
        this.#gridItemTagName = this.#gridItemHtml.slice(1,this.#gridItemHtml.search(/<* /));
        this.#gridItemStyle();
    }
    render(){
        return this.#render
    }
    renderGrid(){
        if (this.#gridItemHtml==null) { console.warn("Please Set Grid Item Template ");return null; }
        let html = ''
        let numberOfRows = this.#perPage + this.#lastRenderRow;
        for (let index = this.#firstRenderRow; index < numberOfRows; index++) {
            if (this.#data[index]==undefined) {break;}
            html += this.#RenderColumns(this.#gridItemHtml,this.#data[index],index+1);
            this.#lastRenderRow = index;
        }
        if (this.#animation !=false && this.#animationOn != null) {
            this.#Animation(()=>{
                this.#gridContainer.innerHTML = html;
                this.#container.append(this.#gridContainer);
            })
        }else{
            this.#gridContainer.innerHTML = html;
            this.#container.append(this.#gridContainer);
        }
        
        this.#viewContainer = this.#gridContainer
        this.#render = this.renderGrid
    }
    jumpToPage(PageNumber){
        console.log(parseInt(PageNumber));
    }
    perPage(Value){
        this.#perPage = parseInt(Value)
        this.#totalPages = this.#calculateTotalPages()
        console.log(`Last Row : ${this.#lastRenderRow}`);
        
        console.log(`First Row : ${this.#firstRenderRow}`);
        this.#currentPage = this.#currentPage == 1? this.#currentPage : Math.floor(this.#lastRenderRow / this.#perPage) + 1
        // if (this.#currentPage == this.#totalPages &&  this.#lastRenderRow != (this.#data.length -1)) {
        //     this.#totalPages +=1
        // }
        if (this.#lastRenderRow == (this.#data.length -1)) {
            this.#firstRenderRow = this.#lastRenderRow - this.#perPage + 1
        }
        this.#lastRenderRow = this.#firstRenderRow
        // console.log(this.#firstRenderRow);
        console.log(`Total Pages : ${this.#totalPages}`);
        console.log(`Current Page : ${this.#currentPage}`);
        // console.log(this.#lastRenderRow);
        this.#render()
    }
    nextPage(){
        if (this.#currentPage < this.#totalPages) {
            this.#currentPage +=1
            this.#firstRenderRow = ++this.#lastRenderRow
            this.#animationOn = "nextPage"
            console.log(`Total Pages : ${this.#totalPages}`);
            console.log(`Current Page : ${this.#currentPage}`);
            this.#render()
        }
    }
    previousPage(){
        if (this.#currentPage > 1) {
            this.#currentPage -=1
            this.#lastRenderRow = this.#firstRenderRow - this.#perPage
            this.#firstRenderRow -= this.#perPage
            this.#animationOn = "previousPage"
            this.#render();
        }
    }
    #Animation(callback){
        switch (this.#animation) {
            case "move":
                switch (this.#animationOn) {
                    case 'nextPage':
                        this.#viewContainer.animate([
                            { left: "0" ,opacity:1 },
                            { left: "50%",opacity:1},
                            { left: "150%",opacity:1},
                            { left: "120%" ,opacity:0},
                            { left: "-120%"  ,opacity:0},
                            { left: "-120%"  ,opacity:1},
                        ],{
                            duration: 800, 
                            iterations: 1,
                            fill:"forwards"
                        })
                        setTimeout(() => {
                            callback()
                            this.#viewContainer.animate([
                                { left: "-150%",opacity:1},
                                { left: "-50%",opacity:1},
                                { left: "0",opacity:1},
                            ],{
                                duration: 400, 
                                iterations: 1,
                                fill:"forwards"
                            })
                        }, 250);
                        break;
                        case 'previousPage':
                            this.#viewContainer.animate([
                                { left: "0" ,opacity:1 },
                                { left: "-50%",opacity:1},
                                { left: "-150%",opacity:1},
                                { left: "-120%" ,opacity:0},
                                { left: "120%"  ,opacity:0},
                                { left: "150%"  ,opacity:1},
                            ],{
                                duration: 800, 
                                iterations: 1,
                                fill:"forwards"
                            })
                            setTimeout(() => {
                                callback()
                                this.#viewContainer.animate([
                                    { left: "150%",opacity:1},
                                    { left: "50%",opacity:1},
                                    { left: "0",opacity:1},
                                ],{
                                    duration: 400, 
                                    iterations: 1,
                                    fill:"forwards"
                                })
                            }, 250);
                            break;
                }
                break;
            case "fade":
                this.#viewContainer.animate([
                    { opacity:1 },
                    { opacity:0 },
                ],{
                    duration: 400, 
                    iterations: 1,
                    fill:"forwards"
                });

                setTimeout(() => {
                    callback()
                    this.#viewContainer.animate([
                        { opacity:0 },
                        { opacity:1 },
                    ],{
                        duration: 300, 
                        iterations: 1,
                        fill:"forwards"
                    });
                }, 500);
                break

        }
    }
    #gridItemStyle(){
        const styleTag = document.createElement("style");
        styleTag.id = 'gridItemStyle';
        if (this.#gridItemWidth == "fit") {
            let regex = /\d*/
            console.log(Math.round(this.#container.offsetWidth / parseInt(this.#gridItemMinWidth.match(regex)[0])));

            window.addEventListener("resize",()=>{
            console.log(Math.round(this.#container.offsetWidth / parseInt(this.#gridItemMinWidth.match(regex)[0])));

                let style =`
                #${this.#gridContainer.id} > ${this.#gridItemTagName}{
                    min-width:${this.#gridItemMinWidth};
                    width:${Math.round(this.#container.offsetWidth / parseInt(this.#gridItemMinWidth.match(regex)[0]))};
                }
                `;
                document.getElementById("gridItemStyle").textContent = style
            });
            styleTag.textContent +=`
            #${this.#gridContainer.id} > ${this.#gridItemTagName}{
                min-width:${this.#gridItemMinWidth};
                width:${Math.round(this.#container.offsetWidth / parseInt(this.#gridItemMinWidth.match(regex)[0]))};
            }
            `;
        }else{
            styleTag.textContent +=`
            #${this.#gridContainer.id} > ${this.#gridItemTagName}{
                min-width:${this.#gridItemMinWidth};
                width:${this.#gridItemWidth};
            }
            `;
        }
        this.#container.append(styleTag);
    }
    #calculateTotalPages(){
        return Math.ceil(this.#data.length / this.#perPage);
    }
    #RenderColumns(Template,Data,NumberOfRow){
        // this.columns.forEach((Value)=>{
        //     let columnPettern = `{{column:${Value}}}`;
        //     let columnPetternRegex = new RegExp(columnPettern,'g')
        //     Template = Template.replace(columnPetternRegex,Data[Value])
        // })
        for (let index = 0; index < this.columns.length; index++) {
            const column = this.columns[index];
            let columnPettern = `{{column:${column}}}`;
            let columnPetternRegex = new RegExp(columnPettern,'g')
            Template = Template.replace(columnPetternRegex,Data[column])
            Template = Template.replace(/{{srialno}}/,NumberOfRow)
        }
        return Template;
    }
    #TemplatingEngine(Template){
        let dateObj = new Date()
        // Dates 
        Template = Template.replace(/{{date:m}}/g,dateObj.getMonth())
        Template = Template.replace(/{{date:y}}/g,dateObj.getFullYear())
        Template = Template.replace(/{{date:d}}/g,dateObj.getDate())
        // Times 
        Template = Template.replace(/{{time:h}}/g,dateObj.getHours())
        Template = Template.replace(/{{time:m}}/g,dateObj.getMinutes())
        Template = Template.replace(/{{time:s}}/g,dateObj.getSeconds())
        return Template
    }
}