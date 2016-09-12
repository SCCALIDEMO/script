/*--------------------------------------------------------------------------------------------------------------------/
| Start ETW 09/16/14 Added getAppName Function
/--------------------------------------------------------------------------------------------------------------------*/
function getAppName() {
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    capResult = aa.cap.getCap(itemCap)

    if (!capResult.getSuccess())
    { logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()); return false }

    capModel = capResult.getOutput().getCapModel()

    return capModel.getSpecialText()
}
/*--------------------------------------------------------------------------------------------------------------------/
| End ETW 09/16/14 Added getAppName Function
/--------------------------------------------------------------------------------------------------------------------*/
function isParent(parentAltId) {
	getCapResult = aa.cap.getProjectParents(capId,1);
	if (getCapResult.getSuccess())	{
		parentArray = getCapResult.getOutput();
		if (parentArray.length && parentArray.length > 0) {
			for (pIndex in parentArray) {
				thisParentCap = parentArray[pIndex];
				if (thisParentCap.getCapID().getCustomID() == parentAltId)
					return true;
			}
		}
			
	}
	return false;
}
/*--------------------------------------------------------------------------------------------------------------------/
| Start BD 09/07/16 Added createAgencyClearanceChildRecord Function
/--------------------------------------------------------------------------------------------------------------------*/
/*===================================================================
// Script Number: 5
// Script Name: createAgencyClearanceChildRecord.js
// Script Developer: Bryan de Jesus
// Script Agency: Woolpert
// Script Description: Creates a child record of a building permit to allow for outside agency clearance review independent of internal Building & Safety review.
// Script Run Event: WTUA
// Script Parents:
//            WTUA;Building!Permit!NA!NA
//            WTUA;Building!Permit!Plan Revision!NA
===================================================================*/
function createAgencyClearanceChildRecord(){
	logDebug("running script: createAgencyClearanceChildRecord");
	try {
		var childId = null;
		var structType = AInfo["Building/Structure Type"];
		if (structType == "Commercial" || structType == "Mixed Use (residential and commercial)"){
			// Create Child Case Building/Permit/Agency Clearance/Commercial 
			childId = createChild("Building", "Permit", "Agency Clearance", "Commercial", "Agency Clearance for " + capId.getCustomID());
		} else if (structType == "Residential (apartment, condo, hotel/motel, other residential)" || structType == "Residential (single-family, duplex, or townhome)"){
			// Create Child Case Building/Permit/Agency Clearance/Residential
			childId = createChild("Building", "Permit", "Agency Clearance", "Residential", "Agency Clearance for " + capId.getCustomID());
		} 
		
		if (childId != null){
			// Copy Applicant, Contacts, Address, Parcel, Owner, and Description of Work information from Record Detail in parent case to new child case
			// NOTE: createChild already copies Parcel, Contacts, and Addresses
			copyOwner(capId, childId);
			aa.cap.copyCapWorkDesInfo(capId, childId);
		}
	} catch (error){
		logDebug("Javascript error: " + error.message);
	}
}
/*--------------------------------------------------------------------------------------------------------------------/
| End BD 09/07/16 Added createAgencyClearanceChildRecord Function
/--------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------/
| Start BD 09/09/16 Added setAgencyClearanceCommercial Function
/--------------------------------------------------------------------------------------------------------------------*/
/*===================================================================
//Script Number: 9
//Script Name: Set Agency Clearance (Commercial)
//Script Developer: Bryan de Jesus
//Script Agency: Woolpert
//Script Description: When WF:B_CLR_COM task ‘Close’ equals ‘Close’ set ASI:Agency Clearance to ‘Y’ on the parent Building Combo Permit case.
//Script Run Event: WTUA
//Script Parents:
//         WTUA;Building!Permit!Agency Clearance!Commercial
===================================================================*/
function setAgencyClearanceCommercial() {
	logDebug("running script: setAgencyClearanceCommercial");
	try {
		parentId = getParent();
		if (!parentId){
			logDebug("Parent record for " + capId.getCustomID() + " not found");
		} else {
			editAppSpecific("Agency Clearance", "Yes", parentId);
			logDebug("Agency Clearance for " + parentId.getCustomID() + " set to " + getAppSpecific("Agency Clearance", parentId));
		}
	} catch (error){
		logDebug("Javascript error: " + error.message);
	}
}
/*--------------------------------------------------------------------------------------------------------------------/
| End BD 09/09/16 Added setAgencyClearanceCommercial Function
/--------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------/
| Start BD 09/09/16 Added extendPermitExpirationDate Function
/--------------------------------------------------------------------------------------------------------------------*/
/*===================================================================
//Script Number: 16
//Script Name: extendPermitExpirationDate
//Script Developer: Bryan de Jesus
//Script Agency: Woolpert
//Script Description: Adds 181 days to ‘Permit Expiration’ key date upon completion of each inspection, unless the inspection status equals “Not Inspected” or “Not Ready”, or if the “Supervisor Over Ride” field is equal to “Yes”
//Script Run Event: IRSA
//Script Parents:
//         IRSA;Building!~!~!~
===================================================================*/
function extendPermitExpirationDate(){
	logDebug("running script: extendPermitExpirationDate)");
	logDebug("Inspection Result: " + inspResult);
	try {
		var permitExpirationDateString = null;
		var permitExpiration = AInfo["Permit Expiration"];
		if (!!permitExpiration){
			permitExpirationDateString = permitExpiration.toString();
		}
		var newPermitExpirationDateString = dateAdd(permitExpirationDateString, 181);
		editAppSpecific("Permit Expiration", newPermitExpirationDateString);
		logDebug("Set new Permit Expiration date to " + getAppSpecific("Permit Expiration"));
	} catch (error){
		logDebug("Javascript error: " + error.message);
	}
}
/*--------------------------------------------------------------------------------------------------------------------/
| End BD 09/09/16 Added extendPermitExpirationDate Function
/--------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------/
| Start BD 09/09/16 Added inspectionResultEmail Function
/--------------------------------------------------------------------------------------------------------------------*/
/*===================================================================
//Script Number: 18
//Script Name: inspectionResultEmail
//Script Developer: Bryan de Jesus
//Script Agency: Woolpert
//Script Description: When inspection is performed an email is sent to the primary Licensed Professional with inspection result info. 
//Script Run Event: IRSA
//Script Parents:
//         IRSA;Building!Permit!NA!NA
//         IRSA;Building!MEP!NA!NA
===================================================================*/
function inspectionResultEmail() {
	logDebug("running script: inspectionResultEmail)");
	try {
		for (var licProfObj in getLicenseProfessional()){
			var emailAddress = licProfObj.refLicModel.getEmail();
			var emailTemplate = "";
			if (!emailAddress){
				logDebug("Email address for LP not found");
			} else {
				// build hashtable
				var vEParams = aa.util.newHashtable();
				//addParameter(vEParams,"%%RECORD ID%%", altId);
				
				logDebug("Sending notification to " + emailAddress);
		    	sendNotification("", emailAddress, "", emailTemplate, vEParams, null, capId);
			}
		}
	} catch (error){
		logDebug("Javascript error: " + error.message);
	}
}
/*--------------------------------------------------------------------------------------------------------------------/
| End BD 09/09/16 Added inspectionResultEmail Function
/--------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------/
| Start BD 09/09/16 Added setSecondApplicationExpirationDate Function
/--------------------------------------------------------------------------------------------------------------------*/
/*===================================================================
//Script Number: 14
//Script Name: setSecondApplicationExpirationDate
//Script Developer: Bryan de Jesus
//Script Agency: Woolpert
//Script Description: Check that ASI:’2nd Application Extension’ in not null
//Script Run Event: ASIUB
//Script Parents:
//         ASIUB;Building!~!~!~
===================================================================*/
function setSecondApplicationExpirationDate(){
	logDebug("running script: setSecondApplicationExpirationDate)");
	try {
		var applicationExtensionDate = AInfo["Application Extension"];
		var secondApplicationExtensionDate = AInfo["2nd Application Extension"];
		var applicationExpirationDate = AInfo["Application Expiration"];
		if (!!applicationExtensionDate && !!secondApplicationExtensionDate && !!applicationExpirationDate){
			var dSecondApplicationExtensionDate = new Date(secondApplicationExtensionDate);
			var dApplicationExpirationDate = new Date(applicationExpirationDate);
			if (dApplicationExpirationDate.getTime() < dSecondApplicationExtensionDate.getTime()){
				editAppSpecific("Application Expiration", secondApplicationExtensionDate);
				logDebug("Set new Application Expiration date to " + getAppSpecific("Application Expiration"));
			}
		}
	} catch (error){
		logDebug("Javascript error: " + error.message);
	}
}
/*--------------------------------------------------------------------------------------------------------------------/
| End BD 09/09/16 Added setSecondApplicationExpirationDate Function
/--------------------------------------------------------------------------------------------------------------------*/