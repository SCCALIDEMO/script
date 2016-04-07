if (appMatch("Building/*/*/*") && wfTask == "Application Intake" && wfStatus == "Denied") {
	showDebug = 3
	comment("CLOSE WORKFLOW")
}

