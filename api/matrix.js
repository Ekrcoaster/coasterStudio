class Matrix {
    /**@type {Number[][]} */
    elementRows = [];

    constructor(elementRows = [[]]) {
        this.elementRows = elementRows;
    }

    getRowLength() {
        return this.elementRows.length;
    }

    getColLength() {
        return this.elementRows[0].length;
    }

    getSize() {
        return {
            r: this.getRowLength(),
            c: this.getColLength()
        }
    }
    
    setAsTransformMatrix(x, y, angle, scaleX, scaleY, sheerX = 0, sheerY = 0) {
        this.elementRows = [
            [scaleX, sheerX, x],
            [sheerY, scaleY, y],
            [0, 0, 1]
        ];
        let rad = DEGREE_TO_RADIANS * angle;
        this.multiply(new Matrix([
            [Math.cos(rad), Math.sin(rad), 0],
            [-Math.sin(rad), Math.cos(rad), 0],
            [0, 0, 1]
        ]));
        return this;
    }
    setAsInverseTransformMatrix(x, y, angle, scaleX, scaleY, sheerX = 0, sheerY = 0) {
        this.elementRows = [
            [scaleX, sheerX, x],
            [sheerY, scaleY, y],
            [0, 0, 1]
        ];
        let rad = DEGREE_TO_RADIANS * angle;
        this.inverse();
        let rot = new Matrix([
            [Math.cos(rad), Math.sin(rad), 0],
            [-Math.sin(rad), Math.cos(rad), 0],
            [0, 0, 1]
        ]);
        rot.inverse();
        this.multiply(rot);
        return this;
    }

    /**@param {Matrix} b */
    addNew(b) {
        if(b.getRowLength() != this.getRowLength() || b.getColLength() != this.getColLength())
            throw "Cannot add 2 matrices of different sizes.";

        let add = [];
        for(let r = 0; r < this.elementRows.length; r++) {
            let temp = [];
            for(let c = 0; c < this.elementRows[0].length; c++) {
                temp.push(this.elementRows[r][c] + b.getElement(r, c));
            }
            add.push(temp);
        }

        return new Matrix(add);
    }

    /**@param {Matrix} b */
    multiplyNew(b) {
        return new Matrix(this._multiply(b));
    }

    /**@param {Matrix} b */
    multiply(b) {
        this.elementRows = this._multiply(b);
        return this;
    }

    /**@param {Matrix} b */
    _multiply(b) {
        if(this.getColLength() != b.getRowLength())
        throw "Matrices aren't size compatable";

        let res = [];
        for(let r = 0; r < this.getRowLength(); r++) {
            let temp = [];
            for(let c = 0; c < b.getColLength(); c++) {
                let sum = 0;
                for(let aC = 0; aC < this.getColLength(); aC++) {
                    sum += this.getElement(r, aC) * b.getElement(aC, c);
                }
                temp.push(sum);
            }
            res.push(temp);
        }

        for(let r = 0; r < res.length; r++) {
            for(let c = 0; c < res[r].length; c++)
                res[r][c] = Math.round(res[r][c] * 1000000) / 1000000;
        }

        return res;
    }

    getElement(r, c) {
        return this.elementRows[r][c];
    }

    setElement(r, c, value) {
        this.elementRows[r][c] = value;
        return this;
    }

    inverse() {
        this.elementRows = this._inverse();
        return this;
    }

    inverseNew() {
        return new Matrix(this._inverse());
    }
    
    // not mine, https://web.archive.org/web/20210406035905/http://blog.acipo.com/matrix-inversion-in-javascript/
    _inverse(){
        // I use Guassian Elimination to calculate the inverse:
        // (1) 'augment' the matrix (left) by the identity (on the right)
        // (2) Turn the matrix on the left into the identity by elemetry row ops
        // (3) The matrix on the right is the inverse (was the identity matrix)
        // There are 3 elemtary row ops: (I combine b and c in my code)
        // (a) Swap 2 rows
        // (b) Multiply a row by a scalar
        // (c) Add 2 rows
        
        //if the matrix isn't square: exit (error)
        if(this.elementRows.length !== this.elementRows[0].length){return "Matrix isn't square!";}
        
        //create the identity matrix (I), and a copy (C) of the original
        var i=0, ii=0, j=0, dim=this.elementRows.length, e=0, t=0;
        var I = [], C = [];
        for(i=0; i<dim; i+=1){
            // Create the row
            I[I.length]=[];
            C[C.length]=[];
            for(j=0; j<dim; j+=1){
                
                //if we're on the diagonal, put a 1 (for identity)
                if(i==j){ I[i][j] = 1; }
                else{ I[i][j] = 0; }
                
                // Also, make the copy of the original
                C[i][j] = this.elementRows[i][j];
            }
        }
        
        // Perform elementary row operations
        for(i=0; i<dim; i+=1){
            // get the element e on the diagonal
            e = C[i][i];
            
            // if we have a 0 on the diagonal (we'll need to swap with a lower row)
            if(e==0){
                //look through every row below the i'th row
                for(ii=i+1; ii<dim; ii+=1){
                    //if the ii'th row has a non-0 in the i'th col
                    if(C[ii][i] != 0){
                        //it would make the diagonal have a non-0 so swap it
                        for(j=0; j<dim; j++){
                            e = C[i][j];       //temp store i'th row
                            C[i][j] = C[ii][j];//replace i'th row by ii'th
                            C[ii][j] = e;      //repace ii'th by temp
                            e = I[i][j];       //temp store i'th row
                            I[i][j] = I[ii][j];//replace i'th row by ii'th
                            I[ii][j] = e;      //repace ii'th by temp
                        }
                        //don't bother checking other rows since we've swapped
                        break;
                    }
                }
                //get the new diagonal
                e = C[i][i];
                //if it's still 0, not invertable (error)
                if(e==0){return "Not invertable!"}
            }
            
            // Scale this row down by e (so we have a 1 on the diagonal)
            for(j=0; j<dim; j++){
                C[i][j] = C[i][j]/e; //apply to original matrix
                I[i][j] = I[i][j]/e; //apply to identity
            }
            
            // Subtract this row (scaled appropriately for each row) from ALL of
            // the other rows so that there will be 0's in this column in the
            // rows above and below this one
            for(ii=0; ii<dim; ii++){
                // Only apply to other rows (we want a 1 on the diagonal)
                if(ii==i){continue;}
                
                // We want to change this element to 0
                e = C[ii][i];
                
                // Subtract (the row above(or below) scaled by e) from (the
                // current row) but start at the i'th column and assume all the
                // stuff left of diagonal is 0 (which it should be if we made this
                // algorithm correctly)
                for(j=0; j<dim; j++){
                    C[ii][j] -= e*C[i][j]; //apply to original matrix
                    I[ii][j] -= e*I[i][j]; //apply to identity
                }
            }
        }
        
        //we've done all operations, C should be the identity
        //matrix I should be the inverse:
        return I;
    }
}