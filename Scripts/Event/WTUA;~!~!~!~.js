if (appMatch("Building/*/*/*") && wfTask == "Application Intake" && wfStatus == "Denied") {
	showDebug = 3
	comment("CLOSE WORKFLOW")
	deactivateTask("Application Intake");
}

showDebug = 3;
include("WTUA:Building/Permit/Agency Clearance/Commercial");