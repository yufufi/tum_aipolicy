$(document).ready(function() {
    $('#dropdown-menu-sections a').click(function(){

        // sometimes indexes start from 1
        var index = $(this).index() + 1;
        selectSection(index);
    });

    $('#dropdown-menu-countries a').click(function(){
        var countryCode = $(this).data("code")
        selectCountry(countryCode);
    });

    $('#home-link').click(function(){
        selectSection(0);
    });

    $('#brand-link').click(function(){
        selectSection(0);
    });

    $('#homebutton a').click(function() {
        selectSection($("#dropdown-menu-sections").data("selectedItem"));
        $('#homebutton').addClass('disabled');
    });

    $('#nextbutton a').click(function(){
        var nextOne = false;
        var length = $('#dropdown-menu-countries a').length;
        var lastOne = false;
        $('#dropdown-menu-countries a').each(function(index) {
            $('#prevbutton').removeClass('disabled');
            if ($(this).data("code") == $("#dropdown-menu-countries").data("selectedItem")) {
                nextOne = true;
            }
            else if (nextOne) {
                selectCountry($(this).data("code")); 
                lastOne = true;
                nextOne = false;
                return;
            }
            lastOne = false;
        });

        if (lastOne) {
            $('#nextbutton').addClass('disabled');
        }
    });

    $('#prevbutton a').click(function(){
        var prevOne = false;
        var count = $('#dropdown-menu-countries a').length;
        $('#dropdown-menu-countries a').each(function(index) {
            $('#nextbutton').removeClass('disabled');
            if ($(this).data("code") == $("#dropdown-menu-countries").data("selectedItem")) {
                selectCountry(prevOne);
                if (index == 0) {
                    $('#prevbutton').addClass('disabled');
                }
                return;
            } else {
                prevOne = $(this).data("code");
            }
        });
    });
});

function selectSection(index) {

    if (index != 0) {
        // store this in the dropdwon diwn
        $("#dropdown-menu-sections").data("selectedItem", index);

        // get the section text
        // update the dropdown
        var sectionName = $('.dropdown-item[data-code=' + index + ']').text();
        $("#navbarDropdownMenuLink-sections").text(sectionName);
        $("#navbarDropdownMenuLink-sections").addClass("active");

        // set country to "Summary"
        $("#navbarDropdownMenuLink-countries").text("Summary");
        $("#navbarDropdownMenuLink-countries").removeClass("active");

        $("#country_pagination").show();
        $("#dropdown-menu-countries").data("selectedItem", "sum");
        $('#prevbutton').addClass('disabled');
        $('#nextbutton').removeClass('disabled');
    }
    else {
        // unselect the section
        $("#dropdown-menu-sections").data("selectedItem", 0);

        // set section to unselected
        $("#navbarDropdownMenuLink-sections").text("-- Sections --");
        $("#navbarDropdownMenuLink-sections").removeClass("active");
        // set country to unselected
        $("#navbarDropdownMenuLink-countries").text("-- Countries --");
        $("#navbarDropdownMenuLink-countries").removeClass("active");

        $("#country_pagination").hide();
    }

    var md = window.markdownit().use(markdownitFootnote)
    return $.ajax({
        url: "content/" + index + ".md",
        dataType: "text",
        success: function (data) {
            htmlData = md.render(data);
            $("#summary_container").html(htmlData);
            hasher.setHash(index.toString() + '/sum'); // TODO: make this 'sum' string const of some kind


            var newCountryData = {};
            var countryCode = 'sum';

            // create new color data based on selection
            for (const [key, value] of Object.entries(countryData)) {
                newCountryData[key] = {};
                newCountryData[key]['code'] = value.code;
                newCountryData[key]['fillKey'] = value.fillKey;
            }

            map.updateChoropleth(newCountryData, { duration : 0 });
            $('#homebutton').addClass('disabled');

            if (index != 0) {
                $('#audio_player source').attr('src', 'audio/0' + index + '.mp3');
                $('#audio_player audio')[0].pause();
                $('#audio_player audio')[0].load();
                $('#audio_player').show();
            } else {
                $('#audio_player').hide();
            }
        }
    });
}

function selectCountry(countryCode) {
    var selectedSection = $("#dropdown-menu-sections").data("selectedItem");
    if (selectedSection == undefined || selectedSection == 0) {
        alert('Please select a section first!');
        return;
    }

    if (selectedSection != 0 && countryCode == 'sum') {
        $('#audio_player').show();
    } else 
    {
        $('#audio_player').hide();
    }

    var md = window.markdownit().use(markdownitFootnote)

    var url = "content/" + selectedSection;
    if (countryCode == "sum") {
        url = url + ".md";
        $('#homebutton').addClass('disabled');
    }
    else {
        url = url + "_" + countryCode + ".md";
        $('#homebutton').removeClass('disabled');
    }

    var which = 0;
    var length = $('#dropdown-menu-countries a').length;
    $('#dropdown-menu-countries a').each(function(index) {
        if ($(this).data("code") == countryCode) {
            which = index;
            return;
        }
    });

    if (which == 0) {
        $('#prevbutton').addClass('disabled');
        $('#nextbutton').removeClass('disabled');
    } else if (which == length - 1) {
        $('#nextbutton').addClass('disabled');
        $('#prevbutton').removeClass('disabled');
    } else {
        $('#nextbutton').removeClass('disabled');
        $('#prevbutton').removeClass('disabled');
    }

    var htmlData = "";
    return $.ajax({
        url: url,
        dataType: "text",
        success: function (data) {
            htmlData = md.render(data);
            $("#summary_container").html(htmlData);
            hasher.setHash(selectedSection + '/' + countryCode); // TODO: make this 'sum' string const of some kind
            // update the dropdown
            var countryText = $('.dropdown-item[data-code=' + countryCode + ']').text();
            $("#navbarDropdownMenuLink-countries").text(countryText);
            $("#navbarDropdownMenuLink-countries").addClass("active");
            $("#dropdown-menu-countries").data("selectedItem", countryCode);

            var newCountryData = {};

            // create new color data based on selection
            for (const [key, value] of Object.entries(countryData)) {
                newCountryData[key] = {};
                newCountryData[key]['code'] = value.code;
                newCountryData[key]['fillKey'] = (countryCode == 'sum') ? value.fillKey : (value.code == countryCode) ? value.fillKey : value.fillKey + '_notselected';
            }
            map.updateChoropleth(newCountryData, { duration : 0 });
        }
    });
}

function handleChanges(newHash, oldHash) {
    // This function lives debugging purposes only. Leave him be.
    [section, country] = newHash.split('/');
    if (section == undefined || country == undefined) {
         return;
    }

    if (section == 0 && country == 'sum'){
        $('#home-link').addClass('active');
    } else {
        $('#home-link').removeClass('active');
    }
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
            if (geography.id in countryData) {
                selectCountry(countryData[geography.id].code);
            }
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

hasher.changed.add(handleChanges);
hasher.initialized.add(handleChanges);
hasher.init();

var initialHash = hasher.getHash();
[initialSection, initialCountry] = initialHash.split('/');
$('#audio_player').hide();
if (section != undefined && country != undefined) {
    if (section == 0 && country == "sum") {
        selectSection(0);
    }
    else {
        selectSection(initialSection).done(function (data, textStatus, jqXHR) {
            selectCountry(initialCountry);
        });
    }
}
else {
    selectSection(0);
}

// Resize the map when the window resizes
$(window).on('resize', function() {
   map.resize();
});
