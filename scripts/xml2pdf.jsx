// import an XML file into the Legalese template.
// this runs as an Adobe InDesign script.

#include "xml2pdf-lib.jsx"

main();
// -------------------------------------------------- main
function main(){

  var interactive = true;
  var saveIndd    = false;
  var keepOpen    = false;

  var xmlFolder = ["~/Google Drive/incoming",
				   "~/Google Drive/Legalese Root"
				  ][0];
  
  var xmlFiles = identifyXmlFiles("recurse",  // recurse | queryUser
								  Folder(xmlFolder));
  
  if (interactive && xmlFiles.length == 0) { alert ("nothing to do in " + xmlFolder + ". Is Google Drive synced?"); } 

  if (xmlFiles.length > 0) {
	app.scriptPreferences.enableRedraw=keepOpen;
	xmls2pdf(xmlFiles, interactive, saveIndd, keepOpen);

	// run again, because maybe some new work arrived while we were busy
	xmls2pdf(identifyXmlFiles("recurse",  // recurse | queryUser
							  Folder(xmlFolder)),
			 interactive, saveIndd, keepOpen);

	app.scriptPreferences.enableRedraw=true;
  }
}

