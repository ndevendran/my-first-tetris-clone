canvas = document.getElementById("gameboard");
context = canvas.getContext("2d");
var board = [];
var collision = false;
var pieces = [
               [[0,0,0,0],
                [1,1,1,1],
                [0,0,0,0],
                [0,0,0,0]],
                
               [[1,1],
                [1,1]],
                
               [[1,1,0],
                [0,1,1],
                [0,0,0]],
               
               [[1,1,0],
                [0,1,0],
                [0,1,0]],
               
               [[0,1,1],
                [0,1,0],
                [0,1,0]],
                
               [[1,1,1],
                [0,1,0],
                [0,0,0]],
                
               [[0,1,1],
                [1,1,0],
                [0,0,0]]
             ];
             
var colors = ["red", "cyan", "green", "yellow", "magenta", "grey", "blue"];
var board_height = 21;
var board_width = 11;
var puzzle = new Puzzle();
var x;
var y;
var piece_size = 15;
var lines;
var score = new Score();
var gameId;
var speedBoost = 35;

function createEmptyGrid(ywidth, xwidth){
    var newPuzzle = [];
    for(y=0; y<ywidth; y++){
        newPuzzle.push(new Array());
        for(x=0; x<xwidth; x++){
            newPuzzle[y].push(0);
        }
    }
    return newPuzzle;
}

function Puzzle (){
    this.array = [];
    this.next = [];
    this.nextFill = "black";
    this.fill = "black";
    this.topleftx = 5;
    this.toplefty = 0;
    this.bottom;
    this.border = 1;
    
    this.setBot = function setBot(){
        for(y=this.array.length-1; y >= 0; y--){
            for(x=0; x<this.array[y].length; x++){
                if(this.array[y][x] === 1){
                    this.bottom = y+2;
                }
            }
        }
    }

    this.shiftUp = function shiftUp(){
        for(x=0; x<this.array[0].length; x++){
            if(this.array[0][x]){
                return 0;    // do nothing
            }
        }
        var newPuzzle = createEmptyGrid(this.array.length, this.array[0].length);
        for(y=this.array.length - 1; y>0; y--){
            for(x=0; x<this.array[y].length; x++){
                newPuzzle[y-1][x] = this.array[y][x];
            }
        }
        this.array = newPuzzle;
        return 1;
    }
    
    this.mayRotate = function mayRotate(){
        var newY;
        var newX;
        for(y=0; y<this.array.length; y++){
            for(x=0; x<this.array[y].length; x++){
                if(this.array[y][x]){
                    newY = this.array[y].length - 1 - x;
                    newX = y;
                    if((newX + this.topleftx) < 0 || (newX + this.topleftx) >= board_width){
                        return false;
                    }
                    if((newY + this.toplefty) >= board_height){
                        return false;
                    }
                    if(board[this.toplefty+newY][this.topleftx+newX]){
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    this.rotate = function rotate(){
        var newPuzzle = createEmptyGrid(this.array.length, this.array[0].length);
        var newX;
        var newY;
        for(y=0; y<this.array.length; y++){
            for(x=0; x<this.array[y].length; x++){
                if(this.array[y][x]){
                    newY = this.array[y].length - 1 - x;
                    newX = y;
                    newPuzzle[newY][newX] = this.array[y][x];
                }
            }
        }
        this.array = newPuzzle;
        this.shiftUp();
    }
    
    this.mayMoveRight = function mayMoveRight(){
        for(y=0; y<this.array.length; y++){
            for(x=this.array[y].length-1; x>=0; x--){
                if(this.array[y][x]){
                    if(this.topleftx + 1 + x > board_width-1){
                        return false;
                    }
                    if(board[this.toplefty+y][this.topleftx+x+1]){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    this.moveRight = function moveRight(){
        if(this.mayMoveRight()){
            this.topleftx += 1;
        }
    }

    this.mayMoveLeft = function mayMoveLeft(){    
        for(y=0; y<this.array.length; y++){
            for(x=0; x<this.array[y].length; x++){
                if(this.array[y][x]){
                    if(this.topleftx - 1 + x < 0){
                        return false;
                    }
                    if(board[this.toplefty+y][this.topleftx-1+x]){
                        return false;
                    }
                }
            }
        }
        return true;
    }
            

    this.moveLeft = function moveLeft(){
        if(this.mayMoveLeft()){
            this.topleftx -= 1;
        }
    }

    this.mayMoveDown = function mayMoveDown(){
        for(y=0; y<this.array.length; y++){
            for(x=0; x<this.array[y].length; x++){
                if(this.array[y][x] && y+this.toplefty+1 > board_height-1){
                    return false;
                }
                if(this.array[y][x] && y+this.toplefty+1 <= board_height){
                    if(board[this.toplefty+1+y][this.topleftx+x]){
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    this.mayPlace = function mayPlace(){
        for(y=0; y<this.array.length; y++){
            for(x=0; x<this.array[y].length; x++){
                if(this.array[y][x]){
                    if(board[this.toplefty+y][this.topleftx+x]){
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    this.makeBlock = function makeBlock(context, fill, topleftx, toplefty){
        context.fillStyle = "white";
        context.fillRect((topleftx+x)*piece_size, (toplefty+y)*piece_size, piece_size, piece_size);
        context.fillStyle = fill;
        context.fillRect((topleftx+x)*piece_size+this.border, (toplefty+y)*piece_size+this.border, piece_size-2*this.border, piece_size-2*this.border);        
    }
    
    this.draw = function draw(context) {
        for(y=0; y<this.array.length; y++){
            for(x=0; x<this.array[y].length; x++){
                if(this.array[y][x]){
                    this.makeBlock(context, this.fill, this.topleftx, this.toplefty);
                }
            }
        }
    }

}

function Score() {
    this.playerScore = 0;
    this.score_array = [40, 100, 300, 1200];
    this.levels = 0;
    this.totalLines = 0;
    
    this.getScore = function getScore(line_count){
        if(line_count > 0){
            this.playerScore += this.score_array[line_count-1]*(this.levels+1);
            this.totalLines += line_count;
            this.levels = Math.floor(this.totalLines/10);
        }
    };

    this.draw = function draw(){
        //coordinates of next piece teaser
        var nextx = 14;
        var nexty = 11;
        context.fillStyle = "black";
        context.fillRect(board_width*piece_size+piece_size,0,100, 315);
        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText("Score:", board_width*piece_size+piece_size, 20);
        context.fillText(this.playerScore.toString(), board_width*piece_size+piece_size, 40);
        context.fillText("Level: " +   this.levels.toString(), board_width*piece_size+piece_size, 80);
        context.fillText("Lines: " + this.totalLines.toString(), board_width*piece_size+piece_size, 120);
        for(y=0; y<puzzle.next.length; y++){
            for(x=0; x<puzzle.next[y].length; x++){
                if(puzzle.next[y][x]){
                    // context.fillRect((nextx+x)*piece_size, (nexty+y)*piece_size, piece_size, piece_size);
                    puzzle.makeBlock(context, puzzle.nextFill, nextx, nexty);
                }
            }
        }
    };
}

    

for(y=0; y<board_height; y++){
    board = createEmptyGrid(board_height, board_width);
}



/* Randomly pick next piece */

function nextPiece(){
    var i = Math.floor(Math.random()*pieces.length);
    if(puzzle.next.length > 0){
        puzzle.array = puzzle.next;
        puzzle.fill = puzzle.nextFill;
        puzzle.next = pieces[i];
        puzzle.nextFill = colors[i];
    }
    else {
        puzzle.array=pieces[i];
        puzzle.fill = colors[i];
        i = Math.floor(Math.random()*pieces.length);
        puzzle.next = pieces[i];
        puzzle.nextFill = colors[i];
    }
    
}





function checkLines(){
    lines = [];
    var line_count = 0;
    var notFull = false;
    for(y=0; y<board.length; y++){
        for(x=0; x<board[y].length;x++){
            if(!board[y][x]){
                notFull = true;
                break;
            }
        }
        if(notFull){
            notFull = false;
            continue;
        }
        lines.push(y);
        line_count++;
    }
    score.getScore(line_count);
}

function removeLines(){
    var i;
    for(i=0; i<lines.length; i++){
        for(y = lines[i]; y > 0; y--){
            for(x=0; x<board[y].length; x++){
                board[y][x] = board[y-1][x];
            }
        }
    }
    lines = [];
}



/* setup keyboard commands */

document.onkeydown = function(e){
        if(!e){e = window.event;}
        if(e.keyCode == 38 && puzzle.mayRotate()){
        puzzle.rotate();
        }
        if(e.keyCode == 37){
            puzzle.moveLeft();
        }
        if(e.keyCode == 39){
            puzzle.moveRight();
        }
}

/* The game loop */

nextPiece();

function game_step(){
    if(collision){
        for(y=0; y<puzzle.array.length; y++){
            for(x=0; x<puzzle.array[y].length; x++){
                if(puzzle.array[y][x]){
                    var boardX = puzzle.topleftx + x;
                    var boardY = puzzle.toplefty + y;
                    board[boardY][boardX] = puzzle.fill;
                }
            }
        }
        puzzle.toplefty = 0;
        puzzle.topleftx = Math.floor(board_width/2);
        if(puzzle.mayPlace()){
            nextPiece();
            collision = false;
        }
        else{
            alert("game over");
            clearTimeout(gameId);
            return;
        }

    }
    
    puzzle.setBot();
    
    if(puzzle.mayMoveDown()){
        puzzle.toplefty += 1;
    }
    else{
        collision = true;
    }
    checkLines();
    removeLines();

    draw_board();
    score.draw();
    draw_puzzle();
    var speed = 400-speedBoost*  score.levels;
    gameId = setTimeout(game_step, speed);
}

/* draw board onto canvas */


function draw_board(){
    for(y=0; y<board.length; y++){
        for(x=0; x<board[y].length; x++){
            if(board[y][x]){
                // context.fillStyle = board[y][x];
                // context.fillRect(x*piece_size, y*piece_size, piece_size, piece_size);
                puzzle.makeBlock(context, board[y][x], 0, 0);
            }
            else{
                context.fillStyle = "black";
                context.fillRect(x*piece_size, y*piece_size, piece_size, piece_size);
            }
        }
    }
}



function draw_puzzle(){
        // context.fillStyle = puzzle.fill;
    // for(y=0; y<puzzle.array.length; y++){
        // for(x=0; x<puzzle.array[y].length; x++){
            // if(puzzle.array[y][x]){
                // context.fillRect((puzzle.topleftx+x)*piece_size, (puzzle.toplefty+y)*piece_size, piece_size, piece_size);
            // }
        // }
    // }
    puzzle.draw(context);
}

/* initialize game loop */

game_step();
