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
		var permitExpirationDateString = null;
		var permitExpiration = AInfo["Permit Expiration"];
		if (!!permitExpiration){
			permitExpirationDateString = permitExpiration.toString();
		}
		var newPermitExpirationDateString = dateAdd(permitExpirationDateString, 181);
		editAppSpecific("Permit Expiration", newPermitExpirationDateString);
		logDebug("Set new Permit Expiration date to " + getAppSpecific("Permit Expiration"));
	}
} catch (error){
	logDebug("Javascript error: " + error.message);
}