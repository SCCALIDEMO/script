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