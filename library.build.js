/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('library.build');
 * mod.thing == 'a thing'; // true
 */

var util = require('library.utility');

(function () {
    
    var builder = {};
    var setupSource, dropBuilding, findSite, findBaseSite;
    var buildSpurRoad;
    
    
    
    
    dropBuilding = function(room,struct_type){
        var _pos = findBaseSite(room);
        if (_pos){
            room.createConstructionSite(_pos,struct_type);
            room.createConstructionSite(_pos.x+1,_pos.y,STRUCTURE_ROAD);
            room.createConstructionSite(_pos.x,_pos.y+1,STRUCTURE_ROAD);
        }
    }
    
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
            if (erything.length == 1 && erything[0].terrain == 'plain'){
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
    
    builder.dropBuilding = dropBuilding;

    
    module.exports.builder = builder;
    
})();
