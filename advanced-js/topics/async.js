/*
  Promises and async/await 

  We need these because javascript is single threaded and would basically be stuck 
  if it had to sit and wait for a network response.  This is a simplified overview.

  Promises provide an alternate way to think about asynchronicity.
  A promise is one-time guarantee of future value.

  Promises have 3 different states they can resolve to:
  - Pending - it doesn't yet have a value 
  - Resolved - it has sucessfully obtained a value 
  - Rejected - it failed to obtain a value for some reason

  .then and .catch with callbacks to handle data

*/
// base_url = https://pokeapi.co/api/v2/pokemon
// fetch("https://jsonplaceholder.typicode.com/todos/1")

// basic of promises

// random building a dom list with js
// const mount = document.getElementById("mount");
// const div = document.createElement("div");
// const ul = document.createElement("ul");
// ul.style.width = "20%";
//
// fetch(base_url)
//   .then((response) => response.json())
//   .then((data) => {
//     console.log(data.results);
//     const results = data.results;
//
//     results.forEach((item) => {
//       console.log({ item });
//       const li = document.createElement("li");
//       const name = document.createElement("p");
//       name.innerText = item.name;
//
//       const url = document.createElement("p");
//       url.innerText = item.url;
//
//       li.appendChild(name);
//       li.appendChild(url);
//
//       li.style.border = "1px solid green";
//       li.style.listStyle = "none";
//       li.style.padding = "0 30px";
//
//       ul.appendChild(li);
//     });
//   });
//
// div.appendChild(ul);
// mount.appendChild(div);

const base_url = "https://pokeapi.co/api/v2/pokemon";
const url = `${base_url}/1`;

// fetch(url)
//   .then((data) => {
//     console.log("Data: ", data);
//   })
//   .catch((err) => {
//     console.error("Error: ", err);
//   });

// to do many with this older syntax you can do

fetch(`${base_url}/1`)
  .then((data) => {
    console.log("Data:", data);
    return fetch(`${base_url}/2`);
  })
  .then((data) => {
    console.log("Data 2:", data);
    return fetch(`${base_url}/3`);
  })
  .then((data) => {
    console.log("Data 3:", data);
  });
