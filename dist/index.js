import "./style.css";
import { onUnmounted as w, watch as $, toValue as k, defineComponent as V, openBlock as h, createElementBlock as y, Fragment as K, renderList as E, normalizeClass as I, renderSlot as x, createCommentVNode as C, createElementVNode as P, toDisplayString as H, computed as T, ref as q, reactive as _ } from "vue";
function S(n, e) {
  return e === n ? { type: "retap", key: e } : { type: "change", key: e };
}
function Q(n) {
  return n.map(function(a) {
    return a.key;
  });
}
function L(n, e) {
  return e.includes(n);
}
function D(n) {
  const { aliases: e, defaultKey: a, tabKeys: u, value: r } = n;
  return r && (e != null && e[r]) ? e[r] : r && L(r, u) ? r : a;
}
function A(n) {
  const { defaultKey: e, tabKeys: a } = n;
  return a.reduce(
    function(r, i) {
      return {
        ...r,
        [i]: i === e
      };
    },
    {}
  );
}
function O(n, e) {
  return n.filter(function(u) {
    return e[u.key] === !0;
  });
}
function G(n) {
  const { mainPagePath: e, query: a, queryKey: u = "tab", tabKey: r } = n, i = e.indexOf("#"), c = i >= 0 ? e.slice(0, i) : e, o = i >= 0 ? e.slice(i) : "", l = c.indexOf("?"), f = l >= 0 ? c.slice(0, l) : c, d = l >= 0 ? c.slice(l + 1) : "", b = new URLSearchParams(d), g = new URLSearchParams(), R = new Set(
    Object.entries(a ?? {}).filter(function([s, t]) {
      return s !== u && t !== null && t !== void 0;
    }).map(function([s]) {
      return s;
    })
  );
  return g.append(u, r), b.forEach(function(s, t) {
    t === u || R.has(t) || g.append(t, s);
  }), Object.entries(a ?? {}).forEach(function([s, t]) {
    s === u || t === null || t === void 0 || g.append(s, String(t));
  }), `${f}?${g.toString()}${o}`;
}
function J(n) {
  const e = n.startsWith("/") ? n : `/${n}`;
  if (!e.startsWith("/pages/"))
    throw new Error(`Invalid tab pagePath: ${n}`);
  return `..${e.replace("/pages", "")}.vue`;
}
function B(n = {}) {
  const { onError: e } = n, a = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
  let i = "";
  function c() {
    r.forEach(function(t) {
      t(i);
    });
  }
  function o(s, t) {
    a.set(s, t);
  }
  function l(s, t) {
    a.has(s) && (!t || a.get(s) === t) && a.delete(s);
  }
  function f(s) {
    return a.get(s);
  }
  async function d(s) {
    if (u.has(s))
      return !1;
    try {
      const t = f(s);
      if (!t)
        return !1;
      u.add(s);
      try {
        await t();
      } finally {
        u.delete(s);
      }
    } catch (t) {
      e == null || e(t, s);
    }
    return !0;
  }
  function b() {
    return i;
  }
  function g(s) {
    return i === s ? !1 : (i = s, c(), !0);
  }
  function R(s) {
    return !i || s && i !== s ? !1 : (i = "", c(), !0);
  }
  function m(s) {
    return r.add(s), function() {
      r.delete(s);
    };
  }
  return {
    registerRefreshHandler: o,
    unregisterRefreshHandler: l,
    getRefreshHandler: f,
    runRefresh: d,
    getAnimatingKey: b,
    startRefreshAnimation: g,
    stopRefreshAnimation: R,
    subscribeRefreshAnimation: m
  };
}
function X(n = {}) {
  const e = B(n);
  function a(r, i, c = !0) {
    let o = !1;
    function l(d) {
      if (d) {
        e.registerRefreshHandler(r, i), o = !0;
        return;
      }
      o && (e.unregisterRefreshHandler(r, i), o = !1);
    }
    const f = $(
      function() {
        return !!k(c);
      },
      function(b) {
        l(b);
      },
      { immediate: !0 }
    );
    w(function() {
      f(), e.unregisterRefreshHandler(r, i), o = !1;
    });
  }
  function u(r) {
    function i() {
      return e.startRefreshAnimation(r);
    }
    function c() {
      return e.stopRefreshAnimation(r);
    }
    return w(function() {
      c();
    }), {
      startRefreshAnimation: i,
      stopRefreshAnimation: c
    };
  }
  return {
    ...e,
    useRetapRefresh: a,
    useRetapRefreshAnimation: u
  };
}
const U = { class: "routerless-tabbar" }, W = ["onClick"], z = ["src"], F = ["src"], j = { class: "routerless-tabbar-text" }, Y = /* @__PURE__ */ V({
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
  setup(n, { emit: e }) {
    const a = n, u = e;
    function r(o) {
      return a.refreshing === o;
    }
    function i(o) {
      return o.key === a.active ? o.selectedIconPath ?? o.iconPath ?? "" : o.iconPath ?? "";
    }
    function c(o) {
      const l = S(a.active, o.key);
      if (l.type === "retap") {
        u("retap", l.key);
        return;
      }
      u("change", l.key);
    }
    return (o, l) => (h(), y("view", U, [
      (h(!0), y(K, null, E(n.items, (f) => (h(), y("view", {
        key: f.key,
        class: I([
          "routerless-tabbar-item",
          f.key === n.active ? "routerless-tabbar-item-active" : "",
          r(f.key) ? "routerless-tabbar-item-refreshing" : ""
        ]),
        onClick: (d) => c(f)
      }, [
        x(o.$slots, "item", {
          item: f,
          active: f.key === n.active,
          refreshing: r(f.key),
          iconPath: i(f)
        }, () => [
          r(f.key) && n.refreshIcon ? (h(), y("image", {
            key: 0,
            class: "routerless-tabbar-refresh-icon",
            mode: "scaleToFill",
            src: n.refreshIcon
          }, null, 8, z)) : (h(), y(K, { key: 1 }, [
            i(f) ? (h(), y("image", {
              key: 0,
              class: "routerless-tabbar-icon",
              mode: "scaleToFill",
              src: i(f)
            }, null, 8, F)) : C("", !0),
            P("text", j, H(f.text), 1)
          ], 64))
        ])
      ], 10, W))), 128))
    ]));
  }
}), M = { class: "routerless-tab-pane-host" }, Z = /* @__PURE__ */ V({
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
  setup(n) {
    const e = n, a = T(function() {
      return e.items.filter(function(i) {
        return e.visited.includes(i.key);
      });
    });
    return (u, r) => (h(), y("view", M, [
      (h(!0), y(K, null, E(a.value, (i) => (h(), y("view", {
        key: i.key,
        class: I([
          "routerless-tab-pane",
          i.key === n.active ? "" : "routerless-tab-pane-hidden"
        ])
      }, [
        x(u.$slots, "pane", {
          pane: i,
          active: i.key === n.active
        })
      ], 2))), 128))
    ]));
  }
});
function ee(n) {
  const { defaultKey: e, initialKey: a, tabs: u } = n, r = Q(u);
  if (r.length === 0)
    throw new Error("Routerless tabs cannot be empty");
  if (!r.includes(e))
    throw new Error(`Invalid default routerless tab key: ${e}`);
  function i(t) {
    if (!r.includes(t))
      throw new Error(`Invalid routerless tab key: ${t}`);
  }
  const c = q(
    a && r.includes(a) ? a : e
  ), o = _(
    A({
      tabKeys: r,
      defaultKey: e
    })
  );
  o[c.value] = !0;
  const l = T(function() {
    return u.find(function(v) {
      return v.key === c.value;
    }) ?? u[0];
  }), f = T(function() {
    return O(u, o);
  }), d = T(function() {
    return f.value.map(function(v) {
      return v.key;
    });
  });
  function b(t) {
    return i(t), c.value = t, o[t] = !0, t;
  }
  function g(t) {
    return o[t] === !0;
  }
  function R(t) {
    return c.value === t;
  }
  function m(t) {
    i(t);
    const p = S(c.value, t);
    return p.type === "change" && b(p.key), p;
  }
  function s() {
    const t = A({
      tabKeys: r,
      defaultKey: e
    });
    t[c.value] = !0, r.forEach(function(v) {
      o[v] = t[v];
    });
  }
  return {
    activeKey: c,
    activeTab: l,
    visitedKeys: d,
    visitedTabs: f,
    activateTab: b,
    handleTabClick: m,
    isVisited: g,
    isActive: R,
    resetVisited: s
  };
}
export {
  Y as RouterlessTabBar,
  Z as RouterlessTabPaneHost,
  G as buildRouterlessTabUrl,
  X as createRetapRefreshContext,
  B as createRetapRefreshCore,
  A as createVisitedTabRecord,
  Q as getTabKeys,
  O as getVisitedTabs,
  L as isTabKey,
  D as normalizeTabKey,
  S as resolveTabClick,
  J as resolveTabPageModuleKey,
  ee as useRouterlessTabs
};
