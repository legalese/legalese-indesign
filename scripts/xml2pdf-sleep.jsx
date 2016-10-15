// xml2pdf-sleep.jsx
// An InDesign CS6 JavaScript
//
// sleep 10 seconds and then run the job.
// why is this needed? because InDesign's IdleTask doesn't actually fire when it's supposed to.
// so we do it by hand lor.
//
// ah, the solution is to turn off app nap for indesign, in the app's Get Info panel in Finder.
//
// 

#targetengine "session"
#include "xml2pdf-lib.jsx"

var lastIdle = new Date();

var SLEEP_INTERVAL = 10000; // milliseconds

var still_want_to_run = true;

// make this a per-machine test or env or something.
var ROOTFOLDER = "~/Google Drive/Legalese Root";
var ROOTFOLDER = "~/Google Drive/incoming";
// on the production server, robot@legalese.io syncs Google Drive directly with no Legalese Root folder.

var IPC_FILE = "stop-please.txt";
var RUN_FILE = "i-am-running.txt";

main();
var RUNFILE_INTERVAL = 120;
var last_touched_runfile = new Date();

function main() {
//  alert("rootfolder is " + ROOTFOLDER);
  rootFolder = new Folder(ROOTFOLDER); // global so the event handler can see it

  if (i_was_previously_running(rootFolder)) {
	tell_the_previous_run_to_stop(rootFolder);
	alert("telling previous run to stop.");
	// i don't think this actually works because the scripts are not multithreaded.
	// you should just create the stop-please.txt file by hand.
  }
  else {
	i_am_running(rootFolder);
	last_touched_runfile = new Date();

	alert("starting sleep run.\nto stop, touch " + ROOTFOLDER + "/" + IPC_FILE);
	while (still_want_to_run) {
	  if (last_touched_runfile - (new Date()) > RUNFILE_INTERVAL) {
		i_am_running(rootFolder);
		last_touched_runfile = new Date();
	  }
	  xml2pdf_main();
	  sleep_for_a_while(rootFolder);
	}
//	alert("exiting");
  }
}

function sleep_for_a_while(rootFolder) {
  $.sleep(SLEEP_INTERVAL);

  if (a_later_run_wants_me_to_stop(rootFolder)) {
	still_want_to_run = false;
  }
}

function isIPCFile(file) {
  return (file.name == IPC_FILE);
}

function a_later_run_wants_me_to_stop(folder) {
  var candidates = folder.getFiles(isIPCFile);
  if (candidates.length > 0) {
//	alert("we have found a previous ipc_file! deleting it. " + candidates);
	delete_the_ipc_file(candidates[0]);
	return true;
  }
}

function delete_the_ipc_file(file) {
//  alert("deleting ipc file");
  file.remove();
  var run_file = new File(ROOTFOLDER + "/" + RUN_FILE);
//  alert("deleting run file");
  run_file.remove()
}

function tell_the_previous_run_to_stop(folder) {
  var ipc_file = new File(ROOTFOLDER + "/" + IPC_FILE);
  ipc_file.open("w");
  ipc_file.writeln("we would like the previous run to stop, please.");
  ipc_file.close();
}

function i_was_previously_running(folder) {
  var run_file = new File(ROOTFOLDER + "/" + RUN_FILE);
  return run_file.exists;
}

function i_am_running(folder) {
  var run_file = new File(ROOTFOLDER + "/" + RUN_FILE);
  run_file.open("w");
  run_file.writeln("hellos, i am running, at " + (new Date()));
  run_file.close();
//  alert("wrote runfile to " + ROOTFOLDER+"/"+RUN_FILE);
}

function xml2pdf_main(){

  var interactive = false;

  var xmlFiles = identifyXmlFiles("recurse", rootFolder); // recurse | queryUser

  if (xmlFiles.length > 0) {
	app.scriptPreferences.enableRedraw=interactive; 
	xmls2pdf(xmlFiles, interactive, false, false);
	app.scriptPreferences.enableRedraw=true;
  }
}

