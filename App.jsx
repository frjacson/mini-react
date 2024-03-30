import React from "./core/React.js";
// const App = React.createElement("div", {
//   id: "app"
// }, "hi- ", "mini-react");

function Counter({ num }) {
  return <div>count: {num}</div>;
}

function CounterContainer() {
  return <Counter num={20}></Counter>;
}

const App = function () {
  return (
    <div>
      hi-mini-react
      <Counter num={10}></Counter>
      <CounterContainer></CounterContainer>
    </div>
  );
};

export default App;
