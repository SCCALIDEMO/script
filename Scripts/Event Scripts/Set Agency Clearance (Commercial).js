/*===================================================================
// Script Number: 9
// Script Name: Set Agency Clearance (Commercial)
// Script Developer: Bryan de Jesus
// Script Agency: Woolpert
// Script Description: When WF:B_CLR_COM task ‘Close’ equals ‘Close’ set ASI:Agency Clearance to ‘Y’ on the parent Building Combo Permit case.
// Script Run Event: WTUA
// Script Parents:
//            WTUA;Building!Permit!Agency Clearance!Commercial
===================================================================*/
logDebug("running script: Set Agency Clearance (Commercial)");
try {
	if (wfTask == "Close" && wfStatus == "Close"){
		parentId = getParent();
		if (!parentId){
			logDebug("Parent record for " + capId.getCustomID() + " not found");
		} else {
			editAppSpecific("Agency Clearance", "Y", parentId);
		}
	}
} catch (error){
	logDebug("Javascript error: " + error.message);
}