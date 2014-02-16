// KPU domain of computation representations
// This is mostly convex hull discovery and vertex sorting
//
// # Code

/** @namespace */
var KPU		= KPU        || {};
KPU.domain = KPU.domain || function () {

    this.version = "1.0.0";
    /**
     * the dimension of the constraints. It is used as a simple test
     * when adding constraints individually, so that we maintain a
     * consistent constraintSet data set.
     **/
    this.dim = 0;
    /**
     * constrainSet captures the Ax - b <= 0 constraints in the form { A:A, b:b }
     **/
    this.constraintSet = {A: [], b: []};
    /**
     * vertices of the convex hull
     */
    this.vertices = [];
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

};


KPU.domain.prototype = {

    /**
     * set the complete constraint set defined by Ax <= b
     * @param A: constraint matrix
     * @param b: constraint rhs
     * For example, the constraint set Ax = b, representing a 3D CUBE
     * defined by the set ( (i,j,k) | 1 <= i,j,k <= N )
     * A =[ [-1,  0,  0],
     *      [ 0, -1,  0],
     *      [ 0,  0, -1],
     *      [ 1,  0,  0],
     *      [ 0,  1,  0],
     *      [ 0,  0,  1]], and
     * b = [ -1, -1, -1, N, N, N ],
     */
    setConstraintSet: function ( A, b ) {
        this.constraintSet = { A: A, b:b };
	    this.dim = A[0].length;
    },
    /**
     * set an individual constraint
     * @param id: ordinal of the constraint
     * @param dim: dimension of the constraint
     * @param constraint: the constraint vector
     * @param rhs: the constraint rhs
     */
    setConstraint: function ( id, cnstrnt, rhs) {
            if (this.dim === 0 || this.dim === cnstrnt.length) {
                this.dim = cnstrnt.length;
                this.constraintSet.A[id] = cnstrnt;
                this.constraintSet.b[id] = rhs;
            } else {
                console.error("inconsistent dimension of new constraint: constraint is ignored");
            }
    },
    /**
     * get the constraint set at index id
     * @param id
     * @returns {*}
     */
    getConstraint: function ( id ) {
	    return this.constraintSet.A[id];
    },
    /**
     * return the number of polylines confining the convex hull of
     * the domain of computation represented by this KPU.domain object
     *
     * @returns {Integer} number of polylines
     **/
    getNrOfPolylines: function() {
        return this.polylineSet.length;
    },
    /**
     * get the polyline at index id
     * @param id
     * @returns {{dim: *, vrtxArray: *}}
     */
    getPolyline: function ( id ) {
	    return {
            dim: this.dim,
            vrtxArray: this.polylineSet[id]
        }
    },

    /**
     * Given a constraintSet, generate the polylines that can
     * visualize the convex hull of the domain of computation.
     */
    generatePolylines: function() {
        /**
         * we are going to visit all the vertices once,
         * accumulate the vertices with enough information
         * so that we can sort them in a second pass into
         * a set of polylines, one for each constraint.
         * This sorting is necessary to identify adjacent vertices
         * so that we can easily construct a 3D polyline defined
         * by a sequence of connected vertices.
         */
        var Ai, Aj, Ak, bi, bj, bk, i, j, k, solution;
        var index = []; // constraint set index, and
        var x = [];     // solution defining the vertex of above constraints

        var vertex_id = 0;
        var A = this.constraintSet.A;
        var b = this.constraintSet.b;
        var nrOfConstraints = A.length;
        var dimensionality = A[0].length;
        var A_v, b_v; // the matrix and vector that define a vertex of the convex hull
        // create the vertexSet structure
        var indexSet = new Array();
        for (i = 0; i < nrOfConstraints; i++) {
            indexSet[i] = new Array();
        }
        switch (dimensionality) {
            case 1:{
                for (i = 0; i < nrOfConstraints; ++i) {
                    console.log('A[',i,']= [',A[i][0], ']')
                }
                for (i = 0; i < nrOfConstraints; ++i) {
                    A_v = A[i][0];
                    b_v = b[i];
                    if (A_v !== 0) {
                        x = b_v/A_v;
                        index = [i];
                        this.vertices[vertex_id++] = { index:index, vertex:x };
                        indexSet[i].push(index);
                        console.log ('x = [', x, ']')
                    }
                    else {
                        console.log ('A is singular for [',i,']')
                    }
                }
                console.error("Can't see one dimensional constraints")
                break;
            }
            case 2:{
                for (i = 0; i < nrOfConstraints; ++i) {
                    console.log('A[',i,']= [',A[i][0],A[i][1],']')
                }
                for (i = 0; i < nrOfConstraints-1; ++i) {
                    Ai = A[i];
                    bi = b[i];
                    for (j = i + 1; j < nrOfConstraints; ++j) {
                        Aj = A[j];
                        bj = b[j];
                        A_v = [ Ai, Aj];
                        b_v = [ bi, bj];
                        solution = KPU.LU(A_v);
                        if (solution.fullRank) {
                            x = numeric.LUsolve(solution,b_v);
                            index = [i, j];
                            this.vertices[vertex_id++] = { index:index, vertex:x };
                            indexSet[i].push(index);
                            indexSet[j].push(index);
                            console.log ('x[] = [', x[0],x[1], ']')
                        }
                        else {
                            console.log ('A is singular for [',i,j,']')
                        }
                    }
                }
                break;
            }
            case 3: {
                for (i = 0; i < nrOfConstraints; ++i) {
                    console.log('A[',i,']= [',A[i][0],A[i][1],A[i][2],']')
                }
                for (i = 0; i < nrOfConstraints-2; ++i) {
                    Ai = A[i];
                    bi = b[i];
                    for (j = i + 1; j < nrOfConstraints-1; ++j) {
                        Aj = A[j];
                        bj = b[j];
                        for (k = j + 1; k < nrOfConstraints; ++k) {
                            Ak = A[k];
                            bk = b[k];
                            A_v = [ Ai, Aj, Ak];
                            b_v = [ bi, bj, bk];
                            solution = KPU.LU(A_v);
                            if (solution.fullRank) {
                                x = numeric.LUsolve(solution,b_v);
                                index = [i, j, k];
                                this.vertices[vertex_id++] = { index:index, vertex:x };
                                indexSet[i].push(index);
                                indexSet[j].push(index);
                                indexSet[k].push(index);
                                //console.log ('x[] = [', x[0],x[1],x[2], ']')
                            }
                            else {
                                //console.log ('A is singular for [',i,j,k,']')
                            }
                        }
                    }
                }
            }
        }

        for ( i in this.vertices) {
            console.log(this.vertices[i].index + ' associated with ' + this.vertices[i].vertex);
        }

        /**
         * In order to create a proper visualization of each half plane constraint
         * we need to order the index sets for each vertex in such a way that two
         * vertices are adjacent if and only if they differ in just one constraint.
         * For example, the following vertices:
         * index [0,1,2] associated with vertex at [1,1,1]
         * index [0,1,5] associated with vertex at [1,1,10]
         * index [0,2,4] associated with vertex at [1,10,1]
         * index [0,4,5] associated with vertex at [1,10,10]
         * must be ordered like this: [0,1,2] -> [0,1,5] -> [0,4,5] -> [0,2,4]
         */

        /* print the indexSets
        for (i in indexSet) {
            console.log('Constraint ' + i + " : ")
            for (j in indexSet[i]) {
                x = indexSet[i][j];
                console.log ('[', x[0],x[1],x[2], '], ')
            }
        }
        */

        /* order the indexSets. To create a polyline visualization, the
         * vertexSets need to be ordered such that adjacent vertices are adjacent
         * in the array. Two vertices are adjacent if they differ in just one
         * constraint. We are going to scan the indexSet and order them in place.
         * Once we have an ordered indexSet, we can generate the proper vertexSet.
         */
        for (var cnstrnt = 0; cnstrnt < nrOfConstraints; cnstrnt++) {
            var indices = indexSet[cnstrnt];
            var nrOfIndices = indices.length;
            for (i = 0; i < nrOfIndices-1; i++) {
                var base = indices[i];
                var target = i+1;
                for (j = i+1; j < nrOfIndices; j++) {
                    if (this.similarity(base, indices[j]) === dimensionality-1) {
                        target = j;
                        break;
                    }
                }
                if (target !== i+1) {
                    this.swap(indices,i+1,target);
                }
            }
        }
        for (i in indexSet) {
            console.log('Constraint ' + i + " : ")
            for (j in indexSet[i]) {
                x = indexSet[i][j];
                console.log ('[', x[0],x[1],x[2], '], ')
            }
        }

        /*
         * finally, create the polylines
         * To improve visual acuity, I am 'pushing' the vertices along
         * the normal of the constraint half-plane so that all the half-planes
         * are separated visually.
         */
        for (i in indexSet) {
            var offset = numeric.clone(A[i]);
            for (e in offset) {
                offset[e] *= 0.5;
            }
            var polyline = [];
            for (j in indexSet[i]) {
                x = indexSet[i][j];
                for (k in this.vertices) {
                    index = this.vertices[k].index;
                    if (index === x) {
                        var vertex = numeric.clone(this.vertices[k].vertex);
                        for (e = 0; e < dimensionality; e++) {
                            vertex[e] = vertex[e] + offset[e];
                        }
                        polyline.push(vertex);
                        break;
                    }
                }
            }
            polyline.push(polyline[0]); // to create a closed vertex set
            this.pushPolyline(polyline);
        }
    },
    /**
     * similarity: calculate the similarity between two index vectors
     * This function returns the number of indices that are shared among the two input vectors.
     * @param i1: vector containing a set of indices
     * @param i2: second vector to compare to
     * @return: number of element matches between the two vectors
     * Example: i1 = [ 0, 1, 2], i2 = [ 1, 2, 3], similarity will return 2
     * for the sum of the matches of the elements, [1, 2].
     * Otherwise stated, similarity calculates the cardinality of the intersection
     * of the two input sets.
     * I am using the O(n^2) brute force method of enumerating both sets.
     * We can get away with that as the index sets are relatively small, typically
     * less than 3 element triples and sets less than 5 or 6 elements.
     */
    similarity: function(i1, i2) {
        // count the number of similarities
        var similarity = 0;
        if (i1.length === i2.length) {
            for (i in i1) {
                for (j in i2) {
                    if (i1[i] === i2[j]) {
                        similarity++;
                        break;
                    }
                }
            }
        }
        return similarity;
    },

    swap: function(indexSet, i1, i2) {
        var tmp = indexSet[i1];
        indexSet[i1] = indexSet[i2];
        indexSet[i2] = tmp;
    },

    pushPolyline: function(polyline) {
	    this.polylineSet.push(polyline);
	    return this.polylineSet.length;
    }
};

/**
 * Straight forward LU decomposition with pivoting
 * @param A
 * @param bInplace
 * @returns {{LU: *, P: Array, fullRank: boolean}}
 * @constructor
 */
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

