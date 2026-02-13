/*
 * (c) 2014, Vladimir Agafonkin
 * Leaflet.heat, a tiny and fast heatmap plugin for Leaflet.
 * https://github.com/Leaflet/Leaflet.heat
 */
L.HeatLayer = (L.Layer ? L.Layer : L.Class).extend({
    // options: {
    //     minOpacity: 0.05,
    //     maxZoom: 18,
    //     radius: 25,
    //     blur: 15,
    //     max: 1.0
    // },
    initialize: function (latlngs, options) {
        this._latlngs = latlngs;
        L.Util.setOptions(this, options);
    },
    setLatLngs: function (latlngs) {
        this._latlngs = latlngs;
        return this.redraw();
    },
    addLatLng: function (latlng) {
        this._latlngs.push(latlng);
        return this.redraw();
    },
    setOptions: function (options) {
        L.Util.setOptions(this, options);
        if (this._heat) {
            this._updateOptions();
        }
        return this.redraw();
    },
    redraw: function () {
        if (this._heat && !this._frame && !this._map._animating) {
            this._frame = globalThis.requestAnimationFrame(this._redraw.bind(this));
        }
        return this;
    },
    onAdd: function (map) {
        this._map = map;
        if (!this._canvas) {
            this._initCanvas();
        }
        map._panes.overlayPane.append(this._canvas);
        map.on('moveend', this._reset, this);
        if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }
        this._reset();
    },
    onRemove: function (map) {
        this._canvas.remove();
        map.off('moveend', this._reset, this);
        if (map.options.zoomAnimation) {
            map.off('zoomanim', this._animateZoom, this);
        }
    },
    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    _initCanvas: function () {
        const canvas = (this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer leaflet-layer'));
        const originProperty = 'transformOrigin';
        canvas.style[originProperty] = '50% 50%';
        const size = this._map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;
        const animated = this._map.options.zoomAnimation && L.Browser.any3d;
        canvas.classList.add('leaflet-zoom-' + (animated ? 'animated' : 'hide'));
        this._heat = simpleheat(canvas);
        this._updateOptions();
    },
    _updateOptions: function () {
        this._heat.radius(this.options.radius || this._heat.defaultRadius, this.options.blur);
        if (this.options.gradient) {
            this._heat.gradient(this.options.gradient);
        }
        if (this.options.max) {
            this._heat.max(this.options.max);
        }
    },
    _reset: function () {
        const topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        const size = this._map.getSize();
        if (this._heat._width !== size.x) {
            this._canvas.width = this._heat._width = size.x;
        }
        if (this._heat._height !== size.y) {
            this._canvas.height = this._heat._height = size.y;
        }
        this._redraw();
    },
    _redraw: function () {
        const data = [];
        const r = this._heat._r;
        const size = this._map.getSize();
        const bounds = new L.Bounds(new L.Point([-r, -r]), size.add([r, r]));
        const max = this.options.max === undefined ? 1 : this.options.max;
        const maxZoom = this.options.maxZoom === undefined
            ? this._map.getMaxZoom()
            : this.options.maxZoom;
        const v = 1 / Math.pow(2, Math.max(0, Math.min(maxZoom - this._map.getZoom(), 12)));
        const cellSize = r / 2;
        const grid = [];
        const panePos = this._map._getMapPanePos();
        const offsetX = panePos.x % cellSize;
        const offsetY = panePos.y % cellSize;
        let i;
        let len;
        let p;
        let cell;
        let x;
        let y;
        let j;
        let len2;
        let k;
        // console.time('process');
        for (i = 0, len = this._latlngs.length; i < len; i++) {
            p = this._map.latLngToContainerPoint(this._latlngs[i]);
            if (bounds.contains(p)) {
                x = Math.floor((p.x - offsetX) / cellSize) + 2;
                y = Math.floor((p.y - offsetY) / cellSize) + 2;
                const alt = this._latlngs[i].alt !== undefined
                    ? this._latlngs[i].alt
                    : this._latlngs[i][2] !== undefined
                        ? +this._latlngs[i][2]
                        : 1;
                k = alt * v;
                grid[y] = grid[y] || [];
                cell = grid[y][x];
                if (!cell) {
                    grid[y][x] = [p.x, p.y, k];
                }
                else {
                    cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k); // x
                    cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k); // y
                    cell[2] += k; // cumulated intensity value
                }
            }
        }
        for (i = 0, len = grid.length; i < len; i += 1) {
            if (grid[i]) {
                for (j = 0, len2 = grid[i].length; j < len2; j += 1) {
                    cell = grid[i][j];
                    if (cell) {
                        data.push([
                            Math.round(cell[0]),
                            Math.round(cell[1]),
                            Math.min(cell[2], max)
                        ]);
                    }
                }
            }
        }
        // console.timeEnd('process');
        // console.time('draw ' + data.length);
        this._heat.data(data).draw(this.options.minOpacity);
        // console.timeEnd('draw ' + data.length);
        this._frame = null;
    },
    _animateZoom: function (e) {
        const scale = this._map.getZoomScale(e.zoom), offset = this._map
            ._getCenterOffset(e.center)
            ._multiplyBy(-scale)
            .subtract(this._map._getMapPanePos());
        if (L.DomUtil.setTransform) {
            L.DomUtil.setTransform(this._canvas, offset, scale);
        }
        else {
            this._canvas.style[L.DomUtil.TRANSFORM] =
                L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
        }
    }
});
L.heatLayer = function (latlngs, options) {
    return new L.HeatLayer(latlngs, options);
};
