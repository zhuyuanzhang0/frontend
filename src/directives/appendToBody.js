// src/directives/appendToBody.js

function append(el) {
  if (!el.__appendToBody__ || el.__appended__ === true) return;

  // 记录原始父节点与占位节点，便于还原
  el.__originParent__ = el.parentNode;
  el.__placeholder__ = document.createComment('append-to-body');
  if (el.__originParent__) {
    el.__originParent__.insertBefore(el.__placeholder__, el);
  }

  document.body.appendChild(el);
  el.__appended__ = true;
}

function restore(el) {
  if (!el.__appended__) return;

  const placeholder = el.__placeholder__;
  const originParent = el.__originParent__;

  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.insertBefore(el, placeholder);
    placeholder.parentNode.removeChild(placeholder);
  } else if (originParent) {
    originParent.appendChild(el);
  } else if (el.parentNode) {
    // 没有原父节点信息时，至少从 body 移除
    el.parentNode.removeChild(el);
  }

  el.__appended__ = false;
  el.__placeholder__ = null;
  el.__originParent__ = null;
}

export default {
  inserted(el, binding) {
    // binding.value 为 true 才 append；未传则默认 true
    el.__appendToBody__ = binding.value !== false;
    append(el);
  },

  update(el, binding) {
    const enabled = binding.value !== false;
    el.__appendToBody__ = enabled;

    if (enabled) append(el);
    else restore(el);
  },

  unbind(el) {
    // 组件销毁时确保清理
    if (el.__appended__ && el.parentNode) {
      el.parentNode.removeChild(el);
    }
    if (el.__placeholder__ && el.__placeholder__.parentNode) {
      el.__placeholder__.parentNode.removeChild(el.__placeholder__);
    }

    delete el.__appendToBody__;
    delete el.__appended__;
    delete el.__placeholder__;
    delete el.__originParent__;
  }
};
