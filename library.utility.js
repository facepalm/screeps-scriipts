/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('library.utility');
 * mod.thing == 'a thing'; // true
 */



(function () {
    
    var util = {};
    var checkSite, partsList;
    
    checkSite = function (pos, radius) {
        
            var existingsites = pos.findInRange(FIND_CONSTRUCTION_SITES,radius);
            var existingstruct = pos.findInRange(FIND_STRUCTURES,radius);
            var existingcreeps = pos.findInRange(FIND_HOSTILE_CREEPS,radius);
            return existingsites.length + existingstruct.length + existingcreeps.length
        };
    
    
    
    partsList = function (spec, capacity){
        //given a unit specification, produces a list of parts that maximally uses specified capacity
        
        var output = [];
        
        if (spec == 'harvester'){
            //Harvester units have one move, one carry, and as many work as we can fit
            output.unshift(MOVE);
            //output.unshift(CARRY);
            capacity -= 50;
            //unit gets 1/5 of its capacity as MOVE parts (1/10 energy)
            var movecap = Math.max(0,Math.floor(capacity / 500) - 1); //the -1 because we already have one move
            capacity -= movecap*50;
            
            var workcap = capacity
            for (var i =0;i<=workcap-100;i+=100){
                output.unshift(WORK);
                capacity -= 100;                
            }
            for (var i =0;i < movecap;i+=1){
                output.unshift(MOVE);
            }
            if (capacity >= 50){
                output.unshift(MOVE); //one last move if we have the juice
            }
        }
        if (spec == 'hauler'){
            //Hauler units have one move for each three carry
            
            for (var i =0;i<=capacity-200;i+=200){
                output.unshift(CARRY);
                output.unshift(CARRY);
                output.unshift(CARRY);
                output.unshift(MOVE);    
                
            }
            capacity = capacity % 200;
            //we don't *really* need the following, I just like using all the energy
            if (capacity >= 150){
                output.unshift(CARRY);
                output.unshift(CARRY);
                output.unshift(MOVE); 
            }else if (capacity >= 100){
                output.unshift(CARRY);
                output.unshift(MOVE); 
            }else if (capacity >= 50){
                output.unshift(MOVE); 
            }
            
        }
        if (spec == 'worker_bee'){
            //Worker bees have a balanced mix of work, carry and move, to function as generalists
            var curcap = 0;
            for (var i =0;i<=capacity-200;i+=200){
                    output.unshift(CARRY);
                    output.unshift(WORK);
                    output.unshift(MOVE);
                    curcap += 200;
            }
            if (capacity - curcap >= 150){
                output.unshift(CARRY);
                output.unshift(CARRY);
                output.unshift(MOVE);
            } else if (capacity - curcap >= 100){
                output.unshift(MOVE);
                output.unshift(CARRY);
            } else if (capacity - i >= 50) output.unshift(MOVE);            
        }
        if (spec == 'upgrader'){
            //Upgrader units are specialized for taking energy from a can next to the controller and upgrading it
            output.unshift(MOVE);
            output.unshift(CARRY);
            capacity -= 100;
            //unit gets 1/5 of its capacity as MOVE parts (1/10 energy)
            var movecap = Math.floor(capacity / 500) - 1; //one move already
            for (var i =0;i < movecap;i+=1){
                output.unshift(MOVE);
                capacity -= 50;
            }
            var workcap = capacity
            for (var i =0;i<=workcap-100;i+=100){
                output.unshift(WORK);
                capacity -= 100;                
            }
            if (capacity >= 50){
                output.unshift(MOVE); //one last move if we have the juice
            }
        }
        console.log('New spec: ',output);
        return output;
        
    
    }
    
    util.checkSite = checkSite;
    util.partsList = partsList;
   
    module.exports.util = util;
    
})();

var terrainAt = function(x,y,room){
    var ter = room.lookForAt(LOOK_TERRAIN,x,y);
    return ter[0];
};

var findEnergy = function(room,amt, dropped, einputs, estorage, endpoints){
    //returns the best source of energy in the room, at least amt worth
    
    var elist = {}
    
    if (dropped){
        var nrg = room.find(FIND_DROPPED_ENERGY, {
                            filter: function(res) { return res.amount >= amt; }
                        });
        var nrg = room.find(FIND_DROPPED_ENERGY);
        for (var n in nrg){
            if (nrg[n].amount > amt){
                elist[nrg[n].id] = 'RESOURCE';
            }
        }        
    }
    
    if (estorage){         
        for (var s in room.memory.estorage){
            var obj = Game.getObjectById(s);
            if (obj.structureType == STRUCTURE_CONTAINER || obj.structureType == STRUCTURE_STORAGE){
                if (obj.store[RESOURCE_ENERGY] >= amt){
                    elist[obj.id] = 'STORE';
                }
            }else{
                if (obj.energy >= amt){
                    elist[obj.id] = 'ENERGY';
                }
            }
        }
    }
    
    if (einputs){
        for (var s in room.memory.einputs){
            var obj = Game.getObjectById(s);
            if (obj.structureType == STRUCTURE_CONTAINER || obj.structureType == STRUCTURE_STORAGE){
                if (obj.store[RESOURCE_ENERGY] >= amt){
                    elist[obj.id] = 'STORE';
                }
            }else{
                if (obj.energy >= amt){
                    elist[obj.id] = 'ENERGY';
                }
            }
        }
    }
    //console.log(elist);
    
    //    var withd = creep.withdraw(obj,RESOURCE_ENERGY,50);
    //    if (withd == ERR_NOT_IN_RANGE) {
    //        creep.moveTo(obj);
    //    }
    //}
    return elist;
    
}
module.exports.findEnergy = findEnergy;

var findClosestEnergy = function(creep,amt, dropped, einputs, estorage, endpoints){
    var rm = creep.room;
    var elist = findEnergy(rm, amt, dropped, einputs, estorage, endpoints);
    if (!elist) return null;
    
    var best_entry = null;
    var best_dist = 0;
    for (var e in elist){
        var this_dist = creep.pos.getRangeTo(Game.getObjectById(e));
        if (this_dist < best_dist || !best_entry){
            best_entry = e;
            best_dist = this_dist;
        }
    }	                
    return best_entry;
}


var fetchEnergy = function(creep){
    if (!creep.memory.esource || !Game.getObjectById(creep.memory.esource)){                
        creep.memory.esource = findClosestEnergy(creep,creep.carryCapacity,true,true,true,false);             
    }
    if (creep.memory.esource){
        var obj = Game.getObjectById(creep.memory.esource);
        if (creep.pos.getRangeTo(obj) <= 1){
            if (obj.amount){
                creep.pickup(obj);
            }else{
                creep.withdraw(obj,RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
            }
            creep.memory.esource = undefined;
        }else{
            var moved = creep.moveTo(obj);	                
        }
    }
}
module.exports.fetchEnergy = fetchEnergy;

var creepMove= function(creep,obj){
    var moved = creep.moveTo(obj,{reusePath: 50});
    if (moved == ERR_NO_PATH){
        //bad move (no path, etc) -> turn off reusing path
        //console.log ('Bad move detected! Move returned: '+moved);
        creep.memory._move.time = 0;
    }
    return moved;
}
module.exports.creepMove = creepMove;

module.exports.findClosestEnergy = findClosestEnergy;
module.exports.terrainAt = terrainAt;


