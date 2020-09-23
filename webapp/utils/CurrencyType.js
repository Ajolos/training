jQuery.sap.declare("training.fiori.trainingApp.utils.CurrencyType");

(function() {
	"use strict";
	sap.ui.define([
		"sap/ui/model/SimpleType",
		"sap/ui/model/ValidateException"
	], function(SimpleType, ValidateException) {
		return SimpleType.extend("training.fiori.trainingApp.utils.CurrencyType", {
			formatValue: function(sValue) {
				// funkcja wywoływana przy przepisywaniu wartości sValue z modelu na widok
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                  maxFractionDigits: 2,
                  groupingEnabled: true,
                  groupingSeparator: " ",
                  decimalSeparator: ","
                }); 
                return oNumberFormat.format(sValue);

			},
			parseValue: function(sValue) {
			    // funkcja wywoływana przy przepisywaniu wartości sValue z widoku do modelu
			    var outValue = sValue.replace(/[\,\s]/g,".");
			    outValue = parseFloat(outValue);
				return isNaN(outValue) ? "0.00" : outValue.toFixed(2);
			},
			validateValue: function() {
			    // opcjonalna funkcja do weryfikacji czy wpisana wartość jest prawidłowa
				return true;
			}
		});
	});
})();