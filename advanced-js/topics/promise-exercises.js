/** 
  Part 1: Number facts

  1. log piece of trivia to console
*/
const showNumberTrivia = async () => {
  try {
    const response = await fetch("http://numbersapi.com/random/trivia");
    console.log(response);
    const data = await response.text();
    console.log("the data", data);
  } catch (err) {
    console.log("error", err);
  }
};

showNumberTrivia();
