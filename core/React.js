function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    }
  };
  nextWorkOfUnit = wipRoot;
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
        const isTextNode = typeof child === 'string' || typeof child === 'number'
        return isTextNode ? createTextNode(child) : child;
      })
    }
  }
}

// 任务调度器
let nextWorkOfUnit = null;
// work in progress wipRoot
let wipRoot = null;
let currentRoot = null;

let delections = []; //需要删除dom的容器
let wipFiber = null; // 当前fiber

function workLoop(deadline) {
  let shouldYeild = false;
  while (!shouldYeild && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);

    if (wipRoot.sibling.type === nextWorkOfUnit.type) {
      nextWorkOfUnit = undefined; // 手动退出
    }

    shouldYeild = deadline.timeRemaining() > 1;
  }

  if (!nextWorkOfUnit && wipRoot) {
    // 当nextWorkOfUnit为空的时候，说明当前已经完成了链表的初始化
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

// 统一提交
function commitRoot() {
  delections.forEach(commitDelection);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null; // 只执行一次
  delections = [];
}

//! 删除节点
function commitDelection(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent;
    }
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    commitDelection(fiber.child);
  }
}

function commitWork(fiber) {
  if (!fiber) return;
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.effectTag === 'update') {
    updateProps(fiber.dom, fiber.props, fiber.alternate.props);
  } else if (fiber.effectTag === 'placement') {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function createDom(type) {
  const dom = type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(type);
  return dom;
}

function updateProps(dom, nextProps, prevProps) {
  // 1. old 有 new 没有 删除
  Object.keys(prevProps).forEach((key) => {
    if (key !== "children") {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });
  // 2. new 有， old 没有
  // 3. new 有，old 有
  Object.keys(nextProps).forEach((key) => {
    if (key !== 'children') {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith("on")) {
          const eventType = key.slice(2).toLocaleLowerCase();
          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  })
}

function reconcileChildren(fiber, children) {
  let prevChild = null;
  let oldFiber = null;
  if (fiber.alternate) {
    oldFiber = fiber.alternate.child;
  } else {
    oldFiber = null;
  }
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber;
    if (isSameType) {
      // update:
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom,
        effectTag: "update",
        alternate: oldFiber
      }
    } else {
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibling: null,
          dom: null,
          effectTag: "placement"
        }
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
      delections.push(oldFiber);
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }

    // 处理边界问题
    if (newFiber) {
      prevChild = newFiber;
    }
  })
  while (oldFiber) {
    delections.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  //! 创建dom
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    //! 处理 props
    updateProps(dom, fiber.props, {})
  }
  const children = fiber.props.children;

  //! 转换成链表
  reconcileChildren(fiber, children);
}

function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber);
  }

  //! 返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child;
  }

  if (fiber.sibling) {
    return fiber.sibling;
  }
  // 循环向上查找
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
  // return fiber.parent.sibling;
}

requestIdleCallback(workLoop);

function update() {
  let currentFiber = wipFiber;
  return () => {
    console.log(currentFiber);

    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    }
    // 新的root
    // wipRoot = {
    //   dom: currentRoot.dom,
    //   props: currentRoot.props,
    //   alternate: currentRoot
    // };


    // 这段语句是触发重新render的关键
    nextWorkOfUnit = wipRoot;
  }
}

const React = {
  render,
  update,
  createElement,
  createTextNode,
}

export default React;