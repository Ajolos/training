jQuery.sap.require("training.fiori.traningApp.utils.CurrencyType");

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller,History) {
	"use strict";

	return Controller.extend("training.fiori.traningApp.controller.MemberCreate", {
		onInit: function () {
            // standardowa funkcja kontrolera; wywoływana jednokrotnie, w chwili gdy widok zostanie zbudowany po raz pierwszy

            // przypięcie funkcji do zdarzenia "dopasowania" ścieżki nawigacji; funkcja zostanie uruchomiana za każdym razem gdy nastąpi nawigacja do ekranu
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("MemberCreate").attachMatched(this._routeMatched, this);
		},
		
		_routeMatched: function(){
		    // funkcja wywoływana przy każdym wejściu na ekran rejestracji użytkownika
		    
		    // zresetowanie zmian w modelu, jeśli jakieś istnieją
		    var m = this.getView().getModel();
		    if(m.hasPendingChanges()){
		        m.resetChanges();
		    }
		    
		    // utworzenie lokalnie nowego wpisu w modelu i przypięcie go do widoku
		    var context = m.createEntry("/DetailsSet",{
		        error: function(e){ 
		                    // funkcja, która zostanie wywołana, jeśli tworzenie rekordu w systemie zakończy się błędem
		                    this._handleError(e); 
                    }.bind(this),
		        success: function(d){ 
		                    // funkcja, która zostanie wywołana, jeśli tworzenie rekordu w systeime zakończy się błędem
		                    this._handleSuccess(d); 
		            }.bind(this)
		    });
		    this.getView().byId("createForm").setBindingContext(context);
		},
		
		savePress: function(){
		    // funkcja wywoływana przy zapisie nowego użytkownika
		    
		    var m = this.getView().getModel();
		    if(m.hasPendingChanges()){
		        // wyślij wszystkie zmiany w modelu do systemu backendowego
		        m.submitChanges({
		            success: function(d){
		                /* przetwarzanie zbiorcze zmian zakończone TECHNICZNYM sukcesem (nie oznacza że rekord
		                   został utworzony poprawnie - jedynie że pod względem formalnym request został poprawnie
		                   przeprocesowany przez interfejs OData) */
		            },
		            error: function(e){
		                /* przetwarzanie zbiorcze zmian zakończone TECHNICZNYM błędem - wystąpił problem na poziomie
		                   interfejsu OData, np. nieprawidłowa (za długa) wartość w polu o ograniczonej długości  */
		                var message = JSON.parse(e.responseText);
		                sap.m.MessageBox.error(message);
		            }
		        });
		    }
		},
		
		_handleError: function(e){
		    // wystąpił błąd tworzenia rekordu w systemie
		    
		    var message;
		    try{
		        // w tym miejscu jest tekst wyjątku /iwbep/cx_mgw_busi_exception
		        message = JSON.parse(e.responseText).error.message.value;
		    }catch(err){
		        // procedura awaryjna, gdyby nie udało sie przeczytać błędu z wyjątku
		        message = JSON.stringify(e);
		    }	               
		    // wyświetlenie standardowego popupu z błędem 
		    sap.m.MessageBox.error(message);
		},
		
		_handleSuccess: function(d){
		    // pobranie tekstu wiadomości o sukcesie z modelu i18n
		    var message = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("MSG_Success");
		    // wyświetlenie standardowego pupupu z informacją 
		    sap.m.MessageBox.information(message, {
		        onClose: function(){
		            // nawigacja "wstecz" po zamknięciu komunikatu
		            var oHistory = History.getInstance();
        			var sPreviousHash = oHistory.getPreviousHash();
        			if(sPreviousHash !== undefined){
        			    window.history.go(-1);
        			}        
		        }
		    });
		}
	});
});