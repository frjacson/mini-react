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