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

$.widget( "an.page", {
	options: {
		mode:'browser',
		actionSets: [],
		wrapper:"<div/>",
		formIds:{
		    tabsx:["5080143085ac60df09000001","51306faad58d1c129f000000"],
			box:["5080143085ac60df09000001","50de56d0a092007b11000000","50ea38efa0920073870000ef"]
		}
	},

	_create: function() {
		this.element.addClass("an-page");
		var o = this.options, page = o[this.widgetName];
		$.extend(this, eval("try{("+(page.methods||"{}")+")}catch(e){}"));
		
		o.cssFiles = o.cssFiles || [];
		o.jsFiles = o.jsFiles || [];
		if(o.mobile){
			o.cssFiles = [""].concat(o.cssFiles);
			o.jsFiles = ["javascripts/jquery-1.8.2.js",
			             "javascripts/jquery.scrollto.js"].concat(o.jsFiles);
		}else{
			o.cssFiles = ["stylesheets/rte/rte-design.css",
			          "stylesheets/jquery-ui-1.8.24.custom.css",
			          "stylesheets/jquery.ui.timepicker.css",
			          "stylesheets/jquery.an.menu.css",
			          "stylesheets/jquery.an.agilegrid.css",
			          "stylesheets/jquery.an.tree.css",
			          "stylesheets/jquery.an.border.css",
			          "stylesheets/jquery.an.tabsx.css",
			          "stylesheets/jquery.an.toolbar.css",
			          "stylesheets/jquery.an.page.css",
			          "stylesheets/jquery.an.editor.css",
			          "stylesheets/jquery.an.formview.css",
			          "stylesheets/jquery.an.widget.css",
			          "stylesheets/jquery.an.tabsxwidget.css",
			          "stylesheets/jquery.an.box.css",
			          "stylesheets/jquery.an.fileinput.css",
			          "stylesheets/jquery.an.filefield.css",
			          "stylesheets/jquery.an.gridfield.css",
			          "stylesheets/jquery.colorpicker.css",
			          "stylesheets/jquery.ui.select.css",
			          "stylesheets/rte/paddinginput.css",
			          "stylesheets/jquery.an.rte.css",
			          "stylesheets/base.css"].concat(o.cssFiles);
	        o.jsFiles = ["javascripts/jquery-1.8.2.js",
	                     "javascripts/jquery.scrollto.js"].concat(o.jsFiles);	
		}
		
		this._initPage();
	},
	
	_initPage:function(){
		this.refresh();
	},
	
	_createOutline:function(){
		var self = this, page = this.options[this.widgetName], root = this._getPage();
		return {
			getRoots: function(mountNodes){
				var nodes = new Array();
				nodes.push({id:"root", text:page.title||page.name||page._id, "class":"folder"});
				mountNodes(nodes);
			},
			getChildren: function(parentNode, mountNodes){
				var nodes = new Array();
				if(parentNode.id == "root"){
					root.find(".widget").each(function(){
						var $this = $(this), id = $this.attr("id");
						if($this.parent().closest(".widget").length == 0){
							nodes.push({id:id, text:id, "class":self._isContainer($this)?"folder":"file", data:self._getWidgetObj($this)});
						}
					});
				}else{
					root.find("#"+parentNode.id).find(".widget").each(function(){
						var $this = $(this), id = $this.attr("id");
						if($this.parent().closest(".widget").attr("id") == parentNode.id){
							nodes.push({id:id, text:id, "class":self._isContainer($this)?"folder":"file", data:self._getWidgetObj($this)});
						}
					});
				}
				mountNodes(nodes);
			},
			hasChildren: function(node){ return node["class"]=="folder"; },
			getId: function(node){ return node.id ? node.id : null; }
		};
	},
	
	_isContainer:function(el){
		return el.is("[type=tabsx], [type=box]");
	},
	
	_getWidgetObj:function(el){
		var widget = null, type = el.attr("type");
		if(el.is(".box")){
			widget = el.data(type);
		}else if(el.is(".widget")){
			widget = el.data(type+"widget");
		}
		return widget;
	},
	
	option: function(key, value) {
		var o = this.options;
		if(key === "actionSets" && value === undefined){
			return this._createActionSets();
		}else if(key === "outline" && value === undefined){
			return this._createOutline();
		}else if(key == "content" && value == undefined){
			if(o.isDirty) this._syncPageContent();
			return o[this.widgetName].content;
		}
		var ret = $.Widget.prototype.option.apply(this, arguments ); 
		return ret === undefined ? null : ret; // return null not undefined, avoid to return this dom element.
	},

	_setOption: function(key, value) {
		var o = this.options, oldValue = o[key];
		if(!equals(value,oldValue)){
			$.Widget.prototype._setOption.apply(this, arguments );
			this._handleChange(key,value,oldValue);
			this._trigger("optionchanged",null,{key:key, value:value, oldValue:oldValue});
		}
		return this; 
	},
	
	_handleChange:function(key, value, oldValue){
		var o = this.options;
		if(key === "mode"){
			if(o.isDirty) this._syncPageContent();
			this.refresh();
		}else if(key === "page"){
			var page = o[this.widgetName];
			this.element.children("style").text(page.stylesheet);
			this.$page && !o.isDirty && this.$page.empty().html(page.content);
			if(this.rte){
				!o.isDirty && this.rte.rte("option","content",page.content);
				this.rte.rte("option","stylesheet", page.stylesheet);
			}
			this.refresh();
		}
	},

	refresh:function(){
		var o = this.options;
		this["_"+o.mode] && this["_"+o.mode]();
	},
	
	_browser:function(){
		this.rte && this.rte.hide();
		if(!this.$page){
			this._createPage();
		}else {
			this.$page.show();
			this._refreshWidgets();
		}
	},

	_edit:function(){
		this.rte && this.rte.hide();
		if(!this.$page){
			this._createPage();
		}else{
			this.$page.show();
			this._refreshWidgets();
		}
	},

	_design:function(){
		this.$page && this.$page.hide();
		if(!this.rte){
			this._createRTE();
		}else{
			this.rte.show();
			this._refreshWidgets();
		}
	},

	getWidget:function(id){
		var self = this, o = this.options, page = o[this.widgetName], widget = null;
		this._getPage().find("#"+id).each(function(){
			var $this = $(this), filter = (o.mode=="design"? ".an-box:not(.raw),."+page.name : ".an-page");
			$this.parent().closest(filter).each(function(){
				if($(this).is('.'+page.name) || this == self.element[0]){
					widget = self._getWidgetObj($this);
					return false;
				}
			});
			if(widget) return false;
		});
		return widget;
	},

	showWidget:function(){
		var self = this;
		$.each(arguments,function(){
			var w = self.getWidget(this);
			w && w.widget().show();
		});
	},
	
	hideWidget:function(){
		var self = this;
		$.each(arguments,function(){
			var w = self.getWidget(this);
			w && w.widget().hide();
		});
	},
	
	_createPage:function(){
		var o = this.options, page = o[this.widgetName], el = this.element;
		$('<style type="text/css">'+(page.stylesheet||"")+'</style>').appendTo(el);
		this.$page = $(o.wrapper).addClass(page.name).html(page.content).appendTo(el);

		var data = {};
		data[this.widgetName] = this;
		$.each(eval("("+(o[this.widgetName].actions||"[]")+")"), function(k,action){
			el.bind(action.events, data, action.handler);
		});
		
		this._refreshWidgets();
	},

	_createRTE:function(){
		var self = this, o = this.options, page = o[this.widgetName];
		this.rte = $("<div class = 'rte'/>").appendTo(this.element).rte({
			content:page.content,
			cssFiles:o.cssFiles,
			jsFiles:o.jsFiles,
			dbId:o.dbId,
			stylesheet:page.stylesheet,
			cssClass:page.name,
			restore:function(page){self._refreshWidgets(page); },
			clean:function(page){
			    page.find(".widget").each(function(){
					var $this = $(this),wid;
					wid = self._getWidgetObj($this);
					wid&&wid.destroy();
				});	
			},
			onload:function(){
				var sel = self.rte.rte("option","selection"), $doc = $(self.rte.rte("option","doc")); 
				$doc.bind("paste.page",function(e){
					setTimeout(function(){
						self._refreshWidgets();
						self.rte.rte("updatePath");
						self._trigger("change",null, self);
					},20);
				}).bind("widgetdblclick.page widgetclick.page widgetchange.page click.page",function(e, widget){
					$doc.find(".widget.selected").removeClass("selected");
					if(e.type == "widgetclick" || e.type == "widgetdblclick"){
						if(widget.selectable(e.originalEvent)){
							var el = widget.widget(); 
							el.addClass("selected");
							!$.browser.chrome&&sel.select(el[0]);
							self._trigger("widgetselect",null, widget);
						}
						self.rte.rte("updatePath");
						if(e.type=="widgetdblclick"){
							var type = widget.option("type");
							if(self.rteWidgetActive(type)) self.rteWidget(type);	
						}
					}
					self.rte.trigger(e, widget);
				});
				self._refreshWidgets();
				var data = {};
				data[self.widgetName] = self;
				self._trigger(self.widgetName+"create",null,data);
			}
		}).bind("change.page contentchange.page",function(e){
			self.option("isDirty",true);
			setTimeout(function(){ self._trigger("change",null, self);},20);
		}).bind("newwidget.page",function(e, widget){
			e.stopImmediatePropagation();
			self.refresh();
			self.option("isDirty",true);
			setTimeout(function(){ self._trigger("change",null, self);},20);
		});
	},

	_getPage:function(){
		return this.options.mode=="design" ? $(this.rte.rte("option","doc")): this.$page;
	},
	
	_refreshWidgets: function(page){
		var self = this;
		(page || this._getPage()).find(".widget").each(function(){
			self._refreshWidget($(this));
		});
		return this;
	},
	
	_refreshWidget: function(el){
		var self = this, o = this.options, type = el.attr("type");
		if(el.is(".box")){
			var actions = [], id = el.attr("id");
			$.each(o.boxToolbarActions||[],function(){
				if(this.boxName == id) actions.push(this);
			});
			if(el.is(".an-box")){
				el.data("box").option("mode", o.mode);
			}else{
				el.box({
					parent:function(){return self;},
					mode:o.mode,
					dbId:o.dbId,
					toolbarActions:actions,
					optionchanged:function(e,data){
						if(data.key == "metadata" || data.key == "attributes"){
							self.option("isDirty",true);
							setTimeout(function(){ self._trigger("change",null, self);},20);
						}
					}
				});
			}
		}else if(el.is("[type="+type+"]")){
			if(el.is(".an-"+type+"widget")){
				el.data(type+"widget").option("mode",o.mode);
			}else{
				el[type+"widget"]({
					parent:function(){return self;},
					mode:o.mode, 
					dbId:o.dbId,
					optionchanged:function(e,data){
						if(data.key == "metadata" || data.key == "attributes"){
							self.option("isDirty",true);
							setTimeout(function(){ self._trigger("change",null, self);},20);
						}
					}
				});
			}
		}
	},
	
	_createActionSets:function(){
		if(this.options.mode == "design"){
			return [this._controlActionSet(),this._formatActionSet(), this._tableActionSet()];
		}
	},

	_controlActionSet:function(){
		var actions = this.rte.rte("option","actions");
		return this._createActionSet(["properties","cleanFormat"],actions);
	},
	
	_formatActionSet:function(){
		var actions = this.rte.rte("option","actions");
		return this._createActionSet(["bold","italic","underline","strikethrough","subscript",
		        "superscript","alignLeft","alignCenter","alignRight","alignFull","font","fontSize",
		        "format","leftToRight","rightToLeft","fontColor","backgroundColor","outdent",
		        "indent","orderedList","unorderedList","link","deleteLink","horizontalRule",
		        "blockQuote","blockElement","stopFloat","image"],actions);
	},
	
	_tableActionSet:function(){
		var actions = this.rte.rte("option","actions");
		return this._createActionSet(["table","tableProps","deleteTable","rowBefore","rowAfter","deleteRow", 
		"columnBefore","columnAfter","deleteColumn", "cellProps","mergeCells",
		"splitCells"],actions);
	},

	_createActionSet:function(actionNames, actions){
		var actionSet = {};
		$.each(actionNames, function(){
			actionSet[this] = actions[this];
		});
		return actionSet;
	},

	_syncPageContent:function(){
		var page = this.options[this.widgetName];
		page.content = this.rte.rte("option","content");
		this.$page && this.$page.empty().html(page.content);
	},

	rteWidget: function(type,opts){
		this.rte && this.rte.rte("rteWidget", type, this.options.formIds[type], opts);
		return this;
	},
	
	rteWidgetActive: function(type){
		return this.rte && this.rte.rte("rteWidgetActive", type);
	},

	labelActive:function(){
		return this.rte && this.rte.rte("labelActive");
	},

	sourceCode:function(){
		if(this.rte){
			var mode = this.rte.rte("option", "mode");
			this.rte.rte("option", "mode", mode =="sourcecode"?"design":"sourcecode");	
		}
	},
	
	sourceCodeActive:function(){
		return this.rte && this.rte.rte("option", "mode") == "sourcecode"; 
	},
	
	// TODO: optimize following code.
	handler: function(){self.option("mode",o.mode =="sourcecode"?"design":"sourcecode");},
	checked: function(){return o.mode =="sourcecode";},
	
	highlightWidget: function(id, highlight){
		var w = this.getWidget(id); 
		w&&w.highlight(highlight);
		return this;
	},
	
	scrollTo: function(id, opts){
		var o = this.options;
		if(o.mode == "design"){
			var win = this.rte.rte("option","win");
			win.$("#"+id.replace(/\./g,"-")).ScrollTo(opts);
		}else{
			this.$page.find("#"+id).scrollTo(opts);
		}
	},
	
	save: function(){
		var self =this, o = this.options, page = o[this.widgetName];
		if(o.isDirty){
			this._syncPageContent();
			ModelupdateDocument(o.dbId, page._id,page,null,function(err,result){
				self.option("isDirty",false);
			});
		}
		return this;
	},
	
	print: function(){ 
		var o = this.options, loc = window.location, 
		      url = loc.protocol +"//"+loc.host+"/pdfs?dbid="+o.dbId+"&pageid="+o[this.widgetName]._id;
		print(url);
		return this;
	},
	
	destroy: function() {
		$(this.options.document).unbind(".page");
		this.element.unbind(".page").removeClass("an-page").children("style").remove();
		return $.Widget.prototype.destroy.apply( this, arguments );
	}
});
})( jQuery );