function getScatterplot(fruitType) {
    // First, remove the contents of the svg
    d3.select('#scatterplot').selectAll("*").remove();

    // Select the cv file based on the button
    var csvFile = ""
    var locFile = "https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectData/main/FruitLocationsNotFresh.csv"
    switch(fruitType) {
        case 'fresh':
            csvFile = "https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectData/main/FreshFruitPrices.csv";
            locFile = "https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectData/main/FruitLocations.csv"
            break;
        case 'frozen': 
            csvFile = "https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectData/main/FrozenFruitPrices.csv";
            break;
        case 'dried':
            csvFile = "https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectData/main/DriedFruitPrices.csv"
            break;
        case 'canned':
            csvFile = "https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectDataData/main/CannedFruitPrices.csv"
            break;
        case 'juice':
            csvFile = "https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectData/main/JuiceFruitPrices.csv"
            break;
        default:
            csvFile = "https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectData/main/FreshFruitPrices.csv"
    }

    // Create the scatterplot
    d3.csv(csvFile).then(function(data) { 
        // Dynamic scales
        var prices = []
        var yields = []
        let i = 0;
        while (i < data.length) {
            prices.push(data[i].RetailPrice)
            yields.push(data[i].Yield)
            i++;
        }

        minPrice = Math.min.apply(Math, prices)
        maxPrice = Math.max.apply(Math, prices)
        minYield = Math.min.apply(Math, yields)
        maxYield = Math.max.apply(Math, yields)

        // Get region colors
        var color = {
            "West Coast":"rgb(221,148,178)",
            "South":"rgb(244,147,95)",
            "East Coast":"rgb(255,220,4)",
            "Midwest":"rgb(130,201,155)",
            "Hawaii":"rgb(193,184,199)"
        }

        var plotColors = []
        d3.csv(locFile).then(function(locdata) {
            // Join the fruit data with the location data
            if(fruitType == 'fresh') {
                for(let pData = 0; pData < data.length; pData ++) {
                    for(let lData = 0; lData < locdata.length; lData ++) {
                        if(data[pData].Fruit == locdata[lData].Fruit) {
                            plotColors.push(color[locdata[lData].Region])
                        }
                    }
                }
            } else {
                for(let pData = 0; pData < data.length; pData ++) {
                    for(let lData = 0; lData < locdata.length; lData ++) {
                        let form = locdata[lData].Form.toLowerCase()
                        if(data[pData].Fruit == locdata[lData].Fruit && form == fruitType) {
                            plotColors.push(color[locdata[lData].Region])
                        }
                    }
                }
            }

            // PLOT
            var x = d3.scaleLinear().domain([minPrice - 0.1,maxPrice + 0.1]).range([0,400]);
            var y = d3.scaleLinear().domain([minYield - 0.1,maxYield + 0.1]).range([400,0]);
            
            // Tooltips
            var tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
            
            d3.select("#scatterplot")
                .append("g")
                    .attr("transform","translate(50,50)")
                .selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                    .attr("cx",function(d,i) { return x(d.RetailPrice); })
                    .attr("cy",function(d) { return y(d.Yield); })
                    .attr("r",5)
                    .style("fill",function(d,i) { return plotColors[i] })
                .on('mouseover', function (event, d) {
                    d3.select(this).transition()
                        .duration('100')
                        .attr("r", 7);
                    tooltip.transition()
                        .duration(100)
                        .style("opacity", 1);
                    tooltip.html(d.Fruit)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 15) + "px");
                })
                .on('mouseout', function (d, i) {
                    d3.select(this).transition()
                        .duration('200')
                        .attr("r", 5);
                    tooltip.transition()
                        .duration('200')
                        .style("opacity", 0);
                });
            
            // Axes
            d3.select("#scatterplot")
                .append("g")
                .attr("transform","translate(50,50)")
                .call(d3.axisLeft(y));
            d3.select("#scatterplot")
                .append("g")
                .attr("transform","translate(50,450)")
                .call(d3.axisBottom(x));

            // Axis labels
            d3.select("#scatterplot")
                .append("text")
                    .attr("x", 250)
                    .attr("y", 500)
                    .style("text-anchor","middle")
                    .text("Retail Price per Unit ($)");
            
            d3.select("#scatterplot")
                .append("text")
                    .attr("transform","rotate(-90)")
                    .attr("y", -5)
                    .attr("x", 0 - 250)
                    .attr("dy", "1em")
                    .style("text-anchor","middle")
                    .text("Yield");

            d3.select("#scatterplot")
                .append("text")
                    .attr("x", 250)
                    .attr("y", 20)
                    .style("text-anchor","middle")
                    .text(fruitType.charAt(0).toUpperCase() + fruitType.slice(1));
        });
    });
}

function renderPieChart() {
    d3.csv("https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectData/main/FruitLocations.csv").then(function(data) {
        var regionDict = {};
        let i = 0;
        while (i < data.length) {
            if(regionDict[data[i].Region]) {
                regionDict[data[i].Region] += 1;
            } else {
                regionDict[data[i].Region] = 1;
            }
            i++;
        }

        regions = []
        rcounts = []

        for (var key in regionDict) {
            regions.push(key);
            rcounts.push(regionDict[key]);
        }

        // Make the chart
        var pie = d3.pie();
        var arc = d3.arc().innerRadius(0).outerRadius(100);
        // West Coast, South, East Cost, Midwest, Hawaii
        var color = ["rgb(221,148,178)", "rgb(244,147,95)", "rgb(255,220,4)", "rgb(130,201,155)", "rgb(193,184,199)"]
        d3.select('#pie-chart')
            .append("g")
                .attr("transform","translate(350,200)")
            .selectAll("path")
            .data(pie(rcounts))
            .enter()
            .append("path")
                .attr("d",arc)
                .attr("fill",function(d,i) { return color[i]; });

        // Axis labels
        d3.select("#pie-chart")
            .append("text")
                .attr("x", 250)
                .attr("y", 75)
                .style("text-anchor","middle")
                .text("Fresh Fruit Regions");

        // Let's make an annotation
        const annotations = [
            {
              note: {
              label: "Of the states in the West Coast, California is the one with the highest production rate, especially for fruits such as grapes and berries!",
              title: "California Dreamin'",
              wrap: 225,  // try something smaller to see text split in several lines
              padding: 10   // More = text lower
              
            },
            connector: {
                end: "arrow",
                type: "curve",
                points: 3,
                lineType: "horizontal"
            },
            color: ["rgb(221,148,178)"],
            x: 355,
            y: 100,
            dy: 20,
            dx: -110
            }
          ]
  
          const makeAnnotations = d3.annotation()
            .annotations(annotations)
          d3.select("#pie-chart").append("g")
            .call(makeAnnotations)
    });
}

function renderSeasonPieCharts() {
    d3.csv("https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectData/main/FruitLocations.csv").then(function(locationdata) {
        d3.csv("https://raw.githubusercontent.com/thenerdgirl/uiuc-cs416-DataViz-FinalProjectData/main/FruitSeasons.csv").then(function(seasondata) {
            var spring = []
            var summer = []
            var fall = []
            var winter = []

            let i = 0;
            // First, sort the fresh fruits into their lists using seasondata
            while (i < seasondata.length) {
                if(seasondata[i].Spring == 1) {
                    spring.push(seasondata[i].Fruit);
                } 
                if(seasondata[i].Summer == 1) {
                    summer.push(seasondata[i].Fruit);
                }
                if(seasondata[i].Fall == 1) {
                    fall.push(seasondata[i].Fruit);
                }
                if(seasondata[i].Winter == 1) {
                    winter.push(seasondata[i].Fruit);
                }
                i++;
            }

            // Now that we know which seasons have which fruit, let's make dicts for region
            let j = 0;
            var springRegionDict = {};
            var summerRegionDict = {};
            var fallRegionDict = {};
            var winterRegionDict = {};
            while (j < locationdata.length) {
                // spring
                if(spring.includes(locationdata[j].Fruit)) {
                    if(springRegionDict[locationdata[j].Region]) {
                        springRegionDict[locationdata[j].Region] += 1;
                    } else {
                        springRegionDict[locationdata[j].Region] = 1;
                    }
                }

                if(summer.includes(locationdata[j].Fruit)) {
                    if(summerRegionDict[locationdata[j].Region]) {
                        summerRegionDict[locationdata[j].Region] += 1;
                    } else {
                        summerRegionDict[locationdata[j].Region] = 1;
                    }
                }

                if(fall.includes(locationdata[j].Fruit)) {
                    if(fallRegionDict[locationdata[j].Region]) {
                        fallRegionDict[locationdata[j].Region] += 1;
                    } else {
                        fallRegionDict[locationdata[j].Region] = 1;
                    }
                }

                if(winter.includes(locationdata[j].Fruit)) {
                    if(winterRegionDict[locationdata[j].Region]) {
                        winterRegionDict[locationdata[j].Region] += 1;
                    } else {
                        winterRegionDict[locationdata[j].Region] = 1;
                    }
                }

                j++;
            }

            // Okay now we have regions by season in the dicts
            // Collect
            var springregions = []
            var summerregions = []
            var fallregions = []
            var winterregions = []
            var springcounts = []
            var summercounts = []
            var fallcounts = []
            var wintercounts = []
            for (var key in springRegionDict) {
                springregions.push(key);
                springcounts.push(springRegionDict[key]);
            }

            for (var key in summerRegionDict) {
                summerregions.push(key);
                summercounts.push(summerRegionDict[key]);
            }

            for (var key in fallRegionDict) {
                fallregions.push(key);
                fallcounts.push(fallRegionDict[key]);
            }

            for (var key in winterRegionDict) {
                winterregions.push(key);
                wintercounts.push(winterRegionDict[key]);
            }

            var color = {
                "West Coast":"rgb(221,148,178)",
                "South":"rgb(244,147,95)",
                "East Coast":"rgb(255,220,4)",
                "Midwest":"rgb(130,201,155)",
                "Hawaii":"rgb(193,184,199)"
            }

            // pie chart time
            var pie = d3.pie();
            var arc = d3.arc().innerRadius(0).outerRadius(100);
            d3.select('#spring-pie-chart')
                .append("g")
                    .attr("transform","translate(100,100)")
                .selectAll("path")
                .data(pie(springcounts))
                .enter()
                .append("path")
                    .attr("d",arc)
                    .attr("fill",function(d,i) { return color[springregions[i]]; });
            
            d3.select("#spring-pie-chart")
                .append("text")
                    .attr("x", 100)
                    .attr("y", 225)
                    .style("text-anchor","middle")
                    .text("Spring Regions");

            d3.select('#summer-pie-chart')
                .append("g")
                    .attr("transform","translate(100,100)")
                .selectAll("path")
                .data(pie(summercounts))
                .enter()
                .append("path")
                    .attr("d",arc)
                    .attr("fill",function(d,i) { return color[summerregions[i]]; });

            d3.select("#summer-pie-chart")
                .append("text")
                    .attr("x", 100)
                    .attr("y", 225)
                    .style("text-anchor","middle")
                    .text("Summer Regions");

            
            d3.select('#fall-pie-chart')
                .append("g")
                    .attr("transform","translate(100,100)")
                .selectAll("path")
                .data(pie(fallcounts))
                .enter()
                .append("path")
                    .attr("d",arc)
                    .attr("fill",function(d,i) { return color[fallregions[i]]; });

            d3.select("#fall-pie-chart")
                .append("text")
                    .attr("x", 100)
                    .attr("y", 225)
                    .style("text-anchor","middle")
                    .text("Fall Regions");

            d3.select('#winter-pie-chart')
                .append("g")
                    .attr("transform","translate(100,100)")
                .selectAll("path")
                .data(pie(wintercounts))
                .enter()
                .append("path")
                    .attr("d",arc)
                    .attr("fill",function(d,i) { return color[winterregions[i]]; });

            d3.select("#winter-pie-chart")
                .append("text")
                    .attr("x", 100)
                    .attr("y", 225)
                    .style("text-anchor","middle")
                    .text("Winter Regions");
        });
    });
}

// Initialize Plots
getScatterplot('fresh')
renderPieChart()
renderSeasonPieCharts()
