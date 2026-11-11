import { lazy, type ComponentType, type LazyExoticComponent } from "react";

// React.lazy plus a preload() function. Calling preload() starts downloading the page's code early
// (for example when the mouse is over a link), so the click feels instant.
export type LazyRoute<T extends ComponentType = ComponentType> = LazyExoticComponent<T> & { preload: () => Promise<unknown> };

export function lazyRoute<T extends ComponentType = ComponentType>(factory: () => Promise<{ default: T }>): LazyRoute<T> {
  let started: Promise<{ default: T }> | undefined;
  const load = () => (started ??= factory());
  const component = lazy(load) as LazyRoute<T>;
  component.preload = load;
  return component;
}

// Pages export named components ("export function ShopPage"), so this picks the name for React.lazy.
export const named = <M extends Record<string, unknown>, K extends keyof M>(load: () => Promise<M>, key: K) =>
  () => load().then((module) => ({ default: module[key] as ComponentType }));
