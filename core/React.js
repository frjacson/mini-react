function render(el, container) {
  const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode(el.props.nodeValue) : document.createElement(el.type);

  //! class id ... 将虚拟dom上面的属性对应在 真是 dom 中
  Object.keys(el.props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = el.props[key];
    }
  })

  //! 递归渲染子节点
  const children = el.props.children;
  children.forEach((child) => {
    render(child, dom);
  })
  container.append(dom);
}

function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === 'string' ? createTextNode(child) : child;
      })
    }
  }
}

const React = {
  render,
  createElement,
  createTextNode,
}

export default React;


/**
 * 学习小结一、运行的本质是
1. 将 jsx 通过工具转变成我们熟悉的js文件(Vite中使用了Esbuild帮助构建，实际上是内部转换成React.createElement()执行)
2. 通过 React.createElement() 函数创建虚拟 dom
3. 通过ReactDom.render() 方法将 虚拟dom 转换成真实DOM并插入到HTML中
学习小结二、多子节点render会造成的问题
如果子节点过多的话，会不断的通过递归运行render函数，而递归的过程是不可中断的，会造成主线程一直再负责render这件事，render一直在运行，导致如果此时用户去操作DOM等其他事件时，主线程将无法及时相应，造成页面的卡顿。
 */