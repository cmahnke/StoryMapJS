/**
 * Easing functions used across the viewer, sourced from maintained
 * dependencies instead of the previously vendored Penner/KeySpline code:
 *
 * - d3-ease (BSD-3): polynomial and exponential easings
 * - bezier-easing (MIT, by the KeySpline author): cubic-bezier sampling
 *
 * This module is the single source of the viewer's animation curves. There is
 * deliberately no matching SCSS variable: the widget animates through
 * OpenLayers view animations and the Web Animations API, not CSS transitions,
 * so a stylesheet curve could only drift out of sync with these. The two
 * stylesheets used to carry `$animation-ease: cubic-bezier(0.77, 0, 0.175, 1)`
 * which nothing referenced, and which matched none of the curves below.
 */
import { easeExpOut, easePoly } from "d3-ease";
import bezierEasing from "bezier-easing";

/** Acceleration until halfway, then deceleration (quintic). The default glide. */
export const easeInOutQuint = easePoly.exponent(5);

/** Strong exponential ease-out. */
export const easeOutStrong = easeExpOut;

/** CSS `ease-in` cubic-bezier(0.42, 0, 1.0, 1.0), sampled. */
export const easeInSpline = bezierEasing(0.42, 0, 1.0, 1.0);
