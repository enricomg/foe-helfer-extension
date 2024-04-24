/*
 * **************************************************************************************
 * Copyright (C) 2022 FoE-Helper team - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the AGPL license.
 *
 * See file LICENSE.md or go to
 * https://github.com/mainIine/foe-helfer-extension/blob/master/LICENSE.md
 * for full license details.
 *
 * **************************************************************************************
 */

let Productions = {

	CombinedCityMapData: {},
	BuildingsAll: [],
	BuildingsProducts: [],
	BuildingsProductsGroups: [],
	ShowDaily: false,

	ActiveTab: 1,

	Tabs: [],
	TabsContent: [],

	Types: [
		'strategy_points',	// Forge Punkte
		'money',			// Münzen
		'supplies',			// Werkzeuge
		'medals',			// Medaillien
		'units',			// Einheiten
		'premium',			// Diamanten
		'clan_power',		// Macht der Gilde
		'clan_goods',		// Gildengüter (Arche, Ehrenstatue etc.)
		'population',		// Bevölkerung
		'happiness',		// Zufriedenheit
		'att_boost_attacker', //Angriffsbonus angreifende Armee
		'def_boost_attacker', //Verteidigungsbonus angreifende Armee
		'att_boost_defender', //Angriffsbonus verteidigenden Armee
		'def_boost_defender', //Verteidigungsbonus verteidigenden Armee
		'goods',			// Güter Gruppe (5 verschieden z.B.)
		'fragments',			
	],

	HappinessBoost: 0,
	PopulationSum: 0,
	HappinessSum: 0,
	Boosts: [],

	Buildings: [
		'greatbuilding',
		'production',
		'random_production',
		'residential',
		'decoration',
		'street',
		'goods',
		'culture',
		'main_building',
		'clan_power_production',
		'off_grid',
		'generic_building'
	],

	RatingCurrentTab: 'Settings',
	RatingEnableds: {},
	RatingProdPerTiles: {},

	RatingTypes: [
		'strategy_points',	// Forge Punkte
		'money',			// Münzen
		'supplies',			// Werkzeuge
		'medals',			// Medaillien
		'units',			// Einheiten
		'clan_power',		// Macht der Gilde
		'clan_goods',		// Gildengüter (Arche, Ehrenstatue etc.)
		'population',		// Bevölkerung
		'happiness',		// Zufriedenheit
		'att_boost_attacker', //Angriffsbonus angreifende Armee
		'def_boost_attacker', //Verteidigungsbonus angreifende Armee
		'att_boost_defender', //Angriffsbonus verteidigenden Armee
		'def_boost_defender', //Verteidigungsbonus verteidigenden Armee
		'goods',				// Güter Gruppe (5 verschieden z.B.)
	],
	fragmentsSet: new Set(),


	init: () => {
		Productions.CombinedCityMapData = MainParser.NewCityMapData

		if (CityMap.EraOutpostData) {
			Productions.CombinedCityMapData = Object.assign({}, Productions.CombinedCityMapData, CityMap.EraOutpostData)
		}

		// leere Arrays erzeugen
		for(let i in Productions.Types) {
			if (!Productions.Types.hasOwnProperty(i)) continue

			Productions.BuildingsProducts[Productions.Types[i]] = []
			if (Productions.Types[i] === 'goods') continue
			Productions.BuildingsProductsGroups[ Productions.Types[i] ] = []
		}

		Productions.ReadData();
	},


	/**
	 * Alle Gebäude durchsteppen
	 */
	ReadData: ()=> {
		Productions.BuildingsAll = Object.values(Productions.CombinedCityMapData);

		Productions.PopulationSum = 0,
		Productions.HappinessSum = 0;

		Productions.BuildingsAll.forEach(building => {
			if (building.happiness)
				Productions.HappinessSum += building.happiness
			if (building.population && building.population > 0)
				Productions.PopulationSum += building.population
		})

		let ProdBonus = 0;
		if (Productions.HappinessSum < Productions.PopulationSum) 
			ProdBonus = -0.5
		else if (Productions.HappinessSum < 1.4 * Productions.PopulationSum) 
			ProdBonus = 0
		else 
			ProdBonus = 0.2

		Productions.HappinessBoost = ProdBonus
		Productions.Boosts['money'] += ProdBonus
		Productions.Boosts['supplies'] += ProdBonus
		/*
		Productions.BuildingsAll.forEach(building => {
			building.state.production?.forEach(production => {
				if (Productions.Types.includes(production.resources)) {
					// Alle Gebäude einzeln auflisten, nach Produkt sortiert
					Productions.BuildingsProducts[x].push(building);

					let index = Productions.BuildingsProductsGroups[x].map((el) => el.eid).indexOf(building['eid']);

					// Alle Gebäude gruppieren und
					if (index === -1) {
						let ni = Productions.BuildingsProductsGroups[x].length + 1;

						Productions.BuildingsProductsGroups[x][ni] = [];
						Productions.BuildingsProductsGroups[x][ni]['name'] = building['name'];
						Productions.BuildingsProductsGroups[x][ni]['eid'] = building['eid'];
						Productions.BuildingsProductsGroups[x][ni]['era'] = building['era'];
						Productions.BuildingsProductsGroups[x][ni]['dailyfactor'] = building['dailyfactor'];
						Productions.BuildingsProductsGroups[x][ni]['units'] = building['units'];
						Productions.BuildingsProductsGroups[x][ni]['products'] = Productions.GetDaily(parseInt(building['products'][x]), building['dailyfactor'], x);
						Productions.BuildingsProductsGroups[x][ni]['motivatedproducts'] = Productions.GetDaily(parseInt(building['motivatedproducts'][x]), building['dailyfactor'], x);
						Productions.BuildingsProductsGroups[x][ni]['count'] = 1;

					}
					else {
						Productions.BuildingsProductsGroups[x][index]['products'] += parseInt(building['products'][x]);
						Productions.BuildingsProductsGroups[x][index]['motivatedproducts'] += parseInt(building['motivatedproducts'][x]);
						Productions.BuildingsProductsGroups[x][index]['count']++;
					}
				}
				else {
					let mId = Productions.BuildingsAll[i]['eid'] + '_' + Productions.BuildingsAll[i]['id'];

					if (Array.isArray(Productions.BuildingsProducts['goods'][mId]) === false) {
						Productions.BuildingsProducts['goods'][mId] = [];
						Productions.BuildingsProducts['goods'][mId]['at'] = building['at'];
						Productions.BuildingsProducts['goods'][mId]['id'] = building['id'];
						Productions.BuildingsProducts['goods'][mId]['era'] = building['era'];
						Productions.BuildingsProducts['goods'][mId]['name'] = building['name'];
						Productions.BuildingsProducts['goods'][mId]['type'] = building['type'];
						Productions.BuildingsProducts['goods'][mId]['dailyfactor'] = building['dailyfactor'];
						Productions.BuildingsProducts['goods'][mId]['products'] = [];
						Productions.BuildingsProducts['goods'][mId]['motivatedproducts'] = [];
					}

					Productions.BuildingsProducts['goods'][mId]['products'][x] = building['products'][x];
					Productions.BuildingsProducts['goods'][mId]['motivatedproducts'][x] = building['motivatedproducts'][x];
				}
			}) 
		})*/

		Productions.showBox();
	},

	/**
	 * HTML Box erstellen und einblenden
	 */
	showBox: () => {

		if ($('#Productions').length > 0){
			HTML.CloseOpenBox('Productions');

			return;
		}

		HTML.AddCssFile('productions');

		HTML.Box({
			id: 'Productions',
			title: i18n('Boxes.Productions.Title'),
			auto_close: true,
			dragdrop: true,
			minimize: true,
			resize: true
		});

		Productions.ActiveTab = 1;
		Productions.CalcBody();

		Productions.SwitchFunction();
	},


	/**
	 * Aktualisiert den Inhalt
	 */
	CalcBody: () => {
		Productions.Tabs = [];
		Productions.TabsContent = [];

		let h = [];

		h.push('<div class="production-tabs tabs">');

		Productions.BuildingsAll.forEach(building => {
			let boosts = Object.keys(MainParser.BoostSums)
			let saveBuilding = {id: building.id, entityId: building.entityId}

			// todo: units, clan_goods arrays are empty when closing and opening again

			boosts.forEach(boost => {
				Productions.getBoost(building, boost, function(result) { 
					if (result != undefined) {
						if (Productions.BuildingsProducts[boost]) {
							if (Productions.BuildingsProducts[boost].find(x => x.id == building.id) == undefined)
								Productions.BuildingsProducts[boost].push(saveBuilding)
						}
					}
				})
			})
			
			if (building.production) {
				building.production.forEach(production => {
					if (production.type == "guildResources") { // todo
						if (Productions.BuildingsProducts.clan_goods.find(x => x.id == building.id) == undefined)
							Productions.BuildingsProducts["clan_goods"].push(saveBuilding)
						if (production.resources.clan_power > 0)
							if (Productions.BuildingsProducts.clan_power.find(x => x.id == building.id) == undefined)
								Productions.BuildingsProducts["clan_power"].push(saveBuilding)
					}
					if (production.type == "unit") { 
						if (Productions.BuildingsProducts.units.find(x => x.id == building.id) == undefined)
							Productions.BuildingsProducts["units"].push(saveBuilding)
					}
					if (production.resources.subType == "fragment") { 
						Productions.BuildingsProducts["fragments"].push(saveBuilding)
					}
					/*if (production.type == "random") { // todo: random production?!
						production.resources.forEach(resource => {
							// todo: type == "forgepoint_package", amount ist in subType als string
						})
					}*/
					if (production.type == "resources") {
						if (production.resources.money) { 
							if (Productions.BuildingsProducts.money.find(x => x.id == building.id) == undefined)
								Productions.BuildingsProducts["money"].push(saveBuilding)
						}
						if (production.resources.medals) { 
							if (Productions.BuildingsProducts.medals.find(x => x.id == building.id) == undefined)
								Productions.BuildingsProducts["medals"].push(saveBuilding)
						}
						if (production.resources.premium) { 
							Productions.BuildingsProducts["premium"].push(saveBuilding)
						}
						if (production.resources.strategy_points) { 
							if (Productions.BuildingsProducts.strategy_points.find(x => x.id == building.id) == undefined)
								Productions.BuildingsProducts["strategy_points"].push(saveBuilding)
						}
						if (production.resources.supplies) { 
							if (Productions.BuildingsProducts.supplies.find(x => x.id == building.id) == undefined)
								Productions.BuildingsProducts["supplies"].push(saveBuilding)
						}
						/*if {
							// todo: goods
							console.log(building.name, production.resources)
							Productions.BuildingsProducts["goods"].push(saveBuilding)
						}*/
					}
				})
			}
			if (building.state.production) {
				building.state.production.forEach(production => {
					if (production.type == "guildResources") { // todo
						if (Productions.BuildingsProducts.clan_goods.find(x => x.id == building.id) == undefined)
							Productions.BuildingsProducts.clan_goods.push(saveBuilding)
						if (production.resources.clan_power > 0)
							if (Productions.BuildingsProducts.clan_power.find(x => x.id == building.id) == undefined)
								Productions.BuildingsProducts.clan_power.push(saveBuilding)
					}
					if (production.type == "unit") { 
						if (Productions.BuildingsProducts.units.find(x => x.id == building.id) == undefined)
							Productions.BuildingsProducts.units.push(saveBuilding)
					}
					if (production.resources.money) { 
						if (Productions.BuildingsProducts.money.find(x => x.id == building.id) == undefined)
						Productions.BuildingsProducts.money.push(saveBuilding)
					}
					if (production.resources.medals) { 
						if (Productions.BuildingsProducts.medals.find(x => x.id == building.id) == undefined)
						Productions.BuildingsProducts.medals.push(saveBuilding)
					}
					if (production.resources.premium) { 
						if (Productions.BuildingsProducts.premium.find(x => x.id == building.id) == undefined)
						Productions.BuildingsProducts.premium.push(saveBuilding)
					}
					if (production.resources.strategy_points) { 
						if (Productions.BuildingsProducts.strategy_points.find(x => x.id == building.id) == undefined)
						Productions.BuildingsProducts.strategy_points.push(saveBuilding)
					}
					if (production.resources.supplies) { 
						if (Productions.BuildingsProducts.supplies.find(x => x.id == building.id) == undefined)
						Productions.BuildingsProducts.supplies.push(saveBuilding)
					}
					if (production.resources.subType == "fragment") { 
						if (Productions.BuildingsProducts.fragments.find(x => x.id == building.id) == undefined)
						Productions.BuildingsProducts.fragments.push(saveBuilding)
					}
					// todo: goods
				})
			}

			if (building.happiness !== 0) {
				Productions.BuildingsProducts["happiness"].push(saveBuilding)
			}
			if (building.population !== 0) {
				Productions.BuildingsProducts["population"].push(saveBuilding)
			}

			Productions.BuildingsProducts.forEach(type => {
				type.sort((a,b) => {
					if (a.entityId < b.entityIdif) {
						return -1
					}
					if (a.entityId > b.entityIdif) {
						return 1
					}
					return 0
				})
			})
		})

		console.log(Productions.BuildingsProducts, Productions.Types)

		Productions.Types.forEach(type => {
			let buildingIds = Productions.BuildingsProducts[type]

			Productions.SetTabs(type)

			let table = [],
			tableGr = [],
			rowA = [],
			rowB = [],
			groupedBuildings = [],
			countProductsMotivated = [],
			countProductsDone = [],
			boostCounter = {'att_boost_attacker': {all: 0, battleground: 0, guild_expedition: 0, guild_raids: 0},
			'def_boost_attacker': {all: 0, battleground: 0, guild_expedition: 0, guild_raids: 0},
			'att_boost_defender': {all: 0, battleground: 0, guild_expedition: 0, guild_raids: 0},
			'def_boost_defender': {all: 0, battleground: 0, guild_expedition: 0, guild_raids: 0}}
			countAll = 0,
			typeCurrentSum = 0,
			typeSum = 0,
			sizes = [],
			sizetooltips = [];

			buildingIds.forEach(b => {
				let building = CityMap.getBuildingById(b.id)
				//let shortSide = parseFloat(Math.min(building.size.width, building.size.length))
				//let size = building.size.width*building.size.length
				//let sizeWithStreets = size + (building.state.connected == true ? (building.needsStreet > 0 ? shortSide * building.needsStreet / 2 : 0) : 0)

				rowA.push('<tr>')
				rowA.push('<td>')
				rowA.push((building.state.isPolivated !== undefined ? (building.state.isPolivated ? '<span class="text-bright">★</span>' : '☆') : ''))
				rowA.push('</td>')
				rowA.push('<td>' + building.name + '</td>')
				// todo: warum haben hüpfkürbisse ne produktion obwohl sie nicht laufen
				
				// keine ahnung
				if (!type.includes('att') && !type.includes('def')) {
					if (type != 'fragments') {
						currentAmount = parseFloat(CityMap.getBuildingProductionByCategory(true, building, type))
						amount = parseFloat(CityMap.getBuildingProductionByCategory(false, building, type))

						if (type == 'money' && building.type != "greatbuilding") {
							amount = Math.round(amount + (amount * ((MainParser.BoostSums.coin_production + (Productions.HappinessBoost * 100)) / 100)))
							currentAmount = Math.round(currentAmount + (currentAmount * ((MainParser.BoostSums.coin_production + (Productions.HappinessBoost * 100)) / 100)))
						}
						else if (type == 'supplies' && building.type != "greatbuilding") {
							amount = Math.round(amount + (amount *((MainParser.BoostSums.supply_production + (Productions.HappinessBoost * 100)) / 100)))
							currentAmount = Math.round(currentAmount + (currentAmount *((MainParser.BoostSums.supply_production + (Productions.HappinessBoost * 100)) / 100)))
						}
						else if (type == 'strategy_points' && building.type != "greatbuilding") {
							amount = Math.round(amount + (amount *((MainParser.BoostSums.forge_points_production) / 100)))
							currentAmount = Math.round(currentAmount + (currentAmount *((MainParser.BoostSums.forge_points_production) / 100)))
						}
						rowA.push('<td data-number="'+amount+'" class="textright" colspan="4">')
						if (currentAmount != amount)
							rowA.push(HTML.Format(currentAmount) + '/' + HTML.Format(amount))
						else 
							rowA.push(HTML.Format(currentAmount))
						rowA.push('</td>')
						
						typeSum += amount
						typeCurrentSum += currentAmount
					}
					else {
						rowA.push('<td colspan="4">' + CityMap.getBuildingFragments(building) + '</td>')
					}
				}
				else {
					if (building.boosts !== undefined) {
						boosts = {
							all: 0,
							battleground: 0,
							guild_expedition: 0,
							guild_raids: 0
						}
						building.boosts.forEach(boost => {
							if (boost.type.find(x => x == type) == type) {
								if (boost.feature == "all") {
									boosts.all = boost.value
									boostCounter[type][boost.feature] += boost.value
								}
								if (boost.feature == "battleground") {
									boosts.battleground = boost.value
									boostCounter[type][boost.feature] += boost.value
								}
								if (boost.feature == "guild_expedition") {
									boosts.guild_expedition = boost.value
									boostCounter[type][boost.feature] += boost.value
								}
								if (boost.feature == "guild_raids") {
									boosts.guild_raids = boost.value
									boostCounter[type][boost.feature] += boost.value
								}
							}
						})
						// todo: add castle system
						rowA.push('<td data-number="'+boosts.all+'">'+ (boosts.all != 0 ? HTML.Format(boosts.all) : '') +'</td>')
						rowA.push('<td data-number="'+boosts.battleground+'">'+ (boosts.battleground != 0 ? HTML.Format(boosts.battleground) : '') +'</td>')
						rowA.push('<td data-number="'+boosts.guild_expedition+'">'+ (boosts.guild_expedition != 0 ? HTML.Format(boosts.guild_expedition) : '') +'</td>')
						rowA.push('<td data-number="'+boosts.guild_raids+'">'+ (boosts.guild_raids != 0 ? HTML.Format(boosts.guild_raids) : '') +'</td>')
					}
				}

				let updateGroup = groupedBuildings.find(x => x.name == building.name)
				if (updateGroup == undefined) {
					groupedBuildings.push({
						name: building.name,
						amount: 1,
						currentValues: currentAmount,
						values: amount
					})
				}
				else {
					updateGroup.amount++
					updateGroup.currentValues += currentAmount
					updateGroup.values += amount
				}

				rowA.push('<td>' + i18n("Eras."+Technologies.Eras[building.eraName]) + '</td>')
				rowA.push('<td style="white-space:nowrap">' + moment.unix(building.state.times?.at).fromNow() + '</td>')
				// todo: invalid date
				rowA.push('<td style="white-space:nowrap">' + (building.state.times?.at * 1000 <= MainParser.getCurrentDateTime() ? '<strong class="success">' + i18n('Boxes.Productions.Done') : '') + '</strong></td>')
				rowA.push('<td class="text-right">')
				rowA.push('<span class="show-entity" data-id="' + building.id + '"><img class="game-cursor" src="' + extUrl + 'css/images/hud/open-eye.png"></span>')
				rowA.push('</td>')
				rowA.push('</tr>')
			})

			table.push('<table class="foe-table sortable-table '+type+'-list active">')
			table.push('<thead>')
			table.push('<tr>')
			// todo: happiness is off by 250 with unmotivated inactive forgotten temple -> citymap
			table.push('<th colspan="3"><span class="btn-default change-view game-cursor" data-type="' + type + '">' + i18n('Boxes.Productions.ModeGroups') + '</span></th>')
			if (!type.includes('att') && !type.includes('def')) 
				table.push('<th colspan="9" class="textright">'+HTML.Format(parseFloat(typeCurrentSum))+ "/" +HTML.Format(parseFloat(typeSum))+'</th>')
			else {
				table.push('<th colspan="9" class="textright"></th>')
			}
			table.push('</tr>')
			table.push('<tr>')
			table.push('<th> </th>')
			table.push('<th>' + i18n('Boxes.BlueGalaxy.Building') + '</th>')
			if (!type.includes('att') && !type.includes('def')) 
				table.push('<th colspan="4">' + i18n('Boxes.Productions.Headings.number') + '</th>')
			else {
				table.push('<th class="boost '+type+'"><span></span>'+boostCounter[type].all+'</th>')
				table.push('<th class="boost battleground"><span></span>'+boostCounter[type].battleground+'</th>')
				table.push('<th class="boost guild_expedition"><span></span>'+boostCounter[type].guild_expedition+'</th>')
				table.push('<th class="boost guild_raids"><span></span>'+boostCounter[type].guild_raids+'</th>')
			}
			table.push('<th>' + i18n('Boxes.Productions.Headings.era') + '</th>')
			table.push('<th>' + i18n('Boxes.Productions.Headings.earning') + '</th>')
			table.push('<th>' + i18n('Boxes.Productions.Headings.Done') + '</th>')
			table.push('<th> </th>')
			table.push('</tr>')
			table.push('</thead>')
			table.push('<tbody>')
			table.push( rowA.join('') )
			table.push('</tbody>')
			table.push('</table>')

			// grouped buildings
			tableGr.push('<table class="foe-table sortable-table '+type+'-group">')
			tableGr.push('<thead>')
			tableGr.push('<tr>')
			tableGr.push('<th colspan="3"><span class="btn-default change-view game-cursor" data-type="' + type + '">' + i18n('Boxes.Productions.ModeSingle') + '</span></th>')
			tableGr.push('</tr>')
			tableGr.push('<tr>')
			tableGr.push('<th>' + i18n('Boxes.Productions.Headings.number') + '</th>')
			tableGr.push('<th>' + i18n('Boxes.BlueGalaxy.Building') + '</th>')
			tableGr.push('<th>' + i18n('Boxes.Productions.Headings.earning') + '</th>')
			tableGr.push('</tr>')
			tableGr.push('</thead>')
			tableGr.push('<tbody>')
				groupedBuildings.forEach(building => {
					rowB.push('<tr>')
					rowB.push('<td data-number="'+building.amount+'">'+building.amount+'x </td>')
					rowB.push('<td>'+ building.name +'</td>')
					rowB.push('<td data-number="'+building.currentValues+'">'+building.currentValues+'/'+building.values+'</td>')
					rowB.push('</tr>')
				})
			tableGr.push( rowB.join('') )
			tableGr.push('</tbody>')
			tableGr.push('</table>')

			let content = table.join('') + tableGr.join('')

			Productions.SetTabContent(type, content)
		})

		// alles auf einmal ausgeben
		//console.log(Productions.BuildingsAll)
		console.log(Productions.BuildingsProducts)
		Productions.BuildingsAll = helper.arr.multisort(Productions.BuildingsAll, ['name'], ['ASC']);
		Productions.SetTabs('all');

		let building = Productions.BuildingsAll,
			TableAll = [],
			rowC = [];

		for(let i in building) {
			if(building.hasOwnProperty(i)) {
				let pA = [],
					prod = building[i]['products'],
					ShowTime = false;

				for(let p in prod) {
					if(prod.hasOwnProperty(p)) {
						if (p==='fragments') continue;
						pA.push(HTML.Format(Productions.GetDaily(prod[p], building[i]['dailyfactor'], p)) + ' ' + Productions.GetGoodName(p));
						if (Productions.TypeHasProduction(p)) {
							ShowTime = true;
						}
					}
				}

				rowC.push('<tr class="' + building[i]['type'] + ' ' + (!ShowTime || building[i]['at'] * 1000 >= MainParser.getCurrentDateTime() ? 'notdone' : '') + '">');
				rowC.push('<td>' + building[i]['name'] + '</td>');

				rowC.push('<td>' + pA.join('<br>') + '</td>');

				rowC.push('<td>' + i18n('Eras.' + building[i]['era']) + '</td>');

				if (ShowTime) {
					rowC.push('<td>' + (building[i]['at'] ? moment.unix(building[i]['at']).format(i18n('DateTime')) : i18n('Boxes.Productions.DateNA')) + '</td>');

					if (!building[i]['at']) {
						rowC.push('<td></td>');
                    }
					else if (building[i]['at'] * 1000 <= MainParser.getCurrentDateTime()) {
						rowC.push('<td style="white-space:nowrap"><strong class="success">' + i18n('Boxes.Productions.Done') + '</strong></td>');
					}
					else {
						rowC.push('<td style="white-space:nowrap" colspan="2">' + moment.unix(building[i]['at']).fromNow() + '</td>');
					}
				}
				else {
					rowC.push('<td></td><td colspan="2"></td>');
				}
                rowC.push('</tr>');
			}
		}

		TableAll.push('<table class="foe-table">');

		TableAll.push('<thead>');
		TableAll.push('<tr>');
		TableAll.push('<th><input type="text" id="all-search" placeholder="' + i18n('Boxes.Productions.SearchInput') + '" onkeyup="Productions.Filter()">');

		if (Productions.ShowDaily) {
			TableAll.push('<span class="btn-default change-daily game-cursor" data-value="' + (Productions.Types.length - (-1)) + '">' + i18n('Boxes.Productions.ModeDaily') + '</span>');
		}
		else {
			TableAll.push('<span class="btn-default change-daily game-cursor" data-value="' + (Productions.Types.length - (-1)) + '">' + i18n('Boxes.Productions.ModeCurrent') + '</span>');
		}

		TableAll.push('</th>');

		TableAll.push('<th class="text-right" id="all-dropdown-th"></th>');
		TableAll.push('</tr>');
		TableAll.push('</thead>');

		TableAll.push('</table>');

		TableAll.push('<table class="foe-table all-mode">');
		TableAll.push( rowC.join('') );
		TableAll.push('</table>');

		Productions.SetTabContent('all', TableAll.join(''));


		// alles zusammen basteln
		h.push( Productions.GetTabs() );
		h.push( Productions.GetTabContent() );

		h.push('</div>');

		$('#Productions').find('#ProductionsBody').html(h.join('')).promise().done(function () {

			// Zusatzfunktionen für die Tabelle
			$('.production-tabs').tabslet({ active: Productions.ActiveTab });
			$('.sortable-table').tableSorter();
			Productions.SortingAllTab();

			// Ein Gebäude soll auf der Karte dargestellt werden
			$('#Productions').on('click', '.foe-table .show-entity', function () {
				Productions.ShowFunction($(this).data('id'));
			});
		});
	},


	/**
	 * Calculates average reward of a GenericReward
	 * */
	CalcAverageRewards: (GenericReward, DropChance=100) => {
		let Ret = {};

		if (GenericReward['type'] === 'resource' || GenericReward['type'] === 'good') {
			Ret[GenericReward['subType']] = GenericReward['amount'] * DropChance/100.0;
		}
		else if(GenericReward['type'] === 'chest') {
			for (let i = 0; i < GenericReward['possible_rewards'].length; i++) {
				let CurrentReward = GenericReward['possible_rewards'][i];

				let Rewards = Productions.CalcAverageRewards(CurrentReward['reward'], CurrentReward['drop_chance']);
				for (let ResName in Rewards) {
					if (!Ret[ResName]) Ret[ResName] = 0;
					Ret[ResName] += Rewards[ResName];
                }
            }
		}

		return Ret;
    },
	
	/**
	* alle Produkte auslesen
	*
	* @param d
	* @returns {{eid: *, at: *, in: *, name: *, id: *, type: *, products: *, motivatedproducts: *}}
	*/
   readType: (d) => {			
	   // Boost ausrechnen und bereitstellen falls noch nicht initialisiert
	   if (Productions.Boosts['money'] === undefined) Productions.Boosts['money'] = ((MainParser.BoostSums['coin_production'] + 100) / 100);
	   if (Productions.Boosts['supplies'] === undefined) Productions.Boosts['supplies'] = ((MainParser.BoostSums['supply_production'] + 100) / 100);
	   if (Productions.Boosts['fp'] === undefined) Productions.Boosts['fp'] = ((MainParser.BoostSums['forge_points_production'] + 100) / 100);
   },


	/**
	 * Merkt sich alle Tabs
	 *
	 * @param id
	 */
	SetTabs: (id)=> {
		Productions.Tabs.push('<li class="' + id + ' game-cursor"><a href="#' + id + '" class="game-cursor"><span>&nbsp;</span></a></li>');
	},


	/**
	 * Gibt alle gemerkten Tabs aus
	 *
	 * @returns {string}
	 */
	GetTabs: ()=> {
		return '<ul class="horizontal dark-bg">' + Productions.Tabs.join('') + '</ul>';
	},


	/**
	 * Speichert BoxContent zwischen
	 *
	 * @param id
	 * @param content
	 */
	SetTabContent: (id, content)=> {
		// ab dem zweiten Eintrag verstecken
		let style = Productions.TabsContent.length > 0 ? ' style="display:none"' : '';

		Productions.TabsContent.push('<div id="' + id + '"' + style + '>' + content + '</div>');
	},

	/**
	 * Gibt an, ob der jeweilige Ressourcentyp produziert wird oder nicht (z.B. Bevölkerung, Zufriedenheits, Kampfboosts)
	*
    * @param Type
    */
	TypeHasProduction: (Type) => {
		if (Type === 'population' || Type === 'happiness' || Type === 'att_boost_attacker' || Type === 'att_boost_defender' || Type === 'def_boost_attacker' || Type === 'def_boost_defender') {
			return false;
		}
		else {
			return true;
        }
    },

	/**
	 * Setzt alle gespeicherten Tabellen zusammen
	 *
	 * @returns {string}
	 */
	GetTabContent: ()=> {
		return Productions.TabsContent.join('');
	},


	/**
	 * Schalter für die Tabs [Einzelansicht|Gesamtansicht]
	 *
	 */
	SwitchFunction: ()=>{
		$('#Productions').on('click', '.change-view', function() {
			// todo: dumm
			let activeTable = $(this).parent().parent().parent().parent('table'),
				hiddenTable = $(this).parent().parent().parent().parent().parent('#'+$(this).data('type')).children('table:not(.active)')

			console.log(activeTable, hiddenTable)
			activeTable.fadeOut(400, function(){
				hiddenTable.fadeIn(400)
				activeTable.removeClass('active')
				hiddenTable.addClass('active')
			});
		});
	},


	/**
	 * Sortiert alle Gebäude des letzten Tabs
	 *
	 */
	SortingAllTab: ()=>{

		// Gruppiert die Gebäude
		$('#all tr').each(function(){

			let regex = /([a-z_])*/i;
			let matches = regex.exec( $(this).attr('class') );

			if(matches.length && matches[0] !== "undefined")
			{
				if(!$('#parent-' + matches[0]).length)
				{
					$('<tbody id="parent-' + matches[0] + '" class="parent"><tr><th colspan="5">' + i18n('Boxes.Productions.Headings.' + matches[0]) + '</th></tr></tbody>').appendTo('.all-mode');
				}

				$(this).appendTo( $('#parent-' + matches[0]) );
			}
		});


		// Dropdown zum Filtern
		let drop = $('<select />').attr('id', 'all-drop').addClass('game-cursor');

		drop.append( $('<option />').attr('data-type', 'all').text( i18n('Boxes.Productions.Headings.all') ) )

		for(let i in Productions.Buildings)
		{
			if(Productions.Buildings.hasOwnProperty(i))
			{
				drop.append($('<option />').attr('data-type', Productions.Buildings[i]).text(i18n('Boxes.Productions.Headings.' + Productions.Buildings[i])).addClass('game-cursor') )
			}
		}

		drop.append($('<option />').attr('data-type', 'done').text(i18n('Boxes.Productions.Headings.Done')))

		$('#all-dropdown-th').append(drop);

		setTimeout(()=>{
			Productions.Dropdown();
		}, 100)
	},


	/**
	 * Blendet je nach Dropdown die Typen ein
	 */
	Dropdown: ()=>{
		$('#Productions').on('change', '#all-drop', function() {
			let t = $('select#all-drop :selected').data('type');

			if (t === 'all') {
				$('.all-mode').find('.parent').show();
				$('.all-mode').find('.notdone').show();
			}
			else if (t === 'done') {
				$('.all-mode').find('.parent').show();
				$('.all-mode').find('.notdone').hide();
            }
			else {
				$('.all-mode').find('.parent').hide();
				$('.all-mode').find('#parent-' + t).show();
				$('.all-mode').find('.notdone').show();
			}
		});
	},


	/**
	 * Kleine Suche für die "Gesamt"-Liste
	 *
	 */
	Filter: ()=>{
		let input, filter, tr, td, i, txtValue;

		input = $("#all-search").val();
		filter = input.toUpperCase();
		tr = $('#all').find('tr');

		// durch alle TRs rennen
		for (i = 0; i < tr.length; i++) {
			td = $(tr[i]).find('td')[0];

			if (td) {
				txtValue = $(td).text();

				if (txtValue.toUpperCase().indexOf(filter) > -1) {
					tr[i].style.display = "";
				} else {
					tr[i].style.display = "none";
				}
			}
		}
	},


	/**
	 * Hilfsfunktion zum Prüfen auf "leer"
	 *
	 * @param obj
	 * @returns {boolean}
	 */
	isEmpty: (obj)=> {
		for(let key in obj) {
			if(obj.hasOwnProperty(key))
				return false;
		}
		return true;
	},


	/**
	 * Zeigt pulsierend ein Gebäude auf der Map
	 *
	 * @param ids
	 */
	ShowFunction: (ids) => {
		let IDArray = (ids.length !== undefined ? ids : [ids]);

		CityMap.init(MainParser.CityMapData);

		$('#grid-outer').removeClass('desaturate');
		$('[data-entityid]').removeClass('highlighted');

		setTimeout(() => {
			$('#grid-outer').addClass('desaturate');
			for (let i = 0; i < IDArray.length; i++) {
				let target = $('[data-entityid="' + IDArray[i] + '"]');

				if(i === 0) $('#map-container').scrollTo(target, 800, { offset: { left: -280, top: -280 }, easing: 'swing' });
				target.addClass('highlighted');
            }		
		}, 500);
	},


	/**
	 * Namen der Güter ermitteln
	 *
	 * @param GoodType
	 * @returns {*|string}
	 */
	GetGoodName: (GoodType)=> {

		if (GoodType === 'happiness') {
			return i18n('Boxes.Productions.Happiness');

		}
		else if (GoodType === 'clan_power') {
			return i18n('Boxes.Productions.GuildPower');

		}
		else if (GoodType === 'clan_goods') {
			return i18n('Boxes.Productions.GuildGoods');

        }
		else if (GoodType === 'units'){
			return i18n('Boxes.Productions.Units');

		}
		else if (GoodType === 'att_boost_attacker') {
			return i18n('Boxes.Productions.att_boost_attacker');

		}
		else if (GoodType === 'att_boost_defender') {
			return i18n('Boxes.Productions.att_boost_defender');

		}
		else if (GoodType === 'def_boost_attacker') {
			return i18n('Boxes.Productions.def_boost_attacker');

		}
		else if (GoodType === 'def_boost_defender') {
			return i18n('Boxes.Productions.def_boost_defender');

		}
		else if (GoodType === 'goods') {
			return i18n('Boxes.Productions.goods');
        }
		else if (GoodType === 'fragments') {
			return i18n('Boxes.Productions.fragments');
        }		
		else {
			if(GoodType && GoodsData[GoodType]){
				return GoodsData[GoodType]['name'];

			} else {
				return GoodType;
			}
		}
	},


	/**
	 * Ermittelt die täglichen Güter, falls die Option ShowDaily gesetzt ist
	 *
	 * */
	GetDaily: (Amount, daily_factor, type) => {
		let Factor;
		if (Productions.ShowDaily && Productions.TypeHasProduction(type)) {
			Factor = daily_factor;
		}
		else {
			Factor = 1;
		}

		return Amount * Factor;
	},


	ShowRating: () => {
		if ($('#ProductionsRating').length === 0) {

			let RatingEnableds = localStorage.getItem('ProductionRatingEnableds');
			if (RatingEnableds !== null) {
				Productions.RatingEnableds = JSON.parse(RatingEnableds);
			}

			let RatingProdPerTiles = localStorage.getItem('ProductionRatingProdPerTiles');
			if (RatingProdPerTiles !== null) {
				Productions.RatingProdPerTiles = JSON.parse(RatingProdPerTiles);
			}

			for (let i = 0; i < Productions.RatingTypes.length; i++) {
				let Type = Productions.RatingTypes[i];

				if (Productions.RatingEnableds[Type] === undefined) Productions.RatingEnableds[Type] = true;
				if (Productions.RatingProdPerTiles[Type] === undefined) Productions.RatingProdPerTiles[Type] = Productions.GetDefaultProdPerTile(Type);
            }

			HTML.Box({
				id: 'ProductionsRating',
				title: i18n('Boxes.ProductionsRating.Title'),
				auto_close: true,
				dragdrop: true,
				minimize: true,
				resize: true
			});
			HTML.AddCssFile('productions');

			// Ein Gebäude soll auf der Karte dargestellt werden
			$('#ProductionsRating').on('click', '.foe-table .show-entity', function () {
				let ID = $(this).data('id');

				let Parts = ID.split('='),
					GroupType = (Parts.length >= 1 ? Parts[0] : ''),
					GroupID = (Parts.length >= 2 ? Parts[1] : '');
									
				let IDs = [];
				for (let i in MainParser.CityMapData) {
					if (!MainParser.CityMapData.hasOwnProperty(i)) continue;

					let CurrentBuilding = MainParser.CityMapData[i];

					if (GroupType === 'cityentity_id') {
						if (CurrentBuilding['cityentity_id'] === GroupID) IDs.push(i);
					}
					else if (GroupType === 'setId' || GroupType === 'chainId') {
						let Entity = MainParser.CityEntities[CurrentBuilding['cityentity_id']];

						if (!Entity['abilities']) continue;
						for (let j = 0; j < Entity['abilities'].length; j++) {
							let Ability = Entity['abilities'][j];

							if (Ability[GroupType] === GroupID) IDs.push(i);
						}
					}
                }

				Productions.ShowFunction(IDs);
			});

			$('#ProductionsRating').on('click', '.toggle-tab', function () {
				Productions.RatingCurrentTab = $(this).data('value');

				Productions.CalcRatingBody();
			});

			for (let i = 0; i < Productions.RatingTypes.length; i++) {
				let Type = Productions.RatingTypes[i];

				$('#ProductionsRating').on('click', '#Enabled-' + Type, function () {
					let $this = $(this),
						v = $this.prop('checked');

					if (v) {
						Productions.RatingEnableds[Type] = true;
					}
					else {
						Productions.RatingEnableds[Type] = false;
                    }

					localStorage.setItem('ProductionRatingEnableds', JSON.stringify(Productions.RatingEnableds));
					Productions.CalcRatingBody();
				});

				$('#ProductionsRating').on('blur', '#ProdPerTile-' + Type, function () {
					Productions.RatingProdPerTiles[Type] = parseFloat($('#ProdPerTile-' + Type).val());
					if (isNaN(Productions.RatingProdPerTiles[Type])) Productions.RatingProdPerTiles[Type] = 0;
					localStorage.setItem('ProductionRatingProdPerTiles', JSON.stringify(Productions.RatingProdPerTiles));
					Productions.CalcRatingBody();
				});
			}
		} else {
			HTML.CloseOpenBox('ProductionsRating');
		}

		Productions.CalcRatingBody();
	},


	CalcRatingBody: () => {
		let h = [];

		h.push('<div class="tabs">');
		h.push('<ul class="horizontal dark-bg">');
		h.push('<li class="' + (Productions.RatingCurrentTab === 'Settings' ? 'active' : '')  + '"><a class="toggle-tab" data-value="Settings"><span>' + i18n('Boxes.ProductionsRating.Settings') + '</span></a></li>');
		h.push('<li class="' + (Productions.RatingCurrentTab === 'Results' ? 'active' : '') + '"><a class="toggle-tab" data-value="Results"><span>' + i18n('Boxes.ProductionsRating.Results') + '</span></a></li>');
		h.push('</ul>');
		h.push('</div>');

		//Einstellungen
		if (Productions.RatingCurrentTab === 'Settings') {
			h.push('<table class="foe-table">');

			h.push('<thead>')
			h.push('<tr>');
			h.push('<th></th>'); //Symbol
			h.push('<th></th>'); //ResourceName
			h.push('<th class="text-center">' + i18n('Boxes.ProductionsRating.Enabled') + '</th>');
			h.push('<th class="text-center">' + i18n('Boxes.ProductionsRating.ProdPerTile') + '</th>');
			h.push('</tr>');
			h.push('</thead>')

			h.push('<tbody>');
			for (let i = 0; i < Productions.RatingTypes.length; i++) {
				let Type = Productions.RatingTypes[i];

				h.push('<tr>');
				h.push('<td style="width:1%" class="text-center"><span class="resicon ' + Type + '"></span></td>');
				h.push('<td>' + Productions.GetGoodName(Type) + '</td>');
				h.push('<td class="text-center"><input id="Enabled-' + Type + '" class="enabled game-cursor" ' + (Productions.RatingEnableds[Type] ? 'checked' : '') + ' type="checkbox"></td>');
				if (Productions.RatingEnableds[Type]) {
					h.push('<td class="text-center"><input type="number" id="ProdPerTile-' + Type + '" step="0.01" min="0" max="1000000" value="' + Productions.RatingProdPerTiles[Type] + '"></td>');
				}
				else {
					h.push('<td></td>');
                }
				h.push('</tr>');
			}
			h.push('</tbody>');

			h.push('</table>');
		}
		//Ergebnisse
		else if (Productions.RatingCurrentTab === 'Results') {
			//Schritt1: Berechnung
			let BuildingGroups = {};
			for (let i in MainParser.CityMapData) {
				if (!MainParser.CityMapData.hasOwnProperty(i)) continue;

				let Building = MainParser.CityMapData[i],
					Entity = MainParser.CityEntities[Building['cityentity_id']],
					GroupID = Building['cityentity_id'],
					GroupName = Entity['name'],
					GroupType = 'cityentity_id';

				if (Entity['abilities']) {
					let SkipBuilding = false;
					for (let j = 0; j < Entity['abilities'].length; j++) {
						let Ability = Entity['abilities'][j],
							Class = Ability['__class__'];

						if (Class === 'NotsellableAbility') { //Keine Gebäude, die man nicht abreißen kann
							SkipBuilding = true;
							break;
						}
						else if (Ability['chainId']) {
							GroupID = Ability['chainId'];
							GroupName = (MainParser.BuildingChains[Ability['chainId']] ? MainParser.BuildingChains[Ability['chainId']]['name'] : Ability['chainId']);
							GroupType = 'chainId';
						}
						else if (Ability['setId']) {
							GroupID = Ability['setId'];
							GroupName = (MainParser.BuildingSets[Ability['setId']] ? MainParser.BuildingSets[Ability['setId']]['name'] : Ability['setId']);
							GroupType = 'setId';

                        }
					}
					if (SkipBuilding) continue;
				}

				//keine Straßen, keine Millitärgebäude
				if (Entity['type'] === 'street' || Entity['type'] === 'military') continue;

				//let Score = 0;

				Production['motivatedproducts']['goods'] = 0;
				for (let Type in Production['motivatedproducts']) {
					if (!Production['motivatedproducts'].hasOwnProperty(Type)) continue;

					if (Productions.TypeHasProduction(Type)) Production.motivatedproducts[Type] *= Production['dailyfactor'];
					if (['residential','production','generic_building'].includes(Building['type'])) {
						if (Type === 'money') Production.motivatedproducts[Type] *= (Productions.Boosts['money']);
						if (Type === 'supplies') Production.motivatedproducts[Type] *= (Productions.Boosts['supplies']);
					}
				}

				for (let Type in Production['motivatedproducts']) {
					//Güter zusammenfassen
					if (!Productions.Types.includes(Type)) {
						Production.motivatedproducts['goods'] += Production.motivatedproducts[Type];
						delete Production.motivatedproducts[Type];
					}
				}

				for (let Type in Production['motivatedproducts']) {
					if (!Production['motivatedproducts'].hasOwnProperty(Type)) continue;

					if (!Productions.RatingEnableds[Type]) {
						delete Production.motivatedproducts[Type];						
					}
				}
				if (!BuildingGroups[GroupID]) BuildingGroups[GroupID] = [];

				Production.GroupName = GroupName;
				Production.GroupType = GroupType;
				BuildingGroups[GroupID].push(Production);
			}

			let GroupStats = [];
			for (let GroupID in BuildingGroups) {
				if (!BuildingGroups.hasOwnProperty(GroupID)) continue;

				let CurrentGroup = BuildingGroups[GroupID],
					TotalProducts = {},
					TotalTiles = 0;

				for (let i = 0; i < CurrentGroup.length; i++) {
					let CurrentBuilding = CurrentGroup[i],
						Entity = MainParser.CityEntities[CurrentBuilding['eid']];

					for (let ResName in CurrentBuilding['motivatedproducts']) {
						if (!CurrentBuilding['motivatedproducts'].hasOwnProperty(ResName)) continue;

						if (!TotalProducts[ResName]) TotalProducts[ResName] = 0;
						TotalProducts[ResName] += CurrentBuilding['motivatedproducts'][ResName];
					}

					let BuildingSize = CityMap.GetBuildingSize(MainParser.CityMapData[CurrentBuilding['id']]);

					TotalTiles += BuildingSize['total_area'];
				}

				let TotalPoints = 0;
				for (let ResName in TotalProducts) {
					if (!TotalProducts.hasOwnProperty(ResName)) continue;

					if (!Productions.RatingEnableds[ResName] || Productions.RatingProdPerTiles[ResName] <= 0) continue;

					TotalPoints += TotalProducts[ResName] / Productions.RatingProdPerTiles[ResName];
				}

				let GroupStat = {};
				GroupStat['ID'] = GroupID;
				GroupStat['GroupName'] = CurrentGroup[0]['GroupName'];
				GroupStat['GroupType'] = CurrentGroup[0]['GroupType'];
				GroupStat['Count'] = CurrentGroup.length;
				GroupStat['TotalProducts'] = TotalProducts;
				GroupStat['Score'] = TotalPoints / TotalTiles;

				GroupStats.push(GroupStat);
            }

			GroupStats = GroupStats.sort(function (a, b) {
				return a['Score'] - b['Score'];
			});

			//Schritt2: Header
			h.push('<table class="foe-table sortable-table">');

			h.push('<thead>');
			h.push('<tr>');
			h.push('<th>' + i18n('Boxes.ProductionsRating.BuildingName') + '</th>');
			for (let i = 0; i < Productions.RatingTypes.length; i++) {
				let Type = Productions.RatingTypes[i];

				if (!Productions.RatingEnableds[Type]) continue;

				h.push('<th style="width:1%" class="text-center"><span class="resicon ' + Type + '"></span></th>');
			}
			h.push('<th>' + i18n('Boxes.ProductionsRating.Score') + '</th>');
			h.push('<th></th>');
			h.push('</tr>');
			h.push('<thead>');

			//Schritt3: Body
			h.push('<tbody>');
			
			for (let i = 0; i < GroupStats.length; i++) {
				let GroupStat = GroupStats[i];

				h.push('<tr>');
				h.push('<td>' + GroupStat['Count'] + 'x ' + GroupStat['GroupName'] + '</td>');
				for (let j = 0; j < Productions.RatingTypes.length; j++) {
					let Type = Productions.RatingTypes[j];

					if (!Productions.RatingEnableds[Type]) continue;

					let Amount = (GroupStat['TotalProducts'][Type] ? GroupStat['TotalProducts'][Type] : 0);
					h.push('<td class="text-center">' + HTML.Format(Math.round(Amount)) + '</td>');
				}

				let ScorePercent = Math.round(GroupStat['Score'] * 100);

				h.push('<td><strong class="' + (ScorePercent >= 100 ? 'success' : 'error') + '">' + ScorePercent + '%</strong></td>');//(ScorePercent > 0 ? ScorePercent + '%' : 'N/A') + '</strong></td>');
				h.push('<td class="text-right"><span class="show-entity" data-id="' + GroupStat['GroupType'] + '=' + GroupStat['ID'] + '"><img class="game-cursor" src="' + extUrl + 'css/images/hud/open-eye.png"></span></td>');
				h.push('</tr>');
            }

			h.push('</tbody>');

			h.push('</table>');
		}
		else {
			h.push('Tab error...');
        }

		$('#ProductionsRatingBody').html(h.join(''));
    },


	getBoost: (building, boostName, callback) => {
		building.boosts?.forEach(boost => {
			let type = boost.type.find(x => x == boostName)
			if (type !== undefined) {
				//const value = {[type]: { feature: boost.feature, value: boost.value }}
				const value = { feature: boost.feature, value: boost.value }
				callback(value)
			}
			else {
				callback(undefined)
			}
		})
	},


	GetDefaultProdPerTile: (Type) => {
		if (Type === 'strategy_points') return 0.2;
		if (Type === 'money') return 0;
		if (Type === 'supplies') return 0;
		if (Type === 'medals') return 0;
		if (Type === 'units') return 0.2;
		if (Type === 'clan_power') {
			let Entity = MainParser.CityEntities['Z_MultiAge_CupBonus1b'], //Hall of fame lvl2
				Level = CurrentEraID - 1;

			if (!Entity || !Entity['entity_levels'] || !Entity['entity_levels'][Level] || !Entity['entity_levels'][Level]['clan_power']) return 0;

			return 2 * Entity['entity_levels'][Level]['clan_power'] / 10.5; //Motivated hall of fame lvl2
		}
		if (Type === 'clan_goods') return 0;
		if (Type === 'population') return 0;
		if (Type === 'happiness') return 0;
		if (Type === 'att_boost_attacker') return 1;
		if (Type === 'def_boost_attacker') return 1;
		if (Type === 'att_boost_defender') return 4;
		if (Type === 'def_boost_defender') return 6;
		if (Type === 'goods') return 1;
		else return 0;
	},
};
