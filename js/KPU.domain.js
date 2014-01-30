// KPU domain of computation representations
// This is mostly convex hull discovery and vertex sorting
//
// # Code

/** @namespace */
var KPU		= KPU        || {};
KPU.domain	= KPU.domain || function() {
    /**
     * the dimension of the constraints. It is used as a simple test
     * when adding constraints individually, so that we maintain a
     * consistent constraintSet data set.
     **/
    this.dim = 0;
    /**
     * constrainSet captures the Ax - b <= 0 constraints in the form { A:A, b:b }
    **/
    this.constraintSet = {};
    /**
     * polylineSet captures the polygon representation of each constraint
    **/
    this.polylineSet = [];
    /**
     * constraintSet and polylineSet are in sync, that is,
     * the constraint at index i is represented by the polyline at index i.
     * This functions as the association of the polygon representation
     * of the face of the convex polygon represented by the constraint at index i.
     *
     * To build the polygon, the base constraint at index i must be
     * combined with other constraints so that a full rank solution
     * is found. This represents a vertex of said polygon. Two vertices
     * of the polygon share an edge if their full rank solution
     * differs in only one constraint.
     *
     * For example, in the constraint set Ax = b, with
     * A =[ [-1,  0,  0],
     *      [ 0, -1,  0],
     *      [ 0,  0, -1],
     *      [ 1,  0,  0],
     *      [ 0,  1,  0],
     *      [ 0,  0,  1]], and
     * b = [ -1, -1, -1, N, N, N ],
     * the vertex defined by the constraint index set [1,2,3] is [1,1,1].
     * This vertex is adjacent to the constraint index set [1,2,6] which
     * represents the vertex at [1,1,N]. The complete set is
     * [1,2,3] == [1,1,1]
     * [1,2,6] == [1,1,N]
     * [1,5,3] == [1,N,1]
     * [1,5,6] == [1,N,N]
     * The polyline associated by the constraint at index 1 is defined
     * by the sequence: [1,2,3] -> [1,2,6] -> [1,5,6] -> [1,5,3] -> [1,2,3]
    **/

    this.setConstraintSet([ [-1,  0,  0],
                       [ 0, -1,  0],
        		       [ 0,  0, -1],
        		       [ 1,  0,  0],
        		       [ 0,  1,  0],
        	           [ 0,  0,  1]],
                       [-1, -1, -1, 10, 10, 10]);

	var polyline = new KPU.Polyline();
	polyline.push( [   1,  1, 1 ] );
	polyline.push( [  10,  1, 1 ] );
	polyline.push( [  10, 10, 1 ] );
	polyline.push( [   1, 10, 1 ] );
	polyline.push( [   1,  1, 1 ] );
	this.polylineSet.push(polyline);

	var polyline = new KPU.Polyline();
	polyline.push( [   1,  1, 10 ] );
	polyline.push( [  10,  1, 10 ] );
	polyline.push( [  10, 10, 10 ] );
	polyline.push( [   1, 10, 10 ] );
	polyline.push( [   1,  1, 10 ] );
	this.polylineSet.push(polyline);
};

KPU.domain.version = "1.0.0";

KPU.domain.prototype = {
    /**
     * return the number of polylines confining the convex hull of
     * the domain of computation represented by this KPU.domain object
     * 
     * @returns {Integer} number of polylines 
    **/
    getNrOfPolylines: function() {
	    return this.polylineSet.length;
    },

    setConstraintSet: function ( A, b ) {
        this.constraintSet = { A: A, b:b };
	    this.dim = this.constraintSet.A[0].lenght;
    },

    getConstraint: function ( id ) {
	    return this.constraintSet.A[id];
    },

    getPolyline: function ( id ) {
	    return this.polylineSet[id];
    },

    /**
     * Given a constraintSet, generate the polylines that can
     * visualize the convex hull of the domain of computation.
     */
    generatePolylines: function() {
        /**
         * we are going to visit all the vertices once,
         * accumulate the vertices with enough information
         * that we can sort them in a second pass into
         * polylines.
         */
        var A, b, Ai, Aj, Ak, bi, bj, bk, i, j, k, solution, x;
        A = this.constraintSet.A;
        b = this.constraintSet.b;
        var nrOfConstraints = A.length;
        var dimensionality = A[0].length;
        var A_v; // the matrix that defines a vertex of the convex hull
        var b_v;
        switch (dimensionality) {
            case 1:{
            }
            case 2:{
            }
            case 3: {
                for (i = 0; i < nrOfConstraints; ++i){
                    console.log('A[',i,']= [',A[i][0],A[i][1],A[i][2],']')
                }
                for (i = 0; i < nrOfConstraints-2; ++i) {
                    Ai = A[i]
                    bi = b[i]
                    for (j = i + 1; j < nrOfConstraints-1; ++j) {
                        Aj = A[j]
                        bj = b[j]
                        for (k = j + 1; k < nrOfConstraints; ++k) {
                            Ak = A[k]
                            bk = b[k]
                            A_v = [ Ai, Aj, Ak]
                            b_v = [ bi, bj, bk]
                            var solution = KPU.LU(A_v)
                            if (solution.fullRank) {
                                x = numeric.LUsolve(solution,b_v);
                                console.log ('x[] = [', x[0],x[1],x[2], ']')
                            }
                            else {
                                console.log ('A is singular for [',i,j,k,']')
                            }
                        }
                    }
                }
            }
        }
    },

    push: function(object) {
	    this.polylineSet.push(object);
	    return this.polylineSet.length;
    }
};

KPU.LU = function(A, bInplace) {
    bInplace = bInplace || false;

    var abs = Math.abs;
    var i, j, k, absAjk, Akk, Ak, Pk, Ai;
    var max;
    var epsilon = 1e-12;
    var fullRank = true;
    var n = A.length, n1 = n-1;
    var P = new Array(n);
    if(!bInplace) A = numeric.clone(A);

    for (k = 0; k < n; ++k) {
        Pk = k;
        Ak = A[k];
        max = abs(Ak[k]);
        for (j = k + 1; j < n; ++j) {
            absAjk = abs(A[j][k]);
            if (max < absAjk) {
                max = absAjk;
                Pk = j;
            }
        }
        P[k] = Pk;

        if (Pk != k) {
            A[k] = A[Pk];
            A[Pk] = Ak;
            Ak = A[k];
        }

        Akk = Ak[k];

        if (abs(Akk) > epsilon) {
            for (i = k + 1; i < n; ++i) {
                A[i][k] /= Akk;
            }
        } else {
            fullRank = false;
        }

        for (i = k + 1; i < n; ++i) {
            Ai = A[i];
            for (j = k + 1; j < n1; ++j) {
                Ai[j] -= Ai[k] * Ak[j];
                ++j;
                Ai[j] -= Ai[k] * Ak[j];
            }
            if(j===n1) Ai[j] -= Ai[k] * Ak[j];
        }
    }

    return {
        LU: A,
        P:  P,
        fullRank: fullRank
    }
}
/**
 *
	
	var polylineGeometry = new THREE.Geometry();
	var vertices = polylineGeometry.vertices;
	vertices.push( new THREE.Vector3(   1,  1, 1 ) );
	vertices.push( new THREE.Vector3(  10,  1, 1 ) );
	vertices.push( new THREE.Vector3(  10,  1, 10 ) );
	vertices.push( new THREE.Vector3(   1,  1, 10 ) );
	vertices.push( new THREE.Vector3(   1,  1, 1 ) );
	var lineMaterial =  new THREE.LineBasicMaterial( {color: 0xffffff} );
	var polyline = new THREE.Line( polylineGeometry, lineMaterial );
	scene.add(polyline);
	
	var polylineGeometry = new THREE.Geometry();
	var vertices = polylineGeometry.vertices;
	vertices.push( new THREE.Vector3(   1, 10, 1 ) );
	vertices.push( new THREE.Vector3(  10, 10, 1 ) );
	vertices.push( new THREE.Vector3(  10, 10, 10 ) );
	vertices.push( new THREE.Vector3(   1, 10, 10 ) );
	vertices.push( new THREE.Vector3(   1, 10, 1 ) );
	var lineMaterial =  new THREE.LineBasicMaterial( {color: 0xffffff} );
	var polyline = new THREE.Line( polylineGeometry, lineMaterial );
	scene.add(polyline);
	
	var polylineGeometry = new THREE.Geometry();
	var vertices = polylineGeometry.vertices;
	vertices.push( new THREE.Vector3(   1,  1, 1 ) );
	vertices.push( new THREE.Vector3(   1,  1, 10 ) );
	vertices.push( new THREE.Vector3(   1, 10, 10 ) );
	vertices.push( new THREE.Vector3(   1, 10, 1 ) );
	vertices.push( new THREE.Vector3(   1,  1, 1 ) );
	var lineMaterial =  new THREE.LineBasicMaterial( {color: 0xffffff} );
	var polyline = new THREE.Line( polylineGeometry, lineMaterial );
	scene.add(polyline);
	
	var polylineGeometry = new THREE.Geometry();
	var vertices = polylineGeometry.vertices;
	vertices.push( new THREE.Vector3(   1,  1, 1 ) );
	vertices.push( new THREE.Vector3(   1,  1, 10 ) );
	vertices.push( new THREE.Vector3(   1, 10, 10 ) );
	vertices.push( new THREE.Vector3(   1, 10, 1 ) );
	vertices.push( new THREE.Vector3(   1,  1, 1 ) );
	var lineMaterial =  new THREE.LineBasicMaterial( {color: 0xffffff} );
	var polyline = new THREE.Line( polylineGeometry, lineMaterial );
	scene.add(polyline);
**/
