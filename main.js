// all should go in document.ready 
$(document).ready(function() {
    $('#dropdown-menu-sections a').click(function(){

        // sometimes the index starts from 1
        var index = $(this).index() + 1;

        // store this in the dropdwon diwn
        $("#dropdown-menu-sections").data("selectedItem", index);
        $("#navbarDropdownMenuLink-sections").text($(this).text());
        $("#navbarDropdownMenuLink-countries").text("Summary");

        var converter = new showdown.Converter();

        $.ajax({
            url: "content/" + index + ".md",
            dataType: "text",
            success: function (data) {
                htmlData = converter.makeHtml(data);
                $("#summary_container").html(htmlData);
            }
        });

    });

    $('#dropdown-menu-countries a').click(function(){
        var countryCode = $(this).data("code")
        selectCountry(countryCode);
    });
});

function selectCountry(countryCode) {
    var selectedSection = $("#dropdown-menu-sections").data("selectedItem");
    if (selectedSection == undefined) {
        alert('Please select a section first!');
        return;
    }

    var converter = new showdown.Converter();

    var url = "content/" + selectedSection;
    if (countryCode == "sum") {
        url = url + ".md";
    }
    else {
        url = url + "_" + countryCode + ".md";
    }

    var htmlData = "";
    $.ajax({
        url: url,
        dataType: "text",
        success: function (data) {
            htmlData = converter.makeHtml(data);
            $("#summary_container").html(htmlData);
        }
    });

    // update the dropdown
    var countryText = $('.dropdown-item[data-code=' + countryCode + ']').text();
    $("#navbarDropdownMenuLink-countries").text(countryText);

    var newCountryData = {};

    // create new color data based on selection
    for (const [key, value] of Object.entries(countryData)) {
        newCountryData[key] = {};
        newCountryData[key]['code'] = value.code;
        newCountryData[key]['fillKey'] = (countryCode == 'sum') ? value.fillKey : (value.code == countryCode) ? value.fillKey : value.fillKey + '_notselected';
    }
    map.updateChoropleth(newCountryData, { duration : 0 });

}

var countryData = {
    MEX: { fillKey: "mexico", code: "mex" },
    JPN: { fillKey: "japan", code: "jpn" },
    GBR: { fillKey: "uk", code: "gbr" },
    CHN: { fillKey: "china", code: "chn" }
};
var EUCountries = [ 'AUT', 'BEL', 'BGR', 'HRV', 'CYP','CZE','DNK', 'DEU', 'EST', 'FIN', 'FRA',   'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE']; 
EUCountries.forEach(item => {
    countryData[item] = { fillKey: "eu", code: "eu" };
});



var opacity = 0.3;
var map = new Datamap({
    element: document.getElementById('world_map_container'),
    projection: 'mercator',
    responsive: true,
    done: function(datamap) {
        datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
            // TODO: we might receive the event for a country we do not know about
            selectCountry(countryData[geography.id].code);
        });

        // https://stackoverflow.com/questions/36326683/d3-js-how-can-i-set-the-cursor-to-hand-when-mouseover-these-elements-on-svg-co
        datamap.svg.selectAll('.datamaps-subunit').on('mouseover', function(geography) {
            var countryList = Object.keys(countryData); //TODO: do we have to do this every time?!
            if (countryList.includes(geography.id)) {
                d3.select(this).style("cursor", "pointer");
            }
        });

        datamap.svg.selectAll('.datamaps-subunit').on('mouseout', function(geography) {
            d3.select(this).style("cursor", "default");
        });
    },
    fills: {
        defaultFill: '#C8C8C8',
        eu: '#1C5AD7',
        eu_notselected: 'rgba(28, 91, 217, ' + opacity + ')',
        mexico: '#006341',
        mexico_notselected: 'rgba(0, 97, 63, ' + opacity + ')',
        china: '#FFB200',
        china_notselected: 'rgba(255, 178, 0, ' + opacity + ')',
        japan: '#BE0029',
        japan_notselected: 'rgba(190, 0, 41, ' + opacity + ')',
        uk: '#C8102E',
        uk_notselected: 'rgba(200, 16, 46, ' + opacity + ')',
    },
    data: JSON.parse(JSON.stringify(countryData)), //updateChorapleth function updates the variable.. so a deep copy was in order
    geographyConfig: {
        highlightOnHover: false,
        popupOnHover: false
    }
});

// Reise the map when the window resizes
$(window).on('resize', function() {
   map.resize();
});
