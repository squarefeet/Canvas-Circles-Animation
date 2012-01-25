/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}



var NUM_ITEMS = 2000,
	MAX_SIZE = 5,
	
	MAX_RED = 255,
	MAX_GREEN = 255,
	MAX_BLUE = 255,
	
	RADIUS = 200,
	
	UNIFORM_COLOURS = true,
	
	DISTANCE_VARIATION = 0,
	
	OUT_TIME = 1000,
	DOING_IN_OR_OUT = true,
	
	MAX_POINTS = 10,
	
	ANIM_TYPE_X = 'bounce',
	ANIM_TYPE_Y = 'bounce';

function Trail() {
	var d = document,
		body = d.body,
		that = this,
		trailItems = [],
		centerX, centerY,
		drawCount = 0,
		scatter = false;
	
	this.canvas = null;
	this.context = null;
	
	that.moving = false;
	
	function get_y(radius, angle, centerY, randY) {
        var rads = getRadians(angle);
    
        var y1 = centerY - ((radius-randY) * (Math.sin(rads)));                
        return y1;
    };
    
    function get_x(radius, angle, centerX, randX) {
        var rads = getRadians(angle);
        
        var x1 = centerX - ((radius-randX) * (Math.cos(rads))); 
        return x1;
    };
	
	function getRadians(degrees) {                
        var pi = Math.PI;
        var radians = (degrees * (pi/180));
        return radians;
    };
	
	this.init = function() {
		var i, l = NUM_ITEMS;
		
		this.canvas = d.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;		
		body.appendChild(this.canvas);
		
		centerX = Math.floor(window.innerWidth/2);
		centerY = Math.floor(window.innerHeight/2);
		
		for(i = 0; i < l; ++i) {
			this.addNewTrailItem();
		}
	};
	
	this.roundCircleToPoints = function(numPoints) {
		var singlePoint = Math.round(360/numPoints),
			points = [];
			
		for(var i = 0; i < (numPoints+1); ++i) {
			if(i === 0) {
				points.push(singlePoint);
			}
			else {
				points.push(singlePoint*i);
			}
		}
		return points;
	};
	
	this.roundPointToNearest = function(angle, points) {

		// for(var i = 0; i < points.length; ++i) {
		// 	if(angle < points[i]) {
		// 		return points[i];
		// 	}
		// }
		
		// for(var i = 0; i < points.length; ++i) {
		// 			
		// 		}
		// 		
		return points[Math.round(Math.random() * points.length)];
		
	};
	
	this.getRandomPosOnCircle = function(numPoints) {
		var x, y, angle, randX, randY, points;
		
		angle = Math.floor(Math.random() * 360);
		
		if(numPoints) {
			points = that.roundCircleToPoints(numPoints);
			angle = that.roundPointToNearest(angle, points);
		} 
		
		
		randX = (Math.random() * DISTANCE_VARIATION);
		randY = (Math.random() * DISTANCE_VARIATION);
		
		x = Math.round( get_x(RADIUS, angle, centerX, randX) );
		y = Math.round( get_y(RADIUS, angle, centerY, randY) );
		
		return {
			x: x,
			y: y
		}
	};
	
	this.addNewTrailItem = function() {
		var newItem = that.makeTrailItem();
		trailItems.push(newItem);
	};
	
	this.makeTrailItem = function() {
		
		var r = Math.floor(Math.random() * MAX_RED),
			g = Math.floor(Math.random() * MAX_GREEN),
			b = Math.floor(Math.random() * MAX_BLUE),
			pos = this.getRandomPosOnCircle(),
			pos2 = this.getRandomPosOnCircle();
			
		return {
			origX: pos2.x,
			origY: pos2.y,
			x: Math.floor(centerX + (Math.random() * DISTANCE_VARIATION)),
			y: Math.floor(centerY + (Math.random() * DISTANCE_VARIATION)),
			size: (Math.random() * MAX_SIZE) + 2,
			colour: (UNIFORM_COLOURS ? [r, r, r] : [r, g, b]),
			alpha: 1,
			easing: 'easeOut',
			posOnCircleX: pos.x,
			posOnCircleY: pos.y,
			duration: OUT_TIME
		};
	};
	
	this.getNewPosition = function(item) {
		var beginX, finishX, duration,
			changeY, changeX, beginY, finishY;
		
		beginX = item.origX;
		finishX = item.posOnCircleX;
		changeX = finishX - beginX;
		
		beginY = item.origY;
		finishY = item.posOnCircleY;
		changeY = finishY - beginY;
		
		duration = item.duration;
		
		item.x = tweens[ANIM_TYPE_X][item.easing](drawCount, beginX, changeX, duration);
		item.y = tweens[ANIM_TYPE_Y][item.easing](drawCount, beginY, changeY, duration);
		return item;
	};
	
	this.draw = function() {
		var i, l = trailItems.length, currItem,
			c = that.context, tempVal,
			newPos;
		
		
		c.fillStyle = 'rgba(255,255,255, 1)';
		c.fillRect(0, 0, window.innerWidth, window.innerHeight);
		
		drawCount += 16;
		
		for(i = 0; i < l; ++i) {
			currItem = trailItems[i];
			
			c.beginPath();
			c.moveTo(currItem.x, currItem.y);
			c.lineTo(currItem.x+1, currItem.y);
			c.lineWidth = currItem.size;
			c.lineCap = 'round';
			c.strokeStyle = 'rgba(' + currItem.colour.join(',') + ', ' + currItem.alpha + ')';
			c.stroke();
			
			currItem = that.getNewPosition(currItem);
			
			if(drawCount > currItem.duration) {
				tempVal = currItem.origX;
				currItem.origX = currItem.posOnCircleX;
				currItem.posOnCircleX = tempVal;
				
				tempVal = currItem.origY;
				currItem.origY = currItem.posOnCircleY;
				currItem.posOnCircleY = tempVal;
				currItem.duration = OUT_TIME;
			}
		}
		
		if(drawCount > OUT_TIME) {
			// centerX = null;
			// centerY = null;
			var numPoints = Math.floor(Math.random() * MAX_POINTS)
			drawCount = 0;
			
			if(numPoints < 2) {
				numPoints = 3;
			}
			
			for(i = 0; i < l; ++i) {
				newPos = that.getRandomPosOnCircle( numPoints );
				currItem = trailItems[i];
				currItem.posOnCircleX = newPos.x;
				currItem.posOnCircleY = newPos.y;
			}
		
		}
		
		window.requestAnimationFrame(that.draw);
		//setTimeout(that.draw, 0);
	};
	
	this.startAnimation = function() {
		setTimeout(that.draw, 16);
		
		if(!UNIFORM_COLOURS) {
			setInterval(function() {
				MAX_RED = Math.floor(Math.random() * 255);
				MAX_GREEN = Math.fllor(Math.random() * 255);
				MAX_BLUE = Math.floor(Math.random() * 255);
			}, 300);
		}
	};
}


// Robert Penner's awesome Tween calculations.
var tweens = {
	'back': {
		'easeIn': function(t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		'easeOut': function(t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		'easeInOut': function(t, b, c, d, s) {
			if (s == undefined) s = 1.70158; 
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		}
	},
	'bounce': {
		'easeIn': function(t, b, c, d) {
			return c - (tweens['bounce']['easeOut'](d-t, 0, c, d)) + b;
		},
		'easeOut': function(t, b, c, d) {
			if ((t/=d) < (1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if (t < (2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if (t < (2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
		},
		'easeInOut': function(t, b, c, d) {
			if (t < d/2) return tweens['bounce']['easeIn'](t*2, 0, c, d) * .5 + b;
			else return tweens['bounce']['easeOut'](t*2-d, 0, c, d) * .5 + c*.5 + b;
		}
	},
	'circ': {
		'easeIn': function(t, b, c, d) {
			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		},
		'easeOut': function(t, b, c, d) {
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		},
		'easeInOut': function(t, b, c, d) {
			if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		}
	},
	'cubic': {
		'easeIn': function(t, b, c, d) {
			return c*(t/=d)*t*t + b;
		},
		'easeOut': function(t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		'easeInOut': function(t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t + b;
			return c/2*((t-=2)*t*t + 2) + b;
		}
	},
	'elastic': {
		'easeIn': function(t, b, c, d, a, p) {
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		},
		'easeOut': function(t, b, c, d, a, p) {
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
		},
		'easeInOut': function(t, b, c, d, a, p) {
			if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
			if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		}
	},
	'expo': {
		'easeIn': function(t, b, c, d) {
			return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		},
		'easeOut': function(t, b, c, d) {
			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		},
		'easeInOut': function(t, b, c, d) {
			if (t==0) return b;
			if (t==d) return b+c;
			if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
			return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
		}
	},
	'linear': {
		'easeIn': function(t, b, c, d) {
			return c*t/d + b;
		},
		'easeOut': function(t, b, c, d) {
			return c*t/d + b;
		},
		'easeInOut': function(t, b, c, d) {
			return c*t/d + b;
		}
	},
	'quad': {
		'easeIn': function(t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		'easeOut': function(t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		'easeInOut': function(t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		}
	},
	'quart': {
		'easeIn': function(t, b, c, d) {
			return c*(t/=d)*t*t*t + b;
		},
		'easeOut': function(t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		'easeInOut': function(t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 * ((t-=2)*t*t*t - 2) + b;
		}
	},
	'quint': {
		'easeIn': function(t, b, c, d) {
			return c*(t/=d)*t*t*t*t + b;
		},
		'easeOut': function(t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		},
		'easeInOut': function(t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
			return c/2*((t-=2)*t*t*t*t + 2) + b;
		}
	},
	'sine': {
		'easeIn': function(t, b, c, d) {
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		},
		'easeOut': function(t, b, c, d) {
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},
		'easeInOut': function(t, b, c, d) {
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		}
	}
};

function byId(s) {
	return document.getElementById(s);
}

function setupControls() {
	var maxPoints = byId('maxPoints'),
		animTypeX = byId('animTypeX');
	
	maxPoints.value = MAX_POINTS;

	maxPoints.addEventListener('keyup', function(e) {
		MAX_POINTS = parseInt(this.value);
	}, false);
	
	animTypeX.addEventListener('change', function(e) {
		ANIM_TYPE_X = this.value;
	}, false);
	
	animTypeY.addEventListener('change', function(e) {
		ANIM_TYPE_Y = this.value;
	}, false);
}


function main() {
	
	var myTrail = new Trail();
	
	setupControls();
	
	myTrail.init();
	myTrail.startAnimation();
		
	
}
