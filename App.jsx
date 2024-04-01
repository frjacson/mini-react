import React from "./core/React.js";
// const App = React.createElement("div", {
//   id: "app"
// }, "hi- ", "mini-react");
const update = React.update();

function Counter({ num }) {
  return (
    <div>
      count: {count}
      <button onClick={handleClick}>click</button>
    </div>
  );
}
let count = 11;
function CounterContainer() {
  return <Counter num={20}></Counter>;
}

function handleClick() {
  console.log("current click");
  count++;
  update();
}

const App = function () {
  return (
    <div>
      hi-mini-react
      <Counter num={10}></Counter>
      {/* <CounterContainer></CounterContainer> */}
    </div>
  );
};

export default App;
