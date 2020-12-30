//event handlers for buttons on the form
var dfsButton = document.getElementById("dfsButton");
dfsButton.addEventListener('click', DepthFirstSearch, false);

var bfsButton = document.getElementById("bfsButton");
bfsButton.addEventListener('click', BreadthFirstSearch, false);

var buildMazeButton = document.getElementById("buildMazeButton");
buildMazeButton.addEventListener('click', BuildNewMaze, false);

var setStartEndButton = document.getElementById("setStartEndPointsButton");
setStartEndButton.addEventListener('click', SetStartAndEndPoints, false);

//form elements for information about maze
var mazeWidthField = document.getElementById("mazeWidthField");
var mazeHeightField = document.getElementById("mazeHeightField");
var cellSizeField = document.getElementById("cellSizeField");
var mazeSearchSpeed = document.getElementById("mazeSearchSpeed");

//will get this information from form elements
var widthOfMaze = Math.floor(mazeWidthField.value);
var heightOfMaze = Math.floor(mazeHeightField.value);
var sizeOfCells = Math.floor(cellSizeField.value);

var searchSpeedInMillis = Math.floor(mazeSearchSpeed.value);


//we aren't ready to start until the maze is generated and the start and end points are set
var ReadyToStart = false;

//Build the maze (invokes "maze_builder.js")
BuildNewMaze();

//the start and end nodes of the maze
var startNode, endNode;

//initializes some variables and then calls build maze
function BuildNewMaze() {
	ProcessComplete = false;
	ReadyToStart = false;
	gridCells = [];
	
	//validate fields in the form
	if (mazeWidthField.value < 3 || mazeWidthField.value > 50) {
		alert("The maze width must be between 3 and 50.");
		return;
	}
	if (mazeHeightField.value < 3 || mazeHeightField.value > 50) {
		alert("The maze height must be between 3 and 50.");
		return;
	}
	if (cellSizeField.value < 5 || cellSizeField.value > 20) {
		alert("The cell side length must be between 5 and 20.");
		return;
	}
	if (mazeSearchSpeed.value < 10 || mazeSearchSpeed.value > 1000) {
		alert("The search speed for the maze must be between 10 and 1000");
		return;
	}
		
	widthOfMaze = Math.floor(mazeWidthField.value);
	heightOfMaze = Math.floor(mazeHeightField.value);
	sizeOfCells = Math.floor(cellSizeField.value);
	searchSpeedInMillis = Math.floor(mazeSearchSpeed.value);
	
	//build the maze
	BuildMaze(widthOfMaze, heightOfMaze, sizeOfCells); //"maze_builder.js"
}

//variables shared between algorithms
var previousNode;
var canvasContext;
var isComplete;


//variables used in DFS
var dfsStack = [];
var dfsBackTrackStack = [];
var dfsGoingForward;
function DepthFirstSearch() {
	//make sure we are ready to go
	if (!ProcessComplete) {
		alert("Maze Generation Incomplete");
		return;
	}
	if (!ReadyToStart) {
		alert("Set Start and End Points");
		return;
	}
	
	RedrawCanvas();
	
	//initialize variables
	dfsStack = [];
	dfsBackTrackStack = [];
	
	previousNode = null;
	
	canvasContext = GetCanvasContext();
	dfsGoingForward = true;
	isComplete = false;
	
	//push the start node
	dfsStack.push(startNode);
	
	//initiate the loop
	dfsLoop();
}

//this would normally be a standard recursive or iterative function, but I want to see the action
function dfsLoop() {
	setTimeout(function() {
		//functions in much the same way as maze generation does, but it stops when the goal
		//node has been reached
		if (dfsStack.length > 0 && !isComplete) {
			var node = dfsStack.pop();
			
			if (previousNode) {
				previousNode.UnHighlightCell(canvasContext);
				if (dfsGoingForward)
					dfsBackTrackStack.push(previousNode);
			}
			
			previousNode = node;
			
			if (node.Visited != true) {
				node.Visited = true;
			}
			
			if (node == endNode)
				isComplete = true; //if we found the goal we are done
			
			
			dfsGoingForward = false;
			for (var i = 0; i < node.Neighbors.length; i += 1) {
				if (node.Neighbors[i] && !node.Boundaries[i])
					if (!node.Neighbors[i].Visited) {
						dfsStack.push(node.Neighbors[i]);
						dfsGoingForward = true;
						break;
					}
			}
			
			node.HighlightCell(canvasContext);
			
			if (!dfsGoingForward && dfsBackTrackStack.length > 0)
				dfsStack.push(dfsBackTrackStack.pop());
			
			
			dfsLoop();
		} else {
			//goal node found, display the path to the node
			//other visited nodes will be left yellow
			
			//the main differences between the different path finding algorithms will be how many
			//nodes the algorithm had to visit, and not necessarily the path (at least until cycles
			//and unreachable sections are implemented)
			while (dfsBackTrackStack.length > 0) {
				var node = dfsBackTrackStack.pop();
				node.HighlightCell(canvasContext);
			}
		}
	}, searchSpeedInMillis);
}


//variables for BFS
var bfsQueue;
var path;

function BreadthFirstSearch() {
	//make sure we are ready to go
	if (!ProcessComplete) {
		alert("Maze Generation Incomplete");
		return;
	}
	if (!ReadyToStart) {
		alert("Set Start and End Points");
		return;
	}
	
	RedrawCanvas();
	
	bfsQueue = [];
	isComplete = false;
	previousNode = null;
	
	
	path = [];
	
	canvasContext = GetCanvasContext();
	
	startNode.HighlightCell(canvasContext);
	endNode.HighlightCell(canvasContext);
	
	bfsQueue.push(startNode);
	
	bfsLoop();
}

function bfsLoop() {
	setTimeout(function () {
		if (bfsQueue.length > 0 && !isComplete) {
			var node = bfsQueue.shift();
			
			if (previousNode) {
				previousNode.UnHighlightCell(canvasContext);
			}
			
			node.HighlightCell(canvasContext);
			previousNode = node;
			
			node.Visited = true;
			
			
			if (node == endNode) {
				isComplete = true;
			} else {
				for (var i = 0; i < node.Neighbors.length; i += 1)
					if (node.Neighbors[i] && !node.Boundaries[i])
						if(!node.Neighbors[i].Visited) {
							bfsQueue.push(node.Neighbors[i]);
							path[node.Neighbors[i].Hash()] = node;
						}
			}
			
			bfsLoop();
		} else {
			var node = path[previousNode.Hash()];
			previousNode.HighlightCell(canvasContext);
			while (node && node != startNode) {
				node.HighlightCell(canvasContext);
				node = path[node.Hash()];
			}
			startNode.HighlightCell(canvasContext);
		}
	}, searchSpeedInMillis);
}

//Event handler for the button that sets the start and end points
function SetStartAndEndPoints() {
	//make sure the maze has been built first
	if (!ProcessComplete) {
		alert("Maze Generation Incomplete");
		return;
	} else {
		//draw the canvas without all the highlighting
		RedrawCanvas();
		
		//set all of the nodes to not be start or end
		for (var i = 0; i < edgeCellIndices.length; i += 1) {
			gridCells[edgeCellIndices[i]].Start = false;
			gridCells[edgeCellIndices[i]].End = false;
		}
		
		//set the start node
		startNode = gridCells[edgeCellIndices[Math.floor(Math.random() * edgeCellIndices.length)]];
		
		//set the end node and repeat the set until it is different from the start node
		do {
			endNode = gridCells[edgeCellIndices[Math.floor(Math.random() * edgeCellIndices.length)]];
		} while (endNode == startNode);
		
		//set the nodes and highlight them
		startNode.Start = true;
		endNode.End = true;
		
		var ctx = GetCanvasContext();
		
		startNode.HighlightCell(ctx);
		endNode.HighlightCell(ctx);
		
		ReadyToStart = true; //ready to go
	}
}