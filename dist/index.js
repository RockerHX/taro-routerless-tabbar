import "./style.css";
import { onUnmounted as K, watch as I, toValue as P, defineComponent as V, openBlock as h, createElementBlock as y, Fragment as T, renderList as k, normalizeClass as w, renderSlot as C, createCommentVNode as $, createElementVNode as H, toDisplayString as E, computed as m, ref as _, reactive as q } from "vue";
function S(r, e) {
  return e === r ? { type: "retap", key: e } : { type: "change", key: e };
}
function x(r) {
  return r.map(function(s) {
    return s.key;
  });
}
function B(r, e) {
  return e.includes(r);
}
function O(r) {
  const { aliases: e, defaultKey: s, tabKeys: a, value: i } = r;
  return i && (e != null && e[i]) ? e[i] : i && B(i, a) ? i : s;
}
function A(r) {
  const { defaultKey: e, tabKeys: s } = r;
  return s.reduce(
    function(i, t) {
      return {
        ...i,
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
  const { mainPagePath: e, query: s, queryKey: a = "tab", tabKey: i } = r, t = new URLSearchParams();
  return t.append(a, i), Object.entries(s ?? {}).forEach(function([u, l]) {
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
  const { onError: e } = r, s = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
  let t = "";
  function f() {
    i.forEach(function(c) {
      c(t);
    });
  }
  function u(n, c) {
    s.set(n, c);
  }
  function l(n, c) {
    s.has(n) && (!c || s.get(n) === c) && s.delete(n);
  }
  function o(n) {
    return s.get(n);
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
    return i.add(n), function() {
      i.delete(n);
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
  function s(i, t, f = !0) {
    let u = !1;
    function l(d) {
      if (d) {
        e.registerRefreshHandler(i, t), u = !0;
        return;
      }
      u && (e.unregisterRefreshHandler(i, t), u = !1);
    }
    const o = I(
      function() {
        return !!P(f);
      },
      function(g) {
        l(g);
      },
      { immediate: !0 }
    );
    K(function() {
      o(), e.unregisterRefreshHandler(i, t), u = !1;
    });
  }
  function a(i) {
    function t() {
      return e.startRefreshAnimation(i);
    }
    function f() {
      return e.stopRefreshAnimation(i);
    }
    return K(function() {
      f();
    }), {
      startRefreshAnimation: t,
      stopRefreshAnimation: f
    };
  }
  return {
    ...e,
    useRetapRefresh: s,
    useRetapRefreshAnimation: a
  };
}
const F = { class: "routerless-tabbar" }, U = ["onClick"], W = ["src"], M = ["src"], N = { class: "routerless-tabbar-text" }, X = /* @__PURE__ */ V({
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
    const s = r, a = e;
    function i(u) {
      return s.refreshing === u;
    }
    function t(u) {
      return u.key === s.active ? u.selectedIconPath ?? u.iconPath ?? "" : u.iconPath ?? "";
    }
    function f(u) {
      const l = S(s.active, u.key);
      if (l.type === "retap") {
        a("retap", l.key);
        return;
      }
      a("change", l.key);
    }
    return (u, l) => (h(), y("view", F, [
      (h(!0), y(T, null, k(r.items, (o) => (h(), y("view", {
        key: o.key,
        class: w([
          "routerless-tabbar-item",
          o.key === r.active ? "routerless-tabbar-item-active" : "",
          i(o.key) ? "routerless-tabbar-item-refreshing" : ""
        ]),
        onClick: (d) => f(o)
      }, [
        C(u.$slots, "item", {
          item: o,
          active: o.key === r.active,
          refreshing: i(o.key),
          iconPath: t(o)
        }, () => [
          i(o.key) && r.refreshIcon ? (h(), y("image", {
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
            }, null, 8, M)) : $("", !0),
            H("text", N, E(o.text), 1)
          ], 64))
        ])
      ], 10, U))), 128))
    ]));
  }
}), j = { class: "routerless-tab-pane-host" }, Y = /* @__PURE__ */ V({
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
    const e = r, s = m(function() {
      return e.items.filter(function(t) {
        return e.visited.includes(t.key);
      });
    });
    return (a, i) => (h(), y("view", j, [
      (h(!0), y(T, null, k(s.value, (t) => (h(), y("view", {
        key: t.key,
        class: w([
          "routerless-tab-pane",
          t.key === r.active ? "" : "routerless-tab-pane-hidden"
        ])
      }, [
        C(a.$slots, "pane", {
          pane: t,
          active: t.key === r.active
        })
      ], 2))), 128))
    ]));
  }
});
function Z(r) {
  const { defaultKey: e, initialKey: s, tabs: a } = r, i = x(a), t = _(
    s && i.includes(s) ? s : e
  ), f = q(
    A({
      tabKeys: i,
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
    const c = S(t.value, n);
    return c.type === "change" && d(c.key), c;
  }
  function R() {
    const n = A({
      tabKeys: i,
      defaultKey: e
    });
    n[t.value] = !0, i.forEach(function(b) {
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
  A as createVisitedTabRecord,
  x as getTabKeys,
  L as getVisitedTabs,
  B as isTabKey,
  O as normalizeTabKey,
  S as resolveTabClick,
  G as resolveTabPageModuleKey,
  Z as useRouterlessTabs
};
