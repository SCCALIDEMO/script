if (appMatch("Building/*/*/*") && wfTask == "Application Intake" && wfStatus == "Denied") {
	showDebug = 3
	comment("CLOSE WORKFLOW")
	deactivateTask("Application Intake")
}

include("WTUA;Building!Permit!Agency Clearance!Commercial");