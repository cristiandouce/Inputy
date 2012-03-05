;(function($) {
	var pluginName = "Inputy",
		INPUTY_DATA_KEY = "plugin_" + pluginName;
	
	var DEFAULT_CALLBACKS = {

	};
	
	var DEFAULT_TEMPLATES = {
		formInput: '<input type="hidden" name="$ELEMENT_ID" value="$INPUT_VALUE" />',
		buttonEdit: '<a class="$CONTAINER_CLASS"><span class="$BUTTON_EDIT_CLASS">Edit</span></a>',
		inputyActive: '<input class="$INPUT_CLASS" type="text" autofocus /><a class="$CONTAINER_CLASS"><span class="$BUTTON_SAVE_CLASS">Save</span></a>'
	};

	var DEFAULT_CLASSES = (function() {
			//temporarily using jquery-ui themes classes
			var inputyDefaultSource = "inputy",
				inputyInput = "inputy-input",
				inputyForm = "inputy-form",
				inputyButtonContainer = "inputy-anchor-container",
				inputySaveButton = "inputy-save-button",
				inputyEditButton = "inputy-edit-button";

			return {
				inputyDefaultSource: inputyDefaultSource,
				inputyInput: inputyInput,
				inputyForm: inputyForm,
				inputyButtonContainer: inputyButtonContainer,
				inputyCompleteButtonContainer: inputyButtonContainer,
				inputySaveButton: inputySaveButton,
				inputyCompleteSaveButton: "icon icon-circle-check " + inputySaveButton,
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
		}
	};

	var Inputy = function(element, options) {
		Inputy.count++;
		this.instanceNumber = Inputy.count;
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

		this.element = element;
		this.parentForm = $(element).closest("form").addClass(this.settings.classes.inputyForm);

		this.init();
	};

	Inputy.count = 0;
	Inputy.prototype = {
		constructor: Inputy,

		// vars
		tmp: "",
		instanceNumber:0,

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
			this._formInput = $(formInput);
			$(this.parentForm).prepend(this._formInput);
		},

		bindEvents: function() {
			var element = $(this.element);
			var self = this;

			//If form exists, then I should delegate all events to it as container!!
			// But I would have trouble with overriding... (?)
			element.delegate("span." + this.settings.classes.inputyEditButton, "click", function(ev) {
				var touched = $(this).parent().parent(),
					inputyActive = self._buildActive();
				self.tmp = touched.clone();
				
				touched.html(inputyActive);
			});

			element.delegate("span." + this.settings.classes.inputySaveButton, "click", function(ev) {
				ev.preventDefault();
				ev.stopPropagation();
				var inputySelector = "input." + self.settings.classes.inputyInput,
					inputyValue = $(inputySelector).val();
				self._contentUpdate(inputyValue);
			});

			element.delegate("input." + this.settings.classes.inputyInput, "blur", function(ev) {
				ev.preventDefault();
				ev.stopPropagation();
				var inputySelector = "input." + self.settings.classes.inputyInput,
					inputyValue = $(inputySelector).val();
				self._contentUpdate(inputyValue);
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
			return $(this.element).prop("tagName").toLowerCase() + this.instanceNumber;		
		},

		_contentUpdate: function(inputValue) {
			if(inputValue) {
				this._setElementContent(inputValue);

			} else {
				this._setElementContent();
			}
		},

		_setElementContent: function(content) {
			if (content === undefined) {
				$(this.element).html(this.tmp.html());
			} else {
				$(this.element).html(this.setCleanText($(this.tmp), content).html());
				this._formInput.val(content);
			}
		},


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