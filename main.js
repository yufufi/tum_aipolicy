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

        var selectedSection = $("#dropdown-menu-sections").data("selectedItem");
        if (selectedSection == undefined) {
            alert('Please select a section first!');
            return;
        }

        $("#navbarDropdownMenuLink-countries").text($(this).text());

        var converter = new showdown.Converter();
        var countryCode = $(this).data("code")

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
    });
});

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
var map = new Datamap({
    element: document.getElementById('world_map_container'),
    projection: 'mercator',
    responsive: true,
    fills: {
        defaultFill: '#C8C8C8',
        eu: '#1C5AD7',
        mexico: '#006341',
        china: '#FFB200',
        japan: '#BE0029',
        uk: '#C8102E'
    },
    data: countryData,
    geographyConfig: {
        highlightOnHover: false,
        popupOnHover: false
    }
});

// Reise the map when the window resizes
$(window).on('resize', function() {
   map.resize();
});


