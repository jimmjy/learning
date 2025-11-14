/**
 * debouncing:
    Used to make sure a function is called only after a certain amount of time has 
    passed since it was last called
 */
console.log("from debounce");

const fakeQueryRequest = (searchTerm) => {
  console.log("requested api info", searchTerm);
};

const input = document.getElementById("input");

// this is how we control and reset a timeout when the user interacts

const debounced = (fn, delay) => {
  let timeoutId;

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const debouncedQuery = debounced(fakeQueryRequest, 1000);

/** Basically setup, we basically cleartimeout when someone types */
input.addEventListener("input", debouncedQuery);
