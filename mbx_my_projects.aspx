<%@ Page Language="C#" Inherits="trakWebBase.trakPageBase" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" ng-app="myProjects">
<head runat="server">
<meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mailboxes Projects</title>
    <link rel="stylesheet" href="css/jquery.ui.css" media="screen" />
    <%--<link rel="stylesheet" href="css/jquery.quickselect.css" media="screen" />--%>
   <%--<link rel="stylesheet" href="CSS/public/bootstrap.min.css"/>--%>
    <link rel="stylesheet" href="css/public/bootstrap.css" media="screen" />
    <link rel="stylesheet" href="css/public/mbx_bootstrap.css" media="screen" />
    <link rel="stylesheet" href="../pc/css/sidebar.css"/>
    <%--<link rel="stylesheet" href="CSS/public/mbx_modals.css" media="screen" />--%>
    <!-- scripts for jQuery Quick Select -->
    <script src="javascript/jquery.js"></script>
    <script src="javascript/jquery.ui.js"></script>
    <script src="../jquery/jquery_latest.js"></script>
    
    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
        <script src="javascript/html5shiv.js"></script>
        <script src="javascript/respond.min.js"></script>
    <![endif]-->

    <style type="text/css">
        .required:after {
            content: " *";
            color: red;
        }
        :invalid input {
            background-color: #D59494;
            border: 1px solid red;
        }
        .padding {
            padding-bottom: 4px;
        }
        .btn-default {
            background-color: transparent;
            border: 1px solid #d8d8d8;
        }
        .center {
            text-align: center;
        }
        .modal_footer {
            padding: 25px;
        }
        .modal_footer button.left {
            margin-right: 5px;
        }
        .modal_footer button.right {
            margin-left: 5px;
        }
        .modal_footer button.center {
            margin-right: 5px;
            margin-left: 5px;
        }
        input[type=text]::-ms-clear {
            display: none;
        }
        .white_btn {
            background-color: white;
            color: red;
        }
        #banner {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            min-width:1250px;
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
    </style>
</head>
<body ng-controller="myProjectsCtrl">
    <div class="site-container">
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
							onmouseenter="function changeImg(el){$(el)[0].src ='https://www.snapengage.com/statusImage?w=9a71638d-0459-456a-a72c-1c355bb4ce65&on='+ location.origin +'/pc/images/Live_Chat_Underlined.png&off=https://locker.com/images/chat/Contact_Us_Homepage_btn.jpg';}; changeImg(this);"
							onmouseleave="function changeImg(el){$(el)[0].src ='https://www.snapengage.com/statusImage?w=9a71638d-0459-456a-a72c-1c355bb4ce65&on=https://locker.com/images/chat/Live_Chat_Homepage_btn.jpg&off=https://locker.com/images/chat/Contact_Us_Homepage_btn.jpg';} changeImg(this);"
                            />
                        </a>
                        &emsp;&emsp;&emsp;&emsp;
                        <span><img src="../prodconfigmedia/Header/Phone_icon.png" height="20" style="vertical-align: middle;" />&nbsp;&nbsp;1-800-624-5269</span>
                    </span>
                    <br />
                    <span style="color: #fff; font-family: sans-serif; font-size: 45px; position: absolute; right: 16%; top: 50px;">4C Mailbox Configurator</span>
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
        <div class="site-content" style="margin-top: 120px;">
            <div class="bs-docs-section" id="main">
                <div class="partial-container">
                    <div class="search-for-rack partial row">
                        <div>
                            <button class="dark_blue_text" id="btnStartNew4CDesign" ng-click="StartNew4CDesign()"><img style="padding: 5px;" src="images/4C-Config_Icon_Restart.png" />&nbsp;Start New 4C Project</button>
                            <button class="dark_blue_text" id="btnStartNewCBUDesign" ng-click="StartNewCBUDesign()"><img style="padding: 5px;" src="images/4C-Config_Icon_Restart.png" />&nbsp;Start New CBU Project</button>
                            <button class="dark_blue_text" id="btnMyAccount" ng-click="EditMyAccount()">&nbsp;My Account</button>
                            <div style="float: right;">
                                <div>
                                    <label>Sort Records By:</label>&nbsp;&nbsp;&nbsp;
                                </div>
                                <select ng-model="orderByFilter" style="float: right;" ng-change="getProjects('1', null, true);">
                                    <option value="+project_name">Project Name: A-Z</option>
                                    <option value="-project_name">Project Name: Z-A</option>
                                    <option value="[-project_last_updated, -mbx_quote_number]">Date Saved: Newer-Older</option>
                                    <option value="[+project_last_updated, +mbx_quote_number]">Date Saved: Older-Newer</option>
                                    <option value="+user_quote_number">Quote Number Ascending</option>
                                    <option value="-user_quote_number">Quote Number Descending</option>
                                </select>
                            </div>
                            <br />
                            <div class="col-xs-12 ui-widget" style="text-align: right; height: 50px;">
                                <%--<button class="dark_blue_text" id="btnLogout" ng-click="Logout()"><img style="padding: 5px;" src="images/4C-Config_Icon_Clear.png" />&nbsp;Logout</button>--%>
                                <button class="dark_blue_text ui-widget" id="btnLogout" ng-click="Logout()">Logout</button>
                            </div>
                            <br />
                            <!-- Pagination -->
                            <div class="content-copy row ui-widget">
                                <div class="col-xs-12">
                                    <div class="col-xs-6" style="text-align: left; margin: 2px; padding: 2px;">
                                        
                                        <!--  fake fields are a workaround for chrome/opera autofill getting the wrong fields -->
                                        <input id="username" style="display:none" type="text" name="fakeusernameremembered">
                                        <input id="password" style="display:none" type="password" name="fakepasswordremembered">
                                        <!--  END - fake fields are a workaround for chrome/opera autofill getting the wrong fields -->

                                        <label>Search by Project Name: 
                                            <span class="clearable">
                                                <input type="text" class="form-control" autocomplete="off" ng-model="searchProjectName" ng-keyup="searchProjects($event)" maxlength="150" />
                                                <i class="clearable__clear" title="Clear Search">&times;</i>
                                            </span>
                                        </label>
                                        <button class="btn btn-default form-control" id="projectNameSearch" title="Search Projects" ng-click="searchProjects()">
                                        </button>
                                    </div>
                                    <select ng-model="itemsPerPage" ng-change="getProjects(currentPage + 1, itemsPerPage, true)" class="form-control" style="width: 75px; float: right; display: inline-block; margin: 5px auto;">
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                    <div class="pagination" style="/*position: fixed; bottom: 3px; background-color: #E9ECF0; *//*width: 280px; */display: block; margin: 0 auto; z-index: 100; float: right;">
                                        <ul class="pagination" style="margin: 0 auto; padding-top: 4px; margin-right: 55px;">
                                            <%--<li ng-class="prevPageDisabled()">
                                                <a href="#" aria-label="Previous" ng-click="prevPage()">
                                                    <span aria-hidden="true">&laquo;</span>
                                                </a>
                                            </li>--%>
                                            <%--<li ng-repeat="n in range()" ng-class="{active: n == currentPage}" ng-boundry-links="true" ng-link-group-size="2"><a href="#" ng-click="setPage(n)">{{n+1}}</a></li>--%>
                                            <li ng-repeat="n in range() track by $index" ng-class="{active: n == currentPage+1, disabled: n == '&#8230;'}">
                                                <a href="#" ng-click="setPage(n);" class="paginationAnchor">{{n}}</a>
                                            </li>
                                            <%--<li ng-class="nextPageDisabled()">
                                                <a href="#" aria-label="Next" ng-click="nextPage()">
                                                    <span aria-hidden="true">&raquo;</span>
                                                </a>
                                            </li>--%>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <!-- End Pagination -->
                            <div class="content-copy row">
                                <%--<div class="col-xs-11" style="height: 15px;"></div>--%>
                                <div id="tabs-nobg" class="content-area container-fluid" style="border: none !important;">
                                    <div class="content-copy row">
                                        <ul>
                                            <li><a href="#tabs-1" ng-click="tabChanged('Pending')">Pending Projects</a></li>
                                            <li><a href="#tabs-2" ng-click="tabChanged('Completed')">Completed Projects</a></li>
                                        </ul>
                                        <div class="container-fluid my-projects" style="margin-bottom: 25px;">
                                            <div>
                                                <div id="tabs-1">
                                                    <div class="my-project-box" ng-repeat="myproject in myprojects | filter: { project_status: '!Deleted' } | filter: { project_status: '!Completed' } | limitTo: itemsPerPage">
                                                        <div class="project-head light_blue_background border-radius">
                                                            <div class="row">
                                                                <div class="col-xs-3">
                                                                    <span class="projects-name-header">
                                                                        <b>{{myproject.project_name}}</b>
                                                                        <br /><span>Drawing Number: {{myproject.mbx_quote_number}}</span>
                                                                        <br /><span>Quote Number: {{myproject.user_quote_number}}</span>
                                                                    </span>
                                                                </div>
                                                                <div class="col-xs-3">
                                                                    <div class="col-xs-12 right">
                                                                        <span style="padding-right: 30px;">{{myproject.project_total | currency}}</span>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-2 center">
                                                                    <span>Date Saved</span>
                                                                    <br /><span>{{myproject.project_last_updated}}</span>
                                                                </div>
                                                                <div class="col-xs-2">
                                                                    <%--<span ng-click="ShowDeleteProject(myproject)"><img style="cursor: pointer;" src="images/delete.png" title="Delete" /></span>--%>
                                                                    <span ng-click="ShowDeleteProject(myproject)"><img style="cursor: pointer;" src="images/trash.jpg" title="Delete" /></span>
                                                                    <span ng-click="ExportDrawingsCustomerInfo(myproject, myproject.id)"><img style="cursor: pointer;" src="images/print.png" title="Print" /></span>
                                                                </div>
                                                                <div class="col-xs-2 right">
                                                                    <span class="updated-last">Actions</span>
                                                                    <ul>
                                                                        <li>
                                                                            <img src="images/projects-dropdown.png" />
                                                                            <ul class="mid_blue_background">
                                                                                <li ng-click="AddNew4CElevation(myproject)">New 4C Elevation</li>
                                                                                <li ng-click="AddNewCBUElevation(myproject)">New CBU Elevation</li>
                                                                                <%--<li ng-click="QuoteProject(myproject)">Quote Project</li>--%>
                                                                                <li ng-click="OpenPrintableQuote(myproject, myproject.id, 'yes')">Printable Quote</li>                                                                
                                                                                <li ng-click="PurchaseNow(myproject)">Purchase Now</li>
                                                                                <li ng-click="ExportDrawingsCustomerInfo(myproject, myproject.id)">Export Drawings</li>
                                                                                <li ng-click="OutputCAD(myproject)">Export CAD</li>
                                                                                <%--<li ng-click="ExportCAD(myproject)">Export CAD</li>--%>
                                                                                <li ng-click="CloneProject(myproject)">Clone Project</li>
                                                                                <li ng-click="ShowDeleteProject(myproject)">Delete Project</li>
                                                                                <li ng-click="AssignProject(myproject)" ng-show="Assign_Project == true">Assign Project</li>
                                                                                <%--<li ng-click="FreightCalculator(myproject)">Test Freight Service</li>--%>
                                                                                <li ng-click="UpdateCustomerInfo(myproject, 'no', 'no')">Update Customer Info</li>
                                                                                <li ng-click="UploadLogo(myproject)" ng-show="Upload_Logo == true">Upload Logo</li>
                                                                                <li ng-click="ApplyDiscount(myproject)" ng-show="Apply_Discount == true">Apply Discount</li>
                                                                            </ul>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="my-project-body" ng-repeat="design in myproject.designs">
                                                            <div class="row design-box border-radius" ng-show="true">
                                                                <div class="col-xs-6">
                                                                    <div class="col-xs-12">
                                                                        <div class="col-xs-7">
                                                                            <span ng-click="EditDesign(myproject,design)">{{design.design_name}}</span>
                                                                            <%--<span>{{design.design_name}}</span>--%>
                                                                        </div>
                                                                        <div class="col-xs-5 right">
                                                                            <%--<span ng-click="openBOM(myproject,design)"><img src="images/icon_32247.png" />Material List</span>--%>
                                                                            <%--<span ng-click="EditDesign(myproject,design)"><img src="images/edit.png" title="Modify" /></span>--%>
                                                                            <span ng-click="EditDesign(myproject,design)"><img src="images/modify.jpg" title="Modify" /></span>
                                                                            <%--<span ng-click="MoveDesignDialog(myproject,design)"><img src="images/move.png" />Move</span>--%>
                                                                            <%--<span ng-click="ShowDeleteDesign(myproject,design)"><img src="images/delete.png" title="Delete" /></span>--%>
                                                                            <span ng-click="ShowDeleteDesign(myproject,design)"><img src="images/trash.jpg" title="Delete" /></span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-6">
                                                                    <div class="col-xs-12">
                                                                        <div class="col-xs-6 center">
                                                                            <%--<span class="project_last_updated">{{design.project_last_updated}}</span>--%>
                                                                            <span class="project_last_updated"></span>
                                                                        </div>
                                                                        <div class="col-xs-6"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="row alt design-box border-radius" ng-show="false">
                                                                <div class="col-xs-6">
                                                                    <div class="col-xs-12">
                                                                        <div class="col-xs-7">
                                                                            <%--<a href="#" ng-click="EditDesign(myproject,design)">{{design.design_name}}</a>--%>
                                                                            <span>{{design.design_name}}</span>
                                                                        </div>
                                                                        <div class="col-xs-5 right">
                                                                            <%--<span ng-click="openBOM(myproject,design)"><img src="images/icon_32247.png" />Material List</span>--%>
                                                                            <%--<span ng-click="EditDesign(myproject,design)"><img src="images/edit.png" title="Modify" /></span>--%>
                                                                            <span ng-click="EditDesign(myproject,design)"><img src="images/modify.jpg" title="Modify" /></span>
                                                                            <%--<span ng-click="MoveDesignDialog(myproject,design)"><img src="images/move.png" />Move</span>--%>
                                                                            <%--<span ng-click="ShowDeleteDesign(myproject,design)"><img src="images/delete.png" title="Delete" /></span>--%>
                                                                            <span ng-click="ShowDeleteDesign(myproject,design)"><img src="images/trash.jpg" title="Delete" /></span>
									    <span ng-click="OpenPrintableQuote(myproject, myproject.id, 'yes')"><img src="images/print.png" title="Print" /></span>   
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-6">
                                                                    <div class="col-xs-12">
                                                                        <div class="col-xs-6 center">
                                                                            <%--<span class="project_last_updated">{{design.project_last_updated}}</span>--%>
                                                                            <span class="project_last_updated"></span>
                                                                        </div>
                                                                        <div class="col-xs-6"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div id="tabs-2">
                                                    <div class="my-project-box" ng-repeat="myproject in myprojects | filter: { project_status: 'Completed' } | limitTo: itemsPerPage">
                                                        <div class="project-head light_blue_background border-radius">
                                                            <div class="row">
                                                                <div class="col-xs-3">
                                                                    <span class="projects-name-header">
                                                                        <b>{{myproject.project_name}}</b>
                                                                        <br /><span>Drawing Number: {{myproject.mbx_quote_number}}</span>
                                                                        <br /><span>Quote Number: {{myproject.user_quote_number}}</span>
                                                                    </span>
                                                                </div>
                                                                <div class="col-xs-3">
                                                                    <div class="col-xs-12 right">
                                                                        <span style="padding-right: 30px;">{{myproject.project_total | currency}}</span>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-2 center">
                                                                    <span>Date Saved</span>
                                                                    <br /><span>{{myproject.project_last_updated}}</span>
                                                                </div>
                                                                <div class="col-xs-2">
                                                                    <%--<span ng-click="ShowDeleteProject(myproject)"><img style="cursor: pointer;" src="images/delete.png" title="Delete" /></span>--%>
                                                                    <span ng-click="ShowDeleteProject(myproject)"><img style="cursor: pointer;" src="images/trash.jpg" title="Delete" /></span>
                                                                </div>
                                                                <div class="col-xs-2 right">
                                                                    <span class="updated-last">Actions</span>
                                                                    <ul>
                                                                        <li>
                                                                            <img src="images/projects-dropdown.png" />
                                                                            <ul class="mid_blue_background">
                                                                                <%--<li ng-click="ApplyMarkup(myproject)" ng-show="ApplyMargin == true">Apply Markup</li>--%>
                                                                                <li ng-click="UploadLogo(myproject)" ng-show="Upload_Logo == true">Upload Logo</li>
                                                                                <%--<li ng-click="PrintQuote(myproject)">Printable Quote</li>--%>
                                                                                <li ng-click="OpenPrintableQuote(myproject, myproject.id, 'yes')">Printable Quote</li>                                                                
                                                                                <li ng-click="PurchaseNow(myproject)">Purchase Now</li>
                                                                                <li ng-click="ExportDrawingsCustomerInfo(myproject, myproject.id)">Export Drawings</li>
                                                                                <li ng-click="OutputCAD(myproject)">Export CAD</li>
                                                                                <%--<li ng-click="ExportCAD(myproject)">Export CAD</li>--%>
                                                                                <li ng-click="CloneProject(myproject)">Clone Project</li>
                                                                                <li ng-click="ShowDeleteProject(myproject)">Delete Project</li>
                                                                                <li ng-click="ApplyDiscount(myproject)" ng-show="Apply_Discount == true">Apply Discount</li>
                                                                                <li ng-click="AssignProject(myproject)" ng-show="Assign_Project == true">Assign Project</li>
                                                                            </ul>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="my-project-body" ng-repeat="design in myproject.designs">
                                                            <div class="row design-box border-radius" ng-show="true">
                                                                <div class="col-xs-6">
                                                                    <span>{{design.design_name}}</span>
                                                                    <%--<a href="#" ng-click="EditDesign(myproject,design)">{{design.design_name}}</a>--%>
                                                                </div>
                                                                <div class="col-xs-6">
                                                                    <div class="col-xs-12">
                                                                        <div class="col-xs-6 center">
                                                                            <%--<span class="project_last_updated">{{design.project_last_updated}}</span>--%>
                                                                            <span class="project_last_updated"></span>
                                                                        </div>
                                                                        <div class="col-xs-6"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="row alt design-box border-radius" ng-show="false">
                                                                <div class="col-xs-6">
                                                                    <span>{{design.design_name}}</span>
                                                                    <%--<a href="#" ng-click="EditDesign(myproject,design)">{{design.design_name}}</a>--%>
                                                                </div>
                                                                <div class="col-xs-6">
                                                                    <div class="col-xs-12">
                                                                        <div class="col-xs-6 center">
                                                                            <%--<span class="project_last_updated">{{design.project_last_updated}}</span>--%>
                                                                            <span class="project_last_updated"></span>
                                                                        </div>
                                                                        <div class="col-xs-6"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Pagination -->
                                            <div class="col-xs-12">
                                                <select ng-model="itemsPerPage" ng-change="getProjects(currentPage, itemsPerPage)" class="form-control" style="width: 75px; float: right; display: inline-block; margin: 5px auto;">
                                                    <option value="10">10</option>
                                                    <option value="20">20</option>
                                                    <option value="50">50</option>
                                                </select>
                                                <div class="pagination" style="/*position: fixed; bottom: 3px; background-color: #E9ECF0; *//*width: 280px; */display: block; margin: 0 auto; z-index: 100; float: right;">
                                                    <ul class="pagination" style="margin: 0 auto; padding-top: 4px; margin-right: 55px;">
                                                        <%--<li ng-class="prevPageDisabled()">
                                                            <a href="#" aria-label="Previous" ng-click="prevPage()">
                                                                <span aria-hidden="true">&laquo;</span>
                                                            </a>
                                                        </li>--%>
                                                        <%--<li ng-repeat="n in range()" ng-class="{active: n == currentPage}" ng-boundry-links="true" ng-link-group-size="2"><a href="#" ng-click="setPage(n)">{{n+1}}</a></li>--%>
                                                        <li ng-repeat="n in range() track by $index" ng-class="{active: n == currentPage+1, disabled: n == '&#8230;'}" class="paginationAnchor">
                                                            <a href="#" ng-click="setPage(n);">{{n}}</a>
                                                        </li>
                                                        <%--<li ng-class="nextPageDisabled()">
                                                            <a href="#" aria-label="Next" ng-click="nextPage()">
                                                                <span aria-hidden="true">&raquo;</span>
                                                            </a>
                                                        </li>--%>
                                                    </ul>
                                                </div>
                                            </div>
                                            <!-- End Pagination -->
                                            <div class="goToTop" ng-click="goToTop()" title="Go To Top">
                                                <img src="images/chevron-arrow-up.png" style="position: absolute; top: 18px; right: 18px;" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <%--<div class="page-header" id="Div1">
                <div class="row">
                    <div class="col-xs-12 col-md-8 pull-left">
                    </div>
                </div>
            </div>--%>
        </div>
    </div>

    <!-- START Delete design Modal  -->
    <div class="modal fade delete-design" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 400px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Delete your design</h2>
                </div>
                <div class="modal-body center">
                    <p>Are you sure you want to delete your design?</p>
                </div>
                <div class="center modal_footer">
                    <button class="btn axnmModalButtonPri left" ng-click="DeleteDesign()">Yes</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseDeleteDesign()">No</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Delete design Modal-->

    <!-- START Generate a quote Modal  -->
    <div class="modal fade generate-quote-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 350px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Generate a quote</h2>
                </div>
                <div class="modal-body center">
                    <p>Are you sure you want to generate a quote?</p>
                </div>
                <div class="center modal_footer">
                    <button class="btn axnmModalButtonPri left" ng-click="SaveQuoteProject();">Generate a quote</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseQuoteProject();">Close</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Generate a quote Modal-->

    <!-- START Purchase Now Modal  -->
    <div class="modal fade purchase-now-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 350px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Purchase Now</h2>
                </div>
                <div class="modal-body center">
                    <p>Would you like to purchase?</p>
                </div>
                <div class="center modal_footer">
                    <button class="btn axnmModalButtonPri left" ng-click="SavePurchaseNow();">Purchase Now</button>
                    <button class="btn axnmModalButtonPri right" ng-click="ClosePurchaseNow();">Close</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Purchase Now Modal-->

    <!-- START Export CAD-->
    <div class="modal fade cad-output-specs-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 550px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Export CAD</h2>
                </div>
                <div class="modal-body center">
                    <label>Click on the links below to download your project files.</label><br />
                    <%--<a ng-click="PrintReport();">Quote</a><br/>--%>
                    <div class="col-xs-6" style="float: left;">
                        <a class="dark_blue_text" ng-click="PrintReport('yes','pdf', 'ShopDocReport');" style="cursor: pointer;">Quote with Pricing (PDF)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img alt="PDF" src="images/img_pdf.gif" /></a><br />
                        <br />
                        <a class="dark_blue_text" ng-click="PrintReport('yes','word', 'ShopDocReport');" style="cursor: pointer;">Quote with Pricing (Word)&nbsp;&nbsp;&nbsp;&nbsp;<img alt="Word" src="images/img_word.jpg" /></a><br />
                        <br />
                        <a class="dark_blue_text" ng-click="PrintReport('yes','excel', 'ShopDocReport');" style="cursor: pointer;">Quote with Pricing (Excel)&nbsp;&nbsp;&nbsp;&nbsp;<img alt="Excel" src="images/img_xls.gif" /></a><br />
                        <br />
                    </div>
                    <div class="col-xs-6" style="float: right;">
                        <a class="dark_blue_text" ng-click="PrintReport('no','pdf', 'ShopDocReport');" style="cursor: pointer;">Quote without Pricing (PDF)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img alt="PDF" src="images/img_pdf.gif" /></a><br />
                        <br />
                        <a class="dark_blue_text" ng-click="PrintReport('no','word', 'ShopDocReport');" style="cursor: pointer;">Quote without Pricing (Word)&nbsp;&nbsp;&nbsp;&nbsp;<img alt="Word" src="images/img_word.jpg" /></a><br />
                        <br />
                        <a class="dark_blue_text" ng-click="PrintReport('no','excel', 'ShopDocReport');" style="cursor: pointer;">Quote without Pricing (Excel)&nbsp;&nbsp;&nbsp;&nbsp;<img alt="Excel" src="images/img_xls.gif" /></a><br />
                        <br />
                    </div>
                </div>
                <div class="center modal_footer">
                    <button class="btn axnmModalButtonPri" ng-click="CloseExportCAD()">Close</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Export CAD-->

    <!-- START Printable Quote-->
    <div class="modal fade quote-output-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 400px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Printable Quote</h2>
                </div>
                <div class="modal-body center">
                    <label>Select the file type to download your project files.</label><br />
                    <div class="col-xs-12">
                        <a class="dark_blue_text" ng-click="PrintReport('yes','pdf', 'ShopDocReport');" style="cursor: pointer; text-align: right;">PDF&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img alt="PDF" src="images/img_pdf.gif" /></a><br />
                        <br />
                        <a class="dark_blue_text" ng-click="PrintReport('yes','word', 'ShopDocReport');" style="cursor: pointer; text-align: right;">Word&nbsp;&nbsp;&nbsp;&nbsp;<img alt="Word" src="images/img_word.jpg" /></a><br />
                        <br />
                        <a class="dark_blue_text" ng-click="PrintReport('yes','excel', 'ShopDocReport');" style="cursor: pointer; text-align: right;">Excel&nbsp;&nbsp;&nbsp;&nbsp;<img alt="Excel" src="images/img_xls.gif" /></a><br />
                        <br />
                    </div>
                </div>
                <div class="center modal_footer">
                    <button class="btn axnmModalButtonPri" ng-click="ClosePrintableQuote()">Close</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Printable Quote-->

    <!-- START Export Drawings-->
    <div class="modal fade export-drawings-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 400px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Export Drawings</h2>
                </div>
                <div class="modal-body center">
                    <fieldset class="col-xs-12" style="text-align: center">
                        <label>Select the file type to download your drawings.</label><br />
                        <div class="col-xs-12">
                            <a class="dark_blue_text" ng-click="PrintReport('yes','pdf', 'ProjectDrawings');" style="cursor: pointer;">PDF&nbsp;&nbsp;&nbsp;&nbsp;<img alt="PDF" src="images/img_pdf.gif" /></a><br />
                            <br />
                            <%--<a class="dark_blue_text" ng-click="PrintReport('yes','word', 'ProjectDrawings');" style="cursor: pointer;">Word&nbsp;&nbsp;&nbsp;<img alt="Word" src="images/img_word.jpg" /></a><br />
                            <br />--%>
                            <a class="dark_blue_text" ng-click="PrintReport('yes','excel', 'ProjectDrawings');" style="cursor: pointer;">Excel&nbsp;&nbsp;&nbsp;&nbsp;<img alt="Excel" src="images/img_xls.gif" /></a><br />
                            <br />
                        </div>
                    </fieldset>
                </div>
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri" ng-click="CloseExportDrawings()">Close</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Export Drawings-->

    <!-- START Export Drawings Customer Info Modal -->
    <div class="modal fade export-drawing-customer-info-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 450px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Customer Information</h2>
                </div>
                <div class="modal-body center">
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label class="required" style="float: left; vertical-align: middle">Contact Name</label>
                        <input type="text" style="float: right;" ng-model="export_contact_name" maxlength="100" ng-maxlength="100" required />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Company Name</label>
                        <input type="text" style="float: right;" ng-model="export_company_name" maxlength="200" ng-maxlength="200" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label class="required" style="float: left;">Address Line 1</label>
                        <input type="text" style="float: right;" ng-model="export_line_1" maxlength="100" ng-maxlength="100" required />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Address Line 2</label>
                        <input type="text" style="float: right;" ng-model="export_line_2" maxlength="50" ng-maxlength="50" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label class="required" style="float: left;">City</label>
                        <input type="text" style="float: right;" ng-model="export_city" maxlength="100" ng-maxlength="100" required />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label class="required" style="float: left;">State/Province</label>
                        <input type="text" style="float: right;" ng-model="export_state" maxlength="100" ng-maxlength="100" required />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label class="required" style="float: left;">Zip/Postal Code</label>
                        <input type="text" style="float: right;" ng-model="export_zip" maxlength="50" ng-maxlength="50" required />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label class="required" style="float: left;">Phone</label>
                        <input type="text" style="float: right;" ng-model="export_phone" maxlength="50" ng-maxlength="50" required />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Fax</label>
                        <input type="text" style="float: right;" ng-model="export_fax" maxlength="50" ng-maxlength="50" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Email</label>
                        <input type="text" style="float: right;" ng-model="export_work_email" maxlength="255" ng-maxlength="255" />
                    </fieldset>
                </div>
                <div class="col-xs-12" style="text-align: right;">
                    <label style="color: red;">* Required Fields</label>
                </div>
                <br /><br />
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri left" ng-click="ExportDrawingCustomerInfoSet()">Continue</button>
                    <button class="btn axnmModalButtonPri center" ng-click="ClearExportDrawingCustomerInfo()">Clear</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseExportDrawingCustomerInfo()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Export Drawings Customer Info Modal -->

    <!-- START Clone Project Modal-->
    <div class="modal fade copy-project-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" style="overflow: hidden; z-index: 9999;">
        <div class="modal-dialog">
            <div class="modal-content axnmContent" style="width: 350px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Clone Project</h2>
                </div>
                <div class="modal-body center">
                    <fieldset>
                        <label>Provide a name for your cloned project</label>
                    </fieldset>
                    <br />
                    <fieldset>
                        <input type="text" id="copyProjectToProjectName" ng-model="CopyProjectToProjectName" required style="width: 95%;" />
                    </fieldset>
                </div>
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri left" style="width: 40%;" ng-click="SaveCloneProject()">Clone</button>
                    <button class="btn axnmModalButtonPri right" style="width: 40%;" ng-click="CloseCloneProject()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Clone Project Modal-->

    <!-- START Delete project Modal  -->
    <div class="modal fade delete-project" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 400px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Delete Project</h2>
                </div>
                <div class="modal-body center">
                    <p>Are you sure you want to delete this project?</p>
                </div>
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri left" ng-click="DeleteProject()">Delete</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseDeleteProject()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Delete project Modal-->

    <!-- START Assign Project Modal -->
    <div class="modal fade assign-project-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 450px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Assign Project</h2>
                </div>
                <div class="modal-body">
                    <%--<span class="dark_blue_text">Select a user to Assign This Project</span>--%>
                    <div class="row projects-names select-email-address">
                        <fieldset class="col-xs-12">
                            <label>Enter the email address and select from the list</label>
                        </fieldset>
                        <fieldset class="col-xs-12">
                            <input type="text" id="assign_Select" name="assign_Select" value="" style="width: 95%;" />
                        </fieldset>
                    </div>
                </div>
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri left" ng-click="SaveAssignProjectConfirm()">Assign</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseAssignProject()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Assign Project Modal -->

    <!-- START Assign Project Confirm Modal -->
    <div class="modal fade assign-project-confirm-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 350px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Confirm Project Assignment</h2>
                </div>
                <div class="modal-body center">
                    <p>Are you sure you want to assign this project?</p>
                </div>
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri left" ng-click="SaveAssignProject()">Assign</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseAssignProject()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Assign Project Confirm Modal -->

    <!-- START Apply Discount Modal -->
    <div class="modal fade apply-discount-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 500px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Apply Discount</h2>
                </div>
                <%--<div class="row projects-names-no-or">
                    <fieldset class="col-xs-6">
                        <label>Enter a discount amount in dollars</label>
                        <input type="text" ng-model="discountAmount" required />
                    </fieldset>
                </div>--%>
                <div class="modal-body center">
                    <label><input type="radio" ng-model="discount_type" value ="percentage" ng-checked="discount_type == 'percentage'" /> Percentage (%)</label>&nbsp;&nbsp;&nbsp;
                    <label><input type="radio" ng-model="discount_type" value="dollar" ng-checked="discount_type == 'dollar'" /> Dollar Amount ($)</label>&nbsp;&nbsp;&nbsp;
                    <label><input type="radio" ng-model="discount_type" value="none" ng-checked="discount_type == 'none'" ng-init="discount_type = 'none'" /> No Discount</label>
                    <br /><br />
                    <label>Enter a discount</label>
                    <input type="text" ng-model="discountAmount" required />
                </div>
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri left" ng-click="SaveApplyDiscount()">Apply</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseApplyDiscount()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Apply Discount Modal -->

    <!-- START Apply Markup Modal -->
    <%--<div class="modal fade apply-markup-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 350px;">
                <div class="axnmModalHeader">
                    <button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Apply Markup</h2>
                </div>
                <div class="modal-body center">
                    <label>Enter your desired markup percentage</label>
                    <input type="text" ng-model="markupPercentage" required />
                    <div class="collapse-container row buttons" style="padding: 5px;">
                        <div class="col-xs-12">
                            <img id="logo_preview" ng-model="logo_preview" src="#" alt="" />
                            <input id="uploadFile" ng-model="uploadFile" ng-disabled="isDisabled" style="text-align: center;" />
                            <div class="btn btn-secondary fileUpload">
                                <span>Browse<input id="filesToUpload" type="file" class="upload" /></span>
                            </div>
                            <button class="btn btn-secondary" ng-click="upload()">Upload</button>
                        </div>
                    </div>
                    <div class="col-xs-12">
                        <label>* Note: The logo supplied here applies to all outputs generated for your Organization</label>
                    </div>
                </div>
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri left" ng-click="SaveApplyMarkup()">Apply</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseApplyMarkup()">Cancel</button>
                </div>
            </div>
        </div>
    </div>--%>
    <!-- END Apply Markup Modal -->

    <!-- START Upload Logo Modal -->
    <div class="modal fade upload-logo-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 750px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Upload Logo</h2>
                </div>
                <div class="modal-body">
                    <div class="col-xs-12" style="padding: 5px;">
                        <img id="logo_preview" ng-model="logo_preview" src="#" alt="" />
                        <input id="uploadFile" ng-model="uploadFile" ng-disabled="isDisabled" style="text-align: center;" />
                        <div class="btn btn-secondary fileUpload">
                            <span>Browse<input id="filesToUpload" type="file" class="upload" /></span>
                        </div>
                        <%--<button class="btn btn-secondary" ng-click="upload()">Upload</button>--%>
                    </div>
                    <%--<div class="col-xs-12">
                        <label>* Note: The logo supplied here applies to all outputs generated for your Organization</label>
                    </div>--%>
                </div>
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri left" ng-click="upload()">Upload</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseUploadLogo()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Upload Logo Modal -->

    <!-- START Update Customer Info Modal -->
    <div class="modal fade update-customer-info-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 850px; min-height: 600px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Update Customer Information</h2>
                </div>
                <div class="modal-body">
                    <div class="col-xs-6" style="float: left;">
                        <span class="h3 dark_blue_text" style="text-align: left; padding: 5px;">Customer Information</span>
                        <br />
                        <br />
                        <br />
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label class="required" style="float: left; vertical-align: middle">Contact Name</label>
                            <input type="text" style="float: right;" ng-model="address_contact_name" maxlength="100" ng-maxlength="100" required />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left;">Company Name</label>
                            <input type="text" style="float: right;" ng-model="address_company_name" maxlength="200" ng-maxlength="200" />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label class="required" style="float: left;">Address Line 1</label>
                            <input type="text" style="float: right;" ng-model="address_line_1" maxlength="100" ng-maxlength="100" required />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left;">Address Line 2</label>
                            <input type="text" style="float: right;" ng-model="address_line_2" maxlength="50" ng-maxlength="50" />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label class="required" style="float: left;">City</label>
                            <input type="text" style="float: right;" ng-model="address_city" maxlength="100" ng-maxlength="100" required />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label class="required" style="float: left;">State/Province</label>
                            <input type="text" style="float: right;" ng-model="address_state" maxlength="100" ng-maxlength="100" required />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label class="required" style="float: left;">Zip/Postal Code</label>
                            <input type="text" style="float: right;" ng-model="address_zip" maxlength="50" ng-maxlength="50" required />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label class="required" style="float: left;">Phone</label>
                            <input type="text" style="float: right;" ng-model="address_phone" maxlength="50" ng-maxlength="50" required />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left;">Email</label>
                            <input type="text" style="float: right;" ng-model="address_work_email" maxlength="255" ng-maxlength="255" />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left;">Fax</label>
                            <input type="text" style="float: right;" ng-model="address_fax" maxlength="50" ng-maxlength="50" />
                        </fieldset>
                    </div>
                    <div class="col-xs-6" style="float: right;">
                        <span class="h3 dark_blue_text" style="text-align: left; padding: 5px;">Shipping Information</span>
                        <br />
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label>Use My Customer Information</label>&nbsp;
                            <input type="checkbox" ng-model="set_shipping" ng-click="defaultShippingInfo()" />
                        </fieldset>
                        <br />
                        <br />
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left;">Contact Name</label>
                            <input type="text" style="float: right;" ng-model="address_shipto_contact_name" maxlength="100" ng-maxlength="100" />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left;">Company Name</label>
                            <input type="text" style="float: right;" ng-model="address_shipto_company_name" maxlength="200" ng-maxlength="200" />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left;">Address Line 1</label>
                            <input type="text" style="float: right;" ng-model="address_shipto_line_1" maxlength="100" ng-maxlength="100" />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left;">Address Line 2</label>
                            <input type="text" style="float: right;" ng-model="address_shipto_line_2" maxlength="100" ng-maxlength="100" />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label class="required" style="float: left;">City</label>
                            <input type="text" style="float: right;" ng-model="address_shipto_city" maxlength="100" ng-maxlength="100" required />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label class="required" style="float: left;">State/Province</label>
                            <input type="text" style="float: right;" ng-model="address_shipto_state" maxlength="100" ng-maxlength="100" required />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label class="required" style="float: left;">Zip/Postal Code</label>
                            <input type="text" style="float: right;" ng-model="address_shipto_zip" maxlength="50" ng-maxlength="50" required />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left;">Phone</label>
                            <input type="text" style="float: right;" ng-model="address_shipto_phone" maxlength="50" ng-maxlength="50" />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left;">Email</label>
                            <input type="text" style="float: right;" ng-model="address_shipto_work_email" maxlength="255" ng-maxlength="255" />
                        </fieldset>
                        <br /><br />
                        <div class="col-xs-12" style="text-align: right;">
                            <label style="color: red;">* Required Fields</label>
                        </div>
                    </div>
                </div>
                <div class="modal_footer center col-xs-12">
                    <button class="btn axnmModalButtonPri left" ng-click="UpdateCustomerInfoSet()">Continue</button>
                    <button class="btn axnmModalButtonPri center" ng-click="ClearUpdateCustomerInfo()">Clear</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseUpdateCustomerInfo()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Update Customer Info Modal -->

    <!-- START My Account Modal -->
    <div class="modal fade edit-my-account-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 450px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">My Account Information</h2>
                </div>
                <div class="modal-body center">
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left; vertical-align: middle">First Name</label>
                        <input type="text" style="float: right;" ng-model="account_user_fname" maxlength="100" ng-maxlength="100" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left; vertical-align: middle">Last Name</label>
                        <input type="text" style="float: right;" ng-model="account_user_lname" maxlength="100" ng-maxlength="100" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Company Name</label>
                        <input type="text" style="float: right;" ng-model="account_company_name" maxlength="200" ng-maxlength="200" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Address Line 1</label>
                        <input type="text" style="float: right;" ng-model="account_line_1" maxlength="100" ng-maxlength="100" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Address Line 2</label>
                        <input type="text" style="float: right;" ng-model="account_line_2" maxlength="50" ng-maxlength="50" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">City</label>
                        <input type="text" style="float: right;" ng-model="account_city" maxlength="100" ng-maxlength="100" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">State/Province</label>
                        <input type="text" style="float: right;" ng-model="account_state" maxlength="100" ng-maxlength="100" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Zip/Postal Code</label>
                        <input type="text" style="float: right;" ng-model="account_zip" maxlength="50" ng-maxlength="50" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Phone</label>
                        <input type="text" style="float: right;" ng-model="account_work_phone" maxlength="50" ng-maxlength="50" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Fax</label>
                        <input type="text" style="float: right;" ng-model="account_fax" maxlength="50" ng-maxlength="50" />
                    </fieldset>
                    <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                        <label style="float: left;">Email</label>
                        <input type="text" style="float: right;" ng-model="account_work_email" maxlength="255" ng-maxlength="255" />
                    </fieldset>
                </div>
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri left" ng-click="EditMyAccountSet()" tabindex="13">Save</button>
                    <button class="btn axnmModalButtonPri center" ng-click="OpenPasswordChange()">Change Password</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseEditMyAccount()" tabindex="12">Cancel</button>
                </div>
                <%--<br /><br />
                <div class="col-xs-12" style="text-align: right;">
                    <label style="color: red;">* Required Fields</label>
                </div>--%>
            </div>
        </div>
    </div>
    <!-- END My Account Modal -->
    
    <!-- START Change Password Modal -->
    <div class="modal fade change-password-modal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content axnmContent" style="width: 500px;">
                <div class="axnmModalHeader">
                    <%--<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>--%>
                    <button type="button" class="close axnmClose" data-dismiss="modal" aria-hidden="true">Close</button>
                    <h2 class="axnmModalTitle">Change Password</h2>
                </div>
                <div class="modal-body center">
                    <div class="col-xs-12">
                        <label class="change-password-error-msg" style="display:none;color:red;"></label>
                    </div>
                    <div class="col-xs-6" style="margin-left: 25%;">
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left; vertical-align: middle">New Password</label>
                            <input type="password" style="float: right;" ng-model="pwchange_new_pw" maxlength="100" ng-maxlength="100" />
                        </fieldset>
                        <fieldset class="col-xs-12" style="padding-bottom: 5px;">
                            <label style="float: left; vertical-align: middle">Confirm New Password</label>
                            <input type="password" style="float: right;" ng-model="pwchange_confirm_pw" maxlength="100" ng-maxlength="100" />
                        </fieldset>
                    </div>
                </div>
                <div class="modal_footer center">
                    <button class="btn axnmModalButtonPri left" ng-click="ChangePasswordSet()">Change Password</button>
                    <button class="btn axnmModalButtonPri right" ng-click="CloseChangePassword()">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    <!-- END Password Change Modal -->

    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.10/angular.min.js"></script>
    <%--<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>--%>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"></script>
    <script type="text/javascript" src="../pc/scripts/bootstrap.min.js"></script>
    <script type="text/javascript" src="../pc/scripts/bootswatch.js"></script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js"></script>
    <script type="text/javascript" src="../pc/Scripts/jquery.ui.touch-punch.min.js"></script>
    <script type="text/javascript" src="../scripts/guide/trak.platform.client.service.js"></script>
    <script type="text/javascript" src="../pc/scripts/trak.configurator.2d.global.js"></script>

    <script type="text/javascript">
                            var _orgname = "<%=_orgname%>";

                            var project_id = GetQueryString( 'project_id' );
                            var tab_id = GetQueryString( 'tab' );
                            var checkout = GetQueryString( 'checkout' );
                            function GetQueryString( qstring ) {
                                hu = window.location.search.substring( 1 );
                                gy = hu.split( "&" );
                                for ( i = 0; i < gy.length; i++ ) {
                                    ft = gy[i].split( "=" );
                                    if ( ft[0] == qstring ) {
                                        return ft[1];
                                    }
                                }
                                return "";
                            }
    </script>

    <script>
        $( function () {
            var $tabs = $( "#tabs-nobg" ).tabs();
            if ( tab_id.toLowerCase() == "completed" ) {
                //$tabs.tabs("#tabs-2", "selected");
                $tabs.tabs( "option", "active", 1 );
            }
            else {
                //$tabs.tabs("#tabs-1", "selected");
                $tabs.tabs( "option", "active", 0 );
            }
        } );
    </script>

    <script type="text/javascript">
        angular.module( 'myProjects', ['ui.bootstrap'] );
        angular.module( 'myProjects', ['trak.platform.client'] )
            .controller( 'myProjectsCtrl', ['$scope', 'requestHandler', '$timeout', 'authenticationService', function ( $scope, requestHandler, $timeout, authenticationService ) {
                $( '#loading_fullScreen' ).show();
                $scope.mime_type;
                $scope.ShowDesignUniquePartOptions = false;
                $scope.ShowDesignAssembleRackOption = false;
                $scope.designproductspdfs = [];
                $scope.designs = [];
                $scope.selected_project_id = null;
                $scope.customerInfoSet = "no";
                $scope.custInfoPurchaseNow = "no";
                $scope.custInfoPrintableQuote = "no";
                $scope.orderByFilter = "[-project_last_updated, -mbx_quote_number]";
                $scope.searchProjectName = "";

                $scope.getProjects = function ( currentPage, itemsPerPage, doNotRefresh, searchCriteria ) {
                    $( '#loading_fullScreen' ).show();
                    var params = {
                        project_id: null,
                        design_id: null,
                        pagination_current_page: currentPage ? currentPage.toString() :
                            $scope.currentPage ? ( $scope.currentPage + 1 ).toString() : '1',
                        pagination_products_per_page: itemsPerPage ? itemsPerPage.toString() : $scope.itemsPerPage.toString(),
                        project_status: $scope.button_projects == 'Pending' ? 'draft' : 'completed',
                        search_criteria: searchCriteria ? searchCriteria :
                            $scope.searchProjectName ? $scope.searchProjectName : '',
                        orderBy: $scope.orderByFilter
                    };
                    
                    //requestHandler.execute("mbx_pc_project_design_get", params).success(function (d) { //Procedure Message
                    requestHandler.execute( "mbx_project_design_get", params ).success( function ( d ) { //BLU Message
                        $scope.myprojects = [];
                        $scope.mydesigns = d.Table.Rows;
                        $scope.designs = $scope.mydesigns;
                        $scope.totalDraftProjects = 0;
                        $scope.totalCompletedProjects = 0;

                        if ( d.Table1.Rows.length ) {
                            $scope.totalDraftProjects = d.Table1.Rows[0].totaldraftprojects;
                            $scope.totalCompletedProjects = d.Table1.Rows[0].totalcompletedprojects;
                        }

                        var ProjectId = "_INVALID_PROJECT_";
                        var checkoutProject = {};
                        //$('#loading_fullScreen').hide();
                        for ( var i = 0; i < $scope.mydesigns.length; i++ ) {
                            var design = $scope.mydesigns[i];
                            if ( design.project_id != ProjectId ) {
                                //var date_string = design.project_last_updated.replace("/", "").replace("Date", "").replace("(", "").replace(")", "").replace("/", "").toString();

                                //var date_ms = parseInt(date_string);
                                var d_date = new Date( design.project_last_updated ); //var d_date = new Date(date_ms);
                                var d_month = ( '0' + ( d_date.getMonth() + 1 ) ).slice( -2 );
                                var d_day = ( '0' + d_date.getDate() ).slice( -2 );
                                var d_year = d_date.getFullYear();


                                var myproject = {
                                    id: design.project_id,
                                    project_name: design.project_name,
                                    project_last_updated: d_month.toString() + "/" + d_day.toString() + "/" + d_year.toString(), //d_date.toLocaleDateString(), //design.project_last_updated,
                                    project_status: design.project_status,
                                    design_quantity: design.design_quantity,
                                    designs: [],
                                    mbx_quote_number: design.mbx_quote_number,
                                    login_name: design.login_name,
                                    mbx_cust_id: design.mbx_cust_id,
                                    mbx_order_number: design.mbx_order_number,
                                    project_total: /*design.project_total*/0, //Set to 0 as it gets summed up below
                                    postal_code: design.postal_code,
                                    state: design.state,
                                    address_contact_name: design.address_contact_name,
                                    address_company_name: design.address_company_name,
                                    address_line1: design.address_line1,
                                    address_line2: design.address_line2,
                                    address_city: design.address_city,
                                    address_state: design.address_state,
                                    address_zip: design.address_zip,
                                    address_phone: design.address_phone,
                                    address_fax: design.address_fax,
                                    address_work_email: design.address_work_email,
                                    address_shipto_contact_name: design.address_shipto_contact_name,
                                    address_shipto_company_name: design.address_shipto_company_name,
                                    address_shipto_line1: design.address_shipto_line1,
                                    address_shipto_line2: design.address_shipto_line2,
                                    address_shipto_city: design.address_shipto_city,
                                    address_shipto_state: design.address_shipto_state,
                                    address_shipto_zip: design.address_shipto_zip,
                                    address_shipto_phone: design.address_shipto_phone,
                                    address_shipto_work_email: design.address_shipto_work_email,
                                    discount_type: design.discount_type,
                                    discount_amount: design.discount_amount,
                                    discount_percentage: design.discount_percentage,
                                    user_quote_number: design.user_quote_number
                                    //, project_creator_name: design.project_creator_name,
                                    //project_creator_company: design.project_creator_company,
                                    //customer_name: design.customer_name,
                                    //customer_phone: design.customer_phone,
                                    //customer_line1: design.customer_line1,
                                    //customer_line2: design.customer_line2,
                                    //customer_city: design.customer_city,
                                    //customer_state: design.customer_state,
                                    //customer_zip: design.customer_zip,
                                    //customer_quote_number: design.customer_quote_number,
                                    //customer_quote_exp_date: design.customer_quote_exp_date,
                                    //customer_pricing_method: design.customer_pricing_method,
                                    //customer_baseline: design.customer_baseline,
                                    //customer_project_name: design.customer_project_name
                                    /*
                                    , project_components: _.where(d.Table3.Rows, { project_id: design.project_id }),
                                    total_cost: 0,
                                    total_msrp: 0,
                                    total_markup: 0,
                                    total_price: 0,
                                    total_profit: 0,
                                    discount_percent: 0,
                                    discount: 0,
                                    tax_labor: 0,
                                    labor: 0,
                                    tax_freight: 0,
                                    freight: 0,
                                    tax_percent: 0,
                                    tax: 0,
                                    grand_total: 0,
                                    itemize: "yes",
                                    show_part_num: "yes",
                                    show_msrp: "no",
                                    show_labor: "no",
                                    show_freight: "no",
                                    file_format: "pdf"
                                    */
                                };
                                ProjectId = myproject.id;
                                $scope.myprojects.push( myproject );

                                if ( project_id.toString().toLowerCase() == ProjectId.toString().toLowerCase() ) {
                                    //alert("Query String Project ID: " + project_id.toString().toLowerCase() + "; myproject ProjectId: " + ProjectId.toString().toLowerCase());
                                    checkoutProject = myproject;
                                }
                            }
							
							if ( design.design_id != null ) {
                                myproject.designs.push( design );
                                //Sum up design project total to correctly display Project Totals based on each designs total
                                myproject.project_total = myproject.project_total + design.project_total;
                            }
                        }
						
						_.each( $scope.myprojects, function( mp ){ mp.designs = _.sortBy( mp.designs, 'design_name' ); }); //sort designs in a project alphabetically

                        requestHandler.execute( "mbx_security_group_access", {} ).success( function ( sg ) {
                            $scope.Assign_Project = sg.Table.Rows[0].assignproject;
                            $scope.Apply_Discount = sg.Table.Rows[0].applydiscount;
                            $scope.ApplyMargin = sg.Table.Rows[0].applymargin;
                            $scope.Upload_Logo = sg.Table.Rows[0].uploadlogo;
                        } );

                        requestHandler.execute( "mbx_pc_my_account_get", {} ).success( function ( acct ) {
                            $scope.account_user_fname = acct.Table.Rows[0].first_name;
                            $scope.account_user_lname = acct.Table.Rows[0].last_name;
                            $scope.account_line_1 = acct.Table.Rows[0].address_line1;
                            $scope.account_line_2 = acct.Table.Rows[0].address_line2;
                            $scope.account_city = acct.Table.Rows[0].address_city;
                            $scope.account_state = acct.Table.Rows[0].address_state;
                            $scope.account_zip = acct.Table.Rows[0].address_zip;
                            $scope.account_work_phone = acct.Table.Rows[0].work_phone;
                            $scope.account_work_email = acct.Table.Rows[0].work_email;
                            $scope.account_fax = acct.Table.Rows[0].fax;
                            $scope.account_company_name = acct.Table.Rows[0].company_name;
                        } );

                        $timeout( function () {
                            var is_mobile = axonom.configurator.global.Environment.isMobile();
                            if ( is_mobile == "null" || is_mobile == null ) { is_mobile = false; }
                            else { is_mobile = true; }
                            //alert("Is Mobile: " + is_mobile);
                            if ( is_mobile ) {
                                //$(".my-projects .project-box .project-body span").css("opacity", "1 !important");
                                $( ".my-projects .project-box .project-body span" ).addClass( 'changeOpacity' );
                            }
                            else {
                                $( ".my-projects .project-box .project-body span" ).css( "opacity", "1" );
                            }
                        } );
                        $( '#loading_fullScreen' ).hide();
                        if ( !doNotRefresh ) {
                            if ( tab_id.toLowerCase() == "completed" ) {
                                //$scope.button_projects = "Completed";
                                $scope.tabChanged( "Completed" );
                            }
                            else {
                                //$scope.button_projects = "Pending";
                                $scope.tabChanged( "Pending" );
                            }
                        }

                        if ( checkout.toString() == "1" && checkoutProject.id != undefined ) {
                            //User clicked the 'Checkout' button from Designer. Display the 'Purchase Now' modal
                            //alert("Purchase Now Function called");
                            $scope.PurchaseNow( checkoutProject );
                        }
                        $('#loading_fullScreen').hide();
                    } );
                }

                $scope.getProjects( 1, 10 );

                //***Company Logo***//
                $( document ).ready( function () {
                    //alert("Company Logo Get");
                    var params = {};
                    requestHandler.execute( "mbx_pc_company_logo_get", params ).success( function ( d ) {
                        $scope.account_id = d.Table.Rows[0].account_id;
                        $scope.logo_preview = d.Table.Rows[0].image_content;
                        $( "#logo_preview" ).attr( "src", $scope.logo_preview ).width( 147 ).height( 103 );
                        $scope.mime_type = d.Table.Rows[0].mime_type;
                        $scope.uploadFile = d.Table.Rows[0].image_file_name;
                        //$('#loading_fullScreen').hide();
                    } );
                } );

                document.getElementById( 'filesToUpload' ).addEventListener( 'change', fileSelect, false );

                function fileSelect( evt ) {
                    if ( window.File && window.FileReader && window.FileList && window.Blob ) {
                        //alert("In fileSelect Function");
                        var files = evt.target.files;

                        var result = '';
                        var file = files[0];

                        reader = new FileReader();
                        reader.onload = ( function ( tFile ) {
                            return function ( evt ) {
                                $( "#logo_preview" ).attr( "src", evt.target.result ).width( 147 ).height( 103 );
                                $scope.logo_preview = evt.target.result;
                                //---------------------------------// 
                                //    File Name: tFile.name
                                //    MIME Type: tFile.type
                                //    Content: evt.target.result
                                //---------------------------------//
                                document.getElementById( "uploadFile" ).value = tFile.name;
                                $scope.uploadFile = tFile.name;
                                //alert("File Type: " + tFile.type);
                                $scope.mime_type = tFile.type;
                            };
                        }( file ) );
                        reader.readAsDataURL( file );
                        document.getElementById( "uploadFile" ).value = $scope.uploadFile;
                    } else {
                        alert( 'The Upload Logo APIs are not fully supported in this browser.' );
                    }
                }

                $scope.upload = function () {
                    $( '#loading_fullScreen' ).show();
                    var params = {
                        //account_id: $scope.account_id,
                        content: $scope.logo_preview,
                        mime_type: $scope.mime_type,
                        file_name: $scope.uploadFile
                    };
                    requestHandler.execute( "mbx_pc_company_logo_set", params ).success( function ( d ) {
                        alert( "The Logo was successfully uploaded." );
                        $( '#loading_fullScreen' ).hide();
                        $scope.CloseUploadLogo();
                    } );
                }
                //END Company Logo***//

                //***START Upload Logo***//
                $scope.UploadLogo = function ( myproject ) {
                    $scope.SelectedMyproject = myproject;
                    $( ".upload-logo-modal" ).modal( "show" );
                };

                $scope.CloseUploadLogo = function () {
                    $( ".upload-logo-modal" ).modal( "hide" );
                };
                //***END Upload Logo***//

                //***START NEW DESIGN***//
                $scope.StartNew4CDesign = function () {
                    $( '#loading_fullScreen' ).show();
                    window.location = "../pc/mbx_guided_sell.aspx";
                }
                //***END START NEW DESIGN***//

                //***START NEW CBU DESIGN***//
                $scope.StartNewCBUDesign = function () {
                    $( '#loading_fullScreen' ).show();
                    window.location = "../pc/mbx_guided_sell2.aspx";
                }
                //***END START NEW DESIGN***//

                //**START LOGOUT***//
                $scope.Logout = function () {
                    $( '#loading_fullScreen' ).show();
                    authenticationService.logOut().success( function () {
                        //alert("Logout Successful");
                        //window.location.reload(true);
                        window.location.href = "http://www.mailboxes.com/4c-configurator/";
                    } )
                        .error( function () {
                            alert( "Logout Failed" );
                        } );
                    $( '#loading_fullScreen' ).hide();
                };
                //***END LOGOUT***//

                //***EDIT DESIGN***//
                $scope.EditDesign = function ( myproject, mydesign ) {
                    $( '#loading_fullScreen' ).show();
                    window.location = "../pc/modeldesigner.aspx?context_id=" + myproject.id + "&design_id=" + mydesign.design_id;
                    //window.location = "../pc/mbx_guided_sell.aspx?context_id=" + myproject.id + "&design_id=" + mydesign.design_id;
                }
                //***END EDIT DESIGN***//

                //***DELETE DESIGN***//
                $scope.ShowDeleteDesign = function ( myproject, mydesign ) {
                    $scope.SelectedMyproject = myproject;
                    $scope.SelectedMydesign = mydesign;
                    $( ".delete-design" ).modal( "show" );
                }

                $scope.CloseDeleteDesign = function () {
                    $( ".delete-design" ).modal( "hide" );
                };

                $scope.DeleteDesign = function () {
                    var params = { selecteddesignid: $scope.SelectedMydesign.design_id };
                    requestHandler.execute( "mbx_pc_design_delete", params ).success( function ( d ) {
                        $scope.RemoveDesign( $scope.SelectedMyproject, $scope.SelectedMydesign );
                        $scope.SelectedMyproject = "";
                        $scope.SelectedMydesign = "";
                        $scope.CloseDeleteDesign();
                        window.location.reload( true );
                    } );
                };

                $scope.RemoveDesign = function ( myproject, mydesign ) {
                    var projectindex = $scope.myprojects.indexOf( myproject );
                    var index = myproject.designs.indexOf( mydesign );
                    $scope.myprojects[projectindex].designs.splice( index, 1 );
                    //$scope.myprojects.push(myproject);
                }
                //***END DELETE DESIGN***//

                //***New Elevation***//
                $scope.AddNew4CElevation = function ( myproject ) {
                    //window.location = "../pc/modeldesigner.aspx?context_id=" + myproject.id;
                    window.location = "../pc/mbx_guided_sell.aspx?context_id=" + myproject.id;
                };

                //***New CBU Elevation***//
                $scope.AddNewCBUElevation = function ( myproject ) {
                    //window.location = "../pc/modeldesigner.aspx?context_id=" + myproject.id;
                    window.location = "../pc/mbx_guided_sell2.aspx?context_id=" + myproject.id;
                };

                //***Quote Project***//
                $scope.QuoteProject = function ( myproject ) {
                    $scope.SelectedMyproject = myproject;
                    $( ".generate-quote-modal" ).modal( "show" );
                };

                $scope.SaveQuoteProject = function () {
                    $( '#loading_fullScreen' ).show();
                    alert( "Please note that your project will be moved from Pending Projects to Completed Projects section where you can select \"Printable Quote\" from the Actions menu" );
                    var freight_estimate = 0;
                    /*2015-12-22: Make freight call for all users & all Projects*/
                    //if ($scope.SelectedMyproject.project_total > 2500) {
                    //    if ($scope.ApplyMargin == true) {
                    //        //User is apart of Dealer Role & Project total is greater than $2500 = Free Freight
                    //        freight_estimate = 0;
                    //    }
                    //}
                    //else {
                    //    //Total Price < $2500
                    //    if ($scope.SelectedMyproject.postal_code == /*"blank"*/undefined) { freight_estimate = null; } //Unable to calculate freight
                    //    else {
                    //        freight_estimate = $scope.FreightCalculator($scope.SelectedMyproject);
                    //    }
                    //}
                    /*2015-12-23: Commented out because MBX changed their freight carrier from UPS to FedEx in Sept. & AmericanEagle.com has to make some changes for it to work*/
                    /*2016-02-23: Commented out (again) per request from Mei-Ling. Only wants freight service called during print quote*/
                    //freight_estimate = $scope.FreightCalculator($scope.SelectedMyproject);

                    //Execute Pricing Logic before generating Quote
                    var project_id_param = {
                        project_id: $scope.SelectedMyproject.id
                    };
                    requestHandler.execute( "mbx_set_pricing_project", project_id_param ).success( function () {
                        var params = {
                            project_id: $scope.SelectedMyproject.id,
                            freight_estimate: ( freight_estimate != undefined ) ? freight_estimate : null,
                            project_total: $scope.SelectedMyproject.project_total
                        };
                        requestHandler.execute( "mbx_pc_quote_request", params ).success( function () {
                            //window.location = "mbx_quote.aspx?orgname=" + _orgname + "&project_id=" + $scope.SelectedMyproject.id;
                            window.location.reload( true );
                        } );
                    } );
                };

                $scope.CloseQuoteProject = function () {
                    $( ".generate-quote-modal" ).modal( "hide" );
                };
                //***END Quote Project***//

                $scope.FreightCalculator = function ( myproject ) {
                    var freight_rate = 0;
                    $scope.SelectedMyproject = myproject;
                    //$('#loading_fullScreen').show();
                    var params = {
                        project_id: $scope.SelectedMyproject.id
                    };
                    requestHandler.execute( "mbx_freight_estimate", params ).success( function ( d ) {
                        if ( d.Errors == null ) {
                            //alert(d.Rate);
                            //alert("Successful Freight Calculation Service Call");
                            freight_rate = d.Rate;
                            var params = {
                                project_id: $scope.SelectedMyproject.id,
                                freight_estimate: freight_rate,
                                freight_code: 0
                            };
                            requestHandler.execute( "mbx_pc_project_freight_set", params ).success( function () {

                            } );
                        }
                        else {
                            //d.Errors[0].Code: -1 = invalid zip code; -2 = no shipping cost from FedEx
                            //alert("Freight Service Error: " + d.Errors[0].Message);
                            //Commented alert out 2016-02-23 per Mei-Ling
                            //if (d.Errors[0].Code != -2) {
                            //    alert(d.Errors[0].Message);
                            //}
                            var params = {
                                project_id: $scope.SelectedMyproject.id,
                                freight_estimate: freight_rate,
                                freight_code: d.Errors[0].Code
                            };
                            requestHandler.execute( "mbx_pc_project_freight_set", params ).success( function () {

                            } );
                        }
                        return freight_rate;
                    } )
                        .error( function ( e ) {
                            alert( e.ExceptionDetail.InnerException.InnerException.Message );
                            var params = {
                                project_id: $scope.SelectedMyproject.id,
                                freight_estimate: freight_rate,
                                freight_code: 0
                            };
                            requestHandler.execute( "mbx_pc_project_freight_set", params ).success( function () {

                            } );
                            return freight_rate;
                        } )
                        ;
                    //$('#loading_fullScreen').hide()
                    //return freight_rate;
                };

                //***Purchase Now***//
                $scope.PurchaseNow = function ( myproject ) {
                    $scope.SelectedMyproject = myproject;
                    $scope.custInfoPurchaseNow = "yes";
                    //if ($scope.SelectedMyproject.address_contact_name != null) { $scope.customerInfoSet = "yes"; }
                    //else { $scope.customerInfoSet = "no"; }

                    //if ($scope.customerInfoSet == "yes") { $(".purchase-now-modal").modal("show"); }
                    //else {
                    //    $scope.UpdateCustomerInfo(myproject, $scope.custInfoPurchaseNow.toString());
                    //}
                    //Commented out 2016-03-04 per Mei-Ling as no longer want user to input address info during purchase now
                    //$scope.UpdateCustomerInfo(myproject, $scope.custInfoPurchaseNow.toString(), "no");
                    //Just display Purchase Now modal for above comments for 2016-03-04
                    $( ".purchase-now-modal" ).modal( "show" );
                };

                $scope.SavePurchaseNow = function () {
                    $( '#loading_fullScreen' ).show();
                    var freight_estimate = 0;
                    /*2015-12-22: Make freight call for all users & all Projects*/
                    //if ($scope.SelectedMyproject.project_total > 2500) {
                    //    if ($scope.ApplyMargin == true) {
                    //        //User is apart of Dealer Role & Project total is greater than $2500 = Free Freight
                    //        freight_estimate = 0;
                    //    }
                    //}
                    //else {
                    //    //Total Price < $2500
                    //    if ($scope.SelectedMyproject.postal_code == /*"blank"*/undefined) { freight_estimate = null; } //Unable to calculate freight
                    //    else {
                    //        freight_estimate = $scope.FreightCalculator($scope.SelectedMyproject);
                    //    }
                    //}
                    /*2015-12-23: Commented out because MBX changed their freight carrier from UPS to FedEx in Sept. & AmericanEagle.com has to make some changes for it to work*/
                    /*2016-02-23: Commented out (again) per request from Mei-Ling. Only wants freight service called during print quote*/
                    //freight_estimate = $scope.FreightCalculator($scope.SelectedMyproject);

                    if ( $scope.SelectedMyproject.project_status == "Draft" ) {
                        //Execute Pricing Logic
                        var project_id_param = {
                            project_id: $scope.SelectedMyproject.id
                        };
                        requestHandler.execute( "mbx_set_pricing_project", project_id_param ).success( function () {
                            var params = {
                                project_id: $scope.SelectedMyproject.id,
                                freight_estimate: ( freight_estimate != undefined ) ? freight_estimate : null,
                                project_total: $scope.SelectedMyproject.project_total
                            };
                            requestHandler.execute( "mbx_pc_purchase_quote", params ).success( function () {
                                var sc_params = {
                                    project_id: $scope.SelectedMyproject.id
                                };
                                requestHandler.execute( "mbx_purchase_now", sc_params ).success( function ( d ) {
                                    if ( d.ErrorMessage != "" ) {
                                        alert( d.ErrorMessage );
                                        $scope.ClosePurchaseNow();
                                        $( '#loading_fullScreen' ).hide();
                                    }
                                    else {
                                        //alert("Shopping Cart URL: " + d.ShoppingCartUrl + "; Session ID: " + d.SessionID);
                                        $scope.ClosePurchaseNow();
                                        $( '#loading_fullScreen' ).hide();
                                        /*Send user to Shopping Cart Process*/
                                        window.location = d.ShoppingCartUrl;
                                    }
                                } )
                                    .error( function ( e ) {
                                        //alert(e.ExceptionDetail.InnerException.InnerException.Message);
                                        alert( "An error has occurred during the Shopping Cart Service Process. Please try again or contact your Mailboxes Sales Representative. Error Message: " + e.ExceptionDetail.InnerException.InnerException.Message );
                                        $scope.ClosePurchaseNow();
                                        $( '#loading_fullScreen' ).hide();
                                    } );
                            } );
                        } );
                    } //End Draft Quotes
                    else {
                        //Execute Pricing Logic
                        var sc_project_id_param = {
                            project_id: $scope.SelectedMyproject.id
                        };
                        requestHandler.execute( "mbx_set_pricing_project", sc_project_id_param ).success( function () {
                            var sc_params = {
                                project_id: $scope.SelectedMyproject.id
                            };
                            requestHandler.execute( "mbx_purchase_now", sc_params ).success( function ( d ) {
                                if ( d.ErrorMessage != "" ) {
                                    alert( d.ErrorMessage );
                                    $scope.ClosePurchaseNow();
                                    $( '#loading_fullScreen' ).hide();
                                }
                                else {
                                    //alert("Shopping Cart URL: " + d.ShoppingCartUrl + "; Session ID: " + d.SessionID);
                                    $scope.ClosePurchaseNow();
                                    $( '#loading_fullScreen' ).hide();
                                    /*Send user to Shopping Cart Process*/
                                    window.location = d.ShoppingCartUrl;
                                }
                            } )
                                .error( function ( e ) {
                                    //alert(e.ExceptionDetail.InnerException.InnerException.Message);
                                    alert( "An error has occurred during the Shopping Cart Service Process. Please try again or contact your Mailboxes Sales Representative. Error Message: " + e.ExceptionDetail.InnerException.InnerException.Message );
                                    $scope.ClosePurchaseNow();
                                    $( '#loading_fullScreen' ).hide();
                                } );
                        } );
                    } //End Completed Quotes
                };

                $scope.ClosePurchaseNow = function () {
                    $scope.custInfoPurchaseNow = "no";
                    $( ".purchase-now-modal" ).modal( "hide" );
                };
                //***END Purchase Now***//

                //***Export CAD***//
                $scope.ExportCAD = function ( myproject, myprojectid ) {
                    $( ".cad-output-specs-modal" ).modal( "show" );
                    $scope.SelectedMyproject = myproject;
                    $scope.selected_project_id = $scope.SelectedMyproject.id;
                    $scope.designs = [];
                    var params = { project_id: myprojectid, design_id: null };
                    requestHandler.execute( "mbx_pc_project_design_get", params ).success( function ( d ) {
                        $scope.designs = d.Table.Rows;
                    } );
                    //$scope.designs = _.where($scope.designs, { project_id: myprojectid });
                    $scope.geturls( myprojectid );
                };

                $scope.CloseExportCAD = function () {
                    $( ".cad-output-specs-modal" ).modal( "hide" );
                };

                $scope.ClosePrintableQuote = function () {
                    $( ".quote-output-modal" ).modal( "hide" );
                };

                $scope.CloseExportDrawings = function () {
                    $( ".export-drawings-modal" ).modal( "hide" );
                };

                $scope.geturls = function ( id ) {
                    var params = { project_id: id };
                    requestHandler.execute( "mbx_sp_pc_get_urls", params ).success( function ( d ) {
                        $scope.designproductspdfs = d.Table.Rows;
                    } );
                };


                $scope.PrintReport = function ( show_pricing, report_type, report_name ) {
                    $( '#loading_fullScreen' ).show();
                    var username = $scope.SelectedMyproject.login_name;
                    var outputTitle = $scope.SelectedMyproject.mbx_quote_number;

                    if ( !outputTitle )
                        outputTitle = $scope.SelectedMyproject.project_name;



                    outputTitle = outputTitle.replace( /[^\w\s]/gi, '' ).replace( " ", "_" ); // remove special characters and spaces

                    var url = "mbx_download_report.aspx?report_name=" + report_name + "&project_id=" + $scope.SelectedMyproject.id + "&username=" + username + "&orgname=" + _orgname + "&quote_number=" + outputTitle +  /*"&show_pricing=" + show_pricing + */ "&report_type=" + report_type;

                    if ( report_name == "ProjectDrawings" ) {
                        // populate pt_pc_design_images table with images for the project

                        var configIds = [];

                        for ( var i = 0; i < $scope.SelectedMyproject.designs.length; i++ ) {
                            configIds.push( $scope.SelectedMyproject.designs[i].design_id );
                        }


                        var params = { configurationIds: configIds }; //, fileDirectoryImages: '<%=Context.Server.MapPath(@"~/prodconfigmedia").Replace(@"\", @"\\").Replace("'", @"\'") %>' };

                    requestHandler.execute( "pc_images_mailboxes", params ).success( function ( d ) { window.location.href = url; $( '#loading_fullScreen' ).hide(); } ).error( function ( e ) {
                        $( '#loading_fullScreen' ).hide();
                        alert( "Images failed to load. Error Message: " + e.ExceptionDetail.InnerException.InnerException.Message );

                    } );  // only open report after images loaded

                }


                else {

                    window.location.href = url;
                    $( '#loading_fullScreen' ).hide();
                }
            };

            function outputAssembly( design_id, design_name ) {

                var configIds = [];

                for ( var i = 0; i < $scope.SelectedMyproject.designs.length; i++ ) {
                    configIds.push( $scope.SelectedMyproject.designs[i].design_id );
                }



                var params = { configurationIds: configIds}; //, fileDirectoryImages: '<%=Context.Server.MapPath(@"~/prodconfigmedia").Replace(@"\", @"\\").Replace("'", @"\'") %>' };
                requestHandler.execute( "pc_images_mailboxes", params ).success( function ( d ) { } );
            };


            //Added for Export Modal
            $scope.OpenPrintableQuote = function ( myproject, myprojectid, fromPrintableQuote ) {
                $( '#loading_fullScreen' ).show();
                //$(".quote-output-modal").modal("show");
                $scope.SelectedMyproject = myproject;
                $scope.selected_project_id = $scope.SelectedMyproject.id;
                $scope.custInfoPurchaseNow = "no";
                $scope.custInfoPrintableQuote = fromPrintableQuote.toString();
                $scope.designs = [];
                var params = { project_id: myprojectid, design_id: null };
                requestHandler.execute( "mbx_pc_project_design_get", params ).success( function ( d ) {
                    $scope.designs = d.Table.Rows;
                } );
                //$scope.designs = _.where($scope.designs, { project_id: myprojectid });
                //$scope.geturls(myprojectid);
                /*
                if ($scope.SelectedMyproject.address_contact_name != null) {
                    $scope.customerInfoSet = "yes";
                    $(".quote-output-modal").modal("show");
                }
                else {
                    $scope.customerInfoSet = "no";
                    $scope.UpdateCustomerInfo(myproject, $scope.custInfoPurchaseNow.toString());
                }
                */
                $scope.UpdateCustomerInfo( myproject, $scope.custInfoPurchaseNow.toString(), $scope.custInfoPrintableQuote.toString() );
                $( '#loading_fullScreen' ).hide();
            };

            //***Export Drawings***//
            /*
            $scope.ExportDrawings = function (myproject, myprojectid) {
                $('#loading_fullScreen').show();
                //$(".export-drawings-modal").modal("show");
                $scope.SelectedMyproject = myproject;
                $scope.selected_project_id = $scope.SelectedMyproject.id;
                $scope.designs = [];
                $scope.custInfoPurchaseNow = "no";
                var params = { project_id: myprojectid, design_id: null };
                requestHandler.execute("mbx_pc_project_design_get", params).success(function (d) {
                    $scope.designs = d.Table.Rows;
                });
                //$scope.designs = _.where($scope.designs, { project_id: myprojectid });
                //$scope.geturls(myprojectid);
                if ($scope.SelectedMyproject.address_contact_name != null) {
                    $scope.customerInfoSet = "yes";
                    $(".export-drawings-modal").modal("show");
                }
                else {
                    $scope.customerInfoSet = "no";
                    $scope.UpdateCustomerInfo(myproject, $scope.custInfoPurchaseNow.toString());
                }

                $('#loading_fullScreen').hide();
            };
            */
            $scope.ExportDrawingsCustomerInfo = function ( myproject, myprojectid ) {
                $scope.SelectedMyproject = myproject;
                $scope.selected_project_id = $scope.SelectedMyproject.id;
                if ( $scope.SelectedMyproject.address_contact_name != null ) {
                    //Populate modal form fields
                    $scope.export_contact_name = $scope.SelectedMyproject.address_contact_name;
                    $scope.export_company_name = $scope.SelectedMyproject.address_company_name;
                    $scope.export_line_1 = $scope.SelectedMyproject.address_line1;
                    $scope.export_line_2 = $scope.SelectedMyproject.address_line2;
                    $scope.export_city = $scope.SelectedMyproject.address_city;
                    $scope.export_state = $scope.SelectedMyproject.address_state;
                    $scope.export_zip = $scope.SelectedMyproject.address_zip;
                    $scope.export_phone = $scope.SelectedMyproject.address_phone;
                    $scope.export_fax = $scope.SelectedMyproject.address_fax;
                    $scope.export_work_email = $scope.SelectedMyproject.address_work_email;
                }
                else {
                    //Ensure the modal form is blank for all fields
                    $scope.export_contact_name = undefined;
                    $scope.export_company_name = undefined;
                    $scope.export_line_1 = undefined;
                    $scope.export_line_2 = undefined;
                    $scope.export_city = undefined;
                    $scope.export_state = undefined;
                    $scope.export_zip = undefined;
                    $scope.export_phone = undefined;
                    $scope.export_fax = undefined;
                    $scope.export_work_email = undefined;
                }
                $( ".export-drawing-customer-info-modal" ).modal( "show" );
            };

            $scope.CloseExportDrawingCustomerInfo = function () {
                $( ".export-drawing-customer-info-modal" ).modal( "hide" );
            };

            $scope.ClearExportDrawingCustomerInfo = function () {
                $scope.export_contact_name = undefined;
                $scope.export_company_name = undefined;
                $scope.export_line_1 = undefined;
                $scope.export_line_2 = undefined;
                $scope.export_city = undefined;
                $scope.export_state = undefined;
                $scope.export_zip = undefined;
                $scope.export_phone = undefined;
                $scope.export_fax = undefined;
                $scope.export_work_email = undefined;
            };

            $scope.ExportDrawingCustomerInfoSet = function () {
                //Make sure all required fields are filled in
                if ( $scope.export_contact_name != undefined &&
                    $scope.export_line_1 != undefined &&
                    $scope.export_city != undefined &&
                    $scope.export_state != undefined &&
                    $scope.export_zip != undefined &&
                    $scope.export_phone != undefined ) {
                    var params = {
                        project_id: $scope.SelectedMyproject.id,
                        address_contact_name: ( $scope.export_contact_name != undefined ) ? $scope.export_contact_name : null,
                        address_company_name: ( $scope.export_company_name != undefined ) ? $scope.export_company_name : null,
                        address_line1: ( $scope.export_line_1 != undefined ) ? $scope.export_line_1 : null,
                        address_line2: ( $scope.export_line_2 != undefined ) ? $scope.export_line_2 : null,
                        address_city: ( $scope.export_city != undefined ) ? $scope.export_city : null,
                        address_state: ( $scope.export_state != undefined ) ? $scope.export_state : null,
                        address_zip: ( $scope.export_zip != undefined ) ? $scope.export_zip : null,
                        address_phone: ( $scope.export_phone != undefined ) ? $scope.export_phone : null,
                        address_fax: ( $scope.export_fax != undefined ) ? $scope.export_fax : null,
                        address_work_email: ( $scope.export_work_email != undefined ) ? $scope.export_work_email : null
                    };
                    $( '#loading_fullScreen' ).show();
                    requestHandler.execute( "mbx_pc_export_customer_info_set", params ).success( function () {
                        $scope.SelectedMyproject.address_contact_name = ( $scope.export_contact_name != undefined ) ? $scope.export_contact_name : null;
                        $scope.SelectedMyproject.address_company_name = ( $scope.export_company_name != undefined ) ? $scope.export_company_name : null;
                        $scope.SelectedMyproject.address_line1 = ( $scope.export_line_1 != undefined ) ? $scope.export_line_1 : null;
                        $scope.SelectedMyproject.address_line2 = ( $scope.export_line_2 != undefined ) ? $scope.export_line_2 : null;
                        $scope.SelectedMyproject.address_city = ( $scope.export_city != undefined ) ? $scope.export_city : null;
                        $scope.SelectedMyproject.address_state = ( $scope.export_state != undefined ) ? $scope.export_state : null;
                        $scope.SelectedMyproject.address_zip = ( $scope.export_zip != undefined ) ? $scope.export_zip : null;
                        $scope.SelectedMyproject.address_phone = ( $scope.export_phone != undefined ) ? $scope.export_phone : null;
                        $scope.SelectedMyproject.address_fax = ( $scope.export_fax != undefined ) ? $scope.export_fax : null;
                        $scope.SelectedMyproject.address_work_email = ( $scope.export_work_email != undefined ) ? $scope.export_work_email : null;

                        $scope.customerInfoSet = "yes";
                        /* Added 2015-11-24 to call Freight Web Service to update Project freight amount */
                        var freight_estimate = 0;
                        /*2015-12-22: Make freight call for all users & all Projects*/
                        //if ($scope.SelectedMyproject.project_total > 2500) {
                        //    if ($scope.ApplyMargin == true) {
                        //        //User is apart of Dealer Role & Project total is greater than $2500 = Free Freight
                        //        freight_estimate = 0;
                        //    }
                        //}
                        //else {
                        //    //Total Price < $2500
                        //    if ($scope.SelectedMyproject.postal_code == undefined) { freight_estimate = null; } //Unable to calculate freight
                        //    else {
                        //        freight_estimate = $scope.FreightCalculator($scope.SelectedMyproject);
                        //    }
                        //}
                        /*2015-12-23: Commented out because MBX changed their freight carrier from UPS to FedEx in Sept. & AmericanEagle.com has to make some changes for it to work*/
                        /*2016-02-23: Commented out (again) per request from Mei-Ling. Only wants freight service called during print quote*/
                        //freight_estimate = $scope.FreightCalculator($scope.SelectedMyproject);

                        //var params = {
                        //    project_id: $scope.SelectedMyproject.id,
                        //    freight_estimate: (freight_estimate != undefined) ? freight_estimate : null
                        //};
                        //requestHandler.execute("mbx_pc_project_freight_set", params).success(function () {

                        //});
                        /* End Freight Web Service call to update/set Project freight amount */
                        //$timeout(function () {
                        $scope.CloseExportDrawingCustomerInfo();
                        $( ".export-drawings-modal" ).modal( "show" );
                        $( '#loading_fullScreen' ).hide();
                        //}, 15000);
                    } );
                }
                else {
                    alert( "Please make sure all required fields are filled in before continuing" );
                    $( '#loading_fullScreen' ).hide();
                }
            };
            //***END Export Drawings***//

            $scope.RenderReport = function ( report_url ) {
                //alert(report_url);
                window.location.href = report_url;
            };
            //***END Export CAD***//

            //***Clone Project***//
            $scope.CloneProject = function ( myproject ) {
                $scope.SelectedMyproject = myproject;
                $( ".copy-project-modal" ).modal( "show" ).on( 'shown.bs.modal', function () {
                    $( '#copyProjectToProjectName' ).focus();
                } );
            };

            $scope.SaveCloneProject = function () {
                var new_ProjectName = ( angular.isUndefined( $scope.CopyProjectToProjectName ) ) ? "" : $scope.CopyProjectToProjectName;
                var draft_projects = _.where( $scope.myprojects, { project_status: "Draft" } );
                var old_project = _.findWhere( draft_projects, { project_name: new_ProjectName } );
                if ( _.isEmpty( old_project ) == false && old_project.project_name == new_ProjectName ) {
                    alert( "Project name exists. Please choose a different name." );
                }
                else if ( new_ProjectName == "" ) {
                    alert( "Please provide a name for your cloned project before attempting to clone." );
                }
                else {
                    //Execute Pricing Logic
                    var project_id_param = {
                        project_id: $scope.SelectedMyproject.id
                    };
                    requestHandler.execute( "mbx_set_pricing_project", project_id_param ).success( function () {
                        requestHandler.execute( "mbx_project_number", {} ).success( function ( p ) {
                            //alert(p.Table.Rows[0]["project_number"]);

                            var params = {
                                action_type: 'copy',
                                selectedprojectid: $scope.SelectedMyproject.id,
                                newprojectname: new_ProjectName,
                                projectnumber: p.Table.Rows[0]["project_number"]
                            };
                            $( '#loading_fullScreen' ).show();
                            requestHandler.execute( "mbx_pc_project_copy", params ).success( function ( d ) {
                                $scope.CloseCloneProject();
                                $( '#loading_fullScreen' ).hide();
                                window.location.reload( true );
                            } );
                        } );
                    } );
                }
            };

            $scope.CloseCloneProject = function () {
                $( ".copy-project-modal" ).modal( "hide" );
            };
            //***END Clone Project***//

            //***Delete Project***//
            $scope.ShowDeleteProject = function ( myproject ) {
                $scope.SelectedMyproject = myproject;
                $( ".delete-project" ).modal( "show" );
            }

            $scope.CloseDeleteProject = function () {
                $( ".delete-project" ).modal( "hide" );
            };

            $scope.DeleteProject = function () {
                $( '#loading_fullScreen' ).show();
                var params = { selectedprojectid: $scope.SelectedMyproject.id };
                requestHandler.execute( "mbx_pc_project_delete", params ).success( function ( d ) {
                    $scope.RemoveProject( $scope.SelectedMyproject );
                    $scope.SelectedMyproject = "";
                    $scope.SelectedMydesign = "";
                    $scope.CloseDeleteProject();
                    $( '#loading_fullScreen' ).hide();
                } );
            };

            $scope.RemoveProject = function ( item ) {
                var index = $scope.myprojects.indexOf( item )
                $scope.myprojects.splice( index, 1 );
            }
            //***END Delete Project***//

            //***Assign Project***//
            $scope.AssignProject = function ( myproject ) {
                $scope.SelectedMyproject = myproject;
                $( ".assign-project-modal" ).modal( "show" );
                requestHandler.execute( "mbx_pc_account_contacts_get", {} ).success( function ( d ) {
                    var emailArray = [];
                    for ( var i = 0; i < d.Table.Rows.length; i++ ) {
                        emailArray.push( d.Table.Rows[i].email )
                    }
                    //alert(emailArray);
                    $( "#assign_Select" ).autocomplete( {
                        source: emailArray,
                        minLength: 3,
                        select: function ( event, ui ) {
                            AutoCompleteSelectHandler( event, ui )
                        }
                    } );
                } );
            };

            function AutoCompleteSelectHandler( event, ui ) {
                $scope.assignEmail = ui.item;
                //alert($scope.assignEmail.value);
            }

            $scope.SaveAssignProjectConfirm = function () {
                if ( $scope.assignEmail != undefined && $scope.assignEmail.value != "" ) {
                    $( ".assign-project-confirm-modal" ).modal( "show" );
                }
                else {
                    alert( "Please input a minimum of 3 characters of the intended recipient's email address and then select it from the list before attempting to assign project." );
                }
            };

            $scope.SaveAssignProject = function () {
                $( '#loading_fullScreen' ).show();
                var params = {
                    project_id: $scope.SelectedMyproject.id,
                    email: $scope.assignEmail.value
                };

                requestHandler.execute( "mbx_pc_assign_project_set", params ).success( function () {
                    //$scope.CloseAssignProject();
                    //window.location.reload(true);
                    //Call new BLU message to send email to assigned user
                    var blu_params = {
                        project_id: $scope.SelectedMyproject.id,
                        assigned_email: $scope.assignEmail.value
                    };
                    requestHandler.execute( "mbx_email_assign_project", blu_params ).success( function () {
                        $scope.CloseAssignProject();
                        window.location.reload( true );
                    } );
                } );
            };

            $scope.CloseAssignProject = function () {
                $( ".assign-project-modal" ).modal( "hide" );
                $( ".assign-project-confirm-modal" ).modal( "hide" );
            };
            //***END Assign Project***//

            //***Apply Markup***//
            $scope.ApplyMarkup = function ( myproject ) {
                $scope.SelectedMyproject = myproject;
                $( ".apply-markup-modal" ).modal( "show" );
            };

            $scope.SaveApplyMarkup = function () {
                if ( formatPercentage( $scope.markupPercentage ) != 0.00 ) {
                    if ( $scope.markupPercentage > 100 ) {
                        alert( "Please enter a Markup Percentage less than 100" );
                    }
                    else {
                        var params = {
                            project_id: $scope.SelectedMyproject.id,
                            markup_percentage: $scope.markupPercentage
                        };

                        requestHandler.execute( "mbx_pc_apply_markup_set", params ).success( function () {
                            $scope.CloseApplyMarkup();
                            window.location.reload( true );
                        } );
                    }
                }
                else {
                    alert( "Please enter a valid Markup Percentage between 0 & 100" );
                }
            };

            $scope.CloseApplyMarkup = function () {
                $( ".apply-markup-modal" ).modal( "hide" );
            };

            function formatPercentage( num ) {
                num = isNaN( num ) || num === '' || num === null ? 0.00 : num;
                return parseFloat( num ).toFixed( 2 );
            }
            //***END Apply Markup***//

            //***Printable Quote***//
            $scope.PrintQuote = function ( myproject ) {

            };
            //***END Printable Quote***//

            //***Apply Discount***//
            $scope.ApplyDiscount = function ( myproject ) {
                $scope.SelectedMyproject = myproject;
                //Set Discount fields if previously set
                $scope.discount_type = ( $scope.SelectedMyproject.discount_type == undefined ) ? /*"percentage"*/"none" : $scope.SelectedMyproject.discount_type.toString().toLowerCase();
                $scope.discountAmount = ( $scope.discount_type.toString().toLowerCase() == "percentage" ) ? $scope.SelectedMyproject.discount_percentage : $scope.SelectedMyproject.discount_amount;
                $( ".apply-discount-modal" ).modal( "show" );
            };

            /* //Discount logic pre dollar amount & percentage
            $scope.SaveApplyDiscount = function () {
                if (formatCurrency($scope.discountAmount) != 0.00) {
                    //Execute Pricing Logic
                    var project_id_param = {
                        project_id: $scope.SelectedMyproject.id
                    };
                    requestHandler.execute("mbx_set_pricing_project", project_id_param).success(function () {
                        var params = {
                            project_id: $scope.SelectedMyproject.id,
                            discount_amount: $scope.discountAmount
                        };

                        requestHandler.execute("mbx_pc_apply_discount_set", params).success(function (d) {
                            if (d.Table.Rows[0].return_message == "Fail") {
                                alert("The Discount Amount entered is more than 35% of the Project Total. Please enter a smaller discount amount.");
                            }
                            else {
                                $scope.CloseApplyDiscount();
                            }
                        });
                    });
                }
                else {
                    alert("Please input a discount in dollar amounts only");
                }
            };
            */
                $scope.SaveApplyDiscount = function () {
                    $( '#loading_fullScreen' ).show();
                    if ( $scope.discount_type == "dollar" ) {
                        if ( formatCurrency( $scope.discountAmount ) != 0.00 ) {
                            //Execute Pricing Logic
                            var project_id_param = {
                                project_id: $scope.SelectedMyproject.id
                            };
                            requestHandler.execute( "mbx_set_pricing_project", project_id_param ).success( function () {
                                var params = {
                                    project_id: $scope.SelectedMyproject.id,
                                    discount_amount: $scope.discountAmount,
                                    discount_percentage: 0.00, //Stored Procedure will calculate percentage
                                    discount_type: $scope.discount_type
                                };

                                requestHandler.execute( "mbx_pc_apply_discount_set", params ).success( function ( d ) {
                                    if ( d.Table.Rows[0].return_message == "Fail" ) {
                                        alert( "The Discount Amount entered is more than 35% of the Project Total. Please enter a smaller discount amount." );
                                    }
                                    else {
                                        $scope.CloseApplyDiscount();
                                        window.location.reload( true );
                                    }
                                } );
                            } );
                        }
                        else {
                            alert( "Please input a discount in dollar amounts only" );
                        }
                    } //End if ($scope.discount_type == "dollar")
                    else if ( $scope.discount_type == "percentage" ) {
                        //User inputting discount percentage
                        if ( formatCurrency( $scope.discountAmount ) != 0.00 ) {
                            if ( formatCurrency( $scope.discountAmount ) > 35.00 ) {
                                alert( "The Discount % can\'t exceed 35% of the Project Total. Please enter a smaller discount %." );
                            }
                            else {
                                //Execute Pricing Logic
                                var project_id_param = {
                                    project_id: $scope.SelectedMyproject.id
                                };
                                requestHandler.execute( "mbx_set_pricing_project", project_id_param ).success( function () {
                                    var params = {
                                        project_id: $scope.SelectedMyproject.id,
                                        discount_amount: 0.00, //Stored procedure will calculate dollar amount
                                        discount_percentage: $scope.discountAmount,
                                        discount_type: $scope.discount_type
                                    };

                                    requestHandler.execute( "mbx_pc_apply_discount_set", params ).success( function ( d ) {
                                        //if (d.Table.Rows[0].return_message == "Fail") {
                                        //    alert("The Discount Amount entered is more than 35% of the Project Total. Please enter a smaller discount amount.");
                                        //}
                                        //else {
                                        $scope.CloseApplyDiscount();
                                        window.location.reload( true );
                                        //}
                                    } );
                                } );
                            }
                        }
                        else {
                            alert( "Please input a discount in % amounts only" );
                        }
                    } //End else if ($scope.discount_type == "percentage")
                    else {
                        //User selected "No Discount" (to remove existing discount)
                        //Execute Pricing Logic
                        var project_id_param = {
                            project_id: $scope.SelectedMyproject.id
                        };
                        requestHandler.execute( "mbx_set_pricing_project", project_id_param ).success( function () {
                            var params = {
                                project_id: $scope.SelectedMyproject.id,
                                discount_amount: 0.00,
                                discount_percentage: 0,
                                discount_type: $scope.discount_type
                            };

                            requestHandler.execute( "mbx_pc_apply_discount_set", params ).success( function ( d ) {
                                $scope.CloseApplyDiscount();
                                window.location.reload( true );
                                //}
                            } );
                        } );
                    }
                    $( '#loading_fullScreen' ).hide();
                };

            $scope.previousSearch = '';
            $scope.searchProjects = function ( e ) {
                $scope.currentPage = 0;

                if ( $scope.previousSearch === $scope.searchProjectName ) {
                    return;
                }

                if ( !e || e.keyCode === 13 || $scope.searchProjectName.trim() === '' ) { //!e= search button clicked, e==13 = enter key pressed
                    $scope.previousSearch = $scope.searchProjectName;
                    //begin search
                    $scope.getProjects( 1, null, true, $scope.searchProjectName.trim() );
                }
                return;
            };

            $scope.CloseApplyDiscount = function () {
                $( ".apply-discount-modal" ).modal( "hide" );
            };

            function formatCurrency( num ) {
                num = isNaN( num ) || num === '' || num === null ? 0.00 : num;
                return parseFloat( num ).toFixed( 2 );
            }
            //***END Apply Discount***//

            //*** START Update Customer Info***//
            $scope.UpdateCustomerInfo = function ( myproject, fromPurchaseNow, fromPrintableQuote ) {
                $scope.custInfoPurchaseNow = fromPurchaseNow.toString();
                $scope.custInfoPrintableQuote = fromPrintableQuote.toString();
                $scope.SelectedMyproject = myproject;
                if ( $scope.SelectedMyproject.address_contact_name != null ) {
                    $scope.customerInfoSet = "yes";
                    //Populate modal form fields
                    $scope.address_contact_name = $scope.SelectedMyproject.address_contact_name;
                    $scope.address_company_name = $scope.SelectedMyproject.address_company_name;
                    $scope.address_line_1 = $scope.SelectedMyproject.address_line1;
                    $scope.address_line_2 = $scope.SelectedMyproject.address_line2;
                    $scope.address_city = $scope.SelectedMyproject.address_city;
                    $scope.address_state = $scope.SelectedMyproject.address_state;
                    $scope.address_zip = $scope.SelectedMyproject.address_zip;
                    $scope.address_phone = $scope.SelectedMyproject.address_phone;
                    $scope.address_fax = $scope.SelectedMyproject.address_fax;
                    $scope.address_work_email = $scope.SelectedMyproject.address_work_email;
                    $scope.address_shipto_contact_name = $scope.SelectedMyproject.address_shipto_contact_name;
                    $scope.address_shipto_company_name = $scope.SelectedMyproject.address_shipto_company_name;
                    $scope.address_shipto_line_1 = $scope.SelectedMyproject.address_shipto_line1;
                    $scope.address_shipto_line_2 = $scope.SelectedMyproject.address_shipto_line2;
                    $scope.address_shipto_city = $scope.SelectedMyproject.address_shipto_city;
                    $scope.address_shipto_state = $scope.SelectedMyproject.address_shipto_state;
                    $scope.address_shipto_zip = $scope.SelectedMyproject.address_shipto_zip;
                    $scope.address_shipto_phone = $scope.SelectedMyproject.address_shipto_phone;
                    $scope.address_shipto_work_email = $scope.SelectedMyproject.address_shipto_work_email;
                }
                else {
                    $scope.customerInfoSet = "no";
                    //Ensure the modal form is blank for all fields
                    $scope.address_contact_name = undefined;
                    $scope.address_company_name = undefined;
                    $scope.address_line_1 = undefined;
                    $scope.address_line_2 = undefined;
                    $scope.address_city = undefined;
                    $scope.address_state = undefined;
                    $scope.address_zip = undefined;
                    $scope.address_phone = undefined;
                    $scope.address_fax = undefined;
                    $scope.address_work_email = undefined;
                    $scope.address_shipto_contact_name = undefined;
                    $scope.address_shipto_company_name = undefined;
                    $scope.address_shipto_line_1 = undefined;
                    $scope.address_shipto_line_2 = undefined;
                    $scope.address_shipto_city = undefined;
                    $scope.address_shipto_state = undefined;
                    $scope.address_shipto_zip = undefined;
                    $scope.address_shipto_phone = undefined;
                    $scope.address_shipto_work_email = undefined;
                }

                $( ".update-customer-info-modal" ).modal( "show" );
            };

            $scope.ClearUpdateCustomerInfo = function () {
                $scope.address_contact_name = undefined;
                $scope.address_company_name = undefined;
                $scope.address_line_1 = undefined;
                $scope.address_line_2 = undefined;
                $scope.address_city = undefined;
                $scope.address_state = undefined;
                $scope.address_zip = undefined;
                $scope.address_phone = undefined;
                $scope.address_fax = undefined;
                $scope.address_work_email = undefined;
                $scope.address_shipto_contact_name = undefined;
                $scope.address_shipto_company_name = undefined;
                $scope.address_shipto_line_1 = undefined;
                $scope.address_shipto_line_2 = undefined;
                $scope.address_shipto_city = undefined;
                $scope.address_shipto_state = undefined;
                $scope.address_shipto_zip = undefined;
                $scope.address_shipto_phone = undefined;
                $scope.address_shipto_work_email = undefined;
            };

            $scope.UpdateCustomerInfoSet = function () {
                $( '#loading_fullScreen' ).show();
                //Make sure all required fields are filled in
                if ( $scope.address_contact_name != undefined &&
                    $scope.address_line_1 != undefined &&
                    $scope.address_city != undefined &&
                    $scope.address_state != undefined &&
                    $scope.address_zip != undefined &&
                    $scope.address_phone != undefined &&
                    $scope.address_shipto_city != undefined &&
                    $scope.address_shipto_state != undefined &&
                    $scope.address_shipto_zip != undefined ) {
                    var params = {
                        project_id: $scope.SelectedMyproject.id,
                        address_contact_name: ( $scope.address_contact_name != undefined ) ? $scope.address_contact_name : null,
                        address_company_name: ( $scope.address_company_name != undefined ) ? $scope.address_company_name : null,
                        address_line1: ( $scope.address_line_1 != undefined ) ? $scope.address_line_1 : null,
                        address_line2: ( $scope.address_line_2 != undefined ) ? $scope.address_line_2 : null,
                        address_city: ( $scope.address_city != undefined ) ? $scope.address_city : null,
                        address_state: ( $scope.address_state != undefined ) ? $scope.address_state : null,
                        address_zip: ( $scope.address_zip != undefined ) ? $scope.address_zip : null,
                        address_phone: ( $scope.address_phone != undefined ) ? $scope.address_phone : null,
                        address_fax: ( $scope.address_fax != undefined ) ? $scope.address_fax : null,
                        address_work_email: ( $scope.address_work_email != undefined ) ? $scope.address_work_email : null,
                        address_shipto_contact_name: ( $scope.address_shipto_contact_name != undefined ) ? $scope.address_shipto_contact_name : null,
                        address_shipto_company_name: ( $scope.address_shipto_company_name != undefined ) ? $scope.address_shipto_company_name : null,
                        address_shipto_line1: ( $scope.address_shipto_line_1 != undefined ) ? $scope.address_shipto_line_1 : null,
                        address_shipto_line2: ( $scope.address_shipto_line_2 != undefined ) ? $scope.address_shipto_line_2 : null,
                        address_shipto_city: ( $scope.address_shipto_city != undefined ) ? $scope.address_shipto_city : null,
                        address_shipto_state: ( $scope.address_shipto_state != undefined ) ? $scope.address_shipto_state : null,
                        address_shipto_zip: ( $scope.address_shipto_zip != undefined ) ? $scope.address_shipto_zip : null,
                        address_shipto_phone: ( $scope.address_shipto_phone != undefined ) ? $scope.address_shipto_phone : null,
                        address_shipto_work_email: ( $scope.address_shipto_work_email != undefined ) ? $scope.address_shipto_work_email : null
                    };

                    requestHandler.execute( "mbx_pc_customer_info_set", params ).success( function () {
                        $scope.SelectedMyproject.address_contact_name = ( $scope.address_contact_name != undefined ) ? $scope.address_contact_name : null;
                        $scope.SelectedMyproject.address_company_name = ( $scope.address_company_name != undefined ) ? $scope.address_company_name : null;
                        $scope.SelectedMyproject.address_line1 = ( $scope.address_line_1 != undefined ) ? $scope.address_line_1 : null;
                        $scope.SelectedMyproject.address_line2 = ( $scope.address_line_2 != undefined ) ? $scope.address_line_2 : null;
                        $scope.SelectedMyproject.address_city = ( $scope.address_city != undefined ) ? $scope.address_city : null;
                        $scope.SelectedMyproject.address_state = ( $scope.address_state != undefined ) ? $scope.address_state : null;
                        $scope.SelectedMyproject.address_zip = ( $scope.address_zip != undefined ) ? $scope.address_zip : null;
                        $scope.SelectedMyproject.address_phone = ( $scope.address_phone != undefined ) ? $scope.address_phone : null;
                        $scope.SelectedMyproject.address_fax = ( $scope.address_fax != undefined ) ? $scope.address_fax : null;
                        $scope.SelectedMyproject.address_work_email = ( $scope.address_work_email != undefined ) ? $scope.address_work_email : null;
                        $scope.SelectedMyproject.address_shipto_contact_name = ( $scope.address_shipto_contact_name != undefined ) ? $scope.address_shipto_contact_name : null;
                        $scope.SelectedMyproject.address_shipto_company_name = ( $scope.address_shipto_company_name != undefined ) ? $scope.address_shipto_company_name : null;
                        $scope.SelectedMyproject.address_shipto_line1 = ( $scope.address_shipto_line_1 != undefined ) ? $scope.address_shipto_line_1 : null;
                        $scope.SelectedMyproject.address_shipto_line2 = ( $scope.address_shipto_line_2 != undefined ) ? $scope.address_shipto_line_2 : null;
                        $scope.SelectedMyproject.address_shipto_city = ( $scope.address_shipto_city != undefined ) ? $scope.address_shipto_city : null;
                        $scope.SelectedMyproject.address_shipto_state = ( $scope.address_shipto_state != undefined ) ? $scope.address_shipto_state : null;
                        $scope.SelectedMyproject.address_shipto_zip = ( $scope.address_shipto_zip != undefined ) ? $scope.address_shipto_zip : null;
                        $scope.SelectedMyproject.address_shipto_phone = ( $scope.address_shipto_phone != undefined ) ? $scope.address_shipto_phone : null;
                        $scope.SelectedMyproject.address_shipto_work_email = ( $scope.address_shipto_work_email != undefined ) ? $scope.address_shipto_work_email : null;

                        $scope.customerInfoSet = "yes";
                        /* Added 2015-11-24 to call Freight Web Service to update Project freight amount */
                        var freight_estimate = 0;
                        /*2015-12-22: Make freight call for all users & all Projects*/
                        //if ($scope.SelectedMyproject.project_total > 2500) {
                        //    if ($scope.ApplyMargin == true) {
                        //        //User is apart of Dealer Role & Project total is greater than $2500 = Free Freight
                        //        freight_estimate = 0;
                        //    }
                        //}
                        //else {
                        //    //Total Price < $2500
                        //    if ($scope.SelectedMyproject.postal_code == undefined) { freight_estimate = null; } //Unable to calculate freight
                        //    else {
                        //        freight_estimate = $scope.FreightCalculator($scope.SelectedMyproject);
                        //    }
                        //}
                        /*2015-12-23: Commented out because MBX changed their freight carrier from UPS to FedEx in Sept. & AmericanEagle.com has to make some changes for it to work*/
                        /*2016-02-23: Commented out (again) per request from Mei-Ling. Only wants freight service called during print quote*/
                        //freight_estimate = $scope.FreightCalculator($scope.SelectedMyproject);
                        if ( $scope.custInfoPrintableQuote.toString() == "yes" ) {
                            freight_estimate = $scope.FreightCalculator( $scope.SelectedMyproject );
                            $scope.calculateTax( $scope.SelectedMyproject );
                        }

                        //var params = {
                        //    project_id: $scope.SelectedMyproject.id,
                        //    freight_estimate: (freight_estimate != undefined) ? freight_estimate : null
                        //};
                        //requestHandler.execute("mbx_pc_project_freight_set", params).success(function () {

                        //});
                        /* End Freight Web Service call to update/set Project freight amount */
                        //$timeout(function () {
                        //    $scope.CloseUpdateCustomerInfo();
                        //    if ($scope.custInfoPurchaseNow.toString() == "yes") { $(".purchase-now-modal").modal("show"); }
                        //    else if ($scope.custInfoPrintableQuote.toString() == "yes") { $(".quote-output-modal").modal("show"); } //Display Printable Quote Modal
                        //    else { window.location.reload(true); }
                        //}, 15000);
                        if ( $scope.custInfoPurchaseNow.toString() == "yes" ) {
                            $scope.CloseUpdateCustomerInfo();
                            $( ".purchase-now-modal" ).modal( "show" );
                        }
                        else if ( $scope.custInfoPrintableQuote.toString() == "yes" ) {
                            $timeout( function () {
                                $scope.CloseUpdateCustomerInfo();
                                $( ".quote-output-modal" ).modal( "show" );
                            }, 15000 );
                        } //Display Printable Quote Modal
                        else { window.location.reload( true ); }
                    } );
                }
                else {
                    alert( "Please make sure all required fields are filled in before attempting to save" );
                    //Dynamically show users which required fields are not filled in by changing their styling
                    //if ($scope.address_contact_name == undefined) { $("#addresscontactname").css({ "background-color": "#D59494", "border": "2px solid red" }); }
                    //if ($scope.address_line_1 == undefined) { $("#addressline1").css({ "background-color": "#D59494", "border": "2px solid red" }); }
                    //if ($scope.address_city == undefined) { $("#addresscity").css({ "background-color": "#D59494", "border": "2px solid red" }); }
                    //if ($scope.address_state == undefined) { $("#addressstate").css({ "background-color": "#D59494", "border": "2px solid red" }); }
                    //if ($scope.address_zip == undefined) { $("#addresszip").css({ "background-color": "#D59494", "border": "2px solid red" }); }
                    //if ($scope.address_phone == undefined) { $("#addressphone").css({ "background-color": "#D59494", "border": "2px solid red" }); }
                    //if ($scope.address_shipto_city == undefined) { $("#addressshiptocity").css({ "background-color": "#D59494", "border": "2px solid red" }); }
                    //if ($scope.address_shipto_state == undefined) { $("#addressshiptostate").css({ "background-color": "#D59494", "border": "2px solid red" }); }
                    //if ($scope.address_shipto_zip == undefined) { $("#addressshiptozip").css({ "background-color": "#D59494", "border": "2px solid red" }); }
                    //$(":invalid input").css({ "background-color": "#D59494", "border": "2px solid red" });

                    $( '#loading_fullScreen' ).hide();
                }
            };

            $scope.defaultShippingInfo = function () {
                if ( $scope.set_shipping == true ) {
                    $scope.address_shipto_contact_name = $scope.address_contact_name;
                    $scope.address_shipto_company_name = $scope.address_company_name;
                    $scope.address_shipto_line_1 = $scope.address_line_1;
                    $scope.address_shipto_line_2 = $scope.address_line_2;
                    $scope.address_shipto_city = $scope.address_city;
                    $scope.address_shipto_state = $scope.address_state;
                    $scope.address_shipto_zip = $scope.address_zip;
                    $scope.address_shipto_phone = $scope.address_phone;
                    $scope.address_shipto_work_email = $scope.address_work_email;
                }
                else {
                    $scope.address_shipto_contact_name = undefined;
                    $scope.address_shipto_company_name = undefined;
                    $scope.address_shipto_line_1 = undefined;
                    $scope.address_shipto_line_2 = undefined;
                    $scope.address_shipto_city = undefined;
                    $scope.address_shipto_state = undefined;
                    $scope.address_shipto_zip = undefined;
                    $scope.address_shipto_phone = undefined;
                    $scope.address_shipto_work_email = undefined;
                }
            };

            $scope.CloseUpdateCustomerInfo = function () {
                $( '#loading_fullScreen' ).hide();
                $( ".update-customer-info-modal" ).modal( "hide" );
            };
            //***END Update Customer Info***//

            $scope.calculateTax = function ( myproject ) {
                $scope.SelectedMyproject = myproject;
                var project_id_param = {
                    project_id: $scope.SelectedMyproject.id
                };
                requestHandler.execute( "mbx_pc_calculate_tax", project_id_param ).success( function () {

                } );
            };

            //*** START My Account ***//
            $scope.EditMyAccount = function () {
                $( ".edit-my-account-modal" ).modal( "show" );
            };

            $scope.EditMyAccountSet = function () {
                $( '#loading_fullScreen' ).show();
                var params = {
                    account_user_fname: ( $scope.account_user_fname != undefined ) ? $scope.account_user_fname : null,
                    account_user_lname: ( $scope.account_user_lname != undefined ) ? $scope.account_user_lname : null,
                    account_line_1: ( $scope.account_line_1 != undefined ) ? $scope.account_line_1 : null,
                    account_line_2: ( $scope.account_line_2 != undefined ) ? $scope.account_line_2 : null,
                    account_city: ( $scope.account_city != undefined ) ? $scope.account_city : null,
                    account_state: ( $scope.account_state != undefined ) ? $scope.account_state : null,
                    account_zip: ( $scope.account_zip != undefined ) ? $scope.account_zip : null,
                    account_work_phone: ( $scope.account_work_phone != undefined ) ? $scope.account_work_phone : null,
                    account_fax: ( $scope.account_fax != undefined ) ? $scope.account_fax : null,
                    account_work_email: ( $scope.account_work_email != undefined ) ? $scope.account_work_email : null,
                    account_company_name: ( $scope.account_company_name != undefined ) ? $scope.account_company_name : null
                }
                requestHandler.execute( "mbx_pc_my_account_set", params ).success( function () {
                    alert( "Account Information Successfully Saved." );
                    $scope.CloseEditMyAccount();
                    window.location.reload( true );
                } )
                    .error( function () {
                        //alert("An error occurred while attempting to save.");
                        $scope.CloseEditMyAccount();
                    } );
            };

            $scope.CloseEditMyAccount = function () {
                $( '#loading_fullScreen' ).hide();
                $( ".edit-my-account-modal" ).modal( "hide" );
            };

            $scope.OpenPasswordChange = function () {
                $scope.CloseEditMyAccount();
                $( ".change-password-modal" ).modal();
            }

            $scope.CloseChangePassword = function () {
                $( ".change-password-error-msg" ).css( "display", "none" );
                $( ".change-password-modal" ).modal( "hide" );
            }

            $scope.ChangePasswordSet = function () {
                var newPw = $scope.pwchange_new_pw;
                var confPw = $scope.pwchange_confirm_pw;

                if ( newPw.length < 6 ) {
                    $( ".change-password-error-msg" ).css( "display", "block" ).text( "Your new password must be at least 6 characters long." );
                    return;
                }
                else if ( newPw.match( /\d/ ) == null || newPw.match( /\d/ ).length < 1 ) {
                    $( ".change-password-error-msg" ).css( "display", "block" ).text( "Your new password must have at least 1 numerical character." );
                    return;
                }
                else if ( newPw !== confPw ) {
                    $( ".change-password-error-msg" ).css( "display", "block" ).text( "Your new password did not match the confirmed password." );
                    return;
                }
                else {
                    $( ".change-password-error-msg" ).css( "display", "none" );
                }

                var params = {
                    newPassword: newPw,
                    confirmPassword: confPw,
                    numMinCharacterLength: "6",
                    numMinNumericCharacters: "1"
                }
                requestHandler.execute( "change_password", params ).success( function ( d ) {
                    if ( d !== "success" ) {
                        alert( d );
                    } else {
                        alert( "Password changed successfully." );
                        $scope.CloseChangePassword();
                    }
                } )
                    .error( function ( e ) {
                        alert( "There was an issue changing your password. Please try again or contact your Mailboxes contact." );
                    } );
            }
            //** END My Account ***//

            /* Tabs */
            $scope.tabChanged = function ( tab ) {
                if ( $scope.button_projects === tab ) {
                    return;
                }
                $scope.button_projects = tab;
                $scope.currentPage = 0;
                $scope.previousSearch = '';
                $scope.searchProjectName = '';
                $scope.clearableCheck( true );
                $scope.getProjects( $scope.currentPage + 1, $scope.itemsPerPage, true );
            }

            /* Pagination */
            $scope.itemsPerPage = 10;
            $scope.currentPage = 0;
            $scope.page_count_total;
            $scope.lastPage;

            $scope.range = function () {
                var page_count = $scope.pageCount();
                var rangeSize = 0;
                var ps = [];
                var separator = String.fromCharCode( 8230 );
                var start;
                start = $scope.currentPage;

                if ( page_count <= 7 ) {
                    /* There's no more than 7 Pages, display them all */
                    rangeSize = page_count;

                    for ( var i = 0; i < rangeSize; i++ ) {
                        ps.push( i + 1 );
                    }
                }
                else if ( page_count == 8 ) {
                    /* There are 8 pages total, need to display 1 separator based on which page user is on */
                    rangeSize = page_count;

                    for ( var i = 0; i < rangeSize; i++ ) {
                        ps.push( i + 1 );
                    }

                    if ( $scope.currentPage <= 3 ) {
                        /* User is on pages 1-4, display pages 1-6, ..., 8 */
                        ps.splice( 6, 2, separator.toString(), 8 );
                    }
                    else {
                        /* User is on pages 5-8, display pages 1, ..., 3-8 */
                        ps.splice( 0, 2, 1, separator.toString() );
                    }
                }
                else {
                    if ( $scope.currentPage <= 3 ) {
                        rangeSize = 8;

                        for ( var i = 0; i < rangeSize; i++ ) {
                            ps.push( i + 1 );
                        }

                        /* User is on pages 1-4, display pages 1-6, ..., Last Page */
                        ps.splice( 6, 2, separator.toString(), page_count );
                    }
                    else if ( $scope.currentPage >= page_count - 4 ) {
                        rangeSize = 8;
                        start = page_count - rangeSize;

                        for ( var i = start; i < start + rangeSize; i++ ) {
                            ps.push( i + 1 );
                        }

                        /* User is on one of last 3 pages, display pages 1, ..., (Last Page - 5) - Last Page */
                        ps.splice( 0, 2, 1, separator.toString() );
                    }
                    else {
                        rangeSize = 9;
                        start = $scope.currentPage;
                        var loop_start = start - 4;
                        var loop_end = start + 5;
                        //alert("Current Page: " + $scope.currentPage + "; Start: " + start);
                        for ( var i = loop_start; i < loop_end; i++ ) {
                            ps.push( i + 1 );
                        }

                        /* User is on a "middle" page, display pages 1, ..., (Current Page - 2) - (Current Page + 2), ..., Last Page */
                        ps.splice( -2, 2, separator, page_count );
                        ps.splice( 0, 2, 1, separator );
                    }
                }
                $( '.paginationAnchor' ).blur();
                return ps;
            };

            $scope.prevPage = function () {
                if ( $scope.currentPage > 0 ) {
                    $scope.currentPage = $scope.currentPage - 1;
                    //$scope.range();
                    /*alert($scope.currentPage);*/
                }
            };

            $scope.prevPageDisabled = function () {
                return $scope.currentPage === 0 ? "disabled" : "";
            };

            $scope.nextPage = function () {
                if ( $scope.currentPage < $scope.pageCount() - 1 ) {
                    $scope.currentPage = $scope.currentPage + 1;
                    //$scope.range();
                    /*alert($scope.currentPage);*/
                }
            };

            $scope.nextPageDisabled = function () {
                return $scope.currentPage === $scope.pageCount() - 1 ? "disabled" : "";
            };

            //$scope.buttonDisabled = function (value) {
            //    return value === "..." ? "disabled" : "";
            //};

            $scope.pageCount = function () {
                //var total = 0;
                //for ( var i = 0; i < $scope.myprojects.length; i++ ) {
                //    if ( $scope.button_projects == "Pending" ) { //filter: { project_status: '!Deleted' } | filter: { project_status: '!Completed'
                //        if ( $scope.myprojects[i].project_status == "Draft" ) {
                //            total = total + 1;
                //        }
                //    }
                //    else if ( $scope.button_projects == "Completed" ) {
                //        if ( $scope.myprojects[i].project_status == "Completed" ) {
                //            total = total + 1;
                //        }
                //    }
                //}

                var total = $scope.button_projects === 'Pending' ? $scope.totalDraftProjects : $scope.totalCompletedProjects;
                
                //Used to only show paging controls when there are more than 20 projects (since there's 20 projects/page)
                $scope.page_count_total = Math.ceil( total / $scope.itemsPerPage );
                if ( total <= $scope.itemsPerPage ) { $( '.pagination' ).hide(); }
                else { $( '.pagination' ).show(); }
                $scope.lastPage = total;
                return Math.ceil( total / $scope.itemsPerPage );
            };

            $scope.setPage = function ( n ) {
                if ( n != String.fromCharCode( 8230 ) && n != "..." ) {
                    n = parseInt( n ) - 1;

                    if ( $scope.currentPage != n ) {
                        $scope.getProjects( n + 1, $scope.itemsPerPage, true );
                        //$scope.range();
                        $scope.currentPage = n;
                    }
                    /*alert($scope.currentPage);*/
                }
                $( '.paginationAnchor' ).blur();
            };
            //End Pagination

            // New CAD - added by JJW
            $scope.outputCADSingleDesign = function ( design_id ) {
                window.open( "/trakDwgHandler.axd?orgname=" + _orgname + "&configurationId=" + design_id + "&viewingAngleIds=", "_blank" );
            };

            $scope.OutputCAD = function ( myproject ) {
                //                var myProject = null;
                //                for (var i=0; i < $scope.myprojects.length; ++i) {
                //                    if ($scope.myprojects[i].id = myproject.id) {
                //                        myProject = $scope.myprojects[i];
                //                        break;
                //                    }
                //                }
                var configIds = ""; //[];
                var first = true;
                for ( var i = 0; i < myproject.designs.length; i++ ) {
                    //configIds.push($scope.SelectedMyproject.designs[i].design_id);
                    if ( !first )
                        configIds += ",";
                    else
                        first = false;
                    configIds += myproject.designs[i].design_id;
                }
                //                window.open("/trakDwgHandler.axd?orgname=" + _orgname + "&configurationId=" + configIds + "&viewingAngleIds=front&filename=CAD_" + myproject.project_name
                //                    + "&createMissing=false&showLabels=true&labelMinHeight=0%2E35&labelMaxHeight=1%2E3&labelMaxWidth=3%2E25&labelMinHMultiplier=0&labelMaxHMultiplier=0&labelMaxWMultiplier=0", "_blank");
                //modified by JW 2017-03-21, changed parameters to handle multi-line labels
                window.open( "/trakDwgHandler.axd?orgname=" + _orgname + "&configurationId=" + configIds + "&viewingAngleIds=front&filename=CAD_" + myproject.project_name
                    + "&createMissing=false&showLabels=true&labelMinHeight=0%2E35&labelMaxHeight=1%2E3&labelMaxWidth=0%2E0&labelMinHMultiplier=0&labelMaxHMultiplier=0&labelMaxWMultiplier=0%2E97&labelType=mbx", "_blank" );
            };
                // END CAD

                //go to top button
                $( window ).scroll( function () {
                    if ( $( window ).scrollTop() > 0 ) {
                        $( '.goToTop' ).show();
                    }
                    else {
                        $( '.goToTop' ).hide();
                    }
                } );
                //Go to Top
                $scope.goToTop = function () {
                    $( 'html' ).animate( { scrollTop: "0" }, 400, function () {
                        if ( window.pageYOffset > 0 ) { //fallback for ipads
                            $( window ).scrollTop( 0 );
                        }
                    } );
                };

                $scope.clearableCheck = function ( force ) {
                    $( ".clearable" ).each( function () {
                        var $inp = $( this ).find( "input:text" ),
                            $cle = $( this ).find( ".clearable__clear" );

                        $inp.on( "input", function () {
                            $cle.toggle( !!this.value );
                        } );

                        $cle.on( "touchstart click", function ( e ) {
                            $scope.previousSearch = '';
                            e.preventDefault();
                            $inp.val( "" ).trigger( "input" );
                            $scope.getProjects( null, null, true );
                        } );

                        if ( force ) {
                            $scope.previousSearch = '';
                            $inp.val( "" ).trigger( "input" );
                        }
                    } );
                };
                $scope.clearableCheck();

            }] )//; //Commented for Paging Functionality
            .filter( "pagination", function () {
                return function ( input, start ) {
                    start = +start;
                    //alert(start);
                    return input.slice( start );
                }
            } );
    </script>

    <%--<div class="loader" style="display: none;">
        <div class="loader-fb"></div>
    </div>--%>

    <div id="loading_fullScreen">
        <div class="bulat">
            <div id="dalbulat">
                <span>L</span>
                <span>O</span>
                <span>A</span>
                <span>D</span>
                <span>I</span>
                <span>N</span>
                <span>G</span>
            </div>
            <div class="luarbulat"></div>
        </div>
        <div class="name">
        </div>
    </div>

    <style>
        #loading_fullScreen {
            display: none;
            position: fixed;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: #EBEEF2;
            padding-top: 20%;
            z-index: 90000;
        }
        /*Begin loading animation css*/
        .name {
            position: absolute;
            bottom: 0.5em;
            right: 0.5em;
            color: #ccc;
        }

            .name a {
                color: #ccc;
                text-decoration: none;
            }

        .bulat {
            width: 120px;
            height: 120px;
            position: relative;
            margin: 50px auto;
            -moz-border-radius: 110px;
            -webkit-border-radius: 110px;
            border-radius: 110px;
            user-select: none;
        }

        #dalbulat {
            background-color: #5c5c5c;
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            bottom: 5px;
            z-index: 2;
            -moz-border-radius: 110px;
            -webkit-border-radius: 110px;
            border-radius: 110px;
            text-align: center;
            font-size: 14px;
            color: #ccc;
            line-height: 110px;
        }

        .luarbulat {
            margin: 0 auto;
            background: #33CCFF;
            background: -webkit-radial-gradient(20% 20%, ellipse cover, #33CCFF 0%, #2e6da4 24%, transparent 74%, transparent 100%);
            background: radial-gradient(ellipse at 20% 20%, #33CCFF 0%, #337ab7 24%, transparent 74%, transparent 100%);
            -moz-border-radius: 110px;
            -webkit-border-radius: 110px;
            border-radius: 110px;
            padding: 10px;
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            -webkit-animation-name: rotate;
            -webkit-animation-duration: 1s;
            -webkit-animation-iteration-count: infinite;
            -webkit-animation-timing-function: linear;
            -moz-animation-name: rotate;
            -moz-animation-duration: 1s;
            -moz-animation-iteration-count: infinite;
            -moz-animation-timing-function: linear;
            -o-animation-name: rotate;
            animation-name: rotate;
            -o-animation-duration: 1s;
            animation-duration: 1s;
            -o-animation-iteration-count: infinite;
            animation-iteration-count: infinite;
            -o-animation-timing-function: linear;
            animation-timing-function: linear;
        }

        #dalbulat span {
            -webkit-animation: color 1.5s linear infinite;
            -moz-animation: color 1.5s linear infinite;
            -ms-animation: color 1.5s linear infinite;
            -o-animation: color 1.5s linear infinite;
            animation: color 1.5s linear infinite;
        }

            #dalbulat span:nth-child(1) {
                -webkit-animation-delay: 0s;
                -moz-animation-delay: 0s;
                -ms-animation-delay: 0s;
                -o-animation-delay: 0s;
                animation-delay: 0s;
            }

            #dalbulat span:nth-child(2) {
                -webkit-animation-delay: .25s;
                -moz-animation-delay: .25s;
                -ms-animation-delay: .25s;
                -o-animation-delay: .25s;
                animation-delay: .25s;
            }

            #dalbulat span:nth-child(3) {
                -webkit-animation-delay: .45s;
                -moz-animation-delay: .45s;
                -ms-animation-delay: .45s;
                -o-animation-delay: .45s;
                animation-delay: .45s;
            }

            #dalbulat span:nth-child(4) {
                -webkit-animation-delay: .55s;
                -moz-animation-delay: .55s;
                -ms-animation-delay: .55s;
                -o-animation-delay: .55s;
                animation-delay: .55s;
            }

            #dalbulat span:nth-child(5) {
                -webkit-animation-delay: .65s;
                -moz-animation-delay: .65s;
                -ms-animation-delay: .65s;
                -o-animation-delay: .65s;
                animation-delay: .65s;
            }

            #dalbulat span:nth-child(6) {
                -webkit-animation-delay: .75s;
                -moz-animation-delay: .75s;
                -ms-animation-delay: .75s;
                -o-animation-delay: .75s;
                animation-delay: .75s;
            }

            #dalbulat span:nth-child(7) {
                -webkit-animation-delay: .85s;
                -moz-animation-delay: .85s;
                -ms-animation-delay: .85s;
                -o-animation-delay: .85s;
                animation-delay: .85s;
            }

        @-webkit-keyframes rotate {
            from {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            to {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }

        @-moz-keyframes rotate {
            from {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            to {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }

        @keyframes rotate {
            from {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            to {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }

        @-webkit-keyframes color {
            0% {
                color: #fff;
            }

            50% {
                color: transparent;
            }

            100% {
                color: #fff;
            }
        }
        /*End loading animation css*/

        /*Begin go to top*/
        .goToTop {
            position: fixed;
            right: 25px;
            top: calc(100% - 100px);
            padding: 20px;
            background-color: #eee;
            border-radius: 50px;
            font-size: x-large;
            border: 2px solid #ccc;
            display: none;
            cursor: pointer;
            z-index: 100;
            height: 65px;
            width: 65px;
        }
        /*End go to top*/
    </style>
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