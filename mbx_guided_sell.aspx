<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="mbx_guided_sell.aspx.cs"
    Inherits="trak.Configurator.WebUI.mbx_guided_sell" %>

    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" ng-app="guidedSelling">

    <head id="Head1" runat="server">
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Mailboxes Guided Selling Process</title>
        <link rel="stylesheet" href="css/jquery.ui.css" media="screen" />
        <link rel="stylesheet" href="css/public/bootstrap.min.css" media="screen" />
        <link rel="stylesheet" href="css/sidebar.css" />
        <link rel="stylesheet" href="css/guidedSell.css" />

        <style type="text/css">
            @media only screen and (max-width: 1270px) {
                .guided_sell_text {
                    font-size: 20px !important;
                }
            }

            #banner {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                min-width: 1250px;
            }

            #banner table {
                width: 1057px;
                height: 116px;
                margin-right: auto;
                margin-left: auto;
                border-collapse: collapse;
            }

            #banner td {
                padding: 0 !important;
            }

            span.asterisk {
                color: red;
            }

            table {
                margin: 0 auto;
                float: none;
                padding-top: 2em;
            }

            #tblMain {
                width: 90%;
            }

            .rownumber {
                color: #054E98;
                font-size: 1.3em;
                font-weight: bold;
            }

            .questions {
                width: 50%;
                vertical-align: top !important;
            }

            .indent {
                width: 100%;
                position: relative;
                font-size: 1.1em;
                font-weight: bold;
            }

            .mountDescriptIndent {
                padding-left: 1.2em;
                color: #004696;
            }

            #pedestalnote {
                font-size: .75em;
                padding-left: 1.6em;
            }

            .answers {
                text-align: right;
            }

            .finish_type {
                margin: 0;
                background-color: transparent !important;
            }

            .finish_type tr {
                height: 30px !important;
            }

            .finish_type td {
                border-top: none !important;
            }

            .finish_type_color {
                width: 20%;
                border-radius: 8px;
                border-top: 3px solid white;
                border-bottom: 3px solid white;
            }

            .finish_type_name {
                width: 50%;
            }

            .tipMessage {
                background: #F8F8F8;
                border: 5px solid #DFDFDF;
                color: #717171;
                font-size: smaller;
                font-weight: normal;
                position: absolute;
                text-align: left;
                /*top: -30px;*/
                display: none;
                padding: 0 20px;
                z-index: 100;
                box-shadow: -10px 10px 10px 0px rgba(163, 163, 163, 0.9);
                -webkit-box-shadow: -10px 10px 10px 0px rgba(163, 163, 163, 0.9);
                -moz-box-shadow: -10px 10px 10px 0px rgba(163, 163, 163, 0.9);
            }

            .tipMessage:after {
                content: '';
                position: absolute;
                bottom: -5px;
                width: 10px;
                height: 10px;
                border-bottom: 5px solid #dfdfdf;
                background: #f8f8f8;
                left: 50%;
                margin-left: -10px;
            }

            .tipHeader {
                color: #054E98;
                font-weight: bold;
                font-size: large;
            }

            .showTipOnHover:hover .tipMessage {
                display: block;
            }

            .tipMessageBottom {
                background: #F8F8F8;
                border: 5px solid #DFDFDF;
                color: #717171;
                font-size: smaller;
                font-weight: normal;
                position: absolute;
                text-align: left;
                /*top: 200px;*/
                display: none;
                padding: 0 20px;
                z-index: 100;
                box-shadow: -10px 10px 10px 0px rgba(163, 163, 163, 0.9);
                -webkit-box-shadow: -10px 10px 10px 0px rgba(163, 163, 163, 0.9);
                -moz-box-shadow: -10px 10px 10px 0px rgba(163, 163, 163, 0.9);
            }

            .tipMessageBottom:after {
                content: '';
                position: absolute;
                bottom: -5px;
                width: 10px;
                height: 10px;
                border-bottom: 5px solid #dfdfdf;
                background: #f8f8f8;
                left: 50%;
                margin-left: -10px;
            }

            .showTipOnHoverBottom:hover .tipMessageBottom {
                display: block;
            }

            .radio-item {
                display: inline-block;
                position: relative;
                font-size: 14px;
                -ms-transform: scale(1.5);
                /* IE 9 */
                -webkit-transform: scale(1.5);
                /* Chrome, Safari, Opera */
                transform: scale(1.5);
                vertical-align: top;
                margin: auto 8px;
            }

            .radio-label {
                text-align: center;
            }
        </style>
    </head>

    <body ng-controller="guidedSellingCtrl">
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
                                <img src="../prodconfigmedia/Header/Mailboxes_02.png" width="225" height="100"
                                    border="0" alt="" />
                            </a>
                        </td>
                        <td>
                        </td>
                        <td>

                        </td>
                        <td rowspan="2" style="text-align: right;">
                            <span
                                style="font-family: sans-serif; color: #fff; font-size: 15px; position: absolute; right: 16%; top: 15px;">
                                <a href="#"
                                    onclick="SnapEngage.switchWidget('9a71638d-0459-456a-a72c-1c355bb4ce65'); return SnapEngage.startLink();">
                                    <img src="https://www.snapengage.com/statusImage?w=9a71638d-0459-456a-a72c-1c355bb4ce65&on=https://locker.com/images/chat/Live_Chat_Homepage_btn.jpg&off=https://locker.com/images/chat/Contact_Us_Homepage_btn.jpg"
                                        width="125" height="40" border="0"
                                        onmouseenter="function changeImg(el){$(el)[0].src ='https://www.snapengage.com/statusImage?w=9a71638d-0459-456a-a72c-1c355bb4ce65&on='+ location.origin +'/pc/images/Live_Chat_Underlined.png&off=https://locker.com/images/chat/Contact_Us_Homepage_btn.jpg';}; changeImg(this);"
                                        onmouseleave="function changeImg(el){$(el)[0].src ='https://www.snapengage.com/statusImage?w=9a71638d-0459-456a-a72c-1c355bb4ce65&on=https://locker.com/images/chat/Live_Chat_Homepage_btn.jpg&off=https://locker.com/images/chat/Contact_Us_Homepage_btn.jpg';} changeImg(this);" />
                                </a>
                                &emsp;&emsp;&emsp;&emsp;
                                <span><img src="../prodconfigmedia/Header/Phone_icon.png" height="20"
                                        style="vertical-align: middle;" />&nbsp;&nbsp;1-800-624-5269</span>
                            </span>
                            <br />
                            <span
                                style="color: #fff; font-family: sans-serif; font-size: 45px; position: absolute; right: 16%; top: 50px;">4C
                                Mailbox Configurator</span>
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
        <div class="model fade" id="warning_modal" role="dialog" aria-labelledby="modal_noneSelectedLabel"
            aria-hidden="true" style="display:none;position:absolute;top:50%;left:25%;z-index:9999;">
            <div class="modal-dialog" style="width: 375px;">
                <div class="modal-content axnmContent">
                    <div class="modal-header axnmModalHeader">
                        <button type="button" class="close axnmClose" data-dismiss="modal"
                            aria-hidden="true">Close</button>
                        <h3 class="modal-title axnmModalTitle">No Custom Color Entered</h3>
                    </div>
                    <div class="axnmHR"></div>
                    <div class="modal-body" style="min-height: 80px;">
                        <div class="col-md-12">
                            <img src="images/warning.png" class="col-md-3" />
                            <div class="col-md-9" style="padding: 0;">
                                If Custom color is selected, you must enter text.
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer center-text">
                        <button type="button" class="btn btn-primary axnmModalButtonPri" style="border-radius: 6px;"
                            data-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>
        <div ng-form name="mainForm" style="width: 100%; height: 100%; position:absolute; top: 116px; font-size:14px;">
            <div class="col-xs-12" style="margin: 0 auto; float: none; min-width: 1105px;">
                <div class="col-xs-12"
                    style="background: #d2d2d7; padding: 20px; width: 90%; margin-left: 5%; margin-right: 5%;">
                    <!-- Netop Live Guide Call Button Tag -->

                    <%--<img style="margin-top: -5px; cursor: pointer; position: absolute;"
                        src="Images/Live-Chat-Banner.png"
                        onclick="LGWin=window.open('https://clients-liveguide01us.netop.com/swf.php?LiveGuideUID=4wPT8XuvdOMaOUtYN8FbA-x&myurl=http%253A//192.168.45.21%253A8092/pc_nanda/mbx_guided_sell.aspx&title=Mailboxes%2520Guided%2520Selling%2520Process&LiveGuideCIDuration=NaN&LiveGuideCIRef=&LiveGuideCITitle=Mailboxes%2520Guided%2520Selling%2520Process&LiveGuideCIUrl=http%253A//192.168.45.21%253A8092/pc_nanda/mbx_guided_sell.aspx' ,'NetopWebDesk', 'width=250,height=640,status=yes,left=1190,top=0,resizable=1');LGWin.focus();return false;" />
                    --%>
                    <img style="margin-top:12px; float: left; max-width: 45%;"
                        src="../prodconfigmedia/GuidedSell/Mailbox_dims.png" />
                    <span class="guided_sell_text"
                        style="float: right; color: #004696; font-size: 20px; width: 45%; font-weight: bold;">
                        <ul>
                            <li>
                                Installation dimensions provided
                            </li>
                            <li>
                                USPS or Private delivery
                            </li>
                            <li>
                                ADA layouts available
                            </li>
                            <li>
                                Options for larger doors and parcel lockers
                            </li>
                            <li>
                                Options for sequential and custom engraving
                            </li>
                        </ul>
                        <div style="text-align: left;">
                            <a href="#"
                                onclick="SnapEngage.switchWidget('dd8deb22-6ea0-433d-8ce5-f81e9633a95e'); return SnapEngage.startLink();">
                                <img set-initial-chat-src <img set-initial-chat-src
                                    style="width: 70%; height: 10%; min-height: 10%; max-height: 120px; border: none;"
                                    onmouseenter="function changeImg(el){$(el)[0].src ='https://www.snapengage.com/statusImage?w=dd8deb22-6ea0-433d-8ce5-f81e9633a95e&on=https://locker.com/images/chat/Chat_btn_rollover.gif&off=none';}; changeImg(this);"
                                    onmouseleave="function changeImg(el){$(el)[0].src ='https://www.snapengage.com/statusImage?w=9a71638d-0459-456a-a72c-1c355bb4ce65&on='+ location.origin +'/pc/images/Chat_btn.png&off=none';} changeImg(this);" />
                            </a>
                            <p class="ie">
                                Please note that the Microsoft Internet Explorer is obsolete, which means it's no longer
                                supported and will not work properly with the 4C Mailbox Configurator. We recommend
                                upgrading to Google Chrome, Firefox, Safari, or Microsoft Edge (Explorer's Replacement).
                            </p>
                        </div>
                    </span>
                    <br /><br />
                </div>
                <div>
                    <table id="tblMain" class="table table-striped">
                        <tr>
                            <td class="rownumber">1.</td>
                            <td class="questions"><b>How many mailbox compartments do you need?</b>
                                <br /><span style="font-size: smaller"> - Up to a maximum 500 mailbox compartments per
                                    elevation.</span>
                                <br /><span style="font-size: smaller"> - Leave this field blank for option to create
                                    your own layout or to customize a standard unit.</span>
                                <span class="showTipOnHover"><img src="images/Question_icon.png" height="25" />
                                    <span class="tipMessage">
                                        <span class="tipHeader">To Customize a Standard Unit:</span><br />
                                        <span class="tipBody">
                                            1) Leave the field “How many mailbox compartments do you need?” blank and
                                            click “Next”
                                            <br />
                                            2) Click on the unit height you want for your custom mailbox
                                            <br />
                                            3) Choose a model and click on it to add to the elevation
                                            <br />
                                            4) Click on the “COMPONENTS (CUSTOMIZE UNITS)” tab
                                            <br />
                                            5) Drag a component into the desired location on the unit
                                            <br />
                                            6) Component can only be dragged and placed onto the portion of the unit
                                            that lights up in green
                                            <br />
                                            7) For additional customization options, please select “Private Delivery"
                                        </span>
                                    </span>
                                </span>
                            </td>
                            <td class="answers form-group" colspan="2">
                                &nbsp;&nbsp;<input class="form-control" ng-model="mailbox_count" name="mailboxCount"
                                    type="number" min="0" max="500" placeholder="Maximum 500"
                                    style="width: 50%; margin-left: 20px; float: left;" autocomplete="new-password" />
                                <span id="mailboxCountMessage" class="hidden" style="color: red;"
                                    ng-show="mainForm.mailboxCount.$error.number || !mainForm.mailboxCount.$valid">Quantity
                                    must be between 0 and 500. If you require more than 500 compartments, please contact
                                    our customer service department Monday - Friday between the hours of 6:00 a.m. and
                                    5:00 p.m. PST at 1-800-624-5269 or email us at customerservice@mailboxes.com.
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td class="rownumber">2.</td>
                            <td class="questions"><b>Will the U.S. Postal Service or a Private Individual be delivering
                                    the mail?</b>
                            </td>
                            <td class="answers">
                                <div class="row">
                                    <div class="col-sm-5" style="text-align:left; padding-left:35px;">
                                        <label class="radio-label" for="uspsdelivery">
                                            USPS Delivery
                                            <span class="showTipOnHover"><img src="images/Question_icon.png"
                                                    height="25" />
                                                <span class="tipMessage">
                                                    <span class="tipHeader">USPS Delivery</span><br />
                                                    <span class="tipBody">Choose this option when the U.S. POSTAL
                                                        SERVICE will be delivering the mail. Your local post-master will
                                                        visit your site and install a master postal lock (when
                                                        applicable) that allows access to the unit by a U.S. Postal
                                                        Service employee through one master door opening.</span>
                                                </span>
                                            </span>
                                            <span class="radio-item">
                                                <input type="radio" id="uspsdelivery" ng-model="usps_requirements"
                                                    value="True" ng-checked="usps_requirements == 'True'"
                                                    ng-change="uspsRequiredChange()" />
                                            </span>
                                        </label>
                                    </div>
                                    <div class="col-sm-5" style="text-align:right;">
                                        <label class="radio-label" for="privatedelivery">
                                            Private Delivery
                                            <span class="showTipOnHover"><img src="images/Question_icon.png"
                                                    height="25" />
                                                <span class="tipMessage">
                                                    <span class="tipHeader">Private Delivery</span><br />
                                                    <span class="tipBody">Choose this option when a PRIVATE individual
                                                        (non-USPS employee) will be delivering the mail. Your order will
                                                        include a factory installed master commercial lock (when
                                                        applicable) that allows access to the unit through one master
                                                        door opening.</span>
                                                </span>
                                            </span>
                                            <span class="radio-item">
                                                <input type="radio" id="privatedelivery" ng-model="usps_requirements"
                                                    ng-init="usps_requirements" value="False"
                                                    ng-checked="usps_requirements == 'False'"
                                                    ng-change="uspsRequiredChange()" />
                                            </span>
                                        </label>
                                    </div>
                                    &emsp;&emsp;&emsp;
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td class="rownumber">3.</td>
                            <td class="questions" colspan="2"><b>Select your installation type:</b>
                                <table class="indent">
                                    <tr>
                                        <td style="width:33.333%">
                                            <label class="radio-label" style="display:flex;" for="recessedmount">
                                                <span class="radio-item">
                                                    <input type="radio" id="recessedmount" ng-model="mount_type"
                                                        name="installtype" value="recessed"
                                                        ng-checked="mount_type == 'recessed'"
                                                        ng-change="mountTypeChange()" />
                                                    <span></span>
                                                </span>
                                                <img src="../prodconfigmedia/GuidedSell/3700_4C_Unit_Icon-01.png"
                                                    alt="Recessed Mounted" height="190" />
                                                <br />
                                                <span class="mountDescriptIndent"
                                                    style="float: right; text-align: left; margin:auto 0">3700 Series
                                                    4C<br />Recessed Mounted<br />Horizontal Mailboxes</span><br />
                                                <!--<span id="pedestalnote">(for USPS or private delivery)</span>-->
                                            </label>
                                        </td>
                                        <td style="width:33.333%">
                                            <label class="radio-label" style="display:flex;" for="surfacemount">
                                                <span class="radio-item">
                                                    <input type="radio" id="surfacemount" ng-model="mount_type"
                                                        name="installtype" value="surface"
                                                        ng-checked="mount_type == 'surface'"
                                                        ng-disabled="loading_style === 'R'"
                                                        ng-change="mountTypeChange()" />
                                                    <span></span>
                                                </span>
                                                <img src="../prodconfigmedia/GuidedSell/3700_4C_Unit_Icon-02.png"
                                                    alt="Recessed Mounted" height="190" />
                                                <br />
                                                <span class="mountDescriptIndent"
                                                    style="float: right; text-align: left; margin:auto 0">3800 Series
                                                    4C<br />Surface Mounted<br />Horizontal Mailboxes</span><br />
                                                <!--<span id="pedestalnote">(for USPS or private delivery)</span>-->
                                            </label>
                                        </td>
                                        <td style="width:33.333%">
                                            <label class="radio-label" style="display:flex;" for="freemount">
                                                <span class="radio-item">
                                                    <input type="radio" id="freemount" ng-model="mount_type"
                                                        name="installtype" value="free"
                                                        ng-checked="mount_type == 'free'"
                                                        ng-disabled="loading_style === 'R'"
                                                        ng-change="mountTypeChange()" />
                                                    <span></span>
                                                </span>
                                                <img src="../prodconfigmedia/GuidedSell/3700_4C_Unit_Icon-03.png"
                                                    alt="Free Standing" height="190" />
                                                <br />
                                                <span class="mountDescriptIndent"
                                                    style="float: right; text-align: left; margin:auto 0">3900 Series
                                                    4C<br />Free-Standing<br />Horizontal Mailboxes</span><br />
                                                <!--<span id="pedestalnote">(for USPS or private delivery)</span>-->
                                            </label>
                                        </td>
                                        <!-- <td style="width:25%">
                                        <label class="radio-label" for="pedestalmount">
                                            <span class="radio-item">
                                                <input type="radio" id="pedestalmount" ng-model="mount_type" name="installtype" value="pedestal" ng-checked="mount_type == 'pedestal'" ng-disabled="loading_style === 'R' || usps_requirements === 'True'" ng-change="mountTypeChange()" style="margin-top: 70px;"/>
                                                <span></span>
                                            </span>
                                            <img src="../prodconfigmedia/GuidedSell/3700_4C_Unit_Icon-04.png" alt="Recessed Mounted" height="165" />
                                            <br />
                                            <span class="mountDescriptIndent">3400 Series 4C<br />Pedestal Mounted<br />Horizontal Mailboxes</span><br /><span id="pedestalnote">(for private delivery only)</span>
                                        </label>
                                    </td> -->
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td class="rownumber">4.</td>
                            <td class="questions">
                                <b>Would you like your mailboxes to be Front loading or Rear loading?</b>
                                <br />
                                <span style="font-size:smaller;">(Rear loading available for recessed mounted 3700
                                    series mailboxes only)</span>
                            </td>
                            <td class="answers">
                                <div class="row">
                                    <div class="col-sm-5" style="text-align:left; padding-left:35px;">
                                        <label class="radio-label" for="frontloading">Front Loading
                                            <span class="showTipOnHoverBottom"> <img src="images/Question_icon.png"
                                                    height="25" />
                                                <span class="tipMessageBottom">
                                                    <span class="tipHeader">Front Loading</span><br />
                                                    <span class="tipBodyBottom">Units include one or two (2) master
                                                        door(s) that swing(s) on continuous integral hinges. The two (2)
                                                        high outgoing mail compartment includes the access door and
                                                        cannot be used for mail distribution. The rear of the unit
                                                        incorporates a solid rear cover.</span>
                                                </span>
                                            </span>
                                            <span class="radio-item">
                                                <input type="radio" id="frontloading" ng-model="loading_style"
                                                    ng-init="loading_style = 'F'" value="F"
                                                    ng-checked="loading_style == 'F'"
                                                    ng-change="loadingStyleChange()" />
                                                <span></span>
                                            </span>
                                        </label>
                                    </div>
                                    <div class="col-sm-5" style="text-align:right;">
                                        <label class="radio-label" for="rearloading">Rear Loading
                                            <span class="showTipOnHoverBottom"> <img src="images/Question_icon.png"
                                                    height="25" />
                                                <span class="tipMessageBottom">
                                                    <span class="tipHeader">Rear Loading</span><br />
                                                    <span class="tipBodyBottom">The front of the two (2) high outgoing
                                                        mail compartment is comprised of two (2) fixed panels (no access
                                                        door). The rear of the unit incorporates one or two(2) access
                                                        door(s) with heavy duty latches and continuous hinges.</span>
                                                </span>
                                            </span>
                                            <span class="radio-item">
                                                <input type="radio" id="rearloading" ng-model="loading_style"
                                                    ng-init="loading_style" value="R" ng-checked="loading_style == 'R'"
                                                    ng-change="loadingStyleChange()"
                                                    ng-disabled="mount_type!=='recessed'" />
                                                <span></span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="rownumber">5.</td>
                            <td class="questions"><b>Does your installation need to meet any ADA Requirements?</b>
                                <br />
                                <a href="https://www.mailboxes.com/ada-4c-mailboxes/" target="_blank"
                                    style="font-size: smaller; color: #054E98 !important; font-weight: bold;">Learn more
                                    about ADA Accessibility Compliance Guidelines</a>
                            </td>
                            <td class="answers">
                                <div class="row">
                                    <div class="col-sm-5" id="answer5-yes">
                                        <label class="radio-label" id="ada-req" for="adarequirements">
                                            Yes - <span style="font-size: smaller;">ADA (48" Reach Requirement)</span>
                                            <span class="radio-item">
                                                <input type="radio" id="adarequirements" ng-model="ada_requirements"
                                                    ng-init="ada_requirements" value="True"
                                                    ng-checked="ada_requirements == 'True'" />
                                                <span></span>
                                            </span>
                                        </label>
                                    </div>
                                    <div class="col-sm-5" id="answer5-no">
                                        <label class="radio-label" for="notadarequirements">
                                            No
                                            <span class="radio-item">
                                                <input type="radio" id="notadarequirements" ng-model="ada_requirements"
                                                    ng-init="ada_requirements = 'False'" value="False"
                                                    ng-checked="ada_requirements == 'False'" />
                                                <span></span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="rownumber">6.</td>
                            <td class="questions"><b>Would you like to include parcel lockers to handle
                                    oversized<br />packages for your mailbox installation? The USPS requires<br />one
                                    parcel locker for every ten (10) mailbox compartments<br />(not applicable for
                                    private delivery).</b>
                            </td>
                            <td class="answers">
                                <div class="row">
                                    <div class="col-sm-5" style="text-align:left; padding-left:29px;">
                                        <label class="radio-label" id="par-lock" for="parcellockers">
                                            <span><span style="margin-right: 70px;">Yes, please
                                                    include</span><br />parcel lockers</span>
                                            <span class="radio-item" style="margin-top: -10px;">
                                                <input type="radio" id="parcellockers" ng-model="parcel_lockers"
                                                    ng-init="parcel_lockers = 'True'" value="True"
                                                    ng-checked="parcel_lockers == 'True'">
                                                <span></span>
                                            </span>
                                        </label>
                                    </div>
                                    <div class="col-sm-5" style="text-align:right; margin-left:20px;">
                                        <label class="radio-label" id="no-par-lock" for="noparcellockers">
                                            <span><span style="margin-right: 55px;">No, I do not need</span><br />parcel
                                                lockers</span>
                                            <span class="radio-item" style="margin-top: -10px;">
                                                <input type="radio" id="noparcellockers" ng-model="parcel_lockers"
                                                    ng-init="parcel_lockers" value="False"
                                                    ng-checked="parcel_lockers == 'False'"
                                                    <%--ng-disabled="usps_requirements == 'True'" --%> />
                                                <span></span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="rownumber">7.</td>
                            <td class="questions" colspan="2"><b style="width: 160px;">What color do you want<br />your
                                    mailboxes to be?</b>
                                <table ng-hide="mount_type === 'pedestal'"
                                    class="table table-condensed table-hover finish_type colorTable"
                                    style="text-align:center; float: right; width: calc(100% - 160px); margin-top: -15px;">
                                    <tr>
                                        <td>
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="A"
                                                            ng-checked="finish_type == 'A'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_aluminum.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>Aluminum</label>
                                            </div>
                                        </td>
                                        <td>
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="Z"
                                                            ng-checked="finish_type == 'Z'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_bronze.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>Bronze</label>
                                            </div>
                                        </td>
                                        <td style="display: none;">
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="G"
                                                            ng-checked="finish_type == 'G'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_gold.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>Gold</label>
                                            </div>
                                        </td>
                                        <td>
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="S"
                                                            ng-checked="finish_type == 'S'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_sandstone.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>Sandstone</label>
                                            </div>
                                        </td>
                                        <td>
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="B"
                                                            ng-checked="finish_type == 'B'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_black.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>Black</label>
                                            </div>
                                        </td>
                                        <td>
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="C"
                                                            ng-checked="finish_type == 'C'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <input type="text" ng-model="custom_finish_type"
                                                    style="height: 40px; width: 100px; border-radius: 0; box-shadow: none;"
                                                    ng-change="customTbChanged()" />
                                                <label>Custom Color</label>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="5">
                                            <div style="font-size:smaller; float:right;">
                                                Click to view all available <a
                                                    href="https://www.mailboxes.com/assets/1/6/4C_Custom_Color_Chart.pdf"
                                                    onclick="window.open(this.href, 'targetWindow', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=605,height=400,top=50%,bottom=50%');return false;"
                                                    style="color: #054E98 !important; font-weight: bold;">custom
                                                    colors</a> for 4C Horizontal Mailboxes.
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                <table ng-hide="mount_type !== 'pedestal'"
                                    class="table table-condensed table-hover finish_type colorTable"
                                    style="text-align:center; float: right; width: calc(100% - 160px); margin-top: -15px;">
                                    <tr>
                                        <td>
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="S"
                                                            ng-checked="finish_type == 'S'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_sandstone.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>Sandstone</label>
                                            </div>
                                        </td>
                                        <td>
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="Z"
                                                            ng-checked="finish_type == 'Z'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_bronze.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>Bronze</label>
                                            </div>
                                        </td>
                                        <td style="display: none;">
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="N"
                                                            ng-checked="finish_type == 'N'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_green.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>Green</label>
                                            </div>
                                        </td>
                                        <td>
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="B"
                                                            ng-checked="finish_type == 'B'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_black.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>Black</label>
                                            </div>
                                        </td>
                                        <td style="display: none;">
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="W"
                                                            ng-checked="finish_type == 'W'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_white.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>White</label>
                                            </div>
                                        </td>
                                        <td>
                                            <div style="white-space:nowrap;">
                                                <label>
                                                    <span class="radio-item">
                                                        <input type="radio" ng-model="finish_type" value="Y"
                                                            ng-checked="finish_type == 'Y'"
                                                            ng-change="finishTypeChange()" />
                                                        <span></span>
                                                    </span>
                                                </label>
                                                <img src="../prodconfigmedia/GuidedSell/swatch_gray.png"
                                                    style="height: 40px; width: 40px; border: 1px solid lightgray; padding: 2px;" />
                                                <label>Gray</label>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td class="rownumber"></td>
                            <td colspan="2" style="text-align: center;">
                                <img src="../prodconfigmedia/GuidedSell/Next_btn.png"
                                    ng-click="mainForm.mailboxCount.$invalid || Next();"
                                    ng-style="{true : {opacity:'0.5'}}[ mainForm.mailboxCount.$error.number || !mainForm.mailboxCount.$valid]"
                                    style="cursor: pointer; height: 35px;" />
                                <%--<button class="btn btn-primary" ng-click="Next();"
                                    ng-disabled="mainForm.mailboxCount.$invalid"
                                    style="float: right; border-radius: 6px; min-width: 100px;">Next</button>--%>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
        <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.10/angular.min.js"></script>
        <%--<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js">
            </script>--%>
            <script type="text/javascript"
                src="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"></script>
            <script type="text/javascript" src="../pc/scripts/bootstrap.min.js"></script>
            <script type="text/javascript" src="../pc/scripts/bootswatch.js"></script>
            <script type="text/javascript"
                src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js"></script>
            <script type="text/javascript" src="../pc/Scripts/jquery.ui.touch-punch.min.js"></script>
            <script type="text/javascript" src="../scripts/guide/trak.platform.client.service.js"></script>
            <script type="text/javascript" src="../pc/scripts/trak.configurator.2d.global.js"></script>

            <script type="text/javascript">
                var contextId = "<%=Request.QueryString["context_id"] %>";
                var mountType = "<%=Request.QueryString["mount"] %>";
                angular.module('guidedSelling', ['trak.platform.client'])
                    .controller('guidedSellingCtrl', ['$scope', 'requestHandler', function ($scope, requestHandler) {
                        $("#mailboxCountMessage").removeClass("hidden");
                        $scope.finish_type = "A";
                        $scope.mount_type = mountType === "pedestal" || mountType === "free" || mountType === "surface" ? mountType : "recessed";
                        if ($scope.mount_type === "pedestal") {
                            $scope.usps_requirements = "False";
                        } else {
                            $scope.usps_requirements = "True";
                        }

                        $scope.Next = function () {

                            if ($scope.finish_type === "C" && (!$scope.custom_finish_type || $scope.custom_finish_type === "")) {
                                //show warning that custom color text box is blank but selected
                                /*$("#warning_modal").modal();
                                return;*/

                                //set custom color if blank and selected
                                $scope.custom_finish_type = "TBD";
                            }

                            //$('.loader').show();
                            /*var params = {
                            number_of_mailboxes: (!$scope.mailbox_count) ? null : $scope.mailbox_count,
                            usps_requirements: $scope.usps_requirements,
                            include_parcel_lockers: $scope.parcel_lockers,
                            ada_requirements: $scope.ada_requirements,
                            loading_style: $scope.loading_style,
                            finish_type: $scope.finish_type
                        };
                        requestHandler.execute("mbx_pc_guided_selling_process", params).success(function (d) {
                            window.location = "../pc/modeldesigner.aspx";
                            $('.loader').hide();
                        });*/
                            var designerUrl = "modeldesigner.aspx?model_id=35E18A3A-1DF4-471E-AE0B-57E3B652E787&profile=mbxgs"
                                + "&v:boxes=" + $scope.mailbox_count
                                + "&v:usps=" + $scope.usps_requirements
                                + "&v:parcel=" + $scope.parcel_lockers
                                + "&v:ada=" + $scope.ada_requirements
                                + "&v:load=" + $scope.loading_style
                                + "&v:finish=" + $scope.finish_type
                                + "&v:mount=" + $scope.mount_type
                                + ($scope.finish_type === "C" ? "&v:custColor=" + $scope.custom_finish_type : "");
                            if (contextId != "") { designerUrl += "&context_id=" + contextId; }
                            window.location = designerUrl;

                        };

                        $scope.uspsRequiredChange = function () {
                            if ($scope.usps_requirements === "True" && $scope.mount_type === "pedestal") {
                                $scope.mount_type = "recessed";
                                $scope.mountTypeChange();
                            }
                        };
                        $scope.loadingStyleChange = function () {
                            if ($scope.loading_style === "R" && $scope.mount_type !== "recessed") {
                                $scope.mount_type = "recessed";
                                $scope.mountTypeChange();
                            }
                        }
                        $scope.mountTypeChange = function () {
                            if ($scope.mount_type === "recessed" || $scope.mount_type === "free" || $scope.mount_type === "surface") {
                                if ($scope.finish_type === "N" || $scope.finish_type === "B" || $scope.finish_type === "W" || $scope.finish_type === "Y") {
                                    $scope.finish_type = "A";
                                }
                            } else if ($scope.mount_type === "pedestal") {
                                if ($scope.finish_type === "A" || $scope.finish_type === "G" || $scope.finish_type === "C") {
                                    $scope.finish_type = "S";
                                }
                                $scope.custom_finish_type = "";
                            }
                        }
                        $scope.finishTypeChange = function () {
                            if ($scope.finish_type === "C") {
                                $("[ng-model='custom_finish_type']").focus();
                            } else {
                                $scope.custom_finish_type = "";
                            }
                        }
                        $scope.customTbChanged = function () {
                            $scope.finish_type = "C";
                        }

                        $('.finish_type_color').click(function (e) { //trigger click when clicked on color
                            $(e.target).prev().children()[0].click();
                        });

                        //update scope variables based on passed in mount type
                        $scope.mountTypeChange();
                    }])
                    .directive('setInitialChatSrc', function () {
                        return {
                            restrict: 'A',
                            link: function (scope, ele, attr) {
                                ele[0].src = 'https://www.snapengage.com/statusImage?w=9a71638d-0459-456a-a72c-1c355bb4ce65&on=' + window.location.origin + '/pc/images/Chat_btn.png&off=none';
                            }
                        }
                    });
            </script>

            <div class="loader" style="display: none;">
                <div class="loader-fb"></div>
            </div>
            <style>
                .loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    z-index: 9999;
                }

                .loader.loader-panel {
                    position: absolute;
                }

                .loader * {
                    margin: 0;
                    padding: 0;
                }

                .loader-fb {
                    top: calc(50% - 55px);
                    left: calc(50% - 5px);
                    position: absolute !important;
                }

                /* Demo specific styles end */
                /* Loader with three blocks */
                .loader-fb,
                .loader-fb:before,
                .loader-fb:after {
                    position: relative;
                    display: inline-block;
                    width: 30px;
                    height: 75px;
                    background-color: rgba(226, 226, 226, 0.075);
                    z-index: 100000;
                    content: ' ';
                    margin-left: -4px;
                    margin-right: -18px;
                }

                .loader-fb:before {
                    top: -11px;
                    left: -100%;
                    -webkit-animation: loading-fb 0.8s cubic-bezier(0.4, 0.5, 0.6, 1) infinite;
                    -moz-animation: loading-fb 0.8s cubic-bezier(0.4, 0.5, 0.6, 1) infinite;
                    animation: loading-fb 0.8s cubic-bezier(0.4, 0.5, 0.6, 1) infinite;
                }

                .loader-fb {
                    -webkit-animation: loading-fb-main 0.8s cubic-bezier(0.4, 0.5, 0.6, 1) 0.2s infinite;
                    -moz-animation: loading-fb-main 0.8s cubic-bezier(0.4, 0.5, 0.6, 1) 0.2s infinite;
                    animation: loading-fb-main 0.8s cubic-bezier(0.4, 0.5, 0.6, 1) 0.2s infinite;
                }

                .loader-fb:after {
                    top: -11px;
                    right: -100%;
                    margin-top: 50%;
                    -webkit-animation: loading-fb 0.8s cubic-bezier(0.4, 0.5, 0.6, 1) 0.4s infinite;
                    -moz-animation: loading-fb 0.8s cubic-bezier(0.4, 0.5, 0.6, 1) 0.4s infinite;
                    animation: loading-fb 0.8s cubic-bezier(0.4, 0.5, 0.6, 1) 0.4s infinite;
                }
            </style>

            <asp:PlaceHolder ID="phStartUpConfiguration" runat="server"></asp:PlaceHolder>

            <!-- begin SnapEngage code -->
            <script type="text/javascript">
                (function () {
                    var WidgetId = 'dd8deb22-6ea0-433d-8ce5-f81e9633a95e';
                    var se = document.createElement('script'); se.type = 'text/javascript'; se.async = true;
                    se.src = '//storage.googleapis.com/code.snapengage.com/js/' + WidgetId + '.js';
                    var done = false;
                    se.onload = se.onreadystatechange = function () {
                        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                            done = true;
                            /* Place your SnapEngage JS API code below */
                            /* SnapEngage.allowChatSound(true); Example JS API: Enable sounds for Visitors. */

                        }
                    };
                    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(se, s);
                })();

            </script>
            <!-- end SnapEngage code -->
    </body>

    </html>