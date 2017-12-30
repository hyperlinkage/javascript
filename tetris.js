(function(){

    var T = {};

    T.grid = [];
    T.activePiece = null;
    T.maxX= 11;
    T.maxY = 21;
    T.start = Math.floor((T.maxX  - 4) / 2);
    T.cellDimensions = 30;
    T.defaultInterval = 300;
    T.shortInterval = 25;
    T.boost = false;

    for(var x = 0; x < T.maxX; x++)
    {
        T.grid[x] = [];
            
        for(var y = 0; y < T.maxY; y++)
        {
            T.grid[x][y] = false;
        }
    }

    T.board  =  $("<div></div>");
    $("body").append(T.board);

    // $("body").append("<input type='button' onmousedown='T.moveLeft()' value='Left' />");
    // $("body").append("<input type='button' onmousedown='T.moveRight()' value='Right' />");

    var width =  (T.maxX * T.cellDimensions) + "px";
    var height = (T.maxY * ( T.cellDimensions - 1)) - 10 + "px";
    
    $(T.board).css("float", "left");
    $(T.board).css("background-color", "#333333");
    $(T.board).css("width", width);
    $(T.board).css("height", height);
    $(T.board).css("border-radius", 5);
    $(T.board).css("position", "relative");
    $(T.board).css("padding", "5px");
    $(T.board).css("margin", "0");

    T.addPiece = function(){

       var rand = Math.floor(Math.random() * T.shapes.length);

        var shape = T.shapes[rand];
        var piece =
        {
            blocks: [],
            shape: T.shapes[rand],
            y: 0
        };

        for(var i = 0; i < shape.length; i++)
        {
            for(var j = 0; j< shape[i].length; j++)
            {
                piece.element = $("<div/>");
                $(T.board).append(piece.element);
                
                if(shape[i][j] === true)
                {       
                    var l = T.start + j;
                    var t = i;
    
                    var block = new Block(rand);
                    block.x = l;
                    block.y = t;

                    block.element = $("<div/>")
                    $(piece.element).append(block.element);
                    
                    block.style();

                    piece.blocks[piece.blocks.length] = block;
                    
                    T.grid[l][t] = block;
                    
                    block.place();
                }     
            }
        }
        T.activePiece = piece;
    };

    T.tick = function ()
    {
        if(T.activePiece == null)
        {
            T.boost = false;
            
            // Remove anything that was previously frozen and move everything else down    
            for(var y = T.grid[0].length - 1; y >= 0; y--)
            {
                var rowCleared = false;
                
                for(var x = 0; x < T.grid.length; x++)
                {
                    var yAbove = y - 1;
                    if(T.grid[x][y] != false && T.grid[x][y].frozen)
                    {     
                        rowCleared = true;
                        T.grid[x][y] = false;
                    }
                }

                // Move everything above down one row
                if(rowCleared)
                {
                    for(var clrY = y; clrY >= 0; clrY--)
                    {
                        var yAbove = clrY - 1;
                        if(yAbove > 0)
                        {
                            for(var x = 0; x < T.grid.length; x++)
                            {                                
                                T.grid[x][clrY] = T.grid[x][yAbove];
                                T.grid[x][yAbove] = false;
                                if(T.grid[x][clrY] != false)
                                {
                                    T.grid[x][clrY].x = x;
                                    T.grid[x][clrY].y = clrY;
                                    T.grid[x][clrY].place();
                                }
                            }
                        }
                    }
                }

                // Increment the counter so the same row is processed again
                if(rowCleared)
                {
                    y++;
                }
                
            }

            var completedRows = false;
            // Check for completed rows and freeze them
            for(var y = T.grid[0].length - 1; y >= 0; y--)
            {
                var rowComplete = true;
                for(var x = 0; x < T.grid.length; x++)
                {
                    if(T.grid[x][y] == false)
                    {
                        rowComplete = false;
                        break;
                    }
                }

                if(rowComplete)
                {
                    completedRows = true;

                    // Remove the row from the board
                    for(var x = 0; x < T.grid.length; x++)
                    {
                        T.grid[x][y].freeze();
                    }
                }   
            }
            
            if(completedRows)
            {
                T.setTimeout();
                return;
            }

            T.addPiece();
        }
        else
        {
            // Check that the path below is clear
            var verticalCollision = false;
            var columnsCleared = [];
            //alert(T.activePiece.blocks.length);
            for(var i = T.activePiece.blocks.length - 1; i >= 0 ; i--)
            {
                var block = T.activePiece.blocks[i];
                
                var nextX = block.x;
                var nextY = block.y + 1;
                
                if(!columnsCleared[nextX])
                {
                    if(T.grid[nextX][nextY] != false)
                    {
                        verticalCollision = true;
                    }
                    else
                    {
                        columnsCleared[nextX] = true;
                    }
                }
            }
            
            if(verticalCollision)
            {
                T.activePiece = null;
            }
            else
            {
                for(var i = T.activePiece.blocks.length - 1; i >= 0 ; i--)
                {
                    var block = T.activePiece.blocks[i];
                    
                    if(block.y < T.maxY - 2)
                    {
                        var oldY = 0
                        block.y++;
                        block.place();
                        
                        T.grid[block.x][block.y - 1] = false;
                        T.grid[block.x][block.y] = block;

                    }
                    else
                    {
                        T.activePiece = null;
                        break;
                    }
                    
                }    
            }
        }

        T.setTimeout();
    } // end function tick

    T.setTimeout = function()
    {
        T.clock = setTimeout(T.tick, T.boost ? T.shortInterval : T.defaultInterval);
    }

    T.setTimeout();

    T.shuffle = function (a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }
    
    T.colours = ["red", "orange", "yellow", "green", "blue", "indigo", "blueviolet"];
    
    T.shapes = [
        [
            [false, true, true],
            [false, true, true]
        ],
        [
            [false, true, false],
            [false, true, false],
            [false, true, false],
            [false, true, false]
        ],
        [
            [false, true, false],
            [true, true, true]
        ],
        [
            [true, false, false],
            [true, false, false],
            [true, true, false]
        ],
        [
            [false, false, true],
            [false, false, true],
            [false, true, true]
        ],
        [
            [true, false, false],
            [true, true, false],
            [false, true, false]
        ],
        [
            [false, false, true],
            [false, true, true],
            [false, true, false]
        ]

    ];

    // T.shapes = [
    //     [
    //         [false, true, true]
    //     ],
    //     [
    //         [false, true, false]
    //     ]
    // ];

    T.shuffle(T.colours);
    T.shuffle(T.shapes);

    T.moveLeft = function(){

        // Check that the path to the left is clear
        var leftCollision = false;
        var rowsCleared = [];
        for(var i = 0; i < T.activePiece.blocks.length; i++)
        {
            var block = T.activePiece.blocks[i];
            
            var nextX = block.x - 1;
            var nextY = block.y;
            
            if(!rowsCleared[nextY])
            {
                if(T.grid[nextX][nextY] != false)
                {
                    leftCollision = true;
                }
                else
                {
                    rowsCleared[nextY] = true;
                }
            }
        }
        
        if(leftCollision)
        {
            //T.activePiece = null;
            return;
        }

        for(var i = T.activePiece.blocks.length - 1; i >= 0 ; i--)
        {
            var block = T.activePiece.blocks[i];
            
            if(block.x > 0)
            {
                var oldX = block.x;
                block.x--;
                
                T.grid[oldX][block.y] = false;
                T.grid[block.x][block.y] = block;
            
                block.place();
            }
            else
            {
                return;
            }
            
        }

    }

    T.moveRight = function(){

        // Check that the path to the right is clear
        var rightCollision = false;
        var rowsCleared = [];
        for(var i = T.activePiece.blocks.length - 1; i >= 0 ; i--)
        {
            var block = T.activePiece.blocks[i];
            
            var nextX = block.x + 1;
            var nextY = block.y;
            
            if(!rowsCleared[nextY])
            {
                if(T.grid[nextX][nextY] != false)
                {
                    rightCollision = true;
                }
                else
                {
                    rowsCleared[nextY] = true;
                }
            }
        }
        
        if(rightCollision)
        {
            //T.activePiece = null;
            return;
        }

        for(var i = T.activePiece.blocks.length - 1; i >= 0 ; i--)
        {
            var block = T.activePiece.blocks[i];
            
            if(block.x > 0)
            {
                var oldX = block.x;
                block.x++;
                
                T.grid[oldX][block.y] = false;
                T.grid[block.x][block.y] = block;
            
                block.place();
            }
            else
            {
                return;
            }
            
        }


    } // end function moveRight

    T.turn = function()
    {
        if(T.activePiece != null)
        {
            ///var piece = ;
            var newShape = [];
            
            var xMax = T.activePiece.shape.length;
            var yMax = T.activePiece.shape[0].length;

            // Rotate the shape
            for(var x = 0; x < xMax; x++)
            {
                for(var y = yMax - 1; y >=0; y--)
                {
                    var newX = (yMax - 1) - y;
                    var newY = x;
                    //alert(newY)
                    if(!newShape[newX])
                    {
                        newShape[newX] = [];
                    }

                    newShape[newX][newY] = T.activePiece.shape[x][y];

                }
            }

//            alert(T.activePiece.blocks.length);
            var pieceX = T.activePiece.blocks[0].x;
            var pieceY = T.activePiece.blocks[0].y; 
            var seed = T.activePiece.blocks[0].seed;

            // Remove the old piece from the board
            for(var i = 0; i < T.activePiece.blocks.length; i++)
            {
                var block = T.activePiece.blocks[i];
                
                block.remove();
                T.grid[block.x][block.y] = false;

            }
            T.activePiece.shape = newShape;
            T.activePiece.blocks = [];

            for(var i = 0; i < newShape.length; i++)
            {
                for(var j = 0; j< newShape[i].length; j++)
                {
                    if(newShape[i][j] === true)
                    {       
                        var l = pieceX + j;
                        var t = pieceY + i;
        
                        var block = new Block(seed);
                        block.x = l;
                        block.y = t;

                        block.element = $("<div/>")
                        $(T.activePiece.element).append(block.element);
                        
                        block.style();
                        
                        T.activePiece.blocks[T.activePiece.blocks.length] = block;
                        
                        T.grid[l][t] = block;
                        
                        block.place();
                    }     
                }
            }

        }

    } // end function turn

    var Block = function(seed)
    { 
        this.seed = seed;
        this.element = null;
        this.place = function()
        {
            $(this.element).css("left", (this.x * T.cellDimensions) + 5 + "px");
            $(this.element).css("top", (this.y * T.cellDimensions) + 5 + "px");
        }
        this.freeze = function()
        {
            this.frozen = true;
            $(this.element).css("background-color", "#aaaaaa");
            $(this.element).fadeOut(T.defaultInterval);
        }
        this.remove = function()
        {
            $(this.element).hide();
         
        }
        this.style = function()
        {
            $(this.element).css("width", T.cellDimensions - 6 + "px");
            $(this.element).css("height", T.cellDimensions - 6 + "px");
            $(this.element).css("background-color", T.colours[this.seed]);
            $(this.element).css("border","2px solid white");
            $(this.element).css("border-radius", ( this.seed * ((T.cellDimensions / 2) / T.shapes.length) ) + "px");
            $(this.element).css("position", "absolute");
    
        }
        this.frozen = false
        this.x = 0;
        this.y = 0;
        
    }



    $("body").keydown(function(args)
    {
        if(args.which == 37)
        {
            T.moveLeft();
        }
        else if (args.which == 39)
        {
            T.moveRight();
        }
        else if(args.which == 40) // down arrow
        {
            T.boost = true;
        }
        else if(args.which == 38) // up arrow
        {
            T.turn();
        }
    });

    $("body").keyup(function(args)
    {
        if(args.which == 40) // down arrow
        {
            T.boost = false;
        }
    });

    window.T = T;

})();
