/*!
 * Agile Notes 1.0
 *
 * Copyright 2013, Sihong Zhu and other contributors
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) version 2 licenses.
* This software is not distributed under version 3 or later of the GPL.
 *
 * http://agilemore.com/agilenotes
 */

(function( $, undefined ) {

$.widget( "an.datetimefield", $.an.inputfield, {
	
	_create: function() {
		$.an.inputfield.prototype._create.apply(this, arguments);
		this.element.addClass("an-datetimefield");
	},
	
	_edit:function(){
		var date=new Date(), lng=window.database.local,
		opts={
			hour: date.getHours(),
            minute: date.getMinutes(),
			dateFormat: this.options.dateFormat?this.options.dateFormat:'mm/dd/yy',
			minDate: this.options.minDate && eval("("+ this.options.minDate +")") || null,
			maxDate: this.options.maxDate && eval("("+ this.options.maxDate +")") || null,
			changeMonth:true,
			changeYear:true,
			onClose: function() {
				var $this = $(this);
				$this.valid&&$this.valid();
			}
		};
		
		if(lng&&lng!='en'){
			$.extend(opts,$.i18n.datepicker);
		}
		
		$.an.inputfield.prototype._edit.apply( this, arguments );
		
		this.input.removeClass("hasDatepicker");
		if(this.options.time=='y'){
			this.input.datetimepicker(opts);
		}else{
			this.input.datepicker(opts);
		}
	},
	
	destroy: function() {
		this.input.datepicker("destroy");
		this.element.removeClass("an-datetimefield" );
		return $.an.inputfield.prototype.destroy.apply( this, arguments );
	}
});
})( jQuery );
