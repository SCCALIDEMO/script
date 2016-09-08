/*===================================================================
// Script Number: 14
// Script Name: SecondApplicationExtensionCheck
// Script Developer: Bryan de Jesus
// Script Agency: Woolpert
// Script Description: Check that ASI:’2nd Application Extension’ in not null
// Script Run Event: ASIUB
// Script Parents:
//            ASIUB;Building!~!~!~
===================================================================*/
logDebug("running script: SecondApplicationExtensionCheck)");
try {
	var applicationExtensionDate = AInfo["Application Extension"];
	var secondApplicationExtensionDate = AInfo["2nd Application Extension"];
	if (!applicationExtensionDate && !!secondApplicationExtensionDate){
		showMessage = true;
		comment("Application Extension date cannot be empty to grant 2nd application extension.");
		cancel = true;
	}
} catch (error){
	logDebug("Javascript error: " + error.message);
}