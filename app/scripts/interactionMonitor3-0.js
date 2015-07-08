
//***************************************************************************************
//                                  private vars
//***************************************************************************************


//--------------------
//  interaction monitor section
//--------------------
var MonitorTag = "";    //monitor section tag
       
//--------------------
//  Common
//--------------------
var currAdName = "";

var AdsNotSupportInteraction =
{
    "StandardBanner": "11"
};

//***************************************************************************************
//                                  public methods
//***************************************************************************************


//--------------
//  Common
//--------------

// Check if the ad format is support interactions
function IsAdSupportInteractions()
{
    var row = getSelectedRow();
    if (row) {
        var formatID = row.getValueByColumnKey("FormatID");
        if (formatID &&
            formatID == AdsNotSupportInteraction.StandardBanner)
            {
                return false;
            }
    }

    return true;
}

//The function is triggered from the asset or ad level. 
//check the fscomand and handle it
function ebHandleFsCommandsPrev(command, args, objName, adId,timeint,fIsMobile) 
{
    try {

        var lowerCommand = command.toLowerCase();
		var previewLvl = "Ad";
		
        // check if this ad is support in interactions
        //if (!IsAdSupportInteractions() && lowerCommand != "ebclickthrough")
        //    return;

	    // check if the flag 'fIsMobile' was send
	    if (typeof(fIsMobile) == "undefined")
	        fIsMobile = false;
	    
	    var actionText;	 
	    //should be handled only in ad asset case and not mobile in scale level
	    if (previewLvl != "Ad" && previewLvl != "Asset" && previewLvl != "SyncAds" && !fIsMobile)
	        return;
	  
        // get the ad name, only for sync ads
	    currAdName = (previewLvl == "SyncAds") ? getEyeblasterName(adId) : "";
		if (typeof(objName) == "undefined")
		    objName = "";
		

        //check which fscommand it is
		switch (lowerCommand) {
		    case "ebshowdefaultimage":
		        addCommand(objName, command, args, "Show default image", 1, timeint);
		        break;
            case "showsinglepanel":
                addCommand(objName, 'JS  controlled', args, "Collapse Panel (automatic)", 1, timeint);
                break;
            case "autoretract":
                addCommand(objName, 'JS  controlled', args, "Collapse Panel (user initiated)", 1, timeint);
                break;
            case "autoexpand":
                addCommand(objName, 'JS  controlled', args, "Expand Panel (user initiated)", 1, timeint);
                break;
            case "uponshow":
                addCommand(objName, 'JS  controlled', args, "Expand Panel (automatic)", 1, timeint);
                break;
            case "retractvideostrip":
                addCommand(objName, 'Component', args, "Collapse Panel (user initiated)", 1, timeint);
                break;
            case "ebseexpandstarted":
                addCommand(objName, 'Component', args, "Expand Panel (user initiated)", 1, timeint);
                break;
            case "ebseretractstarted":
                addCommand(objName, 'Component', args, "Collapse Panel (user initiated)", 1, timeint);
                break;							
            case "expandvideostrip":
                addCommand(objName, 'Component', args, "Expand Panel (user initiated)", 1, timeint);
                break;
            case "ebautohide":
                addCommand(objName, command, args, "Collapse Panel (automatic)", 1, timeint);
                break;
            case "ebautoclose":
                addCommand(objName, command, args, "Close Ad (automatic)", 1, timeint);
                break;
            case "ebautoshow":
                addCommand(objName, command, args, "Expand Panel (automatic)", 1, timeint);
                break;
            case "ebclose":
            case "ebquit":
                addCommand(objName, command, args, "Close Ad (user initiated)", 1, timeint);
                break;
            case "ebhide":
                //floating or commercial break
                if (objName.indexOf("ebIntro") != -1)
                    addCommand(objName, command, args, "Close Intro (user initiated)", 1, timeint);
                else if (objName.indexOf("ebMiniSite") != -1)
                    addCommand(objName, command, args, "Close Minisite (user initiated)", 1, timeint);
                else if ((objName.toLowerCase().indexOf("ebpanel") != -1) || (objName.indexOf("ebBannerFlash") != -1))
                    addCommand(objName, command, args, "Collapse Panel (user initiated)", 1, timeint);
                else
                    addCommand(objName, command, args, command, 1, timeint);
                break;
            case "ebclickthrough":
                //get the first argument
                command = command.substr(2);
                args = ((args == null) || (args == undefined)) ? "" : args;
                if (args.substr(0, 4) == "SV2:") {
                    args = args.substr(4);
                    argsSplited = args.split(String.fromCharCode(127));
                    args = argsSplited[0];
                    prodID = (argsSplited.length > 1) ? " (Product ID " + (parseInt(argsSplited[1])) + ")" : "";

                    var pos = objName.indexOf('_');
                    objName = objName.substr(0, pos) + prodID + objName.substr(pos, objName.length - pos);

                    if (args == "")
                        addCommand(objName, command, args, "Click", 1, timeint);
                    else
                        addCommand(objName, command, args, "Product Clickthrough", 1, timeint);
                    break;
                } else {
					addCommand(objName, command, args, "Click", 1, timeint);
					break;
				}
            case "ebinteraction":
                //check if it is Click or Custom interaction
                args = (args == null) ? "" : args;
                actionText = ((args == "") || (args == "_eyeblaster")) ? "Click" : "Custom Interaction";
                ebInteraction(objName, command, args, actionText, timeint);
                break;
            case "ebciuseractioncounter":
                actionText = "User Action Counter Interaction";
                ebInteraction(objName, command.substr(4), args, actionText, timeint);
                break;
            case "ebciautomaticeventcounter":
                actionText = "Automatic Event Counter Interaction";
                ebInteraction(objName, command.substr(4), args, actionText,timeint);
                break;
            case "ebcistoptimer":
                actionText = "Stop Custom Timer Interaction";
                ebInteraction(objName, command.substr(4), args, actionText,timeint);
                break;
            case "ebcistarttimer":
                actionText = "Start Custom Timer Interaction";
                ebInteraction(objName, command.substr(4), args, actionText, timeint);
                break;
            case "ebstarttimer":
                addCommand(objName, command, args, "Start Timer", 1, timeint);
                break;
            case "ebendtimer":
                addCommand(objName, command, args, "Stop Timer", 1, timeint);
                break;
            case "ebloadrichflash":
                addCommand(objName, command, args, "Load Rich Banner", 1, timeint);
                break;
            case "ebreplay":
                addCommand(objName, command, args, "Replay Ad (user initiated)", 1, timeint);
                break;
            case "ebautoreplay":
                addCommand(objName, command, args, "Replay Ad (automatic)", 1, timeint);
                break;
            case "ebshake":
                addCommand(objName, command, args, "Shake Browser", 1, timeint);
                break;
            case "ebinstreamfullscreenopen":
                addCommand(objName, command, args, "Full Screen Opened", 1, timeint);
                break;
            case "ebinstreamfullscreenclose":
                addCommand(objName, command, args, "Full Screen Closed", 1, timeint);
				break;
			case "ebshow" :
			    //floating or commercial break
			    if((objName.indexOf("ebFloatingAd") != -1) || (objName.indexOf("ebIntro") != -1) 
			            || (objName.indexOf("ebRem") != -1) || (objName.indexOf("ebMiniSite") != -1))
			        addCommand(objName, command, args, "Replay Ad (user initiated)", 1, timeint);
			    else
			        addCommand(objName, command, args, "Expand Panel (user initiated)", 1, timeint);
			    break;
			case "ebshowwhenready" :
			    addCommand(objName, command, args, "Expand Panel (user initiated)", 1, timeint);
				break;
			case "ebstartrichflash" :
			    addCommand(objName, command, args, "Load Rich Banner", 1, timeint);
				break;
			case "ebreplayad" :
			    command = command.substr(2);
			    actionText = "Replay Ad " + getAcionType(args);
			    addCommand(objName, command, args, actionText, 1, timeint);
				break;
			case "ebclosead" :
			    command = command.substr(2);
			    actionText = "Close Ad " + getAcionType(args);
			    addCommand(objName, command, args, actionText, 1, timeint);
				break;
			case "ebshowrichbanner" :
			    command = command.substr(2);
			    addCommand(objName, command, args, "Show Rich Banner", 1, timeint);
				break;
			case "ebloadrichbanner" :
			    command = command.substr(2);
			    addCommand(objName, command, args, "Load Rich Banner", 1, timeint);
				break;
			case "ebexpandpanel" :
			    command = command.substr(2);
			    var argArr = args.split(",");
			    var text = "Expand Panel";
			    //panel name
			    if(argArr[0] == "")
			    {
			        argArr[0] = "<empty>";
			        text = "Expand Default Panel";
			    }
			    args = argArr[0] + ", " + argArr[1];
			    actionText = text + " " + getAcionType(argArr[1]);
			    addCommand(objName, command, args, actionText, 1, timeint);
				break;
			case "ebcollapsepanel" :
			    command = command.substr(2);
			    var argArr = args.split(",");
			    var text = "Collapse Panel";
			    //panel name
			    if(argArr[0] == "")
			    {
			        argArr[0] = "<empty>";
			        text = "Collapse All Panels";
			    }
			    args = argArr[0];
			    actionText = text;
			    if (argArr.length>1) {
			        args += ", " + argArr[1];
			        actionText += " " + getAcionType(argArr[1]);
			    }
			    addCommand(objName, command, args, actionText, 1, timeint);
				break;
			case "ebvideointeraction":
			//{
				var re = /\'/g;
				//the args structure is: cmd +"," + movie unmber
				var lowerArgs = args.toLowerCase();
				var argsParts = args.split(",");
				command = argsParts[0].replace(re,"");
				
				args = "";
				if (argsParts.length > 1 && argsParts[1] != "")
				{
			        args = argsParts[1].replace(re,"");
			        
				    //get movie name
				    var videoMovieName = getMovieNameByOrder(args);
				    args = videoMovieName+" ("+args+")";
				}
				
				//switch command
				if(lowerArgs.indexOf("'ebvideostarted'")>-1){
				    addCommand(objName, command, args, " Start Video", 1, timeint);
				}else if(lowerArgs.indexOf("'eb25per_played'")>-1){
				    addCommand(objName, command, args, " 25% Video Played", 1, timeint);
				}else if(lowerArgs.indexOf("'eb50per_played'")>-1){
				    addCommand(objName, command, args, " 50% Video Played", 1, timeint);
				}else if(lowerArgs.indexOf("'eb75per_played'")>-1){
				    addCommand(objName, command, args, " 75% Video Played", 1, timeint);
				}else if(lowerArgs.indexOf("'ebvideofullplay'")>-1){
				    addCommand(objName, command, args, " Video Fully Played", 1, timeint);
				}else if(lowerArgs.indexOf("'ebvideopause'")>-1){
				    addCommand(objName, command, args, " Pause Video", 1, timeint);
				}else if(lowerArgs.indexOf("'ebvideoreplay'")>-1){
				    addCommand(objName, command, args, " Replay Video", 1, timeint);
				}else if(lowerArgs.indexOf("'ebvideomute'")>-1){
				    addCommand(objName, command, args, " Mute Video", 1, timeint);
		        }else if(lowerArgs.indexOf("'ebfsvideomute'") > -1) {
		            addCommand(objName, command, args, " Mute FS Video", 1, timeint);
				}else if(lowerArgs.indexOf("'ebvideounmute'")>-1){
				    addCommand(objName, command, args, " Un-mute Video", 1, timeint);
	            }else if (lowerArgs.indexOf("'ebsliderdragged'") > -1) {
	                addCommand(objName, command, args, "Slider Dragged", 1, timeint);
	            }else if (lowerArgs.indexOf("'ebfsvideopause'") > -1) {
                    addCommand(objName, command, args, " Pause FS Video", 1, timeint);
	            }else if (lowerArgs.indexOf("'ebfsstart'") > -1) {
	                addCommand(objName, command, args, " Full Screen Opened", 1, timeint);
	            }else if (lowerArgs.indexOf("'ebfsend'") > -1) {
	                addCommand(objName, command, args, " Full Screen Closed", 1, timeint);
                }

			//}	
			break;
			case "ebhideintro" :
			    command = command.substr(2);
			    addCommand(objName, command, args, "Close Intro (user initiated)", 1, timeint);
				break;
			case "ebclick" :
			    addCommand(objName, command, args, "Open Mini Site", 1, timeint);
				break;
			case "ebgotominisite" :
			    command = command.substr(2);
			    addCommand(objName, command, args, "Open Mini Site", 1, timeint);
				break;
			case "ebkeepadopen" :
			    command = command.substr(2);
			    addCommand(objName, command, args, "Keep Ad Playing", 1, timeint);
				break;
			case "ebendofmovie" :
			    command = command.substr(2);
			    addCommand(objName, command, args, "Intro Fully Played", 1, timeint);
				break;
			case "ebintrofullplay" :
			    command = command.substr(2);
			    addCommand(objName, command, args, "Intro Fully Played", 1, timeint);
				break;
			case "ebintrofullplay" :
			    command = command.substr(2);
			    addCommand(objName, command, args, "Intro Fully Played", 1, timeint);
			case "pageloaded":
			    command = command.substr(2);
			    addCommand(objName, command, args, "Page Loaded", 1, timeint);
				break;
			//Sync interactions
			case "ebsyncadsinteraction":
				var ch = /\'/g;
               //the args structure is: cmd + "," + arg1|arg2|arg3..
                var lowerArgs = args.toLowerCase();
                var argsParts = args.split(",");
                //update cmd
                command = argsParts[0].replace(ch, "");
                //update args
                if (argsParts.length > 1) {
                    argsParts.splice(0, 1);
                    args = argsParts.join(",");
                    args = args.replace(/\|/g, ",");
                    args = args.replace(/undefined/g, "");
                    args = (args.charAt(args.length - 1) == ",") ? args.substr(0, args.length - 1) : args;
                }
                else {
                    args = "";
                }
                //switch command
                switch (command) {
                    case "openConnection":
                        addCommand(objName, command, args, " Opening a sync connection", 1, timeint);
                        break;
                    case "findConnection":
                        addCommand(objName, command, args, " Trying to find a sync connection", 1, timeint);
                        break;
                    case "callConnection":
                        addCommand(objName, command, args, " Calling to a sync function", 1, timeint);
                        break;
                    case "closeConnection":
                        addCommand(objName, command, args, " Closing a sync connection", 1, timeint);
                        break;
                    case "onConnectionFound":
                        addCommand(objName, command, args, " The sync connection was found", 1, timeint);
                        break;
                    case "onConnectionNotFound":
                        addCommand(objName, command, args, " The sync connection was not found", 1, timeint);
                        break;
                }
                break;
            // VPAID
            case "vpaid_adinitialize":
                addCommand(objName, command, args, "Ad has received initAd() command", 1, timeint);
                break;
            case "vpaid_adstarted":
                addCommand(objName, command, args, "VPAID ad has started", 1, timeint);
                break;
            case "vpaid_adpaused":
                addCommand(objName, command, args, "VPAID ad has paused", 1, timeint);
                break;
            case "vpaid_adplaying":
                addCommand(objName, command, args, "VPAID ad has resumed", 1, timeint);
                break;
            case "vpaid_adexpand":
                addCommand(objName, command, args, "VPAID ad has expanded", 1, timeint);
                break;
            case "vpaid_adcollapse":
                addCommand(objName, command, args, "VPAID ad has retracted", 1, timeint);
                break;
            case "vpaid_adlinearchange":
                addCommand(objName, command, args, "VPAID ad has entered/exited linear mode", 1, timeint);
                break;
            case "vpaid_aduserclose":
                addCommand(objName, command, args, "VPAID ad has unloaded", 1, timeint);
                break;
		    case "clickelement":
		        addCommand(objName, command, args, "Click", 1, timeint);
		        break;
		    case "creativeview":
		        addCommand(objName, command, args, "creativeView", 1, timeint);
		        break;
            case "ebcommand":
            case "ebsysteminteraction":
            case "ebupdatetimer":
            case "ebstartvideotimer":
            case "ebendvideotimer":
            case "ebshake2":
            case "ebmsg":
            case "ebsetstripproxy":
            case "ebshowhideelementsfromflash":
            case "ebvideostripexpanded":
            case "ebvideostripretracted":
            case "ebinitvideostrip":
            case "ebprerollend":
            case "ebsetstate":
            case "ebresetstate":
            case "ebmousetracker":
            case "ebvideounmuted":
            case "ebinitvideoloader":
            case "ebvideoload":
            case "ebvideoloadandplay":
            case "ebvideoactivemode":
            case "ebwmvtrackmouse":
            case "ebvideotrackmouse":
            case "ebwmvplay":
            case "ebwmvpause":
            case "ebwmvstop":
            case "ebwmvsetmute":
            case "ebwmvsetvolume":
            case "ebwmvseek":
            case "ebwmvsetbuffer":
            case "ebwmvresize":
            case "ebfullscreenopen":
            case "ebfullscreenclose":
            case "ebfullscreenautoclose":
            case "ebvideofsopen":
            case "ebvideofsclose":
            case "ebvideofsautoclose":
            case "ebvideofsopenalone":
            case "ebvideofshidewin":
            case "ebtestdc":
            case "ebinitse":
            case "ebsetseproxy":
            case "ebseexpandstarted":
            case "ebseretractstarted":
            case "ebseretractfinished":
            case "ebsemouseover":
            case "ebversiontrackingimpression":
            case "ebmousemove":
            case "ebpageload":
            case "ebgetjsvar":
            case "ebgetalljsvars":
            case "ebsetjsvar":
            case "log":
            case "notification":
            case "ebtupdatevideoduration":
            case "ebtstartvideo":
            case "ebtendvideo":
		    case "ebtstopvideo":
		    case "ebinitexpansionparams":
		    case "ebdocumentloaded":
                break;
            //Unknown interaction 
            default:
                addCommand(objName, command, args, "Unknown fscommand:" + lowerCommand, 0, timeint);
                break;
            
        }
	}
	catch (e) 
	{
	    //Illegal interaction
	    addCommand(lowerCommand, args, "Illegal arguments", 0, timeint);
	}
}


//***************************************************************************************
//                                  private methods
//***************************************************************************************

//The function returns the text that should be written in the action for the type of the interaction
function getAcionType(args)
{
    return ((args.toLowerCase() == "auto") ?  "(automatic)" : "(user initiated)");
}

//The function is triggered in case of ci or clickthrough.
function ebInteraction(objName, command, args, actionText, timeint)
{
     var g_fExist = true;
     
     //check if the interaction exist as interaction of the ad 
     //var adInteractions = document.getElementById("adInteractions").value;
     //var interactionName = (args.split(","))[0];
     //g_fExist = IsInteractionExist(interactionName,adInteractions);
         
    //in case of CI that the interaction's name doesn't exist in the ad level -> an error will be displayed
    if ((!g_fExist) && (actionText!= "Click")) 
    {
        actionText+= " (Not properly defined in the ad)";
        addCommand(objName, command, args, actionText, 0, timeint);
    }
    else
        addCommand(objName, command, args, actionText, 1, timeint);
}

//The function checks whether the interaction exists in the adInteractions array
function IsInteractionExist(strInteractionName,adInteractions)
{
   if (adInteractions == "noContainer") //asset that is no related to an ad
        return true;
   var arrAdInteractions = new Array(); 
   arrAdInteractions = adInteractions.split(",");
	for (i=0;i < arrAdInteractions.length;i++)
	{
		if (('"' + arrAdInteractions[i] + '"') == strInteractionName || arrAdInteractions[i] == strInteractionName) 
		{		
			return true;
		}
	}
	return false;
}

//The function add the command that was recieved to the floater and the grid
function addCommand(resName, command, args, actionText, success, timeint)
{
  addCommandToScope(resName, command, args, actionText, success, timeint);
}

function addCommandToScope(resName, command, args, actionText, success, timeint)
{
  //console.log(resName, command, args, actionText, success, timeint);
  var scope = angular.element($("#adPreviewContainer")).scope();
  var event = [];
  event.number = scope.monitorEvents.length + 1;
  event.action = actionText;
  event.part = resName;
  event.command = command;
  event.args = args;
  event.time = renderTimes(timeint);
  scope.$apply(function(){
    scope.monitorEvents.push(event);
  });
}

// renderTime function creates Date objects
// and returns only its time part in format ("hour:min:sec:millisec")
function renderTimes(value) {
    if(value == 0)
        return "N/A";
    var d = new Date(0, 0, 0, 0, 0, 0, value);	// set the Date from milliseconds
    //return Date.format(d, 'H:i:s:u');   // H  24-hour format of an hour with leading zeros      
    // i  Minutes, with leading zeros                                       
    // s  Seconds, with leading zeros           
    // u  Decimal fraction of a second   
    var h = d.getHours();
    if (h < 10)
        h = "0" + h;
    var m = d.getMinutes();
    if (m < 10)
        m = "0" + m;
    var s = d.getSeconds();
    if (s < 10)
        s = "0" + s;
    return (h + ':' + m + ':' + s + ':' + d.getMilliseconds());		
}
