import {
  it,
  expect,
  describe
} from 'vitest';
import React from '../core/React';

describe("createElement", () => {
  it("should return a vdom for element", () => {
    const el = React.createElement("div", null, "hi");

    //! 快照的方式
    // expect(el).toMatchInlineSnapshot(`{
    //   "type": "div",
    //   "props": {
    //     "children": [{
    //       "type": "TEXT_ELEMENT",
    //       "props": {
    //         "nodeValue": "hi",
    //         "children": []
    //       }
    //     }]
    //   }
    // }`)

    expect(el).toEqual({
      type: "div",
      props: {
        children: [{
          type: "TEXT_ELEMENT",
          props: {
            nodeValue: "hi",
            children: []
          }
        }]
      }
    })
  })

  it("should return a vdom with element and id", () => {
    const el = React.createElement("div", {
      id: 1
    }, "hi");
    // expect(el).toMatchInlineSnapshot(`{
    //   type: "div",
    //   props: {
    //     children: [{
    //       type: "TEXT_ELEMENT",
    //       props: {
    //         nodeValue: "hi",
    //         children: []
    //       }
    //       id: 1
    //     }]
    //   }
    // }`)
    expect(el).toEqual({
      type: "div",
      props: {
        id: 1,
        children: [{
          type: "TEXT_ELEMENT",
          props: {
            nodeValue: "hi",
            children: []
          }
        }]
      }
    })
  })
})