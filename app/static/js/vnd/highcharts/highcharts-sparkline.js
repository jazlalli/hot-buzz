// Highcharts doesn't have an inbuilt 'SparkLine' mode
// instead, the Highcharts docs make their own SparkLine using area charts
// Code from http://www.highcharts.com/demo/sparkline & linked jsfiddle

define(['vnd/highcharts/standalone-framework', 'vnd/highcharts/highcharts'], function(unused, unused){
	window.Highcharts.SparkLine = function (options, callback) {
		var defaultOptions = {
			chart: {
				renderTo: (options.chart && options.chart.renderTo) || this,
				backgroundColor: null,
				borderWidth: 0,
				type: 'area',
				margin: [2, 0, 2, 0],
				width: 120,
				height: 20,
				style: {
					overflow: 'visible'
				},
				skipClone: true
			},
			title: {
				text: ''
			},
			credits: {
				enabled: false
			},
			xAxis: {
				labels: {
					enabled: false
				},
				title: {
					text: null
				},
				startOnTick: false,
				endOnTick: false,
				tickPositions: []
			},
			yAxis: {
				endOnTick: false,
				startOnTick: false,
				labels: {
					enabled: false
				},
				title: {
					text: null
				},
				tickPositions: [0]
			},
			legend: {
				enabled: false
			},
			tooltip: {
				backgroundColor: null,
				borderWidth: 0,
				shadow: false,
				useHTML: true,
				hideDelay: 0,
				shared: true,
				padding: 0,
				positioner: function (w, h, point) {
					return { x: point.plotX - w / 2, y: point.plotY - h};
				}
			},
			plotOptions: {
				series: {
					animation: false,
					lineWidth: 1,
					shadow: false,
					states: {
						hover: {
							lineWidth: 1
						}
					},
					marker: {
						radius: 1,
						states: {
							hover: {
								radius: 2
							}
						}
					},
					fillOpacity: 0.25
				},
				column: {
					negativeColor: '#910000',
					borderColor: 'silver'
				}
			}
		};
		options = Highcharts.merge(defaultOptions, options);

		return new Highcharts.Chart(options, callback);
	};
})