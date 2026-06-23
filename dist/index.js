import "./style.css";
import { Fragment as e, computed as t, createCommentVNode as n, createElementBlock as r, createElementVNode as i, defineComponent as a, normalizeClass as o, onUnmounted as s, openBlock as c, reactive as l, ref as u, renderList as d, renderSlot as f, toDisplayString as p, toValue as m, watch as h } from "vue";
//#region src/core/click.ts
function g(e, t) {
	return t === e ? {
		type: "retap",
		key: t
	} : {
		type: "change",
		key: t
	};
}
//#endregion
//#region src/core/tabs.ts
function _(e) {
	return e.map(function(e) {
		return e.key;
	});
}
function v(e, t) {
	return t.includes(e);
}
function y(e) {
	let { aliases: t, defaultKey: n, tabKeys: r, value: i } = e;
	return i && t?.[i] ? t[i] : i && v(i, r) ? i : n;
}
function b(e) {
	let { defaultKey: t, tabKeys: n } = e;
	return n.reduce(function(e, n) {
		return {
			...e,
			[n]: n === t
		};
	}, {});
}
function x(e, t) {
	return e.filter(function(e) {
		return t[e.key] === !0;
	});
}
//#endregion
//#region src/core/routes.ts
function S(e) {
	let { mainPagePath: t, query: n, queryKey: r = "tab", tabKey: i } = e, a = t.indexOf("#"), o = a >= 0 ? t.slice(0, a) : t, s = a >= 0 ? t.slice(a) : "", c = o.indexOf("?"), l = c >= 0 ? o.slice(0, c) : o, u = c >= 0 ? o.slice(c + 1) : "", d = new URLSearchParams(u), f = new URLSearchParams(), p = new Set(Object.entries(n ?? {}).filter(function([e, t]) {
		return e !== r && t != null;
	}).map(function([e]) {
		return e;
	}));
	return f.append(r, i), d.forEach(function(e, t) {
		t === r || p.has(t) || f.append(t, e);
	}), Object.entries(n ?? {}).forEach(function([e, t]) {
		e === r || t == null || f.append(e, String(t));
	}), `${l}?${f.toString()}${s}`;
}
function C(e) {
	let t = e.startsWith("/") ? e : `/${e}`;
	if (!t.startsWith("/pages/")) throw Error(`Invalid tab pagePath: ${e}`);
	return `..${t.replace("/pages", "")}.vue`;
}
//#endregion
//#region src/core/retap.ts
function w(e = {}) {
	let { onError: t } = e, n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = "";
	function o() {
		i.forEach(function(e) {
			e(a);
		});
	}
	function s(e, t) {
		n.set(e, t);
	}
	function c(e, t) {
		n.has(e) && (!t || n.get(e) === t) && n.delete(e);
	}
	function l(e) {
		return n.get(e);
	}
	async function u(e) {
		if (r.has(e)) return !1;
		try {
			let t = l(e);
			if (!t) return !1;
			r.add(e);
			try {
				await t();
			} finally {
				r.delete(e);
			}
		} catch (n) {
			t?.(n, e);
		}
		return !0;
	}
	function d() {
		return a;
	}
	function f(e) {
		return a === e ? !1 : (a = e, o(), !0);
	}
	function p(e) {
		return !a || e && a !== e ? !1 : (a = "", o(), !0);
	}
	function m(e) {
		return i.add(e), function() {
			i.delete(e);
		};
	}
	return {
		registerRefreshHandler: s,
		unregisterRefreshHandler: c,
		getRefreshHandler: l,
		runRefresh: u,
		getAnimatingKey: d,
		startRefreshAnimation: f,
		stopRefreshAnimation: p,
		subscribeRefreshAnimation: m
	};
}
//#endregion
//#region src/vue/useRetapRefresh.ts
function T(e = {}) {
	let t = w(e);
	function n(e, n, r = !0) {
		let i = !1;
		function a(r) {
			if (r) {
				t.registerRefreshHandler(e, n), i = !0;
				return;
			}
			i &&= (t.unregisterRefreshHandler(e, n), !1);
		}
		let o = h(function() {
			return !!m(r);
		}, function(e) {
			a(e);
		}, { immediate: !0 });
		s(function() {
			o(), t.unregisterRefreshHandler(e, n), i = !1;
		});
	}
	function r(e) {
		function n() {
			return t.startRefreshAnimation(e);
		}
		function r() {
			return t.stopRefreshAnimation(e);
		}
		return s(function() {
			r();
		}), {
			startRefreshAnimation: n,
			stopRefreshAnimation: r
		};
	}
	return {
		...t,
		useRetapRefresh: n,
		useRetapRefreshAnimation: r
	};
}
//#endregion
//#region src/vue/RouterlessTabBar.vue?vue&type=script&setup=true&lang.ts
var E = { class: "routerless-tabbar" }, D = ["onClick"], O = ["src"], k = ["src"], A = { class: "routerless-tabbar-text" }, j = /* @__PURE__ */ a({
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
	setup(t, { emit: a }) {
		let s = t, l = a;
		function u(e) {
			return s.refreshing === e;
		}
		function m(e) {
			return e.key === s.active ? e.selectedIconPath ?? e.iconPath ?? "" : e.iconPath ?? "";
		}
		function h(e) {
			let t = g(s.active, e.key);
			if (t.type === "retap") {
				l("retap", t.key);
				return;
			}
			l("change", t.key);
		}
		return (a, s) => (c(), r("view", E, [(c(!0), r(e, null, d(t.items, (s) => (c(), r("view", {
			key: s.key,
			class: o([
				"routerless-tabbar-item",
				s.key === t.active ? "routerless-tabbar-item-active" : "",
				u(s.key) ? "routerless-tabbar-item-refreshing" : ""
			]),
			onClick: (e) => h(s)
		}, [f(a.$slots, "item", {
			item: s,
			active: s.key === t.active,
			refreshing: u(s.key),
			iconPath: m(s)
		}, () => [u(s.key) && t.refreshIcon ? (c(), r("image", {
			key: 0,
			class: "routerless-tabbar-refresh-icon",
			mode: "scaleToFill",
			src: t.refreshIcon
		}, null, 8, O)) : (c(), r(e, { key: 1 }, [m(s) ? (c(), r("image", {
			key: 0,
			class: "routerless-tabbar-icon",
			mode: "scaleToFill",
			src: m(s)
		}, null, 8, k)) : n("", !0), i("text", A, p(s.text), 1)], 64))])], 10, D))), 128))]));
	}
}), M = { class: "routerless-tab-pane-host" }, N = /* @__PURE__ */ a({
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
		let i = n, a = t(function() {
			return i.items.filter(function(e) {
				return i.visited.includes(e.key);
			});
		});
		return (t, i) => (c(), r("view", M, [(c(!0), r(e, null, d(a.value, (e) => (c(), r("view", {
			key: e.key,
			class: o(["routerless-tab-pane", e.key === n.active ? "" : "routerless-tab-pane-hidden"])
		}, [f(t.$slots, "pane", {
			pane: e,
			active: e.key === n.active
		})], 2))), 128))]));
	}
});
//#endregion
//#region src/vue/useRouterlessTabs.ts
function P(e) {
	let { defaultKey: n, initialKey: r, tabs: i } = e, a = _(i);
	if (a.length === 0) throw Error("Routerless tabs cannot be empty");
	if (!a.includes(n)) throw Error(`Invalid default routerless tab key: ${n}`);
	function o(e) {
		if (!a.includes(e)) throw Error(`Invalid routerless tab key: ${e}`);
	}
	let s = u(r && a.includes(r) ? r : n), c = l(b({
		tabKeys: a,
		defaultKey: n
	}));
	c[s.value] = !0;
	let d = t(function() {
		return i.find(function(e) {
			return e.key === s.value;
		}) ?? i[0];
	}), f = t(function() {
		return x(i, c);
	}), p = t(function() {
		return f.value.map(function(e) {
			return e.key;
		});
	});
	function m(e) {
		return o(e), s.value = e, c[e] = !0, e;
	}
	function h(e) {
		return c[e] === !0;
	}
	function v(e) {
		return s.value === e;
	}
	function y(e) {
		o(e);
		let t = g(s.value, e);
		return t.type === "change" && m(t.key), t;
	}
	function S() {
		let e = b({
			tabKeys: a,
			defaultKey: n
		});
		e[s.value] = !0, a.forEach(function(t) {
			c[t] = e[t];
		});
	}
	return {
		activeKey: s,
		activeTab: d,
		visitedKeys: p,
		visitedTabs: f,
		activateTab: m,
		handleTabClick: y,
		isVisited: h,
		isActive: v,
		resetVisited: S
	};
}
//#endregion
export { j as RouterlessTabBar, N as RouterlessTabPaneHost, S as buildRouterlessTabUrl, T as createRetapRefreshContext, w as createRetapRefreshCore, b as createVisitedTabRecord, _ as getTabKeys, x as getVisitedTabs, v as isTabKey, y as normalizeTabKey, g as resolveTabClick, C as resolveTabPageModuleKey, P as useRouterlessTabs };
