// KPU Affine Dependence Graph representation
// An object representing the affine data dependencies
// in the system of recurrence equations
//
// # Code

/** @namespace */
var KPU 	 = KPU    	    || {};
KPU.DgVertex = KPU.DgVertex || function(name) {
    this.name = name;
};
KPU.adg	     = KPU.adg	    || function() {
    this.vertices = [];
};

KPU.DgVertex.prototype = {
    name: function() {
        return this.name;
    },
    setName: function(name) {
        this.name = name;
    }
};

KPU.adg.prototype = {
    v: function(index) {
        return this.vertices[index];
    },
    setVertex: function(index, dgVertex) {
        this.vertices[index] = dgVertex;
    }
};