//#region src/core/Util.ts
function e(e, t) {
	if (!e) return e;
	let n = new Date(/^\d{4}-\d{2}-\d{2} /.test(e) ? e.replace(" ", "T") : e);
	return Number.isNaN(n.getTime()) ? e : n.toLocaleDateString(t ?? "en-US", {
		year: "numeric",
		month: "short",
		day: "numeric"
	});
}
function t(e, t, n) {
	if (t == null) return;
	let r = n ?? Object.keys(t);
	for (let n of r) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
}
function n(e, n) {
	return t(e, n), e;
}
function r(e, n) {
	return t(e, n, Object.keys(e)), e;
}
var i = 0, a = "_vco_id";
function o(e) {
	let t = e;
	return t[a] = t[a] || ++i, t[a];
}
function s(e, t, n) {
	for (let r = 0; r < t.length; r++) if (t[r].data[n] === e) return r;
	return -1;
}
function c(e) {
	e != null && clearTimeout(e);
}
function l(e, t) {
	function n(e) {
		return Math.floor(Math.random() * e);
	}
	function r() {
		return "abcdefghijklmnopqurstuvwxyz".charAt(n(27));
	}
	function i(e) {
		let t = "";
		for (let n = 0; n < e; n++) t += r();
		return t;
	}
	return t ? t + "-" + i(e) : "vco-" + i(e);
}
function u(e) {
	e = e.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(e, t, n, r) {
		return t + t + n + n + r + r;
	});
	let t = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);
	return t ? {
		r: parseInt(t[1], 16),
		g: parseInt(t[2], 16),
		b: parseInt(t[3], 16)
	} : null;
}
var d = {
	aliceblue: [
		240,
		248,
		255
	],
	antiquewhite: [
		250,
		235,
		215
	],
	aqua: [
		0,
		255,
		255
	],
	aquamarine: [
		127,
		255,
		212
	],
	azure: [
		240,
		255,
		255
	],
	beige: [
		245,
		245,
		220
	],
	bisque: [
		255,
		228,
		196
	],
	black: [
		0,
		0,
		0
	],
	blanchedalmond: [
		255,
		235,
		205
	],
	blue: [
		0,
		0,
		255
	],
	blueviolet: [
		138,
		43,
		226
	],
	brown: [
		165,
		42,
		42
	],
	burlywood: [
		222,
		184,
		135
	],
	cadetblue: [
		95,
		158,
		160
	],
	chartreuse: [
		127,
		255,
		0
	],
	chocolate: [
		210,
		105,
		30
	],
	coral: [
		255,
		127,
		80
	],
	cornflowerblue: [
		100,
		149,
		237
	],
	cornsilk: [
		255,
		248,
		220
	],
	crimson: [
		220,
		20,
		60
	],
	cyan: [
		0,
		255,
		255
	],
	darkblue: [
		0,
		0,
		139
	],
	darkcyan: [
		0,
		139,
		139
	],
	darkgoldenrod: [
		184,
		134,
		11
	],
	darkgray: [
		169,
		169,
		169
	],
	darkgreen: [
		0,
		100,
		0
	],
	darkgrey: [
		169,
		169,
		169
	],
	darkkhaki: [
		189,
		183,
		107
	],
	darkmagenta: [
		139,
		0,
		139
	],
	darkolivegreen: [
		85,
		107,
		47
	],
	darkorange: [
		255,
		140,
		0
	],
	darkorchid: [
		153,
		50,
		204
	],
	darkred: [
		139,
		0,
		0
	],
	darksalmon: [
		233,
		150,
		122
	],
	darkseagreen: [
		143,
		188,
		143
	],
	darkslateblue: [
		72,
		61,
		139
	],
	darkslategray: [
		47,
		79,
		79
	],
	darkslategrey: [
		47,
		79,
		79
	],
	darkturquoise: [
		0,
		206,
		209
	],
	darkviolet: [
		148,
		0,
		211
	],
	deeppink: [
		255,
		20,
		147
	],
	deepskyblue: [
		0,
		191,
		255
	],
	dimgray: [
		105,
		105,
		105
	],
	dimgrey: [
		105,
		105,
		105
	],
	dodgerblue: [
		30,
		144,
		255
	],
	firebrick: [
		178,
		34,
		34
	],
	floralwhite: [
		255,
		250,
		240
	],
	forestgreen: [
		34,
		139,
		34
	],
	fuchsia: [
		255,
		0,
		255
	],
	gainsboro: [
		220,
		220,
		220
	],
	ghostwhite: [
		248,
		248,
		255
	],
	gold: [
		255,
		215,
		0
	],
	goldenrod: [
		218,
		165,
		32
	],
	gray: [
		128,
		128,
		128
	],
	green: [
		0,
		128,
		0
	],
	greenyellow: [
		173,
		255,
		47
	],
	grey: [
		128,
		128,
		128
	],
	honeydew: [
		240,
		255,
		240
	],
	hotpink: [
		255,
		105,
		180
	],
	indianred: [
		205,
		92,
		92
	],
	indigo: [
		75,
		0,
		130
	],
	ivory: [
		255,
		255,
		240
	],
	khaki: [
		240,
		230,
		140
	],
	lavender: [
		230,
		230,
		250
	],
	lavenderblush: [
		255,
		240,
		245
	],
	lawngreen: [
		124,
		252,
		0
	],
	lemonchiffon: [
		255,
		250,
		205
	],
	lightblue: [
		173,
		216,
		230
	],
	lightcoral: [
		240,
		128,
		128
	],
	lightcyan: [
		224,
		255,
		255
	],
	lightgoldenrodyellow: [
		250,
		250,
		210
	],
	lightgray: [
		211,
		211,
		211
	],
	lightgreen: [
		144,
		238,
		144
	],
	lightgrey: [
		211,
		211,
		211
	],
	lightpink: [
		255,
		182,
		193
	],
	lightsalmon: [
		255,
		160,
		122
	],
	lightseagreen: [
		32,
		178,
		170
	],
	lightskyblue: [
		135,
		206,
		250
	],
	lightslategray: [
		119,
		136,
		153
	],
	lightslategrey: [
		119,
		136,
		153
	],
	lightsteelblue: [
		176,
		196,
		222
	],
	lightyellow: [
		255,
		255,
		224
	],
	lime: [
		0,
		255,
		0
	],
	limegreen: [
		50,
		205,
		50
	],
	linen: [
		250,
		240,
		230
	],
	magenta: [
		255,
		0,
		255
	],
	maroon: [
		128,
		0,
		0
	],
	mediumaquamarine: [
		102,
		205,
		170
	],
	mediumblue: [
		0,
		0,
		205
	],
	mediumorchid: [
		186,
		85,
		211
	],
	mediumpurple: [
		147,
		112,
		219
	],
	mediumseagreen: [
		60,
		179,
		113
	],
	mediumslateblue: [
		123,
		104,
		238
	],
	mediumspringgreen: [
		0,
		250,
		154
	],
	mediumturquoise: [
		72,
		209,
		204
	],
	mediumvioletred: [
		199,
		21,
		133
	],
	midnightblue: [
		25,
		25,
		112
	],
	mintcream: [
		245,
		255,
		250
	],
	mistyrose: [
		255,
		228,
		225
	],
	moccasin: [
		255,
		228,
		181
	],
	navajowhite: [
		255,
		222,
		173
	],
	navy: [
		0,
		0,
		128
	],
	oldlace: [
		253,
		245,
		230
	],
	olive: [
		128,
		128,
		0
	],
	olivedrab: [
		107,
		142,
		35
	],
	orange: [
		255,
		165,
		0
	],
	orangered: [
		255,
		69,
		0
	],
	orchid: [
		218,
		112,
		214
	],
	palegoldenrod: [
		238,
		232,
		170
	],
	palegreen: [
		152,
		251,
		152
	],
	paleturquoise: [
		175,
		238,
		238
	],
	palevioletred: [
		219,
		112,
		147
	],
	papayawhip: [
		255,
		239,
		213
	],
	peachpuff: [
		255,
		218,
		185
	],
	peru: [
		205,
		133,
		63
	],
	pink: [
		255,
		192,
		203
	],
	plum: [
		221,
		160,
		221
	],
	powderblue: [
		176,
		224,
		230
	],
	purple: [
		128,
		0,
		128
	],
	rebeccapurple: [
		102,
		51,
		153
	],
	red: [
		255,
		0,
		0
	],
	rosybrown: [
		188,
		143,
		143
	],
	royalblue: [
		65,
		105,
		225
	],
	saddlebrown: [
		139,
		69,
		19
	],
	salmon: [
		250,
		128,
		114
	],
	sandybrown: [
		244,
		164,
		96
	],
	seagreen: [
		46,
		139,
		87
	],
	seashell: [
		255,
		245,
		238
	],
	sienna: [
		160,
		82,
		45
	],
	silver: [
		192,
		192,
		192
	],
	skyblue: [
		135,
		206,
		235
	],
	slateblue: [
		106,
		90,
		205
	],
	slategray: [
		112,
		128,
		144
	],
	slategrey: [
		112,
		128,
		144
	],
	snow: [
		255,
		250,
		250
	],
	springgreen: [
		0,
		255,
		127
	],
	steelblue: [
		70,
		130,
		180
	],
	tan: [
		210,
		180,
		140
	],
	teal: [
		0,
		128,
		128
	],
	thistle: [
		216,
		191,
		216
	],
	tomato: [
		255,
		99,
		71
	],
	turquoise: [
		64,
		224,
		208
	],
	violet: [
		238,
		130,
		238
	],
	wheat: [
		245,
		222,
		179
	],
	white: [
		255,
		255,
		255
	],
	whitesmoke: [
		245,
		245,
		245
	],
	yellow: [
		255,
		255,
		0
	],
	yellowgreen: [
		154,
		205,
		50
	]
};
function f(e, t) {
	let n = e.endsWith("%"), r = parseFloat(e);
	if (!isFinite(r)) return null;
	let i = n ? r / 100 * t : r;
	return Math.min(t, Math.max(0, Math.round(i)));
}
function p(e) {
	let t = e.trim().toLowerCase(), n = u(t);
	if (n) return n;
	let r = /^rgba?\(\s*([^,)]+)\s*,\s*([^,)]+)\s*,\s*([^,)]+)\s*(?:,\s*[^)]+\s*)?\)$/.exec(t);
	if (r) {
		let e = f(r[1], 255), t = f(r[2], 255), n = f(r[3], 255);
		return e === null || t === null || n === null ? null : {
			r: e,
			g: t,
			b: n
		};
	}
	let i = d[t];
	return i ? {
		r: i[0],
		g: i[1],
		b: i[2]
	} : null;
}
function m(e, t) {
	let n = Math.abs(t - e);
	return Math.max(600, Math.min(1e3 + n * 120, 2e3));
}
function h() {
	return typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function g(e) {
	return e.match(/<p>[\s\S]*?<\/p>/) ? e : "<p>" + e + "</p>";
}
var _ = { r16_9: function(e) {
	return typeof e.w == "number" && isFinite(e.w) ? Math.round(e.w / 16 * 9) : typeof e.h == "number" && isFinite(e.h) ? Math.round(e.h / 9 * 16) : 0;
} };
function v(e, t) {
	if (e !== void 0) {
		let n = 0;
		for (let r in e) {
			if (t === n) return e[r];
			n++;
		}
		return "";
	}
	return "";
}
//#endregion
//#region src/core/Load.ts
function y(e, t, n) {
	return new Promise((r, i) => {
		if (n?.signal?.aborted) {
			i(new DOMException("Load aborted", "AbortError"));
			return;
		}
		let a = document.createElement(e);
		for (let e in t) Object.hasOwn(t, e) && a.setAttribute(e, t[e]);
		e === "script" && (a.async = !1);
		let o = () => {
			a.onload = null, a.onerror = null, n?.signal?.removeEventListener("abort", s);
		}, s = () => {
			o(), a.remove(), i(new DOMException("Load aborted", "AbortError"));
		};
		a.onload = () => {
			o(), r();
		}, a.onerror = () => {
			o(), i(/* @__PURE__ */ Error(`Failed to load ${t.src ?? t.href}`));
		}, n?.signal?.addEventListener("abort", s, { once: !0 }), document.head.appendChild(a);
	});
}
var b = /* @__PURE__ */ new Map();
function x(e, t) {
	return t.aborted ? Promise.reject(new DOMException("Load aborted", "AbortError")) : new Promise((n, r) => {
		let i = () => {
			r(new DOMException("Load aborted", "AbortError"));
		};
		t.addEventListener("abort", i, { once: !0 }), e.then(n, r).then(() => {
			t.removeEventListener("abort", i);
		});
	});
}
function S(e, t, n) {
	let r = b.get(e);
	return r || (r = t().catch((t) => {
		throw b.delete(e), t;
	}), b.set(e, r)), n?.signal ? x(r, n.signal) : r;
}
function C(e, t) {
	return S(e, () => y("script", { src: e }), t);
}
function w(e, t) {
	return S(e, () => y("link", {
		href: e,
		rel: "stylesheet"
	}), t);
}
var T = 0;
function E(e) {
	let t = window;
	if (!Object.hasOwn(t, e)) return e;
	let n;
	do
		T += 1, n = `${e}_${T}`;
	while (Object.hasOwn(t, n));
	return n;
}
function ee(e, t, n) {
	return new Promise((r, i) => {
		if (n?.signal?.aborted) {
			i(new DOMException("Load aborted", "AbortError"));
			return;
		}
		let a = window, o = document.createElement("script"), s = !1, c = () => {
			s = !0, clearTimeout(f), o.remove(), a[t] === d && delete a[t], n?.signal?.removeEventListener("abort", u);
		}, l = () => {
			s = !0, clearTimeout(f), o.remove(), a[t] === d && (a[t] = () => {
				delete a[t];
			}), n?.signal?.removeEventListener("abort", u);
		}, u = () => {
			s || (l(), i(new DOMException("Load aborted", "AbortError")));
		}, d = (e) => {
			s || (c(), r(e));
		}, f = setTimeout(() => {
			s || (l(), i(/* @__PURE__ */ Error(`JSONP request timed out: ${e}`)));
		}, n?.timeout ?? 15e3);
		a[t] = d, o.onerror = () => {
			s || (l(), i(/* @__PURE__ */ Error(`Failed to load ${e}`)));
		}, n?.signal?.addEventListener("abort", u, { once: !0 }), o.src = e, document.body.appendChild(o);
	});
}
//#endregion
//#region src/storymap/validate.ts
var D = {
	$schema: "http://json-schema.org/draft-07/schema#",
	$id: "storymap.schema.json",
	title: "StoryMapJS",
	description: "StoryMapJS data format",
	type: "object",
	required: ["storymap"],
	properties: { storymap: {
		type: "object",
		required: ["slides"],
		properties: {
			language: { type: "string" },
			map_type: {
				description: "Basemap type, or \"none\" for a storymap with no map at all. A keyword: \"\" (the default, OpenStreetMap), osm:<style>, osm (classic raster), mapbox://styles/<user>/<style>, stadia:<style>, stamen:<style> (deprecated, remapped), iiif, ch-watercolor, zoomify (legacy image pyramid, needs the zoomify options). Or a tile URL template or style JSON URL (absolute https://... or relative ./tiles/{z}/{x}/{y}.png, /tiles/{z}/...).",
				anyOf: [{
					type: "string",
					enum: [
						"",
						"none",
						"osm",
						"iiif",
						"stamen",
						"stadia",
						"ch-watercolor",
						"zoomify"
					]
				}, {
					type: "string",
					pattern: "^(?:osm|stadia|mapbox|ch|esri|stamen)(?::|$)|\\{|/|\\.json$"
				}]
			},
			zoomify: { anyOf: [{
				type: "object",
				properties: {
					path: { type: "string" },
					width: { type: "number" },
					height: { type: "number" },
					tolerance: { type: "number" },
					attribution: { type: "string" }
				}
			}, { type: "boolean" }] },
			map_as_image: { type: "boolean" },
			map_mini: { type: "boolean" },
			map_access_token: { type: "string" },
			map_background_color: { type: "string" },
			map_options: {
				type: "object",
				description: "OpenLayers passthrough options (view, controls, interactions); element replaces the map container"
			},
			map_bbox: { anyOf: [{
				type: "array",
				items: { type: "number" },
				minItems: 4,
				maxItems: 4
			}, { type: "null" }] },
			map_area: {
				type: "string",
				enum: ["full", "left"]
			},
			overview_extent: {
				anyOf: [{
					type: "array",
					items: { type: "number" },
					minItems: 4,
					maxItems: 4
				}, { type: "null" }],
				description: "Constrain the minimap overview to this lon/lat bounding box [west, south, east, north]; null (default) leaves it unconstrained"
			},
			keyboard: {
				type: "boolean",
				description: "Navigate slides with the arrow keys anywhere on the page (default false)"
			},
			overlays: {
				type: "array",
				description: "Raster layers stacked above the base map and below the route lines",
				items: {
					type: "object",
					properties: {
						map_type: {
							type: "string",
							description: "Any map_type the tile layer factory accepts. Omit when the entry carries a georeference instead."
						},
						opacity: {
							type: "number",
							minimum: 0,
							maximum: 1
						},
						visible: { type: "boolean" },
						attribution: { type: "string" },
						className: {
							type: "string",
							description: "CSS class of the layer container, isolating it from the shared ol-layer canvas (e.g. for blend modes)"
						},
						blendMode: { type: "string" },
						extent: {
							type: "array",
							items: { type: "number" },
							minItems: 4,
							maxItems: 4,
							description: "Clip the layer to this lon/lat bounding box [west, south, east, north] (mercator maps)"
						},
						georeference: {
							type: "object",
							description: "A IIIF Georeference Extension annotation body plus the image it places. In a IIIF manifest this is a motivation: \"georeferencing\" annotation whose target embeds the image and whose body is the FeatureCollection of ground control points.",
							required: [
								"url",
								"width",
								"height",
								"body"
							],
							properties: {
								url: {
									type: "string",
									description: "IIIF Image API service base, or a full-size image URL"
								},
								width: {
									type: "number",
									exclusiveMinimum: 0,
									description: "Image width in pixels (the resourceCoords space)"
								},
								height: {
									type: "number",
									exclusiveMinimum: 0,
									description: "Image height in pixels"
								},
								body: {
									type: "object",
									description: "The Georeference Extension annotation body, verbatim: a GeoJSON FeatureCollection of ground control points pairing properties.resourceCoords (image pixels) with geometry.coordinates (WGS84 lon/lat), optionally with a transformation hint.",
									required: ["type", "features"],
									properties: {
										type: { const: "FeatureCollection" },
										transformation: { type: "object" },
										features: {
											type: "array",
											minItems: 1
										}
									}
								}
							}
						}
					},
					anyOf: [{ required: ["map_type"] }, { required: ["georeference"] }]
				}
			},
			consent_required: { type: "boolean" },
			map_center_offset: {
				type: "object",
				properties: {
					left: { type: "number" },
					top: { type: "number" }
				}
			},
			use_custom_markers: { type: "boolean" },
			calculate_zoom: { type: "boolean" },
			line_follows_path: { type: "boolean" },
			show_lines: { type: "boolean" },
			show_history_line: { type: "boolean" },
			line_color: { type: "string" },
			line_color_inactive: { type: "string" },
			line_weight: { type: "number" },
			line_opacity: {
				type: "number",
				minimum: 0,
				maximum: 1
			},
			line_dash: { type: "string" },
			line_join: { type: "string" },
			iiif: {
				type: "object",
				required: ["url"],
				properties: {
					url: {
						type: "string",
						description: "URL of the IIIF Image API info.json document"
					},
					attribution: { type: "string" }
				}
			},
			font_css: { type: "string" },
			call_to_action: { type: "boolean" },
			call_to_action_text: { type: "string" },
			fullscreen: { type: "boolean" },
			show_overview: { type: "boolean" },
			show_back_to_start: { type: "boolean" },
			show_progress: { type: "boolean" },
			show_distance: { type: "boolean" },
			marker_labels: { type: "boolean" },
			text_align: {
				type: "string",
				enum: [
					"left",
					"center",
					"right"
				],
				description: "Default horizontal alignment for slide text"
			},
			text_color: { type: "string" },
			text_background_color: { type: "string" },
			nocache: { type: "boolean" },
			autoplay: {
				type: "number",
				description: "Milliseconds per slide; 0 (the default) disables autoplay"
			},
			autoplay_media: {
				type: "boolean",
				default: !1,
				description: "When autoplaying, wait for the slide media to end before advancing; the autoplay timer stays as the fallback."
			},
			trackResize: { type: "boolean" },
			duration: { type: "number" },
			map_overview_center: { anyOf: [{
				type: "object",
				properties: {
					lat: { type: "number" },
					lon: { type: "number" }
				}
			}, { type: "null" }] },
			api_key_flickr: { type: "string" },
			attribution: { type: "string" },
			start_at_slide: {
				type: "integer",
				minimum: 0
			},
			slides: {
				type: "array",
				items: { $ref: "#/$defs/slide" }
			},
			layout: {
				type: "string",
				enum: ["landscape", "portrait"],
				description: "Force a layout instead of deriving it from the container width. \"portrait\" is what the viewer picks at or below skinny_size."
			}
		}
	} },
	$defs: { slide: {
		type: "object",
		properties: {
			type: {
				type: "string",
				description: "'overview' marks the map overview slide"
			},
			date: { type: [
				"string",
				"object",
				"null"
			] },
			group: { type: "string" },
			language: {
				type: "string",
				description: "The language tag this slide's text is in. A IIIF manifest states text as a language map; the reader picks the viewer's configured language and reports which one it used, so a host can offer a language switch. Absent for language-neutral (none) text."
			},
			location: {
				type: "object",
				properties: {
					lat: {
						type: "number",
						description: "Latitude, or vertical position in image pixels for image maps"
					},
					lon: {
						type: "number",
						description: "Longitude, or horizontal position in image pixels for image maps"
					},
					region: {
						type: "array",
						items: { type: "number" },
						minItems: 4,
						maxItems: 4,
						description: "Image region [x, y, w, h] in image pixels (IIIF xywh convention) for image maps; the view fits the region on navigation"
					},
					zoom: { type: "number" },
					line: { type: "boolean" },
					name: { type: "string" },
					icon: {
						type: "string",
						format: "uri"
					},
					iconSize: {
						type: "array",
						items: { type: "number" },
						minItems: 1,
						maxItems: 2
					},
					image: {
						type: "string",
						format: "uri"
					},
					use_custom_marker: { type: "boolean" }
				}
			},
			media: {
				type: "object",
				properties: {
					url: { type: ["string", "null"] },
					caption: { type: ["string", "null"] },
					credit: { type: ["string", "null"] },
					thumb: { type: "string" },
					alt: { type: "string" },
					srcset: { type: "string" },
					sizes: { type: "string" },
					subtitles: {
						type: ["string", "null"],
						format: "uri",
						description: "WebVTT subtitle file for an audio or video slide, rendered as a <track kind=\"subtitles\">."
					},
					mediatype: { type: ["object", "null"] }
				}
			},
			text: {
				type: "object",
				properties: {
					headline: { type: "string" },
					text: { type: "string" },
					date: { type: [
						"string",
						"object",
						"null"
					] },
					text_align: {
						type: "string",
						enum: [
							"left",
							"center",
							"right"
						],
						description: "Horizontal alignment of this slide's text block"
					}
				}
			},
			marker: {
				type: ["object", "null"],
				description: "Per-slide marker presentation. location.icon/iconSize/image/use_custom_marker and location.name remain supported as legacy spellings; marker.* wins when present. In a IIIF manifest these arrive in the navPlace Feature properties instead.",
				properties: {
					icon: {
						type: "string",
						format: "uri"
					},
					iconSize: {
						type: "array",
						items: { type: "number" }
					},
					image: {
						type: "string",
						format: "uri"
					},
					label: { type: "string" },
					popup: { type: "boolean" },
					audioBadge: { type: "boolean" }
				}
			},
			narration: {
				type: ["object", "null"],
				description: "Spoken narration for this slide, played through a dedicated audio element. Storymap JSON only: in a IIIF manifest the closest spelling is a Sound body, which currently lands in media.url rather than here.",
				properties: { url: {
					type: "string",
					format: "uri"
				} },
				required: ["url"]
			},
			background: {
				type: ["object", "string"],
				properties: {
					url: {
						type: ["string", "null"],
						format: "uri"
					},
					color: { type: ["string", "null"] },
					opacity: {
						type: "number",
						description: "Background image opacity, 0-1"
					}
				}
			},
			uniqueid: { type: "string" }
		}
	} }
};
function O(e, t) {
	return (Array.isArray(t) ? t : [t]).some((t) => {
		switch (t) {
			case "object": return typeof e == "object" && !!e && !Array.isArray(e);
			case "array": return Array.isArray(e);
			case "string": return typeof e == "string";
			case "number": return typeof e == "number" && !isNaN(e);
			case "integer": return typeof e == "number" && Number.isInteger(e);
			case "boolean": return typeof e == "boolean";
			case "null": return e === null;
			default: return !0;
		}
	});
}
function te(e, t) {
	try {
		return new RegExp(e).test(t);
	} catch {
		return !0;
	}
}
function ne(e, t) {
	if (typeof e != "string") return !0;
	if (t === "uri" || t === "uri-reference") try {
		return new URL(e, "https://example.invalid/"), !0;
	} catch {
		return !1;
	}
	return !0;
}
function k(e, t, n, r) {
	if (t && typeof t == "object") {
		if (t.$ref) {
			let i = t.$ref.replace(/^#\//, "").replaceAll("~1", "/").replaceAll("~0", "~"), a = D;
			for (let e of i.split("/")) a = a[e];
			k(e, a, n, r);
			return;
		}
		if (t.anyOf) {
			let i = t.anyOf.map((t) => {
				let r = [];
				return k(e, t, n, r), r;
			});
			if (!i.some((e) => e.length === 0)) {
				let e = i[0] ?? [];
				for (let t of i) t.length > 0 && t.length < e.length && (e = t);
				r.push(...e), r.push({
					path: n,
					message: `must match one of the ${t.anyOf.length} allowed shapes`
				});
				return;
			}
		}
		if (t.type && !O(e, t.type)) {
			let i = Array.isArray(t.type) ? t.type.join(" or ") : t.type;
			r.push({
				path: n,
				message: `expected ${i}, got ${e === null ? "null" : typeof e}`
			});
			return;
		}
		if (t.enum && !t.enum.some((t) => t === e) && r.push({
			path: n,
			message: `must be one of ${t.enum.map((e) => JSON.stringify(e)).join(", ")}`
		}), typeof e == "number" && (t.minimum !== void 0 && e < t.minimum && r.push({
			path: n,
			message: `must be >= ${t.minimum}`
		}), t.maximum !== void 0 && e > t.maximum && r.push({
			path: n,
			message: `must be <= ${t.maximum}`
		})), typeof e == "string" && (t.minLength !== void 0 && e.length < t.minLength && r.push({
			path: n,
			message: `must be at least ${t.minLength} characters`
		}), t.maxLength !== void 0 && e.length > t.maxLength && r.push({
			path: n,
			message: `must be at most ${t.maxLength} characters`
		}), t.pattern !== void 0 && !te(t.pattern, e) && r.push({
			path: n,
			message: `must match ${t.pattern}`
		})), t.format && !ne(e, t.format) && r.push({
			path: n,
			message: `must be a valid ${t.format}`
		}), Array.isArray(e)) {
			t.minItems !== void 0 && e.length < t.minItems && r.push({
				path: n,
				message: `must have at least ${t.minItems} items`
			}), t.maxItems !== void 0 && e.length > t.maxItems && r.push({
				path: n,
				message: `must have at most ${t.maxItems} items`
			});
			let i = t.items;
			i && e.forEach((e, t) => k(e, i, `${n}[${t}]`, r));
		}
		if (typeof e == "object" && e && !Array.isArray(e)) {
			let i = e;
			if (t.required) for (let e of t.required) e in i || r.push({
				path: n,
				message: `missing required property "${e}"`
			});
			if (t.properties) for (let [e, a] of Object.entries(t.properties)) e in i && k(i[e], a, `${n}.${e}`, r);
		}
	}
}
function re(e) {
	let t = [];
	return typeof e != "object" || !e || Array.isArray(e) ? [{
		path: "",
		message: "storymap data must be a JSON object"
	}] : "storymap" in e ? (k(e, D, "", t), t) : [{
		path: "",
		message: "missing required property \"storymap\""
	}];
}
function ie(e, t) {
	let n = re(e);
	if (n.length === 0) return !0;
	console.error(`StoryMapJS: invalid storymap data${t ? ` (${t})` : ""} - ${n.length} error${n.length > 1 ? "s" : ""} found:`);
	for (let e of n) console.error(`  ${e.path || "(root)"}: ${e.message}`);
	return !1;
}
//#endregion
//#region src/storymap/content-state.ts
var ae = "iiif-content";
function oe(e) {
	return btoa(encodeURIComponent(e)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function se(e) {
	let t = e.length % 4;
	if (t === 1) throw Error("InvalidLengthError: not a valid content state encoding");
	let n = t === 0 ? e : e + "====".slice(0, 4 - t);
	return decodeURIComponent(atob(n.replace(/-/g, "+").replace(/_/g, "/")));
}
function ce(e) {
	return typeof e != "object" || !e || Array.isArray(e) ? null : e;
}
function le(e) {
	let t = e.indexOf("#");
	if (t === -1) return null;
	let n = /xywh=(?:pixel:)?(-?\d+),(-?\d+),(\d+),(\d+)/.exec(e.slice(t));
	if (!n) return null;
	let r = n.slice(1, 5).map(Number);
	return r.every((e) => Number.isFinite(e)) ? [e.slice(0, t), r] : null;
}
function ue(e) {
	if (typeof e != "string" || e === "") return null;
	let t = le(e);
	if (t === null) return { id: e };
	let [n, r] = t;
	return {
		id: n,
		region: r
	};
}
function de(e) {
	let t = ce(Array.isArray(e) ? e[0] : e);
	if (t === null) return null;
	if (t.source !== void 0) {
		let e = ue(ce(t.source)?.id);
		if (e === null) return null;
		let n = ce(t.selector), r = typeof n?.value == "string" ? n.value : null, i = r === null ? null : /xywh=(?:pixel:)?(-?\d+),(-?\d+),(\d+),(\d+)/.exec(r);
		if (i) {
			let t = i.slice(1, 5).map(Number);
			if (t.every((e) => Number.isFinite(e))) return {
				id: e.id,
				region: t
			};
		}
		return e;
	}
	return ue(t.id);
}
function fe(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	if (t === "") return null;
	if (t.startsWith("{")) return pe(t);
	if (/^https?:\/\//i.test(t)) return ue(t);
	try {
		return pe(se(t));
	} catch {
		return null;
	}
}
function pe(e) {
	let t;
	try {
		t = JSON.parse(e);
	} catch {
		return null;
	}
	let n = ce(t);
	return n === null ? null : n.target === void 0 ? de(n) : de(n.target);
}
function me(e, t) {
	if (e.region === void 0) return e.id;
	let n = {
		id: `${e.id}#xywh=${e.region.join(",")}`,
		type: "Canvas"
	};
	return typeof t == "string" && t !== "" && (n.partOf = [{
		id: t,
		type: "Manifest"
	}]), oe(JSON.stringify(n));
}
//#endregion
//#region src/map/georeference.ts
var he = .05, ge = .01;
function _e(e) {
	return typeof e == "number" && isFinite(e);
}
function ve(e) {
	let t = e.replace(/\/+$/, "");
	return /info\.json$/.test(t) ? t : t + "/info.json";
}
function ye(e) {
	if (typeof e != "object" || !e) return null;
	let t = e.features;
	if (!Array.isArray(t)) return null;
	let n = [];
	for (let e of t) {
		if (typeof e != "object" || !e) continue;
		let t = e, r = t.properties?.resourceCoords, i = t.geometry?.coordinates;
		Array.isArray(r) && Array.isArray(i) && _e(r[0]) && _e(r[1]) && _e(i[0]) && _e(i[1]) && n.push({
			pixel: [r[0], r[1]],
			lonLat: [i[0], i[1]]
		});
	}
	return n.length >= 3 ? n : null;
}
function be(e) {
	let t = e?.transformation;
	if (!t || typeof t != "object") return null;
	let n = t.type;
	if (n == null) return null;
	if (n !== "polynomial") return `transformation type "${n}" is not supported (only a first-order polynomial is placed affinely)`;
	let r = t.options?.order;
	return r !== void 0 && r !== 1 ? `polynomial order ${r} is not supported (only first-order is placed affinely)` : null;
}
function xe(e) {
	if (e.length < 3) return null;
	let t = [
		[
			0,
			0,
			0
		],
		[
			0,
			0,
			0
		],
		[
			0,
			0,
			0
		]
	], n = [
		0,
		0,
		0
	], r = [
		0,
		0,
		0
	];
	for (let i of e) {
		let [e, a] = i.pixel, o = [
			e,
			a,
			1
		];
		for (let e = 0; e < 3; e++) {
			for (let n = 0; n < 3; n++) t[e][n] += o[e] * o[n];
			n[e] += o[e] * i.lonLat[0], r[e] += o[e] * i.lonLat[1];
		}
	}
	let i = we(t, n), a = we(t, r);
	return !i || !a ? null : [
		i[0],
		a[0],
		i[1],
		a[1],
		i[2],
		a[2]
	];
}
function Se(e, t, n) {
	let [r, i, a, o, s, c] = e;
	return [r * t + a * n + s, i * t + o * n + c];
}
function Ce(e, t, n) {
	if (!_e(t) || !_e(n) || t <= 0 || n <= 0) return {
		kind: "skipped",
		reason: "the placed image has no usable pixel dimensions"
	};
	let r = be(e);
	if (r) return {
		kind: "skipped",
		reason: r
	};
	let i = ye(e);
	if (!i) return {
		kind: "skipped",
		reason: "the georeference has fewer than three valid ground control points"
	};
	let a = xe(i);
	if (!a) return {
		kind: "skipped",
		reason: "the ground control points do not determine a transform"
	};
	let o = 0;
	for (let e of i) {
		let [t, n] = Se(a, e.pixel[0], e.pixel[1]);
		o += Math.abs(t - e.lonLat[0]) + Math.abs(n - e.lonLat[1]);
	}
	let s = o / (i.length * 2);
	if (s > he) return {
		kind: "skipped",
		reason: `the ground control points do not fit an affine transform (mean residual ${s.toFixed(4)}°, limit ${he}°); the sheet needs a projection or a warped layer`
	};
	let [c, l, u, d] = a, f = Math.hypot(c, l), p = Math.hypot(u, d);
	if (Math.max(f > 0 ? Math.abs(l) / f : 1, p > 0 ? Math.abs(u) / p : 1) > ge) return {
		kind: "skipped",
		reason: "the placed image is rotated or skewed relative to the geographic axes; the viewer places axis-aligned sheets only (use tile_source_factory for warped layers)"
	};
	let m = [
		[0, 0],
		[t, 0],
		[t, n],
		[0, n]
	], h = Infinity, g = Infinity, _ = -Infinity, v = -Infinity;
	for (let [e, t] of m) {
		let [n, r] = Se(a, e, t);
		h = Math.min(h, n), _ = Math.max(_, n), g = Math.min(g, r), v = Math.max(v, r);
	}
	return !_e(h) || !_e(g) || !_e(_) || !_e(v) || _ <= h || v <= g ? {
		kind: "skipped",
		reason: "the placed image has a degenerate extent"
	} : {
		kind: "placed",
		transform: a,
		bbox: [
			h,
			g,
			_,
			v
		],
		residual: s
	};
}
function we(e, t) {
	let n = [
		[
			e[0][0],
			e[0][1],
			e[0][2],
			t[0]
		],
		[
			e[1][0],
			e[1][1],
			e[1][2],
			t[1]
		],
		[
			e[2][0],
			e[2][1],
			e[2][2],
			t[2]
		]
	];
	for (let e = 0; e < 3; e++) {
		let t = e;
		for (let r = e + 1; r < 3; r++) Math.abs(n[r][e]) > Math.abs(n[t][e]) && (t = r);
		if (Math.abs(n[t][e]) < 1e-12) return null;
		if (t !== e) {
			let r = n[t];
			n[t] = n[e], n[e] = r;
		}
		for (let t = 0; t < 3; t++) {
			if (t === e) continue;
			let r = n[t][e] / n[e][e];
			for (let i = e; i < 4; i++) n[t][i] -= r * n[e][i];
		}
	}
	return [
		n[0][3] / n[0][0],
		n[1][3] / n[1][1],
		n[2][3] / n[2][2]
	];
}
//#endregion
//#region src/storymap/iiif.ts
var Te = "iiif.io/api/presentation/3/context.json", Ee = "mapconfig", De = "storymap:", Oe = [
	"name",
	"zoom",
	"line",
	"icon",
	"iconSize",
	"image",
	"use_custom_marker",
	"popup",
	"audioBadge"
];
function A(e) {
	return typeof e != "object" || !e || Array.isArray(e) ? null : e;
}
function j(e) {
	return typeof e == "string" && e !== "" ? e : null;
}
function M(e) {
	return typeof e == "number" && !isNaN(e) ? e : null;
}
function ke(e) {
	return typeof e == "boolean" ? e : null;
}
function Ae(e) {
	return typeof e == "string" ? [e] : Array.isArray(e) ? e.filter((e) => typeof e == "string") : [];
}
function je(e, t = null) {
	if (typeof e == "string") return {
		value: e,
		language: null
	};
	let n = A(e);
	if (!n) return {
		value: "",
		language: null
	};
	let r = n.value;
	if (typeof r == "string") return {
		value: r,
		language: null
	};
	if (Array.isArray(r)) return {
		value: Ae(r).join(" ").trim(),
		language: null
	};
	let i = Object.keys(n);
	if (i.length === 0) return {
		value: "",
		language: null
	};
	let a = (e) => Ae(n[e]).join(" ").trim();
	if (t !== null && t !== "") {
		for (let e of i) if (e.toLowerCase() === t.toLowerCase()) return {
			value: a(e),
			language: e
		};
		let e = t.split("-")[0].toLowerCase();
		for (let t of i) if (t.toLowerCase() === e) return {
			value: a(t),
			language: t
		};
	}
	return "none" in n ? {
		value: a("none"),
		language: null
	} : {
		value: a(i[0]),
		language: i[0]
	};
}
var Me = {
	region: null,
	point: null,
	quote: null,
	time: null,
	svg: null
};
function Ne(e) {
	return e.region === null && e.point === null && e.quote === null && e.time === null && e.svg === null;
}
var Pe = .05;
function Fe(e, t, n) {
	if (t === null || n === null || !(t > 0) || !(n > 0)) return null;
	let r = Math.max(1, Math.round(Math.min(t, n) * Pe));
	return [
		Math.max(0, Math.min(t - r, Math.round(e.x - r / 2))),
		Math.max(0, Math.min(n - r, Math.round(e.y - r / 2))),
		r,
		r
	];
}
function Ie(e, t, n = 0) {
	let r = A(e);
	if (!r) return;
	let i = j(r.type);
	if (i === "ImageApiSelector" || i === "FragmentSelector") {
		let e = j(r.value);
		if (e !== null && t.region === null) {
			let n = /xywh=(pixel:)?([^,]+),([^,]+),([^,]+),([^,]+)/.exec(e);
			if (n) {
				let e = n.slice(2).map(Number);
				e.length === 4 && e.every((e) => Number.isFinite(e)) && e[0] >= 0 && e[1] >= 0 && e[2] > 0 && e[3] > 0 && (t.region = e);
			}
		}
	} else if (i === "PointSelector") {
		let e = M(r.x), n = M(r.y);
		e !== null && n !== null && t.point === null && (t.point = {
			x: e,
			y: n
		});
	} else if (i === "TextQuoteSelector") {
		let e = j(r.exact);
		if (e !== null && t.quote === null) {
			let n = j(r.prefix), i = j(r.suffix);
			t.quote = {
				exact: e,
				...n === null ? {} : { prefix: n },
				...i === null ? {} : { suffix: i }
			};
		}
	} else if (i === "SvgSelector") {
		let e = j(r.value);
		e !== null && t.svg === null && (t.svg = e);
	} else if (i === "TimeState" || i === "oa:TimeState") {
		let e = A(r), n = M(e?.start), i = M(e?.end);
		(n !== null || i !== null) && t.time === null && (t.time = {
			...n === null ? {} : { start: n },
			...i === null ? {} : { end: i }
		});
	}
	if (n < 1) {
		let e = Array.isArray(r.refinedBy) ? r.refinedBy : [r.refinedBy];
		for (let r of e) Ie(r, t, n + 1);
	}
}
function Le(e, t = null, n = null) {
	let r = { ...Me }, i = j(e);
	i !== null && Ie({
		type: "FragmentSelector",
		value: i
	}, r);
	let a = A(e);
	if (a) {
		let e = Array.isArray(a.selector) ? a.selector : [a.selector];
		for (let t of e) Ie(t, r);
		let t = Array.isArray(a.state) ? a.state : [a.state];
		for (let e of t) Ie(e, r);
	}
	if (a && r.time === null) {
		let e = M(a.start), t = M(a.end);
		(e !== null || t !== null) && (r.time = {
			...e === null ? {} : { start: e },
			...t === null ? {} : { end: t }
		});
	}
	return r.region === null && r.point !== null && (r.region = Fe(r.point, t, n)), Ne(r) ? { ...Me } : r;
}
function Re(e) {
	if (typeof e == "string") return e;
	let t = A(e);
	if (!t) return "";
	let n = t.value;
	if (typeof n == "string") return n;
	if (Array.isArray(n)) return Ae(n).join(" ").trim();
	let r = "none" in t ? ["none"] : Object.keys(t), i = [];
	for (let e of r) i.push(...Ae(t[e]));
	return i.join(" ").trim();
}
function ze(e) {
	let t = Array.isArray(e) ? e : e === void 0 ? [] : [e];
	for (let e of t) {
		let t = A(e);
		if (!t) continue;
		let n = Re(t.value);
		if (n !== "") return {
			label: Re(t.label),
			value: n
		};
	}
	return {
		label: "",
		value: ""
	};
}
function Be(e) {
	return e.value === "" ? "" : e.label === "" ? e.value : `${e.label}: ${e.value}`;
}
function N(e, t) {
	let n = e[De + t];
	return n === void 0 ? t === "type" ? void 0 : e[t] : n;
}
function Ve(e) {
	let t = A(e);
	if (!t || t.type === "Collection") return !1;
	if (t.type === "Manifest") return !0;
	let n = t["@context"];
	return (Array.isArray(n) ? n : [n]).some((e) => typeof e == "string" && e.includes(Te));
}
function He(e) {
	let t = A(e);
	return t !== null && t.type === "Collection";
}
function Ue(e) {
	let t = { slides: [] }, n = Re(e.label);
	n !== "" && (t.title = n);
	let r = Be(ze(e.requiredStatement));
	if (r !== "") {
		let e = t.iiif ?? {};
		e.attribution = r, e.url === void 0 && (e.url = ""), t.iiif = e;
	}
	let i = (Array.isArray(e.items) ? e.items : []).map((e) => typeof e == "string" ? e : j(A(e)?.id)).filter((e) => typeof e == "string");
	return console.warn(`StoryMapJS: this is a IIIF Collection with ${i.length} member manifest(s) [${i.join(", ")}]. A Presentation 3 Collection references its members from other documents, and the converter is synchronous, so it contributes no slides rather than mangling them. To build a multi-manifest tour, fetch the members and concatenate their manifestToStorymapData() slides yourself (see docs/plans/iiif-interop.md §2.2).`), t;
}
function We(e) {
	let t = Array.isArray(e.items) ? e.items : [];
	for (let e of t) {
		let t = A(e);
		if (!t) continue;
		let n = Array.isArray(t.items) ? t.items : [];
		for (let e of n) {
			let t = A(e);
			if (!t) continue;
			let n = Array.isArray(t.items) ? t.items : [];
			for (let e of n) {
				let t = A(e);
				if (!t) continue;
				let n = Array.isArray(t.body) ? t.body : [t.body];
				for (let e of n) {
					let t = A(e);
					if (!t) continue;
					let n = Array.isArray(t.service) ? t.service : [];
					for (let e of n) {
						let t = A(e);
						if (!t) continue;
						let n = j(t.id);
						if (n !== null) return n.endsWith("/info.json") ? n : `${n}/info.json`;
					}
					let r = j(t.id);
					if (r !== null && r.endsWith("/info.json")) return r;
				}
			}
		}
	}
	return null;
}
function Ge(e) {
	let t = A(e.tilejson);
	if (!t) return null;
	let n = Array.isArray(t.tiles) ? Ae(t.tiles).filter((e) => e !== "") : j(t.tiles);
	if (Array.isArray(n) ? n.length === 0 : n === null) return null;
	let r = { tiles: n }, i = M(t.minzoom);
	i !== null && i >= 0 && (r.minzoom = i);
	let a = M(t.maxzoom);
	a !== null && a >= 0 && (r.maxzoom = a);
	let o = Et(t.bounds);
	o !== null && (r.bounds = o);
	let s = j(t.scheme);
	(s === "xyz" || s === "tms") && (r.scheme = s);
	let c = Array.isArray(t.center) ? t.center : null;
	if (c && c.length >= 2) {
		let e = M(c[0]), t = M(c[1]);
		if (e !== null && t !== null && Math.abs(e) <= 180 && Math.abs(t) <= 90) {
			let n = c.length > 2 ? M(c[2]) : null;
			r.center = n === null ? [
				e,
				t,
				0
			] : [
				e,
				t,
				n
			];
		}
	}
	return r;
}
function Ke(e) {
	let t = Array.isArray(e.service) ? e.service : [e.service];
	for (let e of t) {
		let t = A(e);
		if (!t) continue;
		let n = j(t.profile);
		if (n !== null && n.includes(Ee)) return t;
	}
	return null;
}
function qe(e) {
	let t = A(e);
	if (!t) return null;
	let n = Be(ze(t.requiredStatement));
	if (n !== "") return n;
	let r = A(t.provider), i = r === null ? "" : Re(r.label);
	return i === "" ? null : i;
}
function Je(e) {
	if (e.requiredStatement === void 0) return null;
	let t = Be(ze(e.requiredStatement));
	return t === "" ? null : t;
}
function Ye(e) {
	let t = Array.isArray(e) ? e : [e];
	for (let e of t) {
		let t = A(e);
		if (!t) continue;
		let n = j(t.format), r = j(t.id);
		if (n !== null && /^text\/vtt$/i.test(n) && r !== null) return r;
	}
	return null;
}
function Xe(e) {
	if (Array.isArray(e)) {
		for (let t of e) {
			let e = Xe(t);
			if (e !== null) return e;
		}
		return null;
	}
	let t = A(e);
	return t ? (j(t.id) ?? j(t.value)) === null ? null : t : null;
}
function Ze(e, t = null, n = null) {
	let r = Array.isArray(e.items) ? e.items : [];
	for (let e of r) {
		let r = A(e);
		if (!r) continue;
		let i = Array.isArray(r.items) ? r.items : [];
		for (let e of i) {
			let r = A(e);
			if (!r) continue;
			let i = j(r.motivation);
			if (i !== null && i !== "painting") continue;
			let a = Xe(r.body);
			if (a !== null) return {
				url: j(a.id) ?? j(a.value) ?? "",
				region: Le(r.target, t, n).region,
				type: j(a.type),
				format: j(a.format),
				label: Re(r.label) || Re(a.label) || null,
				accessibilitySummary: Re(r.accessibilitySummary) || Re(a.accessibilitySummary) || null,
				credit: Je(r) ?? qe(a),
				thumbnail: at(a.thumbnail),
				duration: M(a.duration),
				start: M(a.start),
				end: M(a.end),
				subtitles: Ye(r.body)
			};
		}
	}
	return null;
}
function Qe(e) {
	let t = A(e);
	if (!t) return null;
	let n = Array.isArray(t.features) ? t.features : [];
	for (let e of n) {
		let t = $e(e);
		if (t !== null) return t;
	}
	return null;
}
function $e(e) {
	let t = A(e);
	if (!t) return null;
	let n = A(t.geometry);
	if (!n || j(n.type) !== "Point") return null;
	let r = Array.isArray(n.coordinates) ? n.coordinates : [], i = M(r[0]), a = M(r[1]);
	if (i === null || a === null) return null;
	let o = {
		lat: a,
		lon: i
	}, s = A(t.properties);
	if (s) {
		let e = o;
		for (let t of Oe) {
			let n = s[t];
			n != null && n !== "" && (e[t] = n);
		}
	}
	return o;
}
function et(e) {
	let t = A(e);
	if (!t) return null;
	let n = Array.isArray(t.features) ? t.features : [];
	for (let e of n) {
		let t = A(e);
		if (!t) continue;
		let n = A(t.geometry), r = n ? j(n.type) : null;
		if (r !== "Polygon" && r !== "MultiPolygon") continue;
		let i = [];
		tt(n?.coordinates, i, 0);
		let a = i.map((e) => e[0]).filter((e) => e !== void 0), o = i.map((e) => e[1]).filter((e) => e !== void 0);
		if (a.length !== 0 && o.length !== 0) return [
			Math.min(...a),
			Math.min(...o),
			Math.max(...a),
			Math.max(...o)
		];
	}
	return null;
}
function tt(e, t, n) {
	if (!(n > 4 || !Array.isArray(e))) {
		if (e.length >= 2 && typeof e[0] == "number" && typeof e[1] == "number") {
			let n = M(e[0]), r = M(e[1]);
			n !== null && r !== null && t.push([n, r]);
			return;
		}
		for (let r of e) tt(r, t, n + 1);
	}
}
function nt(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set(), i = (e, a) => {
		for (let o of Array.isArray(e) ? e : [e]) {
			let e = j(o);
			if (e !== null) {
				r.has(e) || (r.add(e), t.push(e), a !== null && n.set(e, a));
				continue;
			}
			let s = A(o);
			if (!s) continue;
			if (j(s.type) !== "Range") {
				let e = j(s.id);
				e !== null && !r.has(e) && (r.add(e), t.push(e), a !== null && n.set(e, a));
				continue;
			}
			let c = Re(s.label), l = c !== "" && s.start === void 0 ? a ?? c : a;
			i(s.items, l);
		}
	};
	return i(e, null), {
		order: t,
		groups: n
	};
}
function rt(e, t) {
	let n = Array.isArray(e) ? e : [e], r = [];
	for (let e of n) {
		let n = A(e);
		if (!n) continue;
		let i = Re(n.label) || j(n.id) || "";
		i !== "" && r.push(t === "" ? i : `${t}: ${i}`);
	}
	return r.join(", ");
}
function it(e) {
	let t = Array.isArray(e) ? e : [e], n = [];
	for (let e of t) {
		let t = A(e);
		if (!t) continue;
		let r = Re(t.label), i = Re(t.value);
		(r !== "" || i !== "") && n.push({
			label: r,
			value: i
		});
	}
	return n;
}
function at(e) {
	let t = Array.isArray(e) ? e : [e];
	for (let e of t) {
		let t = j(A(e)?.id);
		if (t !== null) return t;
	}
	return null;
}
function ot(e) {
	let t = A(e);
	if (!t) return null;
	let n = Array.isArray(t.body) ? t.body : [t.body], r = null, i = null;
	for (let e of n) {
		let t = A(e);
		if (t && (r === null && dt(t) && (r = j(t.id)), i === null)) {
			let e = j(t.type), n = j(t.value);
			n !== null && (e === "Color" || e === null) && (i = n);
		}
	}
	let a = {};
	return r !== null && (a.url = r), i !== null && (a.color = i), Object.keys(a).length > 0 ? a : null;
}
function st(e, t, n = null) {
	let r = A(e);
	if (!r) return null;
	let i = {}, a = je(r.label, n), o = je(r.summary, n), s = a.value, c = o.value;
	(s !== "" || c !== "") && (i.text = {}, s !== "" && (i.text.headline = s), c !== "" && (i.text.text = c));
	let l = a.language ?? o.language;
	l !== null && (i.language = l);
	let u = Ze(r, M(r.width), M(r.height)), d = u?.label ?? null, f = u?.credit ?? null, p = u?.accessibilitySummary ?? null, m = j(N(r, "mediaSrcset")), h = j(N(r, "mediaSizes")), g = u?.thumbnail ?? at(r.thumbnail);
	if (u !== null || d !== null || f !== null || p !== null || m !== null || h !== null || g !== null) {
		let e = {};
		u !== null && (e.url = u.url), d !== null && (e.caption = d), f !== null && (e.credit = f), p !== null && (e.alt = p), m !== null && (e.srcset = m), h !== null && (e.sizes = h), g !== null && (e.thumb = g), u?.subtitles != null && (e.subtitles = u.subtitles), i.media = e;
	}
	let _ = Qe(r.navPlace) ?? $e(t);
	_ !== null && (i.location = _);
	let v = u?.region ?? null;
	v !== null && (i.location = {
		...i.location ?? {},
		region: v
	});
	let y = j(r["storymap:type"]);
	y !== null && (i.type = y);
	let b = r.navDate, x = j(b) ?? Re(b), S = A(b);
	x !== null && x !== "" ? i.date = x : S !== null && (i.date = S);
	let C = ot(r.background);
	return C !== null && (i.background = C), i;
}
var ct = /* @__PURE__ */ new Set([
	"commenting",
	"tagging",
	"classifying",
	"describing"
]);
function lt(e) {
	return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function ut(e, t) {
	if (t.trim() === "") return null;
	if (e !== null && /^text\/html/i.test(e)) return t;
	let n = t.split(/\n\s*\n/).map((e) => e.trim()).filter((e) => e !== "");
	return n.length === 0 ? null : n.map((e) => `<p>${lt(e)}</p>`).join("");
}
function dt(e) {
	if (j(e.id) === null) return !1;
	let t = j(e.type);
	return t === null || [
		"Image",
		"Sound",
		"Video",
		"Dataset",
		"Model"
	].includes(t);
}
function ft(e, t, n) {
	let r = A(e);
	if (!r || !(Array.isArray(r.motivation) ? r.motivation : [r.motivation]).some((e) => {
		let t = j(e);
		return t !== null && ct.has(t);
	})) return null;
	let i = Le(r.target, t, n);
	if (i.region === null) return null;
	let a = Array.isArray(r.body) ? r.body : [r.body], o = null, s = null;
	for (let e of a) {
		let t = A(e);
		if (t) {
			if (dt(t)) {
				if (s === null) {
					let e = j(t.id);
					if (e !== null) {
						let n = Re(r.label) || Re(t.label), i = Je(r) ?? qe(t), a = Re(r.accessibilitySummary) || Re(t.accessibilitySummary);
						s = {
							url: e,
							...n === "" ? {} : { caption: n },
							...i === null ? {} : { credit: i },
							...a === "" ? {} : { alt: a },
							...at(t.thumbnail) === null ? {} : { thumb: at(t.thumbnail) }
						};
					}
				}
				continue;
			}
			if (o === null) {
				let e = j(t.value);
				e !== null && (o = ut(j(t.format), e));
			}
		}
	}
	if (o === null && s === null) return null;
	let c = Re(r.label), l = { location: { region: i.region } };
	return (o !== null || c !== "") && (l.text = {
		...o === null ? {} : { text: o },
		...c === "" ? {} : { headline: c }
	}), s !== null && (l.media = s), l;
}
function pt(e) {
	let t = A(e);
	if (!t) return [];
	let n = M(t.width), r = M(t.height), i = [], a = Array.isArray(t.items) ? t.items : [];
	for (let e of a) {
		let t = A(e);
		if (t && Array.isArray(t.items)) for (let e of t.items) {
			let t = ft(e, n, r);
			t !== null && i.push(t);
		}
	}
	return i;
}
function mt(e) {
	let t = A(e);
	if (!t) return [];
	let n = Array.isArray(t.seeAlso) ? t.seeAlso : [t.seeAlso], r = [];
	for (let e of n) {
		let t = A(e);
		if (!t) continue;
		let n = j(t.id) ?? j(t);
		n !== null && r.push({
			id: n,
			type: j(t.type) ?? "unknown"
		});
	}
	return r;
}
function ht(e) {
	let t = A(e);
	if (!t) return [];
	let n = /* @__PURE__ */ new Set(), r = [], i = (e) => {
		n.has(e.id) || (n.add(e.id), r.push(e));
	};
	for (let e of mt(t)) i(e);
	let a = Array.isArray(t.items) ? t.items : [];
	for (let e of a) for (let t of mt(e)) i(t);
	return r;
}
function gt(e) {
	let t = j(e);
	if (t !== null) {
		let e = t.indexOf("#");
		return e === -1 ? t : t.slice(0, e);
	}
	let n = A(e);
	return n ? n.source === void 0 ? j(n.id) : j(n.source) ?? j(A(n.source)?.id) : null;
}
function _t(e, t) {
	let n = A(e);
	if (!n) return;
	let r = gt(n.target);
	if (r === null) return;
	let i = t.get(r);
	i === void 0 ? t.set(r, [e]) : i.push(e);
}
function vt(e, t) {
	let n = Array.isArray(e.items) ? e.items : [];
	for (let e of n) _t(e, t);
}
function yt(e) {
	let t = /* @__PURE__ */ new Map(), n = [], r = A(e);
	if (!r) return {
		byCanvas: t,
		pages: n
	};
	let i = j(r.type);
	if (i === "AnnotationPage") {
		vt(r, t);
		let e = j(r.id);
		return e !== null && n.push(e), {
			byCanvas: t,
			pages: n
		};
	}
	if (i === "AnnotationCollection") {
		let e = Array.isArray(r.items) ? r.items : [];
		for (let r of e) {
			let e = A(r);
			if (!e) continue;
			let i = j(e.type);
			if (e.items === void 0 && (i === "AnnotationPage" || i === "AnnotationCollection") && j(e.id) !== null) {
				n.push(j(e.id));
				continue;
			}
			e.items === void 0 ? _t(e, t) : vt(e, t);
		}
		return {
			byCanvas: t,
			pages: n
		};
	}
	return {
		byCanvas: t,
		pages: n
	};
}
var bt = /* @__PURE__ */ new Map();
async function xt(e, t = {}) {
	let n = {
		stops: /* @__PURE__ */ new Map(),
		searchService: null,
		failed: []
	}, r = A(e);
	if (!r) return n;
	let i = t.fetchImpl ?? fetch, a = Array.isArray(r.items) ? r.items : [], o = ht(r), s = async (e, t) => {
		let r = St(t, a);
		if (r === null) return;
		let i = pt({
			...A(r),
			items: [{
				type: "AnnotationPage",
				items: e
			}]
		});
		if (i.length === 0) return;
		let o = n.stops.get(t);
		o === void 0 ? n.stops.set(t, i) : o.push(...i);
	};
	return await Promise.all(o.map(async (e) => {
		if (e.type === "SearchService1") {
			n.searchService = e.id;
			return;
		}
		if (e.type !== "AnnotationCollection" && e.type !== "AnnotationPage" && e.type !== "unknown") return;
		let t = await Ct(e, i, n);
		if (t !== null) {
			for (let [e, n] of t.byCanvas) await s(n, e);
			for (let e of t.pages) {
				let t = await Ct({
					id: e,
					type: "AnnotationPage"
				}, i, n);
				if (t !== null) for (let [e, n] of t.byCanvas) await s(n, e);
			}
		}
	})), n;
}
function St(e, t) {
	for (let n of t) {
		let t = A(n);
		if (t !== null && j(t.id) === e) return t;
	}
	return null;
}
async function Ct(e, t, n) {
	let r = `${e.type} ${e.id}`, i = bt.get(r);
	i === void 0 && (i = t(e.id, { headers: { Accept: "application/ld+json, application/json" } }).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.json();
	}).catch((e) => {
		throw bt.delete(r), e;
	}), bt.set(r, i));
	try {
		return yt(await i);
	} catch (t) {
		return n.failed.push(e.id), console.warn(`StoryMapJS: the seeAlso target could not be read: ${e.id}`, t instanceof Error ? t.message : t), null;
	}
}
function wt(e) {
	let t = { slides: [] }, n = A(e);
	if (!n) return t;
	if (He(n)) return Ue(n);
	let r = Re(n.label);
	r !== "" && (t.title = r);
	let i = j(n.id), a = Ke(n);
	a && Tt(t, a);
	let o = kt(n);
	if (o.length > 0 && (t.overlays = [...t.overlays ?? [], ...o]), t.map_type === "iiif") {
		let e = We(n);
		e !== null && (t.iiif = {
			url: e,
			attribution: ""
		});
	}
	let s = [
		Be(ze(n.requiredStatement)),
		rt(n.provider, "Provider"),
		j(n.rights) === null ? "" : `Licence: ${j(n.rights)}`,
		rt(n.homepage, "")
	].filter((e) => e !== "").join(" · ");
	if (s !== "") {
		let e = t.iiif ?? {};
		e.attribution = s, e.url === void 0 && (e.url = ""), t.iiif = e;
	}
	let c = j(A(n.logo)?.id);
	c !== null && (t.logo = c);
	let l = it(n.metadata);
	l.length > 0 && (t.metadata = l);
	let u = ht(n);
	u.length > 0 && (t.see_also = u);
	let d = Array.isArray(n.items) ? n.items : [], f = A(n.navPlace), p = f && Array.isArray(f.features) ? f.features : [], m = nt(n.structures), h = /* @__PURE__ */ new Map();
	for (let [e, t] of m.order.entries()) h.set(t, e);
	let g = d.map((e, t) => t);
	g.sort((e, t) => {
		let n = h.get(j(A(d[e])?.id) ?? ""), r = h.get(j(A(d[t])?.id) ?? "");
		return n === void 0 && r === void 0 ? e - t : n === void 0 ? 1 : r === void 0 ? -1 : n - r;
	});
	for (let e of g) {
		let r = j(A(d[e])?.id), a = st(d[e], p[e], j(t.language) ?? null);
		if (a !== null) {
			if (a.uniqueid = r ?? i ?? "", r !== null) {
				let e = m.groups.get(r);
				e !== void 0 && (a.group = e);
			}
			t.slides.push(a);
		}
		for (let n of pt(d[e])) r && (n.uniqueid = `${r}#${t.slides.length}`), t.slides.push(n);
		if (t.map_bbox === void 0) {
			let r = A(d[e]), i = (r ? et(r.navPlace) : null) ?? et(n.navPlace);
			i !== null && (t.map_bbox = i);
		}
	}
	return t;
}
function Tt(e, t) {
	let n = j(N(t, "basemap"));
	if (n !== null && n !== "") e.map_type = n;
	else {
		let n = Ge(t);
		n !== null && (e.map_type = Array.isArray(n.tiles) ? n.tiles[0] : n.tiles, e.tilejson = n);
	}
	let r = ke(N(t, "mapAsImage"));
	r !== null && (e.map_as_image = r);
	let i = j(N(t, "mapAccessToken"));
	i !== null && (e.map_access_token = i);
	let a = j(N(t, "mapBackgroundColor"));
	a !== null && (e.map_background_color = a);
	let o = A(N(t, "mapCenterOffset"));
	if (o) {
		let t = M(o.left), n = M(o.top);
		t !== null && n !== null && (e.map_center_offset = {
			left: t,
			top: n
		});
	}
	let s = j(N(t, "fontCss"));
	s !== null && (e.font_css = s);
	let c = ke(N(t, "callToAction"));
	c !== null && (e.call_to_action = c);
	let l = j(N(t, "callToActionText"));
	l !== null && (e.call_to_action_text = l);
	let u = M(N(t, "startAtSlide"));
	u !== null && (e.start_at_slide = u);
	let d = j(N(t, "language"));
	d !== null && (e.language = d);
	let f = ke(N(t, "calculateZoom"));
	f !== null && (e.calculate_zoom = f);
	let p = ke(N(t, "lineFollowsPath"));
	p !== null && (e.line_follows_path = p);
	let m = ke(N(t, "showLines"));
	m !== null && (e.show_lines = m);
	let h = ke(N(t, "showHistoryLine"));
	h !== null && (e.show_history_line = h);
	let g = j(N(t, "lineColor"));
	g !== null && (e.line_color = g);
	let _ = j(N(t, "lineColorInactive"));
	_ !== null && (e.line_color_inactive = _);
	let v = M(N(t, "lineWeight"));
	v !== null && (e.line_weight = v);
	let y = M(N(t, "lineOpacity"));
	y !== null && (e.line_opacity = y);
	let b = j(N(t, "lineDash"));
	b !== null && (e.line_dash = b);
	let x = j(N(t, "lineJoin"));
	x !== null && (e.line_join = x);
	let S = ke(N(t, "useCustomMarkers"));
	S !== null && (e.use_custom_markers = S);
	let C = j(N(t, "mapArea"));
	(C === "full" || C === "left") && (e.map_area = C);
	let w = Et(N(t, "overviewExtent"));
	w !== null && (e.overview_extent = w);
	let T = ke(N(t, "keyboard"));
	T !== null && (e.keyboard = T);
	let E = Ot(N(t, "overlays"));
	E.length > 0 && (e.overlays = E);
}
function Et(e) {
	if (!Array.isArray(e) || e.length !== 4 || !e.every((e) => typeof e == "number" && Number.isFinite(e))) return null;
	let [t, n, r, i] = e;
	return r <= t || i <= n ? null : [
		t,
		n,
		r,
		i
	];
}
function Dt(e, t) {
	let n = M(e.opacity);
	n !== null && (t.opacity = n);
	let r = ke(e.visible);
	r !== null && (t.visible = r);
	let i = j(e.attribution);
	i !== null && (t.attribution = i);
	let a = j(e.className);
	a !== null && (t.className = a);
	let o = j(e.blendMode);
	o !== null && (t.blendMode = o);
	let s = Et(e.extent);
	s !== null && (t.extent = s);
}
function Ot(e) {
	if (!Array.isArray(e)) return [];
	let t = [];
	for (let n of e) {
		let e = A(n);
		if (!e) continue;
		let r = j(e.map_type);
		if (r === null || r === "") continue;
		let i = { map_type: r };
		Dt(e, i), t.push(i);
	}
	return t;
}
function kt(e) {
	let t = [], n = Array.isArray(e.items) ? e.items : [];
	for (let e of n) {
		let n = A(e);
		if (!n) continue;
		let r = Array.isArray(n.items) ? n.items : [];
		for (let e of r) {
			let n = A(e);
			if (!n) continue;
			let r = Array.isArray(n.items) ? n.items : [];
			for (let e of r) {
				let n = A(e);
				if (!n || !(Array.isArray(n.motivation) ? n.motivation : [n.motivation]).some((e) => j(e) === "georeferencing")) continue;
				let r = A(n.target);
				if (!r) continue;
				let i = j(r.id);
				if (i === null) continue;
				let a = M(r.width), o = M(r.height);
				if (a === null || o === null || a <= 0 || o <= 0) continue;
				let s = A(n.body);
				if (!s || ye(s) === null) continue;
				let c = { georeference: {
					url: i,
					width: a,
					height: o,
					body: s
				} }, l = Be(ze(n.requiredStatement));
				l !== "" && (c.attribution = l), t.push(c);
			}
		}
	}
	return t;
}
//#endregion
//#region src/language/Language.ts
var At = {
	"./locale/be.json": { default: {
		name: "Беларуская",
		lang: "be",
		messages: {
			loading: "Загрузка",
			wikipedia: "Вікіпедыя",
			start: "Start Exploring",
			error: "Памылка загрузкі",
			consent_start_title: "Знешні кантэнт",
			consent_start_message: "Гэтая гісторыя загружае кантэнт з знешніх сэрвісаў. Выберыце, якія дазволены.",
			consent_allow_all: "Дазволіць усе",
			consent_decline_all: "Адхіліць усе",
			consent_message: "Загрузіць змесціва з {service}?",
			consent_allow: "Дазволіць",
			consent_deny: "Адмовіць",
			consent_blocked: "Змесціва з {service} заблакіравана.",
			consent_service_tiles: "тайлаў карты",
			consent_service_fonts: "веб-шрыфтаў"
		},
		buttons: {
			map_overview: "Прагляд мапы",
			overview: "Прагляд",
			backtostart: "Вярнуцца ў пачатак",
			collapse_toggle: "Схаваць мапу",
			uncollapse_toggle: "Паказаць мапу",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Поўны экран",
			exit_fullscreen: "Выхад з поўнаэкранага рэжыму"
		},
		direction: "ltr"
	} },
	"./locale/bg.json": { default: {
		name: "Български",
		lang: "bg",
		messages: {
			loading: "Зареждане",
			wikipedia: "От Уикипедия, свободната енциклопедия",
			start: "Започнете да разглеждате",
			error: "Грешка при зареждане",
			consent_start_title: "Външно съдържание",
			consent_start_message: "Тази история зарежда съдържание от външни услуги. Изберете кои са разрешени.",
			consent_allow_all: "Разреши всички",
			consent_decline_all: "Отхвърли всички",
			consent_message: "Да се зареди съдържание от {service}?",
			consent_allow: "Разреши",
			consent_deny: "Откажи",
			consent_blocked: "Съдържанието от {service} е блокирано.",
			consent_service_tiles: "тайли на картата",
			consent_service_fonts: "уеб шрифтове"
		},
		buttons: {
			map_overview: "Преглед на картата",
			overview: "Преглед",
			backtostart: "Към началото",
			collapse_toggle: "Скриване на картата",
			uncollapse_toggle: "Показване на картата",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Цял екран",
			exit_fullscreen: "Изход от цял екран"
		},
		direction: "ltr"
	} },
	"./locale/cs.json": { default: {
		name: "Čeština",
		lang: "cs",
		messages: {
			loading: "Nahrávání",
			wikipedia: "Z Wikipedie, svobodné encyklopedie",
			start: "Prozkoumat",
			error: "Chyba při načítání",
			consent_start_title: "Externí obsah",
			consent_start_message: "Tento příběh načítá obsah z externích služeb. Zvolte, které jsou povoleny.",
			consent_allow_all: "Povolit vše",
			consent_decline_all: "Odmítnout vše",
			consent_message: "Načíst obsah z {service}?",
			consent_allow: "Povolit",
			consent_deny: "Odmítnout",
			consent_blocked: "Obsah z {service} je zablokován.",
			consent_service_tiles: "mapových dlaždic",
			consent_service_fonts: "webových písem"
		},
		buttons: {
			map_overview: "Přehledová mapa",
			overview: "Přehled",
			backtostart: "Zpět na začátek",
			collapse_toggle: "Skrýt mapu",
			uncollapse_toggle: "Zobrazit mapu",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Celá obrazovka",
			exit_fullscreen: "Ukončit celou obrazovku"
		},
		direction: "ltr"
	} },
	"./locale/de.json": { default: {
		name: "Deutsch",
		lang: "de",
		messages: {
			loading: "Daten werden geladen",
			wikipedia: "von Wikipedia, der freien Enzyklopädie",
			start: "Explore",
			consent_start_title: "Externe Inhalte",
			consent_start_message: "Diese Story lädt Inhalte von externen Diensten. Wählen Sie, welche erlaubt sind.",
			consent_allow_all: "Alle erlauben",
			consent_decline_all: "Alle ablehnen",
			error: "Fehler beim Laden",
			consent_message: "Inhalte von {service} laden?",
			consent_allow: "Erlauben",
			consent_deny: "Ablehnen",
			consent_blocked: "Inhalte von {service} sind blockiert.",
			consent_service_tiles: "Kartenkacheln",
			consent_service_fonts: "Web-Schriften"
		},
		buttons: {
			map_overview: "Kartenübersicht",
			overview: "Kartenübersicht",
			backtostart: "Zurück zum Anfang",
			collapse_toggle: "Karte ausblenden",
			uncollapse_toggle: "Karte anzeigen",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Vollbild",
			exit_fullscreen: "Vollbild beenden"
		},
		direction: "ltr"
	} },
	"./locale/el.json": { default: {
		name: "Ελληνικά",
		lang: "el",
		messages: {
			loading: "Φόρτωση",
			wikipedia: "Από την Wikipedia, την ελεύθερη εγκυκλοπαίδεια",
			start: "Έναρξη περιήγησης",
			error: "Σφάλμα φόρτωσης",
			consent_start_title: "Εξωτερικό περιεχόμενο",
			consent_start_message: "Αυτή η ιστορία φορτώνει περιεχόμενο από εξωτερικές υπηρεσίες. Επιλέξτε ποιες επιτρέπονται.",
			consent_allow_all: "Να επιτρέπονται όλα",
			consent_decline_all: "Να απορρίπτονται όλα",
			consent_message: "Φόρτωση περιεχομένου από {service};",
			consent_allow: "Επίτρεψη",
			consent_deny: "Απόρριψη",
			consent_blocked: "Το περιεχόμενο από {service} είναι αποκλεισμένο.",
			consent_service_tiles: "πλακίδια χάρτη",
			consent_service_fonts: "διαδικτυακές γραμματοσειρές"
		},
		buttons: {
			map_overview: "Επισκόπηση χάρτη",
			overview: "Επισκόπηση",
			backtostart: "Επιστροφή στην αρχή",
			collapse_toggle: "Απόκρυψη χάρτη",
			uncollapse_toggle: "Εμφάνιση χάρτη",
			swipe_to_navigate: "Κτυπήστε ελαφρά για περιήγηση<br><span class='vco-button'>OK</span>",
			fullscreen: "Πλήρης οθόνη",
			exit_fullscreen: "Έξοδος από πλήρη οθόνη"
		},
		direction: "ltr"
	} },
	"./locale/en.json": { default: {
		name: "English",
		lang: "en",
		messages: {
			error: "Error loading",
			loading: "Loading",
			wikipedia: "From Wikipedia, the free encyclopedia",
			start: "Start Exploring",
			consent_message: "Load content from {service}?",
			consent_allow: "Allow",
			consent_deny: "Deny",
			consent_blocked: "Content from {service} is blocked.",
			consent_service_tiles: "map tiles",
			consent_service_fonts: "web fonts",
			consent_service_narration: "slide narration",
			consent_start_title: "External content",
			consent_start_message: "This story loads content from external services. Choose which ones are allowed.",
			consent_allow_all: "Allow all",
			consent_decline_all: "Decline all"
		},
		buttons: {
			map_overview: "Map Overview",
			overview: "Overview",
			backtostart: "Back To Beginning",
			collapse_toggle: "Hide Map",
			uncollapse_toggle: "Show Map",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Full Screen",
			exit_fullscreen: "Exit Full Screen"
		},
		direction: "ltr"
	} },
	"./locale/es.json": { default: {
		name: "Español",
		lang: "es",
		messages: {
			loading: "cargando",
			wikipedia: "de Wikipedia, la enciclopedia libre",
			start: "Explore",
			error: "Error de carga",
			consent_start_title: "Contenido externo",
			consent_start_message: "Esta historia carga contenido de servicios externos. Elija cuáles se permiten.",
			consent_allow_all: "Permitir todo",
			consent_decline_all: "Denegar todo",
			consent_message: "¿Cargar contenido de {service}?",
			consent_allow: "Permitir",
			consent_deny: "Denegar",
			consent_blocked: "El contenido de {service} está bloqueado.",
			consent_service_tiles: "teselas de mapa",
			consent_service_fonts: "fuentes web"
		},
		buttons: {
			map_overview: "vista general del mapa",
			overview: "vista general",
			backtostart: "volver al comienzo",
			collapse_toggle: "ocultar mapa",
			uncollapse_toggle: "mostrar mapa",
			swipe_to_navigate: "Deslizar para navegar<br><span class='vco-button'>Entendido</span>",
			fullscreen: "pantalla completa",
			exit_fullscreen: "salir de pantalla completa"
		},
		direction: "ltr"
	} },
	"./locale/et.json": { default: {
		name: "eesti",
		lang: "et",
		messages: {
			loading: "Laadib",
			wikipedia: "Vikipeedia, vaba entsüklopeedia",
			start: "Uuri",
			consent_start_title: "Väline sisu",
			consent_start_message: "See lugu laadib sisu välistest teenustest. Valige, millised on lubatud.",
			consent_allow_all: "Luba kõik",
			consent_decline_all: "Keela kõik"
		},
		buttons: {
			map_overview: "Kaardi ülevaade",
			overview: "Ülevaade",
			backtostart: "Tagasi algusesse",
			collapse_toggle: "Peida kaart",
			uncollapse_toggle: "Näita kaarti",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>"
		},
		direction: "ltr"
	} },
	"./locale/fr.json": { default: {
		name: "Français",
		lang: "fr",
		messages: {
			loading: "Chargement",
			wikipedia: "Extrait de Wikipédia, l'encyclopédie libre",
			start: "Explore",
			error: "Erreur de chargement",
			consent_start_title: "Contenu externe",
			consent_start_message: "Cette story charge du contenu de services externes. Choisissez ceux qui sont autorisés.",
			consent_allow_all: "Tout autoriser",
			consent_decline_all: "Tout refuser",
			consent_message: "Charger le contenu de {service} ?",
			consent_allow: "Autoriser",
			consent_deny: "Refuser",
			consent_blocked: "Le contenu de {service} est bloqué.",
			consent_service_tiles: "tuiles de carte",
			consent_service_fonts: "polices web"
		},
		buttons: {
			map_overview: "Vue d'ensemble de la carte",
			overview: "Vue d'ensemble",
			backtostart: "Retourner au point de départ",
			collapse_toggle: "Masquer la carte",
			uncollapse_toggle: "Afficher la carte",
			swipe_to_navigate: "Faites glisser pour naviguer<br><span class='vco-button'>OK</span>",
			fullscreen: "Plein écran",
			exit_fullscreen: "Quitter le plein écran"
		},
		direction: "ltr"
	} },
	"./locale/he.json": { default: {
		name: "עברית",
		lang: "he",
		direction: "rtl",
		messages: {
			loading: "טוען",
			wikipedia: "מתוך ויקיפדיה, האנציקלופדיה החופשית",
			start: "התחל במסע",
			error: "שגיאת טעינה",
			consent_start_title: "תוכן חיצוני",
			consent_start_message: "הסיפור הזה טוען תוכן משירותים חיצוניים. בחרו אילו מותרים.",
			consent_allow_all: "אפשר הכול",
			consent_decline_all: "דחה הכול",
			consent_message: "לטעון תוכן מ-{service}?",
			consent_allow: "לאשר",
			consent_deny: "לדחות",
			consent_blocked: "התוכן מ-{service} חסום.",
			consent_service_tiles: "אריחי מפה",
			consent_service_fonts: "גופני רשת"
		},
		buttons: {
			map_overview: "המפה במלואה",
			overview: "תצוגה מקדימה",
			backtostart: "חזור להתחלה",
			collapse_toggle: "הסתר מפה",
			uncollapse_toggle: "הצג מפה",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "מסך מלא",
			exit_fullscreen: "יציאה ממסך מלא"
		}
	} },
	"./locale/hu.json": { default: {
		name: "Magyar",
		lang: "hu",
		messages: {
			loading: "töltés",
			wikipedia: "Wikipedia",
			start: "Indítsd",
			error: "Betöltési hiba",
			consent_start_title: "Külső tartalom",
			consent_start_message: "Ez a történet külső szolgáltatásoktól tölt be tartalmat. Válassza ki, melyek engedélyezettek.",
			consent_allow_all: "Mindet engedélyez",
			consent_decline_all: "Mindet elutasít",
			consent_message: "{service} tartalmát betölteni?",
			consent_allow: "Engedélyezés",
			consent_deny: "Elutasítás",
			consent_blocked: "{service} tartalma le van tiltva.",
			consent_service_tiles: "térképcsemlék",
			consent_service_fonts: "webes betűtípusok"
		},
		buttons: {
			map_overview: "teljes térkép",
			overview: "teljes sztori",
			backtostart: "vissza az elejére",
			collapse_toggle: "összecsuk",
			uncollapse_toggle: "kinyit",
			swipe_to_navigate: "Húzd el a navigációhoz<br><span class='vco-button'>OK</span>",
			fullscreen: "teljes képernyő",
			exit_fullscreen: "kilépés a teljes képernyőből"
		},
		direction: "ltr"
	} },
	"./locale/is.json": { default: {
		name: "Icelandic",
		lang: "is",
		messages: {
			loading: "Hleðsla",
			wikipedia: "Frá Wikipedia",
			start: "Hefja",
			consent_start_title: "Ytra efni",
			consent_start_message: "Þessi saga hleður efni utanaðar. Veldu hvað er leyft.",
			consent_allow_all: "Leyfa allt",
			consent_decline_all: "Hafna öllu"
		},
		buttons: {
			map_overview: "Kortayfirlit",
			overview: "Yfirlit",
			backtostart: "Hefja aftur",
			collapse_toggle: "Fela kortið",
			uncollapse_toggle: "Sýna kortið",
			swipe_to_navigate: "Strjúktu fyrir valmynd<br><span class='vco-button'>Allt í lagi</span>"
		},
		direction: "ltr"
	} },
	"./locale/it.json": { default: {
		name: "Italiano",
		lang: "it",
		messages: {
			loading: "caricare",
			wikipedia: "da Wikipedia, la enciclopedia libera",
			start: "Explore",
			error: "Errore di caricamento",
			consent_start_title: "Contenuti esterni",
			consent_start_message: "Questa storia carica contenuti da servizi esterni. Scegli quali sono consentiti.",
			consent_allow_all: "Consenti tutto",
			consent_decline_all: "Nega tutto",
			consent_message: "Caricare i contenuti da {service}?",
			consent_allow: "Consenti",
			consent_deny: "Nega",
			consent_blocked: "I contenuti da {service} sono bloccati.",
			consent_service_tiles: "tile della mappa",
			consent_service_fonts: "font web"
		},
		buttons: {
			map_overview: "vista generale della mappa",
			overview: "vista generale",
			backtostart: "tornare all' inizio",
			collapse_toggle: "nascondere mappa",
			uncollapse_toggle: "mostrare mappa",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "schermo intero",
			exit_fullscreen: "esci da schermo intero"
		},
		direction: "ltr"
	} },
	"./locale/jp.json": { default: {
		name: "日本語",
		lang: "jp",
		messages: {
			loading: "ローディング",
			wikipedia: "フリー百科事典ウィキペディア（Wikipedia）から",
			start: "Explore",
			error: "読み込みエラー",
			consent_start_title: "外部コンテンツ",
			consent_start_message: "このストーリーは外部サービスからコンテンツを読み込みます。許可するものを選択してください。",
			consent_allow_all: "すべて許可",
			consent_decline_all: "すべて拒否",
			consent_message: "{service}のコンテンツを読み込みますか？",
			consent_allow: "許可",
			consent_deny: "拒否",
			consent_blocked: "{service}のコンテンツはブロックされています。",
			consent_service_tiles: "地図タイル",
			consent_service_fonts: "ウェブフォント"
		},
		buttons: {
			map_overview: "概観地図",
			overview: "概観",
			backtostart: "初めに戻る",
			collapse_toggle: "地図を隠す",
			uncollapse_toggle: "地図を表示",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "全画面",
			exit_fullscreen: "全画面を終了"
		},
		direction: "ltr"
	} },
	"./locale/ko.json": { default: {
		name: "한국어",
		lang: "ko",
		messages: {
			loading: "불러오는중",
			wikipedia: "위키피디아",
			start: "시작하기",
			error: "불러오기 오류",
			consent_start_title: "외부 콘텐츠",
			consent_start_message: "이 스토리는 외부 서비스에서 콘텐츠를 불러옵니다. 허용할 서비스를 선택하세요.",
			consent_allow_all: "모두 허용",
			consent_decline_all: "모두 거부",
			consent_message: "{service}의 콘텐츠를 불러올까요?",
			consent_allow: "허용",
			consent_deny: "거부",
			consent_blocked: "{service}의 콘텐츠가 차단되었습니다.",
			consent_service_tiles: "지도 타일",
			consent_service_fonts: "웹 글꼴"
		},
		buttons: {
			map_overview: "지도 전체보기",
			overview: "전체보기",
			backtostart: "되돌아가기",
			collapse_toggle: "숨기기",
			uncollapse_toggle: "보이기",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "전체 화면",
			exit_fullscreen: "전체 화면 종료"
		},
		direction: "ltr"
	} },
	"./locale/nl.json": { default: {
		name: "Nederlands",
		lang: "nl",
		messages: {
			loading: "Laden",
			wikipedia: "Van Wikipedia, de gratis encyclopedie",
			start: "Start Exploring",
			error: "Laden mislukt",
			consent_start_title: "Externe inhoud",
			consent_start_message: "Deze story laadt inhoud van externe diensten. Kies welke zijn toegestaan.",
			consent_allow_all: "Alles toestaan",
			consent_decline_all: "Alles weigeren",
			consent_message: "Inhoud van {service} laden?",
			consent_allow: "Toestaan",
			consent_deny: "Weigeren",
			consent_blocked: "Inhoud van {service} is geblokkeerd.",
			consent_service_tiles: "kaarttegels",
			consent_service_fonts: "webletters"
		},
		buttons: {
			map_overview: "Kaart overzicht",
			overview: "Overzicht",
			backtostart: "Terug naar begin",
			collapse_toggle: "Verberg kaart",
			uncollapse_toggle: "Toon kaart",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Volledig scherm",
			exit_fullscreen: "Volledig scherm afsluiten"
		},
		direction: "ltr"
	} },
	"./locale/nn.json": { default: {
		name: "Norsk nynorsk",
		lang: "nn",
		messages: {
			loading: "Lastar inn",
			wikipedia: "Frå Wikipedia, det frie oppslagsverket",
			start: "Utforsk",
			consent_start_title: "Eksternt innhald",
			consent_start_message: "Denne historia lastar innhald frå eksterne tenester. Vel kva som er tillate.",
			consent_allow_all: "Tillat alt",
			consent_decline_all: "Avslå alt"
		},
		buttons: {
			map_overview: "Sjå oversiktskart",
			overview: "Oversikt",
			backtostart: "Til starten",
			collapse_toggle: "Gøym kartet",
			uncollapse_toggle: "Vis kartet",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>"
		},
		direction: "ltr"
	} },
	"./locale/no.json": { default: {
		name: "Norsk",
		lang: "no",
		messages: {
			loading: "Laster inn",
			wikipedia: "fra Wikipedia, den frie encyklopedi",
			start: "Explore",
			error: "Feil under lasting",
			consent_start_title: "Eksternt innhold",
			consent_start_message: "Denne historien laster innhold fra eksterne tjenester. Velg hvilke som er tillatt.",
			consent_allow_all: "Tillat alt",
			consent_decline_all: "Avslå alt",
			consent_message: "Last innhold fra {service}?",
			consent_allow: "Tillat",
			consent_deny: "Avslå",
			consent_blocked: "Innhold fra {service} er blokkert.",
			consent_service_tiles: "kartfliser",
			consent_service_fonts: "nettbaserte fonter"
		},
		buttons: {
			map_overview: "Se oversiktskart",
			overview: "Se oversiktskart",
			backtostart: "Til begynnelsen",
			collapse_toggle: "Skjul kartet",
			uncollapse_toggle: "Vis kartet",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Fullskjerm",
			exit_fullscreen: "Avslutt fullskjerm"
		},
		direction: "ltr"
	} },
	"./locale/pl.json": { default: {
		name: "Polski",
		lang: "pl",
		messages: {
			loading: "Wczytuję",
			wikipedia: "z Wikipedii, wolnej encyklopedii",
			start: "Explore",
			error: "Błąd ładowania",
			consent_start_title: "Treści zewnętrzne",
			consent_start_message: "Ta historia pobiera treści z usług zewnętrznych. Wybierz, które są dozwolone.",
			consent_allow_all: "Zezwól na wszystko",
			consent_decline_all: "Odrzuć wszystko",
			consent_message: "Wczytać zawartość z {service}?",
			consent_allow: "Zezwól",
			consent_deny: "Odrzuć",
			consent_blocked: "Zawartość z {service} jest zablokowana.",
			consent_service_tiles: "kafelków mapy",
			consent_service_fonts: "czcionek internetowych"
		},
		buttons: {
			map_overview: "Przeglądaj mapę",
			overview: "Przeglądaj",
			backtostart: "Powrót",
			collapse_toggle: "Ukryj mapę",
			uncollapse_toggle: "Pokaż mapę",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Pełny ekran",
			exit_fullscreen: "Wyjdź z pełnego ekranu"
		},
		direction: "ltr"
	} },
	"./locale/pt.json": { default: {
		name: "Português",
		lang: "pt",
		messages: {
			loading: "carregando",
			wikipedia: "de Wikipedia, a enciclopédia livre",
			start: "início",
			error: "Erro ao carregar",
			consent_start_title: "Conteúdo externo",
			consent_start_message: "Esta história carrega conteúdo de serviços externos. Escolha quais são permitidos.",
			consent_allow_all: "Permitir tudo",
			consent_decline_all: "Recusar tudo",
			consent_message: "Carregar conteúdo de {service}?",
			consent_allow: "Permitir",
			consent_deny: "Recusar",
			consent_blocked: "O conteúdo de {service} está bloqueado.",
			consent_service_tiles: "tiles do mapa",
			consent_service_fonts: "fontes da web"
		},
		buttons: {
			map_overview: "vista geral do mapa",
			overview: "vista geral",
			backtostart: "voltar ao início",
			collapse_toggle: "ocultar mapa",
			uncollapse_toggle: "mostrar mapa",
			swipe_to_navigate: "Deslize para navegar<br><span class='vco-button'>OK</span>",
			fullscreen: "tela cheia",
			exit_fullscreen: "sair da tela cheia"
		},
		direction: "ltr"
	} },
	"./locale/ru.json": { default: {
		name: "Русский",
		lang: "ru",
		messages: {
			loading: "Загрузка",
			wikipedia: "Из Википедии, свободной энциклопедии",
			start: "Начать просмотр",
			error: "Ошибка загрузки",
			consent_start_title: "Внешний контент",
			consent_start_message: "Эта история загружает контент из внешних сервисов. Выберите, какие разрешены.",
			consent_allow_all: "Разрешить все",
			consent_decline_all: "Отклонить все",
			consent_message: "Загрузить содержимое из {service}?",
			consent_allow: "Разрешить",
			consent_deny: "Отклонить",
			consent_blocked: "Содержимое из {service} заблокировано.",
			consent_service_tiles: "тайлов карты",
			consent_service_fonts: "веб-шрифтов"
		},
		buttons: {
			map_overview: "Просмотр карты",
			overview: "Обзор",
			backtostart: "К началу",
			collapse_toggle: "Скрыть карту",
			uncollapse_toggle: "Показать карту",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Полный экран",
			exit_fullscreen: "Выйти из полноэкранного режима"
		},
		direction: "ltr"
	} },
	"./locale/sk.json": { default: {
		name: "Slovenčina",
		lang: "sk",
		messages: {
			loading: "Nahrávanie",
			wikipedia: "Z Wikipédie, slobodnej encyklopédie",
			start: "Preskúmať",
			error: "Chyba pri načítavaní",
			consent_start_title: "Externý obsah",
			consent_start_message: "Tento príbeh načítava obsah z externých služieb. Vyberte, ktoré sú povolené.",
			consent_allow_all: "Povoliť všetko",
			consent_decline_all: "Odmietnuť všetko",
			consent_message: "Načítať obsah z {service}?",
			consent_allow: "Povoliť",
			consent_deny: "Odmietnuť",
			consent_blocked: "Obsah z {service} je zablokovaný.",
			consent_service_tiles: "mapových dlaždíc",
			consent_service_fonts: "webových písiem"
		},
		buttons: {
			map_overview: "Prehľadová mapa",
			overview: "Prehľad",
			backtostart: "Späť na začiatok",
			collapse_toggle: "Skryť mapu",
			uncollapse_toggle: "Zobraziť mapu",
			swipe_to_navigate: "Navigujte potiahnutím prsta<br><span class='vco-button'>OK</span>",
			fullscreen: "Celá obrazovka",
			exit_fullscreen: "Ukončiť celú obrazovku"
		},
		direction: "ltr"
	} },
	"./locale/sr.json": { default: {
		name: "Srpski",
		lang: "sr",
		messages: {
			loading: "Učitavanje",
			wikipedia: "Wikipedia",
			start: "Explore",
			consent_start_title: "Спољашњи садржај",
			consent_start_message: "Ова прича учитава садржај из спољашњих сервиса. Изаберите који су дозвољени.",
			consent_allow_all: "Дозволи све",
			consent_decline_all: "Одбиј све"
		},
		buttons: {
			map_overview: "Pregled mapę",
			backtostart: "Nazad na početak",
			collapse_toggle: "Sakrij mapu",
			uncollapse_toggle: "Prikaži mapu",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>"
		},
		direction: "ltr"
	} },
	"./locale/sv.json": { default: {
		name: "Svenska",
		lang: "sv",
		messages: {
			loading: "Laddar",
			wikipedia: "Från Wikipedia, den fria encyklopedin",
			start: "Explore",
			error: "Fel vid inläsning",
			consent_start_title: "Externt innehåll",
			consent_start_message: "Den här historien laddar innehåll från externa tjänster. Välj vilka som är tillåtna.",
			consent_allow_all: "Tillåt alla",
			consent_decline_all: "Neka alla",
			consent_message: "Läsa innehåll från {service}?",
			consent_allow: "Tillåt",
			consent_deny: "Neka",
			consent_blocked: "Innehåll från {service} är blockerat.",
			consent_service_tiles: "kartbrickor",
			consent_service_fonts: "webbtypsnitt"
		},
		buttons: {
			map_overview: "Översiktskarta",
			overview: "Översikt",
			backtostart: "Tillbaka till början",
			collapse_toggle: "Göm kartan",
			uncollapse_toggle: "Visa kartan",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Helskärm",
			exit_fullscreen: "Lämna helskärm"
		},
		direction: "ltr"
	} },
	"./locale/tr.json": { default: {
		name: "Türkçe",
		lang: "tr",
		messages: {
			loading: "Yükleniyor",
			wikipedia: "Vikipedi, Özgür Ansiklopedi",
			start: "Keşfet",
			error: "Yükleme hatası",
			consent_start_title: "Dış içerik",
			consent_start_message: "Bu hikâye harici hizmetlerden içerik yükler. Hangilerine izin verildiğini seçin.",
			consent_allow_all: "Tümüne izin ver",
			consent_decline_all: "Tümünü reddet",
			consent_message: "{service} içeriği yüklensin mi?",
			consent_allow: "İzin ver",
			consent_deny: "Reddet",
			consent_blocked: "{service} içeriği engellendi.",
			consent_service_tiles: "harita karoları",
			consent_service_fonts: "web yazı tipleri"
		},
		buttons: {
			map_overview: "Genel harita",
			overview: "Genel harita",
			backtostart: "Başlangıç menüsüne dön",
			collapse_toggle: "Menüyü gizle",
			uncollapse_toggle: "Menüyü göster",
			swipe_to_navigate: "Dokun ve kaydır<br><span class='vco-button'>OK</span>",
			fullscreen: "Tam ekran",
			exit_fullscreen: "Tam ekrandan çık"
		},
		direction: "ltr"
	} },
	"./locale/uk.json": { default: {
		name: "Українська",
		lang: "uk",
		messages: {
			loading: "Завантаження",
			wikipedia: "З Вікіпедії, вільної енциклопедії",
			start: "Почати перегляд",
			error: "Помилка завантаження",
			consent_start_title: "Зовнішній контент",
			consent_start_message: "Ця історія завантажує контент із зовнішніх сервісів. Виберіть, які дозволені.",
			consent_allow_all: "Дозволити всі",
			consent_decline_all: "Відхилити всі",
			consent_message: "Завантажити вміст із {service}?",
			consent_allow: "Дозволити",
			consent_deny: "Відхилити",
			consent_blocked: "Вміст із {service} заблоковано.",
			consent_service_tiles: "тайлів карти",
			consent_service_fonts: "веб-шрифтів"
		},
		buttons: {
			map_overview: "Перегляд карти",
			overview: "Огляд",
			backtostart: "Повернутися до початку",
			collapse_toggle: "Приховати карту",
			uncollapse_toggle: "Показати карту",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "Повний екран",
			exit_fullscreen: "Вийти з повноекранного режиму"
		},
		direction: "ltr"
	} },
	"./locale/ur.json": { default: {
		name: "Urdu",
		lang: "ur",
		direction: "rtl",
		messages: {
			loading: "لوڈ ہو رہا ہے",
			wikipedia: "ویکیپیڈیا, مفت دستیاب انسائیکلوپیڈیا سے ",
			start: "دریافت شروع کی جایے ",
			consent_start_title: "بیرونی مواد",
			consent_start_message: "یہ کہانی بیرونی خدمات سے مواد لوڈ کرتی ہے۔ منتخب کریں کہ کون سی اجازت شدہ ہیں۔",
			consent_allow_all: "سب کو اجازت دیں",
			consent_decline_all: "سب کو مسترد کریں"
		},
		buttons: {
			map_overview: "نقشے کا جائزہ",
			overview: "جائزہ",
			backtostart: "واپس شروع سے",
			collapse_toggle: "نقشہ غائب",
			uncollapse_toggle: "نقشہ حاضر",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>"
		}
	} },
	"./locale/zh-cn.json": { default: {
		name: "中文",
		lang: "zh-cn",
		messages: {
			loading: "加载中",
			wikipedia: "来自维基百科，自由的百科全书",
			start: "Explore",
			error: "加载出错",
			consent_start_title: "外部内容",
			consent_start_message: "本故事从外部服务加载内容。请选择允许的服务。",
			consent_allow_all: "全部允许",
			consent_decline_all: "全部拒绝",
			consent_message: "要加载来自{service}的内容吗？",
			consent_allow: "允许",
			consent_deny: "拒绝",
			consent_blocked: "来自{service}的内容已被屏蔽。",
			consent_service_tiles: "地图图块",
			consent_service_fonts: "网络字体"
		},
		buttons: {
			map_overview: "地图总览",
			overview: "总览",
			backtostart: "回到首页",
			collapse_toggle: "隐藏地图",
			uncollapse_toggle: "显示地图",
			swipe_to_navigate: "Swipe to Navigate<br><span class='vco-button'>OK</span>",
			fullscreen: "全屏",
			exit_fullscreen: "退出全屏"
		},
		direction: "ltr"
	} },
	"./locale/zh-tw.json": { default: {
		name: "正體中文",
		lang: "zh-tw",
		messages: {
			loading: "載入中",
			wikipedia: "來自維基百科，自由的百科全書",
			start: "探索",
			error: "載入錯誤",
			consent_start_title: "外部內容",
			consent_start_message: "本故事從外部服務載入內容。請選擇允許的服務。",
			consent_allow_all: "全部允許",
			consent_decline_all: "全部拒絕",
			consent_message: "要載入來自{service}的內容嗎？",
			consent_allow: "允許",
			consent_deny: "拒絕",
			consent_blocked: "來自{service}的內容已被封鎖。",
			consent_service_tiles: "地圖圖磚",
			consent_service_fonts: "網路字型"
		},
		buttons: {
			map_overview: "地圖總覽",
			overview: "總覽",
			backtostart: "回到首頁",
			collapse_toggle: "隱藏地圖",
			uncollapse_toggle: "顯示地圖",
			swipe_to_navigate: "左右滑動以瀏覽<br><span class='vco-button'>我知道了</span>",
			fullscreen: "全螢幕",
			exit_fullscreen: "結束全螢幕"
		},
		direction: "ltr"
	} }
}, jt = At["./locale/en.json"]?.default || {}, Mt = {
	name: "English",
	lang: "en",
	direction: "ltr",
	messages: jt.messages ?? {},
	buttons: jt.buttons ?? {}
}, Nt = Mt, Pt = "en", Ft = /* @__PURE__ */ new Map();
function It(e, t) {
	let n = /* @__PURE__ */ Error(`StoryMapJS: two viewers on this page asked for different languages ("${e}" and "${t}"), but the UI strings are a single page-wide setting — the last one set would win and the other viewer would keep rendering its chrome in the wrong language. Pass the same language to every viewer on the page, or call refreshLanguage() on the surviving viewer. See docs/DEVELOPMENT.md, "Multiple instances on one page".`);
	return n.name = "StoryMapLanguageConflict", n;
}
function Lt(e) {
	return e instanceof Error && e.name === "StoryMapLanguageConflict";
}
function Rt(e, t) {
	for (let [n, r] of Ft) if (n !== t && r !== e) throw It(r, e);
	Ft.set(t, e);
}
function zt(e) {
	Ft.delete(e);
}
function Bt(e) {
	let t = {};
	for (let e in jt) t[e] = structuredClone(jt[e]);
	return Vt(t, At[`./locale/${e}.json`]?.default ?? {}), t;
}
function Vt(e, t) {
	for (let n in t) t[n] && (e[n] = typeof jt[n] == "object" && jt[n] !== null && typeof t[n] == "object" ? Object.assign({}, jt[n], t[n]) : structuredClone(t[n]));
}
function Ht(e) {
	Pt = e;
	let t = Bt(e);
	return Nt = {
		...t,
		messages: t.messages ?? Mt.messages,
		buttons: t.buttons ?? Mt.buttons
	}, Nt;
}
function Ut() {
	return Pt;
}
function Wt() {
	return typeof Nt.lang == "string" && Nt.lang !== "" ? Nt.lang : "en";
}
function Gt() {
	return Nt.direction === "rtl";
}
//#endregion
//#region src/dom/Dom.ts
var P = class {
	static get(e) {
		return typeof e == "string" ? document.getElementById(e) : e;
	}
	static create(e, t, n) {
		let r = document.createElement(e);
		return r.className = t, n && n.appendChild(r), r;
	}
	static getPosition(e) {
		let t = {
			x: 0,
			y: 0
		};
		for (; e && !isNaN(e.offsetLeft) && !isNaN(e.offsetTop);) t.x += e.offsetLeft, t.y += e.offsetTop, e = e.offsetParent;
		return t;
	}
}, Kt = "storymapjs-consent";
function qt() {
	let e = {}, t = !1;
	try {
		let n = window.localStorage.getItem(Kt);
		if (!n) return {
			state: e,
			migrated: t
		};
		let r = JSON.parse(n);
		for (let n in r) {
			if (!Object.hasOwn(r, n)) continue;
			let i = nn(n);
			i !== n && (t = !0), e[i] = r[n];
		}
	} catch {}
	return {
		state: e,
		migrated: t
	};
}
function Jt(e) {
	try {
		window.localStorage.setItem(Kt, JSON.stringify(e));
	} catch {}
}
var Yt = "map:tiles", Xt = "fonts:web", Zt = "media:";
function Qt() {
	return {
		key: Yt,
		label: cn("consent_service_tiles", "map tiles")
	};
}
function $t() {
	return {
		key: Xt,
		label: cn("consent_service_fonts", "web fonts")
	};
}
function en() {
	return {
		key: "media:narration",
		label: cn("consent_service_narration", "narration")
	};
}
function tn(e, t) {
	return {
		key: Zt + e,
		label: t || e
	};
}
function nn(e) {
	return e.includes(":") ? e : e === "map tiles" ? Yt : e === "web fonts" ? Xt : Zt + e;
}
function rn(e, t) {
	let n = P.create("button", `vco-consent-${e}`);
	return n.setAttribute("type", "button"), n.textContent = t, n;
}
function an(e, t) {
	let n = P.create("p", "vco-consent-title");
	n.textContent = e;
	let r = P.create("p", "vco-consent-message");
	return r.textContent = t, {
		title: n,
		message: r
	};
}
var on = class {
	granted = /* @__PURE__ */ new Set();
	denied = /* @__PURE__ */ new Set();
	pending = /* @__PURE__ */ new Map();
	startRows = /* @__PURE__ */ new Map();
	startDialogs = /* @__PURE__ */ new Set();
	disposed = !1;
	constructor() {
		this.restore();
	}
	restore() {
		let { state: e, migrated: t } = qt();
		for (let [t, n] of Object.entries(e)) n ? this.granted.add(t) : this.denied.add(t);
		t && this.persist();
	}
	persist() {
		let e = qt().state;
		for (let t of this.granted) e[t] = !0;
		for (let t of this.denied) e[t] = !1;
		Jt(e), this.adopt(e);
	}
	adopt(e) {
		this.granted.clear(), this.denied.clear();
		for (let [t, n] of Object.entries(e)) n ? this.granted.add(t) : this.denied.add(t);
	}
	sync() {
		this.adopt(qt().state);
	}
	decide(e, t) {
		if (!this.disposed) {
			t ? (this.granted.add(e), this.denied.delete(e)) : (this.denied.add(e), this.granted.delete(e)), this.persist();
			for (let n of this.pending.get(e) ?? []) n.el.remove(), n.resolve(t);
			this.pending.delete(e), this.startRows.get(e)?.remove(), this.startRows.delete(e);
		}
	}
	isGranted(e) {
		return this.granted.has(e);
	}
	isDenied(e) {
		return this.denied.has(e);
	}
	hasUnanswered(e) {
		return this.sync(), e.some((e) => !this.granted.has(e) && !this.denied.has(e));
	}
	requestAll(e, t) {
		if (!this.hasUnanswered(e.map((e) => e.key))) return;
		let n = e.filter((e) => !this.granted.has(e.key) && !this.denied.has(e.key)), r = Nt.messages, i = P.create("div", "vco-consent vco-consent-start"), { title: a, message: o } = an(r.consent_start_title ?? "External content", r.consent_start_message ?? ""), s = P.create("div", "vco-consent-services"), c = [], l = () => {
			this.hasUnanswered(e.map((e) => e.key)) || i.remove();
		};
		for (let e of n) {
			let t = P.create("div", "vco-consent-service"), n = P.create("span", "vco-consent-service-label");
			n.textContent = e.label;
			let i = P.create("div", "vco-consent-buttons"), a = rn("allow", r.consent_allow ?? "Allow"), o = rn("deny", r.consent_deny ?? "Deny"), u = (t) => {
				this.decide(e.key, t), a.disabled = !0, o.disabled = !0, l();
			};
			a.addEventListener("click", () => u(!0)), o.addEventListener("click", () => u(!1)), i.append(a, o), t.append(n, i), s.append(t), c.push({
				key: e.key,
				allow: a,
				deny: o
			}), this.startRows.set(e.key, t);
		}
		let u = P.create("div", "vco-consent-buttons vco-consent-start-actions"), d = rn("allow", r.consent_allow_all ?? "Allow all"), f = rn("deny", r.consent_decline_all ?? "Decline all"), p = (e) => {
			for (let t of c) this.decide(t.key, e), t.allow.disabled = !0, t.deny.disabled = !0;
			i.remove();
		};
		d.addEventListener("click", () => p(!0)), f.addEventListener("click", () => p(!1)), u.append(d, f), i.append(a, o, s, u), t.append(i), this.startDialogs.add(i);
	}
	request(e, t, n) {
		let r = e.key;
		return this.sync(), this.granted.has(r) ? Promise.resolve(!0) : this.denied.has(r) ? Promise.resolve(!1) : new Promise((i) => {
			let a = Nt.messages, o = P.create("div", "vco-consent"), s = a.consent_message ?? "Load content from {service}?", { title: c, message: l } = an(a.consent_start_title ?? "External content", s.replace("{service}", e.label) + (t ? ` (${t})` : "")), u = P.create("div", "vco-consent-buttons"), d = rn("allow", a.consent_allow ?? "Allow"), f = rn("deny", a.consent_deny ?? "Deny"), p = this.pending.get(r) ?? [];
			p.push({
				el: o,
				resolve: i
			}), this.pending.set(r, p);
			let m = (e) => this.decide(r, e);
			d.addEventListener("click", () => m(!0)), f.addEventListener("click", () => m(!1)), u.append(d, f), o.append(c, l, u), n.append(o);
		});
	}
	dispose() {
		this.disposed = !0;
		for (let e of this.startDialogs) e.remove();
		this.startDialogs.clear(), this.startRows.clear();
		for (let [, e] of this.pending) for (let t of e) t.el.remove(), t.resolve(!1);
		this.pending.clear();
	}
};
function sn(e) {
	return e?.consent_manager;
}
function cn(e, t) {
	return Nt.messages[e] ?? t;
}
//#endregion
//#region node_modules/d3-ease/src/poly.js
var ln = 3;
(function e(t) {
	t = +t;
	function n(e) {
		return e ** +t;
	}
	return n.exponent = e, n;
})(ln), (function e(t) {
	t = +t;
	function n(e) {
		return 1 - (1 - e) ** t;
	}
	return n.exponent = e, n;
})(ln);
var un = (function e(t) {
	t = +t;
	function n(e) {
		return ((e *= 2) <= 1 ? e ** +t : 2 - (2 - e) ** t) / 2;
	}
	return n.exponent = e, n;
})(ln);
//#endregion
//#region node_modules/d3-ease/src/math.js
function dn(e) {
	return (2 ** (-10 * e) - .0009765625) * 1.0009775171065494;
}
//#endregion
//#region node_modules/d3-ease/src/exp.js
function fn(e) {
	return 1 - dn(e);
}
//#endregion
//#region node_modules/bezier-easing/src/index.js
function pn(e) {
	return e;
}
var { cbrt: mn, sqrt: hn, PI: gn } = Math, _n = (e, t, n, r, i) => {
	let a = t + n * e, o = a ** 2 + r;
	if (o > 0) {
		let e = hn(o);
		return mn(a + e) + mn(a - e) - i;
	}
	let s = mn(hn(-r)), c = a ? Math.atan(hn(-o) / a) : -gn / 2, l;
	return l = n < 0 ? (a > 0 ? 2 * gn : gn) - c : i < 0 ? (a > 0 ? 2 * gn : -3 * gn) + c : (a > 0 ? 0 : gn) + c, 2 * s * Math.cos(l / 3) - i;
}, vn = (e, t, n, r) => ((t * e + 3 * n) * e + r) * e;
function yn(e, t, n, r) {
	if (!(0 <= e && e <= 1 && 0 <= n && n <= 1)) throw Error("bezier x values must be in [0, 1] range");
	if (e === t && n === r) return pn;
	let i = 6 * (3 * e - 3 * n + 1), a = 6 * (n - 2 * e), o = 3 * e, s = i * i, c = a * a, l = a / i, u = 3 * a * o / s - c * a / (s * i), d = 2 * o / i - c / s, f = d * d * d, p = 3 / i, m = 3 * t - 3 * r + 1, h = r - 2 * t, g = 3 * t, _ = i ? _n : pn;
	return function(e) {
		return e === 0 || e === 1 ? e : vn(_(e, u, p, f, l), m, h, g);
	};
}
//#endregion
//#region src/animation/easings.ts
var bn = un.exponent(5), xn = fn, Sn = yn(.42, 0, 1, 1), Cn = 0, wn = /* @__PURE__ */ new Set();
function Tn() {
	return Cn += 1, Cn;
}
function En() {
	let e = -1;
	for (let t of wn) t.interaction > e && (e = t.interaction);
	return e;
}
function Dn(e) {
	wn.add(e);
}
function On(e) {
	wn.delete(e);
}
function kn(e) {
	if (!e) return null;
	for (let t of wn) if (t.element && t.element.contains(e)) return t;
	return null;
}
function An(e) {
	let t = kn(typeof document > "u" ? null : document.activeElement);
	return t ? t === e : e.interaction === En();
}
//#endregion
//#region src/core/mixins.ts
function jn(e) {
	return class extends e {
		on(e, t, n) {
			let r = this._vco_events = this._vco_events || {};
			return r[e] = r[e] || [], r[e].push({
				action: t,
				context: n || this
			}), this;
		}
		hasEventListeners(e) {
			return !!this._vco_events?.[e]?.length;
		}
		off(e, t, n) {
			if (!this.hasEventListeners(e)) return this;
			let r = this._vco_events;
			for (let i = 0, a = r[e].length; i < a; i++) if (r[e][i].action === t && (!n || r[e][i].context === n)) return r[e].splice(i, 1), this;
			return this;
		}
		fire(e, t, n) {
			if (!this.hasEventListeners(e)) return this;
			let r = {
				type: e,
				target: n || this,
				...t
			}, i = this._vco_events[e].slice();
			for (let e of i) e.action.call(e.context || this, r);
			return this;
		}
		constructor(...e) {
			super(...e);
		}
	};
}
function Mn(e) {
	return class extends e {
		container() {
			return this._el.container;
		}
		show(e) {
			e || (this.container().style.display = "block");
		}
		hide() {
			this.container().style.display = "none";
		}
		addTo(e) {
			return e.appendChild(this.container()), this.onAdd(), this;
		}
		removeFrom(e) {
			return e.removeChild(this.container()), this.onRemove(), this;
		}
		setPosition(e, t) {
			let n = t || this.container();
			for (let t of Object.keys(e)) n.style[t] = e[t] + "px";
			return this;
		}
		onLoaded() {
			this.fire("loaded", this.data);
		}
		onAdd() {
			this.fire("added", this.data);
		}
		onRemove() {
			this.fire("removed", this.data);
		}
		constructor(...e) {
			super(...e);
		}
	};
}
//#endregion
//#region src/dom/DomEvent.ts
var Nn = /* @__PURE__ */ new WeakMap();
function Pn(e, t, n) {
	let r = e, i = (Nn.get(r) ?? 0) + 1;
	return Nn.set(r, i), "_vco_" + t + o(n) + "_" + i;
}
var F = {
	addListener: function(e, t, n, r) {
		let i = function(t) {
			return n.call(r || e, t);
		};
		e.addEventListener(t, i, !1), e[Pn(e, t, n)] = i;
	},
	removeListener: function(e, t, n, r) {
		let i = e;
		for (let r = Nn.get(e) ?? 0; r > 0; r--) {
			let a = "_vco_" + t + o(n) + "_" + r, s = i[a];
			if (s) {
				e.removeEventListener(t, s, !1), i[a] = null;
				return;
			}
		}
	},
	preventDefault: function(e) {
		e.preventDefault ? e.preventDefault() : e.returnValue = !1;
	}
}, Fn = class {
	data;
	constructor(e, t, r) {
		this._el = {
			parent: {},
			container: {},
			message_container: {},
			loading_icon: {},
			message: {}
		}, this.options = {
			width: 600,
			height: 600,
			message_class: "vco-message",
			message_icon_class: "vco-loading-icon"
		}, this.data = {}, n(this.data, e), n(this.options, t), this._el.container = P.create("div", this.options.message_class), r && (r.appendChild(this._el.container), this._el.parent = r), this.animator = {}, this._initLayout(), this._initEvents();
	}
	updateMessage(e) {
		this._updateMessage(e);
	}
	_updateMessage(e) {
		e ? this._el.message.innerHTML = e : Nt ? this._el.message.innerHTML = Nt.messages.loading : this._el.message.innerHTML = "Loading";
	}
	_onMouseClick() {
		this.fire("clicked", this.options);
	}
	_initLayout() {
		this._el.message_container = P.create("div", "vco-message-container", this._el.container), this._el.loading_icon = P.create("div", this.options.message_icon_class, this._el.message_container), this._el.message = P.create("div", "vco-message-content", this._el.message_container), this._updateMessage();
	}
	_initEvents() {
		F.addListener(this._el.container, "click", this._onMouseClick, this);
	}
	dispose() {
		F.removeListener(this._el.container, "click", this._onMouseClick, this), this._el.container.remove();
	}
}, In = class extends Mn(jn(Fn)) {
	constructor(...e) {
		super(...e);
	}
}, Ln = {
	touch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
	mobile: window.matchMedia?.("(pointer: coarse)").matches ?? !1,
	orientation: function() {
		return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
	}
}, Rn = [
	"width",
	"height",
	"frameborder",
	"allowfullscreen",
	"allow",
	"scrolling",
	"title"
], zn = "allow-scripts allow-same-origin allow-presentation allow-popups", Bn = [
	"BLOCKQUOTE",
	"P",
	"CITE",
	"EM",
	"STRONG",
	"B",
	"I",
	"U",
	"Q",
	"A",
	"BR",
	"SPAN",
	"SMALL",
	"SUP",
	"SUB",
	"FOOTER",
	"UL",
	"OL",
	"LI"
], Vn = [
	"SCRIPT",
	"STYLE",
	"TEMPLATE",
	"IFRAME",
	"FRAME",
	"OBJECT",
	"EMBED",
	"APPLET",
	"LINK",
	"META",
	"BASE",
	"SVG",
	"MATH",
	"FORM",
	"INPUT",
	"BUTTON",
	"TEXTAREA",
	"SELECT"
], Hn = Vn.filter((e) => e !== "IFRAME"), Un = /* @__PURE__ */ "P.BR.HR.DIV.SPAN.BLOCKQUOTE.PRE.CODE.KBD.SAMP.VAR.EM.STRONG.B.I.U.S.STRIKE.DEL.INS.SMALL.SUB.SUP.MARK.ABBR.CITE.Q.TIME.DFN.UL.OL.LI.DL.DT.DD.TABLE.THEAD.TBODY.TFOOT.TR.TH.TD.CAPTION.COLGROUP.COL.IMG.FIGURE.FIGCAPTION.PICTURE.SOURCE.AUDIO.VIDEO.TRACK.A".split("."), Wn = /* @__PURE__ */ "class.title.lang.dir.alt.width.height.colspan.rowspan.headers.scope.datetime.cite.start.reversed.type.value.controls.loop.muted.playsinline.preload.poster.kind.srclang.label.default.sizes.loading.decoding.open.media".split("."), Gn = [
	"href",
	"src",
	"srcset",
	"cite",
	"data",
	"poster",
	"action",
	"formaction",
	"longdesc",
	"profile",
	"background"
];
function Kn(e) {
	return new DOMParser().parseFromString(e, "text/html");
}
function qn(e) {
	if (!e) return null;
	let t = document.createElement("a");
	return t.href = e, t.protocol === "http:" || t.protocol === "https:" ? t.href : null;
}
function Jn(e) {
	let t = Kn(e).querySelector("iframe"), n = null;
	if (t ? n = qn(t.getAttribute("src")) : /^https?:\/\/\S+$/i.test(e.trim()) && (n = qn(e.trim())), !n) return null;
	let r = document.createElement("iframe");
	if (r.setAttribute("src", n), t) for (let e = 0; e < Rn.length; e++) {
		let n = t.getAttribute(Rn[e]);
		n !== null && r.setAttribute(Rn[e], n);
	}
	else r.setAttribute("width", "100%"), r.setAttribute("height", "100%"), r.setAttribute("frameborder", "0"), r.setAttribute("allowfullscreen", "");
	return r;
}
function Yn(e) {
	let t = document.createDocumentFragment();
	return $n(Kn(e).body, t, {
		tags: Bn,
		dropTags: Vn,
		attributes: [],
		rebuildIframes: !1
	}), t;
}
function Xn(e) {
	let t = document.createDocumentFragment();
	return $n(Kn(e).body, t, {
		tags: Un,
		dropTags: Hn,
		attributes: Wn,
		rebuildIframes: !0
	}), t;
}
function Zn(e) {
	return qn(e) !== null;
}
function Qn(e) {
	let t = e.split(",").map((e) => e.trim()).filter(Boolean);
	if (t.length === 0) return null;
	let n = [];
	for (let e of t) {
		let t = e.split(/\s+/)[0];
		if (!Zn(t)) return null;
		n.push(e);
	}
	return n.join(", ");
}
function $n(e, t, n) {
	for (let r = 0; r < e.childNodes.length; r++) {
		let i = e.childNodes[r];
		if (i.nodeType === 3) {
			t.appendChild(document.createTextNode(i.nodeValue ?? ""));
			continue;
		}
		if (i.nodeType !== 1) continue;
		let a = i, o = a.tagName.toUpperCase();
		if (n.dropTags.includes(o)) continue;
		if (o === "IFRAME" && n.rebuildIframes) {
			let e = Jn(a.outerHTML);
			e && (e.setAttribute("loading", "lazy"), e.setAttribute("sandbox", zn), e.setAttribute("referrerpolicy", "no-referrer"), t.appendChild(e));
			continue;
		}
		if (!n.tags.includes(o)) {
			$n(i, t, n);
			continue;
		}
		let s = document.createElement(o);
		for (let e = 0; e < a.attributes.length; e++) {
			let t = a.attributes[e], r = t.name.toLowerCase();
			if (!(r.startsWith("on") || r === "srcdoc")) {
				if (r === "srcset") {
					let e = Qn(t.value);
					e && s.setAttribute("srcset", e);
					continue;
				}
				if (Gn.includes(r)) {
					let e = qn(t.value);
					e && s.setAttribute(t.name, e);
					continue;
				}
				n.attributes.includes(r) && s.setAttribute(t.name, t.value);
			}
		}
		o === "A" && (s.hasAttribute("href") ? (s.setAttribute("target", "_blank"), s.setAttribute("rel", "noopener noreferrer")) : s.removeAttribute("target")), $n(i, s, n), t.appendChild(s);
	}
}
//#endregion
//#region src/media/Media.ts
var er = {
	youtube: "youtube",
	vimeo: "vimeo",
	dailymotion: "video",
	soundcloud: "soundcloud",
	twitter: "twitter",
	flickr: "flickr",
	image: "image",
	video: "video",
	audio: "music",
	googledocs: "doc",
	wikipedia: "wikipedia",
	iframe: "web",
	facebook: "facebook",
	documentcloud: "doc",
	juxtapose: "image",
	blockquote: "blockquote",
	website: "web"
}, tr = "web";
function nr(e) {
	return er[typeof e == "string" ? e : ""] ?? tr;
}
var rr = class {
	constructor(e, t, r) {
		this._el = {
			container: {},
			content_container: {},
			content: {},
			content_item: null,
			content_link: null,
			source_item: null,
			caption: null,
			credit: null,
			parent: {},
			link: null
		}, this.player = null, this.timer = null, this.load_timer = null, this.load_controller = null, this.message = null, this.media_id = null, this._state = {
			loaded: !1,
			show_meta: !1,
			media_loaded: !1
		}, this._disposed = !1, this.data = {
			uniqueid: null,
			url: null,
			credit: null,
			caption: null,
			link: null,
			link_target: null
		}, this.options = {
			api_key_flickr: "",
			credit_height: 0,
			caption_height: 0
		}, this.animator = {}, n(this.options, t), n(this.data, e), this._el.container = P.create("div", "vco-media"), this.data.uniqueid && (this._el.container.id = this.data.uniqueid), this._initLayout(), r && (r.appendChild(this._el.container), this._el.parent = r);
	}
	async loadMedia() {
		if (!this._state.loaded) {
			let e = sn(this.options);
			if (this.options.consent_required && e && this.options.media_type) {
				let t = tn(this.options.media_type, this.options.media_name ?? ""), n = "";
				try {
					n = new URL(this.data?.url ?? "").host;
				} catch {}
				let r = this._el.content_container ?? this._el.container;
				await e.request(t, n, r) ? this._beginLoad() : this._showBlocked();
				return;
			}
			this._beginLoad();
		}
	}
	_beginLoad() {
		this.load_timer = setTimeout(() => {
			try {
				this._loadMedia(), this._state.loaded = !0, this._updateDisplay();
			} catch (e) {
				console.log("Error loading media for ", this._media), console.log(e), this.loadErrorDisplay("Error loading media.");
			}
		}, 1200);
	}
	_showBlocked() {
		let e = this._el.content_container ?? this._el.container, t = document.createElement("div");
		t.className = "vco-consent-blocked";
		let n = this.options.media_name || this.options.media_type || "";
		t.textContent = cn("consent_blocked", "Content from {service} is blocked.").replace("{service}", n), e.append(t), this.onLoaded(!0);
	}
	_(e) {
		return Nt.messages[e] ?? e;
	}
	loadingMessage() {
		this.message?.updateMessage(this._("loading") + " " + this.options.media_name);
	}
	updateMediaDisplay(e) {
		let t = this._el.content_item;
		if (this._state.loaded && t && (this._updateMediaDisplay(e), !Ln.mobile && e !== "portrait" && (t.style.maxHeight = Number(this.options.height ?? 0) / 2 + "px"), e === "portrait" && (t.style.maxHeight = "none"), this._state.media_loaded)) {
			let e = t.offsetWidth + "px";
			this._el.credit && (this._el.credit.style.width = e), this._el.caption && (this._el.caption.style.width = e);
		}
	}
	_loadMedia() {}
	_updateMediaDisplay(e) {}
	_sizeContentItemToOptionHeight() {
		this._el.content_item && (this._el.content_item.style.height = Number(this.options.height ?? 0) + "px");
	}
	_sizeContentItemTo16x9() {
		let e = this._el.content_item;
		e && (e.style.height = _.r16_9({ w: e.offsetWidth }) + "px");
	}
	show() {}
	hide() {}
	addTo(e) {
		e.appendChild(this._el.container), this.onAdd();
	}
	removeFrom(e) {
		e.removeChild(this._el.container), this.onRemove();
	}
	dispose() {
		this._disposed || (this._disposed = !0, this.load_timer &&= (c(this.load_timer), null), this.timer &&= (c(this.timer), null), this.load_controller?.abort(), this.load_controller = null, this._disposeMedia(), this._el.container?.getAnimations?.().forEach((e) => e.cancel()), this.message?.dispose?.(), this.message = null, this._el.container?.remove());
	}
	_disposeMedia() {}
	updateDisplay(e, t, n) {
		this._updateDisplay(e, t, n);
	}
	stopMedia() {
		!this._state.loaded && this.load_timer && (c(this.load_timer), this.load_timer = null, this.load_timer = null), this.load_controller &&= (this.load_controller.abort(), null), this._stopMedia();
	}
	async loadScript(e) {
		this.load_controller?.abort();
		let t = new AbortController();
		this.load_controller = t;
		try {
			await C(e, { signal: t.signal });
		} finally {
			this.load_controller === t && (this.load_controller = null);
		}
	}
	loadErrorDisplay(e) {
		this._el.content_item && this._el.content_item.parentNode === this._el.content && this._el.content.removeChild(this._el.content_item), this._el.content_item = P.create("div", "vco-media-item vco-media-loaderror", this._el.content), this._el.content_item.appendChild(P.create("div", `vco-icon-${nr(this.options.media_type)}`));
		let t = P.create("p", "");
		t.appendChild(document.createTextNode(e)), this._el.content_item.appendChild(t), this.onLoaded(!0);
	}
	onLoaded(e) {
		this._state.loaded = !0, this.fire("loaded", this.data), this.message && this.message.hide(), e || this.showMeta(), this.updateDisplay();
	}
	onMediaLoaded(e) {
		this._state.media_loaded = !0, this.fire("media_loaded", this.data);
		let t = (this._el.content_item?.offsetWidth ?? 0) + "px";
		this._el.credit && (this._el.credit.style.width = t), this._el.caption && (this._el.caption.style.width = t);
	}
	showMeta() {
		this._state.show_meta = !0;
		let e = this._credit();
		e && e !== "" && !this._el.credit && (this._el.credit = P.create("div", "vco-credit", this._el.content_container), this._el.credit.appendChild(Xn(e)), this.options.credit_height = this._el.credit.offsetHeight);
		let t = this._caption();
		t && t !== "" && !this._el.caption && (this._el.caption = P.create("div", "vco-caption", this._el.content_container), this._el.caption.appendChild(Xn(t)), this.options.caption_height = this._el.caption.offsetHeight);
	}
	onAdd() {
		this.fire("added", this.data);
	}
	onRemove() {
		this.fire("removed", this.data);
	}
	_url() {
		return typeof this.data.url == "string" ? this.data.url : "";
	}
	_caption() {
		return typeof this.data.caption == "string" ? this.data.caption : null;
	}
	_credit() {
		return typeof this.data.credit == "string" ? this.data.credit : null;
	}
	_initLayout() {
		this.message = new In({}, this.options), this.message.addTo(this._el.container), this._el.content_container = P.create("div", "vco-media-content-container", this._el.container);
		let e = this.data.link, t = typeof e == "string" ? qn(e) : null;
		if (t) {
			this._el.link = P.create("a", "vco-media-link", this._el.content_container);
			let e = this._el.link;
			e.href = t, e.target = this.data.link_target && this.data.link_target !== "" ? this.data.link_target : "_blank", e.target === "_blank" && (e.rel = "noopener noreferrer"), this._el.content = P.create("div", "vco-media-content", this._el.link);
		} else this._el.content = P.create("div", "vco-media-content", this._el.content_container);
	}
	_updateDisplay(e, t, n) {
		e && (this.options.width = e), t && (this.options.height = t), n && (this.options.layout = n), this._el.credit && (this.options.credit_height = this._el.credit.offsetHeight), this._el.caption && (this.options.caption_height = this._el.caption.offsetHeight + 5), this.updateMediaDisplay(this.options.layout);
	}
	_stopMedia() {}
}, ir = class extends jn(rr) {
	constructor(...e) {
		super(...e);
	}
}, ar = /\/(full|max|pct:[\d.]+|\d+,?\d*)\/(full|max|pct:[\d.]+|\d+,?\d*)\/(\d+|full)\/(default|color|gray|bitonal)\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;
function or(e, t) {
	if (!e || !(t > 0)) return e;
	let n = e.match(ar);
	return n ? e.slice(0, n.index) + `/${n[1]}/${t},/${n[3]}/${n[4]}.${n[5]}${n[6] ?? ""}` : e;
}
var sr = class extends ir {
	_loadMedia() {
		this.loadingMessage();
		let e = this.data.link ? qn(this.data.link) : null;
		if (e) {
			this._el.content_link = P.create("a", "", this._el.content);
			let t = this._el.content_link;
			t.href = e, t.target = "_blank", t.rel = "noopener noreferrer", this._el.content_item = P.create("img", "vco-media-item vco-media-image vco-media-shadow", this._el.content_link);
		} else this._el.content_item = P.create("img", "vco-media-item vco-media-image vco-media-shadow", this._el.content);
		this._el.content_item.addEventListener("load", (e) => {
			this.onMediaLoaded();
		});
		let t = this._el.content_item;
		t.decoding = "async", t.loading = this._state.eager ? "eager" : "lazy";
		let n = Number(this.options.width) || 0;
		t.src = or(this._url(), n) ?? this._url(), t.alt = this._altText(), this.data.srcset && (t.srcset = this.data.srcset), this.data.sizes && (t.sizes = this.data.sizes), this.onLoaded();
	}
	_altText() {
		let e = this.data.alt;
		if (e !== void 0 && e !== "") return e;
		let t = this.data.caption;
		return t ? t.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
	}
	_updateMediaDisplay(e) {}
};
//#endregion
//#region src/media/embedId.ts
function cr(e) {
	return e.split(/[?#]/)[0];
}
function lr(e, ...t) {
	for (let n of t) {
		let t = e.match(n);
		if (t) {
			let n = cr(e.slice((t.index ?? 0) + t[0].length)).split("/")[0];
			if (n) return n;
		}
	}
	return null;
}
function ur(e, t) {
	try {
		return new URL(e).searchParams.get(t);
	} catch {
		let n = e.split("?")[1];
		if (!n) return null;
		for (let e of n.split("&")) {
			let [n, r] = e.split("=");
			if (n === t) return r ?? "";
		}
		return null;
	}
}
function dr(e) {
	return ur(e, "v") || lr(e, /youtu\.be\//i, /\/embed\//i, /\/shorts\//i, /\/live\//i, /\/v\//i, /[?&]v=/i);
}
function fr(e) {
	return lr(e, /vimeo\.com\/video\//i, /player\.vimeo\.com\/video\//i) || (e.match(/vimeo\.com\/(\d+)(?:$|[/?#])/i)?.[1] ?? null);
}
function pr(e) {
	return lr(e, /dailymotion\.com\/video\//i, /dai\.ly\//i, /\/embed\/video\//i);
}
function mr(e) {
	let t = lr(e, /flickr\.com\/photos\/[^/]+\//i);
	return t && /^\d+$/.test(t) ? t : null;
}
//#endregion
//#region src/media/types/YouTube.ts
var hr = 10, gr = class extends ir {
	async _loadMedia() {
		this.loadingMessage(), this.youtube_loaded = !1, this._player_attempts = 0, this._el.content_item = P.create("div", "vco-media-item vco-media-youtube vco-media-shadow", this._el.content), this._el.content_item.id = l(7);
		let e = dr(this._url());
		if (!e) throw Error("Invalid YouTube URL");
		this.media_id = { id: e }, this.media_id.start = ur(this._url(), "t") ?? void 0, this.media_id.hd = ur(this._url(), "hd") ?? void 0;
		try {
			await this.loadScript("https://www.youtube.com/iframe_api");
		} catch {
			return;
		}
		this.createMedia();
	}
	_updateMediaDisplay() {
		this._sizeContentItemTo16x9();
	}
	_stopMedia() {
		if (c(this.timer), this.timer = null, this.youtube_loaded && this.player) try {
			let e = YT;
			this.player.getPlayerState() === e.PlayerState.PLAYING && this.player.pauseVideo();
		} catch (e) {
			console.log(e);
		}
	}
	createMedia() {
		if (this.media_id.start !== void 0) {
			let e = this.media_id.start.toString(), t = /(\d+)h/.exec(e), n = /(\d+)m/.exec(e), r = /(\d+)s/.exec(e);
			if (t || n || r) this.media_id.start = (t ? parseInt(t[1], 10) * 3600 : 0) + (n ? parseInt(n[1], 10) * 60 : 0) + (r ? parseInt(r[1], 10) : 0);
			else {
				let t = parseInt(e, 10);
				this.media_id.start = Number.isNaN(t) ? 0 : t;
			}
		} else this.media_id.start = 0;
		this.media_id.hd === void 0 ? this.media_id.hd = !1 : this.media_id.hd = !0, this.createPlayer();
	}
	createPlayer() {
		if (c(this.timer), typeof YT < "u" && YT.Player !== void 0) {
			let e = YT, t = this._el.content_item?.id;
			if (!t) return;
			this.player = new e.Player(t, {
				playerVars: {
					enablejsapi: 1,
					color: "white",
					autohide: 1,
					showinfo: 0,
					theme: "light",
					start: this.media_id.start,
					fs: 0,
					rel: 0
				},
				videoId: this.media_id.id,
				events: {
					onReady: () => {
						this.onPlayerReady();
					},
					onStateChange: this.onStateChange
				}
			}), this.onLoaded();
		} else {
			if (this._player_attempts = (this._player_attempts ?? 0) + 1, this._player_attempts > hr) {
				this.loadErrorDisplay("The YouTube player could not be loaded.");
				return;
			}
			this.timer = setTimeout(() => {
				this.createPlayer();
			}, 1e3);
		}
	}
	_disposeMedia() {
		if (c(this.timer), this.timer = null, this.youtube_loaded) try {
			this.player?.destroy?.();
		} catch (e) {
			console.log(e);
		}
		this.player = null, this.youtube_loaded = !1;
	}
	onPlayerReady(e) {
		if (this.youtube_loaded = !0, !this._el.content_item?.isConnected) {
			let e = this._el.content_item?.id, t = e ? document.getElementById(e) : null;
			t && (this._el.content_item = t);
		}
		this.onMediaLoaded(), this.onLoaded();
	}
	onStateChange(e) {
		let t = YT;
		e.data === t.PlayerState.ENDED && (e.target.seekTo(0), e.target.pauseVideo());
	}
}, _r = class extends ir {
	_loadMedia() {
		this.loadingMessage(), this._el.content_item = P.create("div", "vco-media-item vco-media-blockquote", this._el.content), this.media_id = this._url(), this._el.content_item.appendChild(Yn(this.media_id)), this.onLoaded();
	}
	updateMediaDisplay() {}
	_updateMediaDisplay() {}
}, vr = "wikipediaCallback_", yr = 494;
function br(e) {
	let t = e.split("wiki/")[1].split("#")[0].replace(/_/g, " "), n;
	try {
		n = decodeURIComponent(t);
	} catch {
		n = t;
	}
	let r = e.split("//")[1].split(".wikipedia")[0];
	return {
		title: n,
		language: r
	};
}
function xr(e) {
	return vr + e.replace(/[^0-9a-z]/gi, "").slice(0, yr);
}
function Sr(e, t, n) {
	return `https://${e}.wikipedia.org/w/api.php?action=query&prop=extracts&redirects=&titles=${encodeURIComponent(t)}&exintro=1&format=json&callback=${n}`;
}
var Cr = class extends ir {
	_loadMedia() {
		this.loadingMessage(), this._el.content_item = P.create("div", "vco-media-item vco-media-wikipedia", this._el.content);
		let { title: e, language: t } = br(this._url());
		this.media_id = e;
		let n = E(xr(e)), r = Sr(t, e, n);
		this._fetchExtract(r, n);
	}
	async _fetchExtract(e, t) {
		try {
			this.createMedia(await ee(e, t));
		} catch {
			this.loadErrorDisplay("Unable to load this article.");
		}
	}
	createMedia(e) {
		let t = e;
		if (t.query) {
			let e, n = {
				entry: {},
				title: "",
				text: "",
				extract: "",
				paragraphs: 1,
				text_array: []
			}, r = t.query, i = v(r.pages, 0);
			if (!i) {
				this.loadErrorDisplay("Unable to load this article.");
				return;
			}
			n.entry = i, n.extract = i.extract ?? "", n.title = i.title ?? "", n.extract.match("<p>") ? n.text_array = n.extract.split("<p>") : n.text_array.push(n.extract);
			for (let e = 0; e < n.text_array.length; e++) e + 1 <= n.paragraphs && e + 1 < n.text_array.length && (n.text += "<p>" + n.text_array[e + 1]);
			e = "<h4><a href='" + this._url() + "' target='_blank'>" + n.title + "</a></h4>", e += "<span class='wiki-source'>" + Nt.messages.wikipedia + "</span>", e += n.text, n.extract.match("REDIRECT") || (this._el.content_item?.appendChild(Xn(e)), this.onLoaded());
		}
	}
	updateMediaDisplay() {}
	_updateMediaDisplay() {}
}, wr = class extends ir {
	async _loadMedia() {
		this.loadingMessage(), this._el.content_item = P.create("div", "vco-media-item vco-media-iframe vco-media-soundcloud vco-media-shadow", this._el.content), this.media_id = this._url();
		let e = "https://soundcloud.com/oembed?url=" + this.media_id + "&format=json";
		try {
			let t = await (await fetch(e)).json();
			await this.loadScript("https://w.soundcloud.com/player/api.js"), this.createMedia(t);
		} catch (e) {
			e?.name !== "AbortError" && this.loadErrorDisplay("Unable to load this track.");
		}
	}
	createMedia(e) {
		let t = e;
		if (!t?.html) {
			this.loadErrorDisplay("Unable to load this track.");
			return;
		}
		let n = this._el.content_item;
		if (!n) {
			this.loadErrorDisplay("Unable to load this track.");
			return;
		}
		n.appendChild(Xn(t.html)), this.soundCloudCreated = !0;
		let r = SC;
		this.widget = r.Widget(n.querySelector("iframe")), this.onLoaded();
	}
	_stopMedia() {
		this.soundCloudCreated && this.widget?.pause();
	}
	_disposeMedia() {
		try {
			this.widget?.unbind?.();
		} catch (e) {
			console.log(e);
		}
		this.widget = null, this.soundCloudCreated = !1;
	}
}, Tr = class extends ir {
	_loadMedia() {
		if (this.loadingMessage(), this._el.content_item = P.create("div", "vco-media-item vco-media-iframe vco-media-vimeo vco-media-shadow", this._el.content), this.media_id = fr(this._url()) ?? "", !this.media_id) throw Error("Invalid Vimeo URL");
		let e = "https://player.vimeo.com/video/" + this.media_id + "?api=1&title=0&byline=0&portrait=0&color=ffffff";
		this.player = P.create("iframe", "", this._el.content_item), this.player.width = "100%", this.player.height = "100%", this.player.frameBorder = "0", this.player.src = e, this.onLoaded();
	}
	_updateMediaDisplay() {
		this._sizeContentItemTo16x9();
	}
	_stopMedia() {
		try {
			this.player?.contentWindow?.postMessage(JSON.stringify({ method: "pause" }), "https://player.vimeo.com");
		} catch (e) {
			console.log(e);
		}
	}
}, Er = {
	kind: "audio",
	extensions: { mp3: "mpeg" }
};
function Dr(e, t) {
	return t.extensions[e.toLowerCase()] ?? "";
}
var Or = class extends ir {
	spec() {
		return Er;
	}
	_loadMedia() {
		let e = this.spec();
		this.loadingMessage();
		let t = P.create(e.kind, `vco-media-item vco-media-${e.kind} vco-media-shadow`, this._el.content);
		this._el.content_item = t, t.controls = !0;
		let n = P.create("source", "", t);
		this._el.source_item = n, this._onEnded = null, this._onCanPlay = () => {
			this.onLoaded();
		}, t.addEventListener("canplay", this._onCanPlay), this._onSourceError = () => {
			this.loadErrorDisplay(Nt.messages.error + " " + this.options.media_name);
		}, n.addEventListener("error", this._onSourceError);
		let r = this._url();
		n.src = r;
		let i = this._getType(r, e);
		if (i && (n.type = i), e.kind === "video" || e.kind === "audio") {
			let e = this.data.subtitles;
			if (typeof e == "string" && e !== "") {
				let n = P.create("track", "vco-media-track", t);
				n.kind = "subtitles", n.srclang = "en", n.label = "Subtitles", n.src = e, n.default = !0;
			}
		}
		t.appendChild(document.createTextNode(`Your browser doesn't support HTML5 ${e.kind} with ` + n.type)), this._onEnded = () => {
			this.fire("media_ended", this.data);
		}, t.addEventListener("ended", this._onEnded), this.player_element = t;
	}
	_updateMediaDisplay() {}
	_stopMedia() {
		this.player_element?.pause();
	}
	_disposeMedia() {
		this._onCanPlay &&= (this.player_element?.removeEventListener("canplay", this._onCanPlay), null), this._onEnded &&= (this.player_element?.removeEventListener("ended", this._onEnded), null), this._onSourceError &&= (this._el.source_item?.removeEventListener("error", this._onSourceError), null);
		let e = this.player_element;
		e && (e.pause(), e.removeAttribute("src"), e.load()), this.player_element = null, this._onCanPlay = null, this._onSourceError = null;
	}
	_getType(e, t) {
		let n = e.match(this.data.mediatype.match_str);
		return n ? Dr(n[1], t) : "";
	}
}, kr = class extends Or {
	spec() {
		return {
			kind: "video",
			extensions: {
				mp4: "mp4",
				webm: "webm"
			}
		};
	}
}, Ar = class extends Or {
	spec() {
		return {
			kind: "audio",
			extensions: {
				mp3: "mpeg",
				wav: "wav",
				m4a: "mp4"
			}
		};
	}
}, jr = class extends ir {
	_loadMedia() {
		if (this.loadingMessage(), this._el.content_item = P.create("div", "vco-media-item vco-media-iframe vco-media-dailymotion", this._el.content), this.media_id = pr(this._url()) ?? "", !this.media_id) throw Error("Invalid DailyMotion URL");
		let e = "https://www.dailymotion.com/embed/video/" + this.media_id + "?api=postMessage";
		this._el.content_item.innerHTML = "<iframe autostart='false' frameborder='0' width='100%' height='100%' src='" + e + "'></iframe>", this.onLoaded();
	}
	_updateMediaDisplay() {
		this._sizeContentItemTo16x9();
	}
	_stopMedia() {
		(this._el.content_item?.querySelector("iframe"))?.contentWindow?.postMessage("{\"command\":\"pause\",\"parameters\":[]}", "*");
	}
}, Mr = class extends ir {
	_loadMedia() {
		this.loadingMessage(), this._el.content_item = P.create("div", "vco-media-twitter", this._el.content);
		let e = /(?:twitter\.com|x\.com)\/(.+?)\/status\/(\d+)/.exec(this._url());
		if (e) this.user_id = e[1], this.media_id = e[2];
		else throw Error("Invalid Twitter URL");
		let t = E(`twitterCallback_${this.media_id}`), n = `https://api.twitter.com/1/statuses/oembed.json?id=${this.media_id}&include_entities=true&callback=${t}`;
		this._fetchEmbed(n, t);
	}
	async _fetchEmbed(e, t) {
		try {
			this.createMedia(await ee(e, t));
		} catch {
			this.loadErrorDisplay("Unable to load this tweet.");
		}
	}
	createMedia(e) {
		let t = e;
		if (!t?.html) {
			this.loadErrorDisplay("Unable to load this post.");
			return;
		}
		let n = t.html.split("</p>&mdash;")[1] ?? "", r = t.author_url.split(/twitter\.com|x\.com\//)[1] ?? "", i = n.split("<a href=\"")[1] ?? "", a = i.split("\">")[0] ?? "", o = (i.split("\">")[1] ?? "").split("</a>")[0] ?? "", s = "", c = n ? t.html.split("</p>&mdash;")[0] + "</p></blockquote>" : "";
		c = c.replace(/<a href/gi, "<a target=\"_blank\" href"), s += c, s += "<div class='vcard'>", s += "<a href='" + a + "' class='twitter-date' target='_blank'>" + o + "</a>", s += "<div class='author'>", s += "<a class='screen-name url' href='" + t.author_url + "' target='_blank'>", s += "<span class='avatar'></span>", s += "<span class='fn'>" + t.author_name + " <span class='vco-icon-twitter'></span></span>", s += "<span class='nickname'>@" + r + "<span class='thumbnail-inline'></span></span>", s += "</a>", s += "</div>", s += "</div>", this._el.content_item?.appendChild(Xn(s)), this.onLoaded();
	}
	updateMediaDisplay() {}
	_updateMediaDisplay() {}
}, Nr = class extends ir {
	_loadMedia() {
		this.loadingMessage(), this._el.content_item = P.create("img", "vco-media-item vco-media-image vco-media-flickr vco-media-shadow", this._el.content), this._el.content_item.addEventListener("load", (e) => {
			this.onMediaLoaded();
		}), this.establishMediaID();
		let e = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=" + this.options.api_key_flickr + "&photo_id=" + this.media_id + "&format=json&nojsoncallback=1";
		this._fetchSizes(e);
	}
	async _fetchSizes(e) {
		try {
			let t = await (await fetch(e)).json();
			t.stat === "ok" ? this.createMedia(t) : this.loadErrorDisplay("Photo not found or private.");
		} catch {
			this.loadErrorDisplay("Photo not found or private.");
		}
	}
	establishMediaID() {
		let e = mr(this._url());
		if (!e) throw Error("Invalid Flickr URL");
		this.media_id = e;
	}
	createMedia(e) {
		let t = e, n = this.sizes(Number(this.options.height ?? 0)), r = t?.sizes?.size;
		if (!r || !r.length) {
			this.loadErrorDisplay("Photo not found or private.");
			return;
		}
		let i = r[Math.max(0, r.length - 2)].source;
		for (let e = 0; e < r.length; e++) r[e].label === n && (i = r[e].source);
		this._el.content_item.src = i, this.onLoaded();
	}
	sizes(e) {
		let t;
		return t = e <= 75 ? e <= 0 ? "Large" : "Thumbnail" : e <= 180 ? "Small" : e <= 240 ? "Small 320" : e <= 375 ? "Medium" : e <= 480 ? "Medium 640" : "Large", t;
	}
}, Pr = class extends ir {
	_loadMedia() {
		this.loadingMessage(), this._el.content_item = P.create("div", "vco-media-item vco-media-iframe", this._el.content), this.media_id = this._url();
		let e = qn(this.media_id);
		if (!e) {
			this.loadErrorDisplay("Invalid URL.");
			return;
		}
		let t = document.createElement("iframe");
		t.className = "doc", t.setAttribute("frameborder", "0"), t.setAttribute("width", "100%"), t.setAttribute("height", "100%"), this.media_id.match(/docs.google.com/i) ? t.setAttribute("src", e + "&embedded=true") : t.setAttribute("src", "http://docs.google.com/viewer?url=" + encodeURIComponent(e) + "&embedded=true"), this._el.content_item.appendChild(t), this.onLoaded();
	}
	_updateMediaDisplay() {
		this._sizeContentItemToOptionHeight();
	}
}, Fr = class extends ir {
	_loadMedia() {
		this.loadingMessage(), this._el.content_item = P.create("div", "vco-media-item vco-media-iframe", this._el.content), this.media_id = this._url();
		let e = Jn(this.media_id);
		if (!e) {
			this.loadErrorDisplay("Invalid embed code. Paste an iframe embed code with an http(s) source URL.");
			return;
		}
		this._el.content_item.appendChild(e), this.onLoaded();
	}
	_updateMediaDisplay() {
		this._sizeContentItemToOptionHeight();
	}
}, Ir = class extends ir {
	extraClass() {
		return "";
	}
	_loadMedia() {
		this.loadingMessage();
		let e = `vco-media-item vco-media-iframe ${this.extraClass()}`.trim(), t = P.create("div", e, this._el.content);
		this._el.content_item = t, this.media_id = this._url();
		let n = qn(this.media_id);
		if (!n) {
			this.loadErrorDisplay("Invalid URL.");
			return;
		}
		let r = document.createElement("iframe");
		r.setAttribute("src", n), t.appendChild(r), this.onLoaded();
	}
	_updateMediaDisplay() {
		this._el.content_item && (this._el.content_item.style.height = Number(this.options.height ?? 0) + "px");
	}
}, Lr = class extends Ir {}, Rr = class extends ir {
	_loadMedia() {
		this.loadingMessage(), this._el.content_item = P.create("div", "vco-media-item vco-media-iframe vco-media-facebook", this._el.content);
		let e = this._url(), t = encodeURIComponent(e), n = /\/videos?\//.test(e) || /\/watch/.test(e) || /\/reel\//.test(e) ? `https://www.facebook.com/plugins/video.php?href=${t}&show_text=true` : `https://www.facebook.com/plugins/post.php?href=${t}&show_text=true`;
		this._el.content_item.innerHTML = `<iframe src="${n}" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`, this.onLoaded();
	}
	_updateMediaDisplay() {
		this._sizeContentItemToOptionHeight();
	}
}, zr = class extends Ir {
	extraClass() {
		return "vco-media-documentcloud";
	}
}, Br = class extends ir {
	_loadMedia() {
		this.loadingMessage(), this._el.content_item = P.create("div", "vco-media-item vco-media-iframe vco-media-juxtapose", this._el.content);
		let e = Jn(`<iframe src="${String(this._url() ?? "")}"></iframe>`);
		if (!e) {
			this.loadErrorDisplay("Invalid URL.");
			return;
		}
		e.setAttribute("loading", "lazy"), this._el.content_item.appendChild(e), this.onLoaded();
	}
	_updateMediaDisplay() {
		this._sizeContentItemToOptionHeight();
	}
};
//#endregion
//#region src/media/MediaType.ts
function Vr(e) {
	let t = [
		{
			type: "youtube",
			name: "YouTube",
			match_str: "(www.)?youtube|youtu.be",
			cls: gr
		},
		{
			type: "vimeo",
			name: "Vimeo",
			match_str: "(player.)?vimeo.com",
			cls: Tr
		},
		{
			type: "dailymotion",
			name: "DailyMotion",
			match_str: "(www.)?dailymotion.com",
			cls: jr
		},
		{
			type: "soundcloud",
			name: "SoundCloud",
			match_str: "(player.)?soundcloud.com",
			cls: wr
		},
		{
			type: "twitter",
			name: "Twitter",
			match_str: "^(https?:)?/+(www.)?(twitter|x).com",
			cls: Mr
		},
		{
			type: "flickr",
			name: "Flickr",
			match_str: "flickr.com/photos",
			cls: Nr
		},
		{
			type: "image",
			name: "Image",
			match_str: /jpg|jpeg|png|gif|webp/i,
			cls: sr
		},
		{
			type: "video",
			name: "Video",
			match_str: /(mp4|webm)(\?.*)?$/i,
			cls: kr
		},
		{
			type: "audio",
			name: "Audio",
			match_str: /(mp3|wav|m4a)(\?.*)?$/i,
			cls: Ar
		},
		{
			type: "googledocs",
			name: "Google Doc",
			match_str: "^(https?:)?/*[^.]*.google.com/[^/]*/d/[^/]*/[^/]*?usp=sharing|^(https?:)?/*drive.google.com/open?id=[^&]*&authuser=0|^(https?:)?//*drive.google.com/open\\?id=[^&]*|^(https?:)?/*[^.]*.googledrive.com/host/[^/]*/",
			cls: Pr
		},
		{
			type: "wikipedia",
			name: "Wikipedia",
			match_str: "(www.)?wikipedia.org",
			cls: Cr
		},
		{
			type: "iframe",
			name: "iFrame",
			match_str: "iframe",
			cls: Fr
		},
		{
			type: "facebook",
			name: "Facebook",
			match_str: "(www.)?facebook.com",
			cls: Rr
		},
		{
			type: "documentcloud",
			name: "DocumentCloud",
			match_str: "documentcloud.org/documents/",
			cls: zr
		},
		{
			type: "juxtapose",
			name: "Juxtapose",
			match_str: "juxtapose",
			cls: Br
		},
		{
			type: "blockquote",
			name: "Quote",
			match_str: "blockquote",
			cls: _r
		},
		{
			type: "website",
			name: "Website",
			match_str: "https?://",
			cls: Lr
		},
		{
			type: "",
			name: "",
			match_str: "",
			cls: ir
		}
	];
	for (let n of t) if (typeof e.url == "string" && e.url.match(n.match_str)) return n;
	return !1;
}
//#endregion
//#region node_modules/ol/CollectionEventType.js
var Hr = {
	ADD: "add",
	REMOVE: "remove"
}, Ur = { PROPERTYCHANGE: "propertychange" };
//#endregion
//#region node_modules/ol/obj.js
function Wr(e) {
	for (let t in e) delete e[t];
}
function Gr(e) {
	let t;
	for (t in e) return !1;
	return !t;
}
//#endregion
//#region node_modules/ol/events.js
function I(e, t, n, r, i) {
	if (i) {
		let i = n;
		n = function(a) {
			return e.removeEventListener(t, n), i.call(r ?? this, a);
		};
	} else r && r !== e && (n = n.bind(r));
	let a = {
		target: e,
		type: t,
		listener: n
	};
	return e.addEventListener(t, n), a;
}
function Kr(e, t, n, r) {
	return I(e, t, n, r, !0);
}
function qr(e) {
	e && e.target && (e.target.removeEventListener(e.type, e.listener), Wr(e));
}
//#endregion
//#region node_modules/ol/events/EventType.js
var L = {
	CHANGE: "change",
	ERROR: "error",
	BLUR: "blur",
	CLEAR: "clear",
	CONTEXTMENU: "contextmenu",
	CLICK: "click",
	DBLCLICK: "dblclick",
	DRAGENTER: "dragenter",
	DRAGOVER: "dragover",
	DROP: "drop",
	FOCUS: "focus",
	KEYDOWN: "keydown",
	KEYPRESS: "keypress",
	LOAD: "load",
	RESIZE: "resize",
	TOUCHMOVE: "touchmove",
	WHEEL: "wheel"
}, Jr = class {
	constructor() {
		this.disposed = !1;
	}
	dispose() {
		this.disposed || (this.disposed = !0, this.disposeInternal());
	}
	disposeInternal() {}
};
//#endregion
//#region node_modules/ol/array.js
function Yr(e, t, n) {
	let r, i;
	n ||= Xr;
	let a = 0, o = e.length, s = !1;
	for (; a < o;) r = a + (o - a >> 1), i = +n(e[r], t), i < 0 ? a = r + 1 : (o = r, s = !i);
	return s ? a : ~a;
}
function Xr(e, t) {
	return e > t ? 1 : e < t ? -1 : 0;
}
function Zr(e, t) {
	return e < t ? 1 : e > t ? -1 : 0;
}
function Qr(e, t, n) {
	if (e[0] <= t) return 0;
	let r = e.length;
	if (t <= e[r - 1]) return r - 1;
	if (typeof n == "function") {
		for (let i = 1; i < r; ++i) {
			let r = e[i];
			if (r === t) return i;
			if (r < t) return n(t, e[i - 1], r) > 0 ? i - 1 : i;
		}
		return r - 1;
	}
	if (n > 0) {
		for (let n = 1; n < r; ++n) if (e[n] < t) return n - 1;
		return r - 1;
	}
	if (n < 0) {
		for (let n = 1; n < r; ++n) if (e[n] <= t) return n;
		return r - 1;
	}
	for (let n = 1; n < r; ++n) {
		if (e[n] == t) return n;
		if (e[n] < t) return e[n - 1] - t < t - e[n] ? n - 1 : n;
	}
	return r - 1;
}
function $r(e, t, n) {
	for (; t < n;) {
		let r = e[t];
		e[t] = e[n], e[n] = r, ++t, --n;
	}
}
function ei(e, t) {
	let n = Array.isArray(t) ? t : [t], r = n.length;
	for (let t = 0; t < r; t++) e[e.length] = n[t];
}
function ti(e, t) {
	let n = e.length;
	if (n !== t.length) return !1;
	for (let r = 0; r < n; r++) if (e[r] !== t[r]) return !1;
	return !0;
}
function ni(e, t, n) {
	let r = t || Xr;
	return e.every(function(t, i) {
		if (i === 0) return !0;
		let a = r(e[i - 1], t);
		return !(a > 0 || n && a === 0);
	});
}
//#endregion
//#region node_modules/ol/functions.js
function ri() {
	return !0;
}
function ii() {
	return !1;
}
function ai() {}
function oi(e) {
	let t, n, r;
	return function() {
		let i = Array.prototype.slice.call(arguments);
		return (!n || this !== r || !ti(i, n)) && (r = this, n = i, t = e.apply(this, arguments)), t;
	};
}
function si(e) {
	function t() {
		let t;
		try {
			t = e();
		} catch (e) {
			return Promise.reject(e);
		}
		return t instanceof Promise ? t : Promise.resolve(t);
	}
	return t();
}
//#endregion
//#region node_modules/ol/events/Event.js
var ci = class {
	constructor(e) {
		this.propagationStopped, this.defaultPrevented, this.type = e, this.target = null;
	}
	preventDefault() {
		this.defaultPrevented = !0;
	}
	stopPropagation() {
		this.propagationStopped = !0;
	}
}, li = class extends Jr {
	constructor(e) {
		super(), this.eventTarget_ = e, this.pendingRemovals_ = null, this.dispatching_ = null, this.listeners_ = null;
	}
	addEventListener(e, t) {
		if (!e || !t) return;
		let n = this.listeners_ ||= {}, r = n[e] || (n[e] = []);
		r.includes(t) || r.push(t);
	}
	dispatchEvent(e) {
		let t = typeof e == "string", n = t ? e : e.type, r = this.listeners_ && this.listeners_[n];
		if (!r) return;
		let i = t ? new ci(e) : e;
		i.target ||= this.eventTarget_ || this;
		let a = this.dispatching_ ||= {}, o = this.pendingRemovals_ ||= {};
		n in a || (a[n] = 0, o[n] = 0), ++a[n];
		let s;
		for (let e = 0, t = r.length; e < t; ++e) if (s = "handleEvent" in r[e] ? r[e].handleEvent(i) : r[e].call(this, i), s === !1 || i.propagationStopped) {
			s = !1;
			break;
		}
		if (--a[n] === 0) {
			let e = o[n];
			for (delete o[n]; e--;) this.removeEventListener(n, ai);
			delete a[n];
		}
		return s;
	}
	disposeInternal() {
		this.listeners_ && Wr(this.listeners_);
	}
	getListeners(e) {
		return this.listeners_ && this.listeners_[e] || void 0;
	}
	hasListener(e) {
		return this.listeners_ ? e ? e in this.listeners_ : Object.keys(this.listeners_).length > 0 : !1;
	}
	removeEventListener(e, t) {
		if (!this.listeners_) return;
		let n = this.listeners_[e];
		if (!n) return;
		let r = n.indexOf(t);
		r !== -1 && (this.pendingRemovals_ && e in this.pendingRemovals_ ? (n[r] = ai, ++this.pendingRemovals_[e]) : (n.splice(r, 1), n.length === 0 && delete this.listeners_[e]));
	}
}, ui = class extends li {
	constructor() {
		super(), this.on = this.onInternal, this.once = this.onceInternal, this.un = this.unInternal, this.revision_ = 0;
	}
	changed() {
		++this.revision_, this.dispatchEvent(L.CHANGE);
	}
	getRevision() {
		return this.revision_;
	}
	onInternal(e, t) {
		if (Array.isArray(e)) {
			let n = e.length, r = Array(n);
			for (let i = 0; i < n; ++i) r[i] = I(this, e[i], t);
			return r;
		}
		return I(this, e, t);
	}
	onceInternal(e, t) {
		let n;
		if (Array.isArray(e)) {
			let r = e.length;
			n = Array(r);
			for (let i = 0; i < r; ++i) n[i] = Kr(this, e[i], t);
		} else n = Kr(this, e, t);
		return t.ol_key = n, n;
	}
	unInternal(e, t) {
		let n = t.ol_key;
		if (n) di(n);
		else if (Array.isArray(e)) for (let n = 0, r = e.length; n < r; ++n) this.removeEventListener(e[n], t);
		else this.removeEventListener(e, t);
	}
};
ui.prototype.on, ui.prototype.once, ui.prototype.un;
function di(e) {
	if (Array.isArray(e)) for (let t = 0, n = e.length; t < n; ++t) qr(e[t]);
	else qr(e);
}
//#endregion
//#region node_modules/ol/util.js
function R() {
	throw Error("Unimplemented abstract method.");
}
var fi = 0;
function z(e) {
	return e.ol_uid ||= String(++fi);
}
//#endregion
//#region node_modules/ol/Object.js
var pi = class extends ci {
	constructor(e, t, n) {
		super(e), this.key = t, this.oldValue = n;
	}
}, mi = class extends ui {
	constructor(e) {
		super(), this.on, this.once, this.un, z(this), this.values_ = null, e !== void 0 && this.setProperties(e);
	}
	get(e) {
		let t;
		return this.values_ && this.values_.hasOwnProperty(e) && (t = this.values_[e]), t;
	}
	getKeys() {
		return this.values_ && Object.keys(this.values_) || [];
	}
	getProperties() {
		return this.values_ && Object.assign({}, this.values_) || {};
	}
	getPropertiesInternal() {
		return this.values_;
	}
	hasProperties() {
		return !!this.values_;
	}
	notify(e, t) {
		let n;
		n = `change:${e}`, this.hasListener(n) && this.dispatchEvent(new pi(n, e, t)), n = Ur.PROPERTYCHANGE, this.hasListener(n) && this.dispatchEvent(new pi(n, e, t));
	}
	addChangeListener(e, t) {
		this.addEventListener(`change:${e}`, t);
	}
	removeChangeListener(e, t) {
		this.removeEventListener(`change:${e}`, t);
	}
	set(e, t, n) {
		let r = this.values_ ||= {};
		if (n) r[e] = t;
		else {
			let n = r[e];
			r[e] = t, n !== t && this.notify(e, n);
		}
	}
	setProperties(e, t) {
		for (let n in e) this.set(n, e[n], t);
	}
	applyProperties(e) {
		e.values_ && Object.assign(this.values_ ||= {}, e.values_);
	}
	unset(e, t) {
		if (this.values_ && e in this.values_) {
			let n = this.values_[e];
			delete this.values_[e], Gr(this.values_) && (this.values_ = null), t || this.notify(e, n);
		}
	}
}, hi = { LENGTH: "length" }, gi = class extends ci {
	constructor(e, t, n) {
		super(e), this.element = t, this.index = n;
	}
}, _i = class extends mi {
	constructor(e, t) {
		if (super(), this.on, this.once, this.un, t ||= {}, this.unique_ = !!t.unique, this.array_ = e ?? [], this.unique_) for (let e = 1, t = this.array_.length; e < t; ++e) this.assertUnique_(this.array_[e], e);
		this.updateLength_();
	}
	clear() {
		for (; this.getLength() > 0;) this.pop();
	}
	extend(e) {
		for (let t = 0, n = e.length; t < n; ++t) this.push(e[t]);
		return this;
	}
	forEach(e) {
		let t = this.array_;
		for (let n = 0, r = t.length; n < r; ++n) e(t[n], n, t);
	}
	getArray() {
		return this.array_;
	}
	item(e) {
		return this.array_[e];
	}
	getLength() {
		return this.get(hi.LENGTH);
	}
	insertAt(e, t) {
		if (e < 0 || e > this.getLength()) throw Error("Index out of bounds: " + e);
		this.unique_ && this.assertUnique_(t), this.array_.splice(e, 0, t), this.updateLength_(), this.dispatchEvent(new gi(Hr.ADD, t, e));
	}
	pop() {
		return this.removeAt(this.getLength() - 1);
	}
	push(e) {
		let t = this.getLength();
		return this.insertAt(t, e), this.getLength();
	}
	remove(e) {
		let t = this.array_;
		for (let n = 0, r = t.length; n < r; ++n) if (t[n] === e) return this.removeAt(n);
	}
	removeAt(e) {
		if (e < 0 || e >= this.getLength()) return;
		let t = this.array_[e];
		return this.array_.splice(e, 1), this.updateLength_(), this.dispatchEvent(new gi(Hr.REMOVE, t, e)), t;
	}
	setAt(e, t) {
		if (e >= this.getLength()) {
			this.insertAt(e, t);
			return;
		}
		if (e < 0) throw Error("Index out of bounds: " + e);
		this.unique_ && this.assertUnique_(t, e);
		let n = this.array_[e];
		this.array_[e] = t, this.dispatchEvent(new gi(Hr.REMOVE, n, e)), this.dispatchEvent(new gi(Hr.ADD, t, e));
	}
	updateLength_() {
		this.set(hi.LENGTH, this.array_.length);
	}
	assertUnique_(e, t) {
		let n = this.array_;
		for (let r = 0, i = n.length; r < i; ++r) if (n[r] === e && r !== t) throw Error("Duplicate item added to a unique collection");
	}
}, vi = class extends ci {
	constructor(e, t, n) {
		super(e), this.map = t, this.frameState = n === void 0 ? null : n;
	}
}, yi = class extends vi {
	constructor(e, t, n, r, i, a) {
		super(e, t, i), this.originalEvent = n, this.pixel_ = null, this.coordinate_ = null, this.dragging = r !== void 0 && r, this.activePointers = a;
	}
	get pixel() {
		return this.pixel_ ||= this.map.getEventPixel(this.originalEvent), this.pixel_;
	}
	set pixel(e) {
		this.pixel_ = e;
	}
	get coordinate() {
		return this.coordinate_ ||= this.map.getCoordinateFromPixel(this.pixel), this.coordinate_;
	}
	set coordinate(e) {
		this.coordinate_ = e;
	}
	preventDefault() {
		super.preventDefault(), "preventDefault" in this.originalEvent && this.originalEvent.preventDefault();
	}
	stopPropagation() {
		super.stopPropagation(), "stopPropagation" in this.originalEvent && this.originalEvent.stopPropagation();
	}
}, bi = {
	SINGLECLICK: "singleclick",
	CLICK: L.CLICK,
	DBLCLICK: L.DBLCLICK,
	POINTERDRAG: "pointerdrag",
	POINTERMOVE: "pointermove",
	POINTERDOWN: "pointerdown",
	POINTERUP: "pointerup",
	POINTEROVER: "pointerover",
	POINTEROUT: "pointerout",
	POINTERENTER: "pointerenter",
	POINTERLEAVE: "pointerleave",
	POINTERCANCEL: "pointercancel"
}, xi = typeof navigator < "u" && navigator.userAgent !== void 0 ? navigator.userAgent.toLowerCase() : "";
xi.includes("safari") && !xi.includes("chrom") && (xi.includes("version/15.4") || /cpu (os|iphone os) 15_4 like mac os x/.test(xi));
var Si = xi.includes("webkit") && !xi.includes("edge"), Ci = xi.includes("macintosh"), wi = typeof devicePixelRatio < "u" ? devicePixelRatio : 1, Ti = typeof WorkerGlobalScope < "u" && typeof OffscreenCanvas < "u" && self instanceof WorkerGlobalScope, Ei = typeof Image < "u" && Image.prototype.decode, Di = (function() {
	let e = !1;
	try {
		let t = Object.defineProperty({}, "passive", { get: function() {
			e = !0;
		} });
		window.addEventListener("_", null, t), window.removeEventListener("_", null, t);
	} catch {}
	return e;
})(), Oi = {
	POINTERMOVE: "pointermove",
	POINTERDOWN: "pointerdown",
	POINTERUP: "pointerup",
	POINTEROVER: "pointerover",
	POINTEROUT: "pointerout",
	POINTERENTER: "pointerenter",
	POINTERLEAVE: "pointerleave",
	POINTERCANCEL: "pointercancel"
}, ki = class extends li {
	constructor(e, t) {
		super(e), this.map_ = e, this.clickTimeoutId_, this.emulateClicks_ = !1, this.dragging_ = !1, this.dragListenerKeys_ = [], this.moveTolerance_ = t === void 0 ? 1 : t, this.down_ = null;
		let n = this.map_.getViewport();
		this.activePointers_ = [], this.trackedTouches_ = {}, this.element_ = n, this.pointerdownListenerKey_ = I(n, Oi.POINTERDOWN, this.handlePointerDown_, this), this.originalPointerMoveEvent_, this.relayedListenerKey_ = I(n, Oi.POINTERMOVE, this.relayMoveEvent_, this), this.boundHandleTouchMove_ = this.handleTouchMove_.bind(this), this.element_.addEventListener(L.TOUCHMOVE, this.boundHandleTouchMove_, Di ? { passive: !1 } : !1);
	}
	emulateClick_(e) {
		let t = new yi(bi.CLICK, this.map_, e);
		this.dispatchEvent(t), this.clickTimeoutId_ === void 0 ? this.clickTimeoutId_ = setTimeout(() => {
			this.clickTimeoutId_ = void 0;
			let t = new yi(bi.SINGLECLICK, this.map_, e);
			this.dispatchEvent(t);
		}, 250) : (clearTimeout(this.clickTimeoutId_), this.clickTimeoutId_ = void 0, t = new yi(bi.DBLCLICK, this.map_, e), this.dispatchEvent(t));
	}
	updateActivePointers_(e) {
		let t = e, n = t.pointerId;
		if (t.type == bi.POINTERUP || t.type == bi.POINTERCANCEL) {
			delete this.trackedTouches_[n];
			for (let e in this.trackedTouches_) if (this.trackedTouches_[e].target !== t.target) {
				delete this.trackedTouches_[e];
				break;
			}
		} else (t.type == bi.POINTERDOWN || t.type == bi.POINTERMOVE) && (this.trackedTouches_[n] = t);
		this.activePointers_ = Object.values(this.trackedTouches_);
	}
	handlePointerUp_(e) {
		this.updateActivePointers_(e);
		let t = new yi(bi.POINTERUP, this.map_, e, void 0, void 0, this.activePointers_);
		this.dispatchEvent(t), this.emulateClicks_ && !t.defaultPrevented && !this.dragging_ && this.isMouseActionButton_(e) && this.emulateClick_(this.down_), this.activePointers_.length === 0 && (this.dragListenerKeys_.forEach(qr), this.dragListenerKeys_.length = 0, this.dragging_ = !1, this.down_ = null);
	}
	isMouseActionButton_(e) {
		return e.button === 0;
	}
	handlePointerDown_(e) {
		this.emulateClicks_ = this.activePointers_.length === 0, this.updateActivePointers_(e);
		let t = new yi(bi.POINTERDOWN, this.map_, e, void 0, void 0, this.activePointers_);
		if (this.dispatchEvent(t), this.down_ = new PointerEvent(e.type, e), Object.defineProperty(this.down_, "target", {
			writable: !1,
			value: e.target
		}), this.dragListenerKeys_.length === 0) {
			let e = this.map_.getOwnerDocument();
			this.dragListenerKeys_.push(I(e, bi.POINTERMOVE, this.handlePointerMove_, this), I(e, bi.POINTERUP, this.handlePointerUp_, this), I(this.element_, bi.POINTERCANCEL, this.handlePointerUp_, this)), this.element_.getRootNode && this.element_.getRootNode() !== e && this.dragListenerKeys_.push(I(this.element_.getRootNode(), bi.POINTERUP, this.handlePointerUp_, this));
		}
	}
	handlePointerMove_(e) {
		if (this.isMoving_(e)) {
			this.updateActivePointers_(e), this.dragging_ = !0;
			let t = new yi(bi.POINTERDRAG, this.map_, e, this.dragging_, void 0, this.activePointers_);
			this.dispatchEvent(t);
		}
	}
	relayMoveEvent_(e) {
		this.originalPointerMoveEvent_ = e;
		let t = !!(this.down_ && this.isMoving_(e));
		this.dispatchEvent(new yi(bi.POINTERMOVE, this.map_, e, t));
	}
	handleTouchMove_(e) {
		let t = this.originalPointerMoveEvent_;
		(!t || t.defaultPrevented) && (typeof e.cancelable != "boolean" || e.cancelable === !0) && e.preventDefault();
	}
	isMoving_(e) {
		return this.dragging_ || Math.abs(e.clientX - this.down_.clientX) > this.moveTolerance_ || Math.abs(e.clientY - this.down_.clientY) > this.moveTolerance_;
	}
	disposeInternal() {
		this.relayedListenerKey_ &&= (qr(this.relayedListenerKey_), null), this.element_.removeEventListener(L.TOUCHMOVE, this.boundHandleTouchMove_), this.pointerdownListenerKey_ &&= (qr(this.pointerdownListenerKey_), null), this.dragListenerKeys_.forEach(qr), this.dragListenerKeys_.length = 0, this.element_ = null, super.disposeInternal();
	}
}, Ai = {
	POSTRENDER: "postrender",
	MOVESTART: "movestart",
	MOVEEND: "moveend",
	LOADSTART: "loadstart",
	LOADEND: "loadend"
}, ji = {
	LAYERGROUP: "layergroup",
	SIZE: "size",
	TARGET: "target",
	VIEW: "view"
}, B = {
	IDLE: 0,
	LOADING: 1,
	LOADED: 2,
	ERROR: 3,
	EMPTY: 4
};
//#endregion
//#region node_modules/ol/asserts.js
function V(e, t) {
	if (!e) throw Error(t);
}
//#endregion
//#region node_modules/ol/structs/PriorityQueue.js
var Mi = Infinity, Ni = class {
	constructor(e, t) {
		this.priorityFunction_ = e, this.keyFunction_ = t, this.elements_ = [], this.priorities_ = [], this.queuedElements_ = {};
	}
	clear() {
		this.elements_.length = 0, this.priorities_.length = 0, Wr(this.queuedElements_);
	}
	dequeue() {
		let e = this.elements_, t = this.priorities_, n = e[0];
		e.length == 1 ? (e.length = 0, t.length = 0) : (e[0] = e.pop(), t[0] = t.pop(), this.siftUp_(0));
		let r = this.keyFunction_(n);
		return delete this.queuedElements_[r], n;
	}
	enqueue(e) {
		V(!(this.keyFunction_(e) in this.queuedElements_), "Tried to enqueue an `element` that was already added to the queue");
		let t = this.priorityFunction_(e);
		return t != Infinity && (this.elements_.push(e), this.priorities_.push(t), this.queuedElements_[this.keyFunction_(e)] = !0, this.siftDown_(0, this.elements_.length - 1), !0);
	}
	getCount() {
		return this.elements_.length;
	}
	getLeftChildIndex_(e) {
		return e * 2 + 1;
	}
	getRightChildIndex_(e) {
		return e * 2 + 2;
	}
	getParentIndex_(e) {
		return e - 1 >> 1;
	}
	heapify_() {
		let e;
		for (e = (this.elements_.length >> 1) - 1; e >= 0; e--) this.siftUp_(e);
	}
	isEmpty() {
		return this.elements_.length === 0;
	}
	isKeyQueued(e) {
		return e in this.queuedElements_;
	}
	isQueued(e) {
		return this.isKeyQueued(this.keyFunction_(e));
	}
	siftUp_(e) {
		let t = this.elements_, n = this.priorities_, r = t.length, i = t[e], a = n[e], o = e;
		for (; e < r >> 1;) {
			let i = this.getLeftChildIndex_(e), a = this.getRightChildIndex_(e), o = a < r && n[a] < n[i] ? a : i;
			t[e] = t[o], n[e] = n[o], e = o;
		}
		t[e] = i, n[e] = a, this.siftDown_(o, e);
	}
	siftDown_(e, t) {
		let n = this.elements_, r = this.priorities_, i = n[t], a = r[t];
		for (; t > e;) {
			let e = this.getParentIndex_(t);
			if (r[e] > a) n[t] = n[e], r[t] = r[e], t = e;
			else break;
		}
		n[t] = i, r[t] = a;
	}
	reprioritize() {
		let e = this.priorityFunction_, t = this.elements_, n = this.priorities_, r = 0, i = t.length, a, o, s;
		for (o = 0; o < i; ++o) a = t[o], s = e(a), s == Infinity ? delete this.queuedElements_[this.keyFunction_(a)] : (n[r] = s, t[r++] = a);
		t.length = r, n.length = r, this.heapify_();
	}
}, Pi = class extends Ni {
	constructor(e, t) {
		super((t) => e.apply(null, t), (e) => e[0].getKey()), this.boundHandleTileChange_ = this.handleTileChange.bind(this), this.tileChangeCallback_ = t, this.tilesLoading_ = 0, this.tilesLoadingKeys_ = {};
	}
	enqueue(e) {
		let t = super.enqueue(e);
		return t && e[0].addEventListener(L.CHANGE, this.boundHandleTileChange_), t;
	}
	getTilesLoading() {
		return this.tilesLoading_;
	}
	handleTileChange(e) {
		let t = e.target, n = t.getState();
		if (n === B.LOADED || n === B.ERROR || n === B.EMPTY) {
			n !== B.ERROR && t.removeEventListener(L.CHANGE, this.boundHandleTileChange_);
			let e = t.getKey();
			e in this.tilesLoadingKeys_ && (delete this.tilesLoadingKeys_[e], --this.tilesLoading_), this.tileChangeCallback_();
		}
	}
	loadMoreTiles(e, t) {
		let n = 0;
		for (; this.tilesLoading_ < e && n < t && this.getCount() > 0;) {
			let e = this.dequeue()[0], t = e.getKey();
			e.getState() === B.IDLE && !(t in this.tilesLoadingKeys_) && (this.tilesLoadingKeys_[t] = !0, ++this.tilesLoading_, ++n, e.load());
		}
	}
};
function Fi(e, t, n, r, i) {
	if (!e || !(n in e.wantedTiles) || !e.wantedTiles[n][t.getKey()]) return Mi;
	let a = e.viewState.center, o = r[0] - a[0], s = r[1] - a[1];
	return 65536 * Math.log(i) + Math.sqrt(o * o + s * s) / i;
}
//#endregion
//#region node_modules/ol/ViewHint.js
var Ii = {
	ANIMATING: 0,
	INTERACTING: 1
}, Li = {
	CENTER: "center",
	RESOLUTION: "resolution",
	ROTATION: "rotation"
};
//#endregion
//#region node_modules/ol/math.js
function Ri(e, t, n) {
	return Math.min(Math.max(e, t), n);
}
function zi(e, t, n, r, i, a) {
	let o = i - n, s = a - r;
	if (o !== 0 || s !== 0) {
		let c = ((e - n) * o + (t - r) * s) / (o * o + s * s);
		c > 1 ? (n = i, r = a) : c > 0 && (n += o * c, r += s * c);
	}
	return Bi(e, t, n, r);
}
function Bi(e, t, n, r) {
	let i = n - e, a = r - t;
	return i * i + a * a;
}
function Vi(e) {
	let t = e.length;
	for (let n = 0; n < t; n++) {
		let r = n, i = Math.abs(e[n][n]);
		for (let a = n + 1; a < t; a++) {
			let t = Math.abs(e[a][n]);
			t > i && (i = t, r = a);
		}
		if (i === 0) return null;
		let a = e[r];
		e[r] = e[n], e[n] = a;
		for (let r = n + 1; r < t; r++) {
			let i = -e[r][n] / e[n][n];
			for (let a = n; a < t + 1; a++) n == a ? e[r][a] = 0 : e[r][a] += i * e[n][a];
		}
	}
	let n = Array(t);
	for (let r = t - 1; r >= 0; r--) {
		n[r] = e[r][t] / e[r][r];
		for (let i = r - 1; i >= 0; i--) e[i][t] -= e[i][r] * n[r];
	}
	return n;
}
function Hi(e) {
	return e * 180 / Math.PI;
}
function Ui(e) {
	return e * Math.PI / 180;
}
function Wi(e, t) {
	let n = e % t;
	return n * t < 0 ? n + t : n;
}
function Gi(e, t, n) {
	return e + n * (t - e);
}
function Ki(e, t) {
	let n = 10 ** t;
	return Math.round(e * n) / n;
}
function qi(e, t) {
	return Math.floor(Ki(e, t));
}
function Ji(e, t) {
	return Math.ceil(Ki(e, t));
}
function Yi(e, t, n) {
	if (e >= t && e < n) return e;
	let r = n - t;
	return ((e - t) % r + r) % r + t;
}
//#endregion
//#region node_modules/ol/centerconstraint.js
function Xi(e, t, n) {
	return (function(r, i, a, o, s) {
		if (!r) return;
		if (!i && !t) return r;
		let c = t ? 0 : a[0] * i, l = t ? 0 : a[1] * i, u = s ? s[0] : 0, d = s ? s[1] : 0, f = e[0] + c / 2 + u, p = e[2] - c / 2 + u, m = e[1] + l / 2 + d, h = e[3] - l / 2 + d;
		f > p && (f = (p + f) / 2, p = f), m > h && (m = (h + m) / 2, h = m);
		let g = Ri(r[0], f, p), _ = Ri(r[1], m, h);
		if (o && n && i) {
			let e = 30 * i;
			g += -e * Math.log(1 + Math.max(0, f - r[0]) / e) + e * Math.log(1 + Math.max(0, r[0] - p) / e), _ += -e * Math.log(1 + Math.max(0, m - r[1]) / e) + e * Math.log(1 + Math.max(0, r[1] - h) / e);
		}
		return [g, _];
	});
}
function Zi(e) {
	return e;
}
//#endregion
//#region node_modules/ol/extent/Relationship.js
var Qi = {
	UNKNOWN: 0,
	INTERSECTING: 1,
	ABOVE: 2,
	RIGHT: 4,
	BELOW: 8,
	LEFT: 16
};
//#endregion
//#region node_modules/ol/extent.js
function $i(e) {
	let t = ca();
	for (let n = 0, r = e.length; n < r; ++n) ha(t, e[n]);
	return t;
}
function ea(e, t, n) {
	return la(Math.min.apply(null, e), Math.min.apply(null, t), Math.max.apply(null, e), Math.max.apply(null, t), n);
}
function ta(e, t, n) {
	return n ? (n[0] = e[0] - t, n[1] = e[1] - t, n[2] = e[2] + t, n[3] = e[3] + t, n) : [
		e[0] - t,
		e[1] - t,
		e[2] + t,
		e[3] + t
	];
}
function na(e, t) {
	return t ? (t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t) : e.slice();
}
function ra(e, t, n) {
	let r, i;
	return r = t < e[0] ? e[0] - t : e[2] < t ? t - e[2] : 0, i = n < e[1] ? e[1] - n : e[3] < n ? n - e[3] : 0, r * r + i * i;
}
function ia(e, t) {
	return oa(e, t[0], t[1]);
}
function aa(e, t) {
	return e[0] <= t[0] && t[2] <= e[2] && e[1] <= t[1] && t[3] <= e[3];
}
function oa(e, t, n) {
	return e[0] <= t && t <= e[2] && e[1] <= n && n <= e[3];
}
function sa(e, t) {
	let n = e[0], r = e[1], i = e[2], a = e[3], o = t[0], s = t[1], c = Qi.UNKNOWN;
	return o < n ? c |= Qi.LEFT : o > i && (c |= Qi.RIGHT), s < r ? c |= Qi.BELOW : s > a && (c |= Qi.ABOVE), c === Qi.UNKNOWN && (c = Qi.INTERSECTING), c;
}
function ca() {
	return [
		Infinity,
		Infinity,
		-Infinity,
		-Infinity
	];
}
function la(e, t, n, r, i) {
	return i ? (i[0] = e, i[1] = t, i[2] = n, i[3] = r, i) : [
		e,
		t,
		n,
		r
	];
}
function ua(e) {
	return la(Infinity, Infinity, -Infinity, -Infinity, e);
}
function da(e, t) {
	let n = e[0], r = e[1];
	return la(n, r, n, r, t);
}
function fa(e, t, n, r, i) {
	return ga(ua(i), e, t, n, r);
}
function pa(e, t) {
	return e[0] == t[0] && e[2] == t[2] && e[1] == t[1] && e[3] == t[3];
}
function ma(e, t) {
	return t[0] < e[0] && (e[0] = t[0]), t[2] > e[2] && (e[2] = t[2]), t[1] < e[1] && (e[1] = t[1]), t[3] > e[3] && (e[3] = t[3]), e;
}
function ha(e, t) {
	t[0] < e[0] && (e[0] = t[0]), t[0] > e[2] && (e[2] = t[0]), t[1] < e[1] && (e[1] = t[1]), t[1] > e[3] && (e[3] = t[1]);
}
function ga(e, t, n, r, i) {
	for (; n < r; n += i) _a(e, t[n], t[n + 1]);
	return e;
}
function _a(e, t, n) {
	e[0] = Math.min(e[0], t), e[1] = Math.min(e[1], n), e[2] = Math.max(e[2], t), e[3] = Math.max(e[3], n);
}
function va(e, t) {
	let n;
	return n = t(ba(e)), n || (n = t(xa(e)), n) || (n = t(Aa(e)), n) || (n = t(ka(e)), n) ? n : !1;
}
function ya(e) {
	let t = 0;
	return Ma(e) || (t = H(e) * Ea(e)), t;
}
function ba(e) {
	return [e[0], e[1]];
}
function xa(e) {
	return [e[2], e[1]];
}
function Sa(e) {
	return [(e[0] + e[2]) / 2, (e[1] + e[3]) / 2];
}
function Ca(e, t) {
	let n;
	if (t === "bottom-left") n = ba(e);
	else if (t === "bottom-right") n = xa(e);
	else if (t === "top-left") n = ka(e);
	else if (t === "top-right") n = Aa(e);
	else throw Error("Invalid corner");
	return n;
}
function wa(e, t, n, r, i) {
	let [a, o, s, c, l, u, d, f] = Ta(e, t, n, r);
	return la(Math.min(a, s, l, d), Math.min(o, c, u, f), Math.max(a, s, l, d), Math.max(o, c, u, f), i);
}
function Ta(e, t, n, r) {
	let i = t * r[0] / 2, a = t * r[1] / 2, o = Math.cos(n), s = Math.sin(n), c = i * o, l = i * s, u = a * o, d = a * s, f = e[0], p = e[1];
	return [
		f - c + d,
		p - l - u,
		f - c - d,
		p - l + u,
		f + c - d,
		p + l + u,
		f + c + d,
		p + l - u,
		f - c + d,
		p - l - u
	];
}
function Ea(e) {
	return e[3] - e[1];
}
function Da(e, t, n) {
	let r = n || ca();
	return ja(e, t) ? (r[0] = e[0] > t[0] ? e[0] : t[0], r[1] = e[1] > t[1] ? e[1] : t[1], r[2] = e[2] < t[2] ? e[2] : t[2], r[3] = e[3] < t[3] ? e[3] : t[3]) : ua(r), r;
}
function Oa(e, t) {
	if (!ja(e, t)) return [e.slice()];
	if (aa(t, e)) return [];
	let [n, r, i, a] = e, o = Math.max(n, t[0]), s = Math.max(r, t[1]), c = Math.min(i, t[2]), l = Math.min(a, t[3]), u = [];
	return o > n && u.push([
		n,
		r,
		o,
		a
	]), c < i && u.push([
		c,
		r,
		i,
		a
	]), s > r && u.push([
		o,
		r,
		c,
		s
	]), l < a && u.push([
		o,
		l,
		c,
		a
	]), u;
}
function ka(e) {
	return [e[0], e[3]];
}
function Aa(e) {
	return [e[2], e[3]];
}
function H(e) {
	return e[2] - e[0];
}
function ja(e, t) {
	return e[0] <= t[2] && e[2] >= t[0] && e[1] <= t[3] && e[3] >= t[1];
}
function Ma(e) {
	return e[2] < e[0] || e[3] < e[1];
}
function Na(e, t) {
	return t ? (t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t) : e;
}
function Pa(e, t) {
	let n = (e[2] - e[0]) / 2 * (t - 1), r = (e[3] - e[1]) / 2 * (t - 1);
	e[0] -= n, e[2] += n, e[1] -= r, e[3] += r;
}
function Fa(e, t, n) {
	let r = !1, i = sa(e, t), a = sa(e, n);
	if (i === Qi.INTERSECTING || a === Qi.INTERSECTING) r = !0;
	else {
		let o = e[0], s = e[1], c = e[2], l = e[3], u = t[0], d = t[1], f = n[0], p = n[1], m = (p - d) / (f - u), h, g;
		a & Qi.ABOVE && !(i & Qi.ABOVE) && (h = f - (p - l) / m, r = h >= o && h <= c), !r && a & Qi.RIGHT && !(i & Qi.RIGHT) && (g = p - (f - c) * m, r = g >= s && g <= l), !r && a & Qi.BELOW && !(i & Qi.BELOW) && (h = f - (p - s) / m, r = h >= o && h <= c), !r && a & Qi.LEFT && !(i & Qi.LEFT) && (g = p - (f - o) * m, r = g >= s && g <= l);
	}
	return r;
}
function Ia(e, t, n, r) {
	if (Ma(e)) return ua(n);
	let i = [];
	if (r > 1) {
		let t = e[2] - e[0], n = e[3] - e[1];
		for (let a = 0; a < r; ++a) i.push(e[0] + t * a / r, e[1], e[2], e[1] + n * a / r, e[2] - t * a / r, e[3], e[0], e[3] - n * a / r);
	} else i = [
		e[0],
		e[1],
		e[2],
		e[1],
		e[2],
		e[3],
		e[0],
		e[3]
	];
	t(i, i, 2);
	let a = [], o = [];
	for (let e = 0, t = i.length; e < t; e += 2) a.push(i[e]), o.push(i[e + 1]);
	return ea(a, o, n);
}
function La(e, t) {
	let n = t.getExtent(), r = Sa(e);
	if (t.canWrapX() && (r[0] < n[0] || r[0] >= n[2])) {
		let t = H(n), i = Math.floor((r[0] - n[0]) / t) * t;
		e[0] -= i, e[2] -= i;
	}
	return e;
}
function Ra(e, t, n) {
	if (t.canWrapX()) {
		let r = t.getExtent();
		if (!isFinite(e[0]) || !isFinite(e[2])) return [[
			r[0],
			e[1],
			r[2],
			e[3]
		]];
		La(e, t);
		let i = H(r);
		if (H(e) > i && !n) return [[
			r[0],
			e[1],
			r[2],
			e[3]
		]];
		if (e[0] < r[0]) return [[
			e[0] + i,
			e[1],
			r[2],
			e[3]
		], [
			r[0],
			e[1],
			e[2],
			e[3]
		]];
		if (e[2] > r[2]) return [[
			e[0],
			e[1],
			r[2],
			e[3]
		], [
			r[0],
			e[1],
			e[2] - i,
			e[3]
		]];
	}
	return [e];
}
function za(e, t) {
	let n = [e];
	for (let e = 0, r = t.length; e < r && n.length > 0; ++e) {
		let r = [];
		for (let i = 0, a = n.length; i < a; ++i) r.push(...Oa(n[i], t[e]));
		n = r;
	}
	return n;
}
//#endregion
//#region node_modules/ol/coordinate.js
function Ba(e, t) {
	return e[0] += +t[0], e[1] += +t[1], e;
}
function Va(e, t) {
	let n = !0;
	for (let r = e.length - 1; r >= 0; --r) if (e[r] != t[r]) {
		n = !1;
		break;
	}
	return n;
}
function Ha(e, t) {
	let n = Math.cos(t), r = Math.sin(t), i = e[0] * n - e[1] * r, a = e[1] * n + e[0] * r;
	return e[0] = i, e[1] = a, e;
}
function Ua(e, t) {
	return e[0] *= t, e[1] *= t, e;
}
function Wa(e, t) {
	let n = e[0] - t[0], r = e[1] - t[1];
	return n * n + r * r;
}
function Ga(e, t) {
	return Math.sqrt(Wa(e, t));
}
function Ka(e, t) {
	if (t.canWrapX()) {
		let n = H(t.getExtent()), r = qa(e, t, n);
		r && (e[0] -= r * n);
	}
	return e;
}
function qa(e, t, n) {
	let r = t.getExtent(), i = 0;
	return t.canWrapX() && (e[0] < r[0] || e[0] > r[2]) && (n ||= H(r), i = Math.floor((e[0] - r[0]) / n)), i;
}
function Ja(e, t, n) {
	let r = Math.sqrt((t[0] - e[0]) * (t[0] - e[0]) + (t[1] - e[1]) * (t[1] - e[1])), i = [(t[0] - e[0]) / r, (t[1] - e[1]) / r], a = [-i[1], i[0]], o = Math.sqrt((n[0] - e[0]) * (n[0] - e[0]) + (n[1] - e[1]) * (n[1] - e[1])), s = [(n[0] - e[0]) / o, (n[1] - e[1]) / o], c = r === 0 || o === 0 ? 0 : Math.acos(Ri(s[0] * i[0] + s[1] * i[1], -1, 1));
	return c = Math.max(c, 1e-5), s[0] * a[0] + s[1] * a[1] > 0 ? c : Math.PI * 2 - c;
}
//#endregion
//#region node_modules/ol/easing.js
function Ya(e) {
	return e ** 3;
}
function Xa(e) {
	return 1 - Ya(1 - e);
}
function Za(e) {
	return 3 * e * e - 2 * e * e * e;
}
function Qa(e) {
	return e;
}
function $a(e, t, n) {
	n ||= 6371008.8;
	let r = Ui(e[1]), i = Ui(t[1]), a = (i - r) / 2, o = Ui(t[0] - e[0]) / 2, s = Math.sin(a) * Math.sin(a) + Math.sin(o) * Math.sin(o) * Math.cos(r) * Math.cos(i);
	return 2 * n * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
//#endregion
//#region node_modules/ol/console.js
var eo = {
	info: 1,
	warn: 2,
	error: 3,
	none: 4
}, to = eo.info;
function no(...e) {
	to > eo.warn || console.warn(...e);
}
//#endregion
//#region node_modules/ol/proj/Units.js
var ro = {
	radians: 6370997 / (2 * Math.PI),
	degrees: 2 * Math.PI * 6370997 / 360,
	ft: .3048,
	m: 1,
	"us-ft": 1200 / 3937
}, io = class {
	constructor(e) {
		this.code_ = e.code, this.units_ = e.units, this.extent_ = e.extent === void 0 ? null : e.extent, this.worldExtent_ = e.worldExtent === void 0 ? null : e.worldExtent, this.axisOrientation_ = e.axisOrientation === void 0 ? "enu" : e.axisOrientation, this.global_ = e.global !== void 0 && e.global, this.canWrapX_ = !!(this.global_ && this.extent_), this.getPointResolutionFunc_ = e.getPointResolution, this.defaultTileGrid_ = null, this.metersPerUnit_ = e.metersPerUnit;
	}
	canWrapX() {
		return this.canWrapX_;
	}
	getCode() {
		return this.code_;
	}
	getExtent() {
		return this.extent_;
	}
	getUnits() {
		return this.units_;
	}
	getMetersPerUnit() {
		return this.metersPerUnit_ || ro[this.units_];
	}
	getWorldExtent() {
		return this.worldExtent_;
	}
	getAxisOrientation() {
		return this.axisOrientation_;
	}
	isGlobal() {
		return this.global_;
	}
	setGlobal(e) {
		this.global_ = e, this.canWrapX_ = !!(e && this.extent_);
	}
	getDefaultTileGrid() {
		return this.defaultTileGrid_;
	}
	setDefaultTileGrid(e) {
		this.defaultTileGrid_ = e;
	}
	setExtent(e) {
		this.extent_ = e, this.canWrapX_ = !!(this.global_ && e);
	}
	setWorldExtent(e) {
		this.worldExtent_ = e;
	}
	setGetPointResolution(e) {
		this.getPointResolutionFunc_ = e;
	}
	getPointResolutionFunc() {
		return this.getPointResolutionFunc_;
	}
}, ao = 6378137, oo = Math.PI * ao, so = [
	-oo,
	-oo,
	oo,
	oo
], co = [
	-180,
	-85,
	180,
	85
], lo = ao * Math.log(Math.tan(Math.PI / 2)), uo = class extends io {
	constructor(e) {
		super({
			code: e,
			units: "m",
			extent: so,
			global: !0,
			worldExtent: co,
			getPointResolution: function(e, t) {
				return e / Math.cosh(t[1] / ao);
			}
		});
	}
}, fo = [
	new uo("EPSG:3857"),
	new uo("EPSG:102100"),
	new uo("EPSG:102113"),
	new uo("EPSG:900913"),
	new uo("http://www.opengis.net/def/crs/EPSG/0/3857"),
	new uo("http://www.opengis.net/gml/srs/epsg.xml#3857")
];
function po(e, t, n, r) {
	let i = e.length;
	n = n > 1 ? n : 2, r ??= n, t === void 0 && (t = n > 2 ? e.slice() : Array(i));
	for (let n = 0; n < i; n += r) {
		t[n] = oo * e[n] / 180;
		let r = ao * Math.log(Math.tan(Math.PI * (+e[n + 1] + 90) / 360));
		r > lo ? r = lo : r < -lo && (r = -lo), t[n + 1] = r;
	}
	return t;
}
function mo(e, t, n, r) {
	let i = e.length;
	n = n > 1 ? n : 2, r ??= n, t === void 0 && (t = n > 2 ? e.slice() : Array(i));
	for (let n = 0; n < i; n += r) t[n] = 180 * e[n] / oo, t[n + 1] = 360 * Math.atan(Math.exp(e[n + 1] / ao)) / Math.PI - 90;
	return t;
}
//#endregion
//#region node_modules/ol/proj/epsg4326.js
var ho = 6378137, go = [
	-180,
	-90,
	180,
	90
], _o = Math.PI * ho / 180, vo = class extends io {
	constructor(e, t) {
		super({
			code: e,
			units: "degrees",
			extent: go,
			axisOrientation: t,
			global: !0,
			metersPerUnit: _o,
			worldExtent: go
		});
	}
}, yo = [
	new vo("CRS:84"),
	new vo("EPSG:4326", "neu"),
	new vo("urn:ogc:def:crs:OGC:1.3:CRS84"),
	new vo("urn:ogc:def:crs:OGC:2:84"),
	new vo("http://www.opengis.net/def/crs/OGC/1.3/CRS84"),
	new vo("http://www.opengis.net/gml/srs/epsg.xml#4326", "neu"),
	new vo("http://www.opengis.net/def/crs/EPSG/0/4326", "neu")
], bo = {};
function xo(e) {
	return bo[e] || bo[e.replace(/urn:(x-)?ogc:def:crs:EPSG:(.*:)?(\w+)$/, "EPSG:$3")] || null;
}
function So(e, t) {
	bo[e] = t;
}
//#endregion
//#region node_modules/ol/proj/transforms.js
var Co = {};
function wo(e, t, n) {
	let r = e.getCode(), i = t.getCode();
	r in Co || (Co[r] = {}), Co[r][i] = n;
}
function To(e, t) {
	return e in Co && t in Co[e] ? Co[e][t] : null;
}
//#endregion
//#region node_modules/ol/proj/utm.js
var Eo = .9996, Do = .00669438, Oo = Do * Do, ko = Oo * Do, Ao = Do / .99330562, jo = Math.sqrt(.99330562), Mo = (1 - jo) / (1 + jo), No = Mo * Mo, Po = No * Mo, Fo = Po * Mo, Io = Fo * Mo, Lo = 1 - Do / 4 - 3 * Oo / 64 - 5 * ko / 256, Ro = .002514607064228144, zo = 26390466021299826e-22, Bo = 35 * ko / 3072, Vo = 3 / 2 * Mo - 27 / 32 * Po + 269 / 512 * Io, Ho = 21 / 16 * No - 55 / 32 * Fo, Uo = 151 / 96 * Po - 417 / 128 * Io, Wo = 1097 / 512 * Fo, Go = 6378137;
function Ko(e, t, n) {
	let r = e - 5e5, i = (n.north ? t : t - 1e7) / Eo / (Go * Lo), a = i + Vo * Math.sin(2 * i) + Ho * Math.sin(4 * i) + Uo * Math.sin(6 * i) + Wo * Math.sin(8 * i), o = Math.sin(a), s = o * o, c = Math.cos(a), l = o / c, u = l * l, d = u * u, f = 1 - Do * s, p = Go / Math.sqrt(1 - Do * s), m = .99330562 / f, h = Ao * c ** 2, g = h * h, _ = r / (p * Eo), v = _ * _, y = v * _, b = y * _, x = b * _, S = x * _, C = a - l / m * (v / 2 - b / 24 * (5 + 3 * u + 10 * h - 4 * g - 9 * Ao)) + S / 720 * (61 + 90 * u + 298 * h + 45 * d - 252 * Ao - 3 * g), w = (_ - y / 6 * (1 + 2 * u + h) + x / 120 * (5 - 2 * h + 28 * u - 3 * g + 8 * Ao + 24 * d)) / c;
	return w = Yi(w + Ui(Qo(n.number)), -Math.PI, Math.PI), [Hi(w), Hi(C)];
}
var qo = -80, Jo = 84, Yo = -180, Xo = 180;
function Zo(e, t, n) {
	e = Yi(e, Yo, Xo), t < qo ? t = qo : t > Jo && (t = Jo);
	let r = Ui(t), i = Math.sin(r), a = Math.cos(r), o = i / a, s = o * o, c = s * s, l = Ui(e), u = Ui(Qo(n.number)), d = Go / Math.sqrt(1 - Do * i ** 2), f = Ao * a ** 2, p = a * Yi(l - u, -Math.PI, Math.PI), m = p * p, h = m * p, g = h * p, _ = g * p, v = _ * p, y = Go * (Lo * r - Ro * Math.sin(2 * r) + zo * Math.sin(4 * r) - Bo * Math.sin(6 * r)), b = Eo * d * (p + h / 6 * (1 - s + f) + _ / 120 * (5 - 18 * s + c + 72 * f - 58 * Ao)) + 5e5, x = Eo * (y + d * o * (m / 2 + g / 24 * (5 - s + 9 * f + 4 * f ** 2) + v / 720 * (61 - 58 * s + c + 600 * f - 330 * Ao)));
	return n.north || (x += 1e7), [b, x];
}
function Qo(e) {
	return (e - 1) * 6 - 180 + 3;
}
var $o = [
	/^EPSG:(\d+)$/,
	/^urn:ogc:def:crs:EPSG::(\d+)$/,
	/^http:\/\/www\.opengis\.net\/def\/crs\/EPSG\/0\/(\d+)$/
];
function es(e) {
	let t = 0;
	for (let n of $o) {
		let r = e.match(n);
		if (r) {
			t = parseInt(r[1]);
			break;
		}
	}
	if (!t) return null;
	let n = 0, r = !1;
	return t > 32700 && t < 32761 ? n = t - 32700 : t > 32600 && t < 32661 && (r = !0, n = t - 32600), n ? {
		number: n,
		north: r
	} : null;
}
function ts(e, t) {
	return function(n, r, i, a) {
		let o = n.length;
		i = i > 1 ? i : 2, a ??= i, r ||= i > 2 ? n.slice() : Array(o);
		for (let i = 0; i < o; i += a) {
			let a = n[i], o = n[i + 1], s = e(a, o, t);
			r[i] = s[0], r[i + 1] = s[1];
		}
		return r;
	};
}
function ns(e) {
	return es(e) ? new io({
		code: e,
		units: "m"
	}) : null;
}
function rs(e) {
	let t = es(e.getCode());
	return t ? {
		forward: ts(Zo, t),
		inverse: ts(Ko, t)
	} : null;
}
//#endregion
//#region node_modules/ol/proj.js
var is = [rs], as = [ns], os = !0;
function ss(e) {
	os = !(e === void 0 || e);
}
function cs(e, t) {
	if (t !== void 0) {
		for (let n = 0, r = e.length; n < r; ++n) t[n] = e[n];
		t = t;
	} else t = e.slice();
	return t;
}
function ls(e) {
	So(e.getCode(), e), wo(e, e, cs);
}
function us(e) {
	e.forEach(ls);
}
function ds(e) {
	if (typeof e != "string") return e;
	let t = xo(e);
	if (t) return t;
	for (let t of as) {
		let n = t(e);
		if (n) return n;
	}
	return null;
}
function fs(e, t, n, r) {
	e = ds(e);
	let i, a = e.getPointResolutionFunc();
	if (a) {
		if (i = a(t, n), r && r !== e.getUnits()) {
			let t = e.getMetersPerUnit();
			t && (i = i * t / ro[r]);
		}
	} else {
		let a = e.getUnits();
		if (a == "degrees" && !r || r == "degrees") i = t;
		else {
			let o = bs(e, ds("EPSG:4326"));
			if (!o && a !== "degrees") i = t * e.getMetersPerUnit();
			else {
				let e = [
					n[0] - t / 2,
					n[1],
					n[0] + t / 2,
					n[1],
					n[0],
					n[1] - t / 2,
					n[0],
					n[1] + t / 2
				];
				e = o(e, e, 2), i = ($a(e.slice(0, 2), e.slice(2, 4)) + $a(e.slice(4, 6), e.slice(6, 8))) / 2;
			}
			let s = r ? ro[r] : e.getMetersPerUnit();
			s !== void 0 && (i /= s);
		}
	}
	return i;
}
function ps(e) {
	us(e), e.forEach(function(t) {
		e.forEach(function(e) {
			t !== e && wo(t, e, cs);
		});
	});
}
function ms(e, t, n, r) {
	e.forEach(function(e) {
		t.forEach(function(t) {
			wo(e, t, n), wo(t, e, r);
		});
	});
}
function hs(e, t) {
	return e ? typeof e == "string" ? ds(e) : e : ds(t);
}
function gs(e) {
	return (function(t, n, r, i) {
		let a = t.length;
		r = r === void 0 ? 2 : r, i ??= r, n = n === void 0 ? Array(a) : n;
		for (let o = 0; o < a; o += i) {
			let a = e(t.slice(o, o + r)), s = a.length;
			for (let e = 0, r = i; e < r; ++e) n[o + e] = e >= s ? t[o + e] : a[e];
		}
		return n;
	});
}
function _s(e, t) {
	return ss(), Cs(e, "EPSG:4326", t === void 0 ? "EPSG:3857" : t);
}
function vs(e, t) {
	let n = Cs(e, t === void 0 ? "EPSG:3857" : t, "EPSG:4326"), r = n[0];
	return (r < -180 || r > 180) && (n[0] = Wi(r + 180, 360) - 180), n;
}
function ys(e, t) {
	if (e === t) return !0;
	let n = e.getUnits() === t.getUnits();
	return (e.getCode() === t.getCode() || bs(e, t) === cs) && n;
}
function bs(e, t) {
	let n = e.getCode(), r = t.getCode(), i = To(n, r);
	if (i) return i;
	let a = null, o = null;
	for (let n of is) a ||= n(e), o ||= n(t);
	if (!a && !o) return null;
	let s = "EPSG:4326";
	if (!o) {
		let e = To(s, r);
		e && (i = xs(a.inverse, e));
	} else if (a) i = xs(a.inverse, o.forward);
	else {
		let e = To(n, s);
		e && (i = xs(e, o.forward));
	}
	return i && (ls(e), ls(t), wo(e, t, i)), i;
}
function xs(e, t) {
	return function(n, r, i, a) {
		return r = e(n, r, i, a), t(r, r, i, a);
	};
}
function Ss(e, t) {
	return bs(ds(e), ds(t));
}
function Cs(e, t, n) {
	let r = Ss(t, n);
	if (!r) {
		let e = ds(t).getCode(), r = ds(n).getCode();
		throw Error(`No transform available between ${e} and ${r}`);
	}
	return r(e, void 0, e.length);
}
function ws(e, t, n, r) {
	return Ia(e, Ss(t, n), void 0, r);
}
var Ts = null;
function Es() {
	return Ts;
}
function Ds(e, t) {
	return e;
}
function Os(e, t) {
	return os && !Va(e, [0, 0]) && e[0] >= -180 && e[0] <= 180 && e[1] >= -90 && e[1] <= 90 && (os = !1, no("Call useGeographic() from ol/proj once to work with [longitude, latitude] coordinates.")), e;
}
function ks(e, t) {
	return e;
}
function As(e, t) {
	return e;
}
function js(e, t) {
	return e;
}
function Ms() {
	ps(fo), ps(yo), ms(yo, fo, po, mo);
}
Ms();
//#endregion
//#region node_modules/ol/transform.js
var Ns = [
	1,
	0,
	0,
	1,
	0,
	0
], Ps = [
	,
	,
	,
	,
	,
	,
];
function Fs() {
	return Ns.slice(0);
}
function Is(e) {
	return Rs(e, 1, 0, 0, 1, 0, 0);
}
function Ls(e, t) {
	let n = e[0], r = e[1], i = e[2], a = e[3], o = e[4], s = e[5], c = t[0], l = t[1], u = t[2], d = t[3], f = t[4], p = t[5];
	return e[0] = n * c + i * l, e[1] = r * c + a * l, e[2] = n * u + i * d, e[3] = r * u + a * d, e[4] = n * f + i * p + o, e[5] = r * f + a * p + s, e;
}
function Rs(e, t, n, r, i, a, o) {
	return e[0] = t, e[1] = n, e[2] = r, e[3] = i, e[4] = a, e[5] = o, e;
}
function zs(e, t) {
	return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4], e[5] = t[5], e;
}
function Bs(e, t) {
	let n = t[0], r = t[1];
	return t[0] = e[0] * n + e[2] * r + e[4], t[1] = e[1] * n + e[3] * r + e[5], t;
}
function Vs(e, t, n) {
	return Ls(e, Rs(Ps, t, 0, 0, n, 0, 0));
}
function Hs(e, t, n) {
	return Ls(e, Rs(Ps, 1, 0, 0, 1, t, n));
}
function Us(e, t, n, r, i, a, o, s) {
	let c = Math.sin(a), l = Math.cos(a);
	return e[0] = r * l, e[1] = i * c, e[2] = -r * c, e[3] = i * l, e[4] = o * r * l - s * r * c + t, e[5] = o * i * c + s * i * l + n, e;
}
function Ws(e, t) {
	let n = Gs(t);
	V(n !== 0, "Transformation matrix cannot be inverted");
	let r = t[0], i = t[1], a = t[2], o = t[3], s = t[4], c = t[5];
	return e[0] = o / n, e[1] = -i / n, e[2] = -a / n, e[3] = r / n, e[4] = (a * c - o * s) / n, e[5] = -(r * c - i * s) / n, e;
}
function Gs(e) {
	return e[0] * e[3] - e[1] * e[2];
}
var Ks = [
	1e5,
	1e5,
	1e5,
	1e5,
	2,
	2
];
function qs(e) {
	return "matrix(" + e.join(", ") + ")";
}
function Js(e) {
	return e.substring(7, e.length - 1).split(",").map(parseFloat);
}
function Ys(e, t) {
	let n = Js(e), r = Js(t);
	for (let e = 0; e < 6; ++e) if (Math.round((n[e] - r[e]) * Ks[e]) !== 0) return !1;
	return !0;
}
//#endregion
//#region node_modules/ol/geom/flat/transform.js
function Xs(e, t, n, r, i, a, o) {
	a ||= [], o ||= 2;
	let s = 0;
	for (let c = t; c < n; c += r) {
		let t = e[c], n = e[c + 1];
		a[s++] = i[0] * t + i[2] * n + i[4], a[s++] = i[1] * t + i[3] * n + i[5];
		for (let t = 2; t < o; t++) a[s++] = e[c + t];
	}
	return a && a.length != s && (a.length = s), a;
}
function Zs(e, t, n, r, i, a, o) {
	o ||= [];
	let s = Math.cos(i), c = Math.sin(i), l = a[0], u = a[1], d = 0;
	for (let i = t; i < n; i += r) {
		let t = e[i] - l, n = e[i + 1] - u;
		o[d++] = l + t * s - n * c, o[d++] = u + t * c + n * s;
		for (let t = i + 2; t < i + r; ++t) o[d++] = e[t];
	}
	return o && o.length != d && (o.length = d), o;
}
function Qs(e, t, n, r, i, a, o, s) {
	s ||= [];
	let c = o[0], l = o[1], u = 0;
	for (let o = t; o < n; o += r) {
		let t = e[o] - c, n = e[o + 1] - l;
		s[u++] = c + i * t, s[u++] = l + a * n;
		for (let t = o + 2; t < o + r; ++t) s[u++] = e[t];
	}
	return s && s.length != u && (s.length = u), s;
}
function $s(e, t, n, r, i, a, o) {
	o ||= [];
	let s = 0;
	for (let c = t; c < n; c += r) {
		o[s++] = e[c] + i, o[s++] = e[c + 1] + a;
		for (let t = c + 2; t < c + r; ++t) o[s++] = e[t];
	}
	return o && o.length != s && (o.length = s), o;
}
//#endregion
//#region node_modules/ol/geom/Geometry.js
var ec = Fs(), tc = [NaN, NaN], nc = class extends mi {
	constructor() {
		super(), this.extent_ = ca(), this.extentRevision_ = -1, this.simplifiedGeometryMaxMinSquaredTolerance = 0, this.simplifiedGeometryRevision = 0, this.simplifyTransformedInternal = oi((e, t, n) => {
			if (!n) return this.getSimplifiedGeometry(t);
			let r = this.clone();
			return r.applyTransform(n), r.getSimplifiedGeometry(t);
		});
	}
	simplifyTransformed(e, t) {
		return this.simplifyTransformedInternal(this.getRevision(), e, t);
	}
	clone() {
		return R();
	}
	closestPointXY(e, t, n, r) {
		return R();
	}
	containsXY(e, t) {
		return this.closestPointXY(e, t, tc, Number.MIN_VALUE) === 0;
	}
	getClosestPoint(e, t) {
		return t ||= [NaN, NaN], this.closestPointXY(e[0], e[1], t, Infinity), t;
	}
	intersectsCoordinate(e) {
		return this.containsXY(e[0], e[1]);
	}
	computeExtent(e) {
		return R();
	}
	getExtent(e) {
		if (this.extentRevision_ != this.getRevision()) {
			let e = this.computeExtent(this.extent_);
			(isNaN(e[0]) || isNaN(e[1])) && ua(e), this.extentRevision_ = this.getRevision();
		}
		return Na(this.extent_, e);
	}
	rotate(e, t) {
		R();
	}
	scale(e, t, n) {
		R();
	}
	simplify(e) {
		return this.getSimplifiedGeometry(e * e);
	}
	getSimplifiedGeometry(e) {
		return R();
	}
	getType() {
		return R();
	}
	applyTransform(e) {
		R();
	}
	intersectsExtent(e) {
		return R();
	}
	translate(e, t) {
		R();
	}
	transform(e, t) {
		let n = ds(e), r = n.getUnits() == "tile-pixels" ? function(e, r, i) {
			let a = n.getExtent(), o = n.getWorldExtent(), s = Ea(o) / Ea(a);
			Us(ec, o[0], o[3], s, -s, 0, 0, 0);
			let c = Xs(e, 0, e.length, i, ec, r), l = Ss(n, t);
			return l ? l(c, c, i) : c;
		} : Ss(n, t);
		return this.applyTransform(r), this;
	}
}, rc = class extends nc {
	constructor() {
		super(), this.layout = "XY", this.stride = 2, this.flatCoordinates;
	}
	computeExtent(e) {
		return fa(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, e);
	}
	getCoordinates() {
		return R();
	}
	getFirstCoordinate() {
		return this.flatCoordinates.slice(0, this.stride);
	}
	getFlatCoordinates() {
		return this.flatCoordinates;
	}
	getLastCoordinate() {
		return this.flatCoordinates.slice(this.flatCoordinates.length - this.stride);
	}
	getLayout() {
		return this.layout;
	}
	getSimplifiedGeometry(e) {
		if (this.simplifiedGeometryRevision !== this.getRevision() && (this.simplifiedGeometryMaxMinSquaredTolerance = 0, this.simplifiedGeometryRevision = this.getRevision()), e < 0 || this.simplifiedGeometryMaxMinSquaredTolerance !== 0 && e <= this.simplifiedGeometryMaxMinSquaredTolerance) return this;
		let t = this.getSimplifiedGeometryInternal(e);
		return t.getFlatCoordinates().length < this.flatCoordinates.length ? t : (this.simplifiedGeometryMaxMinSquaredTolerance = e, this);
	}
	getSimplifiedGeometryInternal(e) {
		return this;
	}
	getStride() {
		return this.stride;
	}
	setFlatCoordinates(e, t) {
		this.stride = ac(e), this.layout = e, this.flatCoordinates = t;
	}
	setCoordinates(e, t) {
		R();
	}
	setLayout(e, t, n) {
		let r;
		if (e) r = ac(e);
		else {
			for (let e = 0; e < n; ++e) {
				if (t.length === 0) {
					this.layout = "XY", this.stride = 2;
					return;
				}
				t = t[0];
			}
			r = t.length, e = ic(r);
		}
		this.layout = e, this.stride = r;
	}
	applyTransform(e) {
		this.flatCoordinates && (e(this.flatCoordinates, this.flatCoordinates, this.layout.startsWith("XYZ") ? 3 : 2, this.stride), this.changed());
	}
	rotate(e, t) {
		let n = this.getFlatCoordinates();
		if (n) {
			let r = this.getStride();
			Zs(n, 0, n.length, r, e, t, n), this.changed();
		}
	}
	scale(e, t, n) {
		t === void 0 && (t = e), n ||= Sa(this.getExtent());
		let r = this.getFlatCoordinates();
		if (r) {
			let i = this.getStride();
			Qs(r, 0, r.length, i, e, t, n, r), this.changed();
		}
	}
	translate(e, t) {
		let n = this.getFlatCoordinates();
		if (n) {
			let r = this.getStride();
			$s(n, 0, n.length, r, e, t, n), this.changed();
		}
	}
};
function ic(e) {
	let t;
	return e == 2 ? t = "XY" : e == 3 ? t = "XYZ" : e == 4 && (t = "XYZM"), t;
}
function ac(e) {
	let t;
	return e == "XY" ? t = 2 : e == "XYZ" || e == "XYM" ? t = 3 : e == "XYZM" && (t = 4), t;
}
function oc(e, t, n) {
	let r = e.getFlatCoordinates();
	if (!r) return null;
	let i = e.getStride();
	return Xs(r, 0, r.length, i, t, n);
}
//#endregion
//#region node_modules/ol/geom/flat/area.js
function sc(e, t, n, r) {
	let i = 0, a = e[n - r], o = e[n - r + 1], s = 0, c = 0;
	for (; t < n; t += r) {
		let n = e[t] - a, r = e[t + 1] - o;
		i += c * n - s * r, s = n, c = r;
	}
	return i / 2;
}
function cc(e, t, n, r) {
	let i = 0;
	for (let a = 0, o = n.length; a < o; ++a) {
		let o = n[a];
		i += sc(e, t, o, r), t = o;
	}
	return i;
}
function lc(e, t, n, r) {
	let i = 0;
	for (let a = 0, o = n.length; a < o; ++a) {
		let o = n[a];
		i += cc(e, t, o, r), t = o[o.length - 1];
	}
	return i;
}
//#endregion
//#region node_modules/ol/geom/flat/closest.js
function uc(e, t, n, r, i, a, o) {
	let s = e[t], c = e[t + 1], l = e[n] - s, u = e[n + 1] - c, d;
	if (l === 0 && u === 0) d = t;
	else {
		let f = ((i - s) * l + (a - c) * u) / (l * l + u * u);
		if (f > 1) d = n;
		else if (f > 0) {
			for (let i = 0; i < r; ++i) o[i] = Gi(e[t + i], e[n + i], f);
			o.length = r;
			return;
		} else d = t;
	}
	for (let t = 0; t < r; ++t) o[t] = e[d + t];
	o.length = r;
}
function dc(e, t, n, r, i) {
	let a = e[t], o = e[t + 1];
	for (t += r; t < n; t += r) {
		let n = e[t], r = e[t + 1], s = Bi(a, o, n, r);
		s > i && (i = s), a = n, o = r;
	}
	return i;
}
function fc(e, t, n, r, i) {
	for (let a = 0, o = n.length; a < o; ++a) {
		let o = n[a];
		i = dc(e, t, o, r, i), t = o;
	}
	return i;
}
function pc(e, t, n, r, i) {
	for (let a = 0, o = n.length; a < o; ++a) {
		let o = n[a];
		i = fc(e, t, o, r, i), t = o[o.length - 1];
	}
	return i;
}
function mc(e, t, n, r, i, a, o, s, c, l, u) {
	if (t == n) return l;
	let d, f;
	if (i === 0) {
		if (f = Bi(o, s, e[t], e[t + 1]), f < l) {
			for (d = 0; d < r; ++d) c[d] = e[t + d];
			return c.length = r, f;
		}
		return l;
	}
	u ||= [NaN, NaN];
	let p = t + r;
	for (; p < n;) if (uc(e, p - r, p, r, o, s, u), f = Bi(o, s, u[0], u[1]), f < l) {
		for (l = f, d = 0; d < r; ++d) c[d] = u[d];
		c.length = r, p += r;
	} else p += r * Math.max((Math.sqrt(f) - Math.sqrt(l)) / i | 0, 1);
	if (a && (uc(e, n - r, t, r, o, s, u), f = Bi(o, s, u[0], u[1]), f < l)) {
		for (l = f, d = 0; d < r; ++d) c[d] = u[d];
		c.length = r;
	}
	return l;
}
function hc(e, t, n, r, i, a, o, s, c, l, u) {
	u ||= [NaN, NaN];
	for (let d = 0, f = n.length; d < f; ++d) {
		let f = n[d];
		l = mc(e, t, f, r, i, a, o, s, c, l, u), t = f;
	}
	return l;
}
function gc(e, t, n, r, i, a, o, s, c, l, u) {
	u ||= [NaN, NaN];
	for (let d = 0, f = n.length; d < f; ++d) {
		let f = n[d];
		l = hc(e, t, f, r, i, a, o, s, c, l, u), t = f[f.length - 1];
	}
	return l;
}
//#endregion
//#region node_modules/ol/geom/flat/deflate.js
function _c(e, t, n, r) {
	for (let r = 0, i = n.length; r < i; ++r) e[t++] = n[r];
	return t;
}
function vc(e, t, n, r) {
	for (let i = 0, a = n.length; i < a; ++i) {
		let a = n[i];
		for (let n = 0; n < r; ++n) e[t++] = a[n];
	}
	return t;
}
function yc(e, t, n, r, i) {
	i ||= [];
	let a = 0;
	for (let o = 0, s = n.length; o < s; ++o) {
		let s = vc(e, t, n[o], r);
		i[a++] = s, t = s;
	}
	return i.length = a, i;
}
function bc(e, t, n, r, i) {
	i ||= [];
	let a = 0;
	for (let o = 0, s = n.length; o < s; ++o) {
		let s = yc(e, t, n[o], r, i[a]);
		s.length === 0 && (s[0] = t), i[a++] = s, t = s[s.length - 1];
	}
	return i.length = a, i;
}
//#endregion
//#region node_modules/ol/geom/flat/inflate.js
function xc(e, t, n, r, i) {
	i = i === void 0 ? [] : i;
	let a = 0;
	for (let o = t; o < n; o += r) i[a++] = e.slice(o, o + r);
	return i.length = a, i;
}
function Sc(e, t, n, r, i) {
	i = i === void 0 ? [] : i;
	let a = 0;
	for (let o = 0, s = n.length; o < s; ++o) {
		let s = n[o];
		i[a++] = xc(e, t, s, r, i[a]), t = s;
	}
	return i.length = a, i;
}
function Cc(e, t, n, r, i) {
	i = i === void 0 ? [] : i;
	let a = 0;
	for (let o = 0, s = n.length; o < s; ++o) {
		let s = n[o];
		i[a++] = s.length === 1 && s[0] === t ? [] : Sc(e, t, s, r, i[a]), t = s[s.length - 1];
	}
	return i.length = a, i;
}
//#endregion
//#region node_modules/ol/geom/flat/contains.js
function wc(e, t, n, r, i) {
	return !va(i, function(i) {
		return !Tc(e, t, n, r, i[0], i[1]);
	});
}
function Tc(e, t, n, r, i, a) {
	let o = 0, s = e[n - r], c = e[n - r + 1];
	for (; t < n; t += r) {
		let n = e[t], r = e[t + 1];
		c <= a ? r > a && (n - s) * (a - c) - (i - s) * (r - c) > 0 && o++ : r <= a && (n - s) * (a - c) - (i - s) * (r - c) < 0 && o--, s = n, c = r;
	}
	return o !== 0;
}
function Ec(e, t, n, r, i, a) {
	if (n.length === 0 || !Tc(e, t, n[0], r, i, a)) return !1;
	for (let t = 1, o = n.length; t < o; ++t) if (Tc(e, n[t - 1], n[t], r, i, a)) return !1;
	return !0;
}
function Dc(e, t, n, r, i, a) {
	if (n.length === 0) return !1;
	for (let o = 0, s = n.length; o < s; ++o) {
		let s = n[o];
		if (Ec(e, t, s, r, i, a)) return !0;
		t = s[s.length - 1];
	}
	return !1;
}
//#endregion
//#region node_modules/ol/geom/flat/segments.js
function Oc(e, t, n, r, i) {
	let a;
	for (t += r; t < n; t += r) if (a = i(e.slice(t - r, t), e.slice(t, t + r)), a) return a;
	return !1;
}
//#endregion
//#region node_modules/ol/geom/flat/intersectsextent.js
function kc(e, t, n, r, i, a) {
	return a ??= ga(ca(), e, t, n, r), ja(i, a) ? a[0] >= i[0] && a[2] <= i[2] || a[1] >= i[1] && a[3] <= i[3] || Oc(e, t, n, r, function(e, t) {
		return Fa(i, e, t);
	}) : !1;
}
function Ac(e, t, n, r, i) {
	for (let a = 0, o = n.length; a < o; ++a) {
		if (kc(e, t, n[a], r, i)) return !0;
		t = n[a];
	}
	return !1;
}
function jc(e, t, n, r, i) {
	return !!(kc(e, t, n, r, i) || Tc(e, t, n, r, i[0], i[1]) || Tc(e, t, n, r, i[0], i[3]) || Tc(e, t, n, r, i[2], i[1]) || Tc(e, t, n, r, i[2], i[3]));
}
function Mc(e, t, n, r, i) {
	if (!jc(e, t, n[0], r, i)) return !1;
	if (n.length === 1) return !0;
	for (let t = 1, a = n.length; t < a; ++t) if (wc(e, n[t - 1], n[t], r, i) && !kc(e, n[t - 1], n[t], r, i)) return !1;
	return !0;
}
function Nc(e, t, n, r, i) {
	for (let a = 0, o = n.length; a < o; ++a) {
		let o = n[a];
		if (Mc(e, t, o, r, i)) return !0;
		t = o[o.length - 1];
	}
	return !1;
}
//#endregion
//#region node_modules/ol/geom/flat/simplify.js
function Pc(e, t, n, r, i, a, o) {
	let s = (n - t) / r;
	if (s < 3) {
		for (; t < n; t += r) a[o++] = e[t], a[o++] = e[t + 1];
		return o;
	}
	let c = Array(s);
	c[0] = 1, c[s - 1] = 1;
	let l = [t, n - r], u = 0;
	for (; l.length > 0;) {
		let n = l.pop(), a = l.pop(), o = 0, s = e[a], d = e[a + 1], f = e[n], p = e[n + 1];
		for (let t = a + r; t < n; t += r) {
			let n = e[t], r = e[t + 1], i = zi(n, r, s, d, f, p);
			i > o && (u = t, o = i);
		}
		o > i && (c[(u - t) / r] = 1, a + r < u && l.push(a, u), u + r < n && l.push(u, n));
	}
	for (let n = 0; n < s; ++n) c[n] && (a[o++] = e[t + n * r], a[o++] = e[t + n * r + 1]);
	return o;
}
function Fc(e, t, n, r, i, a, o, s) {
	for (let c = 0, l = n.length; c < l; ++c) {
		let l = n[c];
		o = Pc(e, t, l, r, i, a, o), s.push(o), t = l;
	}
	return o;
}
function Ic(e, t) {
	return t * Math.round(e / t);
}
function Lc(e, t, n, r, i, a, o) {
	if (t == n) return o;
	let s = Ic(e[t], i), c = Ic(e[t + 1], i);
	t += r, a[o++] = s, a[o++] = c;
	let l, u;
	do
		if (l = Ic(e[t], i), u = Ic(e[t + 1], i), t += r, t == n) return a[o++] = l, a[o++] = u, o;
	while (l == s && u == c);
	for (; t < n;) {
		let n = Ic(e[t], i), d = Ic(e[t + 1], i);
		if (t += r, n == l && d == u) continue;
		let f = l - s, p = u - c, m = n - s, h = d - c;
		if (f * h == p * m && (f < 0 && m < f || f == m || f > 0 && m > f) && (p < 0 && h < p || p == h || p > 0 && h > p)) {
			l = n, u = d;
			continue;
		}
		a[o++] = l, a[o++] = u, s = l, c = u, l = n, u = d;
	}
	return a[o++] = l, a[o++] = u, o;
}
function Rc(e, t, n, r, i, a, o, s) {
	for (let c = 0, l = n.length; c < l; ++c) {
		let l = n[c];
		o = Lc(e, t, l, r, i, a, o), s.push(o), t = l;
	}
	return o;
}
function zc(e, t, n, r, i, a, o, s) {
	for (let c = 0, l = n.length; c < l; ++c) {
		let l = n[c], u = [];
		o = Rc(e, t, l, r, i, a, o, u), s.push(u), t = l[l.length - 1];
	}
	return o;
}
//#endregion
//#region node_modules/ol/geom/LinearRing.js
var Bc = class e extends rc {
	constructor(e, t) {
		super(), this.maxDelta_ = -1, this.maxDeltaRevision_ = -1, t !== void 0 && !Array.isArray(e[0]) ? this.setFlatCoordinates(t, e) : this.setCoordinates(e, t);
	}
	clone() {
		return new e(this.flatCoordinates.slice(), this.layout);
	}
	closestPointXY(e, t, n, r) {
		return r < ra(this.getExtent(), e, t) ? r : (this.maxDeltaRevision_ != this.getRevision() && (this.maxDelta_ = Math.sqrt(dc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, 0)), this.maxDeltaRevision_ = this.getRevision()), mc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, this.maxDelta_, !0, e, t, n, r));
	}
	getArea() {
		return sc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
	}
	getCoordinates() {
		return xc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
	}
	getSimplifiedGeometryInternal(t) {
		let n = [];
		return n.length = Pc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, t, n, 0), new e(n, "XY");
	}
	getType() {
		return "LinearRing";
	}
	intersectsExtent(e) {
		return kc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, e);
	}
	setCoordinates(e, t) {
		this.setLayout(t, e, 1), this.flatCoordinates ||= [], this.flatCoordinates.length = vc(this.flatCoordinates, 0, e, this.stride), this.changed();
	}
}, Vc = class e extends rc {
	constructor(e, t) {
		super(), this.setCoordinates(e, t);
	}
	clone() {
		let t = new e(this.flatCoordinates.slice(), this.layout);
		return t.applyProperties(this), t;
	}
	closestPointXY(e, t, n, r) {
		let i = this.flatCoordinates, a = Bi(e, t, i[0], i[1]);
		if (a < r) {
			let e = this.stride;
			for (let t = 0; t < e; ++t) n[t] = i[t];
			return n.length = e, a;
		}
		return r;
	}
	getCoordinates() {
		return this.flatCoordinates.slice();
	}
	computeExtent(e) {
		return da(this.flatCoordinates, e);
	}
	getType() {
		return "Point";
	}
	intersectsExtent(e) {
		return oa(e, this.flatCoordinates[0], this.flatCoordinates[1]);
	}
	setCoordinates(e, t) {
		this.setLayout(t, e, 0), this.flatCoordinates ||= [], this.flatCoordinates.length = _c(this.flatCoordinates, 0, e, this.stride), this.changed();
	}
};
//#endregion
//#region node_modules/ol/geom/flat/interiorpoint.js
function Hc(e, t, n, r, i, a, o) {
	let s, c, l, u, d, f, p, m = i[a + 1], h = [];
	for (let i = 0, a = n.length; i < a; ++i) {
		let a = n[i];
		for (u = e[a - r], f = e[a - r + 1], s = t; s < a; s += r) d = e[s], p = e[s + 1], (m <= f && p <= m || f <= m && m <= p) && (l = (m - f) / (p - f) * (d - u) + u, h.push(l)), u = d, f = p;
	}
	let g = NaN, _ = -Infinity;
	for (h.sort(Xr), u = h[0], s = 1, c = h.length; s < c; ++s) {
		d = h[s];
		let i = Math.abs(d - u);
		i > _ && (l = (u + d) / 2, Ec(e, t, n, r, l, m) && (g = l, _ = i)), u = d;
	}
	return isNaN(g) && (g = i[a]), o ? (o.push(g, m, _), o) : [
		g,
		m,
		_
	];
}
function Uc(e, t, n, r, i) {
	let a = [];
	for (let o = 0, s = n.length; o < s; ++o) {
		let s = n[o];
		a = Hc(e, t, s, r, i, 2 * o, a), t = s[s.length - 1];
	}
	return a;
}
//#endregion
//#region node_modules/ol/geom/flat/reverse.js
function Wc(e, t, n, r) {
	for (; t < n - r;) {
		for (let i = 0; i < r; ++i) {
			let a = e[t + i];
			e[t + i] = e[n - r + i], e[n - r + i] = a;
		}
		t += r, n -= r;
	}
}
//#endregion
//#region node_modules/ol/geom/flat/orient.js
function Gc(e, t, n, r) {
	let i = 0, a = e[n - r], o = e[n - r + 1];
	for (; t < n; t += r) {
		let n = e[t], r = e[t + 1];
		i += (n - a) * (r + o), a = n, o = r;
	}
	return i === 0 ? void 0 : i > 0;
}
function Kc(e, t, n, r, i) {
	i = i !== void 0 && i;
	for (let a = 0, o = n.length; a < o; ++a) {
		let o = n[a], s = Gc(e, t, o, r);
		if (a === 0) {
			if (i && s || !i && !s) return !1;
		} else if (i && !s || !i && s) return !1;
		t = o;
	}
	return !0;
}
function qc(e, t, n, r, i) {
	for (let a = 0, o = n.length; a < o; ++a) {
		let o = n[a];
		if (!Kc(e, t, o, r, i)) return !1;
		o.length && (t = o[o.length - 1]);
	}
	return !0;
}
function Jc(e, t, n, r, i) {
	i = i !== void 0 && i;
	for (let a = 0, o = n.length; a < o; ++a) {
		let o = n[a], s = Gc(e, t, o, r);
		(a === 0 ? i && s || !i && !s : i && !s || !i && s) && Wc(e, t, o, r), t = o;
	}
	return t;
}
function Yc(e, t, n, r, i) {
	for (let a = 0, o = n.length; a < o; ++a) t = Jc(e, t, n[a], r, i);
	return t;
}
function Xc(e, t) {
	let n = [], r = 0, i = 0, a;
	for (let o = 0, s = t.length; o < s; ++o) {
		let s = t[o], c = Gc(e, r, s, 2);
		if (a === void 0 && (a = c), c === a) n.push(t.slice(i, o + 1));
		else {
			if (n.length === 0) continue;
			n[n.length - 1].push(t[i]);
		}
		i = o + 1, r = s;
	}
	return n;
}
//#endregion
//#region node_modules/ol/geom/Polygon.js
var Zc = class e extends rc {
	constructor(e, t, n) {
		super(), this.ends_ = [], this.flatInteriorPointRevision_ = -1, this.flatInteriorPoint_ = null, this.maxDelta_ = -1, this.maxDeltaRevision_ = -1, this.orientedRevision_ = -1, this.orientedFlatCoordinates_ = null, t !== void 0 && n ? (this.setFlatCoordinates(t, e), this.ends_ = n) : this.setCoordinates(e, t);
	}
	appendLinearRing(e) {
		this.flatCoordinates ? ei(this.flatCoordinates, e.getFlatCoordinates()) : this.flatCoordinates = e.getFlatCoordinates().slice(), this.ends_.push(this.flatCoordinates.length), this.changed();
	}
	clone() {
		let t = new e(this.flatCoordinates.slice(), this.layout, this.ends_.slice());
		return t.applyProperties(this), t;
	}
	closestPointXY(e, t, n, r) {
		return r < ra(this.getExtent(), e, t) ? r : (this.maxDeltaRevision_ != this.getRevision() && (this.maxDelta_ = Math.sqrt(fc(this.flatCoordinates, 0, this.ends_, this.stride, 0)), this.maxDeltaRevision_ = this.getRevision()), hc(this.flatCoordinates, 0, this.ends_, this.stride, this.maxDelta_, !0, e, t, n, r));
	}
	containsXY(e, t) {
		return Ec(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, e, t);
	}
	getArea() {
		return cc(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride);
	}
	getCoordinates(e) {
		let t;
		return e === void 0 ? t = this.flatCoordinates : (t = this.getOrientedFlatCoordinates().slice(), Jc(t, 0, this.ends_, this.stride, e)), Sc(t, 0, this.ends_, this.stride);
	}
	getEnds() {
		return this.ends_;
	}
	getFlatInteriorPoint() {
		if (this.flatInteriorPointRevision_ != this.getRevision()) {
			let e = Sa(this.getExtent());
			this.flatInteriorPoint_ = Hc(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, e, 0), this.flatInteriorPointRevision_ = this.getRevision();
		}
		return this.flatInteriorPoint_;
	}
	getInteriorPoint() {
		return new Vc(this.getFlatInteriorPoint(), "XYM");
	}
	getLinearRingCount() {
		return this.ends_.length;
	}
	getLinearRing(e) {
		return e < 0 || this.ends_.length <= e ? null : new Bc(this.flatCoordinates.slice(e === 0 ? 0 : this.ends_[e - 1], this.ends_[e]), this.layout);
	}
	getLinearRings() {
		let e = this.layout, t = this.flatCoordinates, n = this.ends_, r = [], i = 0;
		for (let a = 0, o = n.length; a < o; ++a) {
			let o = n[a], s = new Bc(t.slice(i, o), e);
			r.push(s), i = o;
		}
		return r;
	}
	getOrientedFlatCoordinates() {
		if (this.orientedRevision_ != this.getRevision()) {
			let e = this.flatCoordinates;
			Kc(e, 0, this.ends_, this.stride) ? this.orientedFlatCoordinates_ = e : (this.orientedFlatCoordinates_ = e.slice(), this.orientedFlatCoordinates_.length = Jc(this.orientedFlatCoordinates_, 0, this.ends_, this.stride)), this.orientedRevision_ = this.getRevision();
		}
		return this.orientedFlatCoordinates_;
	}
	getSimplifiedGeometryInternal(t) {
		let n = [], r = [];
		return n.length = Rc(this.flatCoordinates, 0, this.ends_, this.stride, Math.sqrt(t), n, 0, r), new e(n, "XY", r);
	}
	getType() {
		return "Polygon";
	}
	intersectsExtent(e) {
		return Mc(this.getOrientedFlatCoordinates(), 0, this.ends_, this.stride, e);
	}
	setCoordinates(e, t) {
		this.setLayout(t, e, 2), this.flatCoordinates ||= [];
		let n = yc(this.flatCoordinates, 0, e, this.stride, this.ends_);
		this.flatCoordinates.length = n.length === 0 ? 0 : n[n.length - 1], this.changed();
	}
};
function Qc(e) {
	if (Ma(e)) throw Error("Cannot create polygon from empty extent");
	let t = e[0], n = e[1], r = e[2], i = e[3], a = [
		t,
		n,
		t,
		i,
		r,
		i,
		r,
		n,
		t,
		n
	];
	return new Zc(a, "XY", [a.length]);
}
//#endregion
//#region node_modules/ol/resolutionconstraint.js
function $c(e, t, n, r) {
	let i = H(t) / n[0], a = Ea(t) / n[1];
	return r ? Math.min(e, Math.max(i, a)) : Math.min(e, Math.min(i, a));
}
function el(e, t, n) {
	let r = Math.min(e, t);
	return r *= Math.log(1 + 50 * Math.max(0, e / t - 1)) / 50 + 1, n && (r = Math.max(r, n), r /= Math.log(1 + 50 * Math.max(0, n / e - 1)) / 50 + 1), Ri(r, n / 2, t * 2);
}
function tl(e, t, n, r) {
	return t = t === void 0 || t, (function(i, a, o, s) {
		if (i !== void 0) {
			let c = e[0], l = e[e.length - 1], u = n ? $c(c, n, o, r) : c;
			if (s) return t ? el(i, u, l) : Ri(i, l, u);
			let d = Math.floor(Qr(e, Math.min(u, i), a));
			return e[d] > u && d < e.length - 1 ? e[d + 1] : e[d];
		}
	});
}
function nl(e, t, n, r, i, a) {
	return r = r === void 0 || r, n = n === void 0 ? 0 : n, (function(o, s, c, l) {
		if (o !== void 0) {
			let u = i ? $c(t, i, c, a) : t;
			if (l) return r ? el(o, u, n) : Ri(o, n, u);
			let d = Math.ceil(Math.log(t / u) / Math.log(e) - 1e-9), f = -s * .499999999 + .5, p = Math.floor(Math.log(t / Math.min(u, o)) / Math.log(e) + f);
			return Ri(t / e ** +Math.max(d, p), n, u);
		}
	});
}
function rl(e, t, n, r, i) {
	return n = n === void 0 || n, (function(a, o, s, c) {
		if (a !== void 0) {
			let o = r ? $c(e, r, s, i) : e;
			return !n || !c ? Ri(a, t, o) : el(a, o, t);
		}
	});
}
//#endregion
//#region node_modules/ol/rotationconstraint.js
function il(e) {
	if (e !== void 0) return 0;
}
function al(e) {
	if (e !== void 0) return e;
}
function ol(e) {
	let t = 2 * Math.PI / e;
	return (function(e, n) {
		if (n) return e;
		if (e !== void 0) return e = Math.floor(e / t + .5) * t, e;
	});
}
function sl(e) {
	let t = e === void 0 ? Ui(5) : e;
	return (function(e, n) {
		return n || e === void 0 ? e : Math.abs(e) <= t ? 0 : e;
	});
}
//#endregion
//#region node_modules/ol/View.js
var cl = 0, ll = class extends mi {
	constructor(e) {
		super(), this.on, this.once, this.un, e = Object.assign({}, e), this.hints_ = [0, 0], this.animations_ = [], this.updateAnimationKey_, this.projection_ = hs(e.projection, "EPSG:3857"), this.viewportSize_ = [100, 100], this.targetCenter_ = null, this.targetResolution_, this.targetRotation_, this.nextCenter_ = null, this.nextResolution_, this.nextRotation_, this.cancelAnchor_ = void 0, e.projection && ss(), e.center && (e.center = Os(e.center, this.projection_)), e.extent && (e.extent = As(e.extent, this.projection_)), this.applyOptions_(e);
	}
	applyOptions_(e) {
		let t = Object.assign({}, e);
		for (let e in Li) delete t[e];
		this.setProperties(t, !0);
		let n = fl(e);
		this.maxResolution_ = n.maxResolution, this.minResolution_ = n.minResolution, this.zoomFactor_ = n.zoomFactor, this.resolutions_ = e.resolutions, this.padding_ = e.padding, this.minZoom_ = n.minZoom;
		let r = dl(e), i = n.constraint, a = pl(e);
		this.constraints_ = {
			center: r,
			resolution: i,
			rotation: a
		}, this.setRotation(e.rotation === void 0 ? 0 : e.rotation), this.setCenterInternal(e.center === void 0 ? null : e.center), e.resolution === void 0 ? e.zoom !== void 0 && this.setZoom(e.zoom) : this.setResolution(e.resolution);
	}
	get padding() {
		return this.padding_;
	}
	set padding(e) {
		let t = this.padding_;
		this.padding_ = e;
		let n = this.getCenterInternal();
		if (n) {
			let r = e || [
				0,
				0,
				0,
				0
			];
			t ||= [
				0,
				0,
				0,
				0
			];
			let i = this.getResolution(), a = i / 2 * (r[3] - t[3] + t[1] - r[1]), o = i / 2 * (r[0] - t[0] + t[2] - r[2]);
			this.setCenterInternal([n[0] + a, n[1] - o]);
		}
	}
	getUpdatedOptions_(e) {
		let t = this.getProperties();
		return t.resolution === void 0 ? t.zoom = this.getZoom() : t.resolution = this.getResolution(), t.center = this.getCenterInternal(), t.rotation = this.getRotation(), Object.assign({}, t, e);
	}
	animate(e) {
		this.isDef() && !this.getAnimating() && this.resolveConstraints(0);
		let t = Array(arguments.length);
		for (let e = 0; e < t.length; ++e) {
			let n = arguments[e];
			n.center && (n = Object.assign({}, n), n.center = Os(n.center, this.getProjection())), n.anchor && (n = Object.assign({}, n), n.anchor = Os(n.anchor, this.getProjection())), t[e] = n;
		}
		this.animateInternal.apply(this, t);
	}
	animateInternal(e) {
		let t = arguments.length, n;
		t > 1 && typeof arguments[t - 1] == "function" && (n = arguments[t - 1], --t);
		let r = 0;
		for (; r < t && !this.isDef(); ++r) {
			let e = arguments[r];
			e.center && this.setCenterInternal(e.center), e.zoom === void 0 ? e.resolution && this.setResolution(e.resolution) : this.setZoom(e.zoom), e.rotation !== void 0 && this.setRotation(e.rotation);
		}
		if (r === t) {
			n && ul(n, !0);
			return;
		}
		let i = Date.now(), a = this.targetCenter_.slice(), o = this.targetResolution_, s = this.targetRotation_, c = [];
		for (; r < t; ++r) {
			let e = arguments[r], t = {
				start: i,
				complete: !1,
				anchor: e.anchor,
				duration: e.duration === void 0 ? 1e3 : e.duration,
				easing: e.easing || Za,
				callback: n
			};
			if (e.center && (t.sourceCenter = a, t.targetCenter = e.center.slice(), a = t.targetCenter), e.zoom === void 0 ? e.resolution && (t.sourceResolution = o, t.targetResolution = e.resolution, o = t.targetResolution) : (t.sourceResolution = o, t.targetResolution = this.getResolutionForZoom(e.zoom), o = t.targetResolution), e.rotation !== void 0) {
				t.sourceRotation = s;
				let n = Wi(e.rotation - s + Math.PI, 2 * Math.PI) - Math.PI;
				t.targetRotation = s + n, s = t.targetRotation;
			}
			ml(t) ? t.complete = !0 : i += t.duration, c.push(t);
		}
		this.animations_.push(c), this.setHint(Ii.ANIMATING, 1), this.updateAnimations_();
	}
	getAnimating() {
		return this.hints_[Ii.ANIMATING] > 0;
	}
	getInteracting() {
		return this.hints_[Ii.INTERACTING] > 0;
	}
	cancelAnimations() {
		this.setHint(Ii.ANIMATING, -this.hints_[Ii.ANIMATING]);
		let e;
		for (let t = 0, n = this.animations_.length; t < n; ++t) {
			let n = this.animations_[t];
			if (n[0].callback && ul(n[0].callback, !1), !e) for (let t = 0, r = n.length; t < r; ++t) {
				let r = n[t];
				if (!r.complete) {
					e = r.anchor;
					break;
				}
			}
		}
		this.animations_.length = 0, this.cancelAnchor_ = e, this.nextCenter_ = null, this.nextResolution_ = NaN, this.nextRotation_ = NaN;
	}
	updateAnimations_() {
		if (this.updateAnimationKey_ !== void 0 && (cancelAnimationFrame(this.updateAnimationKey_), this.updateAnimationKey_ = void 0), !this.getAnimating()) return;
		let e = Date.now(), t = !1;
		for (let n = this.animations_.length - 1; n >= 0; --n) {
			let r = this.animations_[n], i = !0;
			for (let n = 0, a = r.length; n < a; ++n) {
				let a = r[n];
				if (a.complete) continue;
				let o = e - a.start, s = a.duration > 0 ? o / a.duration : 1;
				s >= 1 ? (a.complete = !0, s = 1) : i = !1;
				let c = a.easing(s);
				if (a.sourceCenter) {
					let e = a.sourceCenter[0], t = a.sourceCenter[1], n = a.targetCenter[0], r = a.targetCenter[1];
					this.nextCenter_ = a.targetCenter;
					let i = e + c * (n - e), o = t + c * (r - t);
					this.targetCenter_ = [i, o];
				}
				if (a.sourceResolution && a.targetResolution) {
					let e = c === 1 ? a.targetResolution : a.sourceResolution + c * (a.targetResolution - a.sourceResolution);
					if (a.anchor) {
						let t = this.getViewportSize_(this.getRotation()), n = this.constraints_.resolution(e, 0, t, !0);
						this.targetCenter_ = this.calculateCenterZoom(n, a.anchor);
					}
					this.nextResolution_ = a.targetResolution, this.targetResolution_ = e, this.applyTargetState_(!0);
				}
				if (a.sourceRotation !== void 0 && a.targetRotation !== void 0) {
					let e = c === 1 ? Wi(a.targetRotation + Math.PI, 2 * Math.PI) - Math.PI : a.sourceRotation + c * (a.targetRotation - a.sourceRotation);
					if (a.anchor) {
						let t = this.constraints_.rotation(e, !0);
						this.targetCenter_ = this.calculateCenterRotate(t, a.anchor);
					}
					this.nextRotation_ = a.targetRotation, this.targetRotation_ = e;
				}
				if (this.applyTargetState_(!0), t = !0, !a.complete) break;
			}
			if (i) {
				this.animations_[n] = null, this.setHint(Ii.ANIMATING, -1), this.nextCenter_ = null, this.nextResolution_ = NaN, this.nextRotation_ = NaN;
				let e = r[0].callback;
				e && ul(e, !0);
			}
		}
		this.animations_ = this.animations_.filter(Boolean), t && this.updateAnimationKey_ === void 0 && (this.updateAnimationKey_ = requestAnimationFrame(this.updateAnimations_.bind(this)));
	}
	calculateCenterRotate(e, t) {
		let n, r = this.getCenterInternal();
		return r !== void 0 && (n = [r[0] - t[0], r[1] - t[1]], Ha(n, e - this.getRotation()), Ba(n, t)), n;
	}
	calculateCenterZoom(e, t) {
		let n, r = this.getCenterInternal(), i = this.getResolution();
		return r !== void 0 && i !== void 0 && (n = [t[0] - e * (t[0] - r[0]) / i, t[1] - e * (t[1] - r[1]) / i]), n;
	}
	getViewportSize_(e) {
		let t = this.viewportSize_;
		if (e) {
			let n = t[0], r = t[1];
			return [Math.abs(n * Math.cos(e)) + Math.abs(r * Math.sin(e)), Math.abs(n * Math.sin(e)) + Math.abs(r * Math.cos(e))];
		}
		return t;
	}
	setViewportSize(e) {
		this.viewportSize_ = Array.isArray(e) ? e.slice() : [100, 100], this.getAnimating() || this.resolveConstraints(0);
	}
	getCenter() {
		let e = this.getCenterInternal();
		return e && Ds(e, this.getProjection());
	}
	getCenterInternal() {
		return this.get(Li.CENTER);
	}
	getConstraints() {
		return this.constraints_;
	}
	getConstrainResolution() {
		return this.get("constrainResolution");
	}
	getHints(e) {
		return e === void 0 ? this.hints_.slice() : (e[0] = this.hints_[0], e[1] = this.hints_[1], e);
	}
	calculateExtent(e) {
		return ks(this.calculateExtentInternal(e), this.getProjection());
	}
	calculateExtentInternal(e) {
		e ||= this.getViewportSizeMinusPadding_();
		let t = this.getCenterInternal();
		V(t, "The view center is not defined");
		let n = this.getResolution();
		V(n !== void 0, "The view resolution is not defined");
		let r = this.getRotation();
		return V(r !== void 0, "The view rotation is not defined"), wa(t, n, r, e);
	}
	getMaxResolution() {
		return this.maxResolution_;
	}
	getMinResolution() {
		return this.minResolution_;
	}
	getMaxZoom() {
		return this.getZoomForResolution(this.minResolution_);
	}
	setMaxZoom(e) {
		this.applyOptions_(this.getUpdatedOptions_({ maxZoom: e }));
	}
	getMinZoom() {
		return this.getZoomForResolution(this.maxResolution_);
	}
	setMinZoom(e) {
		this.applyOptions_(this.getUpdatedOptions_({ minZoom: e }));
	}
	setConstrainResolution(e) {
		this.applyOptions_(this.getUpdatedOptions_({ constrainResolution: e }));
	}
	getProjection() {
		return this.projection_;
	}
	getResolution() {
		return this.get(Li.RESOLUTION);
	}
	getResolutions() {
		return this.resolutions_;
	}
	getResolutionForExtent(e, t) {
		return this.getResolutionForExtentInternal(As(e, this.getProjection()), t);
	}
	getResolutionForExtentInternal(e, t) {
		t ||= this.getViewportSizeMinusPadding_();
		let n = H(e) / t[0], r = Ea(e) / t[1];
		return Math.max(n, r);
	}
	getResolutionForValueFunction(e) {
		e ||= 2;
		let t = this.getConstrainedResolution(this.maxResolution_), n = this.minResolution_, r = Math.log(t / n) / Math.log(e);
		return (function(n) {
			return t / e ** +(n * r);
		});
	}
	getRotation() {
		return this.get(Li.ROTATION);
	}
	getValueForResolutionFunction(e) {
		let t = Math.log(e || 2), n = this.getConstrainedResolution(this.maxResolution_), r = this.minResolution_, i = Math.log(n / r) / t;
		return (function(e) {
			return Math.log(n / e) / t / i;
		});
	}
	getViewportSizeMinusPadding_(e) {
		let t = this.getViewportSize_(e), n = this.padding_;
		return n && (t = [t[0] - n[1] - n[3], t[1] - n[0] - n[2]]), t;
	}
	getState() {
		let e = this.getProjection(), t = this.getResolution(), n = this.getRotation(), r = this.getCenterInternal(), i = this.padding_;
		if (i) {
			let e = this.getViewportSizeMinusPadding_();
			r = hl(r, this.getViewportSize_(), [e[0] / 2 + i[3], e[1] / 2 + i[0]], t, n);
		}
		return {
			center: r.slice(0),
			projection: e === void 0 ? null : e,
			resolution: t,
			nextCenter: this.nextCenter_,
			nextResolution: this.nextResolution_,
			nextRotation: this.nextRotation_,
			rotation: n,
			zoom: this.getZoom()
		};
	}
	getViewStateAndExtent() {
		return {
			viewState: this.getState(),
			extent: this.calculateExtent()
		};
	}
	getZoom() {
		let e, t = this.getResolution();
		return t !== void 0 && (e = this.getZoomForResolution(t)), e;
	}
	getZoomForResolution(e) {
		let t = this.minZoom_ || 0, n, r;
		if (this.resolutions_) {
			let i = Qr(this.resolutions_, e, 1);
			t = i, n = this.resolutions_[i], r = i == this.resolutions_.length - 1 ? 2 : n / this.resolutions_[i + 1];
		} else n = this.maxResolution_, r = this.zoomFactor_;
		return t + Math.log(n / e) / Math.log(r);
	}
	getResolutionForZoom(e) {
		if (this.resolutions_?.length) {
			if (this.resolutions_.length === 1) return this.resolutions_[0];
			let t = Ri(Math.floor(e), 0, this.resolutions_.length - 2), n = this.resolutions_[t] / this.resolutions_[t + 1];
			return this.resolutions_[t] / n ** +Ri(e - t, 0, 1);
		}
		return this.maxResolution_ / this.zoomFactor_ ** +(e - this.minZoom_);
	}
	fit(e, t) {
		let n;
		if (V(Array.isArray(e) || typeof e.getSimplifiedGeometry == "function", "Invalid extent or geometry provided as `geometry`"), Array.isArray(e)) V(!Ma(e), "Cannot fit empty extent provided as `geometry`"), n = Qc(As(e, this.getProjection()));
		else if (e.getType() === "Circle") {
			let t = As(e.getExtent(), this.getProjection());
			n = Qc(t), n.rotate(this.getRotation(), Sa(t));
		} else {
			let t = Es();
			n = t ? e.clone().transform(t, this.getProjection()) : e;
		}
		this.fitInternal(n, t);
	}
	rotatedExtentForGeometry(e) {
		let t = this.getRotation(), n = Math.cos(t), r = Math.sin(-t), i = e.getFlatCoordinates(), a = e.getStride(), o = Infinity, s = Infinity, c = -Infinity, l = -Infinity;
		for (let e = 0, t = i.length; e < t; e += a) {
			let t = i[e] * n - i[e + 1] * r, a = i[e] * r + i[e + 1] * n;
			o = Math.min(o, t), s = Math.min(s, a), c = Math.max(c, t), l = Math.max(l, a);
		}
		return [
			o,
			s,
			c,
			l
		];
	}
	fitInternal(e, t) {
		t ||= {};
		let n = t.size;
		n ||= this.getViewportSizeMinusPadding_();
		let r = t.padding === void 0 ? [
			0,
			0,
			0,
			0
		] : t.padding, i = t.nearest !== void 0 && t.nearest, a;
		a = t.minResolution === void 0 ? t.maxZoom === void 0 ? 0 : this.getResolutionForZoom(t.maxZoom) : t.minResolution;
		let o = this.rotatedExtentForGeometry(e), s = this.getResolutionForExtentInternal(o, [n[0] - r[1] - r[3], n[1] - r[0] - r[2]]);
		s = isNaN(s) ? a : Math.max(s, a), s = this.getConstrainedResolution(s, +!i);
		let c = this.getRotation(), l = Math.sin(c), u = Math.cos(c), d = Sa(o);
		d[0] += (r[1] - r[3]) / 2 * s, d[1] += (r[0] - r[2]) / 2 * s;
		let f = d[0] * u - d[1] * l, p = d[1] * u + d[0] * l, m = this.getConstrainedCenter([f, p], s), h = t.callback ? t.callback : ai;
		t.duration === void 0 ? (this.targetResolution_ = s, this.targetCenter_ = m, this.applyTargetState_(!1, !0), ul(h, !0)) : this.animateInternal({
			resolution: s,
			center: m,
			duration: t.duration,
			easing: t.easing
		}, h);
	}
	centerOn(e, t, n) {
		this.centerOnInternal(Os(e, this.getProjection()), t, n);
	}
	centerOnInternal(e, t, n) {
		this.setCenterInternal(hl(e, t, n, this.getResolution(), this.getRotation()));
	}
	calculateCenterShift(e, t, n, r) {
		let i, a = this.padding_;
		if (a && e) {
			let o = this.getViewportSizeMinusPadding_(-n), s = hl(e, r, [o[0] / 2 + a[3], o[1] / 2 + a[0]], t, n);
			i = [e[0] - s[0], e[1] - s[1]];
		}
		return i;
	}
	isDef() {
		return !!this.getCenterInternal() && this.getResolution() !== void 0;
	}
	adjustCenter(e) {
		let t = Ds(this.targetCenter_, this.getProjection());
		this.setCenter([t[0] + e[0], t[1] + e[1]]);
	}
	adjustCenterInternal(e) {
		let t = this.targetCenter_;
		this.setCenterInternal([t[0] + e[0], t[1] + e[1]]);
	}
	adjustResolution(e, t) {
		t &&= Os(t, this.getProjection()), this.adjustResolutionInternal(e, t);
	}
	adjustResolutionInternal(e, t) {
		let n = this.getAnimating() || this.getInteracting(), r = this.getViewportSize_(this.getRotation()), i = this.constraints_.resolution(this.targetResolution_ * e, 0, r, n);
		t && (this.targetCenter_ = this.calculateCenterZoom(i, t)), this.targetResolution_ *= e, this.applyTargetState_();
	}
	adjustZoom(e, t) {
		this.adjustResolution(this.zoomFactor_ ** +-e, t);
	}
	adjustRotation(e, t) {
		t &&= Os(t, this.getProjection()), this.adjustRotationInternal(e, t);
	}
	adjustRotationInternal(e, t) {
		let n = this.getAnimating() || this.getInteracting(), r = this.constraints_.rotation(this.targetRotation_ + e, n);
		t && (this.targetCenter_ = this.calculateCenterRotate(r, t)), this.targetRotation_ += e, this.applyTargetState_();
	}
	setCenter(e) {
		this.setCenterInternal(e && Os(e, this.getProjection()));
	}
	setCenterInternal(e) {
		this.targetCenter_ = e, this.applyTargetState_();
	}
	setHint(e, t) {
		return this.hints_[e] += t, this.changed(), this.hints_[e];
	}
	setResolution(e) {
		this.targetResolution_ = e, this.applyTargetState_();
	}
	setRotation(e) {
		this.targetRotation_ = e, this.applyTargetState_();
	}
	setZoom(e) {
		this.setResolution(this.getResolutionForZoom(e));
	}
	applyTargetState_(e, t) {
		let n = this.getAnimating() || this.getInteracting() || t, r = this.constraints_.rotation(this.targetRotation_, n), i = this.getViewportSize_(r), a = this.constraints_.resolution(this.targetResolution_, 0, i, n), o = this.constraints_.center(this.targetCenter_, a, i, n, this.calculateCenterShift(this.targetCenter_, a, r, i));
		this.get(Li.ROTATION) !== r && this.set(Li.ROTATION, r), this.get(Li.RESOLUTION) !== a && (this.set(Li.RESOLUTION, a), this.set("zoom", this.getZoom(), !0)), (!o || !this.get(Li.CENTER) || !Va(this.get(Li.CENTER), o)) && this.set(Li.CENTER, o), this.getAnimating() && !e && this.cancelAnimations(), this.cancelAnchor_ = void 0;
	}
	resolveConstraints(e, t, n) {
		e = e === void 0 ? 200 : e;
		let r = t || 0, i = this.constraints_.rotation(this.targetRotation_), a = this.getViewportSize_(i), o = this.constraints_.resolution(this.targetResolution_, r, a), s = this.constraints_.center(this.targetCenter_, o, a, !1, this.calculateCenterShift(this.targetCenter_, o, i, a));
		if (e === 0 && !this.cancelAnchor_) {
			this.targetResolution_ = o, this.targetRotation_ = i, this.targetCenter_ = s, this.applyTargetState_();
			return;
		}
		n ||= e === 0 ? this.cancelAnchor_ : void 0, this.cancelAnchor_ = void 0, (this.getResolution() !== o || this.getRotation() !== i || !this.getCenterInternal() || !Va(this.getCenterInternal(), s)) && (this.getAnimating() && this.cancelAnimations(), this.animateInternal({
			rotation: i,
			center: s,
			resolution: o,
			duration: e,
			easing: Xa,
			anchor: n
		}));
	}
	beginInteraction() {
		this.resolveConstraints(0), this.setHint(Ii.INTERACTING, 1);
	}
	endInteraction(e, t, n) {
		n &&= Os(n, this.getProjection()), this.endInteractionInternal(e, t, n);
	}
	endInteractionInternal(e, t, n) {
		this.getInteracting() && (this.setHint(Ii.INTERACTING, -1), this.resolveConstraints(e, t, n));
	}
	getConstrainedCenter(e, t) {
		let n = this.getViewportSize_(this.getRotation());
		return this.constraints_.center(e, t || this.getResolution(), n);
	}
	getConstrainedZoom(e, t) {
		let n = this.getResolutionForZoom(e);
		return this.getZoomForResolution(this.getConstrainedResolution(n, t));
	}
	getConstrainedResolution(e, t) {
		t ||= 0;
		let n = this.getViewportSize_(this.getRotation());
		return this.constraints_.resolution(e, t, n);
	}
};
function ul(e, t) {
	setTimeout(function() {
		e(t);
	}, 0);
}
function dl(e) {
	if (e.extent !== void 0) {
		let t = e.smoothExtentConstraint === void 0 || e.smoothExtentConstraint;
		return Xi(e.extent, e.constrainOnlyCenter, t);
	}
	let t = hs(e.projection, "EPSG:3857");
	if (e.multiWorld !== !0 && t.isGlobal()) {
		let e = t.getExtent().slice();
		return e[0] = -Infinity, e[2] = Infinity, Xi(e, !1, !1);
	}
	return Zi;
}
function fl(e) {
	let t, n, r, i = e.minZoom === void 0 ? cl : e.minZoom, a = e.maxZoom === void 0 ? 28 : e.maxZoom, o = e.zoomFactor === void 0 ? 2 : e.zoomFactor, s = e.multiWorld !== void 0 && e.multiWorld, c = e.smoothResolutionConstraint === void 0 || e.smoothResolutionConstraint, l = e.showFullExtent !== void 0 && e.showFullExtent, u = hs(e.projection, "EPSG:3857"), d = u.getExtent(), f = e.constrainOnlyCenter, p = e.extent;
	if (!s && !p && u.isGlobal() && (f = !1, p = d), e.resolutions !== void 0) {
		let o = e.resolutions;
		n = o[i], r = o[a] === void 0 ? o[o.length - 1] : o[a], t = e.constrainResolution ? tl(o, c, !f && p, l) : rl(n, r, c, !f && p, l);
	} else {
		let s = (d ? Math.max(H(d), Ea(d)) : 360 * ro.degrees / u.getMetersPerUnit()) / 256 / 2 ** cl, m = s / 2 ** 28;
		n = e.maxResolution, n === void 0 ? n = s / o ** +i : i = 0, r = e.minResolution, r === void 0 && (r = e.maxZoom === void 0 ? m : e.maxResolution === void 0 ? s / o ** +a : n / o ** +a), a = i + Math.floor(Math.log(n / r) / Math.log(o)), r = n / o ** +(a - i), t = e.constrainResolution ? nl(o, n, r, c, !f && p, l) : rl(n, r, c, !f && p, l);
	}
	return {
		constraint: t,
		maxResolution: n,
		minResolution: r,
		minZoom: i,
		zoomFactor: o
	};
}
function pl(e) {
	if (e.enableRotation === void 0 || e.enableRotation) {
		let t = e.constrainRotation;
		return t === void 0 || t === !0 ? sl() : t === !1 ? al : typeof t == "number" ? ol(t) : al;
	}
	return il;
}
function ml(e) {
	return !(e.sourceCenter && e.targetCenter && !Va(e.sourceCenter, e.targetCenter) || e.sourceResolution !== e.targetResolution || e.sourceRotation !== e.targetRotation);
}
function hl(e, t, n, r, i) {
	let a = Math.cos(-i), o = Math.sin(-i), s = e[0] * a - e[1] * o, c = e[1] * a + e[0] * o;
	return s += (t[0] / 2 - n[0]) * r, c += (n[1] - t[1] / 2) * r, o = -o, [s * a - c * o, c * a + s * o];
}
//#endregion
//#region node_modules/ol/css.js
var gl = "ol-hidden", _l = "ol-selectable", vl = "ol-unselectable", yl = "ol-control", bl = "ol-collapsed", xl = new RegExp([
	"^\\s*(?=(?:(?:[-a-z]+\\s*){0,2}(italic|oblique))?)",
	"(?=(?:(?:[-a-z]+\\s*){0,2}(small-caps))?)",
	"(?=(?:(?:[-a-z]+\\s*){0,2}(bold(?:er)?|lighter|[1-9]00 ))?)",
	"(?:(?:normal|\\1|\\2|\\3)\\s*){0,3}((?:xx?-)?",
	"(?:small|large)|medium|smaller|larger|[\\.\\d]+(?:\\%|in|[cem]m|ex|p[ctx]))",
	"(?:\\s*\\/\\s*(normal|[\\.\\d]+(?:\\%|in|[cem]m|ex|p[ctx])?))",
	"?\\s*([-,\\\"\\'\\sa-z0-9]+?)\\s*$"
].join(""), "i"), Sl = [
	"style",
	"variant",
	"weight",
	"size",
	"lineHeight",
	"family"
], Cl = {
	normal: 400,
	bold: 700
}, wl = function(e) {
	let t = e.match(xl);
	if (!t) return null;
	let n = {
		lineHeight: "normal",
		size: "1.2em",
		style: "normal",
		weight: "400",
		variant: "normal"
	};
	for (let e = 0, r = Sl.length; e < r; ++e) {
		let r = t[e + 1];
		r !== void 0 && (n[Sl[e]] = typeof r == "string" ? r.trim() : r);
	}
	return isNaN(Number(n.weight)) && n.weight in Cl && (n.weight = Cl[n.weight]), n.families = n.family.split(/,\s?/).map((e) => e.trim().replace(/^['"]|['"]$/g, "")), n;
};
//#endregion
//#region node_modules/ol/dom.js
function Tl(e, t, n, r) {
	let i;
	return i = n && n.length ? n.shift() : Ti ? new class extends OffscreenCanvas {
		style = {};
	}(e ?? 300, t ?? 150) : document.createElement("canvas"), e && (i.width = e), t && (i.height = t), i.getContext("2d", r);
}
var El;
function Dl() {
	return El ||= Tl(1, 1), El;
}
function Ol(e) {
	let t = e.canvas;
	t.width = 1, t.height = 1, e.clearRect(0, 0, 1, 1);
}
function kl(e) {
	let t = e.offsetWidth, n = getComputedStyle(e);
	return t += parseInt(n.marginLeft, 10) + parseInt(n.marginRight, 10), t;
}
function Al(e) {
	let t = e.offsetHeight, n = getComputedStyle(e);
	return t += parseInt(n.marginTop, 10) + parseInt(n.marginBottom, 10), t;
}
function jl(e, t) {
	let n = t.parentNode;
	n && n.replaceChild(e, t);
}
function Ml(e) {
	for (; e.lastChild;) e.lastChild.remove();
}
function Nl(e, t) {
	let n = e.childNodes;
	for (let r = 0;; ++r) {
		let i = n[r], a = t[r];
		if (!i && !a) break;
		if (i !== a) {
			if (!i) {
				e.appendChild(a);
				continue;
			}
			if (!a) {
				e.removeChild(i), --r;
				continue;
			}
			e.insertBefore(a, i);
		}
	}
}
function Pl() {
	return new Proxy({
		childNodes: [],
		appendChild: function(e) {
			return this.childNodes.push(e), e;
		},
		remove: function() {},
		removeChild: function(e) {
			let t = this.childNodes.indexOf(e);
			if (t === -1) throw Error("Node to remove was not found");
			return this.childNodes.splice(t, 1), e;
		},
		insertBefore: function(e, t) {
			let n = this.childNodes.indexOf(t);
			if (n === -1) throw Error("Reference node not found");
			return this.childNodes.splice(n, 0, e), e;
		},
		style: {}
	}, { get(e, t, n) {
		return t === "firstElementChild" ? e.childNodes.length > 0 ? e.childNodes[0] : null : Reflect.get(e, t, n);
	} });
}
function Fl(e) {
	return typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas;
}
//#endregion
//#region node_modules/ol/control/Control.js
var Il = class extends mi {
	constructor(e) {
		super();
		let t = e.element;
		t && !e.target && !t.style.pointerEvents && (t.style.pointerEvents = "auto"), this.element = t || null, this.target_ = null, this.map_ = null, this.listenerKeys = [], e.render && (this.render = e.render), e.target && this.setTarget(e.target);
	}
	disposeInternal() {
		this.element?.remove(), super.disposeInternal();
	}
	getMap() {
		return this.map_;
	}
	setMap(e) {
		this.map_ && this.element?.remove();
		for (let e = 0, t = this.listenerKeys.length; e < t; ++e) qr(this.listenerKeys[e]);
		if (this.listenerKeys.length = 0, this.map_ = e, e) {
			let t = this.target_ ?? e.getOverlayContainerStopEvent();
			this.element && t.appendChild(this.element), this.render !== ai && this.listenerKeys.push(I(e, Ai.POSTRENDER, this.render, this)), e.render();
		}
	}
	render(e) {}
	setTarget(e) {
		this.target_ = typeof e == "string" ? document.getElementById(e) : e;
	}
}, Ll = class extends Il {
	constructor(e) {
		e ||= {}, super({
			element: document.createElement("div"),
			render: e.render,
			target: e.target
		}), this.ulElement_ = document.createElement("ul"), this.collapsed_ = e.collapsed === void 0 || e.collapsed, this.userCollapsed_ = this.collapsed_, this.overrideCollapsible_ = e.collapsible !== void 0, this.collapsible_ = e.collapsible === void 0 || e.collapsible, this.collapsible_ || (this.collapsed_ = !1), this.attributions_ = e.attributions;
		let t = e.className === void 0 ? "ol-attribution" : e.className, n = e.tipLabel === void 0 ? "Attributions" : e.tipLabel, r = e.expandClassName === void 0 ? t + "-expand" : e.expandClassName, i = e.collapseLabel === void 0 ? "›" : e.collapseLabel, a = e.collapseClassName === void 0 ? t + "-collapse" : e.collapseClassName;
		typeof i == "string" ? (this.collapseLabel_ = document.createElement("span"), this.collapseLabel_.textContent = i, this.collapseLabel_.className = a) : this.collapseLabel_ = i;
		let o = e.label === void 0 ? "i" : e.label;
		typeof o == "string" ? (this.label_ = document.createElement("span"), this.label_.textContent = o, this.label_.className = r) : this.label_ = o;
		let s = this.collapsible_ && !this.collapsed_ ? this.collapseLabel_ : this.label_;
		this.toggleButton_ = document.createElement("button"), this.toggleButton_.setAttribute("type", "button"), this.toggleButton_.setAttribute("aria-expanded", String(!this.collapsed_)), this.toggleButton_.title = n, this.toggleButton_.appendChild(s), this.toggleButton_.addEventListener(L.CLICK, this.handleClick_.bind(this), !1);
		let c = t + " " + vl + " " + yl + (this.collapsed_ && this.collapsible_ ? " " + bl : "") + (this.collapsible_ ? "" : " ol-uncollapsible"), l = this.element;
		l.className = c, l.appendChild(this.toggleButton_), l.appendChild(this.ulElement_), this.renderedAttributions_ = [], this.renderedVisible_ = !0;
	}
	collectSourceAttributions_(e) {
		let t = this.getMap().getAllLayers(), n = new Set(t.flatMap((t) => t.getAttributions(e)));
		if (this.attributions_ !== void 0 && (Array.isArray(this.attributions_) ? this.attributions_.forEach((e) => n.add(e)) : n.add(this.attributions_)), !this.overrideCollapsible_) {
			let e = !t.some((e) => e.getSource()?.getAttributionsCollapsible() === !1);
			this.setCollapsible(e);
		}
		return Array.from(n);
	}
	async updateElement_(e) {
		if (!e) {
			this.renderedVisible_ &&= (this.element.style.display = "none", !1);
			return;
		}
		let t = await Promise.all(this.collectSourceAttributions_(e).map((e) => si(() => e))), n = t.length > 0;
		if (this.renderedVisible_ != n && (this.element.style.display = n ? "" : "none", this.renderedVisible_ = n), !ti(t, this.renderedAttributions_)) {
			Ml(this.ulElement_);
			for (let e = 0, n = t.length; e < n; ++e) {
				let n = document.createElement("li");
				n.innerHTML = t[e], this.ulElement_.appendChild(n);
			}
			this.renderedAttributions_ = t;
		}
	}
	handleClick_(e) {
		e.preventDefault(), this.handleToggle_(), this.userCollapsed_ = this.collapsed_;
	}
	handleToggle_() {
		this.element.classList.toggle(bl), this.collapsed_ ? jl(this.collapseLabel_, this.label_) : jl(this.label_, this.collapseLabel_), this.collapsed_ = !this.collapsed_, this.toggleButton_.setAttribute("aria-expanded", String(!this.collapsed_));
	}
	getCollapsible() {
		return this.collapsible_;
	}
	setCollapsible(e) {
		this.collapsible_ !== e && (this.collapsible_ = e, this.element.classList.toggle("ol-uncollapsible"), this.userCollapsed_ && this.handleToggle_());
	}
	setCollapsed(e) {
		this.userCollapsed_ = e, this.collapsible_ && this.collapsed_ !== e && this.handleToggle_();
	}
	getCollapsed() {
		return this.collapsed_;
	}
	render(e) {
		this.updateElement_(e.frameState);
	}
}, Rl = class extends Il {
	constructor(e) {
		e ||= {}, super({
			element: document.createElement("div"),
			render: e.render,
			target: e.target
		});
		let t = e.className === void 0 ? "ol-rotate" : e.className, n = e.label === void 0 ? "⇧" : e.label, r = e.compassClassName === void 0 ? "ol-compass" : e.compassClassName;
		this.label_ = null, typeof n == "string" ? (this.label_ = document.createElement("span"), this.label_.className = r, this.label_.textContent = n) : (this.label_ = n, this.label_.classList.add(r));
		let i = e.tipLabel ? e.tipLabel : "Reset rotation", a = document.createElement("button");
		a.className = t + "-reset", a.setAttribute("type", "button"), a.title = i, a.appendChild(this.label_), a.addEventListener(L.CLICK, this.handleClick_.bind(this), !1);
		let o = t + " " + vl + " " + yl, s = this.element;
		s.className = o, s.appendChild(a), this.callResetNorth_ = e.resetNorth ? e.resetNorth : void 0, this.duration_ = e.duration === void 0 ? 250 : e.duration, this.autoHide_ = e.autoHide === void 0 || e.autoHide, this.rotation_ = void 0, this.autoHide_ && this.element.classList.add(gl);
	}
	handleClick_(e) {
		e.preventDefault(), this.callResetNorth_ === void 0 ? this.resetNorth_() : this.callResetNorth_();
	}
	resetNorth_() {
		let e = this.getMap().getView();
		if (!e) return;
		let t = e.getRotation();
		t !== void 0 && (this.duration_ > 0 && t % (2 * Math.PI) != 0 ? e.animate({
			rotation: 0,
			duration: this.duration_,
			easing: Xa
		}) : e.setRotation(0));
	}
	render(e) {
		let t = e.frameState;
		if (!t) return;
		let n = t.viewState.rotation;
		if (n != this.rotation_) {
			let e = "rotate(" + n + "rad)";
			if (this.autoHide_) {
				let e = this.element.classList.contains(gl);
				!e && n === 0 ? this.element.classList.add(gl) : e && n !== 0 && this.element.classList.remove(gl);
			}
			this.label_.style.transform = e;
		}
		this.rotation_ = n;
	}
}, zl = class extends Il {
	constructor(e) {
		e ||= {}, super({
			element: document.createElement("div"),
			target: e.target
		});
		let t = e.className === void 0 ? "ol-zoom" : e.className, n = e.delta === void 0 ? 1 : e.delta, r = e.zoomInClassName === void 0 ? t + "-in" : e.zoomInClassName, i = e.zoomOutClassName === void 0 ? t + "-out" : e.zoomOutClassName, a = e.zoomInLabel === void 0 ? "+" : e.zoomInLabel, o = e.zoomOutLabel === void 0 ? "–" : e.zoomOutLabel, s = e.zoomInTipLabel === void 0 ? "Zoom in" : e.zoomInTipLabel, c = e.zoomOutTipLabel === void 0 ? "Zoom out" : e.zoomOutTipLabel, l = document.createElement("button");
		l.className = r, l.setAttribute("type", "button"), l.title = s, l.appendChild(typeof a == "string" ? document.createTextNode(a) : a), l.addEventListener(L.CLICK, this.handleClick_.bind(this, n), !1);
		let u = document.createElement("button");
		u.className = i, u.setAttribute("type", "button"), u.title = c, u.appendChild(typeof o == "string" ? document.createTextNode(o) : o), u.addEventListener(L.CLICK, this.handleClick_.bind(this, -n), !1);
		let d = t + " " + vl + " " + yl, f = this.element;
		f.className = d, f.appendChild(l), f.appendChild(u), this.duration_ = e.duration === void 0 ? 250 : e.duration;
	}
	handleClick_(e, t) {
		t.preventDefault(), this.zoomByDelta_(e);
	}
	zoomByDelta_(e) {
		let t = this.getMap().getView();
		if (!t) return;
		let n = t.getZoom();
		if (n !== void 0) {
			let r = t.getConstrainedZoom(n + e);
			this.duration_ > 0 ? (t.getAnimating() && t.cancelAnimations(), t.animate({
				zoom: r,
				duration: this.duration_,
				easing: Xa
			})) : t.setZoom(r);
		}
	}
};
//#endregion
//#region node_modules/ol/control/defaults.js
function Bl(e) {
	e ||= {};
	let t = new _i();
	return (e.zoom === void 0 || e.zoom) && t.push(new zl(e.zoomOptions)), (e.rotate === void 0 || e.rotate) && t.push(new Rl(e.rotateOptions)), (e.attribution === void 0 || e.attribution) && t.push(new Ll(e.attributionOptions)), t;
}
//#endregion
//#region node_modules/ol/Kinetic.js
var Vl = class {
	constructor(e, t, n) {
		this.decay_ = e, this.minVelocity_ = t, this.delay_ = n, this.points_ = [], this.angle_ = 0, this.initialVelocity_ = 0;
	}
	begin() {
		this.points_.length = 0, this.angle_ = 0, this.initialVelocity_ = 0;
	}
	update(e, t) {
		this.points_.push(e, t, Date.now());
	}
	end() {
		if (this.points_.length < 6) return !1;
		let e = Date.now() - this.delay_, t = this.points_.length - 3;
		if (this.points_[t + 2] < e) return !1;
		let n = t - 3;
		for (; n > 0 && this.points_[n + 2] > e;) n -= 3;
		let r = this.points_[t + 2] - this.points_[n + 2];
		if (r < 1e3 / 60) return !1;
		let i = this.points_[t] - this.points_[n], a = this.points_[t + 1] - this.points_[n + 1];
		return this.angle_ = Math.atan2(a, i), this.initialVelocity_ = Math.sqrt(i * i + a * a) / r, this.initialVelocity_ > this.minVelocity_;
	}
	getDistance() {
		return (this.minVelocity_ - this.initialVelocity_) / this.decay_;
	}
	getAngle() {
		return this.angle_;
	}
}, Hl = { ACTIVE: "active" }, Ul = class extends mi {
	constructor(e) {
		super(), this.on, this.once, this.un, e && e.handleEvent && (this.handleEvent = e.handleEvent), this.map_ = null, this.setActive(!0);
	}
	getActive() {
		return this.get(Hl.ACTIVE);
	}
	getMap() {
		return this.map_;
	}
	handleEvent(e) {
		return !0;
	}
	setActive(e) {
		this.set(Hl.ACTIVE, e);
	}
	setMap(e) {
		this.map_ = e;
	}
};
function Wl(e, t, n) {
	let r = e.getCenterInternal();
	if (r) {
		let i = [r[0] + t[0], r[1] + t[1]];
		e.animateInternal({
			duration: n === void 0 ? 250 : n,
			easing: Qa,
			center: e.getConstrainedCenter(i)
		});
	}
}
function Gl(e, t, n, r) {
	let i = e.getZoom();
	if (i === void 0) return;
	let a = e.getConstrainedZoom(i + t), o = e.getResolutionForZoom(a);
	e.getAnimating() && e.cancelAnimations(), e.animate({
		resolution: o,
		anchor: n,
		duration: r === void 0 ? 250 : r,
		easing: Xa
	});
}
//#endregion
//#region node_modules/ol/interaction/DoubleClickZoom.js
var Kl = class extends Ul {
	constructor(e) {
		super(), e ||= {}, this.delta_ = e.delta ? e.delta : 1, this.duration_ = e.duration === void 0 ? 250 : e.duration;
	}
	handleEvent(e) {
		let t = !1;
		if (e.type == bi.DBLCLICK) {
			let n = e.originalEvent, r = e.map, i = e.coordinate, a = n.shiftKey ? -this.delta_ : this.delta_;
			Gl(r.getView(), a, i, this.duration_), n.preventDefault(), t = !0;
		}
		return !t;
	}
};
//#endregion
//#region node_modules/ol/events/condition.js
function ql(e) {
	let t = arguments;
	return function(e) {
		let n = !0;
		for (let r = 0, i = t.length; r < i && (n &&= t[r](e), n); ++r);
		return n;
	};
}
var Jl = function(e) {
	let t = e.originalEvent;
	return t.altKey && !(t.metaKey || t.ctrlKey) && t.shiftKey;
}, Yl = function(e) {
	let t = e.map.getTargetElement(), n = t.getRootNode(), r = e.map.getOwnerDocument().activeElement;
	return n instanceof ShadowRoot ? n.host.contains(r) : t.contains(r);
}, Xl = function(e) {
	let t = e.map.getTargetElement(), n = t.getRootNode();
	return !(n instanceof ShadowRoot ? n.host : t).hasAttribute("tabindex") || Yl(e);
}, Zl = ri, Ql = function(e) {
	let t = e.originalEvent;
	return "pointerId" in t && t.button == 0 && !(Si && Ci && t.ctrlKey);
}, $l = function(e) {
	let t = e.originalEvent;
	return !t.altKey && !(t.metaKey || t.ctrlKey) && !t.shiftKey;
}, eu = function(e) {
	let t = e.originalEvent;
	return Ci ? t.metaKey : t.ctrlKey;
}, tu = function(e) {
	let t = e.originalEvent;
	return !t.altKey && !(t.metaKey || t.ctrlKey) && t.shiftKey;
}, nu = function(e) {
	let t = e.originalEvent, n = t.target.tagName;
	return n !== "INPUT" && n !== "SELECT" && n !== "TEXTAREA" && !t.target.isContentEditable;
}, ru = function(e) {
	let t = e.originalEvent;
	return "pointerId" in t && t.pointerType == "mouse";
}, iu = function(e) {
	let t = e.originalEvent;
	return "pointerId" in t && t.isPrimary && t.button === 0;
}, au = class extends Ul {
	constructor(e) {
		e ||= {}, super(e), e.handleDownEvent && (this.handleDownEvent = e.handleDownEvent), e.handleDragEvent && (this.handleDragEvent = e.handleDragEvent), e.handleMoveEvent && (this.handleMoveEvent = e.handleMoveEvent), e.handleUpEvent && (this.handleUpEvent = e.handleUpEvent), e.stopDown && (this.stopDown = e.stopDown), this.handlingDownUpSequence = !1, this.targetPointers = [];
	}
	getPointerCount() {
		return this.targetPointers.length;
	}
	handleDownEvent(e) {
		return !1;
	}
	handleDragEvent(e) {}
	handleEvent(e) {
		if (!e.originalEvent) return !0;
		let t = !1;
		if (this.updateTrackedPointers_(e), this.handlingDownUpSequence) {
			if (e.type == bi.POINTERDRAG) this.handleDragEvent(e), e.originalEvent.preventDefault();
			else if (e.type == bi.POINTERUP) {
				let t = this.handleUpEvent(e);
				this.handlingDownUpSequence = t && this.targetPointers.length > 0;
			}
		} else if (e.type == bi.POINTERDOWN) {
			let n = this.handleDownEvent(e);
			this.handlingDownUpSequence = n, t = this.stopDown(n);
		} else e.type == bi.POINTERMOVE && this.handleMoveEvent(e);
		return !t;
	}
	handleMoveEvent(e) {}
	handleUpEvent(e) {
		return !1;
	}
	stopDown(e) {
		return e;
	}
	updateTrackedPointers_(e) {
		e.activePointers && (this.targetPointers = e.activePointers);
	}
};
function ou(e) {
	let t = e.length, n = 0, r = 0;
	for (let i = 0; i < t; i++) n += e[i].clientX, r += e[i].clientY;
	return {
		clientX: n / t,
		clientY: r / t
	};
}
//#endregion
//#region node_modules/ol/interaction/DragPan.js
var su = class extends au {
	constructor(e) {
		super({ stopDown: ii }), e ||= {}, this.kinetic_ = e.kinetic, this.lastCentroid = null, this.lastPointersCount_, this.panning_ = !1;
		let t = e.condition ? e.condition : ql($l, iu);
		this.condition_ = e.onFocusOnly ? ql(Xl, t) : t, this.noKinetic_ = !1;
	}
	handleDragEvent(e) {
		let t = e.map;
		this.panning_ || (this.panning_ = !0, t.getView().beginInteraction());
		let n = this.targetPointers, r = t.getEventPixel(ou(n));
		if (n.length == this.lastPointersCount_) {
			if (this.kinetic_ && this.kinetic_.update(r[0], r[1]), this.lastCentroid) {
				let t = [this.lastCentroid[0] - r[0], r[1] - this.lastCentroid[1]], n = e.map.getView();
				Ua(t, n.getResolution()), Ha(t, n.getRotation()), n.adjustCenterInternal(t);
			}
		} else this.kinetic_ && this.kinetic_.begin();
		this.lastCentroid = r, this.lastPointersCount_ = n.length, e.originalEvent.preventDefault();
	}
	handleUpEvent(e) {
		let t = e.map, n = t.getView();
		if (this.targetPointers.length === 0) {
			if (!this.noKinetic_ && this.kinetic_ && this.kinetic_.end()) {
				let e = this.kinetic_.getDistance(), r = this.kinetic_.getAngle(), i = n.getCenterInternal(), a = t.getPixelFromCoordinateInternal(i), o = t.getCoordinateFromPixelInternal([a[0] - e * Math.cos(r), a[1] - e * Math.sin(r)]);
				n.animateInternal({
					center: n.getConstrainedCenter(o),
					duration: 500,
					easing: Xa
				});
			}
			return this.panning_ && (this.panning_ = !1, n.endInteraction()), !1;
		}
		return this.kinetic_ && this.kinetic_.begin(), this.lastCentroid = null, !0;
	}
	handleDownEvent(e) {
		if (this.targetPointers.length > 0 && this.condition_(e)) {
			let t = e.map.getView();
			return this.lastCentroid = null, t.getAnimating() && t.cancelAnimations(), this.kinetic_ && this.kinetic_.begin(), this.noKinetic_ = this.targetPointers.length > 1, !0;
		}
		return !1;
	}
}, cu = class extends au {
	constructor(e) {
		e ||= {}, super({ stopDown: ii }), this.condition_ = e.condition ? e.condition : Jl, this.lastAngle_ = void 0, this.duration_ = e.duration === void 0 ? 250 : e.duration;
	}
	handleDragEvent(e) {
		if (!ru(e)) return;
		let t = e.map, n = t.getView();
		if (n.getConstraints().rotation === il) return;
		let r = t.getSize(), i = e.pixel, a = Math.atan2(r[1] / 2 - i[1], i[0] - r[0] / 2);
		if (this.lastAngle_ !== void 0) {
			let e = a - this.lastAngle_;
			n.adjustRotationInternal(-e);
		}
		this.lastAngle_ = a;
	}
	handleUpEvent(e) {
		return !ru(e) || (e.map.getView().endInteraction(this.duration_), !1);
	}
	handleDownEvent(e) {
		return ru(e) && Ql(e) && this.condition_(e) ? (e.map.getView().beginInteraction(), this.lastAngle_ = void 0, !0) : !1;
	}
}, lu = class extends Jr {
	constructor(e) {
		super(), this.geometry_ = null, this.element_ = document.createElement("div"), this.element_.style.position = "absolute", this.element_.style.pointerEvents = "auto", this.element_.className = "ol-box " + e, this.map_ = null, this.startPixel_ = null, this.endPixel_ = null;
	}
	disposeInternal() {
		this.setMap(null);
	}
	render_() {
		let e = this.startPixel_, t = this.endPixel_, n = this.element_.style;
		n.left = Math.min(e[0], t[0]) + "px", n.top = Math.min(e[1], t[1]) + "px", n.width = Math.abs(t[0] - e[0]) + "px", n.height = Math.abs(t[1] - e[1]) + "px";
	}
	setMap(e) {
		if (this.map_) {
			this.map_.getOverlayContainer().removeChild(this.element_);
			let e = this.element_.style;
			e.left = "inherit", e.top = "inherit", e.width = "inherit", e.height = "inherit";
		}
		this.map_ = e, this.map_ && this.map_.getOverlayContainer().appendChild(this.element_);
	}
	setPixels(e, t) {
		this.startPixel_ = e, this.endPixel_ = t, this.createOrUpdateGeometry(), this.render_();
	}
	createOrUpdateGeometry() {
		if (!this.map_) return;
		let e = this.startPixel_, t = this.endPixel_, n = [
			e,
			[e[0], t[1]],
			t,
			[t[0], e[1]]
		].map(this.map_.getCoordinateFromPixelInternal, this.map_);
		n[4] = n[0].slice(), this.geometry_ ? this.geometry_.setCoordinates([n]) : this.geometry_ = new Zc([n]);
	}
	getGeometry() {
		return this.geometry_;
	}
}, uu = {
	BOXSTART: "boxstart",
	BOXDRAG: "boxdrag",
	BOXEND: "boxend",
	BOXCANCEL: "boxcancel"
}, du = class extends ci {
	constructor(e, t, n) {
		super(e), this.coordinate = t, this.mapBrowserEvent = n;
	}
}, fu = class extends au {
	constructor(e) {
		super(), this.on, this.once, this.un, e ??= {}, this.box_ = new lu(e.className || "ol-dragbox"), this.minArea_ = e.minArea ?? 64, e.onBoxEnd && (this.onBoxEnd = e.onBoxEnd), this.startPixel_ = null, this.condition_ = e.condition ?? Ql, this.boxEndCondition_ = e.boxEndCondition ?? this.defaultBoxEndCondition;
	}
	defaultBoxEndCondition(e, t, n) {
		let r = n[0] - t[0], i = n[1] - t[1];
		return r * r + i * i >= this.minArea_;
	}
	getGeometry() {
		return this.box_.getGeometry();
	}
	handleDragEvent(e) {
		this.startPixel_ && (this.box_.setPixels(this.startPixel_, e.pixel), this.dispatchEvent(new du(uu.BOXDRAG, e.coordinate, e)));
	}
	handleUpEvent(e) {
		if (!this.startPixel_) return !1;
		let t = this.boxEndCondition_(e, this.startPixel_, e.pixel);
		return t && this.onBoxEnd(e), this.dispatchEvent(new du(t ? uu.BOXEND : uu.BOXCANCEL, e.coordinate, e)), this.box_.setMap(null), this.startPixel_ = null, !1;
	}
	handleDownEvent(e) {
		return this.condition_(e) ? (this.startPixel_ = e.pixel, this.box_.setMap(e.map), this.box_.setPixels(this.startPixel_, this.startPixel_), this.dispatchEvent(new du(uu.BOXSTART, e.coordinate, e)), !0) : !1;
	}
	onBoxEnd(e) {}
	setActive(e) {
		e || (this.box_.setMap(null), this.startPixel_ &&= (this.dispatchEvent(new du(uu.BOXCANCEL, this.startPixel_, null)), null)), super.setActive(e);
	}
	setMap(e) {
		this.getMap() && (this.box_.setMap(null), this.startPixel_ &&= (this.dispatchEvent(new du(uu.BOXCANCEL, this.startPixel_, null)), null)), super.setMap(e);
	}
}, pu = class extends fu {
	constructor(e) {
		e ||= {};
		let t = e.condition ? e.condition : tu;
		super({
			condition: t,
			className: e.className || "ol-dragzoom",
			minArea: e.minArea
		}), this.duration_ = e.duration === void 0 ? 200 : e.duration, this.out_ = e.out !== void 0 && e.out;
	}
	onBoxEnd(e) {
		let t = this.getMap().getView(), n = this.getGeometry();
		if (this.out_) {
			let e = t.rotatedExtentForGeometry(n), r = t.getResolutionForExtentInternal(e), i = t.getResolution() / r;
			n = n.clone(), n.scale(i * i);
		}
		t.fitInternal(n, {
			duration: this.duration_,
			easing: Xa
		});
	}
}, mu = {
	LEFT: "ArrowLeft",
	UP: "ArrowUp",
	RIGHT: "ArrowRight",
	DOWN: "ArrowDown"
}, hu = class extends Ul {
	constructor(e) {
		super(), e ||= {}, this.defaultCondition_ = function(e) {
			return $l(e) && nu(e);
		}, this.condition_ = e.condition === void 0 ? this.defaultCondition_ : e.condition, this.duration_ = e.duration === void 0 ? 100 : e.duration, this.pixelDelta_ = e.pixelDelta === void 0 ? 128 : e.pixelDelta;
	}
	handleEvent(e) {
		let t = !1;
		if (e.type == L.KEYDOWN) {
			let n = e.originalEvent, r = n.key;
			if (this.condition_(e) && (r == mu.DOWN || r == mu.LEFT || r == mu.RIGHT || r == mu.UP)) {
				let i = e.map.getView(), a = i.getResolution() * this.pixelDelta_, o = 0, s = 0;
				r == mu.DOWN ? s = -a : r == mu.LEFT ? o = -a : r == mu.RIGHT ? o = a : s = a;
				let c = [o, s];
				Ha(c, i.getRotation()), Wl(i, c, this.duration_), n.preventDefault(), t = !0;
			}
		}
		return !t;
	}
}, gu = class extends Ul {
	constructor(e) {
		super(), e ||= {}, this.condition_ = e.condition ? e.condition : function(e) {
			return !eu(e) && nu(e);
		}, this.delta_ = e.delta ? e.delta : 1, this.duration_ = e.duration === void 0 ? 100 : e.duration;
	}
	handleEvent(e) {
		let t = !1;
		if (e.type == L.KEYDOWN || e.type == L.KEYPRESS) {
			let n = e.originalEvent, r = n.key;
			if (this.condition_(e) && (r === "+" || r === "-")) {
				let i = e.map, a = r === "+" ? this.delta_ : -this.delta_;
				Gl(i.getView(), a, void 0, this.duration_), n.preventDefault(), t = !0;
			}
		}
		return !t;
	}
}, _u = 40, vu = 300, yu = 3, bu = class extends Ul {
	constructor(e) {
		e ||= {}, super(e), this.totalDelta_ = 0, this.lastDelta_ = 0, this.maxDelta_ = e.maxDelta === void 0 ? 1 : e.maxDelta, this.duration_ = e.duration === void 0 ? 250 : e.duration, this.timeout_ = e.timeout === void 0 ? 80 : e.timeout, this.useAnchor_ = e.useAnchor === void 0 || e.useAnchor, this.constrainResolution_ = e.constrainResolution !== void 0 && e.constrainResolution;
		let t = e.condition ? e.condition : Zl;
		this.condition_ = e.onFocusOnly ? ql(Xl, t) : t, this.lastAnchor_ = null, this.startTime_ = void 0, this.timeoutId_, this.mode_ = void 0, this.trackpadEventGap_ = 400, this.trackpadTimeoutId_, this.deltaPerZoom_ = 300, this.ctrlKeyPressed_ = !1, this.ctrlKeyListenerKeys_ = [];
	}
	setMap(e) {
		if (this.ctrlKeyListenerKeys_.forEach(qr), this.ctrlKeyListenerKeys_.length = 0, this.ctrlKeyPressed_ = !1, super.setMap(e), e) {
			let t = e.getOwnerDocument();
			this.ctrlKeyListenerKeys_.push(I(t, "keydown", (e) => {
				e.key === "Control" && (this.ctrlKeyPressed_ = !0);
			}), I(t, "keyup", (e) => {
				e.key === "Control" && (this.ctrlKeyPressed_ = !1);
			}));
		}
	}
	endInteraction_() {
		this.trackpadTimeoutId_ = void 0;
		let e = this.getMap();
		if (!e) return;
		let t = e.getView(), n = this.lastDelta_ ? this.lastDelta_ > 0 ? 1 : -1 : 0;
		t.endInteraction(this.constrainResolution_ || t.getConstrainResolution() ? 100 : void 0, n, this.lastAnchor_ ? e.getCoordinateFromPixel(this.lastAnchor_) : null);
	}
	handleEvent(e) {
		if (!this.condition_(e) || e.type !== L.WHEEL) return !0;
		let t = e.map, n = e.originalEvent;
		n.preventDefault();
		let r = n.ctrlKey && !this.ctrlKeyPressed_;
		n.ctrlKey || (this.ctrlKeyPressed_ = !1), this.useAnchor_ && (this.lastAnchor_ = e.pixel);
		let i = n.deltaY;
		switch (n.deltaMode) {
			case WheelEvent.DOM_DELTA_LINE:
				i *= _u;
				break;
			case WheelEvent.DOM_DELTA_PAGE: i *= vu;
		}
		if (i === 0) return !1;
		this.lastDelta_ = i;
		let a = Date.now();
		this.startTime_ === void 0 && (this.startTime_ = a), (!this.mode_ || a - this.startTime_ > this.trackpadEventGap_) && (this.mode_ = Math.abs(i) < 4 ? "trackpad" : "wheel");
		let o = t.getView();
		if (this.mode_ === "trackpad") return this.trackpadTimeoutId_ ? clearTimeout(this.trackpadTimeoutId_) : (o.getAnimating() && o.cancelAnimations(), o.beginInteraction()), this.trackpadTimeoutId_ = setTimeout(this.endInteraction_.bind(this), this.timeout_), r && (i *= yu), o.adjustZoom(-i / this.deltaPerZoom_, this.lastAnchor_ ? t.getCoordinateFromPixel(this.lastAnchor_) : null), this.startTime_ = a, !1;
		this.totalDelta_ += i;
		let s = Math.max(this.timeout_ - (a - this.startTime_), 0);
		return clearTimeout(this.timeoutId_), this.timeoutId_ = setTimeout(this.handleWheelZoom_.bind(this, t), s), !1;
	}
	handleWheelZoom_(e) {
		let t = e.getView();
		t.getAnimating() && t.cancelAnimations();
		let n = -Ri(this.totalDelta_, -this.maxDelta_ * this.deltaPerZoom_, this.maxDelta_ * this.deltaPerZoom_) / this.deltaPerZoom_;
		(t.getConstrainResolution() || this.constrainResolution_) && (n = n ? n > 0 ? 1 : -1 : 0), Gl(t, n, this.lastAnchor_ ? e.getCoordinateFromPixel(this.lastAnchor_) : null, this.duration_), this.mode_ = void 0, this.totalDelta_ = 0, this.lastAnchor_ = null, this.startTime_ = void 0, this.timeoutId_ = void 0;
	}
	setMouseAnchor(e) {
		this.useAnchor_ = e, e || (this.lastAnchor_ = null);
	}
}, xu = class extends au {
	constructor(e) {
		e ||= {};
		let t = e;
		t.stopDown ||= ii, super(t), this.anchor_ = null, this.lastAngle_ = void 0, this.rotating_ = !1, this.rotationDelta_ = 0, this.threshold_ = e.threshold === void 0 ? .3 : e.threshold, this.duration_ = e.duration === void 0 ? 250 : e.duration;
	}
	handleDragEvent(e) {
		let t = 0, n = this.targetPointers[0], r = this.targetPointers[1], i = Math.atan2(r.clientY - n.clientY, r.clientX - n.clientX);
		if (this.lastAngle_ !== void 0) {
			let e = i - this.lastAngle_;
			this.rotationDelta_ += e, !this.rotating_ && Math.abs(this.rotationDelta_) > this.threshold_ && (this.rotating_ = !0), t = e;
		}
		this.lastAngle_ = i;
		let a = e.map, o = a.getView();
		o.getConstraints().rotation !== il && (this.anchor_ = a.getCoordinateFromPixelInternal(a.getEventPixel(ou(this.targetPointers))), this.rotating_ && (a.render(), o.adjustRotationInternal(t, this.anchor_)));
	}
	handleUpEvent(e) {
		return this.targetPointers.length < 2 ? (e.map.getView().endInteraction(this.duration_), !1) : !0;
	}
	handleDownEvent(e) {
		if (this.targetPointers.length >= 2) {
			let t = e.map;
			return this.anchor_ = null, this.lastAngle_ = void 0, this.rotating_ = !1, this.rotationDelta_ = 0, this.handlingDownUpSequence || t.getView().beginInteraction(), !0;
		}
		return !1;
	}
}, Su = class extends au {
	constructor(e) {
		e ||= {};
		let t = e;
		t.stopDown ||= ii, super(t), this.anchor_ = null, this.duration_ = e.duration === void 0 ? 400 : e.duration, this.lastDistance_ = void 0, this.lastScaleDelta_ = 1;
	}
	handleDragEvent(e) {
		let t = 1, n = this.targetPointers[0], r = this.targetPointers[1], i = n.clientX - r.clientX, a = n.clientY - r.clientY, o = Math.sqrt(i * i + a * a);
		this.lastDistance_ !== void 0 && (t = this.lastDistance_ / o), this.lastDistance_ = o;
		let s = e.map, c = s.getView();
		t != 1 && (this.lastScaleDelta_ = t), this.anchor_ = s.getCoordinateFromPixelInternal(s.getEventPixel(ou(this.targetPointers))), s.render(), c.adjustResolutionInternal(t, this.anchor_);
	}
	handleUpEvent(e) {
		if (this.targetPointers.length < 2) {
			let t = e.map.getView(), n = this.lastScaleDelta_ > 1 ? 1 : -1;
			return t.endInteraction(this.duration_, n), !1;
		}
		return !0;
	}
	handleDownEvent(e) {
		if (this.targetPointers.length >= 2) {
			let t = e.map;
			return this.anchor_ = null, this.lastDistance_ = void 0, this.lastScaleDelta_ = 1, this.handlingDownUpSequence || t.getView().beginInteraction(), !0;
		}
		return !1;
	}
};
//#endregion
//#region node_modules/ol/interaction/defaults.js
function Cu(e) {
	e ||= {};
	let t = new _i(), n = new Vl(-.005, .05, 100);
	return (e.altShiftDragRotate === void 0 || e.altShiftDragRotate) && t.push(new cu()), (e.doubleClickZoom === void 0 || e.doubleClickZoom) && t.push(new Kl({
		delta: e.zoomDelta,
		duration: e.zoomDuration
	})), (e.dragPan === void 0 || e.dragPan) && t.push(new su({
		onFocusOnly: e.onFocusOnly,
		kinetic: n
	})), (e.pinchRotate === void 0 || e.pinchRotate) && t.push(new xu()), (e.pinchZoom === void 0 || e.pinchZoom) && t.push(new Su({ duration: e.zoomDuration })), (e.keyboard === void 0 || e.keyboard) && (t.push(new hu()), t.push(new gu({
		delta: e.zoomDelta,
		duration: e.zoomDuration
	}))), (e.mouseWheelZoom === void 0 || e.mouseWheelZoom) && t.push(new bu({
		onFocusOnly: e.onFocusOnly,
		duration: e.zoomDuration
	})), (e.shiftDragZoom === void 0 || e.shiftDragZoom) && t.push(new pu({ duration: e.zoomDuration })), t;
}
//#endregion
//#region node_modules/ol/layer/Property.js
var wu = {
	OPACITY: "opacity",
	VISIBLE: "visible",
	EXTENT: "extent",
	Z_INDEX: "zIndex",
	MAX_RESOLUTION: "maxResolution",
	MIN_RESOLUTION: "minResolution",
	MAX_ZOOM: "maxZoom",
	MIN_ZOOM: "minZoom",
	SOURCE: "source",
	MAP: "map"
}, Tu = class extends mi {
	constructor(e) {
		super(), this.on, this.once, this.un, this.background_ = e.background;
		let t = Object.assign({}, e);
		typeof e.properties == "object" && (delete t.properties, Object.assign(t, e.properties)), t[wu.OPACITY] = e.opacity === void 0 ? 1 : e.opacity, V(typeof t[wu.OPACITY] == "number", "Layer opacity must be a number"), t[wu.VISIBLE] = e.visible === void 0 || e.visible, t[wu.Z_INDEX] = e.zIndex, t[wu.MAX_RESOLUTION] = e.maxResolution === void 0 ? Infinity : e.maxResolution, t[wu.MIN_RESOLUTION] = e.minResolution === void 0 ? 0 : e.minResolution, t[wu.MIN_ZOOM] = e.minZoom === void 0 ? -Infinity : e.minZoom, t[wu.MAX_ZOOM] = e.maxZoom === void 0 ? Infinity : e.maxZoom, this.className_ = t.className === void 0 ? "ol-layer" : t.className, delete t.className, this.setProperties(t), this.state_ = null;
	}
	getBackground() {
		return this.background_;
	}
	getClassName() {
		return this.className_;
	}
	getLayerState(e) {
		let t = this.state_ || {
			layer: this,
			managed: e === void 0 || e
		}, n = this.getZIndex();
		return t.opacity = Ri(Math.round(this.getOpacity() * 100) / 100, 0, 1), t.visible = this.getVisible(), t.extent = this.getExtent(), t.zIndex = n === void 0 && !t.managed ? Infinity : n, t.maxResolution = this.getMaxResolution(), t.minResolution = Math.max(this.getMinResolution(), 0), t.minZoom = this.getMinZoom(), t.maxZoom = this.getMaxZoom(), this.state_ = t, t;
	}
	getLayersArray(e) {
		return R();
	}
	getLayerStatesArray(e) {
		return R();
	}
	getExtent() {
		return this.get(wu.EXTENT);
	}
	getMaxResolution() {
		return this.get(wu.MAX_RESOLUTION);
	}
	getMinResolution() {
		return this.get(wu.MIN_RESOLUTION);
	}
	getMinZoom() {
		return this.get(wu.MIN_ZOOM);
	}
	getMaxZoom() {
		return this.get(wu.MAX_ZOOM);
	}
	getOpacity() {
		return this.get(wu.OPACITY);
	}
	getSourceState() {
		return R();
	}
	getVisible() {
		return this.get(wu.VISIBLE);
	}
	getZIndex() {
		return this.get(wu.Z_INDEX);
	}
	setBackground(e) {
		this.background_ = e, this.changed();
	}
	setExtent(e) {
		this.set(wu.EXTENT, e);
	}
	setMaxResolution(e) {
		this.set(wu.MAX_RESOLUTION, e);
	}
	setMinResolution(e) {
		this.set(wu.MIN_RESOLUTION, e);
	}
	setMaxZoom(e) {
		this.set(wu.MAX_ZOOM, e);
	}
	setMinZoom(e) {
		this.set(wu.MIN_ZOOM, e);
	}
	setOpacity(e) {
		V(typeof e == "number", "Layer opacity must be a number"), this.set(wu.OPACITY, e);
	}
	setVisible(e) {
		this.set(wu.VISIBLE, e);
	}
	setZIndex(e) {
		this.set(wu.Z_INDEX, e);
	}
	disposeInternal() {
		this.state_ &&= (this.state_.layer = null, null), super.disposeInternal();
	}
}, Eu = {
	ADDLAYER: "addlayer",
	REMOVELAYER: "removelayer"
}, Du = class extends ci {
	constructor(e, t) {
		super(e), this.layer = t;
	}
}, Ou = { LAYERS: "layers" }, ku = class e extends Tu {
	constructor(e) {
		e ||= {};
		let t = Object.assign({}, e);
		delete t.layers;
		let n = e.layers;
		super(t), this.on, this.once, this.un, this.layersListenerKeys_ = [], this.listenerKeys_ = {}, this.addChangeListener(Ou.LAYERS, this.handleLayersChanged_), n ? Array.isArray(n) ? n = new _i(n.slice(), { unique: !0 }) : V(typeof n.getArray == "function", "Expected `layers` to be an array or a `Collection`") : n = new _i(void 0, { unique: !0 }), this.setLayers(n);
	}
	handleLayerChange_() {
		this.changed();
	}
	handleLayersChanged_() {
		this.layersListenerKeys_.forEach(qr), this.layersListenerKeys_.length = 0;
		let e = this.getLayers();
		this.layersListenerKeys_.push(I(e, Hr.ADD, this.handleLayersAdd_, this), I(e, Hr.REMOVE, this.handleLayersRemove_, this));
		for (let e in this.listenerKeys_) this.listenerKeys_[e].forEach(qr);
		Wr(this.listenerKeys_);
		let t = e.getArray();
		for (let e = 0, n = t.length; e < n; e++) {
			let n = t[e];
			this.registerLayerListeners_(n), this.dispatchEvent(new Du(Eu.ADDLAYER, n));
		}
		this.changed();
	}
	registerLayerListeners_(t) {
		let n = [I(t, Ur.PROPERTYCHANGE, this.handleLayerChange_, this), I(t, L.CHANGE, this.handleLayerChange_, this)];
		t instanceof e && n.push(I(t, Eu.ADDLAYER, this.handleLayerGroupAdd_, this), I(t, Eu.REMOVELAYER, this.handleLayerGroupRemove_, this)), this.listenerKeys_[z(t)] = n;
	}
	handleLayerGroupAdd_(e) {
		this.dispatchEvent(new Du(Eu.ADDLAYER, e.layer));
	}
	handleLayerGroupRemove_(e) {
		this.dispatchEvent(new Du(Eu.REMOVELAYER, e.layer));
	}
	handleLayersAdd_(e) {
		let t = e.element;
		this.registerLayerListeners_(t), this.dispatchEvent(new Du(Eu.ADDLAYER, t)), this.changed();
	}
	handleLayersRemove_(e) {
		let t = e.element, n = z(t);
		this.listenerKeys_[n].forEach(qr), delete this.listenerKeys_[n], this.dispatchEvent(new Du(Eu.REMOVELAYER, t)), this.changed();
	}
	getLayers() {
		return this.get(Ou.LAYERS);
	}
	setLayers(e) {
		let t = this.getLayers();
		if (t) {
			let e = t.getArray();
			for (let t = 0, n = e.length; t < n; ++t) this.dispatchEvent(new Du(Eu.REMOVELAYER, e[t]));
		}
		this.set(Ou.LAYERS, e);
	}
	getLayersArray(e) {
		return e = e === void 0 ? [] : e, this.getLayers().forEach(function(t) {
			t.getLayersArray(e);
		}), e;
	}
	getLayerStatesArray(e) {
		let t = e === void 0 ? [] : e, n = t.length;
		this.getLayers().forEach(function(e) {
			e.getLayerStatesArray(t);
		});
		let r = this.getLayerState(), i = r.zIndex;
		!e && r.zIndex === void 0 && (i = 0);
		for (let e = n, a = t.length; e < a; e++) {
			let n = t[e];
			n.opacity *= r.opacity, n.visible = n.visible && r.visible, n.maxResolution = Math.min(n.maxResolution, r.maxResolution), n.minResolution = Math.max(n.minResolution, r.minResolution), n.minZoom = Math.max(n.minZoom, r.minZoom), n.maxZoom = Math.min(n.maxZoom, r.maxZoom), r.extent !== void 0 && (n.extent = n.extent === void 0 ? r.extent : Da(n.extent, r.extent)), n.zIndex === void 0 && (n.zIndex = i);
		}
		return t;
	}
	getSourceState() {
		return "ready";
	}
}, Au = {
	PRERENDER: "prerender",
	POSTRENDER: "postrender",
	PRECOMPOSE: "precompose",
	POSTCOMPOSE: "postcompose",
	RENDERCOMPLETE: "rendercomplete"
}, ju = class extends Tu {
	constructor(e) {
		let t = Object.assign({}, e);
		delete t.source, super(t), this.on, this.once, this.un, this.mapPrecomposeKey_ = null, this.mapRenderKey_ = null, this.sourceChangeKey_ = null, this.renderer_ = null, this.sourceReady_ = !1, this.rendered = !1, e.render && (this.render = e.render), e.map && this.setMap(e.map), this.addChangeListener(wu.SOURCE, this.handleSourcePropertyChange_);
		let n = e.source ? e.source : null;
		this.setSource(n);
	}
	getLayersArray(e) {
		return e ||= [], e.push(this), e;
	}
	getLayerStatesArray(e) {
		return e ||= [], e.push(this.getLayerState()), e;
	}
	getSource() {
		return this.get(wu.SOURCE) || null;
	}
	getRenderSource() {
		return this.getSource();
	}
	getSourceState() {
		let e = this.getSource();
		return e ? e.getState() : "undefined";
	}
	handleSourceChange_() {
		this.changed(), !(this.sourceReady_ || this.getSource().getState() !== "ready") && (this.sourceReady_ = !0, this.dispatchEvent("sourceready"));
	}
	handleSourcePropertyChange_() {
		this.sourceChangeKey_ &&= (qr(this.sourceChangeKey_), null), this.sourceReady_ = !1;
		let e = this.getSource();
		e && (this.sourceChangeKey_ = I(e, L.CHANGE, this.handleSourceChange_, this), e.getState() === "ready" && (this.sourceReady_ = !0, setTimeout(() => {
			this.dispatchEvent("sourceready");
		}, 0))), this.changed();
	}
	getFeatures(e) {
		return this.renderer_ ? this.renderer_.getFeatures(e) : Promise.resolve([]);
	}
	getData(e) {
		return !this.renderer_ || !this.rendered ? null : this.renderer_.getData(e);
	}
	isVisible(e) {
		let t, n = this.getMapInternal();
		!e && n && (e = n.getView()), t = e instanceof ll ? {
			viewState: e.getState(),
			extent: e.calculateExtent()
		} : e, !t.layerStatesArray && n && (t.layerStatesArray = n.getLayerGroup().getLayerStatesArray());
		let r;
		if (t.layerStatesArray) {
			if (r = t.layerStatesArray.find((e) => e.layer === this), !r) return !1;
		} else r = this.getLayerState();
		let i = this.getExtent();
		return Mu(r, t.viewState) && (!i || ja(i, t.extent));
	}
	getAttributions(e) {
		if (!this.isVisible(e)) return [];
		let t = this.getSource()?.getAttributions();
		if (!t) return [];
		let n = t(e instanceof ll ? e.getViewStateAndExtent() : e);
		return Array.isArray(n) || (n = [n]), n;
	}
	render(e, t) {
		let n = this.getRenderer();
		return n.prepareFrame(e) ? (this.rendered = !0, n.renderFrame(e, t)) : null;
	}
	unrender() {
		this.rendered = !1;
	}
	getDeclutter() {}
	renderDeclutter(e, t) {}
	renderDeferred(e) {
		let t = this.getRenderer();
		t && t.renderDeferred(e);
	}
	setMapInternal(e) {
		e || this.unrender(), this.set(wu.MAP, e);
	}
	getMapInternal() {
		return this.get(wu.MAP);
	}
	setMap(e) {
		this.mapPrecomposeKey_ &&= (qr(this.mapPrecomposeKey_), null), e || this.changed(), this.mapRenderKey_ &&= (qr(this.mapRenderKey_), null), e && (this.mapPrecomposeKey_ = I(e, Au.PRECOMPOSE, this.handlePrecompose_, this), this.mapRenderKey_ = I(this, L.CHANGE, e.render, e), this.changed());
	}
	handlePrecompose_(e) {
		let t = e.frameState.layerStatesArray, n = this.getLayerState(!1);
		V(!t.some((e) => e.layer === n.layer), "A layer can only be added to the map once. Use either `layer.setMap()` or `map.addLayer()`, not both."), t.push(n);
	}
	setSource(e) {
		this.set(wu.SOURCE, e);
	}
	getRenderer() {
		return this.renderer_ ||= this.createRenderer(), this.renderer_;
	}
	hasRenderer() {
		return !!this.renderer_;
	}
	createRenderer() {
		return null;
	}
	clearRenderer() {
		this.renderer_ && (this.renderer_.dispose(), delete this.renderer_);
	}
	disposeInternal() {
		this.clearRenderer(), this.setSource(null), super.disposeInternal();
	}
};
function Mu(e, t) {
	if (!e.visible) return !1;
	let n = t.resolution;
	if (n < e.minResolution || n >= e.maxResolution) return !1;
	let r = t.zoom;
	return r > e.minZoom && r <= e.maxZoom;
}
//#endregion
//#region node_modules/quickselect/index.js
function Nu(e, t, n = 0, r = e.length - 1, i = Fu) {
	for (; r > n;) {
		if (r - n > 600) {
			let a = r - n + 1, o = t - n + 1, s = Math.log(a), c = .5 * Math.exp(2 * s / 3), l = .5 * Math.sqrt(s * c * (a - c) / a) * (o - a / 2 < 0 ? -1 : 1);
			Nu(e, t, Math.max(n, Math.floor(t - o * c / a + l)), Math.min(r, Math.floor(t + (a - o) * c / a + l)), i);
		}
		let a = e[t], o = n, s = r;
		for (Pu(e, n, t), i(e[r], a) > 0 && Pu(e, n, r); o < s;) {
			for (Pu(e, o, s), o++, s--; i(e[o], a) < 0;) o++;
			for (; i(e[s], a) > 0;) s--;
		}
		i(e[n], a) === 0 ? Pu(e, n, s) : (s++, Pu(e, s, r)), s <= t && (n = s + 1), t <= s && (r = s - 1);
	}
}
function Pu(e, t, n) {
	let r = e[t];
	e[t] = e[n], e[n] = r;
}
function Fu(e, t) {
	return e < t ? -1 : +(e > t);
}
//#endregion
//#region node_modules/rbush/index.js
var Iu = class {
	constructor(e = 9) {
		this._maxEntries = Math.max(4, e), this._minEntries = Math.max(2, Math.ceil(this._maxEntries * .4)), this.clear();
	}
	all() {
		return this._all(this.data, []);
	}
	search(e) {
		let t = this.data, n = [];
		if (!Ju(e, t)) return n;
		let r = this.toBBox, i = [];
		for (; t;) {
			for (let a = 0; a < t.children.length; a++) {
				let o = t.children[a], s = t.leaf ? r(o) : o;
				Ju(e, s) && (t.leaf ? n.push(o) : qu(e, s) ? this._all(o, n) : i.push(o));
			}
			t = i.pop();
		}
		return n;
	}
	collides(e) {
		let t = this.data;
		if (!Ju(e, t)) return !1;
		let n = [];
		for (; t;) {
			for (let r = 0; r < t.children.length; r++) {
				let i = t.children[r], a = t.leaf ? this.toBBox(i) : i;
				if (Ju(e, a)) {
					if (t.leaf || qu(e, a)) return !0;
					n.push(i);
				}
			}
			t = n.pop();
		}
		return !1;
	}
	load(e) {
		if (!(e && e.length)) return this;
		if (e.length < this._minEntries) {
			for (let t = 0; t < e.length; t++) this.insert(e[t]);
			return this;
		}
		let t = this._build(e.slice(), 0, e.length - 1, 0);
		if (!this.data.children.length) this.data = t;
		else if (this.data.height === t.height) this._splitRoot(this.data, t);
		else {
			if (this.data.height < t.height) {
				let e = this.data;
				this.data = t, t = e;
			}
			this._insert(t, this.data.height - t.height - 1, !0);
		}
		return this;
	}
	insert(e) {
		return e && this._insert(e, this.data.height - 1), this;
	}
	clear() {
		return this.data = Yu([]), this;
	}
	remove(e, t) {
		if (!e) return this;
		let n = this.data, r = this.toBBox(e), i = [], a = [], o, s, c;
		for (; n || i.length;) {
			if (n || (n = i.pop(), s = i[i.length - 1], o = a.pop(), c = !0), n.leaf) {
				let r = Lu(e, n.children, t);
				if (r !== -1) return n.children.splice(r, 1), i.push(n), this._condense(i), this;
			}
			!c && !n.leaf && qu(n, r) ? (i.push(n), a.push(o), o = 0, s = n, n = n.children[0]) : s ? (o++, n = s.children[o], c = !1) : n = null;
		}
		return this;
	}
	toBBox(e) {
		return e;
	}
	compareMinX(e, t) {
		return e.minX - t.minX;
	}
	compareMinY(e, t) {
		return e.minY - t.minY;
	}
	toJSON() {
		return this.data;
	}
	fromJSON(e) {
		return this.data = e, this;
	}
	_all(e, t) {
		let n = [];
		for (; e;) e.leaf ? t.push(...e.children) : n.push(...e.children), e = n.pop();
		return t;
	}
	_build(e, t, n, r) {
		let i = n - t + 1, a = this._maxEntries, o;
		if (i <= a) return o = Yu(e.slice(t, n + 1)), Ru(o, this.toBBox), o;
		r || (r = Math.ceil(Math.log(i) / Math.log(a)), a = Math.ceil(i / a ** (r - 1))), o = Yu([]), o.leaf = !1, o.height = r;
		let s = Math.ceil(i / a), c = s * Math.ceil(Math.sqrt(a));
		Xu(e, t, n, c, this.compareMinX);
		for (let i = t; i <= n; i += c) {
			let t = Math.min(i + c - 1, n);
			Xu(e, i, t, s, this.compareMinY);
			for (let n = i; n <= t; n += s) {
				let i = Math.min(n + s - 1, t);
				o.children.push(this._build(e, n, i, r - 1));
			}
		}
		return Ru(o, this.toBBox), o;
	}
	_chooseSubtree(e, t, n, r) {
		for (; r.push(t), !(t.leaf || r.length - 1 === n);) {
			let n = Infinity, r = Infinity, i;
			for (let a = 0; a < t.children.length; a++) {
				let o = t.children[a], s = Uu(o), c = Gu(e, o) - s;
				c < r ? (r = c, n = s < n ? s : n, i = o) : c === r && s < n && (n = s, i = o);
			}
			t = i || t.children[0];
		}
		return t;
	}
	_insert(e, t, n) {
		let r = n ? e : this.toBBox(e), i = [], a = this._chooseSubtree(r, this.data, t, i);
		for (a.children.push(e), Bu(a, r); t >= 0 && i[t].children.length > this._maxEntries;) this._split(i, t), t--;
		this._adjustParentBBoxes(r, i, t);
	}
	_split(e, t) {
		let n = e[t], r = n.children.length, i = this._minEntries;
		this._chooseSplitAxis(n, i, r);
		let a = this._chooseSplitIndex(n, i, r), o = Yu(n.children.splice(a, n.children.length - a));
		o.height = n.height, o.leaf = n.leaf, Ru(n, this.toBBox), Ru(o, this.toBBox), t ? e[t - 1].children.push(o) : this._splitRoot(n, o);
	}
	_splitRoot(e, t) {
		this.data = Yu([e, t]), this.data.height = e.height + 1, this.data.leaf = !1, Ru(this.data, this.toBBox);
	}
	_chooseSplitIndex(e, t, n) {
		let r, i = Infinity, a = Infinity;
		for (let o = t; o <= n - t; o++) {
			let t = zu(e, 0, o, this.toBBox), s = zu(e, o, n, this.toBBox), c = Ku(t, s), l = Uu(t) + Uu(s);
			c < i ? (i = c, r = o, a = l < a ? l : a) : c === i && l < a && (a = l, r = o);
		}
		return r || n - t;
	}
	_chooseSplitAxis(e, t, n) {
		let r = e.leaf ? this.compareMinX : Vu, i = e.leaf ? this.compareMinY : Hu;
		this._allDistMargin(e, t, n, r) < this._allDistMargin(e, t, n, i) && e.children.sort(r);
	}
	_allDistMargin(e, t, n, r) {
		e.children.sort(r);
		let i = this.toBBox, a = zu(e, 0, t, i), o = zu(e, n - t, n, i), s = Wu(a) + Wu(o);
		for (let r = t; r < n - t; r++) {
			let t = e.children[r];
			Bu(a, e.leaf ? i(t) : t), s += Wu(a);
		}
		for (let r = n - t - 1; r >= t; r--) {
			let t = e.children[r];
			Bu(o, e.leaf ? i(t) : t), s += Wu(o);
		}
		return s;
	}
	_adjustParentBBoxes(e, t, n) {
		for (let r = n; r >= 0; r--) Bu(t[r], e);
	}
	_condense(e) {
		for (let t = e.length - 1, n; t >= 0; t--) e[t].children.length === 0 ? t > 0 ? (n = e[t - 1].children, n.splice(n.indexOf(e[t]), 1)) : this.clear() : Ru(e[t], this.toBBox);
	}
};
function Lu(e, t, n) {
	if (!n) return t.indexOf(e);
	for (let r = 0; r < t.length; r++) if (n(e, t[r])) return r;
	return -1;
}
function Ru(e, t) {
	zu(e, 0, e.children.length, t, e);
}
function zu(e, t, n, r, i) {
	i ||= Yu(null), i.minX = Infinity, i.minY = Infinity, i.maxX = -Infinity, i.maxY = -Infinity;
	for (let a = t; a < n; a++) {
		let t = e.children[a];
		Bu(i, e.leaf ? r(t) : t);
	}
	return i;
}
function Bu(e, t) {
	return e.minX = Math.min(e.minX, t.minX), e.minY = Math.min(e.minY, t.minY), e.maxX = Math.max(e.maxX, t.maxX), e.maxY = Math.max(e.maxY, t.maxY), e;
}
function Vu(e, t) {
	return e.minX - t.minX;
}
function Hu(e, t) {
	return e.minY - t.minY;
}
function Uu(e) {
	return (e.maxX - e.minX) * (e.maxY - e.minY);
}
function Wu(e) {
	return e.maxX - e.minX + (e.maxY - e.minY);
}
function Gu(e, t) {
	return (Math.max(t.maxX, e.maxX) - Math.min(t.minX, e.minX)) * (Math.max(t.maxY, e.maxY) - Math.min(t.minY, e.minY));
}
function Ku(e, t) {
	let n = Math.max(e.minX, t.minX), r = Math.max(e.minY, t.minY), i = Math.min(e.maxX, t.maxX), a = Math.min(e.maxY, t.maxY);
	return Math.max(0, i - n) * Math.max(0, a - r);
}
function qu(e, t) {
	return e.minX <= t.minX && e.minY <= t.minY && t.maxX <= e.maxX && t.maxY <= e.maxY;
}
function Ju(e, t) {
	return t.minX <= e.maxX && t.minY <= e.maxY && t.maxX >= e.minX && t.maxY >= e.minY;
}
function Yu(e) {
	return {
		children: e,
		height: 1,
		leaf: !0,
		minX: Infinity,
		minY: Infinity,
		maxX: -Infinity,
		maxY: -Infinity
	};
}
function Xu(e, t, n, r, i) {
	let a = [t, n];
	for (; a.length;) {
		if (n = a.pop(), t = a.pop(), n - t <= r) continue;
		let o = t + Math.ceil((n - t) / r / 2) * r;
		Nu(e, o, t, n, i), a.push(t, o, o, n);
	}
}
//#endregion
//#region node_modules/ol/color.js
var Zu = [
	NaN,
	NaN,
	NaN,
	0
], Qu;
function $u() {
	return Qu ||= Tl(1, 1, void 0, {
		willReadFrequently: !0,
		desynchronized: !0
	}), Qu;
}
var ed = /^rgba?\(\s*(\d+%?)\s+(\d+%?)\s+(\d+%?)(?:\s*\/\s*(\d+%|\d*\.\d+|[01]))?\s*\)$/i, td = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+%|\d*\.\d+|[01]))?\s*\)$/i, nd = /^rgba?\(\s*(\d+%)\s*,\s*(\d+%)\s*,\s*(\d+%)(?:\s*,\s*(\d+%|\d*\.\d+|[01]))?\s*\)$/i, rd = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;
function id(e, t) {
	return e.endsWith("%") ? Number(e.substring(0, e.length - 1)) / t : Number(e);
}
function ad(e) {
	throw Error("failed to parse \"" + e + "\" as color");
}
function od(e) {
	if (e.toLowerCase().startsWith("rgb")) {
		let t = e.match(td) || e.match(ed) || e.match(nd);
		if (t) {
			let e = t[4], n = 100 / 255;
			return [
				Ri(id(t[1], n) + .5 | 0, 0, 255),
				Ri(id(t[2], n) + .5 | 0, 0, 255),
				Ri(id(t[3], n) + .5 | 0, 0, 255),
				e === void 0 ? 1 : Ri(id(e, 100), 0, 1)
			];
		}
		ad(e);
	}
	if (e.startsWith("#")) {
		if (rd.test(e)) {
			let t = e.substring(1), n = t.length <= 4 ? 1 : 2, r = [
				0,
				0,
				0,
				255
			];
			for (let e = 0, i = t.length; e < i; e += n) {
				let i = parseInt(t.substring(e, e + n), 16);
				n === 1 && (i += i << 4), r[e / n] = i;
			}
			return r[3] /= 255, r;
		}
		ad(e);
	}
	let t = $u();
	t.fillStyle = "#abcdef";
	let n = t.fillStyle;
	t.fillStyle = e, t.fillStyle === n && (t.fillStyle = "#fedcba", n = t.fillStyle, t.fillStyle = e, t.fillStyle === n && ad(e));
	let r = t.fillStyle;
	if (r.startsWith("#") || r.startsWith("rgba")) return od(r);
	t.clearRect(0, 0, 1, 1), t.fillRect(0, 0, 1, 1);
	let i = Array.from(t.getImageData(0, 0, 1, 1).data);
	return i[3] = Ki(i[3] / 255, 3), i;
}
function sd(e) {
	return typeof e == "string" ? e : bd(e);
}
var cd = 1024, ld = {}, ud = 0;
function dd(e) {
	if (e.length === 4) return e;
	let t = e.slice();
	return t[3] = 1, t;
}
function fd(e) {
	return e > .0031308 ? e ** (1 / 2.4) * 269.025 - 14.025 : e * 3294.6;
}
function pd(e) {
	return e > .2068965 ? e ** 3 : (e - 4 / 29) * (108 / 841);
}
function md(e) {
	return e > 10.314724 ? ((e + 14.025) / 269.025) ** 2.4 : e / 3294.6;
}
function hd(e) {
	return e > .0088564 ? e ** (1 / 3) : e / (108 / 841) + 4 / 29;
}
function gd(e) {
	let t = md(e[0]), n = md(e[1]), r = md(e[2]), i = hd(t * .222488403 + n * .716873169 + r * .06060791), a = 500 * (hd(t * .452247074 + n * .399439023 + r * .148375274) - i), o = 200 * (i - hd(t * .016863605 + n * .117638439 + r * .865350722)), s = 180 / Math.PI * Math.atan2(o, a);
	return [
		116 * i - 16,
		Math.sqrt(a * a + o * o),
		s < 0 ? s + 360 : s,
		e[3]
	];
}
function _d(e) {
	let t = (e[0] + 16) / 116, n = e[1], r = e[2] * Math.PI / 180, i = pd(t), a = pd(t + n / 500 * Math.cos(r)), o = pd(t - n / 200 * Math.sin(r)), s = fd(a * 3.021973625 - i * 1.617392459 - o * .404875592), c = fd(a * -.943766287 + i * 1.916279586 + o * .027607165), l = fd(a * .069407491 - i * .22898585 + o * 1.159737864);
	return [
		Ri(s + .5 | 0, 0, 255),
		Ri(c + .5 | 0, 0, 255),
		Ri(l + .5 | 0, 0, 255),
		e[3]
	];
}
function vd(e) {
	if (e === "none") return Zu;
	if (ld.hasOwnProperty(e)) return ld[e];
	if (ud >= cd) {
		let e = 0;
		for (let t in ld) e++ & 3 || (delete ld[t], --ud);
	}
	let t = od(e);
	t.length !== 4 && ad(e);
	for (let n of t) isNaN(n) && ad(e);
	return ld[e] = t, ++ud, t;
}
function yd(e) {
	return Array.isArray(e) ? e : vd(e);
}
function bd(e) {
	let t = e[0];
	t != (t | 0) && (t = t + .5 | 0);
	let n = e[1];
	n != (n | 0) && (n = n + .5 | 0);
	let r = e[2];
	r != (r | 0) && (r = r + .5 | 0);
	let i = e[3] === void 0 ? 1 : Math.round(e[3] * 1e3) / 1e3;
	return "rgba(" + t + "," + n + "," + r + "," + i + ")";
}
//#endregion
//#region node_modules/ol/size.js
function xd(e) {
	return e[0] > 0 && e[1] > 0;
}
function Sd(e, t, n) {
	return n === void 0 && (n = [0, 0]), n[0] = e[0] * t + .5 | 0, n[1] = e[1] * t + .5 | 0, n;
}
function Cd(e, t) {
	return Array.isArray(e) ? e : (t === void 0 ? t = [e, e] : (t[0] = e, t[1] = e), t);
}
//#endregion
//#region node_modules/ol/expr/expression.js
var wd = 0, Td = 1 << wd++, U = 1 << wd++, Ed = 1 << wd++, Dd = 1 << wd++, Od = 1 << wd++, kd = 1 << wd++, Ad = 2 ** wd - 1, jd = {
	[Td]: "boolean",
	[U]: "number",
	[Ed]: "string",
	[Dd]: "color",
	[Od]: "number[]",
	[kd]: "size"
}, Md = Object.keys(jd).map(Number).sort(Xr);
function Nd(e) {
	return e in jd;
}
function Pd(e) {
	let t = [];
	for (let n of Md) Fd(e, n) && t.push(jd[n]);
	return t.length === 0 ? "untyped" : t.length < 3 ? t.join(" or ") : t.slice(0, -1).join(", ") + ", or " + t[t.length - 1];
}
function Fd(e, t) {
	return (e & t) === t;
}
function Id(e, t) {
	return !!(e & t);
}
function Ld(e, t) {
	return e === t;
}
var Rd = class {
	constructor(e, t) {
		if (!Nd(e)) throw Error(`literal expressions must have a specific type, got ${Pd(e)}`);
		this.type = e, this.value = t;
	}
}, zd = class {
	constructor(e, t, ...n) {
		this.type = e, this.operator = t, this.args = n;
	}
};
function Bd(e) {
	return {
		variables: /* @__PURE__ */ new Map(),
		properties: /* @__PURE__ */ new Map(),
		featureId: !1,
		geometryType: !1,
		mCoordinate: !1,
		mapState: !1,
		inputVariables: e
	};
}
function Vd(e, t, n) {
	switch (typeof e) {
		case "boolean":
			if (Ld(t, Ed)) return new Rd(Ed, e ? "true" : "false");
			if (!Fd(t, Td)) throw Error(`got a boolean, but expected ${Pd(t)}`);
			return new Rd(Td, e);
		case "number":
			if (Ld(t, kd)) return new Rd(kd, Cd(e));
			if (Ld(t, Td)) return new Rd(Td, !!e);
			if (Ld(t, Ed)) return new Rd(Ed, e.toString());
			if (!Fd(t, U)) throw Error(`got a number, but expected ${Pd(t)}`);
			return new Rd(U, e);
		case "string":
			if (Ld(t, Dd)) return new Rd(Dd, vd(e));
			if (Ld(t, Td)) return new Rd(Td, !!e);
			if (!Fd(t, Ed)) throw Error(`got a string, but expected ${Pd(t)}`);
			return new Rd(Ed, e);
	}
	if (!Array.isArray(e)) throw Error("expression must be an array or a primitive value");
	if (e.length === 0) throw Error("empty expression");
	if (typeof e[0] == "string") return sf(e, t, n);
	for (let t of e) if (typeof t != "number") throw Error("expected an array of numbers");
	if (Ld(t, kd)) {
		if (e.length !== 2) throw Error(`expected an array of two values for a size, got ${e.length}`);
		return new Rd(kd, e);
	}
	if (Ld(t, Dd)) {
		if (e.length === 3) return new Rd(Dd, [...e, 1]);
		if (e.length === 4) return new Rd(Dd, e);
		throw Error(`expected an array of 3 or 4 values for a color, got ${e.length}`);
	}
	if (!Fd(t, Od)) throw Error(`got an array of numbers, but expected ${Pd(t)}`);
	return new Rd(Od, e);
}
var W = {
	Get: "get",
	Var: "var",
	Concat: "concat",
	GeometryType: "geometry-type",
	LineMetric: "line-metric",
	Any: "any",
	All: "all",
	Not: "!",
	Resolution: "resolution",
	Zoom: "zoom",
	Time: "time",
	Equal: "==",
	NotEqual: "!=",
	GreaterThan: ">",
	GreaterThanOrEqualTo: ">=",
	LessThan: "<",
	LessThanOrEqualTo: "<=",
	Multiply: "*",
	Divide: "/",
	Add: "+",
	Subtract: "-",
	Clamp: "clamp",
	Mod: "%",
	Pow: "^",
	Abs: "abs",
	Floor: "floor",
	Ceil: "ceil",
	Round: "round",
	Sin: "sin",
	Cos: "cos",
	Atan: "atan",
	Sqrt: "sqrt",
	Match: "match",
	Between: "between",
	Interpolate: "interpolate",
	Coalesce: "coalesce",
	Case: "case",
	In: "in",
	Number: "number",
	String: "string",
	Array: "array",
	Color: "color",
	Id: "id",
	Band: "band",
	Palette: "palette",
	ToString: "to-string",
	Has: "has"
}, Hd = {
	[W.Get]: K(G(1, Infinity), Ud),
	[W.Var]: Wd(),
	[W.Has]: K(G(1, Infinity), Ud),
	[W.Id]: K(Gd, Yd),
	[W.Concat]: K(G(2, Infinity), Zd(Ed)),
	[W.GeometryType]: K(Kd, Yd),
	[W.LineMetric]: K(qd, Yd),
	[W.Resolution]: K(Jd, Yd),
	[W.Zoom]: K(Jd, Yd),
	[W.Time]: K(Jd, Yd),
	[W.Any]: K(G(2, Infinity), Zd(Td)),
	[W.All]: K(G(2, Infinity), Zd(Td)),
	[W.Not]: K(G(1, 1), Zd(Td)),
	[W.Equal]: K(G(2, 2), Qd()),
	[W.NotEqual]: K(G(2, 2), Qd()),
	[W.GreaterThan]: K(G(2, 2), Zd(U)),
	[W.GreaterThanOrEqualTo]: K(G(2, 2), Zd(U)),
	[W.LessThan]: K(G(2, 2), Zd(U)),
	[W.LessThanOrEqualTo]: K(G(2, 2), Zd(U)),
	[W.Multiply]: K(G(2, Infinity), Xd),
	[W.Coalesce]: K(G(2, Infinity), Xd),
	[W.Divide]: K(G(2, 2), Zd(U)),
	[W.Add]: K(G(2, Infinity), Zd(U)),
	[W.Subtract]: K(G(2, 2), Zd(U)),
	[W.Clamp]: K(G(3, 3), Zd(U)),
	[W.Mod]: K(G(2, 2), Zd(U)),
	[W.Pow]: K(G(2, 2), Zd(U)),
	[W.Abs]: K(G(1, 1), Zd(U)),
	[W.Floor]: K(G(1, 1), Zd(U)),
	[W.Ceil]: K(G(1, 1), Zd(U)),
	[W.Round]: K(G(1, 1), Zd(U)),
	[W.Sin]: K(G(1, 1), Zd(U)),
	[W.Cos]: K(G(1, 1), Zd(U)),
	[W.Atan]: K(G(1, 2), Zd(U)),
	[W.Sqrt]: K(G(1, 1), Zd(U)),
	[W.Match]: K(G(4, Infinity), ef, tf),
	[W.Between]: K(G(3, 3), Zd(U)),
	[W.Interpolate]: K(G(6, Infinity), ef, nf),
	[W.Case]: K(G(3, Infinity), $d, rf),
	[W.In]: K(G(2, 2), af),
	[W.Number]: K(G(1, Infinity), Zd(Ad)),
	[W.String]: K(G(1, Infinity), Zd(Ad)),
	[W.Array]: K(G(1, Infinity), Zd(U)),
	[W.Color]: K(G(1, 4), Zd(U)),
	[W.Band]: K(G(1, 3), Zd(U)),
	[W.Palette]: K(G(2, 2), of),
	[W.ToString]: K(G(1, 1), Zd(Td | U | Ed | Dd))
};
function Ud(e, t, n) {
	let r = e.length - 1, i = Array(r);
	for (let a = 0; a < r; ++a) {
		let r = e[a + 1];
		switch (typeof r) {
			case "number":
				i[a] = new Rd(U, r);
				break;
			case "string":
				i[a] = new Rd(Ed, r);
				break;
			default: throw Error(`expected a string key or numeric array index for a get operation, got ${r}`);
		}
		a === 0 && n.properties.set(String(r), t);
	}
	return i;
}
function Wd() {
	return function(e, t, n) {
		let r = e[1];
		if (typeof r != "string") throw Error("expected a string argument for var operation");
		let i = t, a = n.inputVariables?.[r];
		if (a !== void 0) {
			let e = Vd(a, Ad, n);
			if (!(e instanceof Rd)) throw Error(`style variables should only be literal values (no expressions!), variable name: ${r}`);
			let o = e.type;
			if (typeof a == "string" && Id(i, Dd) && !Id(i, Ed) ? o = Dd : Array.isArray(a) && a.length === 2 && Id(i, kd) && !Id(i, Od) && (o = kd), i &= o, i === 0) throw Error(`the type expected from the var operator (${Pd(t)}) did not have any overlap with the type of the corresponding style variables (${Pd(o)}), variable name: ${r}`);
		}
		if (n.variables.has(r)) {
			let e = n.variables.get(r);
			if (i &= e, i === 0) throw Error(`a new type expected from the var operator (${Pd(t)}) did not have any overlap with the previous type expected for it (${Pd(e)}), variable name: ${r}`);
		}
		return n.variables.set(r, i), new zd(i, "var", new Rd(Ed, r));
	};
}
function Gd(e, t, n) {
	n.featureId = !0;
}
function Kd(e, t, n) {
	n.geometryType = !0;
}
function qd(e, t, n) {
	n.mCoordinate = !0;
}
function Jd(e, t, n) {
	n.mapState = !0;
}
function Yd(e, t, n) {
	let r = e[0];
	if (e.length !== 1) throw Error(`expected no arguments for ${r} operation`);
	return [];
}
function G(e, t) {
	return function(n, r, i) {
		let a = n[0], o = n.length - 1;
		if (e === t) {
			if (o !== e) throw Error(`expected ${e} argument${e === 1 ? "" : "s"} for ${a}, got ${o}`);
		} else if (o < e || o > t) {
			let n = t === Infinity ? `${e} or more` : `${e} to ${t}`;
			throw Error(`expected ${n} arguments for ${a}, got ${o}`);
		}
	};
}
function Xd(e, t, n) {
	let r = e.length - 1, i = Array(r);
	for (let a = 0; a < r; ++a) {
		let r = Vd(e[a + 1], t, n);
		i[a] = r;
	}
	return i;
}
function Zd(e) {
	return function(t, n, r) {
		let i = t.length - 1, a = Array(i);
		for (let n = 0; n < i; ++n) {
			let i = Vd(t[n + 1], e, r);
			a[n] = i;
		}
		return a;
	};
}
function Qd() {
	return function(e, t, n) {
		let r = e[0], i = e.length - 1, a = Array(i), o = Ad;
		for (let t = 0; t < i; ++t) {
			let r = Vd(e[t + 1], o, n);
			o &= r.type;
		}
		if (o === 0) throw Error(`no common type was found among the arguments of ${r}`);
		for (let t = 0; t < i; ++t) {
			let r = Vd(e[t + 1], o, n);
			a[t] = r;
		}
		return a;
	};
}
function $d(e, t, n) {
	let r = e[0], i = e.length - 1;
	if (i % 2 == 0) throw Error(`expected an odd number of arguments for ${r}, got ${i} instead`);
}
function ef(e, t, n) {
	let r = e[0], i = e.length - 1;
	if (i % 2 == 1) throw Error(`expected an even number of arguments for operation ${r}, got ${i} instead`);
}
function tf(e, t, n) {
	let r = e.length - 1, i = Vd(e[e.length - 1], t, n), a = Ed | U | Td, o = Array(r - 2);
	for (let t = 0; t < r - 2; t += 2) {
		try {
			let r = Vd(e[t + 2], a, n);
			a &= r.type;
		} catch (e) {
			throw Error(`failed to parse argument ${t + 1} of match expression: ${e.message}`);
		}
		if (a === 0) throw Error("no common type was found among the arguments of match expression");
	}
	for (let t = 0; t < r - 2; t += 2) {
		try {
			let r = Vd(e[t + 2], a, n);
			o[t] = r;
		} catch (e) {
			throw Error(`failed to parse argument ${t + 1} of match expression: ${e.message}`);
		}
		try {
			let r = Vd(e[t + 3], i.type, n);
			o[t + 1] = r;
		} catch (e) {
			throw Error(`failed to parse argument ${t + 2} of match expression: ${e.message}`);
		}
	}
	return [
		Vd(e[1], a, n),
		...o,
		i
	];
}
function nf(e, t, n) {
	let r = e[1], i;
	switch (r[0]) {
		case "linear":
			i = 1;
			break;
		case "exponential":
			let e = r[1];
			if (typeof e != "number" || e <= 0) throw Error(`expected a number base for exponential interpolation, got ${JSON.stringify(e)} instead`);
			i = e;
			break;
		default: throw Error(`invalid interpolation type: ${JSON.stringify(r)}`);
	}
	let a = new Rd(U, i), o;
	try {
		o = Vd(e[2], U, n);
	} catch (e) {
		throw Error(`failed to parse argument 1 in interpolate expression: ${e.message}`);
	}
	let s = Array(e.length - 3);
	for (let r = 0; r < s.length; r += 2) {
		try {
			let t = Vd(e[r + 3], U, n);
			s[r] = t;
		} catch (e) {
			throw Error(`failed to parse argument ${r + 2} for interpolate expression: ${e.message}`);
		}
		try {
			let i = Vd(e[r + 4], t, n);
			s[r + 1] = i;
		} catch (e) {
			throw Error(`failed to parse argument ${r + 3} for interpolate expression: ${e.message}`);
		}
	}
	return [
		a,
		o,
		...s
	];
}
function rf(e, t, n) {
	let r = Vd(e[e.length - 1], t, n), i = Array(e.length - 1);
	for (let t = 0; t < i.length - 1; t += 2) {
		try {
			let r = Vd(e[t + 1], Td, n);
			i[t] = r;
		} catch (e) {
			throw Error(`failed to parse argument ${t} of case expression: ${e.message}`);
		}
		try {
			let a = Vd(e[t + 2], r.type, n);
			i[t + 1] = a;
		} catch (e) {
			throw Error(`failed to parse argument ${t + 1} of case expression: ${e.message}`);
		}
	}
	return i[i.length - 1] = r, i;
}
function af(e, t, n) {
	let r = e[2];
	if (!Array.isArray(r)) throw Error("the second argument for the \"in\" operator must be an array");
	let i;
	if (r[0] === "literal") {
		if (r = r[1], !Array.isArray(r)) throw Error("failed to parse \"in\" expression: the literal operator must be followed by an array");
	} else if (typeof r[0] == "string") throw Error("for the \"in\" operator, a string array should be wrapped in a \"literal\" operator to disambiguate from expressions");
	i = typeof r[0] == "string" ? Ed : U;
	let a = Array(r.length);
	for (let e = 0; e < a.length; e++) try {
		let t = Vd(r[e], i, n);
		a[e] = t;
	} catch (t) {
		throw Error(`failed to parse haystack item ${e} for "in" expression: ${t.message}`);
	}
	return [Vd(e[1], i, n), ...a];
}
function of(e, t, n) {
	let r;
	try {
		r = Vd(e[1], U, n);
	} catch (e) {
		throw Error(`failed to parse first argument in palette expression: ${e.message}`);
	}
	let i = e[2];
	if (!Array.isArray(i)) throw Error("the second argument of palette must be an array");
	let a = Array(i.length);
	for (let e = 0; e < a.length; e++) {
		let t;
		try {
			t = Vd(i[e], Dd, n);
		} catch (t) {
			throw Error(`failed to parse color at index ${e} in palette expression: ${t.message}`);
		}
		if (!(t instanceof Rd)) throw Error(`the palette color at index ${e} must be a literal value`);
		a[e] = t;
	}
	return [r, ...a];
}
function K(...e) {
	return function(t, n, r) {
		let i = t[0], a;
		for (let i = 0; i < e.length; i++) {
			let o = e[i](t, n, r);
			if (i == e.length - 1) {
				if (!o) throw Error("expected last argument validator to return the parsed args");
				a = o;
			}
		}
		return new zd(n, i, ...a);
	};
}
function sf(e, t, n) {
	let r = e[0], i = Hd[r];
	if (!i) throw Error(`unknown operator: ${r}`);
	return i(e, t, n);
}
function cf(e) {
	if (!e) return "";
	let t = e.getType();
	switch (t) {
		case "Point":
		case "LineString":
		case "Polygon": return t;
		case "MultiPoint":
		case "MultiLineString":
		case "MultiPolygon": return t.substring(5);
		case "Circle": return "Polygon";
		case "GeometryCollection": return cf(e.getGeometries()[0]);
		default: return "";
	}
}
//#endregion
//#region node_modules/ol/expr/cpu.js
function lf() {
	return {
		variables: {},
		properties: {},
		resolution: NaN,
		featureId: null,
		geometryType: ""
	};
}
function uf(e, t, n) {
	return df(Vd(e, t, n), n);
}
function df(e, t) {
	if (e instanceof Rd) {
		if (e.type === Dd && typeof e.value == "string") {
			let t = vd(e.value);
			return function() {
				return t;
			};
		}
		return function() {
			return e.value;
		};
	}
	let n = e.operator;
	switch (n) {
		case W.Number:
		case W.String:
		case W.Coalesce: return ff(e, t);
		case W.Get:
		case W.Var:
		case W.Has: return pf(e, t);
		case W.Id: return (e) => e.featureId;
		case W.GeometryType: return (e) => e.geometryType;
		case W.Concat: {
			let n = e.args.map((e) => df(e, t));
			return (e) => "".concat(...n.map((t) => t(e).toString()));
		}
		case W.Resolution: return (e) => e.resolution;
		case W.Any:
		case W.All:
		case W.Between:
		case W.In:
		case W.Not: return hf(e, t);
		case W.Equal:
		case W.NotEqual:
		case W.LessThan:
		case W.LessThanOrEqualTo:
		case W.GreaterThan:
		case W.GreaterThanOrEqualTo: return mf(e, t);
		case W.Multiply:
		case W.Divide:
		case W.Add:
		case W.Subtract:
		case W.Clamp:
		case W.Mod:
		case W.Pow:
		case W.Abs:
		case W.Floor:
		case W.Ceil:
		case W.Round:
		case W.Sin:
		case W.Cos:
		case W.Atan:
		case W.Sqrt: return gf(e, t);
		case W.Case: return _f(e, t);
		case W.Match: return vf(e, t);
		case W.Interpolate: return yf(e, t);
		case W.ToString: return bf(e, t);
		default: throw Error(`Unsupported operator ${n}`);
	}
}
function ff(e, t) {
	let n = e.operator, r = e.args.length, i = Array(r);
	for (let n = 0; n < r; ++n) i[n] = df(e.args[n], t);
	switch (n) {
		case W.Coalesce: return (e) => {
			for (let t = 0; t < r; ++t) {
				let n = i[t](e);
				if (n != null) return n;
			}
			throw Error("Expected one of the values to be non-null");
		};
		case W.Number:
		case W.String: return (e) => {
			for (let t = 0; t < r; ++t) {
				let r = i[t](e);
				if (typeof r === n) return r;
			}
			throw Error(`Expected one of the values to be a ${n}`);
		};
		default: throw Error(`Unsupported assertion operator ${n}`);
	}
}
function pf(e, t) {
	let n = e.args[0].value;
	switch (e.operator) {
		case W.Get: return (t) => {
			let r = e.args, i = t.properties[n];
			for (let e = 1, t = r.length; e < t; ++e) {
				let t = r[e].value;
				i = i[t];
			}
			return i;
		};
		case W.Var: return (e) => e.variables[n];
		case W.Has: return (t) => {
			let r = e.args;
			if (!(n in t.properties)) return !1;
			let i = t.properties[n];
			for (let e = 1, t = r.length; e < t; ++e) {
				let t = r[e].value;
				if (!i || !Object.hasOwn(i, t)) return !1;
				i = i[t];
			}
			return !0;
		};
		default: throw Error(`Unsupported accessor operator ${e.operator}`);
	}
}
function mf(e, t) {
	let n = e.operator, r = df(e.args[0], t), i = df(e.args[1], t);
	switch (n) {
		case W.Equal: return (e) => r(e) === i(e);
		case W.NotEqual: return (e) => r(e) !== i(e);
		case W.LessThan: return (e) => r(e) < i(e);
		case W.LessThanOrEqualTo: return (e) => r(e) <= i(e);
		case W.GreaterThan: return (e) => r(e) > i(e);
		case W.GreaterThanOrEqualTo: return (e) => r(e) >= i(e);
		default: throw Error(`Unsupported comparison operator ${n}`);
	}
}
function hf(e, t) {
	let n = e.operator, r = e.args.length, i = Array(r);
	for (let n = 0; n < r; ++n) i[n] = df(e.args[n], t);
	switch (n) {
		case W.Any: return (e) => {
			for (let t = 0; t < r; ++t) if (i[t](e)) return !0;
			return !1;
		};
		case W.All: return (e) => {
			for (let t = 0; t < r; ++t) if (!i[t](e)) return !1;
			return !0;
		};
		case W.Between: return (e) => {
			let t = i[0](e), n = i[1](e), r = i[2](e);
			return t >= n && t <= r;
		};
		case W.In: return (e) => {
			let t = i[0](e);
			for (let n = 1; n < r; ++n) if (t === i[n](e)) return !0;
			return !1;
		};
		case W.Not: return (e) => !i[0](e);
		default: throw Error(`Unsupported logical operator ${n}`);
	}
}
function gf(e, t) {
	let n = e.operator, r = e.args.length, i = Array(r);
	for (let n = 0; n < r; ++n) i[n] = df(e.args[n], t);
	switch (n) {
		case W.Multiply: return (e) => {
			let t = 1;
			for (let n = 0; n < r; ++n) t *= i[n](e);
			return t;
		};
		case W.Divide: return (e) => i[0](e) / i[1](e);
		case W.Add: return (e) => {
			let t = 0;
			for (let n = 0; n < r; ++n) t += i[n](e);
			return t;
		};
		case W.Subtract: return (e) => i[0](e) - i[1](e);
		case W.Clamp: return (e) => {
			let t = i[0](e), n = i[1](e);
			if (t < n) return n;
			let r = i[2](e);
			return t > r ? r : t;
		};
		case W.Mod: return (e) => i[0](e) % i[1](e);
		case W.Pow: return (e) => i[0](e) ** +i[1](e);
		case W.Abs: return (e) => Math.abs(i[0](e));
		case W.Floor: return (e) => Math.floor(i[0](e));
		case W.Ceil: return (e) => Math.ceil(i[0](e));
		case W.Round: return (e) => Math.round(i[0](e));
		case W.Sin: return (e) => Math.sin(i[0](e));
		case W.Cos: return (e) => Math.cos(i[0](e));
		case W.Atan: return r === 2 ? (e) => Math.atan2(i[0](e), i[1](e)) : (e) => Math.atan(i[0](e));
		case W.Sqrt: return (e) => Math.sqrt(i[0](e));
		default: throw Error(`Unsupported numeric operator ${n}`);
	}
}
function _f(e, t) {
	let n = e.args.length, r = Array(n);
	for (let i = 0; i < n; ++i) r[i] = df(e.args[i], t);
	return (e) => {
		for (let t = 0; t < n - 1; t += 2) if (r[t](e)) return r[t + 1](e);
		return r[n - 1](e);
	};
}
function vf(e, t) {
	let n = e.args.length, r = Array(n);
	for (let i = 0; i < n; ++i) r[i] = df(e.args[i], t);
	return (e) => {
		let t = r[0](e);
		for (let i = 1; i < n - 1; i += 2) if (t === r[i](e)) return r[i + 1](e);
		return r[n - 1](e);
	};
}
function yf(e, t) {
	let n = e.args.length, r = Array(n);
	for (let i = 0; i < n; ++i) r[i] = df(e.args[i], t);
	return (e) => {
		let t = r[0](e), i = r[1](e), a, o;
		for (let s = 2; s < n; s += 2) {
			let n = r[s](e), c = r[s + 1](e), l = Array.isArray(c);
			if (l && (c = dd(c)), n >= i) return s === 2 ? c : l ? Sf(t, i, a, o, n, c) : xf(t, i, a, o, n, c);
			a = n, o = c;
		}
		return o;
	};
}
function bf(e, t) {
	let n = e.operator, r = e.args.length, i = Array(r);
	for (let n = 0; n < r; ++n) i[n] = df(e.args[n], t);
	switch (n) {
		case W.ToString: return (t) => {
			let n = i[0](t);
			return e.args[0].type === Dd ? bd(n) : n.toString();
		};
		default: throw Error(`Unsupported convert operator ${n}`);
	}
}
function xf(e, t, n, r, i, a) {
	let o = i - n;
	if (o === 0) return r;
	let s = t - n;
	return r + (e === 1 ? s / o : (e ** +s - 1) / (e ** +o - 1)) * (a - r);
}
function Sf(e, t, n, r, i, a) {
	if (i - n === 0) return r;
	let o = gd(r), s = gd(a), c = s[2] - o[2];
	return c > 180 ? c -= 360 : c < -180 && (c += 360), _d([
		xf(e, t, n, o[0], i, s[0]),
		xf(e, t, n, o[1], i, s[1]),
		o[2] + xf(e, t, n, 0, i, c),
		xf(e, t, n, r[3], i, a[3])
	]);
}
//#endregion
//#region node_modules/ol/ImageState.js
var q = {
	IDLE: 0,
	LOADING: 1,
	LOADED: 2,
	ERROR: 3,
	EMPTY: 4
};
//#endregion
//#region node_modules/ol/Image.js
function Cf(e, t, n) {
	let r = e, i = !0, a = !1, o = !1, s = [Kr(r, L.LOAD, function() {
		o = !0, a || t();
	})];
	return r.src && Ei ? (a = !0, r.decode().then(function() {
		i && t();
	}).catch(function(e) {
		i && (o ? t() : n());
	})) : s.push(Kr(r, L.ERROR, n)), function() {
		i = !1, s.forEach(qr);
	};
}
function wf(e, t) {
	return new Promise((n, r) => {
		function i() {
			o(), n(e);
		}
		function a() {
			o(), r(/* @__PURE__ */ Error("Image load error"));
		}
		function o() {
			e.removeEventListener("load", i), e.removeEventListener("error", a);
		}
		e.addEventListener("load", i), e.addEventListener("error", a), t && (e.src = t);
	});
}
function Tf(e, t) {
	return t && (e.src = t), e.src && Ei ? new Promise((t, n) => e.decode().then(() => t(e)).catch((r) => e.complete && e.width ? t(e) : n(r))) : wf(e);
}
//#endregion
//#region node_modules/ol/style/IconImageCache.js
var Ef = class {
	constructor() {
		this.cache_ = {}, this.patternCache_ = {}, this.cacheSize_ = 0, this.maxCacheSize_ = 1024;
	}
	clear() {
		this.cache_ = {}, this.patternCache_ = {}, this.cacheSize_ = 0;
	}
	canExpireCache() {
		return this.cacheSize_ > this.maxCacheSize_;
	}
	expire() {
		if (this.canExpireCache()) {
			let e = 0;
			for (let t in this.cache_) {
				let n = this.cache_[t];
				!(e++ & 3) && !n.hasListener() && (delete this.cache_[t], delete this.patternCache_[t], --this.cacheSize_);
			}
		}
	}
	get(e, t) {
		let n = Df(e, t);
		return n in this.cache_ ? this.cache_[n] : null;
	}
	getPattern(e, t) {
		let n = Df(e, t);
		return n in this.patternCache_ ? this.patternCache_[n] : null;
	}
	set(e, t, n, r) {
		let i = Df(e, t), a = i in this.cache_;
		this.cache_[i] = n, r && (n.getImageState() === q.IDLE && n.load(), n.getImageState() === q.LOADING ? n.ready().then(() => {
			this.patternCache_[i] = Dl().createPattern(n.getImage(1), "repeat");
		}) : this.patternCache_[i] = Dl().createPattern(n.getImage(1), "repeat")), a || ++this.cacheSize_;
	}
	setSize(e) {
		this.maxCacheSize_ = e, this.expire();
	}
};
function Df(e, t) {
	let n = t ? yd(t) : "null";
	return e + ":" + n;
}
var Of = new Ef(), kf = null, Af = class extends li {
	constructor(e, t, n, r, i) {
		super(), this.hitDetectionImage_ = null, this.image_ = e, this.crossOrigin_ = n?.crossOrigin, this.referrerPolicy_ = n?.referrerPolicy, this.canvas_ = {}, this.color_ = i, this.imageState_ = r === void 0 ? q.IDLE : r, this.size_ = e && e.width && e.height ? [e.width, e.height] : null, this.src_ = t, this.tainted_, this.ready_ = null;
	}
	initializeImage_() {
		this.image_ = new Image(), this.crossOrigin_ !== null && (this.image_.crossOrigin = this.crossOrigin_), this.referrerPolicy_ !== void 0 && (this.image_.referrerPolicy = this.referrerPolicy_);
	}
	isTainted_() {
		if (this.tainted_ === void 0 && this.imageState_ === q.LOADED) {
			kf ||= Tl(1, 1, void 0, { willReadFrequently: !0 }), kf.drawImage(this.image_, 0, 0);
			try {
				kf.getImageData(0, 0, 1, 1), this.tainted_ = !1;
			} catch {
				kf = null, this.tainted_ = !0;
			}
		}
		return this.tainted_ === !0;
	}
	dispatchChangeEvent_() {
		this.dispatchEvent(L.CHANGE);
	}
	handleImageError_() {
		this.imageState_ = q.ERROR, this.dispatchChangeEvent_();
	}
	handleImageLoad_() {
		this.imageState_ = q.LOADED, this.size_ = [this.image_.width, this.image_.height], this.dispatchChangeEvent_();
	}
	getImage(e) {
		return this.image_ || this.initializeImage_(), this.replaceColor_(e), this.canvas_[e] ? this.canvas_[e] : this.image_;
	}
	setImage(e) {
		this.image_ = e;
	}
	getPixelRatio(e) {
		return this.replaceColor_(e), this.canvas_[e] ? e : 1;
	}
	getImageState() {
		return this.imageState_;
	}
	getHitDetectionImage() {
		if (this.image_ || this.initializeImage_(), !this.hitDetectionImage_) {
			if (this.isTainted_()) {
				let e = this.size_[0], t = this.size_[1], n = Tl(e, t);
				n.fillRect(0, 0, e, t), this.hitDetectionImage_ = n.canvas;
			} else this.hitDetectionImage_ = this.image_;
		}
		return this.hitDetectionImage_;
	}
	getSize() {
		return this.size_;
	}
	getSrc() {
		return this.src_;
	}
	load() {
		if (this.imageState_ === q.IDLE) {
			this.image_ || this.initializeImage_(), this.imageState_ = q.LOADING;
			try {
				this.src_ !== void 0 && (this.image_.src = this.src_);
			} catch {
				this.handleImageError_();
			}
			this.image_ instanceof HTMLImageElement && Tf(this.image_, this.src_).then((e) => {
				this.image_ = e, this.handleImageLoad_();
			}).catch(this.handleImageError_.bind(this));
		}
	}
	replaceColor_(e) {
		if (!this.color_ || this.canvas_[e] || this.imageState_ !== q.LOADED) return;
		let t = this.image_, n = Tl(Math.ceil(t.width * e), Math.ceil(t.height * e)), r = n.canvas;
		n.scale(e, e), n.drawImage(t, 0, 0), n.globalCompositeOperation = "multiply", n.fillStyle = sd(this.color_), n.fillRect(0, 0, r.width / e, r.height / e), n.globalCompositeOperation = "destination-in", n.drawImage(t, 0, 0), this.canvas_[e] = r;
	}
	ready() {
		return this.ready_ ||= new Promise((e) => {
			if (this.imageState_ === q.LOADED || this.imageState_ === q.ERROR) e();
			else {
				let t = () => {
					(this.imageState_ === q.LOADED || this.imageState_ === q.ERROR) && (this.removeEventListener(L.CHANGE, t), e());
				};
				this.addEventListener(L.CHANGE, t);
			}
		}), this.ready_;
	}
};
function jf(e, t, n, r, i, a) {
	let o = t === void 0 ? void 0 : Of.get(t, i);
	return o || (o = new Af(e, e && "src" in e ? e.src || void 0 : t, n, r, i), Of.set(t, i, o, a)), a && o && !Of.getPattern(t, i) && Of.set(t, i, o, a), o;
}
//#endregion
//#region node_modules/ol/colorlike.js
function Mf(e) {
	return e ? Array.isArray(e) ? bd(e) : typeof e == "object" && "src" in e ? Nf(e) : e : null;
}
function Nf(e) {
	if (!e.offset || !e.size) return Of.getPattern(e.src, e.color);
	let t = e.src + ":" + e.offset, n = Of.getPattern(t, e.color);
	if (n) return n;
	let r = Of.get(e.src, null);
	if (r.getImageState() !== q.LOADED) return null;
	let i = Tl(e.size[0], e.size[1]);
	return i.drawImage(r.getImage(1), e.offset[0], e.offset[1], e.size[0], e.size[1], 0, 0, e.size[0], e.size[1]), jf(i.canvas, t, void 0, q.LOADED, e.color, !0), Of.getPattern(t, e.color);
}
//#endregion
//#region node_modules/ol/render/canvas.js
var Pf = "10px sans-serif", Ff = "#000", If = "round", Lf = [], Rf = "round", zf = "#000", Bf = "center", Vf = "middle", Hf = [
	0,
	0,
	0,
	0
], Uf = new mi(), Wf = null, Gf, Kf = {}, qf = /* @__PURE__ */ new Set([
	"serif",
	"sans-serif",
	"monospace",
	"cursive",
	"fantasy",
	"system-ui",
	"ui-serif",
	"ui-sans-serif",
	"ui-monospace",
	"ui-rounded",
	"emoji",
	"math",
	"fangsong"
]);
function Jf(e, t, n) {
	return `${e} ${t} 16px "${n}"`;
}
var Yf = (function() {
	let e, t;
	async function n(e) {
		await t.ready;
		let n = wl(e), r = n.families[0].toLowerCase(), i = n.weight, a = [];
		return t.forEach((e) => {
			let t = e.family.replace(/^['"]|['"]$/g, "").toLowerCase(), o = Cl[e.weight] || e.weight;
			t === r && e.style === n.style && o == i && a.push(e);
		}), a.length !== 0 && (await Promise.all(a.map((e) => e.load().then(() => !0, () => !1)))).some((e) => e);
	}
	async function r() {
		await t.ready;
		let i = !0, a = Uf.getProperties(), o = Object.keys(a).filter((e) => a[e] < 100);
		for (let e = o.length - 1; e >= 0; --e) {
			let t = o[e], r = a[t];
			r < 100 && (await n(t) ? (Wr(Kf), Uf.set(t, 100)) : (r += 10, Uf.set(t, r, !0), r < 100 && (i = !1)));
		}
		e = void 0, i || (e = setTimeout(r, 100));
	}
	return async function(n) {
		t ||= Ti ? self.fonts : document.fonts;
		let i = wl(n);
		if (!i) return;
		let a = i.families, o = !1;
		for (let e of a) {
			if (qf.has(e)) continue;
			let t = Jf(i.style, i.weight, e);
			Uf.get(t) === void 0 && (Uf.set(t, 0, !0), o = !0);
		}
		o && (clearTimeout(e), e = setTimeout(r, 100));
	};
})(), Xf = (function() {
	let e;
	return function(t) {
		let n = Kf[t];
		if (n == null) {
			if (Ti) {
				let e = wl(t), r = Zf(t, "Žg");
				n = (isNaN(Number(e.lineHeight)) ? 1.2 : Number(e.lineHeight)) * (r.actualBoundingBoxAscent + r.actualBoundingBoxDescent);
			} else e || (e = document.createElement("div"), e.innerHTML = "M", e.style.minHeight = "0", e.style.maxHeight = "none", e.style.height = "auto", e.style.padding = "0", e.style.border = "none", e.style.position = "absolute", e.style.display = "block", e.style.left = "-99999px"), e.style.font = t, document.body.appendChild(e), n = e.offsetHeight, document.body.removeChild(e);
			Kf[t] = n;
		}
		return n;
	};
})();
function Zf(e, t) {
	return Wf ||= Tl(1, 1), e != Gf && (Wf.font = e, Gf = Wf.font), Wf.measureText(t);
}
function Qf(e, t) {
	return Zf(e, t).width;
}
function $f(e, t, n) {
	if (t in n) return n[t];
	let r = t.split("\n").reduce((t, n) => Math.max(t, Qf(e, n)), 0);
	return n[t] = r, r;
}
function ep(e, t) {
	let n = [], r = [], i = [], a = 0, o = 0, s = 0, c = 0;
	for (let l = 0, u = t.length; l <= u; l += 2) {
		let d = t[l];
		if (d === "\n" || l === u) {
			a = Math.max(a, o), i.push(o), o = 0, s += c, c = 0;
			continue;
		}
		let f = t[l + 1] || e.font, p = Qf(f, d);
		n.push(p), o += p;
		let m = Xf(f);
		r.push(m), c = Math.max(c, m);
	}
	return {
		width: a,
		height: s,
		widths: n,
		heights: r,
		lineWidths: i
	};
}
function tp(e, t, n, r, i, a, o, s, c, l, u) {
	e.save(), n !== 1 && (e.globalAlpha === void 0 ? e.globalAlpha = (e) => e.globalAlpha *= n : e.globalAlpha *= n), t && e.transform.apply(e, t), r.contextInstructions ? (e.translate(c, l), e.scale(u[0], u[1]), np(r, e)) : u[0] < 0 || u[1] < 0 ? (e.translate(c, l), e.scale(u[0], u[1]), e.drawImage(r, i, a, o, s, 0, 0, o, s)) : e.drawImage(r, i, a, o, s, c, l, o * u[0], s * u[1]), e.restore();
}
function np(e, t) {
	let n = e.contextInstructions;
	for (let e = 0, r = n.length; e < r; e += 2) Array.isArray(n[e + 1]) ? t[n[e]].apply(t, n[e + 1]) : t[n[e]] = n[e + 1];
}
//#endregion
//#region node_modules/ol/style/Image.js
var rp = class e {
	constructor(e) {
		this.opacity_ = e.opacity, this.rotateWithView_ = e.rotateWithView, this.rotation_ = e.rotation, this.scale_ = e.scale, this.scaleArray_ = Cd(e.scale), this.displacement_ = e.displacement, this.declutterMode_ = e.declutterMode;
	}
	clone() {
		let t = this.getScale();
		return new e({
			opacity: this.getOpacity(),
			scale: Array.isArray(t) ? t.slice() : t,
			rotation: this.getRotation(),
			rotateWithView: this.getRotateWithView(),
			displacement: this.getDisplacement().slice(),
			declutterMode: this.getDeclutterMode()
		});
	}
	getOpacity() {
		return this.opacity_;
	}
	getRotateWithView() {
		return this.rotateWithView_;
	}
	getRotation() {
		return this.rotation_;
	}
	getScale() {
		return this.scale_;
	}
	getScaleArray() {
		return this.scaleArray_;
	}
	getDisplacement() {
		return this.displacement_;
	}
	getDeclutterMode() {
		return this.declutterMode_;
	}
	getAnchor() {
		return R();
	}
	getImage(e) {
		return R();
	}
	getHitDetectionImage() {
		return R();
	}
	getPixelRatio(e) {
		return 1;
	}
	getImageState() {
		return R();
	}
	getImageSize() {
		return R();
	}
	getOrigin() {
		return R();
	}
	getSize() {
		return R();
	}
	setDisplacement(e) {
		this.displacement_ = e;
	}
	setOpacity(e) {
		this.opacity_ = e;
	}
	setRotateWithView(e) {
		this.rotateWithView_ = e;
	}
	setRotation(e) {
		this.rotation_ = e;
	}
	setScale(e) {
		this.scale_ = e, this.scaleArray_ = Cd(e);
	}
	listenImageChange(e) {
		R();
	}
	load() {
		R();
	}
	unlistenImageChange(e) {
		R();
	}
	ready() {
		return Promise.resolve();
	}
}, ip = class e extends rp {
	constructor(e) {
		super({
			opacity: 1,
			rotateWithView: e.rotateWithView !== void 0 && e.rotateWithView,
			rotation: e.rotation === void 0 ? 0 : e.rotation,
			scale: e.scale === void 0 ? 1 : e.scale,
			displacement: e.displacement === void 0 ? [0, 0] : e.displacement,
			declutterMode: e.declutterMode
		}), this.hitDetectionCanvas_ = null, this.fill_ = e.fill === void 0 ? null : e.fill, this.origin_ = [0, 0], this.points_ = e.points, this.radius = e.radius, this.radius2_ = e.radius2, this.angle_ = e.angle === void 0 ? 0 : e.angle, this.stroke_ = e.stroke === void 0 ? null : e.stroke, this.size_, this.renderOptions_, this.imageState_ = this.fill_ && this.fill_.loading() ? q.LOADING : q.LOADED, this.imageState_ === q.LOADING && this.ready().then(() => this.imageState_ = q.LOADED), this.render();
	}
	clone() {
		let t = this.getScale(), n = new e({
			fill: this.getFill() ? this.getFill().clone() : void 0,
			points: this.getPoints(),
			radius: this.getRadius(),
			radius2: this.getRadius2(),
			angle: this.getAngle(),
			stroke: this.getStroke() ? this.getStroke().clone() : void 0,
			rotation: this.getRotation(),
			rotateWithView: this.getRotateWithView(),
			scale: Array.isArray(t) ? t.slice() : t,
			displacement: this.getDisplacement().slice(),
			declutterMode: this.getDeclutterMode()
		});
		return n.setOpacity(this.getOpacity()), n;
	}
	getAnchor() {
		let e = this.size_, t = this.getDisplacement(), n = this.getScaleArray();
		return [e[0] / 2 - t[0] / n[0], e[1] / 2 + t[1] / n[1]];
	}
	getAngle() {
		return this.angle_;
	}
	getFill() {
		return this.fill_;
	}
	setFill(e) {
		this.fill_ = e, this.render();
	}
	getHitDetectionImage() {
		return this.hitDetectionCanvas_ ||= this.createHitDetectionCanvas_(this.renderOptions_), this.hitDetectionCanvas_;
	}
	getImage(e) {
		let t = this.fill_?.getKey(), n = `${e},${this.angle_},${this.radius},${this.radius2_},${this.points_},${t}` + Object.values(this.renderOptions_).join(","), r = Of.get(n, null)?.getImage(1);
		if (!r) {
			let t = this.renderOptions_, i = Math.ceil(t.size * e), a = Tl(i, i);
			this.draw_(t, a, e), r = a.canvas;
			let o = new Af(r, void 0, null, q.LOADED, null);
			Of.set(n, null, o), createImageBitmap(r).then((e) => {
				o.setImage(e);
			});
		}
		return r;
	}
	getPixelRatio(e) {
		return e;
	}
	getImageSize() {
		return this.size_;
	}
	getImageState() {
		return this.imageState_;
	}
	getOrigin() {
		return this.origin_;
	}
	getPoints() {
		return this.points_;
	}
	getRadius() {
		return this.radius;
	}
	setRadius(e) {
		this.radius !== e && (this.radius = e, this.render());
	}
	getRadius2() {
		return this.radius2_;
	}
	setRadius2(e) {
		this.radius2_ !== e && (this.radius2_ = e, this.render());
	}
	getSize() {
		return this.size_;
	}
	getStroke() {
		return this.stroke_;
	}
	setStroke(e) {
		this.stroke_ = e, this.render();
	}
	listenImageChange(e) {}
	load() {}
	unlistenImageChange(e) {}
	calculateLineJoinSize_(e, t, n) {
		if (t === 0 || this.points_ === Infinity || e !== "bevel" && e !== "miter") return t;
		let r = this.radius, i = this.radius2_ === void 0 ? r : this.radius2_;
		if (r < i) {
			let e = r;
			r = i, i = e;
		}
		let a = this.radius2_ === void 0 ? this.points_ : this.points_ * 2, o = 2 * Math.PI / a, s = i * Math.sin(o), c = Math.sqrt(i * i - s * s), l = r - c, u = Math.sqrt(s * s + l * l), d = u / s;
		if (e === "miter" && d <= n) return d * t;
		let f = t / 2 / d, p = t / 2 * (l / u), m = Math.sqrt((r + f) * (r + f) + p * p) - r;
		if (this.radius2_ === void 0 || e === "bevel") return m * 2;
		let h = r * Math.sin(o), g = Math.sqrt(r * r - h * h), _ = i - g, v = Math.sqrt(h * h + _ * _) / h;
		if (v <= n) {
			let e = v * t / 2 - i - r;
			return 2 * Math.max(m, e);
		}
		return m * 2;
	}
	createRenderOptions() {
		let e = If, t = Rf, n = 0, r = null, i = 0, a, o = 0;
		this.stroke_ && (a = Mf(this.stroke_.getColor() ?? "#000"), o = this.stroke_.getWidth() ?? 1, r = this.stroke_.getLineDash(), i = this.stroke_.getLineDashOffset() ?? 0, t = this.stroke_.getLineJoin() ?? "round", e = this.stroke_.getLineCap() ?? "round", n = this.stroke_.getMiterLimit() ?? 10);
		let s = this.calculateLineJoinSize_(t, o, n), c = Math.max(this.radius, this.radius2_ || 0), l = Math.ceil(2 * c + s);
		return {
			strokeStyle: a,
			strokeWidth: o,
			size: l,
			lineCap: e,
			lineDash: r,
			lineDashOffset: i,
			lineJoin: t,
			miterLimit: n
		};
	}
	render() {
		this.renderOptions_ = this.createRenderOptions();
		let e = this.renderOptions_.size;
		this.hitDetectionCanvas_ = null, this.size_ = [e, e];
	}
	draw_(e, t, n) {
		if (t.scale(n, n), t.translate(e.size / 2, e.size / 2), this.createPath_(t), this.fill_) {
			let e = this.fill_.getColor();
			e === null && (e = Ff), t.fillStyle = Mf(e), t.fill();
		}
		e.strokeStyle && (t.strokeStyle = e.strokeStyle, t.lineWidth = e.strokeWidth, e.lineDash && (t.setLineDash(e.lineDash), t.lineDashOffset = e.lineDashOffset), t.lineCap = e.lineCap, t.lineJoin = e.lineJoin, t.miterLimit = e.miterLimit, t.stroke());
	}
	createHitDetectionCanvas_(e) {
		let t;
		if (this.fill_) {
			let n = this.fill_.getColor(), r = 0;
			typeof n == "string" && (n = yd(n)), n === null ? r = 1 : Array.isArray(n) && (r = n.length === 4 ? n[3] : 1), r === 0 && (t = Tl(e.size, e.size), this.drawHitDetectionCanvas_(e, t));
		}
		return t ? t.canvas : this.getImage(1);
	}
	createPath_(e) {
		let t = this.points_, n = this.radius;
		if (t === Infinity) e.arc(0, 0, n, 0, 2 * Math.PI);
		else {
			let r = this.radius2_ === void 0 ? n : this.radius2_;
			this.radius2_ !== void 0 && (t *= 2);
			let i = this.angle_ - Math.PI / 2, a = 2 * Math.PI / t;
			for (let o = 0; o < t; o++) {
				let t = i + o * a, s = o % 2 == 0 ? n : r;
				e.lineTo(s * Math.cos(t), s * Math.sin(t));
			}
			e.closePath();
		}
	}
	drawHitDetectionCanvas_(e, t) {
		t.translate(e.size / 2, e.size / 2), this.createPath_(t), t.fillStyle = Ff, t.fill(), e.strokeStyle && (t.strokeStyle = e.strokeStyle, t.lineWidth = e.strokeWidth, e.lineDash && (t.setLineDash(e.lineDash), t.lineDashOffset = e.lineDashOffset), t.lineJoin = e.lineJoin, t.miterLimit = e.miterLimit, t.stroke());
	}
	ready() {
		return this.fill_ ? this.fill_.ready() : Promise.resolve();
	}
}, ap = class e extends ip {
	constructor(e) {
		e ||= { radius: 5 }, super({
			points: Infinity,
			fill: e.fill,
			radius: e.radius,
			stroke: e.stroke,
			scale: e.scale === void 0 ? 1 : e.scale,
			rotation: e.rotation === void 0 ? 0 : e.rotation,
			rotateWithView: e.rotateWithView !== void 0 && e.rotateWithView,
			displacement: e.displacement === void 0 ? [0, 0] : e.displacement,
			declutterMode: e.declutterMode
		});
	}
	clone() {
		let t = this.getScale(), n = new e({
			fill: this.getFill() ? this.getFill().clone() : void 0,
			stroke: this.getStroke() ? this.getStroke().clone() : void 0,
			radius: this.getRadius(),
			scale: Array.isArray(t) ? t.slice() : t,
			rotation: this.getRotation(),
			rotateWithView: this.getRotateWithView(),
			displacement: this.getDisplacement().slice(),
			declutterMode: this.getDeclutterMode()
		});
		return n.setOpacity(this.getOpacity()), n;
	}
}, op = class e {
	constructor(e) {
		e ||= {}, this.patternImage_ = null, this.color_ = null, e.color !== void 0 && this.setColor(e.color);
	}
	clone() {
		let t = this.getColor();
		return new e({ color: Array.isArray(t) ? t.slice() : t || void 0 });
	}
	getColor() {
		return this.color_;
	}
	setColor(e) {
		if (typeof e == "object" && e && "src" in e) {
			let t = jf(null, e.src, { crossOrigin: "anonymous" }, void 0, e.offset ? null : e.color ? e.color : null, !(e.offset && e.size));
			t.ready().then(() => {
				this.patternImage_ = null;
			}), t.getImageState() === q.IDLE && t.load(), t.getImageState() === q.LOADING && (this.patternImage_ = t);
		}
		this.color_ = e;
	}
	getKey() {
		let e = this.getColor();
		return e ? e instanceof CanvasPattern || e instanceof CanvasGradient ? z(e) : typeof e == "object" && "src" in e ? e.src + ":" + e.offset : yd(e).toString() : "";
	}
	loading() {
		return !!this.patternImage_;
	}
	ready() {
		return this.patternImage_ ? this.patternImage_.ready() : Promise.resolve();
	}
};
//#endregion
//#region node_modules/ol/style/Icon.js
function sp(e, t, n, r) {
	return n !== void 0 && r !== void 0 ? [n / e, r / t] : n === void 0 ? r === void 0 ? 1 : r / t : n / e;
}
var cp = class e extends rp {
	constructor(e) {
		e ||= {};
		let t = e.opacity === void 0 ? 1 : e.opacity, n = e.rotation === void 0 ? 0 : e.rotation, r = e.scale === void 0 ? 1 : e.scale, i = e.rotateWithView !== void 0 && e.rotateWithView;
		super({
			opacity: t,
			rotation: n,
			scale: r,
			displacement: e.displacement === void 0 ? [0, 0] : e.displacement,
			rotateWithView: i,
			declutterMode: e.declutterMode
		}), this.anchor_ = e.anchor === void 0 ? [.5, .5] : e.anchor, this.normalizedAnchor_ = null, this.anchorOrigin_ = e.anchorOrigin === void 0 ? "top-left" : e.anchorOrigin, this.anchorXUnits_ = e.anchorXUnits === void 0 ? "fraction" : e.anchorXUnits, this.anchorYUnits_ = e.anchorYUnits === void 0 ? "fraction" : e.anchorYUnits, this.crossOrigin_ = e.crossOrigin === void 0 ? null : e.crossOrigin, this.referrerPolicy_ = e.referrerPolicy;
		let a = e.img === void 0 ? null : e.img, o = e.src;
		V(!(o !== void 0 && a), "`image` and `src` cannot be provided at the same time"), (o === void 0 || o.length === 0) && a && (o = a.src || z(a)), V(o !== void 0 && o.length > 0, "A defined and non-empty `src` or `image` must be provided"), V(e.width === void 0 && e.height === void 0 || e.scale === void 0, "`width` or `height` cannot be provided together with `scale`");
		let s;
		if (e.src === void 0 ? a !== void 0 && (s = "complete" in a ? a.complete ? a.src ? q.LOADED : q.IDLE : q.LOADING : q.LOADED) : s = q.IDLE, this.color_ = e.color === void 0 ? null : yd(e.color), this.iconImage_ = jf(a, o, {
			crossOrigin: this.crossOrigin_,
			referrerPolicy: this.referrerPolicy_
		}, s, this.color_), this.offset_ = e.offset === void 0 ? [0, 0] : e.offset, this.offsetOrigin_ = e.offsetOrigin === void 0 ? "top-left" : e.offsetOrigin, this.origin_ = null, this.size_ = e.size === void 0 ? null : e.size, this.initialOptions_, e.width !== void 0 || e.height !== void 0) {
			let t, n;
			if (e.size) [t, n] = e.size;
			else {
				let r = this.getImage(1);
				if (r.width && r.height) t = r.width, n = r.height;
				else if (r instanceof HTMLImageElement) {
					this.initialOptions_ = e;
					let t = () => {
						if (this.unlistenImageChange(t), !this.initialOptions_) return;
						let n = this.iconImage_.getSize();
						this.setScale(sp(n[0], n[1], e.width, e.height));
					};
					this.listenImageChange(t);
					return;
				}
			}
			t !== void 0 && this.setScale(sp(t, n, e.width, e.height));
		}
	}
	clone() {
		let t, n, r;
		return this.initialOptions_ ? (n = this.initialOptions_.width, r = this.initialOptions_.height) : (t = this.getScale(), t = Array.isArray(t) ? t.slice() : t), new e({
			anchor: this.anchor_.slice(),
			anchorOrigin: this.anchorOrigin_,
			anchorXUnits: this.anchorXUnits_,
			anchorYUnits: this.anchorYUnits_,
			color: this.color_ && this.color_.slice ? this.color_.slice() : this.color_ || void 0,
			crossOrigin: this.crossOrigin_,
			referrerPolicy: this.referrerPolicy_,
			offset: this.offset_.slice(),
			offsetOrigin: this.offsetOrigin_,
			opacity: this.getOpacity(),
			rotateWithView: this.getRotateWithView(),
			rotation: this.getRotation(),
			scale: t,
			width: n,
			height: r,
			size: this.size_ === null ? void 0 : this.size_.slice(),
			src: this.getSrc(),
			displacement: this.getDisplacement().slice(),
			declutterMode: this.getDeclutterMode()
		});
	}
	getAnchor() {
		let e = this.normalizedAnchor_;
		if (!e) {
			e = this.anchor_;
			let t = this.getSize();
			if (this.anchorXUnits_ == "fraction" || this.anchorYUnits_ == "fraction") {
				if (!t) return null;
				e = this.anchor_.slice(), this.anchorXUnits_ == "fraction" && (e[0] *= t[0]), this.anchorYUnits_ == "fraction" && (e[1] *= t[1]);
			}
			if (this.anchorOrigin_ != "top-left") {
				if (!t) return null;
				e === this.anchor_ && (e = this.anchor_.slice()), (this.anchorOrigin_ == "top-right" || this.anchorOrigin_ == "bottom-right") && (e[0] = -e[0] + t[0]), (this.anchorOrigin_ == "bottom-left" || this.anchorOrigin_ == "bottom-right") && (e[1] = -e[1] + t[1]);
			}
			this.normalizedAnchor_ = e;
		}
		let t = this.getDisplacement(), n = this.getScaleArray();
		return [e[0] - t[0] / n[0], e[1] + t[1] / n[1]];
	}
	setAnchor(e) {
		this.anchor_ = e, this.normalizedAnchor_ = null;
	}
	getColor() {
		return this.color_;
	}
	setColor(e) {
		let t = e ? yd(e) : null;
		if (this.color_ === t || this.color_ && t && this.color_.length === t.length && this.color_.every((e, n) => e === t[n])) return;
		this.color_ = t;
		let n = this.getSrc(), r = n === void 0 ? this.getHitDetectionImage() : null, i = n === void 0 ? this.iconImage_.getImageState() : q.IDLE;
		this.iconImage_ = jf(r, n, {
			crossOrigin: this.crossOrigin_,
			referrerPolicy: this.referrerPolicy_
		}, i, this.color_);
	}
	getImage(e) {
		return this.iconImage_.getImage(e);
	}
	getPixelRatio(e) {
		return this.iconImage_.getPixelRatio(e);
	}
	getImageSize() {
		return this.iconImage_.getSize();
	}
	getImageState() {
		return this.iconImage_.getImageState();
	}
	getHitDetectionImage() {
		return this.iconImage_.getHitDetectionImage();
	}
	getOrigin() {
		if (this.origin_) return this.origin_;
		let e = this.offset_;
		if (this.offsetOrigin_ != "top-left") {
			let t = this.getSize(), n = this.iconImage_.getSize();
			if (!t || !n) return null;
			e = e.slice(), (this.offsetOrigin_ == "top-right" || this.offsetOrigin_ == "bottom-right") && (e[0] = n[0] - t[0] - e[0]), (this.offsetOrigin_ == "bottom-left" || this.offsetOrigin_ == "bottom-right") && (e[1] = n[1] - t[1] - e[1]);
		}
		return this.origin_ = e, this.origin_;
	}
	getSrc() {
		return this.iconImage_.getSrc();
	}
	setSrc(e) {
		this.iconImage_ = jf(null, e, {
			crossOrigin: this.crossOrigin_,
			referrerPolicy: this.referrerPolicy_
		}, q.IDLE, this.color_);
	}
	getSize() {
		return this.size_ ? this.size_ : this.iconImage_.getSize();
	}
	getWidth() {
		let e = this.getScaleArray();
		if (this.size_) return this.size_[0] * e[0];
		if (this.iconImage_.getImageState() == q.LOADED) return this.iconImage_.getSize()[0] * e[0];
	}
	getHeight() {
		let e = this.getScaleArray();
		if (this.size_) return this.size_[1] * e[1];
		if (this.iconImage_.getImageState() == q.LOADED) return this.iconImage_.getSize()[1] * e[1];
	}
	setScale(e) {
		delete this.initialOptions_, super.setScale(e);
	}
	listenImageChange(e) {
		this.iconImage_.addEventListener(L.CHANGE, e);
	}
	load() {
		this.iconImage_.load();
	}
	unlistenImageChange(e) {
		this.iconImage_.removeEventListener(L.CHANGE, e);
	}
	ready() {
		return this.iconImage_.ready();
	}
}, lp = class e {
	constructor(e) {
		e ||= {}, this.color_ = e.color === void 0 ? null : e.color, this.lineCap_ = e.lineCap, this.lineDash_ = e.lineDash === void 0 ? null : e.lineDash, this.lineDashOffset_ = e.lineDashOffset, this.lineJoin_ = e.lineJoin, this.miterLimit_ = e.miterLimit, this.offset_ = e.offset, this.width_ = e.width;
	}
	clone() {
		let t = this.getColor();
		return new e({
			color: Array.isArray(t) ? t.slice() : t || void 0,
			lineCap: this.getLineCap(),
			lineDash: this.getLineDash() ? this.getLineDash().slice() : void 0,
			lineDashOffset: this.getLineDashOffset(),
			lineJoin: this.getLineJoin(),
			miterLimit: this.getMiterLimit(),
			offset: this.getOffset(),
			width: this.getWidth()
		});
	}
	getColor() {
		return this.color_;
	}
	getLineCap() {
		return this.lineCap_;
	}
	getLineDash() {
		return this.lineDash_;
	}
	getLineDashOffset() {
		return this.lineDashOffset_;
	}
	getLineJoin() {
		return this.lineJoin_;
	}
	getMiterLimit() {
		return this.miterLimit_;
	}
	getOffset() {
		return this.offset_;
	}
	getWidth() {
		return this.width_;
	}
	setColor(e) {
		this.color_ = e;
	}
	setLineCap(e) {
		this.lineCap_ = e;
	}
	setLineDash(e) {
		this.lineDash_ = e;
	}
	setLineDashOffset(e) {
		this.lineDashOffset_ = e;
	}
	setLineJoin(e) {
		this.lineJoin_ = e;
	}
	setMiterLimit(e) {
		this.miterLimit_ = e;
	}
	setOffset(e) {
		this.offset_ = e;
	}
	setWidth(e) {
		this.width_ = e;
	}
}, up = class e {
	constructor(e) {
		e ||= {}, this.geometry_ = null, this.geometryFunction_ = mp, e.geometry !== void 0 && this.setGeometry(e.geometry), this.fill_ = e.fill === void 0 ? null : e.fill, this.image_ = e.image === void 0 ? null : e.image, this.renderer_ = e.renderer === void 0 ? null : e.renderer, this.hitDetectionRenderer_ = e.hitDetectionRenderer === void 0 ? null : e.hitDetectionRenderer, this.stroke_ = e.stroke === void 0 ? null : e.stroke, this.text_ = e.text === void 0 ? null : e.text, this.zIndex_ = e.zIndex;
	}
	clone() {
		let t = this.getGeometry();
		return t && typeof t == "object" && (t = t.clone()), new e({
			geometry: t ?? void 0,
			fill: this.getFill() ? this.getFill().clone() : void 0,
			image: this.getImage() ? this.getImage().clone() : void 0,
			renderer: this.getRenderer() ?? void 0,
			stroke: this.getStroke() ? this.getStroke().clone() : void 0,
			text: this.getText() ? this.getText().clone() : void 0,
			zIndex: this.getZIndex()
		});
	}
	getRenderer() {
		return this.renderer_;
	}
	setRenderer(e) {
		this.renderer_ = e;
	}
	setHitDetectionRenderer(e) {
		this.hitDetectionRenderer_ = e;
	}
	getHitDetectionRenderer() {
		return this.hitDetectionRenderer_;
	}
	getGeometry() {
		return this.geometry_;
	}
	getGeometryFunction() {
		return this.geometryFunction_;
	}
	getFill() {
		return this.fill_;
	}
	setFill(e) {
		this.fill_ = e;
	}
	getImage() {
		return this.image_;
	}
	setImage(e) {
		this.image_ = e;
	}
	getStroke() {
		return this.stroke_;
	}
	setStroke(e) {
		this.stroke_ = e;
	}
	getText() {
		return this.text_;
	}
	setText(e) {
		this.text_ = e;
	}
	getZIndex() {
		return this.zIndex_;
	}
	setGeometry(e) {
		typeof e == "function" ? this.geometryFunction_ = e : typeof e == "string" ? this.geometryFunction_ = function(t) {
			return t.get(e);
		} : e ? e !== void 0 && (this.geometryFunction_ = function() {
			return e;
		}) : this.geometryFunction_ = mp, this.geometry_ = e;
	}
	setZIndex(e) {
		this.zIndex_ = e;
	}
};
function dp(e) {
	let t;
	if (typeof e == "function") t = e;
	else {
		let n;
		Array.isArray(e) ? n = e : (V(typeof e.getZIndex == "function", "Expected an `Style` or an array of `Style`"), n = [e]), t = function() {
			return n;
		};
	}
	return t;
}
var fp = null;
function pp(e, t) {
	if (!fp) {
		let e = new op({ color: "rgba(255,255,255,0.4)" }), t = new lp({
			color: "#3399CC",
			width: 1.25
		});
		fp = [new up({
			image: new ap({
				fill: e,
				stroke: t,
				radius: 5
			}),
			fill: e,
			stroke: t
		})];
	}
	return fp;
}
function mp(e) {
	return e.getGeometry();
}
//#endregion
//#region node_modules/ol/style/Text.js
var hp = "#333", gp = class e {
	constructor(e) {
		e ||= {}, this.font_ = e.font, this.rotation_ = e.rotation, this.rotateWithView_ = e.rotateWithView, this.keepUpright_ = e.keepUpright, this.scale_ = e.scale, this.scaleArray_ = Cd(e.scale === void 0 ? 1 : e.scale), this.text_ = e.text, this.textAlign_ = e.textAlign, this.justify_ = e.justify, this.repeat_ = e.repeat, this.textBaseline_ = e.textBaseline, this.fill_ = e.fill === void 0 ? new op({ color: hp }) : e.fill, this.maxAngle_ = e.maxAngle === void 0 ? Math.PI / 4 : e.maxAngle, this.placement_ = e.placement === void 0 ? "point" : e.placement, this.overflow_ = !!e.overflow, this.stroke_ = e.stroke === void 0 ? null : e.stroke, this.offsetX_ = e.offsetX === void 0 ? 0 : e.offsetX, this.offsetY_ = e.offsetY === void 0 ? 0 : e.offsetY, this.backgroundFill_ = e.backgroundFill ? e.backgroundFill : null, this.backgroundStroke_ = e.backgroundStroke ? e.backgroundStroke : null, this.padding_ = e.padding === void 0 ? null : e.padding, this.declutterMode_ = e.declutterMode;
	}
	clone() {
		let t = this.getScale();
		return new e({
			font: this.getFont(),
			placement: this.getPlacement(),
			repeat: this.getRepeat(),
			maxAngle: this.getMaxAngle(),
			overflow: this.getOverflow(),
			rotation: this.getRotation(),
			rotateWithView: this.getRotateWithView(),
			keepUpright: this.getKeepUpright(),
			scale: Array.isArray(t) ? t.slice() : t,
			text: this.getText(),
			textAlign: this.getTextAlign(),
			justify: this.getJustify(),
			textBaseline: this.getTextBaseline(),
			fill: this.getFill() instanceof op ? this.getFill().clone() : this.getFill(),
			stroke: this.getStroke() ? this.getStroke().clone() : void 0,
			offsetX: this.getOffsetX(),
			offsetY: this.getOffsetY(),
			backgroundFill: this.getBackgroundFill() ? this.getBackgroundFill().clone() : void 0,
			backgroundStroke: this.getBackgroundStroke() ? this.getBackgroundStroke().clone() : void 0,
			padding: this.getPadding() || void 0,
			declutterMode: this.getDeclutterMode()
		});
	}
	getOverflow() {
		return this.overflow_;
	}
	getFont() {
		return this.font_;
	}
	getMaxAngle() {
		return this.maxAngle_;
	}
	getPlacement() {
		return this.placement_;
	}
	getRepeat() {
		return this.repeat_;
	}
	getOffsetX() {
		return this.offsetX_;
	}
	getOffsetY() {
		return this.offsetY_;
	}
	getFill() {
		return this.fill_;
	}
	getRotateWithView() {
		return this.rotateWithView_;
	}
	getKeepUpright() {
		return this.keepUpright_;
	}
	getRotation() {
		return this.rotation_;
	}
	getScale() {
		return this.scale_;
	}
	getScaleArray() {
		return this.scaleArray_;
	}
	getStroke() {
		return this.stroke_;
	}
	getText() {
		return this.text_;
	}
	getTextAlign() {
		return this.textAlign_;
	}
	getJustify() {
		return this.justify_;
	}
	getTextBaseline() {
		return this.textBaseline_;
	}
	getBackgroundFill() {
		return this.backgroundFill_;
	}
	getBackgroundStroke() {
		return this.backgroundStroke_;
	}
	getPadding() {
		return this.padding_;
	}
	getDeclutterMode() {
		return this.declutterMode_;
	}
	setOverflow(e) {
		this.overflow_ = e;
	}
	setFont(e) {
		this.font_ = e;
	}
	setMaxAngle(e) {
		this.maxAngle_ = e;
	}
	setOffsetX(e) {
		this.offsetX_ = e;
	}
	setOffsetY(e) {
		this.offsetY_ = e;
	}
	setPlacement(e) {
		this.placement_ = e;
	}
	setRepeat(e) {
		this.repeat_ = e;
	}
	setRotateWithView(e) {
		this.rotateWithView_ = e;
	}
	setKeepUpright(e) {
		this.keepUpright_ = e;
	}
	setFill(e) {
		this.fill_ = e;
	}
	setRotation(e) {
		this.rotation_ = e;
	}
	setScale(e) {
		this.scale_ = e, this.scaleArray_ = Cd(e === void 0 ? 1 : e);
	}
	setStroke(e) {
		this.stroke_ = e;
	}
	setText(e) {
		this.text_ = e;
	}
	setTextAlign(e) {
		this.textAlign_ = e;
	}
	setJustify(e) {
		this.justify_ = e;
	}
	setTextBaseline(e) {
		this.textBaseline_ = e;
	}
	setBackgroundFill(e) {
		this.backgroundFill_ = e;
	}
	setBackgroundStroke(e) {
		this.backgroundStroke_ = e;
	}
	setPadding(e) {
		this.padding_ = e;
	}
};
//#endregion
//#region node_modules/ol/render/canvas/style.js
function _p(e) {
	return !0;
}
function vp(e, t) {
	t ??= Bd();
	let n = xp(e, t), r = lf();
	return function(e, i) {
		if (r.properties = e.getPropertiesInternal(), r.resolution = i, t.featureId) {
			let t = e.getId();
			t === void 0 ? r.featureId = null : r.featureId = t;
		}
		return t.geometryType && (r.geometryType = cf(e.getGeometry())), n(r);
	};
}
function yp(e, t) {
	t ??= Bd();
	let n = e.length, r = Array(n);
	for (let i = 0; i < n; ++i) r[i] = Sp(e[i], t);
	let i = lf(), a = Array(n);
	return function(e, o) {
		if (i.properties = e.getPropertiesInternal(), i.resolution = o, t.featureId) {
			let t = e.getId();
			t === void 0 ? i.featureId = null : i.featureId = t;
		}
		t.geometryType && (i.geometryType = cf(e.getGeometry()));
		let s = 0;
		for (let e = 0; e < n; ++e) {
			let t = r[e](i);
			t && (a[s] = t, s += 1);
		}
		return a.length = s, a;
	};
}
function bp(e, t) {
	if (t ??= Bd(), !Array.isArray(e)) return yp([e], t);
	let n = e.length;
	if ("style" in e[0]) {
		let r = Array(n);
		for (let t = 0; t < n; ++t) {
			let n = e[t];
			if (!("style" in n)) throw Error("Expected a list of rules with a style property");
			r[t] = n;
		}
		return vp(r, t);
	}
	return yp(e, t);
}
function xp(e, t) {
	let n = e.length, r = Array(n);
	for (let i = 0; i < n; ++i) {
		let n = e[i], a = "filter" in n ? uf(n.filter, Td, t) : _p, o;
		if (Array.isArray(n.style)) {
			let e = n.style.length;
			o = Array(e);
			for (let r = 0; r < e; ++r) o[r] = Sp(n.style[r], t);
		} else o = [Sp(n.style, t)];
		r[i] = {
			filter: a,
			styles: o
		};
	}
	return function(t) {
		let i = [], a = !1;
		for (let o = 0; o < n; ++o) {
			let n = r[o].filter;
			if (n(t) && !(e[o].else && a)) {
				a = !0;
				for (let e of r[o].styles) {
					let n = e(t);
					n && i.push(n);
				}
			}
		}
		return i;
	};
}
function Sp(e, t) {
	let n = Cp(e, "", t), r = wp(e, "", t), i = Tp(e, t), a = Ep(e, t), o = jp(e, "z-index", t);
	if (!n && !r && !i && !a && !Gr(e)) throw Error("No fill, stroke, point, or text symbolizer properties in style: " + JSON.stringify(e));
	let s = new up();
	return function(e) {
		let t = !0;
		if (n) {
			let r = n(e);
			r && (t = !1), s.setFill(r);
		}
		if (r) {
			let n = r(e);
			n && (t = !1), s.setStroke(n);
		}
		if (i) {
			let n = i(e);
			n && (t = !1), s.setText(n);
		}
		if (a) {
			let n = a(e);
			n && (t = !1), s.setImage(n);
		}
		return o && s.setZIndex(o(e)), t ? null : s;
	};
}
function Cp(e, t, n) {
	let r;
	if (t + "fill-pattern-src" in e) r = Np(e, t + "fill-", n);
	else {
		if (e[t + "fill-color"] === "none") return (e) => null;
		r = Fp(e, t + "fill-color", n);
	}
	if (!r) return null;
	let i = new op();
	return function(e) {
		let t = r(e);
		return t === Zu ? null : (i.setColor(t), i);
	};
}
function wp(e, t, n) {
	let r = jp(e, t + "stroke-width", n), i = Fp(e, t + "stroke-color", n);
	if (!r && !i) return null;
	let a = Mp(e, t + "stroke-line-cap", n), o = Mp(e, t + "stroke-line-join", n), s = Ip(e, t + "stroke-line-dash", n), c = jp(e, t + "stroke-line-dash-offset", n), l = jp(e, t + "stroke-miter-limit", n), u = jp(e, t + "stroke-offset", n), d = new lp();
	return function(e) {
		if (i) {
			let t = i(e);
			if (t === Zu) return null;
			d.setColor(t);
		}
		if (r && d.setWidth(r(e)), a) {
			let t = a(e);
			if (t !== "butt" && t !== "round" && t !== "square") throw Error("Expected butt, round, or square line cap");
			d.setLineCap(t);
		}
		if (o) {
			let t = o(e);
			if (t !== "bevel" && t !== "round" && t !== "miter") throw Error("Expected bevel, round, or miter line join");
			d.setLineJoin(t);
		}
		return s && d.setLineDash(s(e)), c && d.setLineDashOffset(c(e)), l && d.setMiterLimit(l(e)), u && d.setOffset(u(e)), d;
	};
}
function Tp(e, t) {
	let n = "text-", r = Mp(e, "text-value", t);
	if (!r) return null;
	let i = Cp(e, n, t), a = Cp(e, "text-background-", t), o = wp(e, n, t), s = wp(e, "text-background-", t), c = Mp(e, "text-font", t), l = jp(e, "text-max-angle", t), u = jp(e, "text-offset-x", t), d = jp(e, "text-offset-y", t), f = Pp(e, "text-overflow", t), p = Mp(e, "text-placement", t), m = jp(e, "text-repeat", t), h = zp(e, "text-scale", t), g = Pp(e, "text-rotate-with-view", t), _ = jp(e, "text-rotation", t), v = Mp(e, "text-align", t), y = Mp(e, "text-justify", t), b = Mp(e, "text-baseline", t), x = Pp(e, "text-keep-upright", t), S = Ip(e, "text-padding", t), C = new gp({ declutterMode: Kp(e, "text-declutter-mode") });
	return function(e) {
		if (C.setText(r(e)), i && C.setFill(i(e)), a && C.setBackgroundFill(a(e)), o && C.setStroke(o(e)), s && C.setBackgroundStroke(s(e)), c && C.setFont(c(e)), l && C.setMaxAngle(l(e)), u && C.setOffsetX(u(e)), d && C.setOffsetY(d(e)), f && C.setOverflow(f(e)), p) {
			let t = p(e);
			if (t !== "point" && t !== "line") throw Error("Expected point or line for text-placement");
			C.setPlacement(t);
		}
		if (m && C.setRepeat(m(e)), h && C.setScale(h(e)), g && C.setRotateWithView(g(e)), _ && C.setRotation(_(e)), v) {
			let t = v(e);
			if (t !== "left" && t !== "center" && t !== "right" && t !== "end" && t !== "start") throw Error("Expected left, right, center, start, or end for text-align");
			C.setTextAlign(t);
		}
		if (y) {
			let t = y(e);
			if (t !== "left" && t !== "right" && t !== "center") throw Error("Expected left, right, or center for text-justify");
			C.setJustify(t);
		}
		if (b) {
			let t = b(e);
			if (t !== "bottom" && t !== "top" && t !== "middle" && t !== "alphabetic" && t !== "hanging") throw Error("Expected bottom, top, middle, alphabetic, or hanging for text-baseline");
			C.setTextBaseline(t);
		}
		return S && C.setPadding(S(e)), x && C.setKeepUpright(x(e)), C;
	};
}
function Ep(e, t) {
	return "icon-src" in e ? Dp(e, t) : "shape-points" in e ? Op(e, t) : "circle-radius" in e ? kp(e, t) : null;
}
function Dp(e, t) {
	let n = "icon-src", r = Jp(e[n], n), i = Lp(e, "icon-anchor", t), a = zp(e, "icon-scale", t), o = jp(e, "icon-opacity", t), s = Lp(e, "icon-displacement", t), c = jp(e, "icon-rotation", t), l = Pp(e, "icon-rotate-with-view", t), u = Up(e, "icon-anchor-origin"), d = Wp(e, "icon-anchor-x-units"), f = Wp(e, "icon-anchor-y-units"), p = Ap(e, "icon-color"), m, h = null;
	p !== void 0 && (Array.isArray(p) && p.length > 0 && typeof p[0] == "string" ? h = Fp(e, "icon-color", t) : m = Xp(p, "icon-color"));
	let g = Hp(e, "icon-cross-origin"), _ = Gp(e, "icon-offset"), v = Up(e, "icon-offset-origin"), y = Bp(e, "icon-width"), b = {
		src: r,
		anchorOrigin: u,
		anchorXUnits: d,
		anchorYUnits: f,
		crossOrigin: g,
		offset: _,
		offsetOrigin: v,
		height: Bp(e, "icon-height"),
		width: y,
		size: Vp(e, "icon-size"),
		declutterMode: Kp(e, "icon-declutter-mode")
	}, x = null;
	return function(e) {
		if (x) h && x.setColor(h(e));
		else {
			let t = h ? h(e) : m;
			x = new cp(t === void 0 ? Object.assign({}, b) : Object.assign({}, b, { color: t }));
		}
		return o && x.setOpacity(o(e)), s && x.setDisplacement(s(e)), c && x.setRotation(c(e)), l && x.setRotateWithView(l(e)), a && x.setScale(a(e)), i && x.setAnchor(i(e)), x;
	};
}
function Op(e, t) {
	let n = "shape-", r = "shape-points", i = "shape-radius", a = Yp(e[r], r);
	if (!(i in e)) throw Error(`Expected a number for ${i}`);
	let o = jp(e, i, t), s = typeof e[i] == "number" ? e[i] : 5, c = "shape-radius2", l = jp(e, c, t), u = typeof e[c] == "number" ? e[c] : void 0, d = Cp(e, n, t), f = wp(e, n, t), p = zp(e, "shape-scale", t), m = Lp(e, "shape-displacement", t), h = jp(e, "shape-rotation", t), g = Pp(e, "shape-rotate-with-view", t), _ = new ip({
		points: a,
		radius: s,
		radius2: u,
		angle: Bp(e, "shape-angle"),
		declutterMode: Kp(e, "shape-declutter-mode")
	});
	return function(e) {
		return o && _.setRadius(o(e)), l && _.setRadius2(l(e)), d && _.setFill(d(e)), f && _.setStroke(f(e)), m && _.setDisplacement(m(e)), h && _.setRotation(h(e)), g && _.setRotateWithView(g(e)), p && _.setScale(p(e)), _;
	};
}
function kp(e, t) {
	let n = "circle-", r = Cp(e, n, t), i = wp(e, n, t), a = jp(e, "circle-radius", t), o = zp(e, "circle-scale", t), s = Lp(e, "circle-displacement", t), c = jp(e, "circle-rotation", t), l = Pp(e, "circle-rotate-with-view", t), u = new ap({
		radius: 5,
		declutterMode: Kp(e, "circle-declutter-mode")
	});
	return function(e) {
		return a && u.setRadius(a(e)), r && u.setFill(r(e)), i && u.setStroke(i(e)), s && u.setDisplacement(s(e)), c && u.setRotation(c(e)), l && u.setRotateWithView(l(e)), o && u.setScale(o(e)), u;
	};
}
function Ap(e, t) {
	if (!(t in e)) return;
	let n = e[t];
	return n === void 0 ? void 0 : n;
}
function jp(e, t, n) {
	let r = Ap(e, t);
	if (r === void 0) return;
	let i = uf(r, U, n);
	return function(e) {
		return Yp(i(e), t);
	};
}
function Mp(e, t, n) {
	let r = Ap(e, t);
	if (r === void 0) return null;
	let i = uf(r, Ed, n);
	return function(e) {
		return Jp(i(e), t);
	};
}
function Np(e, t, n) {
	let r = Mp(e, t + "pattern-src", n), i = Rp(e, t + "pattern-offset", n), a = Rp(e, t + "pattern-size", n), o = Fp(e, t + "color", n);
	return function(e) {
		return {
			src: r(e),
			offset: i && i(e),
			size: a && a(e),
			color: o && o(e)
		};
	};
}
function Pp(e, t, n) {
	let r = Ap(e, t);
	if (r === void 0) return null;
	let i = uf(r, Td, n);
	return function(e) {
		let n = i(e);
		if (typeof n != "boolean") throw Error(`Expected a boolean for ${t}`);
		return n;
	};
}
function Fp(e, t, n) {
	let r = Ap(e, t);
	if (r === void 0) return null;
	let i = uf(r, Dd, n);
	return function(e) {
		return Xp(i(e), t);
	};
}
function Ip(e, t, n) {
	let r = Ap(e, t);
	if (r === void 0) return null;
	if (Array.isArray(r) && (r.length === 0 || typeof r[0] != "string")) {
		let e = r.map((e, r) => {
			if (typeof e == "number") return () => e;
			let i = uf(e, U, n);
			return function(e) {
				return Yp(i(e), `${t}[${r}]`);
			};
		});
		return function(t) {
			let n = Array(e.length);
			for (let r = 0; r < e.length; ++r) n[r] = e[r](t);
			return n;
		};
	}
	let i = uf(r, Od, n);
	return function(e) {
		return qp(i(e), t);
	};
}
function Lp(e, t, n) {
	let r = Ap(e, t);
	if (r === void 0) return null;
	let i = uf(r, Od, n);
	return function(e) {
		let n = qp(i(e), t);
		if (n.length !== 2) throw Error(`Expected two numbers for ${t}`);
		return n;
	};
}
function Rp(e, t, n) {
	let r = Ap(e, t);
	if (r === void 0) return null;
	let i = uf(r, Od, n);
	return function(e) {
		return Zp(i(e), t);
	};
}
function zp(e, t, n) {
	let r = Ap(e, t);
	if (r === void 0) return null;
	let i = uf(r, Od | U, n);
	return function(e) {
		return Qp(i(e), t);
	};
}
function Bp(e, t) {
	let n = e[t];
	if (n !== void 0) {
		if (typeof n != "number") throw Error(`Expected a number for ${t}`);
		return n;
	}
}
function Vp(e, t) {
	let n = e[t];
	if (n !== void 0) {
		if (typeof n == "number") return Cd(n);
		if (!Array.isArray(n) || n.length !== 2 || typeof n[0] != "number" || typeof n[1] != "number") throw Error(`Expected a number or size array for ${t}`);
		return n;
	}
}
function Hp(e, t) {
	let n = e[t];
	if (n !== void 0) {
		if (typeof n != "string") throw Error(`Expected a string for ${t}`);
		return n;
	}
}
function Up(e, t) {
	let n = e[t];
	if (n !== void 0) {
		if (n !== "bottom-left" && n !== "bottom-right" && n !== "top-left" && n !== "top-right") throw Error(`Expected bottom-left, bottom-right, top-left, or top-right for ${t}`);
		return n;
	}
}
function Wp(e, t) {
	let n = e[t];
	if (n !== void 0) {
		if (n !== "pixels" && n !== "fraction") throw Error(`Expected pixels or fraction for ${t}`);
		return n;
	}
}
function Gp(e, t) {
	let n = e[t];
	if (n !== void 0) return qp(n, t);
}
function Kp(e, t) {
	let n = e[t];
	if (n !== void 0) {
		if (typeof n != "string") throw Error(`Expected a string for ${t}`);
		if (n !== "declutter" && n !== "obstacle" && n !== "none") throw Error(`Expected declutter, obstacle, or none for ${t}`);
		return n;
	}
}
function qp(e, t) {
	if (!Array.isArray(e)) throw Error(`Expected an array for ${t}`);
	let n = e.length;
	for (let r = 0; r < n; ++r) if (typeof e[r] != "number") throw Error(`Expected an array of numbers for ${t}`);
	return e;
}
function Jp(e, t) {
	if (typeof e != "string") throw Error(`Expected a string for ${t}`);
	return e;
}
function Yp(e, t) {
	if (typeof e != "number") throw Error(`Expected a number for ${t}`);
	return e;
}
function Xp(e, t) {
	if (typeof e == "string") return e;
	let n = qp(e, t), r = n.length;
	if (r < 3 || r > 4) throw Error(`Expected a color with 3 or 4 values for ${t}`);
	return n;
}
function Zp(e, t) {
	let n = qp(e, t);
	if (n.length !== 2) throw Error(`Expected an array of two numbers for ${t}`);
	return n;
}
function Qp(e, t) {
	return typeof e == "number" ? e : Zp(e, t);
}
//#endregion
//#region node_modules/ol/layer/BaseVector.js
var $p = { RENDER_ORDER: "renderOrder" }, em = class extends ju {
	constructor(e) {
		e ||= {};
		let t = Object.assign({}, e);
		delete t.style, delete t.renderBuffer, delete t.updateWhileAnimating, delete t.updateWhileInteracting, super(t), this.declutter_ = e.declutter ? String(e.declutter) : void 0, this.renderBuffer_ = e.renderBuffer === void 0 ? 100 : e.renderBuffer, this.style_ = null, this.styleFunction_ = void 0, this.setStyle(e.style), this.updateWhileAnimating_ = e.updateWhileAnimating !== void 0 && e.updateWhileAnimating, this.updateWhileInteracting_ = e.updateWhileInteracting !== void 0 && e.updateWhileInteracting;
	}
	getDeclutter() {
		return this.declutter_;
	}
	getFeatures(e) {
		return super.getFeatures(e);
	}
	getRenderBuffer() {
		return this.renderBuffer_;
	}
	getRenderOrder() {
		return this.get($p.RENDER_ORDER);
	}
	getStyle() {
		return this.style_;
	}
	getStyleFunction() {
		return this.styleFunction_;
	}
	getUpdateWhileAnimating() {
		return this.updateWhileAnimating_;
	}
	getUpdateWhileInteracting() {
		return this.updateWhileInteracting_;
	}
	renderDeclutter(e, t) {
		let n = this.getDeclutter();
		n in e.declutter || (e.declutter[n] = new Iu(9)), this.getRenderer().renderDeclutter(e, t);
	}
	setRenderOrder(e) {
		this.set($p.RENDER_ORDER, e);
	}
	setStyle(e) {
		this.style_ = e === void 0 ? pp : e;
		let t = tm(e);
		this.styleFunction_ = e === null ? void 0 : dp(t), this.changed();
	}
	setDeclutter(e) {
		this.declutter_ = e ? String(e) : void 0, this.changed();
	}
};
function tm(e) {
	if (e === void 0) return pp;
	if (!e) return null;
	if (typeof e == "function" || e instanceof up) return e;
	if (Array.isArray(e) && e.length === 0) return [];
	if (Array.isArray(e) && e[0] instanceof up) {
		let t = e.length, n = Array(t);
		for (let r = 0; r < t; ++r) {
			let t = e[r];
			if (!(t instanceof up)) throw Error("Expected a list of style instances");
			n[r] = t;
		}
		return n;
	}
	return bp(e);
}
//#endregion
//#region node_modules/ol/render/Event.js
var nm = class extends ci {
	constructor(e, t, n, r) {
		super(e), this.inversePixelTransform = t, this.frameState = n, this.context = r;
	}
}, rm = class extends Jr {
	constructor(e) {
		super(), this.map_ = e;
	}
	dispatchRenderEvent(e, t) {
		R();
	}
	calculateMatrices2D(e) {
		let t = e.viewState, n = e.coordinateToPixelTransform, r = e.pixelToCoordinateTransform;
		Us(n, e.size[0] / 2, e.size[1] / 2, 1 / t.resolution, -1 / t.resolution, -t.rotation, -t.center[0], -t.center[1]), Ws(r, n);
	}
	forEachFeatureAtCoordinate(e, t, n, r, i, a, o, s) {
		let c, l = t.viewState;
		function u(e, t, n, r) {
			return i.call(a, t, e ? n : null, r);
		}
		let d = l.projection, f = Ka(e.slice(), d), p = [[0, 0]];
		if (d.canWrapX() && r) {
			let e = H(d.getExtent());
			p.push([-e, 0], [e, 0]);
		}
		let m = t.layerStatesArray, h = m.length, g = [], _ = [];
		for (let r = 0; r < p.length; r++) for (let i = h - 1; i >= 0; --i) {
			let a = m[i], d = a.layer;
			if (d.hasRenderer() && Mu(a, l) && o.call(s, d)) {
				let i = d.getRenderer(), o = d.getSource();
				if (i && o) {
					let s = o.getWrapX() ? f : e, l = u.bind(null, a.managed);
					_[0] = s[0] + p[r][0], _[1] = s[1] + p[r][1], c = i.forEachFeatureAtCoordinate(_, t, n, l, g);
				}
				if (c) return c;
			}
		}
		if (g.length === 0) return;
		let v = 1 / g.length;
		return g.forEach((e, t) => e.distanceSq += t * v), g.sort((e, t) => e.distanceSq - t.distanceSq), g.some((e) => c = e.callback(e.feature, e.layer, e.geometry)), c;
	}
	hasFeatureAtCoordinate(e, t, n, r, i, a) {
		return this.forEachFeatureAtCoordinate(e, t, n, r, ri, this, i, a) !== void 0;
	}
	getMap() {
		return this.map_;
	}
	renderFrame(e) {
		R();
	}
	scheduleExpireIconCache(e) {
		Of.canExpireCache() && e.postRenderFunctions.push(im);
	}
};
function im(e, t) {
	Of.expire();
}
//#endregion
//#region node_modules/ol/renderer/Composite.js
var am = class extends rm {
	constructor(e) {
		super(e), this.fontChangeListenerKey_ = I(Uf, Ur.PROPERTYCHANGE, e.redrawText, e), this.element_ = Ti ? Pl() : document.createElement("div");
		let t = this.element_.style;
		t.position = "absolute", t.width = "100%", t.height = "100%", t.zIndex = "0", this.element_.className = vl + " ol-layers";
		let n = e.getViewport();
		n && n.insertBefore(this.element_, n.firstChild || null), this.children_ = [], this.renderedVisible_ = !0;
	}
	dispatchRenderEvent(e, t) {
		let n = this.getMap();
		if (n.hasListener(e)) {
			let r = new nm(e, void 0, t);
			n.dispatchEvent(r);
		}
	}
	disposeInternal() {
		qr(this.fontChangeListenerKey_), this.element_.remove(), super.disposeInternal();
	}
	renderFrame(e) {
		if (!e) {
			this.renderedVisible_ &&= (this.element_.style.display = "none", !1);
			return;
		}
		this.calculateMatrices2D(e), this.dispatchRenderEvent(Au.PRECOMPOSE, e);
		let t = e.layerStatesArray.sort((e, t) => e.zIndex - t.zIndex);
		t.some((e) => e.layer instanceof em && e.layer.getDeclutter()) && (e.declutter = {});
		let n = e.viewState;
		this.children_.length = 0;
		let r = this.getMap().getTargetElement(), i;
		Fl(r) && (i = r.getContext("2d"), i.setTransform(1, 0, 0, 1, 0, 0), i.clearRect(0, 0, r.width, r.height));
		let a = [], o = i ? r : null;
		for (let r = 0, i = t.length; r < i; ++r) {
			let i = t[r];
			e.layerIndex = r;
			let s = i.layer, c = s.getSourceState();
			if (!Mu(i, n) || c != "ready" && c != "undefined") {
				s.unrender();
				continue;
			}
			let l = s.render(e, o);
			l && (l !== o && (this.children_.push(l), o = l), a.push(i));
		}
		this.declutter(e, a), Nl(this.element_, this.children_);
		for (let e of i ? this.children_ : []) {
			let t = e.firstElementChild || e, n = e.style.backgroundColor;
			if (n && (!Fl(t) || t.width > 0) && (i.fillStyle = n, i.fillRect(0, 0, i.canvas.width, i.canvas.height)), !Fl(t) || t.width === 0) continue;
			i.save();
			let r = e.style.opacity || t.style.opacity;
			i.globalAlpha = r === "" ? 1 : Number(r);
			let a = t.style.transform;
			if (a) i.transform(...Js(a));
			else {
				let e = parseFloat(t.style.width) / t.width, n = parseFloat(t.style.height) / t.height;
				i.transform(e, 0, 0, n, 0, 0);
			}
			i.drawImage(t, 0, 0), i.restore();
		}
		this.dispatchRenderEvent(Au.POSTCOMPOSE, e), this.renderedVisible_ ||= (this.element_.style.display = "", !0), this.scheduleExpireIconCache(e);
	}
	declutter(e, t) {
		if (e.declutter) {
			for (let n = t.length - 1; n >= 0; --n) {
				let r = t[n], i = r.layer;
				i.getDeclutter() && i.renderDeclutter(e, r);
			}
			t.forEach((t) => t.layer.renderDeferred(e));
		}
	}
};
//#endregion
//#region node_modules/ol/Map.js
function om(e) {
	if (e instanceof ju) {
		e.setMapInternal(null);
		return;
	}
	e instanceof ku && e.getLayers().forEach(om);
}
function sm(e, t) {
	if (e instanceof ju) {
		e.setMapInternal(t);
		return;
	}
	if (e instanceof ku) {
		let n = e.getLayers().getArray();
		for (let e = 0, r = n.length; e < r; ++e) sm(n[e], t);
	}
}
var cm = class extends mi {
	constructor(e) {
		super(), e ||= {}, this.on, this.once, this.un;
		let t = lm(e);
		this.renderComplete_ = !1, this.loaded_ = !0, this.boundHandleBrowserEvent_ = this.handleBrowserEvent.bind(this), this.maxTilesLoading_ = e.maxTilesLoading === void 0 ? 16 : e.maxTilesLoading, this.pixelRatio_ = e.pixelRatio === void 0 ? wi : e.pixelRatio, this.postRenderTimeoutHandle_, this.animationDelayKey_, this.animationDelay_ = this.animationDelay_.bind(this), this.coordinateToPixelTransform_ = Fs(), this.pixelToCoordinateTransform_ = Fs(), this.frameIndex_ = 0, this.frameState_ = null, this.previousExtent_ = null, this.viewPropertyListenerKey_ = null, this.viewChangeListenerKey_ = null, this.layerGroupPropertyListenerKeys_ = null, Ti || (this.viewport_ = document.createElement("div"), this.viewport_.className = "ol-viewport" + ("ontouchstart" in window ? " ol-touch" : ""), this.viewport_.style.position = "relative", this.viewport_.style.overflow = "hidden", this.viewport_.style.width = "100%", this.viewport_.style.height = "100%", this.overlayContainer_ = document.createElement("div"), this.overlayContainer_.style.position = "absolute", this.overlayContainer_.style.zIndex = "0", this.overlayContainer_.style.width = "100%", this.overlayContainer_.style.height = "100%", this.overlayContainer_.style.pointerEvents = "none", this.overlayContainer_.className = "ol-overlaycontainer", this.viewport_.appendChild(this.overlayContainer_), this.overlayContainerStopEvent_ = document.createElement("div"), this.overlayContainerStopEvent_.style.position = "absolute", this.overlayContainerStopEvent_.style.zIndex = "0", this.overlayContainerStopEvent_.style.width = "100%", this.overlayContainerStopEvent_.style.height = "100%", this.overlayContainerStopEvent_.style.pointerEvents = "none", this.overlayContainerStopEvent_.className = "ol-overlaycontainer-stopevent", this.viewport_.appendChild(this.overlayContainerStopEvent_)), this.mapBrowserEventHandler_ = null, this.moveTolerance_ = e.moveTolerance, this.keyboardEventTarget_ = t.keyboardEventTarget, this.targetChangeHandlerKeys_ = null, this.targetElement_ = null, Ti || (this.resizeObserver_ = new ResizeObserver(() => this.updateSize())), this.controls = t.controls || (Ti ? new _i() : Bl()), this.interactions = t.interactions || (Ti ? new _i() : Cu({ onFocusOnly: !0 })), this.overlays_ = t.overlays, this.overlayIdIndex_ = {}, this.renderer_ = null, this.postRenderFunctions_ = [], this.tileQueue_ = new Pi(this.getTilePriority.bind(this), this.handleTileChange_.bind(this)), this.addChangeListener(ji.LAYERGROUP, this.handleLayerGroupChanged_), this.addChangeListener(ji.VIEW, this.handleViewChanged_), this.addChangeListener(ji.SIZE, this.handleSizeChanged_), this.addChangeListener(ji.TARGET, this.handleTargetChanged_), this.setProperties(t.values);
		let n = this;
		e.view && !(e.view instanceof ll) && e.view.then(function(e) {
			n.setView(new ll(e));
		}), this.controls.addEventListener(Hr.ADD, (e) => {
			e.element.setMap(this);
		}), this.controls.addEventListener(Hr.REMOVE, (e) => {
			e.element.setMap(null);
		}), this.interactions.addEventListener(Hr.ADD, (e) => {
			e.element.setMap(this);
		}), this.interactions.addEventListener(Hr.REMOVE, (e) => {
			e.element.setMap(null);
		}), this.overlays_.addEventListener(Hr.ADD, (e) => {
			this.addOverlayInternal_(e.element);
		}), this.overlays_.addEventListener(Hr.REMOVE, (e) => {
			let t = e.element.getId();
			t !== void 0 && delete this.overlayIdIndex_[t.toString()], e.element.setMap(null);
		}), this.controls.forEach((e) => {
			e.setMap(this);
		}), this.interactions.forEach((e) => {
			e.setMap(this);
		}), this.overlays_.forEach(this.addOverlayInternal_.bind(this));
	}
	addControl(e) {
		this.getControls().push(e);
	}
	addInteraction(e) {
		this.getInteractions().push(e);
	}
	addLayer(e) {
		this.getLayerGroup().getLayers().push(e);
	}
	handleLayerAdd_(e) {
		sm(e.layer, this);
	}
	addOverlay(e) {
		this.getOverlays().push(e);
	}
	addOverlayInternal_(e) {
		let t = e.getId();
		t !== void 0 && (this.overlayIdIndex_[t.toString()] = e), e.setMap(this);
	}
	disposeInternal() {
		this.controls.clear(), this.interactions.clear(), this.overlays_.clear(), this.resizeObserver_?.disconnect(), this.setTarget(null), super.disposeInternal();
	}
	forEachFeatureAtPixel(e, t, n) {
		if (!this.frameState_ || !this.renderer_) return;
		let r = this.getCoordinateFromPixelInternal(e);
		n = n === void 0 ? {} : n;
		let i = n.hitTolerance === void 0 ? 0 : n.hitTolerance, a = n.layerFilter === void 0 ? ri : n.layerFilter, o = n.checkWrapped !== !1;
		return this.renderer_.forEachFeatureAtCoordinate(r, this.frameState_, i, o, t, null, a, null);
	}
	getFeaturesAtPixel(e, t) {
		let n = [];
		return this.forEachFeatureAtPixel(e, function(e) {
			n.push(e);
		}, t), n;
	}
	getAllLayers() {
		let e = [];
		function t(n) {
			n.forEach(function(n) {
				n instanceof ku ? t(n.getLayers()) : e.push(n);
			});
		}
		return t(this.getLayers()), e;
	}
	hasFeatureAtPixel(e, t) {
		if (!this.frameState_ || !this.renderer_) return !1;
		let n = this.getCoordinateFromPixelInternal(e);
		t = t === void 0 ? {} : t;
		let r = t.layerFilter === void 0 ? ri : t.layerFilter, i = t.hitTolerance === void 0 ? 0 : t.hitTolerance, a = t.checkWrapped !== !1;
		return this.renderer_.hasFeatureAtCoordinate(n, this.frameState_, i, a, r, null);
	}
	getEventCoordinate(e) {
		return this.getCoordinateFromPixel(this.getEventPixel(e));
	}
	getEventCoordinateInternal(e) {
		return this.getCoordinateFromPixelInternal(this.getEventPixel(e));
	}
	getEventPixel(e) {
		let t = this.viewport_.getBoundingClientRect(), n = this.getSize(), r = t.width / n[0], i = t.height / n[1], a = "changedTouches" in e ? e.changedTouches[0] : e;
		return [(a.clientX - t.left) / r, (a.clientY - t.top) / i];
	}
	getTarget() {
		return this.get(ji.TARGET);
	}
	getTargetElement() {
		return this.targetElement_;
	}
	getCoordinateFromPixel(e) {
		return Ds(this.getCoordinateFromPixelInternal(e), this.getView().getProjection());
	}
	getCoordinateFromPixelInternal(e) {
		let t = this.frameState_;
		return t ? Bs(t.pixelToCoordinateTransform, e.slice()) : null;
	}
	getControls() {
		return this.controls;
	}
	getOverlays() {
		return this.overlays_;
	}
	getOverlayById(e) {
		let t = this.overlayIdIndex_[e.toString()];
		return t === void 0 ? null : t;
	}
	getInteractions() {
		return this.interactions;
	}
	getLayerGroup() {
		return this.get(ji.LAYERGROUP);
	}
	setLayers(e) {
		let t = this.getLayerGroup();
		if (e instanceof _i) {
			t.setLayers(e);
			return;
		}
		let n = t.getLayers();
		n.clear(), n.extend(e);
	}
	getLayers() {
		return this.getLayerGroup().getLayers();
	}
	getLoadingOrNotReady() {
		let e = this.getLayerGroup().getLayerStatesArray();
		for (let t = 0, n = e.length; t < n; ++t) {
			let n = e[t];
			if (!n.visible) continue;
			let r = n.layer.getRenderer();
			if (r && !r.ready) return !0;
			let i = n.layer.getSource();
			if (i && i.loading) return !0;
		}
		return !1;
	}
	getPixelFromCoordinate(e) {
		let t = Os(e, this.getView().getProjection());
		return this.getPixelFromCoordinateInternal(t);
	}
	getPixelFromCoordinateInternal(e) {
		let t = this.frameState_;
		return t ? Bs(t.coordinateToPixelTransform, e.slice(0, 2)) : null;
	}
	getPixelRatio() {
		return this.pixelRatio_;
	}
	setPixelRatio(e) {
		this.pixelRatio_ !== e && (this.pixelRatio_ = e, this.render());
	}
	getRenderer() {
		return this.renderer_;
	}
	getSize() {
		return this.get(ji.SIZE);
	}
	getView() {
		return this.get(ji.VIEW);
	}
	getViewport() {
		return this.viewport_;
	}
	getOverlayContainer() {
		return this.overlayContainer_;
	}
	getOverlayContainerStopEvent() {
		return this.overlayContainerStopEvent_;
	}
	getOwnerDocument() {
		let e = this.getTargetElement();
		return e ? e.ownerDocument : document;
	}
	getTilePriority(e, t, n, r) {
		return Fi(this.frameState_, e, t, n, r);
	}
	handleBrowserEvent(e, t) {
		t ||= e.type;
		let n = new yi(t, this, e);
		this.handleMapBrowserEvent(n);
	}
	handleMapBrowserEvent(e) {
		if (!this.frameState_) return;
		let t = e.originalEvent, n = t.type;
		if (n === Oi.POINTERDOWN || n === L.WHEEL || n === L.KEYDOWN) {
			let e = this.getOwnerDocument(), n = this.viewport_.getRootNode ? this.viewport_.getRootNode() : e, r = t.target, i = n instanceof ShadowRoot ? n.host === r ? n.host.ownerDocument : n : n === e ? e.documentElement : n;
			if (this.overlayContainerStopEvent_.contains(r) || !i.contains(r)) return;
		}
		if (e.frameState = this.frameState_, this.dispatchEvent(e) !== !1) {
			let t = this.getInteractions().getArray().slice();
			for (let n = t.length - 1; n >= 0; n--) {
				let r = t[n];
				if (r.getMap() === this && r.getActive() && this.getTargetElement() && (!r.handleEvent(e) || e.propagationStopped)) break;
			}
		}
	}
	handlePostRender() {
		let e = this.frameState_, t = this.tileQueue_;
		if (!t.isEmpty()) {
			let n = this.maxTilesLoading_, r = n, i = e ? e.viewHints : void 0, a = i ? i[Ii.ANIMATING] || i[Ii.INTERACTING] : !1;
			if (a) {
				let t = Date.now() - e.time > 8;
				n = t ? 0 : 8, r = t ? 0 : 2;
			}
			t.getTilesLoading() < n && (a && t.reprioritize(), t.loadMoreTiles(n, r));
		}
		e && this.renderer_ && !e.animate && (this.renderComplete_ ? (this.hasListener(Au.RENDERCOMPLETE) && this.renderer_.dispatchRenderEvent(Au.RENDERCOMPLETE, e), this.loaded_ === !1 && (this.loaded_ = !0, this.dispatchEvent(new vi(Ai.LOADEND, this, e)))) : this.loaded_ === !0 && (this.loaded_ = !1, this.dispatchEvent(new vi(Ai.LOADSTART, this, e))));
		let n = this.postRenderFunctions_;
		if (e) for (let t = 0, r = n.length; t < r; ++t) n[t](this, e);
		n.length = 0;
	}
	handleSizeChanged_() {
		this.getView() && !this.getView().getAnimating() && this.getView().resolveConstraints(0), this.render();
	}
	handleTargetChanged_() {
		if (this.mapBrowserEventHandler_) {
			for (let e = 0, t = this.targetChangeHandlerKeys_.length; e < t; ++e) qr(this.targetChangeHandlerKeys_[e]);
			this.targetChangeHandlerKeys_ = null, this.viewport_.removeEventListener(L.CONTEXTMENU, this.boundHandleBrowserEvent_), this.viewport_.removeEventListener(L.WHEEL, this.boundHandleBrowserEvent_), this.mapBrowserEventHandler_.dispose(), this.mapBrowserEventHandler_ = null, this.viewport_.remove();
		}
		if (this.targetElement_ && !Fl(this.targetElement_)) {
			this.resizeObserver_?.unobserve(this.targetElement_);
			let e = this.targetElement_.getRootNode();
			e instanceof ShadowRoot && this.resizeObserver_.unobserve(e.host), this.setSize(void 0);
		}
		let e = this.getTarget(), t = typeof e == "string" ? document.getElementById(e) : e;
		if (this.targetElement_ = t, !t) this.renderer_ &&= (clearTimeout(this.postRenderTimeoutHandle_), this.postRenderTimeoutHandle_ = void 0, this.postRenderFunctions_.length = 0, this.renderer_.dispose(), null), this.animationDelayKey_ &&= (cancelAnimationFrame(this.animationDelayKey_), void 0);
		else {
			if (Fl(t) || t.appendChild(this.viewport_), this.renderer_ ||= new am(this), !Fl(t)) {
				this.mapBrowserEventHandler_ = new ki(this, this.moveTolerance_);
				for (let e in bi) this.mapBrowserEventHandler_.addEventListener(bi[e], this.handleMapBrowserEvent.bind(this));
				this.viewport_.addEventListener(L.CONTEXTMENU, this.boundHandleBrowserEvent_, !1), this.viewport_.addEventListener(L.WHEEL, this.boundHandleBrowserEvent_, Di ? { passive: !1 } : !1);
				let e;
				if (this.keyboardEventTarget_) e = this.keyboardEventTarget_;
				else {
					let n = t.getRootNode();
					e = n instanceof ShadowRoot ? n.host : t;
				}
				if (this.targetChangeHandlerKeys_ = [I(e, L.KEYDOWN, this.handleBrowserEvent, this), I(e, L.KEYPRESS, this.handleBrowserEvent, this)], !Fl(t)) {
					let e = t.getRootNode();
					e instanceof ShadowRoot && this.resizeObserver_.observe(e.host), this.resizeObserver_?.observe(t);
				}
			}
			this.updateSize();
		}
	}
	handleTileChange_() {
		this.render();
	}
	handleViewPropertyChanged_() {
		this.render();
	}
	handleViewChanged_() {
		this.viewPropertyListenerKey_ &&= (qr(this.viewPropertyListenerKey_), null), this.viewChangeListenerKey_ &&= (qr(this.viewChangeListenerKey_), null);
		let e = this.getView();
		e && (this.updateViewportSize_(this.getSize()), this.viewPropertyListenerKey_ = I(e, Ur.PROPERTYCHANGE, this.handleViewPropertyChanged_, this), this.viewChangeListenerKey_ = I(e, L.CHANGE, this.handleViewPropertyChanged_, this), e.resolveConstraints(0)), this.render();
	}
	handleLayerGroupChanged_() {
		this.layerGroupPropertyListenerKeys_ &&= (this.layerGroupPropertyListenerKeys_.forEach(qr), null);
		let e = this.getLayerGroup();
		e && (this.handleLayerAdd_(new Du("addlayer", e)), this.layerGroupPropertyListenerKeys_ = [
			I(e, Ur.PROPERTYCHANGE, this.render, this),
			I(e, L.CHANGE, this.render, this),
			I(e, "addlayer", this.handleLayerAdd_, this),
			I(e, "removelayer", this.handleLayerRemove_, this)
		]), this.render();
	}
	isRendered() {
		return !!this.frameState_;
	}
	animationDelay_() {
		this.animationDelayKey_ = void 0, this.renderFrame_(Date.now());
	}
	renderSync() {
		this.animationDelayKey_ && cancelAnimationFrame(this.animationDelayKey_), this.animationDelay_();
	}
	redrawText() {
		if (!this.frameState_) return;
		let e = this.frameState_.layerStatesArray;
		for (let t = 0, n = e.length; t < n; ++t) {
			let n = e[t].layer;
			n.hasRenderer() && n.getRenderer().handleFontsChanged();
		}
	}
	render() {
		this.renderer_ && this.animationDelayKey_ === void 0 && (this.animationDelayKey_ = requestAnimationFrame(this.animationDelay_));
	}
	removeControl(e) {
		return this.getControls().remove(e);
	}
	removeInteraction(e) {
		return this.getInteractions().remove(e);
	}
	removeLayer(e) {
		return this.getLayerGroup().getLayers().remove(e);
	}
	handleLayerRemove_(e) {
		om(e.layer);
	}
	removeOverlay(e) {
		return this.getOverlays().remove(e);
	}
	renderFrame_(e) {
		let t = this.getSize(), n = this.getView(), r = this.frameState_, i = null;
		if (t !== void 0 && xd(t) && n && n.isDef()) {
			let r = n.getHints(this.frameState_ ? this.frameState_.viewHints : void 0), a = n.getState();
			if (i = {
				animate: !1,
				coordinateToPixelTransform: this.coordinateToPixelTransform_,
				declutter: null,
				extent: wa(a.center, a.resolution, a.rotation, t),
				index: this.frameIndex_++,
				layerIndex: 0,
				layerStatesArray: this.getLayerGroup().getLayerStatesArray(),
				pixelRatio: this.pixelRatio_,
				pixelToCoordinateTransform: this.pixelToCoordinateTransform_,
				postRenderFunctions: [],
				size: t,
				tileQueue: this.tileQueue_,
				time: e,
				usedTiles: {},
				viewState: a,
				viewHints: r,
				wantedTiles: {},
				mapId: z(this),
				renderTargets: {}
			}, a.nextCenter && a.nextResolution) {
				let e = isNaN(a.nextRotation) ? a.rotation : a.nextRotation;
				i.nextExtent = wa(a.nextCenter, a.nextResolution, e, t);
			}
		}
		this.frameState_ = i, this.renderer_.renderFrame(i), i && (i.animate && this.render(), Array.prototype.push.apply(this.postRenderFunctions_, i.postRenderFunctions), r && (!this.previousExtent_ || !Ma(this.previousExtent_) && !pa(i.extent, this.previousExtent_)) && (this.dispatchEvent(new vi(Ai.MOVESTART, this, r)), this.previousExtent_ = ua(this.previousExtent_)), this.previousExtent_ && !i.viewHints[Ii.ANIMATING] && !i.viewHints[Ii.INTERACTING] && !pa(i.extent, this.previousExtent_) && (this.dispatchEvent(new vi(Ai.MOVEEND, this, i)), na(i.extent, this.previousExtent_))), this.dispatchEvent(new vi(Ai.POSTRENDER, this, i)), this.renderComplete_ = (this.hasListener(Ai.LOADSTART) || this.hasListener(Ai.LOADEND) || this.hasListener(Au.RENDERCOMPLETE)) && !this.tileQueue_.getTilesLoading() && !this.tileQueue_.getCount() && !this.getLoadingOrNotReady(), this.postRenderTimeoutHandle_ ||= setTimeout(() => {
			this.postRenderTimeoutHandle_ = void 0, this.handlePostRender();
		}, 0);
	}
	setLayerGroup(e) {
		let t = this.getLayerGroup();
		t && this.handleLayerRemove_(new Du("removelayer", t)), this.set(ji.LAYERGROUP, e);
	}
	setSize(e) {
		this.set(ji.SIZE, e);
	}
	setTarget(e) {
		this.set(ji.TARGET, e);
	}
	setView(e) {
		if (!e || e instanceof ll) {
			this.set(ji.VIEW, e);
			return;
		}
		this.set(ji.VIEW, new ll());
		let t = this;
		e.then(function(e) {
			t.setView(new ll(e));
		});
	}
	updateSize() {
		let e = this.getTargetElement(), t;
		if (e) {
			let n, r;
			if (Fl(e)) {
				let t = e.getContext("2d").getTransform();
				n = e.width / t.a, r = e.height / t.d;
			} else {
				let t = getComputedStyle(e);
				n = e.offsetWidth - parseFloat(t.borderLeftWidth) - parseFloat(t.paddingLeft) - parseFloat(t.paddingRight) - parseFloat(t.borderRightWidth), r = e.offsetHeight - parseFloat(t.borderTopWidth) - parseFloat(t.paddingTop) - parseFloat(t.paddingBottom) - parseFloat(t.borderBottomWidth);
			}
			!isNaN(n) && !isNaN(r) && (t = [Math.max(0, n), Math.max(0, r)], !xd(t) && (e.offsetWidth || e.offsetHeight || e.getClientRects().length) && no("No map visible because the map container's width or height are 0."));
		}
		let n = this.getSize();
		t && (!n || !ti(t, n)) && (this.updateViewportSize_(t), this.setSize(t));
	}
	updateViewportSize_(e) {
		let t = this.getView();
		t && t.setViewportSize(e);
	}
};
function lm(e) {
	let t = null;
	e.keyboardEventTarget !== void 0 && (t = typeof e.keyboardEventTarget == "string" ? document.getElementById(e.keyboardEventTarget) : e.keyboardEventTarget);
	let n = {}, r = e.layers && typeof e.layers.getLayers == "function" ? e.layers : new ku({ layers: e.layers });
	n[ji.LAYERGROUP] = r, n[ji.TARGET] = e.target, n[ji.VIEW] = e.view instanceof ll ? e.view : new ll();
	let i;
	e.controls !== void 0 && (Array.isArray(e.controls) ? i = new _i(e.controls.slice()) : (V(typeof e.controls.getArray == "function", "Expected `controls` to be an array or an `ol/Collection.js`"), i = e.controls));
	let a;
	e.interactions !== void 0 && (Array.isArray(e.interactions) ? a = new _i(e.interactions.slice()) : (V(typeof e.interactions.getArray == "function", "Expected `interactions` to be an array or an `ol/Collection.js`"), a = e.interactions));
	let o;
	return e.overlays === void 0 ? o = new _i() : Array.isArray(e.overlays) ? o = new _i(e.overlays.slice()) : (V(typeof e.overlays.getArray == "function", "Expected `overlays` to be an array or an `ol/Collection.js`"), o = e.overlays), {
		controls: i,
		interactions: a,
		keyboardEventTarget: t,
		overlays: o,
		values: n
	};
}
//#endregion
//#region node_modules/ol/Feature.js
var um = class e extends mi {
	constructor(e) {
		if (super(), this.on, this.once, this.un, this.id_ = void 0, this.geometryName_ = "geometry", this.style_ = null, this.styleFunction_ = void 0, this.geometryChangeKey_ = null, this.addChangeListener(this.geometryName_, this.handleGeometryChanged_), e) {
			if (typeof e.getSimplifiedGeometry == "function") {
				let t = e;
				this.setGeometry(t);
			} else {
				let t = e;
				this.setProperties(t);
			}
		}
	}
	clone() {
		let t = new e(), n = this.geometryName_;
		t.setGeometryName(n);
		let r = this.getPropertiesInternal();
		if (r) {
			let e = this.getGeometry();
			for (let i in r) i === n && e ? t.set(i, e.clone()) : t.set(i, r[i], !0);
		}
		let i = this.getStyle();
		return i && t.setStyle(i), t;
	}
	getGeometry() {
		return this.get(this.geometryName_);
	}
	getId() {
		return this.id_;
	}
	getGeometryName() {
		return this.geometryName_;
	}
	getStyle() {
		return this.style_;
	}
	getStyleFunction() {
		return this.styleFunction_;
	}
	handleGeometryChange_() {
		this.changed();
	}
	handleGeometryChanged_() {
		this.geometryChangeKey_ &&= (qr(this.geometryChangeKey_), null);
		let e = this.getGeometry();
		e && (this.geometryChangeKey_ = I(e, L.CHANGE, this.handleGeometryChange_, this)), this.changed();
	}
	setGeometry(e) {
		this.set(this.geometryName_, e);
	}
	setStyle(e) {
		this.style_ = e, this.styleFunction_ = e ? dm(e) : void 0, this.changed();
	}
	setId(e) {
		this.id_ = e, this.changed();
	}
	setGeometryName(e) {
		e !== this.geometryName_ && (this.removeChangeListener(this.geometryName_, this.handleGeometryChanged_), this.geometryName_ = e, this.addChangeListener(this.geometryName_, this.handleGeometryChanged_), this.handleGeometryChanged_());
	}
};
function dm(e) {
	if (typeof e == "function") return e;
	let t;
	return Array.isArray(e) ? t = e : (V(typeof e.getZIndex == "function", "Expected an `ol/style/Style` or an array of `ol/style/Style.js`"), t = [e]), function() {
		return t;
	};
}
//#endregion
//#region node_modules/ol/geom/flat/interpolate.js
function fm(e, t, n, r, i, a, o) {
	let s, c, l = (n - t) / r;
	if (l === 1) s = t;
	else if (l === 2) s = t, c = i;
	else if (l !== 0) {
		let a = e[t], o = e[t + 1], l = 0, u = [0];
		for (let i = t + r; i < n; i += r) {
			let t = e[i], n = e[i + 1];
			l += Math.sqrt((t - a) * (t - a) + (n - o) * (n - o)), u.push(l), a = t, o = n;
		}
		let d = i * l, f = Yr(u, d);
		f < 0 ? (c = (d - u[-f - 2]) / (u[-f - 1] - u[-f - 2]), s = t + (-f - 2) * r) : s = t + f * r;
	}
	o = o > 1 ? o : 2, a ||= Array(o);
	for (let t = 0; t < o; ++t) a[t] = s === void 0 ? NaN : c === void 0 ? e[s + t] : Gi(e[s + t], e[s + r + t], c);
	return a;
}
function pm(e, t, n, r, i, a) {
	if (n == t) return null;
	let o;
	if (i < e[t + r - 1]) return a ? (o = e.slice(t, t + r), o[r - 1] = i, o) : null;
	if (e[n - 1] < i) return a ? (o = e.slice(n - r, n), o[r - 1] = i, o) : null;
	if (i == e[t + r - 1]) return e.slice(t, t + r);
	let s = t / r, c = n / r;
	for (; s < c;) {
		let t = s + c >> 1;
		i < e[(t + 1) * r - 1] ? c = t : s = t + 1;
	}
	let l = e[s * r - 1];
	if (i == l) return e.slice((s - 1) * r, (s - 1) * r + r);
	let u = e[(s + 1) * r - 1], d = (i - l) / (u - l);
	o = [];
	for (let t = 0; t < r - 1; ++t) o.push(Gi(e[(s - 1) * r + t], e[s * r + t], d));
	return o.push(i), o;
}
function mm(e, t, n, r, i, a, o) {
	if (o) return pm(e, t, n[n.length - 1], r, i, a);
	let s;
	if (i < e[r - 1]) return a ? (s = e.slice(0, r), s[r - 1] = i, s) : null;
	if (e[e.length - 1] < i) return a ? (s = e.slice(e.length - r), s[r - 1] = i, s) : null;
	for (let a = 0, o = n.length; a < o; ++a) {
		let o = n[a];
		if (t != o) {
			if (i < e[t + r - 1]) return null;
			if (i <= e[o - 1]) return pm(e, t, o, r, i, !1);
			t = o;
		}
	}
	return null;
}
//#endregion
//#region node_modules/ol/geom/flat/length.js
function hm(e, t, n, r) {
	let i = e[t], a = e[t + 1], o = 0;
	for (let s = t + r; s < n; s += r) {
		let t = e[s], n = e[s + 1];
		o += Math.sqrt((t - i) * (t - i) + (n - a) * (n - a)), i = t, a = n;
	}
	return o;
}
//#endregion
//#region node_modules/ol/geom/LineString.js
var gm = class e extends rc {
	constructor(e, t) {
		super(), this.flatMidpoint_ = null, this.flatMidpointRevision_ = -1, this.maxDelta_ = -1, this.maxDeltaRevision_ = -1, t !== void 0 && !Array.isArray(e[0]) ? this.setFlatCoordinates(t, e) : this.setCoordinates(e, t);
	}
	appendCoordinate(e) {
		ei(this.flatCoordinates, e), this.changed();
	}
	clone() {
		let t = new e(this.flatCoordinates.slice(), this.layout);
		return t.applyProperties(this), t;
	}
	closestPointXY(e, t, n, r) {
		return r < ra(this.getExtent(), e, t) ? r : (this.maxDeltaRevision_ != this.getRevision() && (this.maxDelta_ = Math.sqrt(dc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, 0)), this.maxDeltaRevision_ = this.getRevision()), mc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, this.maxDelta_, !1, e, t, n, r));
	}
	forEachSegment(e) {
		return Oc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, e);
	}
	getCoordinateAtM(e, t) {
		return this.layout != "XYM" && this.layout != "XYZM" ? null : (t = t !== void 0 && t, pm(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, e, t));
	}
	getCoordinates() {
		return xc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
	}
	getCoordinateAt(e, t) {
		return fm(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, e, t, this.stride);
	}
	getLength() {
		return hm(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
	}
	getFlatMidpoint() {
		return this.flatMidpointRevision_ != this.getRevision() && (this.flatMidpoint_ = this.getCoordinateAt(.5, this.flatMidpoint_ ?? void 0), this.flatMidpointRevision_ = this.getRevision()), this.flatMidpoint_;
	}
	getSimplifiedGeometryInternal(t) {
		let n = [];
		return n.length = Pc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, t, n, 0), new e(n, "XY");
	}
	getType() {
		return "LineString";
	}
	intersectsExtent(e) {
		return kc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride, e, this.getExtent());
	}
	setCoordinates(e, t) {
		this.setLayout(t, e, 1), this.flatCoordinates ||= [], this.flatCoordinates.length = vc(this.flatCoordinates, 0, e, this.stride), this.changed();
	}
};
//#endregion
//#region node_modules/ol/geom/flat/lineoffset.js
function _m(e, t, n, r, i, a, o, s) {
	o ??= [], s ??= r;
	let c = e[t + r], l = e[t + r + 1], u = e[n - 2 * r], d = e[n - 2 * r + 1], f, p, m, h, g, _, v, y, b = 0;
	for (let x = t; x < n; x += r) {
		m = f, h = p, g = void 0, _ = void 0, x + r < n && (g = e[x + r], _ = e[x + r + 1]), a && x === t && (m = u, h = d), a && x === n - r && (g = c, _ = l), f = e[x], p = e[x + 1], [v, y] = vm(f, p, m, h, g, _, i), o[b++] = v, o[b++] = y;
		for (let t = 2; t < s; t++) o[b++] = e[x + t];
	}
	return o.length != b && (o.length = b), o;
}
function vm(e, t, n, r, i, a, o) {
	let s, c;
	n !== void 0 && r !== void 0 ? (s = e - n, c = t - r) : i !== void 0 && a !== void 0 ? (s = i - e, c = a - t) : (s = 1, c = 0);
	let l = Math.hypot(s, c), u = s / l, d = c / l;
	if (s = -d, c = u, n === void 0 || r === void 0 || i === void 0 || a === void 0) return [e + s * o, t + c * o];
	let f = Ja([e, t], [n, r], [i, a]);
	if (Math.cos(f) > .998) return [e + u * o, t + d * o];
	let p = Math.cos(f / 2), m = Math.sin(f / 2), h = m * s + p * c, g = -p * s + m * c, _ = 1 / m * h, v = 1 / m * g;
	return [e + _ * o, t + v * o];
}
function ym(e, t, n = !1) {
	for (let r = 0, i = e.length - 2; r < i; r += t) {
		let i = n && r === 0 ? e.length - 3 * t : e.length - 2 * t;
		for (let n = i; n > r + t; n -= t) {
			let i = e[r], a = e[r + 1], o = e[r + t], s = e[r + t + 1], c = e[n], l = e[n + 1], u = e[n + t], d = e[n + t + 1], f = (d - l) * (o - i) - (u - c) * (s - a);
			if (f === 0) continue;
			let p = ((u - c) * (a - l) - (d - l) * (i - c)) / f, m = ((o - i) * (a - l) - (s - a) * (i - c)) / f;
			if (p > 0 && p < 1 && m > 0 && m < 1) {
				let c = i + p * (o - i), l = a + p * (s - a);
				e[r + t] = c, e[r + t + 1] = l, e.splice(r + 2 * t, n - r - t);
				break;
			}
		}
	}
	return e;
}
//#endregion
//#region node_modules/ol/render/VectorContext.js
var bm = class {
	drawCustom(e, t, n, r, i) {}
	drawGeometry(e) {}
	setStyle(e) {}
	drawCircle(e, t, n) {}
	drawFeature(e, t, n) {}
	drawGeometryCollection(e, t, n) {}
	drawLineString(e, t, n) {}
	drawMultiLineString(e, t, n) {}
	drawMultiPoint(e, t, n) {}
	drawMultiPolygon(e, t, n) {}
	drawPoint(e, t, n) {}
	drawPolygon(e, t, n) {}
	drawText(e, t, n) {}
	setFillStrokeStyle(e, t) {}
	setImageStyle(e, t) {}
	setTextStyle(e, t) {}
}, xm = class extends bm {
	constructor(e, t, n, r, i, a, o) {
		super(), this.context_ = e, this.pixelRatio_ = t, this.extent_ = n, this.transform_ = r, this.transformRotation_ = r ? Ki(Math.atan2(r[1], r[0]), 10) : 0, this.viewRotation_ = i, this.squaredTolerance_ = a, this.userTransform_ = o, this.contextFillState_ = null, this.contextStrokeState_ = null, this.contextTextState_ = null, this.fillState_ = null, this.strokeState_ = null, this.image_ = null, this.imageAnchorX_ = 0, this.imageAnchorY_ = 0, this.imageHeight_ = 0, this.imageOpacity_ = 0, this.imageOriginX_ = 0, this.imageOriginY_ = 0, this.imageRotateWithView_ = !1, this.imageRotation_ = 0, this.imageScale_ = [0, 0], this.imageWidth_ = 0, this.text_ = "", this.textOffsetX_ = 0, this.textOffsetY_ = 0, this.textRotateWithView_ = !1, this.textRotation_ = 0, this.textScale_ = [0, 0], this.textFillState_ = null, this.textStrokeState_ = null, this.textState_ = null, this.pixelCoordinates_ = [], this.tmpLocalTransform_ = Fs();
	}
	drawImages_(e, t, n, r) {
		if (!this.image_) return;
		let i = Xs(e, t, n, r, this.transform_, this.pixelCoordinates_), a = this.context_, o = this.tmpLocalTransform_, s = a.globalAlpha;
		this.imageOpacity_ != 1 && (a.globalAlpha = s * this.imageOpacity_);
		let c = this.imageRotation_;
		this.transformRotation_ === 0 && (c -= this.viewRotation_), this.imageRotateWithView_ && (c += this.viewRotation_);
		for (let e = 0, t = i.length; e < t; e += 2) {
			let t = i[e] - this.imageAnchorX_, n = i[e + 1] - this.imageAnchorY_;
			if (c !== 0 || this.imageScale_[0] != 1 || this.imageScale_[1] != 1) {
				let e = t + this.imageAnchorX_, r = n + this.imageAnchorY_;
				Us(o, e, r, 1, 1, c, -e, -r), a.save(), a.transform.apply(a, o), a.translate(e, r), a.scale(this.imageScale_[0], this.imageScale_[1]), a.drawImage(this.image_, this.imageOriginX_, this.imageOriginY_, this.imageWidth_, this.imageHeight_, -this.imageAnchorX_, -this.imageAnchorY_, this.imageWidth_, this.imageHeight_), a.restore();
			} else a.drawImage(this.image_, this.imageOriginX_, this.imageOriginY_, this.imageWidth_, this.imageHeight_, t, n, this.imageWidth_, this.imageHeight_);
		}
		this.imageOpacity_ != 1 && (a.globalAlpha = s);
	}
	drawText_(e, t, n, r) {
		if (!this.textState_ || this.text_ === "") return;
		this.textFillState_ && this.setContextFillState_(this.textFillState_), this.textStrokeState_ && this.setContextStrokeState_(this.textStrokeState_), this.setContextTextState_(this.textState_);
		let i = Xs(e, t, n, r, this.transform_, this.pixelCoordinates_), a = this.context_, o = this.textRotation_;
		for (this.transformRotation_ === 0 && (o -= this.viewRotation_), this.textRotateWithView_ && (o += this.viewRotation_); t < n; t += r) {
			let e = i[t] + this.textOffsetX_, n = i[t + 1] + this.textOffsetY_;
			o !== 0 || this.textScale_[0] != 1 || this.textScale_[1] != 1 ? (a.save(), a.translate(e - this.textOffsetX_, n - this.textOffsetY_), a.rotate(o), a.translate(this.textOffsetX_, this.textOffsetY_), a.scale(this.textScale_[0], this.textScale_[1]), this.textStrokeState_ && a.strokeText(this.text_, 0, 0), this.textFillState_ && a.fillText(this.text_, 0, 0), a.restore()) : (this.textStrokeState_ && a.strokeText(this.text_, e, n), this.textFillState_ && a.fillText(this.text_, e, n));
		}
	}
	moveToLineTo_(e, t, n, r, i, a) {
		let o = this.context_, s = Xs(e, t, n, r, this.transform_, this.pixelCoordinates_);
		if (Math.abs(a) > 0) {
			let e = s.length, t = i || Math.abs(s[0] - s[e - 2]) < 1e-6 && Math.abs(s[1] - s[e - 1]) < 1e-6;
			s = _m(s, 0, e, 2, a, t, s), ym(s, 2, t);
		}
		o.moveTo(s[0], s[1]);
		let c = s.length;
		i && (c -= 2);
		for (let e = 2; e < c; e += 2) o.lineTo(s[e], s[e + 1]);
		return i && o.closePath(), n;
	}
	drawRings_(e, t, n, r, i) {
		for (let a = 0, o = n.length; a < o; ++a) t = this.moveToLineTo_(e, t, n[a], r, !0, i);
		return t;
	}
	drawCircle(e) {
		if (this.squaredTolerance_ && (e = e.simplifyTransformed(this.squaredTolerance_, this.userTransform_)), ja(this.extent_, e.getExtent())) {
			if (this.fillState_ || this.strokeState_) {
				this.fillState_ && this.setContextFillState_(this.fillState_), this.strokeState_ && this.setContextStrokeState_(this.strokeState_);
				let t = oc(e, this.transform_, this.pixelCoordinates_), n = t[2] - t[0], r = t[3] - t[1], i = Math.sqrt(n * n + r * r), a = this.context_;
				a.beginPath(), a.arc(t[0], t[1], i, 0, 2 * Math.PI), this.fillState_ && a.fill(), this.strokeState_ && a.stroke();
			}
			this.text_ !== "" && this.drawText_(e.getCenter(), 0, 2, 2);
		}
	}
	setStyle(e) {
		this.setFillStrokeStyle(e.getFill(), e.getStroke()), this.setImageStyle(e.getImage()), this.setTextStyle(e.getText());
	}
	setTransform(e) {
		this.transform_ = e;
	}
	drawGeometry(e) {
		switch (e.getType()) {
			case "Point":
				this.drawPoint(e);
				break;
			case "LineString":
				this.drawLineString(e);
				break;
			case "Polygon":
				this.drawPolygon(e);
				break;
			case "MultiPoint":
				this.drawMultiPoint(e);
				break;
			case "MultiLineString":
				this.drawMultiLineString(e);
				break;
			case "MultiPolygon":
				this.drawMultiPolygon(e);
				break;
			case "GeometryCollection":
				this.drawGeometryCollection(e);
				break;
			case "Circle": this.drawCircle(e);
		}
	}
	drawFeature(e, t) {
		let n = t.getGeometryFunction()(e);
		n && (this.setStyle(t), this.drawGeometry(n));
	}
	drawGeometryCollection(e) {
		let t = e.getGeometriesArray();
		for (let e = 0, n = t.length; e < n; ++e) this.drawGeometry(t[e]);
	}
	drawPoint(e) {
		this.squaredTolerance_ && (e = e.simplifyTransformed(this.squaredTolerance_, this.userTransform_));
		let t = e.getFlatCoordinates(), n = e.getStride();
		this.image_ && this.drawImages_(t, 0, t.length, n), this.text_ !== "" && this.drawText_(t, 0, t.length, n);
	}
	drawMultiPoint(e) {
		this.squaredTolerance_ && (e = e.simplifyTransformed(this.squaredTolerance_, this.userTransform_));
		let t = e.getFlatCoordinates(), n = e.getStride();
		this.image_ && this.drawImages_(t, 0, t.length, n), this.text_ !== "" && this.drawText_(t, 0, t.length, n);
	}
	drawLineString(e) {
		if (this.squaredTolerance_ && (e = e.simplifyTransformed(this.squaredTolerance_, this.userTransform_)), ja(this.extent_, e.getExtent())) {
			if (this.strokeState_) {
				this.setContextStrokeState_(this.strokeState_);
				let t = this.context_, n = e.getFlatCoordinates();
				t.beginPath(), this.moveToLineTo_(n, 0, n.length, e.getStride(), !1, this.strokeState_.strokeOffset), t.stroke();
			}
			if (this.text_ !== "") {
				let t = e.getFlatMidpoint();
				this.drawText_(t, 0, 2, 2);
			}
		}
	}
	drawMultiLineString(e) {
		this.squaredTolerance_ && (e = e.simplifyTransformed(this.squaredTolerance_, this.userTransform_));
		let t = e.getExtent();
		if (ja(this.extent_, t)) {
			if (this.strokeState_) {
				this.setContextStrokeState_(this.strokeState_);
				let t = this.context_, n = e.getFlatCoordinates(), r = 0, i = e.getEnds(), a = e.getStride();
				t.beginPath();
				for (let e = 0, t = i.length; e < t; ++e) r = this.moveToLineTo_(n, r, i[e], a, !1, this.strokeState_.strokeOffset);
				t.stroke();
			}
			if (this.text_ !== "") {
				let t = e.getFlatMidpoints();
				this.drawText_(t, 0, t.length, 2);
			}
		}
	}
	drawPolygon(e) {
		if (this.squaredTolerance_ && (e = e.simplifyTransformed(this.squaredTolerance_, this.userTransform_)), ja(this.extent_, e.getExtent())) {
			if (this.strokeState_ || this.fillState_) {
				this.fillState_ && this.setContextFillState_(this.fillState_), this.strokeState_ && this.setContextStrokeState_(this.strokeState_);
				let t = this.context_;
				t.beginPath(), this.drawRings_(e.getOrientedFlatCoordinates(), 0, e.getEnds(), e.getStride(), this.strokeState_?.strokeOffset), this.fillState_ && t.fill(), this.strokeState_ && t.stroke();
			}
			if (this.text_ !== "") {
				let t = e.getFlatInteriorPoint();
				this.drawText_(t, 0, 2, 2);
			}
		}
	}
	drawMultiPolygon(e) {
		if (this.squaredTolerance_ && (e = e.simplifyTransformed(this.squaredTolerance_, this.userTransform_)), ja(this.extent_, e.getExtent())) {
			if (this.strokeState_ || this.fillState_) {
				this.fillState_ && this.setContextFillState_(this.fillState_), this.strokeState_ && this.setContextStrokeState_(this.strokeState_);
				let t = this.context_, n = e.getOrientedFlatCoordinates(), r = 0, i = e.getEndss(), a = e.getStride();
				t.beginPath();
				for (let e = 0, t = i.length; e < t; ++e) {
					let t = i[e];
					r = this.drawRings_(n, r, t, a, this.strokeState_?.strokeOffset);
				}
				this.fillState_ && t.fill(), this.strokeState_ && t.stroke();
			}
			if (this.text_ !== "") {
				let t = e.getFlatInteriorPoints();
				this.drawText_(t, 0, t.length, 2);
			}
		}
	}
	setContextFillState_(e) {
		let t = this.context_, n = this.contextFillState_;
		n ? n.fillStyle != e.fillStyle && (n.fillStyle = e.fillStyle, t.fillStyle = e.fillStyle) : (t.fillStyle = e.fillStyle, this.contextFillState_ = { fillStyle: e.fillStyle });
	}
	setContextStrokeState_(e) {
		let t = this.context_, n = this.contextStrokeState_;
		n ? (n.lineCap != e.lineCap && (n.lineCap = e.lineCap, t.lineCap = e.lineCap), ti(n.lineDash, e.lineDash) || t.setLineDash(n.lineDash = e.lineDash), n.lineDashOffset != e.lineDashOffset && (n.lineDashOffset = e.lineDashOffset, t.lineDashOffset = e.lineDashOffset), n.lineJoin != e.lineJoin && (n.lineJoin = e.lineJoin, t.lineJoin = e.lineJoin), n.lineWidth != e.lineWidth && (n.lineWidth = e.lineWidth, t.lineWidth = e.lineWidth), n.miterLimit != e.miterLimit && (n.miterLimit = e.miterLimit, t.miterLimit = e.miterLimit), n.strokeStyle != e.strokeStyle && (n.strokeStyle = e.strokeStyle, t.strokeStyle = e.strokeStyle)) : (t.lineCap = e.lineCap, t.setLineDash(e.lineDash), t.lineDashOffset = e.lineDashOffset, t.lineJoin = e.lineJoin, t.lineWidth = e.lineWidth, t.miterLimit = e.miterLimit, t.strokeStyle = e.strokeStyle, this.contextStrokeState_ = {
			lineCap: e.lineCap,
			lineDash: e.lineDash,
			lineDashOffset: e.lineDashOffset,
			lineJoin: e.lineJoin,
			lineWidth: e.lineWidth,
			miterLimit: e.miterLimit,
			strokeStyle: e.strokeStyle
		});
	}
	setContextTextState_(e) {
		let t = this.context_, n = this.contextTextState_, r = e.textAlign ? e.textAlign : Bf;
		n ? (n.font != e.font && (n.font = e.font, t.font = e.font), n.textAlign != r && (n.textAlign = r, t.textAlign = r), n.textBaseline != e.textBaseline && (n.textBaseline = e.textBaseline, t.textBaseline = e.textBaseline)) : (t.font = e.font, t.textAlign = r, t.textBaseline = e.textBaseline, this.contextTextState_ = {
			font: e.font,
			textAlign: r,
			textBaseline: e.textBaseline
		});
	}
	setFillStrokeStyle(e, t) {
		if (!e) this.fillState_ = null;
		else {
			let t = e.getColor();
			this.fillState_ = { fillStyle: Mf(t || Ff) };
		}
		if (!t) this.strokeState_ = null;
		else {
			let e = t.getColor(), n = t.getLineCap(), r = t.getLineDash(), i = t.getLineDashOffset(), a = t.getLineJoin(), o = t.getWidth(), s = t.getMiterLimit(), c = r || Lf, l = t.getOffset();
			this.strokeState_ = {
				lineCap: n === void 0 ? If : n,
				lineDash: this.pixelRatio_ === 1 ? c : c.map((e) => e * this.pixelRatio_),
				lineDashOffset: (i || 0) * this.pixelRatio_,
				lineJoin: a === void 0 ? Rf : a,
				lineWidth: (o === void 0 ? 1 : o) * this.pixelRatio_,
				miterLimit: s === void 0 ? 10 : s,
				strokeStyle: Mf(e || zf),
				strokeOffset: (l ?? 0) * this.pixelRatio_
			};
		}
	}
	setImageStyle(e) {
		let t;
		if (!e || !(t = e.getSize())) {
			this.image_ = null;
			return;
		}
		let n = e.getPixelRatio(this.pixelRatio_), r = e.getAnchor(), i = e.getOrigin();
		this.image_ = e.getImage(this.pixelRatio_), this.imageAnchorX_ = r[0] * n, this.imageAnchorY_ = r[1] * n, this.imageHeight_ = t[1] * n, this.imageOpacity_ = e.getOpacity(), this.imageOriginX_ = i[0], this.imageOriginY_ = i[1], this.imageRotateWithView_ = e.getRotateWithView(), this.imageRotation_ = e.getRotation();
		let a = e.getScaleArray();
		this.imageScale_ = [a[0] * this.pixelRatio_ / n, a[1] * this.pixelRatio_ / n], this.imageWidth_ = t[0] * n;
	}
	setTextStyle(e) {
		if (!e) this.text_ = "";
		else {
			let t = e.getFill();
			if (!t) this.textFillState_ = null;
			else {
				let e = t.getColor();
				this.textFillState_ = { fillStyle: Mf(e || Ff) };
			}
			let n = e.getStroke();
			if (!n) this.textStrokeState_ = null;
			else {
				let e = n.getColor(), t = n.getLineCap(), r = n.getLineDash(), i = n.getLineDashOffset(), a = n.getLineJoin(), o = n.getWidth(), s = n.getMiterLimit();
				this.textStrokeState_ = {
					lineCap: t === void 0 ? If : t,
					lineDash: r || Lf,
					lineDashOffset: i || 0,
					lineJoin: a === void 0 ? Rf : a,
					lineWidth: o === void 0 ? 1 : o,
					miterLimit: s === void 0 ? 10 : s,
					strokeStyle: Mf(e || zf)
				};
			}
			let r = e.getFont(), i = e.getOffsetX(), a = e.getOffsetY(), o = e.getRotateWithView(), s = e.getRotation(), c = e.getScaleArray(), l = e.getText(), u = e.getTextAlign(), d = e.getTextBaseline();
			this.textState_ = {
				font: r === void 0 ? Pf : r,
				textAlign: u === void 0 ? Bf : u,
				textBaseline: d === void 0 ? Vf : d
			}, this.text_ = l === void 0 ? "" : Array.isArray(l) ? l.reduce((e, t, n) => e += n % 2 ? " " : t, "") : l, this.textOffsetX_ = i === void 0 ? 0 : this.pixelRatio_ * i, this.textOffsetY_ = a === void 0 ? 0 : this.pixelRatio_ * a, this.textRotateWithView_ = o !== void 0 && o, this.textRotation_ = s === void 0 ? 0 : s, this.textScale_ = [this.pixelRatio_ * c[0], this.pixelRatio_ * c[1]];
		}
	}
}, Sm = .5, Cm = {
	Point: Fm,
	LineString: Mm,
	Polygon: Lm,
	MultiPoint: Im,
	MultiLineString: Nm,
	MultiPolygon: Pm,
	GeometryCollection: jm,
	Circle: Dm
};
function wm(e, t) {
	return parseInt(z(e), 10) - parseInt(z(t), 10);
}
function Tm(e, t) {
	let n = Em(e, t);
	return n * n;
}
function Em(e, t) {
	return Sm * e / t;
}
function Dm(e, t, n, r, i) {
	let a = n.getFill(), o = n.getStroke();
	if (a || o) {
		let s = e.getBuilder(n.getZIndex(), "Circle");
		s.setFillStrokeStyle(a, o), s.drawCircle(t, r, i);
	}
	let s = n.getText();
	if (s && s.getText()) {
		let a = e.getBuilder(n.getZIndex(), "Text");
		a.setTextStyle(s), a.drawText(t, r, i);
	}
}
function Om(e, t, n, r, i, a, o, s) {
	let c = [], l = n.getImage();
	if (l) {
		let e = !0, t = l.getImageState();
		t == q.LOADED || t == q.ERROR ? e = !1 : t == q.IDLE && l.load(), e && c.push(l.ready());
	}
	let u = n.getFill();
	u && u.loading() && c.push(u.ready());
	let d = c.length > 0;
	return d && Promise.all(c).then(() => i(null)), km(e, t, n, r, a, o, s), d;
}
function km(e, t, n, r, i, a, o) {
	let s = n.getGeometryFunction()(t);
	if (!s) return;
	let c = s.simplifyTransformed(r, i);
	if (n.getRenderer()) Am(e, c, n, t, o);
	else {
		let r = Cm[c.getType()];
		r(e, c, n, t, o, a);
	}
}
function Am(e, t, n, r, i) {
	if (t.getType() == "GeometryCollection") {
		let a = t.getGeometries();
		for (let t = 0, o = a.length; t < o; ++t) Am(e, a[t], n, r, i);
		return;
	}
	e.getBuilder(n.getZIndex(), "Default").drawCustom(t, r, n.getRenderer(), n.getHitDetectionRenderer(), i);
}
function jm(e, t, n, r, i, a) {
	let o = t.getGeometriesArray(), s, c;
	for (s = 0, c = o.length; s < c; ++s) {
		let t = Cm[o[s].getType()];
		t(e, o[s], n, r, i, a);
	}
}
function Mm(e, t, n, r, i) {
	let a = n.getStroke();
	if (a) {
		let o = e.getBuilder(n.getZIndex(), "LineString");
		o.setFillStrokeStyle(null, a), o.drawLineString(t, r, i);
	}
	let o = n.getText();
	if (o && o.getText()) {
		let a = e.getBuilder(n.getZIndex(), "Text");
		a.setTextStyle(o), a.drawText(t, r, i);
	}
}
function Nm(e, t, n, r, i) {
	let a = n.getStroke();
	if (a) {
		let o = e.getBuilder(n.getZIndex(), "LineString");
		o.setFillStrokeStyle(null, a), o.drawMultiLineString(t, r, i);
	}
	let o = n.getText();
	if (o && o.getText()) {
		let a = e.getBuilder(n.getZIndex(), "Text");
		a.setTextStyle(o), a.drawText(t, r, i);
	}
}
function Pm(e, t, n, r, i) {
	let a = n.getFill(), o = n.getStroke();
	if (o || a) {
		let s = e.getBuilder(n.getZIndex(), "Polygon");
		s.setFillStrokeStyle(a, o), s.drawMultiPolygon(t, r, i);
	}
	let s = n.getText();
	if (s && s.getText()) {
		let a = e.getBuilder(n.getZIndex(), "Text");
		a.setTextStyle(s), a.drawText(t, r, i);
	}
}
function Fm(e, t, n, r, i, a) {
	let o = n.getImage(), s = n.getText(), c = s && s.getText(), l = a && o && c ? {} : void 0;
	if (o) {
		if (o.getImageState() != q.LOADED) return;
		let a = e.getBuilder(n.getZIndex(), "Image");
		a.setImageStyle(o, l), a.drawPoint(t, r, i);
	}
	if (c) {
		let a = e.getBuilder(n.getZIndex(), "Text");
		a.setTextStyle(s, l), a.drawText(t, r, i);
	}
}
function Im(e, t, n, r, i, a) {
	let o = n.getImage(), s = o && o.getOpacity() !== 0, c = n.getText(), l = c && c.getText(), u = a && s && l ? {} : void 0;
	if (s) {
		if (o.getImageState() != q.LOADED) return;
		let a = e.getBuilder(n.getZIndex(), "Image");
		a.setImageStyle(o, u), a.drawMultiPoint(t, r, i);
	}
	if (l) {
		let a = e.getBuilder(n.getZIndex(), "Text");
		a.setTextStyle(c, u), a.drawText(t, r, i);
	}
}
function Lm(e, t, n, r, i) {
	let a = n.getFill(), o = n.getStroke();
	if (a || o) {
		let s = e.getBuilder(n.getZIndex(), "Polygon");
		s.setFillStrokeStyle(a, o), s.drawPolygon(t, r, i);
	}
	let s = n.getText();
	if (s && s.getText()) {
		let a = e.getBuilder(n.getZIndex(), "Text");
		a.setTextStyle(s), a.drawText(t, r, i);
	}
}
//#endregion
//#region node_modules/ol/featureloader.js
var Rm = !1;
function zm(e, t, n, r, i, a, o) {
	let s = new XMLHttpRequest();
	s.open("GET", typeof e == "function" ? e(n, r, i) : e, !0), t.getType() == "arraybuffer" && (s.responseType = "arraybuffer"), s.withCredentials = Rm, s.onload = function(e) {
		if (!s.status || s.status >= 200 && s.status < 300) {
			let e = t.getType();
			try {
				let r;
				e == "text" || e == "json" ? r = s.responseText : e == "xml" ? r = s.responseXML || s.responseText : e == "arraybuffer" && (r = s.response), r ? a(t.readFeatures(r, {
					extent: n,
					featureProjection: i
				}), t.readProjection(r)) : o();
			} catch {
				o();
			}
		} else o();
	}, s.onerror = o, s.send();
}
function Bm(e, t) {
	return function(n, r, i, a, o) {
		zm(e, t, n, r, i, (e, t) => {
			this.addFeatures(e), a !== void 0 && a(e);
		}, () => {
			this.changed(), o !== void 0 && o();
		});
	};
}
//#endregion
//#region node_modules/ol/loadingstrategy.js
function Vm(e, t) {
	return [[
		-Infinity,
		-Infinity,
		Infinity,
		Infinity
	]];
}
function Hm(e, t) {
	return [e];
}
//#endregion
//#region node_modules/ol/geom/MultiLineString.js
var Um = class e extends rc {
	constructor(e, t, n) {
		if (super(), this.ends_ = [], this.maxDelta_ = -1, this.maxDeltaRevision_ = -1, Array.isArray(e[0])) this.setCoordinates(e, t);
		else if (t !== void 0 && n) this.setFlatCoordinates(t, e), this.ends_ = n;
		else {
			let t = e, n = [], r = [];
			for (let e = 0, i = t.length; e < i; ++e) {
				let i = t[e];
				ei(n, i.getFlatCoordinates()), r.push(n.length);
			}
			let i = t.length === 0 ? this.getLayout() : t[0].getLayout();
			this.setFlatCoordinates(i, n), this.ends_ = r;
		}
	}
	appendLineString(e) {
		ei(this.flatCoordinates, e.getFlatCoordinates().slice()), this.ends_.push(this.flatCoordinates.length), this.changed();
	}
	clone() {
		let t = new e(this.flatCoordinates.slice(), this.layout, this.ends_.slice());
		return t.applyProperties(this), t;
	}
	closestPointXY(e, t, n, r) {
		return r < ra(this.getExtent(), e, t) ? r : (this.maxDeltaRevision_ != this.getRevision() && (this.maxDelta_ = Math.sqrt(fc(this.flatCoordinates, 0, this.ends_, this.stride, 0)), this.maxDeltaRevision_ = this.getRevision()), hc(this.flatCoordinates, 0, this.ends_, this.stride, this.maxDelta_, !1, e, t, n, r));
	}
	getCoordinateAtM(e, t, n) {
		return this.layout != "XYM" && this.layout != "XYZM" || this.flatCoordinates.length === 0 ? null : (t = t !== void 0 && t, n = n !== void 0 && n, mm(this.flatCoordinates, 0, this.ends_, this.stride, e, t, n));
	}
	getCoordinates() {
		return Sc(this.flatCoordinates, 0, this.ends_, this.stride);
	}
	getEnds() {
		return this.ends_;
	}
	getLineString(e) {
		return e < 0 || this.ends_.length <= e ? null : new gm(this.flatCoordinates.slice(e === 0 ? 0 : this.ends_[e - 1], this.ends_[e]), this.layout);
	}
	getLineStrings() {
		let e = this.flatCoordinates, t = this.ends_, n = this.layout, r = [], i = 0;
		for (let a = 0, o = t.length; a < o; ++a) {
			let o = t[a], s = new gm(e.slice(i, o), n);
			r.push(s), i = o;
		}
		return r;
	}
	getLength() {
		let e = this.ends_, t = 0, n = 0;
		for (let r = 0, i = e.length; r < i; ++r) n += hm(this.flatCoordinates, t, e[r], this.stride), t = e[r];
		return n;
	}
	getFlatMidpoints() {
		let e = [], t = this.flatCoordinates, n = 0, r = this.ends_, i = this.stride;
		for (let a = 0, o = r.length; a < o; ++a) {
			let o = r[a];
			ei(e, fm(t, n, o, i, .5)), n = o;
		}
		return e;
	}
	getSimplifiedGeometryInternal(t) {
		let n = [], r = [];
		return n.length = Fc(this.flatCoordinates, 0, this.ends_, this.stride, t, n, 0, r), new e(n, "XY", r);
	}
	getType() {
		return "MultiLineString";
	}
	intersectsExtent(e) {
		return Ac(this.flatCoordinates, 0, this.ends_, this.stride, e);
	}
	setCoordinates(e, t) {
		this.setLayout(t, e, 2), this.flatCoordinates ||= [];
		let n = yc(this.flatCoordinates, 0, e, this.stride, this.ends_);
		this.flatCoordinates.length = n.length === 0 ? 0 : n[n.length - 1], this.changed();
	}
}, Wm = class e extends rc {
	constructor(e, t) {
		super(), t && !Array.isArray(e[0]) ? this.setFlatCoordinates(t, e) : this.setCoordinates(e, t);
	}
	appendPoint(e) {
		ei(this.flatCoordinates, e.getFlatCoordinates()), this.changed();
	}
	clone() {
		let t = new e(this.flatCoordinates.slice(), this.layout);
		return t.applyProperties(this), t;
	}
	closestPointXY(e, t, n, r) {
		if (r < ra(this.getExtent(), e, t)) return r;
		let i = this.flatCoordinates, a = this.stride;
		for (let o = 0, s = i.length; o < s; o += a) {
			let s = Bi(e, t, i[o], i[o + 1]);
			if (s < r) {
				r = s;
				for (let e = 0; e < a; ++e) n[e] = i[o + e];
				n.length = a;
			}
		}
		return r;
	}
	getCoordinates() {
		return xc(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
	}
	getPoint(e) {
		let t = this.flatCoordinates.length / this.stride;
		return e < 0 || t <= e ? null : new Vc(this.flatCoordinates.slice(e * this.stride, (e + 1) * this.stride), this.layout);
	}
	getPoints() {
		let e = this.flatCoordinates, t = this.layout, n = this.stride, r = [];
		for (let i = 0, a = e.length; i < a; i += n) {
			let a = new Vc(e.slice(i, i + n), t);
			r.push(a);
		}
		return r;
	}
	getType() {
		return "MultiPoint";
	}
	intersectsExtent(e) {
		let t = this.flatCoordinates, n = this.stride;
		for (let r = 0, i = t.length; r < i; r += n) {
			let n = t[r], i = t[r + 1];
			if (oa(e, n, i)) return !0;
		}
		return !1;
	}
	setCoordinates(e, t) {
		this.setLayout(t, e, 1), this.flatCoordinates ||= [], this.flatCoordinates.length = vc(this.flatCoordinates, 0, e, this.stride), this.changed();
	}
};
//#endregion
//#region node_modules/ol/geom/flat/center.js
function Gm(e, t, n, r) {
	let i = [], a = ca();
	for (let o = 0, s = n.length; o < s; ++o) {
		let s = n[o];
		a = fa(e, t, s[0], r), i.push((a[0] + a[2]) / 2, (a[1] + a[3]) / 2), t = s[s.length - 1];
	}
	return i;
}
//#endregion
//#region node_modules/ol/geom/MultiPolygon.js
var Km = class e extends rc {
	constructor(e, t, n) {
		if (super(), this.endss_ = [], this.flatInteriorPointsRevision_ = -1, this.flatInteriorPoints_ = null, this.maxDelta_ = -1, this.maxDeltaRevision_ = -1, this.orientedRevision_ = -1, this.orientedFlatCoordinates_ = null, !n && !Array.isArray(e[0])) {
			let r = e, i = [], a = [];
			for (let e = 0, t = r.length; e < t; ++e) {
				let t = r[e], n = i.length, o = t.getEnds();
				for (let e = 0, t = o.length; e < t; ++e) o[e] += n;
				ei(i, t.getFlatCoordinates()), a.push(o);
			}
			t = r.length === 0 ? this.getLayout() : r[0].getLayout(), e = i, n = a;
		}
		t !== void 0 && n ? (this.setFlatCoordinates(t, e), this.endss_ = n) : this.setCoordinates(e, t);
	}
	appendPolygon(e) {
		let t;
		if (!this.flatCoordinates) this.flatCoordinates = e.getFlatCoordinates().slice(), t = e.getEnds().slice(), this.endss_.push();
		else {
			let n = this.flatCoordinates.length;
			ei(this.flatCoordinates, e.getFlatCoordinates()), t = e.getEnds().slice();
			for (let e = 0, r = t.length; e < r; ++e) t[e] += n;
		}
		this.endss_.push(t), this.changed();
	}
	clone() {
		let t = this.endss_.length, n = Array(t);
		for (let e = 0; e < t; ++e) n[e] = this.endss_[e].slice();
		let r = new e(this.flatCoordinates.slice(), this.layout, n);
		return r.applyProperties(this), r;
	}
	closestPointXY(e, t, n, r) {
		return r < ra(this.getExtent(), e, t) ? r : (this.maxDeltaRevision_ != this.getRevision() && (this.maxDelta_ = Math.sqrt(pc(this.flatCoordinates, 0, this.endss_, this.stride, 0)), this.maxDeltaRevision_ = this.getRevision()), gc(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, this.maxDelta_, !0, e, t, n, r));
	}
	containsXY(e, t) {
		return Dc(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, e, t);
	}
	getArea() {
		return lc(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride);
	}
	getCoordinates(e) {
		let t;
		return e === void 0 ? t = this.flatCoordinates : (t = this.getOrientedFlatCoordinates().slice(), Yc(t, 0, this.endss_, this.stride, e)), Cc(t, 0, this.endss_, this.stride);
	}
	getEndss() {
		return this.endss_;
	}
	getFlatInteriorPoints() {
		if (this.flatInteriorPointsRevision_ != this.getRevision()) {
			let e = Gm(this.flatCoordinates, 0, this.endss_, this.stride);
			this.flatInteriorPoints_ = Uc(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, e), this.flatInteriorPointsRevision_ = this.getRevision();
		}
		return this.flatInteriorPoints_;
	}
	getInteriorPoints() {
		return new Wm(this.getFlatInteriorPoints().slice(), "XYM");
	}
	getOrientedFlatCoordinates() {
		if (this.orientedRevision_ != this.getRevision()) {
			let e = this.flatCoordinates;
			qc(e, 0, this.endss_, this.stride) ? this.orientedFlatCoordinates_ = e : (this.orientedFlatCoordinates_ = e.slice(), this.orientedFlatCoordinates_.length = Yc(this.orientedFlatCoordinates_, 0, this.endss_, this.stride)), this.orientedRevision_ = this.getRevision();
		}
		return this.orientedFlatCoordinates_;
	}
	getSimplifiedGeometryInternal(t) {
		let n = [], r = [];
		return n.length = zc(this.flatCoordinates, 0, this.endss_, this.stride, Math.sqrt(t), n, 0, r), new e(n, "XY", r);
	}
	getPolygon(e) {
		if (e < 0 || this.endss_.length <= e) return null;
		let t;
		if (e === 0) t = 0;
		else {
			let n = this.endss_[e - 1];
			t = n[n.length - 1];
		}
		let n = this.endss_[e].slice(), r = n[n.length - 1];
		if (t !== 0) for (let e = 0, r = n.length; e < r; ++e) n[e] -= t;
		return new Zc(this.flatCoordinates.slice(t, r), this.layout, n);
	}
	getPolygons() {
		let e = this.layout, t = this.flatCoordinates, n = this.endss_, r = [], i = 0;
		for (let a = 0, o = n.length; a < o; ++a) {
			let o = n[a].slice(), s = o[o.length - 1];
			if (i !== 0) for (let e = 0, t = o.length; e < t; ++e) o[e] -= i;
			let c = new Zc(t.slice(i, s), e, o);
			r.push(c), i = s;
		}
		return r;
	}
	getType() {
		return "MultiPolygon";
	}
	intersectsExtent(e) {
		return Nc(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, e);
	}
	setCoordinates(e, t) {
		this.setLayout(t, e, 3), this.flatCoordinates ||= [];
		let n = bc(this.flatCoordinates, 0, e, this.stride, this.endss_);
		if (n.length === 0) this.flatCoordinates.length = 0;
		else {
			let e = n[n.length - 1];
			this.flatCoordinates.length = e.length === 0 ? 0 : e[e.length - 1];
		}
		this.changed();
	}
}, qm = Fs(), Jm = class e {
	constructor(e, t, n, r, i, a) {
		this.styleFunction, this.extent_, this.id_ = a, this.type_ = e, this.flatCoordinates_ = t, this.flatInteriorPoints_ = null, this.flatMidpoints_ = null, this.ends_ = n || null, this.properties_ = i, this.squaredTolerance_, this.stride_ = r, this.simplifiedGeometry_;
	}
	get(e) {
		return this.properties_[e];
	}
	getExtent() {
		return this.extent_ ||= this.type_ === "Point" ? da(this.flatCoordinates_) : fa(this.flatCoordinates_, 0, this.flatCoordinates_.length, this.stride_), this.extent_;
	}
	getFlatInteriorPoint() {
		if (!this.flatInteriorPoints_) {
			let e = Sa(this.getExtent());
			this.flatInteriorPoints_ = Hc(this.flatCoordinates_, 0, this.ends_, this.stride_, e, 0);
		}
		return this.flatInteriorPoints_;
	}
	getFlatInteriorPoints() {
		if (!this.flatInteriorPoints_) {
			let e = Xc(this.flatCoordinates_, this.ends_), t = Gm(this.flatCoordinates_, 0, e, this.stride_);
			this.flatInteriorPoints_ = Uc(this.flatCoordinates_, 0, e, this.stride_, t);
		}
		return this.flatInteriorPoints_;
	}
	getFlatMidpoint() {
		return this.flatMidpoints_ ||= fm(this.flatCoordinates_, 0, this.flatCoordinates_.length, this.stride_, .5), this.flatMidpoints_;
	}
	getFlatMidpoints() {
		if (!this.flatMidpoints_) {
			this.flatMidpoints_ = [];
			let e = this.flatCoordinates_, t = 0, n = this.ends_;
			for (let r = 0, i = n.length; r < i; ++r) {
				let i = n[r], a = fm(e, t, i, this.stride_, .5);
				ei(this.flatMidpoints_, a), t = i;
			}
		}
		return this.flatMidpoints_;
	}
	getId() {
		return this.id_;
	}
	getOrientedFlatCoordinates() {
		return this.flatCoordinates_;
	}
	getGeometry() {
		return this;
	}
	getSimplifiedGeometry(e) {
		return this;
	}
	simplifyTransformed(e, t) {
		return this;
	}
	getProperties() {
		return this.properties_;
	}
	getPropertiesInternal() {
		return this.properties_;
	}
	getStride() {
		return this.stride_;
	}
	getStyleFunction() {
		return this.styleFunction;
	}
	getType() {
		return this.type_;
	}
	transform(e) {
		e = ds(e);
		let t = e.getExtent(), n = e.getWorldExtent();
		if (t && n) {
			let e = Ea(n) / Ea(t);
			Us(qm, n[0], n[3], e, -e, 0, 0, 0), Xs(this.flatCoordinates_, 0, this.flatCoordinates_.length, this.stride_, qm, this.flatCoordinates_);
		}
	}
	applyTransform(e) {
		e(this.flatCoordinates_, this.flatCoordinates_, this.stride_);
	}
	clone() {
		return new e(this.type_, this.flatCoordinates_.slice(), this.ends_?.slice(), this.stride_, Object.assign({}, this.properties_), this.id_);
	}
	getEnds() {
		return this.ends_;
	}
	enableSimplifyTransformed() {
		return this.simplifyTransformed = oi((t, n) => {
			if (t === this.squaredTolerance_) return this.simplifiedGeometry_;
			this.simplifiedGeometry_ = this.clone(), n && this.simplifiedGeometry_.applyTransform(n);
			let r = this.simplifiedGeometry_.getFlatCoordinates(), i;
			switch (this.type_) {
				case "LineString":
					r.length = Pc(r, 0, this.simplifiedGeometry_.flatCoordinates_.length, this.simplifiedGeometry_.stride_, t, r, 0), i = [r.length];
					break;
				case "MultiLineString":
					i = [], r.length = Fc(r, 0, this.simplifiedGeometry_.ends_, this.simplifiedGeometry_.stride_, t, r, 0, i);
					break;
				case "Polygon": i = [], r.length = Rc(r, 0, this.simplifiedGeometry_.ends_, this.simplifiedGeometry_.stride_, Math.sqrt(t), r, 0, i);
			}
			return i && (this.simplifiedGeometry_ = new e(this.type_, r, i, this.stride_, this.properties_, this.id_)), this.squaredTolerance_ = t, this.simplifiedGeometry_;
		}), this;
	}
};
Jm.prototype.getFlatCoordinates = Jm.prototype.getOrientedFlatCoordinates;
//#endregion
//#region node_modules/ol/structs/RBush.js
var Ym = class {
	constructor(e) {
		this.rbush_ = new Iu(e), this.items_ = {};
	}
	insert(e, t) {
		let n = {
			minX: e[0],
			minY: e[1],
			maxX: e[2],
			maxY: e[3],
			value: t
		};
		this.rbush_.insert(n), this.items_[z(t)] = n;
	}
	load(e, t) {
		let n = Array(t.length);
		for (let r = 0, i = t.length; r < i; r++) {
			let i = e[r], a = t[r], o = {
				minX: i[0],
				minY: i[1],
				maxX: i[2],
				maxY: i[3],
				value: a
			};
			n[r] = o, this.items_[z(a)] = o;
		}
		this.rbush_.load(n);
	}
	remove(e) {
		let t = z(e), n = this.items_[t];
		return delete this.items_[t], this.rbush_.remove(n) !== null;
	}
	update(e, t) {
		let n = this.items_[z(t)];
		pa([
			n.minX,
			n.minY,
			n.maxX,
			n.maxY
		], e) || (this.remove(t), this.insert(e, t));
	}
	getAll() {
		return this.rbush_.all().map(function(e) {
			return e.value;
		});
	}
	getInExtent(e) {
		let t = {
			minX: e[0],
			minY: e[1],
			maxX: e[2],
			maxY: e[3]
		};
		return this.rbush_.search(t).map(function(e) {
			return e.value;
		});
	}
	forEach(e) {
		return this.forEach_(this.getAll(), e);
	}
	forEachInExtent(e, t) {
		return this.forEach_(this.getInExtent(e), t);
	}
	forEach_(e, t) {
		let n;
		for (let r = 0, i = e.length; r < i; r++) if (n = t(e[r]), n) return n;
		return n;
	}
	isEmpty() {
		return Gr(this.items_);
	}
	clear() {
		this.rbush_.clear(), this.items_ = {};
	}
	getExtent(e) {
		let t = this.rbush_.toJSON();
		return la(t.minX, t.minY, t.maxX, t.maxY, e);
	}
	concat(e) {
		this.rbush_.load(e.rbush_.all());
		for (let t in e.items_) this.items_[t] = e.items_[t];
	}
}, Xm = class extends mi {
	constructor(e) {
		super(), this.projection = ds(e.projection), this.attributions_ = Zm(e.attributions), this.attributionsCollapsible_ = e.attributionsCollapsible ?? !0, this.loading = !1, this.state_ = e.state === void 0 ? "ready" : e.state, this.wrapX_ = e.wrapX !== void 0 && e.wrapX, this.interpolate_ = !!e.interpolate, this.viewResolver = null, this.viewRejector = null;
		let t = this;
		this.viewPromise_ = new Promise(function(e, n) {
			t.viewResolver = e, t.viewRejector = n;
		});
	}
	getAttributions() {
		return this.attributions_;
	}
	getAttributionsCollapsible() {
		return this.attributionsCollapsible_;
	}
	getProjection() {
		return this.projection;
	}
	getResolutions(e) {
		return null;
	}
	getView() {
		return this.viewPromise_;
	}
	ready() {
		let e = this.getState();
		return e === "ready" ? Promise.resolve() : e === "error" ? Promise.reject(/* @__PURE__ */ Error("Source failed to load")) : new Promise((e, t) => {
			let n = () => {
				let r = this.getState();
				r === "ready" ? (this.un("change", n), e()) : r === "error" && (this.un("change", n), t(/* @__PURE__ */ Error("Source failed to load")));
			};
			this.on("change", n);
		});
	}
	getState() {
		return this.state_;
	}
	getWrapX() {
		return this.wrapX_;
	}
	getInterpolate() {
		return this.interpolate_;
	}
	refresh() {
		this.changed();
	}
	setAttributions(e) {
		this.attributions_ = Zm(e), this.changed();
	}
	setState(e) {
		this.state_ = e, this.changed();
	}
};
function Zm(e) {
	return e ? typeof e == "function" ? e : (Array.isArray(e) || (e = [e]), (t) => e) : null;
}
//#endregion
//#region node_modules/ol/source/VectorEventType.js
var Qm = {
	ADDFEATURE: "addfeature",
	CHANGEFEATURE: "changefeature",
	CLEAR: "clear",
	REMOVEFEATURE: "removefeature",
	FEATURESLOADSTART: "featuresloadstart",
	FEATURESLOADEND: "featuresloadend",
	FEATURESLOADERROR: "featuresloaderror"
}, $m = class extends ci {
	constructor(e, t, n) {
		super(e), this.feature = t, this.features = n;
	}
}, eh = class extends Xm {
	constructor(e) {
		e ||= {}, super({
			attributions: e.attributions,
			interpolate: !0,
			projection: void 0,
			state: "ready",
			wrapX: e.wrapX === void 0 || e.wrapX
		}), this.on, this.once, this.un, this.loader_ = ai, this.format_ = e.format || null, this.overlaps_ = e.overlaps === void 0 || e.overlaps, this.url_ = e.url, e.loader === void 0 ? this.url_ !== void 0 && (V(this.format_, "`format` must be set when `url` is set"), this.loader_ = Bm(this.url_, this.format_)) : this.loader_ = e.loader, this.strategy_ = e.strategy === void 0 ? Vm : e.strategy;
		let t = e.useSpatialIndex === void 0 || e.useSpatialIndex;
		this.featuresRtree_ = t ? new Ym() : null, this.loadedExtentsRtree_ = new Ym(), this.nullGeometryFeatures_ = {}, this.idIndex_ = {}, this.uidIndex_ = {}, this.featureChangeKeys_ = {}, this.featuresCollection_ = null;
		let n, r;
		Array.isArray(e.features) ? r = e.features : e.features && (n = e.features, r = n.getArray()), !t && n === void 0 && (n = new _i(r)), r !== void 0 && this.addFeaturesInternal(r), n !== void 0 && this.bindFeaturesCollection_(n);
	}
	addFeature(e) {
		this.addFeatureInternal(e), this.changed();
	}
	addFeatureInternal(e) {
		let t = z(e);
		if (!this.addToIndex_(t, e)) {
			this.featuresCollection_ && this.featuresCollection_.remove(e);
			return;
		}
		this.setupChangeEvents_(t, e);
		let n = e.getGeometry();
		if (n) {
			let t = n.getExtent();
			this.featuresRtree_ && this.featuresRtree_.insert(t, e);
		} else this.nullGeometryFeatures_[t] = e;
		this.dispatchEvent(new $m(Qm.ADDFEATURE, e));
	}
	setupChangeEvents_(e, t) {
		t instanceof Jm || (this.featureChangeKeys_[e] = [I(t, L.CHANGE, this.handleFeatureChange_, this), I(t, Ur.PROPERTYCHANGE, this.handleFeatureChange_, this)]);
	}
	addToIndex_(e, t) {
		let n = !0;
		if (t.getId() !== void 0) {
			let e = String(t.getId());
			if (!(e in this.idIndex_)) this.idIndex_[e] = t;
			else if (t instanceof Jm) {
				let r = this.idIndex_[e];
				r instanceof Jm ? Array.isArray(r) ? r.push(t) : this.idIndex_[e] = [r, t] : n = !1;
			} else n = !1;
		}
		return n && (V(!(e in this.uidIndex_), "The passed `feature` was already added to the source"), this.uidIndex_[e] = t), n;
	}
	addFeatures(e) {
		this.addFeaturesInternal(e), this.changed();
	}
	addFeaturesInternal(e) {
		let t = [], n = [], r = [];
		for (let t = 0, r = e.length; t < r; t++) {
			let r = e[t], i = z(r);
			this.addToIndex_(i, r) && n.push(r);
		}
		for (let e = 0, i = n.length; e < i; e++) {
			let i = n[e], a = z(i);
			this.setupChangeEvents_(a, i);
			let o = i.getGeometry();
			if (o) {
				let e = o.getExtent();
				t.push(e), r.push(i);
			} else this.nullGeometryFeatures_[a] = i;
		}
		if (this.featuresRtree_ && this.featuresRtree_.load(t, r), this.hasListener(Qm.ADDFEATURE)) for (let e = 0, t = n.length; e < t; e++) this.dispatchEvent(new $m(Qm.ADDFEATURE, n[e]));
	}
	bindFeaturesCollection_(e) {
		let t = !1;
		this.addEventListener(Qm.ADDFEATURE, function(n) {
			t ||= (t = !0, e.push(n.feature), !1);
		}), this.addEventListener(Qm.REMOVEFEATURE, function(n) {
			t ||= (t = !0, e.remove(n.feature), !1);
		}), e.addEventListener(Hr.ADD, (e) => {
			t ||= (t = !0, this.addFeature(e.element), !1);
		}), e.addEventListener(Hr.REMOVE, (e) => {
			t ||= (t = !0, this.removeFeature(e.element), !1);
		}), this.featuresCollection_ = e;
	}
	clear(e) {
		if (e) {
			for (let e in this.featureChangeKeys_) this.featureChangeKeys_[e].forEach(qr);
			this.featuresCollection_ || (this.featureChangeKeys_ = {}, this.idIndex_ = {}, this.uidIndex_ = {});
		} else if (this.featuresRtree_) {
			this.featuresRtree_.forEach((e) => {
				this.removeFeatureInternal(e);
			});
			for (let e in this.nullGeometryFeatures_) this.removeFeatureInternal(this.nullGeometryFeatures_[e]);
		}
		this.featuresCollection_ && this.featuresCollection_.clear(), this.featuresRtree_ && this.featuresRtree_.clear(), this.nullGeometryFeatures_ = {};
		let t = new $m(Qm.CLEAR);
		this.dispatchEvent(t), this.changed();
	}
	forEachFeature(e) {
		if (this.featuresRtree_) return this.featuresRtree_.forEach(e);
		this.featuresCollection_ && this.featuresCollection_.forEach(e);
	}
	forEachFeatureAtCoordinateDirect(e, t) {
		let n = [
			e[0],
			e[1],
			e[0],
			e[1]
		];
		return this.forEachFeatureInExtent(n, function(n) {
			let r = n.getGeometry();
			if (r instanceof Jm || r.intersectsCoordinate(e)) return t(n);
		});
	}
	forEachFeatureInExtent(e, t) {
		if (this.featuresRtree_) return this.featuresRtree_.forEachInExtent(e, t);
		this.featuresCollection_ && this.featuresCollection_.forEach(t);
	}
	forEachFeatureIntersectingExtent(e, t) {
		return this.forEachFeatureInExtent(e, function(n) {
			let r = n.getGeometry();
			if (r instanceof Jm || r.intersectsExtent(e)) {
				let e = t(n);
				if (e) return e;
			}
		});
	}
	getFeaturesCollection() {
		return this.featuresCollection_;
	}
	getFeatures() {
		let e;
		return this.featuresCollection_ ? e = this.featuresCollection_.getArray().slice(0) : this.featuresRtree_ && (e = this.featuresRtree_.getAll(), Gr(this.nullGeometryFeatures_) || ei(e, Object.values(this.nullGeometryFeatures_))), e;
	}
	getFeaturesAtCoordinate(e) {
		let t = [];
		return this.forEachFeatureAtCoordinateDirect(e, function(e) {
			t.push(e);
		}), t;
	}
	getFeaturesInExtent(e, t) {
		if (this.featuresRtree_) {
			if (!(t && t.canWrapX() && this.getWrapX())) return this.featuresRtree_.getInExtent(e);
			let n = Ra(e, t);
			return [].concat(...n.map((e) => this.featuresRtree_.getInExtent(e)));
		}
		return this.featuresCollection_ ? this.featuresCollection_.getArray().slice(0) : [];
	}
	getClosestFeatureToCoordinate(e, t) {
		let n = e[0], r = e[1], i = null, a = [NaN, NaN], o = Infinity, s = [
			-Infinity,
			-Infinity,
			Infinity,
			Infinity
		];
		return t ||= ri, this.featuresRtree_.forEachInExtent(s, function(e) {
			if (t(e)) {
				let t = e.getGeometry(), c = o;
				if (o = t instanceof Jm ? 0 : t.closestPointXY(n, r, a, o), o < c) {
					i = e;
					let t = Math.sqrt(o);
					s[0] = n - t, s[1] = r - t, s[2] = n + t, s[3] = r + t;
				}
			}
		}), i;
	}
	getExtent(e) {
		return this.featuresRtree_?.getExtent(e) ?? null;
	}
	getFeatureById(e) {
		let t = this.idIndex_[e.toString()];
		return t === void 0 ? null : t;
	}
	getFeatureByUid(e) {
		let t = this.uidIndex_[e];
		return t === void 0 ? null : t;
	}
	getFormat() {
		return this.format_;
	}
	getOverlaps() {
		return this.overlaps_;
	}
	getUrl() {
		return this.url_;
	}
	handleFeatureChange_(e) {
		let t = e.target, n = z(t), r = t.getGeometry();
		if (!r) n in this.nullGeometryFeatures_ || (this.featuresRtree_ && this.featuresRtree_.remove(t), this.nullGeometryFeatures_[n] = t);
		else {
			let e = r.getExtent();
			n in this.nullGeometryFeatures_ ? (delete this.nullGeometryFeatures_[n], this.featuresRtree_ && this.featuresRtree_.insert(e, t)) : this.featuresRtree_ && this.featuresRtree_.update(e, t);
		}
		let i = t.getId();
		if (i !== void 0) {
			let e = i.toString();
			this.idIndex_[e] !== t && (this.removeFromIdIndex_(t), this.idIndex_[e] = t);
		} else this.removeFromIdIndex_(t), this.uidIndex_[n] = t;
		this.changed(), this.dispatchEvent(new $m(Qm.CHANGEFEATURE, t));
	}
	hasFeature(e) {
		let t = e.getId();
		if (t !== void 0) {
			let n = this.idIndex_[String(t)];
			return Array.isArray(n) ? n.includes(e) : n === e;
		}
		return z(e) in this.uidIndex_;
	}
	isEmpty() {
		return this.featuresRtree_ ? this.featuresRtree_.isEmpty() && Gr(this.nullGeometryFeatures_) : !this.featuresCollection_ || this.featuresCollection_.getLength() === 0;
	}
	loadFeatures(e, t, n) {
		let r = this.loadedExtentsRtree_, i = this.strategy_(e, t, n);
		for (let e = 0, a = i.length; e < a; ++e) {
			let a = i[e];
			if (!r.forEachInExtent(a, function(e) {
				return aa(e.extent, a);
			})) {
				this.loading = Number(this.loading) + 1, this.dispatchEvent(new $m(Qm.FEATURESLOADSTART));
				let e = (e) => {
					this.loading = Number(this.loading) - 1, this.dispatchEvent(new $m(Qm.FEATURESLOADEND, void 0, e));
				}, i = () => {
					this.changed(), this.loading = Number(this.loading) - 1, this.dispatchEvent(new $m(Qm.FEATURESLOADERROR));
				}, o = !1, s = this.loader_.call(this, a, t, n, (t) => o || e(t), () => o || i());
				s instanceof Promise ? (o = !0, s.then((t) => {
					this.addFeatures(t), e(t);
				}).catch(i)) : this.loader_.length < 4 && (this.loading = !1), r.insert(a, { extent: a.slice() });
			}
		}
	}
	refresh() {
		this.clear(!0), this.loadedExtentsRtree_.clear(), super.refresh();
	}
	removeLoadedExtent(e) {
		let t = this.loadedExtentsRtree_, n = [];
		t.forEachInExtent(e, function(e) {
			n.push(e);
		}), n.forEach((n) => {
			t.remove(n);
			let r = Oa(n.extent, e);
			for (let e of r) t.insert(e, { extent: e });
		});
	}
	removeFeatures(e) {
		let t = !1;
		for (let n = 0, r = e.length; n < r; ++n) t = this.removeFeatureInternal(e[n]) || t;
		t && this.changed();
	}
	removeFeature(e) {
		e && this.removeFeatureInternal(e) && this.changed();
	}
	removeFeatureInternal(e) {
		let t = z(e);
		if (!(t in this.uidIndex_)) return !1;
		t in this.nullGeometryFeatures_ ? delete this.nullGeometryFeatures_[t] : this.featuresRtree_ && this.featuresRtree_.remove(e), this.featureChangeKeys_[t]?.forEach(qr), delete this.featureChangeKeys_[t];
		let n = e.getId();
		if (n !== void 0) {
			let t = n.toString(), r = this.idIndex_[t];
			r === e ? delete this.idIndex_[t] : Array.isArray(r) && (r.splice(r.indexOf(e), 1), r.length === 1 && (this.idIndex_[t] = r[0]));
		}
		return delete this.uidIndex_[t], this.hasListener(Qm.REMOVEFEATURE) && this.dispatchEvent(new $m(Qm.REMOVEFEATURE, e)), !0;
	}
	removeFromIdIndex_(e) {
		for (let t in this.idIndex_) if (this.idIndex_[t] === e) {
			delete this.idIndex_[t];
			break;
		}
	}
	setLoader(e) {
		this.loader_ = e;
	}
	setUrl(e) {
		V(this.format_, "`format` must be set when `url` is set"), this.url_ = e, this.setLoader(Bm(e, this.format_));
	}
	setOverlaps(e) {
		this.overlaps_ = e, this.changed();
	}
}, J = {
	BEGIN_GEOMETRY: 0,
	BEGIN_PATH: 1,
	CIRCLE: 2,
	CLOSE_PATH: 3,
	CUSTOM: 4,
	DRAW_CHARS: 5,
	DRAW_IMAGE: 6,
	END_GEOMETRY: 7,
	FILL: 8,
	MOVE_TO_LINE_TO: 9,
	SET_FILL_STYLE: 10,
	SET_STROKE_STYLE: 11,
	STROKE: 12
}, th = [J.FILL], nh = [J.STROKE], rh = [J.BEGIN_PATH], ih = [J.CLOSE_PATH], ah = class extends bm {
	constructor(e, t, n, r) {
		super(), this.tolerance = e, this.maxExtent = t, this.pixelRatio = r, this.maxLineWidth = 0, this.resolution = n, this.beginGeometryInstruction1_ = null, this.beginGeometryInstruction2_ = null, this.bufferedMaxExtent_ = null, this.instructions = [], this.coordinates = [], this.tmpCoordinate_ = [], this.hitDetectionInstructions = [], this.state = {};
	}
	applyPixelRatio(e) {
		let t = this.pixelRatio;
		return t == 1 ? e : e.map(function(e) {
			return e * t;
		});
	}
	appendFlatPointCoordinates(e, t) {
		let n = this.getBufferedMaxExtent(), r = this.tmpCoordinate_, i = this.coordinates, a = i.length;
		for (let o = 0, s = e.length; o < s; o += t) r[0] = e[o], r[1] = e[o + 1], ia(n, r) && (i[a++] = r[0], i[a++] = r[1]);
		return a;
	}
	appendFlatLineCoordinates(e, t, n, r, i, a) {
		let o = this.coordinates, s = o.length, c = this.getBufferedMaxExtent();
		a && (t += r);
		let l = e[t], u = e[t + 1], d = this.tmpCoordinate_, f = !0, p, m, h;
		for (p = t + r; p < n; p += r) d[0] = e[p], d[1] = e[p + 1], h = sa(c, d), h === m ? h === Qi.INTERSECTING ? (o[s++] = d[0], o[s++] = d[1], f = !1) : f = !0 : (f &&= (o[s++] = l, o[s++] = u, !1), o[s++] = d[0], o[s++] = d[1]), l = d[0], u = d[1], m = h;
		return (i && f || p === t + r) && (o[s++] = l, o[s++] = u), s;
	}
	drawCustomCoordinates_(e, t, n, r, i) {
		for (let a = 0, o = n.length; a < o; ++a) {
			let o = n[a], s = this.appendFlatLineCoordinates(e, t, o, r, !1, !1);
			i.push(s), t = o;
		}
		return t;
	}
	drawCustom(e, t, n, r, i) {
		this.beginGeometry(e, t, i);
		let a = e.getType(), o = e.getStride(), s = this.coordinates.length, c, l, u, d, f;
		switch (a) {
			case "MultiPolygon":
				c = e.getOrientedFlatCoordinates(), d = [];
				let t = e.getEndss();
				f = 0;
				for (let e = 0, n = t.length; e < n; ++e) {
					let n = [];
					f = this.drawCustomCoordinates_(c, f, t[e], o, n), d.push(n);
				}
				this.instructions.push([
					J.CUSTOM,
					s,
					d,
					e,
					n,
					Cc,
					i
				]), this.hitDetectionInstructions.push([
					J.CUSTOM,
					s,
					d,
					e,
					r || n,
					Cc,
					i
				]);
				break;
			case "Polygon":
			case "MultiLineString":
				u = [], c = a == "Polygon" ? e.getOrientedFlatCoordinates() : e.getFlatCoordinates(), f = this.drawCustomCoordinates_(c, 0, e.getEnds(), o, u), this.instructions.push([
					J.CUSTOM,
					s,
					u,
					e,
					n,
					Sc,
					i
				]), this.hitDetectionInstructions.push([
					J.CUSTOM,
					s,
					u,
					e,
					r || n,
					Sc,
					i
				]);
				break;
			case "LineString":
			case "Circle":
				c = e.getFlatCoordinates(), l = this.appendFlatLineCoordinates(c, 0, c.length, o, !1, !1), this.instructions.push([
					J.CUSTOM,
					s,
					l,
					e,
					n,
					xc,
					i
				]), this.hitDetectionInstructions.push([
					J.CUSTOM,
					s,
					l,
					e,
					r || n,
					xc,
					i
				]);
				break;
			case "MultiPoint":
				c = e.getFlatCoordinates(), l = this.appendFlatPointCoordinates(c, o), l > s && (this.instructions.push([
					J.CUSTOM,
					s,
					l,
					e,
					n,
					xc,
					i
				]), this.hitDetectionInstructions.push([
					J.CUSTOM,
					s,
					l,
					e,
					r || n,
					xc,
					i
				]));
				break;
			case "Point": c = e.getFlatCoordinates(), this.coordinates.push(c[0], c[1]), l = this.coordinates.length, this.instructions.push([
				J.CUSTOM,
				s,
				l,
				e,
				n,
				void 0,
				i
			]), this.hitDetectionInstructions.push([
				J.CUSTOM,
				s,
				l,
				e,
				r || n,
				void 0,
				i
			]);
		}
		this.endGeometry(t);
	}
	beginGeometry(e, t, n) {
		this.beginGeometryInstruction1_ = [
			J.BEGIN_GEOMETRY,
			t,
			0,
			e,
			n
		], this.instructions.push(this.beginGeometryInstruction1_), this.beginGeometryInstruction2_ = [
			J.BEGIN_GEOMETRY,
			t,
			0,
			e,
			n
		], this.hitDetectionInstructions.push(this.beginGeometryInstruction2_);
	}
	finish() {
		return {
			instructions: this.instructions,
			hitDetectionInstructions: this.hitDetectionInstructions,
			coordinates: this.coordinates
		};
	}
	reverseHitDetectionInstructions() {
		let e = this.hitDetectionInstructions;
		e.reverse();
		let t, n = e.length, r, i, a = -1;
		for (t = 0; t < n; ++t) r = e[t], i = r[0], i == J.END_GEOMETRY ? a = t : i == J.BEGIN_GEOMETRY && (r[2] = t, $r(this.hitDetectionInstructions, a, t), a = -1);
	}
	fillStyleToState(e, t = {}) {
		if (e) {
			let n = e.getColor();
			t.fillPatternScale = n && typeof n == "object" && "src" in n ? this.pixelRatio : 1, t.fillStyle = Mf(n || "#000") ?? void 0;
		} else t.fillStyle = void 0;
		return t;
	}
	strokeStyleToState(e, t = {}) {
		if (e) {
			t.strokeStyle = Mf(e.getColor() || zf);
			let n = e.getLineCap();
			t.lineCap = n === void 0 ? If : n;
			let r = e.getLineDash();
			t.lineDash = r ? r.slice() : Lf, t.lineDashOffset = e.getLineDashOffset() || 0;
			let i = e.getLineJoin();
			t.lineJoin = i === void 0 ? Rf : i;
			let a = e.getWidth();
			t.lineWidth = a === void 0 ? 1 : a;
			let o = e.getMiterLimit();
			t.miterLimit = o === void 0 ? 10 : o, t.strokeOffset = e.getOffset() ?? 0, t.lineWidth > this.maxLineWidth && (this.maxLineWidth = t.lineWidth, this.bufferedMaxExtent_ = null);
		} else t.strokeStyle = void 0, t.lineCap = void 0, t.lineDash = null, t.lineDashOffset = void 0, t.lineJoin = void 0, t.lineWidth = void 0, t.miterLimit = void 0, t.strokeOffset = void 0;
		return t;
	}
	setFillStrokeStyle(e, t) {
		let n = this.state;
		this.fillStyleToState(e, n), this.strokeStyleToState(t, n);
	}
	createFill(e) {
		let t = e.fillStyle, n = [J.SET_FILL_STYLE, t];
		return typeof t != "string" && n.push(e.fillPatternScale), n;
	}
	applyStroke(e) {
		this.instructions.push(this.createStroke(e));
	}
	createStroke(e) {
		return [
			J.SET_STROKE_STYLE,
			e.strokeStyle,
			e.lineWidth * this.pixelRatio,
			e.lineCap,
			e.lineJoin,
			e.miterLimit,
			e.lineDash ? this.applyPixelRatio(e.lineDash) : null,
			e.lineDashOffset * this.pixelRatio
		];
	}
	updateFillStyle(e, t) {
		let n = e.fillStyle;
		(n !== void 0 && typeof n != "string" || e.currentFillStyle != n) && (this.instructions.push(t.call(this, e)), e.currentFillStyle = n);
	}
	updateStrokeStyle(e, t) {
		let n = e.strokeStyle, r = e.lineCap, i = e.lineDash, a = e.lineDashOffset, o = e.lineJoin, s = e.lineWidth, c = e.miterLimit, l = e.strokeOffset;
		(e.currentStrokeStyle != n || e.currentLineCap != r || i != e.currentLineDash && !ti(e.currentLineDash, i) || e.currentLineDashOffset != a || e.currentLineJoin != o || e.currentLineWidth != s || e.currentMiterLimit != c || e.currentStrokeOffset != l) && (t.call(this, e), e.currentStrokeStyle = n, e.currentLineCap = r, e.currentLineDash = i, e.currentLineDashOffset = a, e.currentLineJoin = o, e.currentLineWidth = s, e.currentMiterLimit = c, e.currentStrokeOffset = l);
	}
	endGeometry(e) {
		this.beginGeometryInstruction1_[2] = this.instructions.length, this.beginGeometryInstruction1_ = null, this.beginGeometryInstruction2_[2] = this.hitDetectionInstructions.length, this.beginGeometryInstruction2_ = null;
		let t = [J.END_GEOMETRY, e];
		this.instructions.push(t), this.hitDetectionInstructions.push(t);
	}
	getBufferedMaxExtent() {
		if (!this.bufferedMaxExtent_ && (this.bufferedMaxExtent_ = na(this.maxExtent), this.maxLineWidth > 0)) {
			let e = this.resolution * (this.maxLineWidth + 1) / 2;
			ta(this.bufferedMaxExtent_, e, this.bufferedMaxExtent_);
		}
		return this.bufferedMaxExtent_;
	}
}, oh = class extends ah {
	constructor(e, t, n, r) {
		super(e, t, n, r), this.hitDetectionImage_ = null, this.image_ = null, this.imagePixelRatio_ = void 0, this.anchorX_ = void 0, this.anchorY_ = void 0, this.height_ = void 0, this.opacity_ = void 0, this.originX_ = void 0, this.originY_ = void 0, this.rotateWithView_ = void 0, this.rotation_ = void 0, this.scale_ = void 0, this.width_ = void 0, this.declutterMode_ = void 0, this.declutterImageWithText_ = void 0;
	}
	drawPoint(e, t, n) {
		if (!this.image_ || this.maxExtent && !ia(this.maxExtent, e.getFlatCoordinates())) return;
		this.beginGeometry(e, t, n);
		let r = e.getFlatCoordinates(), i = e.getStride(), a = this.coordinates.length, o = this.appendFlatPointCoordinates(r, i);
		this.instructions.push([
			J.DRAW_IMAGE,
			a,
			o,
			this.image_,
			this.anchorX_ * this.imagePixelRatio_,
			this.anchorY_ * this.imagePixelRatio_,
			Math.ceil(this.height_ * this.imagePixelRatio_),
			this.opacity_,
			this.originX_ * this.imagePixelRatio_,
			this.originY_ * this.imagePixelRatio_,
			this.rotateWithView_,
			this.rotation_,
			[this.scale_[0] * this.pixelRatio / this.imagePixelRatio_, this.scale_[1] * this.pixelRatio / this.imagePixelRatio_],
			Math.ceil(this.width_ * this.imagePixelRatio_),
			this.declutterMode_,
			this.declutterImageWithText_
		]), this.hitDetectionInstructions.push([
			J.DRAW_IMAGE,
			a,
			o,
			this.hitDetectionImage_,
			this.anchorX_,
			this.anchorY_,
			this.height_,
			1,
			this.originX_,
			this.originY_,
			this.rotateWithView_,
			this.rotation_,
			this.scale_,
			this.width_,
			this.declutterMode_,
			this.declutterImageWithText_
		]), this.endGeometry(t);
	}
	drawMultiPoint(e, t, n) {
		if (!this.image_) return;
		this.beginGeometry(e, t, n);
		let r = e.getFlatCoordinates(), i = [];
		for (let t = 0, n = r.length; t < n; t += e.getStride()) (!this.maxExtent || ia(this.maxExtent, r.slice(t, t + 2))) && i.push(r[t], r[t + 1]);
		let a = this.coordinates.length, o = this.appendFlatPointCoordinates(i, 2);
		this.instructions.push([
			J.DRAW_IMAGE,
			a,
			o,
			this.image_,
			this.anchorX_ * this.imagePixelRatio_,
			this.anchorY_ * this.imagePixelRatio_,
			Math.ceil(this.height_ * this.imagePixelRatio_),
			this.opacity_,
			this.originX_ * this.imagePixelRatio_,
			this.originY_ * this.imagePixelRatio_,
			this.rotateWithView_,
			this.rotation_,
			[this.scale_[0] * this.pixelRatio / this.imagePixelRatio_, this.scale_[1] * this.pixelRatio / this.imagePixelRatio_],
			Math.ceil(this.width_ * this.imagePixelRatio_),
			this.declutterMode_,
			this.declutterImageWithText_
		]), this.hitDetectionInstructions.push([
			J.DRAW_IMAGE,
			a,
			o,
			this.hitDetectionImage_,
			this.anchorX_,
			this.anchorY_,
			this.height_,
			1,
			this.originX_,
			this.originY_,
			this.rotateWithView_,
			this.rotation_,
			this.scale_,
			this.width_,
			this.declutterMode_,
			this.declutterImageWithText_
		]), this.endGeometry(t);
	}
	finish() {
		return this.reverseHitDetectionInstructions(), this.anchorX_ = void 0, this.anchorY_ = void 0, this.hitDetectionImage_ = null, this.image_ = null, this.imagePixelRatio_ = void 0, this.height_ = void 0, this.scale_ = void 0, this.opacity_ = void 0, this.originX_ = void 0, this.originY_ = void 0, this.rotateWithView_ = void 0, this.rotation_ = void 0, this.width_ = void 0, super.finish();
	}
	setImageStyle(e, t) {
		let n = e.getAnchor(), r = e.getSize(), i = e.getOrigin();
		this.imagePixelRatio_ = e.getPixelRatio(this.pixelRatio), this.anchorX_ = n[0], this.anchorY_ = n[1], this.hitDetectionImage_ = e.getHitDetectionImage(), this.image_ = e.getImage(this.pixelRatio), this.height_ = r[1], this.opacity_ = e.getOpacity(), this.originX_ = i[0], this.originY_ = i[1], this.rotateWithView_ = e.getRotateWithView(), this.rotation_ = e.getRotation(), this.scale_ = e.getScaleArray(), this.width_ = r[0], this.declutterMode_ = e.getDeclutterMode(), this.declutterImageWithText_ = t;
	}
}, sh = class extends ah {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	drawFlatCoordinates_(e, t, n, r, i) {
		let a = this.coordinates.length, o = this.appendFlatLineCoordinates(e, t, n, r, !1, !1);
		return this.instructions.push([
			J.MOVE_TO_LINE_TO,
			a,
			o,
			i * this.pixelRatio
		]), this.hitDetectionInstructions.push([
			J.MOVE_TO_LINE_TO,
			a,
			o,
			i
		]), n;
	}
	drawLineString(e, t, n) {
		let r = this.state, i = r.strokeStyle, a = r.lineWidth, o = r.strokeOffset;
		if (i === void 0 || a === void 0) return;
		this.updateStrokeStyle(r, this.applyStroke), this.beginGeometry(e, t, n), this.hitDetectionInstructions.push([
			J.SET_STROKE_STYLE,
			zf,
			r.lineWidth,
			r.lineCap,
			r.lineJoin,
			r.miterLimit,
			Lf,
			0
		], rh);
		let s = e.getFlatCoordinates(), c = e.getStride();
		this.drawFlatCoordinates_(s, 0, s.length, c, o), this.hitDetectionInstructions.push(nh), this.endGeometry(t);
	}
	drawMultiLineString(e, t, n) {
		let r = this.state, i = r.strokeStyle, a = r.lineWidth, o = r.strokeOffset;
		if (i === void 0 || a === void 0) return;
		this.updateStrokeStyle(r, this.applyStroke), this.beginGeometry(e, t, n), this.hitDetectionInstructions.push([
			J.SET_STROKE_STYLE,
			zf,
			r.lineWidth,
			r.lineCap,
			r.lineJoin,
			r.miterLimit,
			Lf,
			0
		], rh);
		let s = e.getEnds(), c = e.getFlatCoordinates(), l = e.getStride(), u = 0;
		for (let e = 0, t = s.length; e < t; ++e) u = this.drawFlatCoordinates_(c, u, s[e], l, o);
		this.hitDetectionInstructions.push(nh), this.endGeometry(t);
	}
	finish() {
		let e = this.state;
		return e.lastStroke != null && e.lastStroke != this.coordinates.length && this.instructions.push(nh), this.reverseHitDetectionInstructions(), this.state = null, super.finish();
	}
	applyStroke(e) {
		e.lastStroke != null && e.lastStroke != this.coordinates.length && (this.instructions.push(nh), e.lastStroke = this.coordinates.length), e.lastStroke = 0, super.applyStroke(e), this.instructions.push(rh);
	}
}, ch = class extends ah {
	constructor(e, t, n, r) {
		super(e, t, n, r);
	}
	drawFlatCoordinatess_(e, t, n, r, i) {
		let a = this.state, o = a.fillStyle !== void 0, s = a.strokeStyle !== void 0, c = n.length;
		this.instructions.push(rh), this.hitDetectionInstructions.push(rh);
		for (let a = 0; a < c; ++a) {
			let o = n[a], c = this.coordinates.length, l = this.appendFlatLineCoordinates(e, t, o, r, !0, !s);
			this.instructions.push([
				J.MOVE_TO_LINE_TO,
				c,
				l,
				i * this.pixelRatio,
				!0
			]), this.hitDetectionInstructions.push([
				J.MOVE_TO_LINE_TO,
				c,
				l,
				i,
				!0
			]), s && (this.instructions.push(ih), this.hitDetectionInstructions.push(ih)), t = o;
		}
		return o && (this.instructions.push(th), this.hitDetectionInstructions.push(th)), s && (this.instructions.push(nh), this.hitDetectionInstructions.push(nh)), t;
	}
	drawCircle(e, t, n) {
		let r = this.state, i = r.fillStyle, a = r.strokeStyle, o = r.strokeOffset;
		if (i === void 0 && a === void 0 || this.handleStrokeOffset_(() => this.drawCircle(e, t, n))) return;
		this.setFillStrokeStyles_(), this.beginGeometry(e, t, n), r.fillStyle !== void 0 && this.hitDetectionInstructions.push([J.SET_FILL_STYLE, Ff]), r.strokeStyle !== void 0 && this.hitDetectionInstructions.push([
			J.SET_STROKE_STYLE,
			zf,
			r.lineWidth,
			r.lineCap,
			r.lineJoin,
			r.miterLimit,
			Lf,
			0
		]);
		let s = e.getFlatCoordinates(), c = e.getStride(), l = this.coordinates.length;
		this.appendFlatLineCoordinates(s, 0, s.length, c, !1, !1);
		let u = [
			J.CIRCLE,
			l,
			o
		];
		this.instructions.push(rh, u), this.hitDetectionInstructions.push(rh, u), r.fillStyle !== void 0 && (this.instructions.push(th), this.hitDetectionInstructions.push(th)), r.strokeStyle !== void 0 && (this.instructions.push(nh), this.hitDetectionInstructions.push(nh)), this.endGeometry(t);
	}
	drawPolygon(e, t, n) {
		let r = this.state, i = r.fillStyle, a = r.strokeStyle, o = r.strokeOffset;
		if (i === void 0 && a === void 0 || this.handleStrokeOffset_(() => this.drawPolygon(e, t, n))) return;
		this.setFillStrokeStyles_(), this.beginGeometry(e, t, n), r.fillStyle !== void 0 && this.hitDetectionInstructions.push([J.SET_FILL_STYLE, Ff]), r.strokeStyle !== void 0 && this.hitDetectionInstructions.push([
			J.SET_STROKE_STYLE,
			zf,
			r.lineWidth,
			r.lineCap,
			r.lineJoin,
			r.miterLimit,
			Lf,
			0
		]);
		let s = e.getEnds(), c = e.getOrientedFlatCoordinates(), l = e.getStride();
		this.drawFlatCoordinatess_(c, 0, s, l, o), this.endGeometry(t);
	}
	drawMultiPolygon(e, t, n) {
		let r = this.state, i = r.fillStyle, a = r.strokeStyle, o = r.strokeOffset;
		if (i === void 0 && a === void 0 || this.handleStrokeOffset_(() => this.drawMultiPolygon(e, t, n))) return;
		this.setFillStrokeStyles_(), this.beginGeometry(e, t, n), r.fillStyle !== void 0 && this.hitDetectionInstructions.push([J.SET_FILL_STYLE, Ff]), r.strokeStyle !== void 0 && this.hitDetectionInstructions.push([
			J.SET_STROKE_STYLE,
			zf,
			r.lineWidth,
			r.lineCap,
			r.lineJoin,
			r.miterLimit,
			Lf,
			0
		]);
		let s = e.getEndss(), c = e.getOrientedFlatCoordinates(), l = e.getStride(), u = 0;
		for (let e = 0, t = s.length; e < t; ++e) u = this.drawFlatCoordinatess_(c, u, s[e], l, o);
		this.endGeometry(t);
	}
	finish() {
		this.reverseHitDetectionInstructions(), this.state = null;
		let e = this.tolerance;
		if (e !== 0) {
			let t = this.coordinates;
			for (let n = 0, r = t.length; n < r; ++n) t[n] = Ic(t[n], e);
		}
		return super.finish();
	}
	setFillStrokeStyles_() {
		let e = this.state;
		this.updateFillStyle(e, this.createFill), this.updateStrokeStyle(e, this.applyStroke);
	}
	handleStrokeOffset_(e) {
		let t = this.state, n = t.fillStyle, r = t.strokeStyle, i = t.strokeOffset;
		return Math.abs(i) > 0 && n !== void 0 && r !== void 0 && (t.strokeStyle = void 0, t.strokeOffset = 0, e(), t.fillStyle = void 0, t.strokeStyle = r, t.strokeOffset = i, e(), t.fillStyle = n, !0);
	}
}, lh = 0, uh = 1;
function dh(e, t, n, r, i, a, o, s) {
	let c = o - i, l = s - a, u = 0, d = 1;
	if (c === 0) {
		if (i < e || i > n) return !1;
	} else {
		let t = (e - i) / c, r = (n - i) / c;
		if (t > r) {
			let e = t;
			t = r, r = e;
		}
		if (t > u && (u = t), r < d && (d = r), u > d) return !1;
	}
	if (l === 0) {
		if (a < t || a > r) return !1;
	} else {
		let e = (t - a) / l, n = (r - a) / l;
		if (e > n) {
			let t = e;
			e = n, n = t;
		}
		if (e > u && (u = e), n < d && (d = n), u > d) return !1;
	}
	return lh = u, uh = d, !0;
}
function fh(e, t, n, r) {
	let i = r[0], a = r[1], o = r[2], s = r[3], c = [], l = [], u = !1, d, f, p = 0;
	for (let r = 0, m = t.length; r < m; ++r) {
		let m = t[r], h = e[p], g = e[p + 1], _ = !1;
		for (let t = p + n; t < m; t += n) {
			let n = e[t], r = e[t + 1];
			if (dh(i, a, o, s, h, g, n, r)) {
				let e = n - h, t = r - g, i = h + lh * e, a = g + lh * t, o = h + uh * e, s = g + uh * t;
				u && _ && i === d && a === f ? c.push(o, s) : (u && l.push(c.length), c.push(i, a, o, s), u = !0), d = o, f = s, _ = !0;
			}
			h = n, g = r;
		}
		p = m;
	}
	return u && l.push(c.length), {
		flatCoordinates: c,
		ends: l
	};
}
//#endregion
//#region node_modules/ol/geom/flat/linechunk.js
function ph(e, t, n, r, i) {
	let a = [], o = n, s = 0, c = t.slice(n, 2);
	for (; s < e && o + i < r;) {
		let [n, r] = c.slice(-2), l = t[o + i], u = t[o + i + 1], d = Math.sqrt((l - n) * (l - n) + (u - r) * (u - r));
		if (s += d, s >= e) {
			let t = (e - s + d) / d, f = Gi(n, l, t), p = Gi(r, u, t);
			c.push(f, p), a.push(c), c = [f, p], s == e && (o += i), s = 0;
		} else if (s < e) c.push(t[o + i], t[o + i + 1]), o += i;
		else {
			let e = d - s, t = Gi(n, l, e / d), f = Gi(r, u, e / d);
			c.push(t, f), a.push(c), c = [t, f], s = 0, o += i;
		}
	}
	return s > 0 && a.push(c), a;
}
//#endregion
//#region node_modules/ol/geom/flat/straightchunk.js
function mh(e, t, n, r, i) {
	let a = n, o = n, s = 0, c = 0, l = n, u, d, f, p, m, h, g, _, v, y;
	for (d = n; d < r; d += i) {
		let n = t[d], r = t[d + 1];
		m !== void 0 && (v = n - m, y = r - h, p = Math.sqrt(v * v + y * y), g !== void 0 && (c += f, u = Math.acos((g * v + _ * y) / (f * p)), u > e && (c > s && (s = c, a = l, o = d), c = 0, l = d - i)), f = p, g = v, _ = y), m = n, h = r;
	}
	return c += p, c > s ? [l, d] : [a, o];
}
//#endregion
//#region node_modules/ol/render/canvas/TextBuilder.js
var hh = {
	left: 0,
	center: .5,
	right: 1,
	top: 0,
	middle: .5,
	hanging: .2,
	alphabetic: .8,
	ideographic: .8,
	bottom: 1
}, gh = {
	Circle: ch,
	Default: ah,
	Image: oh,
	LineString: sh,
	Polygon: ch,
	Text: class extends ah {
		constructor(e, t, n, r) {
			super(e, t, n, r), this.labels_ = null, this.text_ = "", this.textOffsetX_ = 0, this.textOffsetY_ = 0, this.textRotateWithView_ = void 0, this.textKeepUpright_ = void 0, this.textRotation_ = 0, this.textFillState_ = null, this.fillStates = {}, this.fillStates[Ff] = { fillStyle: Ff }, this.textStrokeState_ = null, this.strokeStates = {}, this.textState_ = {}, this.textStates = {}, this.textKey_ = "", this.fillKey_ = "", this.strokeKey_ = "", this.declutterMode_ = void 0, this.declutterImageWithText_ = void 0;
		}
		finish() {
			let e = super.finish();
			return e.textStates = this.textStates, e.fillStates = this.fillStates, e.strokeStates = this.strokeStates, e;
		}
		drawText(e, t, n) {
			let r = this.textFillState_, i = this.textStrokeState_, a = this.textState_;
			if (this.text_ === "" || !a || !r && !i) return;
			let o = this.coordinates, s = o.length, c = e.getType(), l = null, u = e.getStride();
			if (a.placement === "line" && (c == "LineString" || c == "MultiLineString" || c == "Polygon" || c == "MultiPolygon")) {
				let r = e.getExtent();
				if (!ja(this.maxExtent, r)) return;
				let i;
				if (l = e.getFlatCoordinates(), c == "LineString") i = [l.length];
				else if (c == "MultiLineString") i = e.getEnds();
				else if (c == "Polygon") i = e.getEnds().slice(0, 1);
				else if (c == "MultiPolygon") {
					let t = e.getEndss();
					i = [];
					for (let e = 0, n = t.length; e < n; ++e) i.push(t[e][0]);
				}
				if ((c == "LineString" || c == "MultiLineString") && !aa(this.getBufferedMaxExtent(), r)) {
					let e = fh(l, i, u, this.getBufferedMaxExtent());
					if (l = e.flatCoordinates, i = e.ends, u = 2, i.length === 0) return;
				}
				this.beginGeometry(e, t, n);
				let d = a.repeat, f = d ? void 0 : a.textAlign, p = 0;
				for (let e = 0, t = i.length; e < t; ++e) {
					let t;
					t = d ? ph(d * this.resolution, l, p, i[e], u) : [l.slice(p, i[e])];
					for (let n = 0, r = t.length; n < r; ++n) {
						let r = t[n], c = 0, l = r.length;
						if (f == null) {
							let e = mh(a.maxAngle, r, 0, r.length, 2);
							c = e[0], l = e[1];
						}
						for (let e = c; e < l; e += u) o.push(r[e], r[e + 1]);
						let d = o.length;
						p = i[e], this.drawChars_(s, d), s = d;
					}
				}
				this.endGeometry(t);
			} else {
				let r = a.overflow ? null : [];
				switch (c) {
					case "Point":
					case "MultiPoint":
						l = e.getFlatCoordinates();
						break;
					case "LineString":
						l = e.getFlatMidpoint();
						break;
					case "Circle":
						l = e.getCenter();
						break;
					case "MultiLineString":
						l = e.getFlatMidpoints(), u = 2;
						break;
					case "Polygon":
						l = e.getFlatInteriorPoint(), a.overflow || r.push(l[2] / this.resolution), u = 3;
						break;
					case "MultiPolygon":
						let t = e.getFlatInteriorPoints();
						l = [];
						for (let e = 0, n = t.length; e < n; e += 3) a.overflow || r.push(t[e + 2] / this.resolution), l.push(t[e], t[e + 1]);
						if (l.length === 0) return;
						u = 2;
				}
				let i = this.appendFlatPointCoordinates(l, u);
				if (i === s) return;
				if (r && (i - s) / 2 !== l.length / u) {
					let e = s / 2;
					r = r.filter((t, n) => {
						let r = o[(e + n) * 2] === l[n * u] && o[(e + n) * 2 + 1] === l[n * u + 1];
						return r || --e, r;
					});
				}
				this.saveTextStates_();
				let d = a.backgroundFill ? this.createFill(this.fillStyleToState(a.backgroundFill)) : null, f = a.backgroundStroke ? this.createStroke(this.strokeStyleToState(a.backgroundStroke)) : null;
				this.beginGeometry(e, t, n);
				let p = a.padding;
				if (p != Hf && (a.scale[0] < 0 || a.scale[1] < 0)) {
					let e = a.padding[0], t = a.padding[1], n = a.padding[2], r = a.padding[3];
					a.scale[0] < 0 && (t = -t, r = -r), a.scale[1] < 0 && (e = -e, n = -n), p = [
						e,
						t,
						n,
						r
					];
				}
				let m = this.pixelRatio;
				this.instructions.push([
					J.DRAW_IMAGE,
					s,
					i,
					null,
					NaN,
					NaN,
					NaN,
					1,
					0,
					0,
					this.textRotateWithView_,
					this.textRotation_,
					[1, 1],
					NaN,
					this.declutterMode_,
					this.declutterImageWithText_,
					p == Hf ? Hf : p.map(function(e) {
						return e * m;
					}),
					d,
					f,
					this.text_,
					this.textKey_,
					this.strokeKey_,
					this.fillKey_,
					this.textOffsetX_,
					this.textOffsetY_,
					r
				]);
				let h = 1 / m, g = d ? d.slice(0) : null;
				g && (g[1] = Ff), this.hitDetectionInstructions.push([
					J.DRAW_IMAGE,
					s,
					i,
					null,
					NaN,
					NaN,
					NaN,
					1,
					0,
					0,
					this.textRotateWithView_,
					this.textRotation_,
					[h, h],
					NaN,
					this.declutterMode_,
					this.declutterImageWithText_,
					p,
					g,
					f,
					this.text_,
					this.textKey_,
					this.strokeKey_,
					this.fillKey_ ? Ff : this.fillKey_,
					this.textOffsetX_,
					this.textOffsetY_,
					r
				]), this.endGeometry(t);
			}
		}
		saveTextStates_() {
			let e = this.textStrokeState_, t = this.textState_, n = this.textFillState_, r = this.strokeKey_;
			e && (r in this.strokeStates || (this.strokeStates[r] = {
				strokeStyle: e.strokeStyle,
				lineCap: e.lineCap,
				lineDashOffset: e.lineDashOffset,
				lineWidth: e.lineWidth,
				lineJoin: e.lineJoin,
				miterLimit: e.miterLimit,
				lineDash: e.lineDash
			}));
			let i = this.textKey_;
			i in this.textStates || (this.textStates[i] = {
				font: t.font,
				textAlign: t.textAlign || "center",
				justify: t.justify,
				textBaseline: t.textBaseline || "middle",
				scale: t.scale
			});
			let a = this.fillKey_;
			n && (a in this.fillStates || (this.fillStates[a] = { fillStyle: n.fillStyle }));
		}
		drawChars_(e, t) {
			let n = this.textStrokeState_, r = this.textState_, i = this.strokeKey_, a = this.textKey_, o = this.fillKey_;
			this.saveTextStates_();
			let s = this.pixelRatio, c = hh[r.textBaseline], l = this.textOffsetX_ * s, u = this.textOffsetY_ * s, d = this.text_, f = n ? n.lineWidth * Math.abs(r.scale[0]) / 2 : 0;
			this.instructions.push([
				J.DRAW_CHARS,
				e,
				t,
				c,
				r.overflow,
				o,
				r.maxAngle,
				s,
				u,
				i,
				f * s,
				d,
				a,
				1,
				this.declutterMode_,
				this.textKeepUpright_,
				l
			]), this.hitDetectionInstructions.push([
				J.DRAW_CHARS,
				e,
				t,
				c,
				r.overflow,
				o && Ff,
				r.maxAngle,
				s,
				u,
				i,
				f * s,
				d,
				a,
				1 / s,
				this.declutterMode_,
				this.textKeepUpright_,
				l
			]);
		}
		setTextStyle(e, t) {
			let n, r, i;
			if (!e) this.text_ = "";
			else {
				let t = e.getFill();
				t ? (r = this.textFillState_, r || (r = {}, this.textFillState_ = r), r.fillStyle = Mf(t.getColor() || "#000")) : (r = null, this.textFillState_ = r);
				let a = e.getStroke();
				if (!a) i = null, this.textStrokeState_ = i;
				else {
					i = this.textStrokeState_, i || (i = {}, this.textStrokeState_ = i);
					let e = a.getLineDash(), t = a.getLineDashOffset(), n = a.getWidth(), r = a.getMiterLimit();
					i.lineCap = a.getLineCap() || "round", i.lineDash = e ? e.slice() : Lf, i.lineDashOffset = t === void 0 ? 0 : t, i.lineJoin = a.getLineJoin() || "round", i.lineWidth = n === void 0 ? 1 : n, i.miterLimit = r === void 0 ? 10 : r, i.strokeStyle = Mf(a.getColor() || "#000");
				}
				n = this.textState_;
				let o = e.getFont() || "10px sans-serif";
				Yf(o);
				let s = e.getScaleArray();
				n.overflow = e.getOverflow(), n.font = o, n.maxAngle = e.getMaxAngle(), n.placement = e.getPlacement(), n.textAlign = e.getTextAlign(), n.repeat = e.getRepeat(), n.justify = e.getJustify(), n.textBaseline = e.getTextBaseline() || "middle", n.backgroundFill = e.getBackgroundFill(), n.backgroundStroke = e.getBackgroundStroke(), n.padding = e.getPadding() || Hf, n.scale = s === void 0 ? [1, 1] : s;
				let c = e.getOffsetX(), l = e.getOffsetY(), u = e.getRotateWithView(), d = e.getKeepUpright(), f = e.getRotation();
				this.text_ = e.getText() || "", this.textOffsetX_ = c === void 0 ? 0 : c, this.textOffsetY_ = l === void 0 ? 0 : l, this.textRotateWithView_ = u !== void 0 && u, this.textKeepUpright_ = d === void 0 || d, this.textRotation_ = f === void 0 ? 0 : f, this.strokeKey_ = i ? (typeof i.strokeStyle == "string" ? i.strokeStyle : z(i.strokeStyle)) + i.lineCap + i.lineDashOffset + "|" + i.lineWidth + i.lineJoin + i.miterLimit + "[" + i.lineDash.join() + "]" : "", this.textKey_ = n.font + n.scale + (n.textAlign || "?") + (n.repeat || "?") + (n.justify || "?") + (n.textBaseline || "?"), this.fillKey_ = r && r.fillStyle ? typeof r.fillStyle == "string" ? r.fillStyle : "|" + z(r.fillStyle) : "";
			}
			this.declutterMode_ = e.getDeclutterMode(), this.declutterImageWithText_ = t;
		}
	}
}, _h = class {
	constructor(e, t, n, r) {
		this.tolerance_ = e, this.maxExtent_ = t, this.pixelRatio_ = r, this.resolution_ = n, this.buildersByZIndex_ = {};
	}
	finish() {
		let e = {};
		for (let t in this.buildersByZIndex_) {
			e[t] = e[t] || {};
			let n = this.buildersByZIndex_[t];
			for (let r in n) {
				let i = n[r].finish();
				e[t][r] = i;
			}
		}
		return e;
	}
	getBuilder(e, t) {
		let n = e === void 0 ? "0" : e.toString(), r = this.buildersByZIndex_[n];
		r === void 0 && (r = {}, this.buildersByZIndex_[n] = r);
		let i = r[t];
		if (i === void 0) {
			let e = gh[t];
			i = new e(this.tolerance_, this.maxExtent_, this.resolution_, this.pixelRatio_), r[t] = i;
		}
		return i;
	}
}, vh;
function yh() {
	return vh ||= new Intl.Segmenter(void 0, { granularity: "grapheme" }), vh;
}
function bh(e, t, n, r, i, a, o, s, c, l, u, d, f = !0) {
	let p = e[t], m = e[t + 1], h = 0, g = 0, _ = 0, v = 0;
	function y() {
		h = p, g = m, t += r, p = e[t], m = e[t + 1], v += _, _ = Math.sqrt((p - h) * (p - h) + (m - g) * (m - g));
	}
	do
		y();
	while (t < n - r && v + _ < a);
	let b = _ === 0 ? 0 : (a - v) / _, x = Gi(h, p, b), S = Gi(g, m, b), C = t - r, w = v, T = a + s * c(l, i, u);
	for (; t < n - r && v + _ < T;) y();
	b = _ === 0 ? 0 : (T - v) / _;
	let E = Gi(h, p, b), ee = Gi(g, m, b), D = !1;
	if (f) {
		if (d) {
			let e = [
				x,
				S,
				E,
				ee
			];
			Zs(e, 0, 4, 2, d, e, e), D = e[0] > e[2];
		} else D = x > E;
	}
	let O = Math.PI, te = [], ne = C + r === t;
	t = C, _ = 0, v = w, p = e[t], m = e[t + 1];
	let k;
	if (ne) return y(), k = Math.atan2(m - g, p - h), D && (k += k > 0 ? -O : O), te[0] = [
		(E + x) / 2,
		(ee + S) / 2,
		(T - a) / 2,
		k,
		i
	], te;
	i = i.replace(/\n/g, " ");
	let re = Array.from(yh().segment(i), (e) => e.segment);
	for (let e = 0, i = re.length; e < i;) {
		y();
		let d = Math.atan2(m - g, p - h);
		if (D && (d += d > 0 ? -O : O), k !== void 0) {
			let e = d - k;
			if (e += e > O ? -2 * O : e < -O ? 2 * O : 0, Math.abs(e) > o) return null;
		}
		k = d;
		let f = e, x = 0;
		for (; e < i; ++e) {
			let o = s * c(l, re[D ? i - e - 1 : e], u);
			if (t + r < n && v + _ < a + x + o / 2) break;
			x += o;
		}
		if (e === f) continue;
		let S = (D ? re.slice(i - e, i - f) : re.slice(f, e)).join("");
		b = _ === 0 ? 0 : (a + x / 2 - v) / _;
		let C = Gi(h, p, b), w = Gi(g, m, b);
		te.push([
			C,
			w,
			x / 2,
			d,
			S
		]), a += x;
	}
	return te;
}
//#endregion
//#region node_modules/ol/render/canvas/ZIndexContext.js
var xh = class {
	constructor() {
		this.instructions_ = [], this.zIndex = 0, this.offset_ = 0, this.pendingMethod_, this.context_ = new Proxy(Dl(), {
			get: (e, t) => {
				if (typeof e[t] == "function") return this.pendingMethod_ = t, this.pushMethodArgs_;
			},
			set: (e, t, n) => (this.push_(t, n), !0)
		});
	}
	push_(...e) {
		let t = this.instructions_, n = this.zIndex + this.offset_;
		t[n] || (t[n] = []), t[n].push(...e);
	}
	pushMethodArgs_ = (...e) => {
		this.push_(this.pendingMethod_, e);
	};
	pushFunction(e) {
		this.push_(e);
	}
	getContext() {
		return this.context_;
	}
	draw(e) {
		this.instructions_.forEach((t) => {
			for (let n = 0, r = t.length; n < r; ++n) {
				let r = t[n];
				if (typeof r == "function") {
					r(e);
					continue;
				}
				let i = t[++n];
				typeof e[r] == "function" ? e[r](...i) : e[r] = typeof i == "function" ? i(e) : i;
			}
		});
	}
	clear() {
		this.instructions_.length = 0, this.zIndex = 0, this.offset_ = 0;
	}
	offset() {
		this.offset_ = this.instructions_.length, this.zIndex = 0;
	}
}, Sh = ca(), Ch = [], wh = [], Th = [], Eh = [];
function Dh(e) {
	return e[3].declutterBox;
}
var Oh = /* @__PURE__ */ RegExp("[֑-ࣿיִ-﷿ﹰ-ﻼࠀ-࿿-]");
function kh(e, t) {
	return t === "start" ? t = Oh.test(e) ? "right" : "left" : t === "end" && (t = Oh.test(e) ? "left" : "right"), hh[t];
}
function Ah(e, t, n) {
	return n > 0 && e.push("\n", ""), e.push(t, ""), e;
}
function jh(e, t, n) {
	return n % 2 == 0 && (e += t), e;
}
var Mh = class {
	constructor(e, t, n, r, i) {
		this.overlaps = n, this.pixelRatio = t, this.resolution = e, this.alignAndScaleFill_, this.instructions = r.instructions, this.coordinates = r.coordinates, this.coordinateCache_ = {}, this.renderedTransform_ = Fs(), this.hitDetectionInstructions = r.hitDetectionInstructions, this.pixelCoordinates_ = null, this.viewRotation_ = 0, this.fillStates = r.fillStates || {}, this.strokeStates = r.strokeStates || {}, this.textStates = r.textStates || {}, this.widths_ = {}, this.labels_ = {}, this.zIndexContext_ = i ? new xh() : null;
	}
	getZIndexContext() {
		return this.zIndexContext_;
	}
	createLabel(e, t, n, r) {
		let i = e + t + n + r;
		if (this.labels_[i]) return this.labels_[i];
		let a = r ? this.strokeStates[r] : null, o = n ? this.fillStates[n] : null, s = this.textStates[t], c = this.pixelRatio, l = [s.scale[0] * c, s.scale[1] * c], u = s.justify ? hh[s.justify] : kh(Array.isArray(e) ? e[0] : e, s.textAlign || "center"), d = r && a.lineWidth ? a.lineWidth : 0, f = Array.isArray(e) ? e : String(e).split("\n").reduce(Ah, []), { width: p, height: m, widths: h, heights: g, lineWidths: _ } = ep(s, f), v = p + d, y = [], b = (v + 2) * l[0], x = (m + d) * l[1], S = {
			width: b < 0 ? Math.floor(b) : Math.ceil(b),
			height: x < 0 ? Math.floor(x) : Math.ceil(x),
			contextInstructions: y
		};
		(l[0] != 1 || l[1] != 1) && y.push("scale", l), r && (y.push("strokeStyle", a.strokeStyle), y.push("lineWidth", d), y.push("lineCap", a.lineCap), y.push("lineJoin", a.lineJoin), y.push("miterLimit", a.miterLimit), y.push("setLineDash", [a.lineDash]), y.push("lineDashOffset", a.lineDashOffset)), n && y.push("fillStyle", o.fillStyle), y.push("textBaseline", "middle"), y.push("textAlign", "center");
		let C = .5 - u, w = u * v + C * d, T = [], E = [], ee = 0, D = 0, O = 0, te = 0, ne;
		for (let e = 0, t = f.length; e < t; e += 2) {
			let t = f[e];
			if (t === "\n") {
				D += ee, ee = 0, w = u * v + C * d, ++te;
				continue;
			}
			let i = f[e + 1] || s.font;
			i !== ne && (r && T.push("font", i), n && E.push("font", i), ne = i), ee = Math.max(ee, g[O]);
			let a = [
				t,
				w + C * h[O] + u * (h[O] - _[te]),
				.5 * (d + ee) + D
			];
			w += h[O], r && T.push("strokeText", a), n && E.push("fillText", a), ++O;
		}
		return Array.prototype.push.apply(y, T), Array.prototype.push.apply(y, E), this.labels_[i] = S, S;
	}
	replayTextBackground_(e, t, n, r, i, a, o) {
		e.beginPath(), e.moveTo.apply(e, t), e.lineTo.apply(e, n), e.lineTo.apply(e, r), e.lineTo.apply(e, i), e.lineTo.apply(e, t), a && (this.alignAndScaleFill_ = a[2], e.fillStyle = a[1], this.fill_(e)), o && (this.setStrokeStyle_(e, o), e.stroke());
	}
	calculateImageOrLabelDimensions_(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m, h) {
		o *= d[0], s *= d[1];
		let g = n - o, _ = r - s, v = i + c > e ? e - c : i, y = a + l > t ? t - l : a, b = p[3] + v * d[0] + p[1], x = p[0] + y * d[1] + p[2], S = g - p[3], C = _ - p[0];
		(m || u !== 0) && (Ch[0] = S, Eh[0] = S, Ch[1] = C, wh[1] = C, wh[0] = S + b, Th[0] = wh[0], Th[1] = C + x, Eh[1] = Th[1]);
		let w;
		return u === 0 ? la(Math.min(S, S + b), Math.min(C, C + x), Math.max(S, S + b), Math.max(C, C + x), Sh) : (w = Us(Fs(), n, r, 1, 1, u, -n, -r), Bs(w, Ch), Bs(w, wh), Bs(w, Th), Bs(w, Eh), la(Math.min(Ch[0], wh[0], Th[0], Eh[0]), Math.min(Ch[1], wh[1], Th[1], Eh[1]), Math.max(Ch[0], wh[0], Th[0], Eh[0]), Math.max(Ch[1], wh[1], Th[1], Eh[1]), Sh)), f && (g = Math.round(g), _ = Math.round(_)), {
			drawImageX: g,
			drawImageY: _,
			drawImageW: v,
			drawImageH: y,
			originX: c,
			originY: l,
			declutterBox: {
				minX: Sh[0],
				minY: Sh[1],
				maxX: Sh[2],
				maxY: Sh[3],
				value: h
			},
			canvasTransform: w,
			scale: d
		};
	}
	replayImageOrLabel_(e, t, n, r, i, a, o) {
		let s = !!(a || o), c = r.declutterBox, l = o ? o[2] * r.scale[0] / 2 : 0;
		return c.minX - l <= t[0] && c.maxX + l >= 0 && c.minY - l <= t[1] && c.maxY + l >= 0 && (s && this.replayTextBackground_(e, Ch, wh, Th, Eh, a, o), tp(e, r.canvasTransform, i, n, r.originX, r.originY, r.drawImageW, r.drawImageH, r.drawImageX, r.drawImageY, r.scale)), !0;
	}
	fill_(e) {
		let t = this.alignAndScaleFill_;
		if (t) {
			let n = Bs(this.renderedTransform_, [0, 0]), r = 512 * this.pixelRatio;
			e.save(), e.translate(n[0] % r, n[1] % r), t !== 1 && e.scale(t, t);
		}
		e.fill(), t && e.restore();
	}
	setStrokeStyle_(e, t) {
		e.strokeStyle = t[1], t[1] && (e.lineWidth = t[2], e.lineCap = t[3], e.lineJoin = t[4], e.miterLimit = t[5], e.lineDashOffset = t[7], e.setLineDash(t[6]));
	}
	drawLabelWithPointPlacement_(e, t, n, r) {
		let i = this.textStates[t], a = this.createLabel(e, t, r, n), o = this.strokeStates[n], s = this.pixelRatio, c = kh(Array.isArray(e) ? e[0] : e, i.textAlign || "center"), l = hh[i.textBaseline || "middle"], u = o && o.lineWidth ? o.lineWidth : 0;
		return {
			label: a,
			anchorX: c * (a.width / s - 2 * i.scale[0]) + 2 * (.5 - c) * u,
			anchorY: l * a.height / s + 2 * (.5 - l) * u
		};
	}
	execute_(e, t, n, r, i, a, o, s) {
		let c = this.zIndexContext_, l;
		this.pixelCoordinates_ && ti(n, this.renderedTransform_) ? l = this.pixelCoordinates_ : (this.pixelCoordinates_ ||= [], l = Xs(this.coordinates, 0, this.coordinates.length, 2, n, this.pixelCoordinates_), zs(this.renderedTransform_, n));
		let u = 0, d = r.length, f = 0, p, m = [], h, g, _, v, y, b, x, S, C, w, T, E, ee, D = 0, O = 0, te = this.coordinateCache_, ne = this.viewRotation_, k = Math.round(Math.atan2(-n[1], n[0]) * 0xe8d4a51000) / 0xe8d4a51000, re = {
			context: e,
			pixelRatio: this.pixelRatio,
			resolution: this.resolution,
			rotation: ne
		}, ie = this.instructions != r || this.overlaps ? 0 : 200, ae, oe, se, ce;
		for (; u < d;) {
			let n = r[u];
			switch (n[0]) {
				case J.BEGIN_GEOMETRY:
					ae = n[1], ce = n[3], ae.getGeometry() ? o !== void 0 && !ja(o, ce.getExtent()) ? u = n[2] + 1 : ++u : u = n[2], c && (c.zIndex = n[4]);
					break;
				case J.BEGIN_PATH:
					D > ie && (this.fill_(e), D = 0), O > ie && (e.stroke(), O = 0), !D && !O && (e.beginPath(), y = NaN, b = NaN), ++u;
					break;
				case J.CIRCLE:
					f = n[1], _ = n[2] ?? 0;
					let r = l[f], d = l[f + 1], le = l[f + 2] - _, ue = l[f + 3] - _, de = le - r, fe = ue - d, pe = Math.sqrt(de * de + fe * fe);
					e.moveTo(r + pe, d), e.arc(r, d, pe, 0, 2 * Math.PI, !0), ++u;
					break;
				case J.CLOSE_PATH:
					e.closePath(), ++u;
					break;
				case J.CUSTOM:
					f = n[1], p = n[2];
					let me = n[3], he = n[4], ge = n[5];
					re.geometry = me, re.feature = ae, u in te || (te[u] = []);
					let _e = te[u];
					ge ? ge(l, f, p, 2, _e) : (_e[0] = l[f], _e[1] = l[f + 1], _e.length = 2), c && (c.zIndex = n[6]), he(_e, re), ++u;
					break;
				case J.DRAW_IMAGE:
					f = n[1], p = n[2], C = n[3], h = n[4], g = n[5];
					let ve = n[6], ye = n[7], be = n[8], xe = n[9], Se = n[10], Ce = n[11], we = n[12], Te = n[13];
					v = n[14] || "declutter";
					let Ee = n[15];
					if (!C && n.length >= 20) {
						w = n[19], T = n[20], E = n[21], ee = n[22];
						let e = this.drawLabelWithPointPlacement_(w, T, E, ee);
						C = e.label, n[3] = C;
						let t = n[23];
						h = (e.anchorX - t) * this.pixelRatio, n[4] = h;
						let r = n[24];
						g = (e.anchorY - r) * this.pixelRatio, n[5] = g, ve = C.height, n[6] = ve, Te = C.width, n[13] = Te;
					}
					let De;
					n.length > 25 && (De = n[25]);
					let Oe, A, j;
					n.length > 17 ? (Oe = n[16], A = n[17], j = n[18]) : (Oe = Hf, A = null, j = null), Se && k ? Ce += ne : !Se && !k && (Ce -= ne);
					let M = 0;
					for (; f < p; f += 2) {
						if (De && De[M++] < Te / this.pixelRatio) continue;
						let n = this.calculateImageOrLabelDimensions_(C.width, C.height, l[f], l[f + 1], Te, ve, h, g, be, xe, Ce, we, i, Oe, !!A || !!j, ae), r = [
							e,
							t,
							C,
							n,
							ye,
							A,
							j
						];
						if (s) {
							let e, t, i;
							if (Ee) {
								let n = p - f;
								if (!Ee[n]) {
									Ee[n] = {
										args: r,
										declutterMode: v
									};
									continue;
								}
								let a = Ee[n];
								e = a.args, t = a.declutterMode, delete Ee[n], i = Dh(e);
							}
							let a, o;
							if (e && (t !== "declutter" || !s.collides(i)) && (a = !0), (v !== "declutter" || !s.collides(n.declutterBox)) && (o = !0), t === "declutter" && v === "declutter") {
								let e = a && o;
								a = e, o = e;
							}
							a && (t !== "none" && s.insert(i), this.replayImageOrLabel_.apply(this, e)), o && (v !== "none" && s.insert(n.declutterBox), this.replayImageOrLabel_.apply(this, r));
						} else this.replayImageOrLabel_.apply(this, r);
					}
					++u;
					break;
				case J.DRAW_CHARS:
					let ke = n[1], Ae = n[2], je = n[3], Me = n[4];
					ee = n[5];
					let Ne = n[6], Pe = n[7], Fe = n[8];
					E = n[9];
					let Ie = n[10];
					w = n[11], Array.isArray(w) && (w = w.reduce(jh, "")), T = n[12];
					let Le = [n[13], n[13]];
					v = n[14] || "declutter";
					let Re = n[15], ze = n[16], Be = this.textStates[T], N = Be.font, Ve = [Be.scale[0] * Pe, Be.scale[1] * Pe], He;
					N in this.widths_ ? He = this.widths_[N] : (He = {}, this.widths_[N] = He);
					let Ue = hm(l, ke, Ae, 2), We = Math.abs(Ve[0]) * $f(N, w, He);
					if (Me || We <= Ue) {
						let n = this.textStates[T].textAlign, r = (Ue - We) * kh(w, n), i = bh(l, ke, Ae, 2, w, r, Ne, Math.abs(Ve[0]), $f, N, He, k ? 0 : this.viewRotation_, Re);
						drawChars: if (i) {
							let n = [], r, a, o, c, l;
							if (E) for (r = 0, a = i.length; r < a; ++r) {
								l = i[r], o = l[4], c = this.createLabel(o, T, "", E), h = l[2] + (Ve[0] < 0 ? -Ie : Ie) - ze, g = je * c.height + (.5 - je) * 2 * Ie * Ve[1] / Ve[0] - Fe;
								let a = this.calculateImageOrLabelDimensions_(c.width, c.height, l[0], l[1], c.width, c.height, h, g, 0, 0, l[3], Le, !1, Hf, !1, ae);
								if (s && v === "declutter" && s.collides(a.declutterBox)) break drawChars;
								n.push([
									e,
									t,
									c,
									a,
									1,
									null,
									null
								]);
							}
							if (ee) for (r = 0, a = i.length; r < a; ++r) {
								l = i[r], o = l[4], c = this.createLabel(o, T, ee, ""), h = l[2] - ze, g = je * c.height - Fe;
								let a = this.calculateImageOrLabelDimensions_(c.width, c.height, l[0], l[1], c.width, c.height, h, g, 0, 0, l[3], Le, !1, Hf, !1, ae);
								if (s && v === "declutter" && s.collides(a.declutterBox)) break drawChars;
								n.push([
									e,
									t,
									c,
									a,
									1,
									null,
									null
								]);
							}
							s && v !== "none" && s.load(n.map(Dh));
							for (let e = 0, t = n.length; e < t; ++e) this.replayImageOrLabel_.apply(this, n[e]);
						}
					}
					++u;
					break;
				case J.END_GEOMETRY:
					if (a !== void 0) {
						ae = n[1];
						let e = a(ae, ce, v);
						if (e) return e;
					}
					++u;
					break;
				case J.FILL:
					ie ? D++ : this.fill_(e), ++u;
					break;
				case J.MOVE_TO_LINE_TO:
					f = n[1], p = n[2], _ = n[3];
					let Ge, Ke, qe;
					if (_) {
						let e = (n[4] ?? !1) || Math.abs(l[f] - l[p - 2]) < 1e-6 && Math.abs(l[f + 1] - l[p - 1]) < 1e-6;
						_m(l, f, p, 2, _, e, m), ym(m, 2, e), Ge = m, Ke = 0, qe = Ge.length;
					} else Ge = l, Ke = f, qe = p;
					oe = Ge[Ke], se = Ge[Ke + 1], e.moveTo(oe, se), y = oe + .5 | 0, b = se + .5 | 0;
					for (let t = Ke + 2; t < qe; t += 2) oe = Ge[t], se = Ge[t + 1], x = oe + .5 | 0, S = se + .5 | 0, (t == qe - 2 || x !== y || S !== b) && (e.lineTo(oe, se), y = x, b = S);
					++u;
					break;
				case J.SET_FILL_STYLE:
					this.alignAndScaleFill_ = n[2], D ? (this.fill_(e), D = 0, O &&= (e.stroke(), 0)) : O && n[1] && (e.stroke(), O = 0), e.fillStyle = n[1], ++u;
					break;
				case J.SET_STROKE_STYLE:
					D && n[1] && (this.fill_(e), D = 0), O &&= (e.stroke(), 0), this.setStrokeStyle_(e, n), ++u;
					break;
				case J.STROKE:
					ie ? O++ : e.stroke(), ++u;
					break;
				default: ++u;
			}
		}
		D && this.fill_(e), O && e.stroke();
	}
	execute(e, t, n, r, i, a) {
		this.viewRotation_ = r, this.execute_(e, t, n, this.instructions, i, void 0, void 0, a);
	}
	executeHitDetection(e, t, n, r, i) {
		return this.viewRotation_ = n, this.execute_(e, [e.canvas.width, e.canvas.height], t, this.hitDetectionInstructions, !0, r, i);
	}
}, Nh = [
	"Polygon",
	"Circle",
	"LineString",
	"Image",
	"Text",
	"Default"
], Ph = ["Image", "Text"], Fh = Nh.filter((e) => !Ph.includes(e)), Ih = !1, Lh = !1;
function Rh() {
	let e = 0, t = (t) => {
		let n = Tl(1, 1, null, { willReadFrequently: t }), r = 0, i = performance.now();
		for (; performance.now() - i < 50; ++r) n.fillStyle = `rgba(255,0,${r % 256},1)`, n.fillRect(0, 0, 1, 1), n.getImageData(0, 0, 1, 1);
		return e = r > e ? r : e, r;
	};
	Ih = {
		[t(!0)]: !0,
		[t(!1)]: !1,
		[t(void 0)]: void 0
	}[e], Lh = !0;
}
var zh = class {
	constructor(e, t, n, r, i, a, o) {
		this.maxExtent_ = e, this.overlaps_ = r, this.pixelRatio_ = n, this.resolution_ = t, this.renderBuffer_ = a, this.executorsByZIndex_ = {}, this.hitDetectionContext_ = null, this.hitDetectionTransform_ = Fs(), this.renderedContext_ = null, this.deferredZIndexContexts_ = {}, this.createExecutors_(i, o);
	}
	clip(e, t) {
		let n = this.getClipCoords(t);
		e.beginPath(), e.moveTo(n[0], n[1]), e.lineTo(n[2], n[3]), e.lineTo(n[4], n[5]), e.lineTo(n[6], n[7]), e.clip();
	}
	createExecutors_(e, t) {
		for (let n in e) {
			let r = this.executorsByZIndex_[n];
			r === void 0 && (r = {}, this.executorsByZIndex_[n] = r);
			let i = e[n];
			for (let e in i) {
				let n = i[e];
				r[e] = new Mh(this.resolution_, this.pixelRatio_, this.overlaps_, n, t);
			}
		}
	}
	hasExecutors(e) {
		for (let t in this.executorsByZIndex_) {
			let n = this.executorsByZIndex_[t];
			for (let t = 0, r = e.length; t < r; ++t) if (e[t] in n) return !0;
		}
		return !1;
	}
	forEachFeatureAtCoordinate(e, t, n, r, i, a) {
		Lh === !1 && Rh(), r = Math.round(r);
		let o = r * 2 + 1, s = Us(this.hitDetectionTransform_, r + .5, r + .5, 1 / t, -1 / t, -n, -e[0], -e[1]), c = !this.hitDetectionContext_;
		c && (this.hitDetectionContext_ = Tl(o, o, null, { willReadFrequently: Ih }));
		let l = this.hitDetectionContext_;
		l.canvas.width !== o || l.canvas.height !== o ? (l.canvas.width = o, l.canvas.height = o) : c || l.clearRect(0, 0, o, o);
		let u;
		this.renderBuffer_ !== void 0 && (u = ca(), ha(u, e), ta(u, t * (this.renderBuffer_ + r), u));
		let d = Vh(r), f;
		function p(e, t, n) {
			let s = l.getImageData(0, 0, o, o).data;
			for (let c = 0, u = d.length; c < u; c++) if (s[d[c]] > 0) {
				if (!a || n === "none" || f !== "Image" && f !== "Text" || a.includes(e)) {
					let n = (d[c] - 3) / 4, a = r - n % o, s = r - (n / o | 0), l = i(e, t, a * a + s * s);
					if (l) return l;
				}
				l.clearRect(0, 0, o, o);
				break;
			}
		}
		let m = Object.keys(this.executorsByZIndex_).map(Number);
		m.sort(Xr);
		let h, g, _, v, y;
		for (h = m.length - 1; h >= 0; --h) {
			let e = m[h].toString();
			for (_ = this.executorsByZIndex_[e], g = Nh.length - 1; g >= 0; --g) if (f = Nh[g], v = _[f], v !== void 0 && (y = v.executeHitDetection(l, s, n, p, u), y)) return y;
		}
	}
	getClipCoords(e) {
		let t = this.maxExtent_;
		if (!t) return null;
		let n = t[0], r = t[1], i = t[2], a = t[3], o = [
			n,
			r,
			n,
			a,
			i,
			a,
			i,
			r
		];
		return Xs(o, 0, 8, 2, e, o), o;
	}
	isEmpty() {
		return Gr(this.executorsByZIndex_);
	}
	execute(e, t, n, r, i, a, o) {
		let s = Object.keys(this.executorsByZIndex_).map(Number);
		s.sort(o ? Zr : Xr), a ||= Nh;
		let c = Nh.length;
		for (let l = 0, u = s.length; l < u; ++l) {
			let u = s[l].toString(), d = this.executorsByZIndex_[u];
			for (let u = 0, f = a.length; u < f; ++u) {
				let f = a[u], p = d[f];
				if (p !== void 0) {
					let a = o === null ? void 0 : p.getZIndexContext(), u = a ? a.getContext() : e, d = this.maxExtent_ && f !== "Image" && f !== "Text";
					if (d && (u.save(), this.clip(u, n)), !a || f === "Text" || f === "Image" ? p.execute(u, t, n, r, i, o) : a.pushFunction((e) => p.execute(e, t, n, r, i, o)), d && u.restore(), a) {
						a.offset();
						let e = s[l] * c + Nh.indexOf(f);
						this.deferredZIndexContexts_[e] || (this.deferredZIndexContexts_[e] = []), this.deferredZIndexContexts_[e].push(a);
					}
				}
			}
		}
		this.renderedContext_ = e;
	}
	getDeferredZIndexContexts() {
		return this.deferredZIndexContexts_;
	}
	getRenderedContext() {
		return this.renderedContext_;
	}
	renderDeferred() {
		let e = this.deferredZIndexContexts_, t = Object.keys(e).map(Number).sort(Xr);
		for (let n = 0, r = t.length; n < r; ++n) e[t[n]].forEach((e) => {
			e.draw(this.renderedContext_), e.clear();
		}), e[t[n]].length = 0;
	}
}, Bh = {};
function Vh(e) {
	if (Bh[e] !== void 0) return Bh[e];
	let t = e * 2 + 1, n = e * e, r = Array(n + 1);
	for (let i = 0; i <= e; ++i) for (let a = 0; a <= e; ++a) {
		let o = i * i + a * a;
		if (o > n) break;
		let s = r[o];
		s || (s = [], r[o] = s), s.push(((e + i) * t + (e + a)) * 4 + 3), i > 0 && s.push(((e - i) * t + (e + a)) * 4 + 3), a > 0 && (s.push(((e + i) * t + (e - a)) * 4 + 3), i > 0 && s.push(((e - i) * t + (e - a)) * 4 + 3));
	}
	let i = [];
	for (let e = 0, t = r.length; e < t; ++e) r[e] && i.push(...r[e]);
	return Bh[e] = i, i;
}
//#endregion
//#region node_modules/ol/render/canvas/hitdetect.js
var Hh = .5;
function Uh(e, t, n, r, i, a, o, s, c) {
	let l = c ? ks(i, c) : i, u = Tl(e[0] * Hh, e[1] * Hh);
	u.imageSmoothingEnabled = !1;
	let d = u.canvas, f = new xm(u, Hh, i, null, o, s, c ? bs(Es(), c) : null), p = n.length, m = Math.floor(16777215 / p), h = {};
	for (let e = 1; e <= p; ++e) {
		let t = n[e - 1], i = t.getStyleFunction() || r;
		if (!i) continue;
		let o = i(t, a);
		if (!o) continue;
		Array.isArray(o) || (o = [o]);
		let s = (e * m).toString(16).padStart(7, "#00000");
		for (let e = 0, n = o.length; e < n; ++e) {
			let n = o[e], r = n.getGeometryFunction()(t);
			if (!r || !ja(l, r.getExtent())) continue;
			let i = n.clone(), a = i.getFill();
			a && a.setColor(s);
			let c = i.getStroke();
			c && (c.setColor(s), c.setLineDash(null)), i.setText(void 0);
			let u = n.getImage();
			if (u) {
				let e = u.getImageSize();
				if (!e) continue;
				let t = Tl(e[0], e[1], void 0, { alpha: !1 }), n = t.canvas;
				t.fillStyle = s, t.fillRect(0, 0, n.width, n.height), i.setImage(new cp({
					img: n,
					anchor: u.getAnchor(),
					anchorXUnits: "pixels",
					anchorYUnits: "pixels",
					offset: u.getOrigin(),
					opacity: 1,
					size: u.getSize(),
					scale: u.getScale(),
					rotation: u.getRotation(),
					rotateWithView: u.getRotateWithView()
				}));
			}
			let d = i.getZIndex() || 0, f = h[d];
			f || (f = {}, h[d] = f, f.Polygon = [], f.Circle = [], f.LineString = [], f.Point = []);
			let p = r.getType();
			if (p === "GeometryCollection") {
				let e = r.getGeometriesArrayRecursive();
				for (let t = 0, n = e.length; t < n; ++t) {
					let n = e[t];
					f[n.getType().replace("Multi", "")].push(n, i);
				}
			} else f[p.replace("Multi", "")].push(r, i);
		}
	}
	let g = Object.keys(h).map(Number).sort(Xr);
	for (let e = 0, n = g.length; e < n; ++e) {
		let n = h[g[e]];
		for (let e in n) {
			let r = n[e];
			for (let e = 0, n = r.length; e < n; e += 2) {
				f.setStyle(r[e + 1]);
				for (let n = 0, i = t.length; n < i; ++n) f.setTransform(t[n]), f.drawGeometry(r[e]);
			}
		}
	}
	return u.getImageData(0, 0, d.width, d.height);
}
function Wh(e, t, n) {
	let r = [];
	if (n) {
		let i = Math.floor(Math.round(e[0]) * Hh), a = Math.floor(Math.round(e[1]) * Hh), o = (Ri(i, 0, n.width - 1) + Ri(a, 0, n.height - 1) * n.width) * 4, s = n.data[o], c = n.data[o + 1], l = n.data[o + 2] + 256 * (c + 256 * s), u = Math.floor(16777215 / t.length);
		l && l % u === 0 && r.push(t[l / u - 1]);
	}
	return r;
}
//#endregion
//#region node_modules/ol/renderer/Layer.js
var Gh = 5, Kh = class extends ui {
	constructor(e) {
		super(), this.ready = !0, this.boundHandleImageChange_ = this.handleImageChange_.bind(this), this.layer_ = e, this.staleKeys_ = [], this.maxStaleKeys = Gh, this.renderedSourceKey_;
	}
	getStaleKeys() {
		return this.staleKeys_;
	}
	prependStaleKey(e) {
		this.staleKeys_.unshift(e), this.staleKeys_.length > this.maxStaleKeys && (this.staleKeys_.length = this.maxStaleKeys);
	}
	updateStaleKeys(e) {
		this.renderedSourceKey_ ? this.renderedSourceKey_ !== e && (this.prependStaleKey(this.renderedSourceKey_), this.renderedSourceKey_ = e) : this.renderedSourceKey_ = e;
	}
	getFeatures(e) {
		return R();
	}
	getData(e) {
		return null;
	}
	prepareFrame(e) {
		return R();
	}
	renderFrame(e, t) {
		return R();
	}
	forEachFeatureAtCoordinate(e, t, n, r, i) {}
	getLayer() {
		return this.layer_;
	}
	handleFontsChanged() {}
	handleImageChange_(e) {
		let t = e.target;
		(t.getState() === q.LOADED || t.getState() === q.ERROR) && this.renderIfReadyAndVisible();
	}
	loadImage(e) {
		let t = e.getState();
		return t != q.LOADED && t != q.ERROR && e.addEventListener(L.CHANGE, this.boundHandleImageChange_), t == q.IDLE && (e.load(), t = e.getState()), t == q.LOADED;
	}
	renderIfReadyAndVisible() {
		let e = this.getLayer();
		e && e.getVisible() && e.getSourceState() === "ready" && e.changed();
	}
	renderDeferred(e) {}
	disposeInternal() {
		delete this.layer_, super.disposeInternal();
	}
}, qh = [], Jh = null;
function Yh() {
	Jh = Tl(1, 1, void 0, { willReadFrequently: !0 });
}
var Xh = class extends Kh {
	constructor(e) {
		super(e), this.container = null, this.renderedResolution, this.tempTransform = Fs(), this.pixelTransform = Fs(), this.inversePixelTransform = Fs(), this.context = null, this.deferredContext_ = null, this.containerReused = !1, this.frameState = null;
	}
	getImageData(e, t, n) {
		Jh || Yh(), Jh.clearRect(0, 0, 1, 1);
		let r;
		try {
			Jh.drawImage(e, t, n, 1, 1, 0, 0, 1, 1), r = Jh.getImageData(0, 0, 1, 1).data;
		} catch {
			return Jh = null, null;
		}
		return r;
	}
	getBackground(e) {
		let t = this.getLayer().getBackground();
		return typeof t == "function" && (t = t(e.viewState.resolution)), t || void 0;
	}
	useContainer(e, t, n, r, i) {
		if (Fl(e) && this.pixelTransform[1] === 0 && this.pixelTransform[2] === 0 && this.pixelTransform[4] === 0 && this.pixelTransform[5] === 0 && e.width === r && e.height === i) {
			let t = e, r = t.getContext("2d");
			if (r) {
				this.container = e, this.context = r, this.containerReused = !0, n && (r.fillStyle = n, r.fillRect(0, 0, t.width, t.height));
				return;
			}
		}
		let a = this.getLayer().getClassName(), o, s;
		if (e && e.className === a && (!n || e && e.style.backgroundColor && ti(yd(e.style.backgroundColor), yd(n)))) {
			let t = e.firstElementChild;
			Fl(t) && (s = t.getContext("2d"));
		}
		if (s && Ys(s.canvas.style.transform, t) ? (this.container = e, this.context = s, this.containerReused = !0) : this.containerReused ? (this.container = null, this.context = null, this.containerReused = !1) : this.container && (this.container.style.backgroundColor = null), !this.container) {
			o = Ti ? Pl() : document.createElement("div"), o.className = a;
			let e = o.style;
			e.position = "absolute", e.width = "100%", e.height = "100%", s = Tl();
			let t = s.canvas;
			o.appendChild(t), e = t.style, e.position = "absolute", e.left = "0", e.transformOrigin = "top left", this.container = o, this.context = s;
		}
		!this.containerReused && n && !this.container.style.backgroundColor && (this.container.style.backgroundColor = n);
	}
	clipUnrotated(e, t, n) {
		let r = ka(n), i = Aa(n), a = xa(n), o = ba(n);
		Bs(t.coordinateToPixelTransform, r), Bs(t.coordinateToPixelTransform, i), Bs(t.coordinateToPixelTransform, a), Bs(t.coordinateToPixelTransform, o);
		let s = this.inversePixelTransform;
		Bs(s, r), Bs(s, i), Bs(s, a), Bs(s, o), e.save(), e.beginPath(), e.moveTo(Math.round(r[0]), Math.round(r[1])), e.lineTo(Math.round(i[0]), Math.round(i[1])), e.lineTo(Math.round(a[0]), Math.round(a[1])), e.lineTo(Math.round(o[0]), Math.round(o[1])), e.clip();
	}
	prepareContainer(e, t) {
		let n = e.extent, r = e.viewState.resolution, i = e.viewState.rotation, a = e.pixelRatio, o = Math.round(H(n) / r * a), s = Math.round(Ea(n) / r * a);
		Us(this.pixelTransform, e.size[0] / 2, e.size[1] / 2, 1 / a, 1 / a, i, -o / 2, -s / 2), Ws(this.inversePixelTransform, this.pixelTransform);
		let c = qs(this.pixelTransform), l = this.getBackground(e);
		if (this.useContainer(t, c, l, o, s), !this.containerReused) {
			let e = this.context.canvas;
			e.width != o || e.height != s ? (e.width = o, e.height = s) : this.context.clearRect(0, 0, o, s), c !== e.style.transform && (e.style.transform = c);
		}
	}
	dispatchRenderEvent_(e, t, n) {
		let r = this.getLayer();
		if (r.hasListener(e)) {
			let i = new nm(e, this.inversePixelTransform, n, t);
			r.dispatchEvent(i);
		}
	}
	preRender(e, t) {
		this.frameState = t, !t.declutter && this.dispatchRenderEvent_(Au.PRERENDER, e, t);
	}
	postRender(e, t) {
		t.declutter || this.dispatchRenderEvent_(Au.POSTRENDER, e, t);
	}
	renderDeferredInternal(e) {}
	getRenderContext(e) {
		return e.declutter && !this.deferredContext_ && (this.deferredContext_ = new xh()), e.declutter ? this.deferredContext_.getContext() : this.context;
	}
	renderDeferred(e) {
		e.declutter && (this.dispatchRenderEvent_(Au.PRERENDER, this.context, e), e.declutter && this.deferredContext_ && (this.deferredContext_.draw(this.context), this.deferredContext_.clear()), this.renderDeferredInternal(e), this.dispatchRenderEvent_(Au.POSTRENDER, this.context, e));
	}
	getRenderTransform(e, t, n, r, i, a, o) {
		let s = i / 2, c = a / 2, l = r / t, u = -l, d = -e[0] + o, f = -e[1];
		return Us(this.tempTransform, s, c, l, u, -n, d, f);
	}
	disposeInternal() {
		delete this.frameState, super.disposeInternal();
	}
}, Zh = class extends Xh {
	constructor(e) {
		super(e), this.boundHandleStyleImageChange_ = this.handleStyleImageChange_.bind(this), this.animatingOrInteracting_, this.hitDetectionImageData_ = null, this.clipExtent_ = null, this.extendX_ = !1, this.renderedFeatures_ = null, this.renderedRevision_ = -1, this.renderedResolution_ = NaN, this.renderedExtent_ = ca(), this.wrappedRenderedExtent_ = ca(), this.renderedRotation_, this.renderedCenter_ = null, this.renderedProjection_ = null, this.renderedPixelRatio_ = 1, this.renderedRenderOrder_ = null, this.renderedFrameDeclutter_, this.replayGroup_ = null, this.replayGroupChanged = !0, this.clipping = !0, this.targetContext_ = null, this.opacity_ = 1;
	}
	renderWorlds(e, t, n) {
		let r = t.extent, i = t.viewState, a = i.center, o = i.resolution, s = i.projection, c = i.rotation, l = s.getExtent(), u = this.getLayer().getSource(), d = this.getLayer().getDeclutter(), f = t.pixelRatio, p = t.viewHints, m = !(p[Ii.ANIMATING] || p[Ii.INTERACTING]), h = this.context, g = Math.round(H(r) / o * f), _ = Math.round(Ea(r) / o * f), v = u.getWrapX() && s.canWrapX(), y = v ? H(l) : null, b = v ? Math.ceil((r[2] - l[2]) / y) + (this.extendX_ ? 2 : 1) : 1, x = v ? Math.floor((r[0] - l[0]) / y) - +!!this.extendX_ : 0;
		do {
			let r = this.getRenderTransform(a, o, 0, f, g, _, x * y);
			t.declutter && (r = r.slice(0)), e.execute(h, [h.canvas.width, h.canvas.height], r, c, m, n === void 0 ? Nh : n ? Ph : Fh, n ? d && t.declutter[d] : void 0);
		} while (++x < b);
	}
	setDrawContext_() {
		this.opacity_ !== 1 && (this.targetContext_ = this.context, this.context = Tl(this.context.canvas.width, this.context.canvas.height, qh));
	}
	resetDrawContext_() {
		if (this.opacity_ !== 1 && this.targetContext_) {
			let e = this.targetContext_.globalAlpha;
			this.targetContext_.globalAlpha = this.opacity_, this.targetContext_.drawImage(this.context.canvas, 0, 0), this.targetContext_.globalAlpha = e, Ol(this.context), qh.push(this.context.canvas), this.context = this.targetContext_, this.targetContext_ = null;
		}
	}
	renderDeclutter(e) {
		this.replayGroup_ && this.getLayer().getDeclutter() && this.renderWorlds(this.replayGroup_, e, !0);
	}
	renderDeferredInternal(e) {
		this.replayGroup_ && (this.clipExtent_ && this.clipUnrotated(this.context, e, this.clipExtent_), this.replayGroup_.renderDeferred(), this.clipExtent_ &&= (this.context.restore(), null), this.resetDrawContext_());
	}
	renderFrame(e, t) {
		let n = e.layerStatesArray[e.layerIndex];
		this.opacity_ = n.opacity;
		let r = e.viewState;
		this.prepareContainer(e, t);
		let i = this.context, a = this.replayGroup_, o = a && !a.isEmpty();
		if (!o && !(this.getLayer().hasListener(Au.PRERENDER) || this.getLayer().hasListener(Au.POSTRENDER))) return this.container;
		this.setDrawContext_(), this.preRender(i, e);
		let s = r.projection;
		this.clipExtent_ = null;
		let c = !1;
		if (o && n.extent && this.clipping) {
			let t = As(n.extent, s);
			o = ja(t, e.extent), o && !aa(t, e.extent) && (e.declutter ? this.clipExtent_ = t : (this.clipUnrotated(i, e, t), c = !0));
		}
		return o && this.renderWorlds(a, e, !this.getLayer().getDeclutter() && void 0), c && i.restore(), this.postRender(i, e), this.renderedRotation_ !== r.rotation && (this.renderedRotation_ = r.rotation, this.hitDetectionImageData_ = null), e.declutter || this.resetDrawContext_(), this.container;
	}
	getFeatures(e) {
		return new Promise((t) => {
			if (this.frameState && !this.hitDetectionImageData_ && !this.animatingOrInteracting_) {
				let e = this.frameState.size.slice(), t = this.renderedCenter_, n = this.renderedResolution_, r = this.renderedRotation_, i = this.renderedProjection_, a = this.wrappedRenderedExtent_, o = this.getLayer(), s = [], c = e[0] * Hh, l = e[1] * Hh;
				s.push(this.getRenderTransform(t, n, r, Hh, c, l, 0).slice());
				let u = o.getSource(), d = i.getExtent();
				if (u.getWrapX() && i.canWrapX() && !aa(d, a)) {
					let e = a[0], i = H(d), o = 0, u;
					for (; e < d[0];) --o, u = i * o, s.push(this.getRenderTransform(t, n, r, Hh, c, l, u).slice()), e += i;
					for (o = 0, e = a[2]; e > d[2];) ++o, u = i * o, s.push(this.getRenderTransform(t, n, r, Hh, c, l, u).slice()), e -= i;
				}
				let f = Es();
				this.hitDetectionImageData_ = Uh(e, s, this.renderedFeatures_, o.getStyleFunction(), a, n, r, Tm(n, this.renderedPixelRatio_), f ? i : null);
			}
			t(Wh(e, this.renderedFeatures_, this.hitDetectionImageData_));
		});
	}
	forEachFeatureAtCoordinate(e, t, n, r, i) {
		if (!this.replayGroup_) return;
		let a = t.viewState.resolution, o = t.viewState.rotation, s = this.getLayer(), c = {}, l = function(e, t, n) {
			let a = z(e), o = c[a];
			if (!o) {
				if (n === 0) return c[a] = !0, r(e, s, t);
				i.push(c[a] = {
					feature: e,
					layer: s,
					geometry: t,
					distanceSq: n,
					callback: r
				});
			} else if (o !== !0 && n < o.distanceSq) {
				if (n === 0) return c[a] = !0, i.splice(i.lastIndexOf(o), 1), r(e, s, t);
				o.geometry = t, o.distanceSq = n;
			}
		}, u = this.getLayer().getDeclutter();
		return this.replayGroup_.forEachFeatureAtCoordinate(e, a, o, n, l, u ? t.declutter?.[u]?.all().map((e) => e.value) : null);
	}
	handleFontsChanged() {
		let e = this.getLayer();
		e.getVisible() && this.replayGroup_ && e.changed();
	}
	handleStyleImageChange_(e) {
		this.renderIfReadyAndVisible();
	}
	prepareFrame(e) {
		let t = this.getLayer(), n = t.getSource();
		if (!n) return !1;
		let r = e.viewHints[Ii.ANIMATING], i = e.viewHints[Ii.INTERACTING], a = t.getUpdateWhileAnimating(), o = t.getUpdateWhileInteracting();
		if (this.ready && !a && r || !o && i) return this.animatingOrInteracting_ = !0, !0;
		this.animatingOrInteracting_ = !1;
		let s = e.extent, c = e.viewState, l = c.projection, u = c.resolution, d = e.pixelRatio, f = t.getRevision(), p = t.getRenderBuffer(), m = t.getRenderOrder();
		m === void 0 && (m = wm);
		let h = c.center.slice(), g = ta(s, p * u), _ = g.slice(), v = [g.slice()], y = l.getExtent(), b = n.getWrapX() && l.canWrapX();
		if (this.extendX_ = !1, b) {
			let e = n.getExtent();
			e && !Ma(e) && (this.extendX_ = e[0] < y[0] || e[2] > y[2]);
		}
		if (b && (!aa(y, e.extent) || this.extendX_)) {
			let e = H(y), t = Math.max(H(g) / 2, e), n = y[0], r = y[2];
			this.extendX_ && (n -= e, r += e), g[0] = n - t, g[2] = r + t, Ka(h, l);
			let i = La(v[0], l);
			i[0] < y[0] && i[2] < y[2] ? v.push([
				i[0] + e,
				i[1],
				i[2] + e,
				i[3]
			]) : i[0] > y[0] && i[2] > y[2] && v.push([
				i[0] - e,
				i[1],
				i[2] - e,
				i[3]
			]);
		}
		if (this.ready && this.renderedResolution_ == u && this.renderedPixelRatio_ === d && this.renderedRevision_ == f && this.renderedRenderOrder_ == m && this.renderedFrameDeclutter_ === !!e.declutter && aa(this.wrappedRenderedExtent_, g)) return ti(this.renderedExtent_, _) || (this.hitDetectionImageData_ = null, this.renderedExtent_ = _), this.renderedCenter_ = h, this.replayGroupChanged = !1, !0;
		this.replayGroup_ = null;
		let x = new _h(Em(u, d), g, u, d), S = Es(), C;
		if (S) {
			for (let e = 0, t = v.length; e < t; ++e) {
				let t = v[e], r = ks(t, l);
				n.loadFeatures(r, js(u, l), S);
			}
			C = bs(S, l);
		} else for (let e = 0, t = v.length; e < t; ++e) n.loadFeatures(v[e], u, l);
		let w = Tm(u, d), T = !0, E = (e, n) => {
			let r, i = e.getStyleFunction() || t.getStyleFunction();
			if (i && (r = i(e, u)), r) {
				let t = this.renderFeature(e, w, r, x, C, this.getLayer().getDeclutter(), n);
				T &&= !t;
			}
		}, ee = ks(g, l), D = n.getFeaturesInExtent(ee);
		m && D.sort(m);
		for (let e = 0, t = D.length; e < t; ++e) E(D[e], e);
		this.renderedFeatures_ = D, this.ready = T;
		let O = x.finish(), te = new zh(g, u, d, n.getOverlaps(), O, t.getRenderBuffer(), !!e.declutter);
		return this.renderedResolution_ = u, this.renderedRevision_ = f, this.renderedRenderOrder_ = m, this.renderedFrameDeclutter_ = !!e.declutter, this.renderedExtent_ = _, this.wrappedRenderedExtent_ = g, this.renderedCenter_ = h, this.renderedProjection_ = l, this.renderedPixelRatio_ = d, this.replayGroup_ = te, this.hitDetectionImageData_ = null, this.replayGroupChanged = !0, !0;
	}
	renderFeature(e, t, n, r, i, a, o) {
		if (!n) return !1;
		let s = !1;
		if (Array.isArray(n)) for (let c = 0, l = n.length; c < l; ++c) s = Om(r, e, n[c], t, this.boundHandleStyleImageChange_, i, a, o) || s;
		else s = Om(r, e, n, t, this.boundHandleStyleImageChange_, i, a, o);
		return s;
	}
}, Qh = class extends em {
	constructor(e) {
		super(e);
	}
	createRenderer() {
		return new Zh(this);
	}
}, $h = class extends li {
	constructor(e, t, n) {
		super(), n ||= {}, this.tileCoord = e, this.state = t, this.key = "", this.transition_ = n.transition === void 0 ? 250 : n.transition, this.transitionStarts_ = {}, this.interpolate = !!n.interpolate;
	}
	changed() {
		this.dispatchEvent(L.CHANGE);
	}
	release() {
		this.setState(B.EMPTY);
	}
	getKey() {
		return this.key + "/" + this.tileCoord;
	}
	getTileCoord() {
		return this.tileCoord;
	}
	getState() {
		return this.state;
	}
	setState(e) {
		if (this.state !== B.EMPTY) {
			if (this.state !== B.ERROR && this.state > e) throw Error("Tile load sequence violation");
			this.state = e, this.changed();
		}
	}
	load() {
		R();
	}
	getAlpha(e, t) {
		if (!this.transition_) return 1;
		let n = this.transitionStarts_[e];
		if (!n) n = t, this.transitionStarts_[e] = n;
		else if (n === -1) return 1;
		let r = t - n + 1e3 / 60;
		return r >= this.transition_ ? 1 : Ya(r / this.transition_);
	}
	inTransition(e) {
		return this.transition_ ? this.transitionStarts_[e] !== -1 : !1;
	}
	endTransition(e) {
		this.transition_ && (this.transitionStarts_[e] = -1);
	}
	disposeInternal() {
		this.release(), super.disposeInternal();
	}
};
//#endregion
//#region node_modules/ol/DataTile.js
function eg(e) {
	return e instanceof Image || e instanceof HTMLCanvasElement || e instanceof HTMLVideoElement || e instanceof ImageBitmap ? e : null;
}
var tg = /* @__PURE__ */ Error("disposed"), ng = [256, 256], rg = class extends $h {
	constructor(e) {
		let t = B.IDLE;
		super(e.tileCoord, t, {
			transition: e.transition,
			interpolate: e.interpolate
		}), this.loader_ = e.loader, this.data_ = null, this.error_ = null, this.size_ = e.size || null, this.controller_ = e.controller || null;
	}
	getSize() {
		if (this.size_) return this.size_;
		let e = eg(this.data_);
		return e ? [e.width, e.height] : ng;
	}
	getData() {
		return this.data_;
	}
	getError() {
		return this.error_;
	}
	load() {
		if (this.state !== B.IDLE && this.state !== B.ERROR) return;
		this.state = B.LOADING, this.changed();
		let e = this;
		this.loader_().then(function(t) {
			e.data_ = t, e.state = B.LOADED, e.changed();
		}).catch(function(t) {
			e.error_ = t, e.state = B.ERROR, e.changed();
		});
	}
	disposeInternal() {
		this.controller_ &&= (this.controller_.abort(tg), null), super.disposeInternal();
	}
}, ig = class extends $h {
	constructor(e, t, n, r, i, a) {
		super(e, t, a), this.crossOrigin_ = r?.crossOrigin, this.referrerPolicy_ = r?.referrerPolicy, this.src_ = n, this.key = n, this.image_, Ti ? this.image_ = new OffscreenCanvas(1, 1) : (this.image_ = new Image(), this.crossOrigin_ !== null && (this.image_.crossOrigin = this.crossOrigin_), this.referrerPolicy_ !== void 0 && (this.image_.referrerPolicy = this.referrerPolicy_)), this.unlisten_ = null, this.tileLoadFunction_ = i;
	}
	getImage() {
		return this.image_;
	}
	setImage(e) {
		this.image_ = e, this.state = B.LOADED, this.unlistenImage_(), this.changed();
	}
	getCrossOrigin() {
		return this.crossOrigin_;
	}
	getReferrerPolicy() {
		return this.referrerPolicy_;
	}
	handleImageError_() {
		this.state = B.ERROR, this.unlistenImage_(), this.image_ = ag(), this.changed();
	}
	handleImageLoad_() {
		if (Ti) this.state = B.LOADED;
		else {
			let e = this.image_;
			this.state = e.naturalWidth && e.naturalHeight ? B.LOADED : B.EMPTY;
		}
		this.unlistenImage_(), this.changed();
	}
	load() {
		this.state == B.ERROR && (this.state = B.IDLE, this.image_ = new Image(), this.crossOrigin_ !== null && (this.image_.crossOrigin = this.crossOrigin_), this.referrerPolicy_ !== void 0 && (this.image_.referrerPolicy = this.referrerPolicy_)), this.state == B.IDLE && (this.state = B.LOADING, this.changed(), this.tileLoadFunction_(this, this.src_), this.unlisten_ = Cf(this.image_, this.handleImageLoad_.bind(this), this.handleImageError_.bind(this)));
	}
	unlistenImage_() {
		this.unlisten_ &&= (this.unlisten_(), null);
	}
	disposeInternal() {
		this.unlistenImage_(), this.image_ = null, super.disposeInternal();
	}
};
function ag() {
	let e = Tl(1, 1);
	return e.fillStyle = "rgba(0,0,0,0)", e.fillRect(0, 0, 1, 1), e.canvas;
}
//#endregion
//#region node_modules/ol/reproj.js
var og, sg = [];
function cg(e, t, n, r, i) {
	e.beginPath(), e.moveTo(0, 0), e.lineTo(t, n), e.lineTo(r, i), e.closePath(), e.save(), e.clip(), e.fillRect(0, 0, Math.max(t, r) + 1, Math.max(n, i)), e.restore();
}
function lg(e, t) {
	return Math.abs(e[t * 4] - 210) > 2 || Math.abs(e[t * 4 + 3] - 191.25) > 2;
}
function ug() {
	if (og === void 0) {
		let e = Tl(6, 6, sg);
		e.globalCompositeOperation = "lighter", e.fillStyle = "rgba(210, 0, 0, 0.75)", cg(e, 4, 5, 4, 0), cg(e, 4, 5, 0, 5);
		let t = e.getImageData(0, 0, 3, 3).data;
		og = lg(t, 0) || lg(t, 4) || lg(t, 8), Ol(e), sg.push(e.canvas);
	}
	return og;
}
function dg(e, t, n, r) {
	let i = Cs(n, t, e), a = fs(t, r, n), o = t.getMetersPerUnit();
	o !== void 0 && (a *= o);
	let s = e.getMetersPerUnit();
	s !== void 0 && (a /= s);
	let c = e.getExtent();
	if (!c || ia(c, i)) {
		let t = fs(e, a, i) / a;
		isFinite(t) && t > 0 && (a /= t);
	}
	return a;
}
function fg(e, t, n, r) {
	let i = dg(e, t, Sa(n), r);
	return (!isFinite(i) || i <= 0) && va(n, function(n) {
		return i = dg(e, t, n, r), isFinite(i) && i > 0;
	}), i;
}
function pg(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
	let m = Tl(Math.round(n * e), Math.round(n * t), sg);
	if (d || (m.imageSmoothingEnabled = !1), c.length === 0) return m.canvas;
	m.scale(n, n);
	function h(e) {
		return Math.round(e * n) / n;
	}
	m.globalCompositeOperation = "lighter";
	let g = ca();
	c.forEach(function(e, t, n) {
		ma(g, e.extent);
	});
	let _, v = n / r, y = (d ? 1 : 1 + 2 ** -24) / v;
	if (!f || c.length !== 1 || l !== 0) {
		if (_ = Tl(Math.round(H(g) * v), Math.round(Ea(g) * v), sg), d || (_.imageSmoothingEnabled = !1), i && p) {
			let e = (i[0] - g[0]) * v, t = -(i[3] - g[3]) * v, n = H(i) * v, r = Ea(i) * v;
			_.rect(e, t, n, r), _.clip();
		}
		c.forEach(function(e, t, n) {
			if (e.image.width > 0 && e.image.height > 0) {
				if (e.clipExtent) {
					_.save();
					let t = (e.clipExtent[0] - g[0]) * v, n = -(e.clipExtent[3] - g[3]) * v, r = H(e.clipExtent) * v, i = Ea(e.clipExtent) * v;
					_.rect(d ? t : Math.round(t), d ? n : Math.round(n), d ? r : Math.round(t + r) - Math.round(t), d ? i : Math.round(n + i) - Math.round(n)), _.clip();
				}
				let t = (e.extent[0] - g[0]) * v, n = -(e.extent[3] - g[3]) * v, r = H(e.extent) * v, i = Ea(e.extent) * v;
				_.drawImage(e.image, l, l, e.image.width - 2 * l, e.image.height - 2 * l, d ? t : Math.round(t), d ? n : Math.round(n), d ? r : Math.round(t + r) - Math.round(t), d ? i : Math.round(n + i) - Math.round(n)), e.clipExtent && _.restore();
			}
		});
	}
	let b = ka(o);
	return s.getTriangles().forEach(function(e, t, n) {
		let r = e.source, i = e.target, o = r[0][0], s = r[0][1], l = r[1][0], u = r[1][1], f = r[2][0], p = r[2][1], v = h((i[0][0] - b[0]) / a), x = h(-(i[0][1] - b[1]) / a), S = h((i[1][0] - b[0]) / a), C = h(-(i[1][1] - b[1]) / a), w = h((i[2][0] - b[0]) / a), T = h(-(i[2][1] - b[1]) / a), E = o, ee = s;
		o = 0, s = 0, l -= E, u -= ee, f -= E, p -= ee;
		let D = Vi([
			[
				l,
				u,
				0,
				0,
				S - v
			],
			[
				f,
				p,
				0,
				0,
				w - v
			],
			[
				0,
				0,
				l,
				u,
				C - x
			],
			[
				0,
				0,
				f,
				p,
				T - x
			]
		]);
		if (!D) return;
		if (m.save(), m.beginPath(), ug() || !d) {
			m.moveTo(S, C);
			let e = v - S, t = x - C;
			for (let n = 0; n < 4; n++) m.lineTo(S + h((n + 1) * e / 4), C + h(n * t / 3)), n != 3 && m.lineTo(S + h((n + 1) * e / 4), C + h((n + 1) * t / 3));
			m.lineTo(w, T);
		} else m.moveTo(S, C), m.lineTo(v, x), m.lineTo(w, T);
		m.clip(), m.transform(D[0], D[2], D[1], D[3], v, x), m.translate(g[0] - E, g[3] - ee);
		let O;
		if (_) O = _.canvas, m.scale(y, -y);
		else {
			let e = c[0], t = e.extent;
			O = e.image, m.scale(H(t) / O.width, -Ea(t) / O.height);
		}
		m.drawImage(O, 0, 0), m.restore();
	}), _ && (Ol(_), sg.push(_.canvas)), u && (m.save(), m.globalCompositeOperation = "source-over", m.strokeStyle = "black", m.lineWidth = 1, s.getTriangles().forEach(function(e, t, n) {
		let r = e.target, i = (r[0][0] - b[0]) / a, o = -(r[0][1] - b[1]) / a, s = (r[1][0] - b[0]) / a, c = -(r[1][1] - b[1]) / a, l = (r[2][0] - b[0]) / a, u = -(r[2][1] - b[1]) / a;
		m.beginPath(), m.moveTo(s, c), m.lineTo(i, o), m.lineTo(l, u), m.closePath(), m.stroke();
	}), m.restore()), m.canvas;
}
//#endregion
//#region node_modules/ol/reproj/Triangulation.js
var mg = 10, hg = .25, gg = class {
	constructor(e, t, n, r, i, a, o) {
		this.sourceProj_ = e, this.targetProj_ = t;
		let s = {}, c = o ? gs((e) => Bs(o, Cs(e, this.targetProj_, this.sourceProj_))) : Ss(this.targetProj_, this.sourceProj_);
		this.transformInv_ = function(e) {
			let t = e[0] + "/" + e[1];
			return s[t] || (s[t] = c(e)), s[t];
		}, this.maxSourceExtent_ = r, this.errorThresholdSquared_ = i * i, this.triangles_ = [], this.wrapsXInSource_ = !1, this.canWrapXInSource_ = this.sourceProj_.canWrapX() && !!r && !!this.sourceProj_.getExtent() && H(r) >= H(this.sourceProj_.getExtent()), this.sourceWorldWidth_ = this.sourceProj_.getExtent() ? H(this.sourceProj_.getExtent()) : null, this.targetWorldWidth_ = this.targetProj_.getExtent() ? H(this.targetProj_.getExtent()) : null;
		let l = ka(n), u = Aa(n), d = xa(n), f = ba(n), p = this.transformInv_(l), m = this.transformInv_(u), h = this.transformInv_(d), g = this.transformInv_(f), _ = mg + (a ? Math.max(0, Math.ceil(Math.log2(ya(n) / (a * a * 256 * 256)))) : 0);
		if (this.addQuad_(l, u, d, f, p, m, h, g, _), this.wrapsXInSource_) {
			let e = Infinity;
			this.triangles_.forEach(function(t, n, r) {
				e = Math.min(e, t.source[0][0], t.source[1][0], t.source[2][0]);
			}), this.triangles_.forEach((t) => {
				if (Math.max(t.source[0][0], t.source[1][0], t.source[2][0]) - e > this.sourceWorldWidth_ / 2) {
					let n = [
						[t.source[0][0], t.source[0][1]],
						[t.source[1][0], t.source[1][1]],
						[t.source[2][0], t.source[2][1]]
					];
					n[0][0] - e > this.sourceWorldWidth_ / 2 && (n[0][0] -= this.sourceWorldWidth_), n[1][0] - e > this.sourceWorldWidth_ / 2 && (n[1][0] -= this.sourceWorldWidth_), n[2][0] - e > this.sourceWorldWidth_ / 2 && (n[2][0] -= this.sourceWorldWidth_);
					let r = Math.min(n[0][0], n[1][0], n[2][0]);
					Math.max(n[0][0], n[1][0], n[2][0]) - r < this.sourceWorldWidth_ / 2 && (t.source = n);
				}
			});
		}
		s = {};
	}
	addTriangle_(e, t, n, r, i, a) {
		this.triangles_.push({
			source: [
				r,
				i,
				a
			],
			target: [
				e,
				t,
				n
			]
		});
	}
	addQuad_(e, t, n, r, i, a, o, s, c) {
		let l = $i([
			i,
			a,
			o,
			s
		]), u = this.sourceWorldWidth_ ? H(l) / this.sourceWorldWidth_ : null, d = this.sourceWorldWidth_, f = this.sourceProj_.canWrapX() && u > .5 && u < 1, p = !1;
		if (c > 0 && (this.targetProj_.isGlobal() && this.targetWorldWidth_ && (p = H($i([
			e,
			t,
			n,
			r
		])) / this.targetWorldWidth_ > hg || p), !f && this.sourceProj_.isGlobal() && u && (p = u > hg || p)), !p && this.maxSourceExtent_ && isFinite(l[0]) && isFinite(l[1]) && isFinite(l[2]) && isFinite(l[3]) && !ja(l, this.maxSourceExtent_)) return;
		let m = 0;
		if (!p && (!isFinite(i[0]) || !isFinite(i[1]) || !isFinite(a[0]) || !isFinite(a[1]) || !isFinite(o[0]) || !isFinite(o[1]) || !isFinite(s[0]) || !isFinite(s[1]))) {
			if (c > 0) p = !0;
			else if (m = (!isFinite(i[0]) || !isFinite(i[1]) ? 8 : 0) + (!isFinite(a[0]) || !isFinite(a[1]) ? 4 : 0) + (!isFinite(o[0]) || !isFinite(o[1]) ? 2 : 0) + +(!isFinite(s[0]) || !isFinite(s[1])), m != 1 && m != 2 && m != 4 && m != 8) return;
		}
		if (c > 0) {
			if (!p) {
				let t = [(e[0] + n[0]) / 2, (e[1] + n[1]) / 2], r = this.transformInv_(t), a;
				a = f ? (Wi(i[0], d) + Wi(o[0], d)) / 2 - Wi(r[0], d) : (i[0] + o[0]) / 2 - r[0];
				let s = (i[1] + o[1]) / 2 - r[1];
				p = a * a + s * s > this.errorThresholdSquared_;
			}
			if (p) {
				if (Math.abs(e[0] - n[0]) <= Math.abs(e[1] - n[1])) {
					let l = [(t[0] + n[0]) / 2, (t[1] + n[1]) / 2], u = this.transformInv_(l), d = [(r[0] + e[0]) / 2, (r[1] + e[1]) / 2], f = this.transformInv_(d);
					this.addQuad_(e, t, l, d, i, a, u, f, c - 1), this.addQuad_(d, l, n, r, f, u, o, s, c - 1);
				} else {
					let l = [(e[0] + t[0]) / 2, (e[1] + t[1]) / 2], u = this.transformInv_(l), d = [(n[0] + r[0]) / 2, (n[1] + r[1]) / 2], f = this.transformInv_(d);
					this.addQuad_(e, l, d, r, i, u, f, s, c - 1), this.addQuad_(l, t, n, d, u, a, o, f, c - 1);
				}
				return;
			}
		}
		if (f) {
			if (!this.canWrapXInSource_) return;
			this.wrapsXInSource_ = !0;
		}
		m & 11 || this.addTriangle_(e, n, r, i, o, s), m & 14 || this.addTriangle_(e, n, t, i, o, a), m && (m & 13 || this.addTriangle_(t, r, e, a, s, i), m & 7 || this.addTriangle_(t, r, n, a, s, o));
	}
	calculateSourceExtent() {
		let e = ca();
		return this.triangles_.forEach(function(t, n, r) {
			let i = t.source;
			ha(e, i[0]), ha(e, i[1]), ha(e, i[2]);
		}), e;
	}
	getTriangles() {
		return this.triangles_;
	}
}, _g = .5, vg = class extends $h {
	constructor(e, t, n, r, i, a, o, s, c, l, u, d) {
		super(i, B.IDLE, d), this.renderEdges_ = u !== void 0 && u, this.pixelRatio_ = o, this.gutter_ = s, this.canvas_ = null, this.sourceTileGrid_ = t, this.targetTileGrid_ = r, this.wrappedTileCoord_ = a || i, this.sourceTiles_ = [], this.sourcesListenerKeys_ = null, this.sourceZ_ = 0, this.clipExtent_ = e.canWrapX() ? e.getExtent() : void 0;
		let f = r.getTileCoordExtent(this.wrappedTileCoord_), p = this.targetTileGrid_.getExtent(), m = this.sourceTileGrid_.getExtent(), h = p ? Da(f, p) : f;
		if (ya(h) === 0) {
			this.state = B.EMPTY;
			return;
		}
		let g = e.getExtent();
		g && (m = m ? Da(m, g) : g);
		let _ = r.getResolution(this.wrappedTileCoord_[0]), v = fg(e, n, h, _);
		if (!isFinite(v) || v <= 0) {
			this.state = B.EMPTY;
			return;
		}
		let y = l === void 0 ? _g : l;
		if (this.triangulation_ = new gg(e, n, h, m, v * y, _), this.triangulation_.getTriangles().length === 0) {
			this.state = B.EMPTY;
			return;
		}
		this.sourceZ_ = t.getZForResolution(v);
		let b = this.triangulation_.calculateSourceExtent();
		if (m && (e.canWrapX() ? (b[1] = Ri(b[1], m[1], m[3]), b[3] = Ri(b[3], m[1], m[3])) : b = Da(b, m)), !ya(b)) this.state = B.EMPTY;
		else {
			let n = 0, r = 0;
			e.canWrapX() && (n = H(g), r = Math.floor((b[0] - g[0]) / n)), Ra(b.slice(), e, !0).forEach((e) => {
				let i = t.getTileRangeForExtentAndZ(e, this.sourceZ_);
				for (let e = i.minX; e <= i.maxX; e++) for (let t = i.minY; t <= i.maxY; t++) {
					let i = r * n;
					this.sourceTiles_.push({
						getTile: () => c(this.sourceZ_, e, t, o),
						offset: i
					});
				}
				++r;
			}), this.sourceTiles_.length === 0 && (this.state = B.EMPTY);
		}
	}
	getImage() {
		return this.canvas_;
	}
	reproject_() {
		let e = [];
		if (this.sourceTiles_.forEach((t) => {
			let n = t.tile;
			if (n && n.getState() == B.LOADED) {
				let r = this.sourceTileGrid_.getTileCoordExtent(n.tileCoord);
				r[0] += t.offset, r[2] += t.offset;
				let i = this.clipExtent_?.slice();
				i && (i[0] += t.offset, i[2] += t.offset), e.push({
					extent: r,
					clipExtent: i,
					image: n.getImage()
				});
			}
		}), this.sourceTiles_.length = 0, e.length === 0) this.state = B.ERROR;
		else {
			let t = this.wrappedTileCoord_[0], n = this.targetTileGrid_.getTileSize(t), r = typeof n == "number" ? n : n[0], i = typeof n == "number" ? n : n[1], a = this.targetTileGrid_.getResolution(t), o = this.sourceTileGrid_.getResolution(this.sourceZ_), s = this.targetTileGrid_.getTileCoordExtent(this.wrappedTileCoord_);
			this.canvas_ = pg(r, i, this.pixelRatio_, o, this.sourceTileGrid_.getExtent(), a, s, this.triangulation_, e, this.gutter_, this.renderEdges_, this.interpolate), this.state = B.LOADED;
		}
		this.changed();
	}
	load() {
		for (let e of this.sourceTiles_) e.tile = e.getTile();
		if (this.state == B.IDLE) {
			this.state = B.LOADING, this.changed();
			let e = 0;
			this.sourcesListenerKeys_ = [], this.sourceTiles_.forEach(({ tile: t }) => {
				let n = t.getState();
				if (n == B.IDLE || n == B.LOADING) {
					e++;
					let n = I(t, L.CHANGE, (r) => {
						let i = t.getState();
						(i == B.LOADED || i == B.ERROR || i == B.EMPTY) && (qr(n), e--, e === 0 && (this.unlistenSources_(), this.reproject_()));
					});
					this.sourcesListenerKeys_.push(n);
				}
			}), e === 0 ? setTimeout(this.reproject_.bind(this), 0) : this.sourceTiles_.forEach(function({ tile: e }, t, n) {
				e.getState() == B.IDLE && e.load();
			});
		}
	}
	unlistenSources_() {
		this.sourcesListenerKeys_.forEach(qr), this.sourcesListenerKeys_ = null;
	}
	release() {
		this.canvas_ &&= (Ol(this.canvas_.getContext("2d")), sg.push(this.canvas_), null), this.sourceTiles_.length = 0, super.release();
	}
}, yg = class {
	constructor(e, t, n, r) {
		this.minX = e, this.maxX = t, this.minY = n, this.maxY = r;
	}
	contains(e) {
		return this.containsXY(e[1], e[2]);
	}
	containsTileRange(e) {
		return this.minX <= e.minX && e.maxX <= this.maxX && this.minY <= e.minY && e.maxY <= this.maxY;
	}
	containsXY(e, t) {
		return this.minX <= e && e <= this.maxX && this.minY <= t && t <= this.maxY;
	}
	equals(e) {
		return this.minX == e.minX && this.minY == e.minY && this.maxX == e.maxX && this.maxY == e.maxY;
	}
	extend(e) {
		e.minX < this.minX && (this.minX = e.minX), e.maxX > this.maxX && (this.maxX = e.maxX), e.minY < this.minY && (this.minY = e.minY), e.maxY > this.maxY && (this.maxY = e.maxY);
	}
	getHeight() {
		return this.maxY - this.minY + 1;
	}
	getSize() {
		return [this.getWidth(), this.getHeight()];
	}
	getWidth() {
		return this.maxX - this.minX + 1;
	}
	intersects(e) {
		return this.minX <= e.maxX && this.maxX >= e.minX && this.minY <= e.maxY && this.maxY >= e.minY;
	}
};
function bg(e, t, n, r, i) {
	return i === void 0 ? new yg(e, t, n, r) : (i.minX = e, i.maxX = t, i.minY = n, i.maxY = r, i);
}
//#endregion
//#region node_modules/ol/structs/LRUCache.js
var xg = class {
	constructor(e) {
		this.highWaterMark = e === void 0 ? 2048 : e, this.count_ = 0, this.entries_ = {}, this.oldest_ = null, this.newest_ = null;
	}
	deleteOldest() {
		let e = this.pop();
		e instanceof Jr && e.dispose();
	}
	canExpireCache() {
		return this.highWaterMark > 0 && this.getCount() > this.highWaterMark;
	}
	expireCache(e) {
		for (; this.canExpireCache();) this.deleteOldest();
	}
	clear() {
		for (; this.oldest_;) this.deleteOldest();
	}
	containsKey(e) {
		return this.entries_.hasOwnProperty(e);
	}
	forEach(e) {
		let t = this.oldest_;
		for (; t;) e(t.value_, t.key_, this), t = t.newer;
	}
	get(e, t) {
		let n = this.entries_[e];
		return V(n !== void 0, "Tried to get a value for a key that does not exist in the cache"), n === this.newest_ ? n.value_ : (n === this.oldest_ ? (this.oldest_ = this.oldest_.newer, this.oldest_.older = null) : (n.newer.older = n.older, n.older.newer = n.newer), n.newer = null, n.older = this.newest_, this.newest_.newer = n, this.newest_ = n, n.value_);
	}
	remove(e) {
		let t = this.entries_[e];
		return V(t !== void 0, "Tried to get a value for a key that does not exist in the cache"), t === this.newest_ ? (this.newest_ = t.older, this.newest_ && (this.newest_.newer = null)) : t === this.oldest_ ? (this.oldest_ = t.newer, this.oldest_ && (this.oldest_.older = null)) : (t.newer.older = t.older, t.older.newer = t.newer), delete this.entries_[e], --this.count_, t.value_;
	}
	getCount() {
		return this.count_;
	}
	getKeys() {
		let e = Array(this.count_), t = 0, n;
		for (n = this.newest_; n; n = n.older) e[t++] = n.key_;
		return e;
	}
	getValues() {
		let e = Array(this.count_), t = 0, n;
		for (n = this.newest_; n; n = n.older) e[t++] = n.value_;
		return e;
	}
	peekLast() {
		return this.oldest_.value_;
	}
	peekLastKey() {
		return this.oldest_.key_;
	}
	peekFirstKey() {
		return this.newest_.key_;
	}
	peek(e) {
		return this.entries_[e]?.value_;
	}
	pop() {
		let e = this.oldest_;
		return delete this.entries_[e.key_], e.newer && (e.newer.older = null), this.oldest_ = e.newer, this.oldest_ || (this.newest_ = null), --this.count_, e.value_;
	}
	replace(e, t) {
		this.get(e), this.entries_[e].value_ = t;
	}
	set(e, t) {
		V(!(e in this.entries_), "Tried to set a value for a key that is used already");
		let n = {
			key_: e,
			newer: null,
			older: this.newest_,
			value_: t
		};
		this.newest_ ? this.newest_.newer = n : this.oldest_ = n, this.newest_ = n, this.entries_[e] = n, ++this.count_;
	}
	setSize(e) {
		this.highWaterMark = e;
	}
};
//#endregion
//#region node_modules/ol/tilecoord.js
function Sg(e, t, n, r) {
	return r === void 0 ? [
		e,
		t,
		n
	] : (r[0] = e, r[1] = t, r[2] = n, r);
}
function Cg(e, t, n) {
	return e + "/" + t + "/" + n;
}
function wg(e, t, n, r, i) {
	return `${z(e)},${t},${Cg(n, r, i)}`;
}
function Tg(e) {
	return Eg(e[0], e[1], e[2]);
}
function Eg(e, t, n) {
	return (t << e) + n;
}
function Dg(e, t) {
	let n = e[0], r = e[1], i = e[2];
	if (t.getMinZoom() > n || n > t.getMaxZoom()) return !1;
	let a = t.getFullTileRange(n);
	return !a || a.containsXY(r, i);
}
//#endregion
//#region node_modules/ol/renderer/canvas/TileLayer.js
function Og(e, t, n) {
	if (!(n in e)) return e[n] = /* @__PURE__ */ new Set([t]), !0;
	let r = e[n], i = r.has(t);
	return i || r.add(t), !i;
}
function kg(e, t, n) {
	let r = e[n];
	return r ? r.delete(t) : !1;
}
function Ag(e, t) {
	let n = e.layerStatesArray[e.layerIndex];
	n.extent && (t = Da(t, As(n.extent, e.viewState.projection)));
	let r = n.layer.getRenderSource();
	if (!r.getWrapX()) {
		let n = r.getTileGridForProjection(e.viewState.projection).getExtent();
		n && (t = Da(t, n));
	}
	return t;
}
var jg = class extends Xh {
	constructor(e, t) {
		super(e), t ||= {}, this.extentChanged = !0, this.renderComplete = !1, this.renderedExtent_ = null, this.renderedPixelRatio, this.renderedProjection = null, this.renderedTiles = [], this.renderedSourceRevision_, this.tempExtent = ca(), this.tempTileRange_ = new yg(0, 0, 0, 0), this.tempTileCoord_ = Sg(0, 0, 0);
		let n = t.cacheSize === void 0 ? 512 : t.cacheSize;
		this.tileCache_ = new xg(n), this.sourceTileCache_ = null, this.layerExtent = null, this.maxStaleKeys = n * .5;
	}
	getTileCache() {
		return this.tileCache_;
	}
	getSourceTileCache() {
		return this.sourceTileCache_ ||= new xg(512), this.sourceTileCache_;
	}
	getOrCreateTile(e, t, n, r) {
		let i = this.tileCache_, a = this.getLayer().getSource(), o = wg(a, a.getKey(), e, t, n), s;
		if (i.containsKey(o)) s = i.get(o);
		else {
			let c = r.viewState.projection, l = a.getProjection();
			if (s = a.getTile(e, t, n, r.pixelRatio, c, !l || ys(l, c) ? void 0 : this.getSourceTileCache()), !s) return null;
			i.set(o, s);
		}
		return s;
	}
	getTile(e, t, n, r) {
		return this.getOrCreateTile(e, t, n, r) || null;
	}
	getData(e) {
		let t = this.frameState;
		if (!t) return null;
		let n = this.getLayer(), r = Bs(t.pixelToCoordinateTransform, e.slice()), i = n.getExtent();
		if (i && !ia(i, r)) return null;
		let a = t.viewState, o = n.getRenderSource(), s = o.getTileGridForProjection(a.projection), c = o.getTilePixelRatio(t.pixelRatio);
		for (let e = s.getZForResolution(a.resolution); e >= s.getMinZoom(); --e) {
			let n = s.getTileCoordForCoordAndZ(r, e), i = this.getTile(e, n[1], n[2], t);
			if (!i || i.getState() !== B.LOADED) continue;
			let l = s.getOrigin(e), u = Cd(s.getTileSize(e)), d = s.getResolution(e), f;
			if (i instanceof ig || i instanceof vg) f = i.getImage();
			else if (i instanceof rg) {
				if (f = eg(i.getData()), !f) continue;
			} else continue;
			let p = Math.floor(c * ((r[0] - l[0]) / d - n[1] * u[0])), m = Math.floor(c * ((l[1] - r[1]) / d - n[2] * u[1])), h = Math.round(c * o.getGutterForProjection(a.projection));
			return this.getImageData(f, p + h, m + h);
		}
		return null;
	}
	prepareFrame(e) {
		this.renderedProjection ? e.viewState.projection !== this.renderedProjection && (this.tileCache_.clear(), this.renderedProjection = e.viewState.projection) : this.renderedProjection = e.viewState.projection;
		let t = this.getLayer().getSource();
		if (!t) return !1;
		let n = t.getRevision();
		return this.renderedSourceRevision_ ? this.renderedSourceRevision_ !== n && (this.renderedSourceRevision_ = n, this.renderedSourceKey_ === t.getKey() && (this.tileCache_.clear(), this.sourceTileCache_?.clear())) : this.renderedSourceRevision_ = n, !0;
	}
	enqueueTilesForNextExtent() {
		return !0;
	}
	enqueueTiles(e, t, n, r, i) {
		let a = e.viewState, o = this.getLayer(), s = o.getRenderSource(), c = s.getTileGridForProjection(a.projection), l = z(s);
		l in e.wantedTiles || (e.wantedTiles[l] = {});
		let u = e.wantedTiles[l], d = o.getMapInternal(), f = Math.max(n - i, c.getMinZoom(), c.getZForResolution(Math.min(o.getMaxResolution(), d ? d.getView().getResolutionForZoom(Math.max(o.getMinZoom(), 0)) : c.getResolution(0)), s.zDirection)), p = a.rotation, m = p ? Ta(a.center, a.resolution, p, e.size) : void 0;
		for (let i = n; i >= f; --i) {
			let n = c.getTileRangeForExtentAndZ(t, i, this.tempTileRange_), a = c.getResolution(i);
			for (let t = n.minX; t <= n.maxX; ++t) for (let o = n.minY; o <= n.maxY; ++o) {
				if (p && !c.tileCoordIntersectsViewport([
					i,
					t,
					o
				], m)) continue;
				let n = this.getTile(i, t, o, e);
				if (!n || !Og(r, n, i)) continue;
				let s = n.getKey();
				if (u[s] = !0, n.getState() === B.IDLE && !e.tileQueue.isKeyQueued(s)) {
					let r = Sg(i, t, o, this.tempTileCoord_);
					e.tileQueue.enqueue([
						n,
						l,
						c.getTileCoordCenter(r),
						a
					]);
				}
			}
		}
	}
	findStaleTile_(e, t) {
		let n = this.tileCache_, r = e[0], i = e[1], a = e[2], o = this.getStaleKeys();
		for (let e = 0; e < o.length; ++e) {
			let s = wg(this.getLayer().getSource(), o[e], r, i, a);
			if (n.containsKey(s)) {
				let e = n.peek(s);
				if (e.getState() === B.LOADED) return e.endTransition(z(this)), Og(t, e, r), !0;
			}
		}
		return !1;
	}
	findAltTiles_(e, t, n, r) {
		let i = e.getTileRangeForTileCoordAndZ(t, n, this.tempTileRange_);
		if (!i) return !1;
		let a = !0, o = this.tileCache_, s = this.getLayer().getRenderSource(), c = s.getKey();
		for (let e = i.minX; e <= i.maxX; ++e) for (let t = i.minY; t <= i.maxY; ++t) {
			let i = wg(s, c, n, e, t), l = !1;
			if (o.containsKey(i)) {
				let e = o.peek(i);
				e.getState() === B.LOADED && (Og(r, e, n), l = !0);
			}
			l || (a = !1);
		}
		return a;
	}
	renderFrame(e, t) {
		this.renderComplete = !0;
		let n = e.layerStatesArray[e.layerIndex], r = e.viewState, i = r.projection, a = r.resolution, o = r.center, s = e.pixelRatio, c = this.getLayer(), l = c.getSource(), u = l.getTileGridForProjection(i), d = u.getZForResolution(a, l.zDirection), f = u.getResolution(d);
		this.updateStaleKeys(l.getKey());
		let p = e.extent, m = l.getTilePixelRatio(s);
		this.prepareContainer(e, t);
		let h = this.context.canvas.width, g = this.context.canvas.height;
		this.layerExtent = n.extent ? As(n.extent, i) : null, this.layerExtent && (p = Da(p, this.layerExtent));
		let _ = f * h / 2 / m, v = f * g / 2 / m, y = [
			o[0] - _,
			o[1] - v,
			o[0] + _,
			o[1] + v
		], b = {};
		this.renderedTiles.length = 0;
		let x = c.getPreload();
		if (e.nextExtent && this.enqueueTilesForNextExtent()) {
			let t = u.getZForResolution(r.nextResolution, l.zDirection), n = Ag(e, e.nextExtent);
			this.enqueueTiles(e, n, t, b, x);
		}
		let S = Ag(e, p);
		if (this.enqueueTiles(e, S, d, b, 0), x > 0 && setTimeout(() => {
			this.enqueueTiles(e, S, d - 1, b, x - 1);
		}, 0), !(d in b)) return this.container;
		let C = z(this), w = e.time;
		for (let t of b[d]) {
			let n = t.getState();
			if (n === B.EMPTY) continue;
			let r = t.tileCoord;
			if (n === B.LOADED && t.getAlpha(C, w) === 1) {
				t.endTransition(C);
				continue;
			}
			if (n !== B.ERROR && (this.renderComplete = !1), this.findStaleTile_(r, b)) {
				kg(b, t, d), e.animate = !0;
				continue;
			}
			if (this.findAltTiles_(u, r, d + 1, b)) continue;
			let i = u.getMinZoom();
			for (let e = d - 1; e >= i && !this.findAltTiles_(u, r, e, b); --e);
		}
		let T = f / a * s / m, E = this.getRenderContext(e);
		Us(this.tempTransform, h / 2, g / 2, T, T, 0, -h / 2, -g / 2), this.layerExtent && this.clipUnrotated(E, e, this.layerExtent), l.getInterpolate() || (E.imageSmoothingEnabled = !1), this.preRender(E, e);
		let ee = Object.keys(b).map(Number);
		ee.sort(Xr);
		let D = [], O = [], te = [];
		for (let t = ee.length - 1; t >= 0; --t) {
			let n = ee[t], r = l.getTilePixelSize(n, s, i), a = u.getResolution(n) / f, o = r[0] * a * T, c = r[1] * a * T, p = u.getTileCoordForCoordAndZ(ka(y), n), h = u.getTileCoordExtent(p), g = Bs(this.tempTransform, [m * (h[0] - y[0]) / f, m * (y[3] - h[3]) / f]), _ = m * l.getGutterForProjection(i);
			for (let t of b[n]) {
				if (t.getState() !== B.LOADED) continue;
				let r = t.tileCoord, i = p[1] - r[1], a = Math.round(g[0] - (i - 1) * o), s = p[2] - r[2], u = Math.round(g[1] - (s - 1) * c), f = Math.round(g[0] - i * o), m = Math.round(g[1] - s * c), h = a - f, v = u - m, y = n === d;
				if (y && t.inTransition(C)) {
					te.push({
						tile: t,
						x: f,
						y: m,
						w: h,
						h: v,
						gutter: _
					}), this.renderedTiles.unshift(t), this.updateUsedTiles(e.usedTiles, l, t);
					continue;
				}
				let b = [
					f,
					m,
					f + h,
					m + v
				], x = [];
				for (let e = 0, t = D.length; e < t; ++e) n < O[e] && ja(b, D[e]) && x.push(D[e]);
				let S;
				x.length > 0 && (S = za(b, x)), D.push(b), O.push(n), this.drawTile(t, e, f, m, h, v, _, y, S), this.renderedTiles.unshift(t), this.updateUsedTiles(e.usedTiles, l, t);
			}
		}
		for (let t = 0, n = te.length; t < n; ++t) {
			let { tile: n, x: r, y: i, w: a, h: o, gutter: s } = te[t];
			this.drawTile(n, e, r, i, a, o, s, !0, void 0);
		}
		return this.renderedResolution = f, this.extentChanged = !this.renderedExtent_ || !pa(this.renderedExtent_, y), this.renderedExtent_ = y, this.renderedPixelRatio = s, this.postRender(this.context, e), this.layerExtent && E.restore(), E.imageSmoothingEnabled = !0, this.renderComplete && e.postRenderFunctions.push((e, t) => {
			let n = z(l), r = t.wantedTiles[n], i = r ? Object.keys(r).length : 0;
			this.updateCacheSize(i), this.tileCache_.expireCache(), this.sourceTileCache_?.expireCache();
		}), this.container;
	}
	updateCacheSize(e) {
		this.tileCache_.highWaterMark = Math.max(this.tileCache_.highWaterMark, e * 2);
	}
	drawTile(e, t, n, r, i, a, o, s, c) {
		let l;
		if (e instanceof rg) {
			if (l = eg(e.getData()), !l) throw Error("Rendering array data is not yet supported");
		} else l = this.getTileImage(e);
		if (!l) return;
		let u = this.getRenderContext(t), d = z(this), f = t.layerStatesArray[t.layerIndex], p = f.opacity * (s ? e.getAlpha(d, t.time) : 1), m = p !== u.globalAlpha;
		m && (u.save(), u.globalAlpha = p);
		let h = l.width - 2 * o, g = l.height - 2 * o;
		if (c) {
			let e = h / i, t = g / a;
			for (let i = 0, a = c.length; i < a; ++i) {
				let a = c[i], s = a[0], d = a[1], f = a[2] - a[0], p = a[3] - a[1];
				u.drawImage(l, o + (s - n) * e, o + (d - r) * t, f * e, p * t, s, d, f, p);
			}
		} else u.drawImage(l, o, o, h, g, n, r, i, a);
		m && u.restore(), p === f.opacity ? s && e.endTransition(d) : t.animate = !0;
	}
	getImage() {
		let e = this.context;
		return e ? e.canvas : null;
	}
	getTileImage(e) {
		return e.getImage();
	}
	updateUsedTiles(e, t, n) {
		let r = z(t);
		r in e || (e[r] = {}), e[r][n.getKey()] = !0;
	}
}, Mg = {
	PRELOAD: "preload",
	USE_INTERIM_TILES_ON_ERROR: "useInterimTilesOnError"
}, Ng = class extends ju {
	constructor(e) {
		e ||= {};
		let t = Object.assign({}, e), n = e.cacheSize;
		delete e.cacheSize, delete t.preload, delete t.useInterimTilesOnError, super(t), this.on, this.once, this.un, this.cacheSize_ = n, this.setPreload(e.preload === void 0 ? 0 : e.preload), this.setUseInterimTilesOnError(e.useInterimTilesOnError === void 0 || e.useInterimTilesOnError);
	}
	getCacheSize() {
		return this.cacheSize_;
	}
	getPreload() {
		return this.get(Mg.PRELOAD);
	}
	setPreload(e) {
		this.set(Mg.PRELOAD, e);
	}
	getUseInterimTilesOnError() {
		return this.get(Mg.USE_INTERIM_TILES_ON_ERROR);
	}
	setUseInterimTilesOnError(e) {
		this.set(Mg.USE_INTERIM_TILES_ON_ERROR, e);
	}
	getData(e) {
		return super.getData(e);
	}
}, Pg = class extends Ng {
	constructor(e) {
		super(e);
	}
	createRenderer() {
		return new jg(this, { cacheSize: this.getCacheSize() });
	}
}, Fg = {
	image: [
		"Polygon",
		"Circle",
		"LineString",
		"Image",
		"Text"
	],
	hybrid: ["Polygon", "LineString"],
	vector: []
}, Ig = {
	hybrid: [
		"Image",
		"Text",
		"Default"
	],
	vector: [
		"Polygon",
		"Circle",
		"LineString",
		"Image",
		"Text",
		"Default"
	]
}, Lg = class extends jg {
	constructor(e, t) {
		super(e, t), this.boundHandleStyleImageChange_ = this.handleStyleImageChange_.bind(this), this.renderedLayerRevision_, this.renderedPixelToCoordinateTransform_ = null, this.renderedRotation_, this.renderedOpacity_ = 1, this.tmpTransform_ = Fs(), this.tileClipContexts_ = null;
	}
	enqueueTilesForNextExtent() {
		return this.getLayer().getRenderMode() !== "vector";
	}
	drawTile(e, t, n, r, i, a, o, s, c) {
		this.updateExecutorGroup_(e, t.pixelRatio, t.viewState.projection), this.tileImageNeedsRender_(e) && this.renderTileImage_(e, t), super.drawTile(e, t, n, r, i, a, o, s, c);
	}
	getTile(e, t, n, r) {
		let i = this.getOrCreateTile(e, t, n, r);
		if (!i) return null;
		let a = r.viewState, o = a.resolution, s = r.viewHints, c = this.getLayer().getSource(), l = c.getTileGridForProjection(a.projection), u = !(s[Ii.ANIMATING] || s[Ii.INTERACTING]), d = l.getZForResolution(o, c.zDirection) === e;
		return u && d ? i.wantedResolution = o : i.wantedResolution ||= l.getResolution(e), i;
	}
	prepareFrame(e) {
		let t = this.getLayer().getRevision();
		return this.renderedLayerRevision_ !== t && (this.renderedLayerRevision_ = t, this.renderedTiles.length = 0), super.prepareFrame(e);
	}
	updateExecutorGroup_(e, t, n) {
		let r = this.getLayer(), i = r.getRevision(), a = r.getRenderOrder() || null, o = e.wantedResolution, s = e.getReplayState(r);
		if (!s.dirty && s.renderedResolution === o && s.renderedRevision == i && s.renderedPixelRatio === t && s.renderedRenderOrder == a) return;
		let c = r.getSource(), l = !!r.getDeclutter(), u = c.getTileGrid(), d = c.getTileGridForProjection(n).getTileCoordExtent(e.wrappedTileCoord), f = c.getSourceTiles(t, n, e), p = z(r);
		delete e.hitDetectionImageData[p], e.executorGroups[p] = [], s.dirty = !1;
		for (let i = 0, m = f.length; i < m; ++i) {
			let m = f[i];
			if (m.getState() != B.LOADED) continue;
			let h = c.getProjection(), g = m.tileCoord, _ = u.getTileCoordExtent(g);
			n && h && !ys(n, h) && (_ = ws(_, h, n, 32));
			let v = Da(d, _), y = ta(v, r.getRenderBuffer() * o, this.tempExtent), b = pa(_, v) ? null : y, x = new _h(0, v, o, t), S = Tm(o, t), C = function(e, t) {
				let n, i = e.getStyleFunction() || r.getStyleFunction();
				if (i && (n = i(e, o)), n) {
					let r = this.renderFeature(e, S, n, x, l, t);
					s.dirty = s.dirty || r;
				}
			}, w = m.getFeatures();
			a && a !== s.renderedRenderOrder && w.sort(a);
			for (let e = 0, t = w.length; e < t; ++e) {
				let t = w[e];
				n && m.projection && !ys(n, m.projection) && (t = t.clone(), t.getGeometry().applyTransform(Ss(m.projection, n))), (!b || ja(b, t.getGeometry().getExtent())) && C.call(this, t, e);
			}
			let T = x.finish(), E = new zh(r.getRenderMode() !== "vector" && l && f.length === 1 ? null : v, o, t, c.getOverlaps(), T, r.getRenderBuffer(), !0);
			e.executorGroups[p].push(E);
		}
		s.renderedRevision = i, s.renderedPixelRatio = t, s.renderedRenderOrder = a, s.renderedResolution = o;
	}
	forEachFeatureAtCoordinate(e, t, n, r, i) {
		let a = t.viewState.resolution, o = t.viewState.rotation;
		n ??= 0;
		let s = this.getLayer(), c = s.getSource().getTileGridForProjection(t.viewState.projection), l = s.getRenderBuffer(), u = $i([e]);
		ta(u, a * (l + n), u);
		let d = {}, f = function(e, t, n) {
			let a = e.getId();
			a === void 0 && (a = z(e));
			let o = d[a];
			if (!o) {
				if (n === 0) return d[a] = !0, r(e, s, t);
				i.push(d[a] = {
					feature: e,
					layer: s,
					geometry: t,
					distanceSq: n,
					callback: r
				});
			} else if (o !== !0 && n < o.distanceSq) {
				if (n === 0) return d[a] = !0, i.splice(i.lastIndexOf(o), 1), r(e, s, t);
				o.geometry = t, o.distanceSq = n;
			}
		}, p = this.renderedTiles, m = z(s), h = s.getDeclutter(), g = h ? t.declutter?.[h]?.all().map((e) => e.value) : null, _;
		foundFeature: for (let t = p.length - 1; t >= 0; --t) {
			let r = p[t];
			if (!ja(c.getTileCoordExtent(r.wrappedTileCoord), u)) continue;
			let i = r.executorGroups[m];
			for (let t = 0, r = i.length; t < r; ++t) if (_ = i[t].forEachFeatureAtCoordinate(e, a, o, n, f, g), _) break foundFeature;
		}
		return _;
	}
	getFeatures(e) {
		return this.renderedTiles.length === 0 ? Promise.resolve([]) : new Promise((t, n) => {
			let r = this.getLayer(), i = r.getSource(), a = this.renderedProjection, o = a.getExtent(), s = this.renderedResolution, c = i.getTileGridForProjection(a), l = Bs(this.renderedPixelToCoordinateTransform_, e.slice()), u = c.getTileCoordForCoordAndResolution(l, s).toString(), d = this.renderedTiles.find((e) => e.tileCoord.toString() === u && e.getState() === B.LOADED);
			if (!d || d.loadingSourceTiles > 0) {
				t([]);
				return;
			}
			i.getWrapX() && a.canWrapX() && !aa(o, c.getTileCoordExtent(d.tileCoord)) && Ka(l, a);
			let f = z(r), p = ka(c.getTileCoordExtent(d.wrappedTileCoord)), m = [(l[0] - p[0]) / s, (p[1] - l[1]) / s], h = d.getSourceTiles().reduce((e, t) => e.concat(t.getFeatures()), []), g = d.hitDetectionImageData[f];
			if (!g) {
				let e = Cd(c.getTileSize(c.getZForResolution(s, i.zDirection))), t = this.renderedRotation_;
				g = Uh(e, [this.getRenderTransform(c.getTileCoordCenter(d.wrappedTileCoord), s, 0, Hh, e[0] * Hh, e[1] * Hh, 0)], h, r.getStyleFunction(), c.getTileCoordExtent(d.wrappedTileCoord), d.getReplayState(r).renderedResolution, t), d.hitDetectionImageData[f] = g;
			}
			t(Wh(m, h, g));
		});
	}
	getFeaturesInExtent(e) {
		let t = [], n = this.getTileCache();
		if (n.getCount() === 0) return t;
		let r = this.getLayer().getSource().getTileGridForProjection(this.frameState.viewState.projection), i = r.getZForResolution(this.renderedResolution), a = {};
		return n.forEach((n) => {
			if (n.tileCoord[0] !== i || n.getState() !== B.LOADED) return;
			let o = n.getSourceTiles();
			for (let n = 0, i = o.length; n < i; ++n) {
				let i = o[n], s = i.getKey();
				if (s in a) continue;
				a[s] = !0;
				let c = i.tileCoord;
				if (ja(e, r.getTileCoordExtent(c))) {
					let n = i.getFeatures();
					if (n) for (let r = 0, i = n.length; r < i; ++r) {
						let i = n[r];
						ja(e, i.getGeometry().getExtent()) && t.push(i);
					}
				}
			}
		}), t;
	}
	handleFontsChanged() {
		let e = this.getLayer();
		e.getVisible() && this.renderedLayerRevision_ !== void 0 && e.changed();
	}
	handleStyleImageChange_(e) {
		this.renderIfReadyAndVisible();
	}
	renderDeclutter(e, t) {
		let n = this.context, r = n.globalAlpha;
		n.globalAlpha = t.opacity;
		let i = e.viewHints, a = !(i[Ii.ANIMATING] || i[Ii.INTERACTING]), o = [this.context.canvas.width, this.context.canvas.height], s = this.getLayer().getDeclutter(), c = s ? e.declutter?.[s] : void 0, l = z(this.getLayer()), u = this.renderedTiles;
		for (let t = 0, n = u.length; t < n; ++t) {
			let n = u[t], r = n.executorGroups[l];
			if (r) for (let t = r.length - 1; t >= 0; --t) r[t].execute(this.context, o, this.getTileRenderTransform(n, e), e.viewState.rotation, a, Ph, c);
		}
		n.globalAlpha = r;
	}
	renderDeferredInternal(e) {
		let t = this.renderedTiles, n = z(this.getLayer()), r = t.reduce((e, t, r) => (t.executorGroups[n].forEach((t) => e.push({
			executorGroup: t,
			index: r
		})), e), []), i = r.map(({ executorGroup: e }) => e.getDeferredZIndexContexts()), a = {};
		for (let e = 0, t = r.length; e < t; ++e) {
			let t = r[e].executorGroup.getDeferredZIndexContexts();
			for (let e in t) a[e] = !0;
		}
		let o = Object.keys(a).map(Number).sort(Xr);
		this.layerExtent && this.clipUnrotated(this.context, e, this.layerExtent), o.forEach((e) => {
			i.forEach((t, n) => {
				t[e] && (t[e].forEach((e) => {
					let { executorGroup: t, index: i } = r[n], a = t.getRenderedContext(), o = a.globalAlpha;
					a.globalAlpha = this.renderedOpacity_;
					let s = this.tileClipContexts_[i];
					s && s.draw(a), e.draw(a), s && a.restore(), a.globalAlpha = o, e.clear();
				}), t[e].length = 0);
			});
		}), this.layerExtent && this.context.restore();
	}
	getTileRenderTransform(e, t) {
		let n = t.pixelRatio, r = t.viewState, i = r.center, a = r.resolution, o = r.rotation, s = t.size, c = Math.round(s[0] * n), l = Math.round(s[1] * n), u = this.getLayer().getSource().getTileGridForProjection(t.viewState.projection), d = e.tileCoord, f = u.getTileCoordExtent(e.wrappedTileCoord), p = u.getTileCoordExtent(d, this.tempExtent)[0] - f[0];
		return Ls(Vs(this.inversePixelTransform.slice(), 1 / n, 1 / n), this.getRenderTransform(i, a, o, n, c, l, p));
	}
	clipTileContext_(e, t, n, r, i, a) {
		let o = [];
		for (let e = 0, a = n.length; e < a; ++e) i < r[e] && ja(t, n[e]) && o.push(n[e]);
		if (o.length === 0) return !1;
		let s = za(t, o);
		e.save(), e.beginPath();
		for (let t = 0, n = s.length; t < n; ++t) {
			let n = s[t], r = Bs(a, [n[0], n[1]]), i = Bs(a, [n[0], n[3]]), o = Bs(a, [n[2], n[3]]), c = Bs(a, [n[2], n[1]]);
			e.moveTo(r[0], r[1]), e.lineTo(i[0], i[1]), e.lineTo(o[0], o[1]), e.lineTo(c[0], c[1]), e.closePath();
		}
		return e.clip(), !0;
	}
	postRender(e, t) {
		let n = t.viewHints, r = !(n[Ii.ANIMATING] || n[Ii.INTERACTING]);
		this.renderedPixelToCoordinateTransform_ = t.pixelToCoordinateTransform.slice(), this.renderedRotation_ = t.viewState.rotation, this.renderedOpacity_ = t.layerStatesArray[t.layerIndex].opacity;
		let i = this.getLayer(), a = i.getRenderMode(), o = e.globalAlpha;
		e.globalAlpha = this.renderedOpacity_;
		let s = i.getDeclutter(), c = s ? Ig[a].filter((e) => !Ph.includes(e)) : Ig[a], l = t.viewState, u = l.rotation;
		this.layerExtent && this.clipUnrotated(e, t, this.layerExtent);
		let d = i.getSource(), f = d.getTileGridForProjection(l.projection).getZForResolution(l.resolution, d.zDirection), p = this.renderedTiles, m = [], h = [], g = [], _ = z(i), v = !0;
		for (let n = p.length - 1; n >= 0; --n) {
			let a = p[n];
			v &&= !a.getReplayState(i).dirty;
			let o = a.executorGroups[_].filter((e) => e.hasExecutors(c));
			if (o.length === 0) continue;
			let l = this.getTileRenderTransform(a, t), d = a.tileCoord[0], y = !1, b = o[0].getClipCoords(Ns), x = e, S;
			if (b) {
				let e = [
					b[0],
					b[1],
					b[4],
					b[5]
				];
				S = new xh(), x = S.getContext(), f !== d && (y = this.clipTileContext_(x, e, m, h, d, l)), m.push(e), h.push(d);
			}
			for (let n = 0, i = o.length; n < i; ++n) o[n].execute(e, [e.canvas.width, e.canvas.height], l, u, r, c, t.declutter?.[s]);
			y && (x === e ? x.restore() : g[n] = S);
		}
		this.layerExtent && e.restore(), e.globalAlpha = o, this.ready = v, this.tileClipContexts_ = g, t.declutter || this.renderDeferredInternal(t), super.postRender(e, t);
	}
	renderFeature(e, t, n, r, i, a) {
		if (!n) return !1;
		let o = !1;
		if (Array.isArray(n)) for (let s = 0, c = n.length; s < c; ++s) o = Om(r, e, n[s], t, this.boundHandleStyleImageChange_, void 0, i, a) || o;
		else o = Om(r, e, n, t, this.boundHandleStyleImageChange_, void 0, i, a);
		return o;
	}
	tileImageNeedsRender_(e) {
		let t = this.getLayer();
		if (t.getRenderMode() === "vector") return !1;
		let n = e.getReplayState(t), r = t.getRevision(), i = e.wantedResolution;
		return n.renderedTileResolution !== i || n.renderedTileRevision !== r;
	}
	renderTileImage_(e, t) {
		let n = this.getLayer(), r = e.getReplayState(n), i = n.getRevision(), a = e.executorGroups[z(n)];
		r.renderedTileRevision = i;
		let o = e.wrappedTileCoord, s = o[0], c = n.getSource(), l = t.pixelRatio, u = t.viewState.projection, d = c.getTileGridForProjection(u), f = d.getResolution(e.tileCoord[0]), p = t.pixelRatio / e.wantedResolution * f, m = d.getResolution(s), h = e.getContext();
		l = Math.round(Math.max(l, p / l));
		let g = c.getTilePixelSize(s, l, u);
		h.canvas.width = g[0], h.canvas.height = g[1];
		let _ = l / p;
		if (_ !== 1) {
			let e = Is(this.tmpTransform_);
			Vs(e, _, _), h.setTransform.apply(h, e);
		}
		let v = d.getTileCoordExtent(o, this.tempExtent), y = p / m, b = Is(this.tmpTransform_);
		Vs(b, y, -y), Hs(b, -v[0], -v[3]);
		for (let e = 0, t = a.length; e < t; ++e) a[e].execute(h, [h.canvas.width * _, h.canvas.height * _], b, 0, !0, Fg[n.getRenderMode()], null);
		r.renderedTileResolution = e.wantedResolution;
	}
}, Rg = class extends em {
	constructor(e) {
		e ||= {};
		let t = Object.assign({}, e);
		delete t.preload;
		let n = e.cacheSize === void 0 ? 0 : e.cacheSize;
		delete e.cacheSize, delete t.useInterimTilesOnError, super(t), this.on, this.once, this.un, this.cacheSize_ = n;
		let r = e.renderMode || "hybrid";
		V(r == "hybrid" || r == "vector", "`renderMode` must be `'hybrid'` or `'vector'`"), this.renderMode_ = r, this.setPreload(e.preload ? e.preload : 0), this.setUseInterimTilesOnError(e.useInterimTilesOnError === void 0 || e.useInterimTilesOnError), this.getBackground, this.setBackground;
	}
	createRenderer() {
		return new Lg(this, { cacheSize: this.cacheSize_ });
	}
	getFeatures(e) {
		return super.getFeatures(e);
	}
	getFeaturesInExtent(e) {
		return this.getRenderer().getFeaturesInExtent(e);
	}
	getRenderMode() {
		return this.renderMode_;
	}
	getPreload() {
		return this.get(Mg.PRELOAD);
	}
	getUseInterimTilesOnError() {
		return this.get(Mg.USE_INTERIM_TILES_ON_ERROR);
	}
	setPreload(e) {
		this.set(Mg.PRELOAD, e);
	}
	setUseInterimTilesOnError(e) {
		this.set(Mg.USE_INTERIM_TILES_ON_ERROR, e);
	}
}, zg = /\{z\}/g, Bg = /\{x\}/g, Vg = /\{y\}/g, Hg = /\{-y\}/g;
function Ug(e, t, n, r, i) {
	return e.replace(zg, t.toString()).replace(Bg, n.toString()).replace(Vg, r.toString()).replace(Hg, function() {
		if (i === void 0) throw Error("If the URL template has a {-y} placeholder, the grid extent must be known");
		return (i - r).toString();
	});
}
function Wg(e) {
	let t = [], n = /\{([a-z])-([a-z])\}/.exec(e);
	if (n) {
		let r = n[1].charCodeAt(0), i = n[2].charCodeAt(0), a;
		for (a = r; a <= i; ++a) t.push(e.replace(n[0], String.fromCharCode(a)));
		return t;
	}
	if (n = /\{(\d+)-(\d+)\}/.exec(e), n) {
		let r = parseInt(n[2], 10);
		for (let i = parseInt(n[1], 10); i <= r; i++) t.push(e.replace(n[0], i.toString()));
		return t;
	}
	return t.push(e), t;
}
//#endregion
//#region node_modules/ol/tilegrid/TileGrid.js
var Gg = [
	0,
	0,
	0
], Kg = 5, qg = class {
	constructor(e) {
		let t = e.minZoom, n = e.resolutions;
		t === void 0 && n && (t = n.findIndex((e) => e !== void 0)), this.minZoom = t === void 0 ? 0 : t, this.resolutions_ = n, V(ni(this.resolutions_, (e, t) => t - e, !0), "`resolutions` must be sorted in descending order");
		let r;
		if (!e.origins) {
			for (let e = 0, t = this.resolutions_.length - 1; e < t; ++e) if (!r) r = this.resolutions_[e] / this.resolutions_[e + 1];
			else if (this.resolutions_[e] / this.resolutions_[e + 1] !== r) {
				r = void 0;
				break;
			}
		}
		this.zoomFactor_ = r, this.maxZoom = this.resolutions_.length - 1, this.origin_ = e.origin === void 0 ? null : e.origin, this.origins_ = null, e.origins !== void 0 && (this.origins_ = e.origins, V(this.origins_.length == this.resolutions_.length, "Number of `origins` and `resolutions` must be equal"));
		let i = e.extent;
		i !== void 0 && !this.origin_ && !this.origins_ && (this.origin_ = ka(i)), V(!this.origin_ && this.origins_ || this.origin_ && !this.origins_, "Either `origin` or `origins` must be configured, never both"), this.tileSizes_ = null, e.tileSizes !== void 0 && (this.tileSizes_ = e.tileSizes, V(this.tileSizes_.length == this.resolutions_.length, "Number of `tileSizes` and `resolutions` must be equal")), this.tileSize_ = e.tileSize === void 0 ? this.tileSizes_ ? null : 256 : e.tileSize, V(!this.tileSize_ && this.tileSizes_ || this.tileSize_ && !this.tileSizes_, "Either `tileSize` or `tileSizes` must be configured, never both"), this.extent_ = i === void 0 ? null : i, this.fullTileRanges_ = null, this.tmpSize_ = [0, 0], this.tmpExtent_ = [
			0,
			0,
			0,
			0
		], e.tileRanges === void 0 ? e.sizes === void 0 ? i && this.calculateTileRanges_(i) : this.fullTileRanges_ = e.sizes.map((e, t) => {
			let n = new yg(Math.min(0, e[0]), Math.max(e[0] - 1, -1), Math.min(0, e[1]), Math.max(e[1] - 1, -1));
			if (i) {
				let e = this.getTileRangeForExtentAndZ(i, t);
				n.minX = Math.max(e.minX, n.minX), n.maxX = Math.min(e.maxX, n.maxX), n.minY = Math.max(e.minY, n.minY), n.maxY = Math.min(e.maxY, n.maxY);
			}
			return n;
		}) : this.fullTileRanges_ = e.tileRanges;
	}
	forEachTileCoord(e, t, n) {
		let r = this.getTileRangeForExtentAndZ(e, t);
		for (let e = r.minX, i = r.maxX; e <= i; ++e) for (let i = r.minY, a = r.maxY; i <= a; ++i) n([
			t,
			e,
			i
		]);
	}
	forEachTileCoordParentTileRange(e, t, n, r) {
		let i, a, o, s = null, c = e[0] - 1;
		for (this.zoomFactor_ === 2 ? (a = e[1], o = e[2]) : s = this.getTileCoordExtent(e, r); c >= this.minZoom;) {
			if (a !== void 0 && o !== void 0 ? (a = Math.floor(a / 2), o = Math.floor(o / 2), i = bg(a, a, o, o, n)) : i = this.getTileRangeForExtentAndZ(s, c, n), t(c, i)) return !0;
			--c;
		}
		return !1;
	}
	getExtent() {
		return this.extent_;
	}
	getMaxZoom() {
		return this.maxZoom;
	}
	getMinZoom() {
		return this.minZoom;
	}
	getOrigin(e) {
		return this.origin_ ? this.origin_ : this.origins_[e];
	}
	getOrigins() {
		return this.origins_;
	}
	getResolution(e) {
		return this.resolutions_[e];
	}
	getResolutions() {
		return this.resolutions_;
	}
	getTileCoordChildTileRange(e, t, n) {
		if (e[0] < this.maxZoom) {
			if (this.zoomFactor_ === 2) {
				let n = e[1] * 2, r = e[2] * 2;
				return bg(n, n + 1, r, r + 1, t);
			}
			let r = this.getTileCoordExtent(e, n || this.tmpExtent_);
			return this.getTileRangeForExtentAndZ(r, e[0] + 1, t);
		}
		return null;
	}
	getTileRangeForTileCoordAndZ(e, t, n) {
		if (t > this.maxZoom || t < this.minZoom) return null;
		let r = e[0], i = e[1], a = e[2];
		if (t === r) return bg(i, a, i, a, n);
		if (this.zoomFactor_) {
			let e = this.zoomFactor_ ** +(t - r), o = Math.floor(i * e), s = Math.floor(a * e);
			return t < r ? bg(o, o, s, s, n) : bg(o, Math.floor(e * (i + 1)) - 1, s, Math.floor(e * (a + 1)) - 1, n);
		}
		let o = this.getTileCoordExtent(e, this.tmpExtent_);
		return this.getTileRangeForExtentAndZ(o, t, n);
	}
	getTileRangeForExtentAndZ(e, t, n) {
		this.getTileCoordForXYAndZ_(e[0], e[3], t, !1, Gg);
		let r = Gg[1], i = Gg[2];
		this.getTileCoordForXYAndZ_(e[2], e[1], t, !0, Gg);
		let a = Gg[1], o = Gg[2];
		return bg(r, a, i, o, n);
	}
	getTileCoordCenter(e) {
		let t = this.getOrigin(e[0]), n = this.getResolution(e[0]), r = Cd(this.getTileSize(e[0]), this.tmpSize_);
		return [t[0] + (e[1] + .5) * r[0] * n, t[1] - (e[2] + .5) * r[1] * n];
	}
	getTileCoordExtent(e, t) {
		let n = this.getOrigin(e[0]), r = this.getResolution(e[0]), i = Cd(this.getTileSize(e[0]), this.tmpSize_), a = n[0] + e[1] * i[0] * r, o = n[1] - (e[2] + 1) * i[1] * r;
		return la(a, o, a + i[0] * r, o + i[1] * r, t);
	}
	getTileCoordForCoordAndResolution(e, t, n) {
		return this.getTileCoordForXYAndResolution_(e[0], e[1], t, !1, n);
	}
	getTileCoordForXYAndResolution_(e, t, n, r, i) {
		let a = this.getZForResolution(n), o = n / this.getResolution(a), s = this.getOrigin(a), c = Cd(this.getTileSize(a), this.tmpSize_), l = o * (e - s[0]) / n / c[0], u = o * (s[1] - t) / n / c[1];
		return r ? (l = Ji(l, Kg) - 1, u = Ji(u, Kg) - 1) : (l = qi(l, Kg), u = qi(u, Kg)), Sg(a, l, u, i);
	}
	getTileCoordForXYAndZ_(e, t, n, r, i) {
		let a = this.getOrigin(n), o = this.getResolution(n), s = Cd(this.getTileSize(n), this.tmpSize_), c = (e - a[0]) / o / s[0], l = (a[1] - t) / o / s[1];
		return r ? (c = Ji(c, Kg) - 1, l = Ji(l, Kg) - 1) : (c = qi(c, Kg), l = qi(l, Kg)), Sg(n, c, l, i);
	}
	getTileCoordForCoordAndZ(e, t, n) {
		return this.getTileCoordForXYAndZ_(e[0], e[1], t, !1, n);
	}
	getTileCoordResolution(e) {
		return this.resolutions_[e[0]];
	}
	getTileSize(e) {
		return this.tileSize_ ? this.tileSize_ : this.tileSizes_[e];
	}
	getFullTileRange(e) {
		return this.fullTileRanges_ ? this.fullTileRanges_[e] : this.extent_ ? this.getTileRangeForExtentAndZ(this.extent_, e) : null;
	}
	getZForResolution(e, t) {
		return Ri(Qr(this.resolutions_, e, t || 0), this.minZoom, this.maxZoom);
	}
	tileCoordIntersectsViewport(e, t) {
		return jc(t, 0, t.length, 2, this.getTileCoordExtent(e));
	}
	calculateTileRanges_(e) {
		let t = this.resolutions_.length, n = Array(t);
		for (let r = this.minZoom; r < t; ++r) n[r] = this.getTileRangeForExtentAndZ(e, r);
		this.fullTileRanges_ = n;
	}
};
//#endregion
//#region node_modules/ol/tilegrid.js
function Jg(e) {
	let t = e.getDefaultTileGrid();
	return t || (t = $g(e), e.setDefaultTileGrid(t)), t;
}
function Yg(e, t, n) {
	let r = t[0], i = e.getTileCoordCenter(t), a = e_(n);
	if (!ia(a, i)) {
		let t = H(a), n = Math.ceil((a[0] - i[0]) / t);
		return i[0] += t * n, e.getTileCoordForCoordAndZ(i, r);
	}
	return t;
}
function Xg(e, t, n, r) {
	r = r === void 0 ? "top-left" : r;
	let i = Qg(e, t, n);
	return new qg({
		extent: e,
		origin: Ca(e, r),
		resolutions: i,
		tileSize: n
	});
}
function Zg(e) {
	let t = e || {}, n = t.extent || ds("EPSG:3857").getExtent();
	return new qg({
		extent: n,
		minZoom: t.minZoom,
		tileSize: t.tileSize,
		resolutions: Qg(n, t.maxZoom, t.tileSize, t.maxResolution)
	});
}
function Qg(e, t, n, r) {
	t = t === void 0 ? 42 : t, n = Cd(n === void 0 ? 256 : n);
	let i = Ea(e), a = H(e);
	r = r > 0 ? r : Math.max(a / n[0], i / n[1]);
	let o = t + 1, s = Array(o);
	for (let e = 0; e < o; ++e) s[e] = r / 2 ** e;
	return s;
}
function $g(e, t, n, r) {
	return Xg(e_(e), t, n, r);
}
function e_(e) {
	e = ds(e);
	let t = e.getExtent();
	if (!t) {
		let n = 180 * ro.degrees / e.getMetersPerUnit();
		t = la(-n, -n, n, n);
	}
	return t;
}
//#endregion
//#region node_modules/ol/tileurlfunction.js
function t_(e, t) {
	return (function(n, r, i) {
		if (!n) return;
		let a, o = n[0];
		if (t) {
			let e = t.getFullTileRange(o);
			e && (a = e.getHeight() - 1);
		}
		return Ug(e, o, n[1], n[2], a);
	});
}
function n_(e, t) {
	let n = e.length, r = Array(n);
	for (let i = 0; i < n; ++i) r[i] = t_(e[i], t);
	return r_(r);
}
function r_(e) {
	return e.length === 1 ? e[0] : (function(t, n, r) {
		return t ? e[Wi(Tg(t), e.length)](t, n, r) : void 0;
	});
}
//#endregion
//#region node_modules/ol/source/Tile.js
var i_ = class extends Xm {
	constructor(e) {
		super({
			attributions: e.attributions,
			attributionsCollapsible: e.attributionsCollapsible,
			projection: e.projection,
			state: e.state,
			wrapX: e.wrapX,
			interpolate: e.interpolate
		}), this.on, this.once, this.un, this.tilePixelRatio_ = e.tilePixelRatio === void 0 ? 1 : e.tilePixelRatio, this.tileGrid = e.tileGrid === void 0 ? null : e.tileGrid, this.tileGrid && Cd(this.tileGrid.getTileSize(this.tileGrid.getMinZoom()), [256, 256]), this.tmpSize = [0, 0], this.key_ = e.key || z(this), this.tileOptions = {
			transition: e.transition,
			interpolate: e.interpolate
		}, this.zDirection = e.zDirection ? e.zDirection : 0;
	}
	getGutterForProjection(e) {
		return 0;
	}
	getKey() {
		return this.key_;
	}
	setKey(e) {
		this.key_ !== e && (this.key_ = e, this.changed());
	}
	getResolutions(e) {
		let t = e ? this.getTileGridForProjection(e) : this.tileGrid;
		return t ? t.getResolutions() : null;
	}
	getTile(e, t, n, r, i, a) {
		return R();
	}
	getTileGrid() {
		return this.tileGrid;
	}
	getTileGridForProjection(e) {
		return this.tileGrid ? this.tileGrid : Jg(e);
	}
	getTilePixelRatio(e) {
		return this.tilePixelRatio_;
	}
	getTilePixelSize(e, t, n) {
		let r = this.getTileGridForProjection(n), i = this.getTilePixelRatio(t), a = Cd(r.getTileSize(e), this.tmpSize);
		return i == 1 ? a : Sd(a, i, this.tmpSize);
	}
	getTileCoordForTileUrlFunction(e, t) {
		let n = t === void 0 ? this.getProjection() : t, r = t === void 0 && this.tileGrid || this.getTileGridForProjection(n);
		return this.getWrapX() && n.isGlobal() && (e = Yg(r, e, n)), Dg(e, r) ? e : null;
	}
	clear() {}
	refresh() {
		this.clear(), super.refresh();
	}
}, a_ = class extends ci {
	constructor(e, t) {
		super(e), this.tile = t;
	}
}, o_ = {
	TILELOADSTART: "tileloadstart",
	TILELOADEND: "tileloadend",
	TILELOADERROR: "tileloaderror"
}, s_ = class e extends i_ {
	constructor(t) {
		super({
			attributions: t.attributions,
			cacheSize: t.cacheSize,
			projection: t.projection,
			state: t.state,
			tileGrid: t.tileGrid,
			tilePixelRatio: t.tilePixelRatio,
			wrapX: t.wrapX,
			transition: t.transition,
			interpolate: t.interpolate,
			key: t.key,
			attributionsCollapsible: t.attributionsCollapsible,
			zDirection: t.zDirection
		}), this.generateTileUrlFunction_ = this.tileUrlFunction === e.prototype.tileUrlFunction, this.tileLoadFunction = t.tileLoadFunction, t.tileUrlFunction && (this.tileUrlFunction = t.tileUrlFunction), this.urls = null, t.urls ? this.setUrls(t.urls) : t.url && this.setUrl(t.url), this.tileLoadingKeys_ = {};
	}
	getTileLoadFunction() {
		return this.tileLoadFunction;
	}
	getTileUrlFunction() {
		return Object.getPrototypeOf(this).tileUrlFunction === this.tileUrlFunction ? this.tileUrlFunction.bind(this) : this.tileUrlFunction;
	}
	getUrls() {
		return this.urls;
	}
	handleTileChange(e) {
		let t = e.target, n = z(t), r = t.getState(), i;
		r == B.LOADING ? (this.tileLoadingKeys_[n] = !0, i = o_.TILELOADSTART) : n in this.tileLoadingKeys_ && (delete this.tileLoadingKeys_[n], i = r == B.ERROR ? o_.TILELOADERROR : r == B.LOADED ? o_.TILELOADEND : void 0), i != null && this.dispatchEvent(new a_(i, t));
	}
	setTileLoadFunction(e) {
		this.tileLoadFunction = e, this.changed();
	}
	setTileUrlFunction(e, t) {
		this.tileUrlFunction = e, t === void 0 ? this.changed() : this.setKey(t);
	}
	setUrl(e) {
		let t = Wg(e);
		this.urls = t, this.setUrls(t);
	}
	setUrls(e) {
		this.urls = e;
		let t = e.join("\n");
		this.generateTileUrlFunction_ ? this.setTileUrlFunction(n_(e, this.tileGrid), t) : this.setKey(t);
	}
	tileUrlFunction(e, t, n) {}
}, c_ = class extends s_ {
	constructor(e) {
		super({
			attributions: e.attributions,
			cacheSize: e.cacheSize,
			projection: e.projection,
			state: e.state,
			tileGrid: e.tileGrid,
			tileLoadFunction: e.tileLoadFunction ? e.tileLoadFunction : l_,
			tilePixelRatio: e.tilePixelRatio,
			tileUrlFunction: e.tileUrlFunction,
			url: e.url,
			urls: e.urls,
			wrapX: e.wrapX,
			transition: e.transition,
			interpolate: e.interpolate === void 0 || e.interpolate,
			key: e.key,
			attributionsCollapsible: e.attributionsCollapsible,
			zDirection: e.zDirection
		}), this.crossOrigin = e.crossOrigin === void 0 ? null : e.crossOrigin, this.referrerPolicy = e.referrerPolicy, this.tileClass = e.tileClass === void 0 ? ig : e.tileClass, this.tileGridForProjection = {}, this.reprojectionErrorThreshold_ = e.reprojectionErrorThreshold, this.renderReprojectionEdges_ = !1;
	}
	getGutterForProjection(e) {
		return this.getProjection() && e && !ys(this.getProjection(), e) ? 0 : this.getGutter();
	}
	getGutter() {
		return 0;
	}
	getKey() {
		let e = super.getKey();
		return this.getInterpolate() || (e += ":disable-interpolation"), e;
	}
	getTileGridForProjection(e) {
		let t = this.getProjection();
		if (this.tileGrid && (!t || ys(t, e))) return this.tileGrid;
		let n = z(e);
		return n in this.tileGridForProjection || (this.tileGridForProjection[n] = Jg(e)), this.tileGridForProjection[n];
	}
	createTile_(e, t, n, r, i, a) {
		let o = [
			e,
			t,
			n
		], s = this.getTileCoordForTileUrlFunction(o, i), c = s ? this.tileUrlFunction(s, r, i) : void 0, l = new this.tileClass(o, c === void 0 ? B.EMPTY : B.IDLE, c === void 0 ? "" : c, {
			crossOrigin: this.crossOrigin,
			referrerPolicy: this.referrerPolicy
		}, this.tileLoadFunction, this.tileOptions);
		return l.key = a, l.addEventListener(L.CHANGE, this.handleTileChange.bind(this)), l;
	}
	getTile(e, t, n, r, i, a) {
		let o = this.getProjection();
		if (!o || !i || ys(o, i)) return this.getTileInternal(e, t, n, r, o || i);
		let s = [
			e,
			t,
			n
		], c = this.getKey(), l = new vg(o, this.getTileGridForProjection(o), i, this.getTileGridForProjection(i), s, this.getTileCoordForTileUrlFunction(s, i), this.getTilePixelRatio(r), this.getGutter(), (e, t, n, r) => this.getTileInternal(e, t, n, r, o, a), this.reprojectionErrorThreshold_, this.renderReprojectionEdges_, this.tileOptions);
		return l.key = c, l;
	}
	getTileInternal(e, t, n, r, i, a) {
		let o = this.getKey(), s = wg(this, o, e, t, n);
		if (a && a.containsKey(s)) return a.get(s);
		let c = this.createTile_(e, t, n, r, i, o);
		return a?.set(s, c), c;
	}
	setRenderReprojectionEdges(e) {
		this.renderReprojectionEdges_ != e && (this.renderReprojectionEdges_ = e, this.changed());
	}
	setTileGridForProjection(e, t) {
		let n = ds(e);
		if (n) {
			let e = z(n);
			e in this.tileGridForProjection || (this.tileGridForProjection[e] = t);
		}
	}
};
function l_(e, t) {
	if (Ti) {
		let n = e.getCrossOrigin(), r = "same-origin", i = "same-origin";
		n === "anonymous" || n === "" ? (r = "cors", i = "omit") : n === "use-credentials" && (r = "cors", i = "include");
		let a = {
			mode: r,
			credentials: i,
			referrerPolicy: e.getReferrerPolicy()
		};
		fetch(t, a).then((e) => {
			if (!e.ok) throw Error(`HTTP ${e.status}`);
			return e.blob();
		}).then((e) => createImageBitmap(e)).then((t) => {
			let n = e.getImage();
			n.width = t.width, n.height = t.height, n.getContext("2d").drawImage(t, 0, 0), t.close?.(), n.dispatchEvent(new Event("load"));
		}).catch(() => {
			e.getImage().dispatchEvent(new Event("error"));
		});
		return;
	}
	e.getImage().src = t;
}
//#endregion
//#region node_modules/ol/source/XYZ.js
var u_ = class extends c_ {
	constructor(e) {
		e ||= {};
		let t = e.projection === void 0 ? "EPSG:3857" : e.projection, n = e.tileGrid === void 0 ? Zg({
			extent: e_(t),
			maxResolution: e.maxResolution,
			maxZoom: e.maxZoom,
			minZoom: e.minZoom,
			tileSize: e.tileSize
		}) : e.tileGrid;
		super({
			attributions: e.attributions,
			cacheSize: e.cacheSize,
			crossOrigin: e.crossOrigin,
			referrerPolicy: e.referrerPolicy,
			interpolate: e.interpolate,
			projection: t,
			reprojectionErrorThreshold: e.reprojectionErrorThreshold,
			tileGrid: n,
			tileLoadFunction: e.tileLoadFunction,
			tilePixelRatio: e.tilePixelRatio,
			tileUrlFunction: e.tileUrlFunction,
			url: e.url,
			urls: e.urls,
			wrapX: e.wrapX === void 0 || e.wrapX,
			transition: e.transition,
			attributionsCollapsible: e.attributionsCollapsible,
			zDirection: e.zDirection
		}), this.gutter_ = e.gutter === void 0 ? 0 : e.gutter;
	}
	getGutter() {
		return this.gutter_;
	}
}, d_ = {
	VERSION1: "version1",
	VERSION2: "version2",
	VERSION3: "version3"
}, f_ = {};
f_[d_.VERSION1] = {
	level0: {
		supports: [],
		formats: [],
		qualities: ["native"]
	},
	level1: {
		supports: [
			"regionByPx",
			"sizeByW",
			"sizeByH",
			"sizeByPct"
		],
		formats: ["jpg"],
		qualities: ["native"]
	},
	level2: {
		supports: [
			"regionByPx",
			"regionByPct",
			"sizeByW",
			"sizeByH",
			"sizeByPct",
			"sizeByConfinedWh",
			"sizeByWh"
		],
		formats: ["jpg", "png"],
		qualities: [
			"native",
			"color",
			"grey",
			"bitonal"
		]
	}
}, f_[d_.VERSION2] = {
	level0: {
		supports: [],
		formats: ["jpg"],
		qualities: ["default"]
	},
	level1: {
		supports: [
			"regionByPx",
			"sizeByW",
			"sizeByH",
			"sizeByPct"
		],
		formats: ["jpg"],
		qualities: ["default"]
	},
	level2: {
		supports: [
			"regionByPx",
			"regionByPct",
			"sizeByW",
			"sizeByH",
			"sizeByPct",
			"sizeByConfinedWh",
			"sizeByDistortedWh",
			"sizeByWh"
		],
		formats: ["jpg", "png"],
		qualities: ["default", "bitonal"]
	}
}, f_[d_.VERSION3] = {
	level0: {
		supports: [],
		formats: ["jpg"],
		qualities: ["default"]
	},
	level1: {
		supports: [
			"regionByPx",
			"regionSquare",
			"sizeByW",
			"sizeByH",
			"sizeByWh"
		],
		formats: ["jpg"],
		qualities: ["default"]
	},
	level2: {
		supports: [
			"regionByPx",
			"regionSquare",
			"regionByPct",
			"sizeByW",
			"sizeByH",
			"sizeByPct",
			"sizeByConfinedWh",
			"sizeByWh"
		],
		formats: ["jpg", "png"],
		qualities: ["default"]
	}
}, f_.none = { none: {
	supports: [],
	formats: [],
	qualities: []
} };
var p_ = /^https?:\/\/library\.stanford\.edu\/iiif\/image-api\/(?:1\.1\/)?compliance\.html#level[0-2]$/, m_ = /^https?:\/\/iiif\.io\/api\/image\/2\/level[0-2](?:\.json)?$/, h_ = /(^https?:\/\/iiif\.io\/api\/image\/3\/level[0-2](?:\.json)?$)|(^level[0-2]$)/;
function g_(e) {
	let t = e.getComplianceLevelSupportedFeatures();
	return t === void 0 && (t = f_[d_.VERSION1].level0), {
		url: e.imageInfo["@id"] === void 0 ? void 0 : e.imageInfo["@id"].replace(/\/?(?:info\.json)?$/g, ""),
		supports: t.supports,
		formats: [...t.formats, e.imageInfo.formats === void 0 ? [] : e.imageInfo.formats],
		qualities: [...t.qualities, e.imageInfo.qualities === void 0 ? [] : e.imageInfo.qualities],
		resolutions: e.imageInfo.scale_factors,
		tileSize: e.imageInfo.tile_width === void 0 ? e.imageInfo.tile_height == null ? void 0 : [e.imageInfo.tile_height, e.imageInfo.tile_height] : e.imageInfo.tile_height === void 0 ? [e.imageInfo.tile_width, e.imageInfo.tile_width] : [e.imageInfo.tile_width, e.imageInfo.tile_height]
	};
}
function __(e) {
	let t = e.getComplianceLevelSupportedFeatures(), n = Array.isArray(e.imageInfo.profile) && e.imageInfo.profile.length > 1, r = n && e.imageInfo.profile[1].supports ? e.imageInfo.profile[1].supports : [], i = n && e.imageInfo.profile[1].formats ? e.imageInfo.profile[1].formats : [], a = n && e.imageInfo.profile[1].qualities ? e.imageInfo.profile[1].qualities : [];
	return {
		url: e.imageInfo["@id"].replace(/\/?(?:info\.json)?$/g, ""),
		sizes: e.imageInfo.sizes === void 0 ? void 0 : e.imageInfo.sizes.map(function(e) {
			return [e.width, e.height];
		}),
		tileSize: e.imageInfo.tiles === void 0 ? void 0 : [e.imageInfo.tiles.map(function(e) {
			return e.width;
		})[0], e.imageInfo.tiles.map(function(e) {
			return e.height === void 0 ? e.width : e.height;
		})[0]],
		resolutions: e.imageInfo.tiles === void 0 ? void 0 : e.imageInfo.tiles.map(function(e) {
			return e.scaleFactors;
		})[0],
		supports: [...t.supports, ...r],
		formats: [...t.formats, ...i],
		qualities: [...t.qualities, ...a]
	};
}
function v_(e) {
	let t = e.getComplianceLevelSupportedFeatures(), n = e.imageInfo.extraFormats === void 0 ? t.formats : [...t.formats, ...e.imageInfo.extraFormats], r = e.imageInfo.preferredFormats !== void 0 && Array.isArray(e.imageInfo.preferredFormats) && e.imageInfo.preferredFormats.length > 0 ? e.imageInfo.preferredFormats.filter(function(e) {
		return [
			"jpg",
			"png",
			"gif"
		].includes(e);
	}).reduce(function(e, t) {
		return e === void 0 && n.includes(t) ? t : e;
	}, void 0) : void 0;
	return {
		url: e.imageInfo.id,
		sizes: e.imageInfo.sizes === void 0 ? void 0 : e.imageInfo.sizes.map(function(e) {
			return [e.width, e.height];
		}),
		tileSize: e.imageInfo.tiles === void 0 ? void 0 : [e.imageInfo.tiles.map(function(e) {
			return e.width;
		})[0], e.imageInfo.tiles.map(function(e) {
			return e.height;
		})[0]],
		resolutions: e.imageInfo.tiles === void 0 ? void 0 : e.imageInfo.tiles.map(function(e) {
			return e.scaleFactors;
		})[0],
		supports: e.imageInfo.extraFeatures === void 0 ? t.supports : [...t.supports, ...e.imageInfo.extraFeatures],
		formats: n,
		qualities: e.imageInfo.extraQualities === void 0 ? t.qualities : [...t.qualities, ...e.imageInfo.extraQualities],
		preferredFormat: r
	};
}
var y_ = {};
y_[d_.VERSION1] = g_, y_[d_.VERSION2] = __, y_[d_.VERSION3] = v_;
var b_ = class {
	constructor(e) {
		this.setImageInfo(e);
	}
	setImageInfo(e) {
		this.imageInfo = typeof e == "string" ? JSON.parse(e) : e;
	}
	getImageApiVersion() {
		if (this.imageInfo === void 0) return;
		let e = this.imageInfo["@context"] || "ol-no-context";
		typeof e == "string" && (e = [e]);
		for (let t = 0; t < e.length; t++) switch (e[t]) {
			case "http://library.stanford.edu/iiif/image-api/1.1/context.json":
			case "http://iiif.io/api/image/1/context.json": return d_.VERSION1;
			case "http://iiif.io/api/image/2/context.json": return d_.VERSION2;
			case "http://iiif.io/api/image/3/context.json": return d_.VERSION3;
			case "ol-no-context": if (this.getComplianceLevelEntryFromProfile(d_.VERSION1) && this.imageInfo.identifier) return d_.VERSION1;
		}
		V(!1, "Cannot determine IIIF Image API version from provided image information JSON");
	}
	getComplianceLevelEntryFromProfile(e) {
		if (this.imageInfo !== void 0 && this.imageInfo.profile !== void 0) switch (e === void 0 && (e = this.getImageApiVersion()), e) {
			case d_.VERSION1:
				if (p_.test(this.imageInfo.profile)) return this.imageInfo.profile;
				break;
			case d_.VERSION3:
				if (h_.test(this.imageInfo.profile)) return this.imageInfo.profile;
				break;
			case d_.VERSION2:
				if (typeof this.imageInfo.profile == "string" && m_.test(this.imageInfo.profile)) return this.imageInfo.profile;
				if (Array.isArray(this.imageInfo.profile) && this.imageInfo.profile.length > 0 && typeof this.imageInfo.profile[0] == "string" && m_.test(this.imageInfo.profile[0])) return this.imageInfo.profile[0];
		}
	}
	getComplianceLevelFromProfile(e) {
		let t = this.getComplianceLevelEntryFromProfile(e);
		if (t === void 0) return;
		let n = t.match(/level[0-2](?:\.json)?$/g);
		return Array.isArray(n) ? n[0].replace(".json", "") : void 0;
	}
	getComplianceLevelSupportedFeatures() {
		if (this.imageInfo === void 0) return;
		let e = this.getImageApiVersion(), t = this.getComplianceLevelFromProfile(e);
		return t === void 0 ? f_.none.none : f_[e][t];
	}
	getTileSourceOptions(e) {
		let t = e || {}, n = this.getImageApiVersion();
		if (n === void 0) return;
		let r = n === void 0 ? void 0 : y_[n](this);
		if (r !== void 0) return {
			url: r.url,
			version: n,
			size: [this.imageInfo.width, this.imageInfo.height],
			sizes: r.sizes,
			format: t.format !== void 0 && r.formats.includes(t.format) ? t.format : r.preferredFormat === void 0 ? "jpg" : r.preferredFormat,
			supports: r.supports,
			quality: t.quality && r.qualities.includes(t.quality) ? t.quality : r.qualities.includes("native") ? "native" : "default",
			resolutions: Array.isArray(r.resolutions) ? r.resolutions.sort(function(e, t) {
				return t - e;
			}) : void 0,
			tileSize: r.tileSize
		};
	}
}, x_ = class extends ig {
	constructor(e, t, n, r, i, a, o) {
		super(t, n, r, i, a, o), this.zoomifyImage_ = null, this.tileSize_ = e;
	}
	getImage() {
		if (this.zoomifyImage_) return this.zoomifyImage_;
		let e = super.getImage();
		if (this.state == B.LOADED) {
			let t = this.tileSize_;
			if (e.width == t[0] && e.height == t[1]) return this.zoomifyImage_ = e, e;
			let n = Tl(t[0], t[1]);
			return n.drawImage(e, 0, 0), this.zoomifyImage_ = n.canvas, n.canvas;
		}
		return e;
	}
};
//#endregion
//#region node_modules/ol/source/IIIF.js
function S_(e) {
	return e.toLocaleString("en", { maximumFractionDigits: 10 });
}
var C_ = class extends c_ {
	constructor(e) {
		let t = e || {}, n = t.url || "";
		n += n.lastIndexOf("/") === n.length - 1 || n === "" ? "" : "/";
		let r = t.version || d_.VERSION2, i = t.sizes || [], a = t.size;
		V(a != null && Array.isArray(a) && a.length == 2 && !isNaN(a[0]) && a[0] > 0 && !isNaN(a[1]) && a[1] > 0, "Missing or invalid `size`");
		let o = a[0], s = a[1], c = t.tileSize, l = t.tilePixelRatio || 1, u = t.format || "jpg", d = t.quality || (t.version == d_.VERSION1 ? "native" : "default"), f = t.resolutions || [], p = t.supports || [], m = t.extent || [
			0,
			-s,
			o,
			0
		], h = i != null && Array.isArray(i) && i.length > 0, g = c !== void 0 && (typeof c == "number" && Number.isInteger(c) && c > 0 || Array.isArray(c) && c.length > 0), _ = p != null && Array.isArray(p) && (p.includes("regionByPx") || p.includes("regionByPct")) && (p.includes("sizeByWh") || p.includes("sizeByH") || p.includes("sizeByW") || p.includes("sizeByPct")), v, y, b;
		if (f.sort(function(e, t) {
			return t - e;
		}), g || _) {
			if (c != null && (typeof c == "number" && Number.isInteger(c) && c > 0 ? (v = c, y = c) : Array.isArray(c) && c.length > 0 && ((c.length == 1 || c[1] == null && Number.isInteger(c[0])) && (v = c[0], y = c[0]), c.length == 2 && (Number.isInteger(c[0]) && Number.isInteger(c[1]) ? (v = c[0], y = c[1]) : c[0] == null && Number.isInteger(c[1]) && (v = c[1], y = c[1])))), (v === void 0 || y === void 0) && (v = 256, y = 256), f.length == 0) {
				b = Math.max(Math.ceil(Math.log(o / v) / Math.LN2), Math.ceil(Math.log(s / y) / Math.LN2));
				for (let e = b; e >= 0; e--) f.push(2 ** e);
			} else {
				let e = Math.max(...f);
				b = Math.round(Math.log(e) / Math.LN2);
			}
		} else if (v = o, y = s, f = [], h) {
			i.sort(function(e, t) {
				return e[0] - t[0];
			}), b = -1;
			let e = [];
			for (let t = 0; t < i.length; t++) {
				let n = o / i[t][0];
				if (f.length > 0 && f[f.length - 1] == n) {
					e.push(t);
					continue;
				}
				f.push(n), b++;
			}
			if (e.length > 0) for (let t = 0; t < e.length; t++) i.splice(e[t] - t, 1);
		} else f.push(1), i.push([o, s]), b = 0;
		let x = new qg({
			tileSize: [v, y],
			extent: m,
			origin: ka(m),
			resolutions: f
		}), S = function(e, t, a) {
			let c, l, m = e[0];
			if (m > b) return;
			let x = e[1], S = e[2], C = f[m];
			if (!(x === void 0 || S === void 0 || C === void 0 || x < 0 || Math.ceil(o / C / v) <= x || S < 0 || Math.ceil(s / C / y) <= S)) {
				if (_ || g) {
					let e = x * v * C, t = S * y * C, n = v * C, i = y * C, a = v, u = y;
					if (e + n > o && (n = o - e), t + i > s && (i = s - t), e + v * C > o && (a = Math.floor((o - e + C - 1) / C)), t + y * C > s && (u = Math.floor((s - t + C - 1) / C)), e == 0 && n == o && t == 0 && i == s) c = "full";
					else if (!_ || p.includes("regionByPx")) c = e + "," + t + "," + n + "," + i;
					else if (p.includes("regionByPct")) {
						let r = S_(e / o * 100), a = S_(t / s * 100), l = S_(n / o * 100), u = S_(i / s * 100);
						c = "pct:" + r + "," + a + "," + l + "," + u;
					}
					r == d_.VERSION3 && (!_ || p.includes("sizeByWh")) ? l = a + "," + u : !_ || p.includes("sizeByW") ? l = a + "," : p.includes("sizeByH") ? l = "," + u : p.includes("sizeByWh") ? l = a + "," + u : p.includes("sizeByPct") && (l = "pct:" + S_(100 / C));
				} else if (c = "full", h) {
					let e = i[m][0], t = i[m][1];
					l = r == d_.VERSION3 ? e == o && t == s ? "max" : e + "," + t : e == o ? "full" : e + ",";
				} else l = r == d_.VERSION3 ? "max" : "full";
				return n + c + "/" + l + "/0/" + d + "." + u;
			}
		}, C = x_.bind(null, Cd(c || 256).map(function(e) {
			return e * l;
		}));
		super({
			attributions: t.attributions,
			attributionsCollapsible: t.attributionsCollapsible,
			cacheSize: t.cacheSize,
			crossOrigin: t.crossOrigin,
			interpolate: t.interpolate,
			projection: t.projection,
			reprojectionErrorThreshold: t.reprojectionErrorThreshold,
			state: t.state,
			tileClass: C,
			tileGrid: x,
			tilePixelRatio: t.tilePixelRatio,
			tileUrlFunction: S,
			transition: t.transition
		}), this.zDirection = t.zDirection;
	}
};
//#endregion
//#region node_modules/ol/net.js
function w_(e, t, n, r) {
	let i = document.createElement("script"), a = "olc_" + z(t);
	function o() {
		delete window[a], i.parentNode.removeChild(i);
	}
	i.async = !0, i.src = e + (e.includes("?") ? "&" : "?") + (r || "callback") + "=" + a;
	let s = setTimeout(function() {
		o(), n && n();
	}, 1e4);
	window[a] = function(e) {
		clearTimeout(s), o(), t(e);
	}, document.head.appendChild(i);
}
//#endregion
//#region node_modules/ol/VectorRenderTile.js
var T_ = [], E_ = class extends $h {
	constructor(e, t, n, r, i) {
		super(e, t, { transition: 0 }), this.context_ = null, this.executorGroups = {}, this.loadingSourceTiles = 0, this.hitDetectionImageData = {}, this.replayState_ = {}, this.sourceTiles = [], this.errorTileKeys = {}, this.wantedResolution, this.getSourceTiles = r.bind(void 0, this), this.removeSourceTiles_ = i, this.wrappedTileCoord = n;
	}
	getContext() {
		return this.context_ ||= Tl(1, 1, T_), this.context_;
	}
	hasContext() {
		return !!this.context_;
	}
	getImage() {
		return this.hasContext() ? this.getContext().canvas : null;
	}
	getReplayState(e) {
		let t = z(e);
		return t in this.replayState_ || (this.replayState_[t] = {
			dirty: !1,
			renderedRenderOrder: null,
			renderedResolution: NaN,
			renderedPixelRatio: NaN,
			renderedRevision: -1,
			renderedTileResolution: NaN,
			renderedTileRevision: -1,
			renderedTileZ: -1
		}), this.replayState_[t];
	}
	load() {
		this.getSourceTiles();
	}
	release() {
		this.context_ &&= (Ol(this.context_), T_.push(this.context_.canvas), null), this.removeSourceTiles_(this), this.sourceTiles.length = 0, super.release();
	}
}, D_ = class extends $h {
	constructor(e, t, n, r, i, a) {
		super(e, t, a), this.extent = null, this.format_ = r, this.features_ = null, this.loader_, this.projection = null, this.resolution, this.tileLoadFunction_ = i, this.url_ = n, this.key = n;
	}
	getTileUrl() {
		return this.url_;
	}
	getFormat() {
		return this.format_;
	}
	getFeatures() {
		return this.features_;
	}
	load() {
		this.state == B.IDLE && (this.setState(B.LOADING), this.tileLoadFunction_(this, this.url_), this.loader_ && this.loader_(this.extent, this.resolution, this.projection));
	}
	onLoad(e, t) {
		this.setFeatures(e);
	}
	onError() {
		this.setState(B.ERROR);
	}
	setFeatures(e) {
		this.features_ = e, this.setState(B.LOADED);
	}
	setLoader(e) {
		this.loader_ = e;
	}
}, O_ = class extends s_ {
	constructor(e) {
		let t = e.projection || "EPSG:3857", n = e.extent || e_(t), r = e.tileGrid || Zg({
			extent: n,
			maxResolution: e.maxResolution,
			maxZoom: e.maxZoom === void 0 ? 22 : e.maxZoom,
			minZoom: e.minZoom,
			tileSize: e.tileSize || 512
		});
		super({
			attributions: e.attributions,
			attributionsCollapsible: e.attributionsCollapsible,
			cacheSize: e.cacheSize,
			interpolate: !0,
			projection: t,
			state: e.state,
			tileGrid: r,
			tileLoadFunction: e.tileLoadFunction ? e.tileLoadFunction : k_,
			tileUrlFunction: e.tileUrlFunction,
			url: e.url,
			urls: e.urls,
			wrapX: e.wrapX === void 0 || e.wrapX,
			transition: e.transition,
			zDirection: e.zDirection === void 0 ? 1 : e.zDirection
		}), this.format_ = e.format ? e.format : null, this.tileKeysBySourceTileUrl_ = {}, this.sourceTiles_ = {}, this.overlaps_ = e.overlaps == null || e.overlaps, this.tileClass = e.tileClass ? e.tileClass : D_, this.tileGrids_ = {};
	}
	getOverlaps() {
		return this.overlaps_;
	}
	getSourceZ_(e, t, n) {
		let r = this.projection, i = t && r && !ys(t, r) ? e / r.getMetersPerUnit() * t.getMetersPerUnit() : e;
		return this.tileGrid.getZForResolution(i, n);
	}
	getSourceTiles(e, t, n, r) {
		if (n.getState() === B.IDLE) {
			n.setState(B.LOADING);
			let i = n.wrappedTileCoord, a = this.getTileGridForProjection(t), o = a.getTileCoordExtent(i), s = i[0], c = a.getResolution(s);
			ta(o, -c, o);
			let l = this.projection;
			t && this.projection && !ys(t, l) && (o = ws(o, t, l));
			let u = this.tileGrid, d = u.getExtent();
			d && Da(o, d, o);
			let f = this.getSourceZ_(c, t, this.zDirection), p = r || this.tileUrlFunction;
			u.forEachTileCoord(o, f, (r) => {
				let i = p(r, e, t);
				this.sourceTiles_[i] || (this.sourceTiles_[i] = new this.tileClass(r, i ? B.IDLE : B.EMPTY, i, this.format_, this.tileLoadFunction));
				let a = this.sourceTiles_[i];
				n.sourceTiles.push(a), this.tileKeysBySourceTileUrl_[i] || (this.tileKeysBySourceTileUrl_[i] = []), this.tileKeysBySourceTileUrl_[i].push(n.getKey());
				let o = a.getState();
				if (o < B.LOADED) {
					let e = (t) => {
						this.handleTileChange(t);
						let r = a.getState();
						if (r === B.LOADED || r === B.ERROR) {
							let t = a.getKey();
							t in n.errorTileKeys ? a.getState() === B.LOADED && delete n.errorTileKeys[t] : n.loadingSourceTiles--, r === B.ERROR ? n.errorTileKeys[t] = !0 : a.removeEventListener(L.CHANGE, e), n.loadingSourceTiles === 0 && n.setState(Gr(n.errorTileKeys) ? B.LOADED : B.ERROR);
						}
					};
					a.addEventListener(L.CHANGE, e), n.loadingSourceTiles++;
				}
				o === B.IDLE && (a.extent = u.getTileCoordExtent(r), a.projection = this.projection, a.resolution = u.getResolution(r[0]), a.load());
			}), n.loadingSourceTiles || n.setState(n.sourceTiles.some((e) => e.getState() === B.ERROR) ? B.ERROR : B.LOADED);
		}
		return n.sourceTiles;
	}
	removeSourceTiles(e) {
		let t = e.getKey(), n = e.sourceTiles;
		for (let e = 0, r = n.length; e < r; ++e) {
			let r = n[e].getTileUrl();
			if (!this.tileKeysBySourceTileUrl_[r]) return;
			let i = this.tileKeysBySourceTileUrl_[r].indexOf(t);
			i !== -1 && (this.tileKeysBySourceTileUrl_[r].splice(i, 1), this.tileKeysBySourceTileUrl_[r].length === 0 && (delete this.tileKeysBySourceTileUrl_[r], delete this.sourceTiles_[r]));
		}
	}
	getTile(e, t, n, r, i) {
		let a = [
			e,
			t,
			n
		], o = this.getTileCoordForTileUrlFunction(a, i), s = this.getTileGrid().getExtent(), c = this.projection, l = this.getTileGridForProjection(i);
		if (o && s) {
			let t = l.getTileCoordExtent(o);
			ta(t, -l.getResolution(e), t), ja(s, !i || !c || ys(i, c) ? t : ws(t, i, c)) || (o = null);
		}
		let u = !0;
		if (o !== null) {
			let t = this.tileGrid, n = l.getResolution(e), a = this.getSourceZ_(n, i, 1), s = l.getTileCoordExtent(o);
			ta(s, -n, s), t.forEachTileCoord(!i || !c || ys(i, c) ? s : ws(s, i, c), a, (e) => {
				u &&= !this.tileUrlFunction(e, r, c);
			});
		}
		let d = this.tileUrlFunction, f = new E_(a, u ? B.EMPTY : B.IDLE, o, (e) => this.getSourceTiles(r, i, e, d), this.removeSourceTiles.bind(this));
		return f.key = this.getKey(), f;
	}
	getTileGridForProjection(e) {
		let t = e.getCode(), n = this.tileGrids_[t];
		if (!n) {
			let r = this.projection;
			if (r !== null && !ys(r, e)) return Jg(e);
			let i = this.tileGrid, a = i.getResolutions().slice(), o = a.map(function(e, t) {
				return i.getOrigin(t);
			}), s = a.map(function(e, t) {
				return i.getTileSize(t);
			});
			for (let e = a.length; e < 43; ++e) a.push(a[e - 1] / 2), o.push(o[e - 1]), s.push(s[e - 1]);
			n = new qg({
				extent: i.getExtent(),
				origins: o,
				resolutions: a,
				tileSizes: s
			}), this.tileGrids_[t] = n;
		}
		return n;
	}
	getTilePixelRatio(e) {
		return e;
	}
	getTilePixelSize(e, t, n) {
		let r = Cd(this.getTileGridForProjection(n).getTileSize(e), this.tmpSize);
		return [Math.round(r[0] * t), Math.round(r[1] * t)];
	}
	setOverlaps(e) {
		this.overlaps_ = e, this.changed();
	}
};
function k_(e, t) {
	e.setLoader(function(n, r, i) {
		zm(t, e.getFormat(), n, r, i, e.onLoad.bind(e), e.onError.bind(e));
	});
}
//#endregion
//#region node_modules/ol/source/OSM.js
var A_ = "&#169; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors.", j_ = class extends u_ {
	constructor(e) {
		e ||= {};
		let t;
		t = e.attributions === void 0 ? [A_] : e.attributions;
		let n = e.url === void 0 ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png" : e.url;
		super({
			attributions: t,
			attributionsCollapsible: !1,
			cacheSize: e.cacheSize,
			crossOrigin: e.crossOrigin === void 0 ? "anonymous" : e.crossOrigin,
			referrerPolicy: e.referrerPolicy || "origin-when-cross-origin",
			interpolate: e.interpolate,
			maxZoom: e.maxZoom === void 0 ? 19 : e.maxZoom,
			reprojectionErrorThreshold: e.reprojectionErrorThreshold,
			tileLoadFunction: e.tileLoadFunction,
			transition: e.transition,
			url: n,
			wrapX: e.wrapX,
			zDirection: e.zDirection
		});
	}
}, M_ = class extends c_ {
	constructor(e) {
		if (super({
			attributions: e.attributions,
			cacheSize: e.cacheSize,
			crossOrigin: e.crossOrigin,
			interpolate: e.interpolate,
			projection: ds("EPSG:3857"),
			reprojectionErrorThreshold: e.reprojectionErrorThreshold,
			state: "loading",
			tileLoadFunction: e.tileLoadFunction,
			wrapX: e.wrapX === void 0 || e.wrapX,
			transition: e.transition,
			zDirection: e.zDirection
		}), this.tileJSON_ = null, this.tileSize_ = e.tileSize, e.url) {
			if (e.jsonp) w_(e.url, this.handleTileJSONResponse.bind(this), this.handleTileJSONError.bind(this));
			else {
				let t = new XMLHttpRequest();
				t.addEventListener("load", this.onXHRLoad_.bind(this)), t.addEventListener("error", this.onXHRError_.bind(this)), t.open("GET", e.url), t.send();
			}
		} else if (e.tileJSON) this.handleTileJSONResponse(e.tileJSON);
		else throw Error("Either `url` or `tileJSON` options must be provided");
	}
	onXHRLoad_(e) {
		let t = e.target;
		if (!t.status || t.status >= 200 && t.status < 300) {
			let e;
			try {
				e = JSON.parse(t.responseText);
			} catch {
				this.handleTileJSONError();
				return;
			}
			this.handleTileJSONResponse(e);
		} else this.handleTileJSONError();
	}
	onXHRError_(e) {
		this.handleTileJSONError();
	}
	getTileJSON() {
		return this.tileJSON_;
	}
	handleTileJSONResponse(e) {
		let t = ds("EPSG:4326"), n = this.getProjection(), r;
		if (e.bounds !== void 0) {
			let i = bs(t, n);
			r = Ia(e.bounds, i);
		}
		let i = e_(n), a = e.minzoom || 0, o = Zg({
			extent: i,
			maxZoom: e.maxzoom || 22,
			minZoom: a,
			tileSize: this.tileSize_
		});
		if (this.tileGrid = o, this.tileUrlFunction = n_(e.tiles, o), e.attribution && !this.getAttributions()) {
			let t = r === void 0 ? i : r;
			this.setAttributions(function(n) {
				return ja(t, n.extent) ? [e.attribution] : null;
			});
		}
		this.tileJSON_ = e, this.setState("ready");
	}
	handleTileJSONError() {
		this.setState("error");
	}
}, N_ = {
	ELEMENT: "element",
	MAP: "map",
	OFFSET: "offset",
	POSITION: "position",
	POSITIONING: "positioning"
}, P_ = class extends mi {
	constructor(e) {
		super(), this.on, this.once, this.un, this.options = e, this.id = e.id, this.insertFirst = e.insertFirst === void 0 || e.insertFirst, this.stopEvent = e.stopEvent === void 0 || e.stopEvent, this.element = document.createElement("div"), this.element.className = e.className === void 0 ? "ol-overlay-container " + _l : e.className, this.element.style.position = "absolute", this.element.style.pointerEvents = "auto", this.autoPan = e.autoPan === !0 ? {} : e.autoPan || void 0, this.rendered = {
			transform_: "",
			visible: !0
		}, this.mapPostrenderListenerKey = null, this.addChangeListener(N_.ELEMENT, this.handleElementChanged), this.addChangeListener(N_.MAP, this.handleMapChanged), this.addChangeListener(N_.OFFSET, this.handleOffsetChanged), this.addChangeListener(N_.POSITION, this.handlePositionChanged), this.addChangeListener(N_.POSITIONING, this.handlePositioningChanged), e.element !== void 0 && this.setElement(e.element), this.setOffset(e.offset === void 0 ? [0, 0] : e.offset), this.setPositioning(e.positioning || "top-left"), e.position !== void 0 && this.setPosition(e.position);
	}
	getElement() {
		return this.get(N_.ELEMENT);
	}
	getId() {
		return this.id;
	}
	getMap() {
		return this.get(N_.MAP) || null;
	}
	getOffset() {
		return this.get(N_.OFFSET);
	}
	getPosition() {
		return this.get(N_.POSITION);
	}
	getPositioning() {
		return this.get(N_.POSITIONING);
	}
	handleElementChanged() {
		Ml(this.element);
		let e = this.getElement();
		e && this.element.appendChild(e);
	}
	handleMapChanged() {
		this.mapPostrenderListenerKey &&= (this.element?.remove(), qr(this.mapPostrenderListenerKey), null);
		let e = this.getMap();
		if (e) {
			this.mapPostrenderListenerKey = I(e, Ai.POSTRENDER, this.render, this), this.updatePixelPosition();
			let t = this.stopEvent ? e.getOverlayContainerStopEvent() : e.getOverlayContainer();
			this.insertFirst ? t.insertBefore(this.element, t.childNodes[0] || null) : t.appendChild(this.element), this.performAutoPan();
		}
	}
	render() {
		this.updatePixelPosition();
	}
	handleOffsetChanged() {
		this.updatePixelPosition();
	}
	handlePositionChanged() {
		this.updatePixelPosition(), this.performAutoPan();
	}
	handlePositioningChanged() {
		this.updatePixelPosition();
	}
	setElement(e) {
		this.set(N_.ELEMENT, e);
	}
	setMap(e) {
		this.set(N_.MAP, e);
	}
	setOffset(e) {
		this.set(N_.OFFSET, e);
	}
	setPosition(e) {
		this.set(N_.POSITION, e);
	}
	performAutoPan() {
		this.autoPan && this.panIntoView(this.autoPan);
	}
	panIntoView(e) {
		let t = this.getMap();
		if (!t || !t.getTargetElement() || !this.get(N_.POSITION)) return;
		let n = this.getRect(t.getTargetElement(), t.getSize()), r = this.getElement(), i = this.getRect(r, [kl(r), Al(r)]);
		e ||= {};
		let a = e.margin === void 0 ? 20 : e.margin;
		if (!aa(n, i)) {
			let r = i[0] - n[0], o = n[2] - i[2], s = i[1] - n[1], c = n[3] - i[3], l = [0, 0];
			if (r < 0 ? l[0] = r - a : o < 0 && (l[0] = Math.abs(o) + a), s < 0 ? l[1] = s - a : c < 0 && (l[1] = Math.abs(c) + a), l[0] !== 0 || l[1] !== 0) {
				let n = t.getView().getCenterInternal(), r = t.getPixelFromCoordinateInternal(n);
				if (!r) return;
				let i = [r[0] + l[0], r[1] + l[1]], a = e.animation || {};
				t.getView().animateInternal({
					center: t.getCoordinateFromPixelInternal(i),
					duration: a.duration,
					easing: a.easing
				});
			}
		}
	}
	getRect(e, t) {
		let n = e.getBoundingClientRect(), r = n.left + window.pageXOffset, i = n.top + window.pageYOffset;
		return [
			r,
			i,
			r + t[0],
			i + t[1]
		];
	}
	setPositioning(e) {
		this.set(N_.POSITIONING, e);
	}
	setVisible(e) {
		this.rendered.visible !== e && (this.element.style.display = e ? "" : "none", this.rendered.visible = e);
	}
	updatePixelPosition() {
		let e = this.getMap(), t = this.getPosition();
		if (!e || !e.isRendered() || !t) {
			this.setVisible(!1);
			return;
		}
		let n = e.getPixelFromCoordinate(t), r = e.getSize();
		this.updateRenderedPosition(n, r);
	}
	updateRenderedPosition(e, t) {
		let n = this.element.style, r = this.getOffset(), i = this.getPositioning();
		this.setVisible(!0);
		let a = `${e[0] + r[0]}px`, o = `${e[1] + r[1]}px`, s = "0%", c = "0%";
		i == "bottom-right" || i == "center-right" || i == "top-right" ? s = "-100%" : (i == "bottom-center" || i == "center-center" || i == "top-center") && (s = "-50%"), i == "bottom-left" || i == "bottom-center" || i == "bottom-right" ? c = "-100%" : (i == "center-left" || i == "center-center" || i == "center-right") && (c = "-50%");
		let l = `translate(${s}, ${c}) translate(${a}, ${o})`;
		this.rendered.transform_ != l && (this.rendered.transform_ = l, n.transform = l);
	}
	getOptions() {
		return this.options;
	}
}, F_ = .75, I_ = .1, L_ = class extends Il {
	constructor(e) {
		e ||= {}, super({
			element: document.createElement("div"),
			render: e.render,
			target: e.target
		}), this.boundHandleRotationChanged_ = this.handleRotationChanged_.bind(this), this.collapsed_ = e.collapsed === void 0 || e.collapsed, this.collapsible_ = e.collapsible === void 0 || e.collapsible, this.collapsible_ || (this.collapsed_ = !1), this.rotateWithView_ = e.rotateWithView !== void 0 && e.rotateWithView, this.viewExtent_ = void 0;
		let t = e.className === void 0 ? "ol-overviewmap" : e.className, n = e.tipLabel === void 0 ? "Overview map" : e.tipLabel, r = e.collapseLabel === void 0 ? "‹" : e.collapseLabel;
		typeof r == "string" ? (this.collapseLabel_ = document.createElement("span"), this.collapseLabel_.textContent = r) : this.collapseLabel_ = r;
		let i = e.label === void 0 ? "›" : e.label;
		typeof i == "string" ? (this.label_ = document.createElement("span"), this.label_.textContent = i) : this.label_ = i;
		let a = this.collapsible_ && !this.collapsed_ ? this.collapseLabel_ : this.label_, o = document.createElement("button");
		o.setAttribute("type", "button"), o.title = n, o.appendChild(a), o.addEventListener(L.CLICK, this.handleClick_.bind(this), !1), this.ovmapDiv_ = document.createElement("div"), this.ovmapDiv_.className = "ol-overviewmap-map", this.view_ = e.view;
		let s = new cm({
			view: e.view,
			controls: new _i(),
			interactions: new _i()
		});
		this.ovmap_ = s, e.layers && e.layers.forEach(function(e) {
			s.addLayer(e);
		});
		let c = document.createElement("div");
		c.className = "ol-overviewmap-box", c.style.boxSizing = "border-box", this.boxOverlay_ = new P_({
			position: [0, 0],
			positioning: "center-center",
			element: c
		}), this.ovmap_.addOverlay(this.boxOverlay_);
		let l = t + " " + vl + " " + yl + (this.collapsed_ && this.collapsible_ ? " " + bl : "") + (this.collapsible_ ? "" : " ol-uncollapsible"), u = this.element;
		u.className = l, u.appendChild(this.ovmapDiv_), u.appendChild(o);
		let d = this.boxOverlay_, f = this.boxOverlay_.getElement(), p = (e) => ({
			clientX: e.clientX,
			clientY: e.clientY
		}), m = function(e) {
			let t = p(e), n = s.getEventCoordinate(t);
			d.setPosition(n);
		}, h = (e) => {
			let t = s.getEventCoordinateInternal(e), n = this.getMap();
			n.getView().setCenterInternal(t);
			let r = n.getOwnerDocument();
			r.removeEventListener("pointermove", m), r.removeEventListener("pointerup", h);
		};
		this.ovmapDiv_.addEventListener("pointerdown", (e) => {
			let t = this.getMap().getOwnerDocument();
			e.target === f && t.addEventListener("pointermove", m), t.addEventListener("pointerup", h);
		});
	}
	setMap(e) {
		let t = this.getMap();
		if (e !== t) {
			if (t) {
				let e = t.getView();
				e && this.unbindView_(e), this.ovmap_.setTarget(null);
			}
			if (super.setMap(e), e) {
				this.ovmap_.setTarget(this.ovmapDiv_), this.listenerKeys.push(I(e, Ur.PROPERTYCHANGE, this.handleMapPropertyChange_, this));
				let t = e.getView();
				t && this.bindView_(t), this.ovmap_.isRendered() || this.updateBoxAfterOvmapIsRendered_();
			}
		}
	}
	handleMapPropertyChange_(e) {
		if (e.key === ji.VIEW) {
			let t = e.oldValue;
			t && this.unbindView_(t);
			let n = this.getMap().getView();
			this.bindView_(n);
		} else !this.ovmap_.isRendered() && (e.key === ji.TARGET || e.key === ji.SIZE) && this.ovmap_.updateSize();
	}
	bindView_(e) {
		if (!this.view_) {
			let t = new ll({ projection: e.getProjection() });
			this.ovmap_.setView(t);
		}
		e.addChangeListener(Li.ROTATION, this.boundHandleRotationChanged_), this.handleRotationChanged_(), e.isDef() && (this.ovmap_.updateSize(), this.resetExtent_());
	}
	unbindView_(e) {
		e.removeChangeListener(Li.ROTATION, this.boundHandleRotationChanged_);
	}
	handleRotationChanged_() {
		this.rotateWithView_ && this.ovmap_.getView().setRotation(this.getMap().getView().getRotation());
	}
	validateExtent_() {
		let e = this.getMap(), t = this.ovmap_;
		if (!e.isRendered() || !t.isRendered()) return;
		let n = e.getSize(), r = e.getView().calculateExtentInternal(n);
		if (this.viewExtent_ && pa(r, this.viewExtent_)) return;
		this.viewExtent_ = r;
		let i = t.getSize(), a = t.getView().calculateExtentInternal(i), o = t.getPixelFromCoordinateInternal(ka(r)), s = t.getPixelFromCoordinateInternal(xa(r)), c = Math.abs(o[0] - s[0]), l = Math.abs(o[1] - s[1]), u = i[0], d = i[1];
		c < u * I_ || l < d * I_ || c > u * F_ || l > d * F_ ? this.resetExtent_() : aa(a, r) || this.recenter_();
	}
	resetExtent_() {
		let e = this.getMap(), t = this.ovmap_, n = e.getSize(), r = e.getView().calculateExtentInternal(n), i = t.getView();
		Pa(r, 1 / (2 ** (Math.log(F_ / I_) / Math.LN2 / 2) * I_)), i.fitInternal(Qc(r));
	}
	recenter_() {
		let e = this.getMap(), t = this.ovmap_, n = e.getView();
		t.getView().setCenterInternal(n.getCenterInternal());
	}
	updateBox_() {
		let e = this.getMap(), t = this.ovmap_;
		if (!e.isRendered() || !t.isRendered()) return;
		let n = e.getSize(), r = e.getView(), i = t.getView(), a = this.rotateWithView_ ? 0 : -r.getRotation(), o = this.boxOverlay_, s = this.boxOverlay_.getElement(), c = r.getCenter(), l = r.getResolution(), u = i.getResolution(), d = n[0] * l / u, f = n[1] * l / u;
		if (o.setPosition(c), s) {
			s.style.width = d + "px", s.style.height = f + "px";
			let e = "rotate(" + a + "rad)";
			s.style.transform = e;
		}
	}
	updateBoxAfterOvmapIsRendered_() {
		this.ovmapPostrenderKey_ ||= Kr(this.ovmap_, Ai.POSTRENDER, (e) => {
			delete this.ovmapPostrenderKey_, this.updateBox_();
		});
	}
	handleClick_(e) {
		e.preventDefault(), this.handleToggle_();
	}
	handleToggle_() {
		this.element.classList.toggle(bl), this.collapsed_ ? jl(this.collapseLabel_, this.label_) : jl(this.label_, this.collapseLabel_), this.collapsed_ = !this.collapsed_;
		let e = this.ovmap_;
		if (!this.collapsed_) {
			if (e.isRendered()) {
				this.viewExtent_ = void 0, e.render();
				return;
			}
			e.updateSize(), this.resetExtent_(), this.updateBoxAfterOvmapIsRendered_();
		}
	}
	getCollapsible() {
		return this.collapsible_;
	}
	setCollapsible(e) {
		this.collapsible_ !== e && (this.collapsible_ = e, this.element.classList.toggle("ol-uncollapsible"), !e && this.collapsed_ && this.handleToggle_());
	}
	setCollapsed(e) {
		this.collapsible_ && this.collapsed_ !== e && this.handleToggle_();
	}
	getCollapsed() {
		return this.collapsed_;
	}
	getRotateWithView() {
		return this.rotateWithView_;
	}
	setRotateWithView(e) {
		this.rotateWithView_ !== e && (this.rotateWithView_ = e, this.getMap().getView().getRotation() !== 0 && (this.rotateWithView_ ? this.handleRotationChanged_() : this.ovmap_.getView().setRotation(0), this.viewExtent_ = void 0, this.validateExtent_(), this.updateBox_()));
	}
	getOverviewMap() {
		return this.ovmap_;
	}
	render(e) {
		this.validateExtent_(), this.updateBox_();
	}
}, R_ = class e extends nc {
	constructor(e) {
		super(), this.geometries_ = e, this.changeEventsKeys_ = [], this.listenGeometriesChange_();
	}
	unlistenGeometriesChange_() {
		this.changeEventsKeys_.forEach(qr), this.changeEventsKeys_.length = 0;
	}
	listenGeometriesChange_() {
		let e = this.geometries_;
		for (let t = 0, n = e.length; t < n; ++t) this.changeEventsKeys_.push(I(e[t], L.CHANGE, this.changed, this));
	}
	clone() {
		let t = new e(z_(this.geometries_));
		return t.applyProperties(this), t;
	}
	closestPointXY(e, t, n, r) {
		if (r < ra(this.getExtent(), e, t)) return r;
		let i = this.geometries_;
		for (let a = 0, o = i.length; a < o; ++a) r = i[a].closestPointXY(e, t, n, r);
		return r;
	}
	containsXY(e, t) {
		let n = this.geometries_;
		for (let r = 0, i = n.length; r < i; ++r) if (n[r].containsXY(e, t)) return !0;
		return !1;
	}
	computeExtent(e) {
		ua(e);
		let t = this.geometries_;
		for (let n = 0, r = t.length; n < r; ++n) ma(e, t[n].getExtent());
		return e;
	}
	getGeometries() {
		return z_(this.geometries_);
	}
	getGeometriesArray() {
		return this.geometries_;
	}
	getGeometriesArrayRecursive() {
		let e = [], t = this.geometries_;
		for (let n = 0, r = t.length; n < r; ++n) t[n].getType() === this.getType() ? e = e.concat(t[n].getGeometriesArrayRecursive()) : e.push(t[n]);
		return e;
	}
	getSimplifiedGeometry(t) {
		if (this.simplifiedGeometryRevision !== this.getRevision() && (this.simplifiedGeometryMaxMinSquaredTolerance = 0, this.simplifiedGeometryRevision = this.getRevision()), t < 0 || this.simplifiedGeometryMaxMinSquaredTolerance !== 0 && t < this.simplifiedGeometryMaxMinSquaredTolerance) return this;
		let n = [], r = this.geometries_, i = !1;
		for (let e = 0, a = r.length; e < a; ++e) {
			let a = r[e], o = a.getSimplifiedGeometry(t);
			n.push(o), o !== a && (i = !0);
		}
		return i ? new e(n) : (this.simplifiedGeometryMaxMinSquaredTolerance = t, this);
	}
	getType() {
		return "GeometryCollection";
	}
	intersectsExtent(e) {
		let t = this.geometries_;
		for (let n = 0, r = t.length; n < r; ++n) if (t[n].intersectsExtent(e)) return !0;
		return !1;
	}
	isEmpty() {
		return this.geometries_.length === 0;
	}
	rotate(e, t) {
		let n = this.geometries_;
		for (let r = 0, i = n.length; r < i; ++r) n[r].rotate(e, t);
		this.changed();
	}
	scale(e, t, n) {
		n ||= Sa(this.getExtent());
		let r = this.geometries_;
		for (let i = 0, a = r.length; i < a; ++i) r[i].scale(e, t, n);
		this.changed();
	}
	setGeometries(e) {
		this.setGeometriesArray(z_(e));
	}
	setGeometriesArray(e) {
		this.unlistenGeometriesChange_(), this.geometries_ = e, this.listenGeometriesChange_(), this.changed();
	}
	applyTransform(e) {
		let t = this.geometries_;
		for (let n = 0, r = t.length; n < r; ++n) t[n].applyTransform(e);
		this.changed();
	}
	translate(e, t) {
		let n = this.geometries_;
		for (let r = 0, i = n.length; r < i; ++r) n[r].translate(e, t);
		this.changed();
	}
	disposeInternal() {
		this.unlistenGeometriesChange_(), super.disposeInternal();
	}
};
function z_(e) {
	return e.map((e) => e.clone());
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/reference/latest.mjs
var B_ = {
	$version: 8,
	$root: {
		version: {
			required: !0,
			type: "enum",
			values: [8]
		},
		name: { type: "string" },
		metadata: { type: "*" },
		center: {
			type: "array",
			value: "number",
			length: 2
		},
		centerAltitude: { type: "number" },
		zoom: { type: "number" },
		bearing: {
			type: "number",
			default: 0,
			period: 360,
			units: "degrees"
		},
		pitch: {
			type: "number",
			default: 0,
			units: "degrees"
		},
		roll: {
			type: "number",
			default: 0,
			units: "degrees"
		},
		state: {
			type: "state",
			default: {}
		},
		light: { type: "light" },
		sky: { type: "sky" },
		projection: { type: "projection" },
		terrain: { type: "terrain" },
		sources: {
			required: !0,
			type: "sources"
		},
		sprite: { type: "sprite" },
		glyphs: { type: "string" },
		"font-faces": { type: "fontFaces" },
		transition: { type: "transition" },
		layers: {
			required: !0,
			type: "array",
			value: "layer"
		}
	},
	sources: { "*": { type: "source" } },
	source: [
		"source_vector",
		"source_raster",
		"source_raster_dem",
		"source_geojson",
		"source_video",
		"source_image"
	],
	source_vector: {
		type: {
			required: !0,
			type: "enum",
			values: { vector: {} }
		},
		url: { type: "string" },
		tiles: {
			type: "array",
			value: "string"
		},
		bounds: {
			type: "array",
			value: "number",
			length: 4,
			default: [
				-180,
				-85.051129,
				180,
				85.051129
			]
		},
		scheme: {
			type: "enum",
			values: {
				xyz: {},
				tms: {}
			},
			default: "xyz"
		},
		minzoom: {
			type: "number",
			default: 0
		},
		maxzoom: {
			type: "number",
			default: 22
		},
		attribution: { type: "string" },
		promoteId: { type: "promoteId" },
		volatile: {
			type: "boolean",
			default: !1
		},
		encoding: {
			type: "enum",
			values: {
				mvt: {},
				mlt: {}
			},
			default: "mvt"
		},
		"*": { type: "*" }
	},
	source_raster: {
		type: {
			required: !0,
			type: "enum",
			values: { raster: {} }
		},
		url: { type: "string" },
		tiles: {
			type: "array",
			value: "string"
		},
		bounds: {
			type: "array",
			value: "number",
			length: 4,
			default: [
				-180,
				-85.051129,
				180,
				85.051129
			]
		},
		minzoom: {
			type: "number",
			default: 0
		},
		maxzoom: {
			type: "number",
			default: 22
		},
		tileSize: {
			type: "number",
			default: 512,
			units: "pixels"
		},
		scheme: {
			type: "enum",
			values: {
				xyz: {},
				tms: {}
			},
			default: "xyz"
		},
		attribution: { type: "string" },
		volatile: {
			type: "boolean",
			default: !1
		},
		"*": { type: "*" }
	},
	source_raster_dem: {
		type: {
			required: !0,
			type: "enum",
			values: { "raster-dem": {} }
		},
		url: { type: "string" },
		tiles: {
			type: "array",
			value: "string"
		},
		bounds: {
			type: "array",
			value: "number",
			length: 4,
			default: [
				-180,
				-85.051129,
				180,
				85.051129
			]
		},
		minzoom: {
			type: "number",
			default: 0
		},
		maxzoom: {
			type: "number",
			default: 22
		},
		tileSize: {
			type: "number",
			default: 512,
			units: "pixels"
		},
		attribution: { type: "string" },
		encoding: {
			type: "enum",
			values: {
				terrarium: {},
				mapbox: {},
				custom: {}
			},
			default: "mapbox"
		},
		redFactor: {
			type: "number",
			default: 1
		},
		blueFactor: {
			type: "number",
			default: 1
		},
		greenFactor: {
			type: "number",
			default: 1
		},
		baseShift: {
			type: "number",
			default: 0
		},
		volatile: {
			type: "boolean",
			default: !1
		},
		"*": { type: "*" }
	},
	source_geojson: {
		type: {
			required: !0,
			type: "enum",
			values: { geojson: {} }
		},
		data: {
			required: !0,
			type: "*"
		},
		maxzoom: {
			type: "number",
			default: 18
		},
		attribution: { type: "string" },
		buffer: {
			type: "number",
			default: 128,
			maximum: 512,
			minimum: 0
		},
		filter: { type: "filter" },
		tolerance: {
			type: "number",
			default: .375
		},
		cluster: {
			type: "boolean",
			default: !1
		},
		clusterRadius: {
			type: "number",
			default: 50,
			minimum: 0
		},
		clusterMaxZoom: { type: "number" },
		clusterMinPoints: { type: "number" },
		clusterProperties: { type: "*" },
		lineMetrics: {
			type: "boolean",
			default: !1
		},
		generateId: {
			type: "boolean",
			default: !1
		},
		promoteId: { type: "promoteId" }
	},
	source_video: {
		type: {
			required: !0,
			type: "enum",
			values: { video: {} }
		},
		urls: {
			required: !0,
			type: "array",
			value: "string"
		},
		coordinates: {
			required: !0,
			type: "array",
			length: 4,
			value: {
				type: "array",
				length: 2,
				value: "number"
			}
		}
	},
	source_image: {
		type: {
			required: !0,
			type: "enum",
			values: { image: {} }
		},
		url: { type: "string" },
		coordinates: {
			required: !0,
			type: "array",
			length: 4,
			value: {
				type: "array",
				length: 2,
				value: "number"
			}
		}
	},
	layer: {
		id: {
			type: "string",
			required: !0
		},
		type: {
			type: "enum",
			values: {
				fill: {},
				line: {},
				symbol: {},
				circle: {},
				heatmap: {},
				"fill-extrusion": {},
				raster: {},
				hillshade: {},
				"color-relief": {},
				background: {}
			},
			required: !0
		},
		metadata: { type: "*" },
		source: { type: "string" },
		"source-layer": { type: "string" },
		minzoom: {
			type: "number",
			minimum: 0,
			maximum: 24
		},
		maxzoom: {
			type: "number",
			minimum: 0,
			maximum: 24
		},
		filter: { type: "filter" },
		layout: { type: "layout" },
		paint: { type: "paint" }
	},
	layout: [
		"layout_fill",
		"layout_line",
		"layout_circle",
		"layout_heatmap",
		"layout_fill-extrusion",
		"layout_symbol",
		"layout_raster",
		"layout_hillshade",
		"layout_color-relief",
		"layout_background"
	],
	layout_background: { visibility: {
		type: "enum",
		values: {
			visible: {},
			none: {}
		},
		default: "visible",
		expression: {
			interpolated: !1,
			parameters: ["global-state"]
		},
		"property-type": "data-constant"
	} },
	layout_fill: {
		"fill-sort-key": {
			type: "number",
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		visibility: {
			type: "enum",
			values: {
				visible: {},
				none: {}
			},
			default: "visible",
			expression: {
				interpolated: !1,
				parameters: ["global-state"]
			},
			"property-type": "data-constant"
		}
	},
	layout_circle: {
		"circle-sort-key": {
			type: "number",
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		visibility: {
			type: "enum",
			values: {
				visible: {},
				none: {}
			},
			default: "visible",
			expression: {
				interpolated: !1,
				parameters: ["global-state"]
			},
			"property-type": "data-constant"
		}
	},
	layout_heatmap: { visibility: {
		type: "enum",
		values: {
			visible: {},
			none: {}
		},
		default: "visible",
		expression: {
			interpolated: !1,
			parameters: ["global-state"]
		},
		"property-type": "data-constant"
	} },
	"layout_fill-extrusion": {
		visibility: {
			type: "enum",
			values: {
				visible: {},
				none: {}
			},
			default: "visible",
			expression: {
				interpolated: !1,
				parameters: ["global-state"]
			},
			"property-type": "data-constant"
		},
		"fill-extrusion-rounded-corner-distance": {
			type: "number",
			default: 0,
			minimum: 0,
			units: "meters",
			"property-type": "constant"
		}
	},
	layout_line: {
		"line-cap": {
			type: "enum",
			values: {
				butt: {},
				round: {},
				square: {}
			},
			default: "butt",
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"line-join": {
			type: "enum",
			values: {
				bevel: {},
				round: {},
				miter: {}
			},
			default: "miter",
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"line-miter-limit": {
			type: "number",
			default: 2,
			requires: [{ "line-join": "miter" }],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"line-round-limit": {
			type: "number",
			default: 1.05,
			requires: [{ "line-join": "round" }],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"line-sort-key": {
			type: "number",
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		visibility: {
			type: "enum",
			values: {
				visible: {},
				none: {}
			},
			default: "visible",
			expression: {
				interpolated: !1,
				parameters: ["global-state"]
			},
			"property-type": "data-constant"
		}
	},
	layout_symbol: {
		"symbol-placement": {
			type: "enum",
			values: {
				point: {},
				line: {},
				"line-center": {}
			},
			default: "point",
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"symbol-spacing": {
			type: "number",
			default: 250,
			minimum: 1,
			units: "pixels",
			requires: [{ "symbol-placement": "line" }],
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"symbol-avoid-edges": {
			type: "boolean",
			default: !1,
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"symbol-sort-key": {
			type: "number",
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"symbol-z-order": {
			type: "enum",
			values: {
				auto: {},
				"viewport-y": {},
				source: {}
			},
			default: "auto",
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"icon-allow-overlap": {
			type: "boolean",
			default: !1,
			requires: ["icon-image", { "!": "icon-overlap" }],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"icon-overlap": {
			type: "enum",
			values: {
				never: {},
				always: {},
				cooperative: {}
			},
			requires: ["icon-image"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"icon-ignore-placement": {
			type: "boolean",
			default: !1,
			requires: ["icon-image"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"icon-optional": {
			type: "boolean",
			default: !1,
			requires: ["icon-image", "text-field"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"icon-rotation-alignment": {
			type: "enum",
			values: {
				map: {},
				viewport: {},
				auto: {}
			},
			default: "auto",
			requires: ["icon-image"],
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"icon-size": {
			type: "number",
			default: 1,
			minimum: 0,
			units: "factor of the original icon size",
			requires: ["icon-image"],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"icon-text-fit": {
			type: "enum",
			values: {
				none: {},
				width: {},
				height: {},
				both: {}
			},
			default: "none",
			requires: ["icon-image", "text-field"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"icon-text-fit-padding": {
			type: "array",
			value: "number",
			length: 4,
			default: [
				0,
				0,
				0,
				0
			],
			units: "pixels",
			requires: [
				"icon-image",
				"text-field",
				{ "icon-text-fit": [
					"both",
					"width",
					"height"
				] }
			],
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"icon-image": {
			type: "resolvedImage",
			tokens: !0,
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"icon-rotate": {
			type: "number",
			default: 0,
			period: 360,
			units: "degrees",
			requires: ["icon-image"],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"icon-padding": {
			type: "padding",
			default: [2],
			units: "pixels",
			requires: ["icon-image"],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"icon-keep-upright": {
			type: "boolean",
			default: !1,
			requires: [
				"icon-image",
				{ "icon-rotation-alignment": "map" },
				{ "symbol-placement": ["line", "line-center"] }
			],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"icon-offset": {
			type: "array",
			value: "number",
			length: 2,
			default: [0, 0],
			requires: ["icon-image"],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"icon-anchor": {
			type: "enum",
			values: {
				center: {},
				left: {},
				right: {},
				top: {},
				bottom: {},
				"top-left": {},
				"top-right": {},
				"bottom-left": {},
				"bottom-right": {}
			},
			default: "center",
			requires: ["icon-image"],
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"icon-pitch-alignment": {
			type: "enum",
			values: {
				map: {},
				viewport: {},
				auto: {}
			},
			default: "auto",
			requires: ["icon-image"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-pitch-alignment": {
			type: "enum",
			values: {
				map: {},
				viewport: {},
				auto: {}
			},
			default: "auto",
			requires: ["text-field"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-rotation-alignment": {
			type: "enum",
			values: {
				map: {},
				viewport: {},
				"viewport-glyph": {},
				auto: {}
			},
			default: "auto",
			requires: ["text-field"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-field": {
			type: "formatted",
			default: "",
			tokens: !0,
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-font": {
			type: "array",
			value: "string",
			default: ["Open Sans Regular", "Arial Unicode MS Regular"],
			requires: ["text-field"],
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-size": {
			type: "number",
			default: 16,
			minimum: 0,
			units: "pixels",
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-max-width": {
			type: "number",
			default: 10,
			minimum: 0,
			units: "ems",
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-line-height": {
			type: "number",
			default: 1.2,
			units: "ems",
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-letter-spacing": {
			type: "number",
			default: 0,
			units: "ems",
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-justify": {
			type: "enum",
			values: {
				auto: {},
				left: {},
				center: {},
				right: {}
			},
			default: "center",
			requires: ["text-field"],
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-radial-offset": {
			type: "number",
			units: "ems",
			default: 0,
			requires: ["text-field"],
			"property-type": "data-driven",
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			}
		},
		"text-variable-anchor": {
			type: "array",
			value: "enum",
			values: {
				center: {},
				left: {},
				right: {},
				top: {},
				bottom: {},
				"top-left": {},
				"top-right": {},
				"bottom-left": {},
				"bottom-right": {}
			},
			requires: ["text-field", { "symbol-placement": ["point"] }],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-variable-anchor-offset": {
			type: "variableAnchorOffsetCollection",
			requires: ["text-field", { "symbol-placement": ["point"] }],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-anchor": {
			type: "enum",
			values: {
				center: {},
				left: {},
				right: {},
				top: {},
				bottom: {},
				"top-left": {},
				"top-right": {},
				"bottom-left": {},
				"bottom-right": {}
			},
			default: "center",
			requires: ["text-field", { "!": "text-variable-anchor" }],
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-max-angle": {
			type: "number",
			default: 45,
			units: "degrees",
			requires: ["text-field", { "symbol-placement": ["line", "line-center"] }],
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-writing-mode": {
			type: "array",
			value: "enum",
			values: {
				horizontal: {},
				vertical: {}
			},
			requires: ["text-field", { "symbol-placement": ["point"] }],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-rotate": {
			type: "number",
			default: 0,
			period: 360,
			units: "degrees",
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-padding": {
			type: "number",
			default: 2,
			minimum: 0,
			units: "pixels",
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-keep-upright": {
			type: "boolean",
			default: !0,
			requires: [
				"text-field",
				{ "text-rotation-alignment": "map" },
				{ "symbol-placement": ["line", "line-center"] }
			],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-transform": {
			type: "enum",
			values: {
				none: {},
				uppercase: {},
				lowercase: {}
			},
			default: "none",
			requires: ["text-field"],
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-offset": {
			type: "array",
			value: "number",
			units: "ems",
			length: 2,
			default: [0, 0],
			requires: ["text-field", { "!": "text-radial-offset" }],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"text-allow-overlap": {
			type: "boolean",
			default: !1,
			requires: ["text-field", { "!": "text-overlap" }],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-overlap": {
			type: "enum",
			values: {
				never: {},
				always: {},
				cooperative: {}
			},
			requires: ["text-field"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-ignore-placement": {
			type: "boolean",
			default: !1,
			requires: ["text-field"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-optional": {
			type: "boolean",
			default: !1,
			requires: ["text-field", "icon-image"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"symbol-height-offset": {
			type: "number",
			default: 0,
			units: "meters",
			requires: [{ "symbol-placement": ["point"] }],
			expression: {
				interpolated: !0,
				parameters: ["zoom", "feature"]
			},
			"property-type": "data-driven"
		},
		"symbol-height-anchor": {
			type: "enum",
			values: {
				ground: {},
				absolute: {}
			},
			default: "ground",
			requires: ["symbol-height-offset"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		visibility: {
			type: "enum",
			values: {
				visible: {},
				none: {}
			},
			default: "visible",
			expression: {
				interpolated: !1,
				parameters: ["global-state"]
			},
			"property-type": "data-constant"
		}
	},
	layout_raster: { visibility: {
		type: "enum",
		values: {
			visible: {},
			none: {}
		},
		default: "visible",
		expression: {
			interpolated: !1,
			parameters: ["global-state"]
		},
		"property-type": "data-constant"
	} },
	layout_hillshade: { visibility: {
		type: "enum",
		values: {
			visible: {},
			none: {}
		},
		default: "visible",
		expression: {
			interpolated: !1,
			parameters: ["global-state"]
		},
		"property-type": "data-constant"
	} },
	"layout_color-relief": { visibility: {
		type: "enum",
		values: {
			visible: {},
			none: {}
		},
		default: "visible",
		expression: {
			interpolated: !1,
			parameters: ["global-state"]
		},
		"property-type": "data-constant"
	} },
	filter: {
		type: "boolean",
		expression: {
			interpolated: !1,
			parameters: ["zoom", "feature"]
		},
		"property-type": "data-driven"
	},
	filter_operator: {
		type: "enum",
		values: {
			"==": {},
			"!=": {},
			">": {},
			">=": {},
			"<": {},
			"<=": {},
			in: {},
			"!in": {},
			all: {},
			any: {},
			none: {},
			has: {},
			"!has": {}
		}
	},
	geometry_type: {
		type: "enum",
		values: {
			Point: {},
			LineString: {},
			Polygon: {}
		}
	},
	function: {
		expression: { type: "expression" },
		stops: {
			type: "array",
			value: "function_stop"
		},
		base: {
			type: "number",
			default: 1,
			minimum: 0
		},
		property: {
			type: "string",
			default: "$zoom"
		},
		type: {
			type: "enum",
			values: {
				identity: {},
				exponential: {},
				interval: {},
				categorical: {}
			},
			default: "exponential"
		},
		colorSpace: {
			type: "enum",
			values: {
				rgb: {},
				lab: {},
				hcl: {}
			},
			default: "rgb"
		},
		default: {
			type: "*",
			required: !1
		}
	},
	function_stop: {
		type: "array",
		minimum: 0,
		maximum: 24,
		value: ["number", "color"],
		length: 2
	},
	expression: {
		type: "array",
		value: "expression_name",
		minimum: 1
	},
	light: {
		anchor: {
			type: "enum",
			default: "viewport",
			values: {
				map: {},
				viewport: {}
			},
			"property-type": "data-constant",
			transition: !1,
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			}
		},
		position: {
			type: "array",
			default: [
				1.15,
				210,
				30
			],
			length: 3,
			value: "number",
			"property-type": "data-constant",
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			}
		},
		color: {
			type: "color",
			"property-type": "data-constant",
			default: "#ffffff",
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			transition: !0
		},
		intensity: {
			type: "number",
			"property-type": "data-constant",
			default: .5,
			minimum: 0,
			maximum: 1,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			transition: !0
		}
	},
	sky: {
		"sky-color": {
			type: "color",
			"property-type": "data-constant",
			default: "#88C6FC",
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			transition: !0
		},
		"horizon-color": {
			type: "color",
			"property-type": "data-constant",
			default: "#ffffff",
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			transition: !0
		},
		"fog-color": {
			type: "color",
			"property-type": "data-constant",
			default: "#ffffff",
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			transition: !0
		},
		"fog-ground-blend": {
			type: "number",
			"property-type": "data-constant",
			default: .5,
			minimum: 0,
			maximum: 1,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			transition: !0
		},
		"horizon-fog-blend": {
			type: "number",
			"property-type": "data-constant",
			default: .8,
			minimum: 0,
			maximum: 1,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			transition: !0
		},
		"sky-horizon-blend": {
			type: "number",
			"property-type": "data-constant",
			default: .8,
			minimum: 0,
			maximum: 1,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			transition: !0
		},
		"atmosphere-blend": {
			type: "number",
			"property-type": "data-constant",
			default: .8,
			minimum: 0,
			maximum: 1,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			transition: !0
		}
	},
	terrain: {
		source: {
			type: "string",
			required: !0
		},
		exaggeration: {
			type: "number",
			minimum: 0,
			default: 1
		}
	},
	projection: { type: {
		type: "projectionDefinition",
		default: "mercator",
		"property-type": "data-constant",
		transition: !1,
		expression: {
			interpolated: !0,
			parameters: ["zoom"]
		}
	} },
	paint: [
		"paint_fill",
		"paint_line",
		"paint_circle",
		"paint_heatmap",
		"paint_fill-extrusion",
		"paint_symbol",
		"paint_raster",
		"paint_hillshade",
		"paint_color-relief",
		"paint_background"
	],
	paint_fill: {
		"fill-antialias": {
			type: "boolean",
			default: !0,
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"fill-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"fill-layer-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom", "global-state"]
			},
			"property-type": "data-constant"
		},
		"fill-color": {
			type: "color",
			default: "#000000",
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"fill-outline-color": {
			type: "color",
			transition: !0,
			requires: [{ "!": "fill-pattern" }, { "fill-antialias": !0 }],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"fill-translate": {
			type: "array",
			value: "number",
			length: 2,
			default: [0, 0],
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"fill-translate-anchor": {
			type: "enum",
			values: {
				map: {},
				viewport: {}
			},
			default: "map",
			requires: ["fill-translate"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"fill-pattern": {
			type: "resolvedImage",
			transition: !0,
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "cross-faded-data-driven"
		}
	},
	"paint_fill-extrusion": {
		"fill-extrusion-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"fill-extrusion-color": {
			type: "color",
			default: "#000000",
			transition: !0,
			requires: [{ "!": "fill-extrusion-pattern" }],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"fill-extrusion-translate": {
			type: "array",
			value: "number",
			length: 2,
			default: [0, 0],
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"fill-extrusion-translate-anchor": {
			type: "enum",
			values: {
				map: {},
				viewport: {}
			},
			default: "map",
			requires: ["fill-extrusion-translate"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"fill-extrusion-pattern": {
			type: "resolvedImage",
			transition: !0,
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "cross-faded-data-driven"
		},
		"fill-extrusion-height": {
			type: "number",
			default: 0,
			units: "meters",
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"fill-extrusion-base": {
			type: "number",
			default: 0,
			units: "meters",
			transition: !0,
			requires: ["fill-extrusion-height"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"fill-extrusion-vertical-gradient": {
			type: "boolean",
			default: !0,
			transition: !1,
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		}
	},
	paint_line: {
		"line-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"line-layer-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom", "global-state"]
			},
			"property-type": "data-constant"
		},
		"line-color": {
			type: "color",
			default: "#000000",
			transition: !0,
			requires: [{ "!": "line-pattern" }],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"line-translate": {
			type: "array",
			value: "number",
			length: 2,
			default: [0, 0],
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"line-translate-anchor": {
			type: "enum",
			values: {
				map: {},
				viewport: {}
			},
			default: "map",
			requires: ["line-translate"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"line-width": {
			type: "number",
			default: 1,
			minimum: 0,
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"line-gap-width": {
			type: "number",
			default: 0,
			minimum: 0,
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"line-offset": {
			type: "number",
			default: 0,
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"line-blur": {
			type: "number",
			default: 0,
			minimum: 0,
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"line-dasharray": {
			type: "array",
			value: "number",
			minimum: 0,
			transition: !0,
			units: "line widths",
			requires: [{ "!": "line-pattern" }],
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "cross-faded-data-driven"
		},
		"line-pattern": {
			type: "resolvedImage",
			transition: !0,
			expression: {
				interpolated: !1,
				parameters: ["zoom", "feature"]
			},
			"property-type": "cross-faded-data-driven"
		},
		"line-gradient": {
			type: "color",
			transition: !1,
			requires: [
				{ "!": "line-dasharray" },
				{ "!": "line-pattern" },
				{
					source: "geojson",
					has: { lineMetrics: !0 }
				}
			],
			expression: {
				interpolated: !0,
				parameters: ["line-progress"]
			},
			"property-type": "color-ramp"
		}
	},
	paint_circle: {
		"circle-radius": {
			type: "number",
			default: 5,
			minimum: 0,
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"circle-color": {
			type: "color",
			default: "#000000",
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"circle-blur": {
			type: "number",
			default: 0,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"circle-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"circle-translate": {
			type: "array",
			value: "number",
			length: 2,
			default: [0, 0],
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"circle-translate-anchor": {
			type: "enum",
			values: {
				map: {},
				viewport: {}
			},
			default: "map",
			requires: ["circle-translate"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"circle-pitch-scale": {
			type: "enum",
			values: {
				map: {},
				viewport: {}
			},
			default: "map",
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"circle-pitch-alignment": {
			type: "enum",
			values: {
				map: {},
				viewport: {}
			},
			default: "viewport",
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"circle-stroke-width": {
			type: "number",
			default: 0,
			minimum: 0,
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"circle-stroke-color": {
			type: "color",
			default: "#000000",
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"circle-stroke-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		}
	},
	paint_heatmap: {
		"heatmap-radius": {
			type: "number",
			default: 30,
			minimum: 1,
			transition: !0,
			units: "pixels",
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"heatmap-weight": {
			type: "number",
			default: 1,
			minimum: 0,
			transition: !1,
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"heatmap-intensity": {
			type: "number",
			default: 1,
			minimum: 0,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"heatmap-color": {
			type: "color",
			default: [
				"interpolate",
				["linear"],
				["heatmap-density"],
				0,
				"rgba(0, 0, 255, 0)",
				.1,
				"royalblue",
				.3,
				"cyan",
				.5,
				"lime",
				.7,
				"yellow",
				1,
				"red"
			],
			transition: !1,
			expression: {
				interpolated: !0,
				parameters: ["heatmap-density"]
			},
			"property-type": "color-ramp"
		},
		"heatmap-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		}
	},
	paint_symbol: {
		"icon-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			requires: ["icon-image"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"icon-color": {
			type: "color",
			default: "#000000",
			transition: !0,
			requires: ["icon-image"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"icon-halo-color": {
			type: "color",
			default: "rgba(0, 0, 0, 0)",
			transition: !0,
			requires: ["icon-image"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"icon-halo-width": {
			type: "number",
			default: 0,
			minimum: 0,
			transition: !0,
			units: "pixels",
			requires: ["icon-image"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"icon-halo-blur": {
			type: "number",
			default: 0,
			minimum: 0,
			transition: !0,
			units: "pixels",
			requires: ["icon-image"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"icon-translate": {
			type: "array",
			value: "number",
			length: 2,
			default: [0, 0],
			transition: !0,
			units: "pixels",
			requires: ["icon-image"],
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"icon-translate-anchor": {
			type: "enum",
			values: {
				map: {},
				viewport: {}
			},
			default: "map",
			requires: ["icon-image", "icon-translate"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"text-color": {
			type: "color",
			default: "#000000",
			transition: !0,
			overridable: !0,
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"text-halo-color": {
			type: "color",
			default: "rgba(0, 0, 0, 0)",
			transition: !0,
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"text-halo-width": {
			type: "number",
			default: 0,
			minimum: 0,
			transition: !0,
			units: "pixels",
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"text-halo-blur": {
			type: "number",
			default: 0,
			minimum: 0,
			transition: !0,
			units: "pixels",
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: [
					"zoom",
					"feature",
					"feature-state"
				]
			},
			"property-type": "data-driven"
		},
		"text-translate": {
			type: "array",
			value: "number",
			length: 2,
			default: [0, 0],
			transition: !0,
			units: "pixels",
			requires: ["text-field"],
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"text-translate-anchor": {
			type: "enum",
			values: {
				map: {},
				viewport: {}
			},
			default: "map",
			requires: ["text-field", "text-translate"],
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		}
	},
	paint_raster: {
		"raster-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"raster-hue-rotate": {
			type: "number",
			default: 0,
			period: 360,
			transition: !0,
			units: "degrees",
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"raster-brightness-min": {
			type: "number",
			default: 0,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"raster-brightness-max": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"raster-saturation": {
			type: "number",
			default: 0,
			minimum: -1,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"raster-contrast": {
			type: "number",
			default: 0,
			minimum: -1,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		resampling: {
			type: "enum",
			values: {
				linear: {},
				nearest: {}
			},
			default: "linear",
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"raster-resampling": {
			type: "enum",
			values: {
				linear: {},
				nearest: {}
			},
			default: "linear",
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"raster-fade-duration": {
			type: "number",
			default: 300,
			minimum: 0,
			transition: !1,
			units: "milliseconds",
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		}
	},
	paint_hillshade: {
		"hillshade-illumination-direction": {
			type: "numberArray",
			default: 335,
			minimum: 0,
			maximum: 359,
			transition: !1,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"hillshade-illumination-altitude": {
			type: "numberArray",
			default: 45,
			minimum: 0,
			maximum: 90,
			transition: !1,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"hillshade-illumination-anchor": {
			type: "enum",
			values: {
				map: {},
				viewport: {}
			},
			default: "viewport",
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"hillshade-exaggeration": {
			type: "number",
			default: .5,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"hillshade-shadow-color": {
			type: "colorArray",
			default: "#000000",
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"hillshade-highlight-color": {
			type: "colorArray",
			default: "#FFFFFF",
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"hillshade-accent-color": {
			type: "color",
			default: "#000000",
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"hillshade-method": {
			type: "enum",
			values: {
				standard: {},
				basic: {},
				combined: {},
				igor: {},
				multidirectional: {}
			},
			default: "standard",
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		resampling: {
			type: "enum",
			values: {
				linear: {},
				nearest: {}
			},
			default: "linear",
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		}
	},
	"paint_color-relief": {
		"color-relief-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"color-relief-color": {
			type: "color",
			transition: !1,
			expression: {
				interpolated: !0,
				parameters: ["elevation"]
			},
			"property-type": "color-ramp"
		},
		resampling: {
			type: "enum",
			values: {
				linear: {},
				nearest: {}
			},
			default: "linear",
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		}
	},
	paint_background: {
		"background-color": {
			type: "color",
			default: "#000000",
			transition: !0,
			requires: [{ "!": "background-pattern" }],
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		},
		"background-pattern": {
			type: "resolvedImage",
			transition: !0,
			expression: {
				interpolated: !1,
				parameters: ["zoom"]
			},
			"property-type": "cross-faded"
		},
		"background-opacity": {
			type: "number",
			default: 1,
			minimum: 0,
			maximum: 1,
			transition: !0,
			expression: {
				interpolated: !0,
				parameters: ["zoom"]
			},
			"property-type": "data-constant"
		}
	},
	transition: {
		duration: {
			type: "number",
			default: 300,
			minimum: 0,
			units: "milliseconds"
		},
		delay: {
			type: "number",
			default: 0,
			minimum: 0,
			units: "milliseconds"
		}
	},
	"property-type": {
		"data-driven": { type: "property-type" },
		"cross-faded": { type: "property-type" },
		"cross-faded-data-driven": { type: "property-type" },
		"color-ramp": { type: "property-type" },
		"data-constant": { type: "property-type" },
		constant: { type: "property-type" }
	},
	promoteId: { "*": { type: "string" } },
	interpolation: {
		type: "array",
		value: "interpolation_name",
		minimum: 1
	},
	interpolation_name: {
		type: "enum",
		values: {
			linear: { syntax: {
				overloads: [{
					parameters: [],
					"output-type": "interpolation"
				}],
				parameters: []
			} },
			exponential: { syntax: {
				overloads: [{
					parameters: ["base"],
					"output-type": "interpolation"
				}],
				parameters: [{
					name: "base",
					type: "number literal"
				}]
			} },
			"cubic-bezier": { syntax: {
				overloads: [{
					parameters: [
						"x1",
						"y1",
						"x2",
						"y2"
					],
					"output-type": "interpolation"
				}],
				parameters: [
					{
						name: "x1",
						type: "number literal"
					},
					{
						name: "y1",
						type: "number literal"
					},
					{
						name: "x2",
						type: "number literal"
					},
					{
						name: "y2",
						type: "number literal"
					}
				]
			} }
		}
	}
}, V_ = [
	"type",
	"source",
	"source-layer",
	"minzoom",
	"maxzoom",
	"filter",
	"layout"
];
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/deref.mjs
function H_(e, t) {
	let n = {};
	for (let t in e) t !== "ref" && (n[t] = e[t]);
	return V_.forEach((e) => {
		e in t && (n[e] = t[e]);
	}), n;
}
function U_(e) {
	e = e.slice();
	let t = Object.create(null);
	for (let n = 0; n < e.length; n++) t[e[n].id] = e[n];
	for (let n = 0; n < e.length; n++) "ref" in e[n] && (e[n] = H_(e[n], t[e[n].ref]));
	return e;
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/types.mjs
var W_ = { kind: "null" }, Y = { kind: "number" }, X = { kind: "string" }, Z = { kind: "boolean" }, G_ = { kind: "color" }, K_ = { kind: "projectionDefinition" }, q_ = { kind: "object" }, Q = { kind: "value" }, J_ = { kind: "error" }, Y_ = { kind: "collator" }, X_ = { kind: "formatted" }, Z_ = { kind: "padding" }, Q_ = { kind: "colorArray" }, $_ = { kind: "numberArray" }, ev = { kind: "resolvedImage" }, tv = { kind: "variableAnchorOffsetCollection" };
function nv(e, t) {
	return {
		kind: "array",
		itemType: e,
		N: t
	};
}
function rv(e) {
	if (e.kind === "array") {
		let t = rv(e.itemType);
		return typeof e.N == "number" ? `array<${t}, ${e.N}>` : e.itemType.kind === "value" ? "array" : `array<${t}>`;
	}
	return e.kind;
}
var iv = [
	W_,
	Y,
	X,
	Z,
	G_,
	K_,
	X_,
	q_,
	nv(Q),
	Z_,
	$_,
	Q_,
	ev,
	tv
];
function av(e, t) {
	if (t.kind === "error") return null;
	if (e.kind === "array") {
		if (t.kind === "array" && (t.N === 0 && t.itemType.kind === "value" || !av(e.itemType, t.itemType)) && (typeof e.N != "number" || e.N === t.N)) return null;
	} else if (e.kind === t.kind) return null;
	else if (e.kind === "value") {
		for (let e of iv) if (!av(e, t)) return null;
	}
	return `Expected ${rv(e)} but found ${rv(t)} instead.`;
}
function ov(e, t) {
	return t.some((t) => t.kind === e.kind);
}
function sv(e, t) {
	return t.some((t) => t === "null" ? e === null : t === "array" ? Array.isArray(e) : t === "object" ? e && !Array.isArray(e) && typeof e == "object" : t === typeof e);
}
function cv(e, t) {
	return e.kind === "array" && t.kind === "array" ? e.itemType.kind === t.itemType.kind && typeof e.N == "number" : e.kind === t.kind;
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/types/color_spaces.mjs
var lv = .96422, uv = 1, dv = .82521, fv = 4 / 29, pv = 6 / 29, mv = 3 * pv * pv, hv = pv * pv * pv, gv = Math.PI / 180, _v = 180 / Math.PI;
function vv(e) {
	return e %= 360, e < 0 && (e += 360), e;
}
function yv([e, t, n, r]) {
	e = bv(e), t = bv(t), n = bv(n);
	let i, a, o = xv((.2225045 * e + .7168786 * t + .0606169 * n) / uv);
	e === t && t === n ? i = a = o : (i = xv((.4360747 * e + .3850649 * t + .1430804 * n) / lv), a = xv((.0139322 * e + .0971045 * t + .7141733 * n) / dv));
	let s = 116 * o - 16;
	return [
		s < 0 ? 0 : s,
		500 * (i - o),
		200 * (o - a),
		r
	];
}
function bv(e) {
	return e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4;
}
function xv(e) {
	return e > hv ? e ** (1 / 3) : e / mv + fv;
}
function Sv([e, t, n, r]) {
	let i = (e + 16) / 116, a = isNaN(t) ? i : i + t / 500, o = isNaN(n) ? i : i - n / 200;
	return i = uv * wv(i), a = lv * wv(a), o = dv * wv(o), [
		Cv(3.1338561 * a - 1.6168667 * i - .4906146 * o),
		Cv(-.9787684 * a + 1.9161415 * i + .033454 * o),
		Cv(.0719453 * a - .2289914 * i + 1.4052427 * o),
		r
	];
}
function Cv(e) {
	return e = e <= .00304 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055, e < 0 ? 0 : e > 1 ? 1 : e;
}
function wv(e) {
	return e > pv ? e * e * e : mv * (e - fv);
}
function Tv(e) {
	let [t, n, r, i] = yv(e), a = Math.sqrt(n * n + r * r);
	return [
		Math.round(a * 1e4) ? vv(Math.atan2(r, n) * _v) : NaN,
		a,
		t,
		i
	];
}
function Ev([e, t, n, r]) {
	return e = isNaN(e) ? 0 : e * gv, Sv([
		n,
		Math.cos(e) * t,
		Math.sin(e) * t,
		r
	]);
}
function Dv([e, t, n, r]) {
	e = vv(e), t /= 100, n /= 100;
	function i(r) {
		let i = (r + e / 30) % 12, a = t * Math.min(n, 1 - n);
		return n - a * Math.max(-1, Math.min(i - 3, 9 - i, 1));
	}
	return [
		i(0),
		i(8),
		i(4),
		r
	];
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/util/get_own.mjs
var Ov = Object.hasOwn || function(e, t) {
	return Object.prototype.hasOwnProperty.call(e, t);
};
function kv(e, t) {
	return Ov(e, t) ? e[t] : void 0;
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/types/parse_css_color.mjs
function Av(e) {
	if (e = e.toLowerCase().trim(), e === "transparent") return [
		0,
		0,
		0,
		0
	];
	let t = kv(Fv, e);
	if (t) {
		let [e, n, r] = t;
		return [
			e / 255,
			n / 255,
			r / 255,
			1
		];
	}
	if (e.startsWith("#") && /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(e)) {
		let t = e.length < 6 ? 1 : 2, n = 1;
		return [
			jv(e.slice(n, n += t)),
			jv(e.slice(n, n += t)),
			jv(e.slice(n, n += t)),
			jv(e.slice(n, n + t) || "ff")
		];
	}
	if (e.startsWith("rgb")) {
		let t = e.match(/^rgba?\(\s*([\de.+-]+)(%)?(?:\s+|\s*(,)\s*)([\de.+-]+)(%)?(?:\s+|\s*(,)\s*)([\de.+-]+)(%)?(?:\s*([,\/])\s*([\de.+-]+)(%)?)?\s*\)$/);
		if (t) {
			let [e, n, r, i, a, o, s, c, l, u, d, f] = t, p = [
				i || " ",
				s || " ",
				u
			].join("");
			if (p === "  " || p === "  /" || p === ",," || p === ",,,") {
				let e = [
					r,
					o,
					l
				].join(""), t = e === "%%%" ? 100 : e === "" ? 255 : 0;
				if (t) {
					let e = [
						Nv(+n / t, 0, 1),
						Nv(+a / t, 0, 1),
						Nv(+c / t, 0, 1),
						d ? Mv(+d, f) : 1
					];
					if (Pv(e)) return e;
				}
			}
			return;
		}
	}
	let n = e.match(/^hsla?\(\s*([\de.+-]+)(?:deg)?(?:\s+|\s*(,)\s*)([\de.+-]+)%(?:\s+|\s*(,)\s*)([\de.+-]+)%(?:\s*([,\/])\s*([\de.+-]+)(%)?)?\s*\)$/);
	if (n) {
		let [e, t, r, i, a, o, s, c, l] = n, u = [
			r || " ",
			a || " ",
			s
		].join("");
		if (u === "  " || u === "  /" || u === ",," || u === ",,,") {
			let e = [
				+t,
				Nv(+i, 0, 100),
				Nv(+o, 0, 100),
				c ? Mv(+c, l) : 1
			];
			if (Pv(e)) return Dv(e);
		}
	}
}
function jv(e) {
	return parseInt(e.padEnd(2, e), 16) / 255;
}
function Mv(e, t) {
	return Nv(t ? e / 100 : e, 0, 1);
}
function Nv(e, t, n) {
	return Math.min(Math.max(t, e), n);
}
function Pv(e) {
	return !e.some(Number.isNaN);
}
var Fv = {
	aliceblue: [
		240,
		248,
		255
	],
	antiquewhite: [
		250,
		235,
		215
	],
	aqua: [
		0,
		255,
		255
	],
	aquamarine: [
		127,
		255,
		212
	],
	azure: [
		240,
		255,
		255
	],
	beige: [
		245,
		245,
		220
	],
	bisque: [
		255,
		228,
		196
	],
	black: [
		0,
		0,
		0
	],
	blanchedalmond: [
		255,
		235,
		205
	],
	blue: [
		0,
		0,
		255
	],
	blueviolet: [
		138,
		43,
		226
	],
	brown: [
		165,
		42,
		42
	],
	burlywood: [
		222,
		184,
		135
	],
	cadetblue: [
		95,
		158,
		160
	],
	chartreuse: [
		127,
		255,
		0
	],
	chocolate: [
		210,
		105,
		30
	],
	coral: [
		255,
		127,
		80
	],
	cornflowerblue: [
		100,
		149,
		237
	],
	cornsilk: [
		255,
		248,
		220
	],
	crimson: [
		220,
		20,
		60
	],
	cyan: [
		0,
		255,
		255
	],
	darkblue: [
		0,
		0,
		139
	],
	darkcyan: [
		0,
		139,
		139
	],
	darkgoldenrod: [
		184,
		134,
		11
	],
	darkgray: [
		169,
		169,
		169
	],
	darkgreen: [
		0,
		100,
		0
	],
	darkgrey: [
		169,
		169,
		169
	],
	darkkhaki: [
		189,
		183,
		107
	],
	darkmagenta: [
		139,
		0,
		139
	],
	darkolivegreen: [
		85,
		107,
		47
	],
	darkorange: [
		255,
		140,
		0
	],
	darkorchid: [
		153,
		50,
		204
	],
	darkred: [
		139,
		0,
		0
	],
	darksalmon: [
		233,
		150,
		122
	],
	darkseagreen: [
		143,
		188,
		143
	],
	darkslateblue: [
		72,
		61,
		139
	],
	darkslategray: [
		47,
		79,
		79
	],
	darkslategrey: [
		47,
		79,
		79
	],
	darkturquoise: [
		0,
		206,
		209
	],
	darkviolet: [
		148,
		0,
		211
	],
	deeppink: [
		255,
		20,
		147
	],
	deepskyblue: [
		0,
		191,
		255
	],
	dimgray: [
		105,
		105,
		105
	],
	dimgrey: [
		105,
		105,
		105
	],
	dodgerblue: [
		30,
		144,
		255
	],
	firebrick: [
		178,
		34,
		34
	],
	floralwhite: [
		255,
		250,
		240
	],
	forestgreen: [
		34,
		139,
		34
	],
	fuchsia: [
		255,
		0,
		255
	],
	gainsboro: [
		220,
		220,
		220
	],
	ghostwhite: [
		248,
		248,
		255
	],
	gold: [
		255,
		215,
		0
	],
	goldenrod: [
		218,
		165,
		32
	],
	gray: [
		128,
		128,
		128
	],
	green: [
		0,
		128,
		0
	],
	greenyellow: [
		173,
		255,
		47
	],
	grey: [
		128,
		128,
		128
	],
	honeydew: [
		240,
		255,
		240
	],
	hotpink: [
		255,
		105,
		180
	],
	indianred: [
		205,
		92,
		92
	],
	indigo: [
		75,
		0,
		130
	],
	ivory: [
		255,
		255,
		240
	],
	khaki: [
		240,
		230,
		140
	],
	lavender: [
		230,
		230,
		250
	],
	lavenderblush: [
		255,
		240,
		245
	],
	lawngreen: [
		124,
		252,
		0
	],
	lemonchiffon: [
		255,
		250,
		205
	],
	lightblue: [
		173,
		216,
		230
	],
	lightcoral: [
		240,
		128,
		128
	],
	lightcyan: [
		224,
		255,
		255
	],
	lightgoldenrodyellow: [
		250,
		250,
		210
	],
	lightgray: [
		211,
		211,
		211
	],
	lightgreen: [
		144,
		238,
		144
	],
	lightgrey: [
		211,
		211,
		211
	],
	lightpink: [
		255,
		182,
		193
	],
	lightsalmon: [
		255,
		160,
		122
	],
	lightseagreen: [
		32,
		178,
		170
	],
	lightskyblue: [
		135,
		206,
		250
	],
	lightslategray: [
		119,
		136,
		153
	],
	lightslategrey: [
		119,
		136,
		153
	],
	lightsteelblue: [
		176,
		196,
		222
	],
	lightyellow: [
		255,
		255,
		224
	],
	lime: [
		0,
		255,
		0
	],
	limegreen: [
		50,
		205,
		50
	],
	linen: [
		250,
		240,
		230
	],
	magenta: [
		255,
		0,
		255
	],
	maroon: [
		128,
		0,
		0
	],
	mediumaquamarine: [
		102,
		205,
		170
	],
	mediumblue: [
		0,
		0,
		205
	],
	mediumorchid: [
		186,
		85,
		211
	],
	mediumpurple: [
		147,
		112,
		219
	],
	mediumseagreen: [
		60,
		179,
		113
	],
	mediumslateblue: [
		123,
		104,
		238
	],
	mediumspringgreen: [
		0,
		250,
		154
	],
	mediumturquoise: [
		72,
		209,
		204
	],
	mediumvioletred: [
		199,
		21,
		133
	],
	midnightblue: [
		25,
		25,
		112
	],
	mintcream: [
		245,
		255,
		250
	],
	mistyrose: [
		255,
		228,
		225
	],
	moccasin: [
		255,
		228,
		181
	],
	navajowhite: [
		255,
		222,
		173
	],
	navy: [
		0,
		0,
		128
	],
	oldlace: [
		253,
		245,
		230
	],
	olive: [
		128,
		128,
		0
	],
	olivedrab: [
		107,
		142,
		35
	],
	orange: [
		255,
		165,
		0
	],
	orangered: [
		255,
		69,
		0
	],
	orchid: [
		218,
		112,
		214
	],
	palegoldenrod: [
		238,
		232,
		170
	],
	palegreen: [
		152,
		251,
		152
	],
	paleturquoise: [
		175,
		238,
		238
	],
	palevioletred: [
		219,
		112,
		147
	],
	papayawhip: [
		255,
		239,
		213
	],
	peachpuff: [
		255,
		218,
		185
	],
	peru: [
		205,
		133,
		63
	],
	pink: [
		255,
		192,
		203
	],
	plum: [
		221,
		160,
		221
	],
	powderblue: [
		176,
		224,
		230
	],
	purple: [
		128,
		0,
		128
	],
	rebeccapurple: [
		102,
		51,
		153
	],
	red: [
		255,
		0,
		0
	],
	rosybrown: [
		188,
		143,
		143
	],
	royalblue: [
		65,
		105,
		225
	],
	saddlebrown: [
		139,
		69,
		19
	],
	salmon: [
		250,
		128,
		114
	],
	sandybrown: [
		244,
		164,
		96
	],
	seagreen: [
		46,
		139,
		87
	],
	seashell: [
		255,
		245,
		238
	],
	sienna: [
		160,
		82,
		45
	],
	silver: [
		192,
		192,
		192
	],
	skyblue: [
		135,
		206,
		235
	],
	slateblue: [
		106,
		90,
		205
	],
	slategray: [
		112,
		128,
		144
	],
	slategrey: [
		112,
		128,
		144
	],
	snow: [
		255,
		250,
		250
	],
	springgreen: [
		0,
		255,
		127
	],
	steelblue: [
		70,
		130,
		180
	],
	tan: [
		210,
		180,
		140
	],
	teal: [
		0,
		128,
		128
	],
	thistle: [
		216,
		191,
		216
	],
	tomato: [
		255,
		99,
		71
	],
	turquoise: [
		64,
		224,
		208
	],
	violet: [
		238,
		130,
		238
	],
	wheat: [
		245,
		222,
		179
	],
	white: [
		255,
		255,
		255
	],
	whitesmoke: [
		245,
		245,
		245
	],
	yellow: [
		255,
		255,
		0
	],
	yellowgreen: [
		154,
		205,
		50
	]
};
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/util/interpolate-primitives.mjs
function Iv(e, t, n) {
	return e + n * (t - e);
}
function Lv(e, t, n) {
	return e.map((e, r) => Iv(e, t[r], n));
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/types/color.mjs
var Rv = class e {
	constructor(e, t, n, r = 1, i = !0) {
		this.r = e, this.g = t, this.b = n, this.a = r, i || (this.r *= r, this.g *= r, this.b *= r, r || this.overwriteGetter("rgb", [
			e,
			t,
			n,
			r
		]));
	}
	static {
		this.black = new e(0, 0, 0, 1);
	}
	static {
		this.white = new e(1, 1, 1, 1);
	}
	static {
		this.transparent = new e(0, 0, 0, 0);
	}
	static {
		this.red = new e(1, 0, 0, 1);
	}
	static parse(t) {
		if (t instanceof e) return t;
		if (typeof t != "string") return;
		let n = Av(t);
		if (n) return new e(...n, !1);
	}
	get rgb() {
		let { r: e, g: t, b: n, a: r } = this, i = r || Infinity;
		return this.overwriteGetter("rgb", [
			e / i,
			t / i,
			n / i,
			r
		]);
	}
	get hcl() {
		return this.overwriteGetter("hcl", Tv(this.rgb));
	}
	get lab() {
		return this.overwriteGetter("lab", yv(this.rgb));
	}
	overwriteGetter(e, t) {
		return Object.defineProperty(this, e, { value: t }), t;
	}
	toString() {
		let [e, t, n, r] = this.rgb;
		return `rgba(${[
			e,
			t,
			n
		].map((e) => Math.round(e * 255)).join(",")},${r})`;
	}
	static interpolate(t, n, r, i = "rgb") {
		switch (i) {
			case "rgb": {
				let [i, a, o, s] = Lv(t.rgb, n.rgb, r);
				return new e(i, a, o, s, !1);
			}
			case "hcl": {
				let [i, a, o, s] = t.hcl, [c, l, u, d] = n.hcl, f, p;
				if (!isNaN(i) && !isNaN(c)) {
					let e = c - i;
					c > i && e > 180 ? e -= 360 : c < i && i - c > 180 && (e += 360), f = i + r * e;
				} else isNaN(i) ? isNaN(c) ? f = NaN : (f = c, (o === 1 || o === 0) && (p = l)) : (f = i, (u === 1 || u === 0) && (p = a));
				let [m, h, g, _] = Ev([
					f,
					p ?? Iv(a, l, r),
					Iv(o, u, r),
					Iv(s, d, r)
				]);
				return new e(m, h, g, _, !1);
			}
			case "lab": {
				let [i, a, o, s] = Sv(Lv(t.lab, n.lab, r));
				return new e(i, a, o, s, !1);
			}
		}
	}
}, zv = [
	"bottom",
	"center",
	"top"
], Bv = class {
	constructor(e, t, n, r, i, a) {
		this.text = e, this.image = t, this.scale = n, this.fontStack = r, this.textColor = i, this.verticalAlign = a;
	}
}, Vv = class e {
	constructor(e) {
		this.sections = e;
	}
	static fromString(t) {
		return new e([new Bv(t, null, null, null, null, null)]);
	}
	isEmpty() {
		return this.sections.length === 0 || !this.sections.some((e) => e.text.length !== 0 || e.image && e.image.name.length !== 0);
	}
	static factory(t) {
		return t instanceof e ? t : e.fromString(t);
	}
	toString() {
		return this.sections.length === 0 ? "" : this.sections.map((e) => e.text).join("");
	}
}, Hv = class e {
	constructor(e) {
		this.values = e.slice();
	}
	static parse(t) {
		if (t instanceof e) return t;
		if (typeof t == "number") return new e([
			t,
			t,
			t,
			t
		]);
		if (Array.isArray(t) && !(t.length < 1 || t.length > 4)) {
			for (let e of t) if (typeof e != "number") return;
			switch (t.length) {
				case 1:
					t = [
						t[0],
						t[0],
						t[0],
						t[0]
					];
					break;
				case 2:
					t = [
						t[0],
						t[1],
						t[0],
						t[1]
					];
					break;
				case 3: t = [
					t[0],
					t[1],
					t[2],
					t[1]
				];
			}
			return new e(t);
		}
	}
	toString() {
		return JSON.stringify(this.values);
	}
	static interpolate(t, n, r) {
		return new e(Lv(t.values, n.values, r));
	}
}, Uv = class e {
	constructor(e) {
		this.values = e.slice();
	}
	static parse(t) {
		if (t instanceof e) return t;
		if (typeof t == "number") return new e([t]);
		if (Array.isArray(t)) {
			for (let e of t) if (typeof e != "number") return;
			return new e(t);
		}
	}
	toString() {
		return JSON.stringify(this.values);
	}
	static interpolate(t, n, r) {
		return new e(Lv(t.values, n.values, r));
	}
}, Wv = class e {
	constructor(e) {
		this.values = e.slice();
	}
	static parse(t) {
		if (t instanceof e) return t;
		if (typeof t == "string") {
			let n = Rv.parse(t);
			return n ? new e([n]) : void 0;
		}
		if (!Array.isArray(t)) return;
		let n = [];
		for (let e of t) {
			if (typeof e != "string") return;
			let t = Rv.parse(e);
			if (!t) return;
			n.push(t);
		}
		return new e(n);
	}
	toString() {
		return JSON.stringify(this.values);
	}
	static interpolate(t, n, r, i = "rgb") {
		let a = [];
		if (t.values.length != n.values.length) throw Error(`colorArray: Arrays have mismatched length (${t.values.length} vs. ${n.values.length}), cannot interpolate.`);
		for (let e = 0; e < t.values.length; e++) a.push(Rv.interpolate(t.values[e], n.values[e], r, i));
		return new e(a);
	}
}, Gv = class extends Error {
	constructor(e, t) {
		super(e), this.name = "RuntimeError", this.path = t;
	}
	toJSON() {
		return this.message;
	}
}, Kv = /* @__PURE__ */ new Set([
	"center",
	"left",
	"right",
	"top",
	"bottom",
	"top-left",
	"top-right",
	"bottom-left",
	"bottom-right"
]), qv = class e {
	constructor(e) {
		this.values = e.slice();
	}
	static parse(t) {
		if (t instanceof e) return t;
		if (!(!Array.isArray(t) || t.length < 1 || t.length % 2 != 0)) {
			for (let e = 0; e < t.length; e += 2) {
				let n = t[e], r = t[e + 1];
				if (typeof n != "string" || !Kv.has(n) || !Array.isArray(r) || r.length !== 2 || typeof r[0] != "number" || typeof r[1] != "number") return;
			}
			return new e(t);
		}
	}
	toString() {
		return JSON.stringify(this.values);
	}
	static interpolate(t, n, r, i) {
		let a = t.values, o = n.values;
		if (a.length !== o.length) throw new Gv(`Cannot interpolate values of different length. from: ${t.toString()}, to: ${n.toString()}`, i);
		let s = [];
		for (let e = 0; e < a.length; e += 2) {
			if (a[e] !== o[e]) throw new Gv(`Cannot interpolate values containing mismatched anchors. from[${e}]: ${a[e]}, to[${e}]: ${o[e]}`, i);
			s.push(a[e]);
			let [t, n] = a[e + 1], [c, l] = o[e + 1];
			s.push([Iv(t, c, r), Iv(n, l, r)]);
		}
		return new e(s);
	}
}, Jv = class e {
	constructor(e) {
		this.name = e.name, this.available = e.available;
	}
	toString() {
		return this.name;
	}
	static fromString(t) {
		return t ? new e({
			name: t,
			available: !1
		}) : null;
	}
}, Yv = class e {
	constructor(e, t, n) {
		this.from = e, this.to = t, this.transition = n;
	}
	toString() {
		return this.from === this.to && this.transition === 1 ? this.from : JSON.stringify([
			this.from,
			this.to,
			this.transition
		]);
	}
	static interpolate(t, n, r) {
		return new e(t, n, r);
	}
	static parse(t) {
		if (t instanceof e) return t;
		if (Array.isArray(t) && t.length === 3 && typeof t[0] == "string" && typeof t[1] == "string" && typeof t[2] == "number") return new e(t[0], t[1], t[2]);
		if (typeof t == "object" && typeof t.from == "string" && typeof t.to == "string" && typeof t.transition == "number") return new e(t.from, t.to, t.transition);
		if (typeof t == "string") return new e(t, t, 1);
	}
}, Xv = class {
	constructor(e, t, n) {
		this.sensitivity = e ? t ? "variant" : "case" : t ? "accent" : "base", this.locale = n, this.collator = new Intl.Collator(this.locale ? this.locale : [], {
			sensitivity: this.sensitivity,
			usage: "search"
		});
	}
	compare(e, t) {
		return this.collator.compare(e, t);
	}
	resolvedLocale() {
		return new Intl.Collator(this.locale ? this.locale : []).resolvedOptions().locale;
	}
};
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/values.mjs
function Zv(e, t, n, r) {
	return typeof e == "number" && e >= 0 && e <= 255 && typeof t == "number" && t >= 0 && t <= 255 && typeof n == "number" && n >= 0 && n <= 255 ? r === void 0 || typeof r == "number" && r >= 0 && r <= 1 ? null : `Invalid rgba value [${[
		e,
		t,
		n,
		r
	].join(", ")}]: 'a' must be between 0 and 1.` : `Invalid rgba value [${(typeof r == "number" ? [
		e,
		t,
		n,
		r
	] : [
		e,
		t,
		n
	]).join(", ")}]: 'r', 'g', and 'b' must be between 0 and 255.`;
}
function Qv(e) {
	if (e === null || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || e instanceof Yv || e instanceof Rv || e instanceof Xv || e instanceof Vv || e instanceof Hv || e instanceof Uv || e instanceof Wv || e instanceof qv || e instanceof Jv) return !0;
	if (Array.isArray(e)) {
		for (let t of e) if (!Qv(t)) return !1;
		return !0;
	}
	if (typeof e == "object") {
		for (let t in e) if (!Qv(e[t])) return !1;
		return !0;
	}
	return !1;
}
function $v(e) {
	if (e === null) return W_;
	if (typeof e == "string") return X;
	if (typeof e == "boolean") return Z;
	if (typeof e == "number") return Y;
	if (e instanceof Rv) return G_;
	if (e instanceof Yv) return K_;
	if (e instanceof Xv) return Y_;
	if (e instanceof Vv) return X_;
	if (e instanceof Hv) return Z_;
	if (e instanceof Uv) return $_;
	if (e instanceof Wv) return Q_;
	if (e instanceof qv) return tv;
	if (e instanceof Jv) return ev;
	if (Array.isArray(e)) {
		let t = e.length, n;
		for (let t of e) {
			let e = $v(t);
			if (!n) n = e;
			else if (n === e) continue;
			else {
				n = Q;
				break;
			}
		}
		return nv(n || Q, t);
	}
	return q_;
}
function ey(e) {
	let t = typeof e;
	return e === null ? "" : t === "string" || t === "number" || t === "boolean" ? String(e) : e instanceof Rv || e instanceof Yv || e instanceof Vv || e instanceof Hv || e instanceof Uv || e instanceof Wv || e instanceof qv || e instanceof Jv ? e.toString() : JSON.stringify(e);
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/definitions/literal.mjs
var ty = class e {
	constructor(e, t) {
		this.type = e, this.value = t;
	}
	static parse(t, n) {
		if (t.length !== 2) return n.error(`'literal' expression requires exactly one argument, but found ${t.length - 1} instead.`);
		if (!Qv(t[1])) return n.error(`invalid value of type "${typeof t[1]}"`);
		let r = t[1], i = $v(r), a = n.expectedType;
		return i.kind === "array" && i.N === 0 && a && a.kind === "array" && (typeof a.N != "number" || a.N === 0) && (i = a), new e(i, r);
	}
	evaluate() {
		return this.value;
	}
	eachChild() {}
	outputDefined() {
		return !0;
	}
}, ny = [
	"Unknown",
	"Point",
	"LineString",
	"Polygon"
], ry = class {
	constructor() {
		this.globals = null, this.feature = null, this.featureState = null, this.formattedSection = null, this._parseColorCache = /* @__PURE__ */ new Map(), this.availableImages = null, this.canonical = null;
	}
	id() {
		return this.feature && "id" in this.feature ? this.feature.id : null;
	}
	geometryType() {
		return this.feature ? typeof this.feature.type == "number" ? ny[this.feature.type] : this.feature.type : null;
	}
	geometry() {
		return this.feature && "geometry" in this.feature ? this.feature.geometry : null;
	}
	canonicalID() {
		return this.canonical;
	}
	properties() {
		return this.feature && this.feature.properties || {};
	}
	parseColor(e) {
		let t = this._parseColorCache.get(e);
		return t || (t = Rv.parse(e), this._parseColorCache.set(e, t)), t;
	}
};
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/stops.mjs
function iy(e, t, n) {
	let r = e.length - 1, i = 0, a = r, o = 0, s, c;
	for (; i <= a;) if (o = Math.floor((i + a) / 2), s = e[o], c = e[o + 1], s <= t) {
		if (o === r || t < c) return o;
		i = o + 1;
	} else if (s > t) a = o - 1;
	else throw new Gv("Input is not a number.", n);
	return 0;
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/definitions/step.mjs
var ay = class e {
	constructor(e, t, n, r) {
		this.type = e, this.input = t, this.key = r, this.labels = [], this.outputs = [];
		for (let [e, t] of n) this.labels.push(e), this.outputs.push(t);
	}
	static parse(t, n) {
		if (t.length - 1 < 4) return n.error(`Expected at least 4 arguments, but found only ${t.length - 1}.`);
		if ((t.length - 1) % 2 != 0) return n.error("Expected an even number of arguments.");
		let r = n.parse(t[1], 1, Y);
		if (!r) return null;
		let i = [], a = null;
		n.expectedType && n.expectedType.kind !== "value" && (a = n.expectedType);
		for (let e = 1; e < t.length; e += 2) {
			let r = e === 1 ? -Infinity : t[e], o = t[e + 1], s = e, c = e + 1;
			if (typeof r != "number") return n.error("Input/output pairs for \"step\" expressions must be defined using literal numeric values (not computed expressions) for the input values.", s);
			if (i.length && i[i.length - 1][0] >= r) return n.error("Input/output pairs for \"step\" expressions must be arranged with input values in strictly ascending order.", s);
			let l = n.parse(o, c, a);
			if (!l) return null;
			a ||= l.type, i.push([r, l]);
		}
		return new e(a, r, i, n.key);
	}
	evaluate(e) {
		let t = this.labels, n = this.outputs;
		if (t.length === 1) return n[0].evaluate(e);
		let r = this.input.evaluate(e);
		if (r <= t[0]) return n[0].evaluate(e);
		let i = t.length;
		return r >= t[i - 1] ? n[i - 1].evaluate(e) : n[iy(t, r, this.key)].evaluate(e);
	}
	eachChild(e) {
		e(this.input);
		for (let t of this.outputs) e(t);
	}
	outputDefined() {
		return this.outputs.every((e) => e.outputDefined());
	}
};
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/node_modules/@mapbox/unitbezier/index.mjs
function oy(e, t, n, r) {
	let i = 3 * e, a = 3 * (n - e) - i, o = 1 - i - a, s = 3 * t, c = 3 * (r - t) - s, l = 1 - s - c;
	return function(e, t = 1e-6) {
		if (e <= 0) return 0;
		if (e >= 1) return 1;
		let n = e;
		for (let r = 0; r < 8; r++) {
			let r = ((o * n + a) * n + i) * n - e;
			if (Math.abs(r) < t) return ((l * n + c) * n + s) * n;
			let u = (3 * o * n + 2 * a) * n + i;
			if (Math.abs(u) < 1e-6) break;
			n -= r / u;
		}
		let r = 0, u = 1;
		n = e;
		for (let s = 0; s < 20; s++) {
			let s = ((o * n + a) * n + i) * n;
			if (Math.abs(s - e) < t) break;
			e > s ? r = n : u = n, n = (r + u) * .5;
		}
		return ((l * n + c) * n + s) * n;
	};
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/definitions/interpolate.mjs
var sy = class e {
	constructor(e, t, n, r, i, a) {
		this.type = e, this.operator = t, this.interpolation = n, this.input = r, this.key = a, this.labels = [], this.outputs = [];
		for (let [e, t] of i) this.labels.push(e), this.outputs.push(t);
	}
	static interpolationFactor(e, t, n, r) {
		let i = 0;
		if (e.name === "exponential") i = cy(t, e.base, n, r);
		else if (e.name === "linear") i = cy(t, 1, n, r);
		else if (e.name === "cubic-bezier") {
			let a = e.controlPoints;
			i = oy(a[0], a[1], a[2], a[3])(cy(t, 1, n, r));
		}
		return i;
	}
	static parse(t, n) {
		let [r, i, a, ...o] = t;
		if (!Array.isArray(i) || i.length === 0) return n.error("Expected an interpolation type expression.", 1);
		if (i[0] === "linear") i = { name: "linear" };
		else if (i[0] === "exponential") {
			let e = i[1];
			if (typeof e != "number") return n.error("Exponential interpolation requires a numeric base.", 1, 1);
			i = {
				name: "exponential",
				base: e
			};
		} else if (i[0] === "cubic-bezier") {
			let e = i.slice(1);
			if (e.length !== 4 || e.some((e) => typeof e != "number" || e < 0 || e > 1)) return n.error("Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.", 1);
			i = {
				name: "cubic-bezier",
				controlPoints: e
			};
		} else return n.error(`Unknown interpolation type ${String(i[0])}`, 1, 0);
		if (t.length - 1 < 4) return n.error(`Expected at least 4 arguments, but found only ${t.length - 1}.`);
		if ((t.length - 1) % 2 != 0) return n.error("Expected an even number of arguments.");
		if (a = n.parse(a, 2, Y), !a) return null;
		let s = [], c = null;
		(r === "interpolate-hcl" || r === "interpolate-lab") && n.expectedType != Q_ ? c = G_ : n.expectedType && n.expectedType.kind !== "value" && (c = n.expectedType);
		for (let e = 0; e < o.length; e += 2) {
			let t = o[e], r = o[e + 1], i = e + 3, a = e + 4;
			if (typeof t != "number") return n.error("Input/output pairs for \"interpolate\" expressions must be defined using literal numeric values (not computed expressions) for the input values.", i);
			if (s.length && s[s.length - 1][0] >= t) return n.error("Input/output pairs for \"interpolate\" expressions must be arranged with input values in strictly ascending order.", i);
			let l = n.parse(r, a, c);
			if (!l) return null;
			c ||= l.type, s.push([t, l]);
		}
		return !cv(c, Y) && !cv(c, K_) && !cv(c, G_) && !cv(c, Z_) && !cv(c, $_) && !cv(c, Q_) && !cv(c, tv) && !cv(c, nv(Y)) ? n.error(`Type ${rv(c)} is not interpolatable.`) : new e(c, r, i, a, s, n.key);
	}
	evaluate(t) {
		let n = this.labels, r = this.outputs;
		if (n.length === 1) return r[0].evaluate(t);
		let i = this.input.evaluate(t);
		if (i <= n[0]) return r[0].evaluate(t);
		let a = n.length;
		if (i >= n[a - 1]) return r[a - 1].evaluate(t);
		let o = iy(n, i, this.key), s = n[o], c = n[o + 1], l = e.interpolationFactor(this.interpolation, i, s, c), u = r[o].evaluate(t), d = r[o + 1].evaluate(t);
		switch (this.operator) {
			case "interpolate": switch (this.type.kind) {
				case "number": return Iv(u, d, l);
				case "color": return Rv.interpolate(u, d, l);
				case "padding": return Hv.interpolate(u, d, l);
				case "colorArray": return Wv.interpolate(u, d, l);
				case "numberArray": return Uv.interpolate(u, d, l);
				case "variableAnchorOffsetCollection": return qv.interpolate(u, d, l, this.key);
				case "array": return Lv(u, d, l);
				case "projectionDefinition": return Yv.interpolate(u, d, l);
			}
			case "interpolate-hcl": switch (this.type.kind) {
				case "color": return Rv.interpolate(u, d, l, "hcl");
				case "colorArray": return Wv.interpolate(u, d, l, "hcl");
			}
			case "interpolate-lab": switch (this.type.kind) {
				case "color": return Rv.interpolate(u, d, l, "lab");
				case "colorArray": return Wv.interpolate(u, d, l, "lab");
			}
		}
	}
	eachChild(e) {
		e(this.input);
		for (let t of this.outputs) e(t);
	}
	outputDefined() {
		return this.outputs.every((e) => e.outputDefined());
	}
};
function cy(e, t, n, r) {
	let i = r - n, a = e - n;
	return i === 0 ? 0 : t === 1 ? a / i : (t ** +a - 1) / (t ** +i - 1);
}
Rv.interpolate, Hv.interpolate, Uv.interpolate, Wv.interpolate, qv.interpolate;
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/definitions/format.mjs
var ly = class e {
	constructor(e) {
		this.type = X_, this.sections = e;
	}
	static parse(t, n) {
		if (t.length < 2) return n.error("Expected at least one argument.");
		let r = t[1];
		if (!Array.isArray(r) && typeof r == "object") return n.error("First argument must be an image or text section.");
		let i = [], a = !1;
		for (let e = 1; e <= t.length - 1; ++e) {
			let r = t[e];
			if (a && typeof r == "object" && !Array.isArray(r)) {
				a = !1;
				let e = null;
				if (r["font-scale"] && (e = n.parse(r["font-scale"], 1, Y), !e)) return null;
				let t = null;
				if (r["text-font"] && (t = n.parse(r["text-font"], 1, nv(X)), !t)) return null;
				let o = null;
				if (r["text-color"] && (o = n.parse(r["text-color"], 1, G_), !o)) return null;
				let s = null;
				if (r["vertical-align"]) {
					if (typeof r["vertical-align"] == "string" && !zv.includes(r["vertical-align"])) return n.error(`'vertical-align' must be one of: 'bottom', 'center', 'top' but found '${r["vertical-align"]}' instead.`);
					if (s = n.parse(r["vertical-align"], 1, X), !s) return null;
				}
				let c = i[i.length - 1];
				c.scale = e, c.font = t, c.textColor = o, c.verticalAlign = s;
			} else {
				let r = n.parse(t[e], 1, Q);
				if (!r) return null;
				let o = r.type.kind;
				if (o !== "string" && o !== "value" && o !== "null" && o !== "resolvedImage") return n.error("Formatted text type must be 'string', 'value', 'image' or 'null'.");
				a = !0, i.push({
					content: r,
					scale: null,
					font: null,
					textColor: null,
					verticalAlign: null
				});
			}
		}
		return new e(i);
	}
	evaluate(e) {
		return new Vv(this.sections.map((t) => {
			let n = t.content.evaluate(e);
			return $v(n) === ev ? new Bv("", n, null, null, null, t.verticalAlign ? t.verticalAlign.evaluate(e) : null) : new Bv(ey(n), null, t.scale ? t.scale.evaluate(e) : null, t.font ? t.font.evaluate(e).join(",") : null, t.textColor ? t.textColor.evaluate(e) : null, t.verticalAlign ? t.verticalAlign.evaluate(e) : null);
		}));
	}
	eachChild(e) {
		for (let t of this.sections) e(t.content), t.scale && e(t.scale), t.font && e(t.font), t.textColor && e(t.textColor), t.verticalAlign && e(t.verticalAlign);
	}
	outputDefined() {
		return !1;
	}
};
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/node_modules/quickselect/index.mjs
function uy(e, t, n = 0, r = e.length - 1, i = fy) {
	for (; r > n;) {
		if (r - n > 600) {
			let a = r - n + 1, o = t - n + 1, s = Math.log(a), c = .5 * Math.exp(2 * s / 3), l = .5 * Math.sqrt(s * c * (a - c) / a) * (o - a / 2 < 0 ? -1 : 1);
			uy(e, t, Math.max(n, Math.floor(t - o * c / a + l)), Math.min(r, Math.floor(t + (a - o) * c / a + l)), i);
		}
		let a = e[t], o = n, s = r;
		for (dy(e, n, t), i(e[r], a) > 0 && dy(e, n, r); o < s;) {
			for (dy(e, o, s), o++, s--; i(e[o], a) < 0;) o++;
			for (; i(e[s], a) > 0;) s--;
		}
		i(e[n], a) === 0 ? dy(e, n, s) : (s++, dy(e, s, r)), s <= t && (n = s + 1), t <= s && (r = s - 1);
	}
}
function dy(e, t, n) {
	let r = e[t];
	e[t] = e[n], e[n] = r;
}
function fy(e, t) {
	return e < t ? -1 : +(e > t);
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/util/classify_rings.mjs
function py(e, t) {
	if (e.length <= 1) return [e];
	let n = [], r, i;
	for (let t of e) {
		let e = hy(t);
		e !== 0 && (t.area = Math.abs(e), i === void 0 && (i = e < 0), i === e < 0 ? (r && n.push(r), r = [t]) : r.push(t));
	}
	if (r && n.push(r), t > 1) for (let e = 0; e < n.length; e++) n[e].length <= t || (uy(n[e], t, 1, n[e].length - 1, my), n[e] = n[e].slice(0, t));
	return n;
}
function my(e, t) {
	return t.area - e.area;
}
function hy(e) {
	let t = 0;
	for (let n = 0, r = e.length, i = r - 1, a, o; n < r; i = n++) a = e[n], o = e[i], t += (o.x - a.x) * (a.y + o.y);
	return t;
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/definitions/assertion.mjs
var gy = {
	string: X,
	number: Y,
	boolean: Z,
	object: q_
}, _y = class e {
	constructor(e, t, n) {
		this.type = e, this.args = t, this.key = n;
	}
	static parse(t, n) {
		if (t.length < 2) return n.error("Expected at least one argument.");
		let r = 1, i, a = t[0];
		if (a === "array") {
			let e;
			if (t.length > 2) {
				let i = t[1];
				if (typeof i != "string" || !(i in gy) || i === "object") return n.error("The item type argument of \"array\" must be one of string, number, boolean", 1);
				e = gy[i], r++;
			} else e = Q;
			let a;
			if (t.length > 3) {
				if (t[2] !== null && (typeof t[2] != "number" || t[2] < 0 || t[2] !== Math.floor(t[2]))) return n.error("The length argument to \"array\" must be a positive integer literal", 2);
				a = t[2], r++;
			}
			i = nv(e, a);
		} else {
			if (!gy[a]) throw Error(`Types doesn't contain name = ${a}`);
			i = gy[a];
		}
		let o = [];
		for (; r < t.length; r++) {
			let e = n.parse(t[r], r, Q);
			if (!e) return null;
			o.push(e);
		}
		return new e(i, o, n.key);
	}
	evaluate(e) {
		for (let t = 0; t < this.args.length; t++) {
			let n = this.args[t].evaluate(e);
			if (!av(this.type, $v(n))) return n;
			if (t === this.args.length - 1) throw new Gv(`Expected value to be of type ${rv(this.type)}, but found ${rv($v(n))} instead.`, this.key);
		}
		throw Error();
	}
	eachChild(e) {
		this.args.forEach(e);
	}
	outputDefined() {
		return this.args.every((e) => e.outputDefined());
	}
}, vy = {
	"to-boolean": Z,
	"to-color": G_,
	"to-number": Y,
	"to-string": X
}, yy = class e {
	constructor(e, t, n) {
		this.type = e, this.args = t, this.key = n;
	}
	static parse(t, n) {
		if (t.length < 2) return n.error("Expected at least one argument.");
		let r = t[0];
		if (!vy[r]) throw Error(`Can't parse ${r} as it is not part of the known types`);
		if ((r === "to-boolean" || r === "to-string") && t.length !== 2) return n.error("Expected one argument.");
		let i = vy[r], a = [];
		for (let e = 1; e < t.length; e++) {
			let r = n.parse(t[e], e, Q);
			if (!r) return null;
			a.push(r);
		}
		return new e(i, a, n.key);
	}
	evaluate(e) {
		switch (this.type.kind) {
			case "boolean": return !!this.args[0].evaluate(e);
			case "color": {
				let t, n;
				for (let r of this.args) {
					if (t = r.evaluate(e), n = null, t instanceof Rv) return t;
					if (typeof t == "string") {
						let n = e.parseColor(t);
						if (n) return n;
					} else if (Array.isArray(t) && (n = t.length < 3 || t.length > 4 ? `Invalid rgba value ${JSON.stringify(t)}: expected an array containing either three or four numeric values.` : Zv(t[0], t[1], t[2], t[3]), !n)) return new Rv(t[0] / 255, t[1] / 255, t[2] / 255, t[3]);
				}
				throw new Gv(n || `Could not parse color from value '${typeof t == "string" ? t : JSON.stringify(t)}'`, this.key);
			}
			case "padding": {
				let t;
				for (let n of this.args) {
					t = n.evaluate(e);
					let r = Hv.parse(t);
					if (r) return r;
				}
				throw new Gv(`Could not parse padding from value '${typeof t == "string" ? t : JSON.stringify(t)}'`, this.key);
			}
			case "numberArray": {
				let t;
				for (let n of this.args) {
					t = n.evaluate(e);
					let r = Uv.parse(t);
					if (r) return r;
				}
				throw new Gv(`Could not parse numberArray from value '${typeof t == "string" ? t : JSON.stringify(t)}'`, this.key);
			}
			case "colorArray": {
				let t;
				for (let n of this.args) {
					t = n.evaluate(e);
					let r = Wv.parse(t);
					if (r) return r;
				}
				throw new Gv(`Could not parse colorArray from value '${typeof t == "string" ? t : JSON.stringify(t)}'`, this.key);
			}
			case "variableAnchorOffsetCollection": {
				let t;
				for (let n of this.args) {
					t = n.evaluate(e);
					let r = qv.parse(t);
					if (r) return r;
				}
				throw new Gv(`Could not parse variableAnchorOffsetCollection from value '${typeof t == "string" ? t : JSON.stringify(t)}'`, this.key);
			}
			case "number": {
				let t = null;
				for (let n of this.args) {
					if (t = n.evaluate(e), t === null) return 0;
					let r = Number(t);
					if (!isNaN(r)) return r;
				}
				throw new Gv(`Could not convert ${JSON.stringify(t)} to number.`, this.key);
			}
			case "formatted": return Vv.fromString(ey(this.args[0].evaluate(e)));
			case "resolvedImage": return Jv.fromString(ey(this.args[0].evaluate(e)));
			case "projectionDefinition": {
				let t = this.args[0].evaluate(e);
				if (Yv.parse(t)) return t;
				throw new Gv(`Could not parse projectionDefinition from value '${typeof t == "string" ? t : JSON.stringify(t)}'`, this.key);
			}
			default: return ey(this.args[0].evaluate(e));
		}
	}
	eachChild(e) {
		this.args.forEach(e);
	}
	outputDefined() {
		return this.args.every((e) => e.outputDefined());
	}
}, by = class e {
	constructor(e, t) {
		this.type = t.type, this.bindings = [].concat(e), this.result = t;
	}
	evaluate(e) {
		return this.result.evaluate(e);
	}
	eachChild(e) {
		for (let t of this.bindings) e(t[1]);
		e(this.result);
	}
	static parse(t, n) {
		if (t.length < 4) return n.error(`Expected at least 3 arguments, but found ${t.length - 1} instead.`);
		let r = [];
		for (let e = 1; e < t.length - 1; e += 2) {
			let i = t[e];
			if (typeof i != "string") return n.error(`Expected string, but found ${typeof i} instead.`, e);
			if (/[^a-zA-Z0-9_]/.test(i)) return n.error("Variable names must contain only alphanumeric characters or '_'.", e);
			let a = n.parse(t[e + 1], e + 1);
			if (!a) return null;
			r.push([i, a]);
		}
		let i = n.parse(t[t.length - 1], t.length - 1, n.expectedType, r);
		return i ? new e(r, i) : null;
	}
	outputDefined() {
		return this.result.outputDefined();
	}
}, xy = class e {
	constructor(e, t) {
		this.type = t.type, this.name = e, this.boundExpression = t;
	}
	static parse(t, n) {
		if (t.length !== 2 || typeof t[1] != "string") return n.error("'var' expression requires exactly one string literal argument.");
		let r = t[1];
		return n.scope.has(r) ? new e(r, n.scope.get(r)) : n.error(`Unknown variable "${r}". Make sure "${r}" has been bound in an enclosing "let" expression before using it.`, 1);
	}
	evaluate(e) {
		return this.boundExpression.evaluate(e);
	}
	eachChild() {}
	outputDefined() {
		return !1;
	}
}, Sy = class e {
	constructor(e, t, n, r) {
		this.type = e, this.index = t, this.input = n, this.key = r;
	}
	static parse(t, n) {
		if (t.length !== 3) return n.error(`Expected 2 arguments, but found ${t.length - 1} instead.`);
		let r = n.parse(t[1], 1, Y), i = n.parse(t[2], 2, nv(n.expectedType || Q));
		if (!r || !i) return null;
		let a = i.type;
		return new e(a.itemType, r, i, n.key);
	}
	evaluate(e) {
		let t = this.index.evaluate(e), n = this.input.evaluate(e);
		if (t < 0) throw new Gv(`Array index out of bounds: ${t} < 0.`, this.key);
		if (t >= n.length) throw new Gv(`Array index out of bounds: ${t} > ${n.length - 1}.`, this.key);
		if (t !== Math.floor(t)) throw new Gv(`Array index must be an integer, but found ${t} instead.`, this.key);
		return n[t];
	}
	eachChild(e) {
		e(this.index), e(this.input);
	}
	outputDefined() {
		return !1;
	}
}, Cy = class e {
	constructor(e, t, n) {
		this.needle = e, this.haystack = t, this.key = n, this.type = Z;
	}
	static parse(t, n) {
		if (t.length !== 3) return n.error(`Expected 2 arguments, but found ${t.length - 1} instead.`);
		let r = n.parse(t[1], 1, Q), i = n.parse(t[2], 2, Q);
		return !r || !i ? null : ov(r.type, [
			Z,
			X,
			Y,
			W_,
			Q
		]) ? new e(r, i, n.key) : n.error(`Expected first argument to be of type boolean, string, number or null, but found ${rv(r.type)} instead`);
	}
	evaluate(e) {
		let t = this.needle.evaluate(e), n = this.haystack.evaluate(e);
		if (!n) return !1;
		if (!sv(t, [
			"boolean",
			"string",
			"number",
			"null"
		])) throw new Gv(`Expected first argument to be of type boolean, string, number or null, but found ${rv($v(t))} instead.`, this.key);
		if (!sv(n, ["string", "array"])) throw new Gv(`Expected second argument to be of type array or string, but found ${rv($v(n))} instead.`, this.key);
		return n.indexOf(t) >= 0;
	}
	eachChild(e) {
		e(this.needle), e(this.haystack);
	}
	outputDefined() {
		return !0;
	}
}, wy = class e {
	constructor(e, t, n, r) {
		this.needle = e, this.haystack = t, this.key = n, this.fromIndex = r, this.type = Y;
	}
	static parse(t, n) {
		if (t.length <= 2 || t.length >= 5) return n.error(`Expected 2 or 3 arguments, but found ${t.length - 1} instead.`);
		let r = n.parse(t[1], 1, Q), i = n.parse(t[2], 2, Q);
		if (!r || !i) return null;
		if (!ov(r.type, [
			Z,
			X,
			Y,
			W_,
			Q
		])) return n.error(`Expected first argument to be of type boolean, string, number or null, but found ${rv(r.type)} instead`);
		if (t.length === 4) {
			let a = n.parse(t[3], 3, Y);
			return a ? new e(r, i, n.key, a) : null;
		}
		return new e(r, i, n.key);
	}
	evaluate(e) {
		let t = this.needle.evaluate(e), n = this.haystack.evaluate(e);
		if (!sv(t, [
			"boolean",
			"string",
			"number",
			"null"
		])) throw new Gv(`Expected first argument to be of type boolean, string, number or null, but found ${rv($v(t))} instead.`, this.key);
		let r;
		if (this.fromIndex && (r = this.fromIndex.evaluate(e)), sv(n, ["string"])) {
			let e = n.indexOf(t, r);
			return e === -1 ? -1 : [...n.slice(0, e)].length;
		}
		if (sv(n, ["array"])) return n.indexOf(t, r);
		throw new Gv(`Expected second argument to be of type array or string, but found ${rv($v(n))} instead.`, this.key);
	}
	eachChild(e) {
		e(this.needle), e(this.haystack), this.fromIndex && e(this.fromIndex);
	}
	outputDefined() {
		return !1;
	}
}, Ty = class e {
	constructor(e, t, n, r, i, a) {
		this.inputType = e, this.type = t, this.input = n, this.cases = r, this.outputs = i, this.otherwise = a;
	}
	static parse(t, n) {
		if (t.length < 5) return n.error(`Expected at least 4 arguments, but found only ${t.length - 1}.`);
		if (t.length % 2 != 1) return n.error("Expected an even number of arguments.");
		let r, i;
		n.expectedType && n.expectedType.kind !== "value" && (i = n.expectedType);
		let a = {}, o = [];
		for (let e = 2; e < t.length - 1; e += 2) {
			let s = t[e], c = t[e + 1];
			Array.isArray(s) || (s = [s]);
			let l = n.concat(e);
			if (s.length === 0) return l.error("Expected at least one branch label.");
			for (let e of s) {
				if (typeof e != "number" && typeof e != "string") return l.error("Branch labels must be numbers or strings.");
				if (typeof e == "number" && Math.abs(e) > 2 ** 53 - 1) return l.error(`Branch labels must be integers no larger than ${2 ** 53 - 1}.`);
				if (typeof e == "number" && Math.floor(e) !== e) return l.error("Numeric branch labels must be integer values.");
				if (!r) r = $v(e);
				else if (l.checkSubtype(r, $v(e))) return null;
				if (a[String(e)] !== void 0) return l.error("Branch labels must be unique.");
				a[String(e)] = o.length;
			}
			let u = n.parse(c, e, i);
			if (!u) return null;
			i ||= u.type, o.push(u);
		}
		let s = n.parse(t[1], 1, Q);
		if (!s) return null;
		let c = n.parse(t[t.length - 1], t.length - 1, i);
		return !c || s.type.kind !== "value" && n.concat(1).checkSubtype(r, s.type) ? null : new e(r, i, s, a, o, c);
	}
	evaluate(e) {
		let t = this.input.evaluate(e);
		return ($v(t) === this.inputType && this.outputs[this.cases[t]] || this.otherwise).evaluate(e);
	}
	eachChild(e) {
		e(this.input), this.outputs.forEach(e), e(this.otherwise);
	}
	outputDefined() {
		return this.outputs.every((e) => e.outputDefined()) && this.otherwise.outputDefined();
	}
}, Ey = class e {
	constructor(e, t, n) {
		this.type = e, this.branches = t, this.otherwise = n;
	}
	static parse(t, n) {
		if (t.length < 4) return n.error(`Expected at least 3 arguments, but found only ${t.length - 1}.`);
		if (t.length % 2 != 0) return n.error("Expected an odd number of arguments.");
		let r;
		n.expectedType && n.expectedType.kind !== "value" && (r = n.expectedType);
		let i = [];
		for (let e = 1; e < t.length - 1; e += 2) {
			let a = n.parse(t[e], e, Z);
			if (!a) return null;
			let o = n.parse(t[e + 1], e + 1, r);
			if (!o) return null;
			i.push([a, o]), r ||= o.type;
		}
		let a = n.parse(t[t.length - 1], t.length - 1, r);
		if (!a) return null;
		if (!r) throw Error("Can't infer output type");
		return new e(r, i, a);
	}
	evaluate(e) {
		for (let [t, n] of this.branches) if (t.evaluate(e)) return n.evaluate(e);
		return this.otherwise.evaluate(e);
	}
	eachChild(e) {
		for (let [t, n] of this.branches) e(t), e(n);
		e(this.otherwise);
	}
	outputDefined() {
		return this.branches.every(([e, t]) => t.outputDefined()) && this.otherwise.outputDefined();
	}
}, Dy = class e {
	constructor(e, t, n, r, i) {
		this.type = e, this.input = t, this.beginIndex = n, this.key = r, this.endIndex = i;
	}
	static parse(t, n) {
		if (t.length <= 2 || t.length >= 5) return n.error(`Expected 2 or 3 arguments, but found ${t.length - 1} instead.`);
		let r = n.parse(t[1], 1, Q), i = n.parse(t[2], 2, Y);
		if (!r || !i) return null;
		if (!ov(r.type, [
			nv(Q),
			X,
			Q
		])) return n.error(`Expected first argument to be of type array or string, but found ${rv(r.type)} instead`);
		if (t.length === 4) {
			let a = n.parse(t[3], 3, Y);
			return a ? new e(r.type, r, i, n.key, a) : null;
		}
		return new e(r.type, r, i, n.key);
	}
	evaluate(e) {
		let t = this.input.evaluate(e), n = this.beginIndex.evaluate(e), r;
		if (this.endIndex && (r = this.endIndex.evaluate(e)), sv(t, ["string"])) return [...t].slice(n, r).join("");
		if (sv(t, ["array"])) return t.slice(n, r);
		throw new Gv(`Expected first argument to be of type array or string, but found ${rv($v(t))} instead.`, this.key);
	}
	eachChild(e) {
		e(this.input), e(this.beginIndex), this.endIndex && e(this.endIndex);
	}
	outputDefined() {
		return !1;
	}
}, Oy = class e {
	constructor(e, t) {
		this.type = e, this.args = t;
	}
	static parse(t, n) {
		if (t.length < 2) return n.error("Expected at least one argument.");
		let r = null, i = n.expectedType;
		i && i.kind !== "value" && (r = i);
		let a = [];
		for (let e of t.slice(1)) {
			let t = n.parse(e, 1 + a.length, r, void 0, { typeAnnotation: "omit" });
			if (!t) return null;
			r ||= t.type, a.push(t);
		}
		if (!r) throw Error("No output type");
		return i && a.some((e) => av(i, e.type)) ? new e(Q, a) : new e(r, a);
	}
	evaluate(e) {
		let t = null, n = 0, r;
		for (let i of this.args) if (n++, t = i.evaluate(e), t && t instanceof Jv && !t.available && (r ||= t.name, t = null, n === this.args.length && (t = r)), t !== null) break;
		return t;
	}
	eachChild(e) {
		this.args.forEach(e);
	}
	outputDefined() {
		return this.args.every((e) => e.outputDefined());
	}
};
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/definitions/comparison.mjs
function ky(e, t) {
	return e === "==" || e === "!=" ? t.kind === "boolean" || t.kind === "string" || t.kind === "number" || t.kind === "null" || t.kind === "value" : t.kind === "string" || t.kind === "number" || t.kind === "value";
}
function Ay(e, t, n) {
	return t === n;
}
function jy(e, t, n) {
	return t !== n;
}
function My(e, t, n) {
	return t < n;
}
function Ny(e, t, n) {
	return t > n;
}
function Py(e, t, n) {
	return t <= n;
}
function Fy(e, t, n) {
	return t >= n;
}
function Iy(e, t, n, r) {
	return r.compare(t, n) === 0;
}
function Ly(e, t, n, r) {
	return !Iy(e, t, n, r);
}
function Ry(e, t, n, r) {
	return r.compare(t, n) < 0;
}
function zy(e, t, n, r) {
	return r.compare(t, n) > 0;
}
function By(e, t, n, r) {
	return r.compare(t, n) <= 0;
}
function Vy(e, t, n, r) {
	return r.compare(t, n) >= 0;
}
function Hy(e, t, n) {
	let r = e !== "==" && e !== "!=";
	return class i {
		constructor(e, t, n, r) {
			this.lhs = e, this.rhs = t, this.key = n, this.collator = r, this.type = Z, this.hasUntypedArgument = e.type.kind === "value" || t.type.kind === "value";
		}
		static parse(e, t) {
			if (e.length !== 3 && e.length !== 4) return t.error("Expected two or three arguments.");
			let n = e[0], a = t.parse(e[1], 1, Q);
			if (!a) return null;
			if (!ky(n, a.type)) return t.concat(1).error(`"${n}" comparisons are not supported for type '${rv(a.type)}'.`);
			let o = t.parse(e[2], 2, Q);
			if (!o) return null;
			if (!ky(n, o.type)) return t.concat(2).error(`"${n}" comparisons are not supported for type '${rv(o.type)}'.`);
			if (a.type.kind !== o.type.kind && a.type.kind !== "value" && o.type.kind !== "value") return t.error(`Cannot compare types '${rv(a.type)}' and '${rv(o.type)}'.`);
			r && (a.type.kind === "value" && o.type.kind !== "value" ? a = new _y(o.type, [a], t.key) : a.type.kind !== "value" && o.type.kind === "value" && (o = new _y(a.type, [o], t.key)));
			let s = null;
			if (e.length === 4) {
				if (a.type.kind !== "string" && o.type.kind !== "string" && a.type.kind !== "value" && o.type.kind !== "value") return t.error("Cannot use collator to compare non-string types.");
				if (s = t.parse(e[3], 3, Y_), !s) return null;
			}
			return new i(a, o, t.key, s);
		}
		evaluate(i) {
			let a = this.lhs.evaluate(i), o = this.rhs.evaluate(i);
			if (r && this.hasUntypedArgument) {
				let t = $v(a), n = $v(o);
				if (t.kind !== n.kind || t.kind !== "string" && t.kind !== "number") throw new Gv(`Expected arguments for "${e}" to be (string, string) or (number, number), but found (${t.kind}, ${n.kind}) instead.`, this.key);
			}
			if (this.collator && !r && this.hasUntypedArgument) {
				let e = $v(a), n = $v(o);
				if (e.kind !== "string" || n.kind !== "string") return t(i, a, o);
			}
			return this.collator ? n(i, a, o, this.collator.evaluate(i)) : t(i, a, o);
		}
		eachChild(e) {
			e(this.lhs), e(this.rhs), this.collator && e(this.collator);
		}
		outputDefined() {
			return !0;
		}
	};
}
var Uy = Hy("==", Ay, Iy), Wy = Hy("!=", jy, Ly), Gy = Hy("<", My, Ry), Ky = Hy(">", Ny, zy), qy = Hy("<=", Py, By), Jy = Hy(">=", Fy, Vy), Yy = class e {
	constructor(e, t, n) {
		this.type = Y_, this.locale = n, this.caseSensitive = e, this.diacriticSensitive = t;
	}
	static parse(t, n) {
		if (t.length !== 2) return n.error("Expected one argument.");
		let r = t[1];
		if (typeof r != "object" || Array.isArray(r)) return n.error("Collator options argument must be an object.");
		let i = n.parse(r["case-sensitive"] !== void 0 && r["case-sensitive"], 1, Z);
		if (!i) return null;
		let a = n.parse(r["diacritic-sensitive"] !== void 0 && r["diacritic-sensitive"], 1, Z);
		if (!a) return null;
		let o = null;
		return r.locale && (o = n.parse(r.locale, 1, X), !o) ? null : new e(i, a, o);
	}
	evaluate(e) {
		return new Xv(this.caseSensitive.evaluate(e), this.diacriticSensitive.evaluate(e), this.locale ? this.locale.evaluate(e) : null);
	}
	eachChild(e) {
		e(this.caseSensitive), e(this.diacriticSensitive), this.locale && e(this.locale);
	}
	outputDefined() {
		return !1;
	}
}, Xy = class e {
	constructor(e, t, n, r, i, a) {
		this.type = X, this.number = e, this.locale = t, this.currency = n, this.unit = r, this.minFractionDigits = i, this.maxFractionDigits = a;
	}
	static parse(t, n) {
		if (t.length !== 3) return n.error("Expected two arguments.");
		let r = n.parse(t[1], 1, Y);
		if (!r) return null;
		let i = t[2];
		if (typeof i != "object" || Array.isArray(i)) return n.error("NumberFormat options argument must be an object.");
		let a = null;
		if (i.locale && (a = n.parse(i.locale, 1, X), !a)) return null;
		let o = null;
		if (i.currency && (o = n.parse(i.currency, 1, X), !o)) return null;
		let s = null;
		if (i.unit && (s = n.parse(i.unit, 1, X), !s)) return null;
		if (o && s) return n.error("NumberFormat options `currency` and `unit` are mutually exclusive");
		let c = null;
		if (i["min-fraction-digits"] && (c = n.parse(i["min-fraction-digits"], 1, Y), !c)) return null;
		let l = null;
		return i["max-fraction-digits"] && (l = n.parse(i["max-fraction-digits"], 1, Y), !l) ? null : new e(r, a, o, s, c, l);
	}
	evaluate(e) {
		return new Intl.NumberFormat(this.locale ? this.locale.evaluate(e) : [], {
			style: this.currency ? "currency" : this.unit ? "unit" : "decimal",
			currency: this.currency ? this.currency.evaluate(e) : void 0,
			unit: this.unit ? this.unit.evaluate(e) : void 0,
			minimumFractionDigits: this.minFractionDigits ? this.minFractionDigits.evaluate(e) : void 0,
			maximumFractionDigits: this.maxFractionDigits ? this.maxFractionDigits.evaluate(e) : void 0
		}).format(this.number.evaluate(e));
	}
	eachChild(e) {
		e(this.number), this.locale && e(this.locale), this.currency && e(this.currency), this.unit && e(this.unit), this.minFractionDigits && e(this.minFractionDigits), this.maxFractionDigits && e(this.maxFractionDigits);
	}
	outputDefined() {
		return !1;
	}
}, Zy = class e {
	constructor(e) {
		this.type = ev, this.input = e;
	}
	static parse(t, n) {
		if (t.length !== 2) return n.error("Expected two arguments.");
		let r = n.parse(t[1], 1, X);
		return r ? new e(r) : n.error("No image name provided.");
	}
	evaluate(e) {
		let t = this.input.evaluate(e), n = Jv.fromString(t);
		return n && e.availableImages && (n.available = e.availableImages.indexOf(t) > -1), n;
	}
	eachChild(e) {
		e(this.input);
	}
	outputDefined() {
		return !1;
	}
}, Qy = class e {
	constructor(e, t) {
		this.input = e, this.key = t, this.type = Y;
	}
	static parse(t, n) {
		if (t.length !== 2) return n.error(`Expected 1 argument, but found ${t.length - 1} instead.`);
		let r = n.parse(t[1], 1);
		return r ? r.type.kind !== "array" && r.type.kind !== "string" && r.type.kind !== "value" ? n.error(`Expected argument of type string or array, but found ${rv(r.type)} instead.`) : new e(r, n.key) : null;
	}
	evaluate(e) {
		let t = this.input.evaluate(e);
		if (typeof t == "string") return [...t].length;
		if (Array.isArray(t)) return t.length;
		throw new Gv(`Expected value to be of type string or array, but found ${rv($v(t))} instead.`, this.key);
	}
	eachChild(e) {
		e(this.input);
	}
	outputDefined() {
		return !1;
	}
}, $y = 8192;
function eb(e, t) {
	let n = nb(e[0]), r = ib(e[1]), i = 2 ** t.z;
	return [Math.round(n * i * $y), Math.round(r * i * $y)];
}
function tb(e, t) {
	let n = 2 ** t.z, r = (e[0] / $y + t.x) / n, i = (e[1] / $y + t.y) / n;
	return [rb(r), ab(i)];
}
function nb(e) {
	return (180 + e) / 360;
}
function rb(e) {
	return e * 360 - 180;
}
function ib(e) {
	return (180 - 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + e * Math.PI / 360))) / 360;
}
function ab(e) {
	return 360 / Math.PI * Math.atan(Math.exp((180 - e * 360) * Math.PI / 180)) - 90;
}
function ob(e, t) {
	e[0] = Math.min(e[0], t[0]), e[1] = Math.min(e[1], t[1]), e[2] = Math.max(e[2], t[0]), e[3] = Math.max(e[3], t[1]);
}
function sb(e, t) {
	return !(e[0] <= t[0] || e[2] >= t[2] || e[1] <= t[1] || e[3] >= t[3]);
}
function cb(e, t, n) {
	return t[1] > e[1] != n[1] > e[1] && e[0] < (n[0] - t[0]) * (e[1] - t[1]) / (n[1] - t[1]) + t[0];
}
function lb(e, t, n) {
	let r = e[0] - t[0], i = e[1] - t[1], a = e[0] - n[0], o = e[1] - n[1];
	return r * o - a * i === 0 && r * a <= 0 && i * o <= 0;
}
function ub(e, t, n, r) {
	let i = [t[0] - e[0], t[1] - e[1]];
	return gb([r[0] - n[0], r[1] - n[1]], i) !== 0 && !!(_b(e, t, n, r) && _b(n, r, e, t));
}
function db(e, t, n) {
	for (let r of n) for (let n = 0; n < r.length - 1; ++n) if (ub(e, t, r[n], r[n + 1])) return !0;
	return !1;
}
function fb(e, t, n = !1) {
	let r = !1;
	for (let i of t) for (let t = 0; t < i.length - 1; t++) {
		if (lb(e, i[t], i[t + 1])) return n;
		cb(e, i[t], i[t + 1]) && (r = !r);
	}
	return r;
}
function pb(e, t) {
	for (let n of t) if (fb(e, n)) return !0;
	return !1;
}
function mb(e, t) {
	for (let n of e) if (!fb(n, t)) return !1;
	for (let n = 0; n < e.length - 1; ++n) if (db(e[n], e[n + 1], t)) return !1;
	return !0;
}
function hb(e, t) {
	for (let n of t) if (mb(e, n)) return !0;
	return !1;
}
function gb(e, t) {
	return e[0] * t[1] - e[1] * t[0];
}
function _b(e, t, n, r) {
	let i = e[0] - n[0], a = e[1] - n[1], o = t[0] - n[0], s = t[1] - n[1], c = r[0] - n[0], l = r[1] - n[1], u = i * l - c * a, d = o * l - c * s;
	return u > 0 && d < 0 || u < 0 && d > 0;
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/definitions/within.mjs
function vb(e, t, n) {
	let r = [];
	for (let i = 0; i < e.length; i++) {
		let a = [];
		for (let r = 0; r < e[i].length; r++) {
			let o = eb(e[i][r], n);
			ob(t, o), a.push(o);
		}
		r.push(a);
	}
	return r;
}
function yb(e, t, n) {
	let r = [];
	for (let i = 0; i < e.length; i++) {
		let a = vb(e[i], t, n);
		r.push(a);
	}
	return r;
}
function bb(e, t, n, r) {
	if (e[0] < n[0] || e[0] > n[2]) {
		let t = r * .5, i = e[0] - n[0] > t ? -r : n[0] - e[0] > t ? r : 0;
		i === 0 && (i = e[0] - n[2] > t ? -r : n[2] - e[0] > t ? r : 0), e[0] += i;
	}
	ob(t, e);
}
function xb(e) {
	e[0] = e[1] = Infinity, e[2] = e[3] = -Infinity;
}
function Sb(e, t, n, r) {
	let i = 2 ** r.z * $y, a = [r.x * $y, r.y * $y], o = [];
	for (let r of e) for (let e of r) {
		let r = [e.x + a[0], e.y + a[1]];
		bb(r, t, n, i), o.push(r);
	}
	return o;
}
function Cb(e, t, n, r) {
	let i = 2 ** r.z * $y, a = [r.x * $y, r.y * $y], o = [];
	for (let n of e) {
		let e = [];
		for (let r of n) {
			let n = [r.x + a[0], r.y + a[1]];
			ob(t, n), e.push(n);
		}
		o.push(e);
	}
	if (t[2] - t[0] <= i / 2) {
		xb(t);
		for (let e of o) for (let r of e) bb(r, t, n, i);
	}
	return o;
}
function wb(e, t) {
	let n = [
		Infinity,
		Infinity,
		-Infinity,
		-Infinity
	], r = [
		Infinity,
		Infinity,
		-Infinity,
		-Infinity
	], i = e.canonicalID();
	if (t.type === "Polygon") {
		let a = vb(t.coordinates, r, i), o = Sb(e.geometry(), n, r, i);
		if (!sb(n, r)) return !1;
		for (let e of o) if (!fb(e, a)) return !1;
	}
	if (t.type === "MultiPolygon") {
		let a = yb(t.coordinates, r, i), o = Sb(e.geometry(), n, r, i);
		if (!sb(n, r)) return !1;
		for (let e of o) if (!pb(e, a)) return !1;
	}
	return !0;
}
function Tb(e, t) {
	let n = [
		Infinity,
		Infinity,
		-Infinity,
		-Infinity
	], r = [
		Infinity,
		Infinity,
		-Infinity,
		-Infinity
	], i = e.canonicalID();
	if (t.type === "Polygon") {
		let a = vb(t.coordinates, r, i), o = Cb(e.geometry(), n, r, i);
		if (!sb(n, r)) return !1;
		for (let e of o) if (!mb(e, a)) return !1;
	}
	if (t.type === "MultiPolygon") {
		let a = yb(t.coordinates, r, i), o = Cb(e.geometry(), n, r, i);
		if (!sb(n, r)) return !1;
		for (let e of o) if (!hb(e, a)) return !1;
	}
	return !0;
}
var Eb = class e {
	constructor(e, t) {
		this.type = Z, this.geojson = e, this.geometries = t;
	}
	static parse(t, n) {
		if (t.length !== 2) return n.error(`'within' expression requires exactly one argument, but found ${t.length - 1} instead.`);
		if (Qv(t[1])) {
			let n = t[1];
			if (n.type === "FeatureCollection") {
				let t = [];
				for (let e of n.features) {
					let { type: n, coordinates: r } = e.geometry;
					n === "Polygon" && t.push(r), n === "MultiPolygon" && t.push(...r);
				}
				if (t.length) return new e(n, {
					type: "MultiPolygon",
					coordinates: t
				});
			} else if (n.type === "Feature") {
				let t = n.geometry.type;
				if (t === "Polygon" || t === "MultiPolygon") return new e(n, n.geometry);
			} else if (n.type === "Polygon" || n.type === "MultiPolygon") return new e(n, n);
		}
		return n.error("'within' expression requires valid geojson object that contains polygon geometry type.");
	}
	evaluate(e) {
		if (e.geometry() != null && e.canonicalID() != null) {
			if (e.geometryType() === "Point") return wb(e, this.geometries);
			if (e.geometryType() === "LineString") return Tb(e, this.geometries);
		}
		return !1;
	}
	eachChild() {}
	outputDefined() {
		return !0;
	}
}, Db = class {
	constructor(e = [], t = (e, t) => e < t ? -1 : +(e > t)) {
		if (this.data = e, this.length = this.data.length, this.compare = t, this.length > 0) for (let e = (this.length >> 1) - 1; e >= 0; e--) this._down(e);
	}
	push(e) {
		this.data.push(e), this._up(this.length++);
	}
	pop() {
		if (this.length === 0) return;
		let e = this.data[0], t = this.data.pop();
		return --this.length > 0 && (this.data[0] = t, this._down(0)), e;
	}
	peek() {
		return this.data[0];
	}
	_up(e) {
		let { data: t, compare: n } = this, r = t[e];
		for (; e > 0;) {
			let i = e - 1 >> 1, a = t[i];
			if (n(r, a) >= 0) break;
			t[e] = a, e = i;
		}
		t[e] = r;
	}
	_down(e) {
		let { data: t, compare: n } = this, r = this.length >> 1, i = t[e];
		for (; e < r;) {
			let r = (e << 1) + 1, a = r + 1;
			if (a < this.length && n(t[a], t[r]) < 0 && (r = a), n(t[r], i) >= 0) break;
			t[e] = t[r], e = r;
		}
		t[e] = i;
	}
}, Ob = 6378.137, kb = .0066943799901413165, Ab = Math.PI / 180, jb = class {
	constructor(e) {
		let t = Ab * Ob * 1e3, n = Math.cos(e * Ab), r = 1 / (1 - kb * (1 - n * n)), i = Math.sqrt(r);
		this.kx = t * i * n, this.ky = t * i * r * .9933056200098587;
	}
	distance(e, t) {
		let n = this.wrap(e[0] - t[0]) * this.kx, r = (e[1] - t[1]) * this.ky;
		return Math.sqrt(n * n + r * r);
	}
	pointOnLine(e, t) {
		let n = Infinity, r, i, a, o;
		for (let s = 0; s < e.length - 1; s++) {
			let c = e[s][0], l = e[s][1], u = this.wrap(e[s + 1][0] - c) * this.kx, d = (e[s + 1][1] - l) * this.ky, f = 0;
			(u !== 0 || d !== 0) && (f = (this.wrap(t[0] - c) * this.kx * u + (t[1] - l) * this.ky * d) / (u * u + d * d), f > 1 ? (c = e[s + 1][0], l = e[s + 1][1]) : f > 0 && (c += u / this.kx * f, l += d / this.ky * f)), u = this.wrap(t[0] - c) * this.kx, d = (t[1] - l) * this.ky;
			let p = u * u + d * d;
			p < n && (n = p, r = c, i = l, a = s, o = f);
		}
		return {
			point: [r, i],
			index: a,
			t: Math.max(0, Math.min(1, o))
		};
	}
	wrap(e) {
		for (; e < -180;) e += 360;
		for (; e > 180;) e -= 360;
		return e;
	}
}, Mb = 100, Nb = 50;
function Pb(e, t) {
	return t[0] - e[0];
}
function Fb(e) {
	return e[1] - e[0] + 1;
}
function Ib(e, t) {
	return e[1] >= e[0] && e[1] < t;
}
function Lb(e, t) {
	if (e[0] > e[1]) return [null, null];
	let n = Fb(e);
	if (t) {
		if (n === 2) return [e, null];
		let t = Math.floor(n / 2);
		return [[e[0], e[0] + t], [e[0] + t, e[1]]];
	}
	if (n === 1) return [e, null];
	let r = Math.floor(n / 2) - 1;
	return [[e[0], e[0] + r], [e[0] + r + 1, e[1]]];
}
function Rb(e, t) {
	if (!Ib(t, e.length)) return [
		Infinity,
		Infinity,
		-Infinity,
		-Infinity
	];
	let n = [
		Infinity,
		Infinity,
		-Infinity,
		-Infinity
	];
	for (let r = t[0]; r <= t[1]; ++r) ob(n, e[r]);
	return n;
}
function zb(e) {
	let t = [
		Infinity,
		Infinity,
		-Infinity,
		-Infinity
	];
	for (let n of e) for (let e of n) ob(t, e);
	return t;
}
function Bb(e) {
	return e[0] !== -Infinity && e[1] !== -Infinity && e[2] !== Infinity && e[3] !== Infinity;
}
function Vb(e, t, n) {
	if (!Bb(e) || !Bb(t)) return NaN;
	let r = 0, i = 0;
	return e[2] < t[0] && (r = t[0] - e[2]), e[0] > t[2] && (r = e[0] - t[2]), e[1] > t[3] && (i = e[1] - t[3]), e[3] < t[1] && (i = t[1] - e[3]), n.distance([0, 0], [r, i]);
}
function Hb(e, t, n) {
	let r = n.pointOnLine(t, e);
	return n.distance(e, r.point);
}
function Ub(e, t, n, r, i) {
	let a = Math.min(Hb(e, [n, r], i), Hb(t, [n, r], i)), o = Math.min(Hb(n, [e, t], i), Hb(r, [e, t], i));
	return Math.min(a, o);
}
function Wb(e, t, n, r, i) {
	if (!(Ib(t, e.length) && Ib(r, n.length))) return Infinity;
	let a = Infinity;
	for (let o = t[0]; o < t[1]; ++o) {
		let t = e[o], s = e[o + 1];
		for (let e = r[0]; e < r[1]; ++e) {
			let r = n[e], o = n[e + 1];
			if (ub(t, s, r, o)) return 0;
			a = Math.min(a, Ub(t, s, r, o, i));
		}
	}
	return a;
}
function Gb(e, t, n, r, i) {
	if (!(Ib(t, e.length) && Ib(r, n.length))) return NaN;
	let a = Infinity;
	for (let o = t[0]; o <= t[1]; ++o) for (let t = r[0]; t <= r[1]; ++t) if (a = Math.min(a, i.distance(e[o], n[t])), a === 0) return a;
	return a;
}
function Kb(e, t, n) {
	if (fb(e, t, !0)) return 0;
	let r = Infinity;
	for (let i of t) {
		let t = i[0], a = i[i.length - 1];
		if (t !== a && (r = Math.min(r, Hb(e, [a, t], n)), r === 0)) return r;
		let o = n.pointOnLine(i, e);
		if (r = Math.min(r, n.distance(e, o.point)), r === 0) return r;
	}
	return r;
}
function qb(e, t, n, r) {
	if (!Ib(t, e.length)) return NaN;
	for (let r = t[0]; r <= t[1]; ++r) if (fb(e[r], n, !0)) return 0;
	let i = Infinity;
	for (let a = t[0]; a < t[1]; ++a) {
		let t = e[a], o = e[a + 1];
		for (let e of n) for (let n = 0, a = e.length, s = a - 1; n < a; s = n++) {
			let a = e[s], c = e[n];
			if (ub(t, o, a, c)) return 0;
			i = Math.min(i, Ub(t, o, a, c, r));
		}
	}
	return i;
}
function Jb(e, t) {
	for (let n of e) for (let e of n) if (fb(e, t, !0)) return !0;
	return !1;
}
function Yb(e, t, n, r = Infinity) {
	let i = zb(e), a = zb(t);
	if (r !== Infinity && Vb(i, a, n) >= r) return r;
	if (sb(i, a)) {
		if (Jb(e, t)) return 0;
	} else if (Jb(t, e)) return 0;
	let o = Infinity;
	for (let r of e) for (let e = 0, i = r.length, a = i - 1; e < i; a = e++) {
		let i = r[a], s = r[e];
		for (let e of t) for (let t = 0, r = e.length, a = r - 1; t < r; a = t++) {
			let r = e[a], c = e[t];
			if (ub(i, s, r, c)) return 0;
			o = Math.min(o, Ub(i, s, r, c, n));
		}
	}
	return o;
}
function Xb(e, t, n, r, i, a) {
	if (!a) return;
	let o = Vb(Rb(r, a), i, n);
	o < t && e.push([
		o,
		a,
		[0, 0]
	]);
}
function Zb(e, t, n, r, i, a, o) {
	if (!a || !o) return;
	let s = Vb(Rb(r, a), Rb(i, o), n);
	s < t && e.push([
		s,
		a,
		o
	]);
}
function Qb(e, t, n, r, i = Infinity) {
	let a = Math.min(r.distance(e[0], n[0][0]), i);
	if (a === 0) return a;
	let o = new Db([[
		0,
		[0, e.length - 1],
		[0, 0]
	]], Pb), s = zb(n);
	for (; o.length > 0;) {
		let i = o.pop();
		if (i[0] >= a) continue;
		let c = i[1], l = t ? Nb : Mb;
		if (Fb(c) <= l) {
			if (!Ib(c, e.length)) return NaN;
			if (t) {
				let t = qb(e, c, n, r);
				if (isNaN(t) || t === 0) return t;
				a = Math.min(a, t);
			} else for (let t = c[0]; t <= c[1]; ++t) {
				let i = Kb(e[t], n, r);
				if (a = Math.min(a, i), a === 0) return 0;
			}
		} else {
			let n = Lb(c, t);
			Xb(o, a, r, e, s, n[0]), Xb(o, a, r, e, s, n[1]);
		}
	}
	return a;
}
function $b(e, t, n, r, i, a = Infinity) {
	let o = Math.min(a, i.distance(e[0], n[0]));
	if (o === 0) return o;
	let s = new Db([[
		0,
		[0, e.length - 1],
		[0, n.length - 1]
	]], Pb);
	for (; s.length > 0;) {
		let a = s.pop();
		if (a[0] >= o) continue;
		let c = a[1], l = a[2], u = t ? Nb : Mb, d = r ? Nb : Mb;
		if (Fb(c) <= u && Fb(l) <= d) {
			if (!Ib(c, e.length) && Ib(l, n.length)) return NaN;
			let a;
			if (t && r) a = Wb(e, c, n, l, i), o = Math.min(o, a);
			else if (t && !r) {
				let t = e.slice(c[0], c[1] + 1);
				for (let e = l[0]; e <= l[1]; ++e) if (a = Hb(n[e], t, i), o = Math.min(o, a), o === 0) return o;
			} else if (!t && r) {
				let t = n.slice(l[0], l[1] + 1);
				for (let n = c[0]; n <= c[1]; ++n) if (a = Hb(e[n], t, i), o = Math.min(o, a), o === 0) return o;
			} else a = Gb(e, c, n, l, i), o = Math.min(o, a);
		} else {
			let a = Lb(c, t), u = Lb(l, r);
			Zb(s, o, i, e, n, a[0], u[0]), Zb(s, o, i, e, n, a[0], u[1]), Zb(s, o, i, e, n, a[1], u[0]), Zb(s, o, i, e, n, a[1], u[1]);
		}
	}
	return o;
}
function ex(e, t) {
	let n = e.geometry(), r = n.flat().map((t) => tb([t.x, t.y], e.canonical));
	if (n.length === 0) return NaN;
	let i = new jb(r[0][1]), a = Infinity;
	for (let e of t) {
		switch (e.type) {
			case "Point":
				a = Math.min(a, $b(r, !1, [e.coordinates], !1, i, a));
				break;
			case "LineString":
				a = Math.min(a, $b(r, !1, e.coordinates, !0, i, a));
				break;
			case "Polygon": a = Math.min(a, Qb(r, !1, e.coordinates, i, a));
		}
		if (a === 0) return a;
	}
	return a;
}
function tx(e, t) {
	let n = e.geometry(), r = n.flat().map((t) => tb([t.x, t.y], e.canonical));
	if (n.length === 0) return NaN;
	let i = new jb(r[0][1]), a = Infinity;
	for (let e of t) {
		switch (e.type) {
			case "Point":
				a = Math.min(a, $b(r, !0, [e.coordinates], !1, i, a));
				break;
			case "LineString":
				a = Math.min(a, $b(r, !0, e.coordinates, !0, i, a));
				break;
			case "Polygon": a = Math.min(a, Qb(r, !0, e.coordinates, i, a));
		}
		if (a === 0) return a;
	}
	return a;
}
function nx(e, t) {
	let n = e.geometry();
	if (n.length === 0 || n[0].length === 0) return NaN;
	let r = py(n, 0).map((t) => t.map((t) => t.map((t) => tb([t.x, t.y], e.canonical)))), i = new jb(r[0][0][0][1]), a = Infinity;
	for (let e of t) for (let t of r) {
		switch (e.type) {
			case "Point":
				a = Math.min(a, Qb([e.coordinates], !1, t, i, a));
				break;
			case "LineString":
				a = Math.min(a, Qb(e.coordinates, !0, t, i, a));
				break;
			case "Polygon": a = Math.min(a, Yb(t, e.coordinates, i, a));
		}
		if (a === 0) return a;
	}
	return a;
}
function rx(e) {
	return e.type === "MultiPolygon" ? e.coordinates.map((e) => ({
		type: "Polygon",
		coordinates: e
	})) : e.type === "MultiLineString" ? e.coordinates.map((e) => ({
		type: "LineString",
		coordinates: e
	})) : e.type === "MultiPoint" ? e.coordinates.map((e) => ({
		type: "Point",
		coordinates: e
	})) : [e];
}
var ix = class e {
	constructor(e, t) {
		this.type = Y, this.geojson = e, this.geometries = t;
	}
	static parse(t, n) {
		if (t.length !== 2) return n.error(`'distance' expression requires exactly one argument, but found ${t.length - 1} instead.`);
		if (Qv(t[1])) {
			let n = t[1];
			if (n.type === "FeatureCollection") return new e(n, n.features.map((e) => rx(e.geometry)).flat());
			if (n.type === "Feature") return new e(n, rx(n.geometry));
			if ("type" in n && "coordinates" in n) return new e(n, rx(n));
		}
		return n.error("'distance' expression requires valid geojson object that contains polygon geometry type.");
	}
	evaluate(e) {
		if (e.geometry() != null && e.canonicalID() != null) {
			if (e.geometryType() === "Point") return ex(e, this.geometries);
			if (e.geometryType() === "LineString") return tx(e, this.geometries);
			if (e.geometryType() === "Polygon") return nx(e, this.geometries);
		}
		return NaN;
	}
	eachChild() {}
	outputDefined() {
		return !0;
	}
}, ax = class e {
	constructor(e) {
		let t = null;
		for (let n of e) if (!t) t = n.type;
		else if (t === n.type) continue;
		else {
			t = Q;
			break;
		}
		this.type = nv(t ?? Q, e.length), this.arr = e;
	}
	static parse(t, n) {
		if (t.length !== 2) return n.error(`'semiliteral' expression requires exactly one argument, but found ${t.length - 1} instead.`);
		if (!Qv(t[1])) return n.error(`invalid value of type "${typeof t[1]}"`);
		let r = t[1], i = $v(r);
		if (i.kind === "array") {
			let t = r, i = n.concat(1), a = [];
			for (let e = 0; e < t.length; e++) {
				let n = i.parse(t[e], e, Q);
				if (!n) return null;
				a.push(n);
			}
			return new e(a);
		}
		return new ty(i, r);
	}
	evaluate(e) {
		return this.arr.map((t) => t.evaluate(e));
	}
	eachChild(e) {
		this.arr.forEach(e);
	}
	outputDefined() {
		return this.arr.every((e) => e.outputDefined());
	}
}, ox = class e {
	constructor(e) {
		this.key = e, this.type = Q;
	}
	static parse(t, n) {
		if (t.length !== 2) return n.error(`Expected 1 argument, but found ${t.length - 1} instead.`);
		let r = t[1];
		return r == null ? n.error("Global state property must be defined.") : typeof r == "string" ? new e(r) : n.error(`Global state property must be string, but found ${typeof t[1]} instead.`);
	}
	evaluate(e) {
		let t = e.globals?.globalState;
		return !t || Object.keys(t).length === 0 ? null : kv(t, this.key) ?? null;
	}
	eachChild() {}
	outputDefined() {
		return !1;
	}
}, sx = {
	"==": Uy,
	"!=": Wy,
	">": Ky,
	"<": Gy,
	">=": Jy,
	"<=": qy,
	array: _y,
	at: Sy,
	boolean: _y,
	case: Ey,
	coalesce: Oy,
	collator: Yy,
	format: ly,
	image: Zy,
	in: Cy,
	"index-of": wy,
	interpolate: sy,
	"interpolate-hcl": sy,
	"interpolate-lab": sy,
	length: Qy,
	let: by,
	literal: ty,
	match: Ty,
	number: _y,
	"number-format": Xy,
	object: _y,
	semiliteral: ax,
	slice: Dy,
	step: ay,
	string: _y,
	"to-boolean": yy,
	"to-color": yy,
	"to-number": yy,
	"to-string": yy,
	var: xy,
	within: Eb,
	distance: ix,
	"global-state": ox
}, cx = class extends Error {
	constructor(e, t) {
		super(t), this.message = t, this.key = e;
	}
}, lx = class e {
	constructor(e, t = []) {
		this.parent = e, this.bindings = {};
		for (let [e, n] of t) this.bindings[e] = n;
	}
	concat(t) {
		return new e(this, t);
	}
	get(e) {
		if (this.bindings[e]) return this.bindings[e];
		if (this.parent) return this.parent.get(e);
		throw Error(`${e} not found in scope.`);
	}
	has(e) {
		return this.bindings[e] ? !0 : this.parent ? this.parent.has(e) : !1;
	}
}, ux = class e {
	constructor(e, t, n = [], r, i = new lx(), a = []) {
		this.registry = e, this.path = n, this.key = n.map((e) => `[${e}]`).join(""), this.scope = i, this.errors = a, this.expectedType = r, this._isConstant = t;
	}
	parse(e, t, n, r, i = {}) {
		return t == null ? this._parse(e, i) : this.concat(t, n, r)._parse(e, i);
	}
	_parse(e, t) {
		(e === null || typeof e == "string" || typeof e == "boolean" || typeof e == "number") && (e = ["literal", e]);
		let n = this.key;
		function r(e, t, r) {
			return r === "assert" ? new _y(t, [e], n) : r === "coerce" ? new yy(t, [e], n) : e;
		}
		if (Array.isArray(e)) {
			if (e.length === 0) return this.error("Expected an array with at least one element. If you wanted a literal array, use [\"literal\", []].");
			let n = e[0];
			if (typeof n != "string") return this.error(`Expression name must be a string, but found ${typeof n} instead. If you wanted a literal array, use ["literal", [...]].`, 0), null;
			let i = this.registry[n];
			if (i) {
				let n = i.parse(e, this);
				if (!n) return null;
				if (this.expectedType) {
					let e = this.expectedType, i = n.type;
					if ((e.kind === "string" || e.kind === "number" || e.kind === "boolean" || e.kind === "object" || e.kind === "array") && i.kind === "value") n = r(n, e, t.typeAnnotation || "assert");
					else if (e.kind === "projectionDefinition" && [
						"string",
						"array",
						"value"
					].includes(i.kind) || [
						"color",
						"formatted",
						"resolvedImage"
					].includes(e.kind) && ["value", "string"].includes(i.kind) || ["padding", "numberArray"].includes(e.kind) && [
						"value",
						"number",
						"array"
					].includes(i.kind) || e.kind === "colorArray" && [
						"value",
						"string",
						"array"
					].includes(i.kind) || e.kind === "variableAnchorOffsetCollection" && ["value", "array"].includes(i.kind)) n = r(n, e, t.typeAnnotation || "coerce");
					else if (this.checkSubtype(e, i)) return null;
				}
				if (!(n instanceof ty) && n.type.kind !== "resolvedImage" && this._isConstant(n)) {
					let e = new ry();
					try {
						n = new ty(n.type, n.evaluate(e));
					} catch (e) {
						return this.error(e.message), null;
					}
				}
				return n;
			}
			return this.error(`Unknown expression "${n}". If you wanted a literal array, use ["literal", [...]].`, 0);
		}
		return e === void 0 ? this.error("'undefined' value invalid. Use null instead.") : typeof e == "object" ? this.error("Bare objects invalid. Use [\"literal\", {...}] instead.") : this.error(`Expected an array, but found ${typeof e} instead.`);
	}
	concat(t, n, r) {
		let i = typeof t == "number" ? this.path.concat(t) : this.path, a = r ? this.scope.concat(r) : this.scope;
		return new e(this.registry, this._isConstant, i, n || null, a, this.errors);
	}
	error(e, ...t) {
		let n = `${this.key}${t.map((e) => `[${e}]`).join("")}`;
		this.errors.push(new cx(n, e));
	}
	checkSubtype(e, t) {
		let n = av(e, t);
		return n && this.error(n), n;
	}
}, dx = class e {
	constructor(e, t, n, r, i) {
		this.name = e, this.type = t, this._evaluate = n, this.args = r, this.key = i;
	}
	evaluate(e) {
		return this._evaluate(e, this.args, this.key);
	}
	eachChild(e) {
		this.args.forEach(e);
	}
	outputDefined() {
		return !1;
	}
	static parse(t, n) {
		let r = t[0], i = e.definitions[r];
		if (!i) return n.error(`Unknown expression "${r}". If you wanted a literal array, use ["literal", [...]].`, 0);
		let a = Array.isArray(i) ? i[0] : i.type, o = Array.isArray(i) ? [[i[1], i[2]]] : i.overloads, s = o.filter(([e]) => !Array.isArray(e) || e.length === t.length - 1), c = null;
		for (let [i, o] of s) {
			c = new ux(n.registry, vx, n.path, null, n.scope);
			let s = [], l = !1;
			for (let e = 1; e < t.length; e++) {
				let n = t[e], r = Array.isArray(i) ? i[e - 1] : i.type, a = c.parse(n, 1 + s.length, r);
				if (!a) {
					l = !0;
					break;
				}
				s.push(a);
			}
			if (!l) {
				if (Array.isArray(i) && i.length !== s.length) {
					c.error(`Expected ${i.length} arguments, but found ${s.length} instead.`);
					continue;
				}
				for (let e = 0; e < s.length; e++) {
					let t = Array.isArray(i) ? i[e] : i.type, n = s[e];
					c.concat(e + 1).checkSubtype(t, n.type);
				}
				if (c.errors.length === 0) return new e(r, a, o, s, n.key);
			}
		}
		if (s.length === 1) n.errors.push(...c.errors);
		else {
			let e = (s.length ? s : o).map(([e]) => _x(e)).join(" | "), r = [];
			for (let e = 1; e < t.length; e++) {
				let i = n.parse(t[e], 1 + r.length);
				if (!i) return null;
				r.push(rv(i.type));
			}
			n.error(`Expected arguments of type ${e}, but found (${r.join(", ")}) instead.`);
		}
		return null;
	}
	static register(t, n) {
		e.definitions = n;
		for (let r in n) t[r] = e;
	}
};
function fx(e, [t, n, r, i], a) {
	t = t.evaluate(e), n = n.evaluate(e), r = r.evaluate(e);
	let o = i ? i.evaluate(e) : 1, s = Zv(t, n, r, o);
	if (s) throw new Gv(s, a);
	return new Rv(t / 255, n / 255, r / 255, o, !1);
}
function px(e, t) {
	return e in t && t[e] !== void 0;
}
function mx(e, t) {
	let n = t[e];
	return n === void 0 ? null : n;
}
function hx(e, t, n, r) {
	for (; n <= r;) {
		let i = n + r >> 1;
		if (t[i] === e) return !0;
		t[i] > e ? r = i - 1 : n = i + 1;
	}
	return !1;
}
function gx(e) {
	return { type: e };
}
dx.register(sx, {
	error: [
		J_,
		[X],
		(e, [t], n) => {
			throw new Gv(t.evaluate(e), n);
		}
	],
	typeof: [
		X,
		[Q],
		(e, [t]) => rv($v(t.evaluate(e)))
	],
	"to-rgba": [
		nv(Y, 4),
		[G_],
		(e, [t]) => {
			let [n, r, i, a] = t.evaluate(e).rgb;
			return [
				n * 255,
				r * 255,
				i * 255,
				a
			];
		}
	],
	rgb: [
		G_,
		[
			Y,
			Y,
			Y
		],
		fx
	],
	rgba: [
		G_,
		[
			Y,
			Y,
			Y,
			Y
		],
		fx
	],
	has: {
		type: Z,
		overloads: [[[X], (e, [t]) => px(t.evaluate(e), e.properties())], [[X, q_], (e, [t, n]) => px(t.evaluate(e), n.evaluate(e))]]
	},
	get: {
		type: Q,
		overloads: [[[X], (e, [t]) => mx(t.evaluate(e), e.properties())], [[X, q_], (e, [t, n]) => mx(t.evaluate(e), n.evaluate(e))]]
	},
	"feature-state": [
		Q,
		[X],
		(e, [t]) => mx(t.evaluate(e), e.featureState || {})
	],
	properties: [
		q_,
		[],
		(e) => e.properties()
	],
	"geometry-type": [
		X,
		[],
		(e) => e.geometryType()
	],
	id: [
		Q,
		[],
		(e) => e.id()
	],
	zoom: [
		Y,
		[],
		(e) => e.globals.zoom
	],
	"heatmap-density": [
		Y,
		[],
		(e) => e.globals.heatmapDensity || 0
	],
	elevation: [
		Y,
		[],
		(e) => e.globals.elevation || 0
	],
	"line-progress": [
		Y,
		[],
		(e) => e.globals.lineProgress || 0
	],
	accumulated: [
		Q,
		[],
		(e) => e.globals.accumulated === void 0 ? null : e.globals.accumulated
	],
	"+": [
		Y,
		gx(Y),
		(e, t) => {
			let n = 0;
			for (let r of t) n += r.evaluate(e);
			return n;
		}
	],
	"*": [
		Y,
		gx(Y),
		(e, t) => {
			let n = 1;
			for (let r of t) n *= r.evaluate(e);
			return n;
		}
	],
	"-": {
		type: Y,
		overloads: [[[Y, Y], (e, [t, n]) => t.evaluate(e) - n.evaluate(e)], [[Y], (e, [t]) => -t.evaluate(e)]]
	},
	"/": [
		Y,
		[Y, Y],
		(e, [t, n]) => t.evaluate(e) / n.evaluate(e)
	],
	"%": [
		Y,
		[Y, Y],
		(e, [t, n]) => t.evaluate(e) % n.evaluate(e)
	],
	ln2: [
		Y,
		[],
		() => Math.LN2
	],
	pi: [
		Y,
		[],
		() => Math.PI
	],
	e: [
		Y,
		[],
		() => Math.E
	],
	"^": [
		Y,
		[Y, Y],
		(e, [t, n]) => t.evaluate(e) ** +n.evaluate(e)
	],
	sqrt: [
		Y,
		[Y],
		(e, [t]) => Math.sqrt(t.evaluate(e))
	],
	log10: [
		Y,
		[Y],
		(e, [t]) => Math.log(t.evaluate(e)) / Math.LN10
	],
	ln: [
		Y,
		[Y],
		(e, [t]) => Math.log(t.evaluate(e))
	],
	log2: [
		Y,
		[Y],
		(e, [t]) => Math.log(t.evaluate(e)) / Math.LN2
	],
	sin: [
		Y,
		[Y],
		(e, [t]) => Math.sin(t.evaluate(e))
	],
	cos: [
		Y,
		[Y],
		(e, [t]) => Math.cos(t.evaluate(e))
	],
	tan: [
		Y,
		[Y],
		(e, [t]) => Math.tan(t.evaluate(e))
	],
	asin: [
		Y,
		[Y],
		(e, [t]) => Math.asin(t.evaluate(e))
	],
	acos: [
		Y,
		[Y],
		(e, [t]) => Math.acos(t.evaluate(e))
	],
	atan: [
		Y,
		[Y],
		(e, [t]) => Math.atan(t.evaluate(e))
	],
	min: [
		Y,
		gx(Y),
		(e, t) => Math.min(...t.map((t) => t.evaluate(e)))
	],
	max: [
		Y,
		gx(Y),
		(e, t) => Math.max(...t.map((t) => t.evaluate(e)))
	],
	abs: [
		Y,
		[Y],
		(e, [t]) => Math.abs(t.evaluate(e))
	],
	round: [
		Y,
		[Y],
		(e, [t]) => {
			let n = t.evaluate(e);
			return n < 0 ? -Math.round(-n) : Math.round(n);
		}
	],
	floor: [
		Y,
		[Y],
		(e, [t]) => Math.floor(t.evaluate(e))
	],
	ceil: [
		Y,
		[Y],
		(e, [t]) => Math.ceil(t.evaluate(e))
	],
	"filter-==": [
		Z,
		[X, Q],
		(e, [t, n]) => e.properties()[t.value] === n.value
	],
	"filter-id-==": [
		Z,
		[Q],
		(e, [t]) => e.id() === t.value
	],
	"filter-type-==": [
		Z,
		[X],
		(e, [t]) => e.geometryType() === t.value
	],
	"filter-<": [
		Z,
		[X, Q],
		(e, [t, n]) => {
			let r = e.properties()[t.value], i = n.value;
			return typeof r == typeof i && r < i;
		}
	],
	"filter-id-<": [
		Z,
		[Q],
		(e, [t]) => {
			let n = e.id(), r = t.value;
			return typeof n == typeof r && n < r;
		}
	],
	"filter->": [
		Z,
		[X, Q],
		(e, [t, n]) => {
			let r = e.properties()[t.value], i = n.value;
			return typeof r == typeof i && r > i;
		}
	],
	"filter-id->": [
		Z,
		[Q],
		(e, [t]) => {
			let n = e.id(), r = t.value;
			return typeof n == typeof r && n > r;
		}
	],
	"filter-<=": [
		Z,
		[X, Q],
		(e, [t, n]) => {
			let r = e.properties()[t.value], i = n.value;
			return typeof r == typeof i && r <= i;
		}
	],
	"filter-id-<=": [
		Z,
		[Q],
		(e, [t]) => {
			let n = e.id(), r = t.value;
			return typeof n == typeof r && n <= r;
		}
	],
	"filter->=": [
		Z,
		[X, Q],
		(e, [t, n]) => {
			let r = e.properties()[t.value], i = n.value;
			return typeof r == typeof i && r >= i;
		}
	],
	"filter-id->=": [
		Z,
		[Q],
		(e, [t]) => {
			let n = e.id(), r = t.value;
			return typeof n == typeof r && n >= r;
		}
	],
	"filter-has": [
		Z,
		[Q],
		(e, [t]) => {
			let n = t.value, r = e.properties();
			return n in r && r[n] !== void 0;
		}
	],
	"filter-has-id": [
		Z,
		[],
		(e) => e.id() !== null && e.id() !== void 0
	],
	"filter-type-in": [
		Z,
		[nv(X)],
		(e, [t]) => t.value.indexOf(e.geometryType()) >= 0
	],
	"filter-id-in": [
		Z,
		[nv(Q)],
		(e, [t]) => t.value.indexOf(e.id()) >= 0
	],
	"filter-in-small": [
		Z,
		[X, nv(Q)],
		(e, [t, n]) => n.value.indexOf(e.properties()[t.value]) >= 0
	],
	"filter-in-large": [
		Z,
		[X, nv(Q)],
		(e, [t, n]) => hx(e.properties()[t.value], n.value, 0, n.value.length - 1)
	],
	all: {
		type: Z,
		overloads: [[[Z, Z], (e, [t, n]) => t.evaluate(e) && n.evaluate(e)], [gx(Z), (e, t) => {
			for (let n of t) if (!n.evaluate(e)) return !1;
			return !0;
		}]]
	},
	any: {
		type: Z,
		overloads: [[[Z, Z], (e, [t, n]) => t.evaluate(e) || n.evaluate(e)], [gx(Z), (e, t) => {
			for (let n of t) if (n.evaluate(e)) return !0;
			return !1;
		}]]
	},
	"!": [
		Z,
		[Z],
		(e, [t]) => !t.evaluate(e)
	],
	"is-supported-script": [
		Z,
		[X],
		(e, [t]) => {
			let n = e.globals && e.globals.isSupportedScript;
			return !n || n(t.evaluate(e));
		}
	],
	upcase: [
		X,
		[X],
		(e, [t]) => t.evaluate(e).toUpperCase()
	],
	downcase: [
		X,
		[X],
		(e, [t]) => t.evaluate(e).toLowerCase()
	],
	concat: [
		X,
		gx(Q),
		(e, t) => t.map((t) => ey(t.evaluate(e))).join("")
	],
	split: [
		nv(X),
		[X, X],
		(e, [t, n]) => t.evaluate(e).split(n.evaluate(e))
	],
	join: [
		X,
		[nv(X), X],
		(e, [t, n]) => t.evaluate(e).join(n.evaluate(e))
	],
	"resolved-locale": [
		X,
		[Y_],
		(e, [t]) => t.evaluate(e).resolvedLocale()
	]
});
function _x(e) {
	return Array.isArray(e) ? `(${e.map(rv).join(", ")})` : `(${rv(e.type)}...)`;
}
function vx(e) {
	if (e instanceof xy) return vx(e.boundExpression);
	if (e instanceof dx && e.name === "error" || e instanceof Yy || e instanceof Eb || e instanceof ix || e instanceof ox) return !1;
	let t = e instanceof yy || e instanceof _y, n = !0;
	return e.eachChild((e) => {
		n &&= t ? vx(e) : e instanceof ty;
	}), n ? yx(e) && xx(e, [
		"zoom",
		"heatmap-density",
		"elevation",
		"line-progress",
		"accumulated",
		"is-supported-script"
	]) : !1;
}
function yx(e) {
	if (e instanceof dx && (e.name === "get" && e.args.length === 1 || e.name === "feature-state" || e.name === "has" && e.args.length === 1 || e.name === "properties" || e.name === "geometry-type" || e.name === "id" || /^filter-/.test(e.name)) || e instanceof Eb || e instanceof ix) return !1;
	let t = !0;
	return e.eachChild((e) => {
		t && !yx(e) && (t = !1);
	}), t;
}
function bx(e) {
	if (e instanceof dx && e.name === "feature-state") return !1;
	let t = !0;
	return e.eachChild((e) => {
		t && !bx(e) && (t = !1);
	}), t;
}
function xx(e, t) {
	if (e instanceof dx && t.indexOf(e.name) >= 0) return !1;
	let n = !0;
	return e.eachChild((e) => {
		n && !xx(e, t) && (n = !1);
	}), n;
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/util/properties.mjs
function Sx(e) {
	return e["property-type"] === "data-driven" || e["property-type"] === "cross-faded-data-driven";
}
function Cx(e) {
	return !!e.expression && e.expression.parameters.indexOf("zoom") > -1;
}
function wx(e) {
	return !!e.expression && e.expression.interpolated;
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/function/index.mjs
function Tx(e) {
	return typeof e == "object" && !!e && !Array.isArray(e) && $v(e) === q_;
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/util/result.mjs
function Ex(e) {
	return {
		result: "success",
		value: e
	};
}
function Dx(e) {
	return {
		result: "error",
		value: e
	};
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/expression/index.mjs
var Ox = class {
	constructor(e, t, n, r) {
		this.expression = e, this._warningHistory = {}, this._evaluator = new ry(), this._defaultValue = n ? zx(n) : null, this._enumValues = n && n.type === "enum" ? n.values : null, this._globalState = r, this._rootKey = t;
	}
	evaluateWithoutErrorHandling(e, t, n, r, i, a) {
		return this._globalState && (e = Bx(e, this._globalState)), this._evaluator.globals = e, this._evaluator.feature = t, this._evaluator.featureState = n, this._evaluator.canonical = r, this._evaluator.availableImages = i || null, this._evaluator.formattedSection = a, this.expression.evaluate(this._evaluator);
	}
	evaluate(e, t, n, r, i, a) {
		this._globalState && (e = Bx(e, this._globalState)), this._evaluator.globals = e, this._evaluator.feature = t || null, this._evaluator.featureState = n || null, this._evaluator.canonical = r, this._evaluator.availableImages = i || null, this._evaluator.formattedSection = a || null;
		try {
			let e = this.expression.evaluate(this._evaluator);
			if (e == null || typeof e == "number" && e !== e) return this._defaultValue;
			if (this._enumValues && !(e in this._enumValues)) throw new Gv(`Expected value to be one of ${Object.keys(this._enumValues).map((e) => JSON.stringify(e)).join(", ")}, but found ${JSON.stringify(e)} instead.`, "");
			return e;
		} catch (e) {
			let t = e instanceof Gv ? e.path : "", n = `${t}|${e.message}`;
			return this._warningHistory[n] || (this._warningHistory[n] = !0, typeof console < "u" && console.warn(kx(this._rootKey, t, e.message, this._defaultValue))), this._defaultValue;
		}
	}
};
function kx(e, t, n, r) {
	return `${e}${t}: ${n}${r == null ? "" : ` Falling back to ${String(r)}.`}`;
}
function Ax(e) {
	if (!e) throw Error("rootKey must identify the location of the expression in the style JSON, e.g. \"layers[3].paint.line-width\".");
}
function jx(e) {
	return Array.isArray(e) && e.length > 0 && typeof e[0] == "string" && e[0] in sx;
}
function Mx(e, t, n, r) {
	Ax(t);
	let i = new ux(sx, vx, [], n ? Rx(n) : void 0), a = i.parse(e, void 0, void 0, void 0, n && n.type === "string" ? { typeAnnotation: "coerce" } : void 0);
	return a ? Ex(new Ox(a, t, n, r)) : Dx(i.errors);
}
var Nx = class {
	constructor(e, t, n) {
		this.kind = e, this._styleExpression = t, this.isStateDependent = e !== "constant" && !bx(t.expression), this.globalStateRefs = Lx(t.expression), this._globalState = n;
	}
	evaluateWithoutErrorHandling(e, t, n, r, i, a) {
		return this._globalState && (e = Bx(e, this._globalState)), this._styleExpression.evaluateWithoutErrorHandling(e, t, n, r, i, a);
	}
	evaluate(e, t, n, r, i, a) {
		return this._globalState && (e = Bx(e, this._globalState)), this._styleExpression.evaluate(e, t, n, r, i, a);
	}
}, Px = class {
	constructor(e, t, n, r, i) {
		this.kind = e, this.zoomStops = n, this._styleExpression = t, this.isStateDependent = e !== "camera" && !bx(t.expression), this.globalStateRefs = Lx(t.expression), this.interpolationType = r, this._globalState = i;
	}
	evaluateWithoutErrorHandling(e, t, n, r, i, a) {
		return this._globalState && (e = Bx(e, this._globalState)), this._styleExpression.evaluateWithoutErrorHandling(e, t, n, r, i, a);
	}
	evaluate(e, t, n, r, i, a) {
		return this._globalState && (e = Bx(e, this._globalState)), this._styleExpression.evaluate(e, t, n, r, i, a);
	}
	interpolationFactor(e, t, n) {
		return this.interpolationType ? sy.interpolationFactor(this.interpolationType, e, t, n) : 0;
	}
};
function Fx(e, t, n, r) {
	let i = Mx(e, t, n, r);
	if (i.result === "error") return i;
	let a = i.value.expression, o = yx(a);
	if (!o && !Sx(n)) return Dx([new cx("", "data expressions not supported")]);
	let s = xx(a, ["zoom"]);
	if (!s && !Cx(n)) return Dx([new cx("", "zoom expressions not supported")]);
	let c = Ix(a);
	if (!c && !s) return Dx([new cx("", "\"zoom\" expression may only be used as input to a top-level \"step\" or \"interpolate\" expression.")]);
	if (c instanceof cx) return Dx([c]);
	if (c instanceof sy && !wx(n)) return Dx([new cx("", "\"interpolate\" expressions cannot be used with this property")]);
	if (!c) return Ex(o ? new Nx("constant", i.value, r) : new Nx("source", i.value, r));
	let l = c instanceof sy ? c.interpolation : void 0;
	return Ex(o ? new Px("camera", i.value, c.labels, l, r) : new Px("composite", i.value, c.labels, l, r));
}
function Ix(e) {
	let t = null;
	if (e instanceof by) t = Ix(e.result);
	else if (e instanceof Oy) {
		for (let n of e.args) if (t = Ix(n), t) break;
	} else (e instanceof ay || e instanceof sy) && e.input instanceof dx && e.input.name === "zoom" && (t = e);
	return t instanceof cx || e.eachChild((e) => {
		let n = Ix(e);
		n instanceof cx ? t = n : !t && n ? t = new cx("", "\"zoom\" expression may only be used as input to a top-level \"step\" or \"interpolate\" expression.") : t && n && t !== n && (t = new cx("", "Only one zoom-based \"step\" or \"interpolate\" subexpression may be used in an expression."));
	}), t;
}
function Lx(e, t = /* @__PURE__ */ new Set()) {
	return e instanceof ox && t.add(e.key), e.eachChild((e) => {
		Lx(e, t);
	}), t;
}
function Rx(e) {
	let t = {
		color: G_,
		string: X,
		number: Y,
		enum: X,
		boolean: Z,
		formatted: X_,
		padding: Z_,
		numberArray: $_,
		colorArray: Q_,
		projectionDefinition: K_,
		resolvedImage: ev,
		variableAnchorOffsetCollection: tv
	};
	return e.type === "array" ? nv(t[e.value] || Q, e.length) : t[e.type];
}
function zx(e) {
	if (e.type === "color" && Tx(e.default)) return new Rv(0, 0, 0, 0);
	switch (e.type) {
		case "color": return Rv.parse(e.default) || null;
		case "padding": return Hv.parse(e.default) || null;
		case "numberArray": return Uv.parse(e.default) || null;
		case "colorArray": return Wv.parse(e.default) || null;
		case "variableAnchorOffsetCollection": return qv.parse(e.default) || null;
		case "projectionDefinition": return Yv.parse(e.default) || null;
		default: return e.default === void 0 ? null : e.default;
	}
}
function Bx(e, t) {
	let { zoom: n, heatmapDensity: r, elevation: i, lineProgress: a, isSupportedScript: o, accumulated: s } = e ?? {};
	return {
		zoom: n,
		heatmapDensity: r,
		elevation: i,
		lineProgress: a,
		isSupportedScript: o,
		accumulated: s,
		globalState: t
	};
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/feature_filter/index.mjs
function Vx(e) {
	let t = !1;
	for (let n of e) {
		let e = Hx(n);
		if (e === "expression") return "expression";
		e === "legacy" && (t = !0);
	}
	return t ? "legacy" : "neutral";
}
function Hx(e) {
	if (typeof e == "boolean") return "neutral";
	if (!Array.isArray(e) || e.length === 0) return "legacy";
	switch (e[0]) {
		case "has": return e.length < 2 || e[1] === "$id" || e[1] === "$type" ? "legacy" : e.length === 2 ? "neutral" : "expression";
		case "in": return e.length >= 3 && (typeof e[1] != "string" || Array.isArray(e[2])) ? "expression" : "legacy";
		case "!in":
		case "!has": return "legacy";
		case "==":
		case "!=":
		case ">":
		case ">=":
		case "<":
		case "<=": return e.length !== 3 || Array.isArray(e[1]) || Array.isArray(e[2]) ? "expression" : "legacy";
		case "none": return "legacy";
		case "any":
		case "all": return Vx(e.slice(1));
		default: return "expression";
	}
}
function Ux(e) {
	return Hx(e) !== "legacy";
}
function Wx(e) {
	return e === "$type" ? ["geometry-type"] : e === "$id" ? ["id"] : ["get", e];
}
function Gx(e) {
	switch (e[0]) {
		case "==":
		case "!=":
		case "<":
		case "<=":
		case ">":
		case ">=": return e.length !== 3 || typeof e[1] != "string" ? null : [
			e[0],
			Wx(e[1]),
			e[2]
		];
		case "in":
		case "!in": {
			if (e.length < 2 || typeof e[1] != "string") return null;
			let t = [
				"in",
				Wx(e[1]),
				["literal", e.slice(2)]
			];
			return e[0] === "!in" ? ["!", t] : t;
		}
		case "has":
		case "!has": {
			if (e.length !== 2 || typeof e[1] != "string" || e[1] === "$type" || e[1] === "$id") return null;
			let t = ["has", e[1]];
			return e[0] === "!has" ? ["!", t] : t;
		}
		default: return null;
	}
}
function Kx(e) {
	if ((e[0] === "<" || e[0] === "<=" || e[0] === ">" || e[0] === ">=") && e[1] === "$type") return `"$type" cannot be use with operator "${e[0]}"`;
	let t = Gx(e);
	return t ? `Mixing deprecated filter syntax with expression syntax is not supported. Replace ${JSON.stringify(e)} with ${JSON.stringify(t)}.` : `Mixing deprecated filter syntax with expression syntax is not supported. Convert ${JSON.stringify(e)} to expression syntax.`;
}
function qx(e, t, n) {
	let r = n[e];
	return Array.isArray(r) ? Ux(r) ? Jx(r, t.concat(e)) : {
		path: t.concat(e),
		legacyFilter: r
	} : null;
}
function Jx(e, t = []) {
	if (!Array.isArray(e) || e.length < 1) return null;
	switch (e[0]) {
		case "all":
		case "any":
		case "none":
			for (let n = 1; n < e.length; n++) {
				let r = qx(n, t, e);
				if (r) return r;
			}
			break;
		case "!": {
			let n = qx(1, t, e);
			if (n) return n;
			break;
		}
		case "case": for (let n = 1; n < e.length - 1; n += 2) {
			let r = qx(n, t, e);
			if (r) return r;
		}
	}
	return null;
}
function Yx(e, t) {
	let n = Jx(e);
	if (!n || typeof console > "u") return;
	let r = n.path.map((e) => `[${e}]`).join("");
	console.warn(`${t}${r}: ${Kx(n.legacyFilter)}`);
}
var Xx = {
	type: "boolean",
	default: !1,
	transition: !1,
	"property-type": "data-driven",
	expression: {
		interpolated: !1,
		parameters: ["zoom", "feature"]
	}
};
function Zx(e, t, n) {
	if (e == null) return {
		filter: () => !0,
		needGeometry: !1,
		getGlobalStateRefs: () => /* @__PURE__ */ new Set()
	};
	Ux(e) ? Yx(e, t) : e = eS(e);
	let r = Mx(e, t, Xx, n);
	if (r.result === "error") throw Error(r.value.map((e) => `${e.key}: ${e.message}`).join(", "));
	return {
		filter: (e, t, n) => r.value.evaluate(e, t, {}, n),
		needGeometry: $x(e),
		getGlobalStateRefs: () => Lx(r.value.expression)
	};
}
function Qx(e, t) {
	return e < t ? -1 : +(e > t);
}
function $x(e) {
	if (!Array.isArray(e)) return !1;
	if (e[0] === "within" || e[0] === "distance") return !0;
	for (let t = 1; t < e.length; t++) if ($x(e[t])) return !0;
	return !1;
}
function eS(e) {
	if (!e) return !0;
	let t = e[0];
	return e.length <= 1 ? t !== "any" : t === "==" ? tS(e[1], e[2], "==") : t === "!=" ? aS(tS(e[1], e[2], "==")) : t === "<" || t === ">" || t === "<=" || t === ">=" ? tS(e[1], e[2], t) : t === "any" ? nS(e.slice(1)) : t === "all" ? ["all"].concat(e.slice(1).map(eS)) : t === "none" ? ["all"].concat(e.slice(1).map(eS).map(aS)) : t === "in" ? rS(e[1], e.slice(2)) : t === "!in" ? aS(rS(e[1], e.slice(2))) : t === "has" ? iS(e[1]) : t !== "!has" || aS(iS(e[1]));
}
function tS(e, t, n) {
	switch (e) {
		case "$type": return [`filter-type-${n}`, t];
		case "$id": return [`filter-id-${n}`, t];
		default: return [
			`filter-${n}`,
			e,
			t
		];
	}
}
function nS(e) {
	return ["any"].concat(e.map(eS));
}
function rS(e, t) {
	if (t.length === 0) return !1;
	switch (e) {
		case "$type": return ["filter-type-in", ["literal", t]];
		case "$id": return ["filter-id-in", ["literal", t]];
		default: return t.length > 200 && !t.some((e) => typeof e != typeof t[0]) ? [
			"filter-in-large",
			e,
			["literal", t.sort(Qx)]
		] : [
			"filter-in-small",
			e,
			["literal", t]
		];
	}
}
function iS(e) {
	switch (e) {
		case "$type": return !0;
		case "$id": return ["filter-has-id"];
		default: return ["filter-has", e];
	}
}
function aS(e) {
	return ["!", e];
}
//#endregion
//#region node_modules/@maplibre/maplibre-gl-style-spec/dist/function/convert.mjs
function oS(e) {
	return typeof e == "object" ? ["literal", e] : e;
}
function sS(e, t) {
	let n = e.stops;
	if (!n) return cS(e, t);
	let r = n && typeof n[0][0] == "object", i = r || e.property !== void 0, a = r || !i;
	return n = n.map((e) => !i && t.tokens && typeof e[1] == "string" ? [e[0], vS(e[1])] : [e[0], oS(e[1])]), r ? uS(e, t, n) : a ? mS(e, t, n) : pS(e, t, n);
}
function cS(e, t) {
	let n = ["get", e.property];
	if (e.default === void 0) return t.type === "string" ? ["string", n] : n;
	if (t.type === "enum") return [
		"match",
		n,
		Object.keys(t.values),
		n,
		e.default
	];
	{
		let r = [
			t.type === "color" ? "to-color" : t.type,
			n,
			oS(e.default)
		];
		return t.type === "array" && r.splice(1, 0, t.value, t.length || null), r;
	}
}
function lS(e) {
	switch (e.colorSpace) {
		case "hcl": return "interpolate-hcl";
		case "lab": return "interpolate-lab";
		default: return "interpolate";
	}
}
function uS(e, t, n) {
	let r = {}, i = {}, a = [];
	for (let t = 0; t < n.length; t++) {
		let o = n[t], s = o[0].zoom;
		r[s] === void 0 && (r[s] = {
			zoom: s,
			type: e.type,
			property: e.property,
			default: e.default
		}, i[s] = [], a.push(s)), i[s].push([o[0].value, o[1]]);
	}
	if (_S({}, t) === "exponential") {
		let n = [
			lS(e),
			["linear"],
			["zoom"]
		];
		for (let e of a) gS(n, e, pS(r[e], t, i[e]), !1);
		return n;
	}
	{
		let e = ["step", ["zoom"]];
		for (let n of a) gS(e, n, pS(r[n], t, i[n]), !0);
		return hS(e), e;
	}
}
function dS(e, t) {
	if (e !== void 0) return e;
	if (t !== void 0) return t;
}
function fS(e, t) {
	let n = oS(dS(e.default, t.default));
	return n === void 0 && t.type === "resolvedImage" ? "" : n;
}
function pS(e, t, n) {
	let r = _S(e, t), i = ["get", e.property];
	if (r === "categorical" && typeof n[0][0] == "boolean") {
		let r = ["case"];
		for (let e of n) r.push([
			"==",
			i,
			e[0]
		], e[1]);
		return r.push(fS(e, t)), r;
	}
	if (r === "categorical") {
		let r = ["match", i];
		for (let e of n) gS(r, e[0], e[1], !1);
		return r.push(fS(e, t)), r;
	}
	if (r === "interval") {
		let t = ["step", ["number", i]];
		for (let e of n) gS(t, e[0], e[1], !0);
		return hS(t), e.default === void 0 ? t : [
			"case",
			[
				"==",
				["typeof", i],
				"number"
			],
			t,
			oS(e.default)
		];
	}
	if (r === "exponential") {
		let t = e.base === void 0 ? 1 : e.base, r = [
			lS(e),
			t === 1 ? ["linear"] : ["exponential", t],
			["number", i]
		];
		for (let e of n) gS(r, e[0], e[1], !1);
		return e.default === void 0 ? r : [
			"case",
			[
				"==",
				["typeof", i],
				"number"
			],
			r,
			oS(e.default)
		];
	}
	throw Error(`Unknown property function type ${r}`);
}
function mS(e, t, n, r = ["zoom"]) {
	let i = _S(e, t), a, o = !1;
	if (i === "interval") a = ["step", r], o = !0;
	else if (i === "exponential") {
		let t = e.base === void 0 ? 1 : e.base;
		a = [
			lS(e),
			t === 1 ? ["linear"] : ["exponential", t],
			r
		];
	} else throw Error(`Unknown zoom function type "${i}"`);
	for (let e of n) gS(a, e[0], e[1], o);
	return hS(a), a;
}
function hS(e) {
	e[0] === "step" && e.length === 3 && (e.push(0), e.push(e[3]));
}
function gS(e, t, n, r) {
	e.length > 3 && t === e[e.length - 2] || (r && e.length === 2 || e.push(t), e.push(n));
}
function _S(e, t) {
	return e.type ? e.type : t.expression.interpolated ? "exponential" : "interval";
}
function vS(e) {
	let t = ["concat"], n = /{([^{}]+)}/g, r = 0;
	for (let i = n.exec(e); i !== null; i = n.exec(e)) {
		let a = e.slice(r, n.lastIndex - i[0].length);
		r = n.lastIndex, a.length > 0 && t.push(a), t.push(["get", i[1]]);
	}
	if (t.length === 1) return e;
	if (r < e.length) t.push(e.slice(r));
	else if (t.length === 2) return ["to-string", t[1]];
	return t;
}
//#endregion
//#region node_modules/ol/format/Feature.js
var yS = class {
	constructor() {
		this.dataProjection = void 0, this.defaultFeatureProjection = void 0, this.featureClass = um, this.supportedMediaTypes = null;
	}
	getReadOptions(e, t) {
		if (t) {
			let n = t.dataProjection ? ds(t.dataProjection) : this.readProjection(e);
			t.extent && n && n.getUnits() === "tile-pixels" && (n = ds(n), n.setWorldExtent(t.extent)), t = {
				dataProjection: n,
				featureProjection: t.featureProjection
			};
		}
		return this.adaptOptions(t);
	}
	adaptOptions(e) {
		return Object.assign({
			dataProjection: this.dataProjection,
			featureProjection: this.defaultFeatureProjection,
			featureClass: this.featureClass
		}, e);
	}
	getType() {
		return R();
	}
	readFeature(e, t) {
		return R();
	}
	readFeatures(e, t) {
		return R();
	}
	readGeometry(e, t) {
		return R();
	}
	readProjection(e) {
		return R();
	}
	writeFeature(e, t) {
		return R();
	}
	writeFeatures(e, t) {
		return R();
	}
	writeGeometry(e, t) {
		return R();
	}
};
function bS(e, t, n) {
	let r = n ? ds(n.featureProjection) : null, i = n ? ds(n.dataProjection) : null, a = e;
	if (r && i && !ys(r, i)) {
		t && (a = e.clone());
		let n = t ? r : i, o = t ? i : r;
		n.getUnits() === "tile-pixels" ? a.transform(n, o) : a.applyTransform(Ss(n, o));
	}
	if (t && n && n.decimals !== void 0) {
		let t = 10 ** n.decimals;
		a === e && (a = e.clone()), a.applyTransform(function(e) {
			for (let n = 0, r = e.length; n < r; ++n) e[n] = Math.round(e[n] * t) / t;
			return e;
		});
	}
	return a;
}
var xS = {
	Point: Vc,
	LineString: gm,
	Polygon: Zc,
	MultiPoint: Wm,
	MultiLineString: Um,
	MultiPolygon: Km
};
function SS(e, t, n) {
	return Array.isArray(t[0]) ? (qc(e, 0, t, n) || (e = e.slice(), Yc(e, 0, t, n)), e) : (Kc(e, 0, t, n) || (e = e.slice(), Jc(e, 0, t, n)), e);
}
function CS(e, t) {
	let n = e.geometry;
	if (!n) return [];
	if (Array.isArray(n)) return n.map((t) => CS({
		...e,
		geometry: t
	})).flat();
	let r = n.type === "MultiPolygon" ? "Polygon" : n.type;
	if (r === "GeometryCollection" || r === "Circle") throw Error("Unsupported geometry type: " + r);
	let i = n.layout.length;
	return bS(new Jm(r, r === "Polygon" ? SS(n.flatCoordinates, n.ends, i) : n.flatCoordinates, n.ends?.flat(), i, e.properties || {}, e.id).enableSimplifyTransformed(), !1, t);
}
function wS(e, t) {
	if (!e) return null;
	if (Array.isArray(e)) return new R_(e.map((e) => wS(e, t)));
	let n = xS[e.type];
	return bS(new n(e.flatCoordinates, e.layout || "XY", e.ends), !1, t);
}
//#endregion
//#region node_modules/ol/format/JSONFeature.js
var TS = class extends yS {
	constructor() {
		super();
	}
	getType() {
		return "json";
	}
	readFeature(e, t) {
		return this.readFeatureFromObject(ES(e), this.getReadOptions(e, t));
	}
	readFeatures(e, t) {
		return this.readFeaturesFromObject(ES(e), this.getReadOptions(e, t));
	}
	readFeatureFromObject(e, t) {
		return R();
	}
	readFeaturesFromObject(e, t) {
		return R();
	}
	readGeometry(e, t) {
		return this.readGeometryFromObject(ES(e), this.getReadOptions(e, t));
	}
	readGeometryFromObject(e, t) {
		return R();
	}
	readProjection(e) {
		return this.readProjectionFromObject(ES(e));
	}
	readProjectionFromObject(e) {
		return R();
	}
	writeFeature(e, t) {
		return JSON.stringify(this.writeFeatureObject(e, t));
	}
	writeFeatureObject(e, t) {
		return R();
	}
	writeFeatures(e, t) {
		return JSON.stringify(this.writeFeaturesObject(e, t));
	}
	writeFeaturesObject(e, t) {
		return R();
	}
	writeGeometry(e, t) {
		return JSON.stringify(this.writeGeometryObject(e, t));
	}
	writeGeometryObject(e, t) {
		return R();
	}
};
function ES(e) {
	return typeof e == "string" ? JSON.parse(e) || null : e === null ? null : e;
}
//#endregion
//#region node_modules/ol/format/GeoJSON.js
var DS = class extends TS {
	constructor(e) {
		e ||= {}, super(), this.dataProjection = ds(e.dataProjection ? e.dataProjection : "EPSG:4326"), e.featureProjection && (this.defaultFeatureProjection = ds(e.featureProjection)), e.featureClass && (this.featureClass = e.featureClass), this.geometryName_ = e.geometryName, this.extractGeometryName_ = e.extractGeometryName, this.supportedMediaTypes = ["application/geo+json", "application/vnd.geo+json"];
	}
	readFeatureFromObject(e, t) {
		let n = null;
		n = e.type === "Feature" ? e : {
			type: "Feature",
			geometry: e,
			properties: null
		};
		let r = OS(n.geometry, t);
		if (this.featureClass === Jm) return CS({
			geometry: r,
			id: n.id,
			properties: n.properties
		}, t);
		let i = this.featureClass, a = new i();
		return this.geometryName_ ? a.setGeometryName(this.geometryName_) : this.extractGeometryName_ && n.geometry_name && a.setGeometryName(n.geometry_name), a.setGeometry(wS(r, t)), "id" in n && a.setId(n.id), n.properties && a.setProperties(n.properties, !0), a;
	}
	readFeaturesFromObject(e, t) {
		let n = e, r = null;
		if (n.type === "FeatureCollection") {
			let n = e;
			r = [];
			let i = n.features;
			for (let e = 0, n = i.length; e < n; ++e) {
				let n = this.readFeatureFromObject(i[e], t);
				n && r.push(n);
			}
		} else r = [this.readFeatureFromObject(e, t)];
		return r.flat();
	}
	readGeometryFromObject(e, t) {
		return kS(e, t);
	}
	readProjectionFromObject(e) {
		let t = e.crs, n;
		if (t) {
			if (t.type == "name") n = ds(t.properties.name);
			else if (t.type === "EPSG") n = ds("EPSG:" + t.properties.code);
			else throw Error("Unknown SRS type");
		} else n = this.dataProjection;
		return n;
	}
	writeFeatureObject(e, t) {
		t = this.adaptOptions(t);
		let n = {
			type: "Feature",
			geometry: null,
			properties: null
		}, r = e.getId();
		if (r !== void 0 && (n.id = r), !e.hasProperties()) return n;
		let i = e.getProperties(), a = e.getGeometry();
		return a && (n.geometry = LS(a, t), delete i[e.getGeometryName()]), Gr(i) || (n.properties = i), n;
	}
	writeFeaturesObject(e, t) {
		t = this.adaptOptions(t);
		let n = [];
		for (let r = 0, i = e.length; r < i; ++r) n.push(this.writeFeatureObject(e[r], t));
		return {
			type: "FeatureCollection",
			features: n
		};
	}
	writeGeometryObject(e, t) {
		return LS(e, this.adaptOptions(t));
	}
};
function OS(e, t) {
	if (!e) return null;
	let n;
	switch (e.type) {
		case "Point":
			n = jS(e);
			break;
		case "LineString":
			n = MS(e);
			break;
		case "Polygon":
			n = IS(e);
			break;
		case "MultiPoint":
			n = PS(e);
			break;
		case "MultiLineString":
			n = NS(e);
			break;
		case "MultiPolygon":
			n = FS(e);
			break;
		case "GeometryCollection":
			n = AS(e);
			break;
		default: throw Error("Unsupported GeoJSON type: " + e.type);
	}
	return n;
}
function kS(e, t) {
	return wS(OS(e, t), t);
}
function AS(e, t) {
	return e.geometries.map(function(e) {
		return OS(e, t);
	});
}
function jS(e) {
	let t = e.coordinates;
	return {
		type: "Point",
		flatCoordinates: t,
		layout: ic(t.length)
	};
}
function MS(e) {
	let t = e.coordinates, n = t.flat();
	return {
		type: "LineString",
		flatCoordinates: n,
		ends: [n.length],
		layout: ic(t[0]?.length || 2)
	};
}
function NS(e) {
	let t = e.coordinates, n = t[0]?.[0]?.length || 2, r = [];
	return {
		type: "MultiLineString",
		flatCoordinates: r,
		ends: yc(r, 0, t, n),
		layout: ic(n)
	};
}
function PS(e) {
	let t = e.coordinates;
	return {
		type: "MultiPoint",
		flatCoordinates: t.flat(),
		layout: ic(t[0]?.length || 2)
	};
}
function FS(e) {
	let t = e.coordinates, n = [], r = t[0]?.[0]?.[0].length || 2;
	return {
		type: "MultiPolygon",
		flatCoordinates: n,
		ends: bc(n, 0, t, r),
		layout: ic(r)
	};
}
function IS(e) {
	let t = e.coordinates, n = [], r = t[0]?.[0]?.length;
	return {
		type: "Polygon",
		flatCoordinates: n,
		ends: yc(n, 0, t, r),
		layout: ic(r)
	};
}
function LS(e, t) {
	e = bS(e, !0, t);
	let n = e.getType(), r;
	switch (n) {
		case "Point":
			r = US(e, t);
			break;
		case "LineString":
			r = zS(e, t);
			break;
		case "Polygon":
			r = WS(e, t);
			break;
		case "MultiPoint":
			r = VS(e, t);
			break;
		case "MultiLineString":
			r = BS(e, t);
			break;
		case "MultiPolygon":
			r = HS(e, t);
			break;
		case "GeometryCollection":
			r = RS(e, t);
			break;
		case "Circle":
			r = {
				type: "GeometryCollection",
				geometries: []
			};
			break;
		default: throw Error("Unsupported geometry type: " + n);
	}
	return r;
}
function RS(e, t) {
	return t = Object.assign({}, t), delete t.featureProjection, {
		type: "GeometryCollection",
		geometries: e.getGeometriesArray().map(function(e) {
			return LS(e, t);
		})
	};
}
function zS(e, t) {
	return {
		type: "LineString",
		coordinates: e.getCoordinates()
	};
}
function BS(e, t) {
	return {
		type: "MultiLineString",
		coordinates: e.getCoordinates()
	};
}
function VS(e, t) {
	return {
		type: "MultiPoint",
		coordinates: e.getCoordinates()
	};
}
function HS(e, t) {
	let n;
	return t && (n = t.rightHanded), {
		type: "MultiPolygon",
		coordinates: e.getCoordinates(n)
	};
}
function US(e, t) {
	return {
		type: "Point",
		coordinates: e.getCoordinates()
	};
}
function WS(e, t) {
	let n;
	return t && (n = t.rightHanded), {
		type: "Polygon",
		coordinates: e.getCoordinates(n)
	};
}
//#endregion
//#region node_modules/pbf/index.js
var GS = 4294967296;
1 / GS;
var KS = 12, qS = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8"), JS = 0, YS = 1, XS = 2, ZS = 5, QS = class {
	constructor(e) {
		this.buf = ArrayBuffer.isView(e) ? e : new Uint8Array(e), this.dataView = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength), this.pos = 0, this.type = 0, this._valueStart = -1, this.length = this.buf.length;
	}
	readFields(e, t, n = this.length) {
		let r;
		for (; r = this.nextField(n);) e(r, t, this);
		return t;
	}
	readMessage(e, t) {
		return this.readFields(e, t, this.readVarint() + this.pos);
	}
	readFixed32() {
		let e = this.dataView.getUint32(this.pos, !0);
		return this.pos += 4, e;
	}
	readSFixed32() {
		let e = this.dataView.getInt32(this.pos, !0);
		return this.pos += 4, e;
	}
	readFixed64() {
		let e = this.dataView.getUint32(this.pos, !0) + this.dataView.getUint32(this.pos + 4, !0) * GS;
		return this.pos += 8, e;
	}
	readSFixed64() {
		let e = this.dataView.getUint32(this.pos, !0) + this.dataView.getInt32(this.pos + 4, !0) * GS;
		return this.pos += 8, e;
	}
	readFloat() {
		let e = this.dataView.getFloat32(this.pos, !0);
		return this.pos += 4, e;
	}
	readDouble() {
		let e = this.dataView.getFloat64(this.pos, !0);
		return this.pos += 8, e;
	}
	readVarint(e) {
		let t = this.buf, n = t[this.pos++];
		if (n < 128) return n;
		let r = n & 127, i;
		return i = t[this.pos++], r |= (i & 127) << 7, i < 128 || (i = t[this.pos++], r |= (i & 127) << 14, i < 128) || (i = t[this.pos++], r |= (i & 127) << 21, i < 128) ? r : (i = t[this.pos], r |= (i & 15) << 28, $S(r, e, this));
	}
	readSVarint() {
		let e = this.readVarint();
		return e % 2 == 1 ? (e + 1) / -2 : e / 2;
	}
	readBoolean() {
		return !!this.readVarint();
	}
	readString() {
		let e = this.readVarint() + this.pos, t = this.pos;
		return this.pos = e, e - t >= KS && qS ? qS.decode(this.buf.subarray(t, e)) : tC(this.buf, t, e);
	}
	readBytes() {
		let e = this.readVarint() + this.pos, t = this.buf.subarray(this.pos, e);
		return this.pos = e, t;
	}
	readPackedVarint(e = [], t) {
		let n = this.readPackedEnd();
		for (; this.pos < n;) e.push(this.readVarint(t));
		return e;
	}
	readPackedSVarint(e = []) {
		let t = this.readPackedEnd();
		for (; this.pos < t;) e.push(this.readSVarint());
		return e;
	}
	readPackedBoolean(e = []) {
		let t = this.readPackedEnd();
		for (; this.pos < t;) e.push(this.readBoolean());
		return e;
	}
	readPackedFloat(e = []) {
		let t = this.readPackedEnd();
		for (; this.pos < t;) e.push(this.readFloat());
		return e;
	}
	readPackedDouble(e = []) {
		let t = this.readPackedEnd();
		for (; this.pos < t;) e.push(this.readDouble());
		return e;
	}
	readPackedFixed32(e = []) {
		let t = this.readPackedEnd();
		for (; this.pos < t;) e.push(this.readFixed32());
		return e;
	}
	readPackedSFixed32(e = []) {
		let t = this.readPackedEnd();
		for (; this.pos < t;) e.push(this.readSFixed32());
		return e;
	}
	readPackedFixed64(e = []) {
		let t = this.readPackedEnd();
		for (; this.pos < t;) e.push(this.readFixed64());
		return e;
	}
	readPackedSFixed64(e = []) {
		let t = this.readPackedEnd();
		for (; this.pos < t;) e.push(this.readSFixed64());
		return e;
	}
	readPackedEnd() {
		return this.type === XS ? this.readVarint() + this.pos : this.pos + 1;
	}
	nextField(e = this.length) {
		if (this.pos === this._valueStart && this.skip(this.type), this.pos >= e) return 0;
		let t = this.readVarint();
		return this.type = t & 7, this._valueStart = this.pos, t >>> 3;
	}
	skip(e) {
		let t = e & 7;
		if (t === JS) for (; this.buf[this.pos++] > 127;);
		else if (t === XS) this.pos = this.readVarint() + this.pos;
		else if (t === ZS) this.pos += 4;
		else if (t === YS) this.pos += 8;
		else throw Error(`Unimplemented type: ${t}`);
	}
};
function $S(e, t, n) {
	let r = n.buf, i, a;
	if (a = r[n.pos++], i = (a & 112) >> 4, a < 128 || (a = r[n.pos++], i |= (a & 127) << 3, a < 128) || (a = r[n.pos++], i |= (a & 127) << 10, a < 128) || (a = r[n.pos++], i |= (a & 127) << 17, a < 128) || (a = r[n.pos++], i |= (a & 127) << 24, a < 128) || (a = r[n.pos++], i |= (a & 1) << 31, a < 128)) return eC(e, i, t);
	throw Error("Expected varint not more than 10 bytes");
}
function eC(e, t, n) {
	return n ? t * 4294967296 + (e >>> 0) : (t >>> 0) * 4294967296 + (e >>> 0);
}
function tC(e, t, n) {
	let r = "", i = t;
	for (; i < n;) {
		let t = e[i], a = null, o = t > 239 ? 4 : t > 223 ? 3 : t > 191 ? 2 : 1;
		if (i + o > n) break;
		let s, c, l;
		o === 1 ? t < 128 && (a = t) : o === 2 ? (s = e[i + 1], (s & 192) == 128 && (a = (t & 31) << 6 | s & 63, a <= 127 && (a = null))) : o === 3 ? (s = e[i + 1], c = e[i + 2], (s & 192) == 128 && (c & 192) == 128 && (a = (t & 15) << 12 | (s & 63) << 6 | c & 63, (a <= 2047 || a >= 55296 && a <= 57343) && (a = null))) : o === 4 && (s = e[i + 1], c = e[i + 2], l = e[i + 3], (s & 192) == 128 && (c & 192) == 128 && (l & 192) == 128 && (a = (t & 15) << 18 | (s & 63) << 12 | (c & 63) << 6 | l & 63, (a <= 65535 || a >= 1114112) && (a = null))), a === null ? (a = 65533, o = 1) : a > 65535 && (a -= 65536, r += String.fromCharCode(a >>> 10 & 1023 | 55296), a = 56320 | a & 1023), r += String.fromCharCode(a), i += o;
	}
	return r;
}
//#endregion
//#region node_modules/ol/format/MVT.js
var nC = class extends yS {
	constructor(e) {
		super(), e ||= {}, this.dataProjection = new io({
			code: "",
			units: "tile-pixels"
		}), this.featureClass = e.featureClass ? e.featureClass : Jm, this.geometryName_ = e.geometryName, this.layerName_ = e.layerName ? e.layerName : "layer", this.layers_ = e.layers ? e.layers : null, this.idProperty_ = e.idProperty, this.supportedMediaTypes = ["application/vnd.mapbox-vector-tile", "application/x-protobuf"];
	}
	readRawGeometry_(e, t, n, r) {
		e.pos = t.geometry;
		let i = e.readVarint() + e.pos, a = 1, o = 0, s = 0, c = 0, l = 0, u = 0;
		for (; e.pos < i;) {
			if (!o) {
				let t = e.readVarint();
				a = t & 7, o = t >> 3;
			}
			if (o--, a === 1 || a === 2) s += e.readSVarint(), c += e.readSVarint(), a === 1 && l > u && (r.push(l), u = l), n.push(s, c), l += 2;
			else if (a === 7) l > u && (n.push(n[u], n[u + 1]), l += 2);
			else throw Error("Invalid command found in the PBF");
		}
		l > u && (r.push(l), u = l);
	}
	createFeature_(e, t, n) {
		let r = t.type;
		if (r === 0) return null;
		let i, a = t.properties, o;
		this.idProperty_ ? (o = a[this.idProperty_], delete a[this.idProperty_]) : o = t.id, a[this.layerName_] = t.layer.name;
		let s = [], c = [];
		this.readRawGeometry_(e, t, s, c);
		let l = sC(r, c.length);
		if (this.featureClass === Jm) i = new this.featureClass(l, s, c, 2, a, o), i.transform(n.dataProjection);
		else {
			let e;
			if (l == "Polygon") {
				let t = Xc(s, c);
				e = t.length > 1 ? new Km(s, "XY", t) : new Zc(s, "XY", c);
			} else e = l === "Point" ? new Vc(s, "XY") : l === "LineString" ? new gm(s, "XY") : l === "MultiPoint" ? new Wm(s, "XY") : l === "MultiLineString" ? new Um(s, "XY", c) : null;
			let t = this.featureClass;
			i = new t(), this.geometryName_ && i.setGeometryName(this.geometryName_);
			let r = bS(e, !1, n);
			i.setGeometry(r), o !== void 0 && i.setId(o), i.setProperties(a, !0);
		}
		return i;
	}
	getType() {
		return "arraybuffer";
	}
	readFeatures(e, t) {
		let n = this.layers_;
		t = this.adaptOptions(t);
		let r = ds(t.dataProjection);
		r.setWorldExtent(t.extent), t.dataProjection = r;
		let i = new QS(e), a = i.readFields(rC, {}), o = [];
		for (let e in a) {
			if (n && !n.includes(e)) continue;
			let s = a[e], c = s ? [
				0,
				0,
				s.extent,
				s.extent
			] : null;
			r.setExtent(c);
			for (let e = 0, n = s.length; e < n; ++e) {
				let n = oC(i, s, e), r = this.createFeature_(i, n, t);
				r !== null && o.push(r);
			}
		}
		return o;
	}
	readProjection(e) {
		return this.dataProjection;
	}
	setLayers(e) {
		this.layers_ = e;
	}
};
function rC(e, t, n) {
	if (e === 3) {
		let e = {
			keys: [],
			values: [],
			features: []
		}, r = n.readVarint() + n.pos;
		n.readFields(iC, e, r), e.length = e.features.length, e.length && (t[e.name] = e);
	}
}
function iC(e, t, n) {
	if (e === 15) t.version = n.readVarint();
	else if (e === 1) t.name = n.readString();
	else if (e === 5) t.extent = n.readVarint();
	else if (e === 2) t.features.push(n.pos);
	else if (e === 3) t.keys.push(n.readString());
	else if (e === 4) {
		let r = null, i = n.readVarint() + n.pos;
		for (; n.pos < i;) e = n.readVarint() >> 3, r = e === 1 ? n.readString() : e === 2 ? n.readFloat() : e === 3 ? n.readDouble() : e === 4 ? n.readVarint(!0) : e === 5 ? n.readVarint() : e === 6 ? n.readSVarint() : e === 7 ? n.readBoolean() : null;
		t.values.push(r);
	}
}
function aC(e, t, n) {
	if (e == 1) t.id = n.readVarint();
	else if (e == 2) {
		let e = n.readVarint() + n.pos;
		for (; n.pos < e;) {
			let e = t.layer.keys[n.readVarint()], r = t.layer.values[n.readVarint()];
			t.properties[e] = r;
		}
	} else e == 3 ? t.type = n.readVarint() : e == 4 && (t.geometry = n.pos);
}
function oC(e, t, n) {
	e.pos = t.features[n];
	let r = e.readVarint() + e.pos, i = {
		layer: t,
		type: 0,
		properties: {}
	};
	return e.readFields(aC, i, r), i;
}
function sC(e, t) {
	let n;
	return e === 1 ? n = t === 1 ? "Point" : "MultiPoint" : e === 2 ? n = t === 1 ? "LineString" : "MultiLineString" : e === 3 && (n = "Polygon"), n;
}
//#endregion
//#region node_modules/ol-mapbox-style/src/expressions.js
function cC(e, t) {
	let n = t[0].evaluate(e), r = t[1].evaluate(e), i = t[2].evaluate(e), a = t[3] ? t[3].evaluate(e) : 1;
	return Rv.parse(`hsla(${n}, ${r}%, ${i}%, ${a})`);
}
function lC(e) {
	let t = e[0] / 255, n = e[1] / 255, r = e[2] / 255, i = e[3], a = Math.max(t, n, r), o = Math.min(t, n, r), s = (a + o) / 2, c, l;
	if (a === o) c = 0, l = 0;
	else {
		let e = a - o;
		switch (l = s > .5 ? e / (2 - a - o) : e / (a + o), a) {
			case t:
				c = (n - r) / e + (n < r ? 6 : 0);
				break;
			case n:
				c = (r - t) / e + 2;
				break;
			case r:
				c = (t - n) / e + 4;
				break;
			default: c = 0;
		}
		c /= 6;
	}
	return [
		c * 360,
		l * 100,
		s * 100,
		i
	];
}
function uC(e) {
	if (Array.isArray(e)) {
		if (e.length === 0) return e;
		let t = e[0];
		if (t === "literal") return e;
		if (t === "image" && e.length === 3 && typeof e[2] == "object" && e[2] !== null && !Array.isArray(e[2])) return [
			"image-config",
			uC(e[1]),
			["literal", e[2]]
		];
		let n = e.length;
		for (let r = 1; r < n; ++r) {
			let i = e[r], a = uC(i);
			if (a !== i) {
				let i = [t];
				for (let t = 1; t < r; ++t) i.push(e[t]);
				i.push(a);
				for (let t = r + 1; t < n; ++t) i.push(uC(e[t]));
				return i;
			}
		}
	}
	return e;
}
var dC = {}, fC = {
	zoom: 0,
	distanceFromCenter: 0
};
dx.register(sx, {
	...dx.definitions,
	pitch: [
		{ kind: "number" },
		[],
		(e) => fC.pitch || 0
	],
	"distance-from-center": [
		{ kind: "number" },
		[],
		(e) => fC.distanceFromCenter || 0
	],
	"to-hsla": [
		{
			kind: "array",
			itemType: { kind: "number" },
			N: 4
		},
		[{ kind: "string" }],
		(e, [t]) => lC(vd(t.evaluate(e)))
	],
	hsl: [
		{ kind: "color" },
		[
			{ kind: "number" },
			{ kind: "number" },
			{ kind: "number" }
		],
		cC
	],
	hsla: [
		{ kind: "color" },
		[
			{ kind: "number" },
			{ kind: "number" },
			{ kind: "number" },
			{ kind: "number" }
		],
		cC
	],
	"image-config": [
		{ kind: "value" },
		[{ kind: "string" }, { kind: "value" }],
		(e, [t, n]) => t.evaluate(e)
	],
	"measure-light": [
		{ kind: "number" },
		[{ kind: "value" }],
		() => 1
	],
	config: [
		{ kind: "value" },
		[{ kind: "string" }],
		(e, [t]) => {
			let n = dC[t.evaluate(e)];
			return n === void 0 ? {} : n;
		}
	]
});
//#endregion
//#region node_modules/ol-mapbox-style/src/mapbox.js
var pC = "https://api.mapbox.com";
function mC(e) {
	return e.indexOf("mapbox://") === 0 ? e.slice(9) : "";
}
function hC(e, t, n) {
	if (typeof e == "string") return [{
		id: "default",
		url: gC(e, t, n)
	}];
	for (let r of e) r.url = gC(r.url, t, n);
	return e;
}
function gC(e, t, n) {
	let r = mC(e);
	if (!t || !r) return decodeURI(new URL(e, n).href);
	if (r.indexOf("sprites/") !== 0) throw Error(`unexpected sprites url: ${e}`);
	return `${pC}/styles/v1/${r.slice(8)}/sprite?access_token=${t}`;
}
function _C(e, t) {
	let n = mC(e);
	if (!n || !t) return decodeURI(new URL(e, location.href).href);
	if (n.indexOf("styles/") !== 0) throw Error(`unexpected style url: ${e}`);
	return `${pC}/styles/v1/${n.slice(7)}?&access_token=${t}`;
}
var vC = [
	"a",
	"b",
	"c",
	"d"
];
function yC(e, t, n, r) {
	let i = new URL(e, r || location.href), a = mC(e);
	return a ? a === "mapbox.satellite" ? [`https://api.mapbox.com/v4/${a}/{z}/{x}/{y}${window.devicePixelRatio >= 1.5 ? "@2x" : ""}.webp?access_token=${t}`] : vC.map((e) => `https://${e}.tiles.mapbox.com/v4/${a}/{z}/{x}/{y}.vector.pbf?access_token=${t}`) : (t && (i.searchParams.has(n) || i.searchParams.set(n, t)), [decodeURI(i.href)]);
}
//#endregion
//#region node_modules/ol-mapbox-style/src/stylespec.js
var bC = B_, xC = {
	thin: 100,
	hairline: 100,
	"ultra-light": 200,
	"extra-light": 200,
	light: 300,
	book: 300,
	regular: 400,
	normal: 400,
	plain: 400,
	roman: 400,
	standard: 400,
	medium: 500,
	"semi-bold": 600,
	"demi-bold": 600,
	bold: 700,
	"extra-bold": 800,
	"ultra-bold": 800,
	heavy: 900,
	black: 900,
	"heavy-black": 900,
	fat: 900,
	poster: 900,
	"ultra-black": 950,
	"extra-black": 950
}, CC = " ", wC = /(italic|oblique)$/i, TC = {};
function EC(e, t, n) {
	let r = TC[e];
	if (!r) {
		Array.isArray(e) || (e = [e]);
		let t = 400, n = "normal", i = [], a, o;
		for (let r = 0, s = e.length; r < s; ++r) {
			let s = e[r].split(" "), c = s[s.length - 1].toLowerCase();
			c == "normal" || c == "italic" || c == "oblique" ? (n = o ? n : c, o = !0, s.pop(), c = s[s.length - 1].toLowerCase()) : wC.test(c) && (c = c.replace(wC, ""), n = o ? n : s[s.length - 1].replace(c, ""), o = !0);
			for (let e in xC) {
				let n = s.length > 1 ? s[s.length - 2].toLowerCase() : "";
				if (c == e || c == e.replace("-", "") || n + "-" + c == e) {
					t = a ? t : xC[e], s.pop(), n && e.startsWith(n) && s.pop();
					break;
				}
			}
			!a && typeof c == "number" && (t = c, a = !0);
			let l = s.join(CC).replace("Klokantech Noto Sans", "Noto Sans").replace("DIN Pro", "Barlow").replace("Arial Unicode MS", "Arial");
			l.indexOf(CC) !== -1 && (l = "\"" + l + "\""), i.push(l);
		}
		r = [
			n,
			t,
			i
		], TC[e] = r;
	}
	return r[0] + CC + r[1] + CC + t + "px" + (n ? "/" + n : "") + CC + r[2];
}
//#endregion
//#region node_modules/ol-mapbox-style/src/util.js
var DC = Object.freeze({}), OC = {}, kC = {}, AC = 0;
function jC(e) {
	return e.id ||= AC++, e.id;
}
function MC(e, t) {
	return jC(e) + "." + z(t);
}
function NC(e) {
	let t = OC[e.id];
	return t || (t = {}, OC[jC(e)] = t), t;
}
function PC(e) {
	let t = kC[e.id];
	return t || (t = {}, kC[jC(e)] = t), t;
}
function FC(e) {
	return e * Math.PI / 180;
}
var IC = (function() {
	let e = [];
	for (let t = 78271.51696402048; e.length <= 24; t /= 2) e.push(t);
	return e;
})();
function LC(e, t) {
	if (typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope && typeof OffscreenCanvas < "u") return new OffscreenCanvas(e, t);
	let n = document.createElement("canvas");
	return n.width = e, n.height = t, n;
}
function RC(e, t) {
	let n = 0, r = t.length;
	for (; n < r; ++n) if (t[n] < e && n + 1 < r) {
		let r = t[n] / t[n + 1];
		return n + Math.log(t[n] / e) / Math.log(r);
	}
	return r - 1;
}
function zC(e, t) {
	let n = Math.floor(e), r = 2 ** (e - n);
	return t[n] / r;
}
var BC = {};
function VC(e, t, n = {}, r) {
	if (t in BC) return r && (r.url = BC[t][0].url), BC[t][1];
	let i = n.transformRequest && n.transformRequest(t, e) || t, a = function(e) {
		return delete BC[t], Promise.reject(/* @__PURE__ */ Error("Error fetching source " + t));
	}, o = function(e) {
		return delete BC[t], e.ok ? e.json() : Promise.reject(/* @__PURE__ */ Error("Error fetching source " + t));
	}, s = si(() => i).then((e) => e instanceof Response ? (r && (r.url = e.url), o(e)) : (e instanceof Request || (e = new Request(e)), e.headers.get("Accept") || e.headers.set("Accept", "application/json"), r && (r.url = e.url), fetch(e).then(o).catch(a))).catch(a);
	return BC[t] = [i, s], s;
}
function HC(e, t) {
	if (typeof e == "string") {
		if (e.trim().startsWith("{")) try {
			let t = JSON.parse(e);
			return Promise.resolve(t);
		} catch (e) {
			return Promise.reject(e);
		}
		return e = _C(e, t.accessToken), VC("Style", e, t);
	}
	return Promise.resolve(e);
}
var UC = {};
function WC(e, t, n = {}) {
	let r = [t, JSON.stringify(e)].toString(), i = UC[r];
	if (!i || n.transformRequest) {
		let a;
		n.transformRequest && (a = (e, t) => {
			let r = n.transformRequest && n.transformRequest(t, "Tiles") || t;
			if (e instanceof D_) e.setLoader((t, n, i) => {
				let a = function(n) {
					n.arrayBuffer().then((n) => {
						let r = e.getFormat().readFeatures(n, {
							extent: t,
							featureProjection: i
						});
						e.setFeatures(r);
					});
				};
				si(() => r).then((t) => {
					if (t instanceof Response) return a(t);
					fetch(t).then(a).catch((t) => e.setState(B.ERROR));
				}).catch((t) => e.setState(B.ERROR));
			});
			else {
				let t = e.getImage();
				si(() => r).then((n) => {
					if (typeof n == "string") {
						t.src = n;
						return;
					}
					let r = (e) => e.blob().then((e) => {
						let n = URL.createObjectURL(e);
						t.addEventListener("load", () => URL.revokeObjectURL(n)), t.addEventListener("error", () => URL.revokeObjectURL(n)), t.src = n;
					});
					if (n instanceof Response) return r(n);
					fetch(n).then(r).catch((t) => e.setState(B.ERROR));
				}).catch((t) => e.setState(B.ERROR));
			}
		});
		let o = e.url;
		if (o && !e.tiles) {
			let r = yC(o, n.accessToken, n.accessTokenParam || "access_token", t || location.href);
			if (o.startsWith("mapbox://")) i = Promise.resolve({
				tileJson: Object.assign({}, e, {
					url: void 0,
					tiles: r
				}),
				tileLoadFunction: a
			});
			else {
				let e = {};
				i = VC("Source", r[0], n, e).then(function(t) {
					return t.tiles = t.tiles.map(function(r) {
						return t.scheme === "tms" && (r = r.replace("{y}", "{-y}")), yC(r, n.accessToken, n.accessTokenParam || "access_token", e.url)[0];
					}), Promise.resolve({
						tileJson: t,
						tileLoadFunction: a
					});
				});
			}
		} else e.tiles ? (e = Object.assign({}, e, { tiles: e.tiles.map(function(r) {
			return e.scheme === "tms" && (r = r.replace("{y}", "{-y}")), yC(r, n.accessToken, n.accessTokenParam || "access_token", t || location.href)[0];
		}) }), i = Promise.resolve({
			tileJson: Object.assign({}, e),
			tileLoadFunction: a
		})) : i = Promise.reject(/* @__PURE__ */ Error("source has no `tiles` nor `url`"));
		UC[r] = i;
	}
	return i;
}
function GC(e, t, n, r) {
	let i = [2 * n * t.pixelRatio + t.width, 2 * n * t.pixelRatio + t.height], a = LC(i[0], i[1]), o = a.getContext("2d");
	o.drawImage(e, t.x, t.y, t.width, t.height, n * t.pixelRatio, n * t.pixelRatio, t.width, t.height);
	let s = o.getImageData(0, 0, i[0], i[1]);
	o.globalCompositeOperation = "destination-over", o.fillStyle = `rgba(${r.r * 255},${r.g * 255},${r.b * 255},${r.a})`;
	let c = s.data;
	for (let e = 0, r = s.width; e < r; ++e) for (let i = 0, a = s.height; i < a; ++i) c[(i * r + e) * 4 + 3] > 0 && o.arc(e, i, n * t.pixelRatio, 0, 2 * Math.PI);
	return o.fill(), a;
}
function KC(e, t, n) {
	let r = Math.max(0, Math.min(1, (n - e) / (t - e)));
	return r * r * (3 - 2 * r);
}
function qC(e, t, n) {
	let r = LC(t.width, t.height), i = r.getContext("2d");
	i.drawImage(e, t.x, t.y, t.width, t.height, 0, 0, t.width, t.height);
	let a = i.getImageData(0, 0, t.width, t.height), o = a.data;
	for (let e = 0, t = a.width; e < t; ++e) for (let r = 0, i = a.height; r < i; ++r) {
		let i = (r * t + e) * 4, a = KC(.65, .85, o[i + 3] / 255);
		a > 0 ? (o[i + 0] = Math.round(255 * n.r * a), o[i + 1] = Math.round(255 * n.g * a), o[i + 2] = Math.round(255 * n.b * a), o[i + 3] = Math.round(255 * a)) : o[i + 3] = 0;
	}
	return i.putImageData(a, 0, 0), r;
}
//#endregion
//#region node_modules/ol-mapbox-style/src/text.js
var JC = Array(256).join(" ");
function YC(e, t) {
	if (t >= .05) {
		let n = "", r = e.split("\n"), i = JC.slice(0, Math.round(t / .1));
		for (let e = 0, t = r.length; e < t; ++e) e > 0 && (n += "\n"), n += r[e].split("").join(i);
		return n;
	}
	return e;
}
var XC;
function ZC() {
	return XC ||= LC(1, 1).getContext("2d"), XC;
}
function QC(e, t) {
	if (/\d+ \d+/.test(e)) {
		let [n, r] = e.split(" ").map(Number);
		return n <= t && t <= r;
	}
	return e == t;
}
function $C(e, t) {
	return ZC().measureText(e).width + (e.length - 1) * t;
}
var ew = {};
Uf.on("propertychange", () => {
	for (let e in ew) delete ew[e];
});
function tw(e, t, n, r) {
	if (e.indexOf("\n") !== -1) {
		let i = e.split("\n"), a = [];
		for (let e = 0, o = i.length; e < o; ++e) a.push(tw(i[e], t, n, r));
		return a.join("\n");
	}
	let i = n + "," + t + "," + e + "," + r, a = ew[i];
	if (!a) {
		let o = e.split(" ");
		if (o.length > 1) {
			let e = ZC();
			e.font = t;
			let i = e.measureText("M").width * n, s = "", c = [];
			for (let e = 0, t = o.length; e < t; ++e) {
				let t = o[e], n = s + (s ? " " : "") + t;
				$C(n, r) <= i ? s = n : (s && c.push(s), s = t);
			}
			s && c.push(s);
			for (let e = 0, t = c.length; e < t && t > 1; ++e) {
				let n = c[e];
				if ($C(n, r) < i * .35) {
					let i = e > 0 ? $C(c[e - 1], r) : Infinity, a = e < t - 1 ? $C(c[e + 1], r) : Infinity;
					c.splice(e, 1), --t, i < a ? (c[e - 1] += " " + n, --e) : c[e] = n + " " + c[e];
				}
			}
			for (let e = 0, t = c.length - 1; e < t; ++e) {
				let n = c[e], a = c[e + 1];
				if ($C(n, r) > i * .7 && $C(a, r) < i * .6) {
					let o = n.split(" "), s = o.pop();
					$C(s, r) < i * .2 && (c[e] = o.join(" "), c[e + 1] = s + " " + a), --t;
				}
			}
			a = c.join("\n");
		} else a = e;
		a = YC(a, r), ew[i] = a;
	}
	return a;
}
var nw = [
	"Arial",
	"Courier New",
	"Times New Roman",
	"Verdana",
	"sans-serif",
	"serif",
	"monospace",
	"cursive",
	"fantasy"
], rw = {};
function iw(e, t = "https://cdn.jsdelivr.net/npm/@fontsource/{font-family}/{fontweight}{-fontstyle}.css") {
	if (Ti) return e;
	let n;
	for (let t = 0, r = e.length; t < r; ++t) {
		let r = e[t];
		if (r in rw) continue;
		rw[r] = !0;
		let i = EC(r, 16).split(" ");
		n ||= [], n.push([
			i.slice(3).join(" ").replace(/"/g, ""),
			i[1],
			i[0]
		]);
	}
	return n && (async () => {
		await document.fonts.ready;
		for (let e = 0, r = n.length; e < r; ++e) {
			let r = n[e], i = r[0];
			if (nw.includes(i)) continue;
			let a = r[1], o = r[2];
			if (!(await document.fonts.load(`${o} ${a} 16px "${i}"`)).some((e) => e.family.replace(/^['"]|['"]$/g, "").toLowerCase() === i.toLowerCase() && QC(e.weight, a) && e.style === o)) {
				let e = t.replace("{font-family}", i.replace(/ /g, "-").toLowerCase()).replace("{Font+Family}", i.replace(/ /g, "+")).replace("{fontweight}", a).replace("{-fontstyle}", o.replace("normal", "").replace(/(.+)/, "-$1")).replace("{fontstyle}", o);
				if (!document.querySelector("link[href=\"" + e + "\"]")) {
					let t = document.createElement("link");
					t.href = e, t.rel = "stylesheet", document.head.appendChild(t);
				}
			}
		}
	})(), e;
}
//#endregion
//#region node_modules/ol-mapbox-style/src/stylefunction.js
var aw = {
	Point: 1,
	MultiPoint: 1,
	LineString: 2,
	MultiLineString: 2,
	Polygon: 3,
	MultiPolygon: 3
}, ow = {
	center: [.5, .5],
	left: [0, .5],
	right: [1, .5],
	top: [.5, 0],
	bottom: [.5, 1],
	"top-left": [0, 0],
	"top-right": [1, 0],
	"bottom-left": [0, 1],
	"bottom-right": [1, 1]
}, sw = function(e, t, n) {
	let r = Fx(e, t, n);
	if (r.result === "error") {
		let i = uC(e);
		i !== e && (r = Fx(i, t, n));
	}
	if (r.result === "error") {
		let t = r.value[0];
		return console.error("Error parsing expression:", e, t.key, t.message), { evaluate: () => n.default };
	}
	return r.value;
}, cw, lw;
function $(e, t, n, r, i, a) {
	let o = e.id;
	i || (i = {}, console.warn("No functionCache provided to getValue()")), i[o] || (i[o] = {});
	let s = i[o];
	if (!s[n]) {
		let r = (e[t] || DC)[n], i = `layers[${o}].${t}.${n}`, a = bC, c = a[`${t}_${e.type}`] && a[`${t}_${e.type}`][n];
		r === void 0 && c && (r = c.default);
		let l = jx(r);
		if (!l && Tx(r) && (r = sS(r, c), l = !0), l) {
			let e = sw(r, i, c);
			s[n] = e.evaluate.bind(e);
		} else {
			let e = c ? c.type : typeof r;
			(e === "color" || e === "colorArray") && (r = Rv.parse(r));
			let t = !1;
			if (e === "array") for (let e = 0; e < r.length; ++e) {
				let n = r[e];
				if (jx(n) || Tx(n)) {
					t = !0;
					break;
				}
			}
			if (t) {
				let e = Object.assign({}, c, { type: c.value }), t = [];
				for (let n = 0; n < r.length; ++n) {
					let a = r[n];
					if (!jx(a) && Tx(a) && (a = sS(a, e)), jx(a)) {
						let r = sw(a, `${i}[${n}]`, e);
						t.push(r.evaluate.bind(r));
					} else t.push(function() {
						return a;
					});
				}
				s[n] = function(e, n, r) {
					let i = [];
					for (let a = 0; a < t.length; ++a) i[a] = t[a](e, n, r);
					return i;
				};
			} else s[n] = function() {
				return r;
			};
		}
	}
	return s[n](fC, r, a);
}
function uw(e, t, n, r) {
	return $(e, "layout", `${n}-allow-overlap`, t, r) ? $(e, "layout", `${n}-ignore-placement`, t, r) ? "none" : "obstacle" : "declutter";
}
function dw(e, t, n, r) {
	if (r || console.warn("No filterCache provided to evaluateFilter()"), !(e in r)) try {
		r[e] = Zx(t, `layers[${e}].filter`).filter;
	} catch (t) {
		console.warn("Filter will evaluate to false: " + t.message), r[e] = function() {
			return !1;
		};
	}
	return r[e](fC, n);
}
function fw(e, t) {
	if (e) {
		if (e.a === 0 || t === 0) return;
		let n = e.a;
		return t = t === void 0 ? 1 : t, n === 0 ? "transparent" : "rgba(" + Math.round(e.r * 255 / n) + "," + Math.round(e.g * 255 / n) + "," + Math.round(e.b * 255 / n) + "," + n * t + ")";
	}
	return e;
}
var pw = /\{[^{}}]*\}/g;
function mw(e, t) {
	return e.replace(pw, function(e) {
		return t[e.slice(1, -1)] || "";
	});
}
function hw(e, t) {
	let n = e.split(":")[0];
	return n === e && (n = "default"), t[n];
}
var gw = {};
function _w(e, t, n, r = IC, i = void 0, a = void 0, o = void 0, s = void 0) {
	if (typeof t == "string" && (t = JSON.parse(t)), t.schema) for (let e in t.schema) {
		let n = t.schema[e];
		"default" in n && (dC[e] = n.default);
	}
	if (t.version != 8) throw Error("glStyle version 8 required.");
	gw[MC(t, e)] = Array.from(arguments);
	let c = {};
	(typeof a == "string" || a instanceof Request || a instanceof Response || a instanceof Promise) && (a = { default: a });
	for (let t in a) {
		let n = a[t];
		si(() => n).then(async (n) => {
			let r;
			if (typeof Image < "u") {
				let i = new Image();
				if (typeof n == "string") i.crossOrigin = "anonymous", i.src = n;
				else {
					let e;
					n instanceof Request ? e = await fetch(n) : n instanceof Response && (e = n);
					let t = await e.blob();
					r = URL.createObjectURL(t), i.src = r;
				}
				i.addEventListener("load", function n() {
					i.removeEventListener("load", n), c[t] = {
						image: i,
						size: [i.width, i.height]
					}, e.changed(), r && URL.revokeObjectURL(r);
				}), i.addEventListener("error", function e() {
					URL.revokeObjectURL(r), i.removeEventListener("error", e);
				});
			} else if (typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope) {
				let e = self;
				e.postMessage({
					action: "loadImage",
					src: n
				}), e.addEventListener("message", function(e) {
					e.data.action === "imageLoaded" && e.data.src === n && (c[t] = {
						image: e.data.image,
						size: [e.data.image.width, e.data.image.height]
					});
				});
			}
		});
	}
	let l = U_(t.layers), u = {}, d = [], f = {}, p = {}, m = NC(t), h = PC(t), g;
	for (let e = 0, r = l.length; e < r; ++e) {
		let r = l[e], i = r.id;
		if (typeof n == "string" && r.source == n || Array.isArray(n) && n.indexOf(i) !== -1) {
			let n = r["source-layer"];
			if (!g) {
				g = r.source;
				let e = t.sources[g];
				if (!e) throw Error(`Source "${g}" is not defined`);
				let n = e.type;
				if (n !== "vector" && n !== "geojson") throw Error(`Source "${g}" is not of type "vector" or "geojson", but "${n}"`);
			} else if (r.source !== g) throw Error(`Layer "${i}" does not use source "${g}`);
			let a = u[n];
			a || (a = [], u[n] = a), a.push({
				layer: r,
				index: e
			}), d.push(i);
		}
	}
	let _ = [], v = function(n, a, l) {
		let d = e.getSource?.()?.format_?.layerName_ ?? "mvt:layer", g = n.getProperties(), v = u[g[d]];
		if (!v) return;
		let y = r.indexOf(a);
		y == -1 && (y = RC(a, r)), fC.zoom = y, fC.distanceFromCenter = 0;
		let b = n.getGeometry(), x = aw[b.getType()], S = e.get("map");
		if (S && S instanceof cm && x === 1) {
			let e = S.getSize();
			e && (fC.distanceFromCenter = Ga(S.getView().getCenter(), Sa(b.getExtent())) / a / e[1]);
		}
		let C = {
			id: n.getId(),
			properties: g,
			type: x
		}, w = e.get("mapbox-featurestate")[n.getId()], T = -1;
		for (let r = 0, u = v.length; r < u; ++r) {
			let u = v[r], d = u.layer, b = d.id;
			if (l !== void 0 && l !== b) continue;
			let S = d.layout || DC, E = d.paint || DC;
			if ($(d, "layout", "visibility", C, m, w) === "none" || "minzoom" in d && y < d.minzoom || "maxzoom" in d && y >= d.maxzoom) continue;
			let ee = d.filter;
			if (!ee || dw(b, ee, C, h)) {
				let r, l, h, v, y, b, ee = u.index;
				if (x == 3 && (d.type == "fill" || d.type == "fill-extrusion")) {
					if (l = $(d, "paint", `${d.type}-opacity`, C, m, w), d.type + "-pattern" in E) {
						let e = $(d, "paint", `${d.type}-pattern`, C, m, w);
						if (e) {
							let t = typeof e == "string" ? mw(e, g) : e.toString(), n = hw(t, c);
							if (i && i[t] && n) {
								++T, b = _[T], (!b || !b.getFill() || b.getStroke() || b.getText()) && (b = new up({ fill: new op() }), _[T] = b), h = b.getFill(), b.setZIndex(ee);
								let e = t + "." + l, r = p[e];
								if (!r) {
									let a = i[t], o = LC(a.width, a.height), s = o.getContext("2d");
									s.globalAlpha = l, s.drawImage(n.image, a.x, a.y, a.width, a.height, 0, 0, a.width, a.height), r = s.createPattern(o, "repeat"), p[e] = r;
								}
								h.setColor(r);
							}
						}
					} else if (r = fw($(d, "paint", `${d.type}-color`, C, m, w), l), d.type + "-outline-color" in E && (y = fw($(d, "paint", `${d.type}-outline-color`, C, m, w), l)), y ||= r, r || y) {
						if (++T, b = _[T], (!b || r && !b.getFill() || !r && b.getFill() || y && !b.getStroke() || !y && b.getStroke() || b.getText()) && (b = new up({
							fill: r ? new op() : void 0,
							stroke: y ? new lp() : void 0
						}), _[T] = b), r && (h = b.getFill(), h.setColor(r)), d.type === "fill-extrusion") {
							let e = $(d, "paint", "fill-extrusion-height", C, m, w);
							if (e > 0) {
								let t = Math.max(.1, .9 - Math.min(e, 225) / 280);
								if (y && y !== "transparent") {
									let e = Rv.parse(y);
									y = `rgba(${Math.round(e.r * 255 * t)},${Math.round(e.g * 255 * t)},${Math.round(e.b * 255 * t)},${e.a})`;
								}
							}
						}
						y && (v = b.getStroke(), v.setColor(y), v.setWidth(.5)), b.setZIndex(ee);
					}
				}
				if (x != 1 && d.type == "line") {
					r = "line-pattern" in E ? void 0 : fw($(d, "paint", "line-color", C, m, w), $(d, "paint", "line-opacity", C, m, w));
					let e = $(d, "paint", "line-width", C, m, w);
					r && e > 0 && (++T, b = _[T], (!b || !b.getStroke() || b.getFill() || b.getText()) && (b = new up({ stroke: new lp() }), _[T] = b), v = b.getStroke(), v.setLineCap($(d, "layout", "line-cap", C, m, w)), v.setLineJoin($(d, "layout", "line-join", C, m, w)), v.setMiterLimit($(d, "layout", "line-miter-limit", C, m, w)), v.setColor(r), v.setWidth(e), v.setLineDash(E["line-dasharray"] ? $(d, "paint", "line-dasharray", C, m, w).map(function(t) {
						return t * e;
					}) : null), typeof v.setOffset == "function" && v.setOffset($(d, "paint", "line-offset", C, m, w)), b.setZIndex(ee));
				}
				let D = !1, O = null, te = 0, ne, k, re;
				if ((x == 1 || x == 2) && "icon-image" in S) {
					let t = $(d, "layout", "icon-image", C, m, w);
					if (t) {
						ne = typeof t == "string" ? mw(t, g) : t.toString();
						let r, o = s ? s(e, ne) : void 0, l = hw(ne, c);
						if (i && i[ne] && l || o) {
							let e = $(d, "layout", "symbol-placement", C, m, w), t = $(d, "layout", "icon-rotation-alignment", C, m, w), s = t === "auto" ? e !== "point" : t === "map";
							if (x == 2) {
								let t = n.getGeometry();
								if (t.getFlatMidpoint || t.getFlatMidpoints) {
									let n = t.getExtent();
									if (Math.sqrt(Math.max(((n[2] - n[0]) / a) ** 2, ((n[3] - n[1]) / a) ** 2)) > 150) {
										let n = t.getType() === "MultiLineString" ? t.getFlatMidpoints() : t.getFlatMidpoint();
										if (lw ||= (cw = [NaN, NaN], new Jm("Point", cw, [], 2, {}, void 0)), r = lw, cw[0] = n[0], cw[1] = n[1], e === "line" && s) {
											let e = t.getStride(), r = t.getFlatCoordinates();
											for (let t = 0, i = r.length - e; t < i; t += e) {
												let i = r[t], a = r[t + 1], o = r[t + e], s = r[t + e + 1], c = Math.min(i, o), l = Math.max(i, o), u = n[0], d = n[1], f = (s - a) * (u - i) - (o - i) * (d - a);
												if (Math.abs(f) < .001 && u <= l && u >= c) {
													te = Math.atan2(a - s, o - i);
													break;
												}
											}
										}
									}
								}
							}
							if (x !== 2 || r) {
								let e = $(d, "layout", "icon-size", C, m, w), t = E["icon-color"] === void 0 ? null : $(d, "paint", "icon-color", C, m, w);
								if (!t || t.a !== 0) {
									let n = $(d, "paint", "icon-halo-color", C, m, w), r = $(d, "paint", "icon-halo-width", C, m, w), a = uw(d, C, "icon", m), c = `${ne}.${e}.${r}.${n}.${s}.${a}`;
									if (t !== null && (c += `.${t}`), k = f[c], !k) {
										let u;
										"icon-offset" in S && (u = $(d, "layout", "icon-offset", C, m, w).slice(0), u[0] *= e, u[1] *= -e);
										let p = t ? [
											t.r * 255,
											t.g * 255,
											t.b * 255,
											t.a
										] : void 0;
										if (o) {
											let t = {
												color: p,
												rotateWithView: s,
												displacement: u,
												declutterMode: a,
												scale: e
											};
											typeof o == "string" ? t.src = o : (t.img = o, t.imgSize = [o.width, o.height]), k = new cp(t);
										} else {
											let o = i[ne], c, d, f;
											r ? o.sdf ? (c = GC(qC(l.image, o, t || [
												0,
												0,
												0,
												1
											]), {
												x: 0,
												y: 0,
												width: o.width,
												height: o.height,
												pixelRatio: o.pixelRatio
											}, r, n), p = void 0) : c = GC(l.image, o, r, n) : (o.sdf && (l.unSDFed ||= (l.image = qC(l.image, {
												x: 0,
												y: 0,
												width: l.size[0],
												height: l.size[1]
											}, {
												r: 1,
												g: 1,
												b: 1,
												a: 1
											}), !0)), c = l.image, d = [o.width, o.height], f = [o.x, o.y]), k = new cp({
												color: p,
												img: c,
												imgSize: l.size,
												size: d,
												offset: f,
												rotateWithView: s,
												scale: e / o.pixelRatio,
												displacement: u,
												declutterMode: a
											});
										}
										f[c] = k;
									}
								}
								k && (++T, b = _[T], (!b || !b.getImage() || b.getFill() || b.getStroke()) && (b = new up(), _[T] = b), b.setGeometry(r), k.setRotation(te + FC($(d, "layout", "icon-rotate", C, m, w))), k.setOpacity($(d, "paint", "icon-opacity", C, m, w)), k.setAnchor(ow[$(d, "layout", "icon-anchor", C, m, w)]), b.setImage(k), O = b.getText(), b.setText(void 0), b.setZIndex(ee), D = !0, re = !1);
							} else re = !0;
						}
					}
				}
				if (x == 1 && d.type === "circle") {
					++T, b = _[T], (!b || !b.getImage() || b.getFill() || b.getStroke()) && (b = new up(), _[T] = b);
					let e = "circle-radius" in E ? $(d, "paint", "circle-radius", C, m, w) : 5, t = fw($(d, "paint", "circle-stroke-color", C, m, w), $(d, "paint", "circle-stroke-opacity", C, m, w)), n = $(d, "paint", "circle-translate", C, m, w), r = fw($(d, "paint", "circle-color", C, m, w), $(d, "paint", "circle-opacity", C, m, w)), i = $(d, "paint", "circle-stroke-width", C, m, w), a = e + "." + t + "." + r + "." + i + "." + n[0] + "." + n[1];
					k = f[a], k || (k = new ap({
						radius: e,
						displacement: [n[0], -n[1]],
						stroke: t && i > 0 ? new lp({
							width: i,
							color: t
						}) : void 0,
						fill: r ? new op({ color: r }) : void 0,
						declutterMode: "none"
					}), f[a] = k), b.setImage(k), O = b.getText(), b.setText(void 0), b.setGeometry(void 0), b.setZIndex(ee), D = !0;
				}
				let ie, ae, oe, se, ce, le;
				if ("text-field" in S) {
					se = Math.round($(d, "layout", "text-size", C, m, w));
					let e = $(d, "layout", "text-font", C, m, w);
					oe = $(d, "layout", "text-line-height", C, m, w), ae = EC(o ? o(e, t.metadata ? t.metadata["ol:webfonts"] : void 0) : e, se, oe), ae.includes("sans-serif") || (ae += ",sans-serif"), ce = $(d, "layout", "text-letter-spacing", C, m, w), le = $(d, "layout", "text-max-width", C, m, w);
					let n = $(d, "layout", "text-field", C, m, w);
					ie = typeof n == "object" && n.sections ? n.sections.length === 1 ? n.toString() : n.sections.reduce((t, n, r) => {
						let i = n.fontStack ? n.fontStack.split(",") : e, a = EC(o ? o(i) : i, se * (n.scale || 1), oe), s = n.text;
						if (s === "\n") return t.push("\n", ""), t;
						if (x == 2) return t.push(YC(s, ce), a), t;
						s = tw(s, a, le, ce).split("\n");
						for (let e = 0, n = s.length; e < n; ++e) e > 0 && t.push("\n", ""), t.push(s[e], a);
						return t;
					}, []) : mw(n, g).trim(), l = $(d, "paint", "text-opacity", C, m, w);
				}
				if (ie && l && !re) {
					D || (++T, b = _[T], (!b || !b.getText() || b.getFill() || b.getStroke()) && (b = new up(), _[T] = b), b.setImage(void 0), b.setGeometry(void 0));
					let e = uw(d, C, "text", m);
					b.getText() || b.setText(O), O = b.getText(), (!O || "getDeclutterMode" in O && O.getDeclutterMode() !== e) && (O = new gp({
						padding: [
							2,
							2,
							2,
							2
						],
						declutterMode: e
					}), b.setText(O));
					let t = $(d, "layout", "text-transform", C, m, w);
					t == "uppercase" ? ie = Array.isArray(ie) ? ie.map((e, t) => t % 2 ? e : e.toUpperCase()) : ie.toUpperCase() : t == "lowercase" && (ie = Array.isArray(ie) ? ie.map((e, t) => t % 2 ? e : e.toLowerCase()) : ie.toLowerCase());
					let n = Array.isArray(ie) ? ie : x == 2 ? YC(ie, ce) : tw(ie, ae, le, ce);
					if (O.setText(n), O.setFont(ae), O.setRotation(FC($(d, "layout", "text-rotate", C, m, w))), typeof O.setKeepUpright == "function") {
						let e = $(d, "layout", "text-keep-upright", C, m, w);
						O.setKeepUpright(e);
					}
					let r = $(d, "layout", "text-anchor", C, m, w), i = D || x == 1 ? "point" : $(d, "layout", "symbol-placement", C, m, w), a;
					if (i === "line-center" ? (O.setPlacement("line"), a = "center") : O.setPlacement(i), i === "line" && typeof O.setRepeat == "function") {
						let e = $(d, "layout", "symbol-spacing", C, m, w);
						O.setRepeat(e * 2);
					}
					O.setOverflow(i === "point");
					let o = $(d, "paint", "text-halo-width", C, m, w), s = $(d, "layout", "text-offset", C, m, w), c = $(d, "paint", "text-translate", C, m, w), u = 0, f = 0;
					if (i == "point") {
						a = "center", r.indexOf("left") === -1 ? r.indexOf("right") !== -1 && (a = "right", f = -o) : (a = "left", f = o);
						let e = $(d, "layout", "text-rotation-alignment", C, m, w);
						O.setRotateWithView(e == "map");
					} else O.setMaxAngle(FC($(d, "layout", "text-max-angle", C, m, w)) * ie.length / n.length), O.setRotateWithView(!1);
					O.setTextAlign(a);
					let p = "middle";
					r.indexOf("bottom") == 0 ? (p = "bottom", u = -o - .5 * (oe - 1) * se) : r.indexOf("top") == 0 && (p = "top", u = o + .5 * (oe - 1) * se), O.setTextBaseline(p);
					let h = $(d, "layout", "text-justify", C, m, w);
					O.setJustify(h === "auto" ? void 0 : h), O.setOffsetX(s[0] * se + f + c[0]), O.setOffsetY(s[1] * se + u + c[1]);
					let g = O.getFill() || new op();
					g.setColor(fw($(d, "paint", "text-color", C, m, w), l)), O.setFill(g);
					let v = fw($(d, "paint", "text-halo-color", C, m, w), l);
					if (v && o > 0) {
						let e = O.getStroke() || new lp();
						e.setColor(v), o *= 2;
						let t = .5 * se;
						e.setWidth(o <= t ? o : t), O.setStroke(e);
					} else O.setStroke(void 0);
					let y = $(d, "layout", "text-padding", C, m, w), S = O.getPadding();
					y !== S[0] && (S[0] = y, S[1] = y, S[2] = y, S[3] = y), b.setZIndex(ee);
				}
			}
		}
		if (T > -1) return _.length = T + 1, _;
	};
	return e.setStyle(v), e.set("mapbox-layers", d), e.set("mapbox-source", g), e.set("mapbox-featurestate", e.get("mapbox-featurestate") || {}), v;
}
Rv.parse("#000000"), Rv.parse("#FFFFFF"), Rv.parse("#000000");
//#endregion
//#region node_modules/ol-mapbox-style/src/apply.js
function vw(e, t = 512) {
	return e.getExtent() ? Zg({
		extent: e.getExtent(),
		tileSize: t,
		maxZoom: 22
	}).getResolutions() : IC;
}
function yw(e, t) {
	return t.accessToken || (t = Object.assign({}, t), new URL(e).searchParams.forEach((e, n) => {
		t.accessToken = e, t.accessTokenParam = n;
	})), t;
}
function bw(e, t, n = "", r = {}, i = void 0) {
	let a, o, s, c, l = !0;
	return typeof n != "string" && !Array.isArray(n) ? (s = n, c = s.source || s.layers, r = s) : c = n, typeof r == "string" ? (a = r, s = {}) : (a = r.styleUrl, s = r), s.updateSource === !1 && (l = !1), i ||= s.resolutions, !a && typeof t == "string" && !t.trim().startsWith("{") && (a = t), a && (a = a.startsWith("data:") ? location.href : _C(a, s.accessToken), s = yw(a, s)), new Promise(function(n, r) {
		HC(t, s).then(function(t) {
			if (t.version != 8) return r(/* @__PURE__ */ Error("glStyle version 8 required."));
			if (!(e instanceof Qh || e instanceof Rg)) return r(/* @__PURE__ */ Error("Can only apply to VectorLayer or VectorTileLayer"));
			let u = e instanceof Rg ? "vector" : "geojson";
			if (c ? o = Array.isArray(c) ? t.layers.find(function(e) {
				return e.id === c[0];
			}).source : c : (o = t.layers.find(function(e) {
				return e.source && t.sources[e.source].type === u;
			}).source, c = o), !o) return r(/* @__PURE__ */ Error(`No ${u} source found in the glStyle.`));
			function d() {
				if (!l) return Promise.resolve();
				if (e instanceof Rg) return Cw(t.sources[o], a, s).then(function(t) {
					let n = e.getSource();
					n ? t !== n && (n.setTileUrlFunction(t.getTileUrlFunction()), typeof n.setUrls == "function" && typeof t.getUrls == "function" && n.setUrls(t.getUrls()), n.format_ ||= t.format_, n.getAttributions() || n.setAttributions(t.getAttributions()), n.getTileLoadFunction() === k_ && n.setTileLoadFunction(t.getTileLoadFunction()), ys(n.getProjection(), t.getProjection()) && (n.tileGrid = t.getTileGrid())) : e.setSource(t);
					let r = e.getSource().getTileGrid();
					!isFinite(e.getMaxResolution()) && !isFinite(e.getMinZoom()) && r.getMinZoom() > 0 && e.setMaxResolution(zC(Math.max(0, r.getMinZoom() - 1e-12), r.getResolutions()));
				});
				let n = t.sources[o], r = e.getSource();
				(!r || r.get("mapbox-source") !== n) && (r = Tw(n, a, s));
				let i = e.getSource();
				return i ? r !== i && (i.getAttributions() || i.setAttributions(r.getAttributions()), i.format_ ||= r.getFormat(), i.url_ = r.getUrl()) : e.setSource(r), Promise.resolve();
			}
			let f, p, m = {}, h = {};
			function g() {
				if (!p && (!t.sprite || m)) {
					if (s.projection && !i) {
						let e = ds(s.projection).getUnits();
						e !== "m" && (i = IC.map((t) => t / ro[e]));
					}
					let a, l = e.getSource();
					l instanceof O_ && l.format_ instanceof nC && (a = l.format_.layerName_), p = _w(e, t, c, i, m, h, (e, t = s.webfonts) => iw(e, t), s.getImage, a), e.getStyle() ? d().then(n).catch(r) : r(/* @__PURE__ */ Error(`Nothing to show for source [${o}]`));
				} else p ? (e.setStyle(p), d().then(n).catch(r)) : r(/* @__PURE__ */ Error("Something went wrong trying to apply style."));
			}
			if (t.sprite) {
				let e = hC(t.sprite, s.accessToken, a || location.href);
				f = Ti ? 1 : window.devicePixelRatio >= 1.5 ? .5 : 1;
				let n = f == .5 ? "@2x" : "";
				Promise.all(e.map(function(e) {
					let t = new URL(e.url), i = t.origin + t.pathname + n + ".json" + t.search;
					return new Promise(function(e, n) {
						VC("Sprite", i, s).then(e).catch(function(r) {
							i = t.origin + t.pathname + ".json" + t.search, VC("Sprite", i, s).then(e).catch(n);
						});
					}).then(function(i) {
						i === void 0 && r(/* @__PURE__ */ Error("No sprites found."));
						let a;
						if (a = t.origin + t.pathname + n + ".png" + t.search, s.transformRequest) {
							let e = s.transformRequest(a, "SpriteImage") || a;
							(e instanceof Request || e instanceof Promise) && (a = e);
						}
						h[e.id] = a;
						for (let t in i) {
							let n = e.id == "default" ? t : `${e.id}:${t}`;
							m[n] = i[t];
						}
					}).catch(function(e) {
						r(/* @__PURE__ */ Error(`Sprites cannot be loaded: ${i}: ${e.message}`));
					});
				})).then(g).catch(r);
			} else g();
		}).catch(r);
	});
}
function xw(e, t) {
	let n = e.bounds;
	if (n) {
		let e = _s([n[0], n[1]], t), r = _s([n[2], n[3]], t);
		return [
			e[0],
			e[1],
			r[0],
			r[1]
		];
	}
	return ds(t).getExtent();
}
function Sw(e, t, n) {
	let r = new M_({
		tileJSON: t,
		tileSize: e.tileSize || t.tileSize || 512
	}), i = r.getTileJSON(), a = r.getTileGrid(), o = ds(n.projection || "EPSG:3857"), s = xw(i, o), c = o.getExtent(), l = i.minzoom || 0, u = i.maxzoom || 22, d = {
		attributions: r.getAttributions(),
		projection: o,
		tileGrid: new qg({
			origin: c ? ka(c) : a.getOrigin(0),
			extent: s || a.getExtent(),
			minZoom: l,
			resolutions: vw(o, t.tileSize).slice(0, u + 1),
			tileSize: a.getTileSize(0)
		})
	};
	return Array.isArray(i.tiles) ? d.urls = i.tiles : d.url = i.tiles, d;
}
function Cw(e, t, n) {
	return new Promise(function(r, i) {
		WC(e, t, n).then(function({ tileJson: t, tileLoadFunction: i }) {
			let a = Sw(e, t, n);
			a.tileLoadFunction = i, a.format = new nC({ layerName: "mvt:layer" });
			let o = new O_(a);
			o.set("mapbox-source", e), r(o);
		}).catch(i);
	});
}
function ww(e) {
	return `{bbox-${(e ? e.getCode() : "EPSG:3857").toLowerCase().replace(/[^a-z0-9]/g, "-")}}`;
}
function Tw(e, t, n) {
	let r = n.projection ? new DS({ dataProjection: n.projection }) : new DS(), i = e.data, a = {};
	if (typeof i == "string") {
		let [a] = yC(i, n.accessToken, n.accessTokenParam || "access_token", t || location.href);
		if (/\{bbox-[0-9a-z-]+\}/.test(a)) {
			let t = (e, t, n) => {
				let r = ww(n);
				return a.replace(r, `${e.join(",")}`);
			}, i = new eh({
				attributions: e.attribution,
				format: r,
				loader: (e, r, a, o, s) => {
					VC("GeoJSON", typeof t == "function" ? t(e, r, a) : t, n).then((e) => {
						let t = i.getFormat().readFeatures(e, { featureProjection: a });
						i.addFeatures(t), o(t);
					}).catch((t) => {
						i.removeLoadedExtent(e), s();
					});
				},
				strategy: Hm
			});
			return i.set("mapbox-source", e), i;
		}
		let o = new eh({
			attributions: e.attribution,
			format: r,
			url: a,
			loader: (e, t, r, i, s) => {
				VC("GeoJSON", a, n).then((e) => {
					let t = o.getFormat().readFeatures(e, { featureProjection: r });
					o.addFeatures(t), i(t);
				}).catch((t) => {
					o.removeLoadedExtent(e), s();
				});
			}
		});
		return o;
	}
	a.features = r.readFeatures(i, { featureProjection: Es() || "EPSG:3857" });
	let o = new eh(Object.assign({
		attributions: e.attribution,
		format: r
	}, a));
	return o.set("mapbox-source", e), o;
}
//#endregion
//#region src/map/Map.ts
var Ew = class {
	constructor(e, t, r) {
		if (this._el = {
			container: {},
			map: {},
			map_mask: {}
		}, typeof e == "object") this._el.container = e;
		else {
			let t = P.get(e);
			if (!t) throw Error("StoryMapJS: no element with id " + e);
			this._el.container = t;
		}
		this._loaded = {
			data: !1,
			map: !1
		}, this._map = null, this._mini_map = null, this._markers = [], this._marker_zooms = [], this.zoom_min_max = {
			min: null,
			max: null
		}, this._line = null, this._line_active = null, this.current_marker = 0, this.bounds_array = null, this._tile_layer = null, this._tile_layer_mini = null, this._image_layer = null, this.data = {
			uniqueid: "",
			slides: [
				{ test: "yes" },
				{ test: "yes" },
				{ test: "yes" }
			]
		}, this.options = {
			map_type: "osm:standard",
			map_as_image: !1,
			map_mini: !1,
			map_background_color: "#d9d9d9",
			map_access_token: "",
			overlays: [],
			overview_extent: null,
			iiif: {
				url: "",
				attribution: ""
			},
			skinny_size: 650,
			start_at_slide: 0,
			calculate_zoom: !0,
			line_follows_path: !0,
			line_color: "#333",
			line_color_inactive: "#000",
			line_weight: 5,
			line_opacity: .2,
			line_dash: "5,5",
			line_join: "miter",
			show_lines: !0,
			show_history_line: !0,
			map_center_offset: null
		}, this.animator = null, this._transition_duration = this.options.duration, this.timer = null, this.touch_scale = 1, this.scroll = { start_time: null }, n(this.options, r), n(this.data, t), this._initLayout(), this._initEvents(), this._createMap(), this._initData();
	}
	updateDisplay(e, t, n, r, i) {
		this._updateDisplay(e, t, n, r, i);
	}
	goTo(e, t) {
		if (e < this._markers.length && e >= 0) {
			let n, r = this.current_marker;
			this.current_marker = e, this._transition_duration = m(r, e);
			let i = this._markers[this.current_marker];
			if (this.animator && this.animator.stop(), this._resetMarkersActive(), i.data.type && i.data.type === "overview") this._markerOverview();
			else {
				i.active(!0);
				let e = i.data.location ?? void 0;
				if (t) e && this._viewTo(e, { duration: this._transition_duration });
				else if (e) {
					if (this._hasLocation(i.data) || this._hasRegion(i.data)) {
						let t = i.location();
						if (n = t ? this._calculateZoomChange(this._getMapCenter(!0), t) : void 0, this._viewTo(e, {
							calculate_zoom: this.options.calculate_zoom,
							zoom: n,
							duration: this._transition_duration
						}), this.options.line_follows_path) {
							if (this.options.show_history_line && i.data.real_marker && this._markers[r].data.real_marker) {
								let e = [], t = 0, n = null, a = null;
								if (r < this.current_marker) {
									for (; t < this.current_marker;) {
										let n = this._locationOf(this._markers[t].data);
										n && e.push(n), t++;
									}
									a = this._locationsUpTo(r);
								} else r > this.current_marker && (e = this._locationsUpTo(this.current_marker), n = this._locationsUpTo(r));
								let o = this._locationOf(i.data);
								!n && o && e.push(o), this._replaceLines(this._line_active, e, {
									duration: this._transition_duration,
									retractFrom: n,
									growFrom: a
								});
							}
						} else {
							let e = this._locationOf(i.data), t = this._locationOf(this._markers[r].data);
							this.options.show_history_line && e && t && this._replaceLines(this._line_active, [e, t], { duration: this._transition_duration });
						}
					} else this._markerOverview();
					this._onMarkerChange();
				}
			}
		}
	}
	panTo(e, t) {
		this._panTo(e, t);
	}
	zoomTo(e, t) {
		this._zoomTo(e, t);
	}
	viewTo(e, t) {
		this._viewTo(e, t);
	}
	getBoundsZoom(e, t, n, r) {
		return this._getBoundsZoom(e, t, n, r);
	}
	markerOverview() {
		this._markerOverview();
	}
	calculateMarkerZooms() {
		this._calculateMarkerZooms();
	}
	createMiniMap() {
		this._createMiniMap();
	}
	setMapOffset(e, t) {
		this.options.map_center_offset ? (this.options.map_center_offset.left = e, this.options.map_center_offset.top = t) : this.options.map_center_offset = {
			left: e,
			top: t
		};
	}
	calculateMinMaxZoom() {
		for (let e = 0; e < this._markers.length; e++) {
			let t = this._markerZoom(e);
			typeof t == "number" && this.updateMinMaxZoom(t);
		}
	}
	_markerZoom(e) {
		return this._markers[e]?.data.location?.zoom;
	}
	updateMinMaxZoom(e) {
		this.zoom_min_max.max === null && (this.zoom_min_max.max = e), this.zoom_min_max.min === null && (this.zoom_min_max.min = e), this.zoom_min_max.max < e && (this.zoom_min_max.max = e), this.zoom_min_max.min > e && (this.zoom_min_max.min = e);
	}
	initialMapLocation() {
		this._loaded.data && this._loaded.map && this.current_marker === 0 && this.goTo(this.options.start_at_slide, !0);
	}
	show() {}
	hide() {}
	createMarkers(e) {
		this._createMarkers(e);
	}
	createMarker(e) {
		this._createMarker(e);
	}
	_destroyMarker(e) {
		this._removeMarker(e);
		let t = this._markers.indexOf(e);
		if (t !== -1) {
			this._markers.splice(t, 1);
			for (let e = t; e < this._markers.length; e++) this._markers[e].marker_number = e;
			this.fire("markerRemoved", e);
		}
	}
	_createMarkers(e) {
		for (let t = 0; t < e.length; t++) this._createMarker(e[t]), this._hasLocation(e[t]) && this.options.show_lines && this._addToLine(this._line, e[t]);
	}
	_hasLocation(e) {
		return this._locationOf(e) !== null;
	}
	_locationsUpTo(e) {
		let t = [];
		for (let n = 0; n <= e && n < this._markers.length; n++) {
			let e = this._locationOf(this._markers[n].data);
			e && t.push(e);
		}
		return t;
	}
	_locationOf(e) {
		let t = e.location;
		return !t || typeof t.lat != "number" || typeof t.lon != "number" ? null : {
			lat: t.lat,
			lon: t.lon
		};
	}
	_hasRegion(e) {
		return !!e.location && Array.isArray(e.location.region) && e.location.region.length === 4;
	}
	_createMap() {}
	_createMiniMap() {}
	_createMarker(e) {
		let t = {};
		t.on("markerclick", this._onMarkerClick), this._addMarker(t), this._markers.push(t), t.marker_number = this._markers.length - 1, this.fire("markerAdded", t);
	}
	_addMarker(e) {}
	_removeMarker(e) {}
	_resetMarkersActive() {
		for (let e = 0; e < this._markers.length; e++) this._markers[e].active(!1);
	}
	_calculateMarkerZooms() {}
	_createLine(e) {
		return { data: e };
	}
	_addToLine(e, t) {}
	_replaceLines(e, t, n) {}
	_addLineToMap(e) {}
	_panTo(e, t) {}
	_zoomTo(e, t) {}
	_viewTo(e, t) {}
	_updateMapDisplay(e, t) {}
	_refreshMap() {}
	_getMapZoom() {
		return 1;
	}
	_getMapCenter(e) {
		return {
			lat: 0,
			lon: 0
		};
	}
	get _easing() {
		return this.options.ease;
	}
	_getBoundsZoom(e, t, n, r) {}
	_markerOverview(e) {}
	getRouteDistance() {}
	_onMarkerChange(e) {
		this.fire("change", { current_marker: this.current_marker });
	}
	_onMarkerClick(e) {
		this.current_marker !== e.marker_number && this.goTo(e.marker_number, !1);
	}
	_onMapLoaded(e) {
		this._loaded.map || (this._loaded.map = !0, this.options.calculate_zoom && this.calculateMarkerZooms(), this.calculateMinMaxZoom(), this.options.map_mini && !Ln.touch && this.createMiniMap(), this.initialMapLocation(), this.fire("loaded", this.data));
	}
	_onWheel(e) {
		if (e.ctrlKey) {
			let t = Math.exp(-e.deltaY / 100);
			this.touch_scale *= t, e.preventDefault(), e.stopPropagation();
		}
		this.scroll.start_time || (this.scroll.start_time = +/* @__PURE__ */ new Date());
		let t = Math.max(40 - (+/* @__PURE__ */ new Date() - this.scroll.start_time), 0);
		clearTimeout(this.scroll.timer), this.scroll.timer = setTimeout(() => {
			this._scollZoom();
		}, t);
	}
	_scollZoom(e) {
		let t = this._getMapZoom();
		this.scroll.start_time = null, clearTimeout(this.scroll.timer), clearTimeout(this.scroll.timer_done), this.scroll.timer_done = setTimeout(() => {
			this._scollZoomDone();
		}, 1e3), this.zoomTo(Math.round(t * this.touch_scale));
	}
	_scollZoomDone(e) {
		this.touch_scale = 1;
	}
	_calculateZoomChange(e, t, n) {
		return this._getBoundsZoom(e, t, n);
	}
	_updateDisplay(e, t, n, r, i) {
		this._updateMapDisplay(n, r);
	}
	applyOptions(e) {}
	_initLayout() {
		this._el.map_mask = P.create("div", "vco-map-mask", this._el.container), this.options.map_as_image ? this._el.map = P.create("div", "vco-map-display vco-mapimage-display", this._el.map_mask) : this._el.map = P.create("div", "vco-map-display", this._el.map_mask);
	}
	_initData() {
		this.data.slides && (this._createMarkers(this.data.slides), this._afterCreateMarkers(), this._resetMarkersActive(), this._markers.length > 0 && this._markers[this.current_marker].active(!0), this._loaded.data = !0);
	}
	_afterCreateMarkers() {}
	_initEvents() {
		this._el.map.addEventListener("wheel", (e) => {
			this._onWheel(e);
		});
	}
}, Dw = class extends Mn(jn(Ew)) {
	constructor(...e) {
		super(...e);
	}
}, Ow = class {
	constructor(e, t) {
		this._el = {
			container: {},
			content_container: {},
			content: {}
		}, this._marker = {}, this._icon = {}, this._custom_icon = !1, this._custom_icon_url = "", this._custom_image_icon = !1, this.marker_number = 0, this.media_icon_class = "", this.timer = null, this.data = {}, this.options = {
			duration: 1e3,
			ease: Sn,
			width: 600,
			height: 600
		}, this.animator = null, n(this.options, t), n(this.data, e), this._initLayout();
	}
	show() {}
	hide() {}
	createPopup(e, t) {}
	addTo(e) {
		this._addTo(e);
	}
	removeFrom(e) {
		this._removeFrom(e);
	}
	updateDisplay(e, t, n) {
		this._updateDisplay(e, t, n);
	}
	createMarker(e, t) {
		this._createMarker(e, t);
	}
	active(e) {
		this._active(e);
	}
	location() {
		return this._location();
	}
	_createMarker(e, t) {}
	_addTo(e) {}
	_removeFrom(e) {}
	_active(e) {}
	_location() {
		return null;
	}
	_onMarkerClick(e) {
		this.fire("markerclick", { marker_number: this.marker_number });
	}
	_initLayout() {
		this._createMarker(this.data, this.options);
	}
	_updateDisplay(e, t, n) {}
}, kw = class extends jn(Ow) {
	constructor(...e) {
		super(...e);
	}
}, Aw = class extends kw {
	_presentation(e) {
		let t = e?.location ?? {}, n = e?.marker ?? {};
		return {
			icon: n.icon ?? t.icon,
			iconSize: n.iconSize ?? t.iconSize,
			image: n.image ?? t.image,
			label: n.label ?? t.name,
			popup: !!(n.popup ?? t.popup),
			audioBadge: !!(n.audioBadge ?? t.audioBadge),
			useCustomMarker: t.use_custom_marker
		};
	}
	_createMarker(e, t) {
		let n = e?.location;
		if (n && typeof n.lat == "number" && typeof n.lon == "number") {
			this.data.real_marker = !0;
			let n = this._presentation(e);
			this._popup_enabled = n.popup, this._audio_badge = n.audioBadge;
			let r = t?.use_custom_markers || n.useCustomMarker;
			r && n.icon ? this._custom_icon = {
				url: n.icon,
				size: n.iconSize || [48, 48],
				anchor: this._customIconAnchor(n.iconSize)
			} : r && n.image && (this._custom_image_icon = n.image), this._marker = this._createMarkerElement(e, t), this._onMarkerClickBound = (e) => {
				if (e.stopPropagation(), this._popup_enabled && this._is_active) {
					this._togglePopup();
					return;
				}
				this._onMarkerClick(e);
			}, this._marker.addEventListener("click", this._onMarkerClickBound), this._onPopupKeyBound = (e) => {
				e.key === "Escape" && this._closePopup();
			}, document.addEventListener("keydown", this._onPopupKeyBound);
		}
	}
	_createMarkerElement(e, t) {
		let n = document.createElement("div");
		if (n.title = e.text && e.text.headline ? e.text.headline : "", this._custom_icon) {
			n.className = "vco-mapmarker-custom";
			let e = document.createElement("img");
			e.src = this._custom_icon.url, e.style.width = this._custom_icon.size[0] + "px", e.style.height = "auto", n.appendChild(e), n.style.marginLeft = -this._custom_icon.anchor[0] + "px", n.style.marginTop = -this._custom_icon.anchor[1] + "px";
		} else if (this._custom_image_icon) {
			n.className = "vco-mapmarker-image-icon";
			let e = document.createElement("img");
			e.src = this._custom_image_icon, e.style.width = "48px", e.style.height = "auto", n.appendChild(e), n.style.marginLeft = "-24px", n.style.marginTop = "-48px";
		} else n.className = "vco-mapmarker " + this.media_icon_class;
		return n;
	}
	latLon() {
		let e = this.data.location;
		return !this.data.real_marker || !e || typeof e.lat != "number" || typeof e.lon != "number" ? null : {
			lat: e.lat,
			lon: e.lon
		};
	}
	_addTo(e) {
		let t = this.latLon();
		if (t && this._marker) {
			let n = e.getView().getProjection().getCode() === "EPSG:4326" ? [t.lon, t.lat] : _s([t.lon, t.lat]), r = !this._custom_icon && !this._custom_image_icon;
			this._overlay = new P_({
				element: this._marker,
				position: n,
				stopEvent: !1,
				...r ? {
					positioning: "bottom-center",
					offset: [0, 1]
				} : {}
			}), e.addOverlay(this._overlay);
		}
	}
	_removeFrom(e) {
		this.data.real_marker && this._overlay && e.removeOverlay(this._overlay);
	}
	_togglePopup() {
		if (!this._popup_enabled) return;
		if (this._popup_el) {
			this._closePopup();
			return;
		}
		let e = this._createPopupElement();
		e !== null && (this._marker.appendChild(e), this._popup_el = e, this._marker.classList.add("vco-mapmarker-popup-open"));
	}
	_closePopup() {
		this._popup_el && (this._popup_el.parentNode?.removeChild(this._popup_el), this._popup_el = null, this._marker?.classList?.remove("vco-mapmarker-popup-open"));
	}
	get popupOpen() {
		return !!this._popup_el;
	}
	_createPopupElement() {
		let e = this.data, t = document.createElement("div");
		t.className = "vco-marker-popup", t.setAttribute("role", "group"), t.setAttribute("aria-label", e.text?.headline ?? "Slide details");
		let n = document.createElement("button");
		if (n.type = "button", n.className = "vco-marker-popup-close", n.setAttribute("aria-label", "Close"), n.textContent = "×", n.addEventListener("click", (e) => {
			e.stopPropagation(), this._closePopup();
		}), t.appendChild(n), e.media?.thumb) {
			let n = document.createElement("img");
			n.className = "vco-marker-popup-thumb", n.src = e.media.thumb, n.alt = e.media.caption ?? "", n.loading = "lazy", t.appendChild(n);
		}
		let r = document.createElement("div");
		if (r.className = "vco-marker-popup-body", e.text?.headline) {
			let t = document.createElement("h3");
			t.className = "vco-marker-popup-headline", t.appendChild(Xn(e.text.headline)), r.appendChild(t);
		}
		if (e.text?.text) {
			let t = document.createElement("p");
			t.className = "vco-marker-popup-excerpt", t.appendChild(Xn(e.text.text)), r.appendChild(t);
		}
		return t.appendChild(r), t;
	}
	_updateAudioBadge() {
		if (!this._audio_badge) return;
		let e = this.data.media?.mediatype?.type, t = e === "audio" || e === "video" || !!this.data.narration;
		this._marker.classList.toggle("vco-mapmarker-has-audio", t);
	}
	dispose() {
		let e = this._marker;
		this._closePopup(), this._onPopupKeyBound &&= (document.removeEventListener("keydown", this._onPopupKeyBound), null), this._onMarkerClickBound &&= (e?.removeEventListener?.("click", this._onMarkerClickBound), null), this._overlay &&= (this._overlay.setElement(void 0), null), e?.parentNode?.removeChild(e), this._marker = null;
	}
	_active(e) {
		if (this._is_active = e, e ? this._updateAudioBadge() : this._closePopup(), this.media_icon_class = this.data.media && this.data.media.mediatype ? "vco-mapmarker-icon vco-icon-" + this.data.media.mediatype.type : "vco-mapmarker-icon vco-icon-plaintext", this.data.real_marker) {
			this._custom_icon ? (e || c(this.timer), this._marker.style.zIndex = e ? "1000" : "") : this._custom_image_icon ? e ? (this._marker.classList.remove("vco-mapmarker-image-icon"), this._marker.classList.add("vco-mapmarker-image-icon-active"), this._marker.style.zIndex = "1000") : (c(this.timer), this._marker.classList.remove("vco-mapmarker-image-icon-active"), this._marker.classList.add("vco-mapmarker-image-icon"), this._marker.style.zIndex = "") : e ? (this._marker.classList.remove("vco-mapmarker"), this._marker.classList.add("vco-mapmarker-active"), this._marker.style.zIndex = "1000") : (c(this.timer), this._marker.classList.remove("vco-mapmarker-active"), this._marker.classList.add("vco-mapmarker"), this._marker.style.zIndex = "");
			let t = this._marker.querySelector(".vco-marker-label");
			if (t && t.remove(), e && this.options.marker_labels && this.data.text?.headline) {
				let e = document.createElement("div");
				e.className = "vco-marker-label", e.textContent = this.data.text.headline, this._marker.appendChild(e);
			}
			let n = this._marker.querySelector(".vco-mapmarker-icon");
			n ? n.className = this.media_icon_class : !this._custom_icon && !this._custom_image_icon && (this._marker.className = (e ? "vco-mapmarker-active " : "vco-mapmarker ") + this.media_icon_class);
		}
	}
	_customIconAnchor(e) {
		return e ? [e[0] * .5, e[1]] : [24, 48];
	}
	_location() {
		return this.latLon();
	}
};
function jw(e, t) {
	if (t.naturalWidth !== 256 || t.naturalHeight !== 256) {
		let n = document.createElement("canvas");
		n.width = 256, n.height = 256, n.getContext("2d")?.drawImage(t, 0, 0), e.setImage(n);
	}
}
//#endregion
//#region src/map/openlayers/Map.OpenLayers.ts
var Mw = 19, Nw = Array.from({ length: 25 }, (e, t) => 2 ** (16 - t)), Pw = class extends Dw {
	_createMap() {
		let e = this.isImageSpace();
		this._imageready_fired = /* @__PURE__ */ new WeakSet();
		let t = this.options.map_options ?? {}, { element: n, view: r, ...i } = t, a = r ?? {}, o = this._bboxExtent(), s = this._tilejsonFor(this.options.map_type), c = s?.minzoom ?? 0, l = s?.maxzoom ?? Mw, u = s?.bounds ? _s(s.bounds) : null;
		this._map = new cm({
			...i,
			target: this._el.map,
			controls: t.controls ?? [],
			interactions: t.interactions ?? [],
			view: new ll({
				projection: e ? "EPSG:4326" : "EPSG:3857",
				...s?.center ? {
					center: _s([s.center[0], s.center[1]]),
					zoom: s.center[2]
				} : {
					center: [0, 0],
					zoom: 0
				},
				minZoom: c,
				maxZoom: e ? Nw.length - 1 : l,
				...u && !e ? {
					extent: u,
					constrainOnlyCenter: !0
				} : {},
				...e ? {
					multiWorld: !0,
					resolutions: Nw
				} : {},
				...this.options.map_type === "zoomify" ? { multiWorld: !0 } : {},
				...o ? {
					extent: o,
					constrainOnlyCenter: !0
				} : {},
				...a
			})
		}), this._map.on("loadend", () => {
			this._onMapLoaded(void 0);
		});
		let d = this._el.map.querySelector(".ol-overlaycontainer");
		d && (d.style.zIndex = "1");
		let f = sn(this.options), p = Qt();
		this.options.consent_required && f ? f.isGranted(p.key) ? this._addTileLayer() : f.isDenied(p.key) || this._requestTileConsent(f, p) : this._addTileLayer(), this._line = this._createLine(), this._line.setStyle(this._lineStyle(this.options.line_color_inactive)), this._addLineToMap(this._line), this._line.setZIndex(10), this._line.setOpacity(this.options.line_opacity), this._line_active = this._createLine(), this._line_active.setStyle(this._lineStyle(this.options.line_color)), this._addLineToMap(this._line_active), this._line_active.setZIndex(11), this._line_active.setOpacity(1), this.options.map_as_image && (this._line_active.setVisible(!1), this._line.setVisible(!1)), this._overlay_layers = [], this._overlay_entries = [], this._buildOverlays(), Cu({ mouseWheelZoom: !1 }).forEach((e) => this._map.addInteraction(e)), this._updateAttribution();
	}
	setExtraAttributions(e) {
		this._extra_attributions = [...e], this._updateAttribution();
	}
	getBaseLayer() {
		return this._tile_layer ?? null;
	}
	getOverlayLayers() {
		return [...this._overlay_layers];
	}
	getOverlayLayer(e) {
		return this._overlay_layers[e] ?? null;
	}
	getMinimap() {
		return this._mini_map?.getOverviewMap?.() ?? null ?? null;
	}
	getLine() {
		return this._line ?? null;
	}
	getLineActive() {
		return this._line_active ?? null;
	}
	getMarkers() {
		return [...this._markers];
	}
	getMarker(e) {
		return this._markers[e] ?? null;
	}
	_updateAttribution() {
		let e = this._extra_attributions ?? [], t = [...new Set([...this._getAttribution(this.options.map_type), ...e].filter(Boolean))].join(" | "), n = this._el.map.querySelector(".vco-map-attribution");
		n ||= (this._el.map.insertAdjacentHTML("beforeend", "<div class=\"vco-map-attribution\"></div>"), this._el.map.querySelector(".vco-map-attribution")), n && (n.textContent = "", n.appendChild(Xn(t)));
	}
	_getAttribution(e) {
		let t = ["<a href='https://storymap.knightlab.com/' target='_blank' class='vco-knightlab-brand'><span>&#x25a0;</span> StoryMapJS</a>"];
		return e === "" || e.startsWith("osm") ? t.push("© <a target='_blank' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors") : e.startsWith("stadia") || e === "stamen" ? t.push("© <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://stadiamaps.com/\">Stadia Maps</a>, © <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://openmaptiles.org/\">OpenMapTiles</a> © <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors") : e.startsWith("mapbox://") ? t.push("© <a target=\"_blank\" href=\"https://www.mapbox.com/about/maps/\">Mapbox</a>") : e.startsWith("ch-") || e.startsWith("esri") ? t.push("Map data © <a target=\"_blank\" href=\"https://www.esri.com/\">Esri</a>") : t.push("Map data"), this.options.attribution && t.push(this.options.attribution), t;
	}
	_sourceAttributions(e) {
		let t = [];
		return e === "" || e.startsWith("osm") ? t.push("© OpenStreetMap contributors") : e.startsWith("stadia") || e === "stamen" ? t.push("© Stadia Maps, © OpenMapTiles © OpenStreetMap contributors") : e.startsWith("mapbox://") ? t.push("© Mapbox") : e.startsWith("ch-") || e.startsWith("esri") ? t.push("Map data © Esri") : t.push("Map data"), this.options.attribution && t.push(this.options.attribution), t;
	}
	_addTileLayer() {
		this._tile_layer = this._createTileLayer(this.options.map_type), this._tile_layer.setZIndex(0), this._map.addLayer(this._tile_layer);
	}
	async _requestTileConsent(e, t) {
		await e.request(t, "", this._el.map) && this._onTilesAllowed();
	}
	_buildOverlays() {
		for (let e of this._overlay_layers) this._map.removeLayer(e);
		this._overlay_layers = [], this._overlay_entries = [], this._tilesAllowed() && ((this.options.overlays ?? []).forEach((e, t) => {
			let n = null;
			if (e.georeference ? n = this._createGeoreferencedOverlay(e) : e.map_type ? n = this._createTileLayer(e.map_type) : console.warn("StoryMapJS: an overlays[] entry has neither map_type nor georeference and was skipped:", e), n) {
				if (n.setZIndex(1 + t), e.opacity !== void 0 && n.setOpacity(e.opacity), e.visible !== void 0 && n.setVisible(e.visible), e.className) {
					let t = e.className;
					n.getClassName = () => t;
				}
				if (e.extent) {
					let t = this._lonLatBboxToExtent(e.extent);
					t && n.setExtent(t);
				}
				this._map.addLayer(n), this._overlay_layers.push(n), this._overlay_entries.push(e), this._paintOverlayBlend(e);
			}
		}), this._syncOverlayAttributions());
	}
	_createGeoreferencedOverlay(e) {
		let t = e.georeference;
		if (!t) return null;
		if (this._map.getView().getProjection().getCode() !== "EPSG:3857") return console.warn("StoryMapJS: a georeferenced overlay was skipped because this map has no geographic view (image maps cannot place sheets)."), null;
		let n = Ce(t.body, t.width, t.height);
		if (n.kind === "skipped") return console.warn(`StoryMapJS: georeferenced overlay ${t.url} was skipped: ${n.reason}.`), null;
		let r = new Pg(), i = ve(t.url);
		return fetch(i).then((e) => e.json()).then((t) => {
			let a = new b_(t).getTileSourceOptions(), o = t;
			if (typeof o.width != "number" || typeof o.height != "number") {
				console.error("IIIF info.json is missing width/height:", i), r.setVisible(!1);
				return;
			}
			let s = new C_({
				...a ?? {},
				projection: "EPSG:4326",
				extent: n.bbox,
				size: [o.width, o.height],
				crossOrigin: "anonymous",
				attributions: e.attribution ? [e.attribution] : []
			});
			r.setSource(s), this._fireImageready(s, "iiif", r);
		}).catch((e) => {
			console.error("IIIF info.json could not be loaded:", i, e?.stack || e), r.setVisible(!1);
		}), r;
	}
	_lonLatBboxToExtent(e) {
		return !Array.isArray(e) || e.length !== 4 || e.some((e) => typeof e != "number" || !isFinite(e)) || this._map.getView().getProjection().getCode() !== "EPSG:3857" ? null : $i([_s([e[0], e[1]]), _s([e[2], e[3]])]);
	}
	_paintOverlayBlend(e, t = 60) {
		if (!e.blendMode || !e.className) return;
		let n = e.className.split(/\s+/).filter((e) => /^[\w-]+$/.test(e));
		if (n.length === 0) return;
		let r = this._el.map.querySelector("." + n.join("."));
		if (r) {
			r.style.mixBlendMode = e.blendMode;
			return;
		}
		t > 0 && requestAnimationFrame(() => this._paintOverlayBlend(e, t - 1));
	}
	_syncOverlayAttributions() {
		let e = [];
		this._overlay_layers.forEach((t, n) => {
			let r = this._overlay_entries[n]?.attribution;
			r && t.getVisible() && e.push(r);
		}), this.setExtraAttributions(e);
	}
	getOverlayCount() {
		return this._overlay_layers.length;
	}
	setOverlayVisible(e, t) {
		let n = this._overlay_layers[e];
		if (!n) return;
		n.setVisible(t);
		let r = this._overlay_entries[e];
		r && t && this._paintOverlayBlend(r), this._syncOverlayAttributions();
	}
	setOverlayOpacity(e, t) {
		this._overlay_layers[e]?.setOpacity(t);
	}
	_onTilesAllowed() {
		if (this._addTileLayer(), this._buildOverlays(), this._tile_layer_mini ||= this._createTileLayer(this.options.map_type), this._mini_map && this._tile_layer_mini) {
			let e = this._mini_map.getOverviewMap();
			e.getLayers().getLength() || e.addLayer(this._tile_layer_mini);
		}
		if (this._markers.length > 0 && this.current_marker < this._markers.length) {
			let e = this._markers[this.current_marker];
			if (e.data.type === "overview") this._markerOverview();
			else {
				let t = e.latLon();
				t && this._fitView(this._map, [[t.lon, t.lat]], 0);
			}
		}
	}
	_zoomifyPyramid() {
		let e = this.options.zoomify;
		if (!e || typeof e != "object" || !e.path) return null;
		let t = e.width ?? 600, n = e.height ?? 600, r = [], i = t, a = n;
		for (; i > 256 || a > 256;) r.push([i, a]), i = Math.floor(i / 2), a = Math.floor(a / 2);
		r.push([i, a]), r.reverse();
		let o = r.length - 1, s = 256 * 2 ** o, c = [
			-20037508.342789244,
			20037508.342789244 - n / s * 40075016.68557849,
			-20037508.342789244 + t / s * 40075016.68557849,
			20037508.342789244
		];
		return {
			sizes: r,
			maxZoom: o,
			extent: c,
			tileGrid: new qg({
				extent: c,
				origin: [c[0], c[3]],
				resolutions: Array.from({ length: o + 2 }, (e, t) => 40075016.68557849 / (256 * 2 ** (t - 1))),
				tileSize: 256
			})
		};
	}
	_zoomifyOverview(e) {
		let t = this._zoomifyPyramid();
		if (!t) return null;
		let n = this.options.zoomify?.tolerance ?? .9, r = t.maxZoom;
		for (; r > 0;) {
			let i = t.sizes[r];
			if (i[0] * n < (e[0] || 1) && i[1] * n < (e[1] || 1)) break;
			r--;
		}
		let i = [(t.extent[0] + t.extent[2]) / 2, (t.extent[1] + t.extent[3]) / 2];
		return {
			zoom: r,
			center: i
		};
	}
	_createTileLayer(e) {
		let t = this.options.tile_source_factory;
		if (typeof t == "function") {
			let n = t(e, {
				options: this.options,
				createDefault: () => this._createDefaultTileLayer(e)
			});
			if (n) return n instanceof ju || typeof n.getSource == "function" ? n : new Pg({ source: n });
		}
		return this._createDefaultTileLayer(e);
	}
	_sourceOf(e) {
		return !e || typeof e.getSource != "function" ? null : e.getSource();
	}
	addTo(e) {
		return super.addTo(e), this._map.setTarget(this._el.map), this._map.updateSize(), this;
	}
	removeFrom(e) {
		return super.removeFrom(e), this._map.setTarget(void 0), this;
	}
	isImageSpace() {
		return this.options.map_type === "iiif" && this.options.map_as_image === !0;
	}
	dispose() {
		this._line_animation !== null && (cancelAnimationFrame(this._line_animation), this._line_animation = null);
		for (let e of this._markers) e.dispose?.();
		this._markers = [], this._map.setTarget(void 0), this._map.dispose();
	}
	_fireImageready(e, t, n) {
		if (this._imageready_fired.has(e)) return;
		this._imageready_fired.add(e);
		let r = {
			source: e,
			kind: t,
			layer: n ?? null
		};
		if (typeof e.getState != "function" || e.getState() === "ready") {
			this.fire("imageready", r);
			return;
		}
		let i = () => {
			e.getState?.() === "ready" && (e.un?.("change", i), this.fire("imageready", r));
		};
		e.once?.("change", i);
	}
	_markerZoom(e) {
		return this._marker_zooms[e] ?? super._markerZoom(e);
	}
	_tilejsonFor(e) {
		let t = this.options.tilejson;
		if (t !== void 0) return (Array.isArray(t.tiles) ? t.tiles[0] : t.tiles) === e ? t : void 0;
	}
	_xyzSource(e) {
		let t = this._tilejsonFor(e), n = {
			url: e,
			attributions: this._sourceAttributions(e),
			crossOrigin: "anonymous"
		};
		t !== void 0 && (t.minzoom !== void 0 || t.maxzoom !== void 0) && (n.minZoom = t.minzoom ?? 0, n.maxZoom = t.maxzoom ?? Mw);
		let r = new u_(n);
		if (t?.scheme === "tms") {
			let n = t.maxzoom ?? Mw;
			r.tileUrlFunction = (t) => {
				if (t === void 0) return;
				let [r, i, a] = t;
				return e.replace("{z}", String(r)).replace("{x}", String(i)).replace("{y}", String(2 ** n - 1 - a)).replace("{ratio}", "");
			};
		}
		return r;
	}
	_createDefaultTileLayer(e) {
		let t = e.split(":");
		switch (t[0]) {
			case "mapbox": return t.length > 2 ? new Pg({ source: new u_({
				url: "https://api.mapbox.com/styles/v1/" + t[2].slice(9) + "/tiles/256/{z}/{x}/{y}@2x?access_token=" + this.options.map_access_token,
				attributions: this._sourceAttributions(e),
				crossOrigin: "anonymous"
			}) }) : (console.error("StoryMapJS: legacy 'mapbox:<style>' map types are no longer supported (the Mapbox v4 tile API was retired); use 'mapbox://styles/<user>/<style>' with map_access_token instead."), new Pg({ source: new j_({ attributions: this._sourceAttributions(e) }) }));
			case "stadia": {
				let n = "alidade_smooth";
				return t.length > 1 && (n = t.slice(1).join(":"), this.options.map_access_token && (n = `${n}?api_key=${this.options.map_access_token}`)), new Pg({ source: new u_({
					url: `https://tiles.stadiamaps.com/tiles/${n}/{z}/{x}/{y}{r}.png`,
					attributions: this._sourceAttributions(e)
				}) });
			}
			case "stamen": return this._map.getViewport().style.backgroundColor = "#FFFFFF", new Pg({ source: new u_({
				url: "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}.png",
				attributions: this._sourceAttributions(e)
			}) });
			case "iiif": {
				let e = new Pg();
				return fetch(this.options.iiif.url).then((e) => e.json()).then((t) => {
					let n = new b_(t).getTileSourceOptions(), r = t;
					if (typeof r.width != "number" || typeof r.height != "number") {
						console.error("IIIF info.json is missing width/height:", this.options.iiif.url);
						return;
					}
					let i = new C_({
						...n ?? {},
						projection: "EPSG:4326",
						size: [r.width, r.height],
						crossOrigin: "anonymous",
						attributions: this.options.iiif.attribution || []
					});
					e.setSource(i), this._fireImageready(i, "iiif", e), i.getState() === "ready" ? this._markerOverview() : i.once("change", () => {
						i.getState() === "ready" && this._markerOverview();
					});
				}).catch((e) => console.error("IIIF info.json could not be loaded:", this.options.iiif.url, e?.stack || e)), e;
			}
			case "http":
			case "https": return e.includes("{z}") ? new Pg({ source: this._xyzSource(e) }) : this._createVectorStyleLayer(e);
			case "ch-watercolor": return new Pg({ source: new u_({
				url: "https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg",
				attributions: this._sourceAttributions(e),
				maxZoom: 16
			}) });
			case "zoomify": {
				let t = this._zoomifyPyramid();
				if (!t) return console.error("StoryMapJS: map_type 'zoomify' needs a zoomify image pyramid (path, width, height) in the storymap data."), new Pg({ source: new j_({ attributions: this._sourceAttributions(e) }) });
				let n = this.options.zoomify.path ?? "", { sizes: r, maxZoom: i } = t, a = (e) => Math.ceil(r[e][0] / 256), o = (e) => Math.ceil(r[e][1] / 256), s = new u_({
					tileGrid: t.tileGrid,
					crossOrigin: "anonymous",
					attributions: this._sourceAttributions(e),
					tileUrlFunction: (e) => {
						let [t, r, s] = e, c = Math.max(0, t - 1);
						if (c > i || r < 0 || r >= a(c) || s < 0 || s >= o(c)) return;
						let l = 0;
						for (let e = 0; e < c; e++) l += a(e) * o(e);
						return l += s * a(c) + r, `${n}TileGroup${Math.floor(l / 256)}/${c}-${r}-${s}.jpg`;
					},
					tileLoadFunction: (e, t) => {
						let n = e, r = n.getImage();
						r.onload = () => jw(n, r), r.src = t;
					}
				}), c = new Pg({ source: s });
				return this._fireImageready(s, "zoomify", c), c;
			}
			case "osm": {
				let n = t.length > 1 ? t[1] : "";
				return n ? this._createVectorStyleLayer(`https://tiles.openfreemap.org/styles/${n}`) : new Pg({ source: new j_({ attributions: this._sourceAttributions(e) }) });
			}
			default: return e.includes("{z}") ? new Pg({ source: this._xyzSource(e) }) : e.includes("/") || e.endsWith(".json") ? this._createVectorStyleLayer(e) : new Pg({ source: new j_({ attributions: this._sourceAttributions(e) }) });
		}
	}
	_createVectorStyleLayer(e) {
		let t = new Rg({
			declutter: !0,
			updateWhileAnimating: !0
		});
		return bw(t, e).catch((t) => console.error("Vector map style could not be loaded:", e, t)), t;
	}
	_createMiniMap() {
		this.options.map_as_image && (this.zoom_min_max.min = 0), this.bounds_array ||= this._getAllMarkersBounds(this._markers), this._tile_layer_mini = this._tilesAllowed() ? this._createTileLayer(this.options.map_type) : null;
		let e = this.isImageSpace(), t = this.options.map_type === "zoomify", n = t ? this._zoomifyPyramid() : null, r = n ? n.tileGrid.getResolutions() : null, i = !e && !n && this.options.overview_extent ? this._lonLatBboxToExtent(this.options.overview_extent) : null;
		if (this._mini_map = new L_({
			...e || n ? { view: new ll({
				projection: this._map.getView().getProjection(),
				center: this._map.getView().getCenter(),
				zoom: this.zoom_min_max.min || 0,
				...e ? {
					multiWorld: !0,
					resolutions: Nw,
					minZoom: 0,
					maxZoom: Nw.length - 1
				} : {},
				...n && r ? {
					constrainOnlyCenter: !0,
					extent: n.extent,
					resolutions: r,
					minZoom: 0,
					maxZoom: r.length - 1,
					center: [(n.extent[0] + n.extent[2]) / 2, (n.extent[1] + n.extent[3]) / 2]
				} : {}
			}) } : {},
			...i ? { view: new ll({
				projection: this._map.getView().getProjection(),
				center: [(i[0] + i[2]) / 2, (i[1] + i[3]) / 2],
				extent: i,
				constrainOnlyCenter: !1
			}) } : {},
			layers: this._tile_layer_mini ? [this._tile_layer_mini] : [],
			collapseLabel: "«",
			label: "»",
			collapsed: !0
		}), this._map.addControl(this._mini_map), n) {
			let e = this._mini_map.getOverviewMap(), t = () => {
				let t = e.getSize(), r = t && t[0] >= 50 && t[1] >= 50 ? t : [150, 100];
				e.getView().fit(n.extent, { size: r });
			};
			t(), e.on("change:size", t);
		} else !t && this.bounds_array && this.bounds_array.length && this._fitView(this._mini_map.getOverviewMap(), this.bounds_array, 0, this._bboxExtent() !== null);
		this.isImageSpace() && this._fitMiniMapToImage();
	}
	_fitMiniMapToImage() {
		if (!this._tile_layer_mini) return;
		let e = () => {
			try {
				let e = this._sourceOf(this._tile_layer_mini)?.getTileGrid?.();
				if (e) {
					let t = this._mini_map.getOverviewMap(), n = t.getSize(), r = n && n[0] >= 50 && n[1] >= 50 ? n : [150, 150];
					t.getView().fit(e.getExtent(), { size: r });
				}
			} catch (e) {
				console.warn("IIIF minimap fit failed:", e);
			}
		}, t = this._sourceOf(this._tile_layer_mini);
		t ? (this._fireImageready(t, this.options.map_type === "zoomify" ? "zoomify" : this.options.map_type === "iiif" ? "iiif" : "tiles", this._tile_layer_mini), t.getState() === "ready" ? e() : t.once("change", () => {
			t.getState() === "ready" && e();
		})) : this._tile_layer_mini.once("change:source", () => {
			let t = this._sourceOf(this._tile_layer_mini);
			t && (t.getState() === "ready" ? e() : t.once("change", () => {
				t.getState() === "ready" && e();
			}));
		});
	}
	_createMarker(e) {
		let t = new Aw(e, this.options);
		t.on("markerclick", this._onMarkerClick, this), this._addMarker(t), this._markers.push(t), t.marker_number = this._markers.length - 1, this.fire("markerAdded", t);
	}
	_addMarker(e) {
		e.addTo(this._map);
	}
	_afterCreateMarkers() {
		if (this._map.getView().getProjection().getCode() === "EPSG:4326") return;
		let e = [];
		for (let t of this._markers) {
			let n = t.latLon();
			n && e.push({
				marker: t,
				latlon: n
			});
		}
		let t = this._unwrapLongitudes(e.map((e) => e.latlon.lon));
		e.forEach((e, n) => {
			e.marker._overlay?.setPosition(_s([t[n], e.latlon.lat]));
		});
	}
	_removeMarker(e) {
		e && e.data.real_marker && e._removeFrom(this._map);
	}
	_getAllMarkersBounds(e) {
		let t = [];
		for (let n of e) {
			let e = n.latLon();
			e && t.push([e.lon, e.lat]);
		}
		let n = this._unwrapLongitudes(t.map((e) => e[0]));
		return t.map((e, t) => [n[t], e[1]]);
	}
	_unwrapLongitudes(e) {
		if (e.length === 0) return [];
		let t = [e[0]];
		for (let n = 1; n < e.length; n++) {
			let r = e[n];
			for (; r - t[n - 1] > 180;) r -= 360;
			for (; r - t[n - 1] < -180;) r += 360;
			t.push(r);
		}
		return t;
	}
	_markerCoordsToViewCoords(e) {
		return this._map.getView().getProjection().getCode() === "EPSG:4326" ? e.map((e) => [e[0], e[1]]) : e.map((e) => _s(e));
	}
	_bboxExtent() {
		let e = this.options.map_bbox;
		if (!e || e.length !== 4) return null;
		if (this.isImageSpace()) return e;
		let t = _s([e[0], e[1]]), n = _s([e[2], e[3]]);
		return [
			t[0],
			t[1],
			n[0],
			n[1]
		];
	}
	_opaquePanelPadding() {
		let e = [
			15,
			15,
			15,
			15
		];
		if (typeof document > "u") return e;
		let t = this._el.container.closest?.(".vco-storymap");
		if (!t) return e;
		let n = t.querySelector(".vco-storyslider .vco-slide.vco-active .vco-text");
		if (!n) return e;
		let r = getComputedStyle(n).backgroundColor, i = /rgba?\(([^)]+)\)/.exec(r);
		if (!i) return e;
		let a = i[1].split(/[,\s/]+/).filter((e) => e !== "").map(Number);
		if ((a.length >= 4 ? a[3] : 1) < .9) return e;
		let o = this._el.map.getBoundingClientRect(), s = n.getBoundingClientRect();
		return !o.width || !s.width || !(s.left < o.right && s.right > o.left && s.top < o.bottom && s.bottom > o.top) || (this.options.layout === "portrait" ? e[2] += Math.max(0, o.bottom - s.top) : e[1] += Math.max(0, s.right - o.left)), e;
	}
	_fitView(e, t, n = 0, r = !1) {
		if (!t || !t.length) return;
		let i = $i(this._markerCoordsToViewCoords(t));
		if (r) {
			let e = this._bboxExtent();
			if (e) {
				let t = Da(i, e);
				i = t[0] <= t[2] && t[1] <= t[3] ? t : e;
			}
		}
		e.getView().fit(i, {
			size: e.getSize(),
			padding: this._opaquePanelPadding(),
			maxZoom: 12,
			duration: n,
			easing: this._easing
		});
	}
	_calculateMarkerZooms() {
		let e = this._getMapCenter();
		for (let [t, n] of this._markers.entries()) {
			if (!n.data.location) continue;
			let r, i = n.data.type && n.data.type === "overview" ? e : n.location();
			if (!i) continue;
			let a = t > 0 ? this._markers[t - 1].location() : e, o = t < this._markers.length - 1 ? this._markers[t + 1].location() : e, s = a ? this._calculateZoomChange(a, i) : void 0, c = o ? this._calculateZoomChange(o, i) : void 0;
			r = s && s < (c ?? Infinity) ? s : c || s, r !== void 0 && (this.options.map_center_offset && (this.options.map_center_offset.left !== 0 || this.options.map_center_offset.top !== 0) && --r, this._marker_zooms[t] = r);
		}
	}
	_lineStyle(e) {
		return new up({ stroke: new lp({
			color: e,
			width: this.options.line_weight,
			lineDash: String(this.options.line_dash).split(",").map((e) => Number(e)),
			lineJoin: this.options.line_join
		}) });
	}
	_createLine(e) {
		return new Qh({
			source: new eh({ features: [] }),
			updateWhileAnimating: !0,
			style: this._lineStyle(this.options.line_color)
		});
	}
	_addLineToMap(e) {
		e.setVisible(this.options.show_lines), this._map.addLayer(e);
	}
	_addToLine(e, t) {
		let n = e.getSource();
		if (!n) return;
		let r = n.getFeatures()[0];
		r || (r = new um({ geometry: new gm([]) }), n.addFeature(r));
		let i = r.getGeometry().getCoordinates(), a = t.location?.lon, o = t.location?.lat;
		if (o !== void 0 && a !== void 0) {
			if (i.length > 0) {
				let e = i[i.length - 1][0] / 111319.49079327358;
				for (; a - e > 180;) a -= 360;
				for (; a - e < -180;) a += 360;
			}
			i.push(this._toViewCoords({
				lat: o,
				lon: a
			})), r.getGeometry().setCoordinates(i);
		}
	}
	_replaceLines(e, t, n) {
		let r = (e) => {
			let t = e.location ? e.location.lat : e.lat;
			return [e.location ? e.location.lon : e.lon, t];
		}, i = t.map(r), a = this._unwrapLongitudes(i.map((e) => e[0])), o = i.map((e, t) => [a[t], e[1]]), s = this._markerCoordsToViewCoords(o), c = e.getSource();
		if (!c) return;
		let l = (e) => {
			c.clear(), c.addFeature(new um({ geometry: new gm(e) }));
		};
		this._cancelLineAnimation();
		let u = n?.duration ?? 0;
		if (u <= 0 || s.length < 2) {
			l(s);
			return;
		}
		let d = (e) => {
			let t = e.map(r);
			if (t.length < 1 || t.length >= o.length) return 0;
			let n = this._unwrapLongitudes(t.map((e) => e[0]));
			for (let e = 0; e < t.length; e++) if (n[e] !== o[e][0] || t[e][1] !== o[e][1]) return 0;
			return t.length;
		}, f = (n?.retractFrom ?? []).map(r), p = null;
		if (f.length > 0) {
			let e = this._unwrapLongitudes(f.map((e) => e[0])), t = f.map((t, n) => [e[n], t[1]]), n = o.length >= 2 && o.length < t.length;
			for (let e = 0; n && e < o.length; e++) (t[e][0] !== o[e][0] || t[e][1] !== o[e][1]) && (n = !1);
			n && (p = this._markerCoordsToViewCoords(t).slice(o.length - 1));
		}
		let m = p ? this._pathLength(p) : 0, h = d(n?.growFrom ?? []), g = h >= 1 ? s.slice(0, h) : null, _ = h >= 1 ? s.slice(h - 1) : null, v = _ ? this._pathLength(_) : 0, y = this._easing, b = performance.now();
		g && l(g);
		let x = (e) => {
			let t = Math.min(1, Math.max(0, (e - b) / u)), n = y ? y(t) : t;
			if (p && m > 0) {
				let e = m - n * m, r = this._truncatePath(p, e);
				l([...s, ...r.slice(1)]), t >= 1 && l(s);
			} else if (g && _ && v > 0) {
				let e = this._truncatePath(_, n * v);
				l([...g, ...e.slice(1)]), t >= 1 && l(s);
			} else {
				let e = this._pathLength(s);
				l(this._truncatePath(s, n * e));
			}
			this._line_animation = t < 1 ? requestAnimationFrame(x) : null;
		};
		this._line_animation = requestAnimationFrame(x);
	}
	_cancelLineAnimation() {
		this._line_animation !== null && (cancelAnimationFrame(this._line_animation), this._line_animation = null);
	}
	_pathLength(e) {
		let t = 0;
		for (let n = 1; n < e.length; n++) t += Math.hypot(e[n][0] - e[n - 1][0], e[n][1] - e[n - 1][1]);
		return t;
	}
	_truncatePath(e, t) {
		if (t <= 0 || e.length < 2) return [];
		let n = [e[0]], r = 0;
		for (let i = 1; i < e.length; i++) {
			let a = Math.hypot(e[i][0] - e[i - 1][0], e[i][1] - e[i - 1][1]);
			if (r + a >= t) {
				let o = (t - r) / a;
				return n.push([e[i - 1][0] + o * (e[i][0] - e[i - 1][0]), e[i - 1][1] + o * (e[i][1] - e[i - 1][1])]), n;
			}
			r += a, n.push(e[i]);
		}
		return n;
	}
	_panTo(e, t) {
		this._map.getView().animate({
			center: this._toViewCoords(e),
			duration: this.options.duration,
			easing: this._easing
		});
	}
	_zoomTo(e, t) {
		this._map.getView().animate({
			zoom: e,
			duration: this.options.duration,
			easing: this._easing
		});
	}
	_viewTo(e, t) {
		let n = this._map.getView().getProjection().getCode() === "EPSG:4326" && Array.isArray(e.region) && e.region.length === 4 ? e.region : null;
		if (n) {
			this._fitRegion(n, t);
			return;
		}
		let r = this._latLngOf(e);
		if (!r) return;
		let i = !0, a = this.options.duration, o = this._getMapZoom(), s = r;
		this.options.map_as_image || this._line_active.setVisible(!0), e.zoom !== void 0 && e.zoom !== null && (o = e.zoom), t && (t.duration !== void 0 && (t.duration === 0 ? i = !1 : a = t.duration), t.zoom && this.options.calculate_zoom && (o = t.zoom)), this.options.map_center_offset && (s = this._getMapCenterOffset(s, o)), this._map.getView().animate({
			center: this._toViewCoords(s),
			zoom: o,
			duration: i ? a : 0,
			easing: this._easing
		}), this._mini_map && this.options.width > this.options.skinny_size && (this.zoom_min_max.min !== null && o - 1 <= this.zoom_min_max.min ? this._mini_map.setCollapsed(!0) : this._mini_map.setCollapsed(!1));
	}
	_fitRegion(e, t) {
		let [n, r, i, a] = e;
		if (!(i > 0) || !(a > 0)) return;
		let o = !0, s = this.options.duration;
		t && t.duration !== void 0 && (t.duration === 0 ? o = !1 : s = t.duration), this._map.getView().fit([
			n,
			r,
			n + i,
			r + a
		], {
			size: this._map.getSize(),
			padding: this._opaquePanelPadding(),
			duration: o ? s : 0,
			easing: this._easing
		}), this._mini_map && this.options.width > this.options.skinny_size && this._mini_map.setCollapsed(!0);
	}
	_toViewCoords(e) {
		return this._map.getView().getProjection().getCode() === "EPSG:4326" ? [e.lon, e.lat] : _s([e.lon, e.lat]);
	}
	_getMapZoom() {
		return this._map.getView().getZoom() || 0;
	}
	_getMapCenter() {
		let e = this._map.getView(), [t, n] = vs(e.getCenter() ?? [0, 0], e.getProjection());
		return {
			lat: n,
			lon: t
		};
	}
	_getMapCenterOffset(e, t) {
		let n = this.options.map_center_offset;
		if (!n || n.left === 0 && n.top === 0) return e;
		let r = this._map.getView(), i = r.getProjection(), a = this._toViewCoords(e), o = r.getResolutionForZoom(t);
		return this._fromViewCoords([a[0] - n.left * o, a[1] + n.top * o], i);
	}
	_fromViewCoords(e, t) {
		return t.getCode() === "EPSG:4326" ? {
			lat: e[1],
			lon: e[0]
		} : {
			lat: vs(e, t)[1],
			lon: e[0] / 6378137 * (180 / Math.PI)
		};
	}
	_tilesAllowed() {
		let e = sn(this.options);
		return !this.options.consent_required || !e || e.isGranted(Qt().key);
	}
	_latLngOf(e) {
		return !e || typeof e.lat != "number" || typeof e.lon != "number" ? null : {
			lat: e.lat,
			lon: e.lon
		};
	}
	_viewportSize() {
		let e = this._map?.getSize();
		return [e?.[0] || 1, e?.[1] || 1];
	}
	_getBoundsZoom(e, t, n) {
		let r = [[e.lon, e.lat], [t.lon, t.lat]], i = $i(this._markerCoordsToViewCoords(r)), a = this._map.getSize();
		if (!a || !a[0] || !a[1]) return 0;
		let o = (i[2] - i[0]) / a[0], s = (i[3] - i[1]) / a[1], c = Math.max(o, s) * 3;
		if (!isFinite(c) || c <= 0) return 0;
		let l = this._map.getView().getZoomForResolution(c);
		return l === void 0 || !isFinite(l) ? 0 : Math.max(0, Math.round(l));
	}
	_initialMapLocation() {}
	getRouteDistance() {
		let e = this._markers.map((e) => e.location()).filter((e) => !!e && isFinite(e.lat) && isFinite(e.lon));
		if (e.length < 2) return;
		let t = 0;
		for (let n = 1; n < e.length; n++) {
			let r = (e[n].lat - e[n - 1].lat) * Math.PI / 180, i = (e[n].lon - e[n - 1].lon) * Math.PI / 180, a = Math.sin(r / 2) ** 2 + Math.cos(e[n - 1].lat * Math.PI / 180) * Math.cos(e[n].lat * Math.PI / 180) * Math.sin(i / 2) ** 2;
			t += 12742 * Math.asin(Math.sqrt(a));
		}
		return t;
	}
	_markerOverview(e) {
		if (this._cancelLineAnimation(), this._line_active.setVisible(!1), e && this._map.getView().getAnimating() && (e = 0), this.options.map_type === "zoomify") {
			let t = this._map.getSize(), n = this._zoomifyOverview([t?.[0] || 1280, t?.[1] || 450]);
			if (n) {
				let t = this.options.map_center_offset && (this.options.map_center_offset.left !== 0 || this.options.map_center_offset.top !== 0) ? n.zoom - 1 : n.zoom, r = this._map.getView().getResolutionForZoom(t), i = [n.center[0] - (this.options.map_center_offset?.left ?? 0) * r, n.center[1] + (this.options.map_center_offset?.top ?? 0) * r];
				this._map.getView().animate({
					center: i,
					zoom: t,
					duration: e ?? this._transition_duration,
					easing: this._easing
				});
			}
		} else if (this.isImageSpace()) {
			let t = this._sourceOf(this._tile_layer);
			if (!t) return;
			let n = () => {
				try {
					let n = t.getTileGrid?.();
					if (n) {
						let t = n.getExtent(), r = this._viewportSize(), i = (t[2] - t[0]) / r[0], a = (t[3] - t[1]) / r[1], o = Math.max(i, a), s = this._map.getView(), c = s.getZoomForResolution(o) ?? 0, l = this.options.map_overview_center, u = l ? this._toViewCoords({
							lat: l.lat,
							lon: l.lon
						}) : [(t[0] + t[2]) / 2, (t[1] + t[3]) / 2], d = s.getProjection(), f = this._fromViewCoords(u, d), p = this._getMapCenterOffset(f, c);
						s.animate({
							center: this._toViewCoords(p),
							zoom: c,
							duration: e ?? this._transition_duration,
							easing: this._easing
						});
					}
				} catch (e) {
					console.warn("IIIF overview fit failed:", e);
				}
			};
			t.getState() === "ready" ? n() : t.once("change", () => {
				t.getState() === "ready" && n();
			});
		} else {
			this.bounds_array = this._getAllMarkersBounds(this._markers);
			let t = this.options.map_overview_center;
			if (t && this.bounds_array && this.bounds_array.length) {
				let n = $i(this._markerCoordsToViewCoords(this.bounds_array)), r = this._viewportSize(), i = Math.max((n[2] - n[0]) / r[0], (n[3] - n[1]) / r[1]), a = Math.max(0, Math.round(this._map.getView().getZoomForResolution(i) ?? 0) - 1), o = this._getMapCenterOffset({
					lat: t.lat,
					lon: t.lon
				}, a);
				this._map.getView().animate({
					center: this._toViewCoords(o),
					zoom: a,
					duration: e ?? this._transition_duration,
					easing: this._easing
				});
			} else if (this.options.map_center_offset && (this.options.map_center_offset.left !== 0 || this.options.map_center_offset.top !== 0)) {
				if (this.bounds_array && this.bounds_array.length) {
					let t = $i(this._markerCoordsToViewCoords(this.bounds_array)), n = this._viewportSize(), r = (t[2] - t[0]) / n[0], i = (t[3] - t[1]) / n[1], a = Math.max(r, i), o = Math.max(0, Math.round(this._map.getView().getZoomForResolution(a) ?? 0) - 1), s = [(t[0] + t[2]) / 2, (t[1] + t[3]) / 2], c = this._map.getView().getProjection(), l = this._fromViewCoords(s, c), u = this._getMapCenterOffset(l, o);
					this._map.getView().animate({
						center: this._toViewCoords(u),
						zoom: o,
						duration: e ?? this._transition_duration,
						easing: this._easing
					});
				}
			} else {
				this._fitView(this._map, this.bounds_array, 0, this._bboxExtent() !== null);
				let t = this._map.getView(), n = t.getZoom();
				if (n !== void 0) {
					let r = this._fromViewCoords(t.getCenter() ?? [0, 0], t.getProjection()), i = this._getMapCenterOffset(r, n);
					t.animate({
						center: this._toViewCoords(i),
						zoom: n,
						duration: e ?? this._transition_duration,
						easing: this._easing
					});
				}
			}
		}
		this._mini_map && this._mini_map.setCollapsed(!0);
	}
	_refreshMiniMapLayer() {
		if (!this._mini_map) return;
		let e = this._mini_map.getOverviewMap();
		if (e.getLayers().clear(), !this._tilesAllowed()) {
			this._tile_layer_mini = null;
			return;
		}
		this._tile_layer_mini = this._createTileLayer(this.options.map_type), e.addLayer(this._tile_layer_mini);
		let t = this.options.map_type === "zoomify" ? this._zoomifyPyramid() : null;
		if (t) {
			let n = e.getSize(), r = n && n[0] >= 50 && n[1] >= 50 ? n : [150, 100];
			e.getView().fit(t.extent, { size: r });
		} else this.bounds_array && this.bounds_array.length && this._fitView(e, this.bounds_array, 0, this._bboxExtent() !== null);
		this.isImageSpace() && this._fitMiniMapToImage();
	}
	applyOptions(e) {
		for (let t of e) switch (t) {
			case "map_type":
				this._tile_layer && this._map.removeLayer(this._tile_layer), this._tilesAllowed() && (this._tile_layer = this._createTileLayer(this.options.map_type), this._tile_layer.setZIndex(0), this._map.addLayer(this._tile_layer)), this._refreshMiniMapLayer(), this._updateAttribution(), this._el.map.style.backgroundColor = this.options.map_background_color;
				break;
			case "overlays":
				this._buildOverlays();
				break;
			case "show_lines":
			case "line_color":
			case "line_color_inactive":
			case "line_weight":
			case "line_opacity":
			case "line_dash":
			case "line_join": {
				let e = (e) => this._lineStyle(e);
				this._line.setStyle(e(this.options.line_color_inactive)), this._line.setOpacity(this.options.line_opacity), this._line.setVisible(this.options.show_lines), this._line_active.setStyle(e(this.options.line_color)), this._line_active.setVisible(this.options.show_lines);
				break;
			}
			case "map_background_color":
				this._el.map.style.backgroundColor = this.options.map_background_color;
				break;
			case "map_bbox": {
				let e = this._map.getView(), t = e.getCenter(), n = e.getZoom(), r = this._bboxExtent(), i = this.options.map_type === "iiif" && this.isImageSpace(), a = this.options.map_options?.view;
				this._map.setView(new ll({
					projection: i ? "EPSG:4326" : "EPSG:3857",
					center: t,
					zoom: n,
					minZoom: e.getMinZoom(),
					maxZoom: e.getMaxZoom(),
					...i ? {
						multiWorld: !0,
						resolutions: Nw
					} : {},
					...this.options.map_type === "zoomify" ? { multiWorld: !0 } : {},
					...r ? {
						extent: r,
						constrainOnlyCenter: !0
					} : {},
					...a ?? {}
				}));
				break;
			}
		}
		if (this._markers.length > 0 && this.current_marker < this._markers.length) {
			let e = this._markers[this.current_marker];
			e.data.type === "overview" ? this._markerOverview() : e.data.location && this._viewTo(e.data.location, { duration: 0 });
		}
	}
	_updateMapDisplay(e, t, n) {
		if (e) {
			let e = t || this.options.duration;
			this.timer && clearTimeout(this.timer), this.timer = setTimeout(() => {
				this._refreshMap(!1);
			}, e);
		} else this.timer || this._refreshMap(n !== !1);
		this._mini_map && this._mini_map.setCollapsed(this._el.container.offsetWidth < this.options.skinny_size);
	}
	_refreshMap(e = !1) {
		if (this._map) {
			this.timer &&= (clearTimeout(this.timer), null), this._map.updateSize();
			let t = this._markers[this.current_marker];
			t && t.data.type && t.data.type === "overview" ? (this._markerOverview(e ? 0 : void 0), e && this._map.renderSync()) : t && t.data.location && (e ? this._setViewInstant(t.data.location, this._getMapZoom()) : this._viewTo(t.data.location, { zoom: this._getMapZoom() }));
		}
	}
	_setViewInstant(e, t) {
		let n = this._latLngOf(e);
		if (!n) return;
		let r = n;
		this.options.map_center_offset && (r = this._getMapCenterOffset(r, t));
		let i = this._map.getView();
		i.setZoom(t), i.setCenter(this._toViewCoords(r)), this._map.renderSync();
	}
}, Fw = class {
	_fullscreenActive = !1;
	constructor(e, t, r) {
		if (this._el = {
			parent: {},
			container: {},
			button_overview: {},
			button_backtostart: {},
			button_fullscreen: {},
			progress: {},
			progress_fill: {},
			distance: {},
			button_collapse_toggle: {},
			arrow: {},
			line: {},
			coverbar: {},
			grip: {}
		}, this.collapsed = !1, typeof e == "object") this._el.container = e;
		else {
			let t = P.get(e);
			if (!t) throw Error("StoryMapJS: no element with id " + e);
			this._el.container = t;
		}
		t && (this._el.parent = t), this.options = {
			width: 600,
			height: 600,
			duration: 1e3,
			ease: bn,
			menubar_default_y: 0
		}, this.animator = {}, n(this.options, r), this._initLayout();
	}
	show(e) {}
	hide(e) {}
	setSticky(e) {
		this.options.menubar_default_y = e;
	}
	setColor(e) {
		e ? this._el.container.className = "vco-menubar vco-menubar-inverted" : this._el.container.className = "vco-menubar";
	}
	setFullscreenState(e) {
		this._fullscreenActive = e;
		let t = e ? "vco-icon-resize-small" : "vco-icon-resize-full";
		if (Ln.mobile) this._el.button_fullscreen.innerHTML = `<span class='${t}'></span>`;
		else {
			let n = e ? Nt.buttons.exit_fullscreen : Nt.buttons.fullscreen;
			this._el.button_fullscreen.innerHTML = `${n} <span class='${t}'></span>`;
		}
	}
	_renderOverviewLabel() {
		this._el.button_overview.innerHTML = this.options.map_as_image ? Nt.buttons.overview : Nt.buttons.map_overview;
	}
	_renderBackToStartLabel() {
		this._el.button_backtostart.innerHTML = Ln.mobile ? "<span class='vco-icon-goback'></span>" : Nt.buttons.backtostart + " <span class='vco-icon-goback'></span>";
	}
	_renderCollapseLabel(e) {
		let t = e ? "arrow-down" : "arrow-up";
		if (Ln.mobile) this._el.button_collapse_toggle.innerHTML = `<span class='vco-icon-${t}'></span>`;
		else {
			let n = e ? Nt.buttons.uncollapse_toggle : Nt.buttons.collapse_toggle;
			this._el.button_collapse_toggle.innerHTML = `${n} <span class='vco-icon-${t}'></span>`;
		}
	}
	refreshLabels() {
		Ln.mobile || (this._renderOverviewLabel(), this._renderBackToStartLabel(), this.setFullscreenState(this._fullscreenActive), this._renderCollapseLabel(this.collapsed));
	}
	setProgress(e, t) {
		if (!this.options.show_progress || !this._el.progress_fill) return;
		let n = t > 1 ? Math.round(e / (t - 1) * 100) : 100;
		this._el.progress_fill.style.width = n + "%", this._el.progress.setAttribute("role", "progressbar"), this._el.progress.setAttribute("aria-valuenow", String(e + 1)), this._el.progress.setAttribute("aria-valuemin", "1"), this._el.progress.setAttribute("aria-valuemax", String(t)), this._el.progress.setAttribute("aria-label", `${e + 1} / ${t}`);
	}
	setDistance(e) {
		if (!this.options.show_distance || !this._el.distance) return;
		if (e == null || !isFinite(e)) {
			this._el.distance.style.display = "none";
			return;
		}
		this._el.distance.style.display = "";
		let t = e * .621371, n = Wt();
		this._el.distance.textContent = e >= 10 ? `${Math.round(e).toLocaleString(n)} km · ${Math.round(t).toLocaleString("en-US")} mi` : `${e.toFixed(1)} km · ${t.toFixed(1)} mi`;
	}
	updateDisplay(e, t, n) {
		this._updateDisplay(e, t, n);
	}
	_onButtonOverview(e) {
		this.fire("overview", e);
	}
	_onButtonBackToStart(e) {
		this.fire("back_to_start", e);
	}
	_onButtonFullscreen(e) {
		this.fire("fullscreen", e);
	}
	_onButtonCollapseMap(e) {
		this.collapsed ? (this.collapsed = !1, this.show(), this._el.button_overview.style.display = this.options.show_overview === !1 ? "none" : "inline", this.fire("collapse", {
			y: this.options.menubar_default_y,
			collapsed: !1
		}), this._renderCollapseLabel(!1)) : (this.collapsed = !0, this.hide(25), this._el.button_overview.style.display = "none", this.fire("collapse", {
			y: 1,
			collapsed: !0
		}), this._renderCollapseLabel(!0));
	}
	_initLayout() {
		this._el.button_overview = P.create("button", "vco-menubar-button", this._el.container), this._el.button_overview.setAttribute("type", "button"), F.addListener(this._el.button_overview, "click", this._onButtonOverview, this), this.options.show_overview === !1 && (this._el.button_overview.style.display = "none"), this._el.button_backtostart = P.create("button", "vco-menubar-button", this._el.container), this._el.button_backtostart.setAttribute("type", "button"), F.addListener(this._el.button_backtostart, "click", this._onButtonBackToStart, this), this.options.show_back_to_start === !1 && (this._el.button_backtostart.style.display = "none"), this._el.button_fullscreen = P.create("button", "vco-menubar-button", this._el.container), this._el.button_fullscreen.setAttribute("type", "button"), F.addListener(this._el.button_fullscreen, "click", this._onButtonFullscreen, this), this.options.fullscreen === !1 && (this._el.button_fullscreen.style.display = "none"), this._el.button_collapse_toggle = P.create("button", "vco-menubar-button", this._el.container), this._el.button_collapse_toggle.setAttribute("type", "button"), F.addListener(this._el.button_collapse_toggle, "click", this._onButtonCollapseMap, this), this.options.map_as_image ? this._el.button_overview.innerHTML = Nt.buttons.overview : this._el.button_overview.innerHTML = Nt.buttons.map_overview, this.options.show_progress && (this._el.progress = P.create("span", "vco-menubar-progress", this._el.container), this._el.progress_fill = P.create("span", "vco-menubar-progress-fill", this._el.progress)), this.options.show_distance && (this._el.distance = P.create("span", "vco-menubar-distance", this._el.container)), Ln.mobile ? (this._el.button_backtostart.innerHTML = "<span class='vco-icon-goback'></span>", this._el.button_collapse_toggle.innerHTML = "<span class='vco-icon-arrow-up'></span>", this._el.button_fullscreen.innerHTML = "<span class='vco-icon-resize-full'></span>", this._el.container.setAttribute("ontouchstart", " ")) : (this._renderBackToStartLabel(), this._renderCollapseLabel(this.collapsed), this._el.button_fullscreen.innerHTML = Nt.buttons.fullscreen + " <span class='vco-icon-resize-full'></span>"), (this.options.layout === "landscape" || this.options.map_type === "none") && (this._el.button_collapse_toggle.style.display = "none");
	}
	_updateDisplay(e, t, n) {
		e && (this.options.width = e), t && (this.options.height = t);
	}
	dispose() {
		let e = [
			["button_overview", this._onButtonOverview],
			["button_backtostart", this._onButtonBackToStart],
			["button_fullscreen", this._onButtonFullscreen],
			["button_collapse_toggle", this._onButtonCollapseMap]
		];
		for (let [t, n] of e) {
			let e = this._el[t];
			e && F.removeListener(e, "click", n, this);
		}
		this._el.container?.getAnimations?.().forEach((e) => e.cancel()), this._el.container?.remove();
	}
}, Iw = class extends Mn(jn(Fw)) {
	constructor(...e) {
		super(...e);
	}
}, Lw = /* @__PURE__ */ new Set([
	"opacity",
	"zIndex",
	"flexGrow",
	"flexShrink",
	"order",
	"lineHeight"
]);
function Rw(e, t) {
	return typeof t == "number" ? Lw.has(e) ? String(t) : t + "px" : t;
}
function zw(e, t) {
	let n = e instanceof HTMLElement ? [e] : Array.from(e), r = /* @__PURE__ */ new Set([
		"duration",
		"easing",
		"complete",
		"delay",
		"bezier"
	]), i = [];
	for (let [e, n] of Object.entries(t)) r.has(e) || n == null || i.push([e, Rw(e, n)]);
	let a = {}, o = {};
	for (let [e, t] of i) a[e] = Bw(n[0], e), o[e] = t;
	let s = t.duration ?? 1e3, c = Vw(t.easing), l = t.complete;
	if (typeof n[0]?.animate != "function") {
		for (let e of n) for (let [t, n] of i) e.style.setProperty(t, n);
		return l?.(), { stop: () => {} };
	}
	let u = [];
	for (let e of n) {
		let t = e.animate([a, o], {
			duration: s,
			easing: c,
			fill: "forwards"
		});
		u.push(t);
	}
	let d = { stop: (e) => {
		for (let e of u) {
			try {
				e.commitStyles();
			} catch {}
			e.cancel();
		}
		if (e) for (let e of u) e.finish();
	} };
	if (l) {
		let e = u[0];
		e ? e.addEventListener("finish", () => l()) : l();
	}
	return d;
}
function Bw(e, t) {
	return e && (e.style.getPropertyValue(t) || window.getComputedStyle(e).getPropertyValue(t)) || "0px";
}
function Vw(e) {
	if (typeof e == "string") return e;
	if (typeof e == "function" && Ww()) {
		let t = [];
		for (let n = 0; n <= Hw; n++) {
			let r = e(n / Hw);
			t.push(String(Number(r.toFixed(4))));
		}
		return `linear(${t.join(",")})`;
	}
	return "ease";
}
var Hw = 24, Uw;
function Ww() {
	if (Uw === void 0) try {
		Uw = typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("animation-timing-function", "linear(0, 0.5, 1)");
	} catch {
		Uw = !1;
	}
	return Uw;
}
//#endregion
//#region src/slider/SlideNav.ts
var Gw = class {
	constructor(e, t, r) {
		this._el = {
			container: {},
			content_container: {},
			icon: {},
			title: {},
			description: {}
		}, this.mediatype = {}, this.data = {
			title: "Navigation",
			description: "Description"
		}, this.options = { direction: "previous" }, this.animator = null, this.animator_position = null, n(this.options, t), n(this.data, e), this._el.container = P.create("div", "vco-slidenav-" + this.options.direction), Ln.mobile && this._el.container.setAttribute("ontouchstart", " "), this._initLayout(), this._initEvents(), r && r.appendChild(this._el.container);
	}
	update(e) {
		this._update(e);
	}
	setColor(e) {
		e ? this._el.content_container.className = "vco-slidenav-content-container vco-slidenav-inverted" : this._el.content_container.className = "vco-slidenav-content-container";
	}
	updatePosition(e, t, n, r, i, a) {
		let o = {
			duration: n,
			easing: r,
			complete: () => {
				this._onUpdatePositionComplete(a);
			}
		}, s = i;
		for (let n in e) Object.hasOwn(e, n) && (o[n] = t ? e[n] + "%" : e[n] + "px");
		this.animator_position && this.animator_position.stop();
		let c;
		c = o.right ? "right" : "left", t ? this._el.container.style[c] = s + "%" : this._el.container.style[c] = s + "px", this.animator_position = zw(this._el.container, o);
	}
	_onUpdatePositionComplete(e) {
		e && (this._el.container.style.left = "", this._el.container.style.right = "");
	}
	_onMouseClick() {
		this.fire("clicked", this.options);
	}
	_update(e) {
		this.data = n(this.data, e), this.data.title !== "" && this._el.title.replaceChildren(Xn(this.data.title)), this.data.date && this._el.description.replaceChildren(Xn(this.data.date));
	}
	_initLayout() {
		this._el.container.setAttribute("role", "button"), this._el.container.setAttribute("tabindex", "0");
		let e = this.options.direction === "next" ? "Next slide" : "Previous slide";
		this._el.container.setAttribute("aria-label", e), this._el.content_container = P.create("div", "vco-slidenav-content-container", this._el.container), this._el.icon = P.create("div", "vco-slidenav-icon", this._el.content_container), this._el.icon.setAttribute("aria-hidden", "true"), this._el.title = P.create("div", "vco-slidenav-title", this._el.content_container), this._el.description = P.create("div", "vco-slidenav-description", this._el.content_container), this._el.icon.innerHTML = "&nbsp;", this._update();
	}
	_initEvents() {
		F.addListener(this._el.container, "click", this._onMouseClick, this), F.addListener(this._el.container, "keydown", this._onKeyDown, this);
	}
	_onKeyDown(e) {
		let t = e.key;
		(t === "Enter" || t === " " || t === "Spacebar") && (e.preventDefault(), this._onMouseClick());
	}
	dispose() {
		this.animator_position &&= (this.animator_position.stop(), null), F.removeListener(this._el.container, "click", this._onMouseClick, this), F.removeListener(this._el.container, "keydown", this._onKeyDown, this), this._el.container.remove();
	}
}, Kw = class extends Mn(jn(Gw)) {
	constructor(...e) {
		super(...e);
	}
}, qw = class {
	constructor(e, t, r) {
		this._el = {
			container: {},
			content_container: {},
			content: {},
			headline: {},
			date: {},
			start_btn: {}
		}, this.data = {
			uniqueid: "",
			headline: "",
			text: ""
		}, this.options = { title: !1 }, n(this.data, e), n(this.options, t), this._el.container = P.create("div", "vco-text"), this._el.container.id = this.data.uniqueid ?? "", this._initLayout(), r && r.appendChild(this._el.container);
	}
	show() {}
	hide() {}
	addTo(e) {
		e.appendChild(this._el.container);
	}
	removeFrom(e) {
		e.removeChild(this._el.container);
	}
	headlineHeight() {
		return this._el.headline.offsetHeight + 40;
	}
	addDateText(e) {
		this._el.date && (this._el.date.innerHTML = e);
	}
	onLoaded() {
		this.fire("loaded", this.data);
	}
	onAdd() {
		this.fire("added", this.data);
	}
	onRemove() {
		this.fire("removed", this.data);
	}
	_initLayout() {
		this._el.content_container = P.create("div", "vco-text-content-container", this._el.container);
		let t = this.data.text_align ?? this.options.text_align ?? "left";
		(t === "center" || t === "right") && this._el.content_container.classList.add("vco-text-align-" + t), this.data.date && this.data.date.created_time && this.data.date.created_time !== "" && (this._el.date = P.create("h3", "vco-headline-date", this._el.content_container), this.addDateText(e(this.data.date.created_time)));
		let n = this.data.headline ?? "";
		if (n !== "") {
			let e = "vco-headline";
			this.options.title && (e = "vco-headline vco-headline-title"), this._el.headline = P.create("h2", e, this._el.content_container), this._el.headline.appendChild(Xn(n));
		}
		let r = this.data.text ?? "";
		if (r !== "") {
			let t = "";
			t += g(r), this.data.date && this.data.date.created_time && this.data.date.created_time !== "" && this.data.date.created_time.length > 10 && (t += "<div class='vco-text-date'>" + e(this.data.date.created_time) + "</div>"), this._el.content = P.create("div", "vco-text-content", this._el.content_container), this._el.content.appendChild(Xn(t));
		}
		this.onLoaded();
	}
}, Jw = class extends jn(qw) {
	constructor(...e) {
		super(...e);
	}
}, Yw = class {
	constructor(e, t, r) {
		this._el = {
			container: {},
			scroll_container: {},
			background: {},
			content_container: {},
			content: {},
			call_to_action: null
		}, this._media = null, this._mediaclass = {}, this._text = {}, this._state = { loaded: !1 }, this._scroll_hint = null, this._scroll_hint_dismissed = !1, this.has = {
			headline: !1,
			text: !1,
			media: !1,
			title: !1,
			background: {
				image: !1,
				color: !1,
				color_value: ""
			}
		}, this.has.title = r === !0, this.title = "", this.data = {
			uniqueid: null,
			background: null,
			date: null,
			location: null,
			text: null,
			media: null
		}, this.options = {
			duration: 1e3,
			slide_padding_lr: 40,
			ease: Sn,
			width: 600,
			height: 600,
			skinny_size: 650,
			media_name: ""
		}, this.active = !1, this.animator = {}, this._onSlideScrollBound = null, this._media_ended_fns = [], n(this.options, t), n(this.data, e), this._initLayout();
	}
	show() {}
	hide() {}
	dispose() {
		this._onSlideScrollBound &&= (this._el.container?.removeEventListener("scroll", this._onSlideScrollBound), null), this._el.call_to_action && F.removeListener(this._el.call_to_action, "click", this._onCallToAction, this), this._scroll_hint &&= (F.removeListener(this._scroll_hint, "click", this._onScrollHintClick, this), null), this._el.container?.getAnimations?.().forEach((e) => e.cancel());
		for (let e of this._media_ended_fns) this._media?.off?.("media_ended", e);
		this._media_ended_fns = [], this._media?.dispose?.(), this._media = null, this._el.container?.remove();
	}
	setActive(e) {
		this.active = e, this.active ? (this.data.background && this.fire("background_change", this.has.background), this._scroll_hint_dismissed = !1, this._media?._state && (this._media._state.eager = !0), this.loadMedia(), this._eagerLoadImages(), this._updateScrollHint()) : (this.stopMedia(), this._hideScrollHint());
	}
	updateDisplay(e, t, n) {
		this._updateDisplay(e, t, n);
	}
	loadMedia() {
		this._media && !this._state.loaded && (this._media.loadMedia(), this._state.loaded = !0);
	}
	_eagerLoadImages() {
		this._el.container.querySelectorAll("img.vco-media-image").forEach((e) => {
			e.loading = "eager";
		});
	}
	stopMedia() {
		if (this._media && this._state.loaded) {
			try {
				this._media.stopMedia();
			} catch (e) {
				if (e.message === "this._el.content_item.querySelector is not a function") console.log("Ignoring error in editor context: " + e.message);
				else throw e;
			}
			this._media._state?.loaded || (this._state.loaded = !1);
		}
	}
	getBackground() {
		return this.has.background;
	}
	hasPlayableMedia() {
		let e = this.options.media_type;
		return e === "audio" || e === "video";
	}
	onMediaEnded(e) {
		this.hasPlayableMedia() && this._media?.on && (this._media.on("media_ended", e), this._media_ended_fns.push(e));
	}
	scrollToTop() {
		this._el.container.scrollTop = 0;
	}
	_updateScrollHint() {
		if (!this.active || this._scroll_hint_dismissed) {
			this._hideScrollHint();
			return;
		}
		let e = this._el.container;
		if (!(e.scrollHeight > e.clientHeight + 1)) {
			this._hideScrollHint();
			return;
		}
		this._scroll_hint || (this._scroll_hint = P.create("div", "vco-slide-scroll-hint", e), this._scroll_hint.innerHTML = "<span class='vco-icon-arrow-down'></span>", F.addListener(this._scroll_hint, "click", this._onScrollHintClick, this)), this._scroll_hint.style.display = "flex";
	}
	_hideScrollHint() {
		this._scroll_hint && (this._scroll_hint.style.display = "none");
	}
	_onScrollHintClick() {
		let e = this._el.container;
		e.scrollBy({
			top: e.clientHeight * .8,
			behavior: "smooth"
		}), this._scroll_hint_dismissed = !0, this._hideScrollHint();
	}
	_onSlideScroll() {
		this.active && !this._scroll_hint_dismissed && (this._scroll_hint_dismissed = !0, this._hideScrollHint());
	}
	addCallToAction(e) {
		this._el.call_to_action = P.create("div", "vco-slide-calltoaction", this._el.content_container);
		let t = P.create("span", "vco-slide-calltoaction-button-text");
		t.appendChild(Xn(e)), this._el.call_to_action?.appendChild(t), F.addListener(this._el.call_to_action, "click", this._onCallToAction, this);
	}
	_onCallToAction(e) {
		this.fire("call_to_action", e);
	}
	_initLayout() {
		if (this._el.container = P.create("div", "vco-slide"), this.data.uniqueid && (this._el.container.id = this.data.uniqueid), this._el.scroll_container = P.create("div", "vco-slide-scrollable-container", this._el.container), this._el.content_container = P.create("div", "vco-slide-content-container", this._el.scroll_container), this._el.content = P.create("div", "vco-slide-content", this._el.content_container), this._el.background = P.create("div", "vco-slide-background", this._el.container), this._onSlideScrollBound = this._onSlideScroll.bind(this), this._el.container.addEventListener("scroll", this._onSlideScrollBound, { passive: !0 }), this.data.background) {
			let e = this.data.background;
			e.url && (this.has.background.image = !0, this._el.container.className += " vco-full-image-background", this.has.background.color_value = "#000", this._el.background.style.backgroundImage = "url('" + e.url + "')", this._el.background.style.display = "block"), e.color && (this.has.background.color = !0, this._el.container.className += " vco-full-color-background", this.has.background.color_value = e.color), e.text_background && (this._el.container.className += " vco-text-background");
		}
		this.data.media && this.data.media.url && this.data.media.url !== "" && (this.has.media = !0), this.data.text && this.data.text.text && (this.has.text = !0), this.data.text?.headline && (this.has.headline = !0, this.title = this.data.text.headline);
		let e = this.data.media;
		this.has.media && e && (e.mediatype = Vr(e), this.options.media_name = e.mediatype.name, this.options.media_type = e.mediatype.type, this._media = new e.mediatype.cls(e, this.options), this._media.on?.("media_loaded", () => this._updateScrollHint())), (this.has.text || this.has.headline) && this.data.text && (this._text = new Jw(this.data.text, {
			title: this.has.title,
			text_align: this.options.text_align
		})), !this.has.text && !this.has.headline && this.has.media ? (this._el.container.className += " vco-slide-media-only", this._media?.addTo(this._el.content)) : this.has.headline && this.has.media && !this.has.text ? (this._el.container.className += " vco-slide-media-only", this._text.addTo(this._el.content), this._media?.addTo(this._el.content)) : this.has.text && this.has.media ? (this._media?.addTo(this._el.content), this._text.addTo(this._el.content)) : (this.has.text || this.has.headline) && (this._el.container.className += " vco-slide-text-only", this._text.addTo(this._el.content)), this.onLoaded();
	}
	_updateDisplay(e, t, n) {
		let r, i, a;
		e ? this.options.width = e : this.options.width = this._el.container.offsetWidth, Ln.mobile && this.options.width <= this.options.skinny_size ? (r = "0px", i = "0px", a = this.options.width - 0 + "px") : n === "landscape" ? (r = "40px", i = "75px", a = this.options.width - 115 + "px") : (this.options.width, this.options.skinny_size, r = this.options.slide_padding_lr + "px", i = this.options.slide_padding_lr + "px", a = this.options.width - this.options.slide_padding_lr * 2 + "px"), this._el.content.style.paddingLeft = r, this._el.content.style.paddingRight = i, this._el.content.style.width = a, this._el.call_to_action && (this._el.call_to_action.style.paddingLeft = r, this._el.call_to_action.style.paddingRight = i, this._el.call_to_action.style.width = a), t ? this.options.height = t : this.options.height = this._el.container.offsetHeight, this._media && (!this.has.text && this.has.headline ? this._media.updateDisplay(this.options.width, this.options.height - this._text.headlineHeight(), n) : this._media.updateDisplay(this.options.width, this.options.height, n)), this._updateScrollHint();
	}
}, Xw = class extends Mn(jn(Yw)) {
	constructor(...e) {
		super(...e);
	}
};
//#endregion
//#region src/ui/Swipable.ts
function Zw(e, t, n) {
	return typeof n == "number" && e > n ? n : typeof t == "number" && e < t ? t : e;
}
var Qw = class {
	constructor(e, t, r) {
		this.mousedrag = {
			down: "mousedown",
			up: "mouseup",
			leave: "mouseleave",
			move: "mousemove"
		}, this.touchdrag = {
			down: "touchstart",
			up: "touchend",
			cancel: "touchcancel",
			leave: "mouseleave",
			move: "touchmove"
		}, this._el = {
			drag: e,
			move: e
		}, t && (this._el.move = t), this.options = {
			snap: !1,
			enable: {
				x: !0,
				y: !0
			},
			constraint: {
				top: !1,
				bottom: !1,
				left: 0,
				right: !1
			},
			momentum_multiplier: 2e3,
			duration: 1e3,
			ease: bn
		}, this.animator = null, this.dragevent = this.mousedrag, Ln.touch && (this.dragevent = this.touchdrag), this.data = {
			sliding: !1,
			direction: "none",
			pagex: {
				start: 0,
				end: 0
			},
			pagey: {
				start: 0,
				end: 0
			},
			pos: {
				start: {
					x: 0,
					y: 0
				},
				end: {
					x: 0,
					y: 0
				}
			},
			new_pos: {
				x: 0,
				y: 0
			},
			new_pos_parent: {
				x: 0,
				y: 0
			},
			time: {
				start: 0,
				end: 0
			},
			touch: !1
		}, n(this.options, r);
	}
	enable(e) {
		F.addListener(this._el.drag, this.dragevent.down, this._onDragStart, this), F.addListener(this._el.drag, this.dragevent.up, this._onDragEnd, this), this.dragevent === this.touchdrag && this.touchdrag.cancel && F.addListener(this._el.drag, this.touchdrag.cancel, this._onDragEnd, this), this.data.pos.start = {
			x: 0,
			y: 0
		}, this._el.move.style.left = this.data.pos.start.x + "px", this._el.move.style.top = this.data.pos.start.y + "px", this._el.move.style.position = "absolute";
	}
	disable() {
		F.removeListener(this._el.drag, this.dragevent.down, this._onDragStart, this), F.removeListener(this._el.drag, this.dragevent.up, this._onDragEnd, this), this.dragevent === this.touchdrag && this.touchdrag.cancel && F.removeListener(this._el.drag, this.touchdrag.cancel, this._onDragEnd, this);
	}
	dispose() {
		this.stopMomentum(), this.disable(), F.removeListener(this._el.drag, this.dragevent.move, this._onDragMove, this), F.removeListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
	}
	stopMomentum() {
		this.animator && this.animator.stop();
	}
	updateConstraint(e) {
		this.options.constraint = e;
	}
	_onDragStart(e) {
		if (this.animator && this.animator.stop(), this.data.sliding && this._detachGestureListeners(), Ln.touch) {
			let t = e.originalEvent ? e.originalEvent.touches[0] : e.targetTouches ? e.targetTouches[0] : null;
			this.data.pagex.start = t ? t.clientX : e.pageX ?? 0, this.data.pagey.start = t ? t.clientY : e.pageY ?? 0;
		} else this.data.pagex.start = e.pageX ?? 0, this.data.pagey.start = e.pageY ?? 0;
		this.data.sliding = !0, this.options.enable.x, this.options.enable.y, this.data.pos.start = {
			x: this._el.move.offsetLeft,
			y: this._el.move.offsetTop
		}, this.data.time.start = Date.now(), this.fire("dragstart", this.data), this._attachGestureListeners();
	}
	_onDragEnd(e) {
		let t = this.data.sliding;
		if (Ln.touch && t) {
			let t = e.originalEvent ? e.originalEvent.changedTouches[0] ?? e.originalEvent.touches[0] : null;
			t && (this.data.pagex.end = t.clientX, this.data.pagey.end = t.clientY);
		} else !Ln.touch && t && (this.data.pagex.end = e.pageX ?? this.data.pagex.end, this.data.pagey.end = e.pageY ?? this.data.pagey.end);
		this.data.sliding = !1, this._detachGestureListeners(), t && (this.fire("dragend", this.data), this._momentum());
	}
	_attachGestureListeners() {
		F.addListener(this._el.drag, this.dragevent.move, this._onDragMove, this), F.addListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
	}
	_detachGestureListeners() {
		F.removeListener(this._el.drag, this.dragevent.move, this._onDragMove, this), F.removeListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
	}
	_onDragMove(e) {
		let t = {
			x: 0,
			y: 0
		};
		if (this.data.sliding = !0, Ln.touch) {
			let t = e.originalEvent ? e.originalEvent.touches[0] : e.targetTouches ? e.targetTouches[0] : null;
			this.data.pagex.end = t ? t.clientX : e.pageX ?? this.data.pagex.end, this.data.pagey.end = t ? t.clientY : e.pageY ?? this.data.pagey.end;
		} else this.data.pagex.end = e.pageX ?? this.data.pagex.end, this.data.pagey.end = e.pageY ?? this.data.pagey.end;
		t.x = this.data.pagex.end - this.data.pagex.start, t.y = this.data.pagey.end - this.data.pagey.start, this.data.pos.end = {
			x: this.data.pos.start.x,
			y: this.data.pos.start.y
		}, this.data.new_pos.x = this.data.pos.start.x - t.x, this.data.new_pos.y = this.data.pos.start.y - t.y, this.options.enable.x && Math.abs(t.x) > Math.abs(t.y) && (e.preventDefault(), this._el.move.style.left = this.data.new_pos.x + "px"), this.options.enable.y && Math.abs(t.y) > Math.abs(t.x) && (e.preventDefault(), this._el.move.style.top = this.data.new_pos.y + "px"), this.fire("dragmove", this.data);
	}
	_momentum() {
		let e = {
			x: 0,
			y: 0,
			time: 0
		}, t = {
			x: 0,
			y: 0,
			time: 0
		}, n = {
			x: !1,
			y: !1
		}, r = !1;
		this.data.direction = null, t.x = this.options.momentum_multiplier * (this.data.pagex.end - this.data.pagex.start), t.y = this.options.momentum_multiplier * (this.data.pagey.end - this.data.pagey.start), t.time = (Date.now() - this.data.time.start) * 10, e.x = Math.round(t.x / Math.max(t.time, 1)), e.y = Math.round(t.y / Math.max(t.time, 1)), this.data.new_pos.x = this.data.pos.start.x + e.x, this.data.new_pos.y = this.data.pos.start.y + e.y, this.options.enable.x || (this.data.new_pos.x = this.data.pos.start.x), this.options.enable.y || (this.data.new_pos.y = this.data.pos.start.y), t.time < 2e3 && (r = !0), this.options.enable.x && this.options.enable.y ? Math.abs(t.x) > Math.abs(t.y) ? n.x = !0 : n.y = !0 : this.options.enable.x ? Math.abs(t.x) > Math.abs(t.y) && (n.x = !0) : Math.abs(t.y) > Math.abs(t.x) && (n.y = !0), n.x && (Math.abs(this.data.pagex.end - this.data.pagex.start) > this._el.drag.offsetWidth / 2 && (r = !0), Math.abs(t.x) > 1e4 && (this.data.direction = this.data.pagex.end < this.data.pagex.start ? "left" : "right")), n.y && (Math.abs(this.data.pagey.end - this.data.pagey.start) > this._el.drag.offsetHeight / 2 && (r = !0), Math.abs(t.y) > 1e4 && (this.data.direction = this.data.pagey.end < this.data.pagey.start ? "up" : "down")), this._animateMomentum(), r && this.data.direction ? this.fire("swipe_" + this.data.direction, this.data) : this.data.direction ? this.fire("swipe_nodirection", this.data) : this.options.snap && (this.animator?.stop(), this.animator = zw(this._el.move, {
			top: this.data.pos.start.y,
			left: this.data.pos.start.x,
			duration: this.options.duration,
			easing: xn
		}));
	}
	_animateMomentum() {
		let e = {
			x: this.data.new_pos.x,
			y: this.data.new_pos.y
		}, t = {
			duration: this.options.duration,
			easing: xn
		};
		this.options.enable.y && (e.y = Zw(e.y, this.options.constraint.top, this.options.constraint.bottom), t.top = Math.floor(e.y) + "px"), this.options.enable.x && (e.x = Zw(e.x, this.options.constraint.left, this.options.constraint.right), t.left = Math.floor(e.x) + "px"), this.animator = zw(this._el.move, t), this.fire("momentum", this.data);
	}
}, $w = class extends jn(Qw) {
	constructor(...e) {
		super(...e);
	}
}, eT = class {
	constructor(e, t, r, i) {
		if (this._el = {
			container: {},
			slider_container_mask: {},
			slider_container: {},
			slider_item_container: {},
			background: {},
			live_region: null
		}, this._nav = {
			previous: {},
			next: {}
		}, this.slide_spacing = 0, this._slides = [], this.current_slide = 0, this.current_bg_color = null, this.data = {}, this.options = {
			id: "",
			layout: "portrait",
			width: 600,
			height: 600,
			default_bg_color: {
				r: 255,
				g: 255,
				b: 255
			},
			slide_padding_lr: 40,
			start_at_slide: 1,
			slide_default_fade: "0%",
			duration: 1e3,
			ease: bn,
			trackResize: !0
		}, typeof e == "object") this._el.container = e, this.options.id = l(6, "vco");
		else {
			this.options.id = e;
			let t = P.get(e);
			if (!t) throw Error("StoryMapJS: no element with id " + e);
			this._el.container = t;
		}
		this._el.container.id || (this._el.container.id = this.options.id), this.animator = null, this.animator_background = null, this.preloadTimer = void 0, this.preloadIdleHandle = void 0, n(this.options, r), n(this.data, t), i && this.init();
	}
	init() {
		this._initLayout(), this._initEvents(), this._initData(), this._updateDisplay(), this.goTo(this.options.start_at_slide), this._onLoaded(), this._introInterface();
	}
	updateDisplay(e, t, n, r) {
		this._updateDisplay(e, t, n, r);
	}
	createSlide(e) {
		this._createSlide(e);
	}
	createSlides(e) {
		this._createSlides(e);
	}
	_createSlides(e) {
		if (e && e.length !== 0) for (let t = 0; t < e.length; t++) {
			let n = e[t].uniqueid ? e[t] : {
				...e[t],
				uniqueid: l(6, "vco-slide")
			};
			t === 0 ? this._createSlide(n, !0) : this._createSlide(n, !1);
		}
	}
	_createSlide(e, t) {
		let n = new Xw(e, this.options, t);
		this._addSlide(n), this._slides.push(n);
	}
	_addSlide(e) {
		e.addTo(this._el.slider_item_container), e.on("added", this._onSlideAdded, this), e.on("background_change", this._onBackgroundChange, this);
	}
	goToId(e, t, n) {
		let r;
		if (typeof e == "string" || e instanceof String) {
			if (r = s(String(e), this._slides, "uniqueid"), r === -1) {
				console.warn("StoryMapJS: no slide with uniqueid", e);
				return;
			}
		} else r = e;
		this.goTo(r, t, n);
	}
	_cancelPreload() {
		this.preloadTimer !== void 0 && (clearTimeout(this.preloadTimer), this.preloadTimer = void 0), this.preloadIdleHandle !== void 0 && (window.cancelIdleCallback?.(this.preloadIdleHandle), this.preloadIdleHandle = void 0);
	}
	dispose() {
		this._cancelPreload(), this._swipable && this._swipable.dispose(), F.removeListener(this._el.container, "keydown", this._onKeyDown, this);
		for (let e of [
			this._el.container,
			this._el.slider_container,
			this._el.background
		]) e?.getAnimations?.().forEach((e) => e.cancel());
		for (let e of this._slides) e.dispose();
		this._nav.previous?.dispose(), this._nav.next?.dispose(), this._message?.dispose(), this._slides = [];
	}
	goTo(e, t, n) {
		this.changeBackground({
			color_value: "",
			image: !1
		}), this._cancelPreload();
		for (let e = 0; e < this._slides.length; e++) this._slides[e].setActive(!1);
		if (e < this._slides.length && e >= 0) {
			let r = this.current_slide;
			this.current_slide = e;
			let i = m(r, e);
			if (this.animator && this.animator.stop(), this._swipable && this._swipable.stopMomentum(), t || h() ? (this._el.slider_container.style.left = -(this.slide_spacing * e) + "px", this._onSlideChange(n)) : (this._onSlideChange(n), this.animator = zw(this._el.slider_container, {
				left: -(this.slide_spacing * e) + "px",
				duration: i,
				easing: this.options.ease
			})), this._slides.length > 0 && this._slides[this.current_slide].setActive(!0), this._el.live_region) {
				let e = this._slides[this.current_slide]?.title;
				this._el.live_region.textContent = e || `Slide ${this.current_slide + 1} of ${this._slides.length}`;
			}
			this._slides[this.current_slide + 1] && (this._slides[this.current_slide + 1].loadMedia(), this._slides[this.current_slide + 1].scrollToTop()), this._slides[this.current_slide + 1] ? (this.showNav(this._nav.next, !0), this._nav.next.update(this.getNavInfo(this._slides[this.current_slide + 1]))) : this.showNav(this._nav.next, !1), this._slides[this.current_slide - 1] ? (this.showNav(this._nav.previous, !0), this._nav.previous.update(this.getNavInfo(this._slides[this.current_slide - 1]))) : this.showNav(this._nav.previous, !1);
			let a = window;
			a.requestIdleCallback ? this.preloadIdleHandle = a.requestIdleCallback(() => this.preloadSlides(), { timeout: this.options.duration }) : this.preloadTimer = setTimeout(() => {
				this.preloadSlides();
			}, this.options.duration);
		}
	}
	preloadSlides() {
		this._slides[this.current_slide + 1] && (this._slides[this.current_slide + 1].loadMedia(), this._slides[this.current_slide + 1].scrollToTop()), this._slides[this.current_slide + 2] && (this._slides[this.current_slide + 2].loadMedia(), this._slides[this.current_slide + 2].scrollToTop()), this._slides[this.current_slide - 1] && (this._slides[this.current_slide - 1].loadMedia(), this._slides[this.current_slide - 1].scrollToTop()), this._slides[this.current_slide - 2] && (this._slides[this.current_slide - 2].loadMedia(), this._slides[this.current_slide - 2].scrollToTop());
	}
	getNavInfo(e) {
		let t = {
			title: "",
			description: ""
		};
		return e.data.text && e.data.text.headline && (t.title = e.data.text.headline), t;
	}
	next() {
		this.current_slide + 1 < this._slides.length ? this.goTo(this.current_slide + 1) : this.goTo(this.current_slide);
	}
	previous() {
		this.current_slide - 1 >= 0 ? this.goTo(this.current_slide - 1) : this.goTo(this.current_slide);
	}
	showNav(e, t) {
		this.options.width <= 500 && Ln.mobile || (t ? e.show() : e.hide());
	}
	changeBackground(e) {
		let t = !1, n, r = this.options.slide_default_fade, i = "";
		this._el.background.getAttribute("style"), n = e.color_value && p(e.color_value) || this.options.default_bg_color, this.animator_background && this.animator_background.stop();
		let a = n.r + "," + n.g + "," + n.b;
		(!this.current_bg_color || this.current_bg_color !== a) && (this.current_bg_color = a, t = !0), t && (this.options.layout === "landscape" ? (this._nav.next.setColor(!1), this._nav.previous.setColor(!1), n.r < 255 && n.g < 255 && n.b < 255 && (r = "15%"), e.image && (r = "0%"), i += "opacity:0;", i += "background-image: linear-gradient(to right, rgba(" + a + ",0.0001 ) " + r + ", rgba(" + a + ",0.87) 15%);", i += "background-repeat: repeat-x;") : (e.color_value ? i += "background-color:" + e.color_value + ";" : i += "background-color:#FFF;", n.r < 255 && n.g < 255 && n.b < 255 || e.image ? (this._nav.next.setColor(!0), this._nav.previous.setColor(!0)) : (this._nav.next.setColor(!1), this._nav.previous.setColor(!1))), this.animator_background = zw(this._el.background, {
			opacity: 0,
			duration: this.options.duration / 2,
			easing: this.options.ease,
			complete: () => {
				this.fadeInBackground(i);
			}
		}));
	}
	fadeInBackground(e) {
		this.animator_background && this.animator_background.stop(), e && this._el.background.setAttribute("style", e), this.animator_background = zw(this._el.background, {
			opacity: 1,
			duration: this.options.duration / 2,
			easing: this.options.ease
		});
	}
	_updateDisplay(e, t, n, r) {
		let i;
		i = r === void 0 ? this.options.layout : r, this.options.layout = i, e ? this.options.width = e : this.options.width = this._el.container.offsetWidth, t ? this.options.height = t : this.options.height = this._el.container.offsetHeight, this.slide_spacing = this.options.width * 2;
		let a = this.options.height / 2;
		this._nav.next.setPosition({ top: a }), this._nav.previous.setPosition({ top: a });
		for (let e = 0; e < this._slides.length; e++) this._slides[e].updateDisplay(this.options.width, this.options.height, i), this._slides[e].setPosition({
			left: this.slide_spacing * e,
			top: 0
		});
		this.goTo(this.current_slide, !0, !0);
	}
	_introInterface() {
		if (this.options.call_to_action && this._slides.length > 0) {
			let e = typeof this.options.call_to_action_text == "string" && this.options.call_to_action_text !== "" ? this.options.call_to_action_text : Nt.messages.start;
			this._slides[0]?.addCallToAction(e), this._slides[0]?.on("call_to_action", this.next, this);
		}
		this.options.width <= (this.options.skinny_size ?? 0) || (this._nav.next.updatePosition({ right: "130" }, !1, this.options.duration * 3, this.options.ease, -100, !0), this._nav.previous.updatePosition({ left: "-100" }, !0, this.options.duration * 3, this.options.ease, -200, !0));
	}
	_initLayout() {
		if (this._el.container.className += " vco-storyslider", this._el.slider_container_mask = P.create("div", "vco-slider-container-mask", this._el.container), this._el.background = P.create("div", "vco-slider-background", this._el.container), this._el.slider_container = P.create("div", "vco-slider-container", this._el.slider_container_mask), this._el.slider_item_container = P.create("div", "vco-slider-item-container", this._el.slider_container), this._el.live_region = P.create("div", "vco-sr-only", this._el.container), this._el.live_region.setAttribute("aria-live", "polite"), this._el.live_region.setAttribute("role", "status"), this.options.width = this._el.container.offsetWidth, this.options.height = this._el.container.offsetHeight, this._nav.previous = new Kw({
			title: "Previous",
			description: "description"
		}, { direction: "previous" }), this._nav.next = new Kw({
			title: "Next",
			description: "description"
		}, { direction: "next" }), this._nav.next.addTo(this._el.container), this._nav.previous.addTo(this._el.container), this._el.slider_container.style.left = "0px", Ln.touch) {
			this._swipable = new $w(this._el.slider_container_mask, this._el.slider_container, {
				enable: {
					x: !0,
					y: !1
				},
				snap: !0
			}), this._swipable.enable();
			let e = Gt();
			this._message = new In({}, {
				message_class: "vco-message-full",
				message_icon_class: e ? "vco-icon-swipe-right" : "vco-icon-swipe-left"
			}), this._message.updateMessage(Nt.buttons.swipe_to_navigate), this._message.addTo(this._el.container);
		}
	}
	_initEvents() {
		this._nav.next.on("clicked", this._onNavigation, this), this._nav.previous.on("clicked", this._onNavigation, this), this._message && this._message.on("clicked", this._onMessageClick, this), this._swipable && (this._swipable.on("swipe_left", this._onNavigation, this), this._swipable.on("swipe_right", this._onNavigation, this), this._swipable.on("swipe_nodirection", this._onSwipeNoDirection, this)), this._el.container.setAttribute("tabindex", "0"), F.addListener(this._el.container, "keydown", this._onKeyDown, this);
	}
	_onKeyDown(e) {
		let t = e.key, n = e.target, r = n?.tagName?.toLowerCase();
		r === "input" || r === "textarea" || r === "select" || n?.isContentEditable || (t === "ArrowRight" || t === "ArrowDown" ? (F.preventDefault(e), this.next()) : (t === "ArrowLeft" || t === "ArrowUp") && (F.preventDefault(e), this.previous()));
	}
	_initData() {
		this._createSlides(this.data.slides ?? []);
	}
	_onBackgroundChange(e) {
		let t = this._slides[this.current_slide].getBackground();
		this.changeBackground(e), this.fire("colorchange", t);
	}
	_onMessageClick(e) {
		this._message.hide();
	}
	_onSwipeNoDirection(e) {
		this.goTo(this.current_slide);
	}
	_onNavigation(e) {
		e.direction === "next" || e.direction === "left" ? this.next() : (e.direction === "previous" || e.direction === "right") && this.previous(), this.fire("nav_" + e.direction, this.data);
	}
	_onSlideAdded(e) {
		this.fire("slideAdded", this.data);
	}
	_onSlideChange(e) {
		e || this.fire("change", {
			current_slide: this.current_slide,
			uniqueid: this._slides[this.current_slide].data.uniqueid
		});
	}
	_onLoaded() {
		this.fire("loaded", this.data), this._slides.length > 0 && this.fire("title", { title: this._slides[0].title });
	}
}, tT = class extends jn(eT) {
	constructor(...e) {
		super(...e);
	}
}, nT = 1;
function rT(e) {
	if (e.startsWith("stock:")) {
		let t = e.split(":")[1] || "default";
		return /^[a-z0-9-]+$/i.test(t) ? new URL("../css/fonts/font." + t + ".css", import.meta.url).href : (console.warn("StoryMapJS: ignoring font_css with an invalid stock theme name", t), new URL(
			/* @vite-ignore */
			"../css/fonts/font.default.css",
			import.meta.url
		).href);
	}
	return /^[a-z][a-z0-9+.-]*:/i.test(e) || e.startsWith("//") ? e : new URL(e, document.baseURI).href;
}
function iT(e) {
	if (/^(data|blob):/i.test(e)) return !0;
	try {
		return new URL(e, document.baseURI).origin !== window.location.origin;
	} catch {
		return !0;
	}
}
var aT = class {
	constructor(e, t, r, i) {
		for (let e in i) {
			let t = i[e];
			if (typeof t == "function") this.on(e, t);
			else for (let n in t) typeof t[n] == "function" ? this.on(e, t[n]) : console.log("WARNING: Ignoring invalid callback '" + t[n] + "' defined for listener '" + e + "' in StoryMap constructor");
		}
		if (this.version = "0.10.8", this.ready = !1, this._el = {
			container: {},
			storyslider: {},
			map: null,
			menubar: {}
		}, typeof e == "object") this._el.container = e;
		else {
			let t = P.get(e);
			if (!t) throw Error("StoryMapJS: no element with id " + e);
			this._el.container = t;
		}
		return this._storyslider = {}, this._map = null, this.map = null, this._menubar = {}, this._loaded = {
			storyslider: !1,
			map: !1
		}, this.data = {}, this.options = {
			script_path: oT.SCRIPT_PATH,
			map_options: {},
			height: this._el.container.offsetHeight,
			width: this._el.container.offsetWidth,
			layout: "landscape",
			base_class: "",
			default_bg_color: {
				r: 255,
				g: 255,
				b: 255
			},
			map_size_sticky: 2.5,
			map_center_offset: null,
			start_at_slide: 0,
			call_to_action: !1,
			call_to_action_text: "",
			menubar_height: 0,
			fullscreen: !0,
			show_overview: !0,
			show_back_to_start: !0,
			skinny_size: 650,
			duration: 1e3,
			ease: bn,
			trackResize: !0,
			keyboard: !1,
			nocache: !1,
			autoplay: 0,
			autoplay_media: !1,
			show_progress: !1,
			marker_labels: !1,
			text_align: "left",
			map_overview_center: null,
			map_type: "",
			tile_source_factory: null,
			attribution: "",
			map_mini: !0,
			map_as_image: !1,
			map_access_token: "",
			map_background_color: "#d9d9d9",
			map_area: "full",
			map_bbox: null,
			overview_extent: null,
			overlays: [],
			tilejson: void 0,
			consent_required: !1,
			zoomify: void 0,
			text_color: "",
			text_background_color: "",
			show_distance: !1,
			use_custom_markers: !1,
			iiif: {
				url: "",
				attribution: ""
			},
			map_height: 300,
			storyslider_height: 600,
			slide_padding_lr: 45,
			slide_default_fade: "0%",
			menubar_default_y: 0,
			calculate_zoom: !0,
			line_follows_path: !0,
			line_color: "#c34528",
			line_color_inactive: "#CCC",
			line_join: "miter",
			line_weight: 3,
			line_opacity: .8,
			line_dash: "5,5",
			show_lines: !0,
			show_history_line: !0,
			api_key_flickr: "",
			font_css: "stock:default",
			language: "en"
		}, this.animator_map = null, this.animator_storyslider = null, this._resize_observer = null, this._on_resize = null, this._on_keydown_global = null, this._on_fullscreen = null, this._on_hashchange = null, this._raw_manifest = null, this._initial_deep_link = null, this._disposed = !1, this._language_holder = Symbol("storymap"), this._language_requested = void 0, this._interaction = 0, this._onInteraction = null, this._resize_timer = null, this._autoplay_timer = null, this._transition_timer = null, this._autoplay_stopped = !1, this._narration_el = null, this._narration_token = 0, this._narration_allowed = !0, this._user_gestured = !1, this._replayNarrationAfterGesture = !1, this._autoplay_advance = null, this._hash_initialized = !1, this._collapsed = !1, this._language_requested = typeof r?.language == "string" && r.language !== "" ? r.language : void 0, n(this.options, r), this.current_slide = this.options.start_at_slide, this._initData(t), this;
	}
	_initData(e) {
		if (this._data_from_manifest = !1, typeof e == "string") {
			let t = this.options.nocache === !0 ? e + (e.includes("?") ? "&" : "?") + "_=" + Date.now() : e;
			this._loadDataFromUrl(t, e);
		} else if (typeof e == "object") {
			if (Ve(e) || He(e)) this._data_from_manifest = !0, this._raw_manifest = e, this.data = wt(e);
			else {
				let t = e;
				ie(t), t.storymap ? this.data = t.storymap : console.error("StoryMapJS: data must have a storymap property");
			}
			this._initOptions();
		} else console.error("StoryMapJS: data has unknown type"), this._initOptions();
	}
	async _loadDataFromUrl(e, t) {
		try {
			let n = await fetch(e);
			if (!n.ok) throw Error("HTTP " + n.status + " " + n.statusText);
			let r = await n.json();
			if (this._disposed) return;
			if (Ve(r) || He(r)) this._data_from_manifest = !0, this._raw_manifest = r, this.data = wt(r);
			else {
				ie(r, t);
				let e = r;
				if (!e.storymap) throw Error("StoryMapJS: data must have a storymap property");
				this.data = e.storymap;
			}
			this._initOptions();
		} catch (e) {
			if (Lt(e)) {
				console.error(e.message), this.fire("error", {
					message: e.message,
					source: t,
					conflict: !0
				});
				return;
			}
			console.error("StoryMapJS: could not load storymap data from " + t, e), this.fire("error", {
				message: String(e),
				source: t
			});
		}
	}
	_initOptions() {
		if (r(this.options, this.data), this._initial_deep_link = {
			state: fe(new URLSearchParams(window.location.search).get(ae)),
			hash: window.location.hash
		}, this.current_slide = this.options.start_at_slide, this._data_from_manifest && delete this.options.zoomify, this.options.layout === "landscape" && (this.options.map_area === "left" ? this.options.map_center_offset = {
			left: 0,
			top: 0
		} : this.options.map_center_offset = {
			left: -200,
			top: 0
		}), this.options.map_type === "iiif" && this.options.map_as_image && (this.options.map_size_sticky = 2), this.options.map_type === "zoomify" && (this.options.map_size_sticky = 2), this.options.map_as_image && (this.options.calculate_zoom = !1), this.options.map_type === "zoomify") {
			console.warn("StoryMapJS: map_type 'zoomify' is a legacy image-pyramid basemap; consider map_type 'iiif' with options.iiif.url instead.");
			let e = this.options.zoomify;
			(typeof e != "object" || !e.path) && console.error("StoryMapJS: map_type 'zoomify' needs a zoomify image pyramid (path, width, height) in the storymap data.");
		}
		if (typeof this.options.map_type != "string" && (this.options.map_type = ""), this._map_disabled = this.options.map_type === "none", this.options.map_type.startsWith("stamen")) {
			let e = this.options.map_type;
			e === "stamen:watercolor" ? this.options.map_type = "ch-watercolor" : this.options.map_type = "osm:standard", console.log(`Deprecated map_type ${e}; using ${this.options.map_type}`);
		}
		this._loadLanguage();
	}
	_loadLanguage() {
		let e = this._requestedLanguage();
		e === void 0 ? Rt(Ut(), this._language_holder) : (Rt(e, this._language_holder), Ht(e)), this._onDataLoaded();
	}
	_requestedLanguage() {
		let e = this.data?.language;
		return typeof e == "string" && e !== "" ? e : this._language_requested;
	}
	refreshLanguage(e) {
		this._disposed || (Rt(e, this._language_holder), this.options.language = e, Ht(e), this._applyLanguageLayout());
	}
	_applyLanguageLayout() {
		this._menubar?.refreshLabels?.(), this._el.container.classList.toggle("vco-rtl", Gt());
	}
	async _loadFontCss() {
		let e = this.options.font_css || "stock:default", t = rT(e), n = sn(this.options);
		if (/^(http|https|\/\/)/.test(e) && this.options.consent_required && n) {
			let e = new URL(t.startsWith("//") ? "https:" + t : t).host, r = this._el.map ?? this._el.container;
			if (!await n.request($t(), e, r)) return;
		}
		if (t) try {
			await w(t);
		} catch {} finally {
			this._onFontLoaded(t);
		}
	}
	_onFontLoaded(e) {
		this.fire("fontLoaded", { font: e });
	}
	goTo(e) {
		this._disposed || e >= 0 && e < (this.data?.slides?.length ?? 0) && e !== this.current_slide && this._navigate(e);
	}
	_navigate(e, t = {}) {
		let { navigate: n, navigated: r = !1, animate: i = !0 } = t, a = i ? m(this.current_slide, e) : 0;
		this.current_slide = e, n !== "slider" && this._storyslider.goTo(this.current_slide), n !== "map" && this._map?.goTo(this.current_slide), this._beginTransition(a), r || this.fire("change", {
			current_slide: this.current_slide,
			current_id: this._currentSlideId()
		}, this), this._syncHash(), this._playNarration(this.data.slides?.[this.current_slide]), this._scheduleAutoplay(), this._updateProgress();
	}
	_beginTransition(e) {
		this._transition_timer && clearTimeout(this._transition_timer), this.fire("transitionstart", {
			current_slide: this.current_slide,
			duration: e
		}, this), this._transition_timer = setTimeout(() => {
			this._transition_timer = null, this.fire("transitionend", { current_slide: this.current_slide }, this);
		}, e);
	}
	updateDisplay() {
		this._disposed || this.ready && this._updateDisplay();
	}
	setMapOption(e, t) {
		this._disposed || this.setMapOptions({ [e]: t });
	}
	setOverlayVisible(e, t) {
		this._disposed || this._map?.setOverlayVisible(e, t);
	}
	setOverlayOpacity(e, t) {
		this._disposed || this._map?.setOverlayOpacity(e, t);
	}
	setMapOptions(e) {
		if (this._disposed) return;
		let t = e;
		e.map_type !== void 0 && (typeof e.map_type == "string" ? (e.map_type === "none" || this._map_disabled) && (console.warn("StoryMapJS: setMapOptions cannot add or remove a map after construction; map_type is load-time only."), t = { ...e }, delete t.map_type) : (console.warn(`StoryMapJS: setMapOptions ignores a non-string map_type (${String(e.map_type)}); pass "" for the default basemap.`), t = {
			...e,
			map_type: ""
		})), n(this.options, t), this._map && this._map.options && (n(this._map.options, t), this._map.applyOptions(Object.keys(t))), this.ready && (this._applyTextColors(), this.updateDisplay());
	}
	getBaseLayer() {
		return !this._disposed && this._map ? this._map.getBaseLayer() : null;
	}
	getOverlayLayers() {
		return !this._disposed && this._map ? this._map.getOverlayLayers() : [];
	}
	getOverlayLayer(e) {
		return !this._disposed && this._map ? this._map.getOverlayLayer(e) : null;
	}
	getOverlayCount() {
		return !this._disposed && this._map ? this._map.getOverlayCount() : 0;
	}
	getMinimap() {
		return !this._disposed && this._map ? this._map.getMinimap() : null;
	}
	getLine() {
		return !this._disposed && this._map ? this._map.getLine() : null;
	}
	isImageSpace() {
		return !this._disposed && this._map ? this._map.isImageSpace() : !1;
	}
	getSlideId(e) {
		if (this._disposed) return null;
		let t = e ?? this.current_slide, n = this.data?.slides?.[t]?.uniqueid;
		return typeof n == "string" && n !== "" ? n : null;
	}
	async loadAnnotations(e = {}) {
		let t = [];
		if (this._disposed || this._raw_manifest === null) return {
			stops: t,
			searchService: null,
			failed: []
		};
		let n = await xt(this._raw_manifest, e);
		if (this._disposed) return {
			stops: t,
			searchService: n.searchService,
			failed: n.failed
		};
		for (let e of this.data.slides ?? []) {
			let r = n.stops.get(e.uniqueid ?? "");
			if (r !== void 0) for (let n of r) n.uniqueid = `${e.uniqueid ?? "slide"}#seealso-${t.length}`, t.push(n), this.data.slides.push(n), this._storyslider.createSlide(n);
		}
		t.length > 0 && (this._updateProgress(), this._updateDistance());
		let r = {
			stops: t,
			searchService: n.searchService,
			failed: n.failed
		};
		return this.fire("annotationsloaded", r, this), r;
	}
	dispose() {
		if (!this._disposed) {
			this._disposed = !0, this.ready = !1;
			for (let e of [
				this._transition_timer,
				this._autoplay_timer,
				this._resize_timer
			]) e != null && clearTimeout(e);
			this._transition_timer = null, this._autoplay_timer = null, this._resize_timer = null, this._resize_observer?.disconnect(), this._resize_observer = null, this._on_resize &&= (window.removeEventListener("resize", this._on_resize), null), this._on_keydown_global &&= (window.removeEventListener("keydown", this._on_keydown_global), null), this._on_fullscreen &&= (document.removeEventListener("fullscreenchange", this._on_fullscreen), null), this._on_hashchange &&= (window.removeEventListener("hashchange", this._on_hashchange), null);
			for (let e of [this._el?.container, this._el?.map]) e?.getAnimations?.().forEach((e) => e.cancel());
			if (sn(this.options)?.dispose(), this._stopNarration(), this._narration_el &&= (this._narration_el.src = "", null), this._storyslider?.dispose?.(), this._menubar?.dispose?.(), this._map?.dispose?.(), this.map = null, this._el?.container?.replaceChildren(), zt(this._language_holder), this._onInteraction) {
				for (let e of [
					"pointerdown",
					"focusin",
					"wheel"
				]) this._el.container.removeEventListener(e, this._onInteraction);
				this._onInteraction = null;
			}
			On(this);
		}
	}
	get element() {
		return this._el?.container ?? null;
	}
	get interaction() {
		return this._interaction;
	}
	getLineActive() {
		return !this._disposed && this._map ? this._map.getLineActive() : null;
	}
	getMarkers() {
		return !this._disposed && this._map ? this._map.getMarkers() : [];
	}
	getMarker(e) {
		return !this._disposed && this._map ? this._map.getMarker(e) : null;
	}
	createMiniMap() {
		this._disposed || this._map?.createMiniMap();
	}
	setExtraAttributions(e) {
		this._disposed || this._map?.setExtraAttributions(e);
	}
	_applyTextColors() {
		this.options.text_color && this._el.container.style.setProperty("--vco-color-text", this.options.text_color), this.options.text_background_color && this._el.container.style.setProperty("--vco-color-text-background", this.options.text_background_color);
	}
	_initLayout() {
		this._disposed || (this._el.container.className += " vco-storymap", this.options.base_class = this._el.container.className, this._applyTextColors(), this._el.menubar = P.create("div", "vco-menubar", this._el.container), this._el.map = this._map_disabled ? null : this._resolveMapElement() ?? P.create("div", "vco-map", this._el.container), this._el.storyslider = P.create("div", "vco-storyslider", this._el.container), this.options.width = this._el.container.offsetWidth, this.options.height = this._el.container.offsetHeight, this._el.map && (this._el.map.style.height = "1px"), this._el.storyslider.style.top = "1px", this._map_disabled ? (this.options.map_height = 0, this.options.show_overview = !1) : (this._map = new Pw(this._map_el(), this.data, this.options), this.map = this._map._map, this._map.on("loaded", this._onMapLoaded, this), this._map.on("imageready", (e) => {
			this.fire("imageready", e);
		}), this._map_el().style.backgroundColor = this.options.map_background_color), this._menubar = new Iw(this._el.menubar, this._el.container, this.options), this._storyslider = new tT(this._el.storyslider, this.data, this.options), this._storyslider.on("loaded", this._onStorySliderLoaded, this), this._storyslider.on("title", this._onTitle, this), this._storyslider.init(), this._map_disabled ? (this.options.menubar_height = this._el.menubar.offsetHeight, this._menubar.setSticky(this.options.menubar_height)) : this.options.layout === "portrait" ? (this.options.map_height = this.options.height / this.options.map_size_sticky, this.options.storyslider_height = this.options.height - this._el.menubar.offsetHeight - this.options.map_height - 1, this._menubar.setSticky(0)) : (this.options.menubar_height = this._el.menubar.offsetHeight, this.options.map_height = this.options.height, this.options.storyslider_height = this.options.height - this._el.menubar.offsetHeight - 1, this._menubar.setSticky(this.options.menubar_height)), this._updateDisplay(this.options.map_height, !0, 2e3), this._menubar.show(2e3));
	}
	_initEvents() {
		if (this._menubar.on("collapse", this._onMenuBarCollapse, this), this._menubar.on("back_to_start", this._onBackToStart, this), this._menubar.on("overview", this._onOverview, this), this._menubar.on("fullscreen", this._onFullscreenToggle, this), this._storyslider.on("change", this._onSlideChange, this), this._storyslider.on("colorchange", this._onColorChange, this), this._map?.on("change", this._onMapChange, this), this.options.keyboard) {
			this._onInteraction = () => {
				this._interaction = Tn();
			};
			for (let e of [
				"pointerdown",
				"focusin",
				"wheel"
			]) this._el.container.addEventListener(e, this._onInteraction, { passive: !0 });
			Dn(this), this._on_keydown_global = (e) => this._onKeyDownGlobal(e), window.addEventListener("keydown", this._on_keydown_global);
		}
		this._on_fullscreen = () => this._onFullscreenChange(), document.addEventListener("fullscreenchange", this._on_fullscreen);
	}
	_onKeyDownGlobal(e) {
		if (e.defaultPrevented) return;
		let t = e.target, n = t?.tagName?.toLowerCase();
		n === "input" || n === "textarea" || n === "select" || t?.isContentEditable || An(this) && (e.key === "ArrowRight" || e.key === "ArrowDown" ? (e.preventDefault(), this._storyslider.next()) : (e.key === "ArrowLeft" || e.key === "ArrowUp") && (e.preventDefault(), this._storyslider.previous()));
	}
	_updateDisplay(e, t, n) {
		t && h() && (t = !1);
		let r = this.options.duration, i = this.options.base_class;
		n && (r = n), this.options.width = this._el.container.offsetWidth, this.options.height = this._el.container.offsetHeight, this.options.width <= this.options.skinny_size ? this.options.layout = "portrait" : this.options.layout = "landscape", e && (this.options.map_height = e), Ln.touch && (this.options.layout = Ln.orientation(), i += " vco-mobile"), this._map_disabled ? (i += " vco-layout-no-map", this.options.layout === "portrait" && (i += " vco-skinny vco-layout-portrait"), this.options.menubar_height = this._el.menubar.offsetHeight, this.options.map_height = 0, this.options.storyslider_height = this.options.height - 1, this._menubar.setSticky(this.options.menubar_height), this._el.storyslider.style.top = "0", this._el.storyslider.style.height = this.options.storyslider_height + "px", this._menubar.updateDisplay(this.options.width, this.options.height, t), this._storyslider.updateDisplay(this.options.width, this.options.storyslider_height, t, this.options.layout)) : this.options.layout === "portrait" ? (i += " vco-skinny", this._map_required().setMapOffset(0, 0), this._collapsed ? this.options.map_height = nT : this.options.map_height = this.options.height / this.options.map_size_sticky, this.options.storyslider_height = this.options.height - this.options.map_height - 1, this._menubar.setSticky(0), i += " vco-layout-portrait", this._map_el().style.width = "100%", t ? (this.animator_map && this.animator_map.stop(), this.animator_map = zw(this._map_el(), {
			height: this.options.map_height + "px",
			duration: r,
			easing: xn,
			complete: () => {
				this._map_required().updateDisplay(this.options.width, this.options.map_height, t, n, this.options.menubar_height);
			}
		}), this.animator_storyslider && this.animator_storyslider.stop(), this.animator_storyslider = zw(this._el.storyslider, {
			height: this.options.storyslider_height + "px",
			duration: r,
			easing: xn
		})) : (this._map_el().style.height = Math.ceil(this.options.map_height) + "px", this._el.storyslider.style.height = this.options.storyslider_height + "px"), this._menubar.updateDisplay(this.options.width, this.options.height, t), this._map_required().updateDisplay(this.options.width, this.options.height, !1), this._storyslider.updateDisplay(this.options.width, this.options.storyslider_height, t, this.options.layout)) : (i += " vco-layout-landscape", this.options.menubar_height = this._el.menubar.offsetHeight, this.options.map_height = this.options.height, this.options.storyslider_height = this.options.height, this._menubar.setSticky(this.options.menubar_height), this._map_el().style.height = this.options.height + "px", this.options.map_area === "left" ? (i += " vco-map-area-left", this._map_el().style.width = Math.floor(this.options.width / 2) + "px", this._map_required().setMapOffset(0, 0)) : (this._map_el().style.width = "100%", this._map_required().setMapOffset(-(this.options.width / 4), 0)), this._el.storyslider.style.top = "0", this._el.storyslider.style.height = this.options.storyslider_height + "px", this._menubar.updateDisplay(this.options.width, this.options.height, t), this._map_required().updateDisplay(this.options.width, this.options.height, t, n), this._storyslider.updateDisplay(this.options.width / 2, this.options.storyslider_height, t, this.options.layout)), Gt() && (i += " vco-rtl"), this._el.container.className = i;
	}
	_onDataLoaded(e) {
		this._disposed || (this.options.consent_manager = new on(), this.fire("dataloaded"), this._initLayout(), this._loadFontCss().catch((e) => {
			console.warn("StoryMapJS: font theme could not be loaded", e);
		}), this._initEvents(), this._initResizeHandling(), this.ready = !0, this._startConsentAsk(), this._startAutoplay());
	}
	_startConsentAsk() {
		let e = sn(this.options);
		if (!e || !this.options.consent_required) return;
		let t = [];
		this._map_disabled || t.push(Qt());
		let n = /* @__PURE__ */ new Set();
		for (let e of this.data.slides ?? []) {
			let r = e.media?.url;
			if (!r) continue;
			let i = Vr({ url: r });
			i && !n.has(i.type) && (n.add(i.type), t.push(tn(i.type, i.name)));
		}
		(this.data.slides ?? []).some((e) => !!e.narration?.url) && !n.has("narration") && t.push(en()), iT(rT(this.options.font_css || "stock:default")) && t.push($t()), e.requestAll(t, this._el.container);
	}
	_playNarration(e, t = !1) {
		let n = e?.narration?.url;
		if (this._stopNarration(), !n || this._disposed || !this._narration_allowed) return;
		if (!t && !this._has_user_gesture()) {
			this._replayNarrationAfterGesture = !0;
			return;
		}
		let r = this._narrationElement();
		r.src = n, r.currentTime = 0;
		let i = ++this._narration_token;
		r.play()?.catch?.(() => {
			i === this._narration_token && (this._replayNarrationAfterGesture = !0);
		});
	}
	_narrationElement() {
		return this._narration_el === null && (this._narration_el = document.createElement("audio"), this._narration_el.className = "vco-media-item vco-narration", this._narration_el.preload = "none", this._narration_el.setAttribute("aria-hidden", "true")), this._narration_el;
	}
	_stopNarration() {
		this._narration_token++;
		let e = this._narration_el;
		e && (e.pause(), e.removeAttribute("src"));
	}
	_note_user_gesture_for_narration() {
		this._disposed || (this._narration_allowed = this._narration_allowed && !0, this._replayNarrationAfterGesture && (this._replayNarrationAfterGesture = !1, this._playNarration(this.data.slides?.[this.current_slide], !0)));
	}
	_has_user_gesture() {
		return this._user_gestured;
	}
	_startAutoplay() {
		this._stopAutoplay(), this._autoplay_stopped = !1;
		let e = sn(this.options);
		if (e && this.options.consent_required && (this._narration_allowed = !e.isDenied(en().key)), !this._user_gestured) {
			let e = () => {
				this._user_gestured = !0, this._note_user_gesture_for_narration(), this._el.container.removeEventListener("pointerdown", e), this._el.container.removeEventListener("keydown", e);
			};
			this._el.container.addEventListener("pointerdown", e, { once: !0 }), this._el.container.addEventListener("keydown", e, { once: !0 });
		}
		if (this.options.autoplay > 0 && !h()) {
			let e = () => {
				this._autoplay_stopped = !0, this._stopAutoplay();
			};
			this._el.container.addEventListener("pointerdown", e, { once: !0 }), this._el.container.addEventListener("keydown", e, { once: !0 }), this._el.container.addEventListener("touchstart", e, { once: !0 }), this._scheduleAutoplay();
		}
	}
	_scheduleAutoplay() {
		if (this._stopAutoplay(), !(this.options.autoplay > 0) || this._autoplay_stopped) return;
		let e = () => {
			this._stopAutoplay(), this.current_slide + 1 < this.data.slides.length && (this.goTo(this.current_slide + 1), this._scheduleAutoplay());
		};
		if (this._autoplay_advance = e, this.options.autoplay_media) {
			let t = this._storyslider?._slides?.[this.current_slide];
			t?.hasPlayableMedia?.() && t.onMediaEnded(e);
		}
		this._autoplay_timer = setTimeout(e, this.options.autoplay);
	}
	_stopAutoplay() {
		this._autoplay_timer &&= (clearTimeout(this._autoplay_timer), null), this._autoplay_advance = null;
	}
	_currentSlideId() {
		let e = this.data?.slides?.[this.current_slide]?.uniqueid;
		return typeof e == "string" && e !== "" ? e : null;
	}
	_currentContentState() {
		let e = this._currentSlideId();
		if (e === null) return null;
		let t = this.data.slides[this.current_slide]?.location?.region;
		return Array.isArray(t) && t.length === 4 ? {
			id: e,
			region: t
		} : { id: e };
	}
	_syncHash() {
		try {
			let e = this._currentContentState(), t = new URLSearchParams(window.location.search);
			e === null ? t.delete(ae) : t.set(ae, me(e, this.data.uniqueid ?? null));
			let n = t.toString();
			history.replaceState(null, "", window.location.pathname + (n === "" ? "" : "?" + n) + "#slide-" + (e === null ? this.current_slide : encodeURI(e.id)));
		} catch {}
	}
	_applyHashSlide(e) {
		let t = e ?? {
			state: fe(new URLSearchParams(window.location.search).get("iiif-content")),
			hash: window.location.hash
		}, n = this._resolveDeepLink(t.state, t.hash);
		return n === null || n === this.current_slide ? !1 : (this.goTo(n), !0);
	}
	_resolveDeepLink(e, t) {
		if (e !== null) {
			let t = this._slideIndexById(e.id);
			if (t !== null) return t;
			console.warn(`StoryMapJS: the content state names a canvas this storymap does not have: ${e.id}`);
		}
		let n = /^#slide-(.+)$/.exec(t);
		if (n === null) return null;
		let r = n[1];
		if (/^\d+$/.test(r)) {
			let e = parseInt(r, 10);
			return e >= 0 && e < this.data.slides.length ? e : null;
		}
		return this._slideIndexById(decodeURIComponent(r));
	}
	_slideIndexById(e) {
		let t = this.data?.slides ?? [];
		for (let n = 0; n < t.length; n++) if (t[n]?.uniqueid === e) return n;
		return null;
	}
	_initResizeHandling() {
		if (!this.options.trackResize) return;
		let e = () => {
			this._resize_timer ? clearTimeout(this._resize_timer) : this.updateDisplay(), this._resize_timer = setTimeout(() => {
				this._resize_timer = null, this.updateDisplay();
			}, 200);
		};
		typeof ResizeObserver < "u" && (this._resize_observer = new ResizeObserver(e), this._resize_observer.observe(this._el.container)), this._on_resize = e, window.addEventListener("resize", e);
	}
	_map_el() {
		if (!this._el.map) throw Error("StoryMapJS: this operation needs a map pane, but the story has none (map_type: \"none\").");
		return this._el.map;
	}
	_map_required() {
		if (!this._map) throw Error("StoryMapJS: this operation needs a map, but the story has none (map_type: \"none\").");
		return this._map;
	}
	_resolveMapElement() {
		let e = this.options.map_options?.element;
		if (!e) return null;
		let t = typeof e == "string" ? P.get(e) : e;
		return t ? (t.classList.add("vco-map"), this._el.menubar.after(t), t) : (console.error("StoryMapJS: map_options.element not found: " + String(e)), null);
	}
	_onTitle(e) {
		this.fire("title", e);
	}
	_onColorChange(e) {
		e.color || e.image ? this._menubar.setColor(!0) : this._menubar.setColor(!1);
	}
	_onSlideChange(e) {
		this.current_slide !== e.current_slide && this._navigate(e.current_slide, { navigate: "slider" });
	}
	_onMapChange(e) {
		this.current_slide !== e.current_marker && this._navigate(e.current_marker, { navigate: "map" });
	}
	_updateProgress() {
		this.options.show_progress && this._menubar && this._menubar.setProgress(this.current_slide, this.data.slides.length);
	}
	_onOverview(e) {
		this._map?.markerOverview();
	}
	_onFullscreenToggle(e) {
		document.fullscreenElement === this._el.container ? document.exitFullscreen().catch((e) => {
			console.error("StoryMapJS: could not exit fullscreen", e);
		}) : this._el.container.requestFullscreen().catch((e) => {
			console.error("StoryMapJS: could not enter fullscreen", e);
		});
	}
	_onFullscreenChange() {
		let e = document.fullscreenElement === this._el.container;
		this._menubar.setFullscreenState(e), requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				this.updateDisplay();
			});
		});
	}
	_onBackToStart(e) {
		this.current_slide !== 0 && this._navigate(0);
	}
	_onMenuBarCollapse(e) {
		this._collapsed = e.collapsed === void 0 ? e.y !== void 0 && e.y < 5 : e.collapsed, this._updateDisplay(void 0, !0);
	}
	_onMapLoaded() {
		this._loaded.map = !0, this._onLoaded();
	}
	_onStorySliderLoaded() {
		this._loaded.storyslider = !0, this._onLoaded();
	}
	_updateDistance() {
		if (!this.options.show_distance) return;
		let e = this._map?.getRouteDistance();
		this._menubar.setDistance(e);
	}
	_initHash() {
		!this._hash_initialized && this._loaded.storyslider && (this._hash_initialized = !0, this._applyHashSlide(this._initial_deep_link), this._on_hashchange = () => this._applyHashSlide(), window.addEventListener("hashchange", this._on_hashchange), this._syncHash());
	}
	_onLoaded() {
		this._initHash(), this._loaded.storyslider && (this._map_disabled || this._loaded.map) && (this.fire("loaded", this.data), this._updateProgress(), this._updateDistance());
	}
}, oT = class extends jn(aT) {
	static SCRIPT_PATH = new URL(
		/* @vite-ignore */
		"../",
		import.meta.url
	).href;
	constructor(...e) {
		super(...e);
	}
}, sT = "https://iiif.io/api/image/3.0/example/reference/28473c77da3deebe4375c3a50572d9d3-laocoon", cT = `${sT}/info.json`, lT = `${sT}/full/max/0/default.jpg`, uT = 2315, dT = 3e3, fT = "https://cmahnke.github.io/StoryMapJS/context.json", pT = Object.freeze([
	"http://iiif.io/api/extension/navplace/context.json",
	"http://iiif.io/api/presentation/3/context.json",
	`${fT.replace(/context\.json$/, "")}navplace-properties.json`,
	fT
]), mT = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	webp: "image/webp",
	bmp: "image/bmp",
	avif: "image/avif"
}, hT = [
	"youtube.com",
	"youtu.be",
	"vimeo.com",
	"dailymotion.com",
	"vine.co"
], gT = ["soundcloud.com"], _T = [
	"name",
	"zoom",
	"line",
	"icon",
	"iconSize",
	"image",
	"use_custom_marker",
	"popup",
	"audioBadge"
];
function vT(e) {
	return typeof e == "string" && /^https?:\/\//i.test(e);
}
function yT(e) {
	let t = e.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
	if (t && Object.hasOwn(mT, t)) return {
		type: "Image",
		format: mT[t]
	};
	let n;
	try {
		n = new URL(e).hostname.replace(/^www\./, "");
	} catch {
		return {
			type: "Text",
			format: "text/html"
		};
	}
	return hT.some((e) => n === e || n.endsWith(`.${e}`)) ? { type: "Video" } : gT.some((e) => n === e || n.endsWith(`.${e}`)) ? { type: "Sound" } : {
		type: "Text",
		format: "text/html"
	};
}
function bT(e) {
	return { none: [e] };
}
function xT(e) {
	return e != null && e !== "";
}
function ST(e) {
	return typeof e != "object" || !e || Array.isArray(e) ? null : e;
}
function CT(e) {
	return Array.isArray(e) ? e : [];
}
function wT(e) {
	return Array.isArray(e) && e.length === 4 && e.every((e) => typeof e == "number" && Number.isFinite(e));
}
function TT(e, t) {
	let n = t.storymap ?? {}, r = CT(n.slides).filter((e) => ST(e) !== null), i = n.map_type === "zoomify", a = i || n.map_type === "iiif", o = `https://example.org/storymap/${e}`, s = ST(n.iiif), c = ST(n.zoomify), l = s?.attribution || c?.attribution || "", u = r.map((e, t) => DT(o, t, e, a, t === 0 ? CT(n.overlays) : [])), d = {
		"@context": [...pT],
		id: o,
		type: "Manifest",
		label: bT(e),
		behavior: ["paged"],
		metadata: [{
			label: bT("Generated by"),
			value: bT("StoryMapJS")
		}],
		items: u
	}, f = AT(o, r, u);
	f && (d.structures = f);
	let p = n.map_bbox;
	if (wT(p)) {
		let [e, t, n, r] = p;
		d.navPlace = {
			id: `${o}/navplace`,
			type: "FeatureCollection",
			features: [{
				id: `${o}/navplace/feature/1`,
				type: "Feature",
				geometry: {
					type: "Polygon",
					coordinates: [[
						[e, t],
						[n, t],
						[n, r],
						[e, r],
						[e, t]
					]]
				},
				properties: {}
			}]
		};
	}
	let m = ET(n, t, i);
	return Object.keys(m).length > 0 && (d.service = [{
		id: `${o}/map-config`,
		type: "Service",
		profile: `${fT}/mapconfig`,
		...m
	}]), xT(l) && (d.requiredStatement = {
		label: bT("Attribution"),
		value: bT(l)
	}), d;
}
function ET(e, t, n) {
	let r = {}, i = e.map_type;
	if (n && (i = "iiif", r["storymap:mapAsImage"] = !0), xT(i)) {
		let e = String(i);
		e.includes("{z}") ? r.tilejson = { tiles: e } : r["storymap:basemap"] = e;
	}
	e.map_as_image !== void 0 && (r["storymap:mapAsImage"] = e.map_as_image), xT(e.map_access_token) && (r["storymap:mapAccessToken"] = e.map_access_token), xT(e.map_background_color) && (r["storymap:mapBackgroundColor"] = e.map_background_color), e.map_center_offset !== void 0 && (r["storymap:mapCenterOffset"] = e.map_center_offset);
	let a = t.font_css || e.font_css;
	xT(a) && (r["storymap:fontCss"] = a), e.call_to_action !== void 0 && (r["storymap:callToAction"] = e.call_to_action), xT(e.call_to_action_text) && (r["storymap:callToActionText"] = e.call_to_action_text), e.start_at_slide !== void 0 && (r["storymap:startAtSlide"] = e.start_at_slide), xT(e.language) && (r["storymap:language"] = e.language), e.calculate_zoom !== void 0 && (r["storymap:calculateZoom"] = e.calculate_zoom), e.line_follows_path !== void 0 && (r["storymap:lineFollowsPath"] = e.line_follows_path), e.show_lines !== void 0 && (r["storymap:showLines"] = e.show_lines), e.show_history_line !== void 0 && (r["storymap:showHistoryLine"] = e.show_history_line), xT(e.line_color) && (r["storymap:lineColor"] = e.line_color), xT(e.line_color_inactive) && (r["storymap:lineColorInactive"] = e.line_color_inactive), e.line_weight !== void 0 && (r["storymap:lineWeight"] = e.line_weight), e.line_opacity !== void 0 && (r["storymap:lineOpacity"] = e.line_opacity), xT(e.line_dash) && (r["storymap:lineDash"] = e.line_dash), xT(e.line_join) && (r["storymap:lineJoin"] = e.line_join), e.use_custom_markers !== void 0 && (r["storymap:useCustomMarkers"] = e.use_custom_markers), e.map_area !== void 0 && (r["storymap:mapArea"] = e.map_area), wT(e.overview_extent) && (r["storymap:overviewExtent"] = e.overview_extent), e.keyboard !== void 0 && (r["storymap:keyboard"] = e.keyboard);
	let o = CT(e.overlays);
	return o.length > 0 && (r["storymap:overlays"] = o.filter((e) => e && xT(e.map_type)).map((e) => {
		if (!e.georeference) return e;
		let { georeference: t, ...n } = e;
		return n;
	})), r;
}
function DT(e, t, n, r, i) {
	let a = `${e}/canvas/${t + 1}`, o = n.text?.headline || "", s = n.text?.text || "", c = {
		id: a,
		type: "Canvas",
		height: r ? dT : 1080,
		width: r ? uT : 1080,
		...typeof n.date == "string" && n.date !== "" ? { navDate: n.date } : {},
		...MT(a, n.background),
		...jT(n),
		items: [{
			id: `${a}/annotationpage/1`,
			type: "AnnotationPage",
			items: [{
				id: `${a}/annotation/1`,
				type: "Annotation",
				motivation: "painting",
				...NT(n),
				body: PT(n, r),
				target: IT(a, n.location?.region) ?? a
			}, ...kT(a, i)]
		}]
	};
	xT(o) && (c.label = bT(o)), xT(s) && (c.summary = bT(s));
	let l = FT(n);
	Object.assign(c, l);
	let u = LT(a, n);
	return u && (c.navPlace = u), c;
}
function OT(e) {
	if (!e || !e.georeference) return !1;
	let { url: t, width: n, height: r } = e.georeference;
	return typeof t == "string" && t !== "" && typeof n == "number" && typeof r == "number" && Number.isFinite(n) && Number.isFinite(r) && n > 0 && r > 0;
}
function kT(e, t) {
	let n = t.filter(OT);
	return n.map((t) => {
		let r = t.georeference;
		return {
			id: `${e}/georeferencing/${n.indexOf(t) + 1}`,
			type: "Annotation",
			motivation: "georeferencing",
			target: {
				id: r.url,
				type: "Image",
				width: r.width,
				height: r.height,
				service: [{
					id: r.url,
					type: "ImageService3",
					profile: "level2"
				}]
			},
			...xT(t.attribution) ? { requiredStatement: {
				label: bT("Attribution"),
				value: bT(t.attribution)
			} } : {},
			body: r.body
		};
	});
}
function AT(e, t, n) {
	let r = [], i = /* @__PURE__ */ new Map();
	return t.forEach((e, t) => {
		let a = e.group;
		xT(a) && (i.has(a) || (i.set(a, []), r.push(a)), i.get(a)?.push(n[t].id));
	}), r.length === 0 ? null : r.map((t, n) => ({
		id: `${e}/range/${n + 1}`,
		type: "Range",
		label: bT(t),
		items: i.get(t) ?? []
	}));
}
function jT(e) {
	let t = e.media?.thumb;
	if (!xT(t) || typeof t != "string") return {};
	let { type: n, format: r } = yT(t);
	return { thumbnail: [{
		id: t,
		type: n,
		...r ? { format: r } : {}
	}] };
}
function MT(e, t) {
	if (!t) return {};
	let n = typeof t == "object" ? t : {}, r = typeof t == "string" ? null : n.url, i = typeof t == "string" ? t : n.color, a = [];
	if (xT(r) && typeof r == "string") {
		let { type: e, format: t } = yT(r);
		a.push({
			id: r,
			type: e,
			...t ? { format: t } : {}
		});
	}
	return xT(i) && typeof i == "string" && a.push({
		type: "Color",
		value: i
	}), a.length === 0 ? {} : { background: {
		id: `${e}/background`,
		type: "Annotation",
		motivation: "painting",
		body: a.length === 1 ? a[0] : a,
		target: e
	} };
}
function NT(e) {
	let t = {};
	return xT(e.media?.caption) && typeof e.media?.caption == "string" && (t.label = bT(e.media.caption)), xT(e.media?.credit) && typeof e.media?.credit == "string" && (t.requiredStatement = {
		label: bT("Credit"),
		value: bT(e.media.credit)
	}), xT(e.media?.alt) && typeof e.media?.alt == "string" && (t.accessibilitySummary = bT(e.media.alt)), t;
}
function PT(e, t) {
	if (t) return {
		id: lT,
		type: "Image",
		format: "image/jpeg",
		width: uT,
		height: dT,
		service: [{
			id: cT,
			type: "ImageService3",
			profile: "level2"
		}]
	};
	let n = e.media?.url;
	if (vT(n)) {
		let { type: e, format: t } = yT(n), r = {
			id: n,
			type: e
		};
		return t && (r.format = t), r;
	}
	return n != null && n !== "" && typeof n != "string" ? {
		type: "TextualBody",
		format: "text/html",
		value: ""
	} : {
		type: "TextualBody",
		format: "text/html",
		value: typeof n == "string" && n !== "" ? n : e.text?.text || ""
	};
}
function FT(e) {
	let t = {};
	return e.type === "overview" && (t["storymap:type"] = "overview"), xT(e.media?.srcset) && (t["storymap:mediaSrcset"] = e.media?.srcset), xT(e.media?.sizes) && (t["storymap:mediaSizes"] = e.media?.sizes), t;
}
function IT(e, t) {
	return !Array.isArray(t) || t.length !== 4 || !t.every((e) => typeof e == "number" && Number.isFinite(e)) ? null : {
		type: "SpecificResource",
		source: e,
		selector: {
			type: "ImageApiSelector",
			value: `xywh=pixel:${t.join(",")}`
		}
	};
}
function LT(e, t) {
	let n = t.location || {}, { lat: r, lon: i } = n;
	if (typeof r != "number" || typeof i != "number" || !Number.isFinite(r) || !Number.isFinite(i)) return null;
	let a = {};
	for (let e of _T) xT(n[e]) && (a[e] = n[e]);
	return {
		id: `${e}/navplace`,
		type: "FeatureCollection",
		features: [{
			id: `${e}/navplace/feature/1`,
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [i, r]
			},
			properties: a
		}]
	};
}
//#endregion
export { Vr as MediaType, oT as StoryMap, He as isPresentation3Collection, Ve as isPresentation3Manifest, w as loadCSS, wt as manifestToStorymapData, Ht as setLanguage, TT as storymapToManifest, re as validateStorymap, ie as validateStorymapAndReport };

//# sourceMappingURL=storymap.js.map