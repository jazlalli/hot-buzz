// standalone-framework Required for HighCharts to work without JQuery
define(['vnd/highcharts/highcharts-sparkline'], function(unused){
	var drawSparkline = function(el, data){
		var chart = new Highcharts.SparkLine({
			series: [{
				data: data
			}],
			chart: {
				renderTo: el,
				backgroundColor:'transparent'
			}
		});
	}

	return {
		drawSparkline: drawSparkline
	}
})
