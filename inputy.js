;(function($) {
	var pluginName = "Inputy",
		INPUTY_DATA_KEY = "plugin_" + pluginName;
	
	var DEFAULT_CALLBACKS = {

	};
	
	var DEFAULT_CLASSES = {
		inputyElement: "inputy",
		inputyInput: "inputyInput"
	};

	var publicMethods = {
		init: function(options) {
			console.log(this);
			return this.each(function() {
				if(!$.data(this, INPUTY_DATA_KEY)) {
					$.data(this, INPUTY_DATA_KEY, new Inputy(this, options));
				}
			});
		}
	};

	var Inputy = function(element, options) {
		this.element = element;

		// Build settings object
		this.settings = {};

		// Build callbacks
		if (options.callbacks) {
			//Use custom callbacks
			this.settings.callbacks = $.extend({}, DEFAULT_CALLBACKS, options.callbacks);
		} else {
			this.settings.callbacks = DEFAULT_CALLBACKS;
		};

		// Build classes names
		if (options.classes) {
			//Use custom class names
			this.settings.classes = $.extend({}, DEFAULT_CLASSES, options.classes);
		
		} else if(options.theme) {
			// Use theme-suffixed default class names
			$.each(DEFAULT_CLASSES, function(key, value) {
				this.settings.classes = {};
				this.settings.classes[key] = value + "-" + options.theme;
			});

		} else {
			// Use default classes
			this.settings.classes = DEFAULT_CLASSES;
		};

		this.init();
	};

	Inputy.prototype = {
		constructor: Inputy,

		init: function() {
			this.render();
			this.bindEvents();

		},

		render: function() {
			var html = '<span class="inputyEditButton">Edit</span>';

			$(this.element).append(html);
			
		},

		bindEvents: function() {
			var element = $(this.element);
			var self = this;

			element.find("span").bind("click", function() {
				var touched = $(this);
				console.log("Still on development... but soon!");

			});
		}


	}

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( method ) {
        if(publicMethods[method]) {
            return publicMethods[method].apply($(this).data(INPUTY_DATA_KEY),  Array.prototype.slice.call(arguments, 1));
        } else {

            return publicMethods.init.apply(this, arguments);

        }

    };

})(jQuery);