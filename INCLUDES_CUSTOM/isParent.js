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