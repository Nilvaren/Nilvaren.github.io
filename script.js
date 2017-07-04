window.oncontextmenu=function(){return false};

var comboBox = document.getElementById("select");
var canvas = document.getElementById("canvas");
var canvasOver = document.getElementById("canvasOver");
var algo = document.getElementById("algo");
var start = document.getElementById("startAstar");
var clear = document.getElementById("clear");
var step = document.getElementById("step");
var clearWall = document.getElementById("clearWall");
var diagonalCheck = document.getElementById("diagonalCheck");

canvas.width = canvasOver.width =  window.innerWidth;
canvas.height = canvasOver.height = window.innerHeight;

var context = canvas.getContext("2d");
var contextOver = canvasOver.getContext("2d");

var starting = null;
var started = false;
var found = false;

var max = [1e9,1,1,1e9,1e9];
var currItem = [0,1,1,0,0];
var currData = comboBox.selectedIndex;

var queue = [];
var openList = [];
var closedList = [];

var diagonal = 4;
var dx = [-1,1,0,0,1,1,-1,-1];
var dy = [0,0,1,-1,1,-1,1,-1];
//var dx = [-1,0,1,0];
//var dy = [0,-1,0,1];

var cellSize = 30;
var totalGridX = parseInt(canvas.width/cellSize)+1;
var totalGridY = parseInt(canvas.height/cellSize)+1;

var startX = parseInt(totalGridX/3);
var startY = parseInt(totalGridY/2)-2;

var goalX = parseInt(totalGridX*(2/3));
var goalY = parseInt(totalGridY/2)-2;

var indexAlgo = algo.selectedIndex;

var map = initialMap();
var valueF = initialArray();
var valueG = initialArray();
var valueH = initialArray();



function drawGrid(){
	contextOver.strokeStyle = "rgba(0,0,0,0.3)";
	for(var i =0;i<totalGridX;i++){
		contextOver.moveTo(i*cellSize+0.5,canvas.height+30.5);
		contextOver.lineTo(i*cellSize+0.5,0.5);
		for(var j=0;j<totalGridY;j++){
			contextOver.moveTo(0.5,j*cellSize+0.5);
			contextOver.lineTo(canvas.width+30.5,j*cellSize+0.5);
		}
	}
}
var down =false;
var control =0;
canvasOver.onmousedown = function(event){
	var x = event.clientX;
	var y = event.clientY;
	control = event.button;
	down = true;
	setData(parseInt(x/cellSize),parseInt(y/cellSize));
};
canvasOver.onmouseup = function(event){
	down =false;
	control = 0;
}

canvasOver.onmousemove = function(event){
	var x = event.clientX;
	var y = event.clientY;
	if(down)setData(parseInt(x/cellSize),parseInt(y/cellSize));
}

function setData(x,y){
	if(started) return;
	if(currData==0){
		currItem[map[x][y].content]--;
		if(map[x][y].content==1){
			startX = -1;
			startY = -1;
		}
		else if(map[x][y].content==2){
			goalX = -1;
			goalY = -1;
		}
		map[x][y].content=0;
		valueF[x][y]=valueG[x][y]=valueH[x][y]=0;
	}
	else if(map[x][y].content==currData&&control==2){
		map[x][y].content=0;
		valueF[x][y]=valueG[x][y]=valueH[x][y]=0;
		currItem[currData]--;
		if(currData==1){
			startX = -1;
			startY = -1;
		}
		else if(currData==2){
			goalX = -1;
			goalY = -1;
		}
	}
	else if(map[x][y].content==0&&control==0){
		if(currItem[currData]<max[currData]){

			if(currData==1){
				startX = x;
				startY = y;
			}
			else if(currData==2){
				goalX = x;
				goalY = y;
			}
			map[x][y].content=currData;
			currItem[currData]++;
		}

	}
	draw();
}

comboBox.onchange = function(){
	currData = comboBox.selectedIndex;
}

function initialMap(){

	var array = new Array(totalGridX);
	for(var x=0;x<totalGridX;x++){
		array[x] = new Array(totalGridY);
		for(var y=0;y<totalGridY;y++){
			array[x][y]={content:0,visited:0};
		}
	}
	return array;
}

function initialArray(){
	var array = new Array(totalGridX);
	for(var x=0;x<totalGridX;x++){
		array[x] = new Array(totalGridY);
		for(var y=0;y<totalGridY;y++){
			array[x][y]=0;
		}
	}
	return array;
}



function draw(){
	if(startX!=-1&&startY!=-1)
		map[startX][startY].content = 1;
	if(goalX!=-1&&goalY!=-1)
		map[goalX][goalY].content = 2;
	context.font = "10px Helvetica";
	context.textAlign = "center";
	context.clearRect(0,0,canvas.width,canvas.height);
	for(var i=0;i<totalGridX;i++){
		for(var j=0;j<totalGridY;j++){
			if(map[i][j].content==1){
				context.fillStyle="rgb(0,255,0)";
				context.fillRect(i*cellSize+0.5,j*cellSize+0.5,cellSize,cellSize);
			}
			else if(map[i][j].content==2){
				context.fillStyle="rgb(255,0,0)";
				context.fillRect(i*cellSize+0.5,j*cellSize+0.5,cellSize,cellSize);
			}
			else if(map[i][j].content==3){
				context.fillStyle="rgb(0,0,0)";
				context.fillRect(i*cellSize+0.5,j*cellSize+0.5,cellSize,cellSize);
			}
			else if(map[i][j].content==5){
				context.fillStyle="#A5A5A6";
				context.fillRect(i*cellSize+0.5,j*cellSize+0.5,cellSize,cellSize);
			}
			else if(map[i][j].content==6){
				context.fillStyle= "#CCECF3";
				context.fillRect(i*cellSize+0.5,j*cellSize+0.5,cellSize,cellSize);
			}
			else if(map[i][j].content==7){
				context.fillStyle= "#80D0E1";
				context.fillRect(i*cellSize+0.5,j*cellSize+0.5,cellSize,cellSize);
			}
			if(valueF[i][j]!=0){
				context.fillStyle = "red";
				context.fillText(valueG[i][j],i*cellSize+5.5,j*cellSize+10.5);
				context.fillStyle = "blue";
				context.fillText(valueH[i][j],i*cellSize+20.5,j*cellSize+25.5);
				context.fillStyle = "green";
				context.fillText(valueF[i][j],i*cellSize+5.5,j*cellSize+25.5);
			}
		}
	}
}

step.onclick = function(){
	if(!started){
		queue = [];
		starting = null;
		openList = [];
		closedList = [];
		openList.push({x:startX,y:startY,f:0,g:0,h:0,parent:null});
		queue.push({x:startX,y:startY,parent:null});
		started = true;
	}
	if(started){
		pathfinding[indexAlgo]();
		draw();
	}
}

algo.onchange = function(){
	indexAlgo = algo.selectedIndex;
}

start.onclick = function(){
	if(!started){
		queue = [];
		starting = null;
		openList = [];
		closedList = [];
		started = true;
		if(currItem[1]!=1||currItem[2]!=1) return;
		openList.push({x:startX,y:startY,f:0,g:0,h:0,parent:null});	
		queue.push({x:startX,y:startY,parent:null});
		starting = setInterval(pathfinding[indexAlgo],20);
	}
}
diagonalCheck.onchange = function(){
	if(!started){
		if(diagonalCheck.checked) diagonal=8;
		else diagonal=4;
	}
	else{
		diagonalCheck.checked=!diagonalCheck.checked;
	}
}



clearWall.onclick = function(){
	started = false;
	for(var x=0;x<totalGridX;x++){
		for(var y=0;y<totalGridY;y++){
			valueF[x][y]=0;
			map[x][y]={content:0,visited:0};
		}
	}
	map[startX][startY].content = 1;
	map[goalX][goalY].content = 2;
	draw();
	found = false;
	clearInterval(starting);
	queue = [];
	starting = null;
	openList = [];
	closedList = [];
	openList.push({x:startX,y:startY,f:0,g:0,h:0,parent:null});
	queue.push({x:startX,y:startY,parent:null});
}


clear.onclick = function(){
	started = false;
	for(var x=0;x<totalGridX;x++){
		for(var y=0;y<totalGridY;y++){
			valueF[x][y]=0;
			map[x][y].visited = 0;
			map[x][y].content = map[x][y].content == 1 || map[x][y].content == 2 || map[x][y].content == 5 || map[x][y].content == 6 || map[x][y].content == 7 ? 0 : map[x][y].content;
		}
	}
	map[startX][startY].content = 1;
	map[goalX][goalY].content = 2;
	draw();
	found = false;
	clearInterval(starting);
	queue = [];
	starting = null;
	openList = [];
	closedList = [];
	openList.push({x:startX,y:startY,f:0,g:0,h:0,parent:null});
	queue.push({x:startX,y:startY,parent:null});
}


var pathfinding = [
	//dijkstra
	function(){
		var curr = queue.shift();
		map[curr.x][curr.y].visited = 1;
		map[curr.x][curr.y].content=7;
		if(curr.x==goalX&&curr.y==goalY){
			clearInterval(starting);
			found = true;
			reverse(curr);
			return;
		}
		for(var i=0;i<diagonal;i++){
			var newX = curr.x+dx[i];
			var newY = curr.y+dy[i];
			if(newX>=0&&newX<totalGridX&&newY>=0&&newY<totalGridY&&map[newX][newY].content!=3&&map[newX][newY].visited==0){
				var neighbor = {x:newX,y:newY,parent:curr};
				map[newX][newY].content=6;
				map[newX][newY].visited = 1;
				queue.push(neighbor);
			}
			draw();	
		}
		if(queue.length<=0){
			clearInterval(starting);
		}
	},
	//astar
	function (){
		if(openList.length<=0||found){
			clearInterval(starting);
			return;
		}
		openList.sort(function(a,b){return a.f-b.f});
		var curr = openList.shift();
		closedList.push(curr);
		map[curr.x][curr.y].content=7;
		for(var i=0;i<diagonal;i++){
			var newX = curr.x+dx[i];
			var newY = curr.y+dy[i];
			if(newX>0&&newX<totalGridX&&newY>0&&newY<totalGridY&&map[newX][newY].content!=3){
				var thisG = Math.abs(newX-goalX)+Math.abs(newY-goalY);
				var thisH = curr.h+1;
				var thisF = thisG+thisH;
				var neighbor = {x:newX,y:newY,f:thisF,g:thisG,h:thisH,parent:curr};
				if(newX==goalX && newY == goalY){
					found = true;
					continue;
				}
				if(inside(closedList,neighbor)){
					continue;
				}
				else if(!inside(openList,neighbor)){
					valueF[newX][newY]=thisF;
					map[newX][newY].content=6;
					valueH[newX][newY] = thisH;
					valueG[newX][newY] = thisG;
					openList.push(neighbor);
				}
			}
			draw();
		}
		if(found){
			reverse(curr);
			return;
		}
		
	}];


function reverse(curr){
	while(curr.parent!=null){
		map[curr.x][curr.y].content = map[curr.x][curr.y].content==1||map[curr.x][curr.y].content==2 ? map[curr.x][curr.y].content : 5;
		curr=curr.parent;
	}
	draw();
}

function inside(list,neighbor){
	for(var i=0;i<list.length;i++){
		if(list[i].x==neighbor.x&&list[i].y==neighbor.y){
			return true;
		}
	}
	return false;
}


window.onload = function(){
	drawGrid();
	draw();
	contextOver.stroke();
	currData = comboBox.selectedIndex = 3;
}
