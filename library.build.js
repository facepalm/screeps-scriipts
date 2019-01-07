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
    
    setupSource = function(source){
        /* TODO: cache processed sources and skip those */
        var block = util.checkSite(source.pos,5);
        if (block == 0){
            var buildpos = findSite(source.room,source.pos,1);
            if (buildpos){
                source.room.createConstructionSite(buildpos,STRUCTURE_CONTAINER);
                //buildSpurRoad(buildpos)
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
    
    module.exports.builder = builder;
    
})();

var queueBuild = function(room,pos,struct_type,priority){
    var entry = { room: room.name, pos:pos, struct_type: struct_type, idle: true };
    var build = true;
    if (pos){
        for (var r in room.memory.build_queue){
            var ro = room.memory.build_queue[r];                  
            if (ro.pos){                
                if (pos.isEqualTo(ro.pos.x, ro.pos.y)){
                    build=false;
                    console.log('Build spot already queued '+entry);
                }
            }
        }
        if (util.checkSite(pos,0)){
            build = false;
        }
    }
    
    if (build){
        
        console.log('Enqueueing new building: '+entry.struct_type);
        if (priority){
            entry.idle = false
            room.memory.build_queue.unshift(entry);
        }else{
            entry.idle = true
            room.memory.build_queue.push(entry);
        }
    }
    
};module.exports.queueBuild = queueBuild;

var buildSpurRoad = function(pos){
    var target = pos.findClosestByPath(FIND_MY_SPAWNS,{ignoreCreeps:true});
    if (!target) return 0;
    var path = pos.findPathTo(target,{ignoreCreeps: true});
    for (var e in path){
        if (e == -1 || e == path.length-1){
            continue;
        }
        //var erything = target.room.lookAt(path[e].x,path[e].y);
        //if (erything.length == 1 && erything[0].terrain == 'plain'){
            /*empty spot*/
        queueBuild(target.room, target.room.getPositionAt(path[e].x,path[e].y),STRUCTURE_ROAD,false);
        //}
    }
};module.exports.buildSpurRoad = buildSpurRoad;

var buildingCount = function(room,struct_type){
    var existing = room.find(FIND_STRUCTURES, {
                        filter: function(structure) { return structure.structureType == struct_type; }
                    });                    
    var unbuilt = room.find(FIND_CONSTRUCTION_SITES, {filter: function(site) {return site.structureType == struct_type;}});
    return existing.length + unbuilt.length;
}; 
module.exports.buildingCount = buildingCount;

var buildRoad = function(startPos,endPos){
    var path = startPos.findPathTo(endPos);
    for (var e in path){
        //var erything = target.room.lookAt(path[e].x,path[e].y);
        //if (erything.length == 1 && erything[0].terrain == 'plain'){
            /*empty spot*/
        Game.rooms[startPos.roomName].createConstructionSite(path[e].x,path[e].y,STRUCTURE_ROAD);
        //}
    }
}; 
module.exports.buildRoad = buildRoad;

var buildRoadAt = function(pos){
    Game.rooms[pos.roomName].createConstructionSite(pos.x,pos.y,STRUCTURE_ROAD);
}; 
module.exports.buildRoadAt = buildRoadAt;

var countPlanningFlags = function(room){
    var x = 0;
    var y = 0;
    var num_flags=0;
    for (x=5;x<=44;x+=7){
        for (y=5;y<=44;y+=7){
            if (checkBuildable(room,x,y,2,2)){                 
                num_flags++;
            }
        }
    }  
    return num_flags;
};module.exports.countPlanningFlags = countPlanningFlags;

var dropPlanningFlags = function(room){
    var x = 0;
    var y = 0;
    var num_flags=0;
    for (x=5;x<=44;x+=6){
        for (y=5;y<=44;y+=6){
            //TODO look for building flags already placed too closely    && room.getPosition(x,y).findInRange
            var tp = room.getPositionAt(x,y);
            if (checkBuildable(room,x,y,2,2) && flag_lib.findFlagsNear(tp,5,'ANY BUILDSPOT').length == 0){
                var flagname = flag_lib.plantFlag(tp,undefined,COLOR_GREY,COLOR_GREY);    
                num_flags++;
            }
        }
    }
    /*for (x=8;x<=44;x+=6){
        for (y=8;y<=44;y+=6){
            //TODO look for building flags already placed too closely    && room.getPosition(x,y).findInRange
            var tp = room.getPositionAt(x,y);
            if (checkBuildable(room,x,y,2,2) && flag_lib.findFlagsNear(tp,5,'ANY BUILDSPOT').length == 0){
                var flagname = flag_lib.plantFlag(tp,undefined,COLOR_GREY,COLOR_GREY);    
                num_flags++;
            }
        }
    } */ 
    return num_flags;
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

var activateBuildSpot= function(targetFlag){
    targetFlag.setColor(COLOR_GREY, COLOR_CYAN);

    //drop roads
    /*
    //facepalm roads template
    var offsets = [{x:-1,y:1},
                   {x:-1,y:2},
                   {x:-2,y:0},
                   {x:-1,y:-1},
                   {x:-2,y:-2},
                   {x:0,y:0},
                   {x:0,y:-1},
                   {x:1,y:1},
                   {x:1,y:2},
                   {x:2,y:0},
                   {x:1,y:-1},
                   {x:2,y:-2},
                   
                   //exterior roads
                   {x:-2,y:-3},
                   {x:-1,y:-3},
                   {x:0,y:-3},
                   {x:1,y:-3},
                   {x:2,y:-3},
                   {x:3,y:-3},
                   {x:3,y:-2},
                   {x:3,y:-1},
                   {x:3,y:0},
                   {x:3,y:1},
                   {x:3,y:2} ];
    for (var o in offsets){
        var tx = targetFlag.pos.x + offsets[o].x;
        var ty = targetFlag.pos.y + offsets[o].y;
        queueBuild(targetFlag.room, targetFlag.room.getPositionAt(tx,ty),STRUCTURE_ROAD,false); 
    }     
    */
    return null;              
};
module.exports.activateBuildSpot = activateBuildSpot;


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
            activateBuildSpot(targetFlag);
            //targetFlag.setColor(COLOR_GREY, COLOR_CYAN);
            var buildspot = findBuildSpot(room,targetFlag.pos.x,targetFlag.pos.y);
            if (buildspot){
                spot = buildspot;
            }    
        }
    }
    //console.log(spot);
    if (spot){
        //queueBuild(room,spot,struct_type,priority)
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


