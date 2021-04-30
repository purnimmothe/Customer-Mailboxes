<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="modeldesigner.aspx.cs" Inherits="trak.Configurator.WebUI.modeldesigner" %>

<!DOCTYPE html>
<html lang="en" ng-app="vc2d" ng-controller="VC2DController">
<head>
    <meta charset="utf-8"/>
    <title>Visual Product Configurator - 2D</title>
    <link rel="stylesheet" href="css/jquery.ui.css" media="screen"/>
    <link rel="stylesheet" href="CSS/public/bootstrap.min.css"/>
    <link rel="stylesheet" href="CSS/RackProtoUser_styles.css"/>
    <link rel="stylesheet" href="CSS/prodbrowser.css"/>
    <link rel="stylesheet" href="css/modelDesigner.css"/>
    <link rel="stylesheet" href="CSS/normalize.css"/>
    <link rel="stylesheet" href="css/component.css"/>
    <link rel="stylesheet" href="css/sidebar.css"/>
    <link rel="stylesheet" href="CSS/toggle-switch.css"/>
    <link rel="stylesheet" href="CSS/Screen.css"/>

    <!-- only load scripts up to angular before loading DOM.
    this enables use of ngCloak while still being fairly unobtrusive -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script src="scripts/jquery.ui.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.10/angular.min.js"></script>

    <style>
        #banner {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            min-width: 1250px;
            padding-bottom: 10px;
        }
            #banner table {
                width: 1057px;
                height: 116px;
                margin-right: auto;
                margin-left: auto;
                border-collapse: collapse;
                margin-bottom: 0;
            }
            #banner table tr{
                background: #1f2c4c;
            }
            #banner td {
                padding: 0 !important;
            }

            body{
                color: #000;
            }
        
    </style>

</head>
<body ng-cloak class="j-configurator2d">
    <!--  fake fields are a workaround for chrome/opera autofill getting the wrong fields -->
    <input id="username" style="display:none" type="text" name="fakeusernameremembered">
    <input id="password" style="display:none" type="password" name="fakepasswordremembered">
    <!--  END - fake fields are a workaround for chrome/opera autofill getting the wrong fields -->
<div id="banner" style="background-color: #1f2c4c">
    <div>
        <table>
	        <tr>
		        <td rowspan="2">
			        <a href="http://www.mailboxes.com" target="_blank">
				        <img src="../prodconfigmedia/Header/Mailboxes_02.png" width="225" height="100" border="0" alt="" />
			        </a>
		        </td>
		        <td>
		        </td>
		        <td>
			        
		        </td>	
		        <td rowspan="2" style="text-align: right;">
                    <span style="font-family: sans-serif; color: #fff; font-size: 15px; position: absolute; right: 16%; top: 15px;">
                        <a href="#" onclick="SnapEngage.switchWidget('9a71638d-0459-456a-a72c-1c355bb4ce65'); return SnapEngage.startLink();">
                            <img src="https://www.snapengage.com/statusImage?w=9a71638d-0459-456a-a72c-1c355bb4ce65&on=https://locker.com/images/chat/Live_Chat_Homepage_btn.jpg&off=https://locker.com/images/chat/Contact_Us_Homepage_btn.jpg"
                            width="125"
                            height="40"
                            border="0"
							onmouseenter="function changeImg(el){$(el)[0].src ='https://www.snapengage.com/statusImage?w=9a71638d-0459-456a-a72c-1c355bb4ce65&on=' + location.origin + '/pc/images/Live_Chat_Underlined.png&off=https://locker.com/images/chat/Contact_Us_Homepage_btn.jpg';}; changeImg(this);"
							onmouseleave="function changeImg(el){$(el)[0].src ='https://www.snapengage.com/statusImage?w=9a71638d-0459-456a-a72c-1c355bb4ce65&on=https://locker.com/images/chat/Live_Chat_Homepage_btn.jpg&off=https://locker.com/images/chat/Contact_Us_Homepage_btn.jpg';} changeImg(this);"
                            />
                        </a>
                        &emsp;&emsp;&emsp;&emsp;
                        <span><img src="../prodconfigmedia/Header/Phone_icon.png" height="20" style="vertical-align: middle;" />&nbsp;&nbsp;1-800-624-5269</span>
                    </span>
                    <br />
                    <span style="color: #fff; font-family: sans-serif; font-size: 40px; position: absolute; right: 16%; top: 40px;">4C Mailbox Configurator</span>
                    <span style="position: absolute; right: 16%; bottom: 8px; color: #fff; font-weight: bold; font-size: 18px;">{{bannerName}}</span>
		        </td>
	        </tr>
	        <tr>
		        <td>
		        </td>
		        <td>
		        </td>
	        </tr>
        </table>
    </div>
</div>
    
<%--START Loading Modal--%>
<div class="modal fade ng-pristine ng-invalid ng-invalid-required in" data-keyboard="false" data-backdrop="static" style="padding-top: 50px; z-index: 99999!important;display:block;" id="modal_loading" tabindex="-1" aria-hidden="false">
    <div id="startModalLoadingBackdrop" class="modal-backdrop fade in" style="height: 100%;"></div>
    <div class="modal-dialog" style="width: 1px; height: 1px;">
        <div class="modal-content" style="width:0px;height:0px;">
            <div class="modal-body">
                <div id="modalLoading" style="width:0px;height:0px;">
                    <div class="talub">
                        <div id="talublad"> 
                          <span>L</span>
                          <span>O</span>
                          <span>A</span>
                          <span>D</span>
                          <span>I</span>
                          <span>N</span>
                          <span>G</span>
                        </div>
                        <div class="talubraul"></div>
                    </div>
                    <div class="pixelmimic"><a href="http://www.pixelmimic.com/"></a></div>
                </div>
            </div>
        </div>
    </div>
</div>
<%--END Loading Modal--%>
    
<!-- Recover Password -->
<div class="modal fade" style="overflow: auto; padding-top: 50px; z-index: 9999;" id="modal_recoverPassword" tabindex="-1" role="dialog" aria-labelledby="modal_noneSelectedLabel" aria-hidden="true">
    <div class="modal-dialog" style="width: 520px;">
        <div class="modal-content axnmContent">
            <div class="modal-header axnmModalHeader" style="height: 36px;">
                <button type="button" class="close axnmClose" style="margin: 10px !important;" data-dismiss="modal" aria-hidden="true">Close</button>
                <h4 class="modal-title axnmModalTitle">Enter your email address to receive your password</h4>
            </div>
            <div class="axnmHR"></div>
            <form id="form1" runat="server">
                <asp:ScriptManager ID="scriptManager1" runat="server" EnablePartialRendering="true"></asp:ScriptManager>
                <asp:UpdatePanel ID="UpdatePanel1" UpdateMode="Conditional" runat="server">
                    <ContentTemplate>
                        <asp:PasswordRecovery ID="PasswordRecovery1" runat="server" CssClass="pwRecovery"  UserNameFailureText="This email address you entered could not be found in our system.  Please try again, or you may also create a new account.">
                            <UserNameTemplate>
                                <div class="pwDiv">
                                    <div>
                                        <asp:Label ID="UserNameLabel" CssClass="pwLabel" runat="server" AssociatedControlID="UserName">Email: </asp:Label>
                                        <asp:TextBox ID="UserName" CssClass="pwTextEntry" runat="server"></asp:TextBox>
                                        <asp:RequiredFieldValidator ID="UserNameRequired" runat="server" ControlToValidate="UserName" CssClass="red"
                                            ErrorMessage="User Name is required." ToolTip="User Name is required." ValidationGroup="PasswordRecovery1">*</asp:RequiredFieldValidator>
                                    </div>
                                    <div style="color: red;">
                                        <asp:Literal ID="FailureText" runat="server" EnableViewState="False"></asp:Literal>
                                    </div>
                                    <asp:Button class="axnmModalButtonPri"  ID="SubmitButton" runat="server" CommandName="Submit" Text="Submit" ValidationGroup="PasswordRecovery1" />
                                </div>
                            </UserNameTemplate>
                            <SuccessTemplate>
                                <div class="pwSuccess">
                                    You will be receiving your password momentarily via email to the email address on your account.
                                </div>
                            </SuccessTemplate>
                            <MailDefinition
                                Subject="Your password"
                                BodyFileName="../Account/PasswordMail.txt" />
                        </asp:PasswordRecovery>
                    </ContentTemplate>
                </asp:UpdatePanel>
            </form>
        </div>
    </div>
</div>

<div id="header-row" ng-controller="TopMenuBarCtrl">
<%--<span id="pageTitle">{{pageTitle}}</span>--%>
    <topmenubar class="menuBarSection"></topmenubar>
</div>

<div class="clear"></div>
<div id="body-container">
    <div class="parts-container unselectable" style="float:left;" ng-class="{'parts-container-expanded': appUI.productList.expanded}" ng-controller="ProductListCtrl">
        <slide-bar categories="productCategories"></slide-bar>
    </div>
    <div id="droppop" style="display:none;width:220px;height:40px;padding:0px 10px;position:absolute;left:305px;top:45px;border:solid #124EA3 1px;border-radius:8px 8px 8px 0px;color:red;font-weight:bold;text-align:center;z-index:5; background-color: #EDF0F7;">
            Move mouse to product list to remove product
    </div>
    <div id="draglimitpop" style="display:none;width:235px;height:26px;padding:0px 10px;position:absolute;border:solid #124EA3 2px; color:red;font-weight:bold;text-align:center;z-index:1000; background-color:#EDF0F7; ">
        <span id="draglimitmessage"></span>
    </div>
    <bodymenubar class="menuBarSection" style="display:block;margin-left:300px;white-space:nowrap;"></bodymenubar>

    <div class="rack-image" ng-controller="PlayGroundCtrl" style="height: calc(100% - 62px); height: -moz-calc(100% - 62px); height: -webkit-calc(100% - 62px); margin-left: 300px; position: relative;">
        <div id="workbench" class="playGround modelPlayground" style="left:30px;" ng-class="{playGroundExtendLeft:!appUI.productList.expanded, playGroundExtendRight:!appUI.sidebar.expanded}" data-droppable="" data-play-field="">
            <canvas id="canvas"></canvas>
            <mbxruler class="noselect"></mbxruler>
            <guidelines></guidelines>
            <floatingtoolbar></floatingtoolbar>

            <div id="wrapper">
                <img id="imgbase" class="j-base-image"/>
            </div>
            <div id="configuredProductImages" style="position: absolute;"></div>
        </div>
        <%--Begin tip modal--%>
        <div class="modal fade" id="tipContainer" tabindex="-1" role="dialog" aria-labelledby="modal_noneSelectedLabel" aria-hidden="true">
            <div class="modal-dialog" style="width: 730px;">
                <div class="modal-content axnmContent">
                    <div class="modal-header axnmModalHeader">
                        <button type="button" class="close axnmClose" style="" data-dismiss="modal" aria-hidden="true">Close</button>
                        <h3 class="modal-title axnmModalTitle">{{tip.severity}}</h3>
                    </div>
                    <div class="axnmHR"></div>
                    <div class="modal-body" style="min-height: 170px;">
                        <div class="col-xs-2" ng-show="tip.severity.toLowerCase() == 'tip' || tip.severity.toLowerCase() == 'warning' || tip.severity.toLowerCase() == 'error'">
                            <img src="images/tip.png" class="tipImage" ng-show="tip.severity.toLowerCase() == 'tip'"/>
                            <img src="images/warning.png" class="tipImage" ng-show="tip.severity.toLowerCase() == 'warning'"/>
                            <img src="images/error.png" class="tipImage" ng-show="tip.severity.toLowerCase() == 'error'"/>
                        </div>
                        <div class="col-xs-10">
                            <span class="" style="display:block;margin-bottom:4px;white-space:nowrap;" ng-repeat=" message in tip.message">{{message}}</span>
                        </div>
                    </div>
                    <div class="modal-footer" style="text-align:center;">
                        <button type="button" class="btn btn-primary axnmModalButtonPri" style="border-radius: 6px;" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <%--End tip modal--%>
    </div>
</div>
<%--Begin Compare table modal--%>
<div class="modal fade" id="compareModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="overflow: hidden; z-index: 9999;">
    <div class="modal-dialog" style="height: 90%; overflow: auto; width: 75%;">
        <div class="modal-content" id="compareContent" style="margin: 0 auto; width: auto !important;">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h2 class="modal-title">Product Comparison</h2>
            </div>
            <div class="modal-body" id="modalBody">
                <div ng-include src="'compareTemplate.html'" id="modalTemplate" class="overflow-y" style=""></div>
            </div>
            <div class="modal-footer" style="padding-top: 0px; text-align: center;">
                <button type="button" class="btn btn-default btn-lg" data-dismiss="modal" style="background-color: transparent; border-radius: 6px; width: 50%;">
                    <b>Close</b>
                </button>
            </div>
        </div>
    </div>
</div>
<%--End Compare table modal--%>
<%--Begin message modal--%>
<div class="modal fade" id="messageModal" tabindex="-1" role="dialog" aria-labelledby="modal_noneSelectedLabel" aria-hidden="true">
    <div class="modal-dialog" style="width: 350px;">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3 class="modal-title">Warning</h3>
            </div>
            <div class="modal-body">
                <div>Please select a maximum of 4 products</div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" style="border-radius: 6px;" data-dismiss="modal">OK</button>
            </div>
        </div>
    </div>
</div>
<%--End message modal--%>

<script type="text/ng-template" id="compareTemplate.html">
        <div class="component" style="display:none;">
        <table class="overflow-y" id="contentTable" style="overflow-y:auto; overflow-x:auto;">
            <thead>
                <tr>
                    <th class="blankCell" style="width:200px!important;max-width:200px !important;min-width:200px !important;"></th>
                    <th ng-repeat="product in selectedCompareList" style="">
                        <img ng-src="{{product | getImageUrl:config.thumbnailAttr}}"
                            title="{{product | getImageLabel:config.labelAttr}}" class="img img-responsive thumbnailImg" style="max-width:100px; max-height:100px; min-width:100px; min-height:150px; text-align:center;" />
                        <div style="width:100%; white-space:normal;">{{product.productnumber}}<br>{{product.name}}<h3 style="margin:10px 0 10px 0;">${{product.price|number:2}}</h3></div>
                    </th>
                </tr>
            </thead>
            <tbody id="contentBody">
                <tr ng-repeat="key in config.attrs">
                    <th class="attribute capitalize {{key | nameFromKey}}td" style="max-width:200px !important;min-width:200px !important;">{{key | getLabel}}</th>
                    <td ng-repeat="product in selectedCompareList" style="" class="{{key | nameFromKey}}td hideUrl_{{product.productnumber}}">{{key | getProduct:product}}</td>
                    <td ng-repeat="product in selectedCompareList" style=" display:none;" class="{{key | nameFromKey}}td showUrl_{{product.productnumber}}">
                        <span ng-bind-html="key | getProduct:product"></span>
                    </td>
                <tr>
                    <td style=""></td>
                    <td ng-repeat="product in selectedCompareList" style="text-align:center;">
                        <button class="btn btn-primary btn-lg" id="{{product.modelId}}" style="border-radius:6px;" ng-click="startDesign('', true, $event)">Do something</button>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
        <div id="showTable" class="overflow-y" style="overflow-y:hidden; overflow-x:hidden;max-width:800px;;margin: 0 auto; margin-top:0px !important;"></div>
    
    </script>

<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.10/angular-route.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.10/angular-sanitize.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.10/angular-animate.min.js"></script>
<script src="scripts/bootstrap_original.min.js"></script>
<script src="scripts/underscore.js"></script>
<script src="scripts/jquery.ui.touch-punch.min.js"></script>
<script src="scripts/jquery.ba-throttle-debounce.min.js"></script>
<script src="scripts/jquery.stickyHeaderColumn.js"></script>
<script src="scripts/axonom.js"></script>
<%--DEV-START--%><script src="../scripts/guide/trak.platform.client.service.js"></script><%--DEV-END--%>
<%--REL-START--%><%--<script src="../scripts/guide/%!trakplatformclientservicejs%!"></script>--%><%--REL-END--%>
<%--DEV-START--%>
<script src="scripts/trak.configurator.2d.global.js"></script>
<script src="scripts/trak.configurator.2d.modules.js"></script>
<script src="scripts/trak.configurator.2d.client.js"></script>
<script src="scripts/trak.configurator.2d.services.js"></script>
<script src="scripts/mbx/client.js"></script>
<script src="scripts/mbx/directives.js"></script>
<script src="scripts/trak.configurator.2d.directives.js"></script>
<script src="scripts/trak.configurator.2d.controllers.js"></script>
<%--DEV-END--%>
<%--REL-START--%><%--<script src="scripts/%!trakconfigurator2d%!"></script>--%><%--REL-END--%>
<script src="scripts/mbx/mbxProdbrowser.js"></script>

<script>
                            window._orgname = '<%= _orgname %>';
                            window.contextId = '<%= Request.QueryString["context_id"] %>';
    window.designId = '<%= Request.QueryString["design_id"] %>';
    var configmounttype='<%= Request.QueryString["v:mount"] %>';
    window.configuratortype='';
    if(configmounttype=="free"||configmounttype=="surface"||configmounttype=="recessed")
    {
        window.modelVersionId='c734b46b-cb9c-43b3-9834-23dae7aa9ec2';
        configuratortype='4c';
    }
    else if(configmounttype=="standard")
    {
        window.modelVersionId='130b9f72-89e3-445d-b467-25b8ec705582';
        window.configuratortype='CBUStandard';
    }
    else
    {
        window.modelVersionId='9bf44f97-02d4-4942-878d-ba22d387f8d2';
        window.configuratortype='CBURegency';
    }
    
    /*=$( window ).load( function () {
       modelProperties.modelVersionId = window.startValues.modelVersionId;
   } );*/
</script>

<asp:PlaceHolder ID="phStartUpConfiguration" runat="server"></asp:PlaceHolder>

<!-- begin SnapEngage code -->
<script type="text/javascript">
    ( function () {
        var WidgetId = 'dd8deb22-6ea0-433d-8ce5-f81e9633a95e';
        var se = document.createElement( 'script' ); se.type = 'text/javascript'; se.async = true;
        se.src = '//storage.googleapis.com/code.snapengage.com/js/' + WidgetId + '.js';
        var done = false;
        se.onload = se.onreadystatechange = function () {
            if ( !done && ( !this.readyState || this.readyState === 'loaded' || this.readyState === 'complete' ) ) {
                done = true;
                /* Place your SnapEngage JS API code below */
                /* SnapEngage.allowChatSound(true); Example JS API: Enable sounds for Visitors. */

            }
        };
        var s = document.getElementsByTagName( 'script' )[0]; s.parentNode.insertBefore( se, s );
    } )();

</script>
<!-- end SnapEngage code -->
</body>
</html>