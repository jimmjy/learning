/*
  
*/

const boxOne = document.getElementById("box-one");
const boxTwo = document.getElementById("box-two");

let intervalAngle = 0;
let animationFrameAngle = 0;

function animateWithInterval() {
  boxOne.style.transform = "rotate(" + intervalAngle + "deg)";
  intervalAngle += 2;
}

function animateWithAnimationFrame(arg) {
  boxTwo.style.transform = "rotate(" + intervalAngle + "deg)";
  animationFrameAngle += 2;
  // we have to pass the whole function into here again because
  // requestAnimationFrame is only called once but putting it
  // in here basically makes it recursive
  requestAnimationFrame(animateWithAnimationFrame);
  // console.log(arg); this is the amount of time since last animation or frame
}

// start animation
setInterval(animateWithInterval, 16); // 60 fps approximately

// requestAnimationFrame just gets a callback and calls it before next browser paint
requestAnimationFrame(animateWithAnimationFrame);
