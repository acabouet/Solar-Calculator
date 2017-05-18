/**
 * @file
 * Javascript for the subsolar seasonal calculator.
 */

(function ($, Drupal) {

    "use strict";


    Drupal.behaviors.seasonalProgressBar = {
        attach: function (context, settings) {

            //Adds a helper class to the current step on the res subsolar_form progress bar.
            var steps = [1, 2];
            $.each(steps, function(index, value) {
                if($("#edit-step-" + value).length == 1) {
                    $(".progress-counter ." + value).addClass('current-step');
                }
            });
        }
    };

    //Processing for the seasonal calculator
    Drupal.behaviors.seasonalCalculator = {
        attach: function(context, settings) {
            $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
                options.async = true;
            });


            // console.info(
            //     '\n::::::::::::::::::::::::::::::::::  seasonalCalculator test :::::::::::::::::::::::::::::::::',
            //     '\n::this::', this,
            //     '\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::'
            // );
            var slider_selector = $('.block-slider');
            var solarBlocks_number = slider_selector.val();
            var process_dataField = $('.processed-billing-data');
            var reservedBlocks_number = $('#slideBlocks');
            var reservedBlocks_number2 = $('.slideBlocks');
            var reservedBlocks_text = $('.slideBlocksText');
            var usage_table = $('.usage-table tbody');

            //Get usage data from subsolar_form module
            if (typeof Drupal.settings.usage_data !== "undefined") {
                var usage_data = Drupal.settings.usage_data;
                var processedDataJSON;

                //Update block slider with recommended block value from module
                if (typeof Drupal.settings.recommended_seasonal_blocks !== "undefined"){
                    slider_selector.once('recommended_seasonal_blocks', function(){
                        slider_selector.val(Drupal.settings.recommended_seasonal_blocks);
                        solarBlocks_number = Drupal.settings.recommended_seasonal_blocks;
                    });
                }

                //batchSlideCalculate function (from jquery.slidercalculate.js) let's you pass in an array of usage date and accounting period info
                var processed_data = $.seasonalCalculator(usage_data, solarBlocks_number);

                if($("#subsolar_seasonal_form").length == 1) {
                    //Sort the data (in JSON format) by date
                    processed_data.sort(function(a, b) {
                        return a.id - b.id;
                    });

                    //Now replace the existing usage table body content with all new stuff yay. This will keep updating the usage table as the the block slider is used
                    var newTable = '';

                    $.each(processed_data, function(pIndex, p){
                        newTable += "<tr id='" + p.id + "'><td>"+ p.data.accounting_period +"</td><td> "+ p.data.kwh_usage +"</td><td>"+ p.data.without_solar +"</td><td>"+ p.data.with_solar +"</td></tr>";
                    });

                    usage_table.html(newTable);

                }


                //update the reserved block field and save this data to use in the subsolar form module
                reservedBlocks_text.html(solarBlocks_number);
                reservedBlocks_number.val(solarBlocks_number);
                reservedBlocks_number2.val(solarBlocks_number);
                processedDataJSON = JSON.stringify(processed_data);
                process_dataField.attr("value", processedDataJSON);



            }
        }
    };

    //This function runs when the block slider value changes on the seasonal calculator
    Drupal.ajax.prototype.commands.batchSeasonalSlideCalculator = function(ajax, response, status) {

        var solarBlocks = parseInt(response.solarBlocks_number);
        var slider_selector = $('.block-slider');
        var usage_data = response.usage_data;
        var usage_table = $('.usage-table tbody');

        //Update the block slider if it hasn't been updated already
        slider_selector.val(solarBlocks);

        //this is where we get the new data (updated withSolar prices) based on # of blocks selected in slider
        var processed_data = $.seasonalCalculator(usage_data, solarBlocks);

        //Sort the new data (in JSON format) by date
        processed_data.sort(function(a, b) {
            return a.id - b.id;
        });

        //Now replace the existing usage table body content with the updated, sorted data. This will keep updating the usage table as the the block slider is used
        var newTable = '';

        $.each(processed_data, function(pIndex, p){
            newTable += "<tr id='" + p.id + "'><td>"+ p.data.accounting_period +"</td><td> "+ p.data.kwh_usage +"</td><td>"+ p.data.without_solar +"</td><td>"+ p.data.with_solar +"</td></tr>";
        });

        usage_table.html(newTable);

        Drupal.attachBehaviors(slider_selector);
        Drupal.attachBehaviors(usage_table);

    };

})(jQuery, Drupal);
