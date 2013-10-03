canvas = document.getElementById("gameboard");
context = canvas.getContext("2d");

var gameId;

function game_init(){
	board = new Board();
	board.board = createEmptyGrid(board.board_height,board.board_width);
	collision = false;
	puzzle = new Puzzle();
	piece_size = 15;
	score = new Score();
	speed = 48;
	frames = 0;
	eventQueue = [];
	paused = false;
	drop = false;
}

game_init();

function createEmptyGrid(ywidth, xwidth){
    var newPuzzle = [];
	var x, y;
    for(y=0; y<ywidth; y++){
        newPuzzle.push(new Array());
        for(x=0; x<xwidth; x++){
            newPuzzle[y].push(0);
        }
    }
    return newPuzzle;
}

function Board (){
	this.board = [];
	this.board_height = 21;
	this.board_width = 11;
	var x, y;
	
	this.mayRotate = function mayRotate(puzzle){
		var newY, newY;
		for(y=0; y<puzzle.array.length; y++){
			for(x=0; x<puzzle.array[y].length; x++){
				if(puzzle.array[y][x]){
					newY = puzzle.array[y].length - 1 - x;
					newX = y;
					if((newX + puzzle.topleftx) < 0 || (newX + puzzle.topleftx) >= this.board_width){
						return false;
					}
					if((newY + puzzle.toplefty) >= this.board_height){
						return false;
					}
					if(this.board[puzzle.toplefty+newY][puzzle.topleftx+newX]){
						return false;
					}
				}
			}
		}
		return true;
	};
	
	this.mayMoveRight = function mayMoveRight(puzzle){
		for(y=0; y<puzzle.array.length; y++){
			for(x=puzzle.array[y].length-1; x>=0; x--){
				if(puzzle.array[y][x]){
					if(puzzle.topleftx + 1 + x > this.board_width-1){
						return false;
					}
					if(this.board[puzzle.toplefty+y][puzzle.topleftx+x+1]){
						return false;
					}
				}
			}
		}
		return true;
    }
	
	this.mayMoveLeft = function mayMoveLeft(puzzle){    
		for(y=0; y<puzzle.array.length; y++){
			for(x=0; x<puzzle.array[y].length; x++){
				if(puzzle.array[y][x]){
					if(puzzle.topleftx - 1 + x < 0){
						return false;
					}
					if(this.board[puzzle.toplefty+y][puzzle.topleftx-1+x]){
						return false;
					}
				}
			}
		}
		return true;
    }
	
	
	this.mayMoveDown = function mayMoveDown(puzzle){
        for(y=0; y<puzzle.array.length; y++){
            for(x=0; x<puzzle.array[y].length; x++){
                if(puzzle.array[y][x] && y+puzzle.toplefty+1 > this.board_height-1){
                    return false;
                }
                if(puzzle.array[y][x] && y+puzzle.toplefty+1 <= this.board_height){
                    if(this.board[puzzle.toplefty+1+y][puzzle.topleftx+x]){
                        return false;
                    }
                }
            }
        }
        return true;
    }
	
	this.mayPlace = function mayPlace(puzzle){
        for(y=0; y<puzzle.array.length; y++){
            for(x=0; x<puzzle.array[y].length; x++){
                if(puzzle.array[y][x]){
                    if(this.board[puzzle.toplefty+y][puzzle.topleftx+x]){
                        return false;
                    }
                }
            }
        }
        return true;
    }
	
	this.draw = function draw(puzzle){
		for(y=0; y<this.board.length; y++){
			for(x=0; x<this.board[y].length; x++){
				if(this.board[y][x]){
					// context.fillStyle = board[y][x];
					// context.fillRect(x*piece_size, y*piece_size, piece_size, piece_size);
					puzzle.makeBlock(context, this.board[y][x], 0, 0);
				}
				else{
					context.fillStyle = "black";
					context.fillRect(x*piece_size, y*piece_size, piece_size, piece_size);
				}
			}
		}
	}
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
	var x, y;
    
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
    
    this.moveRight = function moveRight(){
            this.topleftx += 1;
	}


            

    this.moveLeft = function moveLeft(){
            this.topleftx -= 1;
    }
    
    this.makeBlock = function makeBlock(context, fill, topleftx, toplefty, x, y){
        context.fillStyle = "white";
        context.fillRect((topleftx+x)*piece_size, (toplefty+y)*piece_size, piece_size, piece_size);
        context.fillStyle = fill;
        context.fillRect((topleftx+x)*piece_size+this.border, (toplefty+y)*piece_size+this.border, piece_size-2*this.border, piece_size-2*this.border);        
    }
    
    this.draw = function draw(context) {
        for(y=0; y<this.array.length; y++){
            for(x=0; x<this.array[y].length; x++){
                if(this.array[y][x]){
                    this.makeBlock(context, this.fill, this.topleftx, this.toplefty, x, y);
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

    this.draw = function draw(board){
        //coordinates of next piece teaser
        var nextx = 14;
        var nexty = 11;
		var x, y;
        context.fillStyle = "black";
        context.fillRect(board.board_width*piece_size+piece_size,0,100, 315);
        context.fillStyle = "white";
        context.font = "20px Arial";
        context.fillText("Score:", board.board_width*piece_size+piece_size, 20);
        context.fillText(this.playerScore.toString(), board.board_width*piece_size+piece_size, 40);
        context.fillText("Level: " +   this.levels.toString(), board.board_width*piece_size+piece_size, 80);
        context.fillText("Lines: " + this.totalLines.toString(), board.board_width*piece_size+piece_size, 120);
        for(y=0; y<puzzle.next.length; y++){
            for(x=0; x<puzzle.next[y].length; x++){
                if(puzzle.next[y][x]){
                    //context.fillRect((nextx+x)*piece_size, (nexty+y)*piece_size, piece_size, piece_size);
                    puzzle.makeBlock(context, puzzle.nextFill, nextx, nexty, x, y);
                }
            }
        }
    };
}

for(y=0; y<board.board_height; y++){
    board.board = createEmptyGrid(board.board_height, board.board_width);
}



/* Randomly pick next piece */

var nextPiece = function (){
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
	var x, y;
    var lines = [];
    var line_count = 0;
    var notFull = false;
    for(y=0; y<board.board.length; y++){
        for(x=0; x<board.board[y].length;x++){
            if(!board.board[y][x]){
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
	return lines;
}

function removeLines(lines){
    var i;
	var x, y;
    for(i=0; i<lines.length; i++){
        for(y = lines[i]; y > 0; y--){
            for(x=0; x<board.board[y].length; x++){
                board.board[y][x] = board.board[y-1][x];
            }
        }
    }
    lines = [];
}



/* setup keyboard commands */

document.onkeydown = function(event){
        if(!event){event = window.event;}
				if(event.keyCode == 13){
			if(paused){
				paused = false;
				gameId = setTimeout(game_step, 15);
			}
			else {
				paused = true;
			}
		}
		else
		{
			eventQueue.push(event);
		}
}



/* The game loop */

nextPiece();

function game_step(){
	frames++;
	var x, y;
    if(collision){
		if(drop){
			drop = false;
			speed = oldspeed;
		}
        for(y=0; y<puzzle.array.length; y++){
            for(x=0; x<puzzle.array[y].length; x++){
                if(puzzle.array[y][x]){
                    var boardX = puzzle.topleftx + x;
                    var boardY = puzzle.toplefty + y;
                    board.board[boardY][boardX] = puzzle.fill;
                }
            }
        }
        puzzle.toplefty = 0;
        puzzle.topleftx = Math.floor(board.board_width/2);
        if(board.mayPlace(puzzle)){
            nextPiece();
            collision = false;
			puzzle.setBot();
        }
        else{
            alert("game over");
            //clearTimeout(gameId);
			game_init();
			puzzle.next = [];
			nextPiece();
			puzzle.setBot();
			gameId = setTimeout(game_step, 15);
            return;
        }

    }
    
    
    if(frames >= speed){
		if(board.mayMoveDown(puzzle)){
			puzzle.toplefty += 1;
		}
		else{
			collision = true;
		}
		frames = 0;
	}
	if(eventQueue.length){
		event = eventQueue.shift();
		if(event.keyCode == 38 && board.mayRotate(puzzle)){
			puzzle.rotate();
        }
        if(event.keyCode == 37 && board.mayMoveLeft(puzzle)){
            puzzle.moveLeft();
        }
        if(event.keyCode == 39 && board.mayMoveRight(puzzle)){
            puzzle.moveRight();
        }
		if(event.keyCode == 17){
			drop = true;
		}
	}
	
	removeLines(checkLines());
    board.draw(puzzle);
    score.draw(board);
    puzzle.draw(context);
    speed = 48 - 2*score.levels;
	if(!paused)
	{
		if(drop){
			var oldspeed = speed;
			speed = 1;
		}
		gameId = setTimeout(game_step, 15);
	}
}

/* start game loop */
game_step();
