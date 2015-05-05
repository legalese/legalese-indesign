// xml2pdf-idle.jsx
// An InDesign CS6 JavaScript
//
// make sure app nap is disabled for the application first!
//
// if the idle task already exists, delete it first.
// create an idletask that monitors a directory tree for new arrivals
// any new .xml files that arrive in that tree,
// and which do not have a corresponding .pdf generated
// (or a corresponding .fail, which would cause us to give up on generating the PDF)
// will trigger our xml2pdf placement.
//
// how do new files arrive in that tree?
// maybe we have a simple nodejs server that accepts XML uploads, pushes them through InDesign, and returns a PDF.
// 

#targetengine "session"
#include "xml2pdf-lib.jsx"

main();

var lastIdle = new Date();

function main() {
  rootFolder = new Folder("~/Google Drive/Legalese Root"); // global so the event handler can see it
  if (! myTeardown()) mySetup();
}

function myTeardown() {
  var length = app.idleTasks.length;
  var didstop = false;
  for (var i = 0; i < length; i++) {
    var myIdleTask = app.idleTasks.item(i);
    if (myIdleTask.name == "xml2pdf") {
	  myIdleTask.sleep = 0;
	  logToFile("onIdleEventHandler: stopping");
	  alert ("stopping idle task");
	  didstop = true;
	}
  }
  return didstop;
}

function mySetup() {
  var myIdleTask = app.idleTasks.add({name:"xml2pdf", sleep:5000});
  var onIdleEventListener = myIdleTask.addEventListener("onIdle", onIdleEventHandler, false);
  alert("Starting idle task " + myIdleTask.name + "; added event listener on " + onIdleEventListener.eventType);
  logToFile("onIdleEventHandler: starting");

  lastIdle = new Date();

  // InDesign tends to fall asleep no matter what
}

function onIdleEventHandler(myIdleEvent) {
  var deltaT = new Date() - lastIdle;
  lastIdle = new Date();
  logToFile("onIdleEventHandler: idle for " + Math.floor(deltaT/1000) + "s");
  xml2pdf_main();
}

function xml2pdf_main(){

  var interactive = false;

  var xmlFiles = identifyXmlFiles("recurse", rootFolder); // recurse | queryUser
  var indtFile = identifyIndtFile("hardcoded", // hardcoded | queryUser
								  "~/non-db-src/legalese/build/00 legalese template.indt");
  if (xmlFiles.length > 0) {
	app.scriptPreferences.enableRedraw=interactive; 
	xmls2pdf(xmlFiles, indtFile, interactive);
	app.scriptPreferences.enableRedraw=true;
  }
}

