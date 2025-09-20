/**
 * transitions 
   Transitions provide a way to control animation speed when changing CSS properties.

   In order to define a transition, we need at least 2 things:
   - The first is the css property that will change from the initial state to the final state.  
   This is defined as the transition-property: and the value will be the name of the property  
   such as background-color
   - The second is the duration, meaning the amount of time that this change will take to complete.  
   This is defined as the transition-duration: and has a value of time for how long it should take for the  
   transition to change from the initial to final. e.g. 4000ms or 4s
 */
export default function Transitions() {
  return (
    <div>
      <button className="h-[90px] w-[290px] text-[28px] text-white bg-blue-700">
        css transitions
      </button>
    </div>
  );
}
