export interface SetupFactory<T> {
    (): T;
}
export declare function mountSetup<T>(setup: SetupFactory<T>): {
    exposed: T;
    unmount(): void;
};
