
//GLOBALS (accessed outside of this document in other .js scripts)
//holds the object graph of the maze
var gridCells = [];
var edgeCellIndicies = [];
var ProcessComplete = false;

//Glabal variables for this document
//stack used in iterative traversal of the graph for maze creation
var stack = [];
var previousNodes = []; //the backtracking stack

//this array is permuted to randomly access neighboring nodes of a specific node
//in a random order
var neighborIndex = [0, 1, 2, 3];

//previous node in a graph traversal (so we know what to unighlight)
var previousNode;
//marks if we are going forward or backtracking (which stack to pop from)
var goingForwardFlag = true;

//this function perpares the canvas and grid before the maze is generated
function BuildMaze(mazeWidth, mazeHeight, cellSize) {
	//get the container for the canvas
	var container = document.getElementById('canvas-container');
	container.innerHTML = "";
	//create a canvas in the container
	var canvas = container.appendChild(document.createElement('canvas'));
	canvas.id = 'canvas-grid';

	//set its width and height appropriately
	canvas.width = Math.floor(mazeWidth * cellSize);
	canvas.height = Math.floor(mazeHeight * cellSize);

	var ctx = canvas.getContext("2d");

	var rows = [];
	//for each row and column in the canvas, create and draw the cell
	for (var row = 0; row < mazeHeight; row += 1) {
		var cols = [];
		for (var col = 0; col < mazeWidth; col += 1) {
			//create a new cell
			var currentCell = new Cell(row, col, cellSize);
			cols[col] = currentCell;
			
			currentCell.DrawBoundaryLines(ctx);
		}
		rows[row] = cols;
	}
	
	//initialize collection
	edgeCellIndicies = [];
	//get all of the indecies of the edges
	for (var col = 0; col < mazeWidth; col += 1) {
		edgeCellIndicies.push(col); //top row
		edgeCellIndicies.push(((mazeHeight - 1) * (mazeWidth)) + col); //bottom row
	}
	for (var row = 1; row < mazeHeight - 1; row += 1) {
		edgeCellIndicies.push(row * mazeWidth); //left edge
		edgeCellIndicies.push((row * mazeWidth) + (mazeWidth - 1)); //right edge
	}
	//shuffle it
	shuffle(edgeCellIndicies);
	
	//iterate through the rows and columns of the grid and 
	//create reference pointers for each cell's neighbors
	for (var row = 0; row < mazeHeight; row += 1) {
		for (var col = 0; col < mazeWidth; col += 1) {
			var node = rows[row][col];
			
			if (row != 0)
				var u = rows[row - 1][col];
			else
				var u = null;
			
			if (col != mazeWidth - 1)
				var r = rows[row][col + 1];
			else
				var r = null;
			
			if (row != mazeHeight - 1)
				var d = rows[row + 1][col];
			else
				var d = null;
			
			if (col != 0)
				var l = rows[row][col - 1];
			else
				var l = null;
			
			node.Neighbors = [u, r, d, l];
			
			gridCells.push(node);
		}
	}
	
	//starting with node index 2 from gridCells, we'll generate the maze
	var randIdx = Math.floor(Math.random() * gridCells.length);
	stack.push(gridCells[randIdx]);
	previousNode = gridCells[randIdx];
	GenerateMaze(ctx);
}

//This function generates the maze, normally the setTimout isn't needed for this because it would
//be encapsulated in a while loop, but I want to see the maze being built
function GenerateMaze(ctx) {
	setTimeout(function() {
		//basically while(stack.length > 0)
		if (stack.length > 0) {
			//get the node
			var node = stack.pop();
			
			//unhighlight the previous node and if we're going forward, push it into the
			//previous nodes stack
			previousNode.UnHighlightCell(ctx);
			if (goingForwardFlag)
				previousNodes.push(previousNode);
			
			//update our references
			previousNode = node;
			
			//this node is visited now
			if (node.Visited == false) {
				node.Visited = true;
			}
			
			//randomly choose a neighbor
			shuffle(neighborIndex);
			
			//by default we aren't going forward unless we find a node to go too
			goingForwardFlag = false;
			//check each neighbor of this node until we find one that we can move to
			for (var i = 0; i < neighborIndex.length; i += 1) {
				if (node.Neighbors[neighborIndex[i]] != null)
					if (node.Neighbors[neighborIndex[i]].Visited == false){
						stack.push(node.Neighbors[neighborIndex[i]]);
						node.Boundaries[neighborIndex[i]] = false;
						node.Neighbors[neighborIndex[i]].Boundaries[(neighborIndex[i] + 2) % 4] = false;
						goingForwardFlag = true;
						break; //we only want the first one that is successful
					}
			}
			
			//if we didn't find a node to go to, and there are previous nodes we can go back to
			if (!goingForwardFlag && previousNodes.length > 0)
				stack.push(previousNodes.pop()); //return to a previous node
			
			//update this node on the canvas
			node.DrawBoundaryLines(ctx);
			node.HighlightCell(ctx);
			
			//call this method again to continue the "while"
			GenerateMaze(ctx);
		} else {
			//once we run out of neighbors to go to even with backtracking, then we've been everywhere
			//this means that any point on the maze can be reached from any other point, and there
			//are no cycles in the object graph (its a tree). Given that, starting and ending points
			//can be arbitrarily chosen.
			
			//reset the nodes of the graph
			for (var i = 0; i < gridCells.length; i += 1) {
				gridCells[i].Visited = false;
				gridCells[i].UnHighlightCell(ctx);
			}
			
			//mark the process complete (so other method invokers that use the graph can tell that
			//generation is completed)
			ProcessComplete = true;
		}
	}, searchSpeedInMillis /*delay time is 1 millisecond, this could be changed to slow it down */);
}