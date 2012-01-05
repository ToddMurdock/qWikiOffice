// http://www.extjs.com/forum/showthread.php?69295-Ext.ux.GhostBar-A-space-saving-fade-in-Toolbar
// Example Usage: plugins: [ new Ext.ux.GhostBar({ items: [{ text: 'Click Me' }], position: 'top' }) ],

Ext.override(Ext.lib.Region, {
    /**
     * Returns the shortest distance between this Region and another Region.
     * Either or both Regions may be Points.
     * @param {Region} r The other Region
     * @return {Number} The shortest distance in pixels between the two Regions.
     */
    getDistanceBetween: function(r) {

//      We may need to mutate r, so make a copy.
        r = Ext.apply({}, r);

//      Translate r to the left of this
        if (r.left > this.right) {
            var rWidth = r.right - r.left;
            r.left = this.left - (r.left - this.right) - rWidth;
            r.right = r.left + rWidth;
        }

//      Translate r above this
        if (r.top > this.bottom) {
            var rHeight = r.bottom - r.top;
            r.top = this.top - (r.top - this.bottom) - rHeight;
            r.bottom = r.top + rHeight;
        }

//      If r is directly above
        if (r.right > this.left) {
            return this.top - r.bottom;
        }

//      If r is directly to the left
        if (r.bottom > this.top) {
            return this.left - r.right;
        }

//      r is on a diagonal path
        return Math.round(Math.sqrt(Math.pow(this.top - r.bottom, 2) + Math.pow(this.left - r.right, 2)));
    }
});

/**
 * @class Ext.ux.GhostBar
 * @extends Ext.Toolbar
 * A Toolbar class which attaches as a plugin to any BoxComponent, and fades in at the configured
 * position whenever the mouse is brought within a configurable threshold. eg: <code><pre>
new Ext.Panel({
    renderTo: document.body,
    title: 'Test',
    width: 600,
    height: 400,
    plugins: [ new Ext.ux.GhostBar([{ text: 'Click Me' }]) ]
});
</pre></code>
 */
Ext.ux.GhostBar = Ext.extend(Ext.Toolbar, {

    listenerAdded: false,

    cache: [],

    /**
     * @cfg {Number} threshold The number of pixels around the toolbar position in which
     * fading is performed.
     */
    threshold: 100,

    /**
     * @cfg {String} position The alignment of this Toolbar, <code><b>top</b></code>, or <code><b>bottom</b></code>.
     * Defaults to <code><b>bottom</b></code>.
     */
    /**
     * @cfg {Array} offsets A two element Array containing the [x, y] offset from the default position
     * in which to display the Toolbar.
     */

    initComponent: function() {

//      Only use one mousemove listener. Check the cache of GhostBars for proximity on each firing
        if (!this.listenerAdded) {
            Ext.getDoc().on('mousemove', Ext.ux.GhostBar.prototype.onDocMouseMove, Ext.ux.GhostBar.prototype);
            this.listenerAdded = true;
        }
        this.renderTo = document.body;
        this.hideMode = 'visibility';
        Ext.ux.GhostBar.superclass.initComponent.apply(this, arguments);
    },

    onRender: function() {
        Ext.ux.GhostBar.superclass.onRender.apply(this, arguments);
        this.el.setStyle({
            position: 'absolute'
        });
        this.hide();
        this.cache.push(this);
    },

    init: function(c) {
        this.ownerCt = c;
        c.on({
            render: this.onClientRender,
            scope: this,
            single: true
        });
        c.onPosition = c.onPosition.createSequence(this.onClientPosition, this);
        c.onResize = c.onResize.createSequence(this.onClientResize, this);
    },

    onClientRender: function() {
        this.clientEl = this.ownerCt.getLayoutTarget ? this.ownerCt.getLayoutTarget() : this.ownerCt.el;
    },

    onClientResize: function() {
        this.setWidth(this.clientEl.getWidth(true));
        this.syncPosition();
    },

    onClientPosition: function() {
        this.syncPosition();
    },

    syncPosition: function() {
        var offsets = [this.clientEl.getBorderWidth('l'), 0];
        if (this.offsets) {
            offsets[0] += this.offsets[0];
            offsets[1] += this.offsets[1];
        }
        this.el.alignTo(this.clientEl, (this.position == 'top') ? 'tl-tl' : 'bl-bl', offsets);
        this.region = this.el.getRegion();
    },

    onDocMouseMove: function(e) {
        for (var i = 0; i < this.cache.length; i++) {
            this.checkMousePosition.call(this.cache[i], e);
        }
    },

    checkMousePosition: function(e) {
        this.syncPosition();
        var o = 1, d = this.region.getDistanceBetween(e.getPoint());
        if (d > this.threshold) {
            this.hide();
        } else if (d > 0) {

//          Mouse is within range of this Toolbar, so show it if its not already visible
            if (!this.isVisible()) {
                this.show();
            }
            o = 1 - (d / this.threshold);
        }
        var z = Ext.num(this.ownerCt.el.getStyle('zIndex'));
        this.el.setStyle({
            opacity: o,
            'zIndex': (typeof z == 'number') ? z + 3 : 'auto'
        });
    },

    onDestroy: function() {
//      Uncache this Toolbar when we are destroyed
        this.cache.splice(this.cache.indexOf(this), 1);
        Ext.ux.GhostBar.superclass.onDestroy.apply(this, arguments);
    }
});