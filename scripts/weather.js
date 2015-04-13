/* global Backbone, _ */


(function () {
  'use strict';

	var Forecast,
		Forecasts,
		SearchView,
		ForecastView,
		ForecastItemView;

	Forecast = Backbone.Model.extend({
		url: function () {
			return 'http://api.wunderground.com/api/7eaec3b21b154448/conditions/q/' + this.get('zip') + '.json';
		},
		sync: function (method, model, options) {
			options.dataType = 'jsonp';
			return Backbone.sync(method, model, options);
		},
		validate: function (options) {
			if (!options.zip) {
				return 'Please enter a zip code'
			}
		},
		parse: function (data, request) {
			var observation = data.current_observation;
			return {
				id: observation.display_location.zip,
				url: observation.icon_url,
				state: observation.display_location.state_name,
				zip: observation.display_location.zip,
				city: observation.display_location.city,
				temperature: observation.temp_f,
				wind: observation.wind_mph,
				feelslike: observation.feelslike_f,
				image: observation.image.url
			}
		}
	});

	Forecasts = Backbone.Collection.extend({
		model: Forecast
	});

	SearchView = Backbone.View.extend({
		events: {
			'click #search': 'addZip'
		},
		initialize: function () {
			this.collection.on('add', this.clear, this);
		},
		addZip: function (e) {
			e.preventDefault();

			this.model = new Forecast();

			if (this.model.set({zip: this.$('#zip').val()})) {
				this.collection.add(this.model);
			}
		},
		clear: function () {
			this.$('#zip').val('');
		}
	});

	ForecastView = Backbone.View.extend({
		events: {
			'click .delete': 'destroy'
		},
		initialize: function () {
			this.collection.on('add', this.render, this);
			this.collection.on('remove', this.remove, this);
		},
		render: function (model) {
			var view = new ForecastItemView({
				id: model.get('zip'),
				model: model
			});

			this.$('tbody')
				.append(view.el)
				.closest('table')
				.fadeIn('slow');
			return this;
		},
		remove: function (model) {
			$('#' + model.get('zip')).remove();
			if (!this.collection.length) {
				this.$el.fadeOut('slow');
			}
		},
		destroy: function (e) {
			var id = $(e.currentTarget).closest('tr').attr('id'),
				model = this.collection.get(id);

			this.collection.remove(model);
		}
	});

	ForecastItemView = Backbone.View.extend({
		tagName: 'tr',
		template: _.template($('#forcast-template').html()),
		initialize: function () {
			_.bindAll(this, 'render');
			this.model.fetch({
				success: this.render
			});
		},
		render: function (model) {
			var content = this.template(model.toJSON());
			this.$el.html(content);
			return this;
		}
	});

	var forecasts = new Forecasts();
	var searchView = new SearchView({
		el: $('#weather'),
		collection: forecasts
	});

	var forecastView = new ForecastView({
		el: $('#output'),
		collection: forecasts
	});

})();
