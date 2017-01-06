/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.repairer');
 * mod.thing == 'a thing'; // true
 */

var util = require('library.utility');
var builder = require('library.build');

var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('fetching');
	    }
	    if(!creep.memory.working && creep.carry.energy > 0) {
	        creep.memory.working = true;
	        creep.say('depositing');
	    }

	    if(!creep.memory.working) {
	        if (!creep.memory.esource || !Game.getObjectById(creep.memory.esource)){                
	            creep.memory.esource = util.findClosestEnergy(creep,creep.carryCapacity,true,true,false,false);             
	        }
	        if (creep.memory.esource){
	            var obj = Game.getObjectById(creep.memory.esource);
	            if (creep.pos.getRangeTo(obj) <= 1){
	                if (obj.amount){
	                    creep.pickup(obj);
	                }else{
	                    creep.withdraw(obj,RESOURCE_ENERGY,creep.carryCapacity);
	                }
	                creep.memory.esource = undefined;
	            }else{
	                util.creepMove(creep,obj);
	            }
	        }
	    }else{
	        if (creep.memory.edest && !Game.getObjectById(creep.memory.edest)){
	            creep.memory.edest = null;
	        }
	        var dropRd = false;
	        if (!creep.memory.edest){  
	            dropRd = true; 
	            for (var s in creep.room.memory.endpoints){
	                if (creep.memory.edest) break;
                    var obj = Game.getObjectById(s);
                    var cap = 0;
                    if (obj.structureType == STRUCTURE_CONTAINER || obj.structureType == STRUCTURE_STORAGE){
                        var total = _.sum(obj.store);
                        cap = obj.storeCapacity - total;                        
                    }else{
                        cap = obj.energyCapacity - obj.energy;
                    }
                    if (cap > 0){
                        creep.memory.edest = s;
                    }
                }
                for (var s in creep.room.memory.estorage){
	                if (creep.memory.edest) break;
                    var obj = Game.getObjectById(s);
                    var cap = 0;
                    if (obj.structureType == STRUCTURE_CONTAINER || obj.structureType == STRUCTURE_STORAGE){
                        var total = _.sum(obj.store);
                        cap = obj.storeCapacity - total;                        
                    }else{
                        cap = obj.energyCapacity - obj.energy;
                    }
                    if (cap > creep.carry.energy/2){
                        creep.memory.edest = s;
                    }
                }
            }
	        if (creep.memory.edest){	            
	            var obj = Game.getObjectById(creep.memory.edest);
	            if (creep.pos.getRangeTo(obj) <= 1){              
                    var cap;
	                if (obj.structureType == STRUCTURE_CONTAINER || obj.structureType == STRUCTURE_STORAGE){
                        var total = _.sum(obj.store);
                        cap = obj.storeCapacity - total;                        
                    }else{
                        cap = obj.energyCapacity - obj.energy;
                    }
                    creep.transfer(obj,RESOURCE_ENERGY,Math.min(creep.carry.energy,cap));
	                creep.memory.edest = undefined;
	            }else{	            
	                util.creepMove(creep,obj);	
	                if (creep.room.memory.build_idle){
	                    //creep.room.createConstructionSite(creep,STRUCTURE_ROAD);
	                    //builder.buildRoad(creep.pos,obj.pos);
	                }   
	            }
	        }
	    }	    
	}
};

module.exports = roleHauler;
