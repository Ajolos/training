jQuery.sap.require("training.fiori.traningApp.utils.CurrencyType");

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller,History) {
	"use strict";

	return Controller.extend("training.fiori.traningApp.controller.MemberEdit", {
		onInit: function () {
            // standardowa funkcja kontrolera; wywoływana jednokrotnie, w chwili gdy widok zostanie zbudowany po raz pierwszy

            // przypięcie funkcji do zdarzenia "dopasowania" ścieżki nawigacji; funkcja zostanie uruchomiana za każdym razem gdy nastąpi nawigacja do ekranu
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("MemberEdit").attachMatched(this._routeMatched, this);
            
            this.getView().setModel(new sap.ui.model.json.JSONModel({ "editMode": undefined }),"display");
            
		},
		
		_routeMatched: function(oEvent){
		    // funkcja wywoływana przy każdym wejściu na ekran rejestracji użytkownika
		    
		    // zresetowanie zmian w modelu, jeśli jakieś istnieją
		    var m = this.getView().getModel();
		    if(m.hasPendingChanges()){
		        m.resetChanges();
		    }
		    
		    // domyślnie uruchamiany jest tryb podglądu
	        this.getView().getModel("display").setProperty("/editMode", false);

            // pobranie argumentów ze ścieżki
		    var args = oEvent.getParameter("arguments");
		    if(args.UserName && args.UserName.length){
		        
		        // oglądany obiekt będzie dostępny w OData pod poniższą ścieżką
		        var path = "/DetailsSet('" + args.UserName + "')";
		        
		        // podpięcie obiektu z modelu pod stronę "editPage"
		        this.getView().byId("editPage").bindElement({ 
		            path: path,
		            events: {
		                "dataReceived": function(evt){
		                    
		                    // jeśli OData zwróci błąd, przekierowanie do strony błędu
		                    if(typeof evt.getParameter("data") === "undefined"){
		                        sap.ui.core.UIComponent.getRouterFor(this).navTo("NotFound", true);
		                    }
		                    
		                }.bind(this)
		            }
		        });
		    }else{
		        
		        // jeśli błąd w argumentach ścieżki, przekierowanie do strony błędu
		        sap.ui.core.UIComponent.getRouterFor(this).navTo("NotFound", true);
		        
		    }
		},
		
		editPress: function(){
		    var rb = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		    var ctx = this.getView().byId("editPage").getBindingContext();
		    var o = ctx.getObject();
		    
		    this.getView().getModel().callFunction("/EditAuthCheck",{
		        urlParameters: {
		            "UserName": o.UserName
		        },
		        success: function(d){
		            
		            // żądanie przetworzone pomyślnie
		            if(d.EditAuthCheck.Authorized){
		                
		                // autoryzacja uzyskana
		                this.getView().getModel("display").setProperty("/editMode", true);
		                
		            }else{
		                
		                // brak autoryzacji
		                sap.m.MessageBox.error(rb.getText("MSG_Unauthorized"));
		                
		            }
		        }.bind(this),
		        error: function(e){
		            
		            // obsługa błędów
		            sap.m.MessageBox.error(rb.getText("MSG_Unauthorized"));
		        }.bind(this)
		    });
		},
		
		cancelPress: function(){
		    this.getView().getModel().resetChanges();
		    this.getView().getModel("display").setProperty("/editMode", false);
		},
		
		savePress: function(){
		    
		    // funkcja wywoływana przy zapisie nowego użytkownika
		    
		    var m = this.getView().getModel();
		    if(m.hasPendingChanges()){
		        
		        // wyślij wszystkie zmiany w modelu do systemu backendowego
		        m.submitChanges({
		            success: function(d){
		                var errorOccured = false, messages = [];
		                var rb = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		                
		                /* przetwarzanie zbiorcze zmian zakończone TECHNICZNYM sukcesem (nie oznacza że rekord
		                   został utworzony poprawnie - jedynie że pod względem formalnym request został poprawnie
		                   przeprocesowany przez interfejs OData) */
		                   
		                d.__batchResponses.forEach(function(response){
		                   
		                    // jeśli wystąpił błąd w changesecie, będzie on miał status nie mniejszy niż 400
		                    if(response.statusCode && parseInt(response.statusCode,10) >= 400 
		                        || response.response && response.response.statusCode && parseInt(response.response.statusCode,10) >= 400){
		                            errorOccured = true;
		                   
		                            // zbieramy wszystkie wiadomości do jednego kontenera, który potem zostanie wyświetlony
		                            var message;
		                            try{
		                                message = JSON.parse(response.response.body).error.message.value;
		                            }catch(err){
		                                message = JSON.stringify(response);
		                            }
		                            messages.push(message);
		                    }
		                },this);
		        
		                if(!errorOccured){
		                    // nie wystąpił żaden błąd - komunikat o sukcesie
		                    sap.m.MessageToast.show(rb.getText("MSG_ChangesSaved"));
		                    this.getView().getModel("display").setProperty("/editMode",false);
		                }else{
		                    // były błędy - wyświetlenie kontenera z opisem błędów
		                    sap.m.MessageBox.error(messages.join("\n"));
		                }
		                
		            }.bind(this),
		            error: function(e){
		                
		                /* przetwarzanie zbiorcze zmian zakończone TECHNICZNYM błędem - wystąpił problem na poziomie
		                   interfejsu OData, np. nieprawidłowa (za długa) wartość w polu o ograniczonej długości */
		                var message = JSON.parse(e.responseText);
		                sap.m.MessageBox.error(message);
		                
		            }
		        });
		    }else{
		        
		        // jeśli nie wprowadzono żadnych zmian - wyjście z trybu edycji
		        this.getView().getModel("display").setProperty("/editMode",false);
		    }
		},
		
		deregisterPress: function(){
		    var ctx = this.getView().byId("editPage").getBindingContext();
		    var rb = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		    
		    // wywołanie funkcji usuwającej wpis w systemie backend 
		    ctx.getModel().remove(ctx.getPath(),{
		       success: function(){
		           sap.m.MessageBox.information(rb.getText("MSG_Deregistered"),{
		               onClose:function(){
		                   var oHistory = History.getInstance();
                		   var sPreviousHash = oHistory.getPreviousHash();
                		   if(sPreviousHash !== undefined){
                			   window.history.go(-1);
                		   }   
		               }.bind(this)
		           });
		       }.bind(this),
		       error: function(e){
		           
		           // obsługa błędów
		           var message;
		           try{
		               message = JSON.parse(e.responseText).error.message.value;
		           }catch(err){
		               message = JSON.stringify(e);
		           }
		           sap.m.MessageBox.error(message);
		       }
		    });
		}
	});
});