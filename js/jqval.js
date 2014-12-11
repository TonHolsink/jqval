/*!
 * Validator v0.6.0 for Bootstrap 3, by @1000hz
 * Copyright 2014 Spiceworks, Inc.
 * Licensed under http://opensource.org/licenses/MIT
 *
 * https://github.com/1000hz/bootstrap-validator
 */

+function ($) {
	'use strict';

	// UTILITY FUNCS
	// ==========================
	function K(x) { return x };

	function any(coll, iterator, context) {
		iterator = iterator || K;
		var result = false;
		jQuery.each(coll, function(index, el) {
			// console.log(context, index, el, this);
			if (result = !!iterator.call(context, el, index, this)) return false;
		});
		return result;
	};

	function isEmpty(v) {
		return ((v == null) || (v.length == 0)); // || /^\s+$/.test(v));
	}

	// VALIDATOR CLASS DEFINITION
	// ==========================

	var Validator = function (element, options) {
		this.$element = $(element);
		this.options = options;

		this.$element.attr('novalidate', true); // disable automatic native validation
		this.toggleSubmit();

		this.$element.on('input.bs.validator change.bs.validator focusout.bs.validator', $.proxy(this.validateInput, this));
		this.$element.on('submit.bs.validator', $.proxy(this.onSubmit, this));

		this.$element.find('[data-match]').each(function () {
			var $this = $(this);
			var target = $this.data('match');

			$(target).on('input.bs.validator', function (e) {
				$this.val() && $this.trigger('input');
			});
		});
	}

	Validator.DEFAULTS = {
		delay: 500,
		html: false,
		errors: {
			match: 'Velden komen niet overeen',
			notmatch: 'Velden komen overeen',
			regexp: 'Waarde komt niet overeen met het patroon',
			minlength: 'Niet lang genoeg',
			maximum: 'Waarde is te groot',
			minimum: 'Waarde is niet groot genoeg',
			//WERKT NIET GOED
			// minchecked: 'Te weinig opties geselecteerd',
			email: 'Geef een geldig e-mail adres. Bijvoorbeeld fred@domain.com',
			req: 'Dit is een verplicht veld',
			onereq: 'Kies een van de opties',
			number: 'Voer een geldig nummer in',
			postal: 'Deze postcode is niet goed. Gebruik geen spatie. Bijvoorbeeld 1234AB',
			digits: 'Gebruik alleen cijfers. Punten, komma\'s en streepjes zijn niet toegestaan.',
			alpha: 'Gebruik alleen letters (a-z).',
			alphanum: 'Gebruik alleen letters (a-z) of cijfers (0-9). Spaties of andere tekens zijn niet toegestaan.',
			date: 'Geef een geldige datum op (dd-mm-yyyy).',
			phone: 'Geef een geldig telefoonnummer. Gebruik alleen cijfers, bijvoorbeeld 0101245678.',
			url: 'Geef een geldige URL',
			bsn: 'Dit burgerservicenummer is niet goed',
			ip: 'Dit ip-adres is niet goed',
			amount: 'Dit bedrag is niet goed',
			domesticaccountnr: 'Dit bankrekeningnummer is niet goed',
			iban: 'Dit bankrekeningnummer is niet goed',
			ext: 'Het bestandstype is niet toegestaan',
			selection: 'Maak een keuze'
		},
		formErrorMsg: '.formErrorMsg',
		hidden: false //if true also hidden enabled fields are validated otherwise only enabled fields
	}

	Validator.VALIDATORS = {
		native: function ($el) {
			var el = $el[0];
			return el.checkValidity ? el.checkValidity() : true;
		},
		match: function ($el) {
			var target = '#' + $el.data('match');
			return !$el.val() || $el.val() === $(target).val();
		},
		notmatch: function ($el) {
			var target = '#' + $el.data('notmatch');
			return !$el.val() || $el.val() !== $(target).val();
		},
		regexp: function ($el) {
			var regexp = new RegExp($el.data('regexp'), 'g');
			return !$el.val() || regexp.test($el.val());
		},
		minlength: function ($el) {
			var minlength = $el.data('minlength');
			return !$el.val() || $el.val().length >= minlength;
		},
		minimum: function ($el) {
			var min = $el.data('minimum');
			return !$el.val() || $el.val() >= parseFloat(min);
		},
		maximum: function ($el) {
			var max = $el.data('maximum');
			return !$el.val() || $el.val() <= parseFloat(max);
		},
		req: function($el) {
			if ($el.attr('type') == 'checkbox') {
				return $el.prop("checked");
			} else {
				return !!$.trim($el.val());
			}
		},
		//WERKT NIET GOED
		// minchecked: function($el) {
		// 	var p = $el.closest('.form-group');
		// 	var minchecked = p.data('minchecked');
		// 	var result = p.find('input:checked');
		// 	console.log('========================');
		// 	console.log(minchecked);
		// 	console.log(result.length);
		// 	console.log(result && result.length >= minchecked);
		// 	return result && (result.length >= minchecked);
		// },
		ext: function($el) {
			var allowed = $el.data('ext').split(/\s/);
			var v = $el.val();
			var lastPoint = v.lastIndexOf(".");
			var ext = v.substring(lastPoint+1).toLowerCase();
			return ($.inArray(ext, allowed) > -1);
		},
		number: function($el) {
			return !$el.val() || (!isNaN($el.val()) && !/^\s+$/.test($el.val()));
		},
		postal: function($el) {
			return !$el.val() || /^\d{4}[a-zA-Z]{2}$/.test($el.val());
		},
		digits: function($el) {
			return !$el.val() || !/[^\d]/.test($el.val());
		},
		alpha: function($el) {
			return !$el.val() || /^[a-zA-Z]+$/.test($el.val());
		},
		alphanum: function($el) {
			return !$el.val() || !/\W/.test($el.val());
		},
		date: function($el) {
			var pcFormat = /^(0[1-9]|[12][0-9]|3[01])([-])(0[1-9]|1[012])\2(19|20)\d\d$/;
			var v = $el.val();
			if (isEmpty(v)) {
				return true;
			}
			if (!pcFormat.test(v)) {
				return false;
			} else {
				var day = v.substr(0,2);
				var month = v.substr(3,2);
				var year = v.substr(6,4);
				if (day > 31 || month > 12) {
					return false;
				}
				return true;
			}
		},
		email: function ($el) {
			return !$el.val() || /\w{1,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/.test($el.val());
		},
		phone: function($el) {
			return !$el.val() || /^(0\d{9})$/.test($el.val());
		},
		url: function($el) {
			return !$el.val() || /^((http|https|ftp):\/\/)?(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i.test($el.val());
		},
		onereq: function($el) {
			//$el geeft alle radio's in een form-group
			// var p = $($el.get(0))).parent('.form-group');

			return any($el, function(el) {
				return $(el).prop("checked");
			});
		},
		bsn: function($el) {
			var v = $el.val();
			if(!v) return true;
			var sum = 0;
			var i =0;
			for (i = 0; i < v.length; i++) {
				if (i == (v.length - 1)) {
					sum = sum - 1 * v.charAt(i);
				} else {
					sum = sum + (9 - i) * v.charAt(i);
				}
			}
			if ((sum % 11) != 0 ) {
				return false;
			}
			return true;
		},
		ip: function($el) {
			return !$el.val() || /^\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b$/.test($el.val());
		},
		amount: function($el) {
			return !$el.val() || /^([0-9])+([,][0-9]{2})?$/.test($el.val());
		},
		domesticaccountnr: function($el) {
			// var v = $el.val();
			// v = v.replace(/\./g, "");
			// return !$el.val() || (/^([1-9][0-9]{1,9})?$/.test(v) || v.length <= 10);

			var v = $el.val().replace(/\./g, "");
			if (!/^([1-9][0-9]{1,9})?$/.test(v) || v.length > 10) {
				return false;
			}
			return true;

		},
		iban: function($el) {
			var v = $el.val().replace(/\./g, "");
			//Je kunt dynamisch data-domesticaccountnr vervangen door data-iban afh van payMethod!!!!
			var payMethod = document.getElementById('payMethod').value;
			if (payMethod == 'IDEAL' || payMethod == 'overschrijving'){
				var newIban = v.toUpperCase(),
					modulo = function (divident, divisor) {
						var m = 0;
						for (var i = 0; i < divident.length; ++i)
						m = (m * 10 + parseInt(divident.charAt(i))) % divisor;
						return m;
					};

				if (newIban.search(/^[A-Z]{2}/gi) < 0) {
					return false;
				}

				newIban = newIban.substring(4) + newIban.substring(0, 4);

				newIban = newIban.replace(/[A-Z]/g, function (match) {
					return match.charCodeAt(0) - 55;
				});

				return parseInt(modulo(newIban, 97), 10) === 1;

			} else {
				if (!/^([1-9][0-9]{1,9})?$/.test(v) || v.length > 10) {
					return false;
				}
				return true;
			}
		},
		selection: function($el) {
			var elm = $el.get(0);
			return elm.options ? elm.selectedIndex > 0 : !$el.val();
		},

	}

	Validator.prototype.validateInput = function (e) {
		var $el = $(e.target);
		var prevErrors = $el.data('bs.validator.errors');
		var errors;

		if ($el.is('[type="radio"]')) $el = this.$element.find('input[name="' + $el.attr('name') + '"]');

		this.$element.trigger(e = $.Event('validate.bs.validator', {relatedTarget: $el[0]}));

		if (e.isDefaultPrevented()) return;

		var self = this;

		this.runValidators($el).done(function (errors) {
			$el.data('bs.validator.errors', errors);

			errors.length ? self.showErrors($el) : self.clearErrors($el);

			if (!prevErrors || errors.toString() !== prevErrors.toString()) {
				e = errors.length
					? $.Event('invalid.bs.validator', {relatedTarget: $el[0], detail: errors})
					: $.Event('valid.bs.validator', {relatedTarget: $el[0], detail: prevErrors});

				self.$element.trigger(e);
			}

			self.toggleSubmit();

			self.$element.trigger($.Event('validated.bs.validator', {relatedTarget: $el[0]}));
		});
	}

	Validator.prototype.runValidators = function ($el) {
		var errors = [];
		var validators = [Validator.VALIDATORS.native];
		var deferred = $.Deferred();
		var options = this.options;

		$el.data('bs.validator.deferred') && $el.data('bs.validator.deferred').reject();
		$el.data('bs.validator.deferred', deferred);

		function getErrorMessage(key) {
			return $el.data(key + '-error')
				|| $el.data('error')
				|| key == 'native' && $el[0].validationMessage
				|| options.errors[key];
		}

		$.each(Validator.VALIDATORS, $.proxy(function (key, validator) {
			if (($el.data(key) || key == 'native') && !validator.call(this, $el)) {
				var error = getErrorMessage(key)
				!~errors.indexOf(error) && errors.push(error);
			}
		}, this));

		if (!errors.length && $el.val() && $el.data('remote')) {
			this.defer($el, function () {
				$.get($el.data('remote'), [$el.attr('name'), $el.val()].join('='))
					.fail(function (jqXHR, textStatus, error) { errors.push(getErrorMessage('remote') || error) })
					.always(function () { deferred.resolve(errors)});
			});
		} else deferred.resolve(errors);

		return deferred.promise();
	}

	Validator.prototype.validate = function () {
		var delay = this.options.delay;

		this.options.delay = 0;
		this.$element.find(':input').trigger('input');
		this.options.delay = delay;

		return this;
	}

	Validator.prototype.showErrors = function ($el) {
		var method = this.options.html ? 'html' : 'text';

		this.defer($el, function () {
			var $group = $el.closest('.form-group');
			var $block = $group.find('.help-block.with-errors');
			var errors = $el.data('bs.validator.errors');

			if (!errors.length) return;

			errors = $('<ul/>')
				.addClass('list-unstyled')
				.append($.map(errors, function (error) { return $('<li/>')[method](error) }));

			$block.data('bs.validator.originalContent') === undefined && $block.data('bs.validator.originalContent', $block.html());
			$block.empty().append(errors);

			$group.addClass('has-error');

		});
	}

	Validator.prototype.clearErrors = function ($el) {
		var $group = $el.closest('.form-group');
		var $block = $group.find('.help-block.with-errors');

		$block.html($block.data('bs.validator.originalContent'));
		$group.removeClass('has-error');
	}

	Validator.prototype.hasErrors = function () {
		function fieldErrors() {
			return !!($(this).data('bs.validator.errors') || []).length;
		}
		var method = this.options.hidden ? ':input:enabled' : ':input:enabled:visible';
		var result = !!this.$element.find(method).filter(fieldErrors).length;
/****************************************
		var $el = $('#errorhandle');
		if ($el.length > 0) {
			if (result) {
				$el.removeClass('hidden');
			} else {
				$el.addClass('hidden');
			}
		}
******************************************/
		return result;
	}

	Validator.prototype.isIncomplete = function () {
		function fieldIncomplete() {
			return this.type === 'checkbox' ? !this.checked :
						this.type === 'radio' ? !$('[name="' + this.name + '"]:checked').length :
						$.trim(this.value) === '';
		}

		var method = this.options.hidden ? ':input[required]:enabled' : ':input[required]:enabled:visible';
		var result = !!this.$element.find(method).filter(fieldIncomplete).length;
/****************************************
		var $el = $('#errorhandle');
		if ($el.length > 0) {
			if (result) {
				$el.removeClass('hidden');
			} else {
				$el.addClass('hidden');
			}
		}
******************************************/
		return result;
	}

	Validator.prototype.onSubmit = function (e) {
		this.validate();
		if (this.isIncomplete() || this.hasErrors()) {
			e.preventDefault();
			var $el = $('#errorhandle');
			if ($el.length > 0) {
				$el.removeClass('hidden');
				$('html, body').animate({
					scrollTop: 0
				}, 1000);
			}
		} else {
			$('#errorhandle').addClass('hidden');
		}
	}

	Validator.prototype.toggleSubmit = function () {
		var $btn = this.$element.find('input[type="submit"], button[type="submit"]');
		$btn.toggleClass('disabled', this.isIncomplete() || this.hasErrors())
			.css({'pointer-events': 'all', 'cursor': 'pointer'});

		this.showFormError($btn.hasClass('disabled'));
	}

	Validator.prototype.defer = function ($el, callback) {
		if (!this.options.delay) return callback();
		window.clearTimeout($el.data('bs.validator.timeout'));
		$el.data('bs.validator.timeout', window.setTimeout(callback, this.options.delay));
	}

	Validator.prototype.destroy = function () {
		this.$element
			.removeAttr('novalidate')
			.removeData('bs.validator')
			.off('.bs.validator');

		this.$element.find(':input')
			.removeData(['bs.validator.errors', 'bs.validator.deferred', 'bs.validator.timeout'])
			.off('.bs.validator');

		this.$element.find('.help-block.with-errors').each(function () {
			var $this = $(this);
			var originalContent = $this.data('bs.validator.originalContent');

			$this
				.removeData('bs.validator.originalContent')
				.html(originalContent);
		});

		this.$element.find('input[type="submit"], button[type="submit"]').removeClass('disabled');

		this.$element.find('.has-error').removeClass('has-error');

		return this;
	}

	Validator.prototype.showFormError = function (hasErr) {
		(this.$element).find(this.options.formErrorMsg).toggleClass('hidden', !hasErr);
		return;
	}

	// VALIDATOR PLUGIN DEFINITION
	// ===========================


	function Plugin(option) {
		return this.each(function () {
			var $this = $(this);
			var options = $.extend({}, Validator.DEFAULTS, $this.data(), typeof option == 'object' && option);
			var data = $this.data('bs.validator');

			if (!data && option == 'destroy') return;
			if (!data) $this.data('bs.validator', (data = new Validator(this, options)));
			if (typeof option == 'string') data[option]();
		});
	}

	var old = $.fn.validator;

	$.fn.validator = Plugin;
	$.fn.validator.Constructor = Validator;


	// VALIDATOR NO CONFLICT
	// =====================

	$.fn.validator.noConflict = function () {
		$.fn.validator = old;
		return this;
	}


	// VALIDATOR DATA-API
	// ==================

	$(window).on('load', function () {
		$('form[data-toggle="validator"]').each(function () {
			var $form = $(this);
			Plugin.call($form, $form.data());
		});
	});

}(jQuery);
