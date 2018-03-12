"use strict";

// define weapons
var MELEE_TYPE = 0;
var RANGED_TYPE = 1;

function ModdedWeapon(baseWeapon) {
    this.baseWeapon = baseWeapon;
    this.mods = [];
}

function WeaponMod(name, type, pointCost, descrition) {
    this.name = name;
    this.type = type;
    this.pointCost = pointCost;
    this.description = descrition;
}

function MeleeWeapon(name, pointCost, diceCount, twoHanded) {
    this.name = name;
    this.type = MELEE_TYPE;
    this.pointCost = pointCost;
    this.diceCount = diceCount;
    this.twoHanded = twoHanded;
}

function RangedWeapon(name, pointCost, diceCount, range, twoHanded) {
    this.name = name;
    this.type = RANGED_TYPE;
    this.pointCost = pointCost;
    this.diceCount = diceCount;
    this.range = range;
    this.twoHanded = twoHanded;
}

function Shield(name, pointCost, diceCount) {
    this.name = name;
    this.type = MELEE_TYPE;
    this.pointCost = pointCost;
    this.diceCount = diceCount;
    this.twoHanded = false;
}

function Armour(name, pointCost, diceCount) {
    this.name = name;
    this.pointCost = pointCost;
    this.diceCount = diceCount;
}

function Warrior(name) {
    this.name = name;
    this.moddedWeapons = [];

    this.hasShield = false;
    this.armour = null;
    this.bodyPointCost = 6;

    this.getPointCost = function () {
        var weaponIndex,
            modIndex,
            pointCost = 0;

        pointCost = this.bodyPointCost;

        for (weaponIndex = 0; weaponIndex < this.moddedWeapons.length; weaponIndex += 1) {

            if (this.moddedWeapons[weaponIndex].baseWeapon != null) {
                pointCost += this.moddedWeapons[weaponIndex].baseWeapon.pointCost;
            }

            for (modIndex = 0; modIndex < this.moddedWeapons[weaponIndex].mods.length; modIndex += 1) {
                pointCost += this.moddedWeapons[weaponIndex].mods[modIndex].pointCost;
            }
        }

        if (this.armour != null) {
            pointCost += this.armour.pointCost;
        }

        return pointCost;
    };
}

var meleeWeapons = [
    new MeleeWeapon("Hand Weapon", 2, 2, false),
    new MeleeWeapon("Great Weapon", 3, 3, true)
];

var rangedWeapons = [
    new RangedWeapon("Hand Ranged Weapon", 2, 2, 4, false),
    new RangedWeapon("Long Ranged Weapon", 3, 3, 6, true)
];

var shields = [
    new Shield("Shield", 1, -1)
];

var weapons = [
    new MeleeWeapon("Hand Weapon", 2, 2, false),
    new MeleeWeapon("Great Weapon", 3, 3, true),
    new Shield("Shield", 1, -1),
    new RangedWeapon("Hand Ranged Weapon", 2, 2, 4, false),
    new RangedWeapon("Long Ranged Weapon", 3, 3, 6, true)
];

var armours = [
    new Armour("Light Armour", 1, 1),
    new Armour("Heavy Armour", 2, 2)
];

var noArmour = new Armour("No Armour", 0, 0);

var mods = [
    new WeaponMod("Reach", MELEE_TYPE, 1, "Threat Zone +1 Space"),
    new WeaponMod("Unweildy", MELEE_TYPE, -1, "No threat zone"),
    new WeaponMod("Short Range", RANGED_TYPE, -1, "Reduces Range by 2")
];

var warriors = [];

var characterSheet = null;
var equipmentSelector = null;

// string helpers

function numberAsPointCost(num) {
    return num + (num === 1 || num === -1 ? " Pt" : " Pts");
}

function numberAsPointModifier(num) {
    return (num >= 0 ? "+" : "") + numberAsPointCost(num);
}

// class ops

function addSelectedClass(elem) {
    elem.classList.add("selected");
}

function removeSelectedClass(elem) {
    elem.classList.remove("selected");
}

function addHiddenClass(elem) {
    elem.classList.add("hidden");
}

function removeHiddenClass(elem) {
    elem.classList.remove("hidden");
}

// special views

// element builder methods

function createWeaponHeader(header) {
    var elem = document.getElementById("weapon_header_prototype").cloneNode(true);
    elem.innerHTML = header;

    elem.classList.remove("hidden");

    delete elem.id;

    return elem;
}

function createWeaponItem(weapon) {
    var elem = document.getElementById("weapon_item_prototype").cloneNode(true);

    delete elem.id;

    elem.getElementsByClassName("weaponName").item(0).innerHTML = weapon.name;

    if (weapon instanceof RangedWeapon) {
        elem.getElementsByClassName("weaponDice").item(0).innerHTML = "R: " + weapon.range + '\t' + weapon.diceCount + "dS";
    } else {
        elem.getElementsByClassName("weaponDice").item(0).innerHTML = weapon.diceCount + "dS";
    }

    elem.getElementsByClassName("weaponCost").item(0).innerHTML = numberAsPointCost(weapon.pointCost);

    removeHiddenClass(elem);

    return elem;
}

function createWeaponMod(mod) {
    var elem = document.getElementById("weapon_mod_prototype").cloneNode(true);

    delete elem.id;

    elem.getElementsByClassName("modName").item(0).innerHTML = mod.name;
    elem.getElementsByClassName("weaponCost").item(0).innerHTML = numberAsPointModifier(mod.pointCost);
    elem.getElementsByClassName("modDescription").item(0).innerHTML = mod.description;

    removeHiddenClass(elem);

    return elem;
}

function createArmourItem(armour) {
    var elem = document.getElementById("weapon_item_prototype").cloneNode(true);

    delete elem.id;

    elem.getElementsByClassName("weaponName").item(0).innerHTML = armour.name;
    elem.getElementsByClassName("weaponDice").item(0).innerHTML = armour.diceCount + "dS";
    elem.getElementsByClassName("weaponCost").item(0).innerHTML = numberAsPointCost(armour.pointCost);

    removeHiddenClass(elem);

    return elem;
}

function updateArmyPointCost() {
    var pointCost = 0,
        warriorsIndex,
        weaponIndex,
        modIndex,
        warrior;

    for (warriorsIndex = 0; warriorsIndex < warriors.length; warriorsIndex += 1) {
        warrior = warriors[warriorsIndex];

        //pointCost += 6;

        pointCost += warrior.getPointCost();
    }

    document.getElementById("point_counter").innerHTML = pointCost === 1 ? 1 + ' point' : pointCost + ' points';
}

function CharacterSheet(holder) {
    this.warrior = null;
    this.holder = holder;

    this.setWarrior = function (warrior) {
        this.warrior = warrior;
        this.draw();
    };

    this.draw = function () {
        var meleeWeapons = [],
            rangedWeapons = [],
            i,
            mw,
            modIndex,
            warriorNameElem = document.getElementById("warrior_name");

        this.holder.innerHTML = "";

        warriorNameElem.innerHTML = this.warrior.name + " (" + numberAsPointCost(this.warrior.getPointCost()) + ")";

        for (i = 0; i < this.warrior.moddedWeapons.length; i += 1) {
            mw = this.warrior.moddedWeapons[i];

            if (mw.baseWeapon.type === MELEE_TYPE) {
                meleeWeapons.push(mw);
            }

            if (mw.baseWeapon.type === RANGED_TYPE) {
                rangedWeapons.push(mw);
            }
        }

        if (this.warrior.moddedWeapons.length === 0) {
            this.holder.appendChild(createWeaponHeader("No Weapon"));
        }

        if (meleeWeapons.length > 0) {
            this.holder.appendChild(createWeaponHeader("Melee Weapons"));

            for (i = 0; i < meleeWeapons.length; i += 1) {
                this.holder.appendChild(createWeaponItem(meleeWeapons[i].baseWeapon));

                for (modIndex = 0; modIndex < meleeWeapons[i].mods.length; modIndex += 1) {
                    this.holder.appendChild(createWeaponMod(meleeWeapons[i].mods[modIndex]));
                }
            }
        }

        if (rangedWeapons.length > 0) {
            this.holder.appendChild(createWeaponHeader("Ranged Weapons"));

            for (i = 0; i < rangedWeapons.length; i += 1) {
                this.holder.appendChild(createWeaponItem(rangedWeapons[i].baseWeapon));

                for (modIndex = 0; modIndex < rangedWeapons[i].mods.length; modIndex += 1) {
                    this.holder.appendChild(createWeaponMod(rangedWeapons[i].mods[modIndex]));
                }
            }
        }

        if (this.warrior.armour === null) {
            this.holder.appendChild(createWeaponHeader("No Armour"));
        } else {
            this.holder.appendChild(createWeaponHeader("Armour"));
            this.holder.appendChild(createArmourItem(this.warrior.armour));
        }
    };
}

// Equipment selector

function EquipmentSelector(weaponHolder, modHolder, armourHolder) {
    this.weaponHolder = weaponHolder;
    this.modHolder = modHolder;
    this.armourHolder = armourHolder;
    this.warrior = null;

    this.selectedWeapon = new ModdedWeapon(null);

    this.weaponSelectors = [];
    this.modSelectors = [];
    this.armourSelectors = [];

    this.setWarrior = function (warrior) {
        this.warrior = warrior;
        this.selectedWeapon = new ModdedWeapon(null);
        this.draw();
    };

    this.draw = function () {
        var twoHandedWeaponCount = 0,
            shieldSelected = false,
            rangedSelected = false,
            meleeSelected = false,
            warrior = this.warrior,
            index,
            innerIndex,
            addWeaponBtn = document.getElementsByClassName("addWeaponBtn").item(0);

        clearSelected(this.weaponSelectors);
        clearSelected(this.modSelectors);
        clearSelected(this.armourSelectors);

        clearHidden(this.weaponSelectors);
        clearHidden(this.modSelectors);
        clearHidden(this.armourSelectors);
        
        removeHiddenClass(addWeaponBtn);

        if (this.selectedWeapon.baseWeapon != null) {

            index = weapons.indexOf(this.selectedWeapon.baseWeapon);

            if (index >= 0) {
                this.weaponSelectors[index].classList.add("selected");
            }

            for (index = 0; index < mods.length; index += 1) {
                if (mods[index].type === this.selectedWeapon.baseWeapon.type) {
                    removeHiddenClass(this.modSelectors[index]);
                } else {
                    addHiddenClass(this.modSelectors[index]);
                }
            }
        }

        if (this.selectedWeapon.mods != null) {
            for (index = 0; index < this.selectedWeapon.mods.length; index += 1) {
                innerIndex = mods.indexOf(this.selectedWeapon.mods[index]);

                if (innerIndex >= 0) {
                    addSelectedClass(this.modSelectors[innerIndex]);
                }
            }
        }

        if (this.warrior.armour != null) {
            index = armours.indexOf(this.warrior.armour);

            if (index >= 0) {
                addSelectedClass(this.armourSelectors[index]);
            }
        }

        if (warrior.moddedWeapons !== null) {
            for (index = 0; index < warrior.moddedWeapons.length; index += 1) {
                var wpn = warrior.moddedWeapons[index];

                if (wpn.baseWeapon.twoHanded) {
                    twoHandedWeaponCount += 1;
                }

                if (wpn.baseWeapon instanceof Shield) {
                    shieldSelected = true;
                }

                if (wpn.baseWeapon.type === MELEE_TYPE) {
                    meleeSelected = true;
                }

                if (wpn.baseWeapon.type === RANGED_TYPE) {
                    rangedSelected = true;
                }
            }
        }

        if (twoHandedWeaponCount >= 2 || warrior.moddedWeapons.length >= 3) {
            addHiddenClass(addWeaponBtn);
            
            for (index = 0; index < weapons.length; index += 1) {
                addHiddenClass(this.weaponSelectors[index]);
            }

            for (index = 0; index < mods.length; index += 1) {
                addHiddenClass(this.modSelectors[index]);
            }
        } else {
            for (index = 0; index < weapons.length; index += 1) {
                if (twoHandedWeaponCount > 0 && (weapons[index] instanceof Shield)) {
                    this.weaponSelectors[index].classList.add("hidden");
                    continue;
                }

                if (shieldSelected && weapons[index].twoHanded) {
                    this.weaponSelectors[index].classList.add("hidden");
                    continue;
                }
            }
        }
    };

    function clearHidden(selectors) {
        clear(selectors, "hidden");
    }

    function clearSelected(selectors) {
        clear(selectors, "selected");
    }

    function clear(selectors, className) {
        var index = 0;

        for (index = 0; index < selectors.length; index += 1) {
            selectors[index].classList.remove(className);
        }
    }

    function createBaseWeaponSelector(baseWeapon, onSelectedCallback) {
        var elem = document.getElementById("base_weapon_selector_prototype").cloneNode(true);
        elem.classList.remove("hidden");
        delete elem.id;

        elem.getElementsByClassName("baseWeaponName").item(0).innerHTML = baseWeapon.name;
        elem.getElementsByClassName("baseWeaponRange").item(0).innerHTML = baseWeapon.hasOwnProperty("range") ? "R: " + baseWeapon.range : "";
        elem.getElementsByClassName("baseWeaponCost").item(0).innerHTML = numberAsPointCost(baseWeapon.pointCost);
        elem.getElementsByClassName("baseWeaponDice").item(0).innerHTML = baseWeapon.diceCount + "dS";

        elem.onclick = onSelectedCallback;

        return elem;
    }

    function getStringForWeaponType(weaponType) {
        if (weaponType === MELEE_TYPE) {
            return "Melee";
        }

        if (weaponType === RANGED_TYPE) {
            return "Ranged";
        }

        return "";
    }

    function createWeaponModSelector(weaponMod, onSelectedCallback) {
        var elem = document.getElementById("weapon_mod_selector_prototype").cloneNode(true);
        elem.classList.remove("hidden");
        delete elem.id;

        elem.getElementsByClassName("weaponModName").item(0).innerHTML = weaponMod.name;
        elem.getElementsByClassName("weaponModCost").item(0).innerHTML = numberAsPointModifier(weaponMod.pointCost);
        elem.getElementsByClassName("weaponModType").item(0).innerHTML = getStringForWeaponType(weaponMod.type);
        elem.getElementsByClassName("weaponModDescription").item(0).innerHTML = weaponMod.description;

        elem.onclick = onSelectedCallback;

        return elem;
    }

    function createArmourSelector(armour, onSelectedCallback) {
        var elem = document.getElementById("armour_selector_prototype").cloneNode(true);
        elem.classList.remove("hidden");
        delete elem.id;

        elem.getElementsByClassName("armourName").item(0).innerHTML = armour.name;
        elem.getElementsByClassName("armourCost").item(0).innerHTML = numberAsPointCost(armour.pointCost);
        elem.getElementsByClassName("armourDice").item(0).innerHTML = armour.diceCount;

        elem.onclick = onSelectedCallback;

        return elem;
    }

    function deselectAll(selectors) {
        var index;

        for (index = 0; index < selectors.length; index += 1) {
            removeSelectedClass(selectors[index]);
        }
    }

    this.weaponSelectedCallback = function (baseWeaponIndex) {
        this.selectedWeapon.baseWeapon = weapons[baseWeaponIndex];

        deselectAll(this.weaponSelectors);
        addSelectedClass(this.weaponSelectors[baseWeaponIndex]);

        this.draw();
    };

    this.weaponModSelectedCallback = function (modIndex) {
        if (this.selectedWeapon.mods.includes(mods[modIndex])) {
            this.selectedWeapon.mods.splice(modIndex, 1);
            removeSelectedClass(this.modSelectors[modIndex]);
        } else {
            this.selectedWeapon.mods.push(mods[modIndex]);
            addSelectedClass(this.modSelectors[modIndex]);
        }

        this.draw();
    };

    this.armourSelectedCallback = function (armourIndex) {
        if (this.warrior.armour === armours[armourIndex]) {
            this.warrior.armour = null;
        } else {
            this.warrior.armour = armours[armourIndex];
        }
        
        warriorChanged();
    };

    this.addWeapon = function () {
        if (this.selectedWeapon.baseWeapon !== null) {
            this.warrior.moddedWeapons.push(this.selectedWeapon);
            this.selectedWeapon = new ModdedWeapon(null);
            warriorChanged();
        }

        this.draw();
    };

    function createView(self) {
        var index = 0,
            selectorElement = null;

        for (index = 0; index < weapons.length; index += 1) {
            (function () {
                var i = index;

                selectorElement = createBaseWeaponSelector(weapons[i], function () {
                    self.weaponSelectedCallback(i);
                });

                self.weaponHolder.appendChild(selectorElement);

                self.weaponSelectors.push(selectorElement);
            }());

        }

        for (index = 0; index < mods.length; index += 1) {
            (function () {
                var i = index;

                selectorElement = createWeaponModSelector(mods[index], function () {
                    self.weaponModSelectedCallback(i);
                });

                self.modHolder.appendChild(selectorElement);

                self.modSelectors.push(selectorElement);
            }());
        }

        for (index = 0; index < armours.length; index += 1) {
            (function () {
                var i = index;

                selectorElement = createArmourSelector(armours[index], function () {
                    self.armourSelectedCallback(i);
                });

                self.armourHolder.appendChild(selectorElement);

                self.armourSelectors.push(selectorElement);
            }());
        }

        document.getElementsByClassName("addWeaponBtn").item(0).onclick = function () {
            self.addWeapon();
        };
    }

    createView(this);
}



// fill setup warrior details

function warriorChanged() {
    characterSheet.draw();
    equipmentSelector.draw();

    updateArmyPointCost();
    updateWarriorListPoints();
}

// create warrior details (character sheet)
function setupWarriorDetails() {
    var details = document.getElementById("warrior_details"),
        weaponList = document.getElementById("weapon_item_holder");

    characterSheet = new CharacterSheet(weaponList);
}

// create equipment selector
function setupEquipmentSelector() {
    var weaponHolderForSelector = document.getElementById("weapon_holder"),
        modHolderForSelector = document.getElementById("mod_holder"),
        armourHolderForSelector = document.getElementById("armour_holder");

    equipmentSelector = new EquipmentSelector(weaponHolderForSelector, modHolderForSelector, armourHolderForSelector);
}

function addBody() {
    var inputValue = document.getElementById("nameInput").value;

    if (inputValue === '') {
        inputValue = 'Warrior ' + (warriors.length + 1);
    }

    var li = document.createElement("li");

    var t = document.createTextNode(inputValue);
    li.appendChild(t);

    var list = document.getElementById("warrior_list");

    list.appendChild(li);

    document.getElementById("nameInput").value = "";

    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");

    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);
    
    var pointCostSpan = document.createElement("SPAN");
    var pointCostTxt = document.createTextNode("");
    
    pointCostSpan.className = "pointCost";
    pointCostSpan.appendChild(pointCostTxt);
    li.appendChild(pointCostSpan);

    var warrior = new Warrior(inputValue);

    pointCostTxt.textContent = numberAsPointCost(warrior.getPointCost());
    
    span.onclick = function () {
        list.removeChild(li);

        li.onclick = null;

        var warriorIndex = warriors.indexOf(warrior);

        warriors.splice(warriorIndex, 1);

        if (warriorIndex < warriors.length) {
            warriorSelected(warriors[warriorIndex]);
        } else if (warriorIndex > 0) {
            warriorSelected(warriors[warriorIndex - 1]);
        } else {
            warriorSelected(null);
        }

        updateArmyPointCost();
    };

    li.onclick = function () {
        deselectAllListItems();

        li.classList.add("checked");
        warriorSelected(warrior);
    };

    warriors.push(warrior);
    updateArmyPointCost();
}

function updateWarriorListPoints() {
    var elems = document.getElementById("warrior_list").getElementsByTagName("LI"),
        index = 0,
        warriorElem = null;
    
    for (index = 0; index < elems.length; index += 1) {
        warriorElem = elems.item(index);
        warriorElem.getElementsByClassName("pointCost").item(0)
            .textContent = numberAsPointCost(warriors[index].getPointCost());
    }
}

function deselectAllListItems() {
    var list = document.getElementById("warrior_list"),
        listItems = list.getElementsByTagName("LI"),
        index = 0,
        item = null;

    for (index = 0; index < listItems.length; index += 1) {
        item = listItems.item(index);
        item.classList.remove("checked");
    }
}

function warriorSelected(warrior) {
    var warriorDetails = document.getElementById("warrior_details"),
        warriorNameElem = document.getElementById("warrior_name");

    if (warrior === null) {
        warriorDetails.classList.add('hidden');
        return;
    }

    warriorDetails.classList.remove('hidden');

    warriorNameElem.innerHTML = warrior.name + " (" + numberAsPointCost(warrior.getPointCost()) + ")";

    characterSheet.setWarrior(warrior);
    equipmentSelector.setWarrior(warrior);

    warriorChanged();
}

//// Create a "close" button and append it to each list item
//var myNodelist = document.getElementsByTagName("LI"),
//    i;
//
//for (i = 0; i < myNodelist.length; i += 1) {
//    var span = document.createElement("SPAN");
//    var txt = document.createTextNode("\u00D7");
//    span.className = "close";
//    span.appendChild(txt);
//    myNodelist[i].appendChild(span);
//}

// main
function main() {
    setupWarriorDetails();
    setupEquipmentSelector();
}

main();