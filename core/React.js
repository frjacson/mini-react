function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    }
  };

  root = nextWorkOfUnit;
  // const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode(el.props.nodeValue) : document.createElement(el.type);

  // //! class id ... 将虚拟dom上面的属性对应在 真实 dom 中
  // Object.keys(el.props).forEach((key) => {
  //   if (key !== 'children') {
  //     dom[key] = el.props[key];
  //   }
  // })

  // //! 递归渲染子节点
  // const children = el.props.children;
  // children.forEach((child) => {
  //   render(child, dom);
  // })
  // container.append(dom);
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

// 任务调度器
let nextWorkOfUnit = null;
let root = null;

function workLoop(deadline) {
  let shouldYeild = false;
  while (!shouldYeild && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    shouldYeild = deadline.timeRemaining() > 1;
  }

  if (!nextWorkOfUnit && root) {
    // 当nextWorkOfUnit为空的时候，说明当前已经完成了链表的初始化
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

// 统一提交
function commitRoot() {
  commitWork(root.child);
  root = null; // 只执行一次
}

function commitWork(fiber) {
  if (!fiber) return;
  fiber.parent.dom.append(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function createDom(type) {
  const dom = type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(type);
  return dom;
}

function updateProps(dom, props) {
  Object.keys(props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = props[key];
    }
  })
}

function initChildren(fiber) {
  const children = fiber.props.children;
  let prevChild = null;
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibling: null,
      dom: null,
    }
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  })
}

function performWorkOfUnit(fiber) {
  //! 创建dom
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));

    // fiber.parent.dom.append(dom);

    //! 处理 props
    updateProps(dom, fiber.props)
  }

  //! 转换成链表
  initChildren(fiber);

  //! 返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child;
  }

  if (fiber.sibling) {
    return fiber.sibling;
  }
  return fiber.parent.sibling;
}

requestIdleCallback(workLoop);

const React = {
  render,
  createElement,
  createTextNode,
}

export default React;