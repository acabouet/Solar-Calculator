/**
 * @file
 * Javascript for the subsolar residential sign up form.
 */

(function ($, Drupal) {

    "use strict";

    Drupal.behaviors.accountFieldMask = {
        attach: function (context, settings) {

            //Create a custom mask type for the account number and phone number fields using the Jquery Mask Input library
            $('#edit-step-4-phone-number').mask('(999) 999-9999');
            $('#edit-step-4-alt-phone-number').mask('(999) 999-9999');
            $('#res-account-number').mask('99999999-999 9');

        }
    };

    Drupal.behaviors.progressBar = {
        attach: function (context, settings) {

            //Adds a helper class to the current step on the res subsolar_form progress bar.
            var steps = [1, 2, 3, 4, 5];
            $.each(steps, function(index, value) {
                if($("#edit-step-" + value).length == 1 || $("#edit-step-" + value + "--" + value).length == 1) {
                    $(".progress-counter ." + value).addClass('current-step');
                }
            });
        }
    };

    // Drupal.behaviors.scrolltotop = {
    //     attach: function(context, settings) {
    //         $('html, body').animate({
    //             scrollTop: $("#subsolar_form").offset().top
    //         }, 800);
    //     }
    // };

    Drupal.behaviors.solarCalculator = {
        attach: function(context, settings) {
            $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
                options.async = true;
            });

            var slider_selector = $('.block-slider');
            var solarBlocks_number = slider_selector.val();
            var reservedBlocks_number = $('#slideBlocks');
            var reservedBlocks_number2 = $('.slideBlocks');
            var reservedBlocks_text = $('.slideBlocksText');
            var monthlyBill_selector = $('#monthlyBill');

            //Update block slider with recommended block value from module
            if (typeof Drupal.settings.recommended_blocks !== "undefined"){
                slider_selector.once('recommended_blocks', function(){
                    slider_selector.val(Drupal.settings.recommended_blocks);
                    //solarBlocks_number = Drupal.settings.recommended_blocks;
                });
            }

            //update the reserved block field
            reservedBlocks_number.val(solarBlocks_number);
            reservedBlocks_number2.val(solarBlocks_number);
            reservedBlocks_text.html(solarBlocks_number);
            if ($.getCookie('monthlyBillAdjustmentNumber') < 0) {
                var monthlyBillAbsolute = Math.abs($.getCookie('monthlyBillAdjustmentNumber'));
                monthlyBill_selector.val('-$' + monthlyBillAbsolute);
            } else{
                monthlyBill_selector.val('$' + $.getCookie('monthlyBillAdjustmentNumber'));
            }

            //update incentive elements (trees saved, miles saved, etc)
            $.incentiveCalculator(solarBlocks_number);
        }
    };


    //This function runs when a service address is selected on /subsolar-form step 2
    Drupal.ajax.prototype.commands.calculateOnAddressSelect = function(ajax, response, status){

        // helper function to format with commas
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        var slider_selector = $('.block-slider');
        var process_dataField = $('.processed-billing-data');
        var reservedBlocks_number = $('#slideBlocks');
        var reservedBlocks_number2 = $('.slideBlocks');
        var reservedBlocks_text = $('.slideBlocksText');
        var recommendedBlocks = parseInt(response.recommended_blocks);
        var usage_data = response.usage_data;

        //Update the block slider if it hasn't been updated already
        slider_selector.val(recommendedBlocks);

        //batchSlideCalculate function (from jquery.slidercalculate.js) let's you pass in an array of usage date and accounting period info
        var processed_data = $.batchSlideCalculate(usage_data, recommendedBlocks);

        $.each(processed_data, function(pIndex, p) {
            if (p.data.monthlyDifference < 1) {
                var save_data = Math.abs(p.data.monthlyDifference);
                processed_data[pIndex]['data']['monthlyDifference'] = "<span style='color:blue'>" + "-$" + save_data + "</span>";
                processed_data[pIndex]['data']['blankBlueTitle'] = "<img src='/sites/default/files/icons/checkmark.png'>";
            } else {
                var save_data = Math.abs(p.data.monthlyDifference);
                processed_data[pIndex]['data']['monthlyDifference'] = "$" + save_data;
            }
        });
        var unformatted_kWh = processed_data[12]['data']['kwh_usage'];
        var unformatted_without_solar = processed_data[12]['data']['without_solar'];
        var unformatted_with_solar = processed_data[12]['data']['with_solar'];

        processed_data[12]['data']['accounting_period'] = "<b><span style='color:blue'>Annually</span></b>";
        processed_data[12]['data']['kwh_usage'] = "<b><span style='color:blue'>" + numberWithCommas(unformatted_kWh) +  "</span></b>";
        processed_data[12]['data']['without_solar'] = "<b><span style='color:blue'>" + "$" + numberWithCommas(unformatted_without_solar) + "</span></b>";
        processed_data[12]['data']['with_solar'] = "<b><span style='color:blue'>" + "$" +  numberWithCommas(unformatted_with_solar) +  "</span></b>";

        //update the reserved block field
        reservedBlocks_number.val(recommendedBlocks);
        reservedBlocks_number2.val(recommendedBlocks);
        reservedBlocks_text.html(recommendedBlocks);

        //Save the process data to use later
        var processedDataJSON = JSON.stringify(processed_data);
        process_dataField.val(processedDataJSON);

        Drupal.attachBehaviors(process_dataField);

    }


    //This function runs when the block slider value changes
    Drupal.ajax.prototype.commands.batchSlideCalculator = function(ajax, response, status) {

        // helper function to format with commas
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        var solarBlocks = parseInt(response.solarBlocks_number);
        var slider_selector = $('.block-slider');
        var usage_data = response.usage_data;
        var usage_table = $('.usage-table tbody');

        //Update the block slider if it hasn't been updated already
        slider_selector.val(solarBlocks);

        //batchSlideCalculate function let's you pass in an array of usage date and accounting period info
        var processed_data = $.batchSlideCalculate(usage_data, solarBlocks);
        //here we modify the last line to get the dollar, comma, and blue formatting correct, it will fail without 12 months of data.
        var unformatted_kWh = processed_data[12]['data']['kwh_usage'];
        var unformatted_without_solar = processed_data[12]['data']['without_solar'];
        var unformatted_with_solar = processed_data[12]['data']['with_solar'];
        processed_data[12]['data']['accounting_period'] = "<b><span style='color:blue'>Annually</span></b>";
        processed_data[12]['data']['kwh_usage'] = "<b><span style='color:blue'>" + numberWithCommas(unformatted_kWh) +  "</span></b>";
        processed_data[12]['data']['without_solar'] = "<b><span style='color:blue'>" + "$" + numberWithCommas(unformatted_without_solar) + "</span></b>";
        processed_data[12]['data']['with_solar'] = "<b><span style='color:blue'>" + "$" +  numberWithCommas(unformatted_with_solar) +  "</span></b>";

        //Now replace the existing usage table body content with all new stuff yay. This will keep updating the usage table as the the block slider is used
        //We add the all_ variables to perform our monthly totals calculations
        var newTable = '';
        var all_usage = 0;
        var all_solar = 0;
        var all_without_solar = 0;
        var all_monthly = 0;
        $.each(processed_data, function(pIndex, p){
            all_usage += parseInt(p.data.kwh_usage, 10);
            // remove the '$' for calculating totals from monthly data
            all_without_solar =  all_without_solar + parseInt(p.data.without_solar, 10);
            all_solar += parseInt(p.data.with_solar, 10);
            all_monthly += p.data.monthlyDifference;
            if (p.data.monthlyDifference < 0)  {
                newTable += "<tr id='" + p.id + "'><td>"+ p.data.accounting_period +"</td><td> "+ p.data.kwh_usage +"</td><td>"+ p.data.without_solar +"</td><td>"+ p.data.with_solar +"</td><td>"+ p.data.monthlyDifference +"</td><td><img src='/sites/default/files/icons/checkmark.png'></td></td></tr>";
            } else {
                newTable += "<tr id='" + p.id + "'><td>"+ p.data.accounting_period +"</td><td> "+ p.data.kwh_usage +"</td><td>"+ p.data.without_solar +"</td><td>"+ p.data.with_solar +"</td><td>"+ "$"+  p.data.monthlyDifference +"</td><td> </td></td></tr>";
            }
        });

        // change savings numbers (negative) to a formatted blue number
        var repex = newTable.replace(/<td>-(\d+)/g, '<td style="color:blue"><b>-\$ $1 </b>');
        var nextex = repex.replace(/\$\s/g, '$' );

        $('.usage-table tbody');

        console.log("table dump:" + usage_table);
        usage_table.html(nextex);

        //Run function on slider event change
        $('#slideBlocks').on('input', function () {
            slideBlocks_selector.val($(this).val());
        });

        // Slider '+/-' increments on slider
        var slider_selector = $('.block-slider');
        var slideBlocks = $('#slideBlocks');

        $('.sliderPlus').bind('click',function(){
            var currentValue = parseInt(slider_selector.val());
            if (!isNaN(currentValue) && currentValue < slider_selector.attr('max')) {
                slider_selector.val(currentValue + 1);
                slideBlocks.val(currentValue + 1);
            }
        });
        $('.sliderMinus').bind('click',function(){
            var currentValue = parseInt(slider_selector.val());
            if (!isNaN(currentValue) && currentValue > slider_selector.attr('min')) {
                slider_selector.val(currentValue - 1);
                slideBlocks.val(currentValue - 1);
            }
        });

        Drupal.attachBehaviors(slider_selector);
        Drupal.attachBehaviors(usage_table);

    };


})(jQuery, Drupal);
