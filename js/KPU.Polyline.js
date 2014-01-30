// KPU Polyline representation
// An object so that we can build arrays of Polylines to represent
// collections of half-plane polytopes.
//
// # Code

/** @namespace */
var KPU		= KPU 		|| {};
KPU.Polyline	= KPU.Polyline	|| function() {
    this.vertices = []
};

KPU.Polyline.prototype = {
    v: function(index) {
        return this.vertices[index];
    },
    dup: function() {
	return KPU.Polyline.create(this.vertices);
    },
    push: function(object) {
	this.vertices.push(object);
	return this.vertices.length;
    }
};

