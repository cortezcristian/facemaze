/**
 _____              __  __               
|  ___|_ _  ___ ___|  \/  | __ _ _______ 
| |_ / _` |/ __/ _ \ |\/| |/ _` |_  / _ \
|  _| (_| | (_|  __/ |  | | (_| |/ /  __/
|_|  \__,_|\___\___|_|  |_|\__,_/___\___|
                                         
* FaceMaze game
* @author Cristian Cortez  
* @requires KineticJS v3.9.4 - http://www.kineticjs.com/
* 
*/
superGlobal = 1;

/**
 * FMRenderer Global Namespace
 * @module FM
 */
var FM = {};
/*
 * FM Version
 * @property ver
 * @type string
 */
FM.ver = '1.0';

/*
 * FM Extend utility
 * @namespace FMRenderer
 * @method Extend
 * @param {Object} obj1 Child Class Object
 * @param {Object} obj2 Parent Class Object
 */
FM.extend = function(obj1, obj2) {
    for(var key in obj2.prototype) {
        if(obj2.prototype.hasOwnProperty(key) && obj1.prototype[key] === undefined) {
            obj1.prototype[key] = obj2.prototype[key];
        }
    }
}

FM.override = function(obj1, obj2) {
    for(var key in obj2) {
            obj1[key] = obj2[key];
    }
}

FM.log = function(a){try{console.log(a);} catch(e) {}};

/*
    http://james.padolsey.com/javascript/get-document-height-cross-browser/
*/
FM.getDocHeight = function() {
    var D = document;
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}

FM.collidingCircles = function(obj1, obj2, rad) {
    var collision = false, h = 0;
    if(typeof obj1 != "undefined" && typeof obj2 != "undefined"){
        a = Math.abs(obj2.x - obj1.x);
        b = Math.abs(obj2.y - obj1.y);
        h = Math.sqrt((Math.pow(a,2)+Math.pow(b,2)));
        
        collision = (h<rad*2)?true:false;
    }
    return collision;
}

FM.collidingCirclesDist = function(obj1, obj2, rad) {
    var distance = 0, h = 0;
    if(typeof obj1 != "undefined" && typeof obj2 != "undefined"){
        a = Math.abs(obj2.x - obj1.x);
        b = Math.abs(obj2.y - obj1.y);
        h = Math.sqrt((Math.pow(a,2)+Math.pow(b,2)));
        
        distance = h-rad*2;
    }
    return distance;
}
/**
* Global Objects
*/

FM.stage = {};
FM.bgLayer = {};
FM.gameLayer = {};
FM.player = {};
FM.oponentsInfo = []; //Oponents Info
FM.oponents = []; //Canvas Obj
FM.ball = {};
FM.WIDTH = "";
FM.HEIGHT = "";
FM.RAD = 15;
FM.classes = [];
FM.relations = [];

/**
* Global Gradient / Shadows Objects Mixin
*/
FM.gradients = {};
FM.shadows = {};
FM.shadows.global = function(){
	return {
		  color: 'black',
		  blur: 1,
		  offset: [0, 2],
		  alpha: 0.3
		};
};
FM.gradients.dark = function(){
    //FM.desktop.getContext()
    var grad = {
        start: {
          x: -50,
          y: -50
        },
        end: {
          x: 50,
          y: -50
        },
        colorStops: [0, '#6d6b68', 0.3, "#595854",1, '#3c3b37']
      };
    return grad;
}
FM.gradients.blue = function(){
    //FM.desktop.getContext()
    var grad = {
        start: {
          x: -50,
          y: 0
        },
        end: {
          x: FM.HEIGHT,
          y: FM.WIDTH
        },
        colorStops: [0, '#164b69', 1, '#56b5ea']
      };
    return grad;
}
FM.gradients.orange = function(){
    //FM.desktop.getContext()
    var grad = {
        start: {
          x: 0,
          y: 0
        },
        end: {
          x: 0,
          y: 50
        },
        colorStops: [0, '#F16C3A', 0.1, "#F16C3A", 0.4, "#F84705", 1, '#F87240']
      };
    return grad;
}

/**
* Init Method
*/
FM.init = function(o){
    //TODO: add right click support: document.oncontextmenu = function(e) {alert("a"); return false;} 
    var obj = {
        container: "game-container",
        width: window.innerWidth || window.screen.width,
        height: FM.getDocHeight() || window.screen.height
    }
    FM.override(obj, o);
   
    FM.WIDTH = obj.width;
    FM.HEIGHT = obj.height;
    //console.dir(obj);
     
    FM.stage = new Kinetic.Stage({
        container: obj.container,
        width: obj.width,
        height: obj.height
    });
	
	FM.fieldBg = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: FM.WIDTH,
      height: FM.HEIGHT,
	  fill: "green"
	});
    /*	
	var d = new Date(),
    h = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()),
    m = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()),
    s = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()),
    da = (d.getDate() < 10 ? '0' + d.getDate() : d.getDate()),
    mo = (d.getMonth() < 10 ? '0' + (d.getMonth() + 1): d.getMonth()),
    text = d.toString().substring(0,3) + ' ' + da + ' ' + d.toString().substring(4,7) + ', ' + h + ':' + m + ':' + s ;
    
    
    var clockLabel = new Kinetic.Text({
        x: FM.WIDTH - 150,
        y: FM.HEIGHT - 40,
        text: text,
        alpha: 0.9,
        fontSize: 10,
        fontFamily: "Arial",
        textFill: "#d1d1d1",
        padding: 15,
        align: "left",
        verticalAlign: "middle",
        name: "mainClock",
        fontStyle: "normal"
    });
	*/
    //Draw the background
    FM.bgLayer  = new Kinetic.Layer({x:0});
    FM.bgLayer.add(FM.fieldBg);

    //Draw Rects
    var field = new Kinetic.Group(), halfArco=40;
    var lines = [
        {xStart:1, yStart:1, xEnd:FM.WIDTH, yEnd:1,stroke:'gray'}, //field
        {xStart:FM.WIDTH, yStart:1, xEnd:FM.WIDTH, yEnd:FM.HEIGHT,stroke:'gray'},
        {xStart:FM.WIDTH, yStart:FM.HEIGHT, xEnd:1, yEnd:FM.HEIGHT,stroke:'gray'},
        {xStart:1, yStart:FM.HEIGHT, xEnd:1, yEnd:1,stroke:'gray'},
        {xStart:FM.WIDTH/2, yStart:FM.HEIGHT, xEnd:FM.WIDTH/2, yEnd:1,stroke:'gray'}, //middle 
        {xStart:1, yStart:(FM.HEIGHT/2-halfArco), xEnd:1, yEnd:(FM.HEIGHT/2+halfArco),stroke:'red'},
        {xStart:FM.WIDTH, yStart:(FM.HEIGHT/2-halfArco), xEnd:FM.WIDTH, yEnd:(FM.HEIGHT/2+halfArco),stroke:'blue'}//arcos
        //{xStart:1, yStart:1, xEnd:FM.WIDTH, yEnd:FM.HEIGHT},
        //{xStart:1, yStart:1, xEnd:FM.WIDTH*-1, yEnd:FM.HEIGHT*-1},

    ];
    
    $.each(lines, function(i,v){
        var line = new Kinetic.Line({
            points: [{x:v.xStart,y:v.yStart},{x:v.xEnd,y:v.yEnd}],
            stroke: v.stroke,
            strokeWidth: 10,
            lineJoin: "round",
            name: "line-field-"+i
        });
        field.add(line);
    });
    FM.bgLayer.add(field);
    
    //Draw the Game Layer
    FM.gameLayer  = new Kinetic.Layer({x:0});
    // Add the player
    FM.player  = new FM.classPlayer({name:superGlobal,title:superGlobal,x:superGlobal*10, y:superGlobal*10});
    FM.gameLayer.add(FM.player);

    // Add the oponents
    /*
    $.each(FM.oponentsInfo, function(i,v){
        FM.oponents[i] = new FM.classPlayer({
            name:v.nombre,
            y:v.y,
            x:v.x});
        FM.gameLayer.add(FM.oponents[i]);
    });
    */

    //Add the ball
    FM.ball  = new FM.classBall();
    FM.gameLayer.add(FM.ball);

	//init apps
	//FM.apps.init();
}

/**
* Class Player
*/
FM.classPlayer = function(o){ 
    this.conf = {
        name: "class-name",
        title: "Name",
        x:0,
        y:0,
        rectX: 0,
        rectY: 0,
        width: 150,
        height: 100
    };
    
    FM.override(this.conf, o || {});

	var rectX = this.conf.rectX, rectY = this.conf.rectY;
		
    this.grp = new Kinetic.Group({
        //x: rectX,
        //y: rectY,
        x: this.conf.x,
        y: this.conf.y,
		stroke: "red",
		strokeWidth: 1,
        name: this.conf.name,
        draggable: true
    });
    
    var txtTitle = new Kinetic.Text({
        x: -14,
        y: 1,
        text: this.conf.title,
        alpha: 0.9,
        fontSize: 12,
        fontFamily: "Arial",
        textFill: "#d1d1d1",
        padding: 10,
        align: "left",
        verticalAlign: "middle",
        fontStyle: "bold"
    });
    var circle = new Kinetic.Circle({
        x: 0,
        y: 0,
        radius: FM.RAD,
        fill: (this.conf.name%2==0)?'blue':'red',
        stroke: 'black',
        strokeWidth: 4
    });

/*
    var box = new Kinetic.Rect({
      x: 0,
      y: 0,
      width: this.conf.width,
      height: this.conf.height,
      cornerRadius: 5,
      fill: FM.gradients.dark(),
	  shadow: FM.shadows.global(),
      stroke: "black",
      strokeWidth: 1,
      name: "box"
    });
  */  
    this.grp.add(circle);
    this.grp.add(txtTitle);
    this.grp.conf = this.conf;
    this.grp.mass = 4;
    this.grp.speed = 4;
    this.grp.direction = {x:1,y:1};

    this.grp.moveDown = function(playerSpeed) {
        if (this.attrs.y < FM.HEIGHT) {
            this.attrs.y += this.speed;
        };
    };

    this.grp.moveUp = function(playerSpeed) {
        if (this.attrs.y > 0) {
            this.attrs.y -= this.speed;
        }
    };

    this.grp.moveLeft = function(playerSpeed) {
        if (this.attrs.x > 0) {
            this.attrs.x -= this.speed;
        }
    };

    this.grp.moveRight = function(playerSpeed) {
        if (this.attrs.x < FM.WIDTH) {
            this.attrs.x += this.speed;
        };
    };            

    return this.grp;
}

/**
* Class Ball
*/
FM.classBall = function(o){ 
    this.conf = {
        name: "ball",
        title: "Ball",
        rectX: 0,
        rectY: 0,
        width: 150,
        height: 100
    };
    
    FM.override(this.conf, o || {});

	var rectX = this.conf.rectX, rectY = this.conf.rectY;
		
    this.grp = new Kinetic.Group({
        //x: rectX,
        //y: rectY,
        x: FM.WIDTH / 2,
        y: FM.HEIGHT / 2,
		//stroke: "white",
		//strokeWidth: 1,
        name: this.conf.name,
        draggable: true
    });
    
    var circle = new Kinetic.Circle({
        x: 0,
        y: 0,
        radius: FM.RAD,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2
    });

    this.grp.add(circle);

    this.grp.conf = this.conf;
    this.grp.mass = 1;
    this.grp.speed = 1;
    this.grp.direction = {x:0,y:0};
    this.grp.collidedWithPlayer = 0;
    this.grp.collidedWithWallY = 0;
    this.grp.collidedWithWallX = 0;
    this.grp.collidedWithOp = {};

    this.grp.move = function() {

       //Collision with walls
       if((this.attrs.y<=0 || this.attrs.y >= FM.HEIGHT)&&!this.collidedWithWallY){
           this.direction.y *= -1;
           //try <
           //FM.ball.attrs.x = (data.x>FM.WIDTH)?FM.WIDTH:((data.x<0)?0:data.x);
           this.y = (this.y>=FM.HEIGHT)?FM.HEIGHT:0;
           this.collidedWithWallY = 1;     
       }else{
           this.collidedWithWallY = 0;     
       }

       //Collision with walls
       if((this.attrs.x<=0 || this.attrs.x >= FM.WIDTH)&&!this.collidedWithWallY){
           this.direction.x *= -1;
           this.x = (this.x>=FM.WIDTH)?FM.WIDTH:0;
           this.collidedWithWallX = 1;     
       }else{
           this.collidedWithWallX = 0;     
       }

       //Collide with current player
       if(FM.collidingCircles(FM.player.attrs,FM.ball.attrs,FM.RAD)){
           //console.log("colision w player", this.direction)
           if(!this.collidedWithPlayer){
               this.collidedWithPlayer = 1;
               var sumMass = FM.ball.mass+FM.player.mass,
                  diffMass = FM.ball.mass-FM.player.mass;
               this.direction.x = ((this.direction.x*diffMass)+(2*FM.player.mass*FM.player.direction.x))/sumMass;
               this.direction.y = ((this.direction.y*diffMass)+(2*FM.player.mass*FM.player.direction.y))/sumMass;
           }
           //console.log("colision w player", this.direction)
       }else{
           this.collidedWithPlayer = 0;
       }
       var grp = this; 
       //Collide with other players
       $.each(FM.oponents, function(i,v){
           if(typeof grp.collidedWithOp[v.name] == "undefined"){
            grp.collidedWithOp[v.name] = 0;    
           }
           if(FM.collidingCircles(v.attrs,FM.ball.attrs,FM.RAD)){
               console.log("colision w oponent", grp.direction)
               if(!grp.collidedWithOp[v.name]){
                   grp.collidedWithOp[v.name] = 1;
                   var sumMass = FM.ball.mass+v.mass,
                      diffMass = FM.ball.mass-v.mass;
                   grp.direction.x = ((grp.direction.x*diffMass)+(2*v.mass*v.direction.x))/sumMass;
                   grp.direction.y = ((grp.direction.y*diffMass)+(2*v.mass*v.direction.y))/sumMass;
               }
               console.log("colision w oponent", grp.direction)
           }else{
               grp.collidedWithOp[v.name] = 0;
           }
       });

       this.attrs.y += this.speed * this.direction.y;
       this.attrs.x += this.speed * this.direction.x;
    }
    return this.grp;
}


/**
* Arrow
*/
FM.relArrow = function(nameFrom,nameTo){
	var nFrom = nameFrom || FM.selection.data.from,
	nTo = nameTo || FM.selection.data.to,
	grpFrom = FM.desktop.get("."+nFrom)[0],
	grpTo = FM.desktop.get("."+nTo)[0],
	boxFrom = grpFrom.children[0].attrs,
	boxTo = grpTo.children[0].attrs,
	xStart = 0, yStart = 0, xEnd = 0, yEnd = 0;
	// console.log(FM.desktop.get("."+nFrom)[0]);
	console.log(FM.desktop.get("."+nFrom)[0].children[0].attrs);
	console.log(FM.desktop.get("."+nTo)[0].children[0].attrs);
	
	if(grpFrom.attrs.x <= grpTo.attrs.x){ // F -> T
		// console.log(((grpFrom.attrs.x + boxFrom.width) <= (grpTo.attrs.x + Math.round(boxTo.width/2))));
		console.log((grpFrom.attrs.x + boxFrom.width) <= (grpTo.attrs.x + boxTo.width));
		if((grpFrom.attrs.x + boxFrom.width) <= grpTo.attrs.x){// Pm1 = Xo + Wo/2
			xStart = grpFrom.attrs.x + boxFrom.width;
			yStart = grpFrom.attrs.y + Math.round(boxFrom.height/2);
			xEnd = grpTo.attrs.x;
			yEnd = grpTo.attrs.y + Math.round(boxTo.height/2);
		}else{ //too close
			if(grpFrom.attrs.y < grpTo.attrs.y){ // bottom To
				xStart = grpFrom.attrs.x + Math.round(boxFrom.width/2);
				yStart = grpFrom.attrs.y + boxFrom.height;
				xEnd = grpTo.attrs.x + Math.round(boxTo.width/2);
				yEnd = grpTo.attrs.y;
			}else{ // bottom From
				xStart = grpFrom.attrs.x + Math.round(boxFrom.width/2);
				yStart = grpFrom.attrs.y;
				xEnd = grpTo.attrs.x + Math.round(boxTo.width/2);
				yEnd = grpTo.attrs.y + boxTo.height;
			}
		}
	}else if (grpFrom.attrs.x > grpTo.attrs.x) { // T <- F
		console.log(grpFrom.attrs.x >= (grpTo.attrs.x + Math.round(boxTo.width/2)));
		if(grpFrom.attrs.x >= (grpTo.attrs.x + boxTo.width)){
			xStart = grpFrom.attrs.x;
			yStart = grpFrom.attrs.y + Math.round(boxFrom.height/2);
			xEnd = grpTo.attrs.x + boxTo.width;
			yEnd = grpTo.attrs.y + Math.round(boxTo.height/2);
		}else{
			if(grpFrom.attrs.y <= grpTo.attrs.y){ // bottom To
				xStart = grpFrom.attrs.x + Math.round(boxFrom.width/2);
				yStart = grpFrom.attrs.y + boxFrom.height;
				xEnd = grpTo.attrs.x + Math.round(boxTo.width/2);
				yEnd = grpTo.attrs.y;
			}else{ // bottom From
				xStart = grpFrom.attrs.x + Math.round(boxFrom.width/2);
				yStart = grpFrom.attrs.y;
				xEnd = grpTo.attrs.x + Math.round(boxTo.width/2);
				yEnd = grpTo.attrs.y + boxTo.height;
			}
		}
	}
	
	console.log([xStart, yStart, xEnd, yEnd]);
	//Depends on position but...
	var line = new Kinetic.Line({
		points: [xStart, yStart, xEnd, yEnd],
		stroke: "black",
		strokeWidth: 2,
		name: "arrow",
		lineJoin: "round"
	});
	FM.desktop.add(line);
    FM.desktop.draw();
}

/**
* Applications
*/
//Namespace for apps
FM.apps = {};

FM.apps.init = function(){
	//FM.apps.clock();
};

FM.apps.clock = function(name){
	setInterval(function(){
	var d = new Date(),
	h = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()),
	m = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()),
	s = (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()),
	da = (d.getDate() < 10 ? '0' + d.getDate() : d.getDate()),
	mo = (d.getMonth() < 10 ? '0' + (d.getMonth() + 1): d.getMonth()),
	text = d.toString().substring(0,3) + ' ' + da + ' ' + d.toString().substring(4,7) + ', ' + h + ':' + m + ':' + s ;
	//text = da + '-' + mo + '-' + d.getFullYear() + '   ' + h + ':' + m + ':' + s ;
	
	FM.desktop.get(".mainClock")[0].setText(text);
	FM.desktop.draw();
	},1000);
}


/**
* OnFrame
*/
// key events
var input = {};
document.addEventListener('keydown', function(e){
    
    //if (game.running == true) {
        //e.preventDefault();
    //};
    
    input[e.which] = true;
    
    // start game
    /*
    if (input[32] == true && game.over == false) {
        e.preventDefault();
        if (game.running == false) {
            foregroundLayer.remove(welcomeScreen);
            game.start();
            game.ball.stop();
            game.ball.setOnPlayerPosition(game.player);
        } else {
            if (game.turn == 1) {
                game.ball.start();
            };
        };
    };
    */
});
document.addEventListener('keyup', function(e){
    input[e.which] = false;
});

/**
* Renderer Method
*/

FM.render = function(o){
    
    //adding stuff
    /*
    FM.stage.add(FM.desktopCon);
    FM.stage.add(FM.desktop);
    FM.desktopBar.add(new FM.mainBar());
    FM.stage.add(FM.desktopBar);
    */
    FM.stage.add(FM.bgLayer);
    FM.stage.add(FM.gameLayer);

    FM.stage.onFrame(function(){
        var arrowDown = (input[40] == true || input[83] == true),
            arrowUp = (input[38] == true || input[87] == true),
            arrowLeft = (input[37] == true || input[65] == true),
            arrowRight = (input[39] == true || input[68] == true);

        if(arrowDown) {
            FM.player.moveDown();
        }
        if (arrowUp) {
            FM.player.moveUp();
        }
        if (arrowLeft) {
            FM.player.moveLeft(); 
        }
        if (arrowRight) {
            FM.player.moveRight();
        }; 
        FM.ball.move();
        //Render Game
        FM.bgLayer.draw();
        FM.gameLayer.draw();
    });
}

/*
* Magic starts here :)
*/
window.onload = function() {
    FM.init({
        container: "game-container",
        width: 500,
        height: 300
    });
    FM.render();
    FM.stage.start();
};

var videoInput = document.getElementById('inputVideo');
var canvasInput = document.getElementById('inputCanvas');
var htracker = new headtrackr.Tracker();
htracker.init(videoInput, canvasInput);
htracker.start();

document.addEventListener('headtrackingEvent',  function(e){
        FM.player.attrs.x = parseInt((FM.WIDTH/2-e.x/20*(-1)*FM.WIDTH));
            FM.player.attrs.y = parseInt((FM.HEIGHT/2-(e.y-10)/6*FM.HEIGHT/2));
});



