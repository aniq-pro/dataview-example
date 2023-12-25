// import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';
export const fakeData = (Rows,Type) => {
    let data = [];
    if (Type == "users") {
        for (var i = 0; i < Rows; i++) {
            var name = "User " + (i + 1);
            var email = "user" + (i + 1) + "@example.com";
            var number = "555-" + Math.floor(Math.random() * 10000);
            var role = i % 2 == 0 ? "Manager" : "Developer";
            let random = Math.floor(Math.random() * 5);
            switch (random) {
                case 0:
                    var img = "https://source.unsplash.com/random/250x250/?men-profile";
                    break;
                case 1:
                    var img = "https://source.unsplash.com/random/250x250/?men-profile";
                    break;
                case 2:
                    var img = "https://source.unsplash.com/random/250x250/?men-profile";
                    break;
                case 3:
                    var img = "https://source.unsplash.com/random/250x250/?men-profile";
                    break;
                case 4:
                    var img = "https://source.unsplash.com/random/250x250/?men-profile";
                    break;
            }
            data.push({ img: img, name: name, email: email, number: number, role: role });
        }
    }
    if (Type == "products") {
        for (var i = 0; i < Rows; i++) {
            var title = "User " + (i + 1);
            var email = "user" + (i + 1) + "@example.com";
            var number = "555-" + Math.floor(Math.random() * 10000);
            var role = i % 2 == 0 ? "Manager" : "Developer";
            let random = Math.floor(Math.random() * 5);
            switch (random) {
                case 0:
                    var img = "https://source.unsplash.com/random/250x250/?men-profile";
                    break;
                case 1:
                    var img = "https://source.unsplash.com/random/250x250/?men-profile";
                    break;
                case 2:
                    var img = "https://source.unsplash.com/random/250x250/?men-profile";
                    break;
                case 3:
                    var img = "https://source.unsplash.com/random/250x250/?men-profile";
                    break;
                case 4:
                    var img = "https://source.unsplash.com/random/250x250/?men-profile";
                    break;
            }
            data.push({ img: img, name: name, email: email, number: number, role: role });
        }
    }
    return data;
}
export const repeat = (Array,NumberOfRepeat)=>{
    let newArray = []
    for (let index = 0; index < NumberOfRepeat; index++) {
        for (const element of Array) {
            newArray.push(element)
        }
    }
    return newArray;
}