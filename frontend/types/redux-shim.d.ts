// Minimal ambient declarations to satisfy Recharts' internal references to `redux` types
// This file is for development only and provides lightweight shims so the TS compiler
// doesn't require installing full `redux`/@types/redux when Recharts types reference them.
declare module 'redux' {
  // Very small subset of types used by Recharts' type definitions
  export type EmptyObject = Record<string, never>;

  export type Action = { type: string; [key: string]: any };

  export type Reducer<S = any, A extends Action = Action> = (state: S | undefined, action: A) => S;

  export type CombinedState<T> = T;

  export interface Store<S = any, A extends Action = Action> {
    dispatch: (action: A) => any;
    getState(): S;
    subscribe(listener: () => void): () => void;
  }

  export function createStore<S = any, A extends Action = Action>(reducer: Reducer<S, A>, preloadedState?: S): Store<S, A>;

  export function combineReducers<S>(reducers: any): Reducer<S, any>;
}

export {};
