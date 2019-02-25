'========================================================================================
'
'  $File: //depot/indesign_10.0/gm/build/scripts/xml rules/glue code.vbs $
'
'  Owner: Lin Xia
'
'  $Author: alokumar $
'
'  $DateTime: 2014/04/08 11:14:18 $
'
'  $Revision: #1 $
'
'  $Change: 875846 $
'
'  Copyright 2006-2008 Adobe Systems Incorporated. All rights reserved.
'  
'  NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance 
'  with the terms of the Adobe license agreement accompanying it.  If you have received
'  this file from a source other than Adobe, then your use, modification, or 
'  distribution of it requires the prior written permission of Adobe.
'
'  DESCRIPTION: VBScript glue code for XML Rules Processing
'
'========================================================================================


Class RuleProcessorObject
	Public ruleSet
	Public ruleProcessor
End Class

Function glueCode_MakeRuleProcessor(idApp, ruleSet, prefixMappingTable)
    '  In VBScript we require the application to be passed in as argument
    '  so that no conflicts occur.

    '  This allows us to handle errors here in the code
    On Error Resume Next

	' Get the condition paths of all the rules.
	Dim pathArray(), pathIndex, rulesProcessor
	
    If Err.number <> 0 Then
        Exit Function
    End If

	ReDim pathArray(UBound ( ruleSet ))

	pathIndex = 0
	
	For Each rule in ruleSet
		pathArray(pathIndex) = rule.xpath	
		pathIndex = pathIndex + 1
	Next

    
    ' the following call can cause an error, in which case 
    ' no rules are processed  
	Set rulesProcessor	= idApp.XMLRuleProcessors.Add ( pathArray, prefixMappingTable )	

    If Err.number <> 0 Then
        glueCode_MakeRuleProcessor = NULL
    Else
        ' In VBScript, use Set to assign object references, but not array, string, etc
        Set glueCode_MakeRuleProcessor = new RuleProcessorObject
        glueCode_MakeRuleProcessor.ruleSet = ruleSet
        Set glueCode_MakeRuleProcessor.ruleProcessor = rulesProcessor
    End If
    
End Function

Sub glueCode_DeleteRuleProcessor(rProcessor) 

	' remove the XMLRuleProcessor object
	rProcessor.ruleProcessor.Delete()
		
	' delete the object itself
	'delete	rProcessor;
End Sub

Sub glueCode_ProcessTree (root, rProcessor)
    '  This allows us to handle errors here in the code
    On Error Resume Next
    
    Set matchData = rProcessor.ruleProcessor.StartProcessingRuleSet(root)
    if Err.number = 0 Then
	    glueCode_ProcessMatchData matchData, rProcessor
	End If
		
	rProcessor.ruleProcessor.EndProcessingRuleSet()

	if Err.number <> 0 Then
        errNumber = Err.number
        errSource = Err.Source
        errDesc = Err.Description
        
        On Error Goto 0
        Err.Raise errNumber, errSource, errDesc 
	End If
End Sub

'
' Process the rule set for the given element. Client code calls
' this Sub to start things off. glueCode_processMatchData calls the
' ApplyAction handler for each rule that matches
'

Sub glueCode_ProcessRuleSet (idApp, root, ruleSet, prefixMappingTable )
    '  In VBScript we require the application to be passed in as argument
    '  so that no conflicts occur.
  
    Dim errNumber, errSource, errDesc
    
  	Set mainRProcessor = glueCode_MakeRuleProcessor (idApp, ruleSet, prefixMappingTable)
  	
    '  This allows us to handle errors here in the code
    On Error Resume Next

    glueCode_ProcessTree root, mainRProcessor
    glueCode_DeleteRuleProcessor mainRProcessor

    If Err.number <> 0 Then
        ' Pass the error on to the caller
        errNumber = Err.number
        errSource = Err.Source
        errDesc = Err.Description
    
        On Error Goto 0
        Err.Raise errNumber, errSource, errDesc 
  	End If

End Sub 


'
' Process the children of the current element. Normally the children
' of the element are traversed after the ApplyAction function is called.
' If a client wants to process the children as part of the handler
' then the implementation of ApplyAction should call glueCode_ProcessChildren.
'

Sub glueCode_ProcessChildren ( rProcessor )	
    '  This allows us to handle errors here in the code
    On Error Resume Next

    Dim errNumber, errSource, errDesc

	Set matchData = rProcessor.ruleProcessor.StartProcessingSubtree()

	If Err.number = 0 Then
    	glueCode_ProcessMatchData matchData, rProcessor
	End If
	
	if Err.number <> 0 Then
	    rProcessor.ruleProcessor.Halt()

	    ' We captured the error here to Halt the rule processor, now we pass it on
        errNumber = Err.number
        errSource = Err.Source
        errDesc = Err.Description
		On Error Goto 0
        Err.Raise errNumber, errSource, errDesc 
	End If
	
End Sub

'
' This tells the rule processor to skip the children for the current element.
'

Sub glueCode_SkipChildren ( rProcessor )
    
	rProcessor.ruleProcessor.SkipChildren()

End Sub

'
' Calls apply action on each matched rule
'

Sub glueCode_ProcessMatchData ( matchData, rProcessor )

    ruleSet = rProcessor.ruleSet
	Do While Not ( matchData Is Nothing )		
		Dim applyMatchedRules, matchRulesLength, matchRulesIndex
		
		matchRulesLength	= UBound ( matchData.matchRules )
		applyMatchedRules	= True
				
		For matchRulesIndex = 0 To matchRulesLength Step 1
			If rProcessor.ruleProcessor.Halted = True Then
				Exit For
			End If

			Set ruleItem = ruleSet(matchData.matchRules(matchRulesIndex))
			
			applyMatchedRules = Not ruleItem.apply ( matchData.element, rProcessor )
			
			If applyMatchedRules = False Then
				Exit For
			End If	
		Next

		Set matchData = rProcessor.ruleProcessor.FindNextMatch()	
	Loop
	
End Sub






















