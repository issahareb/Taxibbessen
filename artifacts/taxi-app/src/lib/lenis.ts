import Lenis from "lenis";

let _lenis: Lenis | null = null;

export const getLenis = () => _lenis;
export const setLenis = (l: Lenis | null) => {
  _lenis = l;
};
