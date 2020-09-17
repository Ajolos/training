sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("training.fiori.traningApp.controller.MembersList", {
		onInit: function () {
            // standardowa funkcja kontrolera; wywoływana jednokrotnie, w chwili gdy widok zostanie zbudowany po raz pierwszy
		},
		
		formatInfo: function(txt, date, time){
		    // funkcja formatująca dane; wywoływana za każdym razem, gdy zmianie ulegnie którakolwiek z powiązanych wartości w modelu
		    
		    var localDate = new Date(date);
		    localDate.setMilliseconds(time.ms);
		    return txt.replace("{0}",localDate.toLocaleString());
		},
		
		executeSearch: function(oEvent){
		    // funkcja obsługująca zdarzenie; wywoływana za każdym razem, gdy zdarzenie wystąpi
		    
		    this.getView().byId("membersList")
		        .getBinding("items").filter(
		            new sap.ui.model.Filter(
		                "UserName", 
		                sap.ui.model.FilterOperator.Contains, 
		                oEvent.getParameter("query").toUpperCase()
		            )
		        );
		 }
	});
});