import "./style.css";
import { watch as P, toValue as S, onUnmounted as _, defineComponent as A, openBlock as h, createElementBlock as y, Fragment as T, renderList as V, normalizeClass as k, renderSlot as w, createCommentVNode as H, createElementVNode as I, toDisplayString as $, computed as m, ref as x, reactive as E } from "vue";
function C(r, e) {
  return e === r ? { type: "retap", key: e } : { type: "change", key: e };
}
function q(r) {
  return r.map(function(i) {
    return i.key;
  });
}
function B(r, e) {
  return e.includes(r);
}
function O(r) {
  const { aliases: e, defaultKey: i, tabKeys: a, value: s } = r;
  return s && (e != null && e[s]) ? e[s] : s && B(s, a) ? s : i;
}
function K(r) {
  const { defaultKey: e, tabKeys: i } = r;
  return i.reduce(
    function(s, t) {
      return {
        ...s,
        [t]: t === e
      };
    },
    {}
  );
}
function L(r, e) {
  return r.filter(function(a) {
    return e[a.key] === !0;
  });
}
function Q(r) {
  const { mainPagePath: e, query: i, queryKey: a = "tab", tabKey: s } = r, t = new URLSearchParams();
  return t.append(a, s), Object.entries(i ?? {}).forEach(function([u, l]) {
    u === a || l === null || l === void 0 || t.append(u, String(l));
  }), `${e}?${t.toString()}`;
}
function G(r) {
  const e = r.startsWith("/") ? r : `/${r}`;
  if (!e.startsWith("/pages/"))
    throw new Error(`Invalid tab pagePath: ${r}`);
  return `..${e.replace("/pages", "")}.vue`;
}
function z(r = {}) {
  const { onError: e } = r, i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
  let t = "";
  function f() {
    s.forEach(function(c) {
      c(t);
    });
  }
  function u(n, c) {
    i.set(n, c);
  }
  function l(n, c) {
    i.has(n) && (!c || i.get(n) === c) && i.delete(n);
  }
  function o(n) {
    return i.get(n);
  }
  async function d(n) {
    if (a.has(n))
      return !1;
    try {
      const c = o(n);
      if (!c)
        return !1;
      a.add(n);
      try {
        await c();
      } finally {
        a.delete(n);
      }
    } catch (c) {
      e == null || e(c, n);
    }
    return !0;
  }
  function g() {
    return t;
  }
  function v(n) {
    return t === n ? !1 : (t = n, f(), !0);
  }
  function p(n) {
    return !t || n && t !== n ? !1 : (t = "", f(), !0);
  }
  function R(n) {
    return s.add(n), function() {
      s.delete(n);
    };
  }
  return {
    registerRefreshHandler: u,
    unregisterRefreshHandler: l,
    getRefreshHandler: o,
    runRefresh: d,
    getAnimatingKey: g,
    startRefreshAnimation: v,
    stopRefreshAnimation: p,
    subscribeRefreshAnimation: R
  };
}
function J(r = {}) {
  const e = z(r);
  function i(s, t, f = !0) {
    let u = !1;
    function l(d) {
      if (d) {
        e.registerRefreshHandler(s, t), u = !0;
        return;
      }
      u && (e.unregisterRefreshHandler(s, t), u = !1);
    }
    const o = P(
      function() {
        return !!S(f);
      },
      function(g) {
        l(g);
      },
      { immediate: !0 }
    );
    _(function() {
      o(), e.unregisterRefreshHandler(s, t), u = !1;
    });
  }
  function a(s) {
    function t() {
      return e.startRefreshAnimation(s);
    }
    function f() {
      return e.stopRefreshAnimation(s);
    }
    return _(function() {
      f();
    }), {
      startRefreshAnimation: t,
      stopRefreshAnimation: f
    };
  }
  return {
    ...e,
    useRetapRefresh: i,
    useRetapRefreshAnimation: a
  };
}
const F = { class: "routerless-tabbar" }, U = ["onClick"], W = ["src"], M = ["src"], N = { class: "routerless-tabbar-text" }, X = /* @__PURE__ */ A({
  __name: "RouterlessTabBar",
  props: {
    active: {
      type: String,
      required: !0
    },
    items: {
      type: Array,
      required: !0
    },
    refreshing: {
      type: String,
      default: ""
    },
    refreshIcon: {
      type: String,
      default: ""
    }
  },
  emits: ["change", "retap"],
  setup(r, { emit: e }) {
    const i = r, a = e;
    function s(u) {
      return i.refreshing === u;
    }
    function t(u) {
      return u.key === i.active ? u.selectedIconPath ?? u.iconPath ?? "" : u.iconPath ?? "";
    }
    function f(u) {
      const l = C(i.active, u.key);
      if (l.type === "retap") {
        a("retap", l.key);
        return;
      }
      a("change", l.key);
    }
    return (u, l) => (h(), y("view", F, [
      (h(!0), y(T, null, V(r.items, (o) => (h(), y("view", {
        key: o.key,
        class: k([
          "routerless-tabbar-item",
          o.key === r.active ? "routerless-tabbar-item-active" : "",
          s(o.key) ? "routerless-tabbar-item-refreshing" : ""
        ]),
        onClick: (d) => f(o)
      }, [
        w(u.$slots, "item", {
          item: o,
          active: o.key === r.active,
          refreshing: s(o.key),
          iconPath: t(o)
        }, () => [
          s(o.key) && r.refreshIcon ? (h(), y("image", {
            key: 0,
            class: "routerless-tabbar-refresh-icon",
            mode: "scaleToFill",
            src: r.refreshIcon
          }, null, 8, W)) : (h(), y(T, { key: 1 }, [
            t(o) ? (h(), y("image", {
              key: 0,
              class: "routerless-tabbar-icon",
              mode: "scaleToFill",
              src: t(o)
            }, null, 8, M)) : H("", !0),
            I("text", N, $(o.text), 1)
          ], 64))
        ])
      ], 10, U))), 128))
    ]));
  }
});
const j = { class: "routerless-tab-pane-host" }, Y = /* @__PURE__ */ A({
  __name: "RouterlessTabPaneHost",
  props: {
    items: {
      type: Array,
      required: !0
    },
    active: {
      type: String,
      required: !0
    },
    visited: {
      type: Array,
      required: !0
    }
  },
  setup(r) {
    const e = r, i = m(function() {
      return e.items.filter(function(t) {
        return e.visited.includes(t.key);
      });
    });
    return (a, s) => (h(), y("view", j, [
      (h(!0), y(T, null, V(i.value, (t) => (h(), y("view", {
        key: t.key,
        class: k([
          "routerless-tab-pane",
          t.key === r.active ? "" : "routerless-tab-pane-hidden"
        ])
      }, [
        w(a.$slots, "pane", {
          pane: t,
          active: t.key === r.active
        })
      ], 2))), 128))
    ]));
  }
});
function Z(r) {
  const { defaultKey: e, initialKey: i, tabs: a } = r, s = q(a), t = x(
    i && s.includes(i) ? i : e
  ), f = E(
    K({
      tabKeys: s,
      defaultKey: e
    })
  );
  f[t.value] = !0;
  const u = m(function() {
    return a.find(function(b) {
      return b.key === t.value;
    }) ?? a[0];
  }), l = m(function() {
    return L(a, f);
  }), o = m(function() {
    return l.value.map(function(b) {
      return b.key;
    });
  });
  function d(n) {
    return t.value = n, f[n] = !0, n;
  }
  function g(n) {
    return f[n] === !0;
  }
  function v(n) {
    return t.value === n;
  }
  function p(n) {
    const c = C(t.value, n);
    return c.type === "change" && d(c.key), c;
  }
  function R() {
    const n = K({
      tabKeys: s,
      defaultKey: e
    });
    n[t.value] = !0, s.forEach(function(b) {
      f[b] = n[b];
    });
  }
  return {
    activeKey: t,
    activeTab: u,
    visitedKeys: o,
    visitedTabs: l,
    activateTab: d,
    handleTabClick: p,
    isVisited: g,
    isActive: v,
    resetVisited: R
  };
}
export {
  X as RouterlessTabBar,
  Y as RouterlessTabPaneHost,
  Q as buildRouterlessTabUrl,
  J as createRetapRefreshContext,
  z as createRetapRefreshCore,
  K as createVisitedTabRecord,
  q as getTabKeys,
  L as getVisitedTabs,
  B as isTabKey,
  O as normalizeTabKey,
  C as resolveTabClick,
  G as resolveTabPageModuleKey,
  Z as useRouterlessTabs
};
