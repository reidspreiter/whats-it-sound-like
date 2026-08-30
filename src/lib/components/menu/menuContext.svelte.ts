import { createContext } from "svelte";

export interface MenuContext {
  activeMenuItem: null | symbol;
}

export const [getMenuContext, setMenuContext] = createContext<MenuContext>();
