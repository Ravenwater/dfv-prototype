// KPU Affine Dependence Graph representation
// An object representing the affine data dependencies
// in the system of recurrence equations
//
// # Code

/** @namespace */
var KPU 	 = KPU    	    || {};
KPU.Fabric   = KPU.Fabric   || function() {
    /**
     * version identifier
     * @type {string} release.major.minor
     */
    this.version = "1.0.0";

    this.extent = new KPU.Polyline();
};

KPU.Fabric.prototype = {
    v: function(index) {
        return this.extent.v(index);
    },
    push: function(index, vertex) {
        this.extent.push(vertex);
    },
    getPolyline: function() {
        return this.extent;
    },
    generateExtent: function(orientation) {
        switch (orientation) {
            case 1:
            {
                this.extent.push([0, -9, 9]);
                this.extent.push([-9, 9, 0]);
                this.extent.push([-9, 18, -9]);
                this.extent.push([0, 9, -9]);
                this.extent.push([9, -9, 0]);
                this.extent.push([9, -18, 9]);
                this.extent.push([0, -9, 9]);
                break;
            }
            case 2:
            {
                this.extent.push([-9, -9, 18]);
                this.extent.push([-9, 0, 9]);
                this.extent.push([0, 9, -9]);
                this.extent.push([9, 9, -18]);
                this.extent.push([9, 0, -9]);
                this.extent.push([0, -9, 9]);
                this.extent.push([-9, -9, 18]);
                break;
            }
            case 3:
            {
                this.extent.push([-9,0,9]);
                this.extent.push([-18,9,9]);
                this.extent.push([-9,9,0]);
                this.extent.push([9,0,-9]);
                this.extent.push([18,-9,-9]);
                this.extent.push([9,-9,0]);
                this.extent.push([-9,0,9]);
            }
        }
    }
};