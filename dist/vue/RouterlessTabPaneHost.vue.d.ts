import type { PropType } from 'vue';
import type { RouterlessTabPaneItem } from '../types.js';
declare var __VLS_1: {
    pane: RouterlessTabPaneItem;
    active: boolean;
};
type __VLS_Slots = {} & {
    pane?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly RouterlessTabPaneItem[]>;
        required: true;
    };
    active: {
        type: StringConstructor;
        required: true;
    };
    visited: {
        type: PropType<readonly string[]>;
        required: true;
    };
}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    items: {
        type: PropType<readonly RouterlessTabPaneItem[]>;
        required: true;
    };
    active: {
        type: StringConstructor;
        required: true;
    };
    visited: {
        type: PropType<readonly string[]>;
        required: true;
    };
}>> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
