if (appMatch("Building/*/*/*") && wfTask == "Application Intake" && wfStatus == "Denied") {
	showDebug = 3
	comment("CLOSE WORKFLOW")
	deactivateTask("Application Intake");
}

showDebug = 3;
if (wfTask == "Close" && wfStatus == "Close"){
	parentId = getParent();
	if (!parentId){
		logDebug("Parent record for " + capId.getCustomID() + " not found");
	} else {
		editAppSpecific("Agency Clearance", "Yes", parentId);
		logDebug("Agency Clearance for " + parentId.getCustomID() + " set to " + getAppSpecific("Agency Clearance", parentId));
	}
}