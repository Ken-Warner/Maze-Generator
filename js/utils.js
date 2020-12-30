

//This class represents each grid node
function Cell(row, col, sideLength) {
	//the side length is the pixel length of each side of the square node
	this.sideLength = sideLength;
	//the row and column for this node in the grid
	this.Row = row;
	this.Column = col;
	//shows if there is a wall at the [up, right, down, left] side
	this.Boundaries = [true, true, true, true];
	//the nodes at the [up, right, down, left] side of the node. These can be
	//null for the edges
	this.Neighbors = [];
	//if the node has been visited (for graph traversals)
	this.Visited = false;
	//if this node is a start or end node for the maze
	this.Start = false;
	this.End = false;
	
	//Draws the walls of the node in the appropriate place on the canvas
	this.DrawBoundaryLines = function(canvasContext) {
		canvasContext.clearRect(this.Column * this.sideLength,
			this.Row * this.sideLength,
			this.sideLength,
			this.sideLength);
		
		var upperLeftPointX = this.Column * this.sideLength;
		var upperLeftPointY = this.Row * this.sideLength;
		if (this.Boundaries[0] == true) {
			canvasContext.beginPath();
			canvasContext.moveTo(upperLeftPointX, upperLeftPointY);
			canvasContext.lineTo(upperLeftPointX + this.sideLength, upperLeftPointY);
			canvasContext.stroke();
		}
		if (this.Boundaries[1] == true) {
			canvasContext.beginPath();
			canvasContext.moveTo(upperLeftPointX + this.sideLength, upperLeftPointY);
			canvasContext.lineTo(upperLeftPointX + this.sideLength, upperLeftPointY + this.sideLength);
			canvasContext.stroke();
		}
		if (this.Boundaries[2] == true) {
			canvasContext.beginPath();
			canvasContext.moveTo(upperLeftPointX + this.sideLength, upperLeftPointY + this.sideLength);
			canvasContext.lineTo(upperLeftPointX, upperLeftPointY + this.sideLength);
			canvasContext.stroke();
		}
		if (this.Boundaries[3] == true) {
			canvasContext.beginPath();
			canvasContext.moveTo(upperLeftPointX, upperLeftPointY + this.sideLength);
			canvasContext.lineTo(upperLeftPointX, upperLeftPointY);
			canvasContext.stroke();
		}
	}
	
	//highlights the node if it is the current cursor in a traversal or if it
	//is the start or end node of a maze
	this.HighlightCell = function(canvasContext) {
		canvasContext.beginPath();
		if (this.Start)
			canvasContext.fillStyle = "#00FF00";
		else if (this.End)
			canvasContext.fillStyle = "#FF0000";
		else
			canvasContext.fillStyle = "#FF00FF";
		canvasContext.fillRect(this.Column * this.sideLength + 1,
			this.Row * this.sideLength + 1,
			this.sideLength - 2,
			this.sideLength - 2);
	}
	
	//unhighlights the node, if it was marked visited, it will be yellow
	this.UnHighlightCell = function(canvasContext) {
		canvasContext.beginPath();
		if (this.Visited)
			canvasContext.fillStyle = "#FFFF00";
		else
			canvasContext.fillStyle = "#FFFFFF";
		canvasContext.fillRect(this.Column * this.sideLength + 1,
			this.Row * this.sideLength + 1,
			this.sideLength - 2,
			this.sideLength - 2);
	}
	
	//this is a roundabout way at a perfect hash for the maze cells
	//so I can backtrack in O(1)
	this.Hash = function() {
		var thisHash = this.Row.toString() + "|" + this.Column.toString();
		return thisHash;
	}
};

//gets the canvas context from the HTML page
function GetCanvasContext() {
	var canvas = document.getElementById('canvas-grid');
	var ctx = canvas.getContext("2d");
	return ctx;
}

//clears the canvas and redraws the maze according to the cells of the grid
function RedrawCanvas() {
	var ctx = GetCanvasContext();
	for (var i = 0; i < gridCells.length; i += 1) {
		gridCells[i].Visited = false;
		gridCells[i].UnHighlightCell(ctx);
	}
}

//fisher yates shuffle
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
