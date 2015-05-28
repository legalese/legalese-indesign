// import an XML file into the Legalese template.
// this runs as an Adobe InDesign script.

#include "xml2pdf-lib.jsx"

main();
// -------------------------------------------------- main
function main(){

  var interactive = true;
  var saveIndd    = true;
  var keepOpen    = true;
  
  var xmlFiles = identifyXmlFiles("recurse",  // recurse | queryUser
								  Folder("~/Google Drive/Legalese Root"));
  
  if (interactive && xmlFiles.length == 0) { alert ("nothing to do. Is Google Drive synced?"); } 

  if (xmlFiles.length > 0) {
	app.scriptPreferences.enableRedraw=keepOpen;
	xmls2pdf(xmlFiles, interactive, saveIndd, keepOpen);

	// run again, because maybe some new work arrived while we were busy
	xmls2pdf(identifyXmlFiles("recurse",  // recurse | queryUser
							  Folder("~/Google Drive/Legalese Root")),
			 interactive, saveIndd, keepOpen);

	app.scriptPreferences.enableRedraw=true;
  }
}

