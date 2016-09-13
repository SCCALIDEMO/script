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
/*--------------------------------------------------------------------------------------------------------------------/
| Start BD 09/13/16 Added buildingAssessFees Function
/--------------------------------------------------------------------------------------------------------------------*/
/*===================================================================
//Script Number: 25
//Script Name: buildingAssessFees
//Script Developer: Bryan de Jesus
//Script Agency: Woolpert
//Script Description: Assess the item fees for trade sections when the WFT = 'Assess Permit Fee' and the status = 'Assess Fees'.
//Script Run Event: WTUA
//Script Parents:
//         WTUA;Building!Permit!NA!NA
//		   WTUA;Building!MEP!NA!NA
===================================================================*/
function buildingAssessFees(){
	logDebug("running script: buildingAssessFees)");
	try {
		var feeSchedule = "B_BLDPERMIT";
		var feePeriod = "FINAL";
		var asiToFeeCodeMap = {
			// add ASI entries and fee codes
			"Up to 2,000 CFM":"M020",
			"Over 2,000 CFM":"M030",
			"Less than 400,000 BTU":"M040",
			"400,000 BTU or more":"M050",
			"Compressor":"M060",
			"Condenser":"M070",
			"Less than 500,000 BTU":"M080",
			"500,000 BTU or more":"M090",
			"Vent Less than 500,000 BTU":"M100",
			"Vent 500,000 BTU or more":"M110",
			"Duct Number of inlets / outlets": "M120",
			"OR Ducts floor area":"M130",
			"Duct Detector":"M140",
			"Dust Control System":"M150",
			"Environmental Equipment":"M160",
			"Evaporative Cooler / Evaporator":"M170",
			"Fire Damper":"M180",
			"Fire/Smoke Damper":"M190",
			"Fire Suppression System":"M200",
			"Fireplace":"M210",
			"Garage Exhaust System":"M220",
			"Grease Duct":"M230",
			"Heat Recovery System":"M240",
			"Hood (Type I or II)":"M250",
			"Hood":"M255",
			"Independent Venting System":"M260",
			"Mechanical Louver":"M270",
			"Units Less than 500,000 BTU":"M280",
			"Units 500,000 BTU or more":"M290",
			"Non Conditioned Air Vent System":"M300",
			"Process Piping":"M310",
			"Product Conveying Vent System":"M320",
			"Machinery Room":"M330",
			"Single Register Ventilation":"M340",
			"Spray Booth":"M350",
			"Variable Air Volume Control":"M360",
			"Other":"M370",
			"R-1 Structures":"M390",
			"R-3 Structures":"M400",
			"Low Level":"M410",
			"Medium Level":"M420",
			"High Level":"M430",
			"Receptical":"M440",
			"Amplifier":"M450",
			"Antennae":"M460",
			"Appliance Residential":"M470",
			"Appliance Non-Residential":"M480",
			"ATM":"M490",
			"Branch Circuit/Busway/Cable Tray System/Feeder":"M500",
			"Capacitor":"M510",
			"Coating & Dipping Equip":"M520",
			"Communication Circuit":"M530",
			"Controller Up to 600 Volts":"M540",
			"Controller More than 600 Volts":"M550",
			"Fire Alarm":"M560",
			"Less than 50":"M570",
			"50 or more":"M580",
			"Less than 5 tons":"M600",
			"5-10 tons":"M610",
			"More than 10 tons":"M620",
			"Type I or II Hood":"M630",
			"Industrial Machine":"M640",
			"Industrial Machine (Certificate Required)":"M650",
			"Inverter/Rectifier/Phase Converter les than 50":"M660",
			"Inverter/Rectifier/Phase Converter 50 or more":"M670",
			"Medical Dental Less than 50":"M680",
			"Medical Dental 50 or More":"M690",
			"Miscellaneous Conduits and Conductors":"M700",
			"Motion Picture Equipment":"M710",
			"Pedestal":"M720",
			"Residential (Rooftop)":"M730",
			"Non-residential < 600V":"M740",
			"Non-residential >= 600V":"M750",
			"Pole or Platform Mounted Fixture":"M760",
			"Pool Residential":"M770",
			"Pool Non-residential":"M780",
			"Pool / Spa (Alteration)":"M790",
			"Power Pole - Permanent":"M800",
			"Power Pole - Temporary":"M810",
			"1-10":"M820",
			"11-50":"M830",
			"More than 50":"M840",
			"Service Less than 1,000 Amps":"M850",
			"Service 1,000 Amps or more":"M860",
			"Sign":"M870",
			"Sound Equipment":"M880",
			"Storage Battery":"M900",
			"Temporary Lighting":"M910",
			"Theatrical Lighting Fixture":"M920",
			"Transformer Less than 112.5":"M930",
			"Transformer 112.5 or more":"M940",
			"TV/Closed Circuit Equipment":"M950",
			"Vehicle Charging Residential":"M960",
			"Vehicle Charging Non-Residential":"M970",
			"X-Ray 1-3":"M980",
			"X-Ray 4-10":"M990",
			"X-Ray 11-50":"M1000",
			"X-Ray 51-100":"M1010",
			"X-Ray 100+":"M1020",
			"Plumbing Fixtures":"M1050",
			"Repair or Alteration for each Drain Pipe or Ventilation,":"M1060",
			"Repair or Alteration - Lawn Sprinkler":"M1070",
			"Repair or Alteration - Water Treating Equipment":"M1080",
			"Re-Pipe Single Family Residential":"M1110",
			"Repipe Multi Family Residential":"M1120",
			"Solar Water Heating System":"M1130",
			"Swimming Pool Anti-Entrapment Device":"M1140",
			"Low Pressure System":"M1150",
			"Medium Pressure System":"M1160",
			"Gas Meter (Non-Utility)":"M1161",
			"Additional House Connection":"M1170",
			"Backwater Valve":"M1180",
			"Clarifier":"M1190",
			"Disposal Field":"M1200",
			"Ejector Pump":"M1210",
			"Grease Interceptor":"M1220",
			"Grey Water System":"M1230",
			"House Sewer Connection to Public Sewer":"M1240",
			"Industrial Waste Interceptor (Non-Grease)":"M1250",
			"On-Site Sewer (lineal feet)":"M1260",
			"New Private Sewage Disposal System":"M1270",
			"Repair Private Sewage Disposal System":"M1280",
			"Abandon Private Sewage Disposal System":"M1290",
			"Repair of House Sewer":"M1300",
			"Seepage Pit / Drainage Field":"M1310",
			"Septic Tank":"M1320",
			"Sewer Repair / Replace":"M1340"
		};
		for (asi in asiToFeeCodeMap){
			var feeCode = asiToFeeCodeMap[asi];
			// assess / remove fees. use ASI as fee quantity
			var qty = getAppSpecific(asi);
			if (!qty || qty <= 0) {
				if (feeExists(feeCode)) voidRemoveFee(feeCode);
			} else {
				updateFee(feeCode, feeSchedule, feePeriod, qty, "N");
			}			
		}
	} catch (error){
		logDebug("Javascript error: " + error.message);
	}
}
/*--------------------------------------------------------------------------------------------------------------------/
| End BD 09/09/16 Added buildingAssessFees Function
/--------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------/
| Start BD 09/13/16 Added voidRemoveFee Function
/--------------------------------------------------------------------------------------------------------------------*/
function voidRemoveFee(vFeeCode){
	var feeSeqArray = new Array();
	var invoiceNbrArray = new Array();
	var feeAllocationArray = new Array();
	var itemCap = capId;
	if (arguments.length > 1){
		itemCap = arguments[1];
	}
	var targetFees = loadFees(itemCap);
	for (tFeeNum in targetFees){// for each fee found, if the fee is "NEW" remove it, if the fee is "INVOICED" void it and invoice the void
		targetFee = targetFees[tFeeNum];
		if (targetFee.code.equals(vFeeCode)){// only remove invoiced or new fees, however at this stage all AE fees should be invoiced.
			if (targetFee.status == "INVOICED"){
				var editResult = aa.finance.voidFeeItem(itemCap, targetFee.sequence);
				if (editResult.getSuccess()){
					logDebug("Voided existing Fee Item: " + targetFee.code);
				}
				else { 
					logDebug( "**ERROR: voiding fee item (" + targetFee.code + "): " + editResult.getErrorMessage());
					return false;
				}
				var feeSeqArray = new Array();
				var paymentPeriodArray = new Array();
				feeSeqArray.push(targetFee.sequence);
				paymentPeriodArray.push(targetFee.period);
				var invoiceResult_L = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);
				if (!invoiceResult_L.getSuccess()){
					logDebug("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
					return false;
				}
			}
			if (targetFee.status == "NEW"){// delete the fee
				var editResult = aa.finance.removeFeeItem(itemCap, targetFee.sequence);
				if (editResult.getSuccess()){
					logDebug("Removed existing Fee Item: " + targetFee.code);
				}
				else {
					logDebug( "**ERROR: removing fee item (" + targetFee.code + "): " + editResult.getErrorMessage());
					return false;
				}
			}
		}
	}
}
/*--------------------------------------------------------------------------------------------------------------------/
| End BD 09/13/16 Added voidRemoveFee Function
/--------------------------------------------------------------------------------------------------------------------*/