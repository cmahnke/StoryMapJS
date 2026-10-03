import Dom from "../dom/Dom";
import { DomEvent } from "../dom/DomEvent";
import { Evented, type EventedInstance } from "../core/mixins";
import { Language } from "../language/Language";

/*	LayersControl
	Basemap/overlay switcher panel for the menubar (show_layers_control).
	Owns the disclosure button and the panel; the host of the layers state
	(StoryMap, via MenuBar) supplies rows through the delegate and executes
	toggles. Fires basemapchange/overlaychange, which MenuBar forwards.
================================================== */

export interface LayersOverlayRow {
    kind: "overlay";
    /** Built-layer index: malformed entries are skipped, like setOverlayVisible. */
    index: number;
    label: string;
    checked: boolean;
    locked: boolean;
}

export interface LayersBasemapRow {
    kind: "basemap";
    map_type: string;
    label: string;
    checked: boolean;
}

export type LayersRow = LayersOverlayRow | LayersBasemapRow;

export interface LayersControlDelegate {
    /** Current rows, basemaps first. Empty while there is nothing to switch. */
    rows(): LayersRow[];
}

export interface LayersControlEvents {
    basemapchange: { map_type: string };
    overlaychange: { index: number; visible: boolean };
}

/** Panel id suffix: unique per control so two viewers never share one. */
let layersPanelSeq = 0;

class LayersControlBase {
    declare "_el": {
        container: HTMLElement;
        button: HTMLButtonElement;
        panel: HTMLElement;
    };
    declare "_menubar": HTMLElement;
    declare "_delegate": LayersControlDelegate | null;
    declare "_rows": LayersRow[];
    declare "_open": boolean;
    declare "_panel_id": string;
    declare "_onKeyDownBound": ((e: KeyboardEvent) => void) | null;
    declare "_onPointerDownBound": ((e: Event) => void) | null;
    declare "fire": EventedInstance<LayersControlEvents>["fire"];

    constructor(menubar: HTMLElement) {
        this._menubar = menubar;
        const panel_id = `vco-layers-panel-${++layersPanelSeq}`;
        this._panel_id = panel_id;
        this._delegate = null;
        this._rows = [];
        this._open = false;
        this._onKeyDownBound = null;
        this._onPointerDownBound = null;

        const button = Dom.create(
            "button",
            "vco-menubar-button vco-menubar-layers",
            menubar,
        ) as HTMLButtonElement;
        button.setAttribute("type", "button");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", panel_id);
        button.textContent = Language.buttons.layers;
        DomEvent.addListener(button, "click", this._onButtonClick, this);
        this._el = {
            container: menubar,
            button,
            panel: document.createElement("div"),
        };

        const panel = this._el.panel;
        panel.id = panel_id;
        panel.className = "vco-layers";
        panel.hidden = true;
        menubar.appendChild(panel);
        // hidden until the first refresh() hands over rows (consent-denied
        // tiles and mapless stories never get any)
        button.style.display = "none";
    }

    /*	Public
	================================================== */

    /** Hand the control its state source (StoryMap wires this via MenuBar). */
    setDelegate(delegate: LayersControlDelegate): void {
        this._delegate = delegate;
    }

    /** Re-pull rows from the delegate and sync the panel in place. */
    refresh(): void {
        const rows = this._delegate?.rows() ?? [];
        // nothing to switch (consent-denied tiles, mapless story): no
        // control at all rather than a panel of dead rows
        this._el.button.style.display = rows.length === 0 ? "none" : "";
        if (rows.length === 0) {
            this.close();
            this._rows = rows;
            return;
        }
        if (this._sameRows(rows)) {
            this._updateRows(rows);
        } else {
            this._buildRows(rows);
        }
        this._rows = rows;
    }

    /** Re-resolve row labels (function labels repaint on language change). */
    refreshLabels(): void {
        this._el.button.textContent = Language.buttons.layers;
        this.refresh();
    }

    open(): void {
        if (this._rows.length === 0) return;
        this._open = true;
        this._el.panel.hidden = false;
        this._el.button.setAttribute("aria-expanded", "true");
        this._el.button.classList.add("vco-active");
    }

    close(): void {
        this._open = false;
        this._el.panel.hidden = true;
        this._el.button.setAttribute("aria-expanded", "false");
        this._el.button.classList.remove("vco-active");
    }

    /**
     * Release the document listeners and drop the nodes. Called by
     * `MenuBar.dispose()`; the control must not be used afterwards.
     */
    dispose(): void {
        if (this._onKeyDownBound) {
            document.removeEventListener("keydown", this._onKeyDownBound);
            this._onKeyDownBound = null;
        }
        if (this._onPointerDownBound) {
            document.removeEventListener("pointerdown", this._onPointerDownBound);
            this._onPointerDownBound = null;
        }
        this._el.button.remove();
        this._el.panel.remove();
        this._delegate = null;
    }

    /*	Events
	================================================== */

    _onButtonClick(): void {
        if (this._open) {
            this.close();
        } else {
            this.open();
        }
    }

    _onRowChange(e: Event, row: LayersRow): void {
        const input = e.target as HTMLInputElement | null;
        if (!input) return;
        if (row.kind === "overlay") {
            if (row.locked) {
                // disabled inputs never fire from user input; a programmatic
                // dispatch still reaches this handler, so ignore it loudly
                // by restoring the checked state instead of toggling
                input.checked = row.checked;
                return;
            }
            this.fire("overlaychange", { index: row.index, visible: input.checked });
        } else {
            if (!input.checked) return;
            this.fire("basemapchange", { map_type: row.map_type });
        }
    }

    _onPanelKeyDown(e: KeyboardEvent): void {
        if (e.key !== "Escape" || !this._open) return;
        // only while focused inside the panel: an open panel must not
        // swallow page-level Escape handling from elsewhere
        if (!this._el.panel.contains(document.activeElement)) return;
        e.stopPropagation();
        this.close();
        this._el.button.focus();
    }

    _onDocumentPointerDown(e: Event): void {
        if (!this._open) return;
        if (this._el.container.contains(e.target as Node | null)) return;
        this.close();
    }

    /*	Private Methods
	================================================== */

    _sameRows(rows: LayersRow[]): boolean {
        if (rows.length !== this._rows.length) return false;
        return rows.every((row, i) => {
            const prev = this._rows[i];
            if (prev.kind !== row.kind) return false;
            return row.kind === "overlay"
                ? (prev as LayersOverlayRow).index === row.index
                : (prev as LayersBasemapRow).map_type === row.map_type;
        });
    }

    _updateRows(rows: LayersRow[]): void {
        const inputs = this._el.panel.querySelectorAll("input");
        rows.forEach((row, position) => {
            const input = inputs[position] as HTMLInputElement | undefined;
            const label = input?.closest("label");
            if (!input || !label) return;
            input.checked = row.checked;
            input.disabled = row.kind === "overlay" && row.locked;
            const text = label.querySelector(".vco-layers-label");
            if (text) text.textContent = row.label;
        });
    }

    _buildRows(rows: LayersRow[]): void {
        const panel = this._el.panel;
        panel.replaceChildren();
        const basemaps = rows.filter((row): row is LayersBasemapRow => row.kind === "basemap");
        const overlays = rows.filter((row): row is LayersOverlayRow => row.kind === "overlay");
        if (basemaps.length > 0) {
            panel.appendChild(this._buildGroup("basemap", basemaps));
        }
        if (overlays.length > 0) {
            panel.appendChild(this._buildGroup("overlay", overlays));
        }
        if (!this._onKeyDownBound) {
            this._onKeyDownBound = (e: KeyboardEvent) => this._onPanelKeyDown(e);
            document.addEventListener("keydown", this._onKeyDownBound);
        }
        if (!this._onPointerDownBound) {
            this._onPointerDownBound = (e: Event) => this._onDocumentPointerDown(e);
            document.addEventListener("pointerdown", this._onPointerDownBound);
        }
    }

    _buildGroup(kind: "basemap" | "overlay", rows: LayersRow[]): HTMLElement {
        const group = document.createElement("fieldset");
        group.className = "vco-layers-group";
        const legend = document.createElement("legend");
        legend.textContent =
            kind === "basemap"
                ? Language.buttons.layers_basemaps
                : Language.buttons.layers_overlays;
        group.appendChild(legend);
        for (const row of rows) {
            group.appendChild(this._buildRow(row));
        }
        return group;
    }

    _buildRow(row: LayersRow): HTMLElement {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.setAttribute("type", row.kind === "basemap" ? "radio" : "checkbox");
        if (row.kind === "basemap") {
            input.setAttribute("name", "basemap");
        }
        input.checked = row.checked;
        if (row.kind === "overlay" && row.locked) {
            input.disabled = true;
        }
        const text = document.createElement("span");
        text.className = "vco-layers-label";
        text.textContent = row.label;
        label.appendChild(input);
        label.appendChild(text);
        DomEvent.addListener(input, "change", (e: Event) => this._onRowChange(e, row), this);
        return label;
    }
}

const EventedLayersControlBase = Evented<LayersControlEvents, typeof LayersControlBase>(
    LayersControlBase,
);

export default class LayersControl extends Evented<LayersControlEvents, typeof LayersControlBase>(
    EventedLayersControlBase,
) {
    constructor(...args: ConstructorParameters<typeof LayersControlBase>) {
        super(...args);
    }
}
