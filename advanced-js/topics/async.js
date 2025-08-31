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

// fetch(`${base_url}/1`)
//   .then((data) => {
//     console.log("Data:", data);
//     return fetch(`${base_url}/2`);
//   })
//   .then((data) => {
//     console.log("Data 2:", data);
//     return fetch(`${base_url}/3`);
//   })
//   .then((data) => {
//     console.log("Data 3:", data);
//   });
//
// async await version
async function getFourPokemon() {
  try {
    const res1 = await fetch(`${base_url}/1`);
    console.log("Response 1:", res1);

    const res2 = await fetch(`${base_url}/2`);
    console.log("Response 2:", res2);

    // throw new Error("response 3");

    const res3 = await fetch(`${base_url}/3`);
    console.log("Response 3:", res3);

    const res4 = await fetch(`${base_url}/4`);
    console.log("Response 4:", res4);
  } catch (err) {
    console.log("Error:", err);
  }
}

// getFourPokemon();

// patterns for async

// Promise.all
/*
  Promise.all accepts an array of promises and returns a new promise

  New promises will resolve when every promise in array resolves,
  and will reject if ANY promise is the array is rejected
*/
const lotsOfFetchCalls = [
  fetch(`${base_url}/1`),
  fetch(`${base_url}/2`),
  fetch(`${base_url}/3`),
  fetch(`${base_url}/4`),
  fetch(`${base_url}/5`),
  fetch(`${base_url}/6`),
];

const result = Promise.all(lotsOfFetchCalls).then((result) => {
  console.log("the inside results", result);
});

console.log("result:", result);

/* Promise.allSettled

  Promise.allSettled accepts an array of promises and returns a new promise.

  The promise resolves after all of the given promises have either fulfilled  
  or rejected, with an array of objects that each describes the outcome of each 
  promise.
*/

/* Promise.race
  - Also accepts an array of promises and returns a new promise 
  - This new promise will resolve or reject as soon as one promise 
  in the array resolves or rejects
*/

// building own promises
/*
  - You can use Promise with the new keyword to make your own promise 
  - Promise accepts a single function (cll it fn) as an argument 
    - fn accepts two functions as arguments, resolve and reject 
    - Pass resolve a value for the promise to resolve to that value 
    - Pass reject a value for the promise to reject to that value
*/

// setTimeout(() => {
//   console.log("hi");
// }, 2000);

function wait(duration) {
  const p = new Promise((resolve) => {
    setTimeout(() => {
      resolve("I am resolved");
    }, duration);
  });

  return p;
}

async function demo() {
  console.log("hi");
  const response = await wait(2000);
  console.log("there");
  console.log("response:", response);
}

demo();

const test = async () => {
  try {
    const response = await fetch(`${base_url}/1`);
    const data = await response.json();
    Promise.reject("whoops");
    console.log("Datas:", data);
  } catch (err) {
    console.log("Error:", err);
  }
};

test();
