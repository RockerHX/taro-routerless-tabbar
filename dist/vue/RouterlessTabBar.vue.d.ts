import type { PropType } from 'vue';
import type { RouterlessTabBarItem } from '../types.js';
declare var __VLS_1: {
    item: RouterlessTabBarItem;
    active: boolean;
    refreshing: boolean;
    iconPath: string;
};
type __VLS_Slots = {} & {
    item?: (props: typeof __VLS_1) => any;
};
declare const __VLS_component: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    active: {
        type: StringConstructor;
        required: true;
    };
    items: {
        type: PropType<readonly RouterlessTabBarItem[]>;
        required: true;
    };
    refreshing: {
        type: StringConstructor;
        default: string;
    };
    refreshIcon: {
        type: StringConstructor;
        default: string;
    };
}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    change: (...args: any[]) => void;
    retap: (...args: any[]) => void;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    active: {
        type: StringConstructor;
        required: true;
    };
    items: {
        type: PropType<readonly RouterlessTabBarItem[]>;
        required: true;
    };
    refreshing: {
        type: StringConstructor;
        default: string;
    };
    refreshIcon: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{
    onChange?: ((...args: any[]) => any) | undefined;
    onRetap?: ((...args: any[]) => any) | undefined;
}>, {
    refreshing: string;
    refreshIcon: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
