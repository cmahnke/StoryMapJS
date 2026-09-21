/**
 * Easing functions used across the viewer, sourced from maintained
 * dependencies instead of the previously vendored Penner/KeySpline code:
 *
 * - d3-ease (BSD-3): polynomial and exponential easings
 * - bezier-easing (MIT, by the KeySpline author): cubic-bezier sampling
 */
import { easeExpOut, easePoly } from "d3-ease";
import bezierEasing from "bezier-easing";

/** Acceleration until halfway, then deceleration (quintic). */
export const easeInOutQuint = easePoly.exponent(5);

/** Strong exponential ease-out. */
export const easeOutStrong = easeExpOut;

/** CSS `ease-in` cubic-bezier(0.42, 0, 1.0, 1.0), sampled. */
export const easeInSpline = bezierEasing(0.42, 0, 1.0, 1.0);
