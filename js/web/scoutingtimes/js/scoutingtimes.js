
/*
 * **************************************************************************************
 * Copyright (C) 2021 FoE-Helper team - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the AGPL license.
 *
 * See file LICENSE.md or go to
 * https://github.com/mainIine/foe-helfer-extension/blob/master/LICENSE.md
 * for full license details.
 *
 * **************************************************************************************
 */

FoEproxy.addHandler('AnnouncementsService', 'fetchAllAnnouncements', (data, postData) => {
    // Closes the box when the player navigates back to the city
    HTML.CloseOpenBox('mapScoutingTimesDialog');
});

FoEproxy.addMetaHandler('castle_system_levels', (data, postData) => {

    let resp = JSON.parse(data['response']);
    let castlebonus = 1;
        
    for (let x in resp)
	{
        if (!Object.hasOwnProperty.call(resp, x)) continue;
		let l = resp[x];

		if(!l['level'])
		{
			continue;
		}

        for (let b in l.permanentRewards.BronzeAge) {
            if (!Object.hasOwnProperty.call(l.permanentRewards.BronzeAge, b)) continue;
            let boost = l.permanentRewards.BronzeAge[b];

            if(boost.subType !== 'army_scout_time')
                continue;

            castlebonus = 1 - boost.amount/100
        }
    
		scoutingTimes.castleBonuses[l['level']] = castlebonus;
    }
});

FoEproxy.addHandler('CampaignService', 'start', (data, postData) => {
       
    // Is the box enabled in the settings?
    if (!Settings.GetSetting('ShowScoutingTimes')) {
        return;
    }
    
    //do not show box, when scout is currently scouting
    //if (!(data.responseData.scout.path[0] == 0)) {
    //    return;
    //}

    // Don't create a new box while another one is still open
    if ($('#mapScoutingTimesDialog').length > 0) {
        return;
    }
    
    return scoutingTimes.ShowDialog(data.responseData);
});

let scoutingTimes = {

    /**
     * Shows a box displaying the base scouting times
     *
     * @constructor
     */
    ShowDialog: (data) => {

        let Provinces = {};
        let toscout = [];
        
        for (let p in data.provinces) {
            if (!Object.hasOwnProperty.call(data.provinces, p)) continue;
            let province = data.provinces[p];
            Provinces[province.id] = province;
        }
        
        let castlebonus = 1;
        if ((Castle.curLevel|0)>0) castlebonus = scoutingTimes.castleBonuses[Castle.curLevel];
        
        console.log("castlebonus:" + castlebonus);

        for (const p in Provinces) {
            if (Object.hasOwnProperty.call(Provinces, p)) {
                const province = Provinces[p];
                if (province.id <1700 || province.id >1800) continue;

                if (!(province.isPlayerOwned|false)) {
                    console.log(province.id + ": " + province.name + " is not owned by player");
                    continue;
                }
                console.log(province.id + ": " + province.name + " owned by player");

                for (let c in province.children)
                {
                    if (Object.hasOwnProperty.call(province.children, c)) {
                        const element = province.children[c];
                        let child = Provinces[element.targetId];
                        if (child.isPlayerOwned|false) {
                            console.log("child: " + child.id + ": " + child.name + " is already owned by player");
                            continue;
                        };
                        if (toscout.indexOf(child.id) > -1) {
                            console.log("child: " + child.id + ": " + child.name + " is already in scout list");
                            continue;
                        };

                        Provinces[child.id].travelTime = element.travelTime * castlebonus;

                        if (data.scout.path[data.scout.path.length-1] === child.id) {
                            Provinces[child.id].travelTime = data.scout.time_to_target;
                            scoutingTimes.target = child.id;
                            console.log("child: " + child.id + ": " + child.name + " is currently beeing scouted");
                        }
                        
                        if (child.isScouted|false) Provinces[child.id].travelTime = 0;
                        let mayScout = true;

                        for (const b in child.blockers) {
                            if (Object.hasOwnProperty.call(child.blockers, b)) {
                                const blockId = child.blockers[b];
                                if (!(Provinces[blockId]?.isPlayerOwned|false)) {
                                    mayScout = false;
                                    console.log("child: " + child.id + ": " + child.name + " is blocked by " + blockId + "(" + Provinces[blockId]?.name +")");
                                }
                            }
                        }

                        if (!mayScout) continue;
                        console.log("child: " + child.id + ": " + child.name + " is added to scoutlist");
                        toscout.push(child.id);
                    }
                }  
            }
        }

        let i = 0;
        let htmltext = `<table class="foe-table"><tr><th>${i18n('Boxes.scoutingTimes.ProvinceName')}</th><th>${i18n('Boxes.scoutingTimes.ScoutingCost')}</th><th>${i18n('Boxes.scoutingTimes.ScoutingTime')}</th></tr>`;
        
        while (toscout.length > 0) {
            let p = toscout.pop();
            let province = Provinces[p];
            if (province.isScouted|false) {
                htmltext += `<tr class="scouted"><td>${province.name}</td><td></td><td></td></tr>`;
                i += 1;
            }
            if ((province.travelTime|0)>0) {
                i += 1;
                htmltext += `<tr><td>${province.name}</td><td>`;
                htmltext += (p === scoutingTimes.target) ? `...<img  src="${MainParser.InnoCDN}/assets/city/gui/citymap_icons/tavern_shop_boost_scout_small_icon.png" alt="">...` : `<img  src="${MainParser.InnoCDN}/assets/shared/icons/money.png" alt=""> ${province.travelTime > 1 ? scoutingTimes.numberWithCommas(province.scoutingCost) : 0}</td>`;
                htmltext += `<td><img  src="${MainParser.InnoCDN}/assets/shared/icons/icon_time.png" alt="">`;
                htmltext += ` ${scoutingTimes.format(province.travelTime)}`;
                htmltext += `</td></tr>`;
            }
        }
       
        htmltext += `</table><div style="color:var(--text-bright); text-align:center;">${i18n('Boxes.scoutingTimes.Warning')}</div>`
        
        if (i > 0) {
            HTML.AddCssFile('scoutingtimes');
        
            HTML.Box({
                'id': 'mapScoutingTimesDialog',
                'title': i18n('Boxes.scoutingTimes.Title'),
                'auto_close': true,
                'dragdrop': true,
                'minimize': false
            });
    
            $('#mapScoutingTimesDialogBody').html(htmltext);
        }
    },

    format: (time) => {

        let min = Math.floor(time/60);
        let hours = Math.floor(min/60);
        let days = Math.floor(hours/24);
        min = min % 60;
        hours = hours % 24;

        let timestring = (days>0) ? `${days}d ` : ``;
        timestring += (hours>0) ? `${hours}h ` : ``;
        timestring += ((min>0) || (min+hours+days === 0))  ? `${min}m ` : ``;

        return timestring
    },

    numberWithCommas: (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    castleBonuses:{},
    target:0,
    
};
