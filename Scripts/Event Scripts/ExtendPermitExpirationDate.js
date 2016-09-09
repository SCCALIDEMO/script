/*===================================================================
// Script Number: 16
// Script Name: ExtendPermitExpirationDate
// Script Developer: Bryan de Jesus
// Script Agency: Woolpert
// Script Description: Adds 181 days to ‘Permit Expiration’ key date upon completion of each inspection, unless the inspection status equals “Not Inspected” or “Not Ready”, or if the “Supervisor Over Ride” field is equal to “Yes”
// Script Run Event: IRSA
// Script Parents:
//            IRSA;Building!~!~!~
===================================================================*/
logDebug("running script: ExtendPermitExpirationDate)");
logDebug("Inspection Result: " + inspResult);
try {
	if (!matches(inspResult, "Not Inspected", "Not Ready") && !matches(AInfo["Supervisor Over Ride"], "Yes")){
		var appExpirationDateString = null;
		var appExpiration = AInfo["Application Expiration"];
		if (!!appExpiration){
			appExpirationDateString = appExpiration.toString();
		}
		var newAppExpirationDateString = dateAdd(appExpirationDateString, 181);
		editAppSpecific("Application Expiration", newAppExpirationDateString);
		logDebug("Set new Application Expiration date to " + getAppSpecific("Application Expiration"));
	}
} catch (error){
	logDebug("Javascript error: " + error.message);
}