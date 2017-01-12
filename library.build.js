/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('library.build');
 * mod.thing == 'a thing'; // true
 */

var util = require('library.utility');
var flag_lib = require('library.flag');

(function () {
    
    var builder = {};
    var setupSource, findSite, findBaseSite;
    var buildSpurRoad;               
    
    buildSpurRoad = function(pos){
        var target = pos.findClosestByPath(FIND_MY_SPAWNS);
        var path = pos.findPathTo(target);
        for (var e in path){
            var erything = target.room.lookAt(path[e].x,path[e].y);
            if (erything.length == 1 && erything[0].terrain == 'plain'){
                /*empty spot*/
                target.room.createConstructionSite(path[e].x,path[e].y,STRUCTURE_ROAD);
            }
        }
    }
    
    setupSource = function(source){
        /* TODO: cache processed sources and skip those */
        var block = util.util.checkSite(source.pos,5);
        if (block == 0){
            var buildpos = findSite(source.room,source.pos,1);
            if (buildpos){
                source.room.createConstructionSite(buildpos,STRUCTURE_CONTAINER);
                buildSpurRoad(buildpos)
                return true;
            }
        }else{
            var conts = source.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
                });
            if (conts){
                source.room.memory.donors[conts.id]=true;
            }
        }

        return false;
    }

    
    findBaseSite = function(room){
        var spawns = room.find(FIND_MY_SPAWNS);
        for (var s in spawns){
            var _pos = findSite(room,spawns[s].pos,2+1*room.memory.tech_level);
            if (_pos){ return _pos; }
        }
        
    }
    
    findSite = function(room,_pos,rad){
        
        /* Finds a free blank space near a given position*/
        for (var i = 0; i < 10; i++){
            
            var dx = Math.max(1, Math.min(48, Math.round(_pos.x + 2*rad*Math.random() - rad)));
            var dy = Math.max(1, Math.min(48, Math.round(_pos.y + 2*rad*Math.random() - rad)));
            var newpos = new RoomPosition(dx,dy,_pos.roomName);
            
            var erything = room.lookAt(newpos);
            if (erything.length == 1 && (erything[0].terrain == 'plain' || erything[0].terrain == 'swamp')){
                /*empty spot*/
                return newpos;
            }
        }
        return null;
    }
    
    builder.findSite = findSite;
    builder.findBaseSite = findBaseSite;
    builder.setupSource = setupSource;
    
    builder.buildSpurRoad = buildSpurRoad;
    
    

    
    module.exports.builder = builder;
    
})();

var dropPlanningFlags = function(room){
    var x = 0;
    var y = 0;
    for (x=5;x<=44;x+=7){
        for (y=5;y<=44;y+=7){
            if (checkBuildable(room,x,y,2,2)){
                var flagname = room.createFlag(x,y,undefined,COLOR_GREY,COLOR_GREY);    
            }
        }
    }  
};module.exports.dropPlanningFlags = dropPlanningFlags;

var findBuildSpot= function(room,x,y){
    //facepalm template
    var offsets = [{x:-2,y:1},
                   {x:-2,y:2},
                   {x:2,y:1},
                   {x:2,y:2},
                   {x:-1,y:0},
                   {x:1,y:0},
                   {x:-1,y:-2},
                   {x:0,y:-2},
                   {x:1,y:-2}];
    for (var o in offsets){
        var tx = x + offsets[o].x;
        var ty = y + offsets[o].y;
        if (checkBuildable(room,tx,ty,0,0)){
            return room.getPositionAt(tx,ty);
        } 
    }     
    return null;              
};
module.exports.findBuildSpot = findBuildSpot;

var dropBuilding = function(room,struct_type){
    var spot = null;
    //check existing build spots for free room
        //get all 'existing build' flags
    var cur_flags = flag_lib.findAllFlags(room,'BUILDSPOT_ACTIVE');
    for (var c in cur_flags){
        var buildspot = findBuildSpot(room,cur_flags[c].pos.x,cur_flags[c].pos.y);
        if (buildspot){
            spot = buildspot;
        }
    }
    if (!spot){
        //no current spots avilable.  Promote new build spot
        var tar_flags = flag_lib.findAllFlags(room,'BUILDSPOT_INACTIVE');
        if (tar_flags.length){
            var targetFlag = room.controller.pos.findClosestByRange(tar_flags);
            targetFlag.setColor(COLOR_GREY, COLOR_CYAN);
            var buildspot = findBuildSpot(room,targetFlag.pos.x,targetFlag.pos.y);
            if (buildspot){
                spot = buildspot;
            }    
        }
    }
    //console.log(spot);
    if (spot){
        room.createConstructionSite(spot,struct_type);
    }
};
module.exports.dropBuilding = dropBuilding;


var checkBuildable = function (room, x, y, dx, dy) {        
    var stuff = room.lookAtArea(y-dy,x-dx,y+dy,x+dx,true);
    for (var s in stuff){
        if (stuff[s].type=='constructionSite' || stuff[s].type=='structure' || (stuff[s].type=='terrain' && stuff[s].terrain == 'wall') ){
            return false;
        }
    }
    return true;    
};
module.exports.checkBuildable = checkBuildable;


