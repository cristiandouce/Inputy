;(function($) {
	var pluginName = "Inputy",
		INPUTY_DATA_KEY = "plugin_" + pluginName;
	
	var DEFAULT_CALLBACKS = {

	};
	
	var DEFAULT_TEMPLATES = {
		formInput: '<input type="hidden" name="$ELEMENT_ID" value="$INPUT_VALUE" />',
		inputyText: '<input class="$INPUT_CLASS" type="text" style="$INPUT_STYLE" autofocus value="$INPUT_VALUE"/>$BUTTONS_CONTAINER',
		inputyTextArea: '<textarea class="$INPUT_CLASS" style="$INPUT_STYLE" autofocus >$INPUT_VALUE</textarea>$BUTTONS_CONTAINER',
		buttonEdit: '<span class="$BUTTON_EDIT_CLASS">Edit</span>',
		inputyUpdate: '<a><span class="$BUTTON_UPDATE_CLASS">Update</span></a>',
		inputyCancel: '<a><span class="$BUTTON_CANCEL_CLASS">Cancel</span></a>',
		inputyButtonsContainer: '<div class="$CONTAINER_CLASS">$BUTTON</div>'
	};

	var DEFAULT_CLASSES = (function() {
			//temporarily using jquery-ui themes classes
			var inputyDefaultSource = "inputy",
				inputyInput = "inputy-input",
				inputyForm = "inputy-form",
				inputyButtonContainer = "inputy-container",
				inputyUpdateButton = "inputy-update-button",
				inputyCancelButton = "inputy-cancel-button",
				inputyEditButton = "inputy-edit-button";

			return {
				inputyDefaultSource: inputyDefaultSource,
				inputyInput: inputyInput,
				inputyForm: inputyForm,

				inputyButtonContainer: inputyButtonContainer,
				inputyCompleteButtonContainer: inputyButtonContainer,

				inputyUpdateButton: inputyUpdateButton,
				inputyCompleteUpdateButton: "icon icon-circle-check " + inputyUpdateButton,

				inputyCancelButton: inputyCancelButton,
				inputyCompleteCancelButton: "icon icon-circle-close " + inputyCancelButton,

				inputyEditButton: inputyEditButton,
				inputyCompleteEditButton: "icon icon-pencil " + inputyEditButton
			}
		})();

	var publicMethods = {
		init: function(options) {
			return this.each(function() {
				if(!$.data(this, INPUTY_DATA_KEY)) {
					$.data(this, INPUTY_DATA_KEY, new Inputy(this, options));
				}
			});
		},

		getFormValues: function() {
			var retValues = {};
			for(uid in CACHE.el) {
				retValues[CACHE.el[uid].inputName] = CACHE.el[uid].cleanValue;
			}

			return retValues;
		}
	};

	var CACHE = {
		el: {},

	};


	var Inputy = function(element, options) {

		// Set instance Id
		this.instanceNumber = Inputy.count++;
		this.uid = element.tagName + '-' + new Date().getTime() + "-" + this.instanceNumber;

		// Set cache element data reference object
		CACHE.el[this.uid] = {};

		// Build settings object
		this.settings = {};

		// Build callbacks
		if (options.callbacks) {
			// Use custom callbacks
			this.settings.callbacks = $.extend({}, DEFAULT_CALLBACKS, options.callbacks);
		} else {
			// Use default callbacks
			this.settings.callbacks = DEFAULT_CALLBACKS;
		};

		// Build classes names
		if (options.classes) {
			if (!this.settings.appendClasses) {
				// Override custom class names
				this.settings.classes = $.extend({}, DEFAULT_CLASSES, options.classes);
			} else {
				// Append custom class names
			};
		
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

		// Build classes names
		this.settings.templates = DEFAULT_TEMPLATES;
		if ($(element).data("type") == "textarea") {
			this.inputTemplate = this.settings.templates.inputyTextArea;
		} else {
			this.inputTemplate = this.settings.templates.inputyText;
		};

		this.element = element;
		this.$element = $(element);
		this.parentForm = $(element).closest("form").addClass(this.settings.classes.inputyForm);
		

		this.init();
	};

	Inputy.count = 0;
	
	Inputy.helpers = {
		getElementMetrics: function(element) {
			var f = element.css('font') || '12px arial',
				o = $('<div>' + Inputy.prototype.getCleanText(element) + '</div>')
				    .css({'position': 'relative', 'float': 'left', 'white-space': 'wrap', 'visibility': 'hidden', 'font': f}),
				metrics;

			element.after(o);

			metrics = {
				textWidth: o.width(),
				textHeight: o.height(),
			};

			o.remove();

			return metrics;
		}
	};

	Inputy.prototype = {
		constructor: Inputy,

		//vars
		// 

		// methods
		init: function() {
			this.render();
			this.bindEvents();
			this._initCache();
		},

		render: function() {
			var buttonEdit = this._buildButtons(["Edit"]);
			var formInput = this._buildFormInput();
			this._formInput = $(formInput);

			//render buttonEdit
			this.$element.append(buttonEdit);

			//render formInput
			$(this.parentForm).prepend(this._formInput);
		},

		bindEvents: function() {
			var element = this.$element;
			var self = this;

			//If form exists, then I should delegate all events to it as container!!
			// But I would have trouble with overriding... (?)
			element.delegate("span." + this.settings.classes.inputyEditButton, "click", function(ev) {
				var touched = $(this).parent().parent(),
					inputyActive = self._buildActive();
				ev.preventDefault();
				ev.stopPropagation();

				touched.html(inputyActive);
			});

			element.delegate("span." + this.settings.classes.inputyUpdateButton, "click", function(ev) {
				var inputySelector = "." + self.settings.classes.inputyInput,
					inputyValue = $(inputySelector).val();
				ev.preventDefault();
				ev.stopPropagation();

				self._contentUpdate(inputyValue);
			});

			element.delegate("." + this.settings.classes.inputyInput, "blur", function(ev) {
				var inputySelector = "." + self.settings.classes.inputyInput,
					inputyValue = $(inputySelector).val();
				ev.preventDefault();
				ev.stopPropagation();

				self._contentUpdate(inputyValue);
			});
		},

		getCleanText: function(from) {
			return $.trim(from
					.clone()    //clone the element
					.children() //select all the children
					.remove()   //remove all the children
					.end()  	//again go back to selected element
					.text());    //get the text of element
		},

		setCleanText: function(from, text) {
			// Save childrens
			var childs = from.children();

			// Set single text
			return from
					.clone()    		//clone the element
					.children() 		//select all the children
					.remove()   		//remove all the children
					.end()  			//again go back to selected element
					.text($.trim(text))    		//set the text of element
					.append(childs);	//recover all the childrens and return

		},

		_buildFormInput: function() {
			return this.settings.templates.formInput
					.replace("$ELEMENT_ID", this._getFormInputName())
					.replace("$INPUT_VALUE", this.getCleanText(this.$element));
		},

		_buildButtonEdit: function() {
			return this.settings.templates.buttonEdit
					.replace("$BUTTON_EDIT_CLASS", this.settings.classes.inputyCompleteEditButton);
		},

		_buildButtonUpdate: function() {
			return this.settings.templates.inputyUpdate
					.replace("$BUTTON_UPDATE_CLASS", this.settings.classes.inputyCompleteUpdateButton);
		},

		_buildButtonCancel: function() {
			return this.settings.templates.inputyCancel
					.replace("$BUTTON_CANCEL_CLASS", this.settings.classes.inputyCompleteCancelButton);
		},

		_buildButtons: function(buttonsTypesArray) {
			var buttonType,
				buildButtonMethod = "_buildButton",
				buttonsBuffer = "", buttonTemp;

			for (buttonType in buttonsTypesArray) {
				buttonTemp = this[buildButtonMethod + buttonsTypesArray[buttonType]]();
				buttonsBuffer += this.settings.templates.inputyButtonsContainer
									.replace("$CONTAINER_CLASS", this.settings.classes.inputyCompleteButtonContainer)
									.replace("$BUTTON", buttonTemp);
			}

			return buttonsBuffer;
		},

		_buildActive: function() {
			return this.inputTemplate
					.replace("$INPUT_CLASS", this.settings.classes.inputyInput)
					.replace("$INPUT_VALUE", CACHE.el[this.uid].cleanValue)
					.replace("$INPUT_STYLE", this._getInputBuiltStyle())
					.replace("$BUTTONS_CONTAINER", this._buildButtons(["Update","Cancel"]));
		},


		_getHashedString: function() {
			var $element = CACHE.el[this.uid].element || this.$element;
			return this.$element.prop("tagName").toLowerCase() + this.instanceNumber;		
		},

		_contentUpdate: function(inputValue) {
			var cachedValue = CACHE.el[this.uid].cleanValue;

			if(inputValue !== cachedValue) {
				// Updates content
				this._setElementContent(inputValue);
				// Refreshes cache
				this._refreshCache("content");
			} else {
				// Use cached content
				this._setElementContent();
			}
		},

		_setElementContent: function(content) {
			var $element = CACHE.el[this.uid].element;
			if (content === undefined || content == "") {
				this.$element.html($element.html());
			} else {
				this.$element.html(this.setCleanText($element, content).html());

				this._formInput.val(content);
			}
		},

		_getInputBuiltStyle: function() {
			var eMetrics = Inputy.helpers.getElementMetrics(this.$element)
				w = CACHE.el[this.uid].element.data("fixed-width"),
				h = CACHE.el[this.uid].element.data("fixed-height");

			return "width:$Wpx;height:$Hpx;"
				.replace("$W", w || eMetrics.textWidth)
				.replace("$H", h || eMetrics.textHeight);
		},

		_getFormInputName: function() {
			var elementId = this.$element.prop("id");
			var inputName = this.$element.data("name");

			return CACHE.el[this.uid].inputName || inputName || elementId || this._getHashedString();
		},

		_initCache: function() {

			CACHE.el[this.uid] = {
				inputyObj: this, // Unique reference
				element: this.$element.clone(),
				inputName: this._getFormInputName(),
				cleanValue: this.getCleanText(this.$element)
			}
		},

		_refreshCache: function(key, value) {
			var el = CACHE.el[this.uid],
				$element = this.$element;
			if (key == "content") {
				el.element = $element.clone();
				el.cleanValue = this.getCleanText($element);
			};
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

    // window.Inputy = Inputy;
})(jQuery);