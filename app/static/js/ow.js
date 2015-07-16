// Alert list and alerts details view
require.config({
	paths: {
		// A lot of require modules are broken when being loaded from a dir
		// eg, define(['vnd/monent'].., doesn't work.
		// This fixes them.
		"moment": "vnd/moment"
	}
})

define([
	'vnd/ractive',
	'tools',
	'apiclient',
	'moment',
	'sparkline',
	'vnd/styleselect',
	'text!../views/products.mustache',
	'text!../views/nav.mustache'
], function(Ractive, tools, apiClient, moment, sparkline, styleSelect, productsTemplate, navTemplate){

	var selectedTimePeriod = 3;
	var selectedType = 'technology';

	var navEl = query('nav'),
		productsEl = query('.products');

	var helpers = Ractive.defaults.data;
	helpers.getPrettyDate = function(date){
		return moment(date).format("DD MMM YYYY")
	}

	if ( ! HTMLCollection.prototype.forEach ) {
		HTMLCollection.prototype.forEach = Array.prototype.forEach
	}

	// We need both the nav binding and the products binding complete so
	// that eg filtering for fashion in the nav binding can alter the products binding
	var bindingsLeft = 2;

	var setupNavigation = function(){
		bindingsLeft--;
		// Check that both 'nav' ad 'products' bindings are ready
		if ( ! bindingsLeft ) {

			// Setup styled selects
			;['select.type', 'select.time-period'].forEach(function(selectBox){
				styleSelect(selectBox);
			})

			// Add event handlers for real selects
			query('nav select.type').addEventListener('change', function(ev){
				selectedType = ev.target.value
				log('Changed type to', selectedType)
				getProducts(selectedTimePeriod, selectedType)
			})

			query('nav select.time-period').addEventListener('change', function(ev){
				selectedTimePeriod = ev.target.value
				log('Changed time period to', ev.target.value)
				getProducts(selectedTimePeriod, selectedType)
			})
		}
	}

	var productsBinding = new Ractive({
		data: {
			productsLoading: true,
			products: []
		},
		el: productsEl,
		template: productsTemplate
	})

	var navBinding = new Ractive({
		data: {},
		el: navEl,
		template: navTemplate,
		complete: setupNavigation
	})

	var getProducts = function(days, type){
		log('Getting products of type', type, 'since', days, 'days.')
		productsBinding.set({
			products: [],
			productsLoading: true
		})
		apiClient.getProducts(days, type, function(res){
			var products = res.body.products
			log('fetched', products.length, 'products from server');
			productsBinding.set({
				products: products,
				productsLoading: false
			}).then( function () {

				// Setting up sparklines takes a while, so let's set up nav immediately first
				setupNavigation();

				queryAll('.sparkline').forEach(function(sparklineEl){
					// Converts 'data-values' into a list of Numbers
					var values = sparklineEl.dataset.values.match(/\S+/g).map(Number);
					sparkline.drawSparkline(sparklineEl, values)
				})


			});
		})
	}

	function toggleOverlay (ev) {
		if (ev.toElement.nodeName === 'INPUT' || ev.toElement.nodeName === 'LABEL') {
			return;
		}
		log('removing obverlay', ev)
		ev.preventDefault();
		ev.stopPropagation();


		if (ev.target.className === 'reason') {
			ev.target.parentNode.classList.toggle('hidden');
		}
	}

	// submit form on radio input change in the remove reason form
	function addFormEventHandler(input, productId) {

		input.addEventListener('change', function (ev) {
			ev.preventDefault();
			ev.stopPropagation();

			apiClient.removeProduct(productId, ev.target.value, function (res) {
				if (res.status === 200) {
					ev.target.parentNode.parentNode.classList.toggle('hidden');
					var el = query('section[data-product-id=\'' + productId + '\']');
					el.innerHTML = '';
				}
			});
		});
	}

	// Click handler for upvoting and removing
	productsEl.addEventListener('click', function (ev) {

		// upvoting
		if ( ev.target.matches('.useful') ) {
			var usefulButton = ev.target
			var isUseful = usefulButton.matches('.disabled') // i,e. if the button is disabled now, we'll enable the button.
			var productId = usefulButton.dataset.productId
			log('Setting', productId, 'to usefulness', isUseful)
			apiClient.updateProductUsefulness(productId, isUseful)
			ev.target.classList.toggle('disabled')
		}

		// removing
		if ( ev.target.matches('.remove') ) {
			var removeButton = ev.target;
			var productId = removeButton.dataset.productId,
				overlay = removeButton.query('.overlay'),
				removeForm = removeButton.query('form.reason')
			overlay.classList.toggle('hidden');
			overlay.addEventListener('mouseout', toggleOverlay);
			removeForm.children.forEach(function (el, idx) {
				if (el.nodeName === 'LABEL') {
					addFormEventHandler(el, productId);
				}
			});
		}
	});

	// Get initial set of products
	getProducts(selectedTimePeriod, selectedType)

})
