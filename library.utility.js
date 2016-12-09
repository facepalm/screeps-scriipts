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
    var checkSite, partsList, findEnergy;
    
    checkSite = function (pos, radius) {
        
            var existingsites = pos.findInRange(FIND_CONSTRUCTION_SITES,radius);
            var existingstruct = pos.findInRange(FIND_STRUCTURES,radius);
            var existingcreeps = pos.findInRange(FIND_HOSTILE_CREEPS,radius);
            return existingsites.length + existingstruct.length + existingcreeps.length
        };
    
    findEnergy = function (room){
        /*//given a room, return list of energy sources, their locations and usable status
        if (room.memory.deposits_timer < Game.time){
            room.memory.deposits = {};
            for (var a in room.memory.endpoints){
                var accpt = Game.getObjectById(a)
                if (accpt.structureType == STRUCTURE_CONTAINER || accpt.structureType == STRUCTURE_STORAGE){
                    room.memory.deposits[a] = accpt.store[RESOURCE_ENERGY];
                }
                if (accpt.structureType == STRUCTURE_SPAWN){
                    room.memory.deposits[a] = accpt.energy;
                }
                
            }
            
            room.memory.deposits_timer = Game.time + 60; //check once a minute
        }*/
    }
    
    partsList = function (spec, capacity){
        //given a unit specification, produces a list of parts that maximally uses specified capacity
        
        var output = [];
        
        if (spec == 'harvester'){
            //Harvester units have one move, one carry, and as many work as we can fit
            output.unshift(MOVE);
            output.unshift(CARRY);
            capacity -= 100;
            for (var i =0;i<capacity;i+=100){
                output.unshift(WORK);
            }
        }
        if (spec == 'hauler'){
            //Hauler units have equal move and carry
           
            for (var i =0;i<capacity;i+=100){
                output.unshift(CARRY);
                if (capacity - i >= 50) {
                    output.unshift(MOVE);    
                }
            }
        }
        if (spec == 'worker_bee'){
            //Worker bees have a blanced mix of work, carry and move, to function as generalists
           
            for (var i =0;i<capacity;i+=200){
                if (capacity - i >= 200){
                    output.unshift(CARRY);
                    output.unshift(WORK);
                    output.unshift(MOVE);
                } else if (capacity - i >= 150){
                    output.unshift(WORK);
                    output.unshift(MOVE);
                } else if (capacity - i >= 100){
                    output.unshift(WORK);
                } else if (capacity - i >= 50) output.unshift(MOVE);
            }
        }
        console.log(output);
        return output;
        
    
    }
    
    util.checkSite = checkSite;
    util.partsList = partsList;
    util.findEnergy = findEnergy;
   
    module.exports.util = util;
    
})();
