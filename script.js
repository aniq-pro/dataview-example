"use strict";
import DataView from "./DataView/DataView.js";
import { Templator } from "./DataView/Templators/ArithmeticTemplator.js";
import { fakeData, repeat } from "./fakeData.js";

const viewContainer = document.getElementById("viewContainer")
const nextPage = document.getElementById("nextPage")
const previousPage = document.getElementById("previousPage")
const perPageInput = document.getElementById("perPageInput")
const paginationPagesBox = document.getElementById("paginationPagesBox")
const viewBtns = document.getElementById("viewBtns")
const searchInput = document.getElementById("searchInput")
const searchColumnsSelect = document.getElementById("searchColumnsSelect")
const selectionBtn = document.getElementById("selectionBtn")

let data = [
  {img:"google pixel 7a.jpg",title:'google pixel 7a',price:'86499',rating:5,brand:"GooGlE",discount:"10%"},
  {img:"iphone 12 pro.jpg",title:'iphone 12 pro' ,price:'100000',rating:3,brand:"iphone",discount:"20%"},
  {img:"samsung s23 ultra.jpg",title:'samsung s23' ,price:'140999',rating:4.5,brand:"samsung",discount:"15%"},
  {img:"iphone 13.jpg",title:'iphone 13 pro' ,price:'310999',rating:4,brand:"iphone",discount:"25%"},
  {img:"iphone 14.jpg",title:'iphone 14' ,price:'480499',rating:5,brand:"iphone",discount:"30%"},
]


// let data = await fetch("https://fakestoreapi.com/products")
// data = await data.json();
// console.log(data);
// data = repeat(data,500)
// console.log(data);
// data = [{},{}]
console.time("Dataview Rendering Time");
data = repeat(data,500)
const dataView = new DataView(data, viewContainer);
dataView.config({
  perPage: 20,
  autoload:true,
  autoFetch: true,
  autoFetchWhen:80,
  dataApiUrl: "https://jsonplaceholder.typicode.com/posts?start={last:title}&perPage={perPage}",
  gridGap: "20px",
  gridItemMinWidth: "200px",
  animation: "fade",
  lazyloadImageColor:'#ddd',
  // apiSearching:true,
  searchApi: "https://jsonplaceholder.typicode.com/posts?query={query}&searchCaseSensitive={searchCaseSensitive}&column={column}",
  // searchCaseSensitive:true,
  position: dataView.POSITIONS.RIGHT
});
console.log(dataView);
// let t1 = performance.now();

// console.log(dataView.gridContainer);
// dataView.gridItemTemplate(`<div class="card">
// <img src="images/img1.jpg" alt="" width="100%" height="">
// <div class="card-body">
//   <h5 class="card-title">{{column:name}}</h5>
//   <h6 class="card-subtitle mb-2 text-muted">{{column:role}}</h6>

//   <p class="card-text">Date d-m-y  {{date:d}}-{{date:m}}-{{date:y}}</p>
//   <p class="card-text">Date y-m-d  {{date:y}}-{{date:m}}-{{date:d}}</p>

//   <p class="card-text">Time {{time:h}}:{{time:m}}:{{time:s}}</p>

//   <a href="#" class="card-link">{{column:email}}</a>
//   <a href="#" class="card-linloadimagek">{{column:number}}</a>
// </div>
// </div>`);
// {%load|img|250px|<img src="images/{%column:img%}" class="card-img-top" alt="..." loading="lazy">%}
// https://source.unsplash.com/random/300x250/?{%counter%}
dataView.register.templator(Templator) 
dataView.gridItemTemplate = `<div class="card custom-card">
<span class="badge bg-primary" style="position: absolute;top: 10px;right: 10px;">{%counter%}</span>
{{loadimage|120px|100%|<img src="images/{%column:img%}" class="card-img-top" alt="Product Image" loading="lazy">}}

<div class="card-body">
    <h5 class="card-title">{%column:title|firstCap%}</h5>
    <div class="card-badge">
        <span class="badge bg-primary">{%column:brand|lower%}</span>
    </div>
    <div class="card-details">
        <div class="price-rating">
            <span class="price">Rs{%column:price|formatNum%}</span>
            <span class="rating">Rating: {%column:rating%}</span>
        </div>
    </div>
</div>
</div>`;


dataView.listItemTemplate = `<div class="card position-relative">
<div class="row g-0">
  <div class="col-md-4 bg-secondary">
{{loadimage|200px|100%|<img src="images/{%column:img%}" class="card-img-top" alt="..." loading="lazy">}}
    <p class='ms-1 mt-1 bg-primary badge text-white position-absolute top-0 start-0'><b>{%column:discount%} OFF</b></p>
    <p class=' mt-3 badge bg-primary text-white position-absolute top-0 end-0 translate-middle'><b>{%counter%}</b></p>
  </div>
  <div class="col-md-8">
    <div class="card-body justify-content-start">
      <h5 class="card-title">Rs {%column:price|formateNum%}</h5>
      <h6 class="card-subtitle mb-2">{%column:title|firstCap%}</h6>
      <p class="card-text">This is a wider card with supporting text below as.</p>
      <div class="d-flex flex-column">
    <div class="d-flex">
    <button class="btn btn-outline-primary">Call</button>
    <button class="btn btn-primary ms-3">Chat</button>
    </div>
    </div>
    </div>
  </div>
</div>
</div>`;
// dataView.render();
dataView.tableRowHtml = `<tr>
  <td>{%counter%}</td>
  <td>{{loadimage|40px|40px|<img src="images/{%column:img%}" class="card-img-top" alt="..." loading="lazy">}}</td>
  <td>{%column:title|firstCap%}</td>
  <td>{%column:price|formateNum%}</td>
  <td>{%column:rating%}</td>
  <td>{%column:brand|allSmall%}</td>
  <td>{%column:discount%}</td>
</tr>`
dataView.tableClass = "table table-light table-sm"

dataView.tableColumns = ["S.no", "Img", "Title", "Price", "Rating", "Brand", "Discount"]
dataView.view = "grid"
dataView.searchIn = "all"
// dataView.startSelection({top:"10px",left:"10px"},(options)=>{
//   console.log(dataView.selected);
//   console.log(options);
//   if (options.checked) {
//     options.element.style.border = "3px solid #007bff";
//   }else{
//     options.element.style.border = "";
//   }
// })


// let t2 = performance.now();
// console.log(t2-t1);
console.timeEnd("Dataview Rendering Time")
const searchColumns = () => {
  searchColumnsSelect.innerHTML = `<option value='all'>all</option>`
  for (const column of dataView.columns) {
    searchColumnsSelect.innerHTML += `<option value='${column}'>${column.toUpperCase()}</option>`
  }
}
searchColumns()
function paginationPages() {
  paginationPagesBox.innerHTML = ''
  let index = dataView.currentPage;
  if (index == 2) {
    index -= 1
  } else if (index > 2 && index <= dataView.totalPages - 3) {
    index -= 2
  } else if (index != 1 && index == dataView.totalPages - 2) {
    index -= 3
  } else if (index != 1 && index == dataView.totalPages - 1) {
    index -= 4
  } else if (index == dataView.totalPages) {
    index -= 5
  }
  let pages = 0
  let lastPageNum;
  while (index <= dataView.totalPages) {
    if (pages == 5) { break; }
    const li = document.createElement('li');
    li.className = `page-item ${dataView.currentPage == index ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#?page${index}">${index}</a>`
    li.title = `JumpTo Page:${index}`
    paginationPagesBox.append(li)
    pages++
    lastPageNum = index
    index++
  }
  if (lastPageNum < dataView.totalPages) {
    const li = document.createElement('li');
    li.className = `page-item ${dataView.currentPage == dataView.totalPages ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#?page${dataView.totalPages}">${dataView.totalPages}</a>`
    li.title = "JumpTo Last Page"
    paginationPagesBox.append(li)
  }

}
console.error(dataView.errors);
paginationPages()
// 
nextPage.addEventListener('click', () => {
  let t1 = performance.now();
  dataView.nextPage()
  console.log(dataView.currentPage);
  paginationPages()
  let t2 = performance.now();
  console.log(t2 - t1);
})
previousPage.addEventListener('click', () => {
  let t1 = performance.now();
  dataView.previousPage()
  paginationPages()
  let t2 = performance.now();
  console.log(t2 - t1);
})
perPageInput.addEventListener('change', (e) => {
  let t1 = performance.now();
  dataView.perPage = e.target.value
  paginationPages()
  let t2 = performance.now();
  console.log(t2 - t1);
})
paginationPagesBox.addEventListener('click', (e) => {
  let t1 = performance.now();
  dataView.jumpToPage(e.target.innerText);
  paginationPages()
  let t2 = performance.now();
  console.log(t2 - t1);
});
viewBtns.addEventListener('click', (e) => {
  let t1 = performance.now();
  document.querySelector(`#${viewBtns.id} .nav-link.active`).classList.remove("active")
  e.target.classList.add("active")
  if (e.target.classList.contains("list")) {
    dataView.view = ("list")
  } else if (e.target.classList.contains("grid")) {
    dataView.view = "grid"
  } else if (e.target.classList.contains("table")) {
    dataView.view = "table"
  }
  let t2 = performance.now();
  console.log(t2 - t1);
});

let searchQuery = '';
searchColumnsSelect.addEventListener("change", (e) => {
  let t1 = performance.now();
  dataView.searchIn = e.target.value;
  dataView.search(searchQuery)
  paginationPages();
  let t2 = performance.now();
  console.log(t2 - t1);
}); 

selectionBtn.addEventListener("change", (e) => {
  let t1 = performance.now();
  if(e.target.checked){
    dataView.startSelection((Option)=>{
      console.log(Option);
      console.log(dataView.selected);
    })
  }else{
    dataView.stopSelection();
  }
  let t2 = performance.now();
  console.log(t2 - t1);
});

searchInput.addEventListener("keyup", (e) => {
  let t1 = performance.now();
  dataView.search(e.target.value)
  searchQuery = e.target.value
  paginationPages();
  let t2 = performance.now();
  console.log(t2 - t1);
});

const memoryInfo = performance.memory;
console.log(`Used JS Heap: ${memoryInfo.usedJSHeapSize / (1024 * 1024)} MB`);


// 
// 
// Function to be tested
// function processArray(array) {
//   let result = 0;
//   let length = array.length;
//   for (let i = 0; i < length; i++) {
//     result += array[i];
//   }
//   // for (const el of array) {
//   //   result += el;
//   // }
//   // array.forEach((value)=>{
//   //   result += value;
//   // })
//   return result;
// }

// // Performance testing function
// function runPerformanceTest() {
//   const arraySize = 1000000; // Adjust the array size based on your use case
//   const testArray = Array.from({ length: arraySize }, (_, index) => index + 1);

//   // Measure the time taken to execute the function
//   const startTime = performance.now();
//   const result = processArray(testArray);
//   const endTime = performance.now();

//   // Output the result and execution time
//   console.log(`Result: ${result}`);
//   console.log(`Execution Time: ${endTime - startTime} milliseconds`);
// }

// // Run the performance test
// runPerformanceTest();
