jQuery.fn.mousehold = function (f) {
    var timeout = 100;
    if (f && typeof f == 'function') {
        var intervalId = 0;
        var firstStep = false;
        var clearMousehold = undefined;
        return this.each(function () {
            $(this).mousedown(function () {
                firstStep = true;
                var ctr = 0;
                var t = this;
                intervalId = setInterval(function () {
                    ctr++;
                    f.call(t, ctr);
                    firstStep = false;
                }, timeout);
            });

            clearMousehold = function () {
                clearInterval(intervalId);
                if (firstStep) f.call(this, 1);
                firstStep = false;
            };

            $(this).mouseout(clearMousehold);
            $(this).mouseup(clearMousehold);
        });
    }
};

$(function () {
    $.extend($.fn.disableTextSelect = function () {
        return this.each(function () {
            if ($.browser.mozilla) {//Firefox
                $(this).css('MozUserSelect', 'none');
            } else if ($.browser.msie) {//IE
                $(this).bind('selectstart', function () { return false; });
            } else {//Opera, etc.
                $(this).mousedown(function () { return false; });
            }
        });
    });
});

!function ($) {

    var SpinEdit = function (element, options) {
        this.element = $(element);
        this.element.addClass("spinedit");
        this.element.addClass("noSelect");
        this.intervalId = undefined;

        var hasOptions = typeof options == 'object';

        this.minimum = $.fn.spinedit.defaults.minimum;
        if (hasOptions && typeof options.minimum == 'number') {
            this.setMinimum(options.minimum);
        }

        this.maximum = $.fn.spinedit.defaults.maximum;
        if (hasOptions && typeof options.maximum == 'number') {
            this.setMaximum(options.maximum);
        }

        this.value = $.fn.spinedit.defaults.value;
        if (hasOptions && typeof options.value == 'number') {
            this.setValue(options.value);
        }
        this.element.val(this.value);

        this.step = $.fn.spinedit.defaults.step;
        if (hasOptions && typeof options.step == 'number') {
            this.setStep(options.step);
        }

        var template = $(DRPGlobal.template);
        this.element.after(template);
        template.disableTextSelect();

        template.find('.icon-chevron-up').mousehold($.proxy(this.increase, this));
        template.find('.icon-chevron-down').mousehold($.proxy(this.decrease, this));
        this.element.on('keydown', $.proxy(this._keydown, this));
        this.element.on('blur', $.proxy(this._checkConstraints, this));
    };

    SpinEdit.prototype = {
        constructor: SpinEdit,

        setMinimum: function (value) {
            this.minimum = parseInt(value);
        },

        setMaximum: function (value) {
            this.maximum = parseInt(value);
        },

        setStep: function (value) {
            this.step = parseInt(value);
        },

        setValue: function (value) {
            value = parseInt(value);
            if (value < this.minimum)
                value = this.minimum;
            if (value > this.maximum)
                value = this.maximum;
            this.value = value;
            this.element.val(this.value);
        },

        increase: function () {
            if (this.value >= this.maximum)
                return;

            this.value += this.step;
            this.element.val(this.value);
            this._triggerValueChanged();
        },

        decrease: function () {
            if (this.value <= this.minimum)
                return;

            this.value -= this.step;
            this.element.val(this.value);
            this._triggerValueChanged();
        },

        _keydown: function (event) {
            // Allow: backspace, delete, tab, escape, enter, home, end, left, right, -
            if (event.keyCode == 109 || event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
			   (event.keyCode >= 35 && event.keyCode <= 39)) {
                return;
            }
            else {
                // Ensure that it is a number and stop the keypress
                if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                    event.preventDefault();
                }
            }
        },

        _checkConstraints: function (e) {
            var target = $(e.target);
            var value = parseInt(target.val());
            if (this.value == value) {
                return;
            }

            if (value <= this.minimum)
                value = this.minimum;
            if (value >= this.maximum)
                value = this.maximum;

            this.value = value;
            this.element.val(this.value);
            this._triggerValueChanged();
        },

        _triggerValueChanged: function () {
            this.element.trigger({
                type: "valueChanged",
                value: this.value
            });
        }
    };

    $.fn.spinedit = function (option) {
        var args = Array.apply(null, arguments);
        args.shift();
        return this.each(function () {
            var $this = $(this),
				data = $this.data('spinedit'),
				options = typeof option == 'object' && option;

            if (!data) {
                $this.data('spinedit', new SpinEdit(this, $.extend({}, $.fn.spinedit().defaults, options)));
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                data[option].apply(data, args);
            }
        });
    };

    $.fn.spinedit.defaults = {
        value: 0,
        minimum: 0,
        maximum: 100,
        step: 1
    };

    $.fn.spinedit.Constructor = SpinEdit;

    var DRPGlobal = {};

    DRPGlobal.template =
	'<div class="spinedit">' +
	'<i class="icon-chevron-up"></i>' +
	'<i class="icon-chevron-down"></i>' +
	'</div>';

}(window.jQuery);