/**
 * Created by adrienne.cabouet on 6/7/16.
 */

(function($) {
    var monthlyBillAdjustment_all = [];
    var excessSolar = [];
    var usageAvail_all = [0,0,0,0,0,0,0,0,0,0,0,0];
    var excessSolar_all = [0,0,0,0,0,0,0,0,0,0,0,0];
    var bankedEnergy_all = [0,0,0,0,0,0,0,0,0,0,0,0];
    var bankApplied_all = [0,0,0,0,0,0,0,0,0,0,0,0];
    var bankBalance_all = [0,0,0,0,0,0,0,0,0,0,0,0];
    var adjustedBankRead = [0,0,0,0,0,0,0,0,0,0,0,0];
    var kwhAll = [];
    var bankTotal = 0;

    $.extend({
        setCookie: function(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        },

        getCookie: function(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },

        sliderCalculate: function(kwhUsed_monthly, curDate, numberOfSolarBlocks) {

            var monthlyBill_selector = $('#monthlyBill');
            var milesNotDriven_selector = $('#milesNotDriven');
            var treesPlanted_selector = $('#treesPlanted');
            var co2Saved_selector = $('#co2Saved');

            //Calculator Plugin
            //Set const number multipliers
            var co2_multiplier = 0.883309496421;
            var milesNotDriven_multiplier = 0.953232046;
            var carsOffRoad_multiplier = 0.0000845;
            var treesPlanted_multiplier = 0.010383732;
            var poundsKWH = 0.88;

            //Without solar normal bill
            var withoutSolar_tier1_winter_multiplier = 0.088498;
            var withoutSolar_tier2_winter_multiplier = 0.107072;
            var withoutSolar_tier1_summer_multiplier = 0.088498;
            var withoutSolar_tier2_summer_multiplier = 0.115429;
            var withoutSolar_tier3_summer_multiplier = 0.14451;

            var withoutSolar_normalBill_tier1_multiplier = 400;
            var withoutSolar_normalBill_tier2_summer_multiplier = 600;
            var withoutSolar_normalBill_tier3_summer_multiplier;

            //Calculate Tier 1 for normal Bill

            if (kwhUsed_monthly > 400) {
                withoutSolar_normalBill_tier1_multiplier = 400;
            }
            else {
                //Tier 1 multipler < 400 kwh
                withoutSolar_normalBill_tier1_multiplier = kwhUsed_monthly;
            }

            //Tier 2 normal bill multiplier for winter months
            var withoutSolar_normalBill_tier2_winter_multiplier = kwhUsed_monthly - withoutSolar_normalBill_tier1_multiplier;


            //Summer calculate normal bill tier2 and tier3
            if (kwhUsed_monthly < 1000) {
                withoutSolar_normalBill_tier2_summer_multiplier = kwhUsed_monthly - withoutSolar_normalBill_tier1_multiplier;
                withoutSolar_normalBill_tier3_summer_multiplier = 0;

            } else {
                //withoutSolar_normalBill_tier2_summer_multiplier = 600;
                withoutSolar_normalBill_tier3_summer_multiplier = kwhUsed_monthly - withoutSolar_normalBill_tier1_multiplier - withoutSolar_normalBill_tier2_summer_multiplier;
            }

            //============ With Solar
            //Initial Incremental
            var solar_kwh_multiplier = 200;
            var solar_tier1_multiplier = 0.11703;
            var solar_tier2_multiplier = 0.11703;
            var solar_tier3_multiplier = 0.11703;

            //Change Solar Multiplier per block change, column J28:J39
            var solar_kwh_total = solar_kwh_multiplier * numberOfSolarBlocks;

            var solar_bill_tier1_multiplier;
            var solar_bill_tier2_multiplier;
            var solar_bill_tier3_multiplier;
            var solar_bill_tier2_summer_multiplier;
            var solar_bill_tier3_summer_multiplier;

            //Calculate Solar Tier1, if greater then 400, set it equal to 400, if less then 400 set to difference
            if(kwhUsed_monthly - solar_kwh_total > 400) {
                solar_bill_tier1_multiplier = 400;
            } else {
                solar_bill_tier1_multiplier = (kwhUsed_monthly - solar_kwh_total);
            }

            // Solar Tier 2 multiplier is negative number set it to 0, if greater then show difference
            if(solar_bill_tier1_multiplier < 0){
                solar_bill_tier2_multiplier = 0;
            } else {
                solar_bill_tier2_multiplier = kwhUsed_monthly - solar_bill_tier1_multiplier - solar_kwh_total;
            }

            //Calculate Solar Summer Tier2, if greater then 600, set it equal to 600, if less then 600 show difference
            if(kwhUsed_monthly - solar_kwh_total - solar_bill_tier1_multiplier > 600) {
                solar_bill_tier2_summer_multiplier = 600;
            } else {
                solar_bill_tier2_summer_multiplier = (kwhUsed_monthly - solar_kwh_total - solar_bill_tier1_multiplier);
            }

            //Calculate Solar Summer Tier3
            if(solar_bill_tier2_summer_multiplier == 0) {
                solar_bill_tier3_summer_multiplier = 0;
            } else {
                solar_bill_tier3_summer_multiplier = (kwhUsed_monthly - solar_kwh_total - solar_bill_tier1_multiplier - solar_bill_tier2_summer_multiplier);
            }

            //================ Date range for tier 3 normal bill and solar bill
            //Total KWH per year
            var totalKWH_number = numberOfSolarBlocks * 12 * 200;

            //Miles not driven = total KWH * miles not driven multiplier
            var milesNotDriven_number = Math.floor(totalKWH_number * milesNotDriven_multiplier);

            //Trees Planted = total KWH * trees planted multiplier
            var treesPlanted_number = Math.floor(totalKWH_number * treesPlanted_multiplier);

            //Tons of CO2 Saved
            var carbonFootprintReduced_number = totalKWH_number * poundsKWH;
            var co2Saved_number = Math.floor(carbonFootprintReduced_number / 2000);


            //SOLAR CALCULATOR FUNCTIONS (WITHOUT EXCESS BANK) GO HERE
            //========== Compare your energy usage
            //Without solar and with solar in winter months
            var withoutSolar_winter_monthly_bill = Math.floor((withoutSolar_normalBill_tier1_multiplier * withoutSolar_tier1_winter_multiplier ) + (withoutSolar_normalBill_tier2_winter_multiplier * withoutSolar_tier2_winter_multiplier));
            var withSolar_winter_monthly_bill = Math.floor((solar_kwh_total * solar_tier1_multiplier ) + (solar_bill_tier1_multiplier * withoutSolar_tier1_winter_multiplier ) + (solar_bill_tier2_multiplier * withoutSolar_tier2_winter_multiplier));

            //Without solar summer bill and solar summer bill
            var withoutSolar_summer_monthly_bill = Math.floor((withoutSolar_normalBill_tier1_multiplier * withoutSolar_tier1_summer_multiplier) + (withoutSolar_normalBill_tier2_summer_multiplier * withoutSolar_tier2_summer_multiplier) + (withoutSolar_tier3_summer_multiplier * withoutSolar_normalBill_tier3_summer_multiplier));
            var withSolar_summer_monthly_bill = Math.floor((solar_kwh_total * solar_tier1_multiplier ) + (solar_bill_tier1_multiplier * withoutSolar_tier1_winter_multiplier ) + (solar_bill_tier2_summer_multiplier * withoutSolar_tier2_summer_multiplier) + (solar_bill_tier3_summer_multiplier * withoutSolar_tier3_summer_multiplier));


            //Monthly Bill Adjustments
            var monthlyBillAdjustment_amount;
            var summerMonths = ['May', 'June', 'July', 'August', 'September'];

            if ($.inArray(curDate, summerMonths) != -1){
                monthlyBillAdjustment_amount = Math.floor(withSolar_summer_monthly_bill - withoutSolar_summer_monthly_bill);
            }
            else {
                monthlyBillAdjustment_amount = Math.floor(withSolar_winter_monthly_bill - withoutSolar_winter_monthly_bill);
            }

            monthlyBillAdjustment_all.push(monthlyBillAdjustment_amount);

            var monthlyBill_avg_adjustment =  Math.floor(monthlyBillAdjustment_all.reduce(function(sum, a) { return sum + a },0)/(monthlyBillAdjustment_all.length||1));

            // Set value to selectors
            $.setCookie('monthlyBillAdjustmentNumber', monthlyBill_avg_adjustment, 1);
            monthlyBill_selector.val('$' + monthlyBill_avg_adjustment);
            milesNotDriven_selector.val(milesNotDriven_number);
            treesPlanted_selector.val(treesPlanted_number);
            co2Saved_selector.val(co2Saved_number);

            if ($.inArray(curDate, summerMonths) != -1) {

                return {
                    curDate: curDate,
                    kwhUsage: kwhUsed_monthly,
                    withSolar: '$' + withSolar_summer_monthly_bill,
                    withoutSolar: '$' + withoutSolar_summer_monthly_bill
                }

            } else {

                return {
                    curDate: curDate,
                    kwhUsage: kwhUsed_monthly,
                    withSolar: '$' + withSolar_winter_monthly_bill,
                    withoutSolar: '$' + withoutSolar_winter_monthly_bill
                }

            }
        },

        //Functions for calculating excess solar and adding to the solar bank. Not used until phase 2.
        solarBankCalculate: function(kwhUsed_monthly, curDate, numberOfSolarBlocks) {

            var monthlyBill_selector = $('#monthlyBill');
            var milesNotDriven_selector = $('#milesNotDriven');
            var treesPlanted_selector = $('#treesPlanted');
            var co2Saved_selector = $('#co2Saved');

            //Calculator Plugin
            //Set const number multipliers
            var co2_multiplier = 0.883309496421;
            var milesNotDriven_multiplier = 0.953232046;
            var carsOffRoad_multiplier = 0.0000845;
            var treesPlanted_multiplier = 0.010383732;
            var poundsKWH = 0.88;

            //Without solar normal bill
            var withoutSolar_tier1_winter_multiplier = 0.088498;
            var withoutSolar_tier2_winter_multiplier = 0.107072;

            var withoutSolar_tier1_summer_multiplier = 0.088498;
            var withoutSolar_tier2_summer_multiplier = 0.115429;
            var withoutSolar_tier3_summer_multiplier = 0.14451;

            var withoutSolar_normalBill_tier1_multiplier = 400;
            var withoutSolar_normalBill_tier2_summer_multiplier = 600;
            var withoutSolar_normalBill_tier3_summer_multiplier;

            var solar_bill_tier1_multiplier;
            var solar_bill_tier2_multiplier;
            var solar_bill_tier3_multiplier;
            var solar_bill_tier2_summer_multiplier;
            var solar_bill_tier3_summer_multiplier;

            kwhAll.push(kwhUsed_monthly);

            //Calculate Tier 1 for normal Bill
            if (kwhUsed_monthly > 400) {
                withoutSolar_normalBill_tier1_multiplier = 400;
            }
            else {
                //Tier 1 multipler < 400 kwh
                withoutSolar_normalBill_tier1_multiplier = kwhUsed_monthly;
            }

            //Calculate Tier 2 normal bill multiplier for winter months
            var withoutSolar_normalBill_tier2_winter_multiplier = kwhUsed_monthly - withoutSolar_normalBill_tier1_multiplier;

            //Summer calculate normal bill tier2 and tier3
            if (kwhUsed_monthly < 1000) {
                withoutSolar_normalBill_tier2_summer_multiplier = kwhUsed_monthly - withoutSolar_normalBill_tier1_multiplier;
                withoutSolar_normalBill_tier3_summer_multiplier = 0;
            } else {
                withoutSolar_normalBill_tier3_summer_multiplier = kwhUsed_monthly - withoutSolar_normalBill_tier1_multiplier - withoutSolar_normalBill_tier2_summer_multiplier;
            }

            //============ With Solar
            //Initial Incremental
            var solar_kwh_multiplier = 200;
            var solar_tier1_multiplier = 0.11703;
            var solar_tier2_multiplier = 0.11703;
            var solar_tier3_multiplier = 0.11703;

            //Change Solar Multiplier per block change, column J28:J39
            var solar_kwh_total = solar_kwh_multiplier * numberOfSolarBlocks;

            var usageAvailForBank = 0;
            var excessSolarPurchased = 0;

            if (solar_kwh_total > kwhUsed_monthly) {
                excessSolarPurchased = solar_kwh_total - kwhUsed_monthly;
            } else {
                excessSolarPurchased = 0;
            }

            excessSolar.push(excessSolarPurchased);

            $.each(excessSolar,function(index, value) {
                if(index == 0) {
                    bankBalance_all[0] = value * 1;
                } else if (index >= 1) {
                    if (value > 0) {
                        if (bankBalance_all[index] > usageAvailForBank) {
                            bankBalance_all[index] = bankBalance_all[index-1] + value;
                        }
                         else {
                            bankBalance_all[index] = bankBalance_all[index-1] + value;
                        }

                    } else {
                        bankBalance_all[index] = 0;
                    }
                }
            });

            usageAvailForBank =  kwhUsed_monthly - solar_kwh_total;
            if (usageAvailForBank < 0) usageAvailForBank = 0;
            usageAvail_all.push(usageAvailForBank);

            var summerMonths = ['May', 'June', 'July', 'August', 'September'];
            // 0 = January, etc
            var summerMonthsNumeric  = [4, 5, 6, 7, 8];

            $.each(usageAvail_all,function(index, value) {
                if(index == 0) {
                    bankedEnergy_all[0] = 0;
                    adjustedBankRead[index] = kwhAll[index] - bankApplied_all[index];
                } else if (index >= 1 ) {
                    if (bankedEnergy_all[index] > usageAvail_all[index]) {
                        bankedEnergy_all[index] = bankedEnergy_all[index-1] + excessSolar[index] - bankApplied_all[index-1];
                        if (bankedEnergy_all[index] > usageAvail_all[index]) {
                            bankApplied_all[index] = usageAvail_all[index];
                        } else {
                            bankApplied_all[index] = bankedEnergy_all[index];
                        }
                        adjustedBankRead[index] = kwhAll[index] - bankApplied_all[index];
                    } else {
                        bankedEnergy_all[index] = bankedEnergy_all[index-1] + excessSolar[index] - bankApplied_all[index-1];
                        bankApplied_all[index] = bankedEnergy_all[index];
                        adjustedBankRead[index] = kwhAll[index] - bankApplied_all[index];
                    }
                }
                if (adjustedBankRead[index] - solar_kwh_total > 400) {
                    solar_bill_tier1_multiplier = 400;
                } else {
                    solar_bill_tier1_multiplier = adjustedBankRead[index] - solar_kwh_total + excessSolar[index];
                }

                if ($.inArray(index, summerMonthsNumeric) != -1) {
                    if (solar_bill_tier1_multiplier < 0){
                        solar_bill_tier1_multiplier = 0;
                        solar_bill_tier2_multiplier = 0;
                    }
                    else if ((adjustedBankRead[index] - solar_kwh_total - solar_bill_tier1_multiplier) > 600) {
                        solar_bill_tier2_multiplier = 600;
                    } else {
                        solar_bill_tier2_multiplier = adjustedBankRead[index] - solar_kwh_total - solar_bill_tier1_multiplier + excessSolar[index];
                    }
                } else {
                    if (solar_bill_tier1_multiplier <= 0) {
                        solar_bill_tier1_multiplier = 0;
                        solar_bill_tier2_multiplier = 0;
                    } else {
                        solar_bill_tier2_multiplier = adjustedBankRead[index] - solar_bill_tier1_multiplier - solar_kwh_total ;
                    }
                }

                if ($.inArray(index, summerMonthsNumeric) != -1) {
                    if (solar_bill_tier2_multiplier  == 0) {
                        solar_bill_tier3_multiplier = 0;
                    } else {
                        solar_bill_tier3_multiplier = adjustedBankRead[index] - solar_kwh_total - solar_bill_tier1_multiplier - solar_bill_tier2_multiplier + excessSolar[index];
                    }
                } else {
                    solar_bill_tier3_multiplier = 0;
                }
            });

            //================ Date range for tier 3 normal bill and solar bill
            //Total KWH per year
            var totalKWH_number = numberOfSolarBlocks * 12 * 200;

            //Miles not driven = total KWH * miles not driven multiplier
            var milesNotDriven_number = Math.floor(totalKWH_number * milesNotDriven_multiplier);

            //Trees Planted = total KWH * trees planted multiplier
            var treesPlanted_number = Math.floor(totalKWH_number * treesPlanted_multiplier);

            //Tons of CO2 Saved
            var carbonFootprintReduced_number = totalKWH_number * poundsKWH;
            var co2Saved_number = Math.floor(carbonFootprintReduced_number / 2000);

            //var withoutSolar_tier1_winter_multiplier = 0.088498;
            //var withoutSolar_tier2_winter_multiplier = 0.107072;
            var tier1_summer_multiplier = 0.088498;
            var tier2_summer_multiplier = 0.115429;
            var tier3_summer_multiplier = 0.14451;

            //SOLAR CALCULATOR FUNCTIONS (WITHOUT EXCESS BANK) GO HERE
            //========== Compare your energy usage
            //Without solar and with solar in winter months
            var withoutSolar_winter_monthly_bill = Math.floor((withoutSolar_normalBill_tier1_multiplier * withoutSolar_tier1_winter_multiplier ) + (withoutSolar_normalBill_tier2_winter_multiplier * withoutSolar_tier2_winter_multiplier));
            var withSolar_winter_monthly_bill = Math.floor((solar_kwh_total * solar_tier1_multiplier ) + (solar_bill_tier1_multiplier * withoutSolar_tier1_winter_multiplier ) + (solar_bill_tier2_multiplier * withoutSolar_tier2_winter_multiplier));

            var withoutSolar_summer_monthly_bill = Math.floor((withoutSolar_normalBill_tier1_multiplier * withoutSolar_tier1_summer_multiplier) + (withoutSolar_normalBill_tier2_summer_multiplier * withoutSolar_tier2_summer_multiplier) + (withoutSolar_tier3_summer_multiplier * withoutSolar_normalBill_tier3_summer_multiplier));
            var withSolar_summer_monthly_bill = Math.floor((solar_kwh_total * solar_tier1_multiplier ) + (solar_bill_tier1_multiplier * tier1_summer_multiplier ) + (solar_bill_tier2_multiplier * tier2_summer_multiplier) + (solar_bill_tier3_multiplier * tier3_summer_multiplier));

            //Monthly Bill Adjustments
            var monthlyBillAdjustment_amount;
            //monthlyBillAdjustment_amount = Math.floor(withSolar_summer_monthly_bill - withoutSolar_summer_monthly_bill);

            if ($.inArray(curDate, summerMonths) != -1){
                monthlyBillAdjustment_amount = Math.floor(withSolar_summer_monthly_bill - withoutSolar_summer_monthly_bill);
            }
            else {
                monthlyBillAdjustment_amount = Math.floor(withSolar_winter_monthly_bill - withoutSolar_winter_monthly_bill);
            }

            monthlyBillAdjustment_all.push(monthlyBillAdjustment_amount);

            var monthlyBill_avg_adjustment =  Math.floor(monthlyBillAdjustment_all.reduce(function(sum, a) { return sum + a },0)/(monthlyBillAdjustment_all.length||1));

            // Set value to selectors
            $.setCookie('monthlyBillAdjustmentNumber', monthlyBill_avg_adjustment, 1);
            monthlyBill_selector.val('$' + monthlyBill_avg_adjustment);
            milesNotDriven_selector.val(milesNotDriven_number);
            treesPlanted_selector.val(treesPlanted_number);
            co2Saved_selector.val(co2Saved_number);

            if ($.inArray(curDate, summerMonths) != -1) {

                return {
                    curDate: curDate,
                    kwhUsage: kwhUsed_monthly,
                    withSolar: '$' + withSolar_summer_monthly_bill,
                    withoutSolar: '$' + withoutSolar_summer_monthly_bill,
                    monthlyDifference: monthlyBillAdjustment_amount,
                    blankBlueTitle: ' '
                }

            } else {

                return {
                    curDate: curDate,
                    kwhUsage: kwhUsed_monthly,
                    withSolar: '$' + withSolar_winter_monthly_bill,
                    withoutSolar: '$' + withoutSolar_winter_monthly_bill,
                    monthlyDifference: monthlyBillAdjustment_amount,
                    blankBlueTitle: ' '
                }
            }
        },

        batchSlideCalculate: function(usage_data, solarBlocks_number) {
            // setup a variable to test with to easily switch between using sliderCalculator and the banked solution calc
            var sliderOrBank = "bank";
            var processed_data = [];
            monthlyBillAdjustment_all = [];
            excessSolar = [];
            usageAvail_all = [];
            bankTotal = 0;

            $.each(usage_data, function(index, value) {

                if (sliderOrBank == "slider") {
                    var use_calc = $.sliderCalculate(usage_data[index]['kwh_usage'], usage_data[index]['accounting_period'], solarBlocks_number);
                } else {
                    var use_calc = $.solarBankCalculate(usage_data[index]['kwh_usage'], usage_data[index]['accounting_period'], solarBlocks_number);
                }

                var currentDate = new Date();
                var processed =
                { id: Date.parse(currentDate),
                    data:
                    {
                        accounting_period:     use_calc['curDate'],
                        kwh_usage:     use_calc['kwhUsage'],
                        without_solar: use_calc['withoutSolar'],
                        with_solar:  use_calc['withSolar'],
                        monthlyDifference: use_calc['monthlyDifference'],
                        blankBlueTitle: ' '
                    }

                };
                processed_data.push(processed);
            });
            // by changing the data from just monthly to a total included (Annually line) we need to push the total onto the processed_data after we total them
            var newTable = '';
            var all_usage = 0;
            var all_solar = 0;
            var all_without_solar = 0;
            var all_monthly = 0;
            $.each(processed_data, function(pIndex, p){
                all_usage += parseInt(p.data.kwh_usage, 10);
                // remove the '$' for calculating totals from monthly data
                all_without_solar =  all_without_solar + parseInt(p.data.without_solar.replace('$',''), 10);
                all_solar += parseInt(p.data.with_solar.replace('$',''), 10);
                all_monthly += p.data.monthlyDifference;
            });

            var currentDate = new Date();

            var processed =
            { id: Date.parse(currentDate),
                data:
                {
                    accounting_period: '',
                    kwh_usage:     '',
                    without_solar: '',
                    with_solar:  '',
                    monthlyDifference: '',
                    blankBlueTitle: ''
                }

            };

            processed.data.accounting_period = "Annually";
            processed.data.kwh_usage = all_usage;
            processed.data.without_solar = all_without_solar;
            processed.data.with_solar = all_solar;
            processed.data.monthlyDifference = all_monthly;
            processed.data.blankBlueTitle = ' ';

            processed_data.push(processed);

            return processed_data;

        },

        incentiveCalculator: function(solarBlocks_number){
            var milesNotDriven_selector = $('#milesNotDriven');
            var treesPlanted_selector = $('#treesPlanted');
            var co2Saved_selector = $('#co2Saved');


            //Set const number multipliers
            var co2_multiplier = 0.883309496421;
            var milesNotDriven_multiplier = 0.953232046;
            var carsOffRoad_multiplier = 0.0000845;
            var treesPlanted_multiplier = 0.010383732;
            var poundsKWH = 0.88;

            //Total KWH per year
            var totalKWH_number = solarBlocks_number * 12 * 200;

            //Miles not driven = total KWH * miles not driven multiplier
            var milesNotDriven_number = Math.round(totalKWH_number * milesNotDriven_multiplier);

            //Trees Planted = total KWH * trees planted multiplier
            var treesPlanted_number = Math.round(totalKWH_number * treesPlanted_multiplier);

            //Tons of CO2 Saved
            var carbonFootprintReduced_number = totalKWH_number * poundsKWH;
            var co2Saved_number = Math.round(carbonFootprintReduced_number / 2000);

            // Set value to selectors
            milesNotDriven_selector.val(milesNotDriven_number);
            treesPlanted_selector.val(treesPlanted_number);
            co2Saved_selector.val(co2Saved_number);

            return true;

        },

        //Plug in seasonal calculator javascript here
        seasonalCalculator: function(usage_data, solarBlocks_number) {
            var sliderOrBank = "bank";
            var processed_data = [];
            monthlyBillAdjustment_all = [];
            excessSolar = [];
            usageAvail_all = [];
            bankTotal = 0;


            $.each(usage_data, function(index, value) {
                if (sliderOrBank == "slider") {
                    var use_calc = $.sliderCalculate(usage_data[index]['kwh_usage'], usage_data[index]['accounting_period'], solarBlocks_number);
                } else {
                    var use_calc = $.solarBankCalculate(usage_data[index]['kwh_usage'], usage_data[index]['accounting_period'], solarBlocks_number);
                }

                var summerMonths = ['May', 'June', 'July', 'August', 'September'];
                var season;

                if(use_calc['curDate'] == 'May'){
                    season = 'summer';
                } else if(use_calc['curDate'] == 'October'){
                    season = 'winter';
                }

                var currentDate = new Date();
                var processed =
                { id: Date.parse(currentDate),
                    data:
                    {
                        accounting_period:     season,
                        kwh_usage:     use_calc['kwhUsage'],
                        without_solar: use_calc['withoutSolar'],
                        with_solar:  use_calc['withSolar']
                    }

                };
                processed_data.push(processed);

            });

            return processed_data;

        }

    });

}(jQuery));
