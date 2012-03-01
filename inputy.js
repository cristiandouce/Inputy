;(function($) {
	var pluginName = "Inputy",
		INPUTY_DATA_KEY = "plugin_" + pluginName;
	
	var DEFAULT_CALLBACKS = {

	};
	
	var DEFAULT_TEMPLATES = {
		formInput: '<input type="hidden" name="$ELEMENT_ID" value="$INPUT_VALUE" />',
		buttonEdit: '<a class="$CONTAINER_CLASS"><span class="$BUTTON_EDIT_CLASS">Edit</span></a>',
		inputyActive: '<input class="$INPUT_CLASS" type="text"/><a class="$CONTAINER_CLASS"><span class="$BUTTON_SAVE_CLASS">Save</span></a>'
	};

	var DEFAULT_CLASSES = (function() {
			//temporarily using jquery-ui themes classes
			var inputyDefaultSource = "inputy",
				inputyInput = "inputy-input",
				inputyButtonContainer = "inputy-anchor-container",
				inputySaveButton = "inputy-save-button",
				inputyEditButton = "inputy-edit-button";

			return {
				inputyDefaultSource: inputyDefaultSource,
				inputyInput: inputyInput,
				inputyButtonContainer: inputyButtonContainer,
				inputyCompleteButtonContainer: "ui-state-default " + inputyButtonContainer,
				inputySaveButton: inputySaveButton,
				inputyCompleteSaveButton: "ui-icon ui-icon-circle-check " + inputySaveButton,
				inputyEditButton: inputyEditButton,
				inputyCompleteEditButton: "ui-icon ui-icon-pencil " + inputyEditButton
			}
		})();

	var publicMethods = {
		init: function(options) {
			return this.each(function() {
				if(!$.data(this, INPUTY_DATA_KEY)) {
					$.data(this, INPUTY_DATA_KEY, new Inputy(this, options));
				}
			});
		}
	};

	var Inputy = function(element, options) {
		this.element = element;
		this.parentForm = $(element).closest("form");

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

		// Build classes names
		this.settings.templates = DEFAULT_TEMPLATES;


		this.init();
	};

	Inputy.prototype = {
		constructor: Inputy,

		// vars
		tmp: "",

		// methods
		init: function() {
			this.render();
			this.bindEvents();
		},

		render: function() {
			var buttonEdit = this._buildButtonEdit();
			var formInput = this._buildFormInput();

			//render buttonEdit
			$(this.element).append(buttonEdit);
			$(this.parentForm).prepend(formInput);
		},

		bindEvents: function() {
			var element = $(this.element);
			var self = this;

			element.delegate("span." + this.settings.classes.inputyEditButton, "click", function() {
				var touched = $(this).parent().parent();
				self.tmp = touched.clone();
				var inputyActive = self._buildActive();
				
				touched.html(inputyActive).find("input").focus();
			});

			element.delegate("span." + this.settings.classes.inputySaveButton, "click", function() {
				var inputValue = $(this).closest("input").val();
				if(inputValue) {
					$(this).parent().html(self.setCleanText($(self.tmp), inputValue).html());
				} else {
					$(this).parent().html(self.tmp.html());
				}
			});

			element.delegate("input." + this.settings.classes.inputyInput, "blur", function() {
				var inputValue = $(this).val();
				if(inputValue) {
					$(this).parent().html(self.setCleanText($(self.tmp), inputValue).html());
				} else {
					$(this).parent().html(self.tmp.html());
				}
			});
		},

		getCleanText: function(from) {
			return from
					.clone()    //clone the element
					.children() //select all the children
					.remove()   //remove all the children
					.end()  	//again go back to selected element
					.text();    //get the text of element
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
					.text(text)    		//set the text of element
					.append(childs);	//recover all the childrens and return

		},

		_buildFormInput: function() {
			var elementId = $(this.element).prop("id");
			return this.settings.templates.formInput
					.replace("$ELEMENT_ID", elementId ? elementId : this._getHashedString())
					.replace("$INPUT_VALUE", this.getCleanText($(this.element)));
		},

		_buildButtonEdit: function() {
			return this.settings.templates.buttonEdit
					.replace("$CONTAINER_CLASS", this.settings.classes.inputyCompleteButtonContainer)
					.replace("$BUTTON_EDIT_CLASS", this.settings.classes.inputyCompleteEditButton);
		},

		_buildActive: function() {
			return this.settings.templates.inputyActive
					.replace("$INPUT_CLASS", this.settings.classes.inputyInput)
					.replace("$CONTAINER_CLASS", this.settings.classes.inputyCompleteButtonContainer)
					.replace("$BUTTON_SAVE_CLASS", this.settings.classes.inputyCompleteSaveButton);
		},

		_getHashedString: function() {
			return $(this.element).prop("tagName").toLowerCase() + "[]";		
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