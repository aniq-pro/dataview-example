export class View{
    #viewContainer
    #data
    #render
    #container
    #gridGap
    #gridColumns
    #gridContainer
    #tableContainer
    #firstRenderRow = 0 
    #lastRenderRow = 0 
    #listItemHtml = null;
    #gridItemHtml = null;
    #perPage
    #currentPage = 1;
    #totalPages
    #animation
    #animationOn = null
    constructor(Data,ViewContainer){
        this.#viewContainer = ViewContainer
        this.#viewContainer.style.overflow="hidden"
        this.#data = Data
    }
    Config(Options = {}){
        // Set Options
        this.#perPage = Options.perPage || 20;
        this.#gridGap = Options.gridGap || "10px";
        this.#gridColumns = Options.gridColumns || 3;
        this.#animation = Options.animation || false
        // 
        this.tableContainerClass = 'view-table';
        this.listContainerClass = 'view-list';
        this.gridContainerClass =  'view-grid';

        this.#gridContainer = document.createElement('div');
        this.#tableContainer = document.createElement('div');

        this.#gridContainer.style.width = "100%"
        this.#gridContainer.style.display = "grid"
        this.#gridContainer.style.position = "relative"

        this.#gridContainer.id = 'ViewgridContainer'
        this.#gridContainer.style.gridTemplateColumns = `repeat(${this.#gridColumns},1fr)`
        this.#gridContainer.style.gap = this.#gridGap

        this.#gridContainer.classname = this.gridContainerClass;

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
        this.#gridItemHtml = this.#TemplatingEngine(Html)
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
            html += this.#RenderColumns(this.#gridItemHtml,this.#data[index]);
            this.#lastRenderRow = index;
        }
        if (this.#animation !=false && this.#animationOn != null) {
            this.#Animation(()=>{
                this.#gridContainer.innerHTML = html;
                this.#viewContainer.append(this.#gridContainer);
            })
        }else{
            this.#gridContainer.innerHTML = html;
            this.#viewContainer.append(this.#gridContainer);
        }
        this.#container = this.#gridContainer
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
                        this.#container.animate([
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
                            this.#container.animate([
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
                            this.#container.animate([
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
                                this.#container.animate([
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
                this.#container.animate([
                    { opacity:1 },
                    { opacity:0 },
                ],{
                    duration: 400, 
                    iterations: 1,
                    fill:"forwards"
                });

                setTimeout(() => {
                    callback()
                    this.#container.animate([
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
    #calculateTotalPages(){
        return Math.ceil(this.#data.length / this.#perPage);
    }
    #RenderColumns(Template,Data){
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