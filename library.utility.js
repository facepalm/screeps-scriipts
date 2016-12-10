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
            var movecap = Math.floor(capacity / 500)
            for (var i =0;i < movecap;i+=1){
                output.unshift(MOVE);
                capacity -= 50;
            }
            var workcap = capacity
            for (var i =0;i<workcap-100;i+=100){
                output.unshift(WORK);
                capacity -= 100;                
            }
            if (capacity >= 50){
                output.unshift(MOVE); //one last move if we have the juice
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
   
    module.exports.util = util;
    
})();

var findEnergy = function(room,amt){
    //returns the best source of energy in the room, at least amt worth
    
    var elist = {}
    
    var nrg = creep.room.find(FIND_DROPPED_ENERGY, {
                        filter: function(res) { return res.amount >= amt; }
                    });
    if (for n in nrg){
        //go pick up the top of the list
        elist[nrg[n].id].type = 'RESOURCE';
        
        //var pckup = creep.pickup(nrg[0]);
        //if (pckup == ERR_NOT_IN_RANGE) {
        //    creep.moveTo(nrg[0]);
        //}
    }        
             
    for (var s in creep.room.memory.estorage){
        var obj = Game.getObjectById(s);
        if (obj.structureType == STRUCTURE_CONTAINER || obj.structureType == STRUCTURE_STORAGE){
            if (obj.store[RESOURCE_ENERGY] >= amt){
                elist[nrg[n].id].type = 'STORE';
            }
        }else{
            if (obj.energy >= amt){
                elist[nrg[n].id].type = 'ENERGY';
            }
        }
    }
    
    for (var s in creep.room.memory.einputs){
        var obj = Game.getObjectById(s);
        if (obj.structureType == STRUCTURE_CONTAINER || obj.structureType == STRUCTURE_STORAGE){
            if (obj.store[RESOURCE_ENERGY] >= amt){
                elist[nrg[n].id].type = 'STORE';
            }
        }else{
            if (obj.energy >= amt){
                elist[nrg[n].id].type = 'ENERGY';
            }
        }
    }
    console.log(elist);
    
    //    var withd = creep.withdraw(obj,RESOURCE_ENERGY,50);
    //    if (withd == ERR_NOT_IN_RANGE) {
    //        creep.moveTo(obj);
    //    }
    //}
    
}

module.exports.findEnergy = findEnergy;

